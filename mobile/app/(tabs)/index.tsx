import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthProvider';
import { useRidesQuery } from '../../src/api/hooks';
import { SkeletonCard } from '../../src/components/loading/SkeletonCard';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'carpool' | 'bike_pool'>('all');

  const queryParams = filter === 'all' ? undefined : { vehicleType: filter };
  const { data: rides, isLoading, refetch, isRefetching } = useRidesQuery(queryParams);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Community Member';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.userGreetingMeta}>
            <Text style={styles.greetingSub}>Welcome back</Text>
            <Text style={styles.userTitle} numberOfLines={1}>{displayName}</Text>
          </View>

          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(tabs)/notifications')} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Dual Hero Action Cards */}
        <View style={styles.dualCardRow}>
          <TouchableOpacity style={styles.heroCardPrimary} onPress={() => router.push('/(tabs)/find')} activeOpacity={0.88}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="search-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.heroCardTitle}>Find a Ride</Text>
            <Text style={styles.heroCardSub}>Search carpool or bike pool</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroCardAccent} onPress={() => router.push('/(tabs)/offer')} activeOpacity={0.88}>
            <View style={styles.heroIconBadgeDark}>
              <Ionicons name="add-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.heroCardTitleDark}>Publish a Ride</Text>
            <Text style={styles.heroCardSubDark}>Share your route & seats</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Filter Control */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Upcoming Rides</Text>
        </View>

        <View style={styles.segmentedFilterBar}>
          <TouchableOpacity
            style={[styles.segmentBtn, filter === 'all' && styles.segmentActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, filter === 'all' && styles.segmentTextActive]}>All Rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, filter === 'carpool' && styles.segmentActive]}
            onPress={() => setFilter('carpool')}
            activeOpacity={0.8}
          >
            <View style={styles.filterBtnRow}>
              <Ionicons name="car-outline" size={15} color={filter === 'carpool' ? Colors.primary : Colors.onSurfaceVariant} />
              <Text style={[styles.segmentText, filter === 'carpool' && styles.segmentTextActive]}>Carpool</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, filter === 'bike_pool' && styles.segmentActive]}
            onPress={() => setFilter('bike_pool')}
            activeOpacity={0.8}
          >
            <View style={styles.filterBtnRow}>
              <Ionicons name="bicycle-outline" size={15} color={filter === 'bike_pool' ? Colors.primary : Colors.onSurfaceVariant} />
              <Text style={[styles.segmentText, filter === 'bike_pool' && styles.segmentTextActive]}>Bike Pool</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Ride Feed List Matching Reference Screenshot */}
        {isLoading ? (
          <SkeletonCard type="trip" count={3} />
        ) : rides && rides.length > 0 ? (
          rides.map((ride: any) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              onPress={() => router.push(`/ride/${ride.id}`)}
              activeOpacity={0.88}
            >
              {/* Card Top Row: Departure Time Badge, Seats Info, Vehicle Type Button */}
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

              {/* Route Timeline: Pickup & Dropoff */}
              <View style={styles.routeSection}>
                <View style={styles.timelineGraphic}>
                  <View style={styles.hollowCircle} />
                  <View style={styles.timelineLineTrack} />
                  <View style={styles.solidCircle} />
                </View>

                <View style={styles.locationsColumn}>
                  {/* Pickup */}
                  <View style={styles.locationBlock}>
                    <Text style={styles.cityNameText} numberOfLines={1}>{ride.pickup?.split(',')[0] || ride.pickup}</Text>
                    <Text style={styles.landmarkSubText} numberOfLines={1}>{ride.pickup?.split(',')[1] || ride.meetingPoint || 'Main Pick-up Point'}</Text>
                  </View>

                  {/* Destination */}
                  <View style={styles.locationBlock}>
                    <Text style={styles.cityNameText} numberOfLines={1}>{ride.destination?.split(',')[0] || ride.destination}</Text>
                    <Text style={styles.landmarkSubText} numberOfLines={1}>{ride.destination?.split(',')[1] || 'Drop-off Landmark'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.dividerLine} />

              {/* Card Footer: Driver Info & View Details Button */}
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
        ) : (
          <EmptyState
            icon="compass-outline"
            title="No upcoming rides available"
            message="Be the first to publish a ride or search nearby routes!"
            actionLabel="Publish a Ride"
            onAction={() => router.push('/(tabs)/offer')}
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  userGreetingMeta: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  greetingSub: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  userTitle: {
    ...Typography.displayLg,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  dualCardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  heroCardPrimary: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    padding: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  heroIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroCardTitle: {
    ...Typography.headlineMd,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  heroCardSub: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  heroCardAccent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroIconBadgeDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroCardTitleDark: {
    ...Typography.headlineMd,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  heroCardSubDark: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  segmentedFilterBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 14,
    marginBottom: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segmentActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  /* MATCHING RIDE CARD STYLING */
  rideCard: {
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
