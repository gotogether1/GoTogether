# Go Together — Confirmed Ride Chat System

## Purpose

Create a private in-app chat only for arranging an already **confirmed** ride.

This is intentionally more restricted than a general ride-sharing chat system:

- No chat before a booking is approved.
- No chat after the ride is completed.
- No chat after a booking is rejected or cancelled.
- No passenger-to-passenger chat.
- No group chat.
- A driver chats separately with each approved rider for that specific ride.
- A rider chats only with the driver of their own approved booking.

The chat is for ride coordination only: meeting point, timing, luggage/helmet questions, and ride updates. It must not expose phone numbers or email addresses.

## Exact permission rule

Two users may exchange messages only when all conditions are true:

```text
1. A booking exists.
2. The booking status is approved.
3. The current user is either that booking’s rider or its ride’s driver.
4. The other participant is the other person in that same booking.
5. The ride status is published and has not been completed/cancelled.
6. Neither user has blocked the other.
```

If any condition becomes false, the chat becomes read-only immediately.

## Allowed chat combinations

| Situation | Chat allowed? |
|---|---:|
| Rider requests a seat; booking is pending | No |
| Driver approves rider A’s booking | Yes: driver ↔ rider A only |
| Driver approves rider B’s booking | Yes: driver ↔ rider B only |
| Rider A tries to chat with rider B in the same car | No |
| Driver tries to create one group chat with all riders | No |
| Booking is rejected/cancelled | No |
| Ride is completed | No, chat is archived/read-only |
| One participant blocks the other | No, chat is archived/read-only |

## BlaBlaCar comparison

