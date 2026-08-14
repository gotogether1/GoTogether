"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
class BlockService {
    static collection = 'blockedUsers';
    static async isBlocked(userA, userB) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap1 = await db.collection(this.collection)
            .where('blockerId', '==', userA)
            .where('blockedId', '==', userB)
            .limit(1)
            .get();
        if (!snap1.empty)
            return true;
        const snap2 = await db.collection(this.collection)
            .where('blockerId', '==', userB)
            .where('blockedId', '==', userA)
            .limit(1)
            .get();
        return !snap2.empty;
    }
    static async blockUser(blockerId, blockedId) {
        if (blockerId === blockedId)
            return;
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const docId = `${blockerId}_${blockedId}`;
        await db.collection(this.collection).doc(docId).set({
            blockerId,
            blockedId,
            createdAt: new Date().toISOString(),
        });
    }
    static async unblockUser(blockerId, blockedId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const docId = `${blockerId}_${blockedId}`;
        await db.collection(this.collection).doc(docId).delete();
    }
    static async getBlockedUsers(blockerId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .where('blockerId', '==', blockerId)
            .get();
        return snap.docs.map(doc => doc.data().blockedId);
    }
}
exports.BlockService = BlockService;
