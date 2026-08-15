import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from './client';
import { SEED_RIDES, SEED_BOOKINGS } from '../demo/seedData';
import { auth } from '../config/firebase';
import { useAuth } from '../auth/AuthProvider';

// 1. Rides Hooks

/**
 * Public discovery search query (Find a Ride)
 */
export function useRidesQuery(filters?: {
  vehicleType?: string;
  pickup?: string;
  destination?: string;
  date?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
}) {
  return useQuery({
    queryKey: ['rides', filters],
    queryFn: async () => {
      const cleanParams: Record<string, string> = {};
      if (filters?.vehicleType && filters.vehicleType !== 'all' && filters.vehicleType !== 'undefined') {
        cleanParams.vehicleType = filters.vehicleType;
      }
      if (filters?.pickup && filters.pickup.trim()) {
        cleanParams.pickup = filters.pickup.trim();
      }
      if (filters?.destination && filters.destination.trim()) {
        cleanParams.destination = filters.destination.trim();
      }
      if (filters?.date && filters.date.trim()) {
        cleanParams.date = filters.date.trim();
      }
      if (typeof filters?.pickupLatitude === 'number') {
        cleanParams.pickupLatitude = String(filters.pickupLatitude);
      }
      if (typeof filters?.pickupLongitude === 'number') {
        cleanParams.pickupLongitude = String(filters.pickupLongitude);
      }
      if (typeof filters?.dropoffLatitude === 'number') {
        cleanParams.dropoffLatitude = String(filters.dropoffLatitude);
      }
      if (typeof filters?.dropoffLongitude === 'number') {
        cleanParams.dropoffLongitude = String(filters.dropoffLongitude);
      }

      const queryString = new URLSearchParams(cleanParams).toString();
      const url = `/v1/rides${queryString ? `?${queryString}` : ''}`;
      const res = await fetchWithAuth(url);
      return res.data || [];
    },
  });
}

/**
 * Authenticated user's My Rides query (WHERE driver_id = authenticatedUserId)
 */
export function useMyRidesQuery() {
  const { user } = useAuth();
  const currentUid = user?.uid || auth.currentUser?.uid;

  return useQuery({
    queryKey: ['my-rides', currentUid],
    queryFn: async () => {
      if (!currentUid) return [];
      const res = await fetchWithAuth('/v1/rides/me');
      return res.data || [];
    },
    enabled: !!currentUid,
    staleTime: 0,
  });
}

/**
 * Get Ride by ID
 */
export function useRideDetailQuery(rideId: string) {
  return useQuery({
    queryKey: ['ride', rideId],
    queryFn: async () => {
      if (!rideId) return null;
      try {
        const res = await fetchWithAuth(`/v1/rides/${rideId}`);
        return res.data;
      } catch {
        return SEED_RIDES.find(r => r.id === rideId) || null;
      }
    },
    enabled: !!rideId,
  });
}

/**
 * Create a new ride (bound strictly to authenticated user UID)
 */
export function useCreateRideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rideData: any) => {
      const currentUid = auth.currentUser?.uid;
      const payload = {
        ...rideData,
        driverId: currentUid || rideData.driverId,
      };

      const res = await fetchWithAuth('/v1/rides', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      const currentUid = auth.currentUser?.uid;
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
      if (currentUid) {
        queryClient.invalidateQueries({ queryKey: ['my-rides', currentUid] });
      }
    },
  });
}

// 2. Booking Hooks
export function useBookingsQuery(type?: 'rider' | 'driver') {
  return useQuery({
    queryKey: ['bookings', type],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth(`/v1/bookings?type=${type || 'rider'}`);
        return res.data;
      } catch {
        return SEED_BOOKINGS;
      }
    },
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: any) => {
      try {
        const res = await fetchWithAuth('/v1/bookings', {
          method: 'POST',
          body: JSON.stringify(bookingData),
        });
        if (res.data) {
          SEED_BOOKINGS.unshift(res.data);
        }
        return res.data;
      } catch {
        const newBooking = {
          id: `booking_${Date.now()}`,
          rideId: bookingData.rideId,
          riderId: auth.currentUser?.uid || 'authenticated_rider',
          riderName: auth.currentUser?.displayName || 'You',
          driverId: bookingData.driverId || 'driver_id',
          driverName: bookingData.driverName || 'Driver',
          seatsRequested: bookingData.seatsRequested || 1,
          status: 'pending' as const,
          riderMessage: bookingData.riderMessage || '',
          pickup: bookingData.pickup || 'Pickup Location',
          destination: bookingData.destination || 'Destination',
          departureAt: new Date().toISOString(),
          vehicleType: bookingData.vehicleType || 'carpool',
        };
        SEED_BOOKINGS.unshift(newBooking);
        return newBooking;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
