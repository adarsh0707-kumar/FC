# Architecture — Football Club Platform

**Status:** Draft v1.0 · **Last updated:** 2026-08-17

## 1. Stack

| Layer            | Choice                                                                         | Why                                                                                               |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Frontend         | React (Vite)                                                                   | Fast dev loop, matches existing portfolio stack (Welth, MedBill Pro), easy to deploy static build |
| Backend          | Node.js + Express                                                              | Lightweight REST API, quick to reason about for a small-scope app                                 |
| Database         | PostgreSQL                                                                     | Relational fit for players/fixtures/results; matches existing Prisma experience                   |
| ORM              | Prisma                                                                         | Type-safe queries, easy migrations, already used in MedBill Pro                                   |
| Auth             | JWT (jsonwebtoken) + bcrypt                                                    | Simple, stateless, appropriate for a single-admin-role app                                        |
| File uploads     | Multer (local disk for demo) → swappable for S3/Cloudinary in production note | Keeps v1 simple; documented upgrade path                                                          |
| Frontend hosting | Vercel                                                                         | Free tier, fast static/SSR hosting                                                                |
| Backend hosting  | Render / Railway                                                               | Free/low-cost Node hosting with Postgres add-on                                                   |

## 2. High-level system diagram (textual)

```
[ React (Vite) SPA ]  <-- HTTPS/JSON -->  [ Express API ]  <-- Prisma -->  [ PostgreSQL ]
        |                                        |
   public pages                          /api/players
   admin panel (JWT)                     /api/fixtures
                                          /api/results
                                          /api/auth
```

## 3. Repo structure

```
FC/
├── docs/                        # this documentation set
├── clients/                     # React app (Vite)
│   ├── src/
│   │   ├── pages/               # Home, Squad, PlayerDetail, Fixtures, Results, About
│   │   │   └── admin/           # Login, Dashboard, PlayersManage, FixturesManage
│   │   ├── components/          # PlayerCard, FixtureRow, ResultRow, Navbar, Footer, …
│   │   ├── api/                 # fetch wrappers per resource
│   │   ├── context/             # auth context
│   │   └── styles/              # tokens.css, global.css
│   └── vite.config.js
├── server/                      # Express API
│   ├── src/
│   │   ├── routes/              # auth, players, fixtures, results (*.routes.js)
│   │   ├── controllers/         # one per resource (*.controller.js)
│   │   ├── middleware/          # authGuard.js, errorHandler.js, upload.js
│   │   ├── utils/               # prismaClient.js, deriveOutcome.js
│   │   ├── prisma/              # schema.prisma, migrations/, seed.js
│   │   └── index.js
│   ├── uploads/                 # Multer destination (gitignored, see §7)
│   ├── prisma.config.mjs        # Prisma 7 config — datasource URL lives here
│   └── package.json
└── README.md
```

> **Note:** the frontend folder is `clients/` (plural). Deployment root directories in
> §7 and the README must use `clients/`, not `client/`.

## 4. Data model (Prisma schema outline)

```prisma
model Player {
  id           Int      @id @default(autoincrement())
  name         String
  position     String   // GK, DEF, MID, FWD
  number       Int
  photoUrl     String?
  goals        Int      @default(0)
  assists      Int      @default(0)
  appearances  Int      @default(0)
  cleanSheets  Int      @default(0)
  bio          String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Fixture {
  id         Int      @id @default(autoincrement())
  opponent   String
  date       DateTime
  homeAway   String   // "HOME" | "AWAY"
  status     String   @default("UPCOMING") // UPCOMING | COMPLETED
  result     Result?
}

model Result {
  id         Int      @id @default(autoincrement())
  fixtureId  Int      @unique
  fixture    Fixture  @relation(fields: [fixtureId], references: [id])
  homeScore  Int
  awayScore  Int
  outcome    String   // "W" | "D" | "L"
}

model AdminUser {
  id           Int    @id @default(autoincrement())
  email        String @unique
  passwordHash String
}
```

## 5. Auth flow

1. Admin submits email/password to `POST /api/auth/login`.
2. Server verifies password against bcrypt hash, issues a signed JWT (short expiry, e.g. 2h).
3. Frontend stores the token **in React state only** (`AuthContext`) — never in `localStorage`/`sessionStorage`.
4. Protected routes (`/api/players` POST/PUT/DELETE, etc.) go through `authGuard` middleware that verifies the JWT.
5. Frontend admin routes are wrapped in a `<RequireAuth>` component that redirects to `/admin/login` if no valid session.

**Trade-off (as built):** keeping the token in memory means it is not reachable by an
XSS payload reading storage, but it also means a page refresh inside `/admin/*` drops the
session and bounces the admin back to the login screen. That is accepted for v1 at this
scale. A refresh-token-in-httpOnly-cookie flow is the documented v2 upgrade (§7) — it was
considered for v1 and deliberately not built, to avoid adding cookie/CSRF handling to a
single-admin demo.

## 6. Key design decisions

- **Single admin role for v1** — matches the actual use case (a small club has one or two staff managing content), keeps auth simple, documented as an extension point for v2 (multiple roles: manager, media officer, etc.).
- **Result as a separate model linked to Fixture** rather than fields on Fixture — keeps "upcoming" vs "completed" logic clean and makes the public Fixtures/Results split a straightforward query filter.
- **Prisma over raw SQL** — faster iteration, migrations tracked in version control, consistent with other portfolio projects for a cohesive case study.

## 7. Production upgrade notes (documented, not built in v1)

- Swap local file uploads for S3/Cloudinary.
- Add refresh tokens / rotate JWT secret.
- Add rate limiting on `/api/auth/login`.
- Add role-based permissions if multi-user admin is needed.
