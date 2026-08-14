import { z } from 'zod';

export const createRideSchema = z.object({
  vehicleType: z.enum(['carpool', 'bike_pool']),
  pickup: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
  meetingPoint: z.string().min(2).max(150),
  departureAt: z.string().datetime(),
  totalSeats: z.number().int().min(1).max(4),
  suggestedContribution: z.number().min(0).default(0),
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
