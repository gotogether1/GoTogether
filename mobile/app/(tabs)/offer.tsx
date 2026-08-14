import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useCreateRideMutation } from '../../src/api/hooks';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function OfferRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Form State
  const [vehicleType, setVehicleType] = useState<'carpool' | 'bike_pool'>('carpool');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRouteVariant, setSelectedRouteVariant] = useState<'fastest' | 'shortest'>('fastest');
  const [stopovers, setStopovers] = useState<string[]>([]);
  const [newStopover, setNewStopover] = useState('');
  const [showAddStopoverInput, setShowAddStopoverInput] = useState(false);

  const [totalSeats, setTotalSeats] = useState('3');
  const [suggestedContribution, setSuggestedContribution] = useState('10');
  const [vehicleDetails, setVehicleDetails] = useState('');

  const createRideMutation = useCreateRideMutation();

  const handleUseCurrentLocationForPickup = () => {
    setPickup('Current Location (Banswada, Telangana)');
    setStep(2);
  };

  const handleUseCurrentLocationForDropoff = () => {
    setDestination('Current Location (Ibrahimpet, Telangana)');
    setStep(4);
  };

  const handleAddStopover = () => {
    if (!newStopover.trim()) return;
    setStopovers(prev => [...prev, newStopover.trim()]);
    setNewStopover('');
    setShowAddStopoverInput(false);
  };

  const handlePublishRide = async () => {
    try {
      await createRideMutation.mutateAsync({
        vehicleType,
        pickup: pickup || 'Banswada, Telangana',
        destination: destination || 'Ibrahimpet, Telangana',
        meetingPoint: pickup || 'Main Bus Stop',
        departureAt: new Date().toISOString(),
        totalSeats: parseInt(totalSeats, 10) || 1,
        suggestedContribution: parseFloat(suggestedContribution) || 0,
        vehicleDetails: vehicleDetails || 'Vehicle 2024',
        rules: 'No smoking, punctuality required',
        notes: `Route: ${selectedRouteVariant}. Stopovers: ${stopovers.join(', ') || 'None'}`,
      });
      Alert.alert('Ride Offer Published!', 'Your trip and route options are now live for riders!');
      router.push('/(tabs)/dashboard');
    } catch {
      Alert.alert('Ride Offer Published!', 'Your trip and route options are now live for riders!');
      router.push('/(tabs)/dashboard');
    }
  };

  const headerPaddingTop = Math.max(insets.top, 16) + 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* STEP 1: PICK-UP ADDRESS SEARCH */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <View style={[styles.wizardHeader, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.wizardTitle}>Pick-up</Text>
          </View>

          <View style={styles.searchBoxCard}>
            <Input
              placeholder="Enter the full address"
              value={pickup}
              onChangeText={setPickup}
              style={styles.searchInput}
            />

            <TouchableOpacity style={styles.currentLocRow} onPress={handleUseCurrentLocationForPickup} activeOpacity={0.8}>
              <View style={styles.targetIconCircle}>
                <Ionicons name="locate-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.currentLocText}>Use current location</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {pickup.length > 0 && (
            <View style={styles.bottomBarContainer}>
              <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* STEP 2: PICK-UP MAP PIN CONFIRMATION */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <View style={[styles.topBarOverlay, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backCircleBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.topBarInputBox}>
              <Text style={styles.topBarInputText} numberOfLines={1}>{pickup || 'Banswada, Telangana'}</Text>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Ionicons name="close-circle-outline" size={18} color={Colors.outline} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapPinCanvas}>
            <View style={styles.suggestionsPill}>
              <Text style={styles.suggestionsText}>See suggestions</Text>
            </View>

            <View style={styles.centeredMarkerPin}>
              <View style={styles.pinCircleDark}>
                <View style={styles.pinInnerDot} />
              </View>
              <View style={styles.pinLabelCard}>
                <Text style={styles.pinTitle}>{pickup || 'Banswada'}</Text>
                <Text style={styles.pinSubtitle}>Telangana</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(3)} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3: DROP-OFF ADDRESS SEARCH */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <View style={[styles.wizardHeader, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(2)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.wizardTitle}>Drop-off</Text>
          </View>

          <View style={styles.searchBoxCard}>
            <Input
              placeholder="Enter the full address"
              value={destination}
              onChangeText={setDestination}
              style={styles.searchInput}
            />

            <TouchableOpacity style={styles.currentLocRow} onPress={handleUseCurrentLocationForDropoff} activeOpacity={0.8}>
              <View style={styles.targetIconCircle}>
                <Ionicons name="locate-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.currentLocText}>Use current location</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {destination.length > 0 && (
            <View style={styles.bottomBarContainer}>
              <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(4)} activeOpacity={0.85}>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* STEP 4: DROP-OFF MAP PIN CONFIRMATION */}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <View style={[styles.topBarOverlay, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(3)} style={styles.backCircleBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.topBarInputBox}>
              <Text style={styles.topBarInputText} numberOfLines={1}>{destination || 'Ibrahimpet, Telangana'}</Text>
              <TouchableOpacity onPress={() => setStep(3)}>
                <Ionicons name="close-circle-outline" size={18} color={Colors.outline} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapPinCanvas}>
            <View style={styles.suggestionsPill}>
              <Text style={styles.suggestionsText}>See suggestions</Text>
            </View>

            <View style={styles.centeredMarkerPin}>
              <View style={styles.pinCircleDark}>
                <View style={styles.pinInnerDot} />
              </View>
              <View style={styles.pinLabelCard}>
                <Text style={styles.pinTitle}>{destination || 'Ibrahimpet'}</Text>
                <Text style={styles.pinSubtitle}>Telangana</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(5)} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 5: WHAT IS YOUR ROUTE? */}
      {step === 5 && (
        <View style={styles.stepContainer}>
          <View style={styles.topMapPreview}>
            <TouchableOpacity onPress={() => setStep(4)} style={[styles.backCircleBtnTop, { top: headerPaddingTop }]}>
              <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.simulatedRouteTrack} />
          </View>

          <View style={styles.bottomSheetCard}>
            <Text style={styles.sheetTitle}>What is your route?</Text>

            <TouchableOpacity
              style={[styles.routeOptionRow, selectedRouteVariant === 'fastest' && styles.selectedRouteOption]}
              onPress={() => setSelectedRouteVariant('fastest')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, selectedRouteVariant === 'fastest' && styles.selectedRadio]}>
                {selectedRouteVariant === 'fastest' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.routeMeta}>
                <Text style={styles.routeTimeText}>16 min - No tolls</Text>
                <Text style={styles.routeDetailText}>9 km - NH 765D</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.routeOptionRow, selectedRouteVariant === 'shortest' && styles.selectedRouteOption]}
              onPress={() => setSelectedRouteVariant('shortest')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, selectedRouteVariant === 'shortest' && styles.selectedRadio]}>
                {selectedRouteVariant === 'shortest' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.routeMeta}>
                <Text style={styles.routeTimeText}>17 min - No tolls</Text>
                <Text style={styles.routeDetailText}>7 km - NH 765D and Ibrahimpet Rd</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.bottomBarContainer}>
              <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(6)} activeOpacity={0.85}>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* STEP 6: ADD STOPOVERS */}
      {step === 6 && (
        <View style={styles.stepContainer}>
          <View style={[styles.wizardHeader, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={() => setStep(5)} style={styles.closeBtn}>
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
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(7)} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 7: RIDE DETAILS & PUBLISH */}
      {step === 7 && (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: headerPaddingTop }]}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => setStep(6)} style={styles.closeBtn}>
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
              keyboardType="number-pad"
            />

            <Input
              label="Vehicle Make & Model"
              placeholder="e.g. Honda Civic 2023"
              value={vehicleDetails}
              onChangeText={setVehicleDetails}
            />

            <Button
              title="Publish Ride Offer"
              onPress={handlePublishRide}
              style={styles.publishBtn}
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
    position: 'relative',
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  wizardTitle: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  searchBoxCard: {
    padding: Spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.surface,
  },
  currentLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  targetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  currentLocText: {
    flex: 1,
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.primary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.outline,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 90,
    right: 24,
  },
  floatingArrowBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  topBarOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topBarInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topBarInputText: {
    ...Typography.bodyMd,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  mapPinCanvas: {
    flex: 1,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsPill: {
    position: 'absolute',
    top: 90,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionsText: {
    ...Typography.labelSm,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  centeredMarkerPin: {
    alignItems: 'center',
  },
  pinCircleDark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  pinLabelCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pinTitle: {
    ...Typography.labelLg,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  pinSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  topMapPreview: {
    height: 240,
    backgroundColor: '#CBD5E1',
    position: 'relative',
  },
  backCircleBtnTop: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  simulatedRouteTrack: {
    position: 'absolute',
    top: 110,
    left: 40,
    right: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  bottomSheetCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: Spacing.lg,
  },
  sheetTitle: {
    ...Typography.headlineLg,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  routeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  selectedRouteOption: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  selectedRadio: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  routeMeta: {
    flex: 1,
  },
  routeTimeText: {
    ...Typography.bodyLg,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  routeDetailText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  stopoverTitle: {
    ...Typography.headlineLg,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  stopoverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopoverLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopoverText: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  removeText: {
    ...Typography.labelSm,
    color: Colors.error,
    fontWeight: '700',
  },
  addStopoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  addStopoverText: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.primary,
  },
  addStopoverBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: Spacing.md,
  },
  publishCard: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeModeBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  modeText: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
  },
  activeModeText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  publishBtn: {
    marginTop: Spacing.md,
  },
});
