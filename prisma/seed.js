import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

export async function seedDatabase(prismaClient) {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@puzzle.com";
  const userEmail = "user1@puzzle.com";
  const defaultPassword = "123456";

  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  // 1. Seed System Owner (Admin)
  const existingOwner = await prismaClient.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingOwner) {
    await prismaClient.user.create({
      data: {
        name: "System Owner Admin",
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "SYSTEM_OWNER",
        isActive: true,
        isVerified: true,
      },
    });
    console.log(`✅ System Owner successfully seeded! (admin@puzzle.com)`);
  }

  // 2. Seed Regular User
  const existingUser = await prismaClient.user.findUnique({
    where: { email: userEmail },
  });

  if (!existingUser) {
    await prismaClient.user.create({
      data: {
        name: "Test User 1",
        username: "user1",
        email: userEmail,
        password: hashedPassword,
        role: "USER",
        isActive: true,
        isVerified: true,
      },
    });
    console.log(`✅ Regular User successfully seeded! (user1@puzzle.com)`);
  }

  // 3. Seed Settings if not exists
  const existingSettings = await prismaClient.setting.findFirst();
  if (!existingSettings) {
    await prismaClient.setting.create({
      data: {
        websiteName: "Crossword Daily Platform",
        supportEmail: "support@puzzle.com",
        logo: "/uploads/settings/default-logo.png",
      },
    });
    console.log("⚙️ Settings seeded successfully!");
  }

  if (existingOwner && existingUser) {
    console.log("ℹ️ Seed data already exists");
  }
}

const isMain =
  process.argv[1] &&
  (fileURLToPath(import.meta.url) === process.argv[1] ||
    process.argv[1].endsWith("seed.js"));

if (isMain) {
  seedDatabase(prisma)
    .catch((e) => {
      console.error("❌ Error seeding database:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
