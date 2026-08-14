import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { fetchWithAuth } from '../api/client';
import { auth } from '../config/firebase';

// Configure Expo Notification Handler adhering strictly to Expo SDK 57 specifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 Push notification received in foreground:', notification);
    });

    // Listener for user tapping on a push notification banner/alert
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('📲 Notification tapped with data:', data);

      if (data?.targetType === 'booking') {
        router.push('/(tabs)/dashboard');
      } else if (data?.targetType === 'conversation') {
        router.push(`/chat/${data.targetId}`);
      } else if (data?.targetType === 'ride') {
        router.push(`/ride/${data.targetId}`);
      }
    });

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
  if (!Device.isDevice) {
    console.log('ℹ️ Push notifications require a physical device.');
    return undefined;
  }

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

  try {
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

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return token;
  } catch (e) {
    console.warn('Failed to get Expo push token:', e);
    return undefined;
  }
}
