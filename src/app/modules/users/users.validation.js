import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain alphanumeric characters and underscores",
  )
  .transform((val) => val.trim().toLowerCase());

const signupSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: "Name is required" }),
      username: usernameSchema,
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      confirm_password: z.string({
        required_error: "Confirm password is required",
      }),
      role: z.enum(["SYSTEM_OWNER", "USER"]).optional(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    username: usernameSchema.optional(),
    avatar: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: "isActive status is required" }),
  }),
});

export const UsersValidation = {
  signupSchema,
  updateProfileSchema,
  updateStatusSchema,
};
