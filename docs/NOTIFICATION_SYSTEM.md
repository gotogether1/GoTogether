# Go Together — Notification, Red Dot, and Android App-Badge System

## Goal

Build one reliable notification system with three user-visible layers:

1. **In-app notifications** — the permanent notification inbox and source of truth.
2. **Red dot / unread count** — a visible indicator in the Go Together UI.
3. **Android push notifications and app-icon badge** — an optional device alert when the user has granted permission.

The app must work correctly even when push delivery is unavailable, denied, delayed, or unsupported by an Android launcher. In-app notifications and the red dot are the primary user experience.

## Important Android limitation

Android home-screen app badges are controlled by the user’s launcher. `expo-notifications` can set a badge count, but not every Android launcher displays it; unsupported launchers may report `0`. Therefore, never rely on the app-icon badge as the only unread indicator. The in-app red dot and count must always work. [Expo badge documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)

## Technology

| Part | Technology | Responsibility |
|---|---|---|
| Android app | React Native + Expo | Displays inbox/red dot, requests permission, opens targets, syncs badge |
| Android client package | `expo-notifications` | Notification permission, Expo push token, Android badge API, deep links |
| API | Node.js + TypeScript + Express on Render | Creates in-app records, validates tokens, sends push after database commit |
| Database | Cloud Firestore | Stores notification records, preferences, registered devices |
| Push delivery | Expo Push Service backed by FCM on Android | Delivers Android push alerts |
| FCM credential | Firebase service account in Render/EAS secret only | Authorizes Android push delivery; never in the app |

## Architecture

```text
Ride/booking/chat action
        │
        ▼
Render API service
  ├── writes in-app notification to Firestore (source of truth)
  ├── returns action response to app
  └── after successful write, attempts optional push delivery
              │
              ▼
        Expo Push Service / FCM
              │
              ▼
       Android device notification tray

Android app
  ├── fetches notification inbox + unread count from Render API
  ├── shows bell red dot / 1–99+ badge in app
  └── calls setBadgeCountAsync(unreadCount) for supported Android launchers
```

## Notification principles

- In-app notification records are created first. A failed push must never lose an event.
- Push is best effort only; delivery can be affected by permission, device settings, Android battery optimization, network, or launcher behavior.
- Do not request push permission at first launch.
- Ask after the user completes a useful action, such as publishing a ride or requesting a seat, with a clear explanation.
- Do not include a full address, phone number, email, payment information, or private message body in a push notification.
- Use only one notification per important event; never spam/repeatedly send the same event.
- Notification preferences are respected server-side before any push is sent.

## Events that create notifications

| Event | Recipient | In-app record | Push allowed if enabled? |
|---|---|---|---|
| Rider requests a seat | Driver | `booking_requested` | Yes |
| Driver approves request | Rider | `booking_approved` | Yes |
| Driver rejects request | Rider | `booking_rejected` | Yes |
| Rider cancels approved/pending booking | Driver | `booking_cancelled` | Yes |
| Driver cancels ride | Approved riders | `ride_cancelled` | Yes |
| Confirmed ride chat receives message | Other participant | `chat_message` | Yes |
| Ride completes | Driver/rider | `review_reminder` | Yes, once |
| Report update | Reporter | `report_update` | No in MVP unless required |

Do not create notifications for search results, marketing, promotions, or every minor profile edit in the MVP.

## Notification content

Use simple, private content:

| Type | Title | Body | Target |
|---|---|---|---|
| `booking_requested` | `New booking request` | `You have a new request for your ride.` | booking |
| `booking_approved` | `Ride confirmed` | `Your booking was approved.` | booking |
| `booking_rejected` | `Booking update` | `Your booking request was not approved.` | booking |
| `booking_cancelled` | `Booking cancelled` | `A booking for your ride was cancelled.` | booking/ride |
| `ride_cancelled` | `Ride cancelled` | `A ride you booked was cancelled.` | ride |
| `chat_message` | `New ride message` | `You have a new message about your confirmed ride.` | conversation |
| `review_reminder` | `Rate your ride` | `Your ride is complete. Share your experience.` | booking |

Do not place the chat message body, a private meeting-point address, or user contact information in a lock-screen notification.

## Firestore data model

### `notifications/{notificationId}`

