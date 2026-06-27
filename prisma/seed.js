import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

export async function seedDatabase(prisma) {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@puzzle.com";
  const defaultPassword = "123456";

  // Check if system owner already exists
  const existingOwner = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingOwner) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    await prisma.user.create({
      data: {
        name: "System Owner",
        username: "systemowner",
        email: adminEmail,
        password: hashedPassword,
        role: "SYSTEM_OWNER",
        isActive: true,
        isVerified: true,
      },
    });

    console.log(`✅ System Owner successfully seeded!`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${defaultPassword}`);
  } else {
    console.log("ℹ️ Seed data already exists");
  }
}

// Allow running directly via node
const isMain = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith("seed.js")
);

if (isMain) {
  const prisma = new PrismaClient();
  seedDatabase(prisma)
    .catch((e) => {
      console.error("❌ Error seeding database:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
