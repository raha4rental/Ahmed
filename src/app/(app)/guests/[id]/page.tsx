"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { guestPath } from "@/lib/paths";

export default function GuestRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(guestPath(id));
  }, [id, router]);
  return null;
}
