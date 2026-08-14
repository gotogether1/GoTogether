"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
const api_error_js_1 = require("../utils/api-error.js");
const block_service_js_1 = require("./block.service.js");
class RideService {
    static collection = 'rides';
    static async createRide(driverId, input) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const docRef = db.collection(this.collection).doc();
        const now = new Date().toISOString();
        const ride = {
            id: docRef.id,
            driverId,
            ...input,
            availableSeats: input.totalSeats,
            status: 'published',
            createdAt: now,
            updatedAt: now,
        };
        await docRef.set(ride);
        return ride;
    }
    static async listRides(callerUid, filters) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const blockedUserIds = await block_service_js_1.BlockService.getBlockedUsers(callerUid);
        let query = db.collection(this.collection).where('status', '==', 'published');
        if (filters.vehicleType && (filters.vehicleType === 'carpool' || filters.vehicleType === 'bike_pool')) {
            query = query.where('vehicleType', '==', filters.vehicleType);
        }
        const snap = await query.get();
        let rides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Filter out rides driven by blocked users or with 0 available seats
        rides = rides.filter((r) => !blockedUserIds.includes(r.driverId) && r.availableSeats > 0);
        if (filters.pickup) {
            const p = filters.pickup.toLowerCase();
            rides = rides.filter((r) => r.pickup.toLowerCase().includes(p));
        }
        if (filters.destination) {
            const d = filters.destination.toLowerCase();
            rides = rides.filter((r) => r.destination.toLowerCase().includes(d));
        }
        return rides;
    }
    static async getRide(rideId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const snap = await db.collection(this.collection).doc(rideId).get();
        if (!snap.exists) {
            throw api_error_js_1.ApiError.notFound('Ride not found');
        }
        return { id: snap.id, ...snap.data() };
    }
    static async cancelRide(driverId, rideId) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const rideRef = db.collection(this.collection).doc(rideId);
        const snap = await rideRef.get();
        if (!snap.exists) {
            throw api_error_js_1.ApiError.notFound('Ride not found');
        }
        const ride = snap.data();
        if (ride.driverId !== driverId) {
            throw api_error_js_1.ApiError.forbidden('Only the driver can cancel this ride');
        }
        const updatedAt = new Date().toISOString();
        await rideRef.update({ status: 'cancelled', updatedAt });
        return { ...ride, status: 'cancelled', updatedAt };
    }
}
exports.RideService = RideService;
