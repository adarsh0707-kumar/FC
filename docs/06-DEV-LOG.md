# Dev Log — Football Club Platform

Dated entries tracking actual build progress against `04-PHASES.md`. Kept honest — what was done, what broke, what changed from the original plan — so this doubles as a real case-study record for the Upwork listing.

## Status summary

| Phase                              | Status         | Notes                                                                      |
| ---------------------------------- | -------------- | -------------------------------------------------------------------------- |
| Phase 0 — Setup                    | ✅ Done        | Docs, repo (git initialized 2026-08-17), clients/server scaffold           |
| Phase 1 — Public front end         | ✅ Done        | All public pages built, styled, responsive; player detail added            |
| Phase 2 — Backend API + DB         | ✅ Done        | Full CRUD API, Prisma + Neon Postgres live; Postman collection outstanding |
| Phase 3 — Connect front end to API | ✅ Done        | No mock data remaining, all pages live-wired                               |
| Phase 4 — Admin auth               | ✅ Done        | JWT login, route guards, 401 verified by request                           |
| Phase 5 — Admin CRUD               | ✅ Done        | Players + fixtures (create/edit/delete) + result record/correct            |
| Phase 6 — Polish & deploy          | 🔶 In progress | Responsive/a11y pass + DB cleanup done; **nothing deployed yet**           |

**5 of 6 phases complete and independently verified.** Database is clean and seeded
with presentable demo content. Remaining: deploy to Vercel + Render, produce the API
collection, and rotate the demo admin password (see the 2026-08-17 audit entry below).

---

### 2026-08-17 — Phase 0: Docs & planning

- Wrote PRD, Requirements, Architecture, Phases, and API Spec docs.
- Decided stack: React (Vite) + Express + PostgreSQL + Prisma, matching existing portfolio projects (MedBill Pro, Welth) for a cohesive case study.
- Repo: `github.com/adarsh0707-kumar/FC-demo`
- Existing static HTML demo (`colliery-town-afc-demo.html`) kept as the visual reference for Phase 1 rebuild.

---

### 2026-08-17 (cont'd) — Phases 0–5: full scaffold built and verified

Built further than originally planned for a single session — client, server, database, and admin CRUD all completed and tested together rather than strictly sequencing one phase at a time.

**Server (Express + Prisma):**

- Full folder structure per `03-ARCHITECTURE.md`: routes, controllers, middleware (authGuard, errorHandler, upload), Prisma schema, seed script.
- Auth (JWT + bcrypt), Players CRUD, Fixtures CRUD, Results recording with server-derived W/D/L outcome (`utils/deriveOutcome.js`) — client never sends the outcome directly, preventing tampering.
- **Bug hit:** Prisma CLI couldn't find the schema at its default location (we use `src/prisma/schema.prisma`, not the default `./prisma/`). **Fixed** by adding a `prisma` config block to `package.json`.
- **Bug hit:** Prisma 7 removed `url = env("DATABASE_URL")` support directly in `schema.prisma` — driver adapters are now mandatory. **Fixed** by adding `prisma.config.mjs`, installing `@prisma/adapter-pg` + `pg`, and updating `PrismaClient` instantiation (both in `prismaClient.js` and `seed.js`) to use `PrismaPg` adapter.
- **Bug hit:** `nodemon` exited immediately (silent "clean exit") when run under `concurrently`, because it read the piped/closed stdin as a shutdown signal. **Fixed** with the `--no-stdin` flag.

**Client (React + Vite):**

- Design tokens/global CSS carrying over the original static demo's visual identity.
- API layer, auth context, `RequireAuth` guard.
- Public pages (Home, Squad, Fixtures, Results, About) wired to live API with loading/error/empty states.
- Admin: Login, Dashboard, PlayersManage (full CRUD + photo upload), FixturesManage (create/delete fixtures + inline result recording).

**Database:**

