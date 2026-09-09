import type { ChecklistItem } from "./types";

type Spec = { id: string; en: string; ar: string };

function make(
  zone: string,
  zoneEn: string,
  zoneAr: string,
  specs: Spec[],
): ChecklistItem[] {
  return specs.map((s) => ({
    id: `${zone}.${s.id}`,
    label: s.en,
    labelAr: s.ar,
    passed: null,
    zone,
    zoneLabel: zoneEn,
    zoneLabelAr: zoneAr,
    kind: "check" as const,
  }));
}

export function handoverPath(bookingId: string, kind: "check_in" | "check_out") {
  return `/handover?booking=${encodeURIComponent(bookingId)}&kind=${kind}`;
}

export function generateHandoverChecklist(apt: { bedrooms: number; bathrooms: number }): ChecklistItem[] {
  const beds = Math.max(1, apt.bedrooms);
  const baths = Math.max(1, apt.bathrooms);
  const items: ChecklistItem[] = [];

  items.push(
    ...make("general", "General", "عام", [
      { id: "keys", en: "Keys, fobs, and access cards counted and working", ar: "المفاتيح والبطاقات موجودة وتعمل" },
      { id: "remotes", en: "TV and AC remotes present and working", ar: "ريموتات التلفزيون والمكيف موجودة وتعمل" },
      { id: "lights", en: "All lights work — no burnt bulbs", ar: "كل الإضاءة تعمل — لا لمبات محروقة" },
      { id: "ac", en: "Air conditioning cools/heats and is clean", ar: "المكيف يبرّد/يدفئ وهو نظيف" },
      { id: "windows", en: "Windows and glass clean; open and close properly", ar: "النوافذ والزجاج نظيفة وتفتح وتُغلق بشكل صحيح" },
      { id: "odor", en: "No bad smell in the unit", ar: "لا توجد رائحة كريهة في الشقة" },
      { id: "trash", en: "Trash emptied; bins clean with liner", ar: "القمامة فارغة والسلال نظيفة مع كيس" },
      { id: "floors", en: "Floors vacuumed and mopped — no stains or hair", ar: "الأرضيات مكنسة وممسوحة — بلا بقع أو شعر" },
      { id: "walls", en: "Walls, doors, and switches clean — no marks or holes", ar: "الجدران والأبواب والمفاتيح نظيفة — بلا علامات أو ثقوب" },
      { id: "safety", en: "Smoke detector present; no safety hazards", ar: "كاشف الدخان موجود ولا توجد مخاطر سلامة" },
    ]),
    ...make("entrance", "Entrance", "المدخل", [
      { id: "door", en: "Entry door, lock, and doorbell work", ar: "باب الدخول والقفل والجرس تعمل" },
      { id: "floor", en: "Entrance floor and mat clean", ar: "أرضية المدخل والحصيرة نظيفة" },
      { id: "closet", en: "Coat closet / shoe area empty and wiped", ar: "خزانة المعاطف/الأحذية فارغة وممسوحة" },
      { id: "light", en: "Entrance light and intercom work", ar: "إنارة المدخل والإنتركم تعمل" },
    ]),
    ...make("living", "Living room", "الصالة", [
      { id: "sofa", en: "Sofa and chairs clean — no stains or crumbs", ar: "الكنب والكراسي نظيفة — بلا بقع أو فتات" },
      { id: "tables", en: "Tables and surfaces dusted and wiped", ar: "الطاولات والأسطح بدون غبار وممسوحة" },
      { id: "tv", en: "TV, stand, and cables tidy and working", ar: "التلفزيون والطاولة والأسلاك مرتبة وتعمل" },
      { id: "floor", en: "Living floor / rug clean", ar: "أرضية/سجادة الصالة نظيفة" },
      { id: "curtains", en: "Curtains or blinds clean and working", ar: "الستائر أو الشيش نظيفة وتعمل" },
      { id: "decor", en: "Decor and shelves dusted; nothing broken", ar: "الديكور والرفوف بدون غبار ولا شيء مكسور" },
    ]),
    ...make("kitchen", "Kitchen", "المطبخ", [
      { id: "counters", en: "Counters and backsplash wiped and dry", ar: "الأسطح والجدار خلف الفرن ممسوحة وجافة" },
      { id: "sink", en: "Sink, faucet, and drain clean — no dishes left", ar: "المغسلة والحنفية والمصرف نظيفة — لا صحون متروكة" },
      { id: "stove", en: "Stove and oven clean inside and outside", ar: "الفرن والطباخ نظيفان من الداخل والخارج" },
      { id: "fridge", en: "Fridge clean inside; no old food; shelves wiped", ar: "الثلاجة نظيفة من الداخل بلا طعام قديم والرفوف ممسوحة" },
      { id: "microwave", en: "Microwave clean inside and outside", ar: "المايكروويف نظيف من الداخل والخارج" },
      { id: "cabinets", en: "Kitchen cabinets open, empty of guest food, interiors wiped", ar: "دواليب المطبخ مفتوحة، فارغة من طعام الضيف، والداخل ممسوح" },
      { id: "drawers", en: "Drawers and cutlery clean and complete", ar: "الأدراج والمعالق نظيفة وكاملة" },
      { id: "dishwasher", en: "Dishwasher empty, clean, and odor-free", ar: "غسالة الصحون فارغة ونظيفة بلا رائحة" },
      { id: "floor", en: "Kitchen floor mopped — no grease", ar: "أرضية المطبخ ممسوحة — بلا دهون" },
      { id: "trash", en: "Kitchen trash emptied; under-sink area clean", ar: "قمامة المطبخ فارغة وتحت المغسلة نظيف" },
    ]),
  );

  for (let i = 1; i <= beds; i++) {
    const zone = i === 1 ? "bedroom_master" : `bedroom_${i}`;
    const en = i === 1 ? "Master bedroom" : `Bedroom ${i}`;
    const ar = i === 1 ? "غرفة النوم الرئيسية" : `غرفة النوم ${i}`;
    items.push(
      ...make(zone, en, ar, [
        { id: "bed", en: "Bed made with clean sheets and duvet", ar: "السرير مرتب بملاءات ولحاف نظيفين" },
        { id: "pillows", en: "Pillows and protectors clean, no stains or odor", ar: "الوسائد والحمايات نظيفة بلا بقع أو رائحة" },
        { id: "night", en: "Nightstands, lamps, and outlets clean and working", ar: "الطاولات الجانبية واللمبات والمنافذ نظيفة وتعمل" },
        { id: "closet", en: "Closet interior empty, hangers present, shelves wiped", ar: "داخل الخزانة فارغ، العلاقة موجودة، والرفوف ممسوحة" },
        { id: "floor", en: "Bedroom floor vacuumed — no dust under bed", ar: "أرضية الغرفة مكنسة — لا غبار تحت السرير" },
        { id: "window", en: "Window, glass, and sill clean", ar: "النافذة والزجاج والحافة نظيفة" },
        { id: "mirror", en: "Mirrors and dresser clean", ar: "المرايا والكومودينو نظيفة" },
      ]),
    );
  }

  for (let i = 1; i <= baths; i++) {
    const zone = `bath_${i}`;
    const en = baths === 1 ? "Bathroom" : `Bathroom ${i}`;
    const ar = baths === 1 ? "الحمام" : `الحمام ${i}`;
    items.push(
      ...make(zone, en, ar, [
        { id: "toilet", en: "Toilet clean inside, outside, and around the base", ar: "المرحاض نظيف من الداخل والخارج وحول القاعدة" },
        { id: "shower", en: "Shower / tub clean — no soap film, hair, or mold", ar: "الدش/البطيوة نظيفة — بلا طبقة صابون أو شعر أو عفن" },
        { id: "sink", en: "Sink, faucet, and drain clean and dry", ar: "المغسلة والحنفية والمصرف نظيفة وجافة" },
        { id: "mirror", en: "Mirror and glass clean, no streaks", ar: "المرآة والزجاج نظيفان بلا خطوط" },
        { id: "floor", en: "Bathroom floor dry and mopped", ar: "أرضية الحمام جافة وممسوحة" },
        { id: "cabinets", en: "Bathroom cabinets open and interiors wiped", ar: "دواليب الحمام مفتوحة والداخل ممسوح" },
        { id: "towels", en: "Clean towels hung; used towels removed", ar: "مناشف نظيفة معلّقة وتم سحب المستعملة" },
        { id: "fan", en: "Exhaust fan and lights work", ar: "مروحة الشفط والإضاءة تعمل" },
      ]),
    );
  }

  items.push(
    ...make("storage", "Closets & storage", "الخزانات", [
      { id: "linen", en: "Linen closet tidy; extra linens clean if present", ar: "خزانة المفارش مرتبة والمفارش الإضافية نظيفة إن وُجدت" },
      { id: "open", en: "All closets opened, empty of guest belongings, interiors clean", ar: "كل الخزانات فُتحت، فارغة من أغراض الضيف، والداخل نظيف" },
      { id: "washer", en: "Washer/dryer area clean if present (empty drum, no lint)", ar: "مكان الغسالة/المجفف نظيف إن وُجد (الحوض فارغ بلا وبر)" },
    ]),
  );

  return items;
}

