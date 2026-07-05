import { z } from "zod";

const submitAttemptSchema = z.object({
  body: z.object({
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    durationSeconds: z.number({ required_error: "durationSeconds is required" }),
  }),
});

export const HomeValidation = {
  submitAttemptSchema,
};

