"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Languages,
  LogOut,
  Shield,
  Sparkles,
  Users,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { moreNav } from "@/lib/permissions";
import type { CopyKey } from "@/lib/i18n";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  sparkles: Sparkles,
  wrench: Wrench,
  zap: Zap,
  wifi: Wifi,
  chart: BarChart3,
  shield: Shield,
  receipt: BarChart3,
};

export default function MorePage() {
  const { user, t, lang, toggleLang, logout } = useStore();
  const router = useRouter();
  if (!user) return null;
  const items = moreNav(user.role);
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <div className="app-page">
      <h1 className="mb-1 text-2xl font-semibold text-[#1b3d34]">{t("more")}</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {lang === "ar" ? user.nameAr : user.name} · {lang === "ar" ? user.titleAr : user.title}
      </p>
      <div className="app-card overflow-hidden p-0">
        {items.map((item) => {
          const Icon = icons[item.icon] ?? Users;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#1b3d34] text-[#c4a574]">
                <Icon className="size-4" />
              </span>
              <span className="flex-1 font-medium">{t(item.key as CopyKey)}</span>
              <Chevron className="size-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
      <div className="mt-4 app-card overflow-hidden p-0">
        <button onClick={toggleLang} className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5">
          <Languages className="size-5 text-[#8a7048]" />
          <span className="flex-1 text-start font-medium">{t("lang")}</span>
        </button>
        <button
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-rose-700"
        >
          <LogOut className="size-5" />
          <span className="flex-1 text-start font-medium">{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}
