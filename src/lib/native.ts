import { Capacitor } from "@capacitor/core";
import { readImageFile } from "@/lib/image";

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function initNativeShell() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("native", Capacitor.isNativePlatform());

  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#14241f" });
  } catch {
    /* web or plugin unavailable */
  }

  try {
    const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  } catch {
    /* web or plugin unavailable */
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* web or plugin unavailable */
  }
}

function pickImageFromFile(maxEdge: number): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        resolve(await readImageFile(file, maxEdge));
      } catch {
        resolve(null);
      }
    };
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}

export async function pickImage(maxEdge = 1400): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    return pickImageFromFile(maxEdge);
  }

  try {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const photo = await Camera.getPhoto({
      quality: 82,
      width: maxEdge,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader: "صورة / Photo",
      promptLabelPhoto: "المعرض / Photos",
      promptLabelPicture: "الكاميرا / Camera",
      promptLabelCancel: "إلغاء / Cancel",
    });
    return photo.dataUrl ?? null;
  } catch {
    return null;
  }
}
