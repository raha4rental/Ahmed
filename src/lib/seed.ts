import type {
  AppData,
  Apartment,
  ApartmentStatus,
  Booking,
  Expense,
  ExpenseCategory,
  Guest,
  InventoryItem,
  MaintenanceRequest,
  OpsTask,
  UtilityBill,
  UtilityStatus,
  ChecklistItem,
} from "./types";
import { generateHotelChecklist } from "./hotel-checklist";
import { TODAY } from "./format";

const PHOTOS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1536376071173-4e8745993684?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1484154216822-d1d449c65413?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80",
];

const UNITS: Array<{
  buildingId: string;
  number: string;
  beds: number;
  baths: number;
  status: ApartmentStatus;
}> = [
  { buildingId: "b-aster", number: "101", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-aster", number: "205", beds: 2, baths: 2, status: "ready" },
  { buildingId: "b-aster", number: "302", beds: 1, baths: 1, status: "occupied" },
  { buildingId: "b-aster", number: "405", beds: 2, baths: 2, status: "cleaning" },
  { buildingId: "b-aster", number: "508", beds: 2, baths: 1, status: "ready" },
  { buildingId: "b-aster", number: "610", beds: 3, baths: 2, status: "booked" },
  { buildingId: "b-aster", number: "702", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-aster", number: "805", beds: 2, baths: 2, status: "ready" },
  { buildingId: "b-aster", number: "901", beds: 2, baths: 2, status: "occupied" },
  { buildingId: "b-aster", number: "1003", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-aster", number: "1102", beds: 3, baths: 2, status: "maintenance" },
  { buildingId: "b-aster", number: "1204", beds: 2, baths: 2, status: "ready" },
  { buildingId: "b-vantage", number: "110", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-vantage", number: "214", beds: 2, baths: 2, status: "occupied" },
  { buildingId: "b-vantage", number: "302", beds: 2, baths: 2, status: "inspection" },
  { buildingId: "b-vantage", number: "318", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-vantage", number: "401", beds: 2, baths: 1, status: "ready" },
  { buildingId: "b-vantage", number: "415", beds: 3, baths: 2, status: "cleaning" },
  { buildingId: "b-vantage", number: "502", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-vantage", number: "520", beds: 2, baths: 2, status: "occupied" },
  { buildingId: "b-vantage", number: "608", beds: 2, baths: 2, status: "ready" },
  { buildingId: "b-vantage", number: "701", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-vantage", number: "812", beds: 2, baths: 2, status: "booked" },
  { buildingId: "b-vantage", number: "904", beds: 3, baths: 2, status: "ready" },
  { buildingId: "b-lumos", number: "108", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-lumos", number: "210", beds: 2, baths: 2, status: "ready" },
  { buildingId: "b-lumos", number: "215", beds: 1, baths: 1, status: "occupied" },
  { buildingId: "b-lumos", number: "304", beds: 2, baths: 2, status: "cleaning" },
  { buildingId: "b-lumos", number: "312", beds: 2, baths: 1, status: "ready" },
  { buildingId: "b-lumos", number: "401", beds: 1, baths: 1, status: "inspection" },
  { buildingId: "b-lumos", number: "418", beds: 3, baths: 2, status: "ready" },
  { buildingId: "b-lumos", number: "506", beds: 2, baths: 2, status: "maintenance" },
  { buildingId: "b-lumos", number: "512", beds: 1, baths: 1, status: "ready" },
  { buildingId: "b-lumos", number: "603", beds: 2, baths: 2, status: "occupied" },
  { buildingId: "b-lumos", number: "710", beds: 2, baths: 2, status: "ready" },
];

const GUESTS: Guest[] = [
  { id: "g-1", name: "Ahmed Al-Farsi", phone: "+1 216 555 0140", email: "ahmed.guest@email.com", notes: "Prefers late check-in. Quiet unit." },
  { id: "g-2", name: "Maya Chen", phone: "+1 216 555 0192", email: "maya.chen@email.com", notes: "Corporate stay — Cleveland Clinic." },
  { id: "g-3", name: "James Porter", phone: "+1 440 555 0118", email: "j.porter@email.com", notes: "" },
  { id: "g-4", name: "Lina Haddad", phone: "+1 216 555 0177", email: "lina.h@email.com", notes: "Traveling with child." },
  { id: "g-5", name: "Omar Rahman", phone: "+1 330 555 0133", email: "omar.r@email.com", notes: "Long medical stay." },
  { id: "g-6", name: "Sofia Alvarez", phone: "+1 216 555 0164", email: "sofia.a@email.com", notes: "" },
  { id: "g-7", name: "Daniel Kim", phone: "+1 216 555 0108", email: "dkim@email.com", notes: "Repeat guest." },
  { id: "g-8", name: "Nora Saleh", phone: "+1 440 555 0188", email: "nora.s@email.com", notes: "" },
  { id: "g-9", name: "Chris Walker", phone: "+1 216 555 0121", email: "c.walker@email.com", notes: "Needs parking." },
  { id: "g-10", name: "Hana Yusuf", phone: "+1 216 555 0155", email: "hana.y@email.com", notes: "Checking in today 3:00 PM." },
  { id: "g-11", name: "Peter Novak", phone: "+1 330 555 0199", email: "p.novak@email.com", notes: "" },
  { id: "g-12", name: "Aisha Karim", phone: "+1 216 555 0134", email: "aisha.k@email.com", notes: "Corporate weekly." },
];

function aptId(buildingId: string, number: string) {
  return `apt-${buildingId.replace("b-", "")}-${number}`;
}

function priceFor(beds: number): Apartment["pricing"] {
  const base = beds === 1 ? 119 : beds === 2 ? 159 : 219;
  return {
    base,
    weekend: base + 25,
    weekly: Math.round(base * 6.2),
    monthly: Math.round(base * 22),
    seasonal: base + 40,
    corporate: Math.round(base * 0.9),
    longStay: Math.round(base * 0.78),
    cleaningFee: beds === 1 ? 75 : beds === 2 ? 95 : 125,
    deposit: beds === 1 ? 200 : 300,
    minStay: 2,
    discountPct: 0,
  };
}

function hotelList(beds: number, baths: number, mode: "empty" | "pass" | "failKitchen"): ChecklistItem[] {
  const list = generateHotelChecklist({ bedrooms: beds, bathrooms: baths });
  if (mode === "empty") return list;
  return list.map((item) => {
    if (mode === "failKitchen" && item.zone === "kitchen" && item.id.endsWith("stone")) {
      return { ...item, passed: false, note: "Kitchen not hotel standard — grease / not restocked" };
    }
    if (item.kind === "photo") {
      return { ...item, passed: true, photo: mode === "pass" ? "seed://ready" : item.photo };
    }
    if (item.kind === "inventory") {
      return { ...item, passed: true, actual: item.expected };
    }
    return { ...item, passed: true };
  });
}

export function createSeed(): AppData {
  const apartments: Apartment[] = UNITS.map((u, i) => ({
    id: aptId(u.buildingId, u.number),
    buildingId: u.buildingId,
    number: u.number,
    city: "Cleveland",
    bedrooms: u.beds,
    bathrooms: u.baths,
    description: `Bright ${u.beds}-bed in ${u.buildingId === "b-aster" ? "Aster" : u.buildingId === "b-vantage" ? "Vantage" : "Lumos"}. Fully furnished for short stays, medical travel, and corporate housing.`,
    descriptionAr: `شقة ${u.beds} غرف في ${u.buildingId === "b-aster" ? "أستير" : u.buildingId === "b-vantage" ? "فانتاج" : "لوموس"}، مفروشة بالكامل للإقامة القصيرة والطبية والشركات.`,
    photos: [PHOTOS[i % PHOTOS.length], PHOTOS[(i + 3) % PHOTOS.length], PHOTOS[(i + 5) % PHOTOS.length]],
    status: u.status,
    pricing: priceFor(u.beds),
  }));

  const bookings: Booking[] = [
    { id: "bk-1", guestId: "g-1", apartmentId: "apt-aster-405", checkIn: "2026-09-01", checkOut: "2026-09-08", checkInTime: "4:00 PM", guestsCount: 2, totalAmount: 1208, paidAmount: 1208, paymentMethod: "card", status: "checked_out", notes: "Checked out this morning. Cleaning required." },
    { id: "bk-2", guestId: "g-2", apartmentId: "apt-aster-302", checkIn: "2026-09-05", checkOut: "2026-09-12", checkInTime: "3:00 PM", guestsCount: 1, totalAmount: 928, paidAmount: 500, paymentMethod: "corporate", status: "checked_in", notes: "Clinic rotation." },
    { id: "bk-3", guestId: "g-3", apartmentId: "apt-aster-901", checkIn: "2026-09-06", checkOut: "2026-09-08", checkInTime: "4:00 PM", guestsCount: 2, totalAmount: 413, paidAmount: 413, paymentMethod: "card", status: "checked_in", notes: "Check-out today 11:00 AM." },
    { id: "bk-4", guestId: "g-4", apartmentId: "apt-vantage-214", checkIn: "2026-09-04", checkOut: "2026-09-11", checkInTime: "2:00 PM", guestsCount: 3, totalAmount: 1308, paidAmount: 1308, paymentMethod: "card", status: "checked_in", notes: "" },
    { id: "bk-5", guestId: "g-5", apartmentId: "apt-vantage-520", checkIn: "2026-08-20", checkOut: "2026-09-20", checkInTime: "1:00 PM", guestsCount: 1, totalAmount: 3720, paidAmount: 2000, paymentMethod: "transfer", status: "checked_in", notes: "Long medical stay." },
    { id: "bk-6", guestId: "g-6", apartmentId: "apt-lumos-215", checkIn: "2026-09-07", checkOut: "2026-09-10", checkInTime: "5:00 PM", guestsCount: 1, totalAmount: 432, paidAmount: 432, paymentMethod: "cash", status: "checked_in", notes: "" },
    { id: "bk-7", guestId: "g-7", apartmentId: "apt-lumos-603", checkIn: "2026-09-03", checkOut: "2026-09-08", checkInTime: "4:00 PM", guestsCount: 2, totalAmount: 890, paidAmount: 600, paymentMethod: "card", status: "checked_in", notes: "Check-out today." },
    { id: "bk-8", guestId: "g-8", apartmentId: "apt-aster-610", checkIn: "2026-09-08", checkOut: "2026-09-15", checkInTime: "4:00 PM", guestsCount: 4, totalAmount: 1758, paidAmount: 800, paymentMethod: "card", status: "booked", notes: "Check-in today 4:00 PM." },
    { id: "bk-9", guestId: "g-9", apartmentId: "apt-vantage-812", checkIn: "2026-09-08", checkOut: "2026-09-11", checkInTime: "3:00 PM", guestsCount: 2, totalAmount: 572, paidAmount: 572, paymentMethod: "card", status: "booked", notes: "Check-in today." },
    { id: "bk-10", guestId: "g-10", apartmentId: "apt-lumos-210", checkIn: "2026-09-08", checkOut: "2026-09-14", checkInTime: "3:00 PM", guestsCount: 2, totalAmount: 1049, paidAmount: 1049, paymentMethod: "card", status: "booked", notes: "Unit is READY." },
    { id: "bk-11", guestId: "g-11", apartmentId: "apt-aster-205", checkIn: "2026-09-08", checkOut: "2026-09-12", checkInTime: "4:00 PM", guestsCount: 2, totalAmount: 731, paidAmount: 200, paymentMethod: "cash", status: "booked", notes: "Balance due at door." },
    { id: "bk-12", guestId: "g-12", apartmentId: "apt-vantage-401", checkIn: "2026-09-08", checkOut: "2026-09-22", checkInTime: "2:00 PM", guestsCount: 1, totalAmount: 1988, paidAmount: 1988, paymentMethod: "corporate", status: "booked", notes: "Corporate two weeks." },
    { id: "bk-13", guestId: "g-7", apartmentId: "apt-aster-405", checkIn: "2026-07-12", checkOut: "2026-07-16", checkInTime: "4:00 PM", guestsCount: 2, totalAmount: 731, paidAmount: 731, paymentMethod: "card", status: "checked_out", notes: "Repeat guest history." },
    { id: "bk-14", guestId: "g-1", apartmentId: "apt-aster-101", checkIn: "2026-09-10", checkOut: "2026-09-17", checkInTime: "4:00 PM", guestsCount: 1, totalAmount: 928, paidAmount: 0, paymentMethod: "card", status: "booked", notes: "Upcoming: Sep 10 – 4:00 PM." },
    { id: "bk-15", guestId: "g-3", apartmentId: "apt-vantage-110", checkIn: "2026-09-08", checkOut: "2026-09-09", checkInTime: "1:00 PM", guestsCount: 1, totalAmount: 194, paidAmount: 194, paymentMethod: "card", status: "booked", notes: "One-night check-in today." },
    { id: "bk-16", guestId: "g-4", apartmentId: "apt-lumos-312", checkIn: "2026-08-01", checkOut: "2026-08-08", checkInTime: "4:00 PM", guestsCount: 2, totalAmount: 1208, paidAmount: 1208, paymentMethod: "card", status: "checked_out", notes: "" },
  ];

  const tasks: OpsTask[] = [
    { id: "t-1", apartmentId: "apt-aster-405", type: "cleaning", status: "pending", assignedTo: "u-omar", date: TODAY, checklist: hotelList(2, 2, "empty"), score: null, notes: "Turnover after Ahmed Al-Farsi." },
    { id: "t-2", apartmentId: "apt-vantage-302", type: "inspection", status: "in_progress", assignedTo: "u-ryan", date: TODAY, checklist: hotelList(2, 2, "failKitchen"), score: 88, notes: "Kitchen not restocked." },
    { id: "t-3", apartmentId: "apt-lumos-210", type: "final_inspection", status: "completed", assignedTo: "u-ryan", date: "2026-09-07", checklist: hotelList(2, 2, "pass"), score: 98, notes: "READY." },
    { id: "t-4", apartmentId: "apt-vantage-415", type: "cleaning", status: "pending", assignedTo: "u-omar", date: TODAY, checklist: hotelList(3, 2, "empty"), score: null, notes: "" },
    { id: "t-5", apartmentId: "apt-lumos-304", type: "cleaning", status: "pending", assignedTo: "u-omar", date: TODAY, checklist: hotelList(2, 2, "empty"), score: null, notes: "" },
    { id: "t-6", apartmentId: "apt-lumos-401", type: "inspection", status: "pending", assignedTo: "u-ryan", date: TODAY, checklist: hotelList(1, 1, "empty"), score: null, notes: "Final inspection." },
    { id: "t-7", apartmentId: "apt-vantage-302", type: "restock", status: "pending", assignedTo: "u-omar", date: TODAY, checklist: [], score: null, notes: "Coffee + paper towels." },
    { id: "t-8", apartmentId: "apt-aster-405", type: "turnover", status: "completed", assignedTo: "u-ryan", date: TODAY, checklist: [], score: null, notes: "Checkout walkthrough done." },
  ];

  const maintenance: MaintenanceRequest[] = [
    { id: "m-1", apartmentId: "apt-aster-405", title: "AC not cooling", description: "Living room AC blows warm air. Guest reported last night.", photos: [PHOTOS[2]], video: null, priority: "urgent", status: "in_progress", assigneeId: "u-khalid", cost: 0, invoice: null, date: "2026-09-07" },
    { id: "m-2", apartmentId: "apt-aster-1102", title: "Dishwasher leak", description: "Water under sink after cycle.", photos: [PHOTOS[6]], video: null, priority: "urgent", status: "assigned", assigneeId: "u-khalid", cost: 180, invoice: "INV-4421", date: "2026-09-06" },
    { id: "m-3", apartmentId: "apt-lumos-506", title: "Broken oven igniter", description: "Oven will not start.", photos: [], video: null, priority: "normal", status: "new", assigneeId: null, cost: 0, invoice: null, date: TODAY },
    { id: "m-4", apartmentId: "apt-vantage-214", title: "Slow bathroom drain", description: "Guest mentioned slow drain. Not urgent.", photos: [], video: null, priority: "low", status: "completed", assigneeId: "u-khalid", cost: 95, invoice: "INV-4402", date: "2026-09-02" },
    { id: "m-5", apartmentId: "apt-lumos-210", title: "Replace smoke detector", description: "Chirping battery — replaced.", photos: [], video: null, priority: "normal", status: "completed", assigneeId: "u-khalid", cost: 42, invoice: "INV-4390", date: "2026-08-28" },
  ];

  const elecUnpaid = new Set(["apt-aster-405", "apt-vantage-214", "apt-lumos-506"]);
  const elecSoon = new Set(["apt-aster-302", "apt-aster-901", "apt-vantage-302", "apt-lumos-210", "apt-lumos-215"]);

  const electricity: UtilityBill[] = apartments.map((a, i) => {
    const status: UtilityStatus = elecUnpaid.has(a.id) ? "unpaid" : elecSoon.has(a.id) ? "due_soon" : "paid";
    return {
      apartmentId: a.id,
      company: i % 2 === 0 ? "Cleveland Public Power" : "The Illuminating Company",
      accountNumber: `CPP-${880000 + i}`,
      extraNumber: `MTR-${12000 + i}`,
      amount: 68 + ((i * 7) % 55),
      billDate: "2026-08-20",
      dueDate: status === "unpaid" ? "2026-09-01" : status === "due_soon" ? "2026-09-12" : "2026-08-28",
      status,
      photo: null,
    };
  });

  const internet: UtilityBill[] = apartments.map((a, i) => {
    const status: UtilityStatus = i % 11 === 0 ? "unpaid" : i % 7 === 0 ? "due_soon" : "paid";
    const building = a.buildingId.replace("b-", "");
    return {
      apartmentId: a.id,
      company: i % 3 === 0 ? "Spectrum" : "AT&T Fiber",
      accountNumber: `NET-${44000 + i}`,
      extraNumber: "",
      wifiName: `AHMED-${building.toUpperCase()}-${a.number}`,
      wifiPassword: `Ahmed${a.number}!clev`,
      amount: 79,
      billDate: "2026-08-18",
      dueDate: status === "unpaid" ? "2026-09-02" : status === "due_soon" ? "2026-09-14" : "2026-08-30",
      status,
      photo: null,
    };
  });

  const water: UtilityBill[] = apartments.map((a, i) => ({
    apartmentId: a.id,
    company: "Cleveland Water",
    accountNumber: `WTR-${22000 + i}`,
    extraNumber: "",
    amount: 34 + (i % 12),
    billDate: "2026-08-15",
    dueDate: "2026-09-15",
    status: i % 13 === 0 ? "due_soon" : "paid",
    photo: null,
  }));

  const categories: ExpenseCategory[] = [
    "electricity",
    "internet",
    "water",
    "maintenance",
    "cleaning",
    "supplies",
    "furniture",
    "repairs",
    "other",
  ];

  const expenses: Expense[] = [];
  apartments.forEach((a, i) => {
    expenses.push({
      id: `ex-e-${a.id}`,
      buildingId: a.buildingId,
      apartmentId: a.id,
      category: "electricity",
      amount: electricity[i].amount,
      date: "2026-09-01",
      description: "September electricity",
      receipt: null,
    });
    expenses.push({
      id: `ex-i-${a.id}`,
      buildingId: a.buildingId,
      apartmentId: a.id,
      category: "internet",
      amount: 79,
      date: "2026-09-01",
      description: "September internet",
      receipt: null,
    });
    if (i % 3 === 0) {
      expenses.push({
        id: `ex-c-${a.id}`,
        buildingId: a.buildingId,
        apartmentId: a.id,
        category: "cleaning",
        amount: a.pricing.cleaningFee,
        date: "2026-09-05",
        description: "Turnover clean",
        receipt: null,
      });
    }
    if (i % 5 === 0) {
      expenses.push({
        id: `ex-s-${a.id}`,
        buildingId: a.buildingId,
        apartmentId: a.id,
        category: "supplies",
        amount: 48,
        date: "2026-09-03",
        description: "Linens & toiletries",
        receipt: null,
      });
    }
  });
  expenses.push({
    id: "ex-m-1",
    buildingId: "b-aster",
    apartmentId: "apt-aster-1102",
    category: "maintenance",
    amount: 180,
    date: "2026-09-06",
    description: "Dishwasher repair",
    receipt: "INV-4421",
  });
  expenses.push({
    id: "ex-m-2",
    buildingId: "b-vantage",
    apartmentId: "apt-vantage-214",
    category: "maintenance",
    amount: 95,
    date: "2026-09-02",
    description: "Drain service",
    receipt: "INV-4402",
  });
  expenses.push({
    id: "ex-f-1",
    buildingId: "b-lumos",
    apartmentId: "apt-lumos-210",
    category: "furniture",
    amount: 420,
    date: "2026-09-04",
    description: "Replacement sofa pillows + lamp",
    receipt: null,
  });

  const stock = [
    { name: "Bath towels", nameAr: "مناشف حمام", expected: 6 },
    { name: "Hand towels", nameAr: "مناشف يد", expected: 4 },
    { name: "Toilet paper", nameAr: "ورق حمام", expected: 8 },
    { name: "Coffee pods", nameAr: "كبسولات قهوة", expected: 12 },
    { name: "Trash bags", nameAr: "أكياس قمامة", expected: 10 },
    { name: "Dish soap", nameAr: "صابون صحون", expected: 1 },
  ];

  const inventory: InventoryItem[] = [];
  apartments.forEach((a, i) => {
    stock.forEach((s, j) => {
      const short = a.id === "apt-vantage-302" && s.name === "Coffee pods";
      const miss = a.id === "apt-aster-405" && s.name === "Toilet paper";
      const actual = miss ? 0 : short ? 2 : s.expected - (i % 4 === 0 && j === 3 ? 3 : 0);
      inventory.push({
        id: `inv-${a.id}-${j}`,
        apartmentId: a.id,
        name: s.name,
        nameAr: s.nameAr,
        expected: s.expected,
        actual,
        state: actual === 0 ? "missing" : actual < s.expected * 0.4 ? "low" : "ok",
      });
    });
  });

  void categories;

  return {
    users: [
      { id: "u-ahmed", name: "Ahmed Al-Saadi", nameAr: "أحمد السعدي", email: "ahmed@ahmed.app", phone: "+1 216 555 0100", role: "SUPER_ADMIN", title: "Management", titleAr: "إدارة" },
      { id: "u-ryan", name: "Ryan", nameAr: "رايان", email: "ryan@ahmed.app", phone: "+1 216 555 0101", role: "EMPLOYEE", title: "Operations", titleAr: "تشغيل" },
      { id: "u-omar", name: "Omar Saleh", nameAr: "عمر صالح", email: "omar@ahmed.app", phone: "+1 216 555 0102", role: "CLEANER", title: "Cleaner", titleAr: "تنظيف" },
      { id: "u-khalid", name: "Khalid Mansour", nameAr: "خالد منصور", email: "khalid@ahmed.app", phone: "+1 216 555 0103", role: "MAINTENANCE", title: "Maintenance", titleAr: "صيانة" },
    ],
    buildings: [
      { id: "b-aster", name: "Aster", city: "Cleveland", address: "1890 E 107th St, Cleveland, OH" },
      { id: "b-vantage", name: "Vantage", city: "Cleveland", address: "1350 Euclid Ave, Cleveland, OH" },
      { id: "b-lumos", name: "Lumos", city: "Cleveland", address: "11409 Euclid Ave, Cleveland, OH" },
    ],
    apartments,
    guests: GUESTS,
    bookings,
    checkouts: [
      {
        id: "co-1",
        bookingId: "bk-1",
        apartmentId: "apt-aster-405",
        checkoutTime: "10:40 AM",
        apartmentCondition: "Good — AC issue noted",
        hasDamage: false,
        hasMissing: true,
        extraCharge: 0,
        photos: [PHOTOS[1]],
        cleaningRequired: true,
        notes: "Toilet paper missing. Sent to cleaning.",
      },
    ],
    tasks,
    maintenance,
    electricity,
    internet,
    water,
    expenses,
    inventory,
  };
}
