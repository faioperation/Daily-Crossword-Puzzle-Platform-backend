import { Router } from "express";
import { SettingsController } from "./settings.controller.js";
import { SettingsValidation } from "./settings.validation.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { uploadSettingsLogo, uploadAvatar } from "../../../config/multer.config.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.use(checkAuthMiddleware(Role.SYSTEM_OWNER));

router.get("/", SettingsController.getSettings);

router.patch(
  "/",
  uploadSettingsLogo.single("logo"),
  validateRequest(SettingsValidation.updateSettingsSchema),
  SettingsController.updateSettings,
);

router.patch(
  "/profile",
  uploadAvatar.single("avatar"),
  validateRequest(SettingsValidation.updateAdminProfileSchema),
  SettingsController.updateAdminProfile,
);

export const SettingsRouter = router;
