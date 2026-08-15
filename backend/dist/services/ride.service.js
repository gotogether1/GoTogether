"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideService = void 0;
const index_js_1 = require("../db/index.js");
const api_error_js_1 = require("../utils/api-error.js");
const block_service_js_1 = require("./block.service.js");
class RideService {
    /**
     * Create a new ride in Neon PostgreSQL rides table
     */
    static async createRide(driverId, input) {
        // Validate required coordinates
        if (typeof input.pickupLatitude !== 'number' ||
            typeof input.pickupLongitude !== 'number' ||
            typeof input.dropoffLatitude !== 'number' ||
            typeof input.dropoffLongitude !== 'number') {
            throw api_error_js_1.ApiError.badRequest('Pickup and Dropoff coordinates are required for ride creation');
        }
        // Resolve target driver ID from users table
        let targetDriverId = driverId;
        const userRes = await (0, index_js_1.query)('SELECT id FROM users WHERE id = $1 OR firebase_uid = $1 LIMIT 1', [driverId]);
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
        const res = await (0, index_js_1.query)(sql, params);
        if (res.rows && res.rows.length > 0) {
            const r = res.rows[0];
            return this.mapRideRow(r);
        }
        throw new Error('Failed to create ride record in database');
    }
    /**
     * Search Public Rides in Neon PostgreSQL (Find a Ride)
     */
    static async listRides(callerUid, filters) {
        const blockedUserIds = await block_service_js_1.BlockService.getBlockedUsers(callerUid);
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
        const res = await (0, index_js_1.query)(sql, [vehicleFilter, pickupQuery, destQuery]);
        const rides = (res.rows || []).map(r => this.mapRideRow(r));
        return rides.filter(r => !blockedUserIds.includes(r.driverId));
    }
    /**
     * Get My Published Rides (WHERE driver_id = authenticatedUserId)
     */
    static async getMyRides(driverUid) {
        const sql = `
      SELECT r.*, u.display_name AS driver_name, u.average_rating AS driver_rating
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id OR r.driver_id = u.firebase_uid
      WHERE r.driver_id = $1 
         OR r.driver_id = (SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1)
         OR r.driver_id = (SELECT firebase_uid FROM users WHERE id = $1 LIMIT 1)
      ORDER BY r.created_at DESC;
    `;
        const res = await (0, index_js_1.query)(sql, [driverUid]);
        return (res.rows || []).map(r => this.mapRideRow(r));
    }
    /**
     * Get single Ride Details
     */
    static async getRide(rideId) {
        const sql = `
      SELECT r.*, u.display_name AS driver_name, u.average_rating AS driver_rating
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id OR r.driver_id = u.firebase_uid
      WHERE r.id = $1
      LIMIT 1;
    `;
        const res = await (0, index_js_1.query)(sql, [rideId]);
        if (!res.rows || res.rows.length === 0) {
            throw api_error_js_1.ApiError.notFound('Ride not found');
        }
        return this.mapRideRow(res.rows[0]);
    }
    /**
     * Cancel Ride
     */
    static async cancelRide(driverId, rideId) {
        const checkSql = `SELECT * FROM rides WHERE id = $1 LIMIT 1;`;
        const checkRes = await (0, index_js_1.query)(checkSql, [rideId]);
        if (!checkRes.rows || checkRes.rows.length === 0) {
            throw api_error_js_1.ApiError.notFound('Ride not found');
        }
        const ride = checkRes.rows[0];
        const userRes = await (0, index_js_1.query)('SELECT firebase_uid FROM users WHERE id = $1 LIMIT 1', [ride.driver_id]);
        const driverFbUid = userRes.rows[0]?.firebase_uid;
        if (ride.driver_id !== driverId && driverFbUid !== driverId) {
            throw api_error_js_1.ApiError.forbidden('Only the driver can cancel this ride');
        }
        const updateSql = `UPDATE rides SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`;
        const updateRes = await (0, index_js_1.query)(updateSql, [rideId]);
        return this.mapRideRow(updateRes.rows[0]);
    }
    static mapRideRow(r) {
        let parsedStopovers = [];
        try {
            parsedStopovers = typeof r.stopovers === 'string' ? JSON.parse(r.stopovers) : r.stopovers || [];
        }
        catch {
            parsedStopovers = [];
        }
        let parsedPolyline = [];
        try {
            parsedPolyline = typeof r.route_polyline === 'string' ? JSON.parse(r.route_polyline) : r.route_polyline || [];
        }
        catch {
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
exports.RideService = RideService;
