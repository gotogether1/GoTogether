import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
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
    <View style={styles.root}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Soft Aesthetic Ambient Gradient Overlay */}
        <View style={styles.overlay} />

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

            {/* Featured Scenario Showcase Card: Bike Pool with Helmets */}
            <View style={styles.scenarioCard}>
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80' }}
                style={styles.scenarioImage}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={styles.scenarioOverlay}>
                  <View style={styles.scenarioBadge}>
                    <Ionicons name="bicycle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.scenarioBadgeText}>BIKE POOL SCENARIO</Text>
                  </View>
                  <Text style={styles.scenarioTitle}>Travel Together & Share Costs</Text>
                  <Text style={styles.scenarioSubtitle}>
                    Verified riders wearing safety helmets, enjoying the ride & splitting fuel costs.
                  </Text>
                </View>
              </ImageBackground>
            </View>

            {/* Feature Cards Grid (Glassmorphism) */}
            <View style={styles.featuresGrid}>
              <View style={styles.glassFeatureCard}>
                <View style={styles.featureIconBadge}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#047857" />
                </View>
                <View style={styles.featureTextMeta}>
                  <Text style={styles.featureTitle}>Verified Community</Text>
                  <Text style={styles.featureSubtitle}>Real identity checks & ratings</Text>
                </View>
              </View>

              <View style={styles.glassFeatureCard}>
                <View style={styles.featureIconBadgeBlue}>
                  <Ionicons name="flash-outline" size={22} color={Colors.primary} />
                </View>
                <View style={styles.featureTextMeta}>
                  <Text style={styles.featureTitle}>Instant Confirmation</Text>
                  <Text style={styles.featureSubtitle}>Direct chat & seat booking</Text>
                </View>
              </View>
            </View>

            {/* Bottom Action Buttons */}
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: Spacing.xs,
  },
  badgeText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandTitle: {
    ...Typography.displayLg,
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    ...Typography.bodyMd,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scenarioCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scenarioImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scenarioOverlay: {
    padding: Spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
  scenarioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  scenarioBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scenarioTitle: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scenarioSubtitle: {
    ...Typography.labelSm,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  featuresGrid: {
    gap: Spacing.xs + 2,
    marginVertical: Spacing.xs,
  },
  glassFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: Spacing.sm + 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  featureIconBadgeBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  featureTextMeta: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.labelLg,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  featureSubtitle: {
    ...Typography.labelSm,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  actionSection: {
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs,
  },
  primaryBtn: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  secondaryBtnText: {
    ...Typography.labelLg,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  guestBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#60A5FA',
  },
  termsFooter: {
    ...Typography.labelSm,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginTop: 2,
  },
});
