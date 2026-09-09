"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crown, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { data, login, user, ready, lang, t } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState<"ahmed" | "ryan" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const ahmed = data.users.find((u) => u.id === "u-ahmed");
  const ryan =
    data.users.find((u) => u.id === "u-ryan") ?? data.users.find((u) => u.id === "u-rayan");

  function resetFields() {
    setEmail("");
    setPassword("");
  }

  async function enterAhmed(e: React.FormEvent) {
    e.preventDefault();
    if (!ahmed) return;
    setBusy(true);
    const ok = await login(ahmed.id, password);
    setBusy(false);
    if (!ok) {
      toast.error(t("wrongPassword"));
      setPassword("");
      return;
    }
    resetFields();
    router.push("/dashboard");
  }

  async function enterRyan(e: React.FormEvent) {
    e.preventDefault();
    if (!ryan) return;
    setBusy(true);
    const ok = await login(ryan.id, password, email);
    setBusy(false);
    if (!ok) {
      toast.error(t("wrongLogin"));
      setPassword("");
      return;
    }
    resetFields();
    router.push("/dashboard");
  }

  const fieldCls = "bg-[#1a2c26] text-[#fffdf8] border-[#c4a57466]";

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="app-device login-screen">
      <div className="login-glow" />
      <div className="login-inner">
        <header className="login-brand">
          <img src="/logo.png" alt="Ahmed Al Saadi" className="login-logo" />
          <p className="login-sub">{t("loginAs")}</p>
        </header>

        <div className="login-options">
          <button
            type="button"
            className="staff-card staff-card-admin"
            onClick={() => {
              resetFields();
              setOpen("ahmed");
            }}
          >
            <span className="staff-icon">
              <Crown className="size-6" />
            </span>
            <span className="staff-copy">
              <span className="staff-name">Ahmed Al-Saadi</span>
              <span className="staff-name-ar">أحمد السعدي</span>
              <span className="staff-role">Super Admin • Management</span>
            </span>
          </button>

          {open === "ahmed" ? (
            <form className="login-ahmed-form" onSubmit={enterAhmed} autoComplete="off">
              <div className="grid gap-1.5">
                <Label className="text-[#e8d5a8]">{t("password")}</Label>
                <Input
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldCls}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {t("loginBtn")}
              </Button>
            </form>
          ) : null}

          {ryan ? (
            <button
              type="button"
              className="staff-card"
              onClick={() => {
                resetFields();
                setOpen("ryan");
              }}
            >
              <span className="staff-icon">
                <UserRound className="size-6" />
              </span>
              <span className="staff-copy">
                <span className="staff-name">Ryan</span>
                <span className="staff-name-ar">رايان</span>
                <span className="staff-role">Operations</span>
              </span>
            </button>
          ) : null}

          {open === "ryan" ? (
            <form className="login-ahmed-form" onSubmit={enterRyan} autoComplete="off">
              <div className="grid gap-1.5">
                <Label className="text-[#e8d5a8]">{t("loginEmail")}</Label>
                <Input
                  type="email"
                  inputMode="email"
                  name="staff-mail"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-form-type="other"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldCls}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[#e8d5a8]">{t("password")}</Label>
                <Input
                  type="password"
                  name="unlock-code"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldCls}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {t("loginBtn")}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
