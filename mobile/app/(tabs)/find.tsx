import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { SkeletonCard } from '../../src/components/Skeleton';
import { useRidesQuery } from '../../src/api/hooks';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function FindRideScreen() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [seats, setSeats] = useState('1');
  const [tripType, setTripType] = useState<'all' | 'carpool' | 'bike_pool'>('all');

  const { data: rides, isLoading, refetch, isRefetching } = useRidesQuery({
    vehicleType: tripType !== 'all' ? tripType : undefined,
    pickup: pickup || undefined,
    destination: destination || undefined,
  });

  const results = rides || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.primary]} />}
      >
        <Text style={styles.pageTitle}>Find a Ride</Text>
        <Text style={styles.pageSubtitle}>Search carpool or bike pool trips</Text>

        <Card style={styles.searchCard}>
          <Input
            label="Pickup Location *"
            placeholder="e.g. San Francisco"
            value={pickup}
            onChangeText={setPickup}
          />

          <Input
            label="Destination Location *"
            placeholder="e.g. San Jose"
            value={destination}
            onChangeText={setDestination}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Seats Needed (1–4) *"
                placeholder="1"
                value={seats}
                onChangeText={setSeats}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.typeLabel}>Vehicle Type</Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeBtn, tripType === 'all' && styles.activeTypeBtn]}
                  onPress={() => setTripType('all')}
                >
                  <Text style={[styles.typeBtnText, tripType === 'all' && styles.activeTypeBtnText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, tripType === 'carpool' && styles.activeTypeBtn]}
                  onPress={() => setTripType('carpool')}
                >
                  <Text style={[styles.typeBtnText, tripType === 'carpool' && styles.activeTypeBtnText]}>🚗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, tripType === 'bike_pool' && styles.activeTypeBtn]}
                  onPress={() => setTripType('bike_pool')}
                >
                  <Text style={[styles.typeBtnText, tripType === 'bike_pool' && styles.activeTypeBtnText]}>🚲</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button title="Search Rides" onPress={() => refetch()} style={styles.searchBtn} />
        </Card>

        <Text style={styles.sectionTitle}>
          Search Results ({results.length})
        </Text>

        {isLoading ? (
          <View>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No Rides Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search criteria or trip filters.</Text>
          </View>
        ) : (
          results.map((ride: any) => (
            <Card key={ride.id} onPress={() => router.push(`/ride/${ride.id}`)}>
              <View style={styles.cardHeader}>
                <Badge
                  label={ride.vehicleType === 'carpool' ? '🚗 Carpool' : '🚲 Bike Pool'}
                  variant={ride.vehicleType === 'carpool' ? 'primary' : 'success'}
                />
                <Text style={styles.priceText}>
                  {ride.suggestedContribution > 0 ? `\$${ride.suggestedContribution}` : 'Free Share'}
                </Text>
              </View>

              <View style={styles.routeContainer}>
                <Text style={styles.locationText}>📍 {ride.pickup}</Text>
                <Text style={styles.arrowText}>↓</Text>
                <Text style={styles.locationText}>🏁 {ride.destination}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.driverName}>{ride.driverName || 'Verified Driver'} • ★ {ride.driverRating || 5.0}</Text>
                <Text style={styles.seatsLeft}>{ride.availableSeats} seat(s) available</Text>
              </View>
            </Card>
          ))
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
  },
  pageSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  searchCard: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 2,
    height: 48,
    alignItems: 'center',
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 6,
  },
  activeTypeBtn: {
    backgroundColor: Colors.surface,
  },
  typeBtnText: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
  },
  activeTypeBtnText: {
    color: Colors.primary,
  },
  searchBtn: {
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Colors.onBackground,
    marginBottom: Spacing.sm,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  priceText: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  routeContainer: {
    marginVertical: Spacing.xs,
  },
  locationText: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  arrowText: {
    color: Colors.outline,
    marginLeft: 4,
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  driverName: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  seatsLeft: {
    ...Typography.labelLg,
    color: Colors.success,
  },
});
