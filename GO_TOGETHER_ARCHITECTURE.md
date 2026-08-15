# 🚗 🏍️ GO TOGETHER — SYSTEM ARCHITECTURE SPECIFICATION

> **Application Name**: Go Together  
> **Type**: Peer-to-Peer Intercity & Urban Carpooling + Bike Pooling Mobile Platform  
> **Target Platforms**: iOS, Android (React Native / Expo SDK 57)  
> **Backend Architecture**: REST API + Socket.IO Realtime Engine (Express / Node.js)  
> **Database Engine**: Neon PostgreSQL Cloud Relational Database  

---

## 1. Executive System Overview

Go Together is a peer-to-peer ride-pooling platform enabling vehicle owners (*drivers*) to offer empty seats in their cars (**Carpool**) or motorcycles (**Bike Pool**) to passengers (*riders*) traveling along the same route corridor.

### Core Architectural Principles
1. **User Identity & Data Isolation**: Every account is bound strictly to a verified Firebase Authentication UID (`user.uid`). Data in "My Rides", notifications, and profile settings are strictly isolated per user.
2. **Dynamic Route-Corridor Search**: Public search matches passengers traveling between any segment **C → D** along a driver's longer route **A → B** (where C and D are waypoints/stopovers along A → B) using a 10 km corridor proximity algorithm and strict sequence ordering (`pickupIndex < dropoffIndex`).
3. **Dual Transport Modes**: Supports multi-seat carpools (1–6 seats) and fixed single-pillion bike pools (1 seat).
4. **Conditional Direct Messaging**: Direct 1-on-1 chat is locked until the driver explicitly approves a passenger's booking request (`booking.status === 'approved'`).
5. **Automatic Ride Lifecycle & Expiry**:
   - Zero-seat rides (`available_seats = 0`) automatically hide from public search.
   - Expired rides (`departure_at < CURRENT_TIMESTAMP`) automatically hide from public search.
   - Completed rides (`status = 'completed'`) automatically hide from public search.

---

## 2. Mobile Frontend Architecture (React Native / Expo SDK 57)

```text
mobile/
├── app/                        # Expo Router File-Based Navigation Tree
│   ├── (tabs)/                 # Main Tab Navigation Stack
│   │   ├── index.tsx           # Home Feed & Featured Active Rides
│   │   ├── find.tsx            # Find a Ride (Dynamic Search & Segment Filter)
│   │   ├── offer.tsx           # Offer Ride 6-Step Publishing Wizard
│   │   ├── dashboard.tsx       # My Rides & Pending Requests Dashboard
│   │   ├── notifications.tsx   # User Notification Feed
│   │   └── profile.tsx         # Profile Settings & Rating Metrics
│   ├── auth/                   # Authentication Stack
│   │   ├── login.tsx           # Email/Password Sign-In
│   │   ├── signup.tsx          # Account Registration & Profile Setup
│   │   └── forgot-password.tsx # Password Reset Request
│   ├── ride/                   # Ride Detail Stack
│   │   ├── [id].tsx            # Detailed Ride View, Booking & Offer Action
│   │   └── map.tsx             # Interactive Leaflet Webview Map View
│   ├── chat/                   # Direct Messaging Stack
│   │   └── [bookingId].tsx     # Locked/Unlocked Real-Time Chat Room
│   ├── review/                 # Trip Review Stack
│   │   └── [bookingId].tsx     # Star Rating & Commute Feedback Form
│   └── safety/                 # Trust & Safety Stack
│       ├── report.tsx          # Incident & Community Report Form
│       └── blocks.tsx          # User Blocking & Privacy Settings
├── src/
│   ├── api/                    # HTTP Client & TanStack Query Hooks
│   │   ├── client.ts           # fetchWithAuth Client & Bearer Token Wrapper
│   │   └── hooks.ts            # Reactive Query & Mutation Hooks
│   ├── auth/                   # Auth Context Provider (`AuthProvider.tsx`)
│   ├── components/             # Reusable UI Design System Components
│   │   ├── Button.tsx          # Primary & Secondary Touchables
│   │   ├── Card.tsx            # Styled Container Surface
│   │   ├── GoogleMapView.tsx   # Leaflet Map Canvas (Embedded Webview)
│   │   ├── Input.tsx           # Form Input Fields
│   │   ├── LocationPicker.tsx  # Autocomplete & GPS Location Selector
│   │   └── RouteSelector.tsx   # OSRM Driving Route Alternative Picker
│   ├── realtime/               # Socket.IO Realtime Context Provider
│   ├── services/               # Geocoding & Routing Services (`locationService.ts`)
│   ├── theme/                  # Design System Tokens (Colors, Typography, Spacing)
│   ├── types/                  # TypeScript Interfaces (`location.ts`, `ride.ts`)
│   └── utils/                  # Navigation & Date Helpers
```

---

## 3. Backend Engine & Express Services

```text
backend/
├── src/
│   ├── config/                 # Environment & Firebase Admin Credentials (`env.ts`)
│   ├── db/                     # PostgreSQL Connection Pool & Schema DDL (`index.ts`, `schema.sql`)
│   ├── middleware/             # Express Middleware (`authenticate.ts`)
│   ├── routes/                 # Express REST Router Controllers
│   │   ├── auth.routes.ts      # Authentication & User Profile Sync
│   │   ├── me.routes.ts        # User Metadata & Notification Routes
│   │   ├── rides.routes.ts     # Ride Creation, Search, Details & Completion
│   │   ├── bookings.routes.ts  # Booking Request Creation, Approval & Rejection
│   │   ├── chats.routes.ts     # Conversation History & Message Dispatch
│   │   ├── reviews.routes.ts   # Trip Ratings & Commute Feedback
│   │   ├── reports.routes.ts   # Community Safety & Incident Filing
│   │   └── blocks.routes.ts    # User-to-User Blocking Operations
│   ├── services/               # Business Service Layer
│   │   ├── user.service.ts     # User Profile Management & Identity Sync
│   │   ├── ride.service.ts     # 2-Stage Route Search & Geo Matching Engine
│   │   ├── booking.service.ts  # Seat Reservations & Approval Workflows
│   │   ├── chat.service.ts     # Chat Room Access Control & Message Dispatch
│   │   ├── notification.service.ts # Device Push & Notifications Feed
│   │   ├── review.service.ts   # Star Ratings Calculation & Verification
│   │   └── block.service.ts    # User Block Filtering
│   ├── validators/             # Zod Schema Request Validation (`index.ts`)
│   └── server.ts               # HTTP & Socket.IO Bootstrap Listener
```

---

## 4. Security & Authorization Model

1. **Bearer Token Authentication**: Every non-public API call transmits `Authorization: Bearer <Firebase_ID_Token>`.
2. **Server-Side Identity Verification**: `authenticate.ts` verifies tokens using `firebase-admin`. The decoded `req.auth.uid` is used exclusively for resource ownership checks. Client-submitted `driverId` or `riderId` body values are never trusted for authorization.
3. **IDOR Protection**:
   - `RideService.cancelRide` / `completeRide`: Verifies `ride.driver_id === req.auth.uid`.
   - `BookingService.approveBooking`: Verifies `ride.driver_id === req.auth.uid`.
   - `ChatService.validateChatAccess`: Verifies `booking.status === 'approved'` and `callerUid === rider_id || callerUid === driver_id`.
