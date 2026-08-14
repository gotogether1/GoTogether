import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="auth/onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="ride/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="chat/[bookingId]" options={{ presentation: 'card' }} />
          <Stack.Screen name="safety/report" options={{ presentation: 'modal' }} />
          <Stack.Screen name="safety/blocks" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
