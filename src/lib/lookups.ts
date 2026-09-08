import type { AppData, Apartment, ApartmentStatus, Booking } from "./types";

export function buildingName(data: AppData, buildingId: string) {
  return data.buildings.find((b) => b.id === buildingId)?.name ?? "—";
}

export function aptName(data: AppData, apartmentId: string) {
  const a = data.apartments.find((x) => x.id === apartmentId);
  if (!a) return "—";
  return `${buildingName(data, a.buildingId)} ${a.number}`;
}

export function guestName(data: AppData, guestId: string) {
  return data.guests.find((g) => g.id === guestId)?.name ?? "—";
}

export function userName(data: AppData, userId: string | null, lang: "ar" | "en") {
  if (!userId) return "—";
  const u = data.users.find((x) => x.id === userId);
  if (!u) return "—";
  return lang === "ar" ? u.nameAr : u.name;
}

export function currentBooking(data: AppData, apartmentId: string): Booking | undefined {
  return data.bookings.find(
    (b) =>
      b.apartmentId === apartmentId &&
      (b.status === "checked_in" || b.status === "booked")
  );
}

export function activeStay(data: AppData, apartmentId: string): Booking | undefined {
  return data.bookings.find((b) => b.apartmentId === apartmentId && b.status === "checked_in");
}

export function statusLabel(
  status: ApartmentStatus,
  t: (k: "ready" | "cleaning" | "inspection" | "maintenanceSt" | "occupied" | "booked" | "notReady") => string
) {
  const map = {
    ready: t("ready"),
    cleaning: t("cleaning"),
    inspection: t("inspection"),
    maintenance: t("maintenanceSt"),
    occupied: t("occupied"),
    booked: t("booked"),
    not_ready: t("notReady"),
  } as const;
  return map[status];
}

export function remaining(booking: { totalAmount: number; paidAmount: number }) {
  return Math.max(0, booking.totalAmount - booking.paidAmount);
}

export function findApt(data: AppData, id: string): Apartment | undefined {
  return data.apartments.find((a) => a.id === id);
}
