"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
const api_error_js_1 = require("../utils/api-error.js");
const block_service_js_1 = require("./block.service.js");
class ChatService {
    static collection = 'conversations';
    static async getConversations(callerUid) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .where('participantIds', 'array-contains', callerUid)
            .get();
        return snap.docs.map(d => ({ bookingId: d.id, ...d.data() }));
    }
    static async getConversation(callerUid, bookingId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection).doc(bookingId).get();
        if (!snap.exists) {
            throw api_error_js_1.ApiError.notFound('Conversation not found');
        }
        const conv = { bookingId: snap.id, ...snap.data() };
        if (!conv.participantIds.includes(callerUid)) {
            throw api_error_js_1.ApiError.forbidden('You are not a participant in this conversation');
        }
        return conv;
    }
    static async getMessages(callerUid, bookingId) {
        await this.getConversation(callerUid, bookingId);
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .doc(bookingId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    static async sendMessage(callerUid, bookingId, body) {
        const conv = await this.getConversation(callerUid, bookingId);
        if (conv.status !== 'active') {
            throw api_error_js_1.ApiError.forbidden('This chat is closed');
        }
        const otherParticipantId = conv.participantIds.find(id => id !== callerUid);
        if (otherParticipantId) {
            const isBlocked = await block_service_js_1.BlockService.isBlocked(callerUid, otherParticipantId);
            if (isBlocked) {
                throw api_error_js_1.ApiError.forbidden('Messaging unavailable due to block');
            }
        }
        const trimmedBody = body.trim();
        if (trimmedBody.length < 1 || trimmedBody.length > 1000) {
            throw api_error_js_1.ApiError.badRequest('Message must be between 1 and 1000 characters');
        }
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const now = new Date().toISOString();
        const msgRef = db.collection(this.collection).doc(bookingId).collection('messages').doc();
        const msg = {
            id: msgRef.id,
            bookingId,
            senderId: callerUid,
            body: trimmedBody,
            createdAt: now,
            readAt: null,
        };
        await msgRef.set(msg);
        // Update conversation lastMessagePreview & lastMessageAt
        await db.collection(this.collection).doc(bookingId).update({
            lastMessagePreview: trimmedBody.substring(0, 120),
            lastMessageAt: now,
        });
        return msg;
    }
}
exports.ChatService = ChatService;
