"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { visibleNotices } from "@/lib/notify";
import { fmtDate } from "@/lib/format";

export default function NotificationsPage() {
  const { data, user, t, lang, markNotificationRead, markAllNotificationsRead } = useStore();

  if (!user) return null;
  const items = visibleNotices(data.notifications, user);

  return (
    <div className="app-page">
      <PageHeader
        title={t("notifications")}
        subtitle={t("notificationInbox")}
        action={
          items.length ? (
            <Button variant="outline" onClick={markAllNotificationsRead}>
              {t("markAllRead")}
            </Button>
          ) : null
        }
      />
      {items.length === 0 ? (
        <div className="app-card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#1b3d34] text-[#c4a574]">
            <Bell className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">{t("notificationEmpty")}</p>
        </div>
      ) : (
        <div className="app-card overflow-hidden p-0">
          {items.map((notice) => {
            const unread = !notice.readBy.includes(user.id);
            const title = lang === "ar" ? notice.titleAr : notice.titleEn;
            const body = lang === "ar" ? notice.bodyAr : notice.bodyEn;
            const actor = lang === "ar" ? notice.actorNameAr : notice.actorNameEn;
            return (
              <Link
                key={notice.id}
                href={notice.href || "/dashboard"}
                onClick={() => markNotificationRead(notice.id)}
                className="flex gap-3 border-b border-border px-4 py-3.5 last:border-0"
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${unread ? "bg-[#c4a574]" : "bg-transparent"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[#1b3d34]">{title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{body}</span>
                  <span className="mt-1 block text-xs text-[#8a7048]">
                    {actor ? `${t("fromStaff")} ${actor} · ` : ""}
                    {notice.createdAt ? fmtDate(notice.createdAt.slice(0, 10), lang) : t("justNow")}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
