"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { TaskDot } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { TODAY } from "@/lib/format";
import { aptName } from "@/lib/lookups";
import type { OpsTask } from "@/lib/types";

export default function OperationsPage() {
  const { data, user, t, lang, completeCleaning, completeInspection, markReady, setTaskChecklist } = useStore();
  const [active, setActive] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  if (!user) return null;
  if (!can.viewOperations(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const tasks = data.tasks.filter((x) => x.date === TODAY || x.status !== "completed");
  const current = tasks.find((x) => x.id === active) ?? tasks[0];

  function toggle(task: OpsTask, itemId: string, passed: boolean) {
    setTaskChecklist(
      task.id,
      task.checklist.map((c) => (c.id === itemId ? { ...c, passed } : c))
    );
  }

  return (
    <div>
      <PageHeader
        title={t("operations")}
        subtitle={lang === "ar" ? "Turnover → Cleaning → Inspection → READY. لا READY إذا فشل بند." : "Turnover → Cleaning → Inspection → READY. Failed items block READY."}
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="raha-card overflow-hidden">
          <div className="px-4 py-3 font-medium">{t("todaysTasks")}</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-start font-medium">{t("apartment")}</th>
                <th className="px-4 py-2 text-start font-medium">{t("task")}</th>
                <th className="px-4 py-2 text-start font-medium">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`cursor-pointer border-t border-border ${current?.id === task.id ? "bg-accent/40" : "hover:bg-muted/40"}`}
                  onClick={() => {
                    setActive(task.id);
                    setNotes(task.notes);
                  }}
                >
                  <td className="px-4 py-3 font-medium">{aptName(data, task.apartmentId)}</td>
                  <td className="px-4 py-3">{labelTask(task.type, t)}</td>
                  <td className="px-4 py-3"><TaskDot status={task.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {current ? (
          <section className="raha-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Link href={`/apartments/${current.apartmentId}`} className="text-lg font-medium hover:underline">
                  {aptName(data, current.apartmentId)}
                </Link>
                <p className="text-sm text-muted-foreground">{labelTask(current.type, t)}</p>
              </div>
              <TaskDot status={current.status} />
            </div>

            {current.checklist.length > 0 ? (
              <ul className="mb-4 space-y-2">
                {current.checklist.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                    <span>{lang === "ar" ? c.labelAr : c.label}</span>
                    <span className="flex gap-1">
                      <Button size="xs" variant={c.passed === true ? "default" : "outline"} onClick={() => toggle(current, c.id, true)}>
                        🟢 {t("pass")}
                      </Button>
                      <Button size="xs" variant={c.passed === false ? "destructive" : "outline"} onClick={() => toggle(current, c.id, false)}>
                        🔴 {t("fail")}
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-muted-foreground">{current.notes || t("todaysWork")}</p>
            )}

            <Textarea className="mb-4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notes")} />

            <div className="flex flex-wrap gap-2">
              {(current.type === "cleaning" || current.type === "turnover" || current.type === "restock") && can.completeCleaning(user.role) ? (
                <Button
                  onClick={() => {
                    completeCleaning(current.id);
                    toast.success(t("inspection"));
                  }}
                >
                  {t("completeTask")}
                </Button>
              ) : null}

              {(current.type === "inspection" || current.type === "final_inspection") && can.inspect(user.role) ? (
                <Button
                  onClick={() => {
                    const ok = completeInspection(current.id, current.checklist, notes);
                    if (ok) toast.success(t("completed"));
                    else toast.error(t("cannotReady"));
                  }}
                >
                  {t("completeInspection")}
                </Button>
              ) : null}

              {can.markReady(user.role) ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    const res = markReady(current.apartmentId);
                    if (res.ok) toast.success(`🟢 ${t("ready")}`);
                    else toast.error(res.reason === "failed" ? t("cannotReady") : t("accessDenied"));
                  }}
                >
                  {t("markReady")}
                </Button>
              ) : null}
            </div>
            {current.score != null ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("score")}: {current.score}</p>
            ) : null}
          </section>
        ) : (
          <p className="raha-card p-8 text-muted-foreground">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}

function labelTask(type: OpsTask["type"], t: (k: "cleaning" | "inspection" | "restock" | "turnover" | "finalInspection") => string) {
  if (type === "inspection") return t("inspection");
  if (type === "final_inspection") return t("finalInspection");
  if (type === "restock") return t("restock");
  if (type === "turnover") return t("turnover");
  return t("cleaning");
}
