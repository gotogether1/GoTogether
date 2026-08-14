import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { SkeletonCard } from '../../src/components/loading/SkeletonCard';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { useRidesQuery } from '../../src/api/hooks';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function FindRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
              {/* Top Bar: Time Badge, Seats Info, Vehicle Pill */}
              <View style={styles.cardTopBar}>
                <View style={styles.timeBadgePill}>
                  <Text style={styles.timeBadgeText}>
                    Today, {new Date(ride.departureAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.seatsInfoRow}>
                  <Ionicons name="people-outline" size={16} color="#475569" style={{ marginRight: 4 }} />
                  <Text style={styles.seatsInfoText}>{ride.availableSeats || 2} seats left</Text>
                </View>

                <View style={styles.vehicleTypePillBtn}>
                  <Ionicons
                    name={ride.vehicleType === 'bike_pool' ? 'bicycle-outline' : 'car-outline'}
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.vehicleTypePillText}>
                    {ride.vehicleType === 'bike_pool' ? 'BIKE' : 'CAR'}
                  </Text>
                </View>
              </View>

              {/* Route Timeline: Pickup & Destination */}
              <View style={styles.routeSection}>
                <View style={styles.timelineGraphic}>
                  <View style={styles.hollowCircle} />
                  <View style={styles.timelineLineTrack} />
                  <View style={styles.solidCircle} />
                </View>

                <View style={styles.locationsColumn}>
                  <View style={styles.locationBlock}>
                    <Text style={styles.cityNameText} numberOfLines={1}>{ride.pickup?.split(',')[0] || ride.pickup}</Text>
                    <Text style={styles.landmarkSubText} numberOfLines={1}>{ride.pickup?.split(',')[1] || ride.meetingPoint || 'Main Pick-up Point'}</Text>
                  </View>

                  <View style={styles.locationBlock}>
                    <Text style={styles.cityNameText} numberOfLines={1}>{ride.destination?.split(',')[0] || ride.destination}</Text>
                    <Text style={styles.landmarkSubText} numberOfLines={1}>{ride.destination?.split(',')[1] || 'Drop-off Landmark'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.dividerLine} />

              {/* Footer Row: Driver Info & View Details Button */}
              <View style={styles.cardFooterRow}>
                <View style={styles.driverInfoMeta}>
                  <View style={styles.driverAvatarCircle}>
                    <Text style={styles.driverAvatarInitial}>{ride.driverName?.charAt(0) || 'D'}</Text>
                  </View>

                  <View style={styles.driverNameRatingColumn}>
                    <Text style={styles.driverNameText} numberOfLines={1}>{ride.driverName || 'Rajesh K.'}</Text>
                    <View style={styles.starRatingRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" style={{ marginRight: 3 }} />
                      <Text style={styles.ratingNumberText}>4.8</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewDetailsPillBtn}>
                  <Text style={styles.viewDetailsPillText}>View Details</Text>
                </View>
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
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  timeBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeBadgeText: {
    ...Typography.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  seatsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  seatsInfoText: {
    ...Typography.labelSm,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  vehicleTypePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  vehicleTypePillText: {
    ...Typography.labelSm,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: Spacing.xs,
  },
  timelineGraphic: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  hollowCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  timelineLineTrack: {
    flex: 1,
    width: 2,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  solidCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  locationsColumn: {
    flex: 1,
    gap: 16,
  },
  locationBlock: {},
  cityNameText: {
    ...Typography.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  landmarkSubText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.md,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverInfoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  driverAvatarInitial: {
    ...Typography.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  driverNameRatingColumn: {},
  driverNameText: {
    ...Typography.bodyLg,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingNumberText: {
    ...Typography.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  viewDetailsPillBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewDetailsPillText: {
    ...Typography.labelLg,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
});
