import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { SEED_RIDES, SEED_USERS } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function RideDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const ride = SEED_RIDES.find(r => r.id === id) || SEED_RIDES[0];
  const driver = SEED_USERS.find(u => u.uid === ride.driverId) || SEED_USERS[0];

  const [requesting, setRequesting] = useState(false);
  const [requestedSeats, setRequestedSeats] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const handleBookingSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBookingSubmitted(true);
      Alert.alert('Booking Request Sent!', 'The driver will review your request.');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Button title="← Back" variant="outline" onPress={() => router.back()} style={styles.backBtn} />
          <Badge
            label={ride.vehicleType === 'carpool' ? '🚗 Carpool' : '🚲 Bike Pool'}
            variant={ride.vehicleType === 'carpool' ? 'primary' : 'success'}
          />
        </View>

        <Card style={styles.mainCard}>
          <Text style={styles.routeHeader}>{ride.pickup} → {ride.destination}</Text>
          <Text style={styles.dateTimeText}>📅 Departure: {new Date(ride.departureAt).toLocaleString()}</Text>
          <Text style={styles.meetingText}>📍 Meeting Point: {ride.meetingPoint}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Available Seats</Text>
              <Text style={styles.infoValue}>{ride.availableSeats} / {ride.totalSeats}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Suggested Contribution</Text>
              <Text style={styles.infoValue}>
                {ride.suggestedContribution > 0 ? `\$${ride.suggestedContribution}` : 'Free'}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionHeader}>Driver Profile</Text>
          <View style={styles.driverRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{driver.displayName.charAt(0)}</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driver.displayName}</Text>
              <Text style={styles.driverCity}>{driver.city}</Text>
              <Text style={styles.driverRating}>★ {driver.averageRating} ({driver.completedRideCount} completed rides)</Text>
            </View>
          </View>
          <Text style={styles.driverBio}>"{driver.bio}"</Text>
        </Card>

        <Card>
          <Text style={styles.sectionHeader}>Vehicle & Trip Rules</Text>
          <Text style={styles.detailItem}>🚘 <Text style={styles.boldText}>Vehicle:</Text> {ride.vehicleDetails}</Text>
          <Text style={styles.detailItem}>📜 <Text style={styles.boldText}>Rules:</Text> {ride.rules}</Text>
          <Text style={styles.detailItem}>📝 <Text style={styles.boldText}>Notes:</Text> {ride.notes}</Text>
        </Card>

        {bookingSubmitted ? (
          <View style={styles.submittedBox}>
            <Text style={styles.submittedTitle}>✅ Request Pending Approval</Text>
            <Text style={styles.submittedText}>
              Your booking request for {requestedSeats} seat(s) has been sent to {driver.displayName}. You will receive a notification as soon as it is approved.
            </Text>
            <Button title="View My Bookings" onPress={() => router.push('/(tabs)/dashboard')} style={styles.viewBookingsBtn} />
          </View>
        ) : requesting ? (
          <Card style={styles.requestCard}>
            <Text style={styles.sectionHeader}>Request Seat(s)</Text>
            <Input
              label="Seats Requested (1–4)"
              value={requestedSeats}
              onChangeText={setRequestedSeats}
              keyboardType="number-pad"
            />
            <Input
              label="Note for Driver (Optional)"
              placeholder="e.g. I have a small backpack, see you at 8:00 AM."
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Button title="Confirm Booking Request" onPress={handleBookingSubmit} loading={loading} />
            <Button title="Cancel" variant="outline" onPress={() => setRequesting(false)} style={styles.cancelBtn} />
          </Card>
        ) : (
          <Button
            title="Request a Seat"
            onPress={() => setRequesting(true)}
            style={styles.requestBtn}
          />
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
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 100,
    height: 36,
  },
  mainCard: {
    backgroundColor: Colors.surface,
  },
  routeHeader: {
    ...Typography.headlineLg,
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
  },
  dateTimeText: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetingText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  infoValue: {
    ...Typography.headlineMd,
    color: Colors.primary,
    marginTop: 2,
  },
  sectionHeader: {
    ...Typography.headlineMd,
    color: Colors.onBackground,
    marginBottom: Spacing.sm,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  driverCity: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  driverRating: {
    ...Typography.labelLg,
    color: Colors.warning,
    marginTop: 2,
  },
  driverBio: {
    ...Typography.bodyMd,
    fontStyle: 'italic',
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  detailItem: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  boldText: {
    fontWeight: '700',
  },
  requestBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  requestCard: {
    marginTop: Spacing.sm,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  cancelBtn: {
    marginTop: Spacing.xs,
  },
  submittedBox: {
    backgroundColor: Colors.successContainer,
    padding: Spacing.lg,
    borderRadius: 16,
    marginVertical: Spacing.md,
  },
  submittedTitle: {
    ...Typography.headlineMd,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  submittedText: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  viewBookingsBtn: {
    backgroundColor: Colors.success,
  },
});
