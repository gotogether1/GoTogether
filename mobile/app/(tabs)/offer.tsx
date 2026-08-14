import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function OfferRideScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<'carpool' | 'bike_pool'>('carpool');

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [departureDate, setDepartureDate] = useState('2026-08-15');
  const [departureTime, setDepartureTime] = useState('08:00 AM');

  const [totalSeats, setTotalSeats] = useState('3');
  const [suggestedContribution, setSuggestedContribution] = useState('10');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [rules, setRules] = useState('');
  const [notes, setNotes] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!pickup || !destination || !meetingPoint) {
        Alert.alert('Missing Route Information', 'Please provide pickup, destination, and meeting point.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!vehicleDetails) {
        Alert.alert('Vehicle Information Required', 'Please enter your vehicle or bike description.');
        return;
      }
      setStep(4);
    }
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      Alert.alert('Ride Published!', 'Your ride offer is now live for riders to search and request.');
      router.push('/(tabs)/dashboard');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Offer a Ride</Text>
          <Text style={styles.stepIndicator}>Step {step} of 4</Text>
        </View>

        {step === 1 && (
          <Card>
            <Text style={styles.stepTitle}>1. Select Trip Type</Text>
            <Text style={styles.stepSubtitle}>Are you driving a car or riding a bike?</Text>

            <TouchableOpacity
              style={[styles.typeOption, vehicleType === 'carpool' && styles.activeTypeOption]}
              onPress={() => setVehicleType('carpool')}
            >
              <Text style={styles.optionIcon}>🚗</Text>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Carpool</Text>
                <Text style={styles.optionDesc}>Offer seats in your car for passenger rides</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeOption, vehicleType === 'bike_pool' && styles.activeTypeOption]}
              onPress={() => setVehicleType('bike_pool')}
            >
              <Text style={styles.optionIcon}>🚲</Text>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Bike Pool</Text>
                <Text style={styles.optionDesc}>Pillion passenger ride on bicycle or motorcycle</Text>
              </View>
            </TouchableOpacity>

            <Button title="Continue to Route" onPress={handleNext} style={styles.nextBtn} />
          </Card>
        )}

        {step === 2 && (
          <Card>
            <Text style={styles.stepTitle}>2. Route & Schedule</Text>
            <Input label="Pickup Location *" placeholder="e.g. Downtown San Francisco" value={pickup} onChangeText={setPickup} />
            <Input label="Destination Location *" placeholder="e.g. Downtown San Jose" value={destination} onChangeText={setDestination} />
            <Input label="Public Meeting Point *" placeholder="e.g. Salesforce Transit Center Bay 4" value={meetingPoint} onChangeText={setMeetingPoint} />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input label="Date *" value={departureDate} onChangeText={setDepartureDate} />
              </View>
              <View style={styles.halfInput}>
                <Input label="Time *" value={departureTime} onChangeText={setDepartureTime} />
              </View>
            </View>

            <View style={styles.btnRow}>
              <Button title="Back" variant="outline" onPress={() => setStep(1)} style={styles.backBtn} />
              <Button title="Continue" onPress={handleNext} style={styles.continueBtn} />
            </View>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Text style={styles.stepTitle}>3. Capacity & Rules</Text>
            <Input label="Total Available Seats (1–4) *" value={totalSeats} onChangeText={setTotalSeats} keyboardType="number-pad" />
            <Input label="Suggested Contribution ($) (Optional)" value={suggestedContribution} onChangeText={setSuggestedContribution} keyboardType="number-pad" />
            <Input label="Vehicle Description *" placeholder="e.g. 2023 Tesla Model 3 (Blue)" value={vehicleDetails} onChangeText={setVehicleDetails} />
            <Input label="Luggage / Helmet Rules" placeholder="e.g. Small backpack allowed. Spare helmet provided." value={rules} onChangeText={setRules} />
            <Input label="Additional Notes" placeholder="e.g. Leaving punctually at 8:00 AM." value={notes} onChangeText={setNotes} multiline />

            <View style={styles.btnRow}>
              <Button title="Back" variant="outline" onPress={() => setStep(2)} style={styles.backBtn} />
              <Button title="Review Ride" onPress={handleNext} style={styles.continueBtn} />
            </View>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <Text style={styles.stepTitle}>4. Review & Publish</Text>
            <Text style={styles.summaryRoute}>{pickup} → {destination}</Text>
            <Text style={styles.summaryItem}>🚗 <Text style={styles.bold}>Type:</Text> {vehicleType.toUpperCase()}</Text>
            <Text style={styles.summaryItem}>📍 <Text style={styles.bold}>Meeting Point:</Text> {meetingPoint}</Text>
            <Text style={styles.summaryItem}>⏰ <Text style={styles.bold}>Schedule:</Text> {departureDate} at {departureTime}</Text>
            <Text style={styles.summaryItem}>💺 <Text style={styles.bold}>Seats:</Text> {totalSeats}</Text>
            <Text style={styles.summaryItem}>🚘 <Text style={styles.bold}>Vehicle:</Text> {vehicleDetails}</Text>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ℹ️ Go Together coordinates rides only. Suggested contributions are settled directly between rider and driver outside the app.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Button title="Back" variant="outline" onPress={() => setStep(3)} style={styles.backBtn} />
              <Button title="Publish Ride" onPress={handlePublish} loading={publishing} style={styles.continueBtn} />
            </View>
          </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  title: {
    ...Typography.displayLg,
    color: Colors.onBackground,
  },
  stepIndicator: {
    ...Typography.labelLg,
    color: Colors.primary,
  },
  stepTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainer,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  activeTypeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  optionDesc: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  backBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
  },
  nextBtn: {
    marginTop: Spacing.md,
  },
  summaryRoute: {
    ...Typography.headlineLg,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  summaryItem: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  bold: {
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: 12,
    marginVertical: Spacing.md,
  },
  disclaimerText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
