import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { getESTStartOfDay } from "../src/app/utils/date.js";

const prisma = new PrismaClient();

async function run() {
  console.log("🌱 Starting custom database seed...");

  await prisma.puzzleWinner.deleteMany({});
  await prisma.puzzleAnswer.deleteMany({});
  await prisma.puzzleAttempt.deleteMany({});
  await prisma.puzzle.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.setting.deleteMany({});

  const defaultPassword = "defaultPassword";
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  // 1. Seed Admin
  const admin = await prisma.user.create({
    data: {
      name: "System Owner Admin",
      username: "admin",
      email: "admin@puzzle.com",
      password: hashedPassword,
      role: "SYSTEM_OWNER",
      isActive: true,
      isVerified: true,
    }
  });
  console.log("✅ Admin seeded (admin@puzzle.com)");

  // 2. Seed 12 Players
  const players = [];
  for (let i = 1; i <= 12; i++) {
    const player = await prisma.user.create({
      data: {
        name: `Player ${i}`,
        username: `player${i}`,
        email: `player${i}@puzzle.com`,
        password: hashedPassword,
        role: "USER",
        isActive: true,
        isVerified: true,
      }
    });
    players.push(player);
  }
  console.log("✅ Seeded 12 players (player1@puzzle.com to player12@puzzle.com)");

  // 3. Seed Puzzles for July 12, July 13, July 14
  const puzzle12 = await prisma.puzzle.create({
    data: {
      title: "July 12 Crossword",
      publishDate: getESTStartOfDay("2026-07-12"),
      rows: 4,
      columns: 4,
      difficulty: "EASY",
      status: "PUBLISHED",
      dailyPrize: "$10 Cash",
      winnerSelected: true,
      winnerSelectedAt: new Date("2026-07-12T12:00:00Z"),
      createdById: admin.id,
    }
  });

  const puzzle13 = await prisma.puzzle.create({
    data: {
      title: "July 13 Crossword",
      publishDate: getESTStartOfDay("2026-07-13"),
      rows: 4,
      columns: 4,
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      dailyPrize: "$20 Voucher",
      winnerSelected: false,
      createdById: admin.id,
    }
  });

  const puzzle14 = await prisma.puzzle.create({
    data: {
      title: "July 14 Crossword",
      publishDate: getESTStartOfDay("2026-07-14"),
      rows: 4,
      columns: 4,
      difficulty: "HARD",
      status: "PUBLISHED",
      dailyPrize: "$50 Amazon Card",
      winnerSelected: false,
      createdById: admin.id,
    }
  });
  console.log("✅ Seeded puzzles for July 12, 13, and 14");

  // 4. Seed Settings
  await prisma.setting.create({
    data: {
      websiteName: "Crossword Daily Platform",
      supportEmail: "support@puzzle.com",
    }
  });

  // 5. Seed Attempts for July 12: Players 1, 2, 3, 4, 5
  // Player 3 (index 2) is the winner
  const attempts12 = [];
  for (let i = 0; i < 5; i++) {
    const player = players[i];
    const isWinner = i === 2; // Player 3
    const attempt = await prisma.puzzleAttempt.create({
      data: {
        puzzleId: puzzle12.id,
        userId: player.id,
        name: player.name,
        email: player.email,
        playDate: new Date("2026-07-12T10:00:00Z"),
        createdAt: new Date("2026-07-12T10:00:00Z"),
        completed: true,
        durationSeconds: 300,
        status: isWinner ? "WINNER" : "ELIGIBLE",
        deviceId: `dev-${player.username}`,
      }
    });
    attempts12.push(attempt);
  }

  // Create PuzzleWinner record for Player 3
  await prisma.puzzleWinner.create({
    data: {
      puzzleId: puzzle12.id,
      userId: players[2].id,
      attemptId: attempts12[2].id,
      winnerType: "PUZZLE",
      selectionType: "RANDOM",
      reward: "July 12 Prize",
      announcedAt: new Date("2026-07-12T12:00:00Z"),
      claimedAt: new Date("2026-07-12T13:00:00Z"),
      status: "CLAIMED",
    }
  });
  console.log("✅ Seeded July 12 attempts & winner (Player 3)");

  // 6. Seed Attempts for July 13: Players 6, 7, 8, 9, 10 (Draw pending)
  for (let i = 5; i < 10; i++) {
    const player = players[i];
    await prisma.puzzleAttempt.create({
      data: {
        puzzleId: puzzle13.id,
        userId: player.id,
        name: player.name,
        email: player.email,
        playDate: new Date("2026-07-13T14:00:00Z"),
        createdAt: new Date("2026-07-13T14:00:00Z"),
        completed: true,
        durationSeconds: 320,
        status: "ELIGIBLE",
        deviceId: `dev-${player.username}`,
      }
    });
  }
  console.log("✅ Seeded July 13 attempts (Players 6 to 10)");

  // 7. Seed Attempts for July 14: Players 11, 12 (Draw pending)
  for (let i = 10; i < 12; i++) {
    const player = players[i];
    await prisma.puzzleAttempt.create({
      data: {
        puzzleId: puzzle14.id,
        userId: player.id,
        name: player.name,
        email: player.email,
        playDate: new Date("2026-07-14T09:00:00Z"),
        createdAt: new Date("2026-07-14T09:00:00Z"),
        completed: true,
        durationSeconds: 280,
        status: "ELIGIBLE",
        deviceId: `dev-${player.username}`,
      }
    });
  }
  console.log("✅ Seeded July 14 attempts (Players 11 and 12)");

  console.log("\n🚀 Custom seeding completed successfully!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
