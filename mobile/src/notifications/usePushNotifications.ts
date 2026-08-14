import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { fetchWithAuth } from '../api/client';
import { auth } from '../config/firebase';

export function usePushNotifications() {
  const router = useRouter();
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  useEffect(() => {
    // Only register push notification listeners on standalone APK/EAS builds
    if (Constants.appOwnership === 'expo') {
      console.log('ℹ️ Running in Expo Go. Native Push Notifications are enabled on standalone APK builds.');
      return;
    }

    try {
      const Notifications = require('expo-notifications');

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      registerForPushNotificationsAsync();

      notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('🔔 Push notification received:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;
        console.log('📲 Lock screen notification tapped:', data);

        if (data?.targetType === 'booking') {
          router.push('/(tabs)/dashboard');
        } else if (data?.targetType === 'conversation') {
          router.push(`/chat/${data.targetId}`);
        } else if (data?.targetType === 'ride') {
          router.push(`/ride/${data.targetId}`);
        }
      });
    } catch (e) {
      console.warn('Push notification initialization skipped in Expo Go:', e);
    }

    return () => {
      try {
        if (notificationListener.current?.remove) {
          notificationListener.current.remove();
        }
        if (responseListener.current?.remove) {
          responseListener.current.remove();
        }
      } catch {
        // Ignore cleanup error
      }
    };
  }, [router]);
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice || Constants.appOwnership === 'expo') {
    return undefined;
  }

  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return undefined;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

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
    console.warn('Failed to get push token:', e);
    return undefined;
  }
}
