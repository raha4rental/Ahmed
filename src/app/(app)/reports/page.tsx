"use client";

import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money, inThisMonth } from "@/lib/format";
import { aptName } from "@/lib/lookups";

export default function ReportsPage() {
  const { data, user, t, lang } = useStore();
  if (!user) return null;
  if (!can.viewFinancials(user.role)) return <p className="app-page">{t("denied")}</p>;

  const occupied = data.apartments.filter((a) => a.status === "occupied" || a.status === "booked").length;
  const occupancy = Math.round((occupied / Math.max(1, data.apartments.length)) * 100);
  const revenue = data.bookings.filter((b) => inThisMonth(b.checkIn) || b.status === "checked_in").reduce((s, b) => s + b.paidAmount, 0);
  const expenses = data.expenses.filter((e) => inThisMonth(e.date)).reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expenses;
  const margin = revenue ? Math.round((profit / revenue) * 100) : 0;

  const byApt = data.apartments
    .map((a) => ({
      id: a.id,
      name: aptName(data, a.id),
      rev: data.bookings.filter((b) => b.apartmentId === a.id && (inThisMonth(b.checkIn) || b.status === "checked_in")).reduce((s, b) => s + b.paidAmount, 0),
    }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 6);

  return (
    <div className="app-page">
      <h1 className="mb-4 text-2xl font-semibold text-[#1b3d34]">{t("reports")}</h1>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="app-card p-3">
          <div className="text-xs text-muted-foreground">{lang === "ar" ? "الإشغال" : "Occupancy"}</div>
          <div className="text-3xl font-semibold text-[#1b3d34]">{occupancy}%</div>
        </div>
        <div className="app-card p-3">
          <div className="text-xs text-muted-foreground">{lang === "ar" ? "هامش الربح" : "Margin"}</div>
          <div className="text-3xl font-semibold text-emerald-700">{margin}%</div>
        </div>
        <div className="app-card p-3">
          <div className="text-xs text-muted-foreground">{t("revenueMonth")}</div>
          <div className="text-xl font-semibold text-emerald-700">{money(revenue, lang)}</div>
        </div>
        <div className="app-card p-3">
          <div className="text-xs text-muted-foreground">{t("expensesMonth")}</div>
          <div className="text-xl font-semibold text-rose-700">{money(expenses, lang)}</div>
        </div>
      </div>
      <section className="app-card">
        <h2 className="mb-3 font-medium">{lang === "ar" ? "أعلى الشقق إيراداً" : "Top apartments"}</h2>
        {byApt.map((a, i) => (
          <div key={a.id} className="flex items-center justify-between py-2 text-sm">
            <span>{i + 1}. {a.name}</span>
            <span className="font-medium">{money(a.rev, lang)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
