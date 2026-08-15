import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';

import { safeBack } from '../../src/utils/navigation';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Email or password is incorrect.');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to manage your rides and connect with community travelers.</Text>
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/auth/forgot-password')} activeOpacity={0.8}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <Button
            title="Explore as Guest"
            variant="outline"
            onPress={() => router.replace('/(tabs)')}
            style={styles.guestBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.8}>
            <Text style={styles.signUpText}>Sign Up</Text>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  forgotText: {
    ...Typography.labelMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: Spacing.xs,
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
  signUpText: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '800',
  },
});
