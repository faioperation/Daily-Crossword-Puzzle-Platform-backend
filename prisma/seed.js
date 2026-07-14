import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import { getESTStartOfDay } from "../src/app/utils/date.js";

const prisma = new PrismaClient();

export async function seedDatabase(prismaClient) {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@puzzle.com";
  const userEmail = "user1@puzzle.com";
  const user2Email = "user2@puzzle.com";
  const user3Email = "user3@puzzle.com";
  const defaultPassword = "123456";

  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  // 1. Seed System Owner (Admin)
  const existingOwner = await prismaClient.user.findUnique({
    where: { email: adminEmail },
  });

  let ownerId;
  if (!existingOwner) {
    const owner = await prismaClient.user.create({
      data: {
        name: "System Owner Admin",
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "SYSTEM_OWNER",
        isActive: true,
        isVerified: true,
        avatar: "/uploads/avatars/avatar-1783050826789-621301391.png",
      },
    });
    ownerId = owner.id;
    console.log(`✅ System Owner successfully seeded! (admin@puzzle.com)`);
  } else {
    ownerId = existingOwner.id;
    // Update avatar if not set
    await prismaClient.user.update({
      where: { id: ownerId },
      data: {
        avatar: "/uploads/avatars/avatar-1783050826789-621301391.png",
      },
    });
    console.log(`✅ System Owner avatar updated!`);
  }

  // 2. Seed Regular Users (user1, user2, user3)
  const usersToSeed = [
    { email: userEmail, username: "user1", name: "Test User 1" },
    { email: user2Email, username: "user2", name: "Test User 2" },
    { email: user3Email, username: "user3", name: "Test User 3" },
  ];

  const seededUsers = [];

  for (const u of usersToSeed) {
    const existing = await prismaClient.user.findUnique({
      where: { email: u.email },
    });
    if (!existing) {
      const created = await prismaClient.user.create({
        data: {
          name: u.name,
          username: u.username,
          email: u.email,
          password: hashedPassword,
          role: "USER",
          isActive: true,
          isVerified: true,
        },
      });
      seededUsers.push(created);
      console.log(`✅ Regular User successfully seeded! (${u.email})`);
    } else {
      seededUsers.push(existing);
    }
  }

  // 3. Seed Settings if not exists
  const existingSettings = await prismaClient.setting.findFirst();
  if (!existingSettings) {
    await prismaClient.setting.create({
      data: {
        websiteName: "Crossword Daily Platform",
        supportEmail: "support@puzzle.com",
        logo: "/uploads/settings/logo-1782712175162-657466038.png",
      },
    });
    console.log("⚙️ Settings seeded successfully!");
  }

  // 4. Seed Puzzles (Yesterday, Today, Tomorrow/Draft) in EST Start of Day
  const today = getESTStartOfDay(new Date());

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const grid4x4 = [
    [
      { isBlack: false, letter: "F", clueNum: 1 },
      { isBlack: false, letter: "A", clueNum: 2 },
      { isBlack: false, letter: "R", clueNum: 3 },
      { isBlack: false, letter: "E", clueNum: 4 }
    ],
    [
      { isBlack: false, letter: "A", clueNum: 5 },
      { isBlack: false, letter: "R", clueNum: null },
      { isBlack: false, letter: "I", clueNum: null },
      { isBlack: false, letter: "D", clueNum: null }
    ],
    [
      { isBlack: false, letter: "R", clueNum: 6 },
      { isBlack: false, letter: "O", clueNum: null },
      { isBlack: false, letter: "S", clueNum: null },
      { isBlack: false, letter: "E", clueNum: null }
    ],
    [
      { isBlack: false, letter: "E", clueNum: 7 },
      { isBlack: false, letter: "D", clueNum: null },
      { isBlack: false, letter: "E", clueNum: null },
      { isBlack: false, letter: "N", clueNum: null }
    ]
  ];

  const clues4x4 = [
    { id: "1-across", direction: "ACROSS", number: 1, text: "Ticket price", answer: "FARE" },
    { id: "5-across", direction: "ACROSS", number: 5, text: "Extremely dry", answer: "ARID" },
    { id: "6-across", direction: "ACROSS", number: 6, text: "Thorny flower", answer: "ROSE" },
    { id: "7-across", direction: "ACROSS", number: 7, text: "Biblical garden", answer: "EDEN" },
    { id: "1-down", direction: "DOWN", number: 1, text: "Ticket price", answer: "FARE" },
    { id: "2-down", direction: "DOWN", number: 2, text: "Alex Rodriguez nickname", answer: "AROD" },
    { id: "3-down", direction: "DOWN", number: 3, text: "Go up", answer: "RISE" },
    { id: "4-down", direction: "DOWN", number: 4, text: "Biblical garden", answer: "EDEN" }
  ];

  const puzzlesData = [
    {
      title: "Yesterday's Classic Crossword",
      description: "A simple 4x4 crossword from yesterday.",
      rows: 4,
      columns: 4,
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      publishDate: yesterday,
      dailyPrize: "$10 Amazon Voucher",
      createdById: ownerId,
      cells: grid4x4,
      clues: clues4x4
    },
    {
      title: "Today's Daily Crossword",
      description: "A fun 4x4 crossword for today.",
      rows: 4,
      columns: 4,
      difficulty: "EASY",
      status: "PUBLISHED",
      publishDate: today,
      dailyPrize: "$5 Cash Reward",
      createdById: ownerId,
      cells: grid4x4,
      clues: clues4x4
    },
    {
      title: "Upcoming Hard Challenge",
      description: "A preview of the next hard puzzle.",
      rows: 4,
      columns: 4,
      difficulty: "HARD",
      status: "DRAFT",
      publishDate: tomorrow,
      dailyPrize: "$20 Gift Card",
      createdById: ownerId,
      cells: grid4x4,
      clues: clues4x4
    }
  ];

  const seededPuzzles = [];
  for (const p of puzzlesData) {
    const existing = await prismaClient.puzzle.findFirst({
      where: { title: p.title },
    });
    if (!existing) {
      const created = await prismaClient.puzzle.create({
        data: p,
      });
      seededPuzzles.push(created);
      console.log(`🧩 Puzzle successfully seeded: "${p.title}"`);
    } else {
      const updated = await prismaClient.puzzle.update({
        where: { id: existing.id },
        data: { publishDate: p.publishDate, status: p.status },
      });
      seededPuzzles.push(updated);
      console.log(`🧩 Puzzle date/status updated: "${p.title}"`);
    }
  }

  // 5. Seed Completed Attempts for Yesterday's Puzzle
  const yesterdayPuzzle = seededPuzzles.find(p => p.title === "Yesterday's Classic Crossword");
  if (yesterdayPuzzle) {
    const filledCells = [
      ["F", "A", "R", "E"],
      ["A", "R", "I", "D"],
      ["R", "O", "S", "E"],
      ["E", "D", "E", "N"]
    ];

    for (let i = 0; i < seededUsers.length; i++) {
      const user = seededUsers[i];
      if (user.role === "SYSTEM_OWNER") continue;

      const deviceId = `device-${user.username}`;
      const existingAttempt = await prismaClient.puzzleAttempt.findFirst({
        where: {
          puzzleId: yesterdayPuzzle.id,
          userId: user.id,
        },
      });

      if (!existingAttempt) {
        const attempt = await prismaClient.puzzleAttempt.create({
          data: {
            puzzleId: yesterdayPuzzle.id,
            userId: user.id,
            deviceId,
            playDate: yesterday,
            startedAt: new Date(yesterday.getTime() - 5 * 60 * 1000),
            completedAt: yesterday,
            completed: true,
            durationSeconds: 300,
            score: 100 - i * 5,
            status: "ELIGIBLE",
          },
        });

        await prismaClient.puzzleAnswer.create({
          data: {
            attemptId: attempt.id,
            answers: filledCells,
          },
        });

        console.log(`📝 Seeded completed attempt & answer for ${user.email} on yesterday's puzzle`);
      }
    }
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
