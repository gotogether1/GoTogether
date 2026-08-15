import { Platform } from 'react-native';
import { auth } from '../config/firebase';

let envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://gotogether-backend-zceg.onrender.com';

// On Android emulator, 'localhost' points to internal Android VM loopback. Map 'localhost' to '10.0.2.2' (Android host loopback)
if (Platform.OS === 'android' && envBaseUrl.includes('localhost')) {
  envBaseUrl = envBaseUrl.replace('localhost', '10.0.2.2');
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
