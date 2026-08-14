import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { SEED_BOOKINGS, SEED_RIDES, DemoBooking } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'offers' | 'requests'>('upcoming');
  const [bookings, setBookings] = useState<DemoBooking[]>(SEED_BOOKINGS);

  const handleApprove = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
    Alert.alert('Booking Approved!', 'A confirmed direct chat has been created with the rider.');
  };

  const handleReject = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));
    Alert.alert('Booking Rejected', 'The rider has been notified.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>My Rides Dashboard</Text>

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

        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'upcoming' && styles.activeTabBtn]} onPress={() => setActiveTab('upcoming')}>
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'requests' && styles.activeTabBtn]} onPress={() => setActiveTab('requests')}>
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'offers' && styles.activeTabBtn]} onPress={() => setActiveTab('offers')}>
            <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>My Offers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'past' && styles.activeTabBtn]} onPress={() => setActiveTab('past')}>
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'upcoming' && (
          <View>
            {bookings.filter(b => b.status === 'approved').map(b => (
              <Card key={b.id}>
                <View style={styles.cardHeader}>
                  <Badge label="Approved Booking" variant="success" />
                  <Text style={styles.dateText}>{new Date(b.departureAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.cardRoute}>{b.pickup} → {b.destination}</Text>
                <Text style={styles.cardSub}>Driver: {b.driverName} • 1 seat approved</Text>
                <Button
                  title="💬 Chat with Driver"
                  onPress={() => router.push(`/chat/${b.id}`)}
                  style={styles.chatBtn}
                />
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'requests' && (
          <View>
            {bookings.map(b => (
              <Card key={b.id}>
                <View style={styles.cardHeader}>
                  <Badge
                    label={b.status.toUpperCase()}
                    variant={b.status === 'approved' ? 'success' : b.status === 'pending' ? 'warning' : 'error'}
                  />
                  <Text style={styles.dateText}>{b.seatsRequested} seat(s)</Text>
                </View>
                <Text style={styles.cardRoute}>{b.pickup} → {b.destination}</Text>
                <Text style={styles.cardSub}>Rider: {b.riderName}</Text>
                {b.riderMessage && <Text style={styles.riderMsg}>"{b.riderMessage}"</Text>}

                {b.status === 'pending' && (
                  <View style={styles.actionBtns}>
                    <Button title="Approve" onPress={() => handleApprove(b.id)} style={styles.approveBtn} />
                    <Button title="Reject" variant="danger" onPress={() => handleReject(b.id)} style={styles.rejectBtn} />
                  </View>
                )}

                {b.status === 'approved' && (
                  <Button
                    title="💬 Chat with Rider"
                    onPress={() => router.push(`/chat/${b.id}`)}
                    style={styles.chatBtn}
                  />
                )}
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'offers' && (
          <View>
            {SEED_RIDES.map(r => (
              <Card key={r.id} onPress={() => router.push(`/ride/${r.id}`)}>
                <View style={styles.cardHeader}>
                  <Badge label={r.vehicleType.toUpperCase()} variant="primary" />
                  <Text style={styles.dateText}>{r.availableSeats} of {r.totalSeats} seats open</Text>
                </View>
                <Text style={styles.cardRoute}>{r.pickup} → {r.destination}</Text>
                <Text style={styles.cardSub}>Departure: {new Date(r.departureAt).toLocaleTimeString()}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'past' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No Past Completed Rides</Text>
            <Text style={styles.emptySubtitle}>Completed rides will be archived here for leaving reviews.</Text>
          </View>
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
  pageTitle: {
    ...Typography.displayLg,
    color: Colors.onBackground,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
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
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  statNumber: {
    ...Typography.headlineLg,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 2,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dateText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  cardRoute: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  cardSub: {
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
    marginTop: Spacing.sm,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
});
