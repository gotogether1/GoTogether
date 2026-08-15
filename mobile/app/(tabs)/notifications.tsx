import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { SEED_NOTIFICATIONS, DemoNotification } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<DemoNotification[]>(SEED_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationPress = (notif: DemoNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.targetType === 'booking') {
      router.push('/(tabs)/dashboard');
    } else if (notif.targetType === 'conversation') {
      router.push(`/chat/${notif.targetId}`);
    } else if (notif.targetType === 'ride') {
      router.push(`/ride/${notif.targetId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.pageTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No Notifications"
            message="You are all caught up! Updates about your rides will appear here."
          />
        ) : (
          notifications.map(n => (
            <Card
              key={n.id}
              onPress={() => handleNotificationPress(n)}
              style={!n.read ? styles.unreadCard : undefined}
            >
              <View style={styles.cardHeader}>
                <Badge label={n.type.replace('_', ' ').toUpperCase()} variant={!n.read ? 'primary' : 'outline'} />
                <Text style={styles.timeText}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.body}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pageTitle: {
    ...Typography.displayLg,
    fontSize: 28,
    color: Colors.onBackground,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    color: Colors.onError,
    fontSize: 12,
    fontWeight: '700',
  },
  markReadText: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '700',
  },
  unreadCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  notifTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginTop: 4,
    fontWeight: '700',
  },
  notifBody: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
