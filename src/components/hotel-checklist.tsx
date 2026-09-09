"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ChecklistItem, Lang } from "@/lib/types";
import { hotelReady, hotelZones, zoneProgress } from "@/lib/hotel-checklist";
import { cn } from "@/lib/utils";

export function HotelChecklist({
  list,
  bedrooms,
  bathrooms,
  lang,
  labels,
  onChange,
}: {
  list: ChecklistItem[];
  bedrooms: number;
  bathrooms: number;
  lang: Lang;
  labels: {
    done: string;
    problem: string;
    photo: string;
    note: string;
    required: string;
    hotel: string;
    all: string;
  };
  onChange: (next: ChecklistItem[]) => void;
}) {
  const zones = hotelZones({ bedrooms, bathrooms });
  const [zone, setZone] = useState(zones[0]?.id ?? "");
  const [openNote, setOpenNote] = useState<string | null>(null);
  const gate = hotelReady(list);

  const items = useMemo(() => list.filter((i) => i.zone === zone), [list, zone]);
  const sections = useMemo(() => {
    const ids: string[] = [];
    items.forEach((i) => {
      const key = i.sectionAr || i.section || "";
      if (!ids.includes(key)) ids.push(key);
    });
    return ids;
  }, [items]);

  function patch(id: string, update: Partial<ChecklistItem>) {
    onChange(list.map((i) => (i.id === id ? { ...i, ...update } : i)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-[#1b3d34]">{labels.hotel}</span>
        <span className={gate.ok ? "text-emerald-700" : "text-amber-800"}>{gate.score}%</span>
      </div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {zones.map((z) => {
          const p = zoneProgress(list, z.id);
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => setZone(z.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs",
                zone === z.id ? "bg-[#1b3d34] text-[#f3e6c8]" : "bg-muted text-foreground"
              )}
            >
              {z.icon} {lang === "ar" ? z.ar : z.en}
              <span className="ms-1 opacity-70">{p.done}/{p.total}</span>
              {p.problems ? " ❌" : ""}
            </button>
          );
        })}
      </div>

      {sections.map((section) => (
        <div key={section} className="mb-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a7048]">{section}</h3>
          <div className="space-y-2">
            {items.filter((i) => (i.sectionAr || i.section) === section).map((row) => (
              <CheckRow
                key={row.id}
                item={row}
                lang={lang}
                labels={labels}
                noteOpen={openNote === row.id}
                onToggleNote={() => setOpenNote(openNote === row.id ? null : row.id)}
                onPatch={(u) => patch(row.id, u)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckRow({
  item,
  lang,
  labels,
  noteOpen,
  onToggleNote,
  onPatch,
}: {
  item: ChecklistItem;
  lang: Lang;
  labels: { done: string; problem: string; photo: string; note: string; required: string };
  noteOpen: boolean;
  onToggleNote: () => void;
  onPatch: (u: Partial<ChecklistItem>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const title = lang === "ar" ? item.labelAr : item.label;
  const done = item.passed === true || (item.kind === "photo" && !!item.photo);
  const problem = item.passed === false;

  return (
    <div className={cn("rounded-xl border px-3 py-2.5", problem ? "border-rose-300 bg-rose-50" : done ? "border-emerald-200 bg-emerald-50/60" : "border-border bg-card")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug">{title}</p>
        {item.requiredPhoto ? <span className="shrink-0 text-[10px] text-amber-800">{labels.required}</span> : null}
      </div>
      {item.kind === "inventory" ? (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span>{item.actual ?? 0}/{item.expected ?? 0}</span>
          <Input
            className="h-7 w-16"
            type="number"
            value={item.actual ?? 0}
            onChange={(e) => {
              const actual = +e.target.value;
              onPatch({
                actual,
                passed: actual >= (item.expected ?? 1) ? true : item.passed,
              });
            }}
          />
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1">
        <Button
          size="xs"
          variant={done ? "default" : "outline"}
          onClick={() => onPatch({ passed: item.passed === true ? null : true })}
        >
          ☐ {labels.done}
        </Button>
        <Button
          size="xs"
          variant={problem ? "destructive" : "outline"}
          onClick={() => onPatch({ passed: item.passed === false ? null : false })}
        >
          ❌ {labels.problem}
        </Button>
        <Button size="xs" variant={item.photo ? "default" : "outline"} onClick={() => fileRef.current?.click()}>
          <Camera className="size-3" />
          {labels.photo}
        </Button>
        <Button size="xs" variant={item.note ? "secondary" : "outline"} onClick={onToggleNote}>
          <MessageSquare className="size-3" />
          {labels.note}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onPatch({ photo: String(reader.result), passed: true });
            reader.readAsDataURL(file);
          }}
        />
      </div>
      {item.photo ? (
        <img src={item.photo.startsWith("data:") || item.photo.startsWith("http") ? item.photo : ""} alt="" className="mt-2 h-16 w-24 rounded-lg object-cover" />
      ) : null}
      {noteOpen ? (
        <Textarea
          className="mt-2"
          rows={2}
          value={item.note ?? ""}
          onChange={(e) => onPatch({ note: e.target.value })}
          placeholder={labels.note}
        />
      ) : item.note ? (
        <p className="mt-2 text-xs text-muted-foreground">📝 {item.note}</p>
      ) : null}
    </div>
  );
}
