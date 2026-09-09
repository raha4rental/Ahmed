"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { fmtDate, money, nights } from "@/lib/format";
import { aptName, remaining } from "@/lib/lookups";
import { apartmentPath } from "@/lib/paths";

export default function GuestPage() {
  return (
    <Suspense fallback={<p className="raha-card p-8">…</p>}>
      <GuestInner />
    </Suspense>
  );
}

function GuestInner() {
  const id = useSearchParams().get("id") ?? "";
  const { data, user, t, lang } = useStore();
  const guest = data.guests.find((g) => g.id === id);
  if (!user) return null;
  if (!can.viewGuests(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;
  if (!guest) return <p>{t("noResults")}</p>;

  const stays = data.bookings.filter((b) => b.guestId === guest.id);

  return (
    <div className="space-y-6">
      <PageHeader title={guest.name} subtitle={guest.phone || undefined} />
      <section className="raha-card space-y-3 p-5">
        <h2 className="font-medium">{t("idPhoto")}</h2>
        {guest.idPhoto ? (
          <img src={guest.idPhoto} alt="" className="w-full rounded-2xl object-contain" />
        ) : (
          <p className="text-sm text-muted-foreground">{t("noIdPhoto")}</p>
        )}
        <div className="grid gap-4 pt-2 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">{t("phone")}</div>
            <div className="font-medium">{guest.phone || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("address")}</div>
            <div className="font-medium">{guest.address || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("previousBookings")}</div>
            <div className="font-medium">{stays.length}</div>
          </div>
        </div>
      </section>
      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">{t("history")}</h2>
        <div className="space-y-2 text-sm">
          {stays.map((b) => (
            <Link key={b.id} href={apartmentPath(b.apartmentId)} className="flex flex-wrap justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted">
              <span className="font-medium">{aptName(data, b.apartmentId)}</span>
              <span>{fmtDate(b.checkIn, lang)} → {fmtDate(b.checkOut, lang)}</span>
              <span>{nights(b.checkIn, b.checkOut)} {t("nights")}</span>
              <span>{t("people")}: {b.guestsCount}</span>
              {can.viewFinancials(user.role) ? (
                <span>
                  {money(b.totalAmount, lang)} · {t("paid")} {money(b.paidAmount, lang)} · {t("remaining")} {money(remaining(b), lang)}
                </span>
              ) : null}
              <span className="text-muted-foreground">{b.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
