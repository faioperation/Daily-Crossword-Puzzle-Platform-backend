import { Router } from "express";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { UsersRouter } from "../modules/users/users.route.js";

export const router = Router();
const moduleRoutes = [
  {
    path: "/otp",
    route: OtpRouter,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/users",
    route: UsersRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
