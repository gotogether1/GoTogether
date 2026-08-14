import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { Colors, Spacing, Typography } from '../src/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.icon}>🧭</Text>
        <Text style={styles.title}>404 — Page Not Found</Text>
        <Text style={styles.subtitle}>
          The screen or destination you are looking for does not exist or has been moved.
        </Text>

        <Button
          title="Return to Home Screen"
          onPress={() => router.replace('/(tabs)')}
          style={styles.homeBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  homeBtn: {
    width: '100%',
    maxWidth: 280,
  },
});
