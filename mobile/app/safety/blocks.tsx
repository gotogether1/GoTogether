import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const topInsetHeight = Math.max(insets.top + 12, 42);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Status Bar Spacer */}
      <View style={{ height: topInsetHeight }} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header Row with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Blocked Users</Text>
        </View>

        {blockedUsers.length === 0 ? (
          <EmptyState
            icon="shield-outline"
            title="No Blocked Users"
            message="Users you block will appear here. Blocked users cannot view or request your rides."
          />
        ) : (
          blockedUsers.map(b => (
            <Card key={b.id} style={{ marginBottom: Spacing.sm }}>
              <View style={styles.userRow}>
                <View style={styles.userMetaRow}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person-outline" size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <Text style={styles.userName}>{b.name}</Text>
                </View>

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
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    ...Typography.displayLg,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  userName: {
    ...Typography.headlineMd,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  unblockBtn: {
    width: 96,
    height: 38,
  },
});
