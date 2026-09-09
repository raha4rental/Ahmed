import { createSeed } from "@/lib/seed";

export function generateStaticParams() {
  return createSeed().guests.map((g) => ({ id: g.id }));
}

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
