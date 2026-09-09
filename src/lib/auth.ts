export const AHMED_PASSWORD_SHA256 =
  "e0fdc0f005292f654eeda7e993ea818f03b8a9fd6649076e921e4e1a552bdeb0";

export async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
