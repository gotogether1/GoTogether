# Go Together — Real-Time Update System

## Goal

The Android app must update important information live without the user manually reloading the app:

- Booking request, approval, rejection, and cancellation status
- Available seats on rides
- Confirmed-ride chat messages
- Notification inbox, red dot, and unread count
- Driver ride cancellation
- Review eligibility after ride completion

Use a secure WebSocket connection between the Android app and the Render backend. Do **not** use direct Firestore listeners in the Android app, because all application data remains protected behind the verified Render API.

## Technology

| Layer | Technology | Responsibility |
|---|---|---|
| Android app | React Native + Expo + TypeScript | Connects/reconnects, updates screen data without reload |
| Client socket | `socket.io-client` | Authenticated WebSocket connection and reconnection |
| App server | Node.js + TypeScript + Express + Socket.IO | Authenticates sockets and emits private events |
| Hosting | Render Free Web Service | Hosts HTTP API and WebSocket server in one process |
| Data | Cloud Firestore | Stores the source-of-truth data; never broadcasts directly to clients |
| Server state | TanStack Query / React Query | Caches API data and refetches only affected resources after socket events |

Socket.IO is an intentional dependency here. It handles reconnection and mobile network changes more reliably than implementing raw WebSockets ourselves.

## Core design

```text
User action in app
  → authenticated Render REST API request
  → backend validates and writes Firestore transaction
  → backend commits data successfully
  → backend emits a private Socket.IO event to affected user rooms
  → recipients’ apps receive event
  → app invalidates/refetches only affected API data
  → screen, chat, red dot, and seat count update without app reload
```

The socket event is a signal, not a second source of truth. The Android app refreshes authoritative data through existing secure REST endpoints.

## Authentication and private rooms

### Socket connection

1. Android app restores Firebase session.
2. App obtains a current Firebase ID token.
3. App connects to Socket.IO with the token in the authentication handshake.
4. Render socket middleware verifies the token with Firebase Admin SDK.
5. Only after successful verification, join the socket to private room:

```text
user:{verifiedFirebaseUid}
```

6. Reject unauthenticated/invalid socket connections.
7. On token refresh/re-login, disconnect and reconnect with the new token.
8. On logout/account deletion, disconnect socket immediately.

Do not let the client choose any room name. The server derives all room membership from the verified Firebase UID.

### Optional ride rooms

Do not use public ride rooms in the MVP. A user only needs their private `user:{uid}` room. This prevents passengers from learning who else is on a ride.

For direct chat, send messages only to the two private user rooms belonging to the approved booking’s driver and rider.

## Events

Every event includes safe routing data only. Never include another user’s email, phone, push token, Firebase token, or hidden profile fields.

### Booking events

```ts
"booking:created"   // recipient: driver
"booking:updated"   // recipient: rider and driver
"ride:updated"      // recipient: driver and affected approved riders
```

Payload:

```ts
{
  bookingId: string,
  rideId: string,
  change: "created" | "approved" | "rejected" | "cancelled" | "completed",
  occurredAt: string
}
```

Client response:

- Invalidate/refetch the relevant booking, My Rides list, ride details, and notifications.
- If currently on matching Ride Details screen, refetch it so `availableSeats` updates immediately.
- Show a short in-app banner only if the user is not already viewing the exact changed screen.

### Notification events

```ts
"notification:created"
"notification:read"
```

Payload:

```ts
{
  notificationId: string,
  targetType: "ride" | "booking" | "conversation" | "review" | "report",
  targetId: string,
  occurredAt: string
}
```

Client response:

- Invalidate notification list and unread-count query.
- Update the bell/tab red dot immediately.
- Call Android badge sync using the newest server unread count.

### Chat events

```ts
"chat:message_created"
"chat:closed"
"chat:read"
```

Payload:

```ts
{
  bookingId: string,
  messageId?: string,
  occurredAt: string
}
```

Client response:

- If the user is viewing the matching active conversation, fetch the newest messages and scroll to the newest message.
- Otherwise, update chat-list preview/unread state and red dot without opening the conversation.
- On `chat:closed`, refetch conversation status and immediately disable the text input.

The server emits chat events only after `CHAT_SYSTEM.md` permission checks succeed. It never broadcasts to passengers of the same ride.

### Profile/review events

```ts
"profile:updated"
"review:created"
```

Payload includes only target user/booking identifiers. Client refetches only the relevant profile/review list.

## Event emission rules

1. Validate and commit database state first.
2. Emit the socket event only after the state change succeeds.
3. Emit only to users directly affected by the action.
4. If socket emission fails because recipient is offline, do nothing further; the recipient gets the in-app notification/push and refreshes on return.
5. Never accept a client socket event that changes bookings, seats, ride status, or messages. All mutations stay as authenticated REST API calls.

Examples:

| Action | Emit to |
|---|---|
| Rider creates booking request | Driver only |
| Driver approves/rejects booking | Rider and driver |
| Rider cancels booking | Driver and rider |
| Driver cancels ride | Driver and only approved riders |
| Driver sends direct confirmed-ride message | That booking’s rider only |
| Rider sends direct confirmed-ride message | That booking’s driver only |
| Mark notification read | Same notification owner only |

