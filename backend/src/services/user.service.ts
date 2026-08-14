import { getFirestoreDb, getFirebaseAuth } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  city: string | null;
  bio: string | null;
  profileComplete: boolean;
  averageRating: number;
  completedRideCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export class UserService {
  private static collection = 'users';

  static async getProfile(uid: string): Promise<UserProfile> {
    const db = getFirestoreDb();
    const docRef = db.collection(this.collection).doc(uid);
    const snap = await docRef.get();

    if (!snap.exists) {
      // Fallback: return default profile structure if not yet in Firestore
      return {
        uid,
        displayName: 'User',
        email: '',
        photoURL: null,
        city: null,
        bio: null,
        profileComplete: false,
        averageRating: 5.0,
        completedRideCount: 0,
      };
    }

    return snap.data() as UserProfile;
  }

  static async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const db = getFirestoreDb();
    const docRef = db.collection(this.collection).doc(uid);

    const safeUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.displayName !== undefined) safeUpdates.displayName = updates.displayName;
    if (updates.city !== undefined) safeUpdates.city = updates.city;
    if (updates.bio !== undefined) safeUpdates.bio = updates.bio;
    if (updates.photoURL !== undefined) safeUpdates.photoURL = updates.photoURL;
    if (updates.profileComplete !== undefined) safeUpdates.profileComplete = updates.profileComplete;

    await docRef.set(safeUpdates, { merge: true });
    return this.getProfile(uid);
  }

  static async deleteProfile(uid: string): Promise<void> {
    const db = getFirestoreDb();
    await db.collection(this.collection).doc(uid).delete();
    try {
      await getFirebaseAuth().deleteUser(uid);
    } catch (e) {
      console.warn('Could not delete Firebase auth user:', e);
    }
  }
}
