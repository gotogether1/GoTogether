import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { SEED_BOOKINGS, SEED_RIDES, DemoBooking } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'requests' | 'offers' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<DemoBooking[]>(SEED_BOOKINGS);

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

  const activeCount = upcomingBookings.length + SEED_RIDES.filter(r => r.status === 'published').length;
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
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>★ --</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Segmented Tab Filter */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'upcoming' && styles.segmentActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'upcoming' && styles.segmentTextActive]}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'requests' && styles.segmentActive]}
            onPress={() => setActiveTab('requests')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'offers' && styles.segmentActive]}
            onPress={() => setActiveTab('offers')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'offers' && styles.segmentTextActive]}>Published</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'past' && styles.segmentActive]}
            onPress={() => setActiveTab('past')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'past' && styles.segmentTextActive]}>Past</Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: UPCOMING APPROVED BOOKINGS */}
        {activeTab === 'upcoming' && (
          <View>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                title="No Upcoming Rides"
                message="You don't have any confirmed rides right now. Search for rides or publish one!"
                actionLabel="Publish Ride"
                onAction={() => router.push('/(tabs)/offer')}
              />
            ) : (
              upcomingBookings.map(b => (
                <View key={b.id} style={styles.cardItem}>
                  <View style={styles.cardHeader}>
                    <View style={styles.approvedBadge}>
                      <Text style={styles.approvedBadgeText}>CONFIRMED</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(b.departureAt).toLocaleDateString()}</Text>
                  </View>

                  <Text style={styles.routeText}>{b.pickup} → {b.destination}</Text>
                  <Text style={styles.subText}>Driver: {b.driverName} • 1 seat approved</Text>

                  <Button
                    title="Chat with Driver"
                    onPress={() => router.push(`/chat/${b.id}`)}
                    style={styles.chatBtn}
                  />
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: PENDING PASSENGER REQUESTS */}
        {activeTab === 'requests' && (
          <View>
            {bookings.length === 0 ? (
              <EmptyState
                title="No Booking Requests"
                message="No passengers have requested seats yet. Published rides will appear here."
              />
            ) : (
              bookings.map(b => (
                <View key={b.id} style={styles.cardItem}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.statusPill,
                        b.status === 'approved' && styles.approvedPill,
                        b.status === 'pending' && styles.pendingPill,
                        b.status === 'rejected' && styles.rejectedPill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          b.status === 'approved' && styles.approvedPillText,
                          b.status === 'pending' && styles.pendingPillText,
                          b.status === 'rejected' && styles.rejectedPillText,
                        ]}
                      >
                        {b.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{b.seatsRequested} seat(s) requested</Text>
                  </View>

                  <Text style={styles.routeText}>{b.pickup} → {b.destination}</Text>
                  <Text style={styles.subText}>Rider: {b.riderName}</Text>
                  {b.riderMessage ? <Text style={styles.riderMsg}>"{b.riderMessage}"</Text> : null}

                  {b.status === 'pending' && (
                    <View style={styles.actionBtns}>
                      <Button title="Approve" onPress={() => handleApprove(b.id)} style={styles.approveBtn} />
                      <Button title="Reject" variant="danger" onPress={() => handleReject(b.id)} style={styles.rejectBtn} />
                    </View>
                  )}

                  {b.status === 'approved' && (
                    <Button
                      title="Chat with Rider"
                      onPress={() => router.push(`/chat/${b.id}`)}
                      style={styles.chatBtn}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: DRIVER'S OWN OFFERED RIDES */}
        {activeTab === 'offers' && (
          <View>
            {SEED_RIDES.length === 0 ? (
              <EmptyState
                title="No Published Rides"
                message="Offer a ride to start carpooling or bike pooling with verified commuters!"
                actionLabel="Publish a Ride"
                onAction={() => router.push('/(tabs)/offer')}
              />
            ) : (
              SEED_RIDES.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/ride/${r.id}`)}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{r.vehicleType.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.dateText}>{r.availableSeats} of {r.totalSeats} seats open</Text>
                  </View>
                  <Text style={styles.routeText}>{r.pickup} → {r.destination}</Text>
                  <Text style={styles.subText}>Departure: {new Date(r.departureAt).toLocaleTimeString()}</Text>
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
    paddingBottom: 40,
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
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    ...Typography.labelLg,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadgeText: {
    ...Typography.labelSm,
    color: '#15803D',
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  approvedPill: { backgroundColor: '#DCFCE7' },
  pendingPill: { backgroundColor: '#FEF3C7' },
  rejectedPill: { backgroundColor: '#FEE2E2' },
  statusPillText: { ...Typography.labelSm, color: '#475569', fontWeight: '800' },
  approvedPillText: { color: '#15803D' },
  pendingPillText: { color: '#B45309' },
  rejectedPillText: { color: '#B91C1C' },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '800',
  },
  dateText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
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
  riderMsg: {
    ...Typography.bodyMd,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 12,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  approveBtn: { flex: 1, height: 40 },
  rejectBtn: { flex: 1, height: 40 },
  chatBtn: { marginTop: 12, height: 42 },
});
