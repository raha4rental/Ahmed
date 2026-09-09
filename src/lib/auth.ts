export const AHMED_PASSWORD_SHA256 =
  "e0fdc0f005292f654eeda7e993ea818f03b8a9fd6649076e921e4e1a552bdeb0";

export const RYAN_EMAIL_SHA256 =
  "191f872952e18b0c3f854b4d535a29f48f84224e1b925245980b0a042ca0cc1d";

export const RYAN_PASSWORD_SHA256 =
  "9794d4d8a0da7a414c9093013600863750275827a4f1620ce660e82d78a76612";

export async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
