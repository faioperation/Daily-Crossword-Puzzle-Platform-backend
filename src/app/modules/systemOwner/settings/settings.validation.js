import { z } from "zod";

const updateSettingsSchema = z.object({
  body: z.object({
    websiteName: z.string().min(1, "Website name cannot be empty").optional(),
    supportEmail: z.string().email("Invalid support email address").optional(),
  }),
});

const updateAdminProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().optional(),
  }),
});

export const SettingsValidation = {
  updateSettingsSchema,
  updateAdminProfileSchema,
};
