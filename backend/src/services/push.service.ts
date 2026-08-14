import { getFirestoreDb } from '../config/firebase-admin.js';

export interface PushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
}

export class PushService {
  private static expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  static async sendPushToUser(userId: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      const db = getFirestoreDb();
      const devicesSnap = await db.collection('users').doc(userId).collection('devices').get();

      if (devicesSnap.empty) return;

      const tokens: string[] = [];
      devicesSnap.docs.forEach(doc => {
        const d = doc.data();
        if (d.expoPushToken && d.notificationsEnabled !== false) {
          tokens.push(d.expoPushToken);
        }
      });

      if (tokens.length === 0) return;

      const messages: PushPayload[] = tokens.map(token => ({
        to: token,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
      }));

      const response = await fetch(this.expoPushUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const resData = await response.json();
      console.log(`📱 Push sent to ${tokens.length} device(s) for user:${userId}`);
    } catch (err) {
      console.warn('Non-fatal error sending push notification:', err);
    }
  }
}
