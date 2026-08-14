import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/auth/AuthProvider';
import { RealtimeProvider } from '../src/realtime/RealtimeProvider';
import { usePushNotifications } from '../src/notifications/usePushNotifications';

// Configure TanStack Query for flicker-free, instant UI cache serving
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Serve cached data for 5 minutes without flickers
      gcTime: 1000 * 60 * 30, // Preserve memory cache for 30 minutes
      refetchOnWindowFocus: false, // Prevent reload flickers when switching tabs or apps
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

function AppContent() {
  usePushNotifications();

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/forgot-password" />
      <Stack.Screen name="auth/onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ride/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="chat/[bookingId]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="review/[bookingId]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="profile/[userId]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="safety/report" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="safety/blocks" options={{ presentation: 'card', animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <AppContent />
          </SafeAreaProvider>
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
