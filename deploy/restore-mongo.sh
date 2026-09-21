#!/usr/bin/env bash
set -euo pipefail

BACKUP=${1:-}
CONFIRM=${2:-}
MONGO_DB=${MONGO_DB:-adfly_admin}
MONGO_SOURCE_DB=${MONGO_SOURCE_DB:-adfly_admin}

if [[ -z "$BACKUP" || "$CONFIRM" != "--confirm" ]]; then
  echo "用法：$0 <backup.archive.gz> --confirm" >&2
  echo "恢复会使用 --drop 覆盖目标数据库，请明确传入 --confirm。" >&2
  exit 2
fi

if [[ ! -r "$BACKUP" || ! -s "$BACKUP" ]]; then
  echo "备份文件不存在或为空：$BACKUP" >&2
  exit 1
fi

docker compose exec -T mongo mongorestore \
  --drop \
  --archive \
  --gzip \
  --nsFrom "${MONGO_SOURCE_DB}.*" \
  --nsTo "${MONGO_DB}.*" < "$BACKUP"

echo "Mongo 恢复完成：目标数据库 $MONGO_DB"
