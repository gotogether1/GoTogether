import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { useRideDetailQuery, useCreateBookingMutation } from '../../src/api/hooks';
import { Colors, Spacing, Typography } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthProvider';
import { safeBack } from '../../src/utils/navigation';

export default function RideDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();

  const { data: ride, isLoading } = useRideDetailQuery((id as string) || '');
  const createBookingMutation = useCreateBookingMutation();

  const [requesting, setRequesting] = useState(false);
  const [negotiating, setNegotiating] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState('10');
  const [requestedSeats, setRequestedSeats] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const handleOpenMap = (locationName: string) => {
    if (ride) {
      router.push({
        pathname: '/ride/map',
        params: { rideId: ride.id, location: locationName },
      });
    }
  };

  const isDriver = !!user && !!ride && (user.uid === ride.driverId || `usr_${user.uid}` === ride.driverId);

  const handleBookingSubmit = async () => {
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

    if (isDriver) {
      Alert.alert('Action Restricted', 'Drivers cannot book seats on their own published ride.');
      return;
    }

    setLoading(true);
    try {
      await createBookingMutation.mutateAsync({
        rideId: ride.id,
        seatsRequested: parseInt(requestedSeats, 10) || 1,
        riderMessage: message,
      });
      setLoading(false);
      setBookingSubmitted(true);
      Alert.alert('Booking Request Sent!', 'The driver will review your request.');
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Booking Notice', err.message || 'Unable to submit booking request.');
    }
  };

  const handleNegotiateSubmit = async () => {
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

    if (isDriver) {
      Alert.alert('Action Restricted', 'Drivers cannot negotiate prices on their own published ride.');
      return;
    }

    setLoading(true);
    try {
      await createBookingMutation.mutateAsync({
        rideId: ride.id,
        seatsRequested: 1,
        negotiatedPrice: parseFloat(negotiatePrice) || 10,
        riderMessage: `Negotiated price offer: $${negotiatePrice}`,
      });
      setLoading(false);
      setNegotiating(false);
      Alert.alert('Price Offer Sent!', 'The driver has received your suggested contribution offer.');
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Negotiation Notice', err.message || 'Unable to send price offer.');
    }
  };

  const topInsetHeight = Math.max(insets.top + 12, 42);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading trip details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyCenter}>
          <EmptyState
            icon="alert-circle-outline"
            title="Ride Not Found"
            message="The requested ride details could not be found or loaded."
            actionLabel="Go Back"
            onAction={() => safeBack(router)}
          />
        </View>
      </SafeAreaView>
    );
  }

  const driverName = ride.driverName || 'Driver';
  const isOwner = !!user && !!ride && (user.uid === ride.driverId || `usr_${user.uid}` === ride.driverId);
  const driverDisplayName = isOwner ? 'You' : driverName;
  const driverRating = ride.driverRating || 5.0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Floating Back Header */}
        <View style={[styles.headerFloatingRow, { top: topInsetHeight }]}>
          <TouchableOpacity onPress={() => safeBack(router)} style={styles.backCircleBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Departure Date Header */}
        <View style={styles.titleSection}>
          <Text style={styles.departureDateText}>
            {new Date(ride.departureAt || Date.now()).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.departureTimeText}>
            Departure at {new Date(ride.departureAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Timeline Route Card */}
        <Card style={styles.timelineCard}>
          <View style={styles.timelineContainer}>
            {/* Pick-up */}
            <View style={styles.timelineNodeRow}>
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
                  <Ionicons name="location-outline" size={14} color="#0F172A" style={{ marginRight: 4 }} />
                  <Text style={styles.locationPlusCode}>{ride.meetingPoint || 'Pick-up Location'}</Text>
                </View>
              </View>
            </View>

            {/* Connecting Vertical Line */}
            <View style={styles.timelineConnectorLine} />

            {/* Drop-off */}
            <View style={styles.timelineNodeRow}>
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
          <TouchableOpacity onPress={() => router.push(`/profile/${ride.driverId}`)} style={styles.driverProfileHeader} activeOpacity={0.85}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{driverDisplayName.charAt(0)}</Text>
            </View>
            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>{driverDisplayName}</Text>
              <Text style={styles.driverRating}>★ {driverRating} / 5 • Verified Driver</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.driverDivider} />

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
          <Text style={styles.detailItem}><Text style={styles.boldText}>Rules:</Text> {ride.rules || 'Standard pooling rules'}</Text>
          <Text style={styles.detailItem}><Text style={styles.boldText}>Notes:</Text> {ride.notes || 'No extra notes'}</Text>
        </Card>

        {/* Action Area: Role-Based Branching */}
        {isDriver ? (
          <View style={styles.driverActionBar}>
            <Card style={styles.ownerCard}>
              <View style={styles.ownerRow}>
                <Ionicons name="car-outline" size={22} color={Colors.primary} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerTitle}>You are the Driver of this trip</Text>
                  <Text style={styles.ownerSubText}>Manage requests and rider bookings from your dashboard.</Text>
                </View>
              </View>
            </Card>
            <Button
              title="Manage Passengers & Requests"
              onPress={() => router.push('/(tabs)/dashboard')}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : bookingSubmitted ? (
          <View style={styles.submittedBox}>
            <Text style={styles.submittedTitle}>Request Submitted</Text>
            <Text style={styles.submittedText}>
              Your booking request has been sent to {driverName}. You will receive a notification as soon as it is confirmed.
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
    paddingHorizontal: Spacing.lg,
    paddingTop: 70,
    paddingBottom: 40,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  headerFloatingRow: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  titleSection: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  departureDateText: {
    ...Typography.headlineLg,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  departureTimeText: {
    ...Typography.bodyMd,
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
  timelineCard: {
    marginBottom: Spacing.md,
    borderRadius: 24,
    padding: Spacing.lg,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineNodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nodeCircleOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  nodeCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  locationContent: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationName: {
    ...Typography.headlineLg,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  mapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  subLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationPlusCode: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  timelineConnectorLine: {
    width: 2,
    height: 36,
    backgroundColor: Colors.primary,
    marginLeft: 10,
    marginVertical: 4,
    opacity: 0.6,
  },
  priceCard: {
    marginBottom: Spacing.md,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerCount: {
    ...Typography.labelLg,
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  priceAmount: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  driverCard: {
    marginBottom: Spacing.md,
    borderRadius: 24,
  },
  driverProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    ...Typography.headlineLg,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  driverMeta: {
    flex: 1,
  },
  driverName: {
    ...Typography.headlineLg,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  driverRating: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },
  driverDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.md,
  },
  preferencesList: {
    gap: 10,
  },
  prefItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefIcon: {
    marginRight: 10,
    width: 20,
  },
  prefText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  sectionTitle: {
    ...Typography.headlineLg,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: Spacing.sm,
  },
  detailItem: {
    ...Typography.bodyMd,
    fontSize: 13.5,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  driverActionBar: {
    marginTop: Spacing.md,
  },
  ownerCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerTitle: {
    ...Typography.headlineLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#0369A1',
  },
  ownerSubText: {
    ...Typography.bodyMd,
    fontSize: 12.5,
    color: '#0284C7',
    marginTop: 2,
  },
  bottomActionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  negotiateBtn: {
    flex: 1,
  },
  bookBtn: {
    flex: 1,
  },
  actionFormCard: {
    marginTop: Spacing.md,
  },
  cancelBtn: {
    marginTop: Spacing.sm,
  },
  submittedBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 24,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  submittedTitle: {
    ...Typography.headlineLg,
    fontSize: 18,
    fontWeight: '900',
    color: '#166534',
    marginBottom: 6,
  },
  submittedText: {
    ...Typography.bodyMd,
    fontSize: 13.5,
    color: '#15803D',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  viewBookingsBtn: {
    backgroundColor: '#166534',
  },
});
