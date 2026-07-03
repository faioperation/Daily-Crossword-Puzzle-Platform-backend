import { z } from "zod";

const updatePrizeStatusSchema = z.object({
  body: z.object({
    prizeStatus: z.enum(["EMAIL_SENT", "ADDRESS_RECEIVED", "PRIZE_SHIPPED"], {
      required_error: "prizeStatus is required",
      invalid_type_error:
        "prizeStatus must be EMAIL_SENT, ADDRESS_RECEIVED, or PRIZE_SHIPPED",
    }),
  }),
});

export const PrizeManagementValidation = {
  updatePrizeStatusSchema,
};
