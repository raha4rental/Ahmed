"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { pickImage } from "@/lib/native";

export const MAX_APARTMENT_PHOTOS = 10;

export function ApartmentPhotoPicker({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useStore();
  const [busy, setBusy] = useState(false);
  const left = MAX_APARTMENT_PHOTOS - photos.length;

  async function addPhoto() {
    if (left <= 0) {
      toast.error(t("maxPhotos"));
      return;
    }
    setBusy(true);
    try {
      const src = await pickImage(1200);
      if (!src) return;
      onChange([...photos, src]);
    } catch {
      toast.error(t("addPhotos"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{t("photos")}</span>
        <span className="text-xs text-muted-foreground">
          {photos.length}/{MAX_APARTMENT_PHOTOS} · {t("photosHint")}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <div key={`${i}-${src.slice(0, 24)}`} className="relative aspect-square overflow-hidden rounded-2xl bg-[#ece4d4]">
            <img src={src} alt="" className="size-full object-cover" />
            <button
              type="button"
              className="absolute end-1 top-1 flex size-7 items-center justify-center rounded-full bg-[#14241f]/80 text-white"
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
              aria-label={t("removePhoto")}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {left > 0 ? (
          <button
            type="button"
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[#c4a574] bg-[#fffdf8] text-[#1b3d34]"
            onClick={() => void addPhoto()}
          >
            <Camera className="size-6" />
            <span className="px-1 text-[11px] leading-tight">{t("addPhotos")}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
