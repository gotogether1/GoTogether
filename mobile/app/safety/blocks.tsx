import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'block_1', uid: 'blocked_user_99', name: 'Spam User' },
  ]);

  const handleUnblock = (id: string, name: string) => {
    Alert.alert('Unblock User', `Are you sure you want to unblock ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: () => setBlockedUsers(prev => prev.filter(b => b.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Blocked Users</Text>
        </View>

        {blockedUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛡️</Text>
            <Text style={styles.emptyTitle}>No Blocked Users</Text>
            <Text style={styles.emptySubtitle}>Users you block will appear here. Blocked users cannot view or request your rides.</Text>
          </View>
        ) : (
          blockedUsers.map(b => (
            <Card key={b.id}>
              <View style={styles.userRow}>
                <Text style={styles.userName}>{b.name}</Text>
                <Button
                  title="Unblock"
                  variant="outline"
                  onPress={() => handleUnblock(b.id, b.name)}
                  style={styles.unblockBtn}
                />
              </View>
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
  header: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  backBtn: {
    marginBottom: Spacing.xs,
  },
  backText: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.onBackground,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  unblockBtn: {
    width: 100,
    height: 36,
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
