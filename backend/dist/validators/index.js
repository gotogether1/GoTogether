"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportSchema = exports.createReviewSchema = exports.createBookingSchema = exports.createRideSchema = void 0;
const zod_1 = require("zod");
exports.createRideSchema = zod_1.z.object({
    vehicleType: zod_1.z.enum(['carpool', 'bike_pool']),
    pickup: zod_1.z.string().min(2).max(100),
    destination: zod_1.z.string().min(2).max(100),
    meetingPoint: zod_1.z.string().min(2).max(150),
    departureAt: zod_1.z.string().datetime(),
    totalSeats: zod_1.z.number().int().min(1).max(4),
    suggestedContribution: zod_1.z.number().min(0).default(0),
    vehicleDetails: zod_1.z.string().min(2).max(100),
    rules: zod_1.z.string().max(300).optional().default(''),
    notes: zod_1.z.string().max(500).optional().default(''),
});
exports.createBookingSchema = zod_1.z.object({
    seatsRequested: zod_1.z.number().int().min(1).max(4).default(1),
    riderMessage: zod_1.z.string().max(300).optional().default(''),
});
exports.createReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string(),
    recipientId: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(5),
    text: zod_1.z.string().max(500).optional().default(''),
});
exports.createReportSchema = zod_1.z.object({
    targetType: zod_1.z.enum(['user', 'ride', 'booking', 'review']),
    targetId: zod_1.z.string(),
    reason: zod_1.z.string().min(2).max(100),
    details: zod_1.z.string().max(1000).optional().default(''),
});
