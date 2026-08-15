export interface DemoUser {
  uid: string;
  displayName: string;
  email: string;
  city: string;
  bio: string;
  photoURL: string | null;
  averageRating: number;
  completedRideCount: number;
}

export interface DemoRide {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  driverRideCount: number;
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
  stopovers?: Array<{ name: string; address?: string; latitude?: number; longitude?: number }>;
  routePolyline?: Array<{ latitude: number; longitude: number }>;
  routeSummary?: string;
  vehicleDetails: string;
  rules: string;
  notes: string;
  status: 'published' | 'cancelled' | 'completed';
}

export interface DemoBooking {
  id: string;
  rideId: string;
  riderId: string;
  riderName: string;
  driverId: string;
  driverName: string;
  seatsRequested: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  riderMessage?: string;
  pickup: string;
  destination: string;
  departureAt: string;
  vehicleType: 'carpool' | 'bike_pool';
}

export interface DemoNotification {
  id: string;
  userId: string;
  type: 'booking_requested' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'ride_cancelled' | 'chat_message' | 'review_reminder';
  title: string;
  body: string;
  targetType: 'ride' | 'booking' | 'conversation';
  targetId: string;
  read: boolean;
  createdAt: string;
}

export interface DemoMessage {
  id: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

// Clean initial state (No hardcoded demo users or static rides)
export const SEED_USERS: DemoUser[] = [];

export const SEED_RIDES: DemoRide[] = [];

export const SEED_BOOKINGS: DemoBooking[] = [];

export const SEED_NOTIFICATIONS: DemoNotification[] = [];

export const SEED_MESSAGES: DemoMessage[] = [];