```ts
{
  userId: string,
  type: "booking_requested" | "booking_approved" | "booking_rejected" |
        "booking_cancelled" | "ride_cancelled" | "chat_message" |
        "review_reminder" | "report_update",
  title: string,
  body: string,
  targetType: "ride" | "booking" | "conversation" | "review" | "report",
  targetId: string,
  eventKey: string,                     // unique idempotency key; e.g. bookingId + event type
  read: boolean,
  createdAt: Timestamp,
  readAt: Timestamp | null
}
```

Rules:

- `eventKey` prevents duplicate records when a request/transaction is retried.
- The backend owns `userId`, `type`, `targetType`, `targetId`, `read`, and timestamps.
- A user may mark only their own notification as read through the Render API.
- Old notification records remain in the inbox until the retention/deletion policy applies.

### `users/{uid}/devices/{deviceId}`

Use one document per registered Android device, instead of only one token in the user profile. This supports a user who logs in on multiple phones.

```ts
{
  platform: "android",
  expoPushToken: string,
  notificationsEnabled: boolean,
  appVersion: string,
  lastSeenAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Rules:

- Register/update after notification permission and token retrieval.
- Remove the device document on logout or when Expo reports an invalid token.
- Do not return push tokens to the Android app or public APIs.
- The Render API alone reads this collection to send notifications.

### Preferences inside `users/{uid}`

```ts
notificationPreferences: {
  bookingRequests: boolean,
  bookingUpdates: boolean,
  rideMessages: boolean,
  reviewReminders: boolean,
  promotions: false
}
```

The backend checks the relevant preference before sending a push. It still writes essential in-app records for booking/ride changes.

## Render API endpoints

All endpoints require a verified Firebase ID token except `/health`.

```text
GET   /v1/notifications?limit=30&cursor=...
GET   /v1/notifications/unread-count
POST  /v1/notifications/:notificationId/read
POST  /v1/notifications/read-all

