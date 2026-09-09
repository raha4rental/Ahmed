"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Crown, UserRound } from "lucide-react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { data, login, user, ready, lang } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const ahmed = data.users.find((u) => u.id === "u-ahmed") ?? {
    id: "u-ahmed",
    name: "Ahmed Al-Saadi",
    nameAr: "أحمد السعدي",
  };
  const ryan =
    data.users.find((u) => u.id === "u-ryan") ??
    data.users.find((u) => u.id === "u-rayan") ?? {
      id: "u-ryan",
      name: "Ryan",
      nameAr: "رايان",
    };

  function enter(id: string) {
    login(id);
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
          <p className="login-sub">
            {lang === "ar" ? "دخول إلى التطبيق" : "Sign in to the App"}
          </p>
        </header>

        <div className="login-options">
          <button type="button" className="staff-card staff-card-admin" onClick={() => enter(ahmed.id)}>
              <span className="staff-icon">
                <Crown className="size-6" />
              </span>
              <span className="staff-copy">
                <span className="staff-name">Ahmed Al-Saadi</span>
                <span className="staff-name-ar">أحمد السعدي</span>
                <span className="staff-role">Super Admin • Management</span>
              </span>
            </button>

          <button type="button" className="staff-card" onClick={() => enter(ryan.id)}>
              <span className="staff-icon">
                <UserRound className="size-6" />
              </span>
              <span className="staff-copy">
                <span className="staff-name">Ryan</span>
                <span className="staff-name-ar">رايان</span>
                <span className="staff-role">Operations</span>
              </span>
            </button>
        </div>

        <footer className="login-foot">
          <div>Ahmed Property Management</div>
          <div>Smarter Management • Better Stays</div>
        </footer>
      </div>
    </div>
  );
}
