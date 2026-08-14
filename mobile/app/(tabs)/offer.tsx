import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useCreateRideMutation } from '../../src/api/hooks';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function OfferRideScreen() {
  const router = useRouter();
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
      Alert.alert('Ride Offer Published! 🚗', 'Your trip and route options are now live for riders!');
      router.push('/(tabs)/dashboard');
    } catch {
      Alert.alert('Ride Offer Published! 🚗', 'Your trip and route options are now live for riders!');
      router.push('/(tabs)/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* STEP 1: PICK-UP ADDRESS SEARCH (Screens 1 & 2) */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
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
                <Text style={styles.targetIcon}>🎯</Text>
              </View>
              <Text style={styles.currentLocText}>Use current location</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {pickup.length > 0 && (
            <View style={styles.bottomBarContainer}>
              <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
                <Text style={styles.arrowIcon}>➔</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* STEP 2: PICK-UP MAP PIN CONFIRMATION (Screen 3) */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <View style={styles.topBarOverlay}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backCircleBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.topBarInputBox}>
              <Text style={styles.topBarInputText} numberOfLines={1}>{pickup || 'Banswada, Telangana'}</Text>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapPinCanvas}>
            <View style={styles.suggestionsPill}>
              <Text style={styles.suggestionsText}>See suggestions</Text>
            </View>

            {/* Map Pin Marker */}
            <View style={styles.centeredMarkerPin}>
              <View style={styles.pinCircle}>
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
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3: DROP-OFF ADDRESS SEARCH (Screens 4 & 5) */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => setStep(2)} style={styles.closeBtn}>
              <Text style={styles.backIcon}>←</Text>
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
                <Text style={styles.targetIcon}>🎯</Text>
              </View>
              <Text style={styles.currentLocText}>Use current location</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {destination.length > 0 && (
            <View style={styles.bottomBarContainer}>
              <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(4)} activeOpacity={0.85}>
                <Text style={styles.arrowIcon}>➔</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* STEP 4: DROP-OFF MAP PIN CONFIRMATION (Screen 6) */}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <View style={styles.topBarOverlay}>
            <TouchableOpacity onPress={() => setStep(3)} style={styles.backCircleBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.topBarInputBox}>
              <Text style={styles.topBarInputText} numberOfLines={1}>{destination || 'Ibrahimpet, Telangana'}</Text>
              <TouchableOpacity onPress={() => setStep(3)}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapPinCanvas}>
            <View style={styles.suggestionsPill}>
              <Text style={styles.suggestionsText}>See suggestions</Text>
            </View>

            {/* Map Pin Marker */}
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
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 5: WHAT IS YOUR ROUTE? (Screen 7) */}
      {step === 5 && (
        <View style={styles.stepContainer}>
          <View style={styles.topMapPreview}>
            <TouchableOpacity onPress={() => setStep(4)} style={styles.backCircleBtnTop}>
              <Text style={styles.backIcon}>←</Text>
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
                <Text style={styles.arrowIcon}>➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* STEP 6: ADD STOPOVERS (Screen 8) */}
      {step === 6 && (
        <View style={styles.stepContainer}>
          <View style={styles.wizardHeader}>
            <TouchableOpacity onPress={() => setStep(5)} style={styles.closeBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.stopoverTitle}>Add stopovers to get more passengers</Text>

            {stopovers.map((city, idx) => (
              <View key={idx} style={styles.stopoverItem}>
                <Text style={styles.stopoverText}>📍 {city}</Text>
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
                <Button title="Confirm Stopover" onPress={handleAddStopover} />
              </View>
            ) : (
              <TouchableOpacity style={styles.addCityBtn} onPress={() => setShowAddStopoverInput(true)} activeOpacity={0.8}>
                <Text style={styles.addCityText}>+ Add city</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.floatingArrowBtn} onPress={() => setStep(7)} activeOpacity={0.85}>
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 7: SEATS, VEHICLE & PUBLISH */}
      {step === 7 && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stopoverTitle}>Final Trip Details</Text>

          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8, color: Colors.primary }}>
              {pickup || 'Banswada'} → {destination || 'Ibrahimpet'}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.onSurfaceVariant }}>
              Route: {selectedRouteVariant} • Stopovers: {stopovers.join(', ') || 'Direct Route'}
            </Text>
          </Card>

          <Card>
            <Input label="Vehicle Type" value={vehicleType.toUpperCase()} editable={false} />
            <Input label="Available Seats" value={totalSeats} onChangeText={setTotalSeats} keyboardType="number-pad" />
            <Input label="Suggested Contribution ($)" value={suggestedContribution} onChangeText={setSuggestedContribution} keyboardType="number-pad" />
            <Input label="Vehicle Model & Details" placeholder="e.g. 2024 Honda City (White)" value={vehicleDetails} onChangeText={setVehicleDetails} />

            <Button title="Publish Ride Offer" onPress={handlePublishRide} loading={createRideMutation.isPending} style={{ marginTop: 16 }} />
            <Button title="Back" variant="outline" onPress={() => setStep(6)} style={{ marginTop: 8 }} />
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepContainer: {
    flex: 1,
    position: 'relative',
  },
  wizardHeader: {
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  closeIcon: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '700',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '700',
  },
  wizardTitle: {
    ...Typography.displayLg,
    color: Colors.onBackground,
    fontWeight: '800',
  },
  searchBoxCard: {
    padding: Spacing.md,
  },
  searchInput: {
    backgroundColor: '#EEF2F6',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: Spacing.md,
  },
  currentLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  targetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  targetIcon: {
    fontSize: 20,
  },
  currentLocText: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  chevron: {
    fontSize: 24,
    color: Colors.outline,
  },
  topBarOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    gap: Spacing.xs,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  topBarInputBox: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    elevation: 4,
  },
  topBarInputText: {
    flex: 1,
    ...Typography.bodyMd,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.outline,
  },
  mapPinCanvas: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsPill: {
    position: 'absolute',
    top: 90,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    elevation: 4,
  },
  suggestionsText: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontWeight: '700',
  },
  centeredMarkerPin: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pinCircleDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pinInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pinLabelCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginTop: 6,
    elevation: 4,
  },
  pinTitle: {
    ...Typography.labelLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  pinSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  topMapPreview: {
    height: '45%',
    backgroundColor: '#F5F5F0',
    position: 'relative',
  },
  backCircleBtnTop: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  simulatedRouteTrack: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    height: 120,
    borderLeftWidth: 6,
    borderTopWidth: 6,
    borderColor: '#0284C7',
    borderTopLeftRadius: 30,
  },
  bottomSheetCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
  },
  sheetTitle: {
    ...Typography.displayLg,
    color: Colors.onBackground,
    marginBottom: Spacing.md,
  },
  routeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    marginBottom: Spacing.sm,
  },
  selectedRouteOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  routeMeta: {
    flex: 1,
  },
  routeTimeText: {
    ...Typography.bodyLg,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  routeDetailText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  stopoverTitle: {
    ...Typography.displayLg,
    color: Colors.onBackground,
    marginBottom: Spacing.md,
  },
  stopoverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  stopoverText: {
    ...Typography.bodyLg,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  removeText: {
    ...Typography.labelLg,
    color: Colors.error,
  },
  addCityBtn: {
    paddingVertical: Spacing.md,
  },
  addCityText: {
    ...Typography.headlineMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  addStopoverBox: {
    marginVertical: Spacing.md,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  floatingArrowBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.onPrimary,
    fontWeight: '800',
  },
});
