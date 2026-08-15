import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { fetchWithAuth } from '../../src/api/client';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

export default function LeaveReviewScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!bookingId) {
      Alert.alert('Error', 'Missing booking identifier.');
      return;
    }
    setSubmitting(true);
    try {
      await fetchWithAuth('/v1/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: bookingId as string,
          rating,
          text: reviewText,
        }),
      });
      setSubmitting(false);
      Alert.alert(
        'Review Submitted ⭐',
        'Thank you for rating your commute experience!',
        [{ text: 'OK', onPress: () => safeBack(router) }]
      );
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Submission Failed', err.message || 'Unable to submit review to backend.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => safeBack(router)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Rate Your Trip</Text>
          <Text style={styles.subtitle}>How was your ride experience?</Text>
        </View>

        <Card>
          <Text style={styles.routeText}>Rate & review your trip experience</Text>

          <Text style={styles.starsLabel}>Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Text style={[styles.starIcon, star <= rating && styles.activeStar]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Write a Review (Optional)"
            placeholder="Punctual driver, smooth driving, friendly chat..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            style={styles.reviewInput}
          />

          <Button title="Submit Review" onPress={handleSubmitReview} loading={submitting} style={styles.submitBtn} />
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
  backBtn: {
    marginBottom: Spacing.xs,
  },
  backText: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.onBackground,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  routeText: {
    ...Typography.headlineMd,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  starsLabel: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  starIcon: {
    fontSize: 36,
    color: Colors.surfaceContainer,
  },
  activeStar: {
    color: Colors.warning,
  },
  reviewInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
});
