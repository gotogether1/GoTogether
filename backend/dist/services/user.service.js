"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
class UserService {
    static collection = 'users';
    static async getProfile(uid) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
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
        return snap.data();
    }
    static async updateProfile(uid, updates) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const docRef = db.collection(this.collection).doc(uid);
        const safeUpdates = {
            updatedAt: new Date().toISOString(),
        };
        if (updates.displayName !== undefined)
            safeUpdates.displayName = updates.displayName;
        if (updates.city !== undefined)
            safeUpdates.city = updates.city;
        if (updates.bio !== undefined)
            safeUpdates.bio = updates.bio;
        if (updates.photoURL !== undefined)
            safeUpdates.photoURL = updates.photoURL;
        if (updates.profileComplete !== undefined)
            safeUpdates.profileComplete = updates.profileComplete;
        await docRef.set(safeUpdates, { merge: true });
        return this.getProfile(uid);
    }
    static async deleteProfile(uid) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        await db.collection(this.collection).doc(uid).delete();
        try {
            await (0, firebase_admin_js_1.getFirebaseAuth)().deleteUser(uid);
        }
        catch (e) {
            console.warn('Could not delete Firebase auth user:', e);
        }
    }
}
exports.UserService = UserService;
