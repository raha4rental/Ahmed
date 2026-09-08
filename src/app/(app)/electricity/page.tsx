"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/page-header";
import { UtilBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money } from "@/lib/format";
import { aptName } from "@/lib/lookups";

export default function ElectricityPage() {
  const { data, user, t, lang, markUtilityPaid } = useStore();
  if (!user) return null;
  if (!can.viewUtilities(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const bills = data.electricity;
  const unpaid = bills.filter((b) => b.status === "unpaid").length;
  const soon = bills.filter((b) => b.status === "due_soon").length;
  const paid = bills.filter((b) => b.status === "paid").length;

  return (
    <div>
      <PageHeader title={`${t("electricity")} Dashboard`} />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label={`🔴 ${t("unpaid")}`} value={unpaid} tone="danger" />
        <StatCard label={`🟡 ${t("dueSoon")}`} value={soon} tone="warn" />
        <StatCard label={`🟢 ${t("billPaid")}`} value={paid} tone="ready" />
      </div>
      <div className="overflow-x-auto raha-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-start font-medium">{t("apartment")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("company")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("account")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("meter")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("amount")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("due")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("status")}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.apartmentId} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/apartments/${b.apartmentId}`} className="font-medium hover:underline">
                    {aptName(data, b.apartmentId)}
                  </Link>
                </td>
                <td className="px-4 py-3">{b.company}</td>
                <td className="px-4 py-3">{can.viewSensitiveAccounts(user.role) ? b.accountNumber : "••••••"}</td>
                <td className="px-4 py-3">{can.viewSensitiveAccounts(user.role) ? b.extraNumber : "••••"}</td>
                <td className="px-4 py-3">{can.viewFinancials(user.role) ? money(b.amount, lang) : "—"}</td>
                <td className="px-4 py-3">{b.dueDate}</td>
                <td className="px-4 py-3">
                  <UtilBadge status={b.status} labels={{ unpaid: t("unpaid"), due_soon: t("dueSoon"), paid: t("billPaid") }} />
                </td>
                <td className="px-4 py-3">
                  {b.status !== "paid" && can.payBills(user.role) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        markUtilityPaid("electricity", b.apartmentId);
                        toast.success(t("billPaid"));
                      }}
                    >
                      {t("markPaid")}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
