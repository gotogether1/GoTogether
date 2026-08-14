import { getFirestoreDb } from '../config/firebase-admin.js';

export class BlockService {
  private static collection = 'blockedUsers';

  static async isBlocked(userA: string, userB: string): Promise<boolean> {
    const db = getFirestoreDb();
    const snap1 = await db.collection(this.collection)
      .where('blockerId', '==', userA)
      .where('blockedId', '==', userB)
      .limit(1)
      .get();

    if (!snap1.empty) return true;

    const snap2 = await db.collection(this.collection)
      .where('blockerId', '==', userB)
      .where('blockedId', '==', userA)
      .limit(1)
      .get();

    return !snap2.empty;
  }

  static async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) return;
    const db = getFirestoreDb();
    const docId = `${blockerId}_${blockedId}`;
    await db.collection(this.collection).doc(docId).set({
      blockerId,
      blockedId,
      createdAt: new Date().toISOString(),
    });
  }

  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const db = getFirestoreDb();
    const docId = `${blockerId}_${blockedId}`;
    await db.collection(this.collection).doc(docId).delete();
  }

  static async getBlockedUsers(blockerId: string): Promise<string[]> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .where('blockerId', '==', blockerId)
      .get();

    return snap.docs.map(doc => doc.data().blockedId);
  }
}
