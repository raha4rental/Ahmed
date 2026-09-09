"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apartmentPath } from "@/lib/paths";

export default function ApartmentRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(apartmentPath(id));
  }, [id, router]);
  return null;
}
