import { z } from "zod";

const updateSettingsSchema = z.object({
  body: z.object({
    websiteName: z.string().min(1, "Website name cannot be empty").optional(),
    supportEmail: z.string().email("Invalid support email address").optional(),
  }),
});

export const SettingsValidation = {
  updateSettingsSchema,
};
