import { query } from '../db/index.js';
import { ApiError } from '../utils/api-error.js';
import { BlockService } from './block.service.js';

export interface StopoverLocation {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface LatLngPoint {
  latitude: number;
  longitude: number;
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
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress?: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  meetingPoint: string;
  departureAt: string;
  totalSeats: number;
  availableSeats: number;
  suggestedContribution: number;
  stopovers?: StopoverLocation[];
  routePolyline?: LatLngPoint[];
  routeSummary?: string;
  vehicleDetails: string;
  rules?: string;
  notes?: string;
  status: 'published' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
      pickupLatitude: number;
      pickupLongitude: number;
      dropoffAddress?: string;
      dropoffLatitude: number;
      dropoffLongitude: number;
      meetingPoint: string;
      departureAt: string;
      totalSeats: number;
      suggestedContribution?: number;
      stopovers?: StopoverLocation[];
      routePolyline?: LatLngPoint[];
      routeSummary?: string;
      vehicleDetails: string;
      rules?: string;
      notes?: string;
    }
  ): Promise<RideData> {
    // Validate required coordinates
    if (
      typeof input.pickupLatitude !== 'number' ||
      typeof input.pickupLongitude !== 'number' ||
      typeof input.dropoffLatitude !== 'number' ||
      typeof input.dropoffLongitude !== 'number'
    ) {
      throw ApiError.badRequest('Pickup and Dropoff coordinates are required for ride creation');
    }

    // Resolve target driver ID from users table
    let targetDriverId = driverId;
    const userRes = await query('SELECT id FROM users WHERE id = $1 OR firebase_uid = $1 LIMIT 1', [driverId]);
    if (userRes.rows && userRes.rows.length > 0) {
      targetDriverId = userRes.rows[0].id;
    }

    const rideId = `ride_${Date.now()}`;
    const stopoversJson = JSON.stringify(input.stopovers || []);
    const polylineJson = JSON.stringify(input.routePolyline || []);

    const sql = `
      INSERT INTO rides (
        id, driver_id, vehicle_type, pickup, destination,
        pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude,
        meeting_point, departure_at, total_seats, available_seats,
        suggested_contribution, stopovers, route_polyline, route_variant, vehicle_details, rules, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb, $18::jsonb, $19, $20, $21, $22, 'active')
      RETURNING *;
    `;

    const params = [
      rideId,
      targetDriverId,
      input.vehicleType,
      input.pickup,
      input.destination,
      input.pickupAddress || input.pickup,
      input.pickupLatitude,
      input.pickupLongitude,
      input.dropoffAddress || input.destination,
      input.dropoffLatitude,
      input.dropoffLongitude,
      input.meetingPoint || 'Main Pick-up Point',
      input.departureAt || new Date().toISOString(),
      input.totalSeats,
      input.totalSeats,
      input.suggestedContribution || 0.00,
      stopoversJson,
      polylineJson,
      input.routeSummary || 'fastest',
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
   * Search Public Rides in Neon PostgreSQL (Find a Ride with Dynamic BlaBla-Style Route Matching)
   */
  static async listRides(
    callerUid: string,
    filters: {
      vehicleType?: string;
      pickup?: string;
      destination?: string;
      pickupLatitude?: number;
      pickupLongitude?: number;
      dropoffLatitude?: number;
      dropoffLongitude?: number;
      date?: string;
    }
  ): Promise<RideData[]> {
    const blockedUserIds = await BlockService.getBlockedUsers(callerUid);

    const pickupQuery = filters.pickup ? filters.pickup.trim().toLowerCase() : null;
    const destQuery = filters.destination ? filters.destination.trim().toLowerCase() : null;
    const vehicleFilter = (filters.vehicleType && filters.vehicleType !== 'all' && filters.vehicleType !== 'undefined') ? filters.vehicleType : null;
    const dateFilter = (filters.date && filters.date !== 'undefined') ? filters.date.trim() : null;

    // Stage 1: Fast Candidate Query (Active rides, available seats > 0, excludes caller's own rides)
    const sql = `
      SELECT r.*, u.display_name AS driver_name, u.average_rating AS driver_rating, u.firebase_uid AS driver_fb_uid
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id OR r.driver_id = u.firebase_uid
      WHERE r.status = 'active'
        AND r.available_seats > 0
        AND r.driver_id != $1
        AND (u.firebase_uid IS NULL OR u.firebase_uid != $1)
        AND ($2::VARCHAR IS NULL OR r.vehicle_type = $2)
        AND ($3::VARCHAR IS NULL OR DATE(r.departure_at) = $3::DATE)
      ORDER BY r.departure_at ASC;
    `;

    const res = await query(sql, [callerUid, vehicleFilter, dateFilter]);
    const candidateRides = (res.rows || []).map(r => this.mapRideRow(r));

    // Filter out blocked drivers
    const unblockedRides = candidateRides.filter(r => !blockedUserIds.includes(r.driverId));

    // If no pickup/destination search criteria, return candidates
    if (!pickupQuery && !destQuery && typeof filters.pickupLatitude !== 'number') {
      return unblockedRides;
    }

    // Stage 2: Dynamic BlaBla-Style Route & Order Matching
    return unblockedRides.filter(ride => {
      return this.matchesRouteSegment(ride, {
        pickupName: pickupQuery,
        destName: destQuery,
        pickupLat: filters.pickupLatitude,
        pickupLng: filters.pickupLongitude,
        dropoffLat: filters.dropoffLatitude,
        dropoffLng: filters.dropoffLongitude,
      });
    });
  }

  /**
   * Helper: Check if a passenger's requested journey segment matches driver's route polyline & ordered waypoints
   */
  private static matchesRouteSegment(
    ride: RideData,
    search: {
      pickupName?: string | null;
      destName?: string | null;
      pickupLat?: number;
      pickupLng?: number;
      dropoffLat?: number;
      dropoffLng?: number;
    }
  ): boolean {
    const { pickupName, destName, pickupLat, pickupLng, dropoffLat, dropoffLng } = search;

    // 1. Waypoints Text Array: [Pickup, ...Stopovers, Destination]
    const stopoverNames = (ride.stopovers || []).map(s => s.name.toLowerCase());
    const waypoints = [ride.pickup.toLowerCase(), ...stopoverNames, ride.destination.toLowerCase()];

    let pickupIndex = -1;
    let dropoffIndex = -1;

    if (pickupName) {
      const pTokens = pickupName.split(/[\s,]+/).filter(t => t.length > 2);
      pickupIndex = waypoints.findIndex(w => {
        if (w.includes(pickupName) || pickupName.includes(w)) return true;
        return pTokens.some(tok => w.includes(tok));
      });
    }

    if (destName) {
      const dTokens = destName.split(/[\s,]+/).filter(t => t.length > 2);
      for (let i = waypoints.length - 1; i >= 0; i--) {
        const w = waypoints[i];
        if (w.includes(destName) || destName.includes(w) || dTokens.some(tok => w.includes(tok))) {
          dropoffIndex = i;
          break;
        }
      }
    }

    // If both pickup and destination text names match, check ROUTE ORDER
    if (pickupName && destName && pickupIndex !== -1 && dropoffIndex !== -1) {
      // Must satisfy pickupIndex < dropoffIndex (Strict direction order!)
      if (pickupIndex >= dropoffIndex) {
        return false; // Opposite direction / wrong order -> REJECT
      }
      return true; // Valid order match!
    }

    // Single name text match (Pickup only OR Destination only)
    if (pickupName && !destName && pickupIndex !== -1) return true;
    if (!pickupName && destName && dropoffIndex !== -1) return true;

    // 2. Polyline Proximity & Polyline Order Matching (using saved routePolyline points)
    const polyline = ride.routePolyline || [];

    // Also include pickup, stopover, and dropoff coordinates in geometry evaluation
    const coordsList: LatLngPoint[] = [];
    if (typeof ride.pickupLatitude === 'number' && typeof ride.pickupLongitude === 'number') {
      coordsList.push({ latitude: ride.pickupLatitude, longitude: ride.pickupLongitude });
    }
    (ride.stopovers || []).forEach(s => {
      if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
        coordsList.push({ latitude: s.latitude, longitude: s.longitude });
      }
    });
    if (typeof ride.dropoffLatitude === 'number' && typeof ride.dropoffLongitude === 'number') {
      coordsList.push({ latitude: ride.dropoffLatitude, longitude: ride.dropoffLongitude });
    }

    const fullPolyline = polyline.length > 0 ? polyline : coordsList;

    // Evaluate coordinate proximity if passenger coordinates passed
    if (typeof pickupLat === 'number' && typeof pickupLng === 'number' && typeof dropoffLat === 'number' && typeof dropoffLng === 'number') {
      let nearestPickupDist = Infinity;
      let nearestPickupIdx = -1;
      let nearestDropoffDist = Infinity;
      let nearestDropoffIdx = -1;

      for (let i = 0; i < fullPolyline.length; i++) {
        const pt = fullPolyline[i];
        const distP = haversineKm(pickupLat, pickupLng, pt.latitude, pt.longitude);
        if (distP < nearestPickupDist) {
          nearestPickupDist = distP;
          nearestPickupIdx = i;
        }

        const distD = haversineKm(dropoffLat, dropoffLng, pt.latitude, pt.longitude);
        if (distD < nearestDropoffDist) {
          nearestDropoffDist = distD;
          nearestDropoffIdx = i;
        }
      }

      // Proximity threshold: Configurable (Default: 10.0 km corridor radius)
      const MAX_PROXIMITY_KM = parseFloat(process.env.ROUTE_MATCHING_RADIUS_KM || '10.0');
      const isPickupNear = nearestPickupDist <= MAX_PROXIMITY_KM;
      const isDropoffNear = nearestDropoffDist <= MAX_PROXIMITY_KM;
      const isCorrectOrder = nearestPickupIdx < nearestDropoffIdx;

      if (isPickupNear && isDropoffNear && isCorrectOrder) {
        return true;
      }
      return false;
    }

    // Default text fallback if text queries provided
    if (pickupName && destName) {
      return (pickupIndex !== -1 && dropoffIndex !== -1 && pickupIndex < dropoffIndex);
    }

    return true;
  }

  /**
   * Get My Published Rides (WHERE driver_id = authenticatedUserId)
   */
  static async getMyRides(driverUid: string): Promise<RideData[]> {
    const sql = `
      SELECT r.*, u.display_name AS driver_name, u.average_rating AS driver_rating
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id OR r.driver_id = u.firebase_uid
      WHERE r.driver_id = $1 
         OR r.driver_id = (SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1)
         OR r.driver_id = (SELECT firebase_uid FROM users WHERE id = $1 LIMIT 1)
      ORDER BY r.created_at DESC;
    `;
    const res = await query(sql, [driverUid]);
    return (res.rows || []).map(r => this.mapRideRow(r));
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
    const userRes = await query('SELECT firebase_uid FROM users WHERE id = $1 LIMIT 1', [ride.driver_id]);
    const driverFbUid = userRes.rows[0]?.firebase_uid;

    if (ride.driver_id !== driverId && driverFbUid !== driverId) {
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

    let parsedPolyline: LatLngPoint[] = [];
    try {
      parsedPolyline = typeof r.route_polyline === 'string' ? JSON.parse(r.route_polyline) : r.route_polyline || [];
    } catch {
      parsedPolyline = [];
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
      pickupLatitude: parseFloat(r.pickup_latitude),
      pickupLongitude: parseFloat(r.pickup_longitude),
      dropoffAddress: r.dropoff_address,
      dropoffLatitude: parseFloat(r.dropoff_latitude),
      dropoffLongitude: parseFloat(r.dropoff_longitude),
      meetingPoint: r.meeting_point,
      departureAt: r.departure_at,
      totalSeats: r.total_seats,
      availableSeats: r.available_seats,
      suggestedContribution: parseFloat(r.suggested_contribution || '0.0'),
      stopovers: parsedStopovers,
      routePolyline: parsedPolyline,
      routeSummary: r.route_variant,
      vehicleDetails: r.vehicle_details,
      rules: r.rules,
      notes: r.notes,
      status: r.status === 'active' ? 'published' : r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}
