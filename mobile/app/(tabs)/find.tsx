import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { SkeletonCard } from '../../src/components/loading/SkeletonCard';
import { EmptyState } from '../../src/components/loading/EmptyState';
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Search Rides</Text>
        <Text style={styles.pageSubtitle}>Find verified carpool or bike pool trips along your route</Text>

        <View style={styles.searchCardBox}>
          <Input
            label="Pickup City / Landmark"
            placeholder="e.g. Banswada"
            value={pickup}
            onChangeText={setPickup}
            onClear={() => setPickup('')}
          />

          <Input
            label="Drop-off Destination"
            placeholder="e.g. Hyderabad"
            value={destination}
            onChangeText={setDestination}
            onClear={() => setDestination('')}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Seats Needed"
                placeholder="1"
                value={seats}
                onChangeText={setSeats}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.typeLabel}>Ride Mode</Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeBtn, tripType === 'all' && styles.activeTypeBtn]}
                  onPress={() => setTripType('all')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeBtnText, tripType === 'all' && styles.activeTypeBtnText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, tripType === 'carpool' && styles.activeTypeBtn]}
                  onPress={() => setTripType('carpool')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="car-outline" size={16} color={tripType === 'carpool' ? Colors.primary : Colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, tripType === 'bike_pool' && styles.activeTypeBtn]}
                  onPress={() => setTripType('bike_pool')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bicycle-outline" size={16} color={tripType === 'bike_pool' ? Colors.primary : Colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button title="Search Matching Rides" onPress={() => refetch()} style={styles.searchBtn} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Available Trips ({results.length})
          </Text>
        </View>

        {isLoading ? (
          <SkeletonCard type="trip" count={3} />
        ) : results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No Matching Trips Found"
            message="Try widening your search terms or clearing your pickup location filter."
            actionLabel="Reset Search"
            onAction={() => {
              setPickup('');
              setDestination('');
              setTripType('all');
              refetch();
            }}
          />
        ) : (
          results.map((ride: any) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideResultCard}
              onPress={() => router.push(`/ride/${ride.id}`)}
              activeOpacity={0.88}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgePill}>
                  <Ionicons
                    name={ride.vehicleType === 'carpool' ? 'car-outline' : 'bicycle-outline'}
                    size={14}
                    color="#1E40AF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.badgeText}>
                    {ride.vehicleType === 'carpool' ? 'CARPOOL' : 'BIKE POOL'}
                  </Text>
                </View>

                <Text style={styles.priceTag}>
                  {ride.suggestedContribution > 0 ? `$${ride.suggestedContribution}` : 'Free Share'}
                </Text>
              </View>

              <View style={styles.routeBox}>
                <View style={styles.dotsLine}>
                  <View style={styles.dotBlue} />
                  <View style={styles.line} />
                  <View style={styles.dotDark} />
                </View>

                <View style={styles.routeMeta}>
                  <View style={styles.locRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.primary} style={styles.locIcon} />
                    <Text style={styles.locationText} numberOfLines={1}>{ride.pickup}</Text>
                  </View>
                  <View style={styles.locRow}>
                    <Ionicons name="flag-outline" size={14} color="#0F172A" style={styles.locIcon} />
                    <Text style={styles.locationText} numberOfLines={1}>{ride.destination}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.driverInfo}>
                  <View style={styles.avatarCircleSmall}>
                    <Text style={styles.avatarText}>{ride.driverName?.charAt(0) || 'D'}</Text>
                  </View>
                  <Text style={styles.driverName}>{ride.driverName || 'Community Driver'} • ★ 4.9</Text>
                </View>
                <Text style={styles.seatsLeft}>{ride.availableSeats} seats left</Text>
              </View>
            </TouchableOpacity>
          ))
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
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  searchCardBox: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  typeLabel: {
    ...Typography.labelMd,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    height: 52,
    alignItems: 'center',
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 10,
  },
  activeTypeBtn: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBtnText: {
    ...Typography.labelSm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  activeTypeBtnText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  searchBtn: {
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  rideResultCard: {
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
    marginBottom: Spacing.sm,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    ...Typography.labelSm,
    fontWeight: '700',
    color: '#1E40AF',
  },
  priceTag: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.primary,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  dotsLine: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  dotDark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
  },
  routeMeta: {
    flex: 1,
    gap: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIcon: {
    marginRight: 6,
  },
  locationText: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 2,
  },
  avatarText: {
    ...Typography.labelSm,
    fontWeight: '700',
    color: Colors.primary,
  },
  driverName: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  seatsLeft: {
    ...Typography.labelSm,
    fontWeight: '700',
    color: Colors.success,
  },
});