- Connected to a hosted Neon PostgreSQL instance (avoided local Postgres install entirely — no local install existed on the dev machine, hosted DB also matches the eventual Render deployment story).
- `npx prisma migrate dev --name init` applied successfully — all four tables live (`Player`, `Fixture`, `Result`, `AdminUser`).
- Seeded with sample squad (6 players), 2 completed results, 1 upcoming fixture, and a demo admin login.

**Verified end-to-end (with screenshots):**

- Public Squad, Fixtures, Results, About pages all rendering real data from the live database.
- Admin login working.
- Added a real player through the admin panel → appeared correctly on the public Squad page.
- Added a real fixture → appeared on Fixtures.
- Recorded a result on that fixture → correctly moved to Results with the right score **and** correctly derived outcome as a **Loss** (an away match where the club conceded more than it scored) — confirms the server-side outcome logic works, not just a pass-through of admin input.

**Known gaps carried forward:**

- `TickerStrip` component (scrolling recent-form strip from the original static demo) not yet rebuilt in React — cosmetic only, everything else works without it.
- Player photo uploads use local disk storage (Multer) — fine for local dev, but will not persist on Render's free tier (ephemeral filesystem). Documented as a v2 upgrade (S3/Cloudinary) in the architecture doc, not fixed yet.
- Test data added during verification (a test player, a test fixture) still sitting in the database — needs cleanup before this is presented as a client-facing portfolio demo.

---

### 2026-08-17 (cont'd) — Phase 6: deployment prep + rebrand

- Issued full deployment walkthrough: Render (backend, root dir `server/`, env vars `DATABASE_URL`/`JWT_SECRET`, build command runs `prisma generate` + `migrate deploy`) and Vercel (frontend, root dir `client/`, `VITE_API_URL` pointing at the Render URL). **Not yet confirmed live** — deployment was explained but completion not yet verified back in this log.
- Rebranded the demo from "Colliery Town AFC" to a generic "Football Club" identity, since the mining/colliery backstory was specific to one fictional club and doesn't generalize well as a reusable portfolio template:
  - Navbar, Footer, Home hero, About page copy all updated (rewrote the coal-mining origin story to a generic community-club narrative).
  - Server startup log, seed script (admin email changed to `admin@footballclub.demo`), README, package.json description, and all six docs updated.
  - **Open item:** the live/local database still has the old admin login (`admin@collierytown.fc`) seeded under the old email — needs either a SQL rename (`UPDATE "AdminUser" SET email = ...`) or a re-seed to match the new seed script. Not yet confirmed which path was taken.
- Provided a fresh downloadable zip (`FC-demo-fullstack-v2.zip`) with all renamed files for manual reconciliation into the working project (to avoid clobbering local `node_modules`/`.env`/git history).

**Next:**

1. Confirm the admin login DB update (SQL rename vs re-seed) actually happened.
2. Confirm Render + Vercel deployments are live and passing the same verification checklist used locally (Squad/Fixtures/Results load real data, admin login works, full write loop confirmed).
3. Clean up leftover test data (test player, test fixture) before linking this as a live Upwork portfolio piece.
4. Optional polish: build the `TickerStrip` component, address photo-upload persistence for production.

---

### 2026-08-17 (cont'd) — Audit pass: verification, cleanup, and gap closure

A full read of the codebase against `02-REQUIREMENTS.md` and `04-PHASES.md`, then
fixes for what the audit turned up. **Everything below was verified by exercising the
running API and building the client — not by self-report.** The previous entry's "5 of 6
phases complete" was broadly right but overstated in three places, corrected here.

**Audit findings — what the earlier log had wrong:**

- **FR-03 was never implemented.** "Show a player's extended bio/achievements on click"
  was silently skipped. `GET /players/:id` existed server-side and the client wrapper
  existed, but `PlayerDetail.jsx` was a **0-byte file**, had no route, and `PlayerCard`
  was not clickable — meaning the `bio` column was being stored and never displayed
  anywhere on the site.
