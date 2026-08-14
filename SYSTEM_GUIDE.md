# Go Together — Mobile App System Guide

## Required stack

- React Native, TypeScript, and Expo
- Expo Router for navigation
- React Native `StyleSheet` and reusable design tokens (do not use Tailwind)
- Firebase Web SDK, later in the build
- Leaflet with OpenStreetMap, later in the build

## Code and design rules

- Treat the connected Stitch project as the visual source of truth.
- Build a real Android/iOS mobile app, not a browser website.
- Preserve its phone screens, colors, typography, spacing, icons, and component style.
- Support common phone sizes and safe areas.
- Keep components small, reusable, typed, and clearly named.
- Create reusable TypeScript design tokens for colors, spacing, typography, borders, and shadows.
- Include visible loading, empty, success, and error states.
- Use accessible labels, keyboard navigation, focus states, and adequate color contrast.

## Do not use

- Next.js, Vite, Tailwind, Redux, Docker, UI component libraries, web-only CSS, or a custom backend server.
- Google Maps, paid APIs, phone OTP/SMS, Stripe, payment gateways, Cloud Functions, or live GPS tracking.
- Any service that requires payment details.

## Firebase rules (only after frontend completion)

- Use Firebase Spark plan only.
- Use Firebase Authentication with Email/Password and Google Sign-In only.
- Use Cloud Firestore for data and Firebase Cloud Messaging for web push notifications.
- For the native app, use `expo-notifications` with Firebase Cloud Messaging (FCM) on Android.
- Request notification permission only after a user action that explains its benefit.
- Store an Expo push token under the signed-in user's Firestore profile.
- Never include an FCM server key, Firebase service-account JSON, or notification-sending credentials in the mobile app or repository.
- Use an in-app Firestore notification record and a mock notification sender during the zero-cost MVP; automatic push sending requires a separate trusted server-side sender later.
- Use Expo Go during development. Prepare Android/iOS build configuration, but do not use paid deployment services.
- Put Firebase public configuration in environment variables; never expose private keys or secrets.
- Enforce permissions with Firestore security rules, never with UI checks alone.

## Workflow — follow in order

1. Build all frontend pages, navigation, and flows with local seeded demo data.
2. Run the app and resolve every TypeScript, build, runtime, and visible UI error.
3. Do not connect Firebase until Phase 1 is complete and stable.
4. Connect Firebase Authentication, then Firestore, then maps, then notifications.
5. After every phase, run the app and ensure existing features still work.
6. Maintain a clear README with installation, configuration, and deployment steps.

## Commands

The project must work with:

```bash
npm install
npx expo start
npx expo start --android
```
