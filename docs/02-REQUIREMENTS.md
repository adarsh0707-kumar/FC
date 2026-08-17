# Requirements — Football Club Platform

**Status:** Draft v1.0 · **Last updated:** 2026-08-17

## 1. Functional requirements

### 1.1 Public site

| ID    | Requirement                                                                         |
| ----- | ----------------------------------------------------------------------------------- |
| FR-01 | Display a hero section with club identity and next fixture                          |
| FR-02 | List full squad with photo, name, position, number, and key stats                   |
| FR-03 | Show a player's extended bio/achievements on click (detail view or expandable card) |
| FR-04 | List upcoming fixtures with date, opponent, home/away, kick-off time                |
| FR-05 | List recent results with score and W/D/L outcome                                    |
| FR-06 | Site is fully responsive (mobile, tablet, desktop)                                  |
| FR-07 | Public pages read from the live API — no hardcoded content in the final build      |

### 1.2 Admin panel

| ID    | Requirement                                                                                  |
| ----- | -------------------------------------------------------------------------------------------- |
| FR-08 | Admin can log in with email/password                                                         |
| FR-09 | Unauthenticated users cannot reach admin routes (frontend guard + backend middleware)        |
| FR-10 | Admin can create, edit, and delete a player record                                           |
| FR-11 | Admin can upload/replace a player photo                                                      |
| FR-12 | Admin can create and edit a fixture (opponent, date, time, home/away)                        |
| FR-13 | Admin can record a result against a fixture (score, outcome derived automatically)           |
| FR-14 | Once a result is recorded, the fixture moves from "Upcoming" to "Results" on the public site |
| FR-15 | Admin can log out                                                                            |

### 1.3 API

| ID    | Requirement                                                                |
| ----- | -------------------------------------------------------------------------- |
| FR-16 | REST API exposes public GET endpoints for players, fixtures, results       |
| FR-17 | REST API exposes authenticated POST/PUT/DELETE endpoints for admin actions |
| FR-18 | API returns consistent JSON error shapes for validation and auth failures  |

## 2. Non-functional requirements

| ID     | Requirement                                                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | Initial public page load under ~2s on a typical broadband connection                                                                                           |
| NFR-02 | Passwords stored hashed (bcrypt), never in plaintext                                                                                                           |
| NFR-03 | Admin session via JWT with reasonable expiry; no session persisted insecurely in localStorage without awareness of XSS trade-offs (documented in Architecture) |
| NFR-04 | Codebase organized so a new developer can find frontend/backend/DB layers within minutes                                                                       |
| NFR-05 | Environment variables (DB creds, JWT secret) never committed to the repo                                                                                       |
| NFR-06 | Accessible: visible keyboard focus states, sufficient color contrast, reduced-motion respected                                                                 |
| NFR-07 | Deployable as two services (frontend static/SSR host + backend API host) or documented as such even if demoed together                                         |

## 3. Data entities (high level — detailed in Architecture doc)

- **Player**: name, position, number, photo URL, stats (goals, assists, apps, clean sheets), bio, achievements
- **Fixture**: opponent, date, time, home/away, status (upcoming/completed)
- **Result**: linked to a fixture — score, outcome (W/D/L)
- **Admin user**: email, hashed password, role

## 4. Acceptance criteria (v1 done means)

- All FR items above implemented and manually testable
- Admin CRUD reflected on public site without manual redeploy
- No console errors in browser on any public page
- API documented (see 05-API-SPEC.md) and matches actual implementation
