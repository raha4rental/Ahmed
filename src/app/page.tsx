"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Crown, Languages, Sparkles, Wrench, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const roleIcon: Record<Role, React.ComponentType<{ className?: string }>> = {
  SUPER_ADMIN: Crown,
  EMPLOYEE: UserRound,
  CLEANER: Sparkles,
  MAINTENANCE: Wrench,
};

export default function LoginPage() {
  const { data, login, user, ready, t, lang, toggleLang } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-[#14241f] text-[#f3e6c8]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(900px 500px at 10% 0%, #c4a57433, transparent), radial-gradient(700px 400px at 90% 80%, #2d8a5c22, transparent)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#c4a574] text-[#14241f] text-lg font-semibold">
              ر
            </div>
            <div>
              <div className="font-semibold tracking-[0.18em] text-sm">RAHA</div>
              <div className="text-xs text-[#c4a574]">Management</div>
            </div>
          </div>
          <Button variant="ghost" className="text-[#f3e6c8]" onClick={toggleLang}>
            <Languages className="size-4" />
            {t("lang")}
          </Button>
        </header>

        <div className="my-auto grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-[#c4a574] text-sm tracking-wide">Cleveland · Short-term stays</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight md:text-5xl">
              {lang === "ar" ? "نظام إدارة وتشغيل كامل للشقق" : "Full apartment operations — not just cleaning."}
            </h1>
            <p className="max-w-lg text-[#efe6d6]/75 text-base leading-relaxed">
              {lang === "ar"
                ? "أحمد يرى كل شيء: الشقق، الحجوزات، الدخول والخروج، التنظيف، الصيانة، الكهرباء، الإنترنت، والمصاريف. الموظف يرى عمل اليوم فقط."
                : "Ahmed sees everything: units, bookings, check-in/out, cleaning, maintenance, electricity, internet, and expenses. Staff see only today's work."}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-[#c4a574]">
              <span className="rounded-full border border-[#c4a574]/40 px-3 py-1">Booking → Check-in → Occupied</span>
              <span className="rounded-full border border-[#c4a574]/40 px-3 py-1">Checkout → Clean → Inspect → READY</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#c4a574]/25 bg-[#1b3029]/80 p-5 backdrop-blur">
            <p className="mb-4 text-sm text-[#c4a574]">{t("loginAs")}</p>
            <div className="grid gap-2">
              {data.users.map((u) => {
                const Icon = roleIcon[u.role];
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      login(u.id);
                      router.push("/dashboard");
                    }}
                    className="flex items-center gap-3 rounded-xl border border-transparent bg-[#14241f] px-3 py-3 text-start transition hover:border-[#c4a574]/50 hover:bg-[#203830]"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#c4a574]/15 text-[#c4a574]">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#f3e6c8]">{lang === "ar" ? u.nameAr : u.name}</div>
                      <div className="text-xs text-[#efe6d6]/60">
                        {lang === "ar" ? u.titleAr : u.title} · {u.email}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
