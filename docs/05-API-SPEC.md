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
