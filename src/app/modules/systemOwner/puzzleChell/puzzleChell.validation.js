import { z } from "zod";

const createCellSchema = z.object({
  body: z.object({
    cells: z.array(
      z.object({
        row: z.number({
          required_error: "row is required",
        }).int().nonnegative("row must be a non-negative integer"),
        column: z.number({
          required_error: "column is required",
        }).int().nonnegative("column must be a non-negative integer"),
        letter: z.string().length(1, "letter must be exactly 1 character").optional().nullable(),
        isBlack: z.boolean().optional().default(false),
        number: z.number().int().positive("number must be a positive integer").optional().nullable(),
      })
    ).min(1, "cells array cannot be empty"),
  }),
});

const updateCellSchema = z.object({
  body: z.object({
    row: z.number().int().nonnegative("row must be a non-negative integer").optional(),
    column: z.number().int().nonnegative("column must be a non-negative integer").optional(),
    letter: z.string().length(1, "letter must be exactly 1 character").optional().nullable(),
    isBlack: z.boolean().optional(),
    number: z.number().int().positive("number must be a positive integer").optional().nullable(),
  }),
});

export const PuzzleCellValidation = {
  createCellSchema,
  updateCellSchema,
};
