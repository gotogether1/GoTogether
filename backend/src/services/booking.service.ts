import { getFirestoreDb } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';
import { RideService, RideData } from './ride.service.js';
import { BlockService } from './block.service.js';

export interface BookingData {
  id?: string;
  rideId: string;
  riderId: string;
  driverId: string;
  seatsRequested: number;
  riderMessage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export class BookingService {
  private static collection = 'bookings';
  private static conversationsCollection = 'conversations';

  static async createBooking(riderId: string, rideId: string, seatsRequested: number, riderMessage?: string): Promise<BookingData> {
    const ride = await RideService.getRide(rideId);

    if (ride.driverId === riderId) {
      throw ApiError.badRequest('Drivers cannot book their own rides');
    }

    if (ride.status !== 'published') {
      throw ApiError.badRequest('Ride is no longer open for booking');
    }

    if (ride.availableSeats < seatsRequested) {
      throw ApiError.conflict('Not enough seats available');
    }

    const isBlocked = await BlockService.isBlocked(riderId, ride.driverId);
    if (isBlocked) {
      throw ApiError.forbidden('Booking not allowed between blocked users');
    }

    const db = getFirestoreDb();
    const existing = await db.collection(this.collection)
      .where('rideId', '==', rideId)
      .where('riderId', '==', riderId)
      .where('status', 'in', ['pending', 'approved'])
      .get();

    if (!existing.empty) {
      throw ApiError.conflict('You already have an active booking for this ride');
    }

    const docRef = db.collection(this.collection).doc();
    const now = new Date().toISOString();

    const booking: BookingData = {
      id: docRef.id,
      rideId,
      riderId,
      driverId: ride.driverId,
      seatsRequested,
      riderMessage: riderMessage || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(booking);
    return booking;
  }

  static async approveBooking(driverId: string, bookingId: string): Promise<BookingData> {
    const db = getFirestoreDb();
    const bookingRef = db.collection(this.collection).doc(bookingId);

    return db.runTransaction(async (transaction) => {
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw ApiError.notFound('Booking not found');
      }

      const booking = { id: bookingSnap.id, ...bookingSnap.data() } as BookingData;

      if (booking.driverId !== driverId) {
        throw ApiError.forbidden('Only the driver can approve this booking');
      }

      if (booking.status !== 'pending') {
        throw ApiError.conflict(`Cannot approve a booking in '${booking.status}' status`);
      }

      const rideRef = db.collection('rides').doc(booking.rideId);
      const rideSnap = await transaction.get(rideRef);
      if (!rideSnap.exists) {
        throw ApiError.notFound('Ride not found');
      }

      const ride = rideSnap.data() as RideData;

      if (ride.availableSeats < booking.seatsRequested) {
        throw ApiError.conflict('Not enough seats available to approve this request');
      }

      const now = new Date().toISOString();

      // Atomic updates inside transaction
      transaction.update(bookingRef, { status: 'approved', updatedAt: now });
      transaction.update(rideRef, {
        availableSeats: ride.availableSeats - booking.seatsRequested,
        updatedAt: now,
      });

      // Atomic creation of 1-to-1 confirmed direct conversation
      const convRef = db.collection(this.conversationsCollection).doc(bookingId);
      transaction.set(convRef, {
        bookingId,
        rideId: booking.rideId,
        driverId: booking.driverId,
        riderId: booking.riderId,
        participantIds: [booking.driverId, booking.riderId],
        type: 'direct_ride_chat',
        status: 'active',
        lastMessagePreview: 'Booking approved. Chat opened for ride coordination.',
        lastMessageAt: now,
        createdAt: now,
      });

      return { ...booking, status: 'approved', updatedAt: now };
    });
  }

  static async rejectBooking(driverId: string, bookingId: string): Promise<BookingData> {
    const db = getFirestoreDb();
    const bookingRef = db.collection(this.collection).doc(bookingId);
    const snap = await bookingRef.get();

    if (!snap.exists) {
      throw ApiError.notFound('Booking not found');
    }

    const booking = snap.data() as BookingData;

    if (booking.driverId !== driverId) {
      throw ApiError.forbidden('Only the driver can reject this booking');
    }

    const now = new Date().toISOString();
    await bookingRef.update({ status: 'rejected', updatedAt: now });
    return { ...booking, status: 'rejected', updatedAt: now };
  }

  static async cancelBooking(callerUid: string, bookingId: string): Promise<BookingData> {
    const db = getFirestoreDb();
    const bookingRef = db.collection(this.collection).doc(bookingId);

    return db.runTransaction(async (transaction) => {
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw ApiError.notFound('Booking not found');
      }

      const booking = { id: bookingSnap.id, ...bookingSnap.data() } as BookingData;

      if (booking.riderId !== callerUid && booking.driverId !== callerUid) {
        throw ApiError.forbidden('You are not authorized to cancel this booking');
      }

      const now = new Date().toISOString();

      if (booking.status === 'approved') {
        const rideRef = db.collection('rides').doc(booking.rideId);
        const rideSnap = await transaction.get(rideRef);
        if (rideSnap.exists) {
          const ride = rideSnap.data() as RideData;
          transaction.update(rideRef, {
            availableSeats: Math.min(ride.totalSeats, ride.availableSeats + booking.seatsRequested),
            updatedAt: now,
          });
        }

        // Close associated chat conversation
        const convRef = db.collection(this.conversationsCollection).doc(bookingId);
        transaction.update(convRef, {
          status: 'closed',
          closedReason: 'booking_cancelled',
          closedAt: now,
        });
      }

      transaction.update(bookingRef, { status: 'cancelled', updatedAt: now });
      return { ...booking, status: 'cancelled', updatedAt: now };
    });
  }

  static async listUserBookings(uid: string): Promise<BookingData[]> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection)
      .where('riderId', '==', uid)
      .get();

    const snap2 = await db.collection(this.collection)
      .where('driverId', '==', uid)
      .get();

    const map = new Map<string, BookingData>();
    snap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() } as BookingData));
    snap2.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() } as BookingData));

    return Array.from(map.values());
  }
}
