import { createApp } from "@/app";
import { config } from "@/config";
import { connectDB, disconnectDB } from "@/config/db";
import { ensureDefaultAdmin, seedContentIfMissing } from "@/services/seed.service";

async function bootstrap(): Promise<void> {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log(`[db] connected: ${config.mongoUri.replace(/\/\/.*@/, "//***@")}`);

  const seed = await ensureDefaultAdmin();
  if (seed.created) {
    // eslint-disable-next-line no-console
    console.warn(
      `[seed] 已创建默认管理员 "${seed.username}"，密码取自 ADMIN_PASSWORD（默认 admin）。` +
        "⚠️  生产环境请立即修改！",
    );
  }

  // 首次启动自动灌入内容（site / home / cases / about / careers），不覆盖已有数据
  const counts = await seedContentIfMissing();
  if (counts) {
    const written = Object.values(counts).reduce((sum, value) => sum + value, 0);
    // eslint-disable-next-line no-console
    console.log(
      written > 0
        ? `[seed] 内容初始化完成：${JSON.stringify(counts)}`
        : "[seed] 内容已存在，跳过初始化",
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[seed] 未找到站点数据文件（${config.siteDataFile}），跳过内容初始化`);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${config.port}${config.apiPrefix}`);
    if (config.swaggerEnabled) {
      // eslint-disable-next-line no-console
      console.log(`[docs]   http://localhost:${config.port}/api/docs`);
    }
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[server] failed to start:", error);
  process.exit(1);
});
