"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
const api_error_js_1 = require("../utils/api-error.js");
const ride_service_js_1 = require("./ride.service.js");
const block_service_js_1 = require("./block.service.js");
class BookingService {
    static collection = 'bookings';
    static conversationsCollection = 'conversations';
    static async createBooking(riderId, rideId, seatsRequested, riderMessage) {
        const ride = await ride_service_js_1.RideService.getRide(rideId);
        if (ride.driverId === riderId) {
            throw api_error_js_1.ApiError.badRequest('Drivers cannot book their own rides');
        }
        if (ride.status !== 'published') {
            throw api_error_js_1.ApiError.badRequest('Ride is no longer open for booking');
        }
        if (ride.availableSeats < seatsRequested) {
            throw api_error_js_1.ApiError.conflict('Not enough seats available');
        }
        const isBlocked = await block_service_js_1.BlockService.isBlocked(riderId, ride.driverId);
        if (isBlocked) {
            throw api_error_js_1.ApiError.forbidden('Booking not allowed between blocked users');
        }
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const existing = await db.collection(this.collection)
            .where('rideId', '==', rideId)
            .where('riderId', '==', riderId)
            .where('status', 'in', ['pending', 'approved'])
            .get();
        if (!existing.empty) {
            throw api_error_js_1.ApiError.conflict('You already have an active booking for this ride');
        }
        const docRef = db.collection(this.collection).doc();
        const now = new Date().toISOString();
        const booking = {
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
    static async approveBooking(driverId, bookingId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const bookingRef = db.collection(this.collection).doc(bookingId);
        return db.runTransaction(async (transaction) => {
            const bookingSnap = await transaction.get(bookingRef);
            if (!bookingSnap.exists) {
                throw api_error_js_1.ApiError.notFound('Booking not found');
            }
            const booking = { id: bookingSnap.id, ...bookingSnap.data() };
            if (booking.driverId !== driverId) {
                throw api_error_js_1.ApiError.forbidden('Only the driver can approve this booking');
            }
            if (booking.status !== 'pending') {
                throw api_error_js_1.ApiError.conflict(`Cannot approve a booking in '${booking.status}' status`);
            }
            const rideRef = db.collection('rides').doc(booking.rideId);
            const rideSnap = await transaction.get(rideRef);
            if (!rideSnap.exists) {
                throw api_error_js_1.ApiError.notFound('Ride not found');
            }
            const ride = rideSnap.data();
            if (ride.availableSeats < booking.seatsRequested) {
                throw api_error_js_1.ApiError.conflict('Not enough seats available to approve this request');
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
    static async rejectBooking(driverId, bookingId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const bookingRef = db.collection(this.collection).doc(bookingId);
        const snap = await bookingRef.get();
        if (!snap.exists) {
            throw api_error_js_1.ApiError.notFound('Booking not found');
        }
        const booking = snap.data();
        if (booking.driverId !== driverId) {
            throw api_error_js_1.ApiError.forbidden('Only the driver can reject this booking');
        }
        const now = new Date().toISOString();
        await bookingRef.update({ status: 'rejected', updatedAt: now });
        return { ...booking, status: 'rejected', updatedAt: now };
    }
    static async cancelBooking(callerUid, bookingId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const bookingRef = db.collection(this.collection).doc(bookingId);
        return db.runTransaction(async (transaction) => {
            const bookingSnap = await transaction.get(bookingRef);
            if (!bookingSnap.exists) {
                throw api_error_js_1.ApiError.notFound('Booking not found');
            }
            const booking = { id: bookingSnap.id, ...bookingSnap.data() };
            if (booking.riderId !== callerUid && booking.driverId !== callerUid) {
                throw api_error_js_1.ApiError.forbidden('You are not authorized to cancel this booking');
            }
            const now = new Date().toISOString();
            if (booking.status === 'approved') {
                const rideRef = db.collection('rides').doc(booking.rideId);
                const rideSnap = await transaction.get(rideRef);
                if (rideSnap.exists) {
                    const ride = rideSnap.data();
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
    static async listUserBookings(uid) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection)
            .where('riderId', '==', uid)
            .get();
        const snap2 = await db.collection(this.collection)
            .where('driverId', '==', uid)
            .get();
        const map = new Map();
        snap.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
        snap2.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
        return Array.from(map.values());
    }
}
exports.BookingService = BookingService;
