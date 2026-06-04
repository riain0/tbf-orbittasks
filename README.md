# OrbitTasks

A lightweight project management SaaS — and the case study for the Build Fellowship's "Ship Better Code, Faster: Optimize Developer Workflows with CI/CD and AI" course. Over 8 workshops, you'll measure this codebase, find the bottlenecks, and ship real improvements.

## Live demo

A hosted instance runs at [tbf.riaincondon.com](https://tbf.riaincondon.com).
Log in with `demo@orbittasks.local` / `Password123`.

## The codebase

```
.
├── apps/
│   ├── api/        # Express + TypeScript backend
│   └── web/        # React + Vite frontend
├── scripts/        # build / deploy / measurement helpers
├── docs/           # supplementary docs
└── package.json    # npm workspaces root
```

## Continuous integration

A slow GitHub Actions workflow ships at [`.github/workflows/ci.yml`](./.github/workflows/ci.yml). It runs on every push and PR. The baseline duration is ~13 minutes; the optimization arc in Workshops 3–5 brings it down to ~2 minutes.

## Setup

```bash
cp .env.example .env
# Edit .env to add JWT_SECRET and DATABASE_URL (see .env.example)
#   JWT_SECRET=any-random-string-for-local-dev
#   DATABASE_URL=file:.data/orbittasks.json
npm install

# Seed the database (required: local DB starts empty, login fails without it)
npm run seed --workspace=apps/api

# Run the two dev servers (there is no root start/dev script yet;
# adding one is part of the Makefile deliverable)
npm run dev --workspace=apps/api
npm run dev --workspace=apps/web
```

> `SEED_ON_BOOT=1` exists, but it only runs on Render in the deployed
> environment. Locally you must seed by hand.

## Running tests

```bash
npm test
```

## Deploying

```bash
npm run deploy
```
