import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topInsetPadding = Math.max(insets.top, 24) + 8;
  const bottomInsetPadding = Math.max(insets.bottom, 16);

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../assets/welcome_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Soft Ambient Overlay */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={[styles.container, { paddingTop: topInsetPadding, paddingBottom: bottomInsetPadding }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Hero Section */}
            <View style={styles.heroContainer}>
              {/* Official 4K GoTogether Logo (No White Border) */}
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.badgePill}>
                <Ionicons name="shield-checkmark" size={12} color="#60A5FA" style={{ marginRight: 6 }} />
                <Text style={styles.badgeText}>COMMUNITY CARPOOL & BIKE POOL</Text>
              </View>

              <Text style={styles.tagline}>
                Connect directly with verified drivers and riders going your way. Zero booking fees.
              </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
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
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
    marginBottom: Spacing.md,
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 36,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    marginBottom: Spacing.md,
  },
  badgeText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.8,
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    ...Typography.bodyLg,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    height: 52,
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  termsFooter: {
    ...Typography.labelSm,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
