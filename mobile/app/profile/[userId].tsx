import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { SEED_USERS } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

import { safeBack } from '../../src/utils/navigation';

export default function PublicProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const user = SEED_USERS.find(u => u.uid === userId) || SEED_USERS[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => safeBack(router)} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

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
              <Text style={styles.statLbl}>Completed Rides</Text>
            </View>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Safety Actions</Text>
          <Button
            title="⚠️ Report User"
            variant="danger"
            onPress={() => router.push('/safety/report')}
            style={styles.actionBtn}
          />
        </Card>
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
  backBtn: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  backText: {
    ...Typography.labelLg,
    color: Colors.primary,
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
  actionBtn: {
    marginTop: Spacing.xs,
  },
});
