import { NextResponse } from "next/server";
import { getAppState, saveAppState } from "@/lib/db";
import type { AppData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAppState();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as AppData;
    if (!data?.apartments || !data?.users) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }
    await saveAppState(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}
