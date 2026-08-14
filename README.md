# Go Together — Carpool & Bike Pool App

Go Together is a modern, community-driven **Android mobile application** and **Node.js/Express backend** for coordinating Carpool and Bike Pool rides safely and effortlessly.

---

## 🌟 System Highlights & Key Principles

- **No In-App Payments**: Ride costs show optional suggested contributions arranged privately outside the app.
- **Strict 1-to-1 Confirmed Chat**: In-app messaging is available ONLY between confirmed driver and rider pairs for an active, approved booking.
- **Untrusted Client Security**: Android app never reads or writes Firestore data directly. All application data flows through the authenticated Node.js REST API on Render.
- **Real-Time Updates**: Live UI updates powered by Socket.IO without manual screen reloads.
- **Multi-Layer Notifications**: Firestore in-app inbox (source of truth) + unread count badge + Android launcher app badge + Expo/FCM push alerts.

---

## 📁 Repository Monorepo Structure

```text
GoTogether/
├── mobile/                         # React Native + Expo SDK 57 + Expo Router App
│   ├── app/                        # Expo Router screen navigation
│   ├── src/
│   │   ├── api/                    # REST API client with Bearer Token headers
│   │   ├── auth/                   # Firebase Auth Context & Session Provider
│   │   ├── components/             # Reusable Stitch UI components (Button, Card, Input, Badge)
│   │   ├── demo/                   # Offline seed data
│   │   ├── notifications/          # Android launcher badge sync helper
│   │   ├── realtime/               # Socket.IO Client Provider & TanStack Query invalidation
│   │   └── theme/                  # Stitch Design System tokens
│   ├── app.json
│   └── package.json
├── backend/                        # Node.js + Express + Socket.IO Backend Service
│   ├── src/
│   │   ├── config/                 # Env validation & Firebase Admin initialization
│   │   ├── middleware/             # Bearer Token auth & Error handler
│   │   ├── realtime/               # Socket.IO handshake auth & private room emitters
│   │   ├── routes/                 # Health, Me, Rides, Bookings, Chats, Notifications, Reviews, Reports, Blocks
│   │   ├── services/               # Firestore transactions & domain logic
│   │   ├── validators/             # Zod input validation schemas
│   │   └── server.ts
│   └── package.json
├── docs/                           # Master Architecture & System Specifications
├── firestore.indexes.json          # Firestore Compound Index Definitions
├── render.yaml                     # Render 1-Click Web Service Configuration
├── IMPLEMENTATION_STATUS.md         # Phase-by-phase execution log
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+
- npm v10+
- Expo Go App on Android phone (or Android Emulator)

### 1. Run the Backend API Server Locally

```bash
cd backend
npm install
npm run dev
```

The server will start at `http://localhost:10000`. You can test the health endpoint:

```bash
curl http://localhost:10000/health
# Returns: {"status":"ok","service":"Go Together API","version":"1.0.0"}
```

### 2. Run the Mobile Expo App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on Android or press `a` to open in an Android Emulator.

---

## 🔒 Security & Environment Setup

### Environment Variables (.env)

Create a [.env](file:///Users/adithya/Developer/GoTogether/mobile/.env) file inside `mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL="http://localhost:10000"
EXPO_PUBLIC_FIREBASE_API_KEY="your-api-key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="gotogether-2026.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="gotogether-2026"
```

Configure backend secrets in Render Environment Variables (never committed to repository):

```env
NODE_ENV=production
PORT=10000
FIREBASE_PROJECT_ID=gotogether-2026
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@gotogether-2026.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## 🛠️ Deploying Backend to Render Free Web Service

1. Connect your GitHub repository (`gotogether1/GoTogether`) to [Render](https://render.com/).
2. Create a **New Web Service** (Free Plan).
3. Set Root Directory to `backend`.
4. Build Command: `npm ci && npm run build`
5. Start Command: `npm run start`
6. Set Health Check Path: `/health`
7. Add Environment Variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

---

## 📄 License & Attribution

This project is built under the MIT License.
