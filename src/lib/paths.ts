export function apartmentPath(id: string) {
  return `/apartment?id=${encodeURIComponent(id)}`;
}

export function guestPath(id: string) {
  return `/guest?id=${encodeURIComponent(id)}`;
}
