import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthProvider';
import { useRidesQuery } from '../../src/api/hooks';
import { SkeletonCard } from '../../src/components/loading/SkeletonCard';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'carpool' | 'bike_pool'>('all');

  const queryParams = filter === 'all' ? undefined : { vehicleType: filter };
  const { data: rides, isLoading, refetch, isRefetching } = useRidesQuery(queryParams);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Community Member';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Apple-style Top Bar */}
        <View style={styles.topHeader}>
          <View style={styles.userGreetingMeta}>
            <Text style={styles.greetingSub}>Welcome back 👋</Text>
            <Text style={styles.userTitle}>{displayName}</Text>
          </View>

          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(tabs)/notifications')} activeOpacity={0.8}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Dual Hero Action Cards */}
        <View style={styles.dualCardRow}>
          <TouchableOpacity style={styles.heroCardPrimary} onPress={() => router.push('/(tabs)/find')} activeOpacity={0.88}>
            <View style={styles.heroIconBadge}>
              <Text style={styles.heroIcon}>🔍</Text>
            </View>
            <Text style={styles.heroCardTitle}>Find a Ride</Text>
            <Text style={styles.heroCardSub}>Search carpool or bike pool</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heroCardAccent} onPress={() => router.push('/(tabs)/offer')} activeOpacity={0.88}>
            <View style={styles.heroIconBadgeDark}>
              <Text style={styles.heroIcon}>➕</Text>
            </View>
            <Text style={styles.heroCardTitleDark}>Offer a Ride</Text>
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
            <Text style={[styles.segmentText, filter === 'carpool' && styles.segmentTextActive]}>🚗 Carpool</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, filter === 'bike_pool' && styles.segmentActive]}
            onPress={() => setFilter('bike_pool')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, filter === 'bike_pool' && styles.segmentTextActive]}>🚲 Bike Pool</Text>
          </TouchableOpacity>
        </View>

        {/* Ride Feed List */}
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
              <View style={styles.rideCardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {ride.vehicleType === 'bike_pool' ? '🚲 BIKE POOL' : '🚗 CARPOOL'}
                  </Text>
                </View>

                <Text style={styles.priceText}>${ride.suggestedContribution || 0} <Text style={styles.priceSub}>suggested</Text></Text>
              </View>

              {/* Vertical Route Timeline */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineDots}>
                  <View style={styles.dotBlue} />
                  <View style={styles.timelineLine} />
                  <View style={styles.dotDark} />
                </View>

                <View style={styles.locationsMeta}>
                  <Text style={styles.pickupText} numberOfLines={1}>📍 {ride.pickup}</Text>
                  <Text style={styles.destText} numberOfLines={1}>🏁 {ride.destination}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.rideFooter}>
                <View style={styles.driverMeta}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverInitials}>{ride.driverName?.slice(0, 1) || 'D'}</Text>
                  </View>
                  <View>
                    <Text style={styles.driverName}>{ride.driverName || 'Community Driver'}</Text>
                    <Text style={styles.ratingText}>★ 4.9 • Verified Profile</Text>
                  </View>
                </View>

                <View style={styles.seatsBadge}>
                  <Text style={styles.seatsText}>{ride.availableSeats} of {ride.totalSeats} seats left</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            icon="🧭"
            title="No upcoming rides available"
            message="Be the first to offer a ride or search nearby routes!"
            actionLabel="Offer a Ride"
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  userGreetingMeta: {},
  greetingSub: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
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
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 20,
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
  heroIcon: {
    fontSize: 18,
  },
  heroCardTitle: {
    ...Typography.headlineMd,
    fontSize: 18,
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
    fontSize: 18,
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
  rideCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  rideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    ...Typography.labelSm,
    fontWeight: '700',
    color: '#1E40AF',
  },
  priceText: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceSub: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontWeight: '400',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  timelineDots: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timelineLine: {
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
  locationsMeta: {
    flex: 1,
    gap: 4,
  },
  pickupText: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  destText: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  driverInitials: {
    ...Typography.labelLg,
    fontWeight: '700',
    color: Colors.primary,
  },
  driverName: {
    ...Typography.labelLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  ratingText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  seatsBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatsText: {
    ...Typography.labelSm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});
