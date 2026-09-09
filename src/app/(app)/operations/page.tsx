"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { HotelChecklist } from "@/components/hotel-checklist";
import { TaskDot } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { TODAY } from "@/lib/format";
import { aptName } from "@/lib/lookups";
import { hotelReady } from "@/lib/hotel-checklist";
import type { OpsTask } from "@/lib/types";

export default function OperationsPage() {
  const { data, user, t, lang, completeCleaning, completeInspection, markReady, setTaskChecklist } = useStore();
  const [active, setActive] = useState<string | null>(null);
  if (!user) return null;
  if (!can.viewOperations(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const tasks = data.tasks.filter((x) => x.date === TODAY || x.status !== "completed");
  const current = tasks.find((x) => x.id === active) ?? tasks[0];
  const apt = current ? data.apartments.find((a) => a.id === current.apartmentId) : undefined;
  const gate = current ? hotelReady(current.checklist) : null;

  function failToast(reason?: string) {
    if (reason === "photos") toast.error(t("photoRequired"));
    else if (reason === "pending") toast.error(t("cannotCompleteCleaning"));
    else toast.error(t("cannotReady"));
  }

  return (
    <div>
      <PageHeader
        title={t("operations")}
        subtitle={lang === "ar" ? "لائحة فندقية — بما فيها داخل دواليب المطبخ والحمام والخزانات. لا READY إلا إذا اكتمل كل بند." : "Hotel-standard checklist — including inside kitchen, bathroom, and storage cabinets. READY only when every item is done."}
      />

      <section className="raha-card mb-4 overflow-hidden">
        <div className="px-4 py-3 font-medium">{t("todaysTasks")}</div>
        <div className="divide-y divide-border">
          {tasks.map((task) => {
            const g = hotelReady(task.checklist);
            return (
              <button
                key={task.id}
                type="button"
                className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm ${current?.id === task.id ? "bg-accent/40" : ""}`}
                onClick={() => setActive(task.id)}
              >
                <span>
                  <span className="font-medium">{aptName(data, task.apartmentId)}</span>
                  <span className="ms-2 text-muted-foreground">{labelTask(task.type, t)}</span>
                </span>
                <span className="flex items-center gap-2 text-xs">
                  {task.checklist.length ? `${g.score}%` : ""}
                  <TaskDot status={task.status} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {current && apt ? (
        <section className="raha-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <Link href={`/apartments/${current.apartmentId}`} className="text-lg font-medium hover:underline">
                {aptName(data, current.apartmentId)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {apt.bedrooms} {t("bedrooms")} · {apt.bathrooms} {t("bathrooms")} · {current.checklist.length} {lang === "ar" ? "بند" : "items"}
              </p>
            </div>
            <TaskDot status={current.status} />
          </div>

          {current.checklist.length > 0 ? (
            <HotelChecklist
              list={current.checklist}
              bedrooms={apt.bedrooms}
              bathrooms={apt.bathrooms}
              lang={lang}
              labels={{
                done: t("itemDone"),
                problem: t("itemProblem"),
                photo: t("itemPhoto"),
                note: t("itemNote"),
                required: t("photoRequired"),
                hotel: t("hotelStandard"),
                all: t("zoneAll"),
              }}
              onChange={(next) => setTaskChecklist(current.id, next)}
            />
          ) : (
            <p className="mb-4 text-sm text-muted-foreground">{current.notes || t("todaysWork")}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {(current.type === "cleaning" || current.type === "turnover" || current.type === "restock") && can.completeCleaning(user.role) ? (
              <Button
                onClick={() => {
                  const ok = completeCleaning(current.id);
                  if (ok) toast.success(t("inspection"));
                  else failToast(gate?.reason);
                }}
              >
                {t("completeTask")}
              </Button>
            ) : null}

            {(current.type === "inspection" || current.type === "final_inspection") && can.inspect(user.role) ? (
              <Button
                onClick={() => {
                  const ok = completeInspection(current.id, current.checklist, current.notes);
                  if (ok) toast.success(t("completed"));
                  else failToast(gate?.reason);
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
                  else failToast(res.reason);
                }}
              >
                {t("markReady")}
              </Button>
            ) : null}
          </div>
        </section>
      ) : (
        <p className="raha-card p-8 text-muted-foreground">{t("empty")}</p>
      )}
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