export function handoverZones(list: ChecklistItem[]) {
  const zones: { id: string; en: string; ar: string }[] = [];
  for (const item of list) {
    if (!item.zone || zones.some((z) => z.id === item.zone)) continue;
    zones.push({
      id: item.zone,
      en: item.zoneLabel ?? item.zone,
      ar: item.zoneLabelAr ?? item.zone,
    });
  }
  return zones;
}

export function handoverReady(
  items: ChecklistItem[],
  receiverName: string,
  incomingName: string,
  receiverSignature: string,
  incomingSignature: string,
) {
  const pending = items.filter((i) => i.passed !== true && i.passed !== false);
  const problems = items.filter((i) => i.passed === false);
  const marked = items.filter((i) => i.passed === true || i.passed === false).length;
  const score = items.length ? Math.round((marked / items.length) * 100) : 0;
  if (pending.length) return { ok: false as const, reason: "pending" as const, score, pending, problems };
  if (!receiverName.trim() || !incomingName.trim()) {
    return { ok: false as const, reason: "names" as const, score, pending, problems };
  }
  if (!receiverSignature || !incomingSignature) {
    return { ok: false as const, reason: "sign" as const, score, pending, problems };
  }
  return { ok: true as const, reason: "ok" as const, score, pending, problems };
}
