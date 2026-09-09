"use client";

import Link from "next/link";
import {
  Building2,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  Sparkles,
  Wrench,
} from "lucide-react";
import { AptStatus, TaskDot } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money, TODAY, inThisMonth } from "@/lib/format";
import { aptName, guestName, remaining, statusLabel } from "@/lib/lookups";
import { handoverPath } from "@/lib/handover-checklist";
import { apartmentPath } from "@/lib/paths";

export default function DashboardPage() {
  const { data, user, t, lang } = useStore();
  if (!user) return null;

  const isAdmin = user.role === "SUPER_ADMIN";
  const apts = data.apartments;
  const counts = {
    total: apts.length,
    ready: apts.filter((a) => a.status === "ready").length,
    cleaning: apts.filter((a) => a.status === "cleaning" || a.status === "inspection").length,
    maintenance: apts.filter((a) => a.status === "maintenance").length,
    occupied: apts.filter((a) => a.status === "occupied" || a.status === "booked").length,
  };
  const monthBookings = data.bookings.filter(
    (b) => inThisMonth(b.checkIn) || inThisMonth(b.checkOut) || b.status === "checked_in"
  );
  const revenue = monthBookings.reduce((s, b) => s + b.paidAmount, 0);
  const expenses = data.expenses
    .filter((e) => inThisMonth(e.date) || (e.dueDate ? inThisMonth(e.dueDate) : false))
    .reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expenses;
  const outstanding = data.bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + remaining(b), 0);
  const todayTasks = data.tasks.filter((x) => x.date === TODAY && x.status !== "completed");
  const checkinsToday = data.bookings.filter((b) => b.checkIn === TODAY && b.status === "booked");
  const checkoutsToday = data.bookings.filter((b) => b.checkOut === TODAY && b.status === "checked_in");

  return (
    <div className="app-page">
      <header className="mb-5 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1b3d34] text-[#c4a574] text-lg font-semibold shadow-[0_10px_20px_-12px_rgba(27,61,52,0.9)] ring-1 ring-[#c4a57455]">
          {isAdmin ? "أ" : "ر"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#8a7048]">{isAdmin ? t("management") : t("operationsRole")}</p>
          <h1 className="truncate text-xl font-semibold text-[#1b3d34]">
            {isAdmin ? t("welcomeAhmed") : t("welcomeStaff")}
          </h1>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Mini label={t("apartments")} value={counts.total} />
        <Mini label={t("ready")} value={counts.ready} tone="ready" />
        <Mini label={t("occupied")} value={counts.occupied} tone="info" />
        <Mini label={t("cleaning")} value={counts.cleaning} tone="warn" />
        <Mini label={t("maintenanceSt")} value={counts.maintenance} wide tone="danger" />
      </div>

      {can.viewFinancials(user.role) ? (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="app-hero col-span-2">
            <div className="text-xs text-[#c4a574]">{t("expenseTotal")}</div>
            <div className="mt-1 text-3xl font-semibold">{money(expenses, lang)}</div>
          </div>
          <MoneyCard label={t("revenueMonth")} value={money(revenue, lang)} tone="up" />
          <MoneyCard label={t("profit")} value={money(profit, lang)} tone={profit >= 0 ? "up" : "down"} />
          <MoneyCard label={t("outstanding")} value={money(outstanding, lang)} tone="warn" wide />
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Mini label={t("checkinsToday")} value={checkinsToday.length} />
          <Mini label={t("checkoutsToday")} value={checkoutsToday.length} />
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3">
        {isAdmin ? (
          <>
            <Quick href="/apartments" icon={Plus} label={t("addApartment")} />
            <Quick href="/bookings" icon={CalendarPlus} label={t("createBooking")} />
            <Quick href="/expenses" icon={Receipt} label={t("addExpense")} />
            <Quick href="/maintenance" icon={Wrench} label={t("maintenance")} />
          </>
        ) : (
          <>
            <Quick href="/operations" icon={Sparkles} label={t("todaysWork")} />
            <Quick href="/operations" icon={CalendarPlus} label={t("handoverIn")} />
            <Quick href="/maintenance" icon={Wrench} label={t("newRequest")} />
            <Quick href="/apartments" icon={Building2} label={t("apartments")} />
          </>
        )}
      </div>

      <section className="app-card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">{t("todaysTasks")}</h2>
          <Link href="/operations" className="text-xs font-medium text-[#8a7048]">{t("operations")}</Link>
        </div>
        <div className="divide-y divide-border/80">
          {todayTasks.slice(0, 6).map((task) => (
            <Link key={task.id} href="/operations" className="app-row">
              <TaskDot status={task.status} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{aptName(data, task.apartmentId)}</div>
                <div className="text-xs text-muted-foreground">
                  {task.type === "inspection" || task.type === "final_inspection" ? t("inspection") : task.type === "restock" ? t("restock") : t("cleaning")}
                </div>
              </div>
              {lang === "ar" ? <ChevronLeft className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
            </Link>
          ))}
          {todayTasks.length === 0 ? <p className="py-6 text-sm text-muted-foreground">{t("empty")}</p> : null}
        </div>
      </section>

      {(checkinsToday.length > 0 || checkoutsToday.length > 0) ? (
        <section className="app-card mt-3">
          <h2 className="mb-3 font-medium">{lang === "ar" ? "دخول وخروج اليوم" : "Today arrivals"}</h2>
          {checkinsToday.map((b) => (
            <Link key={b.id} href={handoverPath(b.id, "check_in")} className="mb-2 block rounded-xl bg-[#eef6f2] px-3 py-3 text-sm shadow-sm">
              {t("handoverIn")} · {guestName(data, b.guestId)} · {aptName(data, b.apartmentId)}
            </Link>
          ))}
          {checkoutsToday.map((b) => (
            <Link key={b.id} href={handoverPath(b.id, "check_out")} className="mb-2 block rounded-xl bg-[#f7f0e2] px-3 py-3 text-sm shadow-sm">
              {t("handoverOut")} · {guestName(data, b.guestId)} · {aptName(data, b.apartmentId)}
            </Link>
          ))}
        </section>
      ) : null}

      <section className="app-card mt-3">
        <h2 className="mb-2 font-medium">{t("apartments")}</h2>
        {["apt-aster-405", "apt-vantage-302", "apt-lumos-210"].map((id) => {
          const a = data.apartments.find((x) => x.id === id);
          if (!a) return null;
          return (
            <Link key={id} href={apartmentPath(id)} className="app-row justify-between">
              <span className="text-sm font-medium">{aptName(data, id)}</span>
              <AptStatus status={a.status} label={statusLabel(a.status, t)} />
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function Mini({
  label,
  value,
  wide,
  tone = "default",
}: {
  label: string;
  value: number;
  wide?: boolean;
  tone?: "default" | "ready" | "info" | "warn" | "danger";
}) {
  const pip = {
    default: "bg-[#1b3d34]",
    ready: "bg-emerald-600",
    info: "bg-sky-600",
    warn: "bg-amber-500",
    danger: "bg-rose-600",
  }[tone];
  return (
    <div className={`app-card px-3 py-3.5 ${wide ? "col-span-2" : ""}`}>
      <div className={`mb-2 h-1 w-7 rounded-full ${pip}`} />
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold text-[#1b3d34]">{value}</div>
    </div>
  );
}

function MoneyCard({ label, value, tone, wide }: { label: string; value: string; tone: "up" | "down" | "warn"; wide?: boolean }) {
  const color = tone === "up" ? "text-emerald-700" : tone === "down" ? "text-rose-700" : "text-amber-800";
  return (
    <div className={`app-card px-3 py-3.5 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function Quick({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link href={href} className="app-tile">
      <span className="app-tile-icon">
        <Icon className="size-5" />
      </span>
      <span className="text-[12px] font-medium leading-tight text-[#1b3d34]">{label}</span>
    </Link>
  );
}
