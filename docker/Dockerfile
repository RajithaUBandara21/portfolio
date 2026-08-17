# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# The production image never runs Playwright itself — skip the ~300MB browser download
# that @playwright/test's postinstall would otherwise trigger on every `npm ci`.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
# Cache mount: persists npm's download cache across builds/layer invalidations, so only a
# fresh `package-lock.json` re-downloads anything instead of every `npm ci`.
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# `prisma generate` and `next build` both load lib/env.ts (and prisma.config.ts, which
# requires DIRECT_URL to resolve at all) at module-evaluation time, even though neither step
# actually connects to a database. These are syntactically valid placeholders only — the real
# values are injected at container runtime via docker-compose.yml's `environment:` block.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
