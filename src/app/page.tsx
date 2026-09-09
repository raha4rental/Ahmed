"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Globe,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { Lang } from "@/lib/types";

const RYAN_EMAIL_KEY = "ahmed-ryan-email";

export default function LoginPage() {
  const { data, login, user, ready, lang, t, setLang } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState<"ahmed" | "ryan" | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  useEffect(() => {
    const saved = localStorage.getItem(RYAN_EMAIL_KEY)?.trim() ?? "";
    if (saved) {
      setEmail(saved);
      setEmailSaved(true);
    }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const ahmed = data.users.find((u) => u.id === "u-ahmed");
  const ryan =
    data.users.find((u) => u.id === "u-ryan") ?? data.users.find((u) => u.id === "u-rayan");
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

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
    setPassword("");
    router.push("/dashboard");
  }

  async function enterRyan(e: React.FormEvent) {
    e.preventDefault();
    if (!ryan) return;
    const mail = email.trim().toLowerCase();
    setBusy(true);
    const ok = await login(ryan.id, password, mail);
    setBusy(false);
    if (!ok) {
      toast.error(t("wrongLogin"));
      setPassword("");
      return;
    }
    localStorage.setItem(RYAN_EMAIL_KEY, mail);
    setEmail(mail);
    setEmailSaved(true);
    setPassword("");
    router.push("/dashboard");
  }

  function pickLang(next: Lang) {
    setLang(next);
    setLangOpen(false);
  }

  const fieldCls = "bg-[#13241f] text-[#fffdf8] border-[#c4a57466]";

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="app-device login-screen">
      <img src="/login-buildings.jpg" alt="" className="login-photo" />
      <div className="login-veil" />

      <header className="app-topbar">
        <div className="app-topbar-inner" ref={langRef}>
          <span />
          <span className="app-topbar-word">{t("appName")}</span>
          <div className="login-lang app-topbar-logout">
            <button
              type="button"
              className="login-lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
            >
              <Globe className="size-3.5" />
              <span>{lang === "ar" ? t("langArabic") : t("langEnglish")}</span>
              <ChevronDown className="size-3.5" />
            </button>
            {langOpen ? (
              <div className="login-lang-menu">
                <button type="button" onClick={() => pickLang("ar")}>
                  {t("langArabic")}
                </button>
                <button type="button" onClick={() => pickLang("en")}>
                  {t("langEnglish")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="login-inner">

        <header className="login-brand">
          <img src="/logo.png" alt="Ahmed Al Saadi" className="login-logo" />
          <p className="login-slogan">{t("loginSlogan")}</p>
          <span className="login-gold-rule" />
        </header>

        <section className="login-heading">
          <h1>{t("loginAs")}</h1>
          <p>{t("loginChoose")}</p>
        </section>

        <div className="login-options">
          <button
            type="button"
            className="staff-card staff-card-admin"
            onClick={() => {
              setPassword("");
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
            <Chevron className="staff-chevron" />
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
                setPassword("");
                const saved = localStorage.getItem(RYAN_EMAIL_KEY)?.trim() ?? "";
                if (saved) {
                  setEmail(saved);
                  setEmailSaved(true);
                }
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
              <Chevron className="staff-chevron" />
            </button>
          ) : null}

          {open === "ryan" ? (
            <form className="login-ahmed-form" onSubmit={enterRyan} autoComplete="off">
              {emailSaved ? null : (
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
              )}
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
              {emailSaved ? (
                <button
                  type="button"
                  className="w-full text-center text-xs text-[#e8d5a8]"
                  onClick={() => {
                    setEmailSaved(false);
                    setEmail("");
                    localStorage.removeItem(RYAN_EMAIL_KEY);
                  }}
                >
                  {t("changeEmail")}
                </button>
              ) : null}
            </form>
          ) : null}
        </div>

        <div className="login-bottom">
          <svg className="login-wave" viewBox="0 0 430 56" preserveAspectRatio="none" aria-hidden>
            <path
              d="M0 28C48 8 96 46 150 30C204 14 248 6 300 22C352 38 392 18 430 12V56H0Z"
              fill="url(#goldFill)"
              opacity="0.18"
            />
            <path
              d="M0 30C52 10 100 44 154 28C208 12 250 8 304 24C358 40 396 16 430 14"
              fill="none"
              stroke="#c4a574"
              strokeWidth="1.6"
            />
            <defs>
              <linearGradient id="goldFill" x1="0" y1="0" x2="430" y2="0">
                <stop offset="0" stopColor="#c4a574" />
                <stop offset="1" stopColor="#e8d5a8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="login-features">
            <div>
              <Clock3 />
              <span>{t("featureTime")}</span>
            </div>
            <div>
              <BarChart3 />
              <span>{t("featureManage")}</span>
            </div>
            <div>
              <ShieldCheck />
              <span>{t("featureSafe")}</span>
            </div>
          </div>

          <p className="login-motto">
            <span />
            {t("loginMotto")}
            <span />
          </p>
        </div>
      </div>
    </div>
  );
}
