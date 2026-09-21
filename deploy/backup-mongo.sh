#!/usr/bin/env bash
set -euo pipefail

OUTPUT=${1:-backups/adfly-$(date -u +%Y%m%dT%H%M%SZ).archive.gz}
MONGO_DB=${MONGO_DB:-adfly_admin}

if [[ -e "$OUTPUT" ]]; then
  echo "备份文件已存在，为避免覆盖请指定新路径：$OUTPUT" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
docker compose exec -T mongo mongodump --db "$MONGO_DB" --archive --gzip > "$OUTPUT"

if [[ ! -s "$OUTPUT" ]]; then
  echo "Mongo 备份文件为空：$OUTPUT" >&2
  exit 1
fi

echo "Mongo 备份完成：$OUTPUT"