BlaBlaCar is known to provide in-app messaging and has historically allowed ride questions/contact arrangements around booking. Go Together does **not** copy that behavior exactly. Our rule is stricter: chat starts only after approval and closes when the ride is completed. [BlaBlaCar app overview](https://www.blablacar.co.uk/apps-mobile) [BlaBlaCar booking information](https://blog.blablacar.co.uk/blablalife/whats-new/online-booking-advantages-passengers)

## Conversation model

One approved booking creates exactly one direct conversation.

```text
conversation ID = bookingId
participants = [driverId, riderId]
conversation type = direct_ride_chat
```

Do not create conversations by user ID alone. The booking ID ties every conversation to a specific confirmed ride and prevents users from messaging strangers.

## User experience

### When booking is pending

- Do not show a Chat button.
- Show: `Your request is waiting for the driver’s approval.`

### When booking is approved

- Show `Chat with driver` to the rider on the booking-detail screen.
- Show `Chat with rider` to the driver in that rider’s booking request/approved-booking screen.
- The driver sees one separate chat per approved rider. Each chat includes that rider’s name and the ride date; no group-chat list is created.
- Show a small notice at the top: `This chat is available until the ride is completed. Keep messages about this ride.`

### Chat screen

Show:

- Other participant’s display name, photo/initials, and ride date.
- Ride context strip: pickup area, meeting point, departure time.
- Text message history, newest at bottom.
- Text field and Send button while chat is active.
- Report and Block actions from the chat menu.
- No profile email, phone, exact home address, online-status indicator, typing indicator, message forwarding, group creation, image/file upload, voice notes, or calls in MVP.

### When chat closes

For completed, cancelled, rejected, or blocked ride relationships:

- Keep past messages visible only to the two original participants.
- Remove/disable text input and Send button.
- Display the appropriate banner:
  - `This ride is complete. This chat is now closed.`
  - `This booking was cancelled. This chat is now closed.`
  - `You cannot message this user because one of you has blocked the other.`

Do not reopen a closed conversation. A future ride requires a new approved booking and gets a new conversation.

## Data model

### `conversations/{bookingId}`

Create only after booking approval. Use booking ID as the document ID.

```ts
{
  bookingId: string,
  rideId: string,
  driverId: string,
  riderId: string,
  participantIds: [string, string],
  type: "direct_ride_chat",
  status: "active" | "closed",
  closedReason: "ride_completed" | "booking_cancelled" | "booking_rejected" |
                "ride_cancelled" | "user_blocked" | null,
  lastMessagePreview: string | null,       // max 120 chars; no sensitive details
  lastMessageAt: Timestamp | null,
  createdAt: Timestamp,
  closedAt: Timestamp | null
}
```

### `conversations/{bookingId}/messages/{messageId}`

```ts
{
  senderId: string,
  body: string,                            // 1–1,000 characters, plain text only
  createdAt: Timestamp,
  readAt: Timestamp | null,
  deletedBySenderAt: Timestamp | null      // optional future UI hide only
}
```

Do not store attachments, contact details, payment instructions, raw device data, or a recipient ID in a message document. The conversation already defines the only permitted recipient.

## Backend behavior

The Android app does not access Firestore chat data directly. All chat access goes through the verified Render API.

### When a driver approves a booking

In the same Firestore transaction/workflow that sets the booking to `approved`:

1. Confirm the caller owns the ride.
2. Confirm sufficient seats remain.
3. Change booking status to `approved`.
4. Update ride `availableSeats`.
5. Create `conversations/{bookingId}` with the driver and rider as its only participants.
6. Create an in-app `booking_approved` notification.

The conversation is never created for pending, rejected, or cancelled bookings.

### Send message validation

Before saving a message, the Render API must verify:

1. Requester has a valid Firebase ID token.
2. Conversation exists.
3. Requester UID is either `driverId` or `riderId`.
4. Conversation status is `active`.
5. Associated booking is still `approved`.
6. Associated ride is still `published` and has not been completed/cancelled.
7. Neither participant has blocked the other.
8. Message is plain text and 1–1,000 characters after trimming.
9. Requester is below the chat rate limit.

If a rule fails, return `403` or `409` and do not create a message.

### Chat closure workflow

Close a conversation when:

- Booking is cancelled.
- Ride is cancelled.
- Ride/booking is marked completed.
- One participant blocks the other.

Set `status: closed`, `closedReason`, and `closedAt`. The API must reject every later send attempt, even if an old mobile screen still displays its text field.

## API endpoints

All endpoints require `Authorization: Bearer <Firebase ID token>`.

```text
GET  /v1/chats
GET  /v1/chats/:bookingId
GET  /v1/chats/:bookingId/messages?limit=30&cursor=...
POST /v1/chats/:bookingId/messages
POST /v1/chats/:bookingId/read
POST /v1/chats/:bookingId/report
```

### Endpoint rules

- `GET /v1/chats`: return only conversations where requester is `driverId` or `riderId`; by default show active chats, with an Archived filter for closed chats.
- `GET /v1/chats/:bookingId`: reject if requester is not an exact participant.
- `GET messages`: reject unless requester is an exact participant; paginate with cursor; never return messages from another booking.
- `POST messages`: apply every active-booking and block validation above.
- `POST read`: mark only the other participant’s messages as read for this user, without exposing presence.
- `POST report`: creates a normal report targeting the conversation/message/user; does not disclose results.

## Rate limits and abuse handling

- Maximum 10 messages per minute per sender per conversation.
- Maximum 1,000 characters per message.
- Plain text only in MVP; strip/control unsafe characters and safely render all content.
- Do not automatically share links; show an external-link warning if links are supported later.
- Add Report and Block to every chat.
- If blocked, close the current conversation and prevent future messaging under that booking.
- Never allow the client to alter `senderId`, participant list, booking ID, active/closed status, or timestamps.

## Notifications

- Create an in-app notification for a new message only when conversation is active.
- Push notification is optional/later; its content should say `You have a new ride message.`
- Do not include the message body, meeting address, email, phone number, or any sensitive content in the push notification.
- Tapping the notification opens only the authorized conversation.

## Database/index requirements

Add query/index support for:

| Collection | Query |
|---|---|
| `conversations` | `participantIds array-contains uid`, ordered by `lastMessageAt desc` |
| `conversations` | `driverId == uid`, `status == active`, ordered by `lastMessageAt desc` if required |
| `conversations` | `riderId == uid`, `status == active`, ordered by `lastMessageAt desc` if required |
| `messages` subcollection | ordered by `createdAt desc`, paginated |

Add required composite indexes to `firestore.indexes.json` after Firestore provides the exact link/definition.

## Privacy and retention

- Message history is visible only to the two participants of its booking.
- Do not publicly expose chats, conversations, or message previews.
- Do not use messages for advertising, profiling, or model training.
- Include chat data in the account-deletion/privacy process defined in `SECURITY_PRIVACY.md`.
- Preserve only the minimum audit data needed for abuse reports or legal obligations, as explained in the Privacy Notice.

## Test checklist

- Pending booking cannot open or create a chat.
- Approved booking creates exactly one conversation.
- Driver can chat with each approved rider separately.
- Two riders on the same car cannot discover or message each other.
- Group chat cannot be created through UI or API.
- Driver/rider can read only their own booking’s conversation.
- Cancelling/completing a booking closes chat immediately.
- Block action closes chat immediately and prevents sends.
- Concurrent messages preserve order by server timestamp.
- Unauthorized user receives no conversation/message data.
- API rejects a client attempt to set another sender ID or reopen a chat.
