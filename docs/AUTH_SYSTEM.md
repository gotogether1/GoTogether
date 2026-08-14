# Go Together — Sign-up and Login System

## Goal

Build a secure native Android authentication system for the Go Together app. Users must be able to create an account and log in with:

1. Email and password
2. Google Sign-In

Use Firebase Authentication. Users never see Firebase; they only see Go Together screens.

Do not implement phone OTP, SMS login, anonymous accounts, social logins other than Google, or payment-related authentication.

## Technology

- Android app: React Native + TypeScript + Expo
- Authentication provider: Firebase Authentication
- Profile database: Cloud Firestore
- Backend: Node.js + TypeScript + Express deployed to Render Free
- Backend SDK: Firebase Admin SDK, used only on Render

The mobile app uses Firebase Authentication to sign in. It sends the Firebase ID token to the Render API with each protected request. Render verifies this token with Firebase Admin before it performs protected actions.

Never place Firebase Admin credentials, FCM server keys, or service-account JSON inside the Android app.

## Navigation flow

```text
App launch
  → restore Firebase session
  → logged in with completed profile: Home
  → logged in without completed profile: Profile Setup
  → no session: Welcome

Welcome
  → Create account
  → Log in

Create account
  → profile setup
  → Home

Log in
  → Home

Forgot password
  → reset email sent confirmation
  → Log in
```

## Screens

### 1. Welcome screen

Show the Stitch-designed welcome screen with:

- App logo/name: Go Together
- Short value statement about carpooling and bike pooling
- `Create account` primary button
- `Log in` secondary button
- Links to Terms of Use, Privacy Notice, and Safety Rules

### 2. Create account screen

Fields:

- Full name
- Email address
- Password
- Confirm password
- Required checkbox: `I agree to the Terms of Use, Privacy Notice, and Safety Rules.`

Actions:

- `Create account` primary button
- `Continue with Google` button
- `Already have an account? Log in` link

Validation before creating the Firebase account:

- Full name is required and must be 2–80 characters.
- Email must be valid.
- Password must be at least 8 characters.
- Confirm password must match.
- The terms checkbox must be selected.
- Disable the primary button while submitting.

After successful email/password registration:

1. Firebase creates the account.
2. Create the user profile document in Firestore.
3. Store the version and timestamp of accepted Terms/Privacy/Safety rules.
4. Send the user to Profile Setup.

### 3. Google Sign-In

- Use a native Google Sign-In/OAuth flow compatible with Expo and Firebase Authentication.
- After Google returns an identity token, exchange it for a Firebase credential.
- If this is a new user, create the profile document and send them to Profile Setup.
- If the user already exists and profile setup is complete, send them to Home.
- Pre-fill display name and photo from Google only when supplied; allow the user to edit them.
- Never request contacts, Gmail content, Drive access, or unnecessary Google scopes.

### 4. Login screen

Fields:

- Email address
- Password

Actions:

- `Log in` primary button
- `Continue with Google` button
- `Forgot password?` link
- `Create account` link

Rules:

- Validate email and non-empty password before sending.
- Keep the login button disabled while processing.
- Never state whether an email address exists before authentication succeeds.
- Route an authenticated user with a complete profile to Home; otherwise route them to Profile Setup.

### 5. Forgot-password screen

Fields and actions:

- Email address field
- `Send reset link` button
- Back-to-login link

Flow:

1. User enters their email address.
2. Call Firebase `sendPasswordResetEmail`.
3. Show a neutral confirmation: `If an account exists for this email, we sent password-reset instructions.`
4. The user opens the email and changes the password on Firebase's secure reset page.
5. The user returns to Go Together and logs in with the new password.

The app must never view, store, email, or log a user's password.

### 6. Profile Setup screen

Shown after first successful registration.

Fields:

- Display name (pre-filled where available)
- City
- Optional short bio
- Optional profile photo, only if photo upload is enabled later

Do not require phone number, government ID, payment information, home address, or precise location.

