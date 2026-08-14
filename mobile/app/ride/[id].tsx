import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { SEED_RIDES, SEED_USERS } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthProvider';

export default function RideDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const ride = SEED_RIDES.find(r => r.id === id) || SEED_RIDES[0];
  const driver = SEED_USERS.find(u => u.uid === ride.driverId) || SEED_USERS[0];

  const [requesting, setRequesting] = useState(false);
  const [negotiating, setNegotiating] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState(ride.suggestedContribution ? `${ride.suggestedContribution}` : '10');
  const [requestedSeats, setRequestedSeats] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const handleOpenMap = (locationName: string) => {
    router.push({
      pathname: '/ride/map',
      params: { rideId: ride.id, location: locationName },
    });
  };

  const handleBookingSubmit = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in or create an account to book a seat.',
        [
          { text: 'Log In', onPress: () => router.push('/auth/login') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBookingSubmitted(true);
      Alert.alert('Booking Request Sent!', 'The driver will review your request.');
    }, 600);
  };

  const handleNegotiateSubmit = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in or create an account to propose a price offer.',
        [
          { text: 'Log In', onPress: () => router.push('/auth/login') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNegotiating(false);
      setBookingSubmitted(true);
      Alert.alert('Negotiated Offer Sent!', `Sent price offer of $${negotiatePrice} to ${driver.displayName}.`);
    }, 600);
  };

  const topInsetHeight = Math.max(insets.top + 12, 42);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Status Bar Spacer */}
      <View style={{ height: topInsetHeight }} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Ride Details</Text>
          <Badge
            label={ride.vehicleType === 'carpool' ? 'Carpool' : 'Bike Pool'}
            variant={ride.vehicleType === 'carpool' ? 'primary' : 'success'}
          />
        </View>

        {/* Departure Date Header */}
        <Text style={styles.dateHeader}>
          {new Date(ride.departureAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {/* Vertical Timeline Card */}
        <Card style={styles.timelineCard}>
          <View style={styles.timelineContainer}>
            {/* Timeline Line */}
            <View style={styles.timelineLine} />

            {/* Pickup Node */}
            <View style={styles.timelineRow}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>22:00</Text>
                <Text style={styles.durationText}>3h 30m</Text>
              </View>

              <View style={styles.nodeCircleOuter}>
                <View style={styles.nodeCircleInner} />
              </View>

              <View style={styles.locationContent}>
                <View style={styles.locationTitleRow}>
                  <Text style={styles.locationName}>{ride.pickup}</Text>
                  <TouchableOpacity onPress={() => handleOpenMap(ride.pickup)} style={styles.mapBtn} activeOpacity={0.7}>
                    <Ionicons name="map-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.subLocRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.locationPlusCode}>{ride.meetingPoint}</Text>
                </View>
              </View>
            </View>

            {/* Destination Node */}
            <View style={styles.timelineRow}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>01:30 <Text style={styles.plusOne}>+1</Text></Text>
              </View>

              <View style={styles.nodeCircleOuter}>
                <View style={styles.nodeCircleInner} />
              </View>

              <View style={styles.locationContent}>
                <View style={styles.locationTitleRow}>
                  <Text style={styles.locationName}>{ride.destination}</Text>
                  <TouchableOpacity onPress={() => handleOpenMap(ride.destination)} style={styles.mapBtn} activeOpacity={0.7}>
                    <Ionicons name="map-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.subLocRow}>
                  <Ionicons name="flag-outline" size={14} color="#0F172A" style={{ marginRight: 4 }} />
                  <Text style={styles.locationPlusCode}>Drop-off location</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Price & Passenger Bar */}
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.passengerCount}>1 passenger ({ride.availableSeats} seats left)</Text>
            <Text style={styles.priceAmount}>
              {ride.suggestedContribution > 0 ? `$${ride.suggestedContribution}` : 'Free'}
            </Text>
          </View>
        </Card>

        {/* Driver Trust Profile & Preferences Card */}
        <Card style={styles.driverCard}>
          <TouchableOpacity onPress={() => router.push(`/profile/${driver.uid}`)} style={styles.driverProfileHeader} activeOpacity={0.85}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{driver.displayName.charAt(0)}</Text>
            </View>
            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>{driver.displayName}</Text>
              <Text style={styles.driverRating}>★ {driver.averageRating} / 5 • {driver.completedRideCount} rides</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.driverDivider} />

          {/* Verification & Preferences Badges */}
          <View style={styles.preferencesList}>
            <View style={styles.prefItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#047857" style={styles.prefIcon} />
              <Text style={styles.prefText}>Verified Community Profile</Text>
            </View>

            <View style={styles.prefItem}>
              <Ionicons name="flash-outline" size={18} color={Colors.primary} style={styles.prefIcon} />
              <Text style={styles.prefText}>Your booking request will be confirmed instantly</Text>
            </View>

            <View style={styles.prefItem}>
              <Ionicons name="close-circle-outline" size={18} color={Colors.error} style={styles.prefIcon} />
              <Text style={styles.prefText}>No smoking inside vehicle</Text>
            </View>

            <View style={styles.prefItem}>
              <Ionicons name="briefcase-outline" size={18} color={Colors.primary} style={styles.prefIcon} />
              <Text style={styles.prefText}>Small luggage permitted</Text>
            </View>
          </View>
        </Card>

        {/* Vehicle & Trip Rules */}
        <Card>
          <Text style={styles.sectionTitle}>Vehicle & Trip Rules</Text>
          <Text style={styles.detailItem}><Text style={styles.boldText}>Vehicle:</Text> {ride.vehicleDetails}</Text>
          <Text style={styles.detailItem}><Text style={styles.boldText}>Rules:</Text> {ride.rules}</Text>
          <Text style={styles.detailItem}><Text style={styles.boldText}>Notes:</Text> {ride.notes}</Text>
        </Card>

        {/* Request / Negotiate Modals or Actions */}
        {bookingSubmitted ? (
          <View style={styles.submittedBox}>
            <Text style={styles.submittedTitle}>Request Submitted</Text>
            <Text style={styles.submittedText}>
              Your booking request has been sent to {driver.displayName}. You will receive a notification as soon as it is confirmed.
            </Text>
            <Button title="View My Bookings" onPress={() => router.push('/(tabs)/dashboard')} style={styles.viewBookingsBtn} />
          </View>
        ) : negotiating ? (
          <Card style={styles.actionFormCard}>
            <Text style={styles.sectionTitle}>Propose Price Offer</Text>
            <Input
              label="Suggested Contribution ($)"
              value={negotiatePrice}
              onChangeText={setNegotiatePrice}
              keyboardType="number-pad"
            />
            <Button title="Send Price Offer" onPress={handleNegotiateSubmit} loading={loading} />
            <Button title="Cancel" variant="outline" onPress={() => setNegotiating(false)} style={styles.cancelBtn} />
          </Card>
        ) : requesting ? (
          <Card style={styles.actionFormCard}>
            <Text style={styles.sectionTitle}>Request Seat(s)</Text>
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
          <View style={styles.bottomActionBar}>
            <Button
              title="Negotiate"
              variant="outline"
              onPress={() => setNegotiating(true)}
              style={styles.negotiateBtn}
            />
            <Button
              title="Book Seat"
              onPress={() => setRequesting(true)}
              style={styles.bookBtn}
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2.5,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    ...Typography.headlineLg,
    color: Colors.onBackground,
    flex: 1,
  },
  dateHeader: {
    ...Typography.displayLg,
    fontSize: 26,
    color: Colors.onBackground,
    marginVertical: Spacing.xs,
  },
  timelineCard: {
    marginVertical: Spacing.xs,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 80,
    top: 24,
    bottom: 24,
    width: 3,
    backgroundColor: Colors.primary,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: Spacing.sm,
  },
  timeBox: {
    width: 70,
  },
  timeText: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  durationText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  plusOne: {
    fontSize: 12,
    color: Colors.primary,
  },
  nodeCircleOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  nodeCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  locationContent: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationName: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  mapBtn: {
    padding: 2,
  },
  subLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationPlusCode: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  priceCard: {
    marginVertical: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerCount: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  priceAmount: {
    ...Typography.displayLg,
    color: Colors.primary,
  },
  driverCard: {
    marginVertical: Spacing.xs,
  },
  driverProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  driverMeta: {
    flex: 1,
  },
  driverName: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  driverRating: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.outline,
  },
  driverDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.md,
  },
  preferencesList: {
    gap: Spacing.sm,
  },
  prefItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefIcon: {
    marginRight: Spacing.sm,
  },
  prefText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Colors.onBackground,
    marginBottom: Spacing.sm,
    fontWeight: '800',
  },
  detailItem: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  boldText: {
    fontWeight: '700',
  },
  bottomActionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
    paddingBottom: Spacing.md,
  },
  negotiateBtn: {
    flex: 1,
  },
  bookBtn: {
    flex: 1.5,
  },
  actionFormCard: {
    marginVertical: Spacing.md,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  cancelBtn: {
    marginTop: Spacing.xs,
  },
  submittedBox: {
    backgroundColor: '#ECFDF5',
    padding: Spacing.lg,
    borderRadius: 16,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  submittedTitle: {
    ...Typography.headlineMd,
    color: '#047857',
    marginBottom: Spacing.xs,
    fontWeight: '800',
  },
  submittedText: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  viewBookingsBtn: {
    backgroundColor: '#047857',
  },
});
