"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money } from "@/lib/format";
import { aptName, remaining } from "@/lib/lookups";

export default function GuestsPage() {
  const { data, user, t, lang } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    return data.guests.filter((g) => {
      const s = `${g.name} ${g.phone} ${g.email}`.toLowerCase();
      return !q || s.includes(q.toLowerCase());
    });
  }, [data.guests, q]);

  if (!user) return null;
  if (!can.viewGuests(user.role)) {
    return <p className="raha-card p-8">{t("denied")}</p>;
  }

  return (
    <div>
      <PageHeader
        title={t("guests")}
        action={<Button onClick={() => setOpen(true)}>{t("addGuest")}</Button>}
      />
      <Input className="mb-5 max-w-sm" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-hidden raha-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-start font-medium">{t("name")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("phone")}</th>
              <th className="hidden px-4 py-2 text-start font-medium md:table-cell">{t("email")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("apartment")}</th>
              {can.viewFinancials(user.role) ? <th className="px-4 py-2 text-start font-medium">{t("remaining")}</th> : null}
            </tr>
          </thead>
          <tbody>
            {list.map((g) => {
              const latest = [...data.bookings].reverse().find((b) => b.guestId === g.id);
              return (
                <tr key={g.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/guests/${g.id}`} className="font-medium hover:underline">{g.name}</Link>
                  </td>
                  <td className="px-4 py-3">{g.phone}</td>
                  <td className="hidden px-4 py-3 md:table-cell text-muted-foreground">{g.email}</td>
                  <td className="px-4 py-3">{latest ? aptName(data, latest.apartmentId) : "—"}</td>
                  {can.viewFinancials(user.role) ? (
                    <td className="px-4 py-3">{latest ? money(remaining(latest), lang) : "—"}</td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <GuestDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
