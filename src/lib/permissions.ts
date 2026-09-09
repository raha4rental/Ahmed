import type { Role } from "./types";

export const can = {
  viewFinancials: (role: Role) => role === "SUPER_ADMIN",
  editPrices: (role: Role) => role === "SUPER_ADMIN",
  deleteApartment: (role: Role) => role === "SUPER_ADMIN",
  addApartment: (role: Role) => role === "SUPER_ADMIN",
  manageUsers: (role: Role) => role === "SUPER_ADMIN",
  deleteExpense: (role: Role) => role === "SUPER_ADMIN",
  deleteInvoice: (role: Role) => role === "SUPER_ADMIN",
  editRevenue: (role: Role) => role === "SUPER_ADMIN",
  viewSensitiveAccounts: (role: Role) => role === "SUPER_ADMIN",
  viewWifi: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  viewApartments: (role: Role) =>
    role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "CLEANER" || role === "MAINTENANCE",
  viewGuests: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  viewBookings: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  checkInOut: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  viewOperations: (role: Role) =>
    role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "CLEANER",
  completeCleaning: (role: Role) =>
    role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "CLEANER",
  inspect: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  markReady: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  viewMaintenance: (role: Role) =>
    role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "MAINTENANCE",
  createMaintenance: (_role: Role) => true,
  assignMaintenance: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  viewUtilities: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  payBills: (role: Role) => role === "SUPER_ADMIN",
  viewExpenses: (role: Role) => role === "SUPER_ADMIN",
  addExpense: (role: Role) => role === "SUPER_ADMIN" || role === "EMPLOYEE",
  viewInventory: (role: Role) =>
    role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "CLEANER",
  updateInventory: (role: Role) =>
    role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "CLEANER",
};

export type NavItem = { href: string; key: string; icon: string };

export const bottomNav = (role: Role): NavItem[] => {
  if (role === "SUPER_ADMIN") {
    return [
      { href: "/dashboard", key: "home", icon: "home" },
      { href: "/apartments", key: "apartments", icon: "building" },
      { href: "/bookings", key: "bookings", icon: "calendar" },
      { href: "/expenses", key: "expenses", icon: "receipt" },
      { href: "/more", key: "more", icon: "more" },
    ];
  }
  if (role === "EMPLOYEE") {
    return [
      { href: "/dashboard", key: "home", icon: "home" },
      { href: "/apartments", key: "apartments", icon: "building" },
      { href: "/bookings", key: "bookings", icon: "calendar" },
      { href: "/operations", key: "ops", icon: "sparkles" },
      { href: "/more", key: "more", icon: "more" },
    ];
  }
  if (role === "CLEANER") {
    return [
      { href: "/dashboard", key: "home", icon: "home" },
      { href: "/operations", key: "ops", icon: "sparkles" },
      { href: "/apartments", key: "apartments", icon: "building" },
      { href: "/more", key: "more", icon: "more" },
    ];
  }
  return [
    { href: "/dashboard", key: "home", icon: "home" },
    { href: "/maintenance", key: "maintenance", icon: "wrench" },
    { href: "/apartments", key: "apartments", icon: "building" },
    { href: "/more", key: "more", icon: "more" },
  ];
};

export const moreNav = (role: Role): NavItem[] => {
  const items: NavItem[] = [];
  if (can.viewGuests(role)) items.push({ href: "/guests", key: "customers", icon: "users" });
  if (can.viewOperations(role) && role === "SUPER_ADMIN") items.push({ href: "/operations", key: "operations", icon: "sparkles" });
  if (can.viewMaintenance(role) && role !== "MAINTENANCE") items.push({ href: "/maintenance", key: "maintenance", icon: "wrench" });
  if (can.viewUtilities(role)) {
    items.push({ href: "/electricity", key: "electricity", icon: "zap" });
    items.push({ href: "/internet", key: "internet", icon: "wifi" });
  }
  if (can.viewExpenses(role) && role !== "SUPER_ADMIN") items.push({ href: "/expenses", key: "expenses", icon: "receipt" });
  if (can.viewFinancials(role)) items.push({ href: "/reports", key: "reports", icon: "chart" });
  if (can.manageUsers(role)) items.push({ href: "/users", key: "staff", icon: "shield" });
  return items;
};
