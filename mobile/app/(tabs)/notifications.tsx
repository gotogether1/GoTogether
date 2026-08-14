import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { SEED_NOTIFICATIONS, DemoNotification } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();
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
      <ScrollView contentContainerStyle={styles.container}>
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You are all caught up! Updates about your rides will appear here.</Text>
          </View>
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
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.md,
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
    color: Colors.onBackground,
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
  },
  unreadCard: {
    backgroundColor: Colors.primaryContainer + '30',
    borderColor: Colors.primary,
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
  },
  notifBody: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
});
