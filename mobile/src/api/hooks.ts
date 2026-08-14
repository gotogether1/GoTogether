import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from './client';
import { SEED_RIDES, SEED_BOOKINGS, SEED_MESSAGES, SEED_NOTIFICATIONS, SEED_USERS } from '../demo/seedData';

// 1. Rides Hooks
export function useRidesQuery(filters?: { vehicleType?: string; pickup?: string; destination?: string }) {
  return useQuery({
    queryKey: ['rides', filters],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams(filters as any).toString();
        const res = await fetchWithAuth(`/v1/rides?${queryParams}`);
        return res.data;
      } catch {
        // Fallback to local demo data if backend is offline/unreachable
        return SEED_RIDES.filter(r => {
          if (filters?.vehicleType && filters.vehicleType !== 'all' && r.vehicleType !== filters.vehicleType) return false;
          if (filters?.pickup && !r.pickup.toLowerCase().includes(filters.pickup.toLowerCase())) return false;
          if (filters?.destination && !r.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
          return true;
        });
      }
    },
  });
}

export function useRideDetailQuery(rideId: string) {
  return useQuery({
    queryKey: ['ride', rideId],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth(`/v1/rides/${rideId}`);
        return res.data;
      } catch {
        return SEED_RIDES.find(r => r.id === rideId) || SEED_RIDES[0];
      }
    },
  });
}

export function useCreateRideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rideData: any) => {
      return fetchWithAuth('/v1/rides', {
        method: 'POST',
        body: JSON.stringify(rideData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });
}

// 2. Bookings Hooks
export function useBookingsQuery() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/v1/bookings');
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
    mutationFn: async ({ rideId, seatsRequested, riderMessage }: { rideId: string; seatsRequested: number; riderMessage?: string }) => {
      return fetchWithAuth(`/v1/rides/${rideId}/bookings`, {
        method: 'POST',
        body: JSON.stringify({ seatsRequested, riderMessage }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });
}

export function useApproveBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      return fetchWithAuth(`/v1/bookings/${bookingId}/approve`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useRejectBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      return fetchWithAuth(`/v1/bookings/${bookingId}/reject`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// 3. Direct Chat Hooks
export function useMessagesQuery(bookingId: string) {
  return useQuery({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth(`/v1/chats/${bookingId}/messages`);
        return res.data;
      } catch {
        return SEED_MESSAGES.filter(m => m.bookingId === bookingId);
      }
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, body }: { bookingId: string; body: string }) => {
      return fetchWithAuth(`/v1/chats/${bookingId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// 4. Notifications Hooks
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/v1/notifications');
        return res.data;
      } catch {
        return SEED_NOTIFICATIONS;
      }
    },
  });
}

// 5. Profile & Safety Hooks
export function useUserProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        const endpoint = userId ? `/v1/users/${userId}` : '/v1/me';
        const res = await fetchWithAuth(endpoint);
        return res.data;
      } catch {
        return SEED_USERS.find(u => u.uid === userId) || SEED_USERS[0];
      }
    },
  });
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData: { bookingId: string; recipientId: string; rating: number; text?: string }) => {
      return fetchWithAuth('/v1/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCreateReportMutation() {
  return useMutation({
    mutationFn: async (reportData: { targetType: string; targetId: string; reason: string; details?: string }) => {
      return fetchWithAuth('/v1/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
    },
  });
}

export function useBlockedUsersQuery() {
  return useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      try {
        const res = await fetchWithAuth('/v1/blocks');
        return res.data;
      } catch {
        return [{ id: 'block_1', uid: 'blocked_user_99', name: 'Spam User' }];
      }
    },
  });
}