## Android client architecture

```text
src/
  realtime/
    RealtimeProvider.tsx       # lifecycle-aware socket connection
    socket.ts                  # Socket.IO client factory; no direct global mutation
    events.ts                  # typed event payloads
    event-handlers.ts          # query invalidation and UI updates
  api/
    query-client.ts            # TanStack Query client
```

### `RealtimeProvider` requirements

- Start socket only after Firebase authentication/session restore.
- Connect when app is active/foregrounded.
- Pause/disconnect in background after a short grace period to conserve battery.
- Reconnect with exponential backoff on transient network errors.
- On reconnect, refetch key server queries: current profile, unread count, active chats, upcoming bookings, and visible ride details.
- Never reconnect indefinitely in a tight loop.
- Expose connection state: `connecting`, `connected`, `reconnecting`, `offline`.
- Do not show a frightening error for a temporary offline socket; show a small non-blocking `Updating…`/`Offline` state only where useful.

### TanStack Query cache rules

- Use API responses as all cached server data.
- Socket events invalidate focused query keys, then REST refetches source-of-truth data.
- Never mutate capacity, booking status, or unread counts permanently from a socket payload alone.
- Use optimistic UI only for the current user’s action; roll it back if API returns an error.

Example query keys:

```text
["me"]
["notifications", filters]
["notifications", "unread-count"]
["rides", filters]
["ride", rideId]
["bookings", filters]
["booking", bookingId]
["chat", bookingId]
["chat", bookingId, "messages"]
```

## Render backend architecture

### Setup

- Create one HTTP server shared by Express and Socket.IO.
- Apply CORS/allowed-origin configuration appropriate for the Android client/development tools.
- Use Firebase Admin token verification in Socket.IO middleware.
- Keep a typed `SocketUser` containing only verified UID and safe claims.
- Join server-derived private user room after verification.

Suggested backend layout:

```text
src/
  realtime/
    socket-server.ts           # creates Socket.IO server
    socket-auth.ts             # Firebase token middleware
    socket-events.ts           # event names and payload types
    realtime-emitter.ts        # emits to user:{uid} rooms
  services/
    notification.service.ts
    booking.service.ts         # calls realtime emitter after successful commit
    chat.service.ts            # calls realtime emitter after successful message
```

### Server API for emitters

```ts
emitToUser(userId, eventName, payload)
emitToUsers(userIds, eventName, payload)
```

Rules:

- De-duplicate user IDs before emitting.
- Do not log full event payloads containing user content.
- Emit a minimal event after completion of the transaction/workflow.
- Keep event names centralized and typed.

## Render Free limitations and fallback

Render Free may sleep after idle time and can restart. A live WebSocket connection helps keep the service active while it carries traffic, but it is not a production availability guarantee. The app must recover gracefully after a disconnect or cold start. [Render Free documentation](https://render.com/docs/free)

Fallback behavior:

1. REST API remains the source of truth.
2. On socket disconnect, show no destructive error; retain current data.
3. When app returns to foreground, refetch important data.
4. While the app is active and socket is disconnected, perform conservative REST refreshes (for example unread count/active booking every 30–60 seconds).
5. Push notifications/in-app inbox still alert a user who was offline.

Do not use Render local disk, server memory, or the socket connection as persistent storage.

## Security rules

- WebSocket requires a valid Firebase ID token at connection time.
- All data mutation uses REST endpoints with normal authorization/validation.
- Socket has no `join-room`, `send-message`, `approve-booking`, or arbitrary-data mutation event exposed to client.
- Client cannot subscribe to another user’s room.
- Chat socket events follow `CHAT_SYSTEM.md`: only driver/rider of an approved booking.
- Blocked, rejected, cancelled, and completed ride chats never emit new-message events.
- Rate limit REST mutations; protect socket connection attempts from excessive reconnect/abuse.
- Disconnect sockets on logout, token invalidation, or account deletion.

## Testing checklist

- Driver receives new booking request without reopening app.
- Rider sees approval/rejection and updated booking screen live.
- Available seats change live for affected open ride-detail screens.
- New chat message appears live only for the other approved booking participant.
- Other riders in the same car receive no chat event/data.
- Notification bell red dot and Android badge count update live.
- A closed/cancelled/completed chat disables message input via real-time update.
- Tokenless socket connection is rejected.
- User A cannot receive or request User B room events.
- Disconnect/reconnect after network loss refetches accurate data.
- Render cold start or server restart recovers after retry and does not corrupt state.
- App remains usable without a socket connection; REST refresh/push/inbox cover the fallback.

## Build order

1. Build all screens with local mock state and manual refresh controls.
2. Add TanStack Query API caching for authenticated REST data.
3. Add Render Socket.IO server, Firebase socket authentication, and private user rooms.
4. Emit `notification:created` and update unread red dot live.
5. Add booking/ride events and live seat/status refetch.
6. Add confirmed-ride chat events only after chat permission rules are tested.
7. Add reconnection, foreground sync, and Render-free fallback behavior.
8. Test two real Android devices/accounts for isolation and live updates.
