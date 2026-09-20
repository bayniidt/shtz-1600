ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app/server

COPY --from=dependencies /app/server/node_modules ./node_modules
COPY server/ ./
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=4000

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=builder /app/server/dist ./dist
# 启动时 seedContentIfMissing() 默认读取 ../web/data/site.json。
COPY web/data/site.json /app/web/data/site.json

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
