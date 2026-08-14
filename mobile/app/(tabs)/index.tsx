import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { SkeletonCard } from '../../src/components/Skeleton';
import { SEED_RIDES } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'all' | 'carpool' | 'bike_pool'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (type: 'all' | 'carpool' | 'bike_pool') => {
    setSelectedType(type);
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredRides = SEED_RIDES.filter(r => selectedType === 'all' || r.vehicleType === selectedType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.userName}>Alex Rivers</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={styles.bellBtn} activeOpacity={0.8}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionBox, styles.findBox]}
            onPress={() => router.push('/(tabs)/find')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionTitle}>Find a Ride</Text>
            <Text style={styles.actionSubtitle}>Search carpool or bike pool</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBox, styles.offerBox]}
            onPress={() => router.push('/(tabs)/offer')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionTitle}>Offer a Ride</Text>
            <Text style={styles.actionSubtitle}>Share your commute</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'all' && styles.activeFilterChip]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterChipText, selectedType === 'all' && styles.activeFilterChipText]}>All Rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'carpool' && styles.activeFilterChip]}
            onPress={() => handleFilterChange('carpool')}
          >
            <Text style={[styles.filterChipText, selectedType === 'carpool' && styles.activeFilterChipText]}>🚗 Carpool</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'bike_pool' && styles.activeFilterChip]}
            onPress={() => handleFilterChange('bike_pool')}
          >
            <Text style={[styles.filterChipText, selectedType === 'bike_pool' && styles.activeFilterChipText]}>🚲 Bike Pool</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Available Upcoming Rides</Text>

        {loading ? (
          <View>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          filteredRides.map(ride => (
            <Card key={ride.id} onPress={() => router.push(`/ride/${ride.id}`)}>
              <View style={styles.cardHeader}>
                <Badge
                  label={ride.vehicleType === 'carpool' ? '🚗 Carpool' : '🚲 Bike Pool'}
                  variant={ride.vehicleType === 'carpool' ? 'primary' : 'success'}
                />
                <Text style={styles.priceText}>
                  {ride.suggestedContribution > 0 ? `\$${ride.suggestedContribution} suggested` : 'Free Share'}
                </Text>
              </View>

              <View style={styles.routeContainer}>
                <Text style={styles.locationText}>📍 {ride.pickup}</Text>
                <Text style={styles.arrowText}>↓</Text>
                <Text style={styles.locationText}>🏁 {ride.destination}</Text>
              </View>

              <View style={styles.driverInfoRow}>
                <View style={styles.driverMeta}>
                  <Text style={styles.driverName}>{ride.driverName}</Text>
                  <Text style={styles.driverRating}>★ {ride.driverRating} ({ride.driverRideCount} rides)</Text>
                </View>
                <Text style={styles.seatsText}>{ride.availableSeats} of {ride.totalSeats} seats left</Text>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  userName: {
    ...Typography.headlineLg,
    color: Colors.onBackground,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  bellIcon: {
    fontSize: 20,
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 16,
    justifyContent: 'center',
  },
  findBox: {
    backgroundColor: Colors.primaryContainer,
  },
  offerBox: {
    backgroundColor: Colors.secondaryContainer,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  actionTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  actionSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
  },
  activeFilterChipText: {
    color: Colors.onPrimary,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Colors.onBackground,
    marginBottom: Spacing.sm,
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
  driverInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  driverMeta: {},
  driverName: {
    ...Typography.bodyMd,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  driverRating: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  seatsText: {
    ...Typography.labelLg,
    color: Colors.success,
  },
});
