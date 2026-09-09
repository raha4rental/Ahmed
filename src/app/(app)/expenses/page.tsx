"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ExpenseDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { fmtDate, money, inThisMonth, TODAY } from "@/lib/format";
import { buildingName, remaining } from "@/lib/lookups";
import type { Expense, ExpenseCategory } from "@/lib/types";

type Filter = "all" | "rent" | "electricity" | "emergency" | "supplies";

const icons: Record<string, string> = {
  rent: "🏠",
  electricity: "⚡",
  emergency: "🚨",
  supplies: "🧴",
  internet: "🌐",
  water: "💧",
  maintenance: "🔧",
  cleaning: "🧹",
  furniture: "🛋️",
  repairs: "🛠️",
  other: "•",
};

function payState(e: Expense) {
  if (e.paid === true) return "paid";
  const due = e.dueDate ?? e.date;
  if (due > TODAY) return "due_soon";
  return "unpaid";
}

export default function ExpensesPage() {
  const { data, user, t, lang, deleteExpense, markExpensePaid } = useStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const month = useMemo(
    () =>
      data.expenses.filter((e) => inThisMonth(e.date) || (e.dueDate ? inThisMonth(e.dueDate) : false)),
    [data.expenses]
  );

  const revenue = data.bookings
    .filter((b) => inThisMonth(b.checkIn) || inThisMonth(b.checkOut) || b.status === "checked_in")
    .reduce((s, b) => s + b.paidAmount, 0);
  const totalExp = month.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - totalExp;
  const outstanding = data.bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + remaining(b), 0);

  const rent = month.filter((e) => e.category === "rent");
  const elec = month.filter((e) => e.category === "electricity");
  const emergency = month.filter((e) => e.category === "emergency");
  const supplies = month.filter((e) => e.category === "supplies");

  const rows = useMemo(() => {
    const src =
      filter === "rent"
        ? rent
        : filter === "electricity"
          ? elec
          : filter === "emergency"
            ? emergency
            : filter === "supplies"
              ? supplies
              : month;
    return [...src].sort((a, b) => (a.dueDate ?? a.date).localeCompare(b.dueDate ?? b.date));
  }, [filter, month, rent, elec, emergency, supplies]);

  const rentSchedule = useMemo(
    () => [...rent].sort((a, b) => (a.dueDate ?? a.date).localeCompare(b.dueDate ?? b.date)),
    [rent]
  );

  if (!user) return null;
  if (!can.viewExpenses(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t("all"), count: month.length },
    { id: "rent", label: `🏠 ${t("rent")}`, count: rent.length },
    { id: "electricity", label: `⚡ ${t("electricity")}`, count: elec.length },
    { id: "emergency", label: `🚨 ${t("emergency")}`, count: emergency.length },
    { id: "supplies", label: `🧴 ${t("supplies")}`, count: supplies.length },
  ];

  return (
    <div>
      <PageHeader
        title={t("expenses")}
        subtitle={t("rentSchedule")}
        action={<Button onClick={() => setOpen(true)}>{t("addExpense")}</Button>}
      />

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Money label={t("revenueMonth")} value={money(revenue, lang)} tone="up" />
        <Money label={t("expensesMonth")} value={money(totalExp, lang)} tone="down" />
        <Money label={t("profit")} value={money(profit, lang)} tone={profit >= 0 ? "up" : "down"} />
        <Money label={t("outstanding")} value={money(outstanding, lang)} tone="warn" />
      </div>

      <section className="raha-card mb-3 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#1b3d34]">🏠 {t("rentSchedule")}</h2>
          <span className="text-[11px] text-muted-foreground">{t("nextDue")}</span>
        </div>
        <div className="grid gap-2">
          {rentSchedule.map((e) => {
            const st = payState(e);
            return (
              <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f7f0e4] px-3 py-2.5">
                <div className="min-w-0">
                  <div className="font-medium text-[#1b3d34]">{buildingName(data, e.buildingId)}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {t("dueDate")}: {fmtDate(e.dueDate ?? e.date, lang)}
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-semibold text-[#1b3d34]">{money(e.amount, lang)}</div>
                  <PayBadge status={st} paid={t("billPaid")} unpaid={t("unpaid")} soon={t("dueSoon")} />
                </div>
              </div>
            );
          })}
          {rentSchedule.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
        </div>
      </section>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Money label={`🏠 ${t("rent")}`} value={money(sum(rent), lang)} />
        <Money label={`⚡ ${t("electricity")}`} value={money(sum(elec), lang)} />
        <Money label={`🚨 ${t("emergency")}`} value={money(sum(emergency), lang)} />
        <Money label={`🧴 ${t("supplies")}`} value={money(sum(supplies), lang)} />
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${filter === tab.id ? "bg-[#1b3d34] text-[#f3e6c8]" : "bg-muted"}`}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {rows.map((e) => {
          const st = payState(e);
          const unit = data.apartments.find((a) => a.id === e.apartmentId);
          return (
            <article key={e.id} className="raha-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1b3d34]">
                    {icons[e.category] ?? "•"} {labelCat(e.category, t)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {buildingName(data, e.buildingId)} · {unit ? unit.number : t("wholeBuilding")}
                  </p>
                  {e.description ? <p className="mt-1 text-xs text-muted-foreground">{e.description}</p> : null}
                </div>
                <div className="text-end">
                  <p className="text-base font-semibold text-[#1b3d34]">{money(e.amount, lang)}</p>
                  <PayBadge status={st} paid={t("billPaid")} unpaid={t("unpaid")} soon={t("dueSoon")} />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("dueDate")}: {fmtDate(e.dueDate ?? e.date, lang)}
              </p>
              <div className="mt-2 flex gap-2">
                {st !== "paid" && can.payBills(user.role) ? (
                  <Button size="sm" variant="outline" onClick={() => markExpensePaid(e.id)}>
                    {t("markPaid")}
                  </Button>
                ) : null}
                {can.deleteExpense(user.role) ? (
                  <Button size="sm" variant="ghost" onClick={() => deleteExpense(e.id)}>
                    {t("delete")}
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
        {rows.length === 0 ? <p className="raha-card p-6 text-sm text-muted-foreground">{t("empty")}</p> : null}
      </div>
      <ExpenseDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function sum(list: Expense[]) {
  return list.reduce((s, e) => s + e.amount, 0);
}

function labelCat(
  c: ExpenseCategory,
  t: (
    k:
      | "rent"
      | "electricity"
      | "emergency"
      | "supplies"
      | "internet"
      | "water"
      | "maintenance"
      | "cleaning"
      | "furniture"
      | "repairs"
      | "other"
  ) => string
) {
  if (c === "rent") return t("rent");
  if (c === "emergency") return t("emergency");
  if (c === "electricity") return t("electricity");
  if (c === "supplies") return t("supplies");
  if (c === "internet") return t("internet");
  if (c === "water") return t("water");
  if (c === "maintenance") return t("maintenance");
  if (c === "cleaning") return t("cleaning");
  if (c === "furniture") return t("furniture");
  if (c === "repairs") return t("repairs");
  return t("other");
}

function Money({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" | "warn" }) {
  const color =
    tone === "up" ? "text-emerald-700" : tone === "down" ? "text-rose-700" : tone === "warn" ? "text-amber-700" : "text-[#1b3d34]";
  return (
    <div className="raha-card px-3 py-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function PayBadge({ status, paid, unpaid, soon }: { status: string; paid: string; unpaid: string; soon: string }) {
  if (status === "paid") return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">🟢 {paid}</span>;
  if (status === "due_soon") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">🟡 {soon}</span>;
  return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">🔴 {unpaid}</span>;
}
