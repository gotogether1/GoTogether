import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topInsetPadding = Math.max(insets.top, 16);
  const bottomInsetPadding = Math.max(insets.bottom, 12);

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../assets/welcome_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Soft Ambient Overlay for Optimal Contrast */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={[styles.container, { paddingTop: topInsetPadding, paddingBottom: bottomInsetPadding }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Hero Section (Sits Cleanly in Sky Region) */}
            <View style={styles.heroContainer}>
              {/* Official 4K GoTogether Logo */}
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.badgePill}>
                <Ionicons name="shield-checkmark" size={12} color="#60A5FA" style={{ marginRight: 5 }} />
                <Text style={styles.badgeText}>COMMUNITY CARPOOL & BIKE POOL</Text>
              </View>

              <Text style={styles.tagline}>
                Connect with verified commuters going your way. Zero booking fees.
              </Text>
            </View>

            {/* Bottom Glassmorphic Action Panel (Anchored cleanly at bottom) */}
            <View style={styles.actionGlassPanel}>
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
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md + 4,
    justifyContent: 'space-between',
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  logoWrapper: {
    marginBottom: 8,
  },
  logoImage: {
    width: 104,
    height: 104,
    borderRadius: 26,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 6,
  },
  badgeText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.6,
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actionGlassPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: Spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    gap: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  secondaryBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  secondaryBtnText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  guestBtn: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    ...Typography.labelLg,
    fontSize: 14,
    fontWeight: '800',
    color: '#60A5FA',
  },
  termsFooter: {
    ...Typography.labelSm,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginTop: 2,
  },
});
