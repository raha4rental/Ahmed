import type { Apartment, ChecklistItem } from "./types";

type Kind = NonNullable<ChecklistItem["kind"]>;

type Spec = {
  id: string;
  en: string;
  ar: string;
  kind?: Kind;
  requiredPhoto?: boolean;
  expected?: number;
};

type Section = { id: string; en: string; ar: string; items: Spec[] };

type ZoneDef = {
  id: string;
  en: string;
  ar: string;
  icon: string;
  when?: (apt: { bedrooms: number; bathrooms: number }) => boolean;
  sections: Section[];
};

function item(
  zone: ZoneDef,
  section: Section,
  spec: Spec
): ChecklistItem {
  return {
    id: `${zone.id}.${section.id}.${spec.id}`,
    label: spec.en,
    labelAr: spec.ar,
    passed: null,
    zone: zone.id,
    zoneLabel: zone.en,
    zoneLabelAr: zone.ar,
    section: section.en,
    sectionAr: section.ar,
    kind: spec.kind ?? "check",
    note: "",
    photo: null,
    requiredPhoto: spec.requiredPhoto,
    expected: spec.expected,
    actual: spec.expected,
  };
}

const ENTRANCE: ZoneDef = {
  id: "entrance",
  en: "Entrance",
  ar: "المدخل",
  icon: "🚪",
  sections: [
    {
      id: "main",
      en: "Entry",
      ar: "المدخل",
      items: [
        { id: "door", en: "Clean door inside and outside", ar: "تنظيف الباب من الداخل والخارج" },
        { id: "handle", en: "Clean door handle and lock", ar: "تنظيف مقبض الباب والقفل" },
        { id: "bell", en: "Clean doorbell area", ar: "تنظيف منطقة الجرس" },
        { id: "mirror", en: "Clean mirror if present", ar: "تنظيف المرآة إن وجدت" },
        { id: "dust", en: "Dust corners", ar: "إزالة الغبار من الزوايا" },
        { id: "floor", en: "Clean the floor", ar: "تنظيف الأرضية" },
        { id: "under", en: "Clean under / behind furniture", ar: "تنظيف أسفل/خلف الأثاث" },
        { id: "shoes", en: "Clean shoe cabinet", ar: "تنظيف خزانة الأحذية" },
        { id: "left", en: "No previous guest belongings", ar: "التأكد من عدم وجود أغراض الضيف السابق" },
        { id: "odor", en: "No odors", ar: "التأكد من عدم وجود روائح" },
        { id: "lights", en: "Lighting works", ar: "التأكد أن الإضاءة تعمل" },
        { id: "lock", en: "Door closes and locks correctly", ar: "التأكد من أن الباب يغلق ويقفل بشكل صحيح" },
        { id: "photo", en: "Photo of entrance after prep", ar: "صورة المدخل بعد التجهيز", kind: "photo", requiredPhoto: true },
      ],
    },
  ],
};

