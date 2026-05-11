# TipMaster

A daily sports betting tips platform where an admin posts predictions and visitors track results, with live performance stats and full results history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, TanStack Query, Wouter router

## Where things live

- DB schema: `lib/db/src/schema/tips.ts`
- API contract: `lib/api-spec/openapi.yaml`
- API routes: `artifacts/api-server/src/routes/tips.ts`
- Frontend: `artifacts/betting-tips/src/`

## Product

- **Today's Tips** (`/`) — today's picks with live win-rate stats panel
- **Archive** (`/tips`) — all tips filterable by sport, status, and date
- **Results** (`/results`) — recent won/lost outcomes feed
- **Admin** (`/admin`) — CRUD panel to post, edit, and delete tips; update results inline

## Architecture decisions

- Tips stored in PostgreSQL with Drizzle ORM; `matchDate` is a plain text string (YYYY-MM-DD) for easy filtering
- `/tips/today` and `/tips/recent-results` are dedicated endpoints for the two most common views
- Stats computed server-side from full tip set; win rate excludes void tips
- No authentication on admin panel — treat as a trusted internal tool
- Orval codegen generates both Zod server schemas and React Query client hooks from a single OpenAPI spec

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before using new types
- The `odds` column is stored as `numeric` in Postgres and returned as a JS `number` via `parseFloat` in the route handler
