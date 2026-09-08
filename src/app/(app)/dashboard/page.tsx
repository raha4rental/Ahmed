"use client";

import Link from "next/link";
import { PageHeader, StatCard } from "@/components/page-header";
import { AptStatus, PriorityBadge, TaskDot } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money, TODAY } from "@/lib/format";
import { aptName, guestName, remaining, statusLabel } from "@/lib/lookups";
import { inThisMonth } from "@/lib/format";

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
    occupied: apts.filter((a) => a.status === "occupied").length,
  };

  const monthBookings = data.bookings.filter(
    (b) => inThisMonth(b.checkIn) || inThisMonth(b.checkOut) || b.status === "checked_in"
  );
  const revenue = monthBookings.reduce((s, b) => s + b.paidAmount, 0);
  const expenses = data.expenses.filter((e) => inThisMonth(e.date)).reduce((s, e) => s + e.amount, 0);
  const outstanding = data.bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + remaining(b), 0);

  const checkinsToday = data.bookings.filter((b) => b.checkIn === TODAY && b.status === "booked");
  const checkoutsToday = data.bookings.filter((b) => b.checkOut === TODAY && b.status === "checked_in");
  const cleaningReq = apts.filter((a) => a.status === "cleaning").length;
  const inspectPend = data.tasks.filter(
    (x) => (x.type === "inspection" || x.type === "final_inspection") && x.status !== "completed"
  ).length;
  const openMaint = data.maintenance.filter((m) => m.status !== "completed");
  const urgent = openMaint.filter((m) => m.priority === "urgent");

  const todayTasks = data.tasks.filter((x) => x.date === TODAY && x.status !== "completed");

  return (
    <div>
      <PageHeader
        eyebrow={isAdmin ? "SUPER ADMIN" : user.title.toUpperCase()}
        title={isAdmin ? t("welcomeAhmed") : t("welcomeStaff")}
        subtitle={isAdmin ? t("subtitleDash") : t("subtitleEmp")}
        action={
          isAdmin ? (
            <Button render={<Link href="/apartments" />}>+ {t("addApartment")}</Button>
          ) : null
        }
      />

      {isAdmin ? (
        <>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t("today")}</p>
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label={t("apartments")} value={counts.total} />
            <StatCard label={`🟢 ${t("ready")}`} value={counts.ready} tone="ready" />
            <StatCard label={`🟡 ${t("cleaning")}`} value={counts.cleaning} tone="warn" />
            <StatCard label={`🔴 ${t("maintenanceSt")}`} value={counts.maintenance} tone="danger" />
            <StatCard label={`🔵 ${t("occupied")}`} value={counts.occupied} tone="info" />
          </div>

          {can.viewFinancials(user.role) ? (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t("financial")}</p>
              <div className="mb-8 grid gap-3 md:grid-cols-3">
                <StatCard label={t("revenueMonth")} value={money(revenue, lang)} tone="gold" />
                <StatCard label={t("expensesMonth")} value={money(expenses, lang)} />
                <StatCard label={t("outstanding")} value={money(outstanding, lang)} tone="warn" />
              </div>
            </>
          ) : null}

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t("ops")}</p>
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label={t("checkinsToday")} value={checkinsToday.length} tone="info" />
            <StatCard label={t("checkoutsToday")} value={checkoutsToday.length} />
            <StatCard label={t("cleaningRequired")} value={cleaningReq} tone="warn" />
            <StatCard label={t("inspectionsPending")} value={inspectPend} tone="danger" />
          </div>

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t("maintenance")}</p>
          <div className="mb-8 grid gap-3 md:grid-cols-2">
            <StatCard label={t("openIssues")} value={openMaint.length} tone="danger" />
            <StatCard label={t("urgent")} value={urgent.length} tone="warn" />
          </div>
        </>
      ) : (
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatCard label={t("todaysWork")} value={todayTasks.length} tone="gold" />
          <StatCard label={t("checkoutsToday")} value={checkoutsToday.length} />
          <StatCard label={t("openIssues")} value={openMaint.length} tone="danger" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="raha-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">{t("todaysTasks")}</h2>
            <Link href="/operations" className="text-xs text-[#8a7048] hover:underline">
              {t("operations")}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todayTasks.slice(0, 8).map((task) => (
              <Link
                key={task.id}
                href="/operations"
                className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-muted/40"
              >
                <span className="font-medium">{aptName(data, task.apartmentId)}</span>
                <span className="text-muted-foreground">{t(task.type === "inspection" || task.type === "final_inspection" ? "inspection" : task.type === "restock" ? "restock" : "cleaning")}</span>
                <TaskDot status={task.status} />
              </Link>
            ))}
            {todayTasks.length === 0 ? <p className="py-6 text-sm text-muted-foreground">{t("empty")}</p> : null}
          </div>
        </section>

        <section className="raha-card p-5">
          <h2 className="mb-4 font-medium">
            {lang === "ar" ? "دخول وخروج اليوم" : "Arrivals & departures"}
          </h2>
          <div className="space-y-3">
            {checkinsToday.map((b) => (
              <Link key={b.id} href="/bookings" className="block rounded-xl bg-sky-50 px-3 py-2.5 text-sm">
                <div className="font-medium">{t("checkIn")} · {guestName(data, b.guestId)}</div>
                <div className="text-muted-foreground">
                  {aptName(data, b.apartmentId)} · {b.checkInTime}
                </div>
              </Link>
            ))}
            {checkoutsToday.map((b) => (
              <Link key={b.id} href="/bookings" className="block rounded-xl bg-amber-50 px-3 py-2.5 text-sm">
                <div className="font-medium">{t("checkOut")} · {guestName(data, b.guestId)}</div>
                <div className="text-muted-foreground">{aptName(data, b.apartmentId)}</div>
              </Link>
            ))}
            {checkinsToday.length + checkoutsToday.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : null}
          </div>
        </section>
      </div>

      {isAdmin && urgent.length > 0 ? (
        <section className="raha-card mt-6 p-5">
          <h2 className="mb-4 font-medium">{t("urgent")}</h2>
          <div className="space-y-2">
            {urgent.map((m) => (
              <Link key={m.id} href="/maintenance" className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
                <div>
                  <div className="font-medium">{aptName(data, m.apartmentId)}</div>
                  <div className="text-sm text-muted-foreground">{m.title}</div>
                </div>
                <PriorityBadge priority={m.priority} labels={{ urgent: t("urgent"), normal: t("normal"), low: t("low") }} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden raha-card">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-medium">{t("apartments")}</h2>
          <Link href="/apartments" className="text-xs text-[#8a7048] hover:underline">{t("all")}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-2 text-start font-medium">{t("apartment")}</th>
                <th className="px-5 py-2 text-start font-medium">{t("status")}</th>
                <th className="px-5 py-2 text-start font-medium">{t("city")}</th>
              </tr>
            </thead>
            <tbody>
              {["apt-aster-405", "apt-vantage-302", "apt-lumos-210"].map((id) => {
                const a = data.apartments.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <Link href={`/apartments/${a.id}`} className="font-medium hover:underline">
                        {aptName(data, a.id)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <AptStatus status={a.status} label={statusLabel(a.status, t)} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{a.city}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