const LIVING: ZoneDef = {
  id: "living",
  en: "Living room",
  ar: "الصالة",
  icon: "🛋️",
  sections: [
    {
      id: "surfaces",
      en: "Surfaces",
      ar: "الأسطح",
      items: [
        { id: "coffee", en: "Clean coffee table", ar: "تنظيف طاولة القهوة" },
        { id: "side", en: "Clean side tables", ar: "تنظيف الطاولات الجانبية" },
        { id: "shelves", en: "Clean shelves", ar: "تنظيف الأرفف" },
        { id: "decor", en: "Clean décor", ar: "تنظيف الديكورات" },
        { id: "dust", en: "Dust all surfaces", ar: "إزالة الغبار من جميع الأسطح" },
        { id: "switches", en: "Clean light switches", ar: "تنظيف مفاتيح الكهرباء" },
        { id: "handles", en: "Clean door handles", ar: "تنظيف مقابض الأبواب" },
      ],
    },
    {
      id: "sofa",
      en: "Sofa",
      ar: "الكنبة",
      items: [
        { id: "stains", en: "Inspect sofas for stains — any visible stain = problem", ar: "فحص جميع الكنبات للبقع — أي بقعة واضحة = مشكلة" },
        { id: "vac", en: "Vacuum sofas", ar: "تنظيف الكنبات بالمكنسة" },
        { id: "cushions", en: "Clean between cushions", ar: "تنظيف بين الوسائد" },
        { id: "under", en: "Clean under sofa", ar: "تنظيف أسفل الكنبة" },
        { id: "pillows", en: "Clean throw pillows", ar: "تنظيف الوسائد" },
        { id: "arrange", en: "Arrange pillows hotel-style", ar: "ترتيب الوسائد" },
        { id: "hair", en: "No hair", ar: "التأكد من عدم وجود شعر" },
        { id: "odor", en: "No odors", ar: "التأكد من عدم وجود روائح" },
      ],
    },
    {
      id: "tv",
      en: "TV",
      ar: "التلفزيون",
      items: [
        { id: "screen", en: "Clean screen", ar: "تنظيف الشاشة" },
        { id: "remote", en: "Clean remote", ar: "تنظيف الريموت" },
        { id: "present", en: "Remote is present", ar: "التأكد من وجود الريموت" },
        { id: "works", en: "TV works", ar: "التأكد أن التلفزيون يعمل" },
        { id: "batteries", en: "Batteries OK", ar: "التأكد من البطاريات" },
      ],
    },
    {
      id: "floor",
      en: "Floor",
      ar: "الأرضية",
      items: [
        { id: "vac", en: "Vacuum", ar: "مكنسة — Vacuum" },
        { id: "mop", en: "Mop", ar: "مسح — Mop" },
        { id: "corners", en: "Clean corners", ar: "تنظيف الزوايا" },
        { id: "under", en: "Clean under furniture", ar: "تنظيف تحت الأثاث" },
        { id: "hair", en: "Remove hair", ar: "إزالة الشعر" },
        { id: "stains", en: "Remove stains", ar: "إزالة البقع" },
        { id: "photo", en: "Photo of living room after finish", ar: "صورة الصالة بعد الانتهاء", kind: "photo", requiredPhoto: true },
      ],
    },
  ],
};

function bedroom(id: string, en: string, ar: string, when: ZoneDef["when"]): ZoneDef {
  return {
    id,
    en,
    ar,
    icon: "🛏️",
    when,
    sections: [
      {
        id: "bed",
        en: "Bed",
        ar: "السرير",
        items: [
          { id: "strip", en: "Remove all previous linens", ar: "إزالة جميع المفروشات السابقة" },
          { id: "mattress", en: "Inspect mattress", ar: "فحص المرتبة" },
          { id: "protector", en: "Inspect mattress protector", ar: "فحص واقي المرتبة" },
          { id: "stains", en: "No stains", ar: "التأكد من عدم وجود بقع" },
          { id: "hair", en: "No hair", ar: "التأكد من عدم وجود شعر" },
          { id: "odor", en: "No odors", ar: "التأكد من عدم وجود روائح" },
          { id: "sheet", en: "Fit clean sheet", ar: "تركيب ملاءة نظيفة" },
          { id: "duvet", en: "Fit clean duvet cover", ar: "تركيب غطاء لحاف نظيف" },
          { id: "cases", en: "Fit clean pillowcases", ar: "تركيب أغطية مخدات نظيفة" },
          { id: "make", en: "Make the bed hotel-style", ar: "ترتيب السرير بطريقة فندقية" },
          { id: "pillows", en: "Inspect all pillows", ar: "فحص جميع المخدات" },
        ],
      },
      {
        id: "frame",
        en: "Frame",
        ar: "السرير والإطار",
        items: [
          { id: "head", en: "Clean headboard", ar: "تنظيف رأس السرير" },
          { id: "frame", en: "Clean bed frame", ar: "تنظيف إطار السرير" },
          { id: "under", en: "Clean under the bed", ar: "تنظيف أسفل السرير" },
          { id: "behind", en: "Clean behind the bed if possible", ar: "تنظيف خلف السرير إذا أمكن" },
          { id: "stable", en: "Bed is stable", ar: "التأكد من ثبات السرير" },
        ],
      },
      {
        id: "tables",
        en: "Tables & lights",
        ar: "الطاولات",
        items: [
          { id: "nights", en: "Clean nightstands", ar: "تنظيف الطاولات الجانبية" },
          { id: "lamps", en: "Clean lamps", ar: "تنظيف المصابيح" },
          { id: "work", en: "Lamps work", ar: "التأكد من عمل المصابيح" },
          { id: "personal", en: "Remove any personal items", ar: "إزالة أي أغراض شخصية" },
        ],
      },
      {
        id: "closet",
        en: "Closet",
        ar: "الخزانة",
        items: [
          { id: "empty", en: "Empty closet", ar: "إفراغها" },
          { id: "shelves", en: "Clean shelves", ar: "تنظيف الرفوف" },
          { id: "drawers", en: "Clean drawers", ar: "تنظيف الأدراج" },
          { id: "inside", en: "Clean interior", ar: "تنظيف الداخل" },
          { id: "handles", en: "Clean handles", ar: "تنظيف المقابض" },
          { id: "left", en: "No leftover items", ar: "التأكد من عدم وجود أغراض متروكة" },
        ],
      },
      {
        id: "floor",
        en: "Floor & windows",
        ar: "الأرضية والنوافذ",
        items: [
          { id: "vac", en: "Vacuum", ar: "مكنسة — Vacuum" },
          { id: "mop", en: "Mop according to floor type", ar: "مسح حسب نوع الأرضية" },
          { id: "corners", en: "Clean corners", ar: "تنظيف الزوايا" },
          { id: "under", en: "Clean under furniture", ar: "تنظيف تحت الأثاث" },
          { id: "glass", en: "Clean window glass", ar: "تنظيف الزجاج" },
          { id: "frame", en: "Clean window frame", ar: "تنظيف الإطار" },
          { id: "edges", en: "Clean window edges", ar: "تنظيف حواف النوافذ" },
          { id: "blinds", en: "Clean curtains / blinds", ar: "تنظيف الستائر / الستائر المعدنية" },
          { id: "prints", en: "No fingerprints", ar: "التأكد من عدم وجود بصمات" },
          { id: "mirror", en: "Clean mirrors", ar: "تنظيف المرايا" },
          { id: "door", en: "Clean door and handles", ar: "تنظيف الباب والمقابض" },
        ],
      },
    ],
  };
}

