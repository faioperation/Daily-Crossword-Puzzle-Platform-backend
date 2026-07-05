import { z } from "zod";

const submitAttemptSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "name is required" }).min(1, "name cannot be empty"),
    email: z.string({ required_error: "email is required" }).email("email must be a valid email address"),
    phone: z.string().optional().nullable(),
    date: z.string({ required_error: "date is required" }).min(1, "date cannot be empty"),
    type: z.enum(["PUZZLE", "ALTERNATE"], {
      required_error: "type is required and must be either PUZZLE or ALTERNATE",
    }),
    durationSeconds: z.number({ required_error: "durationSeconds is required" }),
  }),
});

export const HomeValidation = {
  submitAttemptSchema,
};

