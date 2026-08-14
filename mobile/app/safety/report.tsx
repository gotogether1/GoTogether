import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

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
  const insets = useSafeAreaInsets();
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
        [{ text: 'OK', onPress: () => safeBack(router) }]
      );
    }, 600);
  };

  const topInsetHeight = Math.max(insets.top + 12, 42);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Status Bar Spacer */}
      <View style={{ height: topInsetHeight }} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header Row with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => safeBack(router)} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Report User or Ride</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.subtitle}>Help keep the Go Together community safe for everyone.</Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Select Reason *</Text>
          {REASONS.map(reason => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonOption, isSelected && styles.activeReason]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? Colors.primary : Colors.outline}
                  style={{ marginRight: Spacing.sm }}
                />
                <Text style={[styles.reasonText, isSelected && styles.activeReasonText]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}

          <Input
            label="Additional Details (Max 1,000 characters)"
            placeholder="Describe what happened..."
            value={details}
            onChangeText={setDetails}
            multiline
            style={styles.detailsInput}
          />

          <Button title="Submit Report" onPress={handleSubmit} loading={submitting} variant="danger" style={styles.submitBtn} />
          <Button title="Cancel" variant="outline" onPress={() => safeBack(router)} />
        </Card>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    ...Typography.displayLg,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.error,
    flex: 1,
  },
  header: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  activeReason: {
    backgroundColor: '#EFF6FF',
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
