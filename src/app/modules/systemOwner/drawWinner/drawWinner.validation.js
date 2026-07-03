import { z } from "zod";

const getEligibleEntriesSchema = z.object({
  query: z.object({
    puzzleId: z.string().uuid("puzzleId must be a valid UUID").optional(),
    type: z.enum(["ALL", "PUZZLE", "ALTERNATE"]).optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const drawRandomWinnerSchema = z.object({
  body: z.object({
    attemptId: z
      .string({ required_error: "attemptId is required" })
      .uuid("attemptId must be a valid UUID"),
  }),
});

const drawManualWinnerSchema = z.object({
  body: z.object({
    attemptId: z
      .string({ required_error: "attemptId is required" })
      .uuid("attemptId must be a valid UUID"),
  }),
});

export const DrawWinnerValidation = {
  getEligibleEntriesSchema,
  drawRandomWinnerSchema,
  drawManualWinnerSchema,
};
