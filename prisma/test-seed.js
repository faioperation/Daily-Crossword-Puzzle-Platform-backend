import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing existing database data...");

  // Delete in order to satisfy foreign key constraints
  await prisma.puzzleWinner.deleteMany({});
  await prisma.puzzleAnswer.deleteMany({});
  await prisma.puzzleAttempt.deleteMany({});
  await prisma.puzzle.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.setting.deleteMany({});

  console.log("🌱 Database cleared. Starting seed...");

  const hashedPassword = await bcrypt.hash("123456", 12);

  // 1. Seed Users (1 Admin, 10 Regular Users)
  console.log("👤 Seeding users...");
  const admin = await prisma.user.create({
    data: {
      name: "System Owner Admin",
      username: "admin",
      email: "admin@puzzle.com",
      password: hashedPassword,
      role: "SYSTEM_OWNER",
      isActive: true,
      isVerified: true,
    },
  });

  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Test User ${i}`,
        username: `testuser${i}`,
        email: `user${i}@puzzle.com`,
        password: hashedPassword,
        role: "USER",
        isActive: true,
        isVerified: i <= 8, // Seed 8 verified users and 2 unverified users
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=user${i}`,
      },
    });
    users.push(user);
  }

  // 2. Seed Settings
  console.log("⚙️ Seeding settings...");
  await prisma.setting.create({
    data: {
      websiteName: "Crossword Daily Platform",
      supportEmail: "support@puzzle.com",
      logo: "/uploads/settings/default-logo.png",
    },
  });

  // 3. Seed Puzzles (5 Puzzles with Custom Grid/Clues JSON Structure)
  console.log("🧩 Seeding puzzles...");
  const puzzleData = [
    {
      title: "Quick 3x3 Daily Crossword",
      description: "A fun and simple 3x3 crossword puzzle.",
      difficulty: "EASY",
      status: "PUBLISHED",
      dailyPrize: "Amazon Gift Card $10",
      rows: 3,
      columns: 3,
      publishDate: new Date("2026-07-01T12:00:00.000Z"),
      cells: [
        [
          { isBlack: false, letter: "C", clueNum: 1 },
          { isBlack: false, letter: "A", clueNum: 2 },
          { isBlack: false, letter: "T", clueNum: 3 }
        ],
        [
          { isBlack: false, letter: "O", clueNum: 4 },
          { isBlack: true,  letter: "",  clueNum: null },
          { isBlack: false, letter: "O", clueNum: null }
        ],
        [
          { isBlack: false, letter: "W", clueNum: 5 },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "D", clueNum: null }
        ]
      ],
      clues: [
        { id: "1-Across", direction: "Across", number: 1, answer: "CAT", text: "Feline domestic pet." },
        { id: "4-Across", direction: "Across", number: 4, answer: "O", text: "Single letter." },
        { id: "5-Across", direction: "Across", number: 5, answer: "WED", text: "Marry or combine." },
        { id: "1-Down", direction: "Down", number: 1, answer: "COW", text: "Domestic farm animal producing milk." },
        { id: "2-Down", direction: "Down", number: 2, answer: "AE", text: "First two vowels in alphabetical order." },
        { id: "3-Down", direction: "Down", number: 3, answer: "TOD", text: "An old-school term for a fox." }
      ]
    },
    {
      title: "Mini Crossword 4x4",
      description: "A solid 4x4 grid crossword puzzle.",
      difficulty: "EASY",
      status: "PUBLISHED",
      dailyPrize: "PlayStation Store Voucher $15",
      rows: 4,
      columns: 4,
      publishDate: new Date("2026-07-02T12:00:00.000Z"),
      cells: [
        [
          { isBlack: false, letter: "B", clueNum: 1 },
          { isBlack: false, letter: "A", clueNum: 2 },
          { isBlack: false, letter: "L", clueNum: 3 },
          { isBlack: false, letter: "L", clueNum: 4 }
        ],
        [
          { isBlack: false, letter: "A", clueNum: 5 },
          { isBlack: false, letter: "R", clueNum: null },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "A", clueNum: null }
        ],
        [
          { isBlack: false, letter: "L", clueNum: 6 },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "A", clueNum: null },
          { isBlack: false, letter: "D", clueNum: null }
        ],
        [
          { isBlack: false, letter: "L", clueNum: 7 },
          { isBlack: false, letter: "A", clueNum: null },
          { isBlack: false, letter: "D", clueNum: null },
          { isBlack: false, letter: "Y", clueNum: null }
        ]
      ],
      clues: [
        { id: "1-Across", direction: "Across", number: 1, answer: "BALL", text: "A round object used in many sports." },
        { id: "5-Across", direction: "Across", number: 5, answer: "AREA", text: "A particular region or space." },
        { id: "6-Across", direction: "Across", number: 6, answer: "LEAD", text: "To guide or go in front." },
        { id: "7-Across", direction: "Across", number: 7, answer: "LADY", text: "An adult woman." },
        { id: "1-Down", direction: "Down", number: 1, answer: "BALL", text: "A toy or sports object that is thrown, kicked, or hit." },
        { id: "2-Down", direction: "Down", number: 2, answer: "AREA", text: "The amount of space inside a boundary." },
        { id: "3-Down", direction: "Down", number: 3, answer: "LEAD", text: "To be the first or to direct others." },
        { id: "4-Down", direction: "Down", number: 4, answer: "LADY", text: "A polite term for a woman." }
      ]
    },
    {
      title: "Friday Challenge 5x5",
      description: "Medium difficulty 5x5 puzzle challenge.",
      difficulty: "MEDIUM",
      status: "PUBLISHED",
      dailyPrize: "iPad Mini 64GB",
      rows: 5,
      columns: 5,
      publishDate: new Date("2026-07-03T12:00:00.000Z"),
      cells: [
        [
          { isBlack: false, letter: "A", clueNum: 1 },
          { isBlack: false, letter: "B", clueNum: 2 },
          { isBlack: false, letter: "O", clueNum: 3 },
          { isBlack: false, letter: "U", clueNum: 4 },
          { isBlack: false, letter: "T", clueNum: 5 }
        ],
        [
          { isBlack: false, letter: "B", clueNum: 6 },
          { isBlack: false, letter: "A", clueNum: null },
          { isBlack: false, letter: "K", clueNum: null },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "R", clueNum: null }
        ],
        [
          { isBlack: false, letter: "O", clueNum: 7 },
          { isBlack: false, letter: "K", clueNum: null },
          { isBlack: false, letter: "A", clueNum: null },
          { isBlack: false, letter: "S", clueNum: null },
          { isBlack: false, letter: "Y", clueNum: null }
        ],
        [
          { isBlack: false, letter: "V", clueNum: 8 },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "P", clueNum: null },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "E", clueNum: null }
        ],
        [
          { isBlack: false, letter: "E", clueNum: 9 },
          { isBlack: false, letter: "R", clueNum: null },
          { isBlack: false, letter: "I", clueNum: null },
          { isBlack: false, letter: "N", clueNum: null },
          { isBlack: false, letter: "S", clueNum: null }
        ]
      ],
      clues: [
        { id: "1-Across", direction: "Across", number: 1, answer: "ABOUT", text: "Concerning or approximately." },
        { id: "6-Across", direction: "Across", number: 6, answer: "BAKER", text: "A person who makes bread and cakes." },
        { id: "7-Across", direction: "Across", number: 7, answer: "OKASY", text: "A scrambled word meaning okay." },
        { id: "8-Across", direction: "Across", number: 8, answer: "VEPEE", text: "Vice President abbreviation spelling." },
        { id: "9-Across", direction: "Across", number: 9, answer: "ERINS", text: "Poetic name for Irelands." }
      ]
    },
    {
      title: "Draft Boarding Puzzle",
      description: "This is a draft crossword puzzle not visible to regular users.",
      difficulty: "HARD",
      status: "DRAFT",
      dailyPrize: "iPhone 15 Pro Max",
      rows: 4,
      columns: 4,
      publishDate: null,
      cells: [
        [
          { isBlack: false, letter: "W", clueNum: 1 },
          { isBlack: false, letter: "O", clueNum: 2 },
          { isBlack: false, letter: "R", clueNum: 3 },
          { isBlack: false, letter: "D", clueNum: 4 }
        ],
        [
          { isBlack: false, letter: "O", clueNum: 5 },
          { isBlack: true,  letter: "",  clueNum: null },
          { isBlack: false, letter: "I", clueNum: null },
          { isBlack: false, letter: "E" }
        ],
        [
          { isBlack: false, letter: "R", clueNum: 6 },
          { isBlack: false, letter: "O", clueNum: null },
          { isBlack: false, letter: "D", clueNum: null },
          { isBlack: false, letter: "A" }
        ],
        [
          { isBlack: false, letter: "K", clueNum: 7 },
          { isBlack: false, letter: "T", clueNum: null },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "F" }
        ]
      ],
      clues: [
        { id: "1-Across", direction: "Across", number: 1, answer: "WORD", text: "A single distinct meaningful element of writing." },
        { id: "1-Down", direction: "Down", number: 1, answer: "WORK", text: "Activity involving mental or physical effort." }
      ]
    },
    {
      title: "Archived Classic 3x3",
      description: "An old puzzle that is now archived.",
      difficulty: "MEDIUM",
      status: "ARCHIVED",
      dailyPrize: "Starbucks Card $5",
      rows: 3,
      columns: 3,
      publishDate: new Date("2026-06-25T12:00:00.000Z"),
      cells: [
        [
          { isBlack: false, letter: "A", clueNum: 1 },
          { isBlack: false, letter: "N", clueNum: 2 },
          { isBlack: false, letter: "T", clueNum: 3 }
        ],
        [
          { isBlack: false, letter: "P", clueNum: 4 },
          { isBlack: true,  letter: "",  clueNum: null },
          { isBlack: false, letter: "A", clueNum: null }
        ],
        [
          { isBlack: false, letter: "E", clueNum: 5 },
          { isBlack: false, letter: "E", clueNum: null },
          { isBlack: false, letter: "R", clueNum: null }
        ]
      ],
      clues: [
        { id: "1-Across", direction: "Across", number: 1, answer: "ANT", text: "Tiny crawling social insect." }
      ]
    }
  ];

  const puzzles = [];
  for (const p of puzzleData) {
    const puzzle = await prisma.puzzle.create({
      data: {
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        status: p.status,
        dailyPrize: p.dailyPrize,
        rows: p.rows,
        columns: p.columns,
        publishDate: p.publishDate,
        cells: p.cells,
        clues: p.clues,
        createdById: admin.id,
      },
    });
    puzzles.push(puzzle);
  }

  // 4. Seed PuzzleAttempts
  console.log("🎮 Seeding puzzle attempts...");
  const browserList = ["Chrome", "Firefox", "Safari", "Edge"];
  const osList = ["Windows", "macOS", "iOS", "Android"];

  const firstPublishedPuzzle = puzzles[0]; // 3x3 puzzle
  const secondPublishedPuzzle = puzzles[1]; // 4x4 puzzle

  // Seed attempts for 3x3 Puzzle
  for (let i = 0; i < 8; i++) {
    const user = users[i];
    const duration = Math.floor(Math.random() * 120) + 30; // 30s to 150s

    await prisma.puzzleAttempt.create({
      data: {
        puzzleId: firstPublishedPuzzle.id,
        userId: user.id,
        deviceId: `device-fingerprint-${user.username}`,
        fingerprint: `fp-${user.username}-${i}`,
        ipAddress: `192.168.1.${10 + i}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        browser: browserList[i % 4],
        os: osList[i % 4],
        playDate: new Date(),
        startedAt: new Date(Date.now() - duration * 1000),
        completedAt: new Date(),
        durationSeconds: duration,
        completed: true,
        score: Math.floor(Math.random() * 50) + 50,
        wrongAttempts: Math.floor(Math.random() * 3),
        hintsUsed: Math.floor(Math.random() * 2),
        status: "ELIGIBLE", // Eligible for winners draw initially
      },
    });
  }

  // Seed attempts for 4x4 Puzzle
  for (let i = 0; i < 5; i++) {
    const user = users[i];
    const duration = Math.floor(Math.random() * 300) + 60; // 60s to 360s

    const attempt = await prisma.puzzleAttempt.create({
      data: {
        puzzleId: secondPublishedPuzzle.id,
        userId: user.id,
        deviceId: `device-fingerprint-${user.username}-p2`,
        fingerprint: `fp-${user.username}-p2-${i}`,
        ipAddress: `192.168.1.${50 + i}`,
        browser: browserList[(i + 1) % 4],
        os: osList[(i + 1) % 4],
        playDate: new Date(),
        startedAt: new Date(Date.now() - duration * 1000),
        completedAt: new Date(),
        durationSeconds: duration,
        completed: true,
        score: Math.floor(Math.random() * 60) + 40,
        status: i === 0 ? "WINNER" : "ELIGIBLE", // Seed one attempt already marked as Winner
      },
    });

    // Seed PuzzleAnswers for one successful attempt
    if (i === 0) {
      console.log("📝 Seeding puzzle answers for successful attempt...");
      // Let's seed answers matching the 4x4 BALL grid cells
      const cellsToAnswer = [
        { r: 0, c: 0, l: "B" },
        { r: 0, c: 1, l: "A" },
        { r: 0, c: 2, l: "L" },
        { r: 0, c: 3, l: "L" },
      ];
      for (const item of cellsToAnswer) {
        await prisma.puzzleAnswer.create({
          data: {
            attemptId: attempt.id,
            row: item.r,
            column: item.c,
            enteredLetter: item.l,
            isCorrect: true,
          },
        });
      }

      // Seed corresponding PuzzleWinner record
      console.log("🏆 Seeding puzzle winner records...");
      await prisma.puzzleWinner.create({
        data: {
          puzzleId: secondPublishedPuzzle.id,
          userId: user.id,
          attemptId: attempt.id,
          status: "PENDING",
          winnerType: "PUZZLE",
          selectionType: "RANDOM",
          reward: secondPublishedPuzzle.dailyPrize,
          announcedAt: new Date(),
        },
      });
    }
  }

  console.log("🚀 Database test seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error running test seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
