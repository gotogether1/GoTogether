import { query } from '../db/index.js';
import { getFirebaseAuth } from '../config/firebase-admin.js';

export interface UserProfile {
  id?: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  city?: string | null;
  bio?: string | null;
  averageRating?: number;
  completedRideCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class UserService {
  /**
   * Sync & Upsert User record in Neon PostgreSQL users table
   */
  static async syncUser(firebaseUid: string, email: string, displayName?: string, city?: string, bio?: string): Promise<UserProfile> {
    const userId = `usr_${firebaseUid.slice(0, 20)}`;
    const name = displayName || email.split('@')[0] || 'GoTogether User';

    const sql = `
      INSERT INTO users (id, firebase_uid, display_name, email, city, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET 
        display_name = COALESCE(NULLIF(EXCLUDED.display_name, 'GoTogether User'), users.display_name),
        email = EXCLUDED.email,
        city = COALESCE(EXCLUDED.city, users.city),
        bio = COALESCE(EXCLUDED.bio, users.bio),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await query(sql, [userId, firebaseUid, name, email, city || null, bio || null]);

    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        uid: r.firebase_uid,
        displayName: r.display_name,
        email: r.email,
        city: r.city,
        bio: r.bio,
        averageRating: parseFloat(r.average_rating || '5.0'),
        completedRideCount: r.completed_ride_count || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }

    return {
      uid: firebaseUid,
      displayName: name,
      email,
      city: city || null,
      bio: bio || null,
      averageRating: 5.0,
      completedRideCount: 0,
    };
  }

  /**
   * Get User Profile from Neon PostgreSQL users table
   */
  static async getProfile(firebaseUid: string, emailFromToken?: string, nameFromToken?: string): Promise<UserProfile> {
    const sql = `SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1;`;
    const res = await query(sql, [firebaseUid]);

    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        uid: r.firebase_uid,
        displayName: r.display_name,
        email: r.email,
        city: r.city,
        bio: r.bio,
        averageRating: parseFloat(r.average_rating || '5.0'),
        completedRideCount: r.completed_ride_count || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }

    // Auto-create in Neon PostgreSQL if not yet existing
    return this.syncUser(firebaseUid, emailFromToken || '', nameFromToken);
  }

  /**
   * Update Profile in Neon PostgreSQL users table
   */
  static async updateProfile(firebaseUid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const sql = `
      UPDATE users 
      SET 
        display_name = COALESCE($2, display_name),
        city = COALESCE($3, city),
        bio = COALESCE($4, bio),
        updated_at = CURRENT_TIMESTAMP
      WHERE firebase_uid = $1
      RETURNING *;
    `;

    const res = await query(sql, [firebaseUid, updates.displayName || null, updates.city || null, updates.bio || null]);

    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        uid: r.firebase_uid,
        displayName: r.display_name,
        email: r.email,
        city: r.city,
        bio: r.bio,
        averageRating: parseFloat(r.average_rating || '5.0'),
        completedRideCount: r.completed_ride_count || 0,
      };
    }

    return this.getProfile(firebaseUid);
  }

  /**
   * Delete User Profile
   */
  static async deleteProfile(firebaseUid: string): Promise<void> {
    await query(`DELETE FROM users WHERE firebase_uid = $1;`, [firebaseUid]);
    try {
      await getFirebaseAuth().deleteUser(firebaseUid);
    } catch (e) {
      console.warn('Could not delete Firebase auth user:', e);
    }
  }
}