function bathroom(id: string, en: string, ar: string, when: ZoneDef["when"]): ZoneDef {
  return {
    id,
    en,
    ar,
    icon: "🚿",
    when,
    sections: [
      {
        id: "shower",
        en: "Shower",
        ar: "الدش",
        items: [
          { id: "floor", en: "Clean shower floor", ar: "تنظيف أرضية الدش" },
          { id: "walls", en: "Clean shower walls", ar: "تنظيف جدران الدش" },
          { id: "glass", en: "Clean glass", ar: "تنظيف الزجاج" },
          { id: "limescale", en: "Remove limescale", ar: "إزالة التكلسات" },
          { id: "head", en: "Clean shower head", ar: "تنظيف رأس الدش" },
          { id: "mixer", en: "Clean mixer", ar: "تنظيف الخلاط" },
          { id: "shelves", en: "Clean shelves", ar: "تنظيف الرفوف" },
          { id: "hair", en: "Remove hair", ar: "إزالة الشعر" },
          { id: "soap", en: "Remove soap residue", ar: "إزالة بقايا الصابون" },
          { id: "drain", en: "Water drains correctly", ar: "التأكد من تصريف الماء" },
        ],
      },
      {
        id: "toilet",
        en: "Toilet",
        ar: "المرحاض",
        items: [
          { id: "in", en: "Clean inside toilet", ar: "تنظيف داخل المرحاض" },
          { id: "rim", en: "Clean toilet rim", ar: "تنظيف حافة المرحاض" },
          { id: "lid", en: "Clean lid", ar: "تنظيف الغطاء" },
          { id: "out", en: "Clean exterior", ar: "تنظيف الخارج" },
          { id: "base", en: "Clean toilet base", ar: "تنظيف قاعدة المرحاض" },
          { id: "behind", en: "Clean behind toilet", ar: "تنظيف خلف المرحاض" },
          { id: "flush", en: "Clean flush button", ar: "تنظيف زر السيفون" },
          { id: "odor", en: "No odor", ar: "التأكد من عدم وجود رائحة" },
        ],
      },
      {
        id: "sink",
        en: "Sink & mirror",
        ar: "المغسلة والمرآة",
        items: [
          { id: "basin", en: "Clean basin", ar: "تنظيف الحوض" },
          { id: "mixer", en: "Clean mixer", ar: "تنظيف الخلاط" },
          { id: "scale", en: "Remove limescale", ar: "إزالة التكلسات" },
          { id: "top", en: "Clean sink surface", ar: "تنظيف سطح المغسلة" },
          { id: "cabinet", en: "Clean cabinet", ar: "تنظيف الخزانة" },
          { id: "drawers", en: "Clean drawers", ar: "تنظيف الأدراج" },
          { id: "mirror", en: "Clean mirror", ar: "تنظيف المرآة" },
          { id: "prints", en: "Remove fingerprints", ar: "إزالة البصمات" },
          { id: "streaks", en: "No cleaning streaks", ar: "إزالة خطوط التنظيف" },
        ],
      },
      {
        id: "floor",
        en: "Floor",
        ar: "الأرضية",
        items: [
          { id: "hair", en: "Remove hair", ar: "إزالة الشعر" },
          { id: "floor", en: "Clean floor", ar: "تنظيف الأرضية" },
          { id: "sanitize", en: "Sanitize for surface type", ar: "تعقيم حسب مادة السطح" },
          { id: "corners", en: "Clean corners", ar: "تنظيف الزوايا" },
        ],
      },
      {
        id: "supplies",
        en: "Supplies",
        ar: "المستلزمات",
        items: [
          { id: "soap", en: "Hand soap", ar: "صابون يدين — Hand Soap", kind: "inventory", expected: 1 },
          { id: "shampoo", en: "Shampoo", ar: "شامبو — Shampoo", kind: "inventory", expected: 1 },
          { id: "body", en: "Body wash", ar: "غسول جسم — Body Wash", kind: "inventory", expected: 1 },
          { id: "cond", en: "Conditioner if standard", ar: "بلسم إذا معتمد — Conditioner", kind: "inventory", expected: 1 },
          { id: "tp", en: "Toilet paper", ar: "ورق حمام — Toilet Paper", kind: "inventory", expected: 2 },
          { id: "bags", en: "Trash bags", ar: "أكياس قمامة — Trash Bags", kind: "inventory", expected: 2 },
          { id: "towels", en: "Towels", ar: "مناشف — Towels", kind: "inventory", expected: 4 },
          { id: "mat", en: "Bath mat", ar: "سجادة حمام — Bath Mat", kind: "inventory", expected: 1 },
          { id: "photo", en: "Photo of bathroom after prep", ar: "صورة الحمام بعد التجهيز", kind: "photo", requiredPhoto: true },
        ],
      },
    ],
  };
}