On completion, set `profileComplete: true` and navigate to Home.

### 7. Settings → Account

Provide:

- Update profile
- Change password (for email/password accounts)
- Account deletion request
- Notification preferences
- Links to Terms, Privacy, and Safety Rules
- Log out

For Google-authenticated accounts, explain that their Google password is managed by Google.

## User-friendly error handling

Map Firebase errors to clear messages. Do not expose raw Firebase error codes.

- Invalid email/password: `Email or password is incorrect.`
- Existing account: `An account already uses this email. Try logging in or resetting your password.`
- Weak password: `Use at least 8 characters for your password.`
- Network issue: `Check your connection and try again.`
- Too many attempts: `Too many attempts. Please wait a few minutes and try again.`
- Google sign-in cancelled: return to the screen with no error alert.
- Unknown issue: `Something went wrong. Please try again.`

## Firestore user document

Collection: `users`

Document ID: Firebase `uid`

```ts
{
  uid: string,
  displayName: string,
  email: string,
  photoURL: string | null,
  city: string | null,
  bio: string | null,
  authProviders: ["password"] | ["google.com"] | ["password", "google.com"],
  profileComplete: boolean,
  averageRating: number,
  completedRideCount: number,
  notificationPreferences: {
    bookingRequests: boolean,
    bookingUpdates: boolean,
    promotions: false
  },
  terms: {
    termsVersion: string,
    privacyVersion: string,
    safetyVersion: string,
    acceptedAt: timestamp
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Do not store passwords, password hashes, reset tokens, card data, ID documents, or FCM server credentials in Firestore.

## API and security design

### Mobile app

- Use Firebase Authentication SDK only for sign-up, login, Google sign-in, password reset, sign-out, and reading the current session.
- Retrieve a Firebase ID token after sign-in.
- Send it to the Render API as `Authorization: Bearer <firebase-id-token>` for protected API calls.
- Use secure local storage/session persistence supported by the Firebase/Expo implementation. Do not store raw passwords.

### Render API

- Apply an authentication middleware to every protected endpoint.
- Verify Firebase ID tokens using Firebase Admin SDK.
- Use the verified UID, never a UID supplied in the request body.
- Return only the data that the signed-in user may access.
- Keep Firebase Admin service-account credentials only in Render environment secrets.
- Add basic request validation and rate limiting to login-adjacent API endpoints if the backend exposes any.

### Firestore rules

For this architecture, the mobile app uses Firebase Auth but reads/writes app data through the verified Render API. Configure Firestore rules to deny direct client app-data access by default. The Render API uses Firebase Admin SDK and is responsible for authorization.

Do not weaken Firestore rules to `allow read, write: if true`.

## Privacy requirements

- Ask for consent to Terms, Privacy Notice, and Safety Rules at account creation.
- Use a neutral forgot-password confirmation to prevent email-address enumeration.
- Do not display a user's email address or phone number publicly.
- Do not request notification permission at first launch; ask only when notifications become useful.
- Implement account-deletion handling according to `SECURITY_PRIVACY.md`.

## Testing checklist

- New email/password registration works.
- Invalid and duplicate email cases display correct messages.
- Password confirmation and terms consent are required.
- Email/password login works.
- Google Sign-In works and supports new/existing users.
- Session remains signed in after app restart.
- Logout works and returns to Welcome.
- Forgot password sends the correct neutral confirmation.
- Password reset permits login with the new password.
- Unauthenticated users cannot access protected app screens or API routes.
- Firebase Admin credentials are not committed or bundled in the app.

## Build order

1. Build all six authentication screens from the Stitch design with local demo state.
2. Test validation, navigation, loading states, and errors.
3. Add Firebase Email/Password authentication.
4. Add Google Sign-In.
5. Create/maintain the Firestore profile document through the secure Render API.
6. Add password reset, session restore, and sign-out.
7. Run Android testing and fix every error before proceeding to ride features.
