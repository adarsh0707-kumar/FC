# Build Phases — Football Club Platform

**Status:** v1.1 — in progress · **Last updated:** 2026-08-17

> Checkboxes reflect independently verified state (API exercised against the live
> database, client built clean), not self-reported progress. See `06-DEV-LOG.md`.

Each phase has a clear deliverable and acceptance check, so progress is demonstrable at every step — useful both for actually building this correctly and for narrating the process in an Upwork portfolio case study.

---

## Phase 0 — Project setup

**Goal:** Repo skeleton, tooling, docs (this set).

- [x] Initialize `clients/` (Vite + React) and `server/` (Express) as a monorepo
- [x] Set up Prisma + PostgreSQL connection
- [ ] Set up ESLint/Prettier for consistency — oxlint configured in `clients/` only; `server/` still unlinted
- [x] Docs committed (PRD, Requirements, Architecture, this file)

**Acceptance:** `npm run dev` starts both client and server locally with no errors.

---

## Phase 1 — Public front end (static data first)

**Goal:** Rebuild the existing static HTML demo as a React app, using hardcoded/mock data (no API yet).

- [x] Page shell: nav, hero, footer
- [x] Squad page with player cards
- [x] Fixtures page
- [x] Results page
- [x] About section
- [x] Responsive pass + accessibility pass (focus states, reduced motion)

**Acceptance:** Visual parity (or improvement) vs. the original static demo, fully componentized.

---

## Phase 2 — Backend API + database

**Goal:** Express API with Prisma/PostgreSQL, serving real data.

- [x] Prisma schema + migrations (Player, Fixture, Result)
- [x] Seed script with sample club data
- [x] `GET /api/players`, `GET /api/fixtures`, `GET /api/results` (public, read-only)
- [x] Error handling middleware, consistent JSON error shape

**Acceptance:** All three public GET endpoints return correct data; Postman/Thunder Client collection included in docs.

> Endpoints verified live against the hosted DB (2026-08-17). The Postman/Thunder
> collection is still outstanding — `05-API-SPEC.md` documents every route in the
> meantime.

---

## Phase 3 — Connect front end to real API

**Goal:** Replace mock data in Phase 1 with live API calls.

- [x] API wrapper functions in `clients/src/api/`
- [x] Loading and empty states for each page
- [x] Error states (API unreachable, no data yet)

**Acceptance:** Public site fully driven by the database — editing a seed record changes what's displayed.

---

## Phase 4 — Admin auth

**Goal:** Login flow and route protection.

- [x] `AdminUser` model + seed one admin account
- [x] `POST /api/auth/login` with bcrypt + JWT
- [x] `authGuard` middleware on protected routes
- [x] React `/admin/login` page + `<RequireAuth>` wrapper
- [x] Logout

**Acceptance:** Cannot reach `/admin/*` pages or call protected endpoints without a valid session.

---

## Phase 5 — Admin CRUD

**Goal:** Full player, fixture, and result management.

- [x] Player create/edit/delete forms + photo upload (Multer, local disk for v1)
- [x] Fixture create/edit forms
- [x] "Record result" flow against a fixture, deriving W/D/L
- [x] Optimistic UI updates or refetch-on-save

**Acceptance:** A non-technical tester can add a player and a result end-to-end without instructions beyond basic labels.

---

## Phase 6 — Polish & deploy

**Goal:** Production-ready case study.

- [x] Full responsive + accessibility QA pass
- [ ] Deploy frontend (Vercel) and backend + DB (Render/Railway) — **not started**; DB is hosted (Neon) but neither app service is deployed
- [x] Environment variables documented in README, `.env.example` committed
- [ ] Update README with live links, screenshots, and a short case-study writeup for Upwork — blocked on deploy

**Acceptance:** Publicly reachable live demo with working admin login (demo credentials documented), ready to link from an Upwork portfolio entry.

---

## Tracking

Progress against these phases is tracked in `06-DEV-LOG.md` with dated entries per work session.
