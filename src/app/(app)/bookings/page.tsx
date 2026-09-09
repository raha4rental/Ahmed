"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { BookingDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { fmtDateTime, money, TODAY } from "@/lib/format";
import { aptName, guestName, remaining } from "@/lib/lookups";
import { handoverPath } from "@/lib/handover-checklist";
import { apartmentPath, guestPath } from "@/lib/paths";

export default function BookingsPage() {
  const { data, user, t, lang } = useStore();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  if (!can.viewBookings(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  const rows = [...data.bookings].sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <div>
      <PageHeader
        title={t("bookings")}
        subtitle={lang === "ar" ? "من الحجز إلى الدخول والخروج — كل شيء مربوط بالشقة." : "From booking to check-out — every stay is tied to a unit."}
        action={can.checkInOut(user.role) ? <Button onClick={() => setOpen(true)}>{t("createBooking")}</Button> : null}
      />
      <div className="overflow-x-auto raha-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-start font-medium">{t("guest")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("apartment")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("checkIn")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("checkOut")}</th>
              {can.viewFinancials(user.role) ? (
                <>
                  <th className="px-4 py-2 text-start font-medium">{t("bookingTotal")}</th>
                  <th className="px-4 py-2 text-start font-medium">{t("remaining")}</th>
                </>
              ) : null}
              <th className="px-4 py-2 text-start font-medium">{t("status")}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={guestPath(b.guestId)} className="font-medium hover:underline">{guestName(data, b.guestId)}</Link>
                  {b.checkIn === TODAY && b.status === "booked" ? (
                    <div className="text-xs text-sky-700">{t("checkinsToday")}</div>
                  ) : null}
                  {b.checkOut === TODAY && b.status === "checked_in" ? (
                    <div className="text-xs text-amber-700">{t("checkoutsToday")}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Link href={apartmentPath(b.apartmentId)} className="hover:underline">{aptName(data, b.apartmentId)}</Link>
                </td>
                <td className="px-4 py-3">{fmtDateTime(b.checkIn, b.checkInTime, lang)}</td>
                <td className="px-4 py-3">{b.checkOut}</td>
                {can.viewFinancials(user.role) ? (
                  <>
                    <td className="px-4 py-3">{money(b.totalAmount, lang)}</td>
                    <td className="px-4 py-3">{money(remaining(b), lang)}</td>
                  </>
                ) : null}
                <td className="px-4 py-3">{b.status}</td>
                <td className="px-4 py-3 text-end">
                  {b.status === "booked" && can.checkInOut(user.role) ? (
                    <Link href={handoverPath(b.id, "check_in")} className={buttonVariants({ size: "sm" })}>
                      {t("handoverIn")}
                    </Link>
                  ) : null}
                  {b.status === "checked_in" && can.checkInOut(user.role) ? (
                    <Link href={handoverPath(b.id, "check_out")} className={buttonVariants({ size: "sm", variant: "secondary" })}>
                      {t("handoverOut")}
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BookingDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
