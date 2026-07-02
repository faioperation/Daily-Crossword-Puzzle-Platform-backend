import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

async function main() {
  const prisma = new PrismaClient();
  console.log("🌱 Starting one-time database seeding for testing...");

  try {
    const adminEmail = "admin@puzzle.com";
    const defaultPassword = "123456";

    // 1. Seed or find System Owner
    let owner = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!owner) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      owner = await prisma.user.create({
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
      console.log("ℹ️ System Owner already exists");
    }

    // 2. Seed normal users
    const userPassword = await bcrypt.hash("password123", 12);
    const usersToSeed = [
      { name: "John Doe", username: "johndoe", email: "john@example.com" },
      { name: "Jane Smith", username: "janesmith", email: "jane@example.com" },
      { name: "Alice Johnson", username: "alicej", email: "alice@example.com" },
    ];

    const seededUsers = [];
    for (const u of usersToSeed) {
      let dbUser = await prisma.user.findUnique({ where: { email: u.email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            name: u.name,
            username: u.username,
            email: u.email,
            password: userPassword,
            role: "USER",
            isActive: true,
            isVerified: true,
          },
        });
        console.log(`✅ Seeded User: ${u.email}`);
      } else {
        console.log(`ℹ️ User ${u.email} already exists`);
      }
      seededUsers.push(dbUser);
    }

    // 3. Seed Puzzles
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const puzzlesToSeed = [
      {
        title: "Today's Daily Crossword",
        description: "A fun puzzle for today",
        rows: 5,
        columns: 5,
        difficulty: "EASY",
        status: "PUBLISHED",
        publishDate: today,
        dailyPrize: "Amazon Gift Card $10",
        createdById: owner.id,
      },
      {
        title: "Yesterday's Classic Crossword",
        description: "Yesterday's crossword challenge",
        rows: 5,
        columns: 5,
        difficulty: "MEDIUM",
        status: "PUBLISHED",
        publishDate: yesterday,
        dailyPrize: "Special Badge",
        createdById: owner.id,
      },
    ];

    const seededPuzzles = [];
    for (const p of puzzlesToSeed) {
      let dbPuzzle = await prisma.puzzle.findFirst({
        where: { title: p.title },
      });
      if (!dbPuzzle) {
        dbPuzzle = await prisma.puzzle.create({
          data: p,
        });
        console.log(`✅ Seeded Puzzle: ${p.title}`);
      } else {
        console.log(`ℹ️ Puzzle ${p.title} already exists`);
      }
      seededPuzzles.push(dbPuzzle);
    }

    // 4. Seed Puzzle Attempts
    const todayPuzzle = seededPuzzles[0] || await prisma.puzzle.findFirst({ where: { title: "Today's Daily Crossword" } });
    const yesterdayPuzzle = seededPuzzles[1] || await prisma.puzzle.findFirst({ where: { title: "Yesterday's Classic Crossword" } });

    const attemptsToSeed = [
      // John completed today's puzzle
      {
        puzzleId: todayPuzzle.id,
        userId: seededUsers[0]?.id || (await prisma.user.findUnique({ where: { email: "john@example.com" } })).id,
        deviceId: "dev-john-today",
        playDate: today,
        isTester: false,
        completed: true,
        durationSeconds: 150,
        score: 100,
      },
      // Jane completed today's puzzle
      {
        puzzleId: todayPuzzle.id,
        userId: seededUsers[1]?.id || (await prisma.user.findUnique({ where: { email: "jane@example.com" } })).id,
        deviceId: "dev-jane-today",
        playDate: today,
        isTester: false,
        completed: true,
        durationSeconds: 220,
        score: 100,
      },
      // Alice started but did not complete today's puzzle
      {
        puzzleId: todayPuzzle.id,
        userId: seededUsers[2]?.id || (await prisma.user.findUnique({ where: { email: "alice@example.com" } })).id,
        deviceId: "dev-alice-today",
        playDate: today,
        isTester: false,
        completed: false,
        score: 40,
      },
      // John completed yesterday's puzzle
      {
        puzzleId: yesterdayPuzzle.id,
        userId: seededUsers[0]?.id || (await prisma.user.findUnique({ where: { email: "john@example.com" } })).id,
        deviceId: "dev-john-yesterday",
        playDate: yesterday,
        isTester: false,
        completed: true,
        durationSeconds: 180,
        score: 100,
      },
    ];

    for (const attempt of attemptsToSeed) {
      const existingAttempt = await prisma.puzzleAttempt.findFirst({
        where: {
          puzzleId: attempt.puzzleId,
          userId: attempt.userId,
          deviceId: attempt.deviceId,
        },
      });

      if (!existingAttempt) {
        await prisma.puzzleAttempt.create({
          data: attempt,
        });
        console.log(`✅ Seeded Attempt for User ID: ${attempt.userId} on Puzzle ID: ${attempt.puzzleId}`);
      } else {
        console.log(`ℹ️ Attempt for User ID: ${attempt.userId} on Puzzle ID: ${attempt.puzzleId} already exists`);
      }
    }

    console.log("🎉 Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Error during one-time seeding:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
