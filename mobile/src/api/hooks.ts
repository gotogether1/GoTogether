import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from './client';
import { SEED_RIDES, SEED_BOOKINGS } from '../demo/seedData';
import { auth } from '../config/firebase';

// 1. Rides Hooks

/**
 * Public discovery search query (Find a Ride)
 */
export function useRidesQuery(filters?: { vehicleType?: string; pickup?: string; destination?: string; date?: string }) {
  return useQuery({
    queryKey: ['rides', filters],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams(filters as any).toString();
        const res = await fetchWithAuth(`/v1/rides?${queryParams}`);
        return res.data;
      } catch {
        return SEED_RIDES.filter(r => {
          if (filters?.vehicleType && filters.vehicleType !== 'all' && r.vehicleType !== filters.vehicleType) return false;
          if (filters?.pickup && !r.pickup.toLowerCase().includes(filters.pickup.toLowerCase())) return false;
          if (filters?.destination && !r.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
          if (filters?.date && !r.departureAt.startsWith(filters.date)) return false;
          return true;
        });
      }
    },
  });
}

/**
 * Authenticated user's My Rides query (WHERE driver_id = authenticatedUserId)
 */
export function useMyRidesQuery() {
  const currentUid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ['my-rides', currentUid],
    queryFn: async () => {
      if (!currentUid) return [];
      try {
        const res = await fetchWithAuth('/v1/rides/me');
        return res.data;
      } catch {
        return SEED_RIDES.filter(r => r.driverId === currentUid);
      }
    },
    enabled: !!currentUid,
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

      try {
        const res = await fetchWithAuth('/v1/rides', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.data) {
          SEED_RIDES.unshift(res.data);
        }
        return res.data;
      } catch {
        const newRide = {
          id: `ride_${Date.now()}`,
          driverId: currentUid || 'authenticated_driver',
          driverName: auth.currentUser?.displayName || 'You',
          driverRating: 5.0,
          driverRideCount: 1,
          vehicleType: rideData.vehicleType || 'carpool',
          pickup: rideData.pickup,
          destination: rideData.destination,
          pickupAddress: rideData.pickupAddress || rideData.pickup,
          pickupLatitude: rideData.pickupLatitude,
          pickupLongitude: rideData.pickupLongitude,
          dropoffAddress: rideData.dropoffAddress || rideData.destination,
          dropoffLatitude: rideData.dropoffLatitude,
          dropoffLongitude: rideData.dropoffLongitude,
          meetingPoint: rideData.meetingPoint || 'Main Pick-up Point',
          departureAt: rideData.departureAt || new Date().toISOString(),
          totalSeats: rideData.totalSeats || 3,
          availableSeats: rideData.totalSeats || 3,
          suggestedContribution: rideData.suggestedContribution || 0,
          stopovers: rideData.stopovers || [],
          routePolyline: rideData.routePolyline || [],
          routeSummary: rideData.routeSummary || 'fastest',
          vehicleDetails: rideData.vehicleDetails || 'My Vehicle',
          rules: rideData.rules || '',
          notes: rideData.notes || '',
          status: 'published' as const,
        };
        SEED_RIDES.unshift(newRide);
        return newRide;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
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
