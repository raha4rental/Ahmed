export type Role = "SUPER_ADMIN" | "EMPLOYEE" | "CLEANER" | "MAINTENANCE";
export type Lang = "ar" | "en";

export type ApartmentStatus =
  | "ready"
  | "booked"
  | "occupied"
  | "cleaning"
  | "inspection"
  | "maintenance"
  | "not_ready";

export type BookingStatus = "booked" | "checked_in" | "checked_out" | "cancelled";
export type PaymentMethod = "cash" | "card" | "transfer" | "corporate";
export type MaintenancePriority = "urgent" | "normal" | "low";
export type MaintenanceStatus = "new" | "assigned" | "in_progress" | "completed";
export type UtilityStatus = "paid" | "unpaid" | "due_soon";
export type ExpenseCategory =
  | "electricity"
  | "internet"
  | "water"
  | "maintenance"
  | "cleaning"
  | "supplies"
  | "furniture"
  | "repairs"
  | "other";
export type TaskType = "turnover" | "cleaning" | "inspection" | "final_inspection" | "restock";
export type TaskStatus = "pending" | "in_progress" | "failed" | "completed";
export type InventoryState = "ok" | "low" | "missing";

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  role: Role;
  title: string;
  titleAr: string;
}

export interface Building {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface Pricing {
  base: number;
  weekend: number;
  weekly: number;
  monthly: number;
  seasonal: number;
  corporate: number;
  longStay: number;
  cleaningFee: number;
  deposit: number;
  minStay: number;
  discountPct: number;
}

export interface Apartment {
  id: string;
  buildingId: string;
  number: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  descriptionAr: string;
  photos: string[];
  status: ApartmentStatus;
  pricing: Pricing;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface Booking {
  id: string;
  guestId: string;
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  guestsCount: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  notes: string;
}

export interface CheckoutRecord {
  id: string;
  bookingId: string;
  apartmentId: string;
  checkoutTime: string;
  apartmentCondition: string;
  hasDamage: boolean;
  hasMissing: boolean;
  extraCharge: number;
  photos: string[];
  cleaningRequired: boolean;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  labelAr: string;
  passed: boolean | null;
}

export interface OpsTask {
  id: string;
  apartmentId: string;
  type: TaskType;
  status: TaskStatus;
  assignedTo: string | null;
  date: string;
  checklist: ChecklistItem[];
  score: number | null;
  notes: string;
}

export interface MaintenanceRequest {
  id: string;
  apartmentId: string;
  title: string;
  description: string;
  photos: string[];
  video: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assigneeId: string | null;
  cost: number;
  invoice: string | null;
  date: string;
}

export interface UtilityBill {
  apartmentId: string;
  company: string;
  accountNumber: string;
  extraNumber: string;
  wifiName?: string;
  wifiPassword?: string;
  amount: number;
  billDate: string;
  dueDate: string;
  status: UtilityStatus;
  photo: string | null;
}

export interface Expense {
  id: string;
  buildingId: string;
  apartmentId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receipt: string | null;
}

export interface InventoryItem {
  id: string;
  apartmentId: string;
  name: string;
  nameAr: string;
  expected: number;
  actual: number;
  state: InventoryState;
}

export interface AppData {
  users: User[];
  buildings: Building[];
  apartments: Apartment[];
  guests: Guest[];
  bookings: Booking[];
  checkouts: CheckoutRecord[];
  tasks: OpsTask[];
  maintenance: MaintenanceRequest[];
  electricity: UtilityBill[];
  internet: UtilityBill[];
  water: UtilityBill[];
  expenses: Expense[];
  inventory: InventoryItem[];
}

export const DEFAULT_CHECKLIST: Omit<ChecklistItem, "passed">[] = [
  { id: "beds", label: "Beds made & linens fresh", labelAr: "السرير مرتب والمفروشات جديدة" },
  { id: "bath", label: "Bathroom sanitized", labelAr: "الحمام معقم" },
  { id: "kitchen", label: "Kitchen clean & stocked", labelAr: "المطبخ نظيف ومجهز" },
  { id: "floors", label: "Floors vacuumed / mopped", labelAr: "الأرضيات مكنسة وممسوحة" },
  { id: "trash", label: "Trash emptied", labelAr: "القمامة أُفرغت" },
  { id: "supplies", label: "Toiletries restocked", labelAr: "مستلزمات الضيف مكتملة" },
  { id: "appliances", label: "Appliances working", labelAr: "الأجهزة تعمل" },
  { id: "odors", label: "No odors or stains", labelAr: "لا روائح ولا بقع" },
];
