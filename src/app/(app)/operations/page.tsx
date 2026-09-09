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
import { aptName, guestName } from "@/lib/lookups";
import { hotelReady } from "@/lib/hotel-checklist";
import { handoverPath } from "@/lib/handover-checklist";
import { apartmentPath } from "@/lib/paths";
import type { Booking, HandoverKind, OpsTask } from "@/lib/types";

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

  const checkinsToday = data.bookings.filter((b) => b.checkIn === TODAY && b.status === "booked");
  const checkoutsToday = data.bookings.filter((b) => b.checkOut === TODAY && b.status === "checked_in");

  return (
    <div>
      <PageHeader
        title={t("operations")}
        subtitle={
          lang === "ar"
            ? "استلام وخروج بتوقيع المستلم والداخل، ثم اللائحة الفندقية للتنظيف. لا READY إلا إذا اكتمل كل بند."
            : "Signed check-in and check-out lists, then hotel cleaning. READY only when every item is done."
        }
      />

      {can.checkInOut(user.role) ? (
        <>
          <HandoverLane
            title={t("todayHandoverIn")}
            bookings={checkinsToday}
            kind="check_in"
          />
          <HandoverLane
            title={t("todayHandoverOut")}
            bookings={checkoutsToday}
            kind="check_out"
          />
        </>
      ) : null}

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
              <Link href={apartmentPath(current.apartmentId)} className="text-lg font-medium hover:underline">
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

function HandoverLane({
  title,
  bookings,
  kind,
}: {
  title: string;
  bookings: Booking[];
  kind: HandoverKind;
}) {
  const { data, t } = useStore();
  if (!bookings.length) return null;
  return (
    <section className="raha-card mb-4 overflow-hidden">
      <div className="px-4 py-3 font-medium">{title}</div>
      <div className="divide-y divide-border">
        {bookings.map((b) => {
          const apt = data.apartments.find((a) => a.id === b.apartmentId);
          const signed = data.handovers.some((h) => h.bookingId === b.id && h.kind === kind && h.completed);
          return (
            <Link
              key={b.id}
              href={handoverPath(b.id, kind)}
              className="flex items-center gap-3 px-4 py-3"
            >
              <img
                src={apt?.photos[0]}
                alt=""
                className="size-16 shrink-0 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{aptName(data, b.apartmentId)}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {guestName(data, b.guestId)} · {kind === "check_in" ? b.checkInTime : t("checkOut")}
                </span>
                <span className="mt-1 block text-xs text-[#8a7048]">
                  {signed ? t("signedCopy") : t("openHandover")}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function labelTask(type: OpsTask["type"], t: (k: "cleaning" | "inspection" | "restock" | "turnover" | "finalInspection") => string) {
  if (type === "inspection") return t("inspection");
  if (type === "final_inspection") return t("finalInspection");
  if (type === "restock") return t("restock");
  if (type === "turnover") return t("turnover");
  return t("cleaning");
}
