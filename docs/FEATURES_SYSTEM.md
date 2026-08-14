# Go Together — Complete Feature System

## Scope and stack

Build Go Together as an Android mobile app for coordinating **Carpool** and **Bike Pool** rides.

- App: React Native + TypeScript + Expo + Expo Router
- Authentication: Firebase Authentication (Email/Password and Google)
- API: Node.js + TypeScript + Express on Render Free
- Database: Cloud Firestore, accessed only by the verified Render API
- Push: Firebase Cloud Messaging through the Render API, later
- Maps: native-compatible OpenStreetMap solution, added after core ride flows work

There are no in-app payments. A `suggestedContribution` is information only.

## App navigation

```text
Authenticated app
├── Home
├── Find a Ride
│   ├── Search Results
│   └── Ride Details → Booking Request → Booking Status
├── Offer a Ride
│   ├── Trip Details
│   ├── Trip Rules
│   └── Publish Confirmation
├── My Rides
│   ├── Upcoming
│   ├── Past
│   ├── Ride Offers
│   └── Booking Requests
├── Notifications
├── Profile
│   ├── Edit Profile
│   ├── Reviews
│   └── Settings
└── Safety
    ├── Report User/Ride
    └── Blocked Users
```

Use the connected Stitch design as the visual source of truth. Preserve existing mobile screens and add missing screens in the same design system.

## 1. Home

Show:

- A greeting with the signed-in user’s first name.
- `Find a Ride` and `Offer a Ride` primary choices.
- Carpool and Bike Pool trip-type buttons.
- Recent or recommended demo rides.
- A safety notice link.
- Bottom navigation matching Stitch.

The home screen must never display another user’s private contact details.

## 2. Find a Ride and Search

### Search form

Fields:

- Trip type: `carpool`, `bike_pool`, or `any`
- Pickup location
- Destination location
- Travel date
- Optional departure-time range
- Number of seats needed (default 1)

Rules:

- Pickup, destination, date, and seats are required before a search.
- Seats must be an integer from 1 to 4 for the MVP.
- Do not request background location permission.
- Use text search/placeholders first; add free OpenStreetMap geocoding only after core search works.

### Search result cards

Each card shows:

- Driver display name and profile photo/initials
- Average rating and completed-ride count
- Carpool/Bike Pool label
- Pickup and destination area names
- Date and departure time
- Available seats
- Suggested contribution
- Ride status

Filters:

- Vehicle/trip type
- Time range
- Minimum available seats
- Maximum suggested contribution
- Minimum driver rating

States:

- Loading skeleton
- Empty results with “Change filters” action
- Network error with retry action

Only show rides with `status: published` and a future departure time. Exclude rides from blocked users.

## 3. Ride Details

Show:

- Carpool/Bike Pool label
- Pickup, destination, and public meeting point
- Date and departure time
- Map/route preview placeholder in early phases
- Available and total seats
- Suggested contribution, labelled clearly as non-payment information
- Driver summary: name, rating, ride count, and profile link
- Vehicle or bike description
- Luggage rules for carpool / helmet rules for bike pool
- Ride notes and cancellation policy
- Report and block actions

Show `Request a Seat` only if:

- User is not the driver.
- Ride is published and not departed.
- At least one seat is available.
- User has no active booking for this ride.
- Driver/rider are not blocked by either party.

## 4. Request a Seat and Booking

### Booking request screen

Collect:

- Seats requested, 1–4, default 1
- Optional short message, maximum 300 characters

Before submitting, show the trip summary and state: `The driver must approve this request.`

### Booking states

```text
pending → approved → completed
pending → rejected
pending → cancelled
approved → cancelled
```

Rules:

- Only a rider creates their own booking request.
- Only the ride driver approves/rejects a pending request.
- A rider may cancel their own pending or approved request.
- An approved booking decreases available seats atomically.
- Cancelling an approved booking restores available seats atomically.
- Never approve beyond total seats.
- Never allow duplicate active bookings by the same rider for a ride.
- Completed is set only after the ride departure and by the secure API workflow.

### Booking status screens

Show:

- Pending: waiting-for-driver state and Cancel button
- Approved: confirmed status and safe meeting-point summary
- Rejected: clear result and Find Other Rides button
- Cancelled: cancellation reason if supplied
- Completed: Rate Ride button

Do not reveal a rider/driver phone number or email in this MVP.

## 5. Offer a Ride

Use a simple multi-step native form consistent with Stitch.

### Step 1: Trip type

- Carpool
- Bike Pool

### Step 2: Route and schedule

- Pickup
- Destination
- Public meeting point
- Date
- Departure time

### Step 3: Capacity and ride details

- Total seats, 1–4
- Suggested contribution (optional numeric amount and currency label)
- Vehicle/bike description
- Carpool: luggage rules
- Bike Pool: helmet rule / spare helmet availability
- Notes, maximum 500 characters

### Step 4: Review and publish

- Show all entered information.
- Show the coordination/no-payment notice.
- Publish button.

Validation:

- Departure must be in the future.
- Pickup and destination must be different.
- All required route/schedule/capacity fields must be present.
- A user may edit/cancel only their own published or draft ride.

Ride statuses:

```text
draft | published | cancelled | completed
```

## 6. My Rides Dashboard

Tabs:

- Upcoming
- Past
- My Offers
- Requests

### Upcoming

Show rides the user is driving or has an approved booking for, ordered by departure time.

### Past

Show completed/cancelled rides and an action to review completed trips.

### My Offers

Show driver-owned rides with booking count, seats remaining, edit/cancel actions, and status.

