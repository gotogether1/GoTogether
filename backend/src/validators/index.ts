import { z } from 'zod';

export const createRideSchema = z.object({
  vehicleType: z.enum(['carpool', 'bike_pool']),
  pickup: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
  pickupAddress: z.string().optional(),
  pickupLatitude: z.number({ required_error: 'Pickup latitude is required' }),
  pickupLongitude: z.number({ required_error: 'Pickup longitude is required' }),
  pickupPlaceId: z.string().optional(),
  dropoffAddress: z.string().optional(),
  dropoffLatitude: z.number({ required_error: 'Dropoff latitude is required' }),
  dropoffLongitude: z.number({ required_error: 'Dropoff longitude is required' }),
  dropoffPlaceId: z.string().optional(),
  meetingPoint: z.string().min(2).max(150),
  departureAt: z.string(),
  totalSeats: z.number().int().min(1).max(4),
  suggestedContribution: z.number().min(0).default(0),
  stopovers: z.array(
    z.object({
      name: z.string(),
      address: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
  ).optional().default([]),
  routePolyline: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
    })
  ).optional().default([]),
  routeSummary: z.string().optional().default('fastest'),
  vehicleDetails: z.string().min(2).max(100),
  rules: z.string().max(300).optional().default(''),
  notes: z.string().max(500).optional().default(''),
});

export const createBookingSchema = z.object({
  seatsRequested: z.number().int().min(1).max(4).default(1),
  riderMessage: z.string().max(300).optional().default(''),
});

export const createReviewSchema = z.object({
  bookingId: z.string(),
  recipientId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(500).optional().default(''),
});

export const createReportSchema = z.object({
  targetType: z.enum(['user', 'ride', 'booking', 'review']),
  targetId: z.string(),
  reason: z.string().min(2).max(100),
  details: z.string().max(1000).optional().default(''),
});
