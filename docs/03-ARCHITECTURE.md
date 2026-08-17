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
  id           Int                  @id @default(autoincrement())
  email        String               @unique
  passwordHash String
  resetTokens  PasswordResetToken[]
}

model PasswordResetToken {
  id          Int       @id @default(autoincrement())
  tokenHash   String    @unique   // SHA-256 of the token; raw value only ever in the email
  adminUserId Int
  adminUser   AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  usedAt      DateTime?
  createdAt   DateTime  @default(now())

  @@index([adminUserId])
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
- ~~Add rate limiting on `/api/auth/login`.~~ **Built** — see §8. Counters are in-process,
  so this must move to a shared store (Redis) if the API is ever run on more than one
  instance.
- Add role-based permissions if multi-user admin is needed.
- **Invalidate live JWTs on password change.** Changing or resetting a password does not
  currently revoke tokens already issued, so a session opened beforehand stays usable
  until it expires (max 2h). Closing this needs a `passwordChangedAt` column on
  `AdminUser` plus a check in `authGuard` that rejects tokens issued before it. Deferred
  rather than overlooked: it costs a migration, and with a 2h expiry and a single admin
  the exposure window is small.

## 8. Password management

Three flows, all sharing one policy (≥10 characters, at least one letter and one number,
≤200 characters) enforced in `utils/passwordPolicy.js`:

- **Change password** (`POST /auth/change-password`, authenticated) — requires the current
  password, so an unexpired stolen token is not enough on its own.
- **Forgot password** (`POST /auth/forgot-password`, public) — emails a single-use link.
- **Reset password** (`POST /auth/reset-password`, public) — consumes that link's token.

Design decisions worth calling out:

- **Tokens are stored hashed.** `PasswordResetToken.tokenHash` holds a SHA-256 digest; the
  raw token exists only inside the emailed URL. Read access to the database therefore does
  not let an attacker reset a password. (Unlike a user password, a 256-bit random token
  has no guessable structure, so a plain hash is appropriate here — bcrypt's work factor
  buys nothing against a uniformly random secret.)
- **No account enumeration.** `forgot-password` returns the same 200 body for every valid
  email address. The entire post-lookup branch is wrapped in try/catch specifically so
  that an internal failure on a *real* address can't produce a different response than an
  unknown one.
- **Single-use, superseding, expiring.** Tokens expire after 30 minutes, are marked
  `usedAt` on redemption, and requesting a new link deletes outstanding ones. Changing the
  password by any route clears all reset tokens for the account.
- **Mail is provider-agnostic.** `utils/mailer.js` takes an `SMTP_URL` connection string,
  so SendGrid/Resend/Mailgun/SES all work without a code change. With no `SMTP_URL` set,
  the link is written to the server log so the flow is exercisable in local development —
  it is never returned in the HTTP response, which would let anyone reset the password.
- **Rate limiting** (`middleware/rateLimit.js`): 10 login attempts per 15 min and 5 reset
  requests per hour, per IP. Behind a proxy this needs `TRUST_PROXY` set, or every client
  shares one bucket.
