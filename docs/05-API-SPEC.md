# API Spec — Football Club Platform

**Status:** Draft v1.0 (implemented in Phase 2 & 4) · **Base URL (local):** `http://localhost:4000/api`

## Auth

### `POST /auth/login`

Public. Authenticates admin, returns JWT.

**Request**

```json
{ "email": "admin@footballclub.demo", "password": "••••••••" }
```

**Response `200`**

```json
{ "token": "eyJhbGciOi...", "expiresIn": "2h" }
```

**Response `401`**

```json
{ "error": "Invalid email or password" }
```

Rate limited to 10 attempts per 15 minutes per IP; exceeding it returns `429` with a
`Retry-After` header.

### `POST /auth/change-password`

Admin only (JWT required). Requires the current password, so an unexpired stolen token
is not sufficient on its own to take over the account.

**Request**

```json
{ "currentPassword": "••••••••", "newPassword": "••••••••" }
```

**Response `200`**

```json
{ "message": "Password updated" }
```

| Status | Case                                                     |
| ------ | -------------------------------------------------------- |
| 400    | New password fails policy, or matches the current one    |
| 401    | Missing/invalid JWT, or `currentPassword` is wrong       |

Succeeding also deletes any outstanding reset tokens for the account.

### `POST /auth/forgot-password`

Public. Emails a single-use reset link.

**Request**

```json
{ "email": "admin@footballclub.demo" }
```

**Response `200`** — returned for *every* syntactically valid email, whether or not an
account exists, so the endpoint cannot be used to discover valid admin addresses. This
holds even when the mail send or token write fails internally.

```json
{ "message": "If that email matches an admin account, a reset link is on its way." }
```

Rate limited to 5 requests per hour per IP. The link points at
`CLIENT_URL/admin/reset-password?token=…`, expires in **30 minutes**, and is single-use.
Requesting a new link invalidates any previous one. Only a SHA-256 hash of the token is
stored, so database access alone does not allow a password reset.

> With no `SMTP_URL` configured the link is written to the server log instead of being
> emailed, so the flow is exercisable locally. It is never returned in the HTTP response.

### `POST /auth/reset-password`

Public. Consumes a token from the emailed link.

**Request**

```json
{ "token": "f532faf6…", "newPassword": "••••••••" }
```

**Response `200`**

```json
{ "message": "Password updated. You can now log in." }
```

**Response `400`** — token unknown, already used, or expired. The message is identical in
all three cases so it can't be used to probe token state.

```json
{ "error": "This reset link is invalid or has expired" }
```

### Password policy

Applies to `change-password` and `reset-password`: at least **10 characters**, containing
at least one letter and one number, at most 200 characters. Violations return `400` with
`field: "newPassword"`.

## Players

### `GET /players`

Public. Returns all players.

**Response `200`**

```json
[
  {
    "id": 1,
    "name": "Marcus Reid",
    "position": "DEF",
    "number": 4,
    "photoUrl": "/uploads/marcus-reid.jpg",
    "goals": 4,
    "assists": 2,
    "appearances": 31,
    "cleanSheets": 0,
    "bio": "Club captain, centre back."
  }
]
```

### `POST /players` — Admin only (JWT required)

**Request:** `multipart/form-data` — fields: name, position, number, goals, assists, appearances, cleanSheets, bio, photo (file)
**Response `201`:** created player object

### `PUT /players/:id` — Admin only

**Request:** same shape as POST (partial allowed)
**Response `200`:** updated player object

### `DELETE /players/:id` — Admin only

**Response `204`:** no content

## Fixtures

### `GET /fixtures?status=upcoming|completed`

Public. Defaults to all if no query param.

**Response `200`**

```json
[
  {
    "id": 12,
    "opponent": "Ashfield Rovers",
    "date": "2026-08-23T15:00:00Z",
    "homeAway": "HOME",
    "status": "UPCOMING"
  }
]
```

### `POST /fixtures` — Admin only

**Request**

```json
{ "opponent": "Ashfield Rovers", "date": "2026-08-23T15:00:00Z", "homeAway": "HOME" }
```

**Response `201`:** created fixture

### `PUT /fixtures/:id` — Admin only

**Response `200`:** updated fixture

### `DELETE /fixtures/:id` — Admin only

**Response `204`**

## Results

### `GET /results`

Public. Returns fixtures with status = COMPLETED, joined with their result.

**Response `200`**

```json
[
  {
    "fixtureId": 8,
    "opponent": "Denby Vale",
    "date": "2026-08-16T15:00:00Z",
    "homeAway": "HOME",
    "homeScore": 3,
    "awayScore": 1,
    "outcome": "W"
  }
]
```

### `POST /fixtures/:id/result` — Admin only

Records a result against an existing fixture; sets fixture status to COMPLETED.

**Request**

```json
{ "homeScore": 3, "awayScore": 1 }
```

**Response `201`**

```json
{ "fixtureId": 8, "homeScore": 3, "awayScore": 1, "outcome": "W" }
```

`outcome` is derived server-side from homeScore/awayScore + homeAway, not client-submitted.

## Error shape (all endpoints)

```json
{ "error": "Human-readable message", "field": "optional field name for validation errors" }
```

| Status | Meaning                                                          |
| ------ | ---------------------------------------------------------------- |
| 400    | Validation error                                                 |
| 401    | Missing/invalid auth token                                       |
| 403    | Valid token, insufficient permission (reserved for future roles) |
| 404    | Resource not found                                               |
| 500    | Unhandled server error                                           |
