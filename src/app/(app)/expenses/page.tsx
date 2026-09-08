"use client";

import { useMemo, useState } from "react";
import { PageHeader, StatCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ExpenseDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money, inThisMonth } from "@/lib/format";
import { aptName, buildingName } from "@/lib/lookups";
import type { ExpenseCategory } from "@/lib/types";

const cats: ExpenseCategory[] = [
  "electricity",
  "internet",
  "water",
  "maintenance",
  "cleaning",
  "supplies",
  "furniture",
  "repairs",
  "other",
];

const icons: Record<ExpenseCategory, string> = {
  electricity: "⚡",
  internet: "🌐",
  water: "💧",
  maintenance: "🔧",
  cleaning: "🧹",
  supplies: "🧴",
  furniture: "🛋️",
  repairs: "🛠️",
  other: "•",
};

export default function ExpensesPage() {
  const { data, user, t, lang, deleteExpense } = useStore();
  const [open, setOpen] = useState(false);
  const [buildingId, setBuildingId] = useState("all");

  const month = useMemo(
    () => data.expenses.filter((e) => inThisMonth(e.date) && (buildingId === "all" || e.buildingId === buildingId)),
    [data.expenses, buildingId]
  );
  const total = month.reduce((s, e) => s + e.amount, 0);
  const byCat = useMemo(() => {
    const map = Object.fromEntries(cats.map((c) => [c, 0])) as Record<ExpenseCategory, number>;
    month.forEach((e) => {
      map[e.category] += e.amount;
    });
    return map;
  }, [month]);

  if (!user) return null;
  if (!can.viewExpenses(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const byBuilding = data.buildings.map((b) => ({
    ...b,
    total: data.expenses.filter((e) => e.buildingId === b.id && inThisMonth(e.date)).reduce((s, e) => s + e.amount, 0),
  }));

  return (
    <div>
      <PageHeader
        title={t("expenses")}
        subtitle="Building → Apartment → Expense"
        action={<Button onClick={() => setOpen(true)}>{t("addExpense")}</Button>}
      />

      <div className="mb-5">
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={buildingId}
          onChange={(e) => setBuildingId(e.target.value)}
        >
          <option value="all">{t("allBuildings")}</option>
          {data.buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("monthlyExpenses")} value={money(total, lang)} tone="gold" />
        {(["electricity", "internet", "maintenance", "cleaning", "supplies"] as const).map((c) => (
          <StatCard key={c} label={`${icons[c]} ${t(c === "cleaning" ? "cleaning" : c === "maintenance" ? "maintenance" : c === "supplies" ? "supplies" : c)}`} value={money(byCat[c], lang)} />
        ))}
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {byBuilding.map((b) => (
          <button key={b.id} onClick={() => setBuildingId(b.id)} className="raha-card p-4 text-start">
            <div className="text-sm text-muted-foreground">{b.name}</div>
            <div className="font-[family-name:var(--font-display)] text-2xl text-[#1b3d34]">{money(b.total, lang)}</div>
            <div className="text-xs text-muted-foreground">{t("monthlyExpenses")}</div>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto raha-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-start font-medium">{t("building")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("apartment")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("category")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("amount")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("description")}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {month.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-4 py-3">{buildingName(data, e.buildingId)}</td>
                <td className="px-4 py-3">{aptName(data, e.apartmentId)}</td>
                <td className="px-4 py-3">{icons[e.category]} {e.category}</td>
                <td className="px-4 py-3">{money(e.amount, lang)}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.description}</td>
                <td className="px-4 py-3">
                  {can.deleteExpense(user.role) ? (
                    <Button size="sm" variant="ghost" onClick={() => deleteExpense(e.id)}>{t("delete")}</Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
