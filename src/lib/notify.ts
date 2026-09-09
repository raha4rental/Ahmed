import type { AppNotification, Lang, Role, User } from "./types";
import { isNativeApp } from "./native";

export function canSeeNotice(role: Role, notice: AppNotification): boolean {
  if (notice.audience === "admin") return role === "SUPER_ADMIN";
  if (role === "SUPER_ADMIN" || role === "EMPLOYEE") return true;
  if (role === "MAINTENANCE") return notice.kind === "maintenance";
  if (role === "CLEANER") return notice.kind === "cleaning" || notice.kind === "checkout";
  return false;
}

export function visibleNotices(notices: AppNotification[] | undefined, user: User) {
  return (notices ?? []).filter((notice) => canSeeNotice(user.role, notice));
}

export function unreadNotices(notices: AppNotification[] | undefined, user: User) {
  return visibleNotices(notices, user).filter((notice) => !notice.readBy.includes(user.id));
}

function noticeIntId(id: string) {
  let hash = 0;
  for (const char of id) hash = (Math.imul(31, hash) + char.charCodeAt(0)) | 0;
  return Math.abs(hash) || 1;
}

export async function requestNotificationPermission() {
  if (!isNativeApp()) {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignored */
      }
    }
    return;
  }
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.requestPermissions();
  } catch {
    /* plugin missing on this build */
  }
}

export async function showDeviceNotification(notice: AppNotification, lang: Lang) {
  const title = lang === "ar" ? notice.titleAr : notice.titleEn;
  const body = lang === "ar" ? notice.bodyAr : notice.bodyEn;

  if (isNativeApp()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== "granted") {
        const asked = await LocalNotifications.requestPermissions();
        if (asked.display !== "granted") return;
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            id: noticeIntId(notice.id),
            title,
            body,
            extra: { href: notice.href },
            schedule: { at: new Date(Date.now() + 400) },
          },
        ],
      });
    } catch {
      /* keep in-app inbox even if banners fail */
    }
    return;
  }

  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const banner = new Notification(title, { body, tag: notice.id });
    banner.onclick = () => {
      window.focus();
      if (notice.href) window.location.assign(notice.href);
    };
  } catch {
    /* browser blocked */
  }
}

export async function listenNotificationTaps(go: (href: string) => void) {
  if (!isNativeApp()) return () => undefined;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const handle = await LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
      const href = event.notification.extra?.href;
      if (typeof href === "string" && href) go(href);
    });
    return () => {
      void handle.remove();
    };
  } catch {
    return () => undefined;
  }
}
