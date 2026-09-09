import { createSeed } from "@/lib/seed";

export function generateStaticParams() {
  return createSeed().apartments.map((a) => ({ id: a.id }));
}

export default function ApartmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
