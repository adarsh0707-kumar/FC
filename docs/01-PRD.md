# PRD — Football Club Management Platform

**Owner:** Adarsh Kumar
**Status:** Draft v1.0
**Last updated:** 2026-08-17

## 1. Problem statement

Small and mid-size football/sports clubs typically have one of two setups: no website at all, or a static one that goes stale within weeks because updating it requires a developer. Squad changes, weekly fixtures, and match results need to be editable by non-technical club staff (managers, secretaries, volunteers) without touching code.

## 2. Goal

Build a full-stack club website with:

- A **public-facing site** showcasing the squad, fixtures, and results — fast, responsive, visually distinct (not a generic template).
- An **admin panel** where authorized staff can add/edit players, schedule fixtures, and record results, with changes reflected on the public site immediately.

This is built as a portfolio case study demonstrating a real client-style engagement (club website briefs are common on Upwork/Freelancer), showing the full lifecycle: requirements → architecture → phased build → working product.

## 3. Target users

| User                                  | Needs                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------- |
| **Club admin/staff**            | Log in, manage players, fixtures, results — no code knowledge required   |
| **Supporters/site visitors**    | Browse squad, check upcoming fixtures, see recent results, read club info |
| **Prospective client (Upwork)** | Evaluate this as evidence of full-stack delivery capability               |

## 4. Success criteria

- Admin can create/edit/delete a player and see it reflected on the public squad page within seconds, no redeploy.
- Admin can add a fixture, and after the match, mark a result — it moves automatically from "Upcoming" to "Results."
- Public site loads fast, is mobile-responsive, and has no placeholder/broken content in the final build.
- Codebase is clean enough to walk a client through in a demo call.

## 5. Scope

**In scope (v1):**

- Public pages: Home/Hero, Squad, Fixtures, Results, About
- Admin: authentication (login), player CRUD, fixture CRUD, result recording
- REST API (Express) backing both public and admin views
- PostgreSQL data store
- Single deployable repo (frontend + backend), documented

**Out of scope (v1) — noted as "Phase 2 ideas" for the case study narrative:**

- Multi-club/multi-tenant support
- News/blog module
- Payment/ticketing integration
- Real-time live match commentary
- Role-based permissions beyond a single "admin" role

## 6. User stories (representative)

- As a **visitor**, I want to see the current squad with stats and photos, so I can follow my favorite players.
- As a **visitor**, I want to see upcoming fixtures and recent results at a glance.
- As an **admin**, I want to log in securely, so only authorized staff can edit content.
- As an **admin**, I want to add a new player with their photo, position, and stats in under a minute.
- As an **admin**, I want to enter a final score after a match and have it move automatically into the results list.

## 7. Risks / open questions

- Photo storage: local uploads vs. a cloud bucket — decided in Architecture doc.
- Auth complexity: kept intentionally simple (single admin role, JWT) since this is a small-club use case, not enterprise.
- Scope creep: documented explicitly as "out of scope" above to keep the case study buildable in phases without stalling.
