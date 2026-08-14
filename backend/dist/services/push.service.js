"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
class PushService {
    static expoPushUrl = 'https://exp.host/--/api/v2/push/send';
    static async sendPushToUser(userId, title, body, data) {
        try {
            const db = (0, firebase_admin_js_1.getFirestoreDb)();
            const devicesSnap = await db.collection('users').doc(userId).collection('devices').get();
            if (devicesSnap.empty)
                return;
            const tokens = [];
            devicesSnap.docs.forEach(doc => {
                const d = doc.data();
                if (d.expoPushToken && d.notificationsEnabled !== false) {
                    tokens.push(d.expoPushToken);
                }
            });
            if (tokens.length === 0)
                return;
            const messages = tokens.map(token => ({
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
        }
        catch (err) {
            console.warn('Non-fatal error sending push notification:', err);
        }
    }
}
exports.PushService = PushService;
