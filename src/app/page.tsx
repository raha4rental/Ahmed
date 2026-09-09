"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crown, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { AHMED_EMAIL } from "@/lib/auth";

export default function LoginPage() {
  const { data, login, user, ready, lang, t } = useStore();
  const router = useRouter();
  const [ahmedOpen, setAhmedOpen] = useState(false);
  const [email, setEmail] = useState(AHMED_EMAIL);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const ahmed = data.users.find((u) => u.id === "u-ahmed");
  const ryan =
    data.users.find((u) => u.id === "u-ryan") ?? data.users.find((u) => u.id === "u-rayan");

  async function enterRyan() {
    if (!ryan) return;
    await login(ryan.id);
    router.push("/dashboard");
  }

  async function enterAhmed(e: React.FormEvent) {
    e.preventDefault();
    if (!ahmed) return;
    if (email.trim().toLowerCase() !== AHMED_EMAIL) {
      toast.error(t("wrongPassword"));
      return;
    }
    setBusy(true);
    const ok = await login(ahmed.id, password);
    setBusy(false);
    if (!ok) {
      toast.error(t("wrongPassword"));
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="app-device login-screen">
      <div className="login-glow" />
      <div className="login-inner">
        <header className="login-brand">
          <div className="login-mark" aria-hidden>
            أ
          </div>
          <img src="/ahmed-logo.svg" alt="Ahmed" className="login-wordmark" />
          <p className="login-kicker">Property Management</p>
          <h1 className="login-title">
            {lang === "ar" ? "إدارة وتشغيل الشقق" : "Apartment Management & Operations"}
          </h1>
          <p className="login-sub">{t("loginAs")}</p>
        </header>

        <div className="login-options">
          <button
            type="button"
            className="staff-card staff-card-admin"
            onClick={() => setAhmedOpen(true)}
          >
            <span className="staff-icon">
              <Crown className="size-6" />
            </span>
            <span className="staff-copy">
              <span className="staff-name">Ahmed Al-Saadi</span>
              <span className="staff-name-ar">أحمد السعدي</span>
              <span className="staff-role">Super Admin • {AHMED_EMAIL}</span>
            </span>
          </button>

          {ahmedOpen ? (
            <form className="login-ahmed-form" onSubmit={enterAhmed}>
              <div className="grid gap-1.5">
                <Label className="text-[#e8d5a8]">{t("loginEmail")}</Label>
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a2c26] text-[#fffdf8] border-[#c4a57466]"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[#e8d5a8]">{t("password")}</Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1a2c26] text-[#fffdf8] border-[#c4a57466]"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {t("loginBtn")}
              </Button>
            </form>
          ) : null}

          {ryan ? (
            <button type="button" className="staff-card" onClick={() => void enterRyan()}>
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
        </div>

        <footer className="login-foot">
          <div>Ahmed Property Management</div>
          <div>Smarter Management • Better Stays</div>
        </footer>
      </div>
    </div>
  );
}
