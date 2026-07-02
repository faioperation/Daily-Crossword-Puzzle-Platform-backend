import { Router } from "express";
import { EntriesController } from "./entries.controller.js";
import { EntriesValidation } from "./entries.validation.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.get(
  "/",
  validateRequest(EntriesValidation.getEntriesSchema),
  EntriesController.getEntries,
);

export const EntriesRouter = router;
