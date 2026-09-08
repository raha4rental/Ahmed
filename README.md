# Raha Management — راحة

نظام إدارة وتشغيل كامل للشقق (Cleveland). ليس تطبيق تنظيف فقط.

**Raha Management** is a full apartment operations system: properties, guests, bookings, check-in/out, cleaning & inspection, maintenance, electricity, internet, and expenses — all tied to the unit.

أحمد (**Ahmed**) is **Super Admin** and sees everything. Employees see only the work they need.

## Roles / الصلاحيات

| Role | Access |
| --- | --- |
| Super Admin — أحمد | 100% — prices, financials, users, delete invoices |
| Employee | Operations: check-in/out, cleaning, inspection |
| Cleaner | Cleaning + inventory |
| Maintenance | Maintenance tickets only |

Employees cannot change prices, delete apartments, view sensitive accounts, edit revenue, change user permissions, or delete bills.

## Apartment cycle / دورة الشقة

Guest books → Booking → Check-in → Occupied → Check-out → Inspection → Cleaning → Maintenance / Inventory if needed → Final Inspection → READY → next guest

Checkout automatically sets **Cleaning Required**. An apartment cannot be marked READY if an inspection item failed.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default in this project: port **4721**).

Sign in as أحمد to see the full dashboard, or as Sara / Omar / Khalid to see staff views.

Demo data is stored in the browser (`localStorage`). Super Admin can reset it from Permissions.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui. No database and no login passwords — pick a role on the home screen.
