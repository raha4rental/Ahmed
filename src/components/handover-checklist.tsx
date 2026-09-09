"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChecklistItem, Lang } from "@/lib/types";
import { handoverReady, handoverZones } from "@/lib/handover-checklist";
import { cn } from "@/lib/utils";

export function HandoverChecklist({
  list,
  lang,
  onChange,
  doneLabel,
  problemLabel,
  noteLabel,
  markAllLabel,
}: {
  list: ChecklistItem[];
  lang: Lang;
  onChange: (next: ChecklistItem[]) => void;
  doneLabel: string;
  problemLabel: string;
  noteLabel: string;
  markAllLabel: string;
}) {
  const zones = handoverZones(list);
  const [zone, setZone] = useState(zones[0]?.id ?? "");
  const [openNote, setOpenNote] = useState<string | null>(null);
  const gate = handoverReady(list, "x", "x", "x", "x");
  const items = useMemo(() => list.filter((i) => i.zone === zone), [list, zone]);

  function patch(id: string, update: Partial<ChecklistItem>) {
    onChange(list.map((i) => (i.id === id ? { ...i, ...update } : i)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-[#1b3d34]">
          {lang === "ar" ? "لائحة النظافة" : "Cleanliness list"}
        </span>
        <span className={gate.score === 100 ? "text-emerald-700" : "text-amber-800"}>{gate.score}%</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mb-3"
        onClick={() => onChange(list.map((i) => ({ ...i, passed: i.passed === false ? false : true })))}
      >
        {markAllLabel}
      </Button>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {zones.map((z) => {
          const inZone = list.filter((i) => i.zone === z.id);
          const done = inZone.filter((i) => i.passed === true).length;
          const problems = inZone.filter((i) => i.passed === false).length;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => setZone(z.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs",
                zone === z.id ? "bg-[#1b3d34] text-[#f3e6c8]" : "bg-muted text-foreground",
              )}
            >
              {lang === "ar" ? z.ar : z.en}
              <span className="ms-1 opacity-70">
                {done}/{inZone.length}
              </span>
              {problems ? " ❌" : ""}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const ok = item.passed === true;
          const bad = item.passed === false;
          return (
            <div key={item.id} className="rounded-2xl border border-border bg-[#fffdf8] p-3">
              <p className="text-sm font-medium">{lang === "ar" ? item.labelAr : item.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={ok ? "default" : "outline"}
                  onClick={() => patch(item.id, { passed: item.passed === true ? null : true })}
                >
                  {doneLabel}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={bad ? "destructive" : "outline"}
                  onClick={() => patch(item.id, { passed: item.passed === false ? null : false })}
                >
                  {problemLabel}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={item.note ? "secondary" : "outline"}
                  onClick={() => setOpenNote(openNote === item.id ? null : item.id)}
                >
                  {noteLabel}
                </Button>
              </div>
              {openNote === item.id ? (
                <Textarea
                  className="mt-2"
                  rows={2}
                  value={item.note ?? ""}
                  onChange={(e) => patch(item.id, { note: e.target.value })}
                  placeholder={noteLabel}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