const KITCHEN: ZoneDef = {
  id: "kitchen",
  en: "Kitchen",
  ar: "المطبخ",
  icon: "🍳",
  sections: [
    {
      id: "counters",
      en: "Counters",
      ar: "الرخام والأسطح",
      items: [
        { id: "stone", en: "Clean and sanitize countertops", ar: "تنظيف وتعقيم الرخام" },
        { id: "grease", en: "Remove grease", ar: "إزالة الدهون" },
        { id: "behind", en: "Clean behind appliances", ar: "تنظيف خلف الأجهزة" },
        { id: "edges", en: "Clean edges", ar: "تنظيف الحواف" },
        { id: "table", en: "Clean table", ar: "تنظيف الطاولة" },
        { id: "chairs", en: "Clean chairs", ar: "تنظيف الكراسي" },
        { id: "handles", en: "Clean cabinet handles", ar: "تنظيف مقابض الخزائن" },
      ],
    },
    {
      id: "sink",
      en: "Sink",
      ar: "الحوض",
      items: [
        { id: "basin", en: "Clean sink", ar: "تنظيف الحوض" },
        { id: "mixer", en: "Clean mixer", ar: "تنظيف الخلاط" },
        { id: "scale", en: "Remove limescale", ar: "إزالة التكلسات" },
        { id: "drain", en: "Clean drain", ar: "تنظيف فتحة الصرف" },
        { id: "odor", en: "No odor", ar: "التأكد من عدم وجود رائحة" },
        { id: "around", en: "Clean around the sink", ar: "تنظيف منطقة حول الحوض" },
      ],
    },
    {
      id: "fridge",
      en: "Fridge",
      ar: "الثلاجة",
      items: [
        { id: "empty", en: "Remove all previous guest food", ar: "إخراج جميع أغراض الضيف السابق" },
        { id: "shelves", en: "Clean shelves", ar: "تنظيف الرفوف" },
        { id: "drawers", en: "Clean drawers", ar: "تنظيف الأدراج" },
        { id: "sides", en: "Clean interior sides", ar: "تنظيف الجوانب الداخلية" },
        { id: "door", en: "Clean door", ar: "تنظيف الباب" },
        { id: "out", en: "Clean exterior", ar: "تنظيف الخارج" },
        { id: "odor", en: "No odors", ar: "التأكد من عدم وجود روائح" },
      ],
    },
    {
      id: "oven",
      en: "Oven & microwave",
      ar: "الفرن والميكروويف",
      items: [
        { id: "top", en: "Clean oven top", ar: "تنظيف سطح الفرن" },
        { id: "burners", en: "Clean burners", ar: "تنظيف العيون" },
        { id: "racks", en: "Clean racks", ar: "تنظيف الشبكات" },
        { id: "inside", en: "Clean oven interior", ar: "تنظيف داخل الفرن" },
        { id: "door", en: "Clean oven door", ar: "تنظيف الباب" },
        { id: "grease", en: "Remove grease", ar: "إزالة الدهون" },
        { id: "mw-in", en: "Clean microwave interior", ar: "تنظيف داخل الميكروويف" },
        { id: "mw-plate", en: "Clean microwave plate", ar: "تنظيف صحن الميكروويف" },
        { id: "mw-door", en: "Clean microwave door", ar: "تنظيف باب الميكروويف" },
        { id: "mw-out", en: "Clean microwave exterior", ar: "تنظيف خارج الميكروويف" },
        { id: "mw-odor", en: "No microwave odor", ar: "التأكد من عدم وجود رائحة في الميكروويف" },
      ],
    },
    {
      id: "dw",
      en: "Dishwasher",
      ar: "غسالة الصحون",
      items: [
        { id: "empty", en: "Dishwasher is empty", ar: "التأكد أنها فارغة" },
        { id: "filter", en: "Clean filter", ar: "تنظيف الفلتر" },
        { id: "in", en: "Clean interior", ar: "تنظيف الداخل" },
        { id: "door", en: "Clean door", ar: "تنظيف الباب" },
        { id: "works", en: "It works", ar: "التأكد أنها تعمل" },
      ],
    },
  ],
};

