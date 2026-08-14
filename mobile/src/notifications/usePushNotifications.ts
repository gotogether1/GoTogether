import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { fetchWithAuth } from '../api/client';
import { auth } from '../config/firebase';

// Safely configure Expo Notification Handler adhering strictly to Expo SDK 57 & Expo Go compatibility
try {
  if (Constants.appOwnership !== 'expo') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch {
  // Gracefully ignored in Expo Go
}

export function usePushNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Only register push notification listeners on standalone builds/devices
    if (Constants.appOwnership === 'expo') {
      console.log('ℹ️ Running in Expo Go. Native Push Notifications are enabled on standalone APK builds.');
      return;
    }

    registerForPushNotificationsAsync();

    // Listener for notifications received while app is in foreground
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 Push notification received:', notification);
      });

      // Listener for user tapping on a push notification on Lock Screen, Home Screen, or Banner
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('📲 Lock screen / Home screen notification tapped:', data);

        if (data?.targetType === 'booking') {
          router.push('/(tabs)/dashboard');
        } else if (data?.targetType === 'conversation') {
          router.push(`/chat/${data.targetId}`);
        } else if (data?.targetType === 'ride') {
          router.push(`/ride/${data.targetId}`);
        }
      });
    } catch (e) {
      console.warn('Notification listener skipped in dev client:', e);
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice || Constants.appOwnership === 'expo') {
    console.log('ℹ️ Push notifications require a physical device or standalone build.');
    return undefined;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Push notification permissions denied by user.');
      return undefined;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('🔑 Expo Push Token:', token);

    // Register token with backend if user is logged in
    if (auth.currentUser) {
      await fetchWithAuth(`/v1/me/devices/${Device.modelName || 'android_device'}`, {
        method: 'PUT',
        body: JSON.stringify({
          expoPushToken: token,
          platform: Platform.OS,
        }),
      });
    }

    // Configure Android MAX importance channel for Lock Screen & Home Screen heads-up popups
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Go Together Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: 'default',
      });
    }

    return token;
  } catch (e) {
    console.warn('Failed to get Expo push token:', e);
    return undefined;
  }
}
