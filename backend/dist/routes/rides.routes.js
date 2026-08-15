"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const ride_service_js_1 = require("../services/ride.service.js");
const booking_service_js_1 = require("../services/booking.service.js");
const index_js_1 = require("../validators/index.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
/**
 * Public search endpoint for Find a Ride (Discovery with Date Filtering)
 */
router.get('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const { vehicleType, pickup, destination, date } = req.query;
        const rides = await ride_service_js_1.RideService.listRides(uid, {
            vehicleType: vehicleType,
            pickup: pickup,
            destination: destination,
            date: date,
        });
        res.json({ data: rides });
    }
    catch (err) {
        next(err);
    }
});
/**
 * Authenticated user's My Rides endpoint (WHERE driver_id = authenticatedUserId)
 */
router.get('/me', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const myRides = await ride_service_js_1.RideService.getMyRides(uid);
        res.json({ data: myRides });
    }
    catch (err) {
        next(err);
    }
});
/**
 * Create a new ride (driver_id derived strictly from req.auth.uid)
 */
router.post('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const validated = index_js_1.createRideSchema.parse(req.body);
        const ride = await ride_service_js_1.RideService.createRide(uid, validated);
        res.status(201).json({ data: ride });
    }
    catch (err) {
        next(err);
    }
});
/**
 * Get Ride by ID
 */
router.get('/:rideId', async (req, res, next) => {
    try {
        const ride = await ride_service_js_1.RideService.getRide(req.params.rideId);
        res.json({ data: ride });
    }
    catch (err) {
        next(err);
    }
});
/**
 * Cancel Ride
 */
router.post('/:rideId/cancel', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const ride = await ride_service_js_1.RideService.cancelRide(uid, req.params.rideId);
        res.json({ data: ride });
    }
    catch (err) {
        next(err);
    }
});
/**
 * Bookings for a Ride
 */
router.post('/:rideId/bookings', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const { seatsRequested, riderMessage } = index_js_1.createBookingSchema.parse(req.body);
        const booking = await booking_service_js_1.BookingService.createBooking(uid, req.params.rideId, seatsRequested, riderMessage);
        res.status(201).json({ data: booking });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
