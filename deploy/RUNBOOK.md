# Stage8 上线与运维 Runbook

本文用于本项目的 Docker Compose 部署、发布验收、Mongo 数据备份与恢复。

## 1. 上线前检查

准备 Docker Desktop、Docker Compose v2，并在项目根目录准备 `.env`。生产环境必须配置：

- `CORS_ORIGIN`：明确的 `http(s)` 来源，不能使用 `*`。
- `JWT_SECRET`：至少 32 个字符的随机值，不能使用占位文本。
- `ADMIN_PASSWORD_HASH`：bcrypt hash；不要配置明文 `ADMIN_PASSWORD`。
- `HTTP_PORT`：对外入口端口，生产通常由反向代理接管 TLS。

执行配置检查：

```bash
node deploy/verify-production-env.mjs .env
```

## 2. 发布与健康检查

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f --tail=100 server
node deploy/smoke.mjs
```

冒烟脚本默认访问 `http://localhost:18080`、使用 `admin/admin`。生产验收时显式传入真实入口和管理员凭据：

```bash
BASE_URL=https://www.example.com \
ADMIN_USERNAME=admin \
ADMIN_PASSWORD='真实密码' \
node deploy/smoke.mjs
```

脚本会验证后台、Web 首页、API 健康检查、管理员登录、当前用户信息和未授权写入防护。

## 3. Mongo 备份

备份默认数据库 `adfly_admin`，输出文件不能覆盖已有文件：

```bash
./deploy/backup-mongo.sh backups/adfly-$(date -u +%Y%m%dT%H%M%SZ).archive.gz
```

建议在正式发布前、数据结构变更前以及按日计划任务中执行，并把备份文件复制到独立存储。备份文件包含业务数据，应限制访问权限。

## 4. Mongo 恢复

恢复会对目标库执行 `--drop`，必须在维护窗口内操作，并显式确认：

```bash
./deploy/restore-mongo.sh backups/adfly-20260921T000000Z.archive.gz --confirm
```

恢复到指定数据库用于演练时：

```bash
MONGO_DB=adfly_admin_restore_test \
MONGO_SOURCE_DB=adfly_admin \
./deploy/restore-mongo.sh backups/adfly-20260921T000000Z.archive.gz --confirm
```

恢复完成后重新执行 `node deploy/smoke.mjs`，并抽查后台列表和 Web 页面。

## 5. 回滚与持久化

- 当前 Compose 通过本地 Dockerfile 构建镜像；回滚时切换到上一个已验证的代码或镜像版本，再执行 `docker compose build && docker compose up -d`。
- Mongo 数据位于命名卷 `adfly-mongo-data`。发布或重启使用 `docker compose restart` / `docker compose up -d`，不要在生产执行 `docker compose down -v`。
- 数据恢复优先恢复到演练库验证，再覆盖正式库；恢复前保留当前库的新备份。

## 6. 故障排查

```bash
docker compose ps
docker compose logs --tail=200 server
docker compose logs --tail=200 web
docker compose logs --tail=200 admin
curl -fsS http://localhost:18080/api/v1/health
```

如果 server 启动失败，优先检查 `node deploy/verify-production-env.mjs .env`、Mongo 健康状态和 `MONGO_URI`。不要把 JWT、密码或 bcrypt hash 粘贴到工单和日志中。
