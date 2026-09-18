import { Router } from "express";
import type { RateLimitRequestHandler } from "express-rate-limit";

import aboutRoutes from "@/routes/about.routes";
import { createAuthRouter } from "@/routes/auth.routes";
import careersRoutes from "@/routes/careers.routes";
import casesRoutes from "@/routes/cases.routes";
import homeRoutes from "@/routes/home.routes";
import settingsRoutes from "@/routes/settings.routes";
import siteRoutes from "@/routes/site.routes";
import { sendOk } from "@/utils/respond";

export interface ApiRouterOptions {
  loginRateLimiter?: RateLimitRequestHandler;
}

export function createApiRouter(options: ApiRouterOptions = {}): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    sendOk(res, {
      status: "ok",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  router.use("/auth", createAuthRouter({ loginRateLimiter: options.loginRateLimiter }));
  router.use("/settings", settingsRoutes);
  router.use("/site", siteRoutes);
  router.use("/home", homeRoutes);
  router.use("/cases", casesRoutes);
  router.use("/about", aboutRoutes);
  router.use("/careers", careersRoutes);

  return router;
}

export default createApiRouter;
