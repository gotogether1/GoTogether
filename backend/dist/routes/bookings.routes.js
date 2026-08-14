"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const booking_service_js_1 = require("../services/booking.service.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const bookings = await booking_service_js_1.BookingService.listUserBookings(uid);
        res.json({ data: bookings });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:bookingId/approve', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const booking = await booking_service_js_1.BookingService.approveBooking(uid, req.params.bookingId);
        res.json({ data: booking });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:bookingId/reject', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const booking = await booking_service_js_1.BookingService.rejectBooking(uid, req.params.bookingId);
        res.json({ data: booking });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:bookingId/cancel', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const booking = await booking_service_js_1.BookingService.cancelBooking(uid, req.params.bookingId);
        res.json({ data: booking });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
