import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import crypto from "crypto";

const getActivePuzzle = async (prisma, userId) => {
  // 1. Find today's puzzle (publishDate matches today's date in UTC boundaries)
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);

  let puzzle = await prisma.puzzle.findFirst({
    where: {
      status: "PUBLISHED",
      publishDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      publishDate: "desc",
    },
  });

  // Fallback to the latest published puzzle overall if none published today
  if (!puzzle) {
    puzzle = await prisma.puzzle.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishDate: "desc" },
    });
  }

  if (!puzzle) {
    throw new DevBuildError(
      "No active puzzle available today.",
      StatusCodes.NOT_FOUND,
    );
  }

  // 2. Fetch the user's attempt for this puzzle if a userId is provided
  const attempt = userId
    ? await prisma.puzzleAttempt.findFirst({
        where: {
          puzzleId: puzzle.id,
          userId: userId,
        },
        include: {
          winner: true,
          answers: true,
        },
      })
    : null;

  // 3. To prevent client-side inspect-element cheating, we strip solution characters
  // from the grid cells and clues unless the attempt is already completed.
  const isCompleted = attempt?.completed === true;
  let responseCells = puzzle.cells;
  let responseClues = puzzle.clues;

  if (!isCompleted) {
    // Strip solution letters from the 2D cells grid
    responseCells = puzzle.cells
      ? puzzle.cells.map((row) =>
          row.map((cell) => {
            if (cell.isBlack) {
              return { isBlack: true, letter: "", clueNum: null };
            }
            return { isBlack: false, clueNum: cell.clueNum, letter: "" };
          }),
        )
      : [];

    // Strip answers from clues array, providing only their lengths
    responseClues = puzzle.clues
      ? puzzle.clues.map((clue) => {
          const { answer, ...clueDetails } = clue;
          return {
            ...clueDetails,
            answerLength: answer ? answer.length : 0,
          };
        })
      : [];
  }

  return {
    puzzle: {
      id: puzzle.id,
      title: puzzle.title,
      description: puzzle.description,
      rows: puzzle.rows,
      columns: puzzle.columns,
      rules: puzzle.rules,
      difficulty: puzzle.difficulty,
      dailyPrize: puzzle.dailyPrize,
      winnerSelected: puzzle.winnerSelected,
      cells: responseCells,
      clues: responseClues,
    },
    attempt: attempt
      ? {
          id: attempt.id,
          displayId: attempt.displayId,
          completed: attempt.completed,
          score: attempt.score,
          wrongAttempts: attempt.wrongAttempts,
          hintsUsed: attempt.hintsUsed,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          durationSeconds: attempt.durationSeconds,
          status: attempt.status,
          hasWon: !!attempt.winner,
          answers: attempt.answers ? attempt.answers.answers : null,
        }
      : null,
  };
};

const startAttempt = async (prisma, userId, devicePayload) => {
  const { deviceId, fingerprint, ipAddress, userAgent, browser, os } =
    devicePayload;

  // Resolve today's active puzzle
  const activePuzzleData = await getActivePuzzle(prisma, null);
  const puzzleId = activePuzzleData.puzzle.id;

  // Check if there is already an attempt for this user
  let attempt = await prisma.puzzleAttempt.findFirst({
    where: {
      puzzleId: puzzleId,
      userId: userId,
    },
  });

  if (!attempt) {
    const attemptId = crypto.randomUUID();
    const displayId = `ENT-${attemptId.slice(-4).toUpperCase()}`;

    attempt = await prisma.puzzleAttempt.create({
      data: {
        id: attemptId,
        displayId,
        puzzleId: puzzleId,
        userId: userId,
        deviceId: deviceId || "unknown",
        fingerprint: fingerprint || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        browser: browser || null,
        os: os || null,
        playDate: new Date(),
        startedAt: new Date(),
        completed: false,
      },
    });
  }

  return attempt;
};

const checkAttempt = async (prisma, userId, payload) => {
  const { attemptId, filledCells } = payload;

  const attempt = await prisma.puzzleAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new DevBuildError(
      "Attempt not found or access denied",
      StatusCodes.NOT_FOUND,
    );
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: attempt.puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const correctCells = puzzle.cells;
  const feedback = [];
  let hasWrong = false;

  for (let r = 0; r < correctCells.length; r++) {
    const rowFeedback = [];
    for (let c = 0; c < correctCells[r].length; c++) {
      const correctCell = correctCells[r][c];
      const userCellLetter =
        filledCells && filledCells[r] && filledCells[r][c]
          ? filledCells[r][c]
          : "";

      if (correctCell.isBlack) {
        rowFeedback.push({ isBlack: true, correct: true });
      } else {
        const isMatch =
          correctCell.letter.toUpperCase() === userCellLetter.toUpperCase();
        if (!isMatch && userCellLetter !== "") {
          hasWrong = true;
        }
        rowFeedback.push({
          isBlack: false,
          clueNum: correctCell.clueNum,
          correct: isMatch,
          empty: userCellLetter === "",
        });
      }
    }
    feedback.push(rowFeedback);
  }

  // Increment wrongAttempts in database if there are incorrect filled letters
  if (hasWrong) {
    await prisma.puzzleAttempt.update({
      where: { id: attemptId },
      data: { wrongAttempts: { increment: 1 } },
    });
  }

  return { feedback };
};

const submitAttempt = async (prisma, userId, payload) => {
  const { attemptId, filledCells, durationSeconds } = payload;

  const attempt = await prisma.puzzleAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new DevBuildError(
      "Attempt not found or access denied",
      StatusCodes.NOT_FOUND,
    );
  }

  if (attempt.completed) {
    throw new DevBuildError(
      "This attempt has already been successfully solved and submitted.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const puzzle = await prisma.puzzle.findUnique({
    where: { id: attempt.puzzleId },
  });

  if (!puzzle) {
    throw new DevBuildError("Puzzle not found", StatusCodes.NOT_FOUND);
  }

  const correctCells = puzzle.cells;
  let isFullyCorrect = true;

  for (let r = 0; r < correctCells.length; r++) {
    for (let c = 0; c < correctCells[r].length; c++) {
      const correctCell = correctCells[r][c];
      if (correctCell.isBlack) continue;

      const userLetter =
        filledCells && filledCells[r] && filledCells[r][c]
          ? filledCells[r][c]
          : "";
      const isCorrect =
        correctCell.letter.toUpperCase() === userLetter.toUpperCase();

      if (!isCorrect) {
        isFullyCorrect = false;
        break;
      }
    }
    if (!isFullyCorrect) break;
  }

  if (!isFullyCorrect) {
    return {
      success: false,
      message:
        "The crossword grid is incorrect or incomplete. Please check your entries.",
    };
  }

  // Compute final score dynamically
  const score = Math.max(
    20,
    100 - attempt.hintsUsed * 5 - attempt.wrongAttempts * 2,
  );

  const updatedAttempt = await prisma.puzzleAttempt.update({
    where: { id: attemptId },
    data: {
      completed: true,
      completedAt: new Date(),
      durationSeconds:
        durationSeconds ||
        Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000),
      score,
    },
  });

  // Save/update user answers inside the PuzzleAnswer table (1-to-1 relationship)
  await prisma.puzzleAnswer.upsert({
    where: { attemptId },
    update: { answers: filledCells },
    create: {
      attemptId,
      answers: filledCells,
    },
  });

  return {
    success: true,
    message: "Congratulations! You successfully solved the puzzle!",
    attempt: updatedAttempt,
  };
};

export const HomeService = {
  getActivePuzzle,
  startAttempt,
  checkAttempt,
  submitAttempt,
};
