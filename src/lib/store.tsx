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
  Booking,
  Building,
  CheckoutRecord,
  Expense,
  Guest,
  Lang,
  MaintenanceRequest,
  OpsTask,
  Role,
  User,
} from "./types";
import { generateHotelChecklist, hotelReady, ensureHotelChecklist } from "./hotel-checklist";
import { createSeed } from "./seed";
import { TODAY, uid } from "./format";
import { copy, type CopyKey } from "./i18n";
import { can } from "./permissions";
import { AHMED_PASSWORD_SHA256, RYAN_EMAIL_SHA256, RYAN_PASSWORD_SHA256, sha256Hex } from "./auth";

const KEY = "ahmed-app-v5";
const SESSION = "ahmed-session-v5";

type Store = {
  ready: boolean;
  data: AppData;
  user: User | null;
  lang: Lang;
  t: (key: CopyKey) => string;
  login: (userId: string, password?: string, email?: string) => Promise<boolean>;
  logout: () => void;
  toggleLang: () => void;
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
};

const Ctx = createContext<Store | null>(null);

function loadData(): AppData {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createSeed();
    return JSON.parse(raw) as AppData;
  } catch {
    return createSeed();
  }
}

function persist(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
  void fetch("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch(() => undefined);
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
    const lg = localStorage.getItem("ahmed-lang") as Lang | null;
    if (lg === "ar" || lg === "en") setLang(lg);

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
          idPhoto: g.idPhoto ?? "",
        })),
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
      let sid = localStorage.getItem(SESSION);
      if (sid === "u-rayan") sid = "u-ryan";
      if (sid) setUser(migrated.users.find((x) => x.id === sid) ?? null);
    };

    fetch("/api/state")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("db"))))
      .then((next: AppData) => apply(next))
      .catch(() => apply(loadData()))
      .finally(() => setReady(true));
  }, []);

  const commit = useCallback((updater: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

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
      localStorage.setItem(SESSION, u.id);
      return true;
    },
    [data.users]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "ar" ? "en" : "ar";
      localStorage.setItem("ahmed-lang", next);
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
      commit((d) => ({ ...d, apartments: [...d.apartments, { ...a, id }] }));
      return id;
    },
    [commit]
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
      commit((d) => ({ ...d, guests: [...d.guests, { ...g, id }] }));
      return id;
    },
    [commit]
  );

  const addBooking = useCallback(
    (b: Omit<Booking, "id">) => {
      const id = uid("bk");
      commit((d) => {
        const next = { ...d, bookings: [...d.bookings, { ...b, id }] };
        const apt = d.apartments.find((a) => a.id === b.apartmentId);
        if (apt && apt.status === "ready") return setStatus(next, b.apartmentId, "booked");
        return next;
      });
      return id;
    },
    [commit]
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
        return setStatus(next, bk.apartmentId, "occupied");
      });
      return true;
    },
    [commit, user]
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
        return setStatus(next, bk.apartmentId, rec.cleaningRequired ? "cleaning" : "inspection");
      });
      return true;
    },
    [commit, user]
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
        return setStatus(next, current.apartmentId, "inspection");
      });
      return true;
    },
    [commit, data.tasks, user]
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
      commit((d) => setStatus(d, apartmentId, "ready"));
      return { ok: true };
    },
    [commit, data.maintenance, data.tasks, user]
  );

  const addMaintenance = useCallback(
    (m: Omit<MaintenanceRequest, "id">) => {
      const id = uid("m");
      commit((d) => {
        const next = { ...d, maintenance: [{ ...m, id }, ...d.maintenance] };
        const apt = d.apartments.find((a) => a.id === m.apartmentId);
        if (apt && (apt.status === "ready" || apt.status === "not_ready" || apt.status === "cleaning")) {
          return setStatus(next, m.apartmentId, "maintenance");
        }
        return next;
      });
      return id;
    },
    [commit]
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
      commit((d) => ({ ...d, expenses: [{ ...e, id }, ...d.expenses] }));
      return id;
    },
    [commit]
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
      reset,
      addBuilding,
      addApartment,
      updateApartment,
      deleteApartment,
      addGuest,
      addBooking,
      checkIn,
      checkOut,
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
      reset,
      addBuilding,
      addApartment,
      updateApartment,
      deleteApartment,
      addGuest,
      addBooking,
      checkIn,
      checkOut,
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
