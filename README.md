# Portfolio Platform

A production-grade personal software engineering portfolio: a public case-study site (projects, blog,
experience, skills, an interactive per-project architecture diagram) backed by a database-driven admin
CMS, so content is managed without touching source code.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript, React 19
- **UI**: Tailwind CSS v4, shadcn/ui (Radix primitives)
- **Database**: PostgreSQL via Prisma ORM 7 (driver-adapter based — see [Architecture notes](#architecture-notes))
- **Auth**: single-admin credentials login, argon2id password hashing, DB-backed session cookie (server-side revocable)
- **Architecture diagrams**: React Flow (`@xyflow/react`)
- **Uploads**: Vercel Blob, falling back to local disk when unconfigured
- **Rate limiting**: Upstash Redis, falling back to a Postgres-backed counter when unconfigured
- **Testing**: Vitest (unit + integration), Playwright (E2E)
- **Infra**: Docker / docker-compose, GitHub Actions CI

## Getting started (local development)

Requires Node 22+, Docker Desktop, and npm.

```bash
cp .env.example .env          # then edit SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
npm install
npm run docker:dev:up         # starts a local Postgres container only
npm run db:migrate            # applies Prisma migrations
npm run db:seed               # seeds one admin user + clearly-marked placeholder content (all DRAFT)
npm run dev
```

The app runs at `http://localhost:3000` (or the next free port — Next.js will tell you if 3000 is taken).
Log in at `/admin/login` with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` you set in `.env`.

All seeded content is `contentStatus: DRAFT`, so nothing placeholder is publicly visible until you
review and publish real content through the admin CMS.

## Running the full stack in Docker

```bash
npm run docker:up     # builds the app image and runs it alongside Postgres
npm run docker:down
```

This uses `docker/docker-compose.yml` (app + Postgres) and is closer to a self-hosted production setup
than `docker:dev:up`, which only starts Postgres for use with `npm run dev` on the host.

## Scripts

| Command                           | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / production server |
| `npm run lint` / `lint:fix`       | ESLint                                                    |
| `npm run format` / `format:check` | Prettier                                                  |
| `npm run typecheck`               | `tsc --noEmit`                                            |
| `npm run test`                    | Unit + integration tests (Vitest)                         |
| `npm run test:e2e`                | Playwright E2E (builds and boots the app first)           |
| `npm run db:migrate`              | Apply Prisma migrations (dev)                             |
| `npm run db:seed`                 | Run `prisma/seed.ts`                                      |
| `npm run db:studio`               | Prisma Studio                                             |

## Environment variables

See `.env.example` for the full list. Everything beyond `DATABASE_URL`/`DIRECT_URL` is optional and the
corresponding feature degrades gracefully when unset (documented inline in the file):
GitHub stats widget, file uploads, and contact-form rate limiting all have working local-dev fallbacks
that require no cloud credentials.

## Architecture notes

- **Layering**: `app/**` and `components/**` never talk to Prisma directly. Routes and server actions call
  into `features/<entity>/{actions,queries}.ts`, which call `services/*.ts` — the only layer allowed to
  import `@prisma/client`. Public pages read through `features/*/queries.ts`.
- **Prisma 7**: connection URLs no longer live in `schema.prisma`. `prisma.config.ts` holds the
  migration URL (`DIRECT_URL`); the runtime `PrismaClient` (`services/db.ts`) is constructed with a
  `@prisma/adapter-pg` driver adapter using `DATABASE_URL`. Point `DATABASE_URL` at a pooled connection
  string in production (e.g. Neon's pooler) and `DIRECT_URL` at the unpooled one; locally they're identical.
- **Route protection**: Next.js 16 renamed `middleware.ts` to `proxy.ts`. Despite Proxy now defaulting
  to the Node.js runtime, its own docs warn it may run in an optimized, CDN-adjacent context outside
  normal render code ("you should not attempt relying on shared modules or globals") — so `proxy.ts`
  deliberately stays DB-free and only does a cheap cookie-presence redirect. The authoritative check
  (hash lookup, expiry, revocation) is `features/auth/session.ts`'s `getSession()`, called from the
  admin layout and every admin server action / route handler. Verified this two-tier split actually
  matters: replaying a _revoked_ session's cookie passes proxy's check (cookie still present) but is
  correctly rejected by `getSession()` in the layout.
- **Health checks**: `/api/health` (liveness) and `/api/ready` (readiness — pings the database) back the
  Docker healthcheck and are suitable for container-orchestrator probes.

## Project structure

```text
app/(public)/...     public routes (/, /about, /projects, /skills, /experience, /education,
                      /certifications, /blog, /activities, /contact)
app/admin/...         admin CMS routes (dashboard, profile, projects, skills, experience,
                      education, certifications, blog, activities, messages, settings)
app/api/...           health/ready/contact/github/uploads/auth routes
components/ui/        shadcn/ui primitives
components/           shared layout/domain UI (architecture diagram, project cards, timeline, ...)
features/<entity>/    actions.ts, queries.ts per content type
services/              Prisma access layer (db.ts + one service per entity) — the only layer
                      allowed to import @prisma/client
lib/                  auth, env, logger, rate-limit, markdown, utils
schemas/              zod validation schemas, shared by client forms and server actions
config/               nav items, category/status label maps
prisma/               schema, migrations, seed
docker/               Dockerfile, docker-compose.yml, docker-compose.dev.yml
tests/unit/           pure-logic tests (schemas, password hashing, proxy routing, diagram transform, ...)
tests/integration/    tests against a real Postgres (auth flow, project service, rate limiting)
tests/e2e/            Playwright specs (admin login/protection, full project lifecycle)
```

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Provision a managed Postgres database (e.g. [Neon](https://neon.tech)) and set:
   - `DATABASE_URL` — the **pooled** connection string (Neon's pooler endpoint), used by the app at runtime.
   - `DIRECT_URL` — the **unpooled** connection string, used by Prisma Migrate.
3. Set `SESSION_COOKIE_NAME`, `SESSION_TTL_DAYS`, and `NEXT_PUBLIC_SITE_URL` (your production URL).
4. Run `npx prisma migrate deploy` against the production database once (locally with production env
   vars, or as a one-off Vercel deploy step), then seed the admin user with `npm run db:seed`
   (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` set to real values — never commit these).
5. Optional, graceful-degrade if omitted: `BLOB_READ_WRITE_TOKEN` (file uploads via Vercel Blob),
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (contact-form rate limiting), `GITHUB_TOKEN` /
   `GITHUB_USERNAME` (repo stats on project pages).
6. Deploy. `next.config.ts`'s `output: "standalone"` is for the Docker path — Vercel's own build
   pipeline handles the App Router build directly and ignores it.
7. Smoke-test `/api/health` and `/api/ready` (should return 200) before treating the deploy as live.
8. Before announcing the site, log in and review every seeded placeholder entity (Profile, the sample
   project, experience/education/certification/blog/activity rows) — everything seeds as `DRAFT`
   specifically so nothing fabricated-looking can go live without you reviewing and replacing it first.

## Status

All 8 implementation phases are built and verified end-to-end (typecheck, lint, full test suite,
production build, and live browser click-throughs): project bootstrap, auth, profile + public shell,
projects with the interactive architecture diagram, skills/experience/education/certifications,
blog, activities/contact/GitHub integration, and hardening (accessibility, security headers, expanded
test coverage). The one open item is the containerized `docker compose build` path, which hits a
Docker Desktop networking issue on the machine this was built on — `npm run dev` against Postgres (via
`docker-compose.dev.yml`) and Vercel deployment are both unaffected.
