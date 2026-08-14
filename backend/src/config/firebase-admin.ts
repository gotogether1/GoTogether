import * as admin from 'firebase-admin';
import { env } from './env.js';

let firebaseAdminApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (admin.apps.length > 0 && admin.apps[0]) {
    firebaseAdminApp = admin.apps[0];
    return firebaseAdminApp;
  }

  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  let privateKey = env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialized with service account credentials');
  } else {
    // Fallback for development without service account JSON (reads GOOGLE_APPLICATION_CREDENTIALS if available)
    firebaseAdminApp = admin.initializeApp({
      projectId: projectId || 'gotogether-2026',
    });
    console.log('⚠️ Firebase Admin initialized with default application credentials');
  }

  return firebaseAdminApp;
}

export function getFirestoreDb(): admin.firestore.Firestore {
  return getFirebaseAdmin().firestore();
}

export function getFirebaseAuth(): admin.auth.Auth {
  return getFirebaseAdmin().auth();
}
