"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HandoverChecklist } from "@/components/handover-checklist";
import { SignaturePad } from "@/components/signature-pad";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import { TODAY, uid } from "@/lib/format";
import { aptName } from "@/lib/lookups";
import { generateHandoverChecklist, handoverReady } from "@/lib/handover-checklist";
import type { HandoverKind, HandoverRecord } from "@/lib/types";

export default function HandoverPage() {
  return (
    <Suspense fallback={<p className="raha-card p-8">…</p>}>
      <HandoverInner />
    </Suspense>
  );
}

function HandoverInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { data, user, t, lang, upsertHandover, completeHandover } = useStore();
  const bookingId = params.get("booking") ?? "";
  const kind = (params.get("kind") === "check_out" ? "check_out" : "check_in") as HandoverKind;

  const bk = data.bookings.find((b) => b.id === bookingId);
  const apt = data.apartments.find((a) => a.id === bk?.apartmentId);
  const guest = data.guests.find((g) => g.id === bk?.guestId);
  const existing = data.handovers.find((h) => h.bookingId === bookingId && h.kind === kind);

  const blank = useMemo<HandoverRecord | null>(() => {
    if (!bk || !apt || !guest) return null;
    return {
      id: uid("ho"),
      kind,
      bookingId: bk.id,
      apartmentId: apt.id,
      guestId: guest.id,
      date: TODAY,
      time: kind === "check_in" ? bk.checkInTime : "11:00 AM",
      items: generateHandoverChecklist(apt),
      receiverName: guest.name,
      incomingName: guest.name,
      receiverSignature: "",
      incomingSignature: "",
      extraCharge: 0,
      hasDamage: false,
      hasMissing: false,
      notes: "",
      completed: false,
    };
  }, [bk, apt, guest, kind]);

  const [draft, setDraft] = useState<HandoverRecord | null>(null);

  useEffect(() => {
    setDraft((prev) => {
      if (prev && prev.bookingId === bookingId && prev.kind === kind) return prev;
      return existing ?? blank;
    });
  }, [bookingId, kind, existing, blank]);

  if (!user) return null;
  if (!can.checkInOut(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;
  if (!bk || !apt || !guest || !draft) {
    return <p className="raha-card p-8">{t("noResults")}</p>;
  }

  const gate = handoverReady(
    draft.items,
    draft.receiverName,
    draft.incomingName,
    draft.receiverSignature,
    draft.incomingSignature,
  );
  const title = kind === "check_in" ? t("handoverIn") : t("handoverOut");

  function patch(update: Partial<HandoverRecord>) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...update };
      upsertHandover(next);
      return next;
    });
  }

  function finish() {
    if (!draft) return;
    const res = completeHandover(draft);
    if (!res.ok) {
      if (res.reason === "pending") toast.error(t("markAllItems"));
      else if (res.reason === "names") toast.error(t("needNames"));
      else if (res.reason === "sign") toast.error(t("mustSign"));
      else toast.error(t("denied"));
      return;
    }
    toast.success(t("handoverDone"));
    router.push("/operations");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        subtitle={`${aptName(data, apt.id)} · ${guest.name}`}
      />

      <section className="raha-card overflow-hidden">
        <div className="flex gap-2 overflow-x-auto p-3">
          {apt.photos.map((src) => (
            <img key={src} src={src} alt="" className="h-36 w-52 shrink-0 rounded-2xl object-cover" />
          ))}
        </div>
        <div className="space-y-1 border-t border-border px-4 py-3 text-sm">
          <div className="font-medium">{aptName(data, apt.id)}</div>
          <div className="text-muted-foreground">
            {apt.bedrooms} {t("bedrooms")} · {apt.bathrooms} {t("bathrooms")}
          </div>
          <div>
            {t("guest")}: {guest.name} · {guest.phone}
          </div>
          <div>
            {kind === "check_in" ? t("checkIn") : t("checkOut")}: {kind === "check_in" ? `${bk.checkIn} · ${bk.checkInTime}` : bk.checkOut}
          </div>
        </div>
      </section>

      {draft.completed ? (
        <p className="raha-card p-5 text-sm text-emerald-800">{t("handoverDone")}</p>
      ) : (
        <>
          <section className="raha-card p-4">
            <HandoverChecklist
              list={draft.items}
              lang={lang}
              doneLabel={t("itemClean")}
              problemLabel={t("itemProblem")}
              noteLabel={t("itemNote")}
              markAllLabel={t("markAllClean")}
              onChange={(items) => patch({ items, hasDamage: items.some((i) => i.passed === false) })}
            />
          </section>

          <section className="raha-card space-y-3 p-4">
            <p className="text-sm text-[#1b3d34]">{t("confirmClean")}</p>
            <div className="grid gap-3">
              <div>
                <Label>{t("receiverName")}</Label>
                <Input className="mt-1.5" value={draft.receiverName} onChange={(e) => patch({ receiverName: e.target.value })} />
              </div>
              <SignaturePad
                label={`${t("receiver")} — ${t("signHere")}`}
                clearLabel={t("clearSign")}
                value={draft.receiverSignature}
                onChange={(receiverSignature) => patch({ receiverSignature })}
              />
              <div>
                <Label>{t("incomingName")}</Label>
                <Input className="mt-1.5" value={draft.incomingName} onChange={(e) => patch({ incomingName: e.target.value })} />
              </div>
              <SignaturePad
                label={`${t("incoming")} — ${t("signHere")}`}
                clearLabel={t("clearSign")}
                value={draft.incomingSignature}
                onChange={(incomingSignature) => patch({ incomingSignature })}
              />
              <div>
                <Label>{t("notes")}</Label>
                <Textarea className="mt-1.5" rows={2} value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("handoverProgress")}: {gate.score}%
            </p>
            <Button className="w-full" onClick={finish}>
              {title}
            </Button>
            <Link href={`/apartments/${apt.id}`} className="block text-center text-xs text-[#8a7048]">
              {t("seeApartment")}
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
