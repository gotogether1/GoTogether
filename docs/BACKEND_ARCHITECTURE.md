# Go Together — Backend Architecture

## Purpose

Build one secure Node.js API for the Android Go Together app. It runs on a **Render Free Web Service**, verifies Firebase users, owns all business rules, and is the only application service that reads/writes Cloud Firestore.

The backend does not serve a website, process payments, store files locally, use a separate SQL database, or expose Firebase Admin secrets to the Android app.

## Stack

- Node.js 20+
- TypeScript
- Express
- Firebase Admin SDK
- Firestore Admin client
- Zod (or an equivalent small TypeScript validation library)
- Render Free Web Service

Keep dependencies minimal. Avoid Docker, Redis, queues, ORMs, GraphQL, microservices, WebSockets, and background-job systems in the MVP.

## Service boundaries

```text
Android app
  → Firebase Authentication creates session / ID token
  → HTTPS Render API receives Firebase ID token
  → Express authentication middleware verifies the token
  → route validation checks request fields
  → service layer checks ownership, booking seats, blocks, and state transitions
  → Firebase Admin SDK reads/writes Firestore in transactions
  → API returns a safe response DTO
```

The client never calls Firestore for app data and never sends a `uid`, `driverId`, or `riderId` that the backend trusts.

## Project structure

```text
backend/
  src/
    server.ts                 # starts HTTP server and binds process.env.PORT
    app.ts                    # Express app, middleware, routes
    config/
      env.ts                  # validates environment variables at startup
      firebase-admin.ts       # initializes Firebase Admin once
    middleware/
      authenticate.ts         # Firebase Bearer-token verification
      error-handler.ts        # centralized safe errors
      not-found.ts
      request-id.ts
      rate-limit.ts           # lightweight route protection
    routes/
      health.routes.ts
      me.routes.ts
      rides.routes.ts
      bookings.routes.ts
      reviews.routes.ts
      notifications.routes.ts
      reports.routes.ts
      blocks.routes.ts
    services/
      user.service.ts
      ride.service.ts
      booking.service.ts
      review.service.ts
      notification.service.ts
      report.service.ts
      block.service.ts
    validators/
      user.schemas.ts
      ride.schemas.ts
      booking.schemas.ts
    types/
      domain.ts
      express.d.ts            # adds req.auth.uid after middleware
    utils/
      api-error.ts
      async-handler.ts
      pagination.ts
      response-mappers.ts
  package.json
  tsconfig.json
  .gitignore
  .env.example
  README.md
```

## Startup and health

### `GET /health`

- Public route; no Firebase token required.
- Returns HTTP 200 with service name, version, and status.
- Does not expose environment variables, credentials, database contents, or internal stack traces.
- Configure Render’s health check to call this route.

### Server requirements

- Bind to `0.0.0.0` and `process.env.PORT` (Render commonly supplies the port).
- Fail fast at startup when required environment variables are missing.
- Initialize Firebase Admin exactly once.
- Gracefully handle shutdown signals if the platform restarts the service.

## Environment variables

Set these only in Render environment secrets or local uncommitted `.env` files:

