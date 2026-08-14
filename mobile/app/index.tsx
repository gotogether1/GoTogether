import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { Colors, Spacing, Typography } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>🚗 🚲</Text>
          </View>
          <Text style={styles.appName}>Go Together</Text>
          <Text style={styles.tagline}>Modern, Community-Driven Carpool & Bike Pool</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Effortless Travel Sharing</Text>
          <Text style={styles.heroDescription}>
            Connect directly with verified drivers and riders going your way. No booking fees or hidden charges.
          </Text>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ℹ️ This app helps users coordinate ride sharing. It does not process payments or guarantee rides.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Create Account"
            onPress={() => router.push('/auth/signup')}
            style={styles.primaryBtn}
          />
          <Button
            title="Log In"
            variant="outline"
            onPress={() => router.push('/auth/login')}
            style={styles.secondaryBtn}
          />
          <Button
            title="Explore Demo App"
            variant="secondary"
            onPress={() => router.push('/(tabs)')}
            style={styles.demoBtn}
          />
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Use, Privacy Notice, and Safety Rules.
        </Text>
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
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoBadgeText: {
    fontSize: 28,
  },
  appName: {
    ...Typography.displayLg,
    color: Colors.onBackground,
    textAlign: 'center',
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  heroTitle: {
    ...Typography.headlineMd,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  heroDescription: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  disclaimerBox: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  disclaimerText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  actionContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryBtn: {
    marginBottom: 4,
  },
  secondaryBtn: {
    marginBottom: 4,
  },
  demoBtn: {
    marginTop: 4,
  },
  footerText: {
    ...Typography.labelSm,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
