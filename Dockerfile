# syntax=docker/dockerfile:1.7
#
# Corvian – one Dockerfile, one target per service:
#   engine | ws-server | database-processor | web   (+ migrate, a one-shot job)
#
#   docker build --target engine -t corvian-engine .
#
# Size strategy
#   * engine / ws-server / database-processor are bundled by esbuild into ONE .mjs
#     file each, so their images contain no node_modules and no npm.
#   * web is a Next.js "standalone" build (only the traced files), minus sharp
#     (the app doesn't use next/image).
#   * Every runtime image is plain alpine + the node binary + libstdc++.
#     (If you ever want the stock image instead, change `runtime-base` to
#     `FROM node:24-alpine` and delete the two lines that copy node in.)

ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.22

# ---------------------------------------------------------------- node binary
FROM node:${NODE_VERSION}-alpine AS node-src

# -------------------------------------------------------------- runtime base
FROM alpine:${ALPINE_VERSION} AS runtime-base
RUN apk add --no-cache libstdc++ \
 && adduser -D -u 10001 app
COPY --from=node-src /usr/local/bin/node /usr/local/bin/node
ENV NODE_ENV=production
WORKDIR /app
USER app

# --------------------------------------------------- deps (build-time only)
FROM node:${NODE_VERSION}-alpine AS deps
# package.json pins devEngines.packageManager to npm 11.11.0 – npm refuses
# to run with any other version.
RUN npm i -g npm@11.11.0 --no-audit --no-fund
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY apps/common/package.json              apps/common/
COPY apps/database-processor/package.json  apps/database-processor/
COPY apps/engine/package.json              apps/engine/
COPY apps/market-maker/package.json        apps/market-maker/
COPY apps/web/package.json                 apps/web/
COPY apps/ws-server/package.json           apps/ws-server/
COPY packages/database/package.json        packages/database/
COPY packages/eslint-config/package.json   packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json              packages/ui/
COPY certs/ca.pem /app/certs/ca.pem
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ------------------------------- esbuild bundles for the three Node services
FROM deps AS build-node
COPY . .
RUN set -eu; mkdir /out; \
    for s in engine ws-server database-processor; do \
      node_modules/.bin/esbuild "apps/$s/index.ts" \
        --bundle --platform=node --format=esm --target=node22 \
        --minify --legal-comments=none \
        --banner:js="import{createRequire as __cr}from'module';const require=__cr(import.meta.url);" \
        --outfile="/out/$s.mjs"; \
    done

# ------------------------------------------------------- Next.js standalone
FROM deps AS build-web
# NEXT_PUBLIC_* values are inlined into the browser bundle at BUILD time.
ARG NEXT_PUBLIC_MARKET_WS_URL=ws://localhost:5000
ENV NEXT_PUBLIC_MARKET_WS_URL=${NEXT_PUBLIC_MARKET_WS_URL} \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
# The lockfile lists Next's SWC binary for musl only as an optional dep of
# `next`, so `npm ci` skips it on Alpine. Install it explicitly (best effort;
# Next also tries to patch this itself during the build).
RUN a="$(uname -m | sed 's/x86_64/x64/;s/aarch64/arm64/')"; \
    v="$(node -p "require('next/package.json').version")"; \
    npm i --no-save --ignore-scripts --no-audit --no-fund "@next/swc-linux-${a}-musl@${v}" \
    || echo "WARN: could not preinstall @next/swc-linux-${a}-musl"
# Turn on standalone output without touching the repo's next.config.js.
RUN sed -i 's/reactStrictMode/output: "standalone", reactStrictMode/' apps/web/next.config.js \
 && grep -q 'output: "standalone"' apps/web/next.config.js
# Placeholders are needed only so `prisma contract emit` / page-data collection
# can start; they are not baked into the final image.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
    AUTH_SECRET=build-time-placeholder-build-time-placeholder \
    npm run build --workspace=web
# sharp (~28 MB) is only used by next/image, which the app doesn't use.
RUN rm -rf apps/web/.next/standalone/node_modules/@img \
           apps/web/.next/standalone/node_modules/sharp \
           apps/web/.next/standalone/node_modules/detect-libc

# ============================================================ final targets
FROM runtime-base AS engine
COPY --from=build-node /out/engine.mjs ./engine.mjs
CMD ["node", "engine.mjs"]

FROM runtime-base AS ws-server
ENV PORT=5000
COPY --from=build-node /out/ws-server.mjs ./ws-server.mjs
EXPOSE 5000
CMD ["node", "ws-server.mjs"]

FROM runtime-base AS database-processor
COPY --from=build-node /out/database-processor.mjs ./database-processor.mjs
CMD ["node", "database-processor.mjs"]

FROM runtime-base AS web
ENV PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build-web /app/apps/web/.next/standalone ./
COPY --from=build-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build-web /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# One-shot job (not a long-running service): applies packages/database/migrations.
FROM deps AS migrate
COPY packages/database packages/database
CMD ["npm", "run", "db:migrate", "--workspace=@corvian/database"]
