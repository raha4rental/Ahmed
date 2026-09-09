"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IdCard } from "lucide-react";
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
      const s = `${g.name} ${g.phone} ${g.address}`.toLowerCase();
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
      <Input className="mb-5" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 ? (
        <p className="raha-card p-8 text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="grid gap-3">
          {list.map((g) => {
            const latest = [...data.bookings].reverse().find((b) => b.guestId === g.id);
            return (
              <Link key={g.id} href={`/guests/${g.id}`} className="raha-card flex items-center gap-3 p-3">
                {g.idPhoto ? (
                  <img src={g.idPhoto} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-[#ece4d4] text-[#1b3d34]">
                    <IdCard className="size-7" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{g.name}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{g.phone || "—"}</span>
                  {g.address ? (
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">{g.address}</span>
                  ) : null}
                  <span className="mt-1 block text-xs text-[#8a7048]">
                    {latest ? aptName(data, latest.apartmentId) : "—"}
                    {can.viewFinancials(user.role) && latest
                      ? ` · ${t("remaining")} ${money(remaining(latest), lang)}`
                      : ""}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
      <GuestDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
