"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initNativeShell } from "@/lib/native";
import { listenNotificationTaps, requestNotificationPermission } from "@/lib/notify";

export function NativeInit() {
  const router = useRouter();

  useEffect(() => {
    void initNativeShell();
    void requestNotificationPermission();
    let stop: (() => void) | undefined;
    void listenNotificationTaps((href) => router.push(href)).then((fn) => {
      stop = fn;
    });
    return () => stop?.();
  }, [router]);

  return null;
}
