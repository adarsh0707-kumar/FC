# Football Club — Full-Stack Club Website.

A full-stack football club website: public squad/fixtures/results pages backed by a real database, plus an admin panel for club staff to manage everything without touching code.

Built as a portfolio case study (React + Express + PostgreSQL/Prisma) demonstrating a complete client-style engagement — docs, phased build, and a working product.

## Docs

Start here: [`docs/01-PRD.md`](docs/01-PRD.md) → [`02-REQUIREMENTS.md`](docs/02-REQUIREMENTS.md) → [`03-ARCHITECTURE.md`](docs/03-ARCHITECTURE.md) → [`04-PHASES.md`](docs/04-PHASES.md) → [`05-API-SPEC.md`](docs/05-API-SPEC.md) → [`06-DEV-LOG.md`](docs/06-DEV-LOG.md)

## Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt

## Local setup

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (local install, or a free hosted one like [Neon](https://neon.tech) or [Supabase](https://supabase.com))

### 2. Install everything

```bash
npm run install:all
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
cp clients/.env.example clients/.env
```

Edit `server/.env` and set `DATABASE_URL` to your Postgres connection string, and `JWT_SECRET` to any long random string.

Password-reset emails need `SMTP_URL` (any provider's SMTP connection string) and
`CLIENT_URL` (where reset links should point). **Leave `SMTP_URL` unset in local
development** — the reset link is printed to the server log instead of being emailed, so
the flow is fully testable without an email account.

### 4. Set up the database

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
cd ..
```

This creates a demo admin login: **admin@footballclub.demo / changeme123** — change this before any real deployment.

### 5. Run both client and server together

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000

## Project structure

```
FC/
├── docs/       # PRD, requirements, architecture, phases, API spec, dev log
├── clients/    # React (Vite) frontend
└── server/     # Express API + Prisma
```

> The frontend folder is `clients/` — plural. Use that exact name as the Vercel root directory.

See [`03-ARCHITECTURE.md`](docs/03-ARCHITECTURE.md) for the full breakdown of each folder.

## Deployment

- **Frontend → Vercel:** set Root Directory to `clients/`, add `VITE_API_URL` pointing at your deployed backend.
- **Backend → Render/Railway:** set Root Directory to `server/`, add `DATABASE_URL` and `JWT_SECRET` env vars, run `npx prisma migrate deploy` as part of the build. Also set `CLIENT_URL` (so reset links point at the deployed frontend), `TRUST_PROXY=1` (so rate limiting sees real client IPs rather than the proxy's), and `SMTP_URL` if password-reset emails should actually send.

## Built by

Adarsh Kumar — [github.com/adarsh0707-kumar](https://github.com/adarsh0707-kumar)
