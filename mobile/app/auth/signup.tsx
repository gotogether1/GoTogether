import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }
    if (!agreedTerms) {
      Alert.alert('Terms Agreement Required', 'You must agree to the Terms of Use, Privacy Notice, and Safety Rules.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/auth/onboarding');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Go Together to share carpool & bike pool rides</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name *"
            placeholder="e.g. Alex Rivers"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email Address *"
            placeholder="e.g. alex@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password *"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Confirm Password *"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedTerms(!agreedTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
              {agreedTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the Terms of Use, Privacy Notice, and Safety Rules.
            </Text>
          </TouchableOpacity>

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupBtn}
          />

          <Button
            title="Continue with Google"
            variant="outline"
            onPress={handleSignup}
            style={styles.googleBtn}
          />

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginHighlight}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: Spacing.lg,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  signupBtn: {
    marginBottom: Spacing.sm,
  },
  googleBtn: {
    marginBottom: Spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  loginLinkText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  loginHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
