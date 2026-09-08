"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Shield,
  Sparkles,
  Users,
  Wifi,
  Wrench,
  Zap,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { navFor } from "@/lib/permissions";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CopyKey } from "@/lib/i18n";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: LayoutDashboard,
  building: Building2,
  users: Users,
  calendar: CalendarDays,
  sparkles: Sparkles,
  wrench: Wrench,
  zap: Zap,
  wifi: Wifi,
  receipt: Receipt,
  shield: Shield,
};

function NavList({ onGo }: { onGo?: () => void }) {
  const { user, t, lang } = useStore();
  const pathname = usePathname();
  if (!user) return null;
  const items = navFor(user.role);
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = icons[item.icon] ?? LayoutDashboard;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onGo}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className={lang === "ar" ? "font-medium" : ""}>{t(item.key as CopyKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
      <div className="flex size-9 items-center justify-center rounded-lg bg-[#c4a574] text-[#14241f] font-semibold">
        ر
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide text-[#f3e6c8]">RAHA</div>
        <div className="text-[11px] text-[#c4a574]">Management</div>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout, toggleLang, t, lang } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        RAHA
      </div>
    );
  }

  const dir = lang === "ar" ? "rtl" : "ltr";

  const sidebar = (
    <div className="flex h-full flex-col gap-6">
      <Brand />
      <NavList onGo={() => setOpen(false)} />
      <div className="mt-auto space-y-3">
        <Separator className="bg-sidebar-border" />
        <div className="flex items-center gap-3 px-1">
          <Avatar className="size-9">
            <AvatarFallback className="bg-[#c4a574] text-[#14241f] text-xs">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-[#f3e6c8]">
              {lang === "ar" ? user.nameAr : user.name}
            </div>
            <div className="truncate text-[11px] text-[#c4a574]">
              {lang === "ar" ? user.titleAr : user.title}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-sidebar-foreground/80"
            onClick={toggleLang}
          >
            <Languages className="size-3.5" />
            {t("lang")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground/80"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            <LogOut className="size-3.5" />
            {t("logout")}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 z-30 hidden w-64 border-e border-sidebar-border bg-sidebar p-4 md:block">
        {sidebar}
      </aside>
      <div className="md:ps-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon-sm">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side={lang === "ar" ? "right" : "left"} className="bg-sidebar text-sidebar-foreground w-72 p-4">
              {sidebar}
            </SheetContent>
          </Sheet>
          <Brand />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
