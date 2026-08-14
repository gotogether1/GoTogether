"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
const api_error_js_1 = require("../utils/api-error.js");
class NotificationService {
    static collection = 'notifications';
    static devicesCollection = 'devices';
    static async createNotification(userId, type, title, body, targetType, targetId, eventKey) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        // Deduplication check via eventKey
        const existing = await db.collection(this.collection)
            .where('userId', '==', userId)
            .where('eventKey', '==', eventKey)
            .limit(1)
            .get();
        if (!existing.empty) {
            return { id: existing.docs[0].id, ...existing.docs[0].data() };
        }
        const docRef = db.collection(this.collection).doc();
        const now = new Date().toISOString();
        const notif = {
            id: docRef.id,
            userId,
            type,
            title,
            body,
            targetType,
            targetId,
            eventKey,
            read: false,
            createdAt: now,
            readAt: null,
        };
        await docRef.set(notif);
        return notif;
    }
    static async getNotifications(userId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    static async getUnreadCount(userId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();
        return snap.size;
    }
    static async markRead(userId, notificationId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const docRef = db.collection(this.collection).doc(notificationId);
        const snap = await docRef.get();
        if (!snap.exists) {
            throw api_error_js_1.ApiError.notFound('Notification not found');
        }
        const notif = snap.data();
        if (notif.userId !== userId) {
            throw api_error_js_1.ApiError.forbidden('Unauthorized access to notification');
        }
        await docRef.update({
            read: true,
            readAt: new Date().toISOString(),
        });
    }
    static async markAllRead(userId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();
        const batch = db.batch();
        const now = new Date().toISOString();
        snap.docs.forEach(doc => {
            batch.update(doc.ref, { read: true, readAt: now });
        });
        await batch.commit();
    }
    static async registerDevice(userId, deviceId, expoPushToken) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const deviceRef = db.collection('users').doc(userId).collection(this.devicesCollection).doc(deviceId);
        await deviceRef.set({
            platform: 'android',
            expoPushToken,
            notificationsEnabled: true,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    }
}
exports.NotificationService = NotificationService;
