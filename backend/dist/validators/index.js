"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportSchema = exports.createReviewSchema = exports.createBookingSchema = exports.createRideSchema = void 0;
const zod_1 = require("zod");
exports.createRideSchema = zod_1.z.object({
    vehicleType: zod_1.z.enum(['carpool', 'bike_pool']),
    pickup: zod_1.z.string().min(2).max(100),
    destination: zod_1.z.string().min(2).max(100),
    pickupAddress: zod_1.z.string().optional(),
    pickupLatitude: zod_1.z.number({ required_error: 'Pickup latitude is required' }),
    pickupLongitude: zod_1.z.number({ required_error: 'Pickup longitude is required' }),
    pickupPlaceId: zod_1.z.string().optional(),
    dropoffAddress: zod_1.z.string().optional(),
    dropoffLatitude: zod_1.z.number({ required_error: 'Dropoff latitude is required' }),
    dropoffLongitude: zod_1.z.number({ required_error: 'Dropoff longitude is required' }),
    dropoffPlaceId: zod_1.z.string().optional(),
    meetingPoint: zod_1.z.string().min(2).max(150),
    departureAt: zod_1.z.string(),
    totalSeats: zod_1.z.number().int().min(1).max(6),
    suggestedContribution: zod_1.z.number().min(0).default(0),
    stopovers: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        address: zod_1.z.string().optional(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
    })).optional().default([]),
    routePolyline: zod_1.z.array(zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    })).optional().default([]),
    routeSummary: zod_1.z.string().optional().default('fastest'),
    vehicleDetails: zod_1.z.string().min(2).max(100),
    rules: zod_1.z.string().max(300).optional().default(''),
    notes: zod_1.z.string().max(500).optional().default(''),
}).refine((data) => {
    if (data.vehicleType === 'bike_pool' && data.totalSeats > 1) {
        return false;
    }
    return true;
}, {
    message: 'Bike pool rides can offer a maximum of 1 pillion seat',
    path: ['totalSeats'],
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
