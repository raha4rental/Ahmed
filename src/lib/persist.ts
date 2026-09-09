import { Capacitor } from "@capacitor/core";
import type { AppData } from "./types";

export const APP_DATA_KEY = "ahmed-app-v5";
export const SESSION_KEY = "ahmed-session-v5";
export const LANG_KEY = "ahmed-lang";
export const RYAN_EMAIL_KEY = "ahmed-ryan-email";

const DATA_FILE = "ahmed-app-v5.json";

function memoryGet(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function memorySet(key: string, value: string) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota or private mode */
  }
}

function memoryRemove(key: string) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

async function readNativeFile(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const result = await Filesystem.readFile({
      path: DATA_FILE,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return typeof result.data === "string" && result.data.length > 0 ? result.data : null;
  } catch {
    return null;
  }
}

async function writeNativeFile(json: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
  await Filesystem.writeFile({
    path: DATA_FILE,
    data: json,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

async function prefGet(key: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return memoryGet(key);
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    return memoryGet(key);
  }
}

async function prefSet(key: string, value: string): Promise<void> {
  memorySet(key, value);
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value });
  } catch {
    /* keep localStorage copy */
  }
}

async function prefRemove(key: string): Promise<void> {
  memoryRemove(key);
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.remove({ key });
  } catch {
    /* ignore */
  }
}

export async function loadSetting(key: string): Promise<string | null> {
  const native = await prefGet(key);
  if (native) return native;
  return memoryGet(key);
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await prefSet(key, value);
}

export async function clearSetting(key: string): Promise<void> {
  await prefRemove(key);
}

export async function loadAppData(): Promise<AppData | null> {
  const fromFile = await readNativeFile();
  if (fromFile) {
    try {
      return JSON.parse(fromFile) as AppData;
    } catch {
      /* fall through */
    }
  }

  const fromMemory = memoryGet(APP_DATA_KEY);
  if (fromMemory) {
    try {
      const parsed = JSON.parse(fromMemory) as AppData;
      if (Capacitor.isNativePlatform()) {
        void writeNativeFile(fromMemory).catch(() => undefined);
      }
      return parsed;
    } catch {
      /* fall through */
    }
  }

  if (!Capacitor.isNativePlatform()) {
    try {
      const response = await fetch("/api/state");
      if (response.ok) return (await response.json()) as AppData;
    } catch {
      /* preview without db */
    }
  }

  return null;
}

let writeChain: Promise<void> = Promise.resolve();

export function persistAppData(data: AppData) {
  const json = JSON.stringify(data);
  memorySet(APP_DATA_KEY, json);

  writeChain = writeChain
    .then(async () => {
      if (Capacitor.isNativePlatform()) {
        await writeNativeFile(json);
        return;
      }
      try {
        await fetch("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: json,
        });
      } catch {
        /* preview without server */
      }
    })
    .catch(() => undefined);
}
