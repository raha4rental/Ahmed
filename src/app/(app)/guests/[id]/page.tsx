"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { fmtDate, money, nights } from "@/lib/format";
import { aptName, remaining } from "@/lib/lookups";

export default function GuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, user, t, lang } = useStore();
  const guest = data.guests.find((g) => g.id === id);
  if (!user) return null;
  if (!can.viewGuests(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;
  if (!guest) return <p>{t("noResults")}</p>;

  const stays = data.bookings.filter((b) => b.guestId === guest.id);

  return (
    <div className="space-y-6">
      <PageHeader title={guest.name} subtitle={guest.notes || undefined} />
      <section className="raha-card grid gap-4 p-5 sm:grid-cols-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">{t("phone")}</div>
          <div className="font-medium">{guest.phone}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t("email")}</div>
          <div className="font-medium">{guest.email}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t("previousBookings")}</div>
          <div className="font-medium">{stays.length}</div>
        </div>
      </section>
      <section className="raha-card p-5">
        <h2 className="mb-4 font-medium">{t("history")}</h2>
        <div className="space-y-2 text-sm">
          {stays.map((b) => (
            <Link key={b.id} href={`/apartments/${b.apartmentId}`} className="flex flex-wrap justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted">
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
