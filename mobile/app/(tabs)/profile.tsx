import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { SEED_USERS } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = SEED_USERS[0];

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{user.displayName.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userCity}>📍 {user.city}</Text>
          <Text style={styles.userBio}>"{user.bio}"</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>★ {user.averageRating}</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.completedRideCount}</Text>
              <Text style={styles.statLbl}>Rides</Text>
            </View>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Account & Settings</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/auth/onboarding')}>
            <Text style={styles.menuText}>✏️ Edit Profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/safety/blocks')}>
            <Text style={styles.menuText}>🛡️ Blocked Users</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/safety/report')}>
            <Text style={styles.menuText}>⚠️ Report an Issue</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Safety Rules', 'Always meet in public places and verify driver/vehicle details before entering.')}>
            <Text style={styles.menuText}>ℹ️ Safety Guidance & Rules</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        <Button title="Log Out" variant="outline" onPress={handleLogout} style={styles.logoutBtn} />
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
  profileHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  userName: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  userCity: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  userBio: {
    ...Typography.bodyMd,
    fontStyle: 'italic',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.surfaceContainer,
  },
  statVal: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  statLbl: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  menuText: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
  },
  chevron: {
    fontSize: 20,
    color: Colors.outline,
  },
  logoutBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
});
