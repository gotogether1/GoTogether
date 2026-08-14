# Go Together — Final System Architecture

## This is the master architecture

This document is the final source of truth for the Go Together MVP. If another document conflicts with it, follow this document plus the more detailed feature/security document for that topic.

Go Together is an **Android-only native mobile app** for coordinating Carpool and Bike Pool rides. It has no payments, no website frontend, no direct client database access, no group chat, and no passenger-to-passenger chat.

## Final technology stack

| System part | Final choice |
|---|---|
| Mobile app | React Native + TypeScript + Expo |
| Navigation | Expo Router |
| UI | Stitch design + React Native StyleSheet + reusable tokens |
| Client server-state cache | TanStack Query / React Query |
| Login | Firebase Authentication: Email/Password and Google Sign-In |
| API server | Node.js + TypeScript + Express |
| Real-time | Socket.IO client/server |
| API hosting | Render Free Web Service |
| Persistent database | Cloud Firestore |
| Server Firebase SDK | Firebase Admin SDK, on Render only |
| Push notifications | Expo Notifications + Firebase Cloud Messaging for Android |
| Maps later | Free OpenStreetMap-compatible mobile map solution |

## Final system diagram

```text
┌────────────────────────────────────────────────────────────────┐
│ Android application                                              │
│ React Native + Expo                                              │
│                                                                  │
│  Stitch UI • Expo Router • Firebase Auth client                 │
│  TanStack Query • Socket.IO client • Expo Notifications         │
└───────────────┬───────────────────────┬────────────────────────┘
                │                       │
     sign-in/ID token                    │ HTTPS REST + authenticated WebSocket
                │                       │
                ▼                       ▼
┌─────────────────────────┐   ┌──────────────────────────────────┐
│ Firebase Authentication │   │ Render Free Web Service          │
│ email/password + Google │   │ Node.js + Express + Socket.IO     │
└─────────────────────────┘   │ Firebase Admin token verification │
                              │ validation + all business rules   │
                              └───────────────┬──────────────────┘
                                              │ trusted admin access
                                              ▼
                              ┌──────────────────────────────────┐
                              │ Cloud Firestore                   │
                              │ permanent application data        │
                              └───────────────┬──────────────────┘
                                              │ optional secure push send
                                              ▼
                              ┌──────────────────────────────────┐
                              │ Expo Push Service / FCM           │
                              │ Android notification delivery     │
                              └──────────────────────────────────┘
```

## Trust model

### Android app: untrusted client

The Android app may display data and request actions, but it never decides whether an action is allowed.

- It authenticates a person with Firebase Auth.
- It sends Firebase ID token to the Render API.
- It calls REST endpoints and receives WebSocket events.
- It never reads/writes Firestore application data directly.
- It never contains Firebase Admin, FCM sending, or Render secret credentials.

### Render API: trusted application layer

The API does all sensitive work:

- Verifies Firebase tokens.
- Derives acting user only from verified token UID.
- Validates every request.
- Applies ownership, seat, block, chat, and privacy rules.
- Runs Firestore transactions for critical changes.
- Writes notifications and emits real-time events only after successful data changes.
- Reads/writes Firestore with Firebase Admin SDK.

### Firestore: permanent data layer

- Holds all persistent app data.
- Denies direct client app-data reads/writes by default.
- Is never replaced by Render local files, memory, or a local database.

## Monorepo structure

```text
go-together/
  mobile/                         # Android React Native + Expo app
    app/                          # Expo Router screens
    src/
      api/                        # typed REST API client
      auth/                       # Firebase client auth/session
      realtime/                   # Socket.IO provider/event handlers
      notifications/              # inbox, red dot, Android badge sync
      components/                 # reusable Stitch-style components
      features/                   # ride, booking, chat, profile features
      theme/                      # colors, spacing, typography tokens
  backend/                        # Render API
    src/
      routes/ middleware/ services/ validators/ realtime/ config/
  docs/                           # all .md architecture/spec files
  firestore.indexes.json
  README.md
```

## Authentication architecture

Users can use only:

```text
Email + password
Google Sign-In
Forgot-password email link
```

Flow:

```text
App → Firebase Authentication → Firebase ID token
App → Render API: Authorization Bearer token
Render → Firebase Admin verifies token
Render → Firestore reads/writes user profile and app data
```

Firebase handles passwords and reset emails. Passwords are never saved in Firestore, Render, app storage, logs, or source code.

## Data architecture

Firestore collections:

```text
users
users/{uid}/devices
rides
bookings
conversations
conversations/{bookingId}/messages
reviews
notifications
reports
blockedUsers
```

Canonical relationships:

```text
user creates many rides
ride has many bookings
approved booking creates one direct conversation
conversation contains messages from exactly one driver and one rider
completed booking permits up to two reviews
user receives many notifications and can block many users
```

Use Firebase UID as the primary user identity. Use `bookingId` as the conversation ID. Use Firestore transactions when a booking changes available seats or creates a confirmed chat.

## Ride and booking architecture

```text
Rider creates booking request
→ API validates ride is published/future, seats, no blocks, no duplicate active booking
→ Firestore creates pending booking
→ API creates driver notification and real-time event

Driver approves booking
→ API verifies caller owns ride
→ Firestore transaction approves booking + reduces available seats
→ transaction/workflow creates direct conversation
→ API creates rider notification and real-time events
```