- **Three more empty files.** `Hero.jsx`, `TickerStrip.jsx`, and `admin/RecordResult.jsx`
  were also 0 bytes. The earlier log flagged only `TickerStrip`.
- **FR-12 was half-done.** "Admin can create **and edit** a fixture" — `PUT /fixtures/:id`
  worked and `updateFixture()` existed in the client API layer, but nothing ever called
  it. There was no edit UI.
- **All six docs and the README were duplicated** — the rebrand appended a second copy
  below the first rather than replacing it. The *first* copy of each was also truncated
  mid-sentence, so the surviving complete text was the old-branded one.
- **No git repository existed** despite the log referencing a GitHub remote, and
  `.gitignore` contained `.node_modules` (leading dot), which matches nothing — a first
  `git add .` would have committed both `.env` files and both `node_modules` trees,
  violating NFR-05.

**Bugs found and fixed:**

- **Deleting a completed fixture returned 500.** `Result.fixtureId` is
  `ON DELETE RESTRICT`, but `FixturesManage` rendered a Delete button on every fixture
  including completed ones. `deleteFixture` now removes the result and the fixture in a
  single `prisma.$transaction`, so it cannot orphan a result row. *(Considered
  `onDelete: Cascade` in the schema instead — deferred, since it needs a migration and
  the transaction is explicit at the call site.)*
- **Stale W/D/L on edit.** `outcome` is derived from `homeAway`, so flipping a completed
  fixture from HOME to AWAY left the old outcome in place — a win displayed as a loss.
  `updateFixture` now recomputes `outcome` from the unchanged scoreline whenever
  `homeAway` changes on a fixture that already has a result. Verified: away 1–3 recorded
  as `W`, flipped to home, re-read as `L`.
- **`updateFixture` accepted any `homeAway` value** — `createFixture` validated it,
  `updateFixture` did not. Now returns the documented 400 + `field` error shape.

**Built:**

- `PlayerDetail.jsx` (FR-03) at `/squad/:id` — photo, position, stat grid, and the
  previously-unreachable `bio`. Clean sheets only render for keepers. `PlayerCard` is now
  a `<Link>` with an `aria-label`. Note: the requirement says "bio/**achievements**", but
  no `achievements` column exists in the schema — the stat grid stands in for it. Adding
  a real field would need a migration; flagged as a decision, not silently dropped.
- Fixture **edit** UI (FR-12) — edit/cancel flow mirroring `PlayersManage`, with UTC↔local
  conversion for `datetime-local`.
- Result **correction** — score inputs now render for completed fixtures too, prefilled
  with the recorded score, so a mistyped result can be fixed. The server already did an
  `upsert`; only the UI gated it.

**Polish (Phase 6):**

- Responsive pass: `About` (was a hard-coded 2-column grid), fixture/result rows (were a
  fixed `90px 1fr 96px 90px`, now collapse to two lines under 640px), and the navbar
  (now wraps). Added an `Admin` nav link — previously `/admin/login` was reachable only
  by typing the URL.
- Accessibility: associated all 9 `PlayersManage` form labels with their controls via
  `htmlFor`/`id`. Focus-visible and reduced-motion were already in place.
- Deleted the three empty components and the unused `index.css` (114 lines of leftover
  Vite boilerplate, imported nowhere). `TickerStrip` was dropped rather than stubbed —
  it appears in no requirement; recoverable from history if wanted.
- Added `server/.env.example` and `clients/.env.example` — the README instructed copying
  them and they did not exist.
- De-duplicated all six docs + README, keeping the complete copy and rebranding it.
  Corrected `client/` → `clients/` throughout (the documented Vercel root directory was
  simply wrong). Corrected the architecture doc's auth section, which described a
  refresh-token-in-httpOnly-cookie flow that was never built.
- `git init` + a real `.gitignore`; confirmed no `.env` or `node_modules` is trackable.

**Verified this pass:**

