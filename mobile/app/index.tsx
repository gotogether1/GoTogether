import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topInsetPadding = Math.max(insets.top, 24) + 12;
  const bottomInsetPadding = Math.max(insets.bottom, 16);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topInsetPadding, paddingBottom: bottomInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="car" size={42} color={Colors.primary} />
          </View>

          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>COMMUNITY CARPOOL & BIKE POOL</Text>
          </View>

          <Text style={styles.brandTitle}>Go Together</Text>
          <Text style={styles.tagline}>
            Connect directly with verified drivers and riders going your way. Zero booking fees.
          </Text>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconBadge}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#047857" />
            </View>
            <View style={styles.featureTextMeta}>
              <Text style={styles.featureTitle}>Verified Community</Text>
              <Text style={styles.featureSubtitle}>Real identity checks & ratings</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconBadgeBlue}>
              <Ionicons name="flash-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.featureTextMeta}>
              <Text style={styles.featureTitle}>Instant Confirmation</Text>
              <Text style={styles.featureSubtitle}>Direct chat & seat booking</Text>
            </View>
          </View>
        </View>

        {/* Bottom Production Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/auth/signup')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.guestBtnText}>Explore as Guest →</Text>
          </TouchableOpacity>

          <Text style={styles.termsFooter}>
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </Text>
        </View>
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
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  badgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: Spacing.sm,
  },
  badgeText: {
    ...Typography.labelSm,
    color: '#1E40AF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTitle: {
    ...Typography.displayLg,
    fontSize: 34,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  featuresGrid: {
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureIconBadgeBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureTextMeta: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.labelLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  featureSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  actionSection: {
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    ...Typography.labelLg,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  secondaryBtn: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  secondaryBtnText: {
    ...Typography.labelLg,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  guestBtn: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  termsFooter: {
    ...Typography.labelSm,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: 2,
  },
});
