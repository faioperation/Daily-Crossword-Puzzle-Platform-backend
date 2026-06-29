import { z } from "zod";

const createPuzzleSchema = z.object({
  body: z.object({
    puzzleName: z.string({
      required_error: "puzzleName is required",
    }).min(1, "puzzleName cannot be empty"),
    publishDate: z.string().datetime({
      message: "publishDate must be a valid ISO datetime string",
    }).optional().nullable(),
    difficulty: z.enum(["easy", "medium", "hard"], {
      required_error: "difficulty is required (easy, medium, hard)",
    }),
    status: z.enum(["draft", "published"], {
      required_error: "status is required (draft, published)",
    }),
    dailyPrize: z.string({
      required_error: "dailyPrize is required",
    }).min(1, "dailyPrize cannot be empty"),
    row: z.number({
      required_error: "row is required",
    }).int().positive("row must be a positive integer").max(7, "row must be at most 7"),
    column: z.number({
      required_error: "column is required",
    }).int().positive("column must be a positive integer").max(7, "column must be at most 7"),
  }),
});

const updatePuzzleSchema = z.object({
  body: z.object({
    puzzleName: z.string().min(1, "puzzleName cannot be empty").optional(),
    publishDate: z.string().datetime({
      message: "publishDate must be a valid ISO datetime string",
    }).optional().nullable(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    status: z.enum(["draft", "published"]).optional(),
    dailyPrize: z.string().min(1, "dailyPrize cannot be empty").optional(),
    row: z.number().int().positive("row must be a positive integer").max(7, "row must be at most 7").optional(),
    column: z.number().int().positive("column must be a positive integer").max(7, "column must be at most 7").optional(),
  }),
});

export const PuzzleCreateValidation = {
  createPuzzleSchema,
  updatePuzzleSchema,
};
