import { Router } from "express";
import type { RateLimitRequestHandler } from "express-rate-limit";

import { login, logout, me } from "@/controllers/auth.controller";
import { protect } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { catchAsync } from "@/utils/catchAsync";
import { loginSchema } from "@/validations/auth.validation";

export interface AuthRouterOptions {
  loginRateLimiter?: RateLimitRequestHandler;
}

export function createAuthRouter(options: AuthRouterOptions = {}): Router {
  const router = Router();
  const limiter = options.loginRateLimiter;

  const loginHandlers = [
    ...(limiter ? [limiter] : []),
    validate({ body: loginSchema }),
    catchAsync(login),
  ];

  router.post("/login", ...loginHandlers);
  router.get("/me", protect, catchAsync(me));
  router.post("/logout", protect, catchAsync(logout));

  return router;
}

export default createAuthRouter;
