# FuelPass — Fuel Order Management

A full-stack app for submitting and managing aviation fuel orders: submit a
request for refuelling at an airport, then track and progress its status
(`PENDING → CONFIRMED → COMPLETED`).

- **Backend:** NestJS + TypeScript, PostgreSQL via MikroORM, REST API
- **Frontend:** React + TypeScript, React Hook Form + Zod, Tailwind CSS, Axios

## Scaffolding

- **Backend:** Used Nest CLI (`nest new`)
- **Frontend:** Used `npm create vite@latest -- --template react-ts`.
  Which also bundled Tailwind CSS v4 by default.

## Prerequisites

- [Docker](https://www.docker.com/) (for PostgreSQL via Docker Compose)
- Node.js 20+ and npm

## 1. Start the database

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL 17 on `localhost:5432` (user `postgres`, password
`postgres`, database `fuelpass`), persisted to a named Docker volume.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # defaults already match docker-compose, edit if needed
npm run migration:up   # creates the orders table
npm run start:dev      # runs on http://localhost:3000
```

`.env` holds the database connection plus two optional overrides:

- `PORT` — the port Nest listens on (defaults to `3000` in code if unset)
- `FRONTEND_URL` — the origin allowed by CORS (defaults to
  `http://localhost:5173` in code if unset)

## 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env    # defaults to http://localhost:3000, edit if needed
npm run dev              # runs on http://localhost:5173
```

Open `http://localhost:5173` — you should see two tabs, **Submit Order** and
**Manage Orders**.

## API reference

| Method  | Path                 | Description                                         |
| ------- | -------------------- | --------------------------------------------------- |
| `GET`   | `/orders`            | List all orders, or filter with `?airportCode=XXXX` |
| `POST`  | `/orders`            | Create a new order (status defaults to `PENDING`)   |
| `PATCH` | `/orders/:id/status` | Update an order's status to the next valid state    |

## Manual test steps

No automated test suite is included (see [What I'd add next](#what-id-add-next))
— here's how to manually verify each requirement:

**Submit a fuel order (User Story 1)**

1. On the Submit Order tab, try submitting with an empty field, a 3-letter
   ICAO code, and a volume of `0` — each should show an inline error and
   not submit.
2. Submit a valid order with a lowercase ICAO code (e.g. `omdb`) — it should
   succeed, and the order should show as `OMDB` in the Manage Orders tab.
3. Confirm the form clears and a success message appears.

**View and manage orders (User Story 2)**

1. Switch to Manage Orders — the table should show the order you just
   created, with `PENDING` and a yellow badge.
2. Filter by the airport code you used (try both upper and lowercase) —
   only matching orders should appear; clearing the filter shows all orders.
3. Click **Confirm** — status should become `CONFIRMED` (blue badge), and
   the action button should now read **Complete**.
4. Click **Complete** — status should become `COMPLETED` (green badge),
   with no further action shown.
5. Confirm directly via the API that backwards/skipped transitions are
   rejected, e.g.:
   ```bash
   curl -X PATCH http://localhost:3000/orders/<id>/status \
     -H "Content-Type: application/json" -d '{"status":"PENDING"}'
   ```
   This should return `400` with a message listing the allowed next status.

## Tech choices and rationale

- **NestJS** — an opinionated, modular structure (controllers/services/DTOs)
  that scales well and keeps concerns separated by design, rather than
  something you have to enforce manually.
- **MikroORM + PostgreSQL** — chosen specifically to align with FuelPass's
  own production stack, per the brief.
- **class-validator / class-transformer** — validation rules are written as
  decorators directly on the field they apply to (e.g. `@IsPositive()` on
  `requestedFuelVolume`), so NestJS can check an incoming request
  automatically before it ever reaches the controller — no manual `if`
  checks scattered through the code.
- **React + TypeScript** — type safety end-to-end, and the specified
  stack for this project.
- **React Hook Form + Zod** — uncontrolled inputs for fewer re-renders, and
  a single schema as the source of truth for both validation and the
  inferred TypeScript type.
- **Tailwind CSS** — part of the specified stack, and keeps visual effort
  light (no custom CSS files to maintain), in line with the brief's focus
  on logic over design polish.
- **Axios** — a single configured instance (`baseURL`) sets the API's base
  URL once instead of repeating it on every call, unlike raw `fetch`.

## Assumptions

- **ICAO code casing:** the brief specifies exactly 4 letters but not case.
  Since ICAO codes are always uppercase in real aviation practice, lowercase
  input is automatically transformed to uppercase before saving (`omdb` →
  `OMDB`) rather than rejected — better UX than punishing a user for not
  capitalising. This is enforced in the backend via a `class-validator`
  `@Transform`; the frontend's Zod schema just mirrors it by accepting
  either case, matching what the server ends up storing.
- **Delivery window must be in the future:** not stated in the brief, but a
  fuel delivery window entirely in the past doesn't make operational sense.
  Enforced on both the backend (custom validator) and frontend (Zod), with a
  5-minute grace period on the _start_ time only — this tolerates the
  natural delay between picking a time and the request landing (and the
  fact that `datetime-local` inputs are minute-precision). The _end_ time has
  no grace period, since nothing should ever need to be "now."
- **Timezone handling:** delivery window times are captured in the
  submitting user's local browser timezone and converted to UTC for
  storage/transmission. The app does not currently account for the
  destination airport's own timezone — a production system would likely
  standardise on UTC/Zulu time throughout, consistent with real aviation
  scheduling convention.
- **Fuel volume unit:** assumed to be litres (labelled as such in the form);
  the brief doesn't specify a unit.

## Edge cases handled beyond the minimum acceptance criteria

- Airport code filtering is case-insensitive — the filter value is
  uppercased before querying, matching how codes are stored.
- Status transitions are strictly linear and enforced server-side (not just
  in the UI): `PENDING → CONFIRMED → COMPLETED`, no skipping steps, no
  backwards transitions. Invalid attempts return `400` with a message
  stating exactly which transitions are allowed from the current state.
- Unknown/unexpected request fields are rejected outright (`whitelist` +
  `forbidNonWhitelisted` on the global `ValidationPipe`), not silently
  dropped or ignored.
- CORS is scoped to the known frontend origin specifically, not left wide
  open to any origin.
- The UI only ever shows the _one_ valid next status action per order (a
  button, not a dropdown — there's never more than one valid next state at
  a time in this state machine, so a dropdown would be misleading).

## What I'd add next

- **Authentication** — distinguishing Aircraft Operators (submit orders)
  from Operations Managers (manage/progress them), with role-based access
  on the status-update endpoint.
- **Real-time status updates** — a WebSocket (or SSE) channel so the Manage
  Orders table reflects status changes made by other users live, instead of
  only refreshing on navigation/manual filter changes.
- **Audit log of status changes** — who changed what, when, and from which
  status, for accountability/traceability.
- **Pagination** — the orders table currently loads everything at once;
  fine at this scale, but would need cursor/offset pagination for a
  production volume of orders.
- **Automated test coverage** — none exists yet on either side of the
  stack. `OrdersService` matters most to cover first, plus e2e tests for
  the three endpoints and component/hook tests on the frontend.
