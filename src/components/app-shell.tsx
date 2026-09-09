"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  CalendarDays,
  CircleEllipsis,
  Home,
  Receipt,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { bottomNav } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { CopyKey } from "@/lib/i18n";

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
  const { user, ready, lang, t } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="app-device flex items-center justify-center bg-[#14241f] text-[#c4a574]">
        أحمد
      </div>
    );
  }

  const items = bottomNav(user.role);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="app-device">
      <header className="app-topbar">
        <div className="app-topbar-brand">
          <span className="app-topbar-mark">أ</span>
          <span>Ahmed</span>
        </div>
        <nav className="app-tabbar">
          {items.map((item) => {
            const Icon = icons[item.icon] ?? Home;
            const active =
              item.href === "/more"
                ? pathname === "/more"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("app-tab", active && "app-tab-active")}
              >
                <Icon className="size-4" />
                <span>{t(item.key as CopyKey)}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="app-scroll">{children}</main>
    </div>
  );
}
