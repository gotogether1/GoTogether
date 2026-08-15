import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';

import { safeBack } from '../../src/utils/navigation';

export default function SignupScreen() {
  const router = useRouter();
  const { signupWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Use at least 8 characters for your password.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(email.trim(), password);
      router.replace('/auth/onboarding');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message || 'An account already uses this email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Top Back Navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')} activeOpacity={0.8}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Go Together to share carpool & bike pool rides with zero fees.</Text>
        </View>

        <View style={styles.cardBox}>
          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onClear={() => setEmail('')}
          />

          <Input
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupBtn}
          />

          <Button
            title="Explore as Guest"
            variant="outline"
            onPress={() => router.replace('/(tabs)')}
            style={styles.guestBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.8}>
            <Text style={styles.loginLinkText}>Log In</Text>
          </TouchableOpacity>
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
    fontSize: 30,
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
  signupBtn: {
    marginTop: Spacing.md,
  },
  guestBtn: {
    marginTop: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  footerPrompt: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  loginLinkText: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '800',
  },
});
