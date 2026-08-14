# Go Together — App Specification

## Product

Build **Go Together**, a native Android/iOS ride-sharing coordination mobile app with two trip types:

- Carpool
- Bike Pool

It helps people offer rides, find rides, request seats, manage bookings, and rate each other. Do not copy another company's name, branding, logo, or content.

Show this notice in an appropriate place:

> This app helps users coordinate ride sharing. It does not process payments or guarantee rides.

There are no in-app payments. A ride may show an optional suggested contribution; riders and drivers arrange this privately outside the app.

## Users

Every user can switch between these modes.

### Rider

- Search and filter rides.
- View ride details and request seats.
- Manage and cancel bookings.
- See upcoming/past rides and leave reviews after completed rides.
- Report or block users.

### Driver

- Create, edit, and cancel carpool or bike-pool rides.
- Receive booking requests and approve or reject them.
- See upcoming/past rides and leave reviews after completed rides.
- Report or block users.

## Phase 1 — Build with local demo data only

Do not connect Firebase in this phase. Create these native mobile screens, make them clickable, and seed realistic demo data.

### Authentication and onboarding

- Welcome, sign-up, sign-in, and forgot-password screens.
- Profile onboarding with name, photo, city, short bio, and optional unverified phone field.
- Use local demo authentication only during this phase.

### Home and search

- “Find a Ride” / “Offer a Ride” toggle.
- Carpool / Bike Pool choice.
- Pickup, destination, travel date, departure time, and number-of-seats fields.
- Search action and a mobile results list.
- Filters for trip type, departure time, seats, suggested contribution, and driver rating.
- Loading, empty, and error states.

### Ride details and bookings

- Show pickup, destination, meeting point, date/time, route/map placeholder, driver profile, vehicle details, seats, suggested contribution, rules, and notes.
- A rider can request a seat.
- Booking states: `pending`, `approved`, `rejected`, `cancelled`, `completed`.
- A driver can approve/reject only their own requests.
- A rider can cancel their own pending/approved booking.
- Do not allow approved bookings beyond available seats.

### Offer a ride

- Form fields: trip type, pickup, destination, meeting point, date, time, seats, suggested contribution, vehicle/bike details, luggage or helmet rules, and notes.
- Required-field validation and clear success/error feedback.
- Allow drivers to edit or cancel their own upcoming demo rides.

### Dashboard, profile, reviews, notifications, safety

- Dashboard: upcoming rides, past rides, ride offers, booking requests, and basic ride/rating statistics.
- Public profile and own-profile editing: name, photo, city, bio, rating, ride count, and reviews.
- After a completed ride, both participants can leave one 1–5-star rating and short review.
- In-app notifications UI for booking requests, approvals, rejections, and cancellations.
- Report user/ride form, block-user UI, safety guidance, and emergency disclaimer.

## Phase 2 — Firebase Authentication

Replace the local demo auth with:

- Firebase Email/Password sign-up and sign-in.
- Google Sign-In.
- Forgot-password flow.
- Persisted user profile/onboarding data.

Never use phone authentication or SMS.

## Phase 3 — Render API and Firestore data

Build a Node.js + TypeScript + Express API and deploy it to Render Free. The Android app sends its Firebase ID token to this API. The API verifies the token with Firebase Admin SDK, authorizes every action, and reads/writes Firestore. Do not allow direct app-data access from the Android client.

Use these Firestore collections:

- `users`
- `rides`
- `bookings`
- `reviews`
- `notifications`
- `reports`
- `blockedUsers`

Suggested ride fields: `driverId`, `vehicleType`, `pickup`, `destination`, `meetingPoint`, `departureAt`, `totalSeats`, `availableSeats`, `suggestedContribution`, `vehicleDetails`, `rules`, `notes`, `status`, `createdAt`, `updatedAt`.

Suggested booking fields: `rideId`, `riderId`, `driverId`, `seatsRequested`, `status`, `createdAt`, `updatedAt`.

## Phase 4 — Maps and notifications

- Use a native-compatible free OpenStreetMap map solution for a route/map preview. Do not use paid maps.
- Add Firebase Cloud Messaging/Expo Notifications for mobile push notifications where supported.
- Ask for mobile notification permission only after explaining the benefit.
- Install and use `expo-notifications` to register an Android device for push notifications and obtain an Expo push token.
- Save the signed-in user's Expo push token securely in Firestore.
- Create in-app Firestore notifications for new booking requests, approvals, rejections, and cancellations.
- Build a `NotificationService` interface and use a mock sender for this MVP.
- Do not include an FCM server key or Firebase service-account credentials in the app. Do not automatically send FCM messages from the client; a trusted server-side sender is required later.

## Firestore security requirements

- Users edit only their own profiles.
- Drivers create/edit/cancel only their own rides.
- Riders manage only their own bookings.
- Only the ride driver approves/rejects requests for that ride.
- Only completed-booking participants may create one review each.
- Users may create reports but cannot read other users’ reports.
- Blocked users cannot book each other’s rides.
- Validate all ownership and permissions in Firestore rules.

## Final verification and delivery

- Test all important flows in Expo Go on Android/iOS phone simulators or devices.
- Test empty, loading, validation, failure, and seat-limit scenarios.
- Run `npm run build` without errors.
- Write a README with local setup, Firebase configuration, security rule deployment, and Firebase Hosting deployment instructions.
