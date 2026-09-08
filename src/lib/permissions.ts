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

export const navFor = (role: Role) => {
  const items: Array<{ href: string; key: string; icon: string }> = [
    { href: "/dashboard", key: "dashboard", icon: "layout" },
  ];
  if (can.viewApartments(role)) items.push({ href: "/apartments", key: "apartments", icon: "building" });
  if (can.viewGuests(role)) items.push({ href: "/guests", key: "guests", icon: "users" });
  if (can.viewBookings(role)) items.push({ href: "/bookings", key: "bookings", icon: "calendar" });
  if (can.viewOperations(role)) items.push({ href: "/operations", key: "operations", icon: "sparkles" });
  if (can.viewMaintenance(role)) items.push({ href: "/maintenance", key: "maintenance", icon: "wrench" });
  if (can.viewUtilities(role)) {
    items.push({ href: "/electricity", key: "electricity", icon: "zap" });
    items.push({ href: "/internet", key: "internet", icon: "wifi" });
  }
  if (can.viewExpenses(role)) items.push({ href: "/expenses", key: "expenses", icon: "receipt" });
  if (can.manageUsers(role)) items.push({ href: "/users", key: "users", icon: "shield" });
  return items;
};
