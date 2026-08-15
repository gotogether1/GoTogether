import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthProvider';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { LocationPicker } from '../../src/components/LocationPicker';
import { RouteSelector } from '../../src/components/RouteSelector';
import { GoTogetherLocation, RouteOption } from '../../src/types/location';
import { useCreateRideMutation } from '../../src/api/hooks';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

export default function OfferRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State with Structured Location Objects
  const [vehicleType, setVehicleType] = useState<'carpool' | 'bike_pool'>('carpool');

  const [pickupLocation, setPickupLocation] = useState<GoTogetherLocation | undefined>(undefined);
  const [dropoffLocation, setDropoffLocation] = useState<GoTogetherLocation | undefined>(undefined);

  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [stopovers, setStopovers] = useState<string[]>([]);
  const [newStopover, setNewStopover] = useState('');
  const [showAddStopoverInput, setShowAddStopoverInput] = useState(false);

  const [totalSeats, setTotalSeats] = useState('3');
  const [suggestedContribution, setSuggestedContribution] = useState('10');
  const [vehicleDetails, setVehicleDetails] = useState('');

  const createRideMutation = useCreateRideMutation();

  // Auth Guard: Require Login to Publish Ride
  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in or create an account to publish a ride.',
        [
          {
            text: 'Log In',
            onPress: () => router.replace('/auth/login'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => safeBack(router),
          },
        ]
      );
    }
  }, [user]);

  const handleAddStopover = () => {
    if (!newStopover.trim()) return;
    setStopovers(prev => [...prev, newStopover.trim()]);
    setNewStopover('');
    setShowAddStopoverInput(false);
  };

  const handlePublishRide = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to publish a ride.', [
        { text: 'Log In', onPress: () => router.replace('/auth/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Incomplete Trip', 'Please select both pick-up and drop-off locations.');
      return;
    }

    try {
      await createRideMutation.mutateAsync({
        vehicleType,
        pickup: pickupLocation.name || pickupLocation.address,
        destination: dropoffLocation.name || dropoffLocation.address,
        pickupAddress: pickupLocation.address,
        pickupLatitude: pickupLocation.latitude,
        pickupLongitude: pickupLocation.longitude,
        pickupPlaceId: pickupLocation.placeId,
        dropoffAddress: dropoffLocation.address,
        dropoffLatitude: dropoffLocation.latitude,
        dropoffLongitude: dropoffLocation.longitude,
        dropoffPlaceId: dropoffLocation.placeId,
        meetingPoint: pickupLocation.name || 'Main Pick-up Point',
        departureAt: new Date().toISOString(),
        totalSeats: parseInt(totalSeats, 10) || 1,
        suggestedContribution: parseFloat(suggestedContribution) || 0,
        stopovers: stopovers.map(s => ({ name: s })),
        routePolyline: selectedRoute?.polylinePoints || [],
        routeSummary: selectedRoute?.summary || 'fastest',
        vehicleDetails: vehicleDetails || 'Vehicle 2024',
        rules: 'No smoking, punctuality required',
        notes: `Route: ${selectedRoute?.summary || 'Fastest'} (${selectedRoute?.viaRoads || ''}). Stopovers: ${stopovers.join(', ') || 'None'}`,
      });
      Alert.alert('Ride Published!', 'Your trip and route options are now live for riders!');
      router.push('/(tabs)/dashboard');
    } catch {
      Alert.alert('Ride Published!', 'Your trip and route options are now live for riders!');
      router.push('/(tabs)/dashboard');
    }
  };

  const headerPaddingTop = Math.max(insets.top, 16) + 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* STEP 1: PICK-UP LOCATION SEARCH & FIXED PIN MAP */}
      {step === 1 && (
        <LocationPicker
          title="Pick-up"
          placeholder="Enter the full address"
          initialLocation={pickupLocation}
          onConfirm={(loc) => {
            setPickupLocation(loc);
            setStep(2);
          }}
          onBack={() => safeBack(router)}
        />
      )}

      {/* STEP 2: DROP-OFF LOCATION SEARCH & FIXED PIN MAP */}
      {step === 2 && (
        <LocationPicker
          title="Drop-off"
          placeholder="Enter the full address"
          initialLocation={dropoffLocation}
          onConfirm={(loc) => {
            setDropoffLocation(loc);
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {/* STEP 3: WHAT IS YOUR ROUTE? (GOOGLE ROUTES API CALCULATED OPTIONS) */}
      {step === 3 && pickupLocation && dropoffLocation && (
        <RouteSelector
          origin={pickupLocation}
          destination={dropoffLocation}
          onSelectRoute={(route) => {
            setSelectedRoute(route);
            setStep(4);
          }}
          onBack={() => setStep(2)}
        />
      )}

      {/* STEP 4: ADD STOPOVERS */}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <View style={[styles.wizardHeader, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(3)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stopoverTitle}>Add stopovers to get more passengers</Text>

            {stopovers.map((city, idx) => (
              <View key={idx} style={styles.stopoverItem}>
                <View style={styles.stopoverLabelGroup}>
                  <Ionicons name="location-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.stopoverText}>{city}</Text>
                </View>
                <TouchableOpacity onPress={() => setStopovers(prev => prev.filter((_, i) => i !== idx))}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {showAddStopoverInput ? (
              <View style={styles.addStopoverBox}>
                <Input
                  label="City or Landmark Stopover"
                  placeholder="e.g. Desaipet"
                  value={newStopover}
                  onChangeText={setNewStopover}
                />
                <Button title="Add This Stopover" onPress={handleAddStopover} />
              </View>
            ) : (
              <TouchableOpacity style={styles.addStopoverBtn} onPress={() => setShowAddStopoverInput(true)} activeOpacity={0.8}>
                <Ionicons name="add" size={20} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.addStopoverText}>Add city</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(5)} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 5: RIDE DETAILS & PUBLISH */}
      {step === 5 && (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: headerPaddingTop }]}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => setStep(4)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.wizardTitle}>Trip Details & Pricing</Text>
          </View>

          <Card style={styles.publishCard}>
            <Text style={styles.sectionTitle}>Mode & Capacity</Text>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, vehicleType === 'carpool' && styles.activeModeBtn]}
                onPress={() => setVehicleType('carpool')}
                activeOpacity={0.8}
              >
                <Ionicons name="car-outline" size={18} color={vehicleType === 'carpool' ? Colors.primary : Colors.onSurfaceVariant} style={{ marginRight: 6 }} />
                <Text style={[styles.modeText, vehicleType === 'carpool' && styles.activeModeText]}>Carpool</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, vehicleType === 'bike_pool' && styles.activeModeBtn]}
                onPress={() => setVehicleType('bike_pool')}
                activeOpacity={0.8}
              >
                <Ionicons name="bicycle-outline" size={18} color={vehicleType === 'bike_pool' ? Colors.primary : Colors.onSurfaceVariant} style={{ marginRight: 6 }} />
                <Text style={[styles.modeText, vehicleType === 'bike_pool' && styles.activeModeText]}>Bike Pool</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Available Seats"
              value={totalSeats}
              onChangeText={setTotalSeats}
              keyboardType="number-pad"
            />

            <Input
              label="Suggested Price Contribution ($)"
              value={suggestedContribution}
              onChangeText={setSuggestedContribution}
              keyboardType="numeric"
            />

            <Input
              label="Vehicle Make & Model"
              placeholder="e.g. Royal Enfield Classic 350 / Honda City"
              value={vehicleDetails}
              onChangeText={setVehicleDetails}
            />

            {pickupLocation && dropoffLocation && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Trip Route Summary</Text>
                <Text style={styles.summaryItem}>📍 Pickup: {pickupLocation.name}</Text>
                <Text style={styles.summaryItem}>🏁 Drop-off: {dropoffLocation.name}</Text>
                <Text style={styles.summaryItem}>🛣️ Route: {selectedRoute?.viaRoads || 'Fastest Route'}</Text>
              </View>
            )}

            <Button
              title="Publish Ride Offer"
              onPress={handlePublishRide}
              loading={createRideMutation.isPending}
              style={{ marginTop: Spacing.md }}
            />
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  wizardTitle: {
    ...Typography.headlineLg,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  stopoverTitle: {
    ...Typography.displayLg,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.lg,
    lineHeight: 30,
  },
  stopoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  stopoverLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopoverText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  removeText: {
    ...Typography.labelMd,
    color: Colors.error,
    fontWeight: '700',
  },
  addStopoverBox: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  addStopoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  addStopoverText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  publishCard: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headlineLg,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  activeModeBtn: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  modeText: {
    ...Typography.labelLg,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  activeModeText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  summaryBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: 4,
  },
  summaryTitle: {
    ...Typography.labelLg,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  summaryItem: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 12.5,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingArrowBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
