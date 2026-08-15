import { query } from '../db/index.js';
import { ApiError } from '../utils/api-error.js';
import { RideService } from './ride.service.js';
import { BlockService } from './block.service.js';

export interface BookingData {
  id: string;
  rideId: string;
  riderId: string;
  riderName?: string;
  driverId: string;
  driverName?: string;
  seatsRequested: number;
  negotiatedPrice?: number;
  riderMessage?: string;
  pickup?: string;
  destination?: string;
  departureAt?: string;
  vehicleType?: 'carpool' | 'bike_pool';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export class BookingService {
  /**
   * Create a new booking request with strict Driver Self-Booking Protection
   */
  static async createBooking(
    riderUid: string,
    rideId: string,
    seatsRequested: number,
    riderMessage?: string,
    negotiatedPrice?: number
  ): Promise<BookingData> {
    // 1. Fetch target ride from Neon PostgreSQL
    const ride = await RideService.getRide(rideId);

    // 2. Resolve rider database ID and Firebase UID
    let targetRiderId = riderUid;
    const userRes = await query('SELECT id, firebase_uid, display_name FROM users WHERE id = $1 OR firebase_uid = $1 LIMIT 1', [riderUid]);
    if (userRes.rows && userRes.rows.length > 0) {
      targetRiderId = userRes.rows[0].id;
    }

    // 3. DRIVER SELF-BOOKING & NEGOTIATION PROTECTION
    if (
      ride.driverId === riderUid ||
      ride.driverId === targetRiderId ||
      (userRes.rows[0] && ride.driverId === userRes.rows[0].firebase_uid)
    ) {
      throw ApiError.badRequest('Drivers cannot book seats or negotiate prices on their own published ride');
    }

    // 4. Validate ride availability
    if (ride.status === 'cancelled' || ride.status === 'completed') {
      throw ApiError.badRequest('Ride is no longer open for booking');
    }

    if (ride.availableSeats < seatsRequested) {
      throw ApiError.conflict('Not enough seats available');
    }

    // 5. Block check
    const isBlocked = await BlockService.isBlocked(targetRiderId, ride.driverId);
    if (isBlocked) {
      throw ApiError.forbidden('Booking not allowed between blocked users');
    }

    // 6. Check for existing active booking
    const existingCheckSql = `
      SELECT id FROM bookings
      WHERE ride_id = $1
        AND (rider_id = $2 OR rider_id = $3)
        AND status IN ('pending', 'approved')
      LIMIT 1;
    `;
    const existingRes = await query(existingCheckSql, [rideId, targetRiderId, riderUid]);
    if (existingRes.rows && existingRes.rows.length > 0) {
      throw ApiError.conflict('You already have an active booking for this ride');
    }

    // 7. Insert booking row into PostgreSQL
    const bookingId = `booking_${Date.now()}`;
    const insertSql = `
      INSERT INTO bookings (id, ride_id, rider_id, seats_requested, negotiated_price, rider_message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *;
    `;
    const res = await query(insertSql, [
      bookingId,
      rideId,
      targetRiderId,
      seatsRequested,
      negotiatedPrice || null,
      riderMessage || '',
    ]);

    if (res.rows && res.rows.length > 0) {
      const b = res.rows[0];
      return {
        id: b.id,
        rideId: b.ride_id,
        riderId: b.rider_id,
        driverId: ride.driverId,
        seatsRequested: b.seats_requested,
        negotiatedPrice: b.negotiated_price ? parseFloat(b.negotiated_price) : undefined,
        riderMessage: b.rider_message,
        pickup: ride.pickup,
        destination: ride.destination,
        departureAt: ride.departureAt,
        vehicleType: ride.vehicleType,
        status: b.status,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      };
    }

    throw new Error('Failed to create booking record in database');
  }

  /**
   * List bookings for caller (rider or driver)
   */
  static async getBookings(callerUid: string, type: 'rider' | 'driver' = 'rider'): Promise<BookingData[]> {
    let userDbId = callerUid;
    const userRes = await query('SELECT id FROM users WHERE id = $1 OR firebase_uid = $1 LIMIT 1', [callerUid]);
    if (userRes.rows && userRes.rows.length > 0) {
      userDbId = userRes.rows[0].id;
    }

    const sql = type === 'driver'
      ? `
        SELECT b.*, r.pickup, r.destination, r.departure_at, r.vehicle_type, r.driver_id,
               u_rider.display_name AS rider_name, u_driver.display_name AS driver_name
        FROM bookings b
        JOIN rides r ON b.ride_id = r.id
        LEFT JOIN users u_rider ON b.rider_id = u_rider.id OR b.rider_id = u_rider.firebase_uid
        LEFT JOIN users u_driver ON r.driver_id = u_driver.id OR r.driver_id = u_driver.firebase_uid
        WHERE r.driver_id = $1 OR r.driver_id = $2
        ORDER BY b.created_at DESC;
      `
      : `
        SELECT b.*, r.pickup, r.destination, r.departure_at, r.vehicle_type, r.driver_id,
               u_rider.display_name AS rider_name, u_driver.display_name AS driver_name
        FROM bookings b
        JOIN rides r ON b.ride_id = r.id
        LEFT JOIN users u_rider ON b.rider_id = u_rider.id OR b.rider_id = u_rider.firebase_uid
        LEFT JOIN users u_driver ON r.driver_id = u_driver.id OR r.driver_id = u_driver.firebase_uid
        WHERE b.rider_id = $1 OR b.rider_id = $2
        ORDER BY b.created_at DESC;
      `;

    const res = await query(sql, [callerUid, userDbId]);

    return (res.rows || []).map(b => ({
      id: b.id,
      rideId: b.ride_id,
      riderId: b.rider_id,
      riderName: b.rider_name || 'Rider',
      driverId: b.driver_id,
      driverName: b.driver_name || 'Driver',
      seatsRequested: b.seats_requested,
      negotiatedPrice: b.negotiated_price ? parseFloat(b.negotiated_price) : undefined,
      riderMessage: b.rider_message,
      pickup: b.pickup,
      destination: b.destination,
      departureAt: b.departure_at,
      vehicleType: b.vehicle_type,
      status: b.status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));
  }

  static async listUserBookings(callerUid: string): Promise<BookingData[]> {
    return this.getBookings(callerUid, 'rider');
  }

  /**
   * Approve booking (driver action)
   */
  static async approveBooking(driverUid: string, bookingId: string): Promise<BookingData> {
    const bookingSql = `
      SELECT b.*, r.driver_id, r.available_seats, r.total_seats
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      WHERE b.id = $1
      LIMIT 1;
    `;
    const res = await query(bookingSql, [bookingId]);
    if (!res.rows || res.rows.length === 0) {
      throw ApiError.notFound('Booking not found');
    }

    const b = res.rows[0];

    // Check driver authorization
    let userDbId = driverUid;
    const userRes = await query('SELECT id FROM users WHERE id = $1 OR firebase_uid = $1 LIMIT 1', [driverUid]);
    if (userRes.rows && userRes.rows.length > 0) {
      userDbId = userRes.rows[0].id;
    }

    if (b.driver_id !== driverUid && b.driver_id !== userDbId) {
      throw ApiError.forbidden('Only the driver can approve this booking request');
    }

    if (b.status !== 'pending') {
      throw ApiError.conflict(`Cannot approve a booking in '${b.status}' status`);
    }

    if (b.available_seats < b.seats_requested) {
      throw ApiError.conflict('Not enough seats available to approve this request');
    }

    // Update booking status and decrement available seats
    await query("UPDATE bookings SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1;", [bookingId]);
    await query("UPDATE rides SET available_seats = available_seats - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;", [b.seats_requested, b.ride_id]);

    // Create conversation record for chat
    const convId = `conv_${bookingId}`;
    const convSql = `
      INSERT INTO conversations (id, booking_id, driver_id, rider_id, status, last_message_preview)
      VALUES ($1, $2, $3, $4, 'active', 'Booking approved. Chat opened for trip coordination.')
      ON CONFLICT (booking_id) DO NOTHING;
    `;
    await query(convSql, [convId, bookingId, b.driver_id, b.rider_id]);

    return {
      id: b.id,
      rideId: b.ride_id,
      riderId: b.rider_id,
      driverId: b.driver_id,
      seatsRequested: b.seats_requested,
      status: 'approved',
    };
  }

  /**
   * Reject booking (driver action)
   */
  static async rejectBooking(driverUid: string, bookingId: string): Promise<BookingData> {
    const bookingSql = `
      SELECT b.*, r.driver_id
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      WHERE b.id = $1
      LIMIT 1;
    `;
    const res = await query(bookingSql, [bookingId]);
    if (!res.rows || res.rows.length === 0) {
      throw ApiError.notFound('Booking not found');
    }

    const b = res.rows[0];
    if (b.driver_id !== driverUid) {
      throw ApiError.forbidden('Only the driver can reject this booking request');
    }

    await query("UPDATE bookings SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1;", [bookingId]);
    return {
      id: b.id,
      rideId: b.ride_id,
      riderId: b.rider_id,
      driverId: b.driver_id,
      seatsRequested: b.seats_requested,
      status: 'rejected',
    };
  }

  /**
   * Cancel booking (rider or driver action)
   */
  static async cancelBooking(callerUid: string, bookingId: string): Promise<BookingData> {
    const bookingSql = `
      SELECT b.*, r.driver_id, r.available_seats, r.total_seats
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      WHERE b.id = $1
      LIMIT 1;
    `;
    const res = await query(bookingSql, [bookingId]);
    if (!res.rows || res.rows.length === 0) {
      throw ApiError.notFound('Booking not found');
    }

    const b = res.rows[0];
    if (b.rider_id !== callerUid && b.driver_id !== callerUid) {
      throw ApiError.forbidden('You are not authorized to cancel this booking');
    }

    // If previously approved, restore seats to ride
    if (b.status === 'approved') {
      await query("UPDATE rides SET available_seats = LEAST(total_seats, available_seats + $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2;", [b.seats_requested, b.ride_id]);
    }

    await query("UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1;", [bookingId]);
    return {
      id: b.id,
      rideId: b.ride_id,
      riderId: b.rider_id,
      driverId: b.driver_id,
      seatsRequested: b.seats_requested,
      status: 'cancelled',
    };
  }
}
