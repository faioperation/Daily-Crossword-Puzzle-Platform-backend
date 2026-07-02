import { z } from "zod";

const getEntriesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    date: z.string().optional(),
    status: z.enum(["ELIGIBLE", "DISQUALIFIED", "WINNER"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const EntriesValidation = {
  getEntriesSchema,
};
