"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Home,
  LogOut,
  Receipt,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { bottomNav } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { CopyKey } from "@/lib/i18n";
import { appPath } from "@/lib/paths";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  building: Building2,
  calendar: CalendarDays,
  receipt: Receipt,
  sparkles: Sparkles,
  wrench: Wrench,
  more: CircleEllipsis,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, lang, t, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="app-device flex items-center justify-center bg-[#0e1c18]">
        <img src="/logo.png" alt="Ahmed" className="w-44 rounded-2xl" />
      </div>
    );
  }

  const items = bottomNav(user.role);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const path = appPath(pathname);
  const atHome = path === "/dashboard";
  const BackIcon = lang === "ar" ? ChevronRight : ChevronLeft;

  function goBack() {
    if (atHome) {
      logout();
      router.replace("/");
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/dashboard");
  }

  function signOut() {
    logout();
    router.replace("/");
  }

  return (
    <div dir={dir} className="app-device">
      <header className="app-topbar">
        <div className="app-topbar-brand">
          <button type="button" className="app-topbar-action" onClick={goBack} aria-label={t("back")}>
            <BackIcon className="size-5" />
          </button>
          <img src="/logo.png" alt="Ahmed" className="app-topbar-logo" />
          <button type="button" className="app-topbar-action app-topbar-logout" onClick={signOut} aria-label={t("logout")}>
            <LogOut className="size-4" />
          </button>
        </div>
        <svg className="app-topbar-flow" viewBox="0 0 430 20" preserveAspectRatio="none" aria-hidden>
          <path d="M0 20V8C72 20 140 2 215 8C290 14 358 2 430 12V20Z" fill="#fbf6ec" />
          <path
            d="M0 8C72 20 140 2 215 8C290 14 358 2 430 12"
            fill="none"
            stroke="#c4a574"
            strokeWidth="1.4"
            opacity="0.7"
          />
        </svg>
      </header>
      <main className="app-scroll">{children}</main>
      <nav className="app-tabbar">
        {items.map((item) => {
          const Icon = icons[item.icon] ?? Home;
          const active =
            item.href === "/more"
              ? path === "/more"
              : path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("app-tab", active && "app-tab-active")}
            >
              <Icon className="size-5" />
              <span>{t(item.key as CopyKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
