ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app/admin

COPY admin/package.json admin/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app/admin

COPY --from=dependencies /app/admin/node_modules ./node_modules
COPY admin/ ./
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/admin/dist /usr/share/nginx/html/admin
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1/admin/ >/dev/null || exit 1