### Requests

For a driver’s published rides, show pending booking requests with rider profile summary, requested seats, optional message, `Approve`, and `Reject` actions.

Dashboard stats:

- Rides offered
- Rides taken
- Completed rides
- Average rating

## 7. Profile and Reviews

### Public profile

Show only:

- Display name
- Photo or initials
- City
- Short bio
- Average rating
- Completed ride count
- Published reviews

Never show email, phone number, exact address, authentication provider, or notification token.

### Edit profile

Allow the signed-in user to update:

- Display name
- City
- Bio
- Profile photo only when Storage is intentionally enabled later

### Reviews

- A rider and driver may each submit one review only after their booking is completed.
- Rating: integer 1–5.
- Optional text: maximum 500 characters.
- User cannot edit/delete another user’s review.
- Report abusive review action.

## 8. Notifications

### In-app notifications (required)

Create a Firestore `notifications` record for:

- New booking request to driver
- Approved booking to rider
- Rejected booking to rider
- Rider cancellation to driver
- Driver ride cancellation to approved riders
- Review reminder after completion

Each notification has `read: false` initially. Opening it routes to the relevant ride or booking and marks it read.

### Push notifications (later phase)

- Ask for permission only after the user has a useful reason to enable it.
- Register an Expo push token and save it privately.
- Render sends push messages using secure server-side credentials only.
- Push content must be minimal: e.g. `Your booking was approved.`
- No address, phone number, or sensitive content in lock-screen text.

## 9. Safety, Reports, and Blocks

### Report

Allow report target: user, ride, booking, or review.

Reasons:

- Unsafe behavior
- Harassment or discrimination
- Spam/scam
- Incorrect ride information
- Inappropriate content
- Other

Optional details maximum: 1,000 characters.

Report submit must confirm receipt without revealing moderation actions.

### Block

- User can block another user from their profile or ride detail screen.
- Blocked users cannot request rides from each other, access private booking details, or contact each other.
- Provide a Blocked Users settings list with Unblock action.

### Safety page

Show clear safety tips and:

`For immediate danger or emergencies, contact local emergency services.`

Do not claim that users, vehicles, or rides are verified without implementing real verification.

## 10. Settings

Include:

- Account/profile settings
- Notification preferences
- Terms of Use
- Privacy Notice
- Safety Rules
- Blocked users
- Delete-account request
- Log out

## Data model

All persistent data is owned by Firestore and accessed through the verified Render API.

### `users/{uid}`

```ts
{
  uid, displayName, email, photoURL, city, bio,
  profileComplete, averageRating, completedRideCount,
  authProviders, notificationPreferences, terms,
  createdAt, updatedAt
}
```

### `rides/{rideId}`

```ts
{
  driverId, vehicleType, pickup, destination, meetingPoint,
  departureAt, totalSeats, availableSeats, suggestedContribution,
  currency, vehicleDetails, rules, notes,
  status, createdAt, updatedAt
}
```

### `bookings/{bookingId}`

```ts
{
  rideId, riderId, driverId, seatsRequested, riderMessage,
  status, cancellationReason, createdAt, updatedAt
}
```

### Other collections

```text
reviews/{reviewId}          bookingId, authorId, recipientId, rating, text, createdAt
notifications/{id}          userId, type, title, body, targetType, targetId, read, createdAt
reports/{id}                reporterId, targetType, targetId, reason, details, status, createdAt
blockedUsers/{blockId}      blockerId, blockedId, createdAt
```

Use server timestamps. Create indexes when queries require them; document required indexes in the README.

## Render API endpoints

Every endpoint below requires `Authorization: Bearer <Firebase ID token>` except `/health`.

```text
GET    /health
GET    /v1/me
PATCH  /v1/me
DELETE /v1/me

GET    /v1/rides
POST   /v1/rides
GET    /v1/rides/:rideId
PATCH  /v1/rides/:rideId
POST   /v1/rides/:rideId/cancel

POST   /v1/rides/:rideId/bookings
GET    /v1/bookings
GET    /v1/bookings/:bookingId
POST   /v1/bookings/:bookingId/approve
POST   /v1/bookings/:bookingId/reject
POST   /v1/bookings/:bookingId/cancel

GET    /v1/notifications
POST   /v1/notifications/:notificationId/read

POST   /v1/reviews
GET    /v1/users/:uid/reviews

POST   /v1/reports
POST   /v1/blocks
DELETE /v1/blocks/:blockedUserId
GET    /v1/blocks
```

The API must use the verified Firebase UID, not user/driver IDs from request bodies, to authorize every action.

## Build order

1. Build every screen and flow using local seed data; do not connect services.
2. Build Firebase Authentication using `AUTH_SYSTEM.md`.
3. Create the Render API with health check, token middleware, validation, and Firestore Admin access.
4. Connect user profiles, rides, search, booking lifecycle, dashboard, and reviews.
5. Add reports, blocks, and in-app notifications.
6. Add maps and optional profile storage only after the core flow works.
7. Add push-token registration and secure Render-side FCM sender.
8. Test all roles, ownership, failures, seat limits, privacy, and Android UI states.

## Final acceptance checks

- A user can sign up, complete profile, create a carpool/bike-pool ride, and view it in My Offers.
- Another user can search, request a seat, and see pending status.
- The driver can approve/reject; available seats change correctly.
- The rider can cancel; seats restore correctly.
- Only rightful participants can see/manage their relevant data.
- Block/report actions work.
- No app secret is bundled in Android code.
- App works after Render cold start with a clear loading/retry state.
- All screens match the connected Stitch design.
