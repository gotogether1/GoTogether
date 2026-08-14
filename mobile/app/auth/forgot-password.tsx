import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your account email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your account email to receive password reset instructions.
          </Text>
        </View>

        {sent ? (
          <View style={styles.sentCard}>
            <Text style={styles.sentIcon}>✉️</Text>
            <Text style={styles.sentTitle}>Check Your Inbox</Text>
            <Text style={styles.sentMessage}>
              If an account exists for {email}, we sent password-reset instructions to your email address.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.replace('/auth/login')}
              style={styles.backBtn}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              label="Account Email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.submitBtn}
            />

            <Button
              title="Back to Login"
              variant="outline"
              onPress={() => router.back()}
            />
          </View>
        )}
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.onBackground,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginBottom: Spacing.sm,
  },
  sentCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  sentIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  sentTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  sentMessage: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  backBtn: {
    width: '100%',
  },
});
