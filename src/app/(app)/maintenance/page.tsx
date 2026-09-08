"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, StatCard } from "@/components/page-header";
import { MaintStatusBadge, PriorityBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaintenanceDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money } from "@/lib/format";
import { aptName, userName } from "@/lib/lookups";
import type { MaintenanceStatus } from "@/lib/types";

export default function MaintenancePage() {
  const { data, user, t, lang, updateMaintenance } = useStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"open" | "all">("open");
  if (!user) return null;
  if (!can.viewMaintenance(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const items = data.maintenance.filter((m) => (filter === "open" ? m.status !== "completed" : true));
  const openCount = data.maintenance.filter((m) => m.status !== "completed").length;
  const urgent = data.maintenance.filter((m) => m.status !== "completed" && m.priority === "urgent").length;

  return (
    <div>
      <PageHeader
        title={t("maintenance")}
        subtitle={lang === "ar" ? "كل البلاغات المفتوحة في لوحة واحدة." : "Every open ticket on one board."}
        action={<Button onClick={() => setOpen(true)}>{t("newRequest")}</Button>}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <StatCard label={t("openIssues")} value={openCount} tone="danger" />
        <StatCard label={t("urgent")} value={urgent} tone="warn" />
      </div>
      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={filter === "open" ? "default" : "outline"} onClick={() => setFilter("open")}>{t("open")}</Button>
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>{t("all")}</Button>
      </div>
      <div className="space-y-3">
        {items.map((m) => (
          <article key={m.id} className="raha-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/apartments/${m.apartmentId}`} className="text-sm text-[#8a7048] hover:underline">
                  {aptName(data, m.apartmentId)}
                </Link>
                <h3 className="text-lg font-medium">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={m.priority} labels={{ urgent: t("urgent"), normal: t("normal"), low: t("low") }} />
                <MaintStatusBadge status={m.status} labels={{ new: t("new"), assigned: t("assigned"), in_progress: t("inProgress"), completed: t("completed") }} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">{t("assignee")}</div>
                <select
                  className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={m.assigneeId ?? ""}
                  onChange={(e) =>
                    updateMaintenance(m.id, {
                      assigneeId: e.target.value || null,
                      status: e.target.value ? (m.status === "new" ? "assigned" : m.status) : m.status,
                    })
                  }
                  disabled={!can.assignMaintenance(user.role) && user.role !== "MAINTENANCE"}
                >
                  <option value="">—</option>
                  {data.users.filter((u) => u.role === "MAINTENANCE" || u.role === "EMPLOYEE").map((u) => (
                    <option key={u.id} value={u.id}>{lang === "ar" ? u.nameAr : u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("status")}</div>
                <select
                  className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={m.status}
                  onChange={(e) => updateMaintenance(m.id, { status: e.target.value as MaintenanceStatus })}
                >
                  <option value="new">{t("new")}</option>
                  <option value="assigned">{t("assigned")}</option>
                  <option value="in_progress">{t("inProgress")}</option>
                  <option value="completed">{t("completed")}</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("cost")}</div>
                {can.viewFinancials(user.role) ? (
                  <Input
                    className="mt-1"
                    type="number"
                    value={m.cost}
                    onChange={(e) => updateMaintenance(m.id, { cost: +e.target.value })}
                  />
                ) : (
                  <div className="mt-2 text-muted-foreground">{t("accountSensitive")}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("invoice")}</div>
                <div className="mt-2">{m.invoice ?? "—"}</div>
                {can.viewFinancials(user.role) && m.cost ? (
                  <div className="text-xs text-muted-foreground">{money(m.cost, lang)}</div>
                ) : null}
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{m.date} · {userName(data, m.assigneeId, lang)}</div>
          </article>
        ))}
        {items.length === 0 ? <p className="text-muted-foreground">{t("empty")}</p> : null}
      </div>
      <MaintenanceDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
