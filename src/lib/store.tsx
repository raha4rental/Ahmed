"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Apartment,
  ApartmentStatus,
  AppData,
  AppNotification,
  Booking,
  Building,
  CheckoutRecord,
  Expense,
  Guest,
  HandoverRecord,
  Lang,
  MaintenanceRequest,
  OpsTask,
  Role,
  User,
} from "./types";
import { apartmentPath, guestPath } from "./paths";
import { aptName, guestName } from "./lookups";
import { handoverPath } from "./handover-checklist";
import { isNativeApp } from "./native";
import { canSeeNotice, noticeFingerprint, showDeviceNotification, unreadNotices } from "./notify";
import { generateHotelChecklist, hotelReady, ensureHotelChecklist } from "./hotel-checklist";
import { handoverReady } from "./handover-checklist";
import { createSeed } from "./seed";
import { TODAY, uid } from "./format";
import { copy, type CopyKey } from "./i18n";
import { can } from "./permissions";
import { AHMED_PASSWORD_SHA256, RYAN_EMAIL_SHA256, RYAN_PASSWORD_SHA256, sha256Hex } from "./auth";
import {
  APP_DATA_KEY,
  LANG_KEY,
  SESSION_KEY,
  loadAppData,
  loadSetting,
  persistAppData,
  saveSetting,
  clearSetting,
} from "./persist";

type Store = {
  ready: boolean;
  data: AppData;
  user: User | null;
  lang: Lang;
  t: (key: CopyKey) => string;
  login: (userId: string, password?: string, email?: string) => Promise<boolean>;
  logout: () => void;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  reset: () => void;
  addBuilding: (b: Omit<Building, "id">) => void;
  addApartment: (a: Omit<Apartment, "id">) => string;
  updateApartment: (id: string, patch: Partial<Apartment>) => void;
  deleteApartment: (id: string) => boolean;
  addGuest: (g: Omit<Guest, "id">) => string;
  addBooking: (b: Omit<Booking, "id">) => string;
  checkIn: (bookingId: string) => boolean;
  checkOut: (
    bookingId: string,
    rec: Omit<CheckoutRecord, "id" | "bookingId" | "apartmentId">
  ) => boolean;
  upsertHandover: (h: HandoverRecord) => void;
  completeHandover: (h: HandoverRecord) => { ok: boolean; reason?: string };
  upsertTask: (task: OpsTask) => void;
  completeCleaning: (taskId: string) => boolean;
  completeInspection: (taskId: string, checklist: OpsTask["checklist"], notes: string) => boolean;
  markReady: (apartmentId: string) => { ok: boolean; reason?: string };
  addMaintenance: (m: Omit<MaintenanceRequest, "id">) => string;
  updateMaintenance: (id: string, patch: Partial<MaintenanceRequest>) => void;
  addExpense: (e: Omit<Expense, "id">) => string;
  markExpensePaid: (id: string) => boolean;
  deleteExpense: (id: string) => boolean;
  markUtilityPaid: (kind: "electricity" | "internet" | "water", apartmentId: string) => boolean;
  updateInventory: (id: string, actual: number) => void;
  setTaskChecklist: (taskId: string, checklist: OpsTask["checklist"]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
};

const Ctx = createContext<Store | null>(null);

function loadData(): AppData {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = localStorage.getItem(APP_DATA_KEY);
    if (!raw) return createSeed();
    return JSON.parse(raw) as AppData;
  } catch {
    return createSeed();
  }
}

function persist(data: AppData) {
  persistAppData(data);
}

