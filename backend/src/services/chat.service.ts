import { query } from '../db/index.js';
import { ApiError } from '../utils/api-error.js';
import { BlockService } from './block.service.js';

export interface ConversationData {
  id: string;
  bookingId: string;
  driverId: string;
  riderId: string;
  status: 'active' | 'closed';
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
}

export interface ChatMessageData {
  id: string;
  conversationId?: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export class ChatService {
  /**
   * Strictly validate chat authorization according to BlaBlaCar booking rules:
   * 1. Booking must exist
   * 2. Booking status MUST be 'approved'
   * 3. Caller MUST be either the ride driver or booking rider
   */
  static async validateChatAccess(callerUid: string, bookingId: string): Promise<{ booking: any; driverId: string; riderId: string }> {
    const sql = `
      SELECT b.id AS booking_id, b.status AS booking_status, b.rider_id, r.driver_id, r.id AS ride_id,
             u_rider.firebase_uid AS rider_fb_uid, u_driver.firebase_uid AS driver_fb_uid
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      LEFT JOIN users u_rider ON b.rider_id = u_rider.id OR b.rider_id = u_rider.firebase_uid
      LEFT JOIN users u_driver ON r.driver_id = u_driver.id OR r.driver_id = u_driver.firebase_uid
      WHERE b.id = $1 OR b.id = $2
      LIMIT 1;
    `;

    const res = await query(sql, [bookingId, `booking_${bookingId}`]);
    if (!res.rows || res.rows.length === 0) {
      throw ApiError.notFound('Booking record not found for this conversation');
    }

    const b = res.rows[0];

    // 1. Participant Authorization Check
    const isParticipant =
      callerUid === b.rider_id ||
      callerUid === b.driver_id ||
      callerUid === b.rider_fb_uid ||
      callerUid === b.driver_fb_uid;

    if (!isParticipant) {
      throw ApiError.forbidden('You are not authorized to view or send messages in this conversation');
    }

    // 2. Booking Status Rule Check (Chat allowed ONLY on approved bookings)
    if (b.booking_status !== 'approved') {
      throw ApiError.forbidden(`Chat is accessible only to confirmed participants of an approved booking request (current status: '${b.booking_status}').`);
    }

    // 3. Block Check
    const otherParticipantId = callerUid === b.rider_id ? b.driver_id : b.rider_id;
    const isBlocked = await BlockService.isBlocked(callerUid, otherParticipantId);
    if (isBlocked) {
      throw ApiError.forbidden('Messaging is unavailable between blocked users.');
    }

    return {
      booking: b,
      driverId: b.driver_id,
      riderId: b.rider_id,
    };
  }

  /**
   * Get Conversations for Authenticated User
   */
  static async getConversations(callerUid: string): Promise<ConversationData[]> {
    const sql = `
      SELECT c.*, b.status AS booking_status
      FROM conversations c
      JOIN bookings b ON c.booking_id = b.id
      LEFT JOIN users u_driver ON c.driver_id = u_driver.id OR c.driver_id = u_driver.firebase_uid
      LEFT JOIN users u_rider ON c.rider_id = u_rider.id OR c.rider_id = u_rider.firebase_uid
      WHERE (c.driver_id = $1 OR c.rider_id = $1 OR u_driver.firebase_uid = $1 OR u_rider.firebase_uid = $1)
        AND b.status = 'approved'
      ORDER BY c.last_message_at DESC;
    `;

    const res = await query(sql, [callerUid]);
    return (res.rows || []).map(r => ({
      id: r.id,
      bookingId: r.booking_id,
      driverId: r.driver_id,
      riderId: r.rider_id,
      status: r.status,
      lastMessagePreview: r.last_message_preview,
      lastMessageAt: r.last_message_at,
      createdAt: r.created_at,
    }));
  }

  /**
   * Get Single Conversation Details
   */
  static async getConversation(callerUid: string, bookingId: string): Promise<ConversationData> {
    const { booking } = await this.validateChatAccess(callerUid, bookingId);

    const sql = `SELECT * FROM conversations WHERE booking_id = $1 LIMIT 1;`;
    const res = await query(sql, [booking.booking_id]);

    if (!res.rows || res.rows.length === 0) {
      return {
        id: `conv_${booking.booking_id}`,
        bookingId: booking.booking_id,
        driverId: booking.driver_id,
        riderId: booking.rider_id,
        status: 'active',
        lastMessagePreview: 'Booking approved. Chat opened.',
        createdAt: new Date().toISOString(),
      };
    }

    const r = res.rows[0];
    return {
      id: r.id,
      bookingId: r.booking_id,
      driverId: r.driver_id,
      riderId: r.rider_id,
      status: r.status,
      lastMessagePreview: r.last_message_preview,
      lastMessageAt: r.last_message_at,
      createdAt: r.created_at,
    };
  }

  /**
   * Get Chat Messages for Booking
   */
  static async getMessages(callerUid: string, bookingId: string): Promise<ChatMessageData[]> {
    const { booking } = await this.validateChatAccess(callerUid, bookingId);

    const sql = `
      SELECT m.*
      FROM messages m
      WHERE m.booking_id = $1 OR m.conversation_id = $2
      ORDER BY m.created_at ASC;
    `;

    const res = await query(sql, [booking.booking_id, `conv_${booking.booking_id}`]);
    return (res.rows || []).map(m => ({
      id: m.id,
      conversationId: m.conversation_id,
      bookingId: m.booking_id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at,
    }));
  }

  /**
   * Send Chat Message
   */
  static async sendMessage(callerUid: string, bookingId: string, body: string): Promise<ChatMessageData> {
    const { booking } = await this.validateChatAccess(callerUid, bookingId);

    const trimmedBody = body ? body.trim() : '';
    if (trimmedBody.length < 1 || trimmedBody.length > 1000) {
      throw ApiError.badRequest('Message body must be between 1 and 1000 characters');
    }

    const msgId = `msg_${Date.now()}`;
    const convId = `conv_${booking.booking_id}`;

    // Ensure conversation record exists
    const ensureConvSql = `
      INSERT INTO conversations (id, booking_id, driver_id, rider_id, status, last_message_preview, last_message_at)
      VALUES ($1, $2, $3, $4, 'active', $5, CURRENT_TIMESTAMP)
      ON CONFLICT (booking_id) 
      DO UPDATE SET last_message_preview = EXCLUDED.last_message_preview, last_message_at = CURRENT_TIMESTAMP;
    `;
    await query(ensureConvSql, [convId, booking.booking_id, booking.driver_id, booking.rider_id, trimmedBody]);

    // Insert message record
    const insertMsgSql = `
      INSERT INTO messages (id, conversation_id, booking_id, sender_id, body)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await query(insertMsgSql, [msgId, convId, booking.booking_id, callerUid, trimmedBody]);

    const m = res.rows[0];
    return {
      id: m.id,
      conversationId: m.conversation_id,
      bookingId: m.booking_id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at,
    };
  }
}