PUT   /v1/me/devices/:deviceId
DELETE /v1/me/devices/:deviceId
PATCH /v1/me/notification-preferences
```

Endpoint behavior:

- `GET /notifications`: returns only caller’s notifications, newest first, paginated.
- `GET /unread-count`: returns `{ unreadCount }` for the current user only.
- `POST /:id/read`: verifies caller owns notification; sets `read`/`readAt` idempotently.
- `POST /read-all`: marks the caller’s unread notifications as read in controlled batches.
- `PUT /devices/:deviceId`: validates token format and records only current user’s device.
- `DELETE /devices/:deviceId`: removes only current user’s registered device.
- Preferences endpoint only changes supported boolean settings for current user.

## Backend notification service

Create a `NotificationService` with these responsibilities:

```text
createInAppNotification(...)
getUnreadCount(userId)
markRead(userId, notificationId)
markAllRead(userId)
registerDevice(userId, device)
removeDevice(userId, deviceId)
sendPushForNotification(notificationId)      // best effort; later phase
```

### Required server-side workflow

1. A validated business action happens (e.g. driver approves a booking).
2. The service creates the Firestore in-app notification using a unique `eventKey`.
3. The main action succeeds even if push sending later fails.
4. If permitted and device tokens exist, the service sends a minimal push payload.
5. If Expo/FCM says a token is invalid, disable/remove that device token.
6. Log only safe delivery status; never log push tokens or message data in plain logs.

For seat-changing booking actions, create the essential in-app notification within or immediately following the database transaction using an idempotency key. Do not risk duplicate notifications on transaction retry.

## Android in-app red dot and count

### Where to show it

- Bell icon in the top navigation/header.
- Notifications tab in bottom navigation if the design includes it.
- Optional small red dot on `My Rides` only for pending driver requests; do not duplicate counts everywhere.

### Behavior

- If unread count is `0`: no red dot or count.
- If unread count is `1–9`: show red dot with number.
- If unread count is `10–99`: show number.
- If unread count is `100+`: show `99+`.
- Show a small red dot, not the number, when space is limited.
- Fetch unread count when app launches, returns to foreground, opens the notification screen, completes a booking/chat action, and receives/taps a push.
- While the app is open, poll the unread count/inbox at a conservative interval such as 30 seconds. Stop polling when the app goes to the background.
- Opening an individual notification marks only that item read. A visible `Mark all as read` action marks all currently unread items read.

The red dot is based on server unread count, never only local device state. This keeps multiple devices consistent.

## Android app-icon badge

### Required behavior

- When authenticated and unread count changes, call Expo `setBadgeCountAsync(unreadCount)`.
- When unread count is `0`, call `setBadgeCountAsync(0)` to clear the badge.
- On logout, account deletion, and notification preference/device removal, clear the badge with `setBadgeCountAsync(0)`.
- On Android launchers that support badges, the app icon may show the unread number/dot.
- On Android launchers that do not support badges, the method may not show anything. This is expected and must not break the app. [Expo badge documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)

### Push payload count

When sending an FCM notification, include the server’s current unread count as the Android notification count where supported. This may be displayed by compatible launchers, but it is not guaranteed. [Firebase Admin Android notification count](https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.androidnotification.md)

## Push permission and device registration flow

Do not ask on first app launch.

1. User publishes a ride, requests a seat, or opens Notifications settings.
2. Show in-app explanation: `Enable notifications to receive ride approvals, booking changes, and messages.`
3. If user selects `Enable`, request Android notification permission.
4. If granted, use `expo-notifications` to obtain an Expo push token.
5. Generate/use a stable app installation device ID.
6. Send token/device metadata to `PUT /v1/me/devices/:deviceId`.
7. Render stores the token privately and sends push only for enabled preferences.
8. If denied, keep in-app notifications and red dot fully functional; do not repeatedly show the OS permission dialog.

Android 13+ requires runtime notification permission before an app can display notifications. [Firebase Android FCM guide](https://firebase.google.com/docs/cloud-messaging/android/get-started)

## Android notification channels

Create channels using Expo Notifications:

| Channel ID | Purpose | Importance |
|---|---|---|
| `ride_updates` | Approved/rejected/cancelled bookings and ride updates | Default/high |
| `ride_messages` | New message in an active confirmed-ride chat | Default |
| `reminders` | Review reminders | Low/default |

Users control these channels through Android settings. Do not override a user’s OS choice.

## Deep linking from a notification

Push data includes only safe routing values:

```ts
{
  notificationId: string,
  targetType: "booking" | "ride" | "conversation" | "review",
  targetId: string
}
```

When the user taps a push:

1. Restore/check Firebase session.
2. Fetch target authorization from Render API.
3. Mark notification read if it belongs to the user.
4. Navigate with Expo Router to the correct screen.
5. If not allowed, show a safe `This item is no longer available` screen; never reveal protected data.

## Foreground, background, and offline behavior

### Foreground

- Update inbox and red-dot count immediately.
- Display an in-app banner for important alerts.
- Do not show noisy system popups for every event while the user is already viewing that same screen.

### Background/closed app

- FCM/Expo handles notification-tray delivery when permitted.
- A push tap deep-links after app/session validation.
- Android device settings and battery optimization can delay/block a notification; in-app inbox sync remains authoritative.

### Offline

- Show cached red-dot state only as a temporary hint.
- When online again, refetch the authoritative inbox/unread count.
- Never mark notifications read locally without syncing to the server.

## Security and privacy

- Only the intended user can read/mark their notifications through a verified API token.
- Push tokens are private and never included in public/API profile responses.
- Never send Firebase Admin keys or FCM sending credentials to the Android app.
- Never put full private messages, contact details, or exact meeting address in a push payload.
- Apply rate limits to device registration and preference updates.
- Do not use notifications for advertising or marketing in MVP.
- Deleting/logging out an account removes device registration and clears the local app badge.

## Testing checklist

### In-app

- Driver receives one unread booking-request notification.
- Rider receives one unread approval/rejection notification.
- Duplicate backend retry does not create duplicate notifications.
- Red dot/count updates after receiving, opening, and marking items read.
- `Mark all as read` clears the red dot and count.
- User A never sees/counts User B notifications.

### Push and badge

- Permission is asked only after a user-initiated explanation.
- Denying permission still leaves inbox/red dot working.
- Granted Android device registers one private token.
- Push tap opens only the authorized target.
- Logout clears registered device and app badge.
- `setBadgeCountAsync(0)` clears a supported launcher badge.
- Test on at least one physical Android device; document that some launchers will not display app badges.
- Invalid Expo/FCM token is removed after delivery failure.

## Build order

1. Build Notifications screen, bell icon, red-dot UI, and mock local data.
2. Add Render notification endpoints and Firestore notification records.
3. Add unread count sync, pagination, read/read-all behavior, and deep navigation.
4. Add Android app-icon badge syncing with `expo-notifications`.
5. Add permission explanation, Expo token registration, and Android channels.
6. Configure FCM credentials securely in Render/EAS and send test pushes.
7. Add push sending for approved booking, booking updates, and confirmed-ride chat only.
8. Test denials, cold starts, offline behavior, privacy, token cleanup, and all red-dot/badge states.
