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
  meetingPoint: string;
  departureAt: string;
  totalSeats: number;
  availableSeats: number;
  suggestedContribution: number;
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

export const SEED_USERS: DemoUser[] = [
  {
    uid: 'user_alex_123',
    displayName: 'Alex Rivers',
    email: 'alex@example.com',
    city: 'San Francisco, CA',
    bio: 'Daily commuter between SF and San Jose. Quiet driver, loves podcasts.',
    photoURL: null,
    averageRating: 4.9,
    completedRideCount: 28,
  },
  {
    uid: 'user_sarah_456',
    displayName: 'Sarah Chen',
    email: 'sarah@example.com',
    city: 'Oakland, CA',
    bio: 'Avid cyclist and carpooler. Eco-friendly rides!',
    photoURL: null,
    averageRating: 4.8,
    completedRideCount: 15,
  },
];

export const SEED_RIDES: DemoRide[] = [
  {
    id: 'ride_101',
    driverId: 'user_alex_123',
    driverName: 'Alex Rivers',
    driverRating: 4.9,
    driverRideCount: 28,
    vehicleType: 'carpool',
    pickup: 'Downtown San Francisco',
    destination: 'Downtown San Jose',
    meetingPoint: 'Salesforce Transit Center (Bay 4)',
    departureAt: '2026-08-15T08:00:00.000Z',
    totalSeats: 3,
    availableSeats: 2,
    suggestedContribution: 12,
    vehicleDetails: '2023 Tesla Model 3 (Blue)',
    rules: 'No smoking. Small luggage allowed.',
    notes: 'Leaving right on time at 8:00 AM!',
    status: 'published',
  },
  {
    id: 'ride_102',
    driverId: 'user_sarah_456',
    driverName: 'Sarah Chen',
    driverRating: 4.8,
    driverRideCount: 15,
    vehicleType: 'bike_pool',
    pickup: 'Lake Merritt, Oakland',
    destination: 'Financial District, SF',
    meetingPoint: 'Lake Merritt BART Station entrance',
    departureAt: '2026-08-15T08:30:00.000Z',
    totalSeats: 1,
    availableSeats: 1,
    suggestedContribution: 5,
    vehicleDetails: 'Trek FX 3 Electric Bike',
    rules: 'Must wear a helmet (spare provided).',
    notes: 'Riding across Bay Bridge bike path.',
    status: 'published',
  },
];

export const SEED_BOOKINGS: DemoBooking[] = [
  {
    id: 'booking_201',
    rideId: 'ride_101',
    riderId: 'user_sarah_456',
    riderName: 'Sarah Chen',
    driverId: 'user_alex_123',
    driverName: 'Alex Rivers',
    seatsRequested: 1,
    status: 'approved',
    riderMessage: 'Hi Alex! Would love a seat for tomorrow morning commute.',
    pickup: 'Downtown San Francisco',
    destination: 'Downtown San Jose',
    departureAt: '2026-08-15T08:00:00.000Z',
    vehicleType: 'carpool',
  },
];

export const SEED_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'notif_301',
    userId: 'user_sarah_456',
    type: 'booking_approved',
    title: 'Ride Confirmed!',
    body: 'Alex Rivers approved your booking request.',
    targetType: 'booking',
    targetId: 'booking_201',
    read: false,
    createdAt: '2026-08-14T06:00:00.000Z',
  },
];

export const SEED_MESSAGES: DemoMessage[] = [
  {
    id: 'msg_401',
    bookingId: 'booking_201',
    senderId: 'user_alex_123',
    body: 'Hi Sarah! See you at Salesforce Transit Center Bay 4 at 7:55 AM.',
    createdAt: '2026-08-14T06:05:00.000Z',
  },
  {
    id: 'msg_402',
    bookingId: 'booking_201',
    senderId: 'user_sarah_456',
    body: 'Sounds great Alex! I will be there on time.',
    createdAt: '2026-08-14T06:06:00.000Z',
  },
];