function setStatus(data: AppData, apartmentId: string, status: ApartmentStatus): AppData {
  return {
    ...data,
    apartments: data.apartments.map((a) => (a.id === apartmentId ? { ...a, status } : a)),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(createSeed);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    let cancelled = false;

    const apply = (next: AppData) => {
      const seed = createSeed();
      const expenses = (next.expenses ?? []).map((e) => ({
        ...e,
        dueDate: e.dueDate ?? e.date,
        paid: e.paid !== undefined ? e.paid : true,
      }));
      const hasRent = expenses.some((e) => e.category === "rent");
      const migrated: AppData = {
        ...next,
        users: (next.users?.length ? next.users : seed.users).map((u) => {
          if (u.id === "u-ahmed") {
            return { ...u, email: "", passwordHash: AHMED_PASSWORD_SHA256 };
          }
          if (u.id === "u-ryan" || u.id === "u-rayan") {
            return {
              ...u,
              id: "u-ryan",
              email: "",
              passwordHash: RYAN_PASSWORD_SHA256,
              emailHash: RYAN_EMAIL_SHA256,
            };
          }
          return u;
        }),
        guests: (next.guests?.length ? next.guests : seed.guests).map((g) => ({
          id: g.id,
          name: g.name,
          phone: g.phone,
          address: g.address ?? "",
          idPhoto: g.idPhoto ?? "",
        })),
        handovers: next.handovers ?? [],
        notifications: next.notifications ?? [],
        expenses: hasRent
          ? expenses
          : [
              ...seed.expenses.filter((e) => e.category === "rent" || e.category === "emergency"),
              ...expenses,
            ],
        tasks: next.tasks.map((task) => {
          const apt = next.apartments.find((a) => a.id === task.apartmentId);
          if (!apt || !task.checklist.length) return task;
          return { ...task, checklist: ensureHotelChecklist(task.checklist, apt) };
        }),
      };
      setData(migrated);
      persist(migrated);
      return migrated;
    };

    void (async () => {
      const lg = await loadSetting(LANG_KEY);
      if (!cancelled && (lg === "ar" || lg === "en")) setLang(lg);

      const next = (await loadAppData()) ?? loadData();
      if (cancelled) return;
      const migrated = apply(next);

      let sid = await loadSetting(SESSION_KEY);
      if (sid === "u-rayan") sid = "u-ryan";
      if (sid && !cancelled) {
        setUser(migrated.users.find((x) => x.id === sid) ?? null);
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((updater: (d: AppData) => AppData) => {
    setData((prev) => updater(prev));
  }, []);

  useEffect(() => {
    if (!ready) return;
    persist(data);
  }, [data, ready]);

  const appendNotice = useCallback(
    (
      d: AppData,
      input: Omit<AppNotification, "id" | "createdAt" | "readBy" | "actorId" | "actorNameAr" | "actorNameEn">
    ): AppData => {
      const actorId = user?.id ?? "";
      const fingerprint = noticeFingerprint({ ...input, actorId });
      const recent = (d.notifications ?? []).some(
        (existing) =>
          noticeFingerprint(existing) === fingerprint &&
          Date.now() - Date.parse(existing.createdAt) < 8000
      );
      if (recent) return d;
      const notice: AppNotification = {
        ...input,
        id: uid("n"),
        createdAt: new Date().toISOString(),
        actorId,
        actorNameAr: user?.nameAr ?? "",
        actorNameEn: user?.name ?? "",
        readBy: actorId ? [actorId] : [],
      };
      queueMicrotask(() => {
        void showDeviceNotification(notice, lang);
      });
      return {
        ...d,
        notifications: [notice, ...(d.notifications ?? [])].slice(0, 200),
      };
    },
    [lang, user]
  );

  useEffect(() => {
    if (!ready || isNativeApp()) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const response = await fetch("/api/state");
        if (!response.ok || cancelled) return;
        const remote = (await response.json()) as AppData;
        const incoming = remote.notifications ?? [];
        if (!incoming.length) return;
        setData((prev) => {
          const have = new Set((prev.notifications ?? []).map((n) => n.id));
          const keys = new Set((prev.notifications ?? []).map(noticeFingerprint));
          const fresh = incoming.filter(
            (n) => !have.has(n.id) && !keys.has(noticeFingerprint(n))
          );
          if (!fresh.length) return prev;
          const notifications = [...fresh, ...(prev.notifications ?? [])]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 200);
          const next = { ...prev, notifications };
          for (const notice of fresh) {
            if (user && canSeeNotice(user.role, notice) && !notice.readBy.includes(user.id)) {
              void showDeviceNotification(notice, lang);
            }
          }
          return next;
        });
      } catch {
        /* preview without db */
      }
    };
    const id = window.setInterval(() => void tick(), 12000);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [lang, ready, user]);

  const t = useCallback((key: CopyKey) => copy[lang][key], [lang]);

  const login = useCallback(
    async (userId: string, password?: string, email?: string) => {
      const u = data.users.find((x) => x.id === userId) ?? null;
      if (!u) return false;
      if (u.emailHash) {
        if (!email) return false;
        const emailHex = await sha256Hex(email.trim().toLowerCase());
        if (emailHex !== u.emailHash) return false;
      }
      if (u.passwordHash) {
        if (!password) return false;
        const hex = await sha256Hex(password);
        if (hex !== u.passwordHash) return false;
      }
      setUser(u);
      void saveSetting(SESSION_KEY, u.id);
      return true;
    },
    [data.users]
  );

  const logout = useCallback(() => {
    setUser(null);
    void clearSetting(SESSION_KEY);
  }, []);

  const applyLang = useCallback((next: Lang) => {
    void saveSetting(LANG_KEY, next);
    setLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "ar" ? "en" : "ar";
      void saveSetting(LANG_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const seed = createSeed();
    persist(seed);
    setData(seed);
  }, []);

  const addBuilding = useCallback(
    (b: Omit<Building, "id">) => {
      commit((d) => ({ ...d, buildings: [...d.buildings, { ...b, id: uid("b") }] }));
    },
    [commit]
  );

  const addApartment = useCallback(
    (a: Omit<Apartment, "id">) => {
      const id = uid("apt");
      commit((d) => {
        const next = { ...d, apartments: [...d.apartments, { ...a, id }] };
        const building = d.buildings.find((b) => b.id === a.buildingId)?.name ?? "";
        return appendNotice(next, {
          kind: "apartment",
          href: apartmentPath(id),
          titleAr: "شقة جديدة",
          titleEn: "New apartment",
          bodyAr: `أُضيفت شقة ${building} ${a.number}`,
          bodyEn: `${building} ${a.number} was added`,
          audience: "both",
        });
      });
      return id;
    },
    [appendNotice, commit]
  );

  const updateApartment = useCallback(
    (id: string, patch: Partial<Apartment>) => {
      commit((d) => ({
        ...d,
        apartments: d.apartments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }));
    },
    [commit]
  );

  const deleteApartment = useCallback(
    (id: string) => {
      if (!user || !can.deleteApartment(user.role)) return false;
      commit((d) => ({ ...d, apartments: d.apartments.filter((a) => a.id !== id) }));
      return true;
    },
    [commit, user]
  );

  const addGuest = useCallback(
    (g: Omit<Guest, "id">) => {
      const id = uid("g");
      commit((d) =>
        appendNotice(
          { ...d, guests: [...d.guests, { ...g, id }] },
          {
            kind: "guest",
            href: guestPath(id),
            titleAr: "زبون جديد",
            titleEn: "New guest",
            bodyAr: `أُضيف الزبون ${g.name}`,
            bodyEn: `${g.name} was added`,
            audience: "both",
          }
        )
      );
      return id;
    },
    [appendNotice, commit]
  );

  const addBooking = useCallback(
    (b: Omit<Booking, "id">) => {
      const id = uid("bk");
      commit((d) => {
        const next = { ...d, bookings: [...d.bookings, { ...b, id }] };
        const apt = d.apartments.find((a) => a.id === b.apartmentId);
        const labeled = appendNotice(apt && apt.status === "ready" ? setStatus(next, b.apartmentId, "booked") : next, {
          kind: "booking",
          href: "/bookings",
          titleAr: "حجز جديد",
          titleEn: "New booking",
          bodyAr: `حجز ${guestName(d, b.guestId)} في ${aptName(d, b.apartmentId)}`,
          bodyEn: `${guestName(d, b.guestId)} booked ${aptName(d, b.apartmentId)}`,
          audience: "both",
        });
        return labeled;
      });
      return id;
    },
    [appendNotice, commit]
  );

  const checkIn = useCallback(
    (bookingId: string) => {
      if (!user || !can.checkInOut(user.role)) return false;
      commit((d) => {
        const bk = d.bookings.find((b) => b.id === bookingId);
        if (!bk) return d;
        const next = {
          ...d,
          bookings: d.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "checked_in" as const } : b
          ),
        };
        return appendNotice(setStatus(next, bk.apartmentId, "occupied"), {
          kind: "checkin",
          href: apartmentPath(bk.apartmentId),
          titleAr: "دخول نزيل",
          titleEn: "Guest checked in",
          bodyAr: `دخل ${guestName(d, bk.guestId)} إلى ${aptName(d, bk.apartmentId)}`,
          bodyEn: `${guestName(d, bk.guestId)} checked in at ${aptName(d, bk.apartmentId)}`,
          audience: "both",
        });
      });
      return true;
    },
    [appendNotice, commit, user]
  );

  const checkOut = useCallback(
    (bookingId: string, rec: Omit<CheckoutRecord, "id" | "bookingId" | "apartmentId">) => {
      if (!user || !can.checkInOut(user.role)) return false;
      commit((d) => {
        const bk = d.bookings.find((b) => b.id === bookingId);
        if (!bk) return d;
        const checkout: CheckoutRecord = {
          ...rec,
          id: uid("co"),
          bookingId,
          apartmentId: bk.apartmentId,
        };
        const apt = d.apartments.find((a) => a.id === bk.apartmentId);
        const task: OpsTask = {
          id: uid("t"),
          apartmentId: bk.apartmentId,
          type: "cleaning",
          status: "pending",
          assignedTo: "u-omar",
          date: TODAY,
          checklist: generateHotelChecklist(apt ?? { bedrooms: 2, bathrooms: 2 }),
          score: null,
          notes: "Auto-created after checkout",
        };
        const next: AppData = {
          ...d,
          bookings: d.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "checked_out" as const } : b
          ),
          checkouts: [...d.checkouts, checkout],
          tasks: [...d.tasks, task],
        };
        return appendNotice(setStatus(next, bk.apartmentId, rec.cleaningRequired ? "cleaning" : "inspection"), {
          kind: "checkout",
          href: apartmentPath(bk.apartmentId),
          titleAr: "خروج نزيل",
          titleEn: "Guest checked out",
          bodyAr: `خرج ${guestName(d, bk.guestId)} من ${aptName(d, bk.apartmentId)}`,
          bodyEn: `${guestName(d, bk.guestId)} checked out of ${aptName(d, bk.apartmentId)}`,
          audience: "both",
        });
      });
      return true;
    },
    [appendNotice, commit, user]
  );

  const upsertHandover = useCallback(
    (h: HandoverRecord) => {
      commit((d) => {
        const idx = d.handovers.findIndex((x) => x.bookingId === h.bookingId && x.kind === h.kind);
        const next = [...d.handovers];
        if (idx >= 0) next[idx] = h;
        else next.push(h);
        return { ...d, handovers: next };
      });
    },
    [commit]
  );

  const completeHandover = useCallback(
    (h: HandoverRecord) => {
      if (!user || !can.checkInOut(user.role)) return { ok: false, reason: "denied" };
      const gate = handoverReady(
        h.items,
        h.receiverName,
        h.incomingName,
        h.receiverSignature,
        h.incomingSignature,
      );
      if (!gate.ok) return { ok: false, reason: gate.reason };
      commit((d) => {
        const bk = d.bookings.find((b) => b.id === h.bookingId);
        if (!bk) return d;
        const record: HandoverRecord = { ...h, completed: true };
        const idx = d.handovers.findIndex((x) => x.bookingId === h.bookingId && x.kind === h.kind);
        const handovers = [...d.handovers];
        if (idx >= 0) handovers[idx] = record;
        else handovers.push(record);
        if (h.kind === "check_in") {
          const next = {
            ...d,
            handovers,
            bookings: d.bookings.map((b) =>
              b.id === h.bookingId ? { ...b, status: "checked_in" as const } : b
            ),
          };
          return appendNotice(setStatus(next, bk.apartmentId, "occupied"), {
            kind: "handover",
            href: handoverPath(h.bookingId, "check_in"),
            titleAr: "استلام شقة",
            titleEn: "Check-in handover",
            bodyAr: `تم استلام ${aptName(d, bk.apartmentId)}`,
            bodyEn: `Check-in signed for ${aptName(d, bk.apartmentId)}`,
            audience: "both",
          });
        }
        const checkout: CheckoutRecord = {
          id: uid("co"),
          bookingId: bk.id,
          apartmentId: bk.apartmentId,
          checkoutTime: h.time,
          apartmentCondition: gate.problems.length ? "Issues noted on handover" : "Clean — signed",
          hasDamage: h.hasDamage || gate.problems.length > 0,
          hasMissing: h.hasMissing,
          extraCharge: h.extraCharge,
          photos: [],
          cleaningRequired: true,
          notes: h.notes,
        };
        const apt = d.apartments.find((a) => a.id === bk.apartmentId);
        const task: OpsTask = {
          id: uid("t"),
          apartmentId: bk.apartmentId,
          type: "cleaning",
          status: "pending",
          assignedTo: "u-omar",
          date: TODAY,
          checklist: generateHotelChecklist(apt ?? { bedrooms: 2, bathrooms: 2 }),
          score: null,
          notes: "Auto-created after signed checkout handover",
        };
        const next: AppData = {
          ...d,
          handovers,
          bookings: d.bookings.map((b) =>
            b.id === h.bookingId ? { ...b, status: "checked_out" as const } : b
          ),
          checkouts: [...d.checkouts, checkout],
          tasks: [...d.tasks, task],
        };
        return appendNotice(setStatus(next, bk.apartmentId, "cleaning"), {
          kind: "handover",
          href: handoverPath(h.bookingId, "check_out"),
          titleAr: "خروج موقّع",
          titleEn: "Check-out handover",
          bodyAr: `تم خروج ${aptName(d, bk.apartmentId)} وبدأ التنظيف`,
          bodyEn: `${aptName(d, bk.apartmentId)} was signed out — cleaning started`,
          audience: "both",
        });
      });
      return { ok: true };
    },
    [appendNotice, commit, user]
  );

  const upsertTask = useCallback(
    (task: OpsTask) => {
      commit((d) => {
        const exists = d.tasks.some((t) => t.id === task.id);
        return {
          ...d,
          tasks: exists ? d.tasks.map((t) => (t.id === task.id ? task : t)) : [...d.tasks, task],
        };
      });
    },
    [commit]
  );

  const completeCleaning = useCallback(
    (taskId: string) => {
      if (!user || !can.completeCleaning(user.role)) return false;
      const task = data.tasks.find((t) => t.id === taskId);
      if (!task) return false;
      const gate = hotelReady(task.checklist);
      if (!gate.ok) return false;
      commit((d) => {
        const current = d.tasks.find((t) => t.id === taskId);
        if (!current) return d;
        const inspect: OpsTask = {
          id: uid("t"),
          apartmentId: current.apartmentId,
          type: "inspection",
          status: "pending",
          assignedTo: "u-ryan",
          date: TODAY,
          checklist: current.checklist,
          score: gate.score,
          notes: "Inspection after hotel-standard clean",
        };
        const next = {
          ...d,
          tasks: [
            ...d.tasks.map((t) =>
              t.id === taskId ? { ...t, status: "completed" as const, score: gate.score } : t
            ),
            inspect,
          ],
        };
        return appendNotice(setStatus(next, current.apartmentId, "inspection"), {
          kind: "cleaning",
          href: "/operations",
          titleAr: "انتهى التنظيف",
          titleEn: "Cleaning finished",
          bodyAr: `انتهى تنظيف ${aptName(d, current.apartmentId)} — بانتظار الفحص`,
          bodyEn: `${aptName(d, current.apartmentId)} cleaning is done — inspection next`,
          audience: "both",
        });
      });
      return true;
    },
    [appendNotice, commit, data.tasks, user]
  );

  const completeInspection = useCallback(
    (taskId: string, checklist: OpsTask["checklist"], notes: string) => {
      if (!user || !can.inspect(user.role)) return false;
      const gate = hotelReady(checklist);
      const failed = !gate.ok;
      const score = gate.score;
      commit((d) => {
        const task = d.tasks.find((t) => t.id === taskId);
        if (!task) return d;
        const next = {
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist,
                  notes,
                  score,
                  status: failed ? ("failed" as const) : ("completed" as const),
                }
              : t
          ),
        };
        if (failed) return setStatus(next, task.apartmentId, "cleaning");
        return next;
      });
      return !failed;
    },
    [commit, user]
  );

  const markReady = useCallback(
    (apartmentId: string) => {
      if (!user || !can.markReady(user.role)) return { ok: false, reason: "denied" };
      const aptTasks = data.tasks.filter((t) => t.apartmentId === apartmentId);
      const latestInspect = [...aptTasks]
        .reverse()
        .find((t) => t.type === "inspection" || t.type === "final_inspection");
      const latestClean = [...aptTasks].reverse().find((t) => t.type === "cleaning" || t.type === "turnover");
      if (latestInspect) {
        const gate = hotelReady(latestInspect.checklist);
        if (!gate.ok || latestInspect.status === "failed") {
          return { ok: false, reason: gate.reason === "photos" ? "photos" : "failed" };
        }
        if (latestInspect.status !== "completed") {
          return { ok: false, reason: "pending" };
        }
      } else if (latestClean) {
        const gate = hotelReady(latestClean.checklist);
        if (!gate.ok) return { ok: false, reason: "failed" };
      }
      const openMaint = data.maintenance.some(
        (m) => m.apartmentId === apartmentId && m.status !== "completed"
      );
      if (openMaint) return { ok: false, reason: "maintenance" };
      commit((d) =>
        appendNotice(setStatus(d, apartmentId, "ready"), {
          kind: "ready",
          href: apartmentPath(apartmentId),
          titleAr: "شقة جاهزة",
          titleEn: "Apartment ready",
          bodyAr: `${aptName(d, apartmentId)} أصبحت جاهزة`,
          bodyEn: `${aptName(d, apartmentId)} is ready`,
          audience: "both",
        })
      );
      return { ok: true };
    },
    [appendNotice, commit, data.maintenance, data.tasks, user]
  );

  const addMaintenance = useCallback(
    (m: Omit<MaintenanceRequest, "id">) => {
      const id = uid("m");
      commit((d) => {
        const next = { ...d, maintenance: [{ ...m, id }, ...d.maintenance] };
        const apt = d.apartments.find((a) => a.id === m.apartmentId);
        const placed =
          apt && (apt.status === "ready" || apt.status === "not_ready" || apt.status === "cleaning")
            ? setStatus(next, m.apartmentId, "maintenance")
            : next;
        return appendNotice(placed, {
          kind: "maintenance",
          href: "/maintenance",
          titleAr: m.priority === "urgent" ? "صيانة عاجلة" : "بلاغ صيانة",
          titleEn: m.priority === "urgent" ? "Urgent maintenance" : "New maintenance",
          bodyAr: `${m.title} — ${aptName(d, m.apartmentId)}`,
          bodyEn: `${m.title} at ${aptName(d, m.apartmentId)}`,
          audience: "both",
        });
      });
      return id;
    },
    [appendNotice, commit]
  );

  const updateMaintenance = useCallback(
    (id: string, patch: Partial<MaintenanceRequest>) => {
      commit((d) => {
        const next = {
          ...d,
          maintenance: d.maintenance.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        };
        const item = next.maintenance.find((m) => m.id === id);
        if (item && patch.status === "completed") {
          const stillOpen = next.maintenance.some(
            (m) => m.apartmentId === item.apartmentId && m.status !== "completed"
          );
          const apt = next.apartments.find((a) => a.id === item.apartmentId);
          if (!stillOpen && apt && apt.status === "maintenance") {
            return setStatus(next, item.apartmentId, "inspection");
          }
        }
        return next;
      });
    },
    [commit]
  );

  const addExpense = useCallback(
    (e: Omit<Expense, "id">) => {
      const id = uid("ex");
      commit((d) =>
        appendNotice(
          { ...d, expenses: [{ ...e, id }, ...d.expenses] },
          {
            kind: "expense",
            href: "/expenses",
            titleAr: "مصروف جديد",
            titleEn: "New expense",
            bodyAr: e.description || "تمت إضافة مصروف",
            bodyEn: e.description || "An expense was added",
            audience: "admin",
          }
        )
      );
      return id;
    },
    [appendNotice, commit]
  );

  const markExpensePaid = useCallback(
    (id: string) => {
      if (!user || !can.payBills(user.role)) return false;
      commit((d) => ({
        ...d,
        expenses: d.expenses.map((e) => (e.id === id ? { ...e, paid: true } : e)),
      }));
      return true;
    },
    [commit, user]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      if (!user || !can.deleteExpense(user.role)) return false;
      commit((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
      return true;
    },
    [commit, user]
  );

  const markUtilityPaid = useCallback(
    (kind: "electricity" | "internet" | "water", apartmentId: string) => {
      if (!user || !can.payBills(user.role)) return false;
      commit((d) => ({
        ...d,
        [kind]: d[kind].map((b) =>
          b.apartmentId === apartmentId ? { ...b, status: "paid" as const } : b
        ),
      }));
      return true;
    },
    [commit, user]
  );

  const updateInventory = useCallback(
    (id: string, actual: number) => {
      commit((d) => ({
        ...d,
        inventory: d.inventory.map((item) => {
          if (item.id !== id) return item;
          const state =
            actual <= 0 ? "missing" : actual < item.expected * 0.4 ? "low" : "ok";
          return { ...item, actual, state };
        }),
      }));
    },
    [commit]
  );

  const setTaskChecklist = useCallback(
    (taskId: string, checklist: OpsTask["checklist"]) => {
      commit((d) => ({
        ...d,
        tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, checklist } : t)),
      }));
    },
    [commit]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      if (!user) return;
      commit((d) => ({
        ...d,
        notifications: (d.notifications ?? []).map((n) =>
          n.id === id && !n.readBy.includes(user.id) ? { ...n, readBy: [...n.readBy, user.id] } : n
        ),
      }));
    },
    [commit, user]
  );

  const markAllNotificationsRead = useCallback(() => {
    if (!user) return;
    commit((d) => ({
      ...d,
      notifications: (d.notifications ?? []).map((n) =>
        n.readBy.includes(user.id) ? n : { ...n, readBy: [...n.readBy, user.id] }
      ),
    }));
  }, [commit, user]);

  const unreadCount = user ? unreadNotices(data.notifications, user).length : 0;

  const value = useMemo<Store>(
    () => ({
      ready,
      data,
      user,
      lang,
      t,
      login,
      logout,
      toggleLang,
      setLang: applyLang,
      reset,
      addBuilding,
      addApartment,
      updateApartment,
      deleteApartment,
      addGuest,
      addBooking,
      checkIn,
      checkOut,
      upsertHandover,
      completeHandover,
      upsertTask,
      completeCleaning,
      completeInspection,
      markReady,
      addMaintenance,
      updateMaintenance,
      addExpense,
      markExpensePaid,
      deleteExpense,
      markUtilityPaid,
      updateInventory,
      setTaskChecklist,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
    }),
    [
      ready,
      data,
      user,
      lang,
      t,
      login,
      logout,
      toggleLang,
      applyLang,
      reset,
      addBuilding,
      addApartment,
      updateApartment,
      deleteApartment,
      addGuest,
      addBooking,
      checkIn,
      checkOut,
      upsertHandover,
      completeHandover,
      upsertTask,
      completeCleaning,
      completeInspection,
      markReady,
      addMaintenance,
      updateMaintenance,
      addExpense,
      markExpensePaid,
      deleteExpense,
      markUtilityPaid,
      updateInventory,
      setTaskChecklist,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useRole(): Role {
  const { user } = useStore();
  return user?.role ?? "EMPLOYEE";
}
