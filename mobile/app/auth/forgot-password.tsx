import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/auth/login')} activeOpacity={0.8}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your account email to receive a password reset link.</Text>
        </View>

        {submitted ? (
          <View style={styles.cardBox}>
            <Text style={styles.successTitle}>Reset Email Sent</Text>
            <Text style={styles.successBody}>
              We sent instructions to <Text style={{ fontWeight: '700' }}>{email}</Text>. Please check your inbox.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.replace('/auth/login')}
              style={styles.submitBtn}
            />
          </View>
        ) : (
          <View style={styles.cardBox}>
            <Input
              label="Email Address"
              placeholder="name@example.com"
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
              onPress={() => safeBack(router, '/auth/login')}
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
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: Spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backBtn: {
    marginBottom: Spacing.md,
  },
  backIcon: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '700',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.displayLg,
    fontSize: 28,
    color: Colors.onBackground,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  cardBox: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  submitBtn: {
    marginVertical: Spacing.sm,
  },
  successTitle: {
    ...Typography.headlineLg,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  successBody: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
});
