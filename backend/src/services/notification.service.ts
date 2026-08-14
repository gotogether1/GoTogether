import { getFirestoreDb } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';
import { PushService } from './push.service.js';
import { emitToUser } from '../realtime/realtime-emitter.js';

export interface NotificationItem {
  id?: string;
  userId: string;
  type: 'booking_requested' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'ride_cancelled' | 'chat_message' | 'review_reminder';
  title: string;
  body: string;
  targetType: 'ride' | 'booking' | 'conversation' | 'review';
  targetId: string;
  eventKey: string;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
}

export class NotificationService {
  private static collection = 'notifications';
  private static devicesCollection = 'devices';

  static async createNotification(
    userId: string,
    type: NotificationItem['type'],
    title: string,
    body: string,
    targetType: NotificationItem['targetType'],
    targetId: string,
    eventKey: string
  ): Promise<NotificationItem> {
    const db = getFirestoreDb();
    
    // Deduplication check via eventKey
    const existing = await db.collection(this.collection)
      .where('userId', '==', userId)
      .where('eventKey', '==', eventKey)
      .limit(1)
      .get();

    if (!existing.empty) {
      return { id: existing.docs[0].id, ...existing.docs[0].data() } as NotificationItem;
    }

    const docRef = db.collection(this.collection).doc();
    const now = new Date().toISOString();

    const notif: NotificationItem = {
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

    // Emit real-time WebSocket signal to private user room
    emitToUser(userId, 'notification:created', { notificationId: docRef.id, targetType, targetId });

    // Send optional best-effort Expo/FCM push notification
    PushService.sendPushToUser(userId, title, body, { notificationId: docRef.id, targetType, targetId });

    return notif;
  }

  static async getNotifications(userId: string): Promise<NotificationItem[]> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem));
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    return snap.size;
  }

  static async markRead(userId: string, notificationId: string): Promise<void> {
    const db = getFirestoreDb();
    const docRef = db.collection(this.collection).doc(notificationId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw ApiError.notFound('Notification not found');
    }

    const notif = snap.data() as NotificationItem;
    if (notif.userId !== userId) {
      throw ApiError.forbidden('Unauthorized access to notification');
    }

    await docRef.update({
      read: true,
      readAt: new Date().toISOString(),
    });
  }

  static async markAllRead(userId: string): Promise<void> {
    const db = getFirestoreDb();
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

  static async registerDevice(userId: string, deviceId: string, expoPushToken: string): Promise<void> {
    const db = getFirestoreDb();
    const deviceRef = db.collection('users').doc(userId).collection(this.devicesCollection).doc(deviceId);
    await deviceRef.set({
      platform: 'android',
      expoPushToken,
      notificationsEnabled: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}
