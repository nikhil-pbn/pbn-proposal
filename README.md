# PBN Sales Proposal Automation Platform

Internal tool. A sales rep pastes a call transcript, Claude turns it into a structured proposal, the rep edits it section by section, publishes, and shares a landing page with the prospect.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Prisma 7 · PostgreSQL · Claude API

**The proposal is stored as JSON, never HTML.** Every editor action — edit, delete, hide, reorder, add item — is a mutation on `proposals.proposal_json`, which is what lets a rep revise a proposal without ever re-calling Claude.

---

## Getting started

The database is [Neon](https://neon.com) — managed Postgres, no local server to run.

```bash
npm install                # postinstall generates the Prisma client
cp .env.example .env       # then fill in DATABASE_URL and DIRECT_URL from Neon

npm run db:deploy          # apply existing migrations to your database
npm run db:seed            # optional: one sample proposal to look at

npm run dev                # http://localhost:3000
```

- `http://localhost:3000` — the app
- `http://localhost:3000/preview` — the proposal template rendered from default content, no database needed

Neon gives you **two** connection strings for the same database, and both belong in `.env`:

| Variable | Which string | Used by |
|---|---|---|
| `DATABASE_URL` | **pooled** — hostname contains `-pooler` | the app at runtime |
| `DIRECT_URL` | **direct** — same host without `-pooler` | `prisma migrate`, `prisma studio` |

The pooled endpoint is PgBouncer in transaction mode: right for request traffic, but it holds no session state, so the DDL and advisory lock `prisma migrate` needs are unreliable through it. `prisma.config.ts` points the CLI at `DIRECT_URL`; `src/server/db/client.ts` uses `DATABASE_URL`.

Prefer `sslmode=verify-full` over Neon's default `require` — it validates the certificate and hostname rather than merely encrypting.

---

## Scripts

### App

| Script | Runs | What it's for |
|---|---|---|
| `npm run dev` | `next dev` | Development server on :3000, Turbopack, hot reload. |
| `npm run build` | `next build` | Production build. Also runs a full TypeScript check — use it as the pre-commit gate. |
| `npm run start` | `next start` | Serves the output of `build`. Not for development. |
| `npm run lint` | `eslint` | ESLint over the project. |

### Schema → database

| Script | Runs | What it's for |
|---|---|---|
| `npm run db:migrate` | `prisma migrate dev` | **Local only.** Diffs `schema.prisma` against the database, writes a new migration into `prisma/migrations/`, applies it. Interactive. Commit the generated folder. |
| `npm run db:deploy` | `prisma migrate deploy` | **Production and fresh clones.** Applies migrations that already exist and haven't run yet. Writes nothing new, non-interactive, safe to re-run. Never run `db:migrate` against production. |
| `npm run db:push` | `prisma db push` | Applies the schema with no migration files at all. Fine for throwaway experiments; it leaves no history, so don't use it on a database anyone else shares. |

`prisma/migrations/` **is committed**. That history is what `db:deploy` replays, so a schema change is only real once its migration file is in git.

### Local database lifecycle (legacy)

| Script | Runs | What it's for |
|---|---|---|
| `npm run db:dev` | `prisma dev … --detach` | Starts a local WASM Postgres on port 51218. **Superseded by Neon** — kept only for working fully offline. See the caveat below for why it was abandoned. |
| `npm run db:dev:ls` | `prisma dev ls` | Whether that local server is running. |
| `npm run db:dev:stop` | `prisma dev stop default` | Stops it. Data survives across stop/start. |

### Prisma client

| Script | Runs | What it's for |
|---|---|---|
| `npm run db:generate` | `prisma generate` | Regenerates the typed client into `src/generated/prisma`. **Run after every edit to `schema.prisma`**, otherwise TypeScript won't know about your new columns. |
| `postinstall` | `prisma generate` | Runs automatically after `npm install`. Needed because the generated client is gitignored, so a fresh clone has no client until it's generated. If your npm has script approval enabled, run `npm run db:generate` by hand instead. |

### Data and inspection

| Script | Runs | What it's for |
|---|---|---|
| `npm run db:check` | `tsx … db/inspect.ts` | **Prints what's in the database** — row counts, then each proposal's slug, practice, status and version. Also validates each stored `proposal_json` against the Zod schema, so it catches drift between the database and what the editor expects. |
| `npm run db:seed` | `tsx … db/seed-sample.ts` | Inserts one sample proposal plus its tracking row. Upserts on the slug — safe to re-run. **Don't run it against production**; it writes a fake practice. |
| `npm run db:studio` | `prisma studio` | Browser GUI for browsing and editing rows. Works on Neon. Never worked against the local WASM server — see the caveat. |

---

## Generation engines

`PROPOSAL_GENERATION` in `.env` picks how a transcript becomes a proposal. Both
engines return the identical `ProposalExtraction` shape, so the assembler, the
editor and the landing page are unchanged either way.

| Value | Engine | Needs |
|---|---|---|
| `offline` | Keyword matching against the PbN catalog | Nothing |
| `claude` | Real extraction via `claude-opus-5` | A key **with credit** |
| `auto` | `claude` if a key is set, else `offline` | — |
| *unset* | Same as `auto` | — |
| *anything else* | **`offline`**, plus a loud error toast | — |

Those are the only accepted values — see `GENERATION_MODES` in
`src/server/proposal/generate.ts`. An unrecognised value resolves to **offline,
never Claude**: `auto` used to be the silent catch-all, so a typo like `onlien`
found the key and quietly began billing the API. A misconfiguration should cost
nothing and be impossible to miss.

On `auto` and `claude`, a credit / auth / rate-limit failure **falls back to
offline** instead of failing the request — a key that exists is not proof of
usable access, and an empty credit balance shouldn't leave a rep with nothing.

**Offline mode is genuinely transcript-driven** — it strips WEBVTT scaffolding
from Zoom exports, reads spelled-out numbers ("six chairs" → 6), identifies the
PMS and the point tools already being paid for, and picks problems and modules
from what was actually discussed. Two different calls produce two different
proposals.

**What it cannot do** is understand language. It has no grasp of negation, so a
call where someone says *"forms are already digital, that part's fine"* may still
surface a forms problem. It also can't quote the prospect's own words back at
them the way Claude does. Both the homepage and the editor show an amber banner
while offline mode is active, for exactly this reason: **read every section
before publishing.**

## Deployment (Vercel + GitHub)

Push to the production branch and Vercel builds. Nothing needs to run by hand.

### Environment variables

Set all five in **Project → Settings → Environment Variables**. `.env` is gitignored, so nothing carries over from local.

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** string (hostname has `-pooler`) |
| `DIRECT_URL` | Neon **direct** string (no `-pooler`) |
| `ANTHROPIC_API_KEY` | server-only, never `NEXT_PUBLIC_` |
| `PROPOSAL_GENERATION` | `claude`, `auto` or `offline` |
| `NEXT_PUBLIC_APP_URL` | the real deployed origin, e.g. `https://pbn-proposal.vercel.app` |

**`NEXT_PUBLIC_APP_URL` is the one that bites.** Because it's `NEXT_PUBLIC_`, it is **inlined at build time**, not read at runtime. Two consequences:

- If it's wrong, `proposalUrlFor()` writes bad links into `proposal_tracking.proposal_url` — reps then copy dead URLs and send them to dentists.
- Changing it later is not enough on its own. You must **redeploy** for the new value to take effect.

### Build

`package.json` defines a **`vercel-build`** script, which Vercel runs instead of `build`:

```
prisma migrate deploy && next build
```

So the full sequence on every deploy is:

1. `npm install` → `postinstall` → `prisma generate` (the client is gitignored, so it's rebuilt here)
2. `prisma migrate deploy` → applies any migration in `prisma/migrations/` that hasn't run yet
3. `next build`

Nothing to configure in the dashboard, and **no Build Command override** — the dashboard field must stay on its default or it will shadow `vercel-build`. Keeping it in `package.json` means it's versioned and reviewable rather than hidden in a web UI.

If a migration fails the build stops and the deploy never ships, which is the behaviour you want: the previous version keeps serving instead of new code hitting a database that lacks its columns.

Local `npm run build` is still plain `next build`, so developing never migrates anything by accident.

### Region

Set the function region near the database — **`iad1`** for a Neon project in `us-east-2`. Every page does several queries, so a mismatched region adds a cross-continent round trip to each one.

### Preview deployments

Preview builds read the same `DATABASE_URL` as production and their `vercel-build` will migrate it. Harmless if you only push to the production branch; once you use feature branches, set up Neon's database branching so previews get their own copy.

### Still open

- **No auth** on `/`, `/editor/*` and `/tracking`. `noindex` and `robots.txt` stop search engines, not people — anyone with a URL can reach these. `/lp/*` is public by design; the rest is not, and currently isn't protected.
- **Transcripts may contain PHI.** A dentist naming a patient on a call puts protected health information in `proposals.transcript`. Neon's free and lower paid tiers don't include a BAA.

---

## Search indexing

Nothing in this app should be discoverable. Two independent mechanisms:

| Where | What it does |
|---|---|
| `src/app/layout.tsx` | `noindex, nofollow, nocache` + `googlebot` directives, **inherited by every route** including `/lp/[slug]` |
| `src/app/robots.ts` | serves `/robots.txt` with `User-Agent: *` / `Disallow: /` — every crawler, every path |

Verified live on `/`, `/preview`, `/tracking`, `/editor/[id]`, `/lp/[slug]` and 404s.

Two things to know before changing it:

- **Don't re-declare `robots` in a page.** Next merges metadata *shallowly*, so a page-level `robots` **replaces** the root object instead of extending it — a well-meaning `{ index: false, follow: false }` on a page silently drops the `googleBot` directives from the layout. That's why the four pages that once set it no longer do.
- **The two mechanisms are belt and braces, not one system.** A crawler obeying `robots.txt` never fetches the page, so it never reads the `noindex` tag. The tag is what covers anything that fetches anyway — an inbound link, or a crawler that ignores `robots.txt`. Keep both.

There is deliberately **no sitemap** — it would advertise the exact URLs being kept quiet.

Neither mechanism is access control. The internal routes stay reachable by anyone with the URL. Access control is a separate, still-open task.

---

## Caveat: the local `prisma dev` database (historical)

Kept because the symptoms were baffling and cost real time. `npm run db:dev` runs **PostgreSQL compiled to WebAssembly**, and it reliably serves **one connection at a time**. Measured with concurrent identical queries, before and after moving to Neon:

| Concurrent connections | Local WASM | Neon |
|---|---|---|
| 1 | 1/1 | 1/1 |
| 4 | 1/4 | 4/4 |
| 8 | 1/8 | 8/8 |
| 16 | 1/16 | 16/16 |

What that single-connection ceiling caused:

- **`db:studio` could not work.** Studio opens a pool, so its introspection failed with *"Could not load schema metadata"* — an error about connection count, not permissions. It works on Neon.
- **`db:migrate` could not work** — it needs the main and shadow databases at once (`P1017`), which is why the first migration in `prisma/migrations/` was only created after the move.
- **`DATABASE_URL` needed `connection_limit=1`.** Not needed on Neon; with the Prisma 7 driver adapter the pool is `pg`'s anyway, so that URL parameter is ignored.
- The server also died every few minutes. Nearly every "the app is broken" moment traced back to it.

---

## Layout

```
src/
├── app/
│   ├── layout.tsx        fonts, Toaster, and the app-wide noindex policy
│   ├── page.tsx          rep form + recent proposals
│   ├── editor/[id]/      the section-by-section editor
│   ├── lp/[slug]/        the public proposal — the only page a dentist sees
│   ├── preview/          the template from default content, no database needed
│   └── tracking/         internal reporting on who generated what
├── components/
│   ├── ui/               shadcn/ui primitives
│   ├── editor/           editor shell, section cards, generic field editor
│   ├── proposal/         one renderer per proposal section, + ProposalRenderer
│   └── system-status-toasts.tsx   surfaces degraded subsystems, per page
├── server/               server-only code, never imported by the client
│   ├── claude/           prompt, catalog, extraction service, schema
│   ├── proposal/         defaults, assembler, offline engine, actions, slug
│   ├── tracking/         the proposal_tracking writes
│   ├── validation/       Zod schemas for form input
│   ├── system/           subsystem health, consumed by the toasts
│   └── db/               Prisma client singleton, seed and inspect scripts
├── types/                proposal.ts — the section schemas (Zod) and inferred types
└── generated/prisma/     generated client, gitignored — rebuilt by postinstall
```

## Database

Two tables. `proposals` holds the content; `proposal_tracking` is an append-only reporting log written once per successful generation, with no foreign key so it survives a proposal being deleted.

| `proposals` | | `proposal_tracking` | |
|---|---|---|---|
| `id` | uuid | `id` | uuid |
| `slug` | unique, used by `/lp/{slug}` | `ae_name` | the rep |
| `rep_name` / `rep_email` | who generated it | `practice_name` | |
| `practice_name` / `contact_name` | extracted by Claude | `contact_name` | |
| `transcript` | internal only, never public | `proposal_url` | the shared link |
| `proposal_json` | **jsonb** — the whole proposal | `created_at` | when it was generated |
| `status` | `Draft` / `Published` | | |
| `version` | bumped on every save | | |
| `published_at` / `created_at` / `updated_at` | | | |
