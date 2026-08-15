import { Platform } from 'react-native';
import { auth } from '../config/firebase';

let envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://gotogether-backend-zceg.onrender.com';

// Only allow local loopback mapping during local development on Android emulator when explicitly configured with localhost
if (__DEV__ && Platform.OS === 'android' && envBaseUrl.includes('localhost')) {
  envBaseUrl = envBaseUrl.replace('localhost', '10.0.2.2');
} else if (!__DEV__ && (envBaseUrl.includes('localhost') || envBaseUrl.includes('10.0.2.2'))) {
  // Enforce production Render URL in release builds
  envBaseUrl = 'https://gotogether-backend-zceg.onrender.com';
}

export const API_BASE_URL = envBaseUrl;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  let token: string | null = null;

  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn('Failed to get Firebase ID token:', e);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || `HTTP ${response.status}: Request failed`;
    throw new Error(errorMessage);
  }

  return data;
}
