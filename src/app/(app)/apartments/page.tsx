"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AptStatus } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddApartmentDialog, AddBuildingDialog } from "@/components/forms";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { money } from "@/lib/format";
import { aptName, statusLabel } from "@/lib/lookups";
import type { ApartmentStatus } from "@/lib/types";

export default function ApartmentsPage() {
  const { data, user, t, lang } = useStore();
  const [q, setQ] = useState("");
  const [building, setBuilding] = useState("all");
  const [status, setStatus] = useState<"all" | ApartmentStatus>("all");
  const [addApt, setAddApt] = useState(false);
  const [addBld, setAddBld] = useState(false);

  const list = useMemo(() => {
    return data.apartments.filter((a) => {
      const name = aptName(data, a.id).toLowerCase();
      const okQ = !q || name.includes(q.toLowerCase()) || a.number.includes(q);
      const okB = building === "all" || a.buildingId === building;
      const okS = status === "all" || a.status === status;
      return okQ && okB && okS;
    });
  }, [data, q, building, status]);

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title={t("apartments")}
        subtitle={lang === "ar" ? "كل المباني والشقق مربوطة بدورة التشغيل." : "Every building and unit, tied to the operations cycle."}
        action={
          can.addApartment(user.role) ? (
            <>
              <Button variant="outline" onClick={() => setAddBld(true)}>{t("addBuilding")}</Button>
              <Button onClick={() => setAddApt(true)}>
                <Plus className="size-4" />
                {t("addApartment")}
              </Button>
            </>
          ) : null
        }
      />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <Input className="sm:max-w-xs" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
        >
          <option value="all">{t("allBuildings")}</option>
          {data.buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">{t("filterStatus")}</option>
          {(["ready", "booked", "occupied", "cleaning", "inspection", "maintenance", "not_ready"] as const).map((s) => (
            <option key={s} value={s}>{statusLabel(s, t)}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <Link key={a.id} href={`/apartments/${a.id}`} className="raha-card group overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img src={a.photos[0]} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute start-3 top-3">
                <AptStatus status={a.status} label={statusLabel(a.status, t)} />
              </div>
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-medium text-[#1b3d34]">{aptName(data, a.id)}</h3>
                  <p className="text-xs text-muted-foreground">{a.city} · {a.bedrooms} {t("bedrooms")} · {a.bathrooms} {t("bathrooms")}</p>
                </div>
                {can.viewFinancials(user.role) ? (
                  <div className="text-end text-sm font-medium">{money(a.pricing.base, lang)}<span className="block text-xs font-normal text-muted-foreground">/ night</span></div>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 ? <p className="py-16 text-center text-muted-foreground">{t("noResults")}</p> : null}

      <AddApartmentDialog open={addApt} onOpenChange={setAddApt} />
      <AddBuildingDialog open={addBld} onOpenChange={setAddBld} />
    </div>
  );
}
