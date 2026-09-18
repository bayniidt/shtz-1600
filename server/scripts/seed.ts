/**
 * 初始化脚本：默认管理员 + 站点内容（site / home / cases / about / careers）。
 *
 * 用法：
 *   npm run seed                # 只补写缺失的文档（幂等，不覆盖已有内容）
 *   npm run seed -- --force     # 用 data/site.json 覆盖已有内容（危险，请先备份）
 *   npm run seed:content        # 只初始化内容，不动管理员
 */
import { config } from "@/config";
import { connectDB, disconnectDB } from "@/config/db";
import { ensureDefaultAdmin, readSiteDataFile, seedContentFromSiteData } from "@/services/seed.service";

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const contentOnly = process.argv.includes("--content-only");

  await connectDB();
  // eslint-disable-next-line no-console
  console.log(`[seed] connected: ${config.mongoUri}`);

  if (!contentOnly) {
    const result = await ensureDefaultAdmin();
    if (result.created) {
      // eslint-disable-next-line no-console
      console.log(`[seed] ✅ 默认管理员已创建：${result.username} / ${config.adminPassword}`);
      // eslint-disable-next-line no-console
      console.warn("[seed] ⚠️  请登录后立即修改密码！");
    } else {
      // eslint-disable-next-line no-console
      console.log(`[seed] 管理员 "${result.username}" 已存在，跳过创建`);
    }
  }

  const dataFile = config.siteDataFile;
  // eslint-disable-next-line no-console
  console.log(`[seed] 读取站点数据：${dataFile}${force ? "（--force 覆盖模式）" : ""}`);
  const counts = await seedContentFromSiteData(readSiteDataFile(dataFile), { overwrite: force });

  // eslint-disable-next-line no-console
  console.log("[seed] 内容写入结果（数字 = 新增或更新的文档数）：", counts);
  if (!force) {
    // eslint-disable-next-line no-console
    console.log("[seed] 提示：已有内容不会被覆盖，如需用 site.json 覆盖请加 --force");
  }

  await disconnectDB();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[seed] 失败：", error);
  process.exit(1);
});
