# DrawASnowflake

Web app for drawing and animating snowflakes on a Christmas tree — a snowflake-drawing
analog of [drawafish.app](https://drawafish.app). Draw with a brush/eraser, get a
similarity score against a reference snowflake (symmetry, structure), then watch your
snowflakes fall and spin on an animated tree.

## Stack

**Frontend** — React 18, TypeScript, Vite, MUI, Redux Toolkit, React Router, Framer Motion, i18n (RU/EN), Sentry
**Backend** — Node.js, Express, TypeScript, Prisma + PostgreSQL, Helmet, rate limiting (100 req/15min), Sentry
**Testing** — Jest, React Testing Library, Playwright (E2E), coverage target ≥80%
**Tooling** — ESLint, Prettier, Stylelint, GitHub Actions, Docker Compose

## Structure

```
drawasnowflake/
├── backend/
│   ├── src/
│   │   ├── controllers/     # snowflake, metrics
│   │   ├── routes/
│   │   ├── middleware/      # analytics, rate limiting
│   │   └── server.ts
│   └── prisma/schema.prisma
├── frontend/
│   ├── src/
│   │   ├── components/      # Canvas, Tree, UI
│   │   ├── pages/           # DrawPage, TreePage
│   │   ├── features/        # Redux slices: drawing, history, snowflake
│   │   └── i18n/
│   └── e2e/                 # Playwright
├── docker-compose.yml
└── Makefile
```

## Running it

```bash
docker compose up --build
```
Frontend on `http://localhost`, backend API on `http://localhost:3001`.

Or locally:
```bash
make install
make prisma-setup
make dev
```

Backend needs `DATABASE_URL`, `PORT`, `FRONTEND_URL`, optionally `SENTRY_DSN`.
Frontend needs `VITE_API_URL` (defaults to `/api`), optionally `VITE_SENTRY_DSN`.

## What it does

- Draw snowflakes with brush/eraser, adjustable size, color picker, zoom, undo/redo
- Similarity scoring against a reference snowflake (symmetry, structure, coverage)
- Export to PNG or copy to clipboard
- Falling-snowflake animation with rotation/drift physics, play/pause, speed control
- Snowflakes persist to PostgreSQL, capped at 50 per tree — oldest get pruned
- DAU tracking via a session-id (SHA-256 of IP + UA) middleware, cookie-based

## API

```
GET    /api/snowflakes
GET    /api/snowflakes/:id
POST   /api/snowflakes
PUT    /api/snowflakes/:id
DELETE /api/snowflakes/:id

GET    /api/metrics/dau              # today / yesterday / week / month / all-time / growth %
GET    /api/metrics/dau/milestone    # progress toward a self-set 1M DAU target — a stretch
                                      # goal for the exercise, not real traffic
GET    /api/metrics/dau/:date
GET    /api/metrics/dau/range        # ?start=YYYY-MM-DD&end=YYYY-MM-DD, max 90 days

GET    /api/health
```

## Testing & CI

```bash
make test        # unit
make test-e2e    # Playwright
```
GitHub Actions runs tests, lint, and type-checking on every PR, and deploys on merge to `master`.

## Why I built it

Wanted a project that forced me to wire up the boring-but-real parts of a web app —
rate limiting, error monitoring, DAU analytics, E2E tests, a deploy pipeline — around
something visual instead of another CRUD form. The DAU/milestone tracking is built like
it matters at scale even though real traffic is nowhere near it; it was the excuse to
build the analytics pipeline properly.

— Maria Makhmudova
