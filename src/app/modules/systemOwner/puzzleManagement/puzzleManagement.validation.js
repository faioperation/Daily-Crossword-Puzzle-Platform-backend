import { z } from "zod";

const cellSchema = z.object({
  isBlack: z.boolean({ required_error: "isBlack status is required" }),
  letter: z.string().optional().nullable(),
  clueNum: z.number().int().nonnegative().optional().nullable(),
});

const clueSchema = z.object({
  id: z.string({ required_error: "clue id is required" }),
  direction: z.string({ required_error: "direction is required" }),
  number: z.number({ required_error: "number is required" }).int().positive(),
  answer: z.string({ required_error: "answer is required" }),
  text: z.string({ required_error: "text is required" }),
});

const createPuzzleSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "title is required" })
      .min(1, "title cannot be empty"),
    date: z.string().optional().nullable(),
    difficulty: z.enum(
      [
        "Easy",
        "Medium",
        "Hard",
        "easy",
        "medium",
        "hard",
        "EASY",
        "MEDIUM",
        "HARD",
      ],
      {
        required_error: "difficulty is required (Easy, Medium, Hard)",
      },
    ),
    status: z.enum(
      [
        "Draft",
        "Published",
        "Archived",
        "draft",
        "published",
        "archived",
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ],
      {
        required_error: "status is required (Draft, Published, Archived)",
      },
    ),
    prize: z
      .string({ required_error: "prize is required" })
      .min(1, "prize cannot be empty"),
    size: z
      .number({ required_error: "size is required" })
      .int()
      .positive("size must be a positive integer"),
    grid: z.array(z.array(cellSchema)).min(1, "grid cannot be empty"),
    clues: z.array(clueSchema).min(1, "clues array cannot be empty"),
  }),
});

const updatePuzzleSchema = z.object({
  body: z.object({
    title: z.string().min(1, "title cannot be empty").optional(),
    date: z.string().optional().nullable(),
    difficulty: z
      .enum([
        "Easy",
        "Medium",
        "Hard",
        "easy",
        "medium",
        "hard",
        "EASY",
        "MEDIUM",
        "HARD",
      ])
      .optional(),
    status: z
      .enum([
        "Draft",
        "Published",
        "Archived",
        "draft",
        "published",
        "archived",
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ])
      .optional(),
    prize: z.string().min(1, "prize cannot be empty").optional(),
    size: z.number().int().positive("size must be a positive integer").optional(),
    grid: z.array(z.array(cellSchema)).optional(),
    clues: z.array(clueSchema).optional(),
  }),
});

export const PuzzleManagementValidation = {
  createPuzzleSchema,
  updatePuzzleSchema,
};
