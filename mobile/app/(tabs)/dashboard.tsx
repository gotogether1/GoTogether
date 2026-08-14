import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Active Ride</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>★ 4.9</Text>
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
            {bookings.filter(b => b.status === 'approved').map(b => (
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
            ))}
          </View>
        )}

        {/* TAB 2: PENDING PASSENGER REQUESTS */}
        {activeTab === 'requests' && (
          <View>
            {bookings.map(b => (
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
            ))}
          </View>
        )}

        {/* TAB 3: DRIVER'S OWN OFFERED RIDES */}
        {activeTab === 'offers' && (
          <View>
            {SEED_RIDES.map(r => (
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
            ))}
          </View>
        )}

        {/* TAB 4: PAST COMPLETED RIDES */}
        {activeTab === 'past' && (
          <EmptyState
            icon="document-text-outline"
            title="No Past Completed Rides"
            message="Your completed trips and history will be archived here."
          />
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
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  pageTitle: {
    ...Typography.displayLg,
    fontSize: 28,
    color: Colors.onBackground,
    fontWeight: '800',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 3,
    borderRadius: 14,
    marginBottom: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    ...Typography.labelSm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  cardItem: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  approvedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  approvedBadgeText: {
    ...Typography.labelSm,
    color: '#047857',
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    ...Typography.labelSm,
    fontWeight: '700',
  },
  approvedPill: {
    backgroundColor: '#ECFDF5',
  },
  approvedPillText: {
    color: '#047857',
  },
  pendingPill: {
    backgroundColor: '#FEF3C7',
  },
  pendingPillText: {
    color: '#D97706',
  },
  rejectedPill: {
    backgroundColor: '#FEF2F2',
  },
  rejectedPillText: {
    color: '#DC2626',
  },
  typeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    ...Typography.labelSm,
    color: '#1E40AF',
    fontWeight: '700',
  },
  dateText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  routeText: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  subText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  riderMsg: {
    ...Typography.bodyMd,
    fontStyle: 'italic',
    color: Colors.onSurface,
    marginTop: 4,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  approveBtn: {
    flex: 1,
  },
  rejectBtn: {
    flex: 1,
  },
  chatBtn: {
    marginTop: Spacing.md,
  },
});
