"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";

const limits = {
  SUPER_ADMIN: ["100% access", "Prices", "Delete units & invoices", "Users", "Financials"],
  EMPLOYEE: ["Check-in / out", "Cleaning & inspection", "Maintenance create", "No prices", "No delete bills"],
  CLEANER: ["Cleaning + inventory only"],
  MAINTENANCE: ["Maintenance tickets only"],
};

export default function UsersPage() {
  const { data, user, t, lang, reset } = useStore();
  if (!user) return null;
  if (!can.manageUsers(user.role)) return <p className="raha-card p-8">{t("denied")}</p>;

  return (
    <div>
      <PageHeader
        title={t("users")}
        subtitle={lang === "ar" ? "أحمد السعدي: إدارة كاملة. رايان: تشغيل فقط." : "Ahmed Al-Saadi: full management. Ryan: operations only."}
        action={
          <Button variant="outline" onClick={reset}>
            {t("resetDemo")}
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {data.users.map((u) => (
          <article key={u.id} className="raha-card p-5">
            <div className="text-xs uppercase tracking-wide text-[#8a7048]">{u.role.replace("_", " ")}</div>
            <h3 className="mt-1 text-xl font-medium">{lang === "ar" ? u.nameAr : u.name}</h3>
            {u.email ? <p className="text-sm text-muted-foreground">{u.email}</p> : null}
            <ul className="mt-4 space-y-1 text-sm">
              {limits[u.role].map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
