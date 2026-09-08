import { format, parseISO, isToday, isSameMonth, differenceInDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { Lang } from "./types";

export const TODAY = "2026-09-08";

export function money(n: number, lang: Lang = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-US" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function moneyExact(n: number, lang: Lang = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-US" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(iso: string, lang: Lang) {
  return format(parseISO(iso), lang === "ar" ? "d MMM yyyy" : "MMM d, yyyy", {
    locale: lang === "ar" ? ar : enUS,
  });
}

export function fmtDateTime(isoDate: string, time: string, lang: Lang) {
  return `${fmtDate(isoDate, lang)} – ${time}`;
}

export function nights(checkIn: string, checkOut: string) {
  return Math.max(1, differenceInDays(parseISO(checkOut), parseISO(checkIn)));
}

export function isDateToday(iso: string) {
  return iso === TODAY || isToday(parseISO(iso));
}

export function inThisMonth(iso: string) {
  return isSameMonth(parseISO(iso), parseISO(TODAY));
}

export function aptLabel(buildingName: string, number: string) {
  return `${buildingName} ${number}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
