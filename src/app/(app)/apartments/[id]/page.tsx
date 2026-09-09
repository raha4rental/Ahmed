"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { AptStatus, MaintStatusBadge, PriorityBadge, UtilBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckInDialog, CheckOutDialog, MaintenanceDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { fmtDate, money, nights } from "@/lib/format";
import { activeStay, currentBooking, guestName, remaining, statusLabel, userName } from "@/lib/lookups";
import type { ApartmentStatus, ChecklistItem, Lang } from "@/lib/types";
import { hotelReady, hotelZones, zoneProgress } from "@/lib/hotel-checklist";

export default function ApartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const store = useStore();
  const { data, user, t, lang, markReady, updateApartment, updateInventory, deleteApartment } = store;
  const [inId, setInId] = useState<string | null>(null);
  const [outId, setOutId] = useState<string | null>(null);
  const [maint, setMaint] = useState(false);

  const apt = data.apartments.find((a) => a.id === id);
  const building = data.buildings.find((b) => b.id === apt?.buildingId);
  if (!user) return null;
  if (!apt || !building) {
    return <p className="text-muted-foreground">{t("noResults")}</p>;
  }

  const stay = activeStay(data, apt.id);
  const upcoming = currentBooking(data, apt.id);
  const guest = data.guests.find((g) => g.id === (stay?.guestId ?? upcoming?.guestId));
  const booking = stay ?? upcoming;
  const elec = data.electricity.find((x) => x.apartmentId === apt.id);
  const net = data.internet.find((x) => x.apartmentId === apt.id);
  const water = data.water.find((x) => x.apartmentId === apt.id);
  const maintItems = data.maintenance.filter((m) => m.apartmentId === apt.id);
  const tasks = data.tasks.filter((x) => x.apartmentId === apt.id);
  const lastClean = [...tasks].reverse().find((x) => x.type === "cleaning" && x.status === "completed");
  const lastInspect = [...tasks].reverse().find((x) => x.type === "inspection" || x.type === "final_inspection");
  const inv = data.inventory.filter((x) => x.apartmentId === apt.id);
  const history = data.bookings.filter((b) => b.apartmentId === apt.id);
  const expenses = data.expenses.filter((e) => e.apartmentId === apt.id);
  const failed = lastInspect ? !hotelReady(lastInspect.checklist).ok : false;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={building.address}
        title={`${building.name} ${apt.number}`}
        subtitle={lang === "ar" ? apt.descriptionAr : apt.description}
        action={
          <>
            <AptStatus status={apt.status} label={statusLabel(apt.status, t)} />
            {can.deleteApartment(user.role) ? (
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteApartment(apt.id)) toast.success(t("delete"));
                }}
              >
                {t("delete")}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-2 sm:grid-cols-3">
        {apt.photos.map((src) => (
          <img key={src} src={src} alt="" className="h-44 w-full rounded-2xl object-cover" />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {booking && booking.status === "booked" && can.checkInOut(user.role) ? (
          <Button onClick={() => setInId(booking.id)}>{t("checkIn")}</Button>
        ) : null}
        {stay && can.checkInOut(user.role) ? (
          <Button variant="secondary" onClick={() => setOutId(stay.id)}>{t("checkOut")}</Button>
        ) : null}
        <Button variant="outline" onClick={() => setMaint(true)}>{t("newRequest")}</Button>
        {can.markReady(user.role) ? (
          <Button
            variant="outline"
            onClick={() => {
              const res = markReady(apt.id);
              if (res.ok) toast.success(`🟢 ${t("ready")}`);
              else toast.error(res.reason === "failed" ? t("cannotReady") : t("accessDenied"));
            }}
          >
            {t("markReady")}
          </Button>
        ) : null}
        {failed ? <p className="self-center text-sm text-rose-700">{t("cannotReady")}</p> : null}
      </div>

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">🏠 {t("apartment")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Meta k={t("city")} v={apt.city} />
          <Meta k={t("bedrooms")} v={String(apt.bedrooms)} />
          <Meta k={t("bathrooms")} v={String(apt.bathrooms)} />
          <Meta k={t("minStay")} v={`${apt.pricing.minStay} ${t("nights")}`} />
          {can.viewFinancials(user.role) || can.editPrices(user.role) ? (
            <>
              <Price k={t("basePrice")} v={apt.pricing.base} lang={lang} />
              <Price k={t("weekend")} v={apt.pricing.weekend} lang={lang} />
              <Price k={t("weekly")} v={apt.pricing.weekly} lang={lang} />
              <Price k={t("monthly")} v={apt.pricing.monthly} lang={lang} />
              <Price k={t("seasonal")} v={apt.pricing.seasonal} lang={lang} />
              <Price k={t("corporatePrice")} v={apt.pricing.corporate} lang={lang} />
              <Price k={t("longStay")} v={apt.pricing.longStay} lang={lang} />
              <Price k={t("cleaningFee")} v={apt.pricing.cleaningFee} lang={lang} />
              <Price k={t("deposit")} v={apt.pricing.deposit} lang={lang} />
            </>
          ) : (
            <p className="text-muted-foreground sm:col-span-2">{t("accountSensitive")}</p>
          )}
          {can.editPrices(user.role) ? (
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">{t("status")}</label>
              <select
                className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={apt.status}
                onChange={(e) => updateApartment(apt.id, { status: e.target.value as ApartmentStatus })}
              >
                {(["ready", "booked", "occupied", "cleaning", "inspection", "maintenance", "not_ready"] as const).map((s) => (
                  <option key={s} value={s}>{statusLabel(s, t)}</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </section>

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">👤 {t("currentGuest")}</h2>
        {guest && booking ? (
          <div className="space-y-2 text-sm">
            <div className="rounded-xl bg-sky-50 p-4">
              <div className="text-xs text-muted-foreground">{t("guest")}</div>
              <div className="text-lg font-medium">{guest.name}</div>
              <div className="mt-2 text-muted-foreground">
                {t("apartment")}: {building.name} {apt.number}
              </div>
              <div>
                {t("checkIn")}: {fmtDate(booking.checkIn, lang)} – {booking.checkInTime}
              </div>
              <div>
                {t("checkOut")}: {fmtDate(booking.checkOut, lang)} · {nights(booking.checkIn, booking.checkOut)} {t("nights")}
              </div>
              {booking.status === "checked_in" ? <div className="mt-2 font-medium text-emerald-700">🟢 {t("checkedIn")}</div> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Meta k={t("phone")} v={guest.phone} />
              <Meta k={t("address")} v={guest.address || "—"} />
              <Meta k={t("people")} v={String(booking.guestsCount)} />
            </div>
            {guest.idPhoto ? (
              <div>
                <div className="mb-2 text-xs text-muted-foreground">{t("idPhoto")}</div>
                <img src={guest.idPhoto} alt="" className="max-h-48 w-full rounded-xl object-contain" />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noGuest")}</p>
        )}
      </section>

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">💰 {t("financial")}</h2>
        {can.viewFinancials(user.role) && booking ? (
          <div className="grid gap-3 sm:grid-cols-4 text-sm">
            <Meta k={t("bookingTotal")} v={money(booking.totalAmount, lang)} />
            <Meta k={t("paid")} v={money(booking.paidAmount, lang)} />
            <Meta k={t("remaining")} v={money(remaining(booking), lang)} />
            <Meta k={t("payment")} v={t(booking.paymentMethod)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("accountSensitive")}</p>
        )}
      </section>

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">⚡ {t("utilities")}</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          {elec ? (
            <UtilBlock
              title={`⚡ ${t("electricity")}`}
              company={elec.company}
              account={can.viewSensitiveAccounts(user.role) ? elec.accountNumber : t("accountSensitive")}
              extra={`${t("meter")}: ${can.viewSensitiveAccounts(user.role) ? elec.extraNumber : "••••"}`}
              amount={can.viewFinancials(user.role) ? money(elec.amount, lang) : "—"}
              due={elec.dueDate}
              status={<UtilBadge status={elec.status} labels={{ unpaid: t("unpaid"), due_soon: t("dueSoon"), paid: t("billPaid") }} />}
            />
          ) : null}
          {net ? (
            <UtilBlock
              title={`🌐 ${t("internet")}`}
              company={net.company}
              account={can.viewSensitiveAccounts(user.role) ? net.accountNumber : t("accountSensitive")}
              extra={can.viewWifi(user.role) ? `${net.wifiName} · ${net.wifiPassword}` : t("accountSensitive")}
              amount={can.viewFinancials(user.role) ? money(net.amount, lang) : "—"}
              due={net.dueDate}
              status={<UtilBadge status={net.status} labels={{ unpaid: t("unpaid"), due_soon: t("dueSoon"), paid: t("billPaid") }} />}
            />
          ) : null}
          {water ? (
            <UtilBlock
              title={`💧 ${t("water")}`}
              company={water.company}
              account={can.viewSensitiveAccounts(user.role) ? water.accountNumber : t("accountSensitive")}
              extra=""
              amount={can.viewFinancials(user.role) ? money(water.amount, lang) : "—"}
              due={water.dueDate}
              status={<UtilBadge status={water.status} labels={{ unpaid: t("unpaid"), due_soon: t("dueSoon"), paid: t("billPaid") }} />}
            />
          ) : null}
        </div>
      </section>

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">🔧 {t("maintenance")}</h2>
        {maintItems.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (
          <div className="space-y-3">
            {maintItems.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.date} · {userName(data, m.assigneeId, lang)} · {can.viewFinancials(user.role) ? money(m.cost, lang) : ""}</div>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={m.priority} labels={{ urgent: t("urgent"), normal: t("normal"), low: t("low") }} />
                  <MaintStatusBadge status={m.status} labels={{ new: t("new"), assigned: t("assigned"), in_progress: t("inProgress"), completed: t("completed") }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">🧹 {t("operations")}</h2>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <Meta k={t("lastClean")} v={lastClean ? lastClean.date : "—"} />
          <Meta k={t("lastInspect")} v={lastInspect ? lastInspect.date : "—"} />
          <Meta k={t("score")} v={lastInspect?.score != null ? `${lastInspect.score}` : "—"} />
        </div>
        {lastInspect?.checklist.length ? (
          <ZoneSummary list={lastInspect.checklist} bedrooms={apt.bedrooms} bathrooms={apt.bathrooms} lang={lang} />
        ) : lastClean?.checklist.length ? (
          <ZoneSummary list={lastClean.checklist} bedrooms={apt.bedrooms} bathrooms={apt.bathrooms} lang={lang} />
        ) : null}
      </section>

      {can.viewInventory(user.role) ? (
        <section className="raha-card p-5">
          <h2 className="mb-4 font-medium">📦 {t("inventory")}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {inv.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <div>
                  <div>{lang === "ar" ? item.nameAr : item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.state === "missing" ? `🔴 ${t("missing")}` : item.state === "low" ? "🟡" : `🟢 ${t("present")}`}
                  </div>
                </div>
                {can.updateInventory(user.role) ? (
                  <Input
                    className="w-20"
                    type="number"
                    value={item.actual}
                    onChange={(e) => updateInventory(item.id, +e.target.value)}
                  />
                ) : (
                  <span>{item.actual}/{item.expected}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">📜 {t("history")}</h2>
        <div className="space-y-2 text-sm">
          {history.map((b) => (
            <div key={b.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <span>{guestName(data, b.guestId)}</span>
              <span className="text-muted-foreground">{b.checkIn} → {b.checkOut}</span>
              {can.viewFinancials(user.role) ? <span>{money(b.totalAmount, lang)}</span> : null}
              <span>{b.status}</span>
            </div>
          ))}
          {can.viewExpenses(user.role) ? expenses.slice(0, 8).map((e) => (
            <div key={e.id} className="flex justify-between rounded-lg px-3 py-2 text-muted-foreground">
              <span>{e.category} · {e.description}</span>
              <span>{money(e.amount, lang)}</span>
            </div>
          )) : null}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("cycle")}: Booking → Check-in → Occupied → Check-out → Inspection → Cleaning → Maintenance → Final Inspection → READY
        </p>
        <Link href="/operations" className="mt-2 inline-block text-xs text-[#8a7048] hover:underline">{t("operations")}</Link>
      </section>

      <CheckInDialog open={!!inId} onOpenChange={(v) => !v && setInId(null)} bookingId={inId} />
      <CheckOutDialog open={!!outId} onOpenChange={(v) => !v && setOutId(null)} bookingId={outId} />
      <MaintenanceDialog open={maint} onOpenChange={setMaint} apartmentId={apt.id} />
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function Price({ k, v, lang }: { k: string; v: number; lang: "ar" | "en" }) {
  return <Meta k={k} v={money(v, lang)} />;
}

function ZoneSummary({
  list,
  bedrooms,
  bathrooms,
  lang,
}: {
  list: ChecklistItem[];
  bedrooms: number;
  bathrooms: number;
  lang: Lang;
}) {
  const zones = hotelZones({ bedrooms, bathrooms });
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {zones.map((z) => {
        const p = zoneProgress(list, z.id);
        return (
          <li key={z.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span>{z.icon} {lang === "ar" ? z.ar : z.en}</span>
            <span>
              {p.problems ? "❌ " : p.done === p.total && p.total ? "🟢 " : "🟡 "}
              {p.done}/{p.total}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function UtilBlock({
  title,
  company,
  account,
  extra,
  amount,
  due,
  status,
}: {
  title: string;
  company: string;
  account: string;
  extra: string;
  amount: string;
  due: string;
  status: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">{title}</div>
        {status}
      </div>
      <div className="space-y-1 text-muted-foreground">
        <div>{company}</div>
        <div>{account}</div>
        {extra ? <div>{extra}</div> : null}
        <div>{amount}</div>
        <div>{due}</div>
      </div>
    </div>
  );
}
