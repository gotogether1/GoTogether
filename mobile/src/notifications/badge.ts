import * as Notifications from 'expo-notifications';

export async function syncAppBadgeCount(unreadCount: number): Promise<void> {
  try {
    if (unreadCount <= 0) {
      await Notifications.setBadgeCountAsync(0);
    } else {
      await Notifications.setBadgeCountAsync(unreadCount);
    }
  } catch (e) {
    // Some Android launchers do not support app icon badges; handle gracefully
    console.warn('Android launcher badge sync non-fatal error:', e);
  }
}
