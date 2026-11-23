
# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.22

# ------------------------------------------------------------
# Node binary source
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS node-src

# ------------------------------------------------------------
# Minimal runtime base
# ------------------------------------------------------------
FROM alpine:${ALPINE_VERSION} AS runtime-base

RUN apk add --no-cache libstdc++ \
    && adduser -D -u 10001 app

COPY --from=node-src /usr/local/bin/node /usr/local/bin/node

ENV NODE_ENV=production

WORKDIR /app

USER app

# ------------------------------------------------------------
# Dependencies (build stage only)
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps

RUN npm install -g npm@11.11.0 --no-audit --no-fund

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

COPY apps/common/package.json apps/common/
COPY apps/database-processor/package.json apps/database-processor/
COPY apps/engine/package.json apps/engine/
COPY apps/market-maker/package.json apps/market-maker/
COPY apps/web/package.json apps/web/
COPY apps/ws-server/package.json apps/ws-server/

COPY packages/database/package.json packages/database/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ------------------------------------------------------------
# Bundle Node services with esbuild
# ------------------------------------------------------------
FROM deps AS build-node

COPY . .

RUN set -eu; \
    mkdir -p /out; \
    for s in engine ws-server database-processor market-maker; do \
      node_modules/.bin/esbuild "apps/$s/index.ts" \
        --bundle \
        --platform=node \
        --format=esm \
        --target=node22 \
        --minify \
        --legal-comments=none \
        --banner:js="import{createRequire as __cr}from'module';const require=__cr(import.meta.url);" \
        --outfile="/out/$s.mjs"; \
    done

# ------------------------------------------------------------
# Next.js standalone build
# ------------------------------------------------------------
FROM deps AS build-web

ARG NEXT_PUBLIC_MARKET_WS_URL=ws://localhost:5000

ENV NEXT_PUBLIC_MARKET_WS_URL=${NEXT_PUBLIC_MARKET_WS_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .

# Install the Alpine-compatible SWC binary
RUN set -eu; \
    a="$(uname -m | sed 's/x86_64/x64/;s/aarch64/arm64/')"; \
    v="$(node -p "require('next/package.json').version")"; \
    npm install --no-save --ignore-scripts --no-audit --no-fund \
      "@next/swc-linux-${a}-musl@${v}" \
    || echo "WARN: SWC installation failed"

# Enable Next standalone output
RUN sed -i 's/reactStrictMode/output: "standalone", reactStrictMode/' apps/web/next.config.js \
    && grep -q 'output: "standalone"' apps/web/next.config.js

# Build Next.js
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
    AUTH_SECRET=build-time-placeholder-build-time-placeholder \
    npm run build --workspace=web

# Remove unused image-processing dependencies
RUN rm -rf \
    apps/web/.next/standalone/node_modules/@img \
    apps/web/.next/standalone/node_modules/sharp \
    apps/web/.next/standalone/node_modules/detect-libc

# ============================================================
# Runtime: Engine
# ============================================================
FROM runtime-base AS engine

COPY --from=build-node /out/engine.mjs ./engine.mjs

CMD ["node", "engine.mjs"]

# ============================================================
# Runtime: WebSocket server
# ============================================================
FROM runtime-base AS ws-server

ENV PORT=5000

COPY --from=build-node /out/ws-server.mjs ./ws-server.mjs

EXPOSE 5000

CMD ["node", "ws-server.mjs"]

# ============================================================
# Runtime: Database processor
# ============================================================
FROM runtime-base AS database-processor

COPY --from=build-node /out/database-processor.mjs ./database-processor.mjs

CMD ["node", "/app/database-processor.mjs"]

# ============================================================
# Runtime: Market maker
# ============================================================
FROM runtime-base AS market-maker

COPY --from=build-node /out/market-maker.mjs ./market-maker.mjs

CMD ["node", "market-maker.mjs"]

# ============================================================
# Runtime: Next.js web
# ============================================================
FROM runtime-base AS web

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build-web /app/apps/web/.next/standalone ./
COPY --from=build-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build-web /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

# ============================================================
# Runtime: Database migrations
# ============================================================
FROM deps AS migrate

COPY packages/database packages/database

CMD ["npm", "run", "db:migrate", "--workspace=@corvian/database"]
