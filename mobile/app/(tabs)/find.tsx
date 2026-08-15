import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { SkeletonCard } from '../../src/components/loading/SkeletonCard';
import { EmptyState } from '../../src/components/loading/EmptyState';
import { useRidesQuery } from '../../src/api/hooks';
import { useAuth } from '../../src/auth/AuthProvider';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function FindRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [seats, setSeats] = useState('1');
  const [tripType, setTripType] = useState<'all' | 'carpool' | 'bike_pool'>('all');

  const { data: rides, isLoading, refetch, isRefetching } = useRidesQuery({
    vehicleType: tripType !== 'all' ? tripType : undefined,
    pickup: pickup || undefined,
    destination: destination || undefined,
    date: travelDate || undefined,
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

          {/* Date Filter Quick Chips */}
          <Text style={styles.filterLabel}>Travel Date Filter</Text>
          <View style={styles.dateChipRow}>
            {[
              { label: 'Any Date', date: '' },
              { label: 'Today', date: new Date().toISOString().split('T')[0] },
              { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
            ].map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dateFilterChip, travelDate === chip.date && styles.dateFilterChipActive]}
                onPress={() => setTravelDate(chip.date)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateFilterChipText, travelDate === chip.date && styles.dateFilterChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Specific Travel Date (YYYY-MM-DD)"
            placeholder="e.g. 2026-08-20"
            value={travelDate}
            onChangeText={setTravelDate}
            onClear={() => setTravelDate('')}
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

          <Button title="Search Rides" onPress={() => refetch()} style={{ marginTop: Spacing.xs }} />
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Available Pools {results.length > 0 ? `(${results.length})` : ''}
          </Text>
        </View>

        {/* Results List */}
        {isLoading ? (
          <View style={{ gap: Spacing.md }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No Matching Rides Found"
            message="Try adjusting your travel date or route search criteria."
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            {results.map((ride: any) => {
              const isOwner = !!user && (user.uid === ride.driverId || `usr_${user.uid}` === ride.driverId);
              const driverDisplayName = isOwner ? 'You' : (ride.driverName || 'Driver');
              return (
                <TouchableOpacity
                  key={ride.id}
                  style={styles.rideCard}
                  onPress={() => router.push(`/ride/${ride.id}`)}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.driverInfo}>
                      <View style={styles.avatarMini}>
                        <Text style={styles.avatarMiniText}>{driverDisplayName.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={styles.driverName}>{driverDisplayName}</Text>
                        <Text style={styles.driverRating}>★ {ride.driverRating || '5.0'}</Text>
                      </View>
                    </View>

                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>
                      {ride.suggestedContribution > 0 ? `$${ride.suggestedContribution}` : 'Free'}
                    </Text>
                  </View>
                </View>

                {/* Route Line */}
                <View style={styles.routeContainer}>
                  <View style={styles.locationRow}>
                    <Ionicons name="ellipse" size={10} color={Colors.primary} style={{ marginRight: 8, marginTop: 3 }} />
                    <Text style={styles.locationText}>{ride.pickup}</Text>
                  </View>
                  <View style={styles.routeConnector} />
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color="#EF4444" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.locationText}>{ride.destination}</Text>
                  </View>
                </View>

                {/* Schedule & Seats Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.departureText}>
                    📅 {new Date(ride.departureAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ⏰ {new Date(ride.departureAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.seatsText}>{ride.availableSeats} seat(s) left</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
  },
  pageSubtitle: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  searchCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterLabel: {
    ...Typography.labelLg,
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 6,
  },
  dateChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  dateFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateFilterChipText: {
    ...Typography.labelLg,
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  dateFilterChipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  typeLabel: {
    ...Typography.labelLg,
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 6,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    height: 48,
    alignItems: 'center',
  },
  typeBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeTypeBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typeBtnText: {
    ...Typography.labelLg,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '700',
  },
  activeTypeBtnText: {
    color: Colors.primary,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    ...Typography.headlineLg,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    ...Typography.headlineLg,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  driverName: {
    ...Typography.headlineLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  driverRating: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  priceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    ...Typography.headlineLg,
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  routeContainer: {
    marginBottom: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    ...Typography.bodyMd,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  routeConnector: {
    width: 2,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginLeft: 4,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  departureText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  seatsText: {
    ...Typography.labelLg,
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
});
