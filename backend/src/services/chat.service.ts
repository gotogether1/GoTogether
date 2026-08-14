import { getFirestoreDb } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';
import { BlockService } from './block.service.js';

export interface ConversationData {
  bookingId: string;
  rideId: string;
  driverId: string;
  riderId: string;
  participantIds: string[];
  type: 'direct_ride_chat';
  status: 'active' | 'closed';
  closedReason?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
}

export interface ChatMessageData {
  id?: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

export class ChatService {
  private static collection = 'conversations';

  static async getConversations(callerUid: string): Promise<ConversationData[]> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .where('participantIds', 'array-contains', callerUid)
      .get();

    return snap.docs.map(d => ({ bookingId: d.id, ...d.data() } as ConversationData));
  }

  static async getConversation(callerUid: string, bookingId: string): Promise<ConversationData> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection).doc(bookingId).get();

    if (!snap.exists) {
      throw ApiError.notFound('Conversation not found');
    }

    const conv = { bookingId: snap.id, ...snap.data() } as ConversationData;

    if (!conv.participantIds.includes(callerUid)) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    return conv;
  }

  static async getMessages(callerUid: string, bookingId: string): Promise<ChatMessageData[]> {
    await this.getConversation(callerUid, bookingId);

    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .doc(bookingId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessageData));
  }

  static async sendMessage(callerUid: string, bookingId: string, body: string): Promise<ChatMessageData> {
    const conv = await this.getConversation(callerUid, bookingId);

    if (conv.status !== 'active') {
      throw ApiError.forbidden('This chat is closed');
    }

    const otherParticipantId = conv.participantIds.find(id => id !== callerUid);
    if (otherParticipantId) {
      const isBlocked = await BlockService.isBlocked(callerUid, otherParticipantId);
      if (isBlocked) {
        throw ApiError.forbidden('Messaging unavailable due to block');
      }
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length < 1 || trimmedBody.length > 1000) {
      throw ApiError.badRequest('Message must be between 1 and 1000 characters');
    }

    const db = getFirestoreDb();
    const now = new Date().toISOString();
    const msgRef = db.collection(this.collection).doc(bookingId).collection('messages').doc();

    const msg: ChatMessageData = {
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