| Check                                          | Result                          |
| ---------------------------------------------- | ------------------------------- |
| `GET /api/health`                              | `{"status":"ok"}`               |
| `GET /api/players` / `fixtures` / `results`    | Real data, outcomes correct     |
| `GET /api/players/:id` + 404 path              | Serves `bio`; 404 shape correct |
| `POST /api/fixtures` without token             | `401`                           |
| `PUT /api/fixtures/:id` with bad `homeAway`    | `400` + `field`                 |
| Outcome recompute on home/away flip            | `W` → `L`                       |
| `DELETE` a completed fixture                   | `204` (previously `500`)        |
| Orphaned results after delete                  | `0`                             |
| `npx oxlint` / `npm run build`                 | Clean (1 pre-existing warning)  |

**Database cleanup — done.** `server/src/prisma/cleanup.js` (idempotent, supports
`--dry`) was run against the live Neon database. It removed test player "Adarsh";
restored **Callum Naylor (#1 GK)**, deleted during Phase 5 testing and never replaced —
the demo squad had been running without a goalkeeper; removed 3 duplicate fixtures (the
seed had been run twice); removed test fixture "india"; and deleted the stale
`admin@collierytown.fc` account. That last item resolves the previous entry's open
question: the rebrand had been handled by re-seeding, which created a *second* admin
rather than renaming the first, leaving the old-brand credentials live. The orphaned
upload left behind by the deleted test player was also removed from `server/uploads/`.

Post-cleanup state, verified by request against the running API:

| Check                                     | Result                              |
| ----------------------------------------- | ----------------------------------- |
| Squad                                     | 6 players, keeper present           |
| Fixtures                                  | 3, zero duplicates                  |
| Results                                   | 2 (`3–1 W`, `1–1 D`)                |
| Login as `admin@collierytown.fc`          | `401` — credentials revoked         |
| Login as `admin@footballclub.demo`        | `200`                               |
| Orphaned files in `server/uploads/`       | 0                                   |

**Still open:**

1. Deploy to Render + Vercel — root dirs `server/` and `clients/` (**plural**).
2. Postman/Thunder collection for `05-API-SPEC.md` (Phase 2 acceptance criterion).
3. Photo uploads still on local disk — will not survive a Render free-tier restart.
   S3/Cloudinary remains the documented v2 upgrade. Worth resolving *before* the demo
   goes live, since player photos are the most visible thing an evaluator would add.
4. `server/` has no linter; `clients/` has oxlint.
5. Demo admin password is still `changeme123` — must be rotated before the site is
   publicly reachable.

**Next:** deploy.

---

### 2026-08-17 (cont'd) — Password management: show/hide, change, and reset

Requested: a show/hide toggle on the login password field, plus change-password and
forgot-password options. The toggle is a small UI change; the other two needed a schema
change, three endpoints, and a mail path.

**Schema:** added `PasswordResetToken` (migration
`20260817153508_add_password_reset_tokens`) — `tokenHash` unique, `expiresAt`, `usedAt`,
cascade-deleted with its `AdminUser`.

**Endpoints** (all documented in `05-API-SPEC.md`):

- `POST /auth/change-password` — authenticated, requires the current password.
- `POST /auth/forgot-password` — public, emails a single-use link.
- `POST /auth/reset-password` — public, consumes the token.

**Security decisions:**

- **Only the SHA-256 hash of a reset token is stored.** The raw token lives only in the
  emailed URL, so read access to the database can't be turned into a password reset. Plain
  SHA-256 rather than bcrypt is deliberate — the token is 256 bits of uniform randomness,
  so a work factor buys nothing.
- **No account enumeration.** `forgot-password` returns an identical 200 body for every
  address. During testing this actually failed: the Prisma client hadn't been regenerated
  after the migration, so a *real* address threw `Cannot read properties of undefined
  (reading 'deleteMany')` while an unknown one returned the generic message — the
  difference alone revealed which addresses had accounts. Fixed by regenerating, then
  hardened by wrapping the whole post-lookup branch in try/catch so no future internal
  error can reintroduce the leak.
- **The reset link is never returned in the HTTP response**, only emailed or (without
  SMTP configured) written to the server log. Returning it would let anyone who can reach
  the endpoint take over the account.
- Tokens expire in 30 minutes, are single-use, are superseded when a new link is
  requested, and are all cleared when the password changes by any route.
- **Rate limiting added** (`middleware/rateLimit.js`, no new dependency): 10 logins per
  15 min and 5 reset requests per hour, per IP. This closes an item `03-ARCHITECTURE.md`
  had listed as a v2 upgrade. In-process counters, so it needs Redis if the API is ever
  scaled past one instance — noted in the architecture doc.
- Password policy (`utils/passwordPolicy.js`): ≥10 chars, at least one letter and one
  number. Length is weighted over character-class rules, which mostly produce predictable
  substitutions.

**Mail:** `utils/mailer.js` takes an `SMTP_URL` connection string, so any provider works
without a code change (nodemailer added — the only new dependency). With no `SMTP_URL`,
the link is logged instead, so the flow is exercisable locally with no email account.

**Client:** new `PasswordField` component — a real `<button type="button">` so it's
keyboard-reachable and can't submit the form, with visibility resetting on mount so a
revealed password doesn't persist across navigation. Used in all four password inputs.
New pages: `ForgotPassword`, `ResetPassword` (reads `?token=`, handles a missing token),
`ChangePassword` (linked from the dashboard). Login now has a "Forgot your password?" link.

**Bugs hit:**

- **Migration couldn't reach the database.** `P1001` against Neon. Not an outage: DNS
  returns AAAA records first, Node 17+ uses verbatim DNS ordering, and **this machine has
  no working IPv6 egress** (`curl -6` to any host fails, IPv4 is fine). Prisma was dialling
  a dead route. Confirmed by resolving the A record and connecting successfully.
  `dns.setDefaultResultOrder("ipv4first")` now runs at server startup so this can't
  intermittently break the API; the migration was run with `NODE_OPTIONS=--dns-result-order=ipv4first`.
- **`prisma migrate dev` did not leave a usable client** — see the enumeration bug above.
  `npx prisma generate` was needed explicitly.

**Verified against the running API:**

| Check                                            | Result                       |
| ------------------------------------------------ | ---------------------------- |
| `forgot-password`, unknown vs. real email        | Byte-identical 200 responses |
| Reset token stored as 64-char SHA-256 hex        | Confirmed, raw never stored  |
| Reset with a weak password                       | `400` + `field`              |
| Reset with an unknown token                      | `400`                        |
| Reset with a valid token                         | `200`, password changed      |
| **Reusing a consumed token**                     | `400` — single-use holds     |
| Login with the old password after reset          | `401`                        |
| Login with the new password                      | `200`                        |
| `change-password` without a JWT                  | `401`                        |
| `change-password` with a wrong current password  | `401` + `field`              |
| `change-password` reusing the same password      | `400` + `field`              |
| `change-password` with a letters-only password   | `400` + `field`              |
| Reset rate limit (5/hr)                          | `429` + `Retry-After`        |
| Client lint + build                              | Clean                        |

Test artifacts cleaned up afterwards: the admin password was cycled back to
`changeme123` so the documented demo credential still works, and the leftover reset token
was deleted.

**Still open:** unchanged from the previous entry (deploy, API collection, upload
persistence, `server/` linting, rotating the demo password), plus one new item now
documented in `03-ARCHITECTURE.md` §7: **changing a password does not invalidate JWTs
already issued** — a session opened beforehand stays valid until it expires (max 2h).
Closing it needs a `passwordChangedAt` column and an `authGuard` check. Deferred, not
overlooked.

---

<!--
Template for future entries:

### YYYY-MM-DD — Phase N: <short title>
- What was built
- Any deviation from the plan and why
- Bugs hit + how resolved
- **Next:** immediate next step
-->
