import type { AppData } from "./types";
import { createSeed } from "./seed";
import { prisma } from "./prisma";

export async function getAppState(): Promise<AppData> {
  const row = await prisma.snapshot.findUnique({ where: { id: "main" } });
  if (row?.payload) {
    try {
      return JSON.parse(row.payload) as AppData;
    } catch {
      /* fall through */
    }
  }
  const seed = createSeed();
  await prisma.snapshot.upsert({
    where: { id: "main" },
    create: { id: "main", payload: JSON.stringify(seed) },
    update: { payload: JSON.stringify(seed) },
  });
  await syncUsers(seed);
  return seed;
}

export async function saveAppState(data: AppData) {
  await prisma.snapshot.upsert({
    where: { id: "main" },
    create: { id: "main", payload: JSON.stringify(data) },
    update: { payload: JSON.stringify(data) },
  });
  await syncUsers(data);
}

async function syncUsers(data: AppData) {
  for (const u of data.users) {
    const email = u.email.trim() || `${u.id}@local`;
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        name: u.name,
        nameAr: u.nameAr,
        email,
        phone: u.phone,
        role: u.role,
        title: u.title,
        titleAr: u.titleAr,
        pin: "1234",
      },
      update: {
        name: u.name,
        nameAr: u.nameAr,
        email,
        phone: u.phone,
        role: u.role,
        title: u.title,
        titleAr: u.titleAr,
      },
    });
  }
}