const INVENTORY: ZoneDef = {
  id: "kitchen_inventory",
  en: "Kitchen inventory",
  ar: "تجهيز أدوات المطبخ",
  icon: "🍽️",
  sections: [
    {
      id: "table",
      en: "Tableware",
      ar: "أدوات الطعام",
      items: [
        { id: "lplates", en: "Large plates", ar: "صحون كبيرة", kind: "inventory", expected: 8 },
        { id: "splates", en: "Small plates", ar: "صحون صغيرة", kind: "inventory", expected: 8 },
        { id: "bowls", en: "Bowls", ar: "أطباق عميقة", kind: "inventory", expected: 8 },
        { id: "cups", en: "Cups", ar: "أكواب", kind: "inventory", expected: 8 },
        { id: "coffee", en: "Coffee cups", ar: "أكواب قهوة", kind: "inventory", expected: 6 },
        { id: "glasses", en: "Water glasses", ar: "كاسات ماء", kind: "inventory", expected: 8 },
        { id: "forks", en: "Forks", ar: "شوك", kind: "inventory", expected: 8 },
        { id: "knives", en: "Knives", ar: "سكاكين طعام", kind: "inventory", expected: 8 },
        { id: "spoons", en: "Spoons", ar: "ملاعق", kind: "inventory", expected: 8 },
        { id: "tea", en: "Teaspoons", ar: "ملاعق شاي", kind: "inventory", expected: 8 },
      ],
    },
    {
      id: "cook",
      en: "Cooking",
      ar: "الطبخ",
      items: [
        { id: "pots", en: "Pots", ar: "قدور", kind: "inventory", expected: 3 },
        { id: "pans", en: "Pans", ar: "مقالي", kind: "inventory", expected: 2 },
        { id: "tray", en: "Baking tray", ar: "صينية فرن", kind: "inventory", expected: 1 },
        { id: "board", en: "Cutting board", ar: "لوح تقطيع", kind: "inventory", expected: 1 },
        { id: "cknives", en: "Kitchen knives", ar: "سكاكين طبخ", kind: "inventory", expected: 3 },
        { id: "utensils", en: "Cooking utensils", ar: "أدوات طبخ", kind: "inventory", expected: 5 },
        { id: "spatula", en: "Spatula", ar: "ملعقة تقليب", kind: "inventory", expected: 1 },
        { id: "tongs", en: "Tongs", ar: "ملقط", kind: "inventory", expected: 1 },
        { id: "ladle", en: "Ladle", ar: "مغرفة", kind: "inventory", expected: 1 },
        { id: "whisk", en: "Whisk", ar: "مخفقة", kind: "inventory", expected: 1 },
        { id: "can", en: "Can opener", ar: "فتاحة علب", kind: "inventory", expected: 1 },
        { id: "bottle", en: "Bottle opener", ar: "فتاحة زجاج", kind: "inventory", expected: 1 },
      ],
    },
    {
      id: "appliances",
      en: "Appliances",
      ar: "الأجهزة",
      items: [
        { id: "coffee", en: "Coffee maker works", ar: "ماكينة القهوة تعمل" },
        { id: "kettle", en: "Kettle works", ar: "الغلاية تعمل" },
        { id: "toaster", en: "Toaster works", ar: "التوستر يعمل" },
        { id: "mw", en: "Microwave works", ar: "الميكروويف يعمل" },
        { id: "oven", en: "Oven works", ar: "الفرن يعمل" },
        { id: "dw", en: "Dishwasher works", ar: "غسالة الصحون تعمل" },
      ],
    },
  ],
};