```text
NODE_ENV=production
PORT=10000
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

Notes:

- Render’s private key may need newline handling; validate it on startup.
- Do not commit `.env` files.
- Do not send these values to the Android app.
- Do not use a local Firebase Admin JSON file in production; use Render secrets.
- Add notification-sender credentials only in a later phase and only as Render secrets.

## Authentication middleware

Apply `authenticate` to every `/v1/*` route.

1. Read `Authorization: Bearer <Firebase ID token>`.
2. Reject missing/malformed header with HTTP `401`.
3. Verify token using `firebaseAdmin.auth().verifyIdToken(token)`.
4. Set `req.auth = { uid, email, providerIds }` from the verified token.
5. Never accept identity/role from the request body or query.
6. Return HTTP `401` for invalid/expired tokens, with a safe message.

The Android app refreshes/retrieves its Firebase ID token before protected API requests.

## Request validation

Validate body, query, params, enums, length limits, and numeric ranges before any database action.

Examples:

- `vehicleType`: `carpool` or `bike_pool`
- `totalSeats`: integer 1–4
- `seatsRequested`: integer 1–4
- `notes`: maximum 500 characters
- `riderMessage`: maximum 300 characters
- `review.rating`: integer 1–5
- `report.details`: maximum 1,000 characters
- dates: valid ISO values and ride departure must be in the future

Return HTTP `400`/`422` with field-specific, safe messages. Do not pass raw validation-library or Firestore errors through to users.

## API routes

All `/v1` routes require Firebase authentication.

### Account/profile

```text
GET    /v1/me
PATCH  /v1/me
DELETE /v1/me
```

- `GET /v1/me`: returns only the signed-in profile.
- `PATCH /v1/me`: edits allowed profile fields only; never email/auth provider/rating aggregate directly.
- `DELETE /v1/me`: begins the documented deletion/anonymization process; requires recent authentication confirmation where Firebase requires it.

### Rides

```text
GET    /v1/rides
POST   /v1/rides
GET    /v1/rides/:rideId
PATCH  /v1/rides/:rideId
POST   /v1/rides/:rideId/cancel
```

- List route validates pagination and filters.
- Create route sets `driverId` from `req.auth.uid`.
- Edit/cancel routes first verify the current user owns the ride.
- Return only safe driver profile data in public ride responses.

### Bookings

```text
POST   /v1/rides/:rideId/bookings
GET    /v1/bookings
GET    /v1/bookings/:bookingId
POST   /v1/bookings/:bookingId/approve
POST   /v1/bookings/:bookingId/reject
POST   /v1/bookings/:bookingId/cancel
```

- Create derives `riderId` from `req.auth.uid`.
- Approve/reject derives driver permission from the ride record, not from a role in the request.
- Booking reads return data only to the rider, driver, or an authorized future moderator.

### Reviews, notifications, reports, blocks

```text
POST   /v1/reviews
GET    /v1/users/:uid/reviews

GET    /v1/notifications
POST   /v1/notifications/:notificationId/read

POST   /v1/reports

GET    /v1/blocks
POST   /v1/blocks
DELETE /v1/blocks/:blockedUserId
```

## Critical service rules

### Rides service

- Only signed-in users with a completed profile can create a ride.
- Driver owns created ride by verified UID.
- `availableSeats` starts equal to `totalSeats`.
- Only a driver owner may edit/cancel a future draft/published ride.
- Cancellation notifies approved riders through an in-app notification record.

### Bookings service

- Verify ride exists, is `published`, is future-dated, and has seats.
- Prevent driver booking their own ride.
- Check both block directions before creating a booking.
- Prevent duplicate active booking for same `rideId + riderId`.
- Use Firestore transaction to approve/cancel approved booking and update available seats.
- Create notifications within the transaction/workflow.

### Reviews service

- Verify caller is rider or driver for a completed booking.
- Use deterministic review ID to prevent duplicates.
- Never let caller supply a different `authorId`.
- Update recipient rating aggregate server-side.

### Reports/blocks service

- Verify a report target is valid where possible.
- Report list is never exposed to regular users.
- Block record uses `blockerId` from verified token and checks `blockerId !== blockedId`.

### Notifications service

- Create an in-app notification in Firestore first.
- This record is the source of truth.
- Future push delivery is best effort only.
- Do not include addresses, email, phone numbers, or sensitive details in push content.

## Transactions and consistency

Use Firestore transactions for:

1. Approving a pending booking and reducing available seats.
2. Cancelling an approved booking and restoring available seats.
3. Completing ride bookings where applicable.
4. Creating a review and updating rating aggregate.

Transactions must reread documents and tolerate automatic retry. Never use a separate non-transactional read-then-write sequence for seat counts.

## Errors and HTTP responses

Use a consistent response shape:

```ts
// success
{ data: ... }

// error
{
  error: {
    code: "BOOKING_NOT_ALLOWED",
    message: "You cannot request a seat for this ride.",
    requestId: "..."
  }
}
```

Status codes:

| Status | Meaning |
|---|---|
| 200 | Successful read/update |
| 201 | Resource created |
| 400 / 422 | Invalid input |
| 401 | Missing/invalid Firebase token |
| 403 | Authenticated but not allowed |
| 404 | Resource not found or intentionally hidden |
| 409 | Duplicate/invalid booking state/seat conflict |
| 429 | Request-rate limit exceeded |
| 500 | Unexpected server error; do not expose internals |

Log request IDs, route, status, and safe error category. Never log tokens, passwords, private keys, full profile content, or report details.

## Render deployment

1. Put the backend in the same Git repository or a separate `backend/` folder.
2. Push to a private Git repository.
3. In Render, create **New → Web Service → Free**.
4. Choose Node runtime and the backend root directory.
5. Set build command, for example: `npm ci && npm run build`.
6. Set start command, for example: `npm run start`.
7. Add the private Firebase environment values in Render’s environment/secrets interface.
8. Set health-check path to `/health`.
9. Deploy and test `/health` before connecting Android.

Render Free behavior:

- It may sleep after idle time and have a cold start.
- It can restart at any time.
- Its filesystem is temporary.
- Therefore Firestore, not Render disk, stores all durable information.

## Security baseline

- Use HTTPS endpoints only.
- Restrict CORS to known origins if a web client/admin tool is later added.
- Apply basic API rate limiting and request-size limits.
- Set a conservative JSON body size limit.
- Validate all inputs and database state.
- Keep Firestore direct client rules deny-by-default.
- Use least-privilege service-account permissions where possible.
- Keep dependencies current and remove unused packages.

## Backend testing

Create tests for:

- Missing, invalid, and expired Firebase tokens.
- Profile ownership.
- Ride ownership/edit/cancel restrictions.
- Block checks in both directions.
- Concurrent booking approvals and correct seat count.
- Duplicate booking and duplicate review prevention.
- Notification creation after booking status changes.
- Public responses that omit private fields.
- `/health` success and safe unexpected-error response.

## Definition of done

- Render deploys an API and `/health` returns 200.
- Every protected route verifies a Firebase token.
- Firestore writes are made only through validated service methods.
- All capacity-changing actions are transactional.
- No Firebase Admin or FCM secret exists in Android source/build output/Git.
- Errors are safe, typed, and understandable in the Android app.
