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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form State with Structured Location Objects
  const [vehicleType, setVehicleType] = useState<'carpool' | 'bike_pool'>('carpool');

  const [pickupLocation, setPickupLocation] = useState<GoTogetherLocation | undefined>(undefined);
  const [dropoffLocation, setDropoffLocation] = useState<GoTogetherLocation | undefined>(undefined);

  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [stopovers, setStopovers] = useState<string[]>([]);
  const [newStopover, setNewStopover] = useState('');
  const [showAddStopoverInput, setShowAddStopoverInput] = useState(false);

  // Date & Time Scheduling State
  const tomorrow = new Date(Date.now() + 86400000);
  const defaultDateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedTime, setSelectedTime] = useState<string>('08:30 AM');

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
          { text: 'Log In', onPress: () => router.replace('/auth/login') },
          { text: 'Cancel', style: 'cancel', onPress: () => safeBack(router) },
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

  const computeDepartureAt = (dateStr: string, timeStr: string): string => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      let hours = 8;
      let minutes = 30;

      if (timeStr.includes(':')) {
        const parts = timeStr.replace(/(AM|PM)/i, '').trim().split(':');
        hours = parseInt(parts[0], 10) || 8;
        minutes = parseInt(parts[1], 10) || 0;
        if (timeStr.toLowerCase().includes('pm') && hours < 12) hours += 12;
        if (timeStr.toLowerCase().includes('am') && hours === 12) hours = 0;
      }

      const d = new Date(year, month - 1, day, hours, minutes);
      return d.toISOString();
    } catch {
      return new Date(Date.now() + 3600000).toISOString();
    }
  };

  const handlePublishRide = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to publish a ride.', [
        { text: 'Log In', onPress: () => router.replace('/auth/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!pickupLocation || typeof pickupLocation.latitude !== 'number' || typeof pickupLocation.longitude !== 'number' || isNaN(pickupLocation.latitude) || isNaN(pickupLocation.longitude)) {
      Alert.alert('Incomplete Location', 'Please select a valid pick-up location from the search suggestions.');
      return;
    }

    if (!dropoffLocation || typeof dropoffLocation.latitude !== 'number' || typeof dropoffLocation.longitude !== 'number' || isNaN(dropoffLocation.latitude) || isNaN(dropoffLocation.longitude)) {
      Alert.alert('Incomplete Location', 'Please select a valid drop-off location from the search suggestions.');
      return;
    }

    const departureIso = computeDepartureAt(selectedDate, selectedTime);
    if (new Date(departureIso).getTime() < Date.now() - 3600000) {
      Alert.alert('Invalid Departure Schedule', 'Departure time cannot be in the past. Please select a future departure date and time.');
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
        departureAt: departureIso,
        totalSeats: parseInt(totalSeats, 10) || 1,
        suggestedContribution: parseFloat(suggestedContribution) || 0,
        stopovers: stopovers.map(s => ({ name: s })),
        routePolyline: selectedRoute?.polylinePoints || [],
        routeSummary: selectedRoute?.summary || 'fastest',
        vehicleDetails: vehicleDetails || 'Vehicle 2024',
        rules: 'No smoking, punctuality required',
        notes: `Scheduled: ${selectedDate} ${selectedTime}. Route: ${selectedRoute?.summary || 'Fastest'} (${selectedRoute?.viaRoads || ''}). Stopovers: ${stopovers.join(', ') || 'None'}`,
      });
      Alert.alert('Ride Published!', 'Your trip, route, and schedule are live for riders!');
      router.push('/(tabs)/dashboard');
    } catch (err: any) {
      Alert.alert(
        'Publish Failed',
        err.message || 'Unable to publish ride. Please verify your trip details and connection.'
      );
    }
  };

  const headerPaddingTop = Math.max(insets.top, 16) + 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* STEP 1: PICK-UP LOCATION */}
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

      {/* STEP 2: DROP-OFF LOCATION */}
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

      {/* STEP 3: ADD STOPOVERS */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <View style={[styles.wizardHeader, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(2)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stopoverTitle}>Add stopovers along your route</Text>

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
                  placeholder="e.g. Kamareddy"
                  value={newStopover}
                  onChangeText={setNewStopover}
                />
                <Button title="Add Stopover" onPress={handleAddStopover} />
              </View>
            ) : (
              <TouchableOpacity style={styles.addStopoverBtn} onPress={() => setShowAddStopoverInput(true)} activeOpacity={0.8}>
                <Ionicons name="add" size={20} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.addStopoverText}>Add intermediate stop</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(4)} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 4: ROUTE ALTERNATIVES & ROUTE SELECTOR */}
      {step === 4 && pickupLocation && dropoffLocation && (
        <RouteSelector
          origin={pickupLocation}
          destination={dropoffLocation}
          onSelectRoute={(route) => {
            setSelectedRoute(route);
            setStep(5);
          }}
          onBack={() => setStep(3)}
        />
      )}

      {/* STEP 5: SCHEDULING DATE & TIME */}
      {step === 5 && (
        <View style={styles.stepContainer}>
          <View style={[styles.wizardHeader, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(4)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.wizardTitle}>When are you leaving?</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Date Selection Options */}
            <Card style={styles.scheduleCard}>
              <Text style={styles.scheduleSectionTitle}>Select Travel Date</Text>
              <View style={styles.chipGrid}>
                {[
                  { label: 'Today', date: new Date().toISOString().split('T')[0] },
                  { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                  { label: 'In 2 Days', date: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
                  { label: 'In 3 Days', date: new Date(Date.now() + 259200000).toISOString().split('T')[0] },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dateChip, selectedDate === item.date && styles.chipActive]}
                    onPress={() => setSelectedDate(item.date)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar-outline" size={16} color={selectedDate === item.date ? '#FFFFFF' : Colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.chipText, selectedDate === item.date && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Custom Date (YYYY-MM-DD)"
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="2026-08-20"
              />
            </Card>

            {/* Time Selection Options */}
            <Card style={styles.scheduleCard}>
              <Text style={styles.scheduleSectionTitle}>Select Departure Time</Text>
              <View style={styles.chipGrid}>
                {['07:00 AM', '08:30 AM', '10:00 AM', '02:00 PM', '05:30 PM', '08:00 PM'].map((t, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.timeChip, selectedTime === t && styles.chipActive]}
                    onPress={() => setSelectedTime(t)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time-outline" size={15} color={selectedTime === t ? '#FFFFFF' : Colors.onSurface} style={{ marginRight: 4 }} />
                    <Text style={[styles.chipText, selectedTime === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Custom Departure Time"
                value={selectedTime}
                onChangeText={setSelectedTime}
                placeholder="e.g. 08:30 AM"
              />
            </Card>

            {/* Departure Summary Banner */}
            <Card style={styles.summaryBannerCard}>
              <View style={styles.bannerRow}>
                <Ionicons name="alarm-outline" size={24} color={Colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Scheduled Departure</Text>
                  <Text style={styles.bannerText}>
                    {new Date(computeDepartureAt(selectedDate, selectedTime)).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })} at {selectedTime}
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>

          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(6)} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 6: RIDE DETAILS & PUBLISH */}
      {step === 6 && (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: headerPaddingTop }]}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => setStep(5)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.wizardTitle}>Trip Details & Pricing</Text>
          </View>

          <Card style={styles.publishCard}>
            <Text style={styles.sectionHeading}>Vehicle Mode</Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[styles.typeBtn, vehicleType === 'carpool' && styles.typeBtnActive]}
                onPress={() => setVehicleType('carpool')}
              >
                <Ionicons name="car-outline" size={20} color={vehicleType === 'carpool' ? '#FFFFFF' : Colors.onSurface} />
                <Text style={[styles.typeBtnText, vehicleType === 'carpool' && styles.typeBtnTextActive]}>Carpool</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, vehicleType === 'bike_pool' && styles.typeBtnActive]}
                onPress={() => setVehicleType('bike_pool')}
              >
                <Ionicons name="bicycle-outline" size={20} color={vehicleType === 'bike_pool' ? '#FFFFFF' : Colors.onSurface} />
                <Text style={[styles.typeBtnText, vehicleType === 'bike_pool' && styles.typeBtnTextActive]}>Bike Pool</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Vehicle Make & Model"
              placeholder="e.g. Honda City / Royal Enfield"
              value={vehicleDetails}
              onChangeText={setVehicleDetails}
            />

            <Input
              label="Available Seats"
              keyboardType="number-pad"
              value={totalSeats}
              onChangeText={setTotalSeats}
            />

            <Input
              label="Suggested Contribution per Seat ($)"
              keyboardType="number-pad"
              value={suggestedContribution}
              onChangeText={setSuggestedContribution}
            />
          </Card>

          {/* Schedule Confirmation Card */}
          <Card style={styles.scheduleConfirmCard}>
            <Text style={styles.confirmHeading}>Scheduled Departure</Text>
            <Text style={styles.confirmValue}>
              📅 {new Date(computeDepartureAt(selectedDate, selectedTime)).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })} • ⏰ {selectedTime}
            </Text>
          </Card>

          <Button
            title="Publish Ride"
            onPress={handlePublishRide}
            loading={createRideMutation.isPending}
            style={{ marginTop: Spacing.md }}
          />
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
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wizardTitle: {
    ...Typography.headlineLg,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  stopoverTitle: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: Spacing.lg,
  },
  stopoverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopoverLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopoverText: {
    ...Typography.bodyMd,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  removeText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
  },
  addStopoverBox: {
    marginTop: Spacing.md,
  },
  addStopoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addStopoverText: {
    ...Typography.bodyMd,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 50,
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
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  scheduleCard: {
    marginBottom: Spacing.md,
  },
  scheduleSectionTitle: {
    ...Typography.headlineLg,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: Spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.labelLg,
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  summaryBannerCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: Spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    ...Typography.headlineLg,
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  bannerText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '600',
    marginTop: 2,
  },
  publishCard: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    ...Typography.headlineLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeBtnText: {
    ...Typography.labelLg,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  scheduleConfirmCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  confirmHeading: {
    ...Typography.labelLg,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confirmValue: {
    ...Typography.headlineLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
});
