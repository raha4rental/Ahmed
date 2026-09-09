import { PrismaClient } from "@prisma/client";
import { createSeed } from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  const data = createSeed();
  await prisma.snapshot.upsert({
    where: { id: "main" },
    create: { id: "main", payload: JSON.stringify(data) },
    update: { payload: JSON.stringify(data) },
  });
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: { ...u, pin: "1234" },
      update: {
        name: u.name,
        nameAr: u.nameAr,
        email: u.email,
        role: u.role,
        title: u.title,
        titleAr: u.titleAr,
        phone: u.phone,
      },
    });
  }
  for (const b of data.buildings) {
    await prisma.building.upsert({
      where: { id: b.id },
      create: b,
      update: b,
    });
  }
  console.log(`Ahmed database seeded: ${data.apartments.length} apartments, ${data.users.length} staff.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
