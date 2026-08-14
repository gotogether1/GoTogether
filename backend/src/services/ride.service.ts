import * as admin from 'firebase-admin';
import { getFirestoreDb } from '../config/firebase-admin.js';
import { ApiError } from '../utils/api-error.js';
import { BlockService } from './block.service.js';

export interface RideData {
  id?: string;
  driverId: string;
  vehicleType: 'carpool' | 'bike_pool';
  pickup: string;
  destination: string;
  meetingPoint: string;
  departureAt: string;
  totalSeats: number;
  availableSeats: number;
  suggestedContribution: number;
  vehicleDetails: string;
  rules: string;
  notes: string;
  status: 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export class RideService {
  private static collection = 'rides';

  static async createRide(driverId: string, input: Omit<RideData, 'id' | 'driverId' | 'availableSeats' | 'status' | 'createdAt' | 'updatedAt'>): Promise<RideData> {
    const db = getFirestoreDb();
    const docRef = db.collection(this.collection).doc();
    const now = new Date().toISOString();

    const ride: RideData = {
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

  static async listRides(callerUid: string, filters: { vehicleType?: string; pickup?: string; destination?: string }): Promise<RideData[]> {
    const db = getFirestoreDb();
    const blockedUserIds = await BlockService.getBlockedUsers(callerUid);

    let query: admin.firestore.Query = db.collection(this.collection).where('status', '==', 'published');

    if (filters.vehicleType && (filters.vehicleType === 'carpool' || filters.vehicleType === 'bike_pool')) {
      query = query.where('vehicleType', '==', filters.vehicleType);
    }

    const snap = await query.get();
    let rides: RideData[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as RideData));

    // Filter out rides driven by blocked users or with 0 available seats
    rides = rides.filter((r: RideData) => !blockedUserIds.includes(r.driverId) && r.availableSeats > 0);

    if (filters.pickup) {
      const p = filters.pickup.toLowerCase();
      rides = rides.filter((r: RideData) => r.pickup.toLowerCase().includes(p));
    }

    if (filters.destination) {
      const d = filters.destination.toLowerCase();
      rides = rides.filter((r: RideData) => r.destination.toLowerCase().includes(d));
    }

    return rides;
  }

  static async getRide(rideId: string): Promise<RideData> {
    const db = getFirestoreDb();
    const snap = await db.collection(this.collection).doc(rideId).get();
    if (!snap.exists) {
      throw ApiError.notFound('Ride not found');
    }
    return { id: snap.id, ...snap.data() } as RideData;
  }

  static async cancelRide(driverId: string, rideId: string): Promise<RideData> {
    const db = getFirestoreDb();
    const rideRef = db.collection(this.collection).doc(rideId);
    const snap = await rideRef.get();

    if (!snap.exists) {
      throw ApiError.notFound('Ride not found');
    }

    const ride = snap.data() as RideData;

    if (ride.driverId !== driverId) {
      throw ApiError.forbidden('Only the driver can cancel this ride');
    }

    const updatedAt = new Date().toISOString();
    await rideRef.update({ status: 'cancelled', updatedAt });

    return { ...ride, status: 'cancelled', updatedAt };
  }
}
