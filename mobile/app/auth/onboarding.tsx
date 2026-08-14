import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function ProfileOnboardingScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = async () => {
    if (!displayName || !city) {
      Alert.alert('Missing Fields', 'Display name and city are required.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Profile</Text>
          <Text style={styles.subtitle}>Let fellow carpoolers know who you are</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Display Name *"
            placeholder="e.g. Alex Rivers"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Input
            label="City / Metro Area *"
            placeholder="e.g. San Francisco, CA"
            value={city}
            onChangeText={setCity}
          />

          <Input
            label="Short Bio (Optional)"
            placeholder="e.g. Daily commuter between SF and San Jose. Quiet driver, loves podcasts."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />

          <Button
            title="Complete Setup & Enter App"
            onPress={handleCompleteProfile}
            loading={loading}
            style={styles.completeBtn}
          />
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
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  completeBtn: {
    marginTop: Spacing.md,
  },
});
