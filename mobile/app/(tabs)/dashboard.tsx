import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { SEED_BOOKINGS, DemoBooking } from '../../src/demo/seedData';
import { useMyRidesQuery } from '../../src/api/hooks';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'requests' | 'offers' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<DemoBooking[]>(SEED_BOOKINGS);

  const { data: rawMyRides = [] } = useMyRidesQuery();

  // Strictly filter My Rides by authenticated user UID
  const myRides = user?.uid ? rawMyRides.filter((r: any) => r.driverId === user.uid || r.driverId === `usr_${user.uid}`) : rawMyRides;

  const handleApprove = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
    Alert.alert('Booking Approved!', 'Direct chat with the rider is now unlocked.');
  };

  const handleReject = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));
    Alert.alert('Booking Rejected', 'The rider has been notified.');
  };

  const upcomingBookings = bookings.filter(b => b.status === 'approved');
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const activeCount = upcomingBookings.length + myRides.filter((r: any) => r.status === 'published' || r.status === 'active').length;
  const completedCount = pastBookings.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>My Rides</Text>

        {/* Top Summary Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active Ride</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Rides Completed</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              Requests {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'offers' && styles.tabActive]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
              Published {myRides.length > 0 ? `(${myRides.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'past' && styles.tabActive]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: UPCOMING BOOKED TRIPS */}
        {activeTab === 'upcoming' && (
          <View>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                title="No Upcoming Trips"
                message="You haven't booked any rides yet. Search for a route to find a pooler!"
                actionLabel="Find a Ride"
                onAction={() => router.push('/(tabs)/find')}
              />
            ) : (
              upcomingBookings.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/ride/${b.rideId}`)}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeApproved}>
                      <Text style={styles.badgeApprovedText}>CONFIRMED</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(b.departureAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.routeText}>{b.pickup} → {b.destination}</Text>
                  <Text style={styles.subText}>Driver: {b.driverName} • {b.seatsRequested} seat(s)</Text>

                  <View style={styles.actionRow}>
                    <Button
                      title="Chat with Driver"
                      variant="secondary"
                      onPress={() => router.push(`/chat/${b.id}`)}
                      style={styles.actionBtn}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 2: PENDING BOOKING REQUESTS (FOR DRIVERS) */}
        {activeTab === 'requests' && (
          <View>
            {pendingRequests.length === 0 ? (
              <EmptyState
                title="No Pending Requests"
                message="When passengers request to join your offered pool, their requests will show here."
              />
            ) : (
              pendingRequests.map(b => (
                <View key={b.id} style={styles.cardItem}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badgePending}>
                      <Text style={styles.badgePendingText}>PENDING REQUEST</Text>
                    </View>
                    <Text style={styles.dateText}>{b.seatsRequested} seat(s)</Text>
                  </View>

                  <Text style={styles.routeText}>{b.riderName} wants to join</Text>
                  <Text style={styles.subText}>Route: {b.pickup} → {b.destination}</Text>
                  {b.riderMessage ? (
                    <Text style={styles.noteText}>"{b.riderMessage}"</Text>
                  ) : null}

                  <View style={styles.actionRow}>
                    <Button
                      title="Reject"
                      variant="outline"
                      onPress={() => handleReject(b.id)}
                      style={styles.halfBtn}
                    />
                    <Button
                      title="Approve Request"
                      onPress={() => handleApprove(b.id)}
                      style={styles.halfBtn}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: DRIVER'S OWN OFFERED RIDES */}
        {activeTab === 'offers' && (
          <View>
            {myRides.length === 0 ? (
              <EmptyState
                title="No Published Rides"
                message="Offer a ride to start carpooling or bike pooling with verified commuters!"
                actionLabel="Publish a Ride"
                onAction={() => router.push('/(tabs)/offer')}
              />
            ) : (
              myRides.map((r: any) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/ride/${r.id}`)}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{(r.vehicleType || 'carpool').toUpperCase()}</Text>
                    </View>
                    <Text style={styles.dateText}>{r.availableSeats} of {r.totalSeats} seats open</Text>
                  </View>
                  <Text style={styles.routeText}>{r.pickup} → {r.destination}</Text>
                  <Text style={styles.subText}>Departure: {new Date(r.departureAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  
                  {(r.status === 'published' || r.status === 'active') && (
                    <View style={styles.actionRow}>
                      <Button
                        title="Mark Complete"
                        variant="secondary"
                        onPress={async () => {
                          try {
                            const { fetchWithAuth } = require('../../src/api/client');
                            await fetchWithAuth(`/v1/rides/${r.id}/complete`, { method: 'POST' });
                            Alert.alert('Ride Completed! ⭐', 'Your ride has been marked as completed.');
                          } catch (err: any) {
                            Alert.alert('Error', err.message || 'Unable to complete ride');
                          }
                        }}
                        style={{ marginTop: 8 }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 4: PAST RIDES */}
        {activeTab === 'past' && (
          <View>
            {pastBookings.length === 0 ? (
              <EmptyState
                title="No Past Rides"
                message="Your completed and past trip history will show up here."
              />
            ) : (
              pastBookings.map(b => (
                <View key={b.id} style={styles.cardItem}>
                  <Text style={styles.routeText}>{b.pickup} → {b.destination}</Text>
                  <Text style={styles.subText}>Status: {b.status.toUpperCase()}</Text>
                </View>
              ))
            )}
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
    paddingBottom: Spacing.xxl,
  },
  pageTitle: {
    ...Typography.headlineLg,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumber: {
    ...Typography.headlineLg,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    ...Typography.labelLg,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    ...Typography.labelLg,
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '800',
  },
  badgeApproved: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeApprovedText: {
    ...Typography.labelLg,
    fontSize: 11,
    color: '#15803D',
    fontWeight: '800',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePendingText: {
    ...Typography.labelLg,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '800',
  },
  dateText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  routeText: {
    ...Typography.headlineLg,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  noteText: {
    ...Typography.bodyMd,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  actionBtn: {
    height: 42,
  },
  halfBtn: {
    flex: 1,
    height: 42,
  },
});
