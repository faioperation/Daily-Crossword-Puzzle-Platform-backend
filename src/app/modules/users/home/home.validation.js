import { z } from "zod";

const startAttemptSchema = z.object({
  body: z.object({
    deviceId: z.string().optional(),
    fingerprint: z.string().optional(),
  }),
});

const checkAttemptSchema = z.object({
  body: z.object({
    attemptId: z
      .string({ required_error: "attemptId is required" })
      .uuid("attemptId must be a valid UUID"),
    filledCells: z.array(z.array(z.string())),
  }),
});

const submitAttemptSchema = z.object({
  body: z.object({
    attemptId: z
      .string({ required_error: "attemptId is required" })
      .uuid("attemptId must be a valid UUID"),
    filledCells: z.array(z.array(z.string())),
    durationSeconds: z.number().optional(),
  }),
});

export const HomeValidation = {
  startAttemptSchema,
  checkAttemptSchema,
  submitAttemptSchema,
};
