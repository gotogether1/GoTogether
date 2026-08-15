import { query } from '../db/index.js';
import { ApiError } from '../utils/api-error.js';
import { BlockService } from './block.service.js';

export interface StopoverLocation {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface RideData {
  id: string;
  driverId: string;
  driverName?: string;
  driverRating?: number;
  vehicleType: 'carpool' | 'bike_pool';
  pickup: string;
  destination: string;
  pickupAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffAddress?: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  meetingPoint: string;
  departureAt: string;
  totalSeats: number;
  availableSeats: number;
  suggestedContribution: number;
  stopovers?: StopoverLocation[];
  vehicleDetails: string;
  rules?: string;
  notes?: string;
  status: 'published' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export class RideService {
  /**
   * Create a new ride in Neon PostgreSQL rides table
   */
  static async createRide(
    driverId: string,
    input: {
      vehicleType: 'carpool' | 'bike_pool';
      pickup: string;
      destination: string;
      pickupAddress?: string;
      pickupLatitude?: number;
      pickupLongitude?: number;
      dropoffAddress?: string;
      dropoffLatitude?: number;
      dropoffLongitude?: number;
      meetingPoint: string;
      departureAt: string;
      totalSeats: number;
      suggestedContribution?: number;
      stopovers?: StopoverLocation[];
      vehicleDetails: string;
      rules?: string;
      notes?: string;
    }
  ): Promise<RideData> {
    const rideId = `ride_${Date.now()}`;
    const stopoversJson = JSON.stringify(input.stopovers || []);

    const sql = `
      INSERT INTO rides (
        id, driver_id, vehicle_type, pickup, destination,
        pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude,
        meeting_point, departure_at, total_seats, available_seats,
        suggested_contribution, stopovers, vehicle_details, rules, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb, $18, $19, $20, 'active')
      RETURNING *;
    `;

    const params = [
      rideId,
      driverId,
      input.vehicleType,
      input.pickup,
      input.destination,
      input.pickupAddress || input.pickup,
      input.pickupLatitude || null,
      input.pickupLongitude || null,
      input.dropoffAddress || input.destination,
      input.dropoffLatitude || null,
      input.dropoffLongitude || null,
      input.meetingPoint || 'Main Pick-up Point',
      input.departureAt || new Date().toISOString(),
      input.totalSeats,
      input.totalSeats, // available_seats starts equal to total_seats
      input.suggestedContribution || 0.00,
      stopoversJson,
      input.vehicleDetails || 'Vehicle',
      input.rules || '',
      input.notes || '',
    ];

    const res = await query(sql, params);
    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return this.mapRideRow(r);
    }

    throw new Error('Failed to create ride record in database');
  }

  /**
   * Search Rides in Neon PostgreSQL with Intermediate Waypoint & Stopover Matching
   */
  static async listRides(
    callerUid: string,
    filters: { vehicleType?: string; pickup?: string; destination?: string }
  ): Promise<RideData[]> {
    const blockedUserIds = await BlockService.getBlockedUsers(callerUid);

    const pickupQuery = filters.pickup ? filters.pickup.trim() : null;
    const destQuery = filters.destination ? filters.destination.trim() : null;
    const vehicleFilter = filters.vehicleType && filters.vehicleType !== 'all' ? filters.vehicleType : null;

    const sql = `
      SELECT r.*, u.display_name AS driver_name, u.average_rating AS driver_rating
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id OR r.driver_id = u.firebase_uid
      WHERE r.status = 'active'
        AND r.available_seats > 0
        AND ($1::VARCHAR IS NULL OR r.vehicle_type = $1)
        AND (
          $2::VARCHAR IS NULL OR r.pickup ILIKE '%' || $2 || '%' OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(r.stopovers) elem 
            WHERE elem->>'name' ILIKE '%' || $2 || '%' OR elem->>'address' ILIKE '%' || $2 || '%'
          )
        )
        AND (
          $3::VARCHAR IS NULL OR r.destination ILIKE '%' || $3 || '%' OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(r.stopovers) elem 
            WHERE elem->>'name' ILIKE '%' || $3 || '%' OR elem->>'address' ILIKE '%' || $3 || '%'
          )
        )
      ORDER BY r.departure_at ASC;
    `;

    const res = await query(sql, [vehicleFilter, pickupQuery, destQuery]);

    const rides = (res.rows || []).map(r => this.mapRideRow(r));
    return rides.filter(r => !blockedUserIds.includes(r.driverId));
  }

  /**
   * Get single Ride Details
   */
  static async getRide(rideId: string): Promise<RideData> {
    const sql = `
      SELECT r.*, u.display_name AS driver_name, u.average_rating AS driver_rating
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id OR r.driver_id = u.firebase_uid
      WHERE r.id = $1
      LIMIT 1;
    `;
    const res = await query(sql, [rideId]);
    if (!res.rows || res.rows.length === 0) {
      throw ApiError.notFound('Ride not found');
    }
    return this.mapRideRow(res.rows[0]);
  }

  /**
   * Cancel Ride
   */
  static async cancelRide(driverId: string, rideId: string): Promise<RideData> {
    const checkSql = `SELECT * FROM rides WHERE id = $1 LIMIT 1;`;
    const checkRes = await query(checkSql, [rideId]);
    if (!checkRes.rows || checkRes.rows.length === 0) {
      throw ApiError.notFound('Ride not found');
    }

    const ride = checkRes.rows[0];
    if (ride.driver_id !== driverId) {
      throw ApiError.forbidden('Only the driver can cancel this ride');
    }

    const updateSql = `UPDATE rides SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`;
    const updateRes = await query(updateSql, [rideId]);
    return this.mapRideRow(updateRes.rows[0]);
  }

  private static mapRideRow(r: any): RideData {
    let parsedStopovers: StopoverLocation[] = [];
    try {
      parsedStopovers = typeof r.stopovers === 'string' ? JSON.parse(r.stopovers) : r.stopovers || [];
    } catch {
      parsedStopovers = [];
    }

    return {
      id: r.id,
      driverId: r.driver_id,
      driverName: r.driver_name || 'Driver',
      driverRating: parseFloat(r.driver_rating || '5.0'),
      vehicleType: r.vehicle_type,
      pickup: r.pickup,
      destination: r.destination,
      pickupAddress: r.pickup_address,
      pickupLatitude: r.pickup_latitude ? parseFloat(r.pickup_latitude) : undefined,
      pickupLongitude: r.pickup_longitude ? parseFloat(r.pickup_longitude) : undefined,
      dropoffAddress: r.dropoff_address,
      dropoffLatitude: r.dropoff_latitude ? parseFloat(r.dropoff_latitude) : undefined,
      dropoffLongitude: r.dropoff_longitude ? parseFloat(r.dropoff_longitude) : undefined,
      meetingPoint: r.meeting_point,
      departureAt: r.departure_at,
      totalSeats: r.total_seats,
      availableSeats: r.available_seats,
      suggestedContribution: parseFloat(r.suggested_contribution || '0.0'),
      stopovers: parsedStopovers,
      vehicleDetails: r.vehicle_details,
      rules: r.rules,
      notes: r.notes,
      status: r.status === 'active' ? 'published' : r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}