const ZONES: ZoneDef[] = [
  ENTRANCE,
  LIVING,
  bedroom("bedroom_master", "Master bedroom", "غرفة النوم الرئيسية", (a) => a.bedrooms >= 1),
  bedroom("bedroom_2", "Second bedroom", "غرفة النوم الثانية", (a) => a.bedrooms >= 2),
  bedroom("bedroom_3", "Third bedroom", "غرفة النوم الثالثة", (a) => a.bedrooms >= 3),
  bathroom("bath_1", "Bathroom 1", "الحمام الأول", (a) => a.bathrooms >= 1),
  bathroom("bath_2", "Bathroom 2", "الحمام الثاني", (a) => a.bathrooms >= 2),
  KITCHEN,
  INVENTORY,
];

export function generateHotelChecklist(apt: Pick<Apartment, "bedrooms" | "bathrooms">): ChecklistItem[] {
  return ZONES.filter((z) => !z.when || z.when(apt)).flatMap((z) =>
    z.sections.flatMap((s) => s.items.map((spec) => item(z, s, spec)))
  );
}

export function hotelZones(apt: Pick<Apartment, "bedrooms" | "bathrooms">) {
  return ZONES.filter((z) => !z.when || z.when(apt)).map((z) => ({
    id: z.id,
    en: z.en,
    ar: z.ar,
    icon: z.icon,
  }));
}

export function isHotelChecklist(list: ChecklistItem[]) {
  return list.length >= 40 && list.some((i) => i.zone);
}

export function hotelReady(list: ChecklistItem[]) {
  const problems = list.filter((i) => i.passed === false);
  const pending = list.filter((i) => {
    if (i.kind === "photo") return false;
    return i.passed !== true;
  });
  const photosMissing = list.filter((i) => i.requiredPhoto && !i.photo);
  const score = list.length
    ? Math.round(
        (list.filter((i) =>
          i.kind === "photo" ? Boolean(i.photo) : i.passed === true
        ).length /
          list.length) *
          100
      )
    : 0;
  if (problems.length) return { ok: false, reason: "failed" as const, score, problems, pending, photosMissing };
  if (photosMissing.length) return { ok: false, reason: "photos" as const, score, problems, pending, photosMissing };
  if (pending.length) return { ok: false, reason: "pending" as const, score, problems, pending, photosMissing };
  return { ok: true, reason: "ok" as const, score, problems, pending, photosMissing };
}

export function ensureHotelChecklist(
  list: ChecklistItem[],
  apt: Pick<Apartment, "bedrooms" | "bathrooms">
): ChecklistItem[] {
  if (isHotelChecklist(list)) return list;
  const next = generateHotelChecklist(apt);
  const failKitchen = list.some((i) => i.id === "kitchen" && i.passed === false);
  if (failKitchen) {
    return next.map((i) =>
      i.id.includes("kitchen.") && i.section === "Counters" && i.id.endsWith("stone")
        ? { ...i, passed: false, note: "Kitchen not restocked / not hotel standard" }
        : i
    );
  }
  if (list.length && list.every((i) => i.passed === true)) {
    return next.map((i) => ({
      ...i,
      passed: i.kind === "photo" ? true : true,
      photo: i.requiredPhoto ? "seed://ready" : i.photo,
    }));
  }
  return next;
}

export function zoneProgress(list: ChecklistItem[], zoneId: string) {
  const items = list.filter((i) => i.zone === zoneId);
  const done = items.filter((i) => (i.kind === "photo" ? Boolean(i.photo) : i.passed === true)).length;
  const problems = items.filter((i) => i.passed === false).length;
  return { total: items.length, done, problems };
}
