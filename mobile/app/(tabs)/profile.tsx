import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthProvider';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest User';
  const email = user?.email || 'Log in to view account details';

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Go Together?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const topInsetPadding = Math.max(insets.top, 24) + 12;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={[styles.avatarCircle, !isLoggedIn && styles.guestAvatarCircle]}>
            {isLoggedIn ? (
              <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            ) : (
              <Ionicons name="person-outline" size={36} color="#64748B" />
            )}
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          {isLoggedIn ? (
            <View style={styles.verificationBadge}>
              <Ionicons name="shield-checkmark-outline" size={15} color="#047857" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Verified Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginPillBtn}
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.loginPillText}>Log In or Sign Up</Text>
            </TouchableOpacity>
          )}

          {isLoggedIn && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>★ 5.0</Text>
                <Text style={styles.statLbl}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>12</Text>
                <Text style={styles.statLbl}>Rides Completed</Text>
              </View>
            </View>
          )}
        </View>

        {/* Grouped Settings Menu */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Account & Profile</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => (isLoggedIn ? router.push('/auth/onboarding') : router.push('/auth/login'))}
          >
            <View style={styles.menuLabelGroup}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Edit Profile Info</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => (isLoggedIn ? router.push('/safety/blocks') : router.push('/auth/login'))}
          >
            <View style={styles.menuLabelGroup}>
              <Ionicons name="shield-outline" size={20} color={Colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Blocked Users & Safety</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => (isLoggedIn ? router.push('/safety/report') : router.push('/auth/login'))}
          >
            <View style={styles.menuLabelGroup}>
              <Ionicons name="warning-outline" size={20} color={Colors.warning} style={styles.menuIcon} />
              <Text style={styles.menuText}>Report an Issue</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItemLast}
            onPress={() => Alert.alert('Safety Guidelines', 'Go Together uses real identity checks. Always verify driver and vehicle details before entering.')}
          >
            <View style={styles.menuLabelGroup}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Community Safety Guidelines</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {isLoggedIn ? (
          <Button title="Log Out" variant="outline" onPress={handleLogout} style={styles.logoutBtn} />
        ) : (
          <Button title="Log In / Register" onPress={() => router.push('/auth/login')} style={styles.logoutBtn} />
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
  profileHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  guestAvatarCircle: {
    backgroundColor: '#F1F5F9',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  userName: {
    ...Typography.headlineLg,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  userEmail: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    ...Typography.labelSm,
    color: '#047857',
    fontWeight: '700',
  },
  loginPillBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  loginPillText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  statVal: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLbl: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: Spacing.sm,
  },
  menuText: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  chevron: {
    fontSize: 20,
    color: Colors.outline,
  },
  logoutBtn: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
});