Booking states:

```text
pending → approved → completed
pending → rejected
pending → cancelled
approved → cancelled
```

The system must never approve more seats than a ride has available.

## Chat architecture

Chat is exactly one-to-one and tied to an approved booking:

```text
Driver ↔ Rider A (approved booking A)
Driver ↔ Rider B (approved booking B)
```

Never allow:

```text
Rider A ↔ Rider B
Driver ↔ all riders in a group chat
Chat before booking approval
Chat after completion, cancellation, rejection, or block
```

All messages are sent through the Render REST API. Socket.IO only sends a private `chat:message_created` update to the two authorized participants. Chat history is archived/read-only when the relationship closes.

## Notifications architecture

Notification layers:

```text
1. Firestore in-app notification = source of truth
2. Android UI bell/tab red dot = unread count from API
3. Android launcher app badge = optional, launcher-dependent
4. FCM/Expo push = optional best-effort external alert
```

The system always creates the in-app notification first. If push fails/is denied, the inbox and red dot still work.

Push registration:

```text
User chooses Enable Notifications
→ Android permission
→ Expo push token
→ authenticated Render API stores private token in users/{uid}/devices
→ Render sends minimal FCM/Expo push after important event
```

## Real-time architecture

The app does not reload screens to get updates.

```text
App signs in → socket connects using Firebase ID token
Render verifies socket → joins user:{uid} private room
Data mutation succeeds → API emits safe event to affected user rooms
App receives event → invalidates focused TanStack Query cache
App refetches secure REST data → UI updates live
```

Real-time events cover booking state, ride seats, chat, notifications/red dot, ride cancellation, and review availability. Events are signals only; REST data remains authoritative.

## REST API architecture

All `/v1` endpoints require `Authorization: Bearer <Firebase ID token>`.

```text
GET  /health
GET/PATCH/DELETE /v1/me

GET/POST          /v1/rides
GET/PATCH         /v1/rides/:rideId
POST              /v1/rides/:rideId/cancel
POST              /v1/rides/:rideId/bookings

GET               /v1/bookings
GET               /v1/bookings/:bookingId
POST              /v1/bookings/:bookingId/approve
POST              /v1/bookings/:bookingId/reject
POST              /v1/bookings/:bookingId/cancel

GET/POST          /v1/chats
GET               /v1/chats/:bookingId/messages
POST              /v1/chats/:bookingId/messages

GET/POST          /v1/notifications
GET               /v1/notifications/unread-count
POST              /v1/notifications/read-all

POST/GET          /v1/reviews
POST              /v1/reports
GET/POST/DELETE   /v1/blocks
```

## Security and privacy rules

- Authenticate every protected API and WebSocket connection with Firebase ID token.
- Never trust request user IDs, roles, sender IDs, booking state, or seat counts.
- Use server-side validation, authorization, and transactions.
- Firebase Admin and FCM credentials remain only in Render environment secrets.
- Do not expose email, phone number, exact home address, device token, private report, or message history to unauthorized users.
- No payments, SMS/OTP, live location, group chat, passenger-to-passenger chat, or marketing tracking in MVP.
- Provide terms consent, report, block, account deletion request, and safety guidance.

## Deployment architecture

### Android

- Build/test with Expo.
- Produce Android APK/AAB when ready.
- Configure Firebase Android project and push notification credentials.
- Use `EXPO_PUBLIC_API_BASE_URL` and Firebase client identifiers as public build configuration.

### Render

- One Node.js/Express/Socket.IO Web Service, Free plan.
- `GET /health` health check.
- Build: `npm ci && npm run build`.
- Start: `npm run start`.
- Set Firebase Admin values only as Render secrets.

### Render Free constraint

Render Free can sleep after idle and restart; first request can have a cold start. It is suitable for a prototype/MVP. The Android app must show retry/loading states and refetch on reconnect. All durable data remains in Firestore, never Render disk. [Render free-service documentation](https://render.com/docs/free)

## Required build sequence

1. Import/use Stitch UI and build Android navigation with local seed data.
2. Build authentication using Firebase.
3. Build Render API `/health`, token verification, validation, and Firestore Admin connection.
4. Implement profile, ride create/search/detail, booking transaction, dashboard, reviews, reports, and blocks.
5. Implement confirmed-booking-only direct chat.
6. Implement in-app notifications, red dot, and Android badge sync.
7. Implement Socket.IO live updates and reconnect/fallback behavior.
8. Implement Expo/FCM push after in-app notification system is complete.
9. Test two Android accounts/devices for privacy and real-time behavior.
10. Deploy backend to Render and create Android test build.

## Definition of done

- User signs up/logs in with email/password or Google.
- User can offer and search carpool/bike-pool rides.
- Rider requests; driver approves/rejects; seats update atomically.
- Only confirmed driver/rider pairs can chat one-to-one.
- No group/passenger-to-passenger/pre-approval/post-completion chat exists.
- Notifications, red dot, and live updates work without reloading the app.
- Android badge is synced where the device launcher supports it.
- All app data access goes through the authenticated Render API.
- No private credential is present in Android source, build, or Git.
