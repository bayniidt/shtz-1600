import compression from "compression";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { config } from "@/config";
import { errorCodeTable, openApiDocument } from "@/docs/swagger";
import { errorHandler, notFoundHandler } from "@/middlewares/error";
import { createLoginRateLimiter } from "@/middlewares/rateLimit";
import { createApiRouter } from "@/routes";
import { sendOk } from "@/utils/respond";

export interface AppOptions {
  /** 登录失败限流阈值（测试用），默认取 config。 */
  loginRateMax?: number;
  loginRateWindowMinutes?: number;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(
    cors({
      origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (!config.isTest) {
    app.use(morgan(config.isProd ? "combined" : "dev"));
  }

  // 根路径：服务信息
  app.get("/", (_req, res) => {
    sendOk(res, {
      name: "ADFLY Admin API",
      version: "0.1.0",
      apiPrefix: config.apiPrefix,
      docs: config.swaggerEnabled ? "/api/docs" : null,
    });
  });

  // 接口文档
  if (config.swaggerEnabled) {
    app.get("/api/docs/error-codes", (_req, res) => {
      sendOk(res, errorCodeTable);
    });
    app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        customSiteTitle: "ADFLY Admin API Docs",
        swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
      }),
    );
  }

  // 业务路由
  const apiRouter = createApiRouter({
    loginRateLimiter: createLoginRateLimiter(
      options.loginRateMax,
      options.loginRateWindowMinutes,
    ),
  });
  app.use(config.apiPrefix, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
