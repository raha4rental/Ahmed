export function apartmentPath(id: string) {
  return `/apartment?id=${encodeURIComponent(id)}`;
}

export function guestPath(id: string) {
  return `/guest?id=${encodeURIComponent(id)}`;
}

export function appPath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}
