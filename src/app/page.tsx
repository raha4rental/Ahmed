"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crown, Languages, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { data, login, user, ready, t, lang, toggleLang } = useStore();
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const ahmed = data.users.find((u) => u.id === "u-ahmed");
  const rayan = data.users.find((u) => u.id === "u-rayan");
  const selected = data.users.find((u) => u.id === picked);

  function enter(id: string) {
    if (pin !== "1234") {
      setError(t("pinHint"));
      return;
    }
    login(id);
    router.push("/dashboard");
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="app-device app-login">
      <div className="app-login-bg" />
      <header className="relative flex items-center justify-between px-5 pt-6">
        <div className="text-xs text-[#c4a574]">{t("installHint")}</div>
        <Button variant="ghost" className="text-[#f3e6c8]" size="sm" onClick={toggleLang}>
          <Languages className="size-4" />
          {t("lang")}
        </Button>
      </header>

      <div className="relative flex flex-1 flex-col justify-end px-5 pb-10 pt-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-[1.6rem] bg-[#c4a574] text-[2.4rem] font-semibold text-[#14241f]">
            أ
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[#f3e6c8]">{t("appName")}</h1>
          <p className="mt-2 text-sm text-[#efe6d6]/70">{t("tagline")}</p>
        </div>

        {!picked ? (
          <div className="space-y-3">
            <p className="text-center text-xs text-[#c4a574]">{t("loginAs")}</p>
            {ahmed ? (
              <button className="login-card" onClick={() => { setPicked(ahmed.id); setPin(""); setError(""); }}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#c4a574]/20 text-[#c4a574]">
                  <Crown className="size-5" />
                </div>
                <div className="flex-1 text-start">
                  <div className="text-base font-semibold text-[#f3e6c8]">{t("ahmedName")}</div>
                  <div className="text-xs text-[#c4a574]">{t("management")} · Super Admin</div>
                </div>
              </button>
            ) : null}
            {rayan ? (
              <button className="login-card" onClick={() => { setPicked(rayan.id); setPin(""); setError(""); }}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#c4a574]/20 text-[#c4a574]">
                  <UserRound className="size-5" />
                </div>
                <div className="flex-1 text-start">
                  <div className="text-base font-semibold text-[#f3e6c8]">{t("rayanName")}</div>
                  <div className="text-xs text-[#efe6d6]/60">{t("operationsRole")}</div>
                </div>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 rounded-3xl bg-[#1b3029]/90 p-5">
            <p className="text-center text-sm text-[#f3e6c8]">
              {lang === "ar" ? selected?.nameAr : selected?.name}
            </p>
            <Input
              type="password"
              inputMode="numeric"
              placeholder={t("password")}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-11 bg-[#14241f] text-[#f3e6c8]"
            />
            {error ? <p className="text-center text-xs text-rose-300">{error}</p> : <p className="text-center text-xs text-[#c4a574]">{t("pinHint")}</p>}
            <Button className="h-11 w-full" onClick={() => picked && enter(picked)}>
              {t("loginBtn")}
            </Button>
            <Button variant="ghost" className="w-full text-[#efe6d6]/70" onClick={() => setPicked(null)}>
              {t("cancel")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
