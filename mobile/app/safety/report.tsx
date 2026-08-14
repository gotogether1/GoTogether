import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Colors, Spacing, Typography } from '../../src/theme';

const REASONS = [
  'Unsafe behavior or driving',
  'Harassment or discrimination',
  'Spam or scam',
  'Incorrect ride information',
  'Inappropriate content',
  'Other',
];

export default function ReportScreen() {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting. Your report has been securely submitted to moderation.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Report User or Ride</Text>
          <Text style={styles.subtitle}>Help keep the Go Together community safe for everyone.</Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Select Reason *</Text>
          {REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonOption, selectedReason === reason && styles.activeReason]}
              onPress={() => setSelectedReason(reason)}
            >
              <Text style={[styles.reasonText, selectedReason === reason && styles.activeReasonText]}>
                {selectedReason === reason ? '🔘' : '⚪'} {reason}
              </Text>
            </TouchableOpacity>
          ))}

          <Input
            label="Additional Details (Max 1,000 characters)"
            placeholder="Describe what happened..."
            value={details}
            onChangeText={setDetails}
            multiline
            style={styles.detailsInput}
          />

          <Button title="Submit Report" onPress={handleSubmit} loading={submitting} variant="danger" style={styles.submitBtn} />
          <Button title="Cancel" variant="outline" onPress={() => router.back()} />
        </Card>
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
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.error,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  reasonOption: {
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  activeReason: {
    backgroundColor: Colors.primaryContainer + '30',
  },
  reasonText: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
  },
  activeReasonText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  detailsInput: {
    height: 100,
    marginTop: Spacing.md,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
});
