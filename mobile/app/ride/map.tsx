import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { SEED_RIDES } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';

export default function RouteMapModalScreen() {
  const router = useRouter();
  const { rideId, location } = useLocalSearchParams();
  const ride = SEED_RIDES.find(r => r.id === rideId) || SEED_RIDES[0];

  const targetLocation = location || ride.pickup;

  const handleOpenGoogleMaps = async () => {
    const origin = encodeURIComponent(ride.pickup);
    const destination = encodeURIComponent(ride.destination);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    try {
      const supported = await Linking.canOpenURL(mapsUrl);
      if (supported) {
        await Linking.openURL(mapsUrl);
      } else {
        await Linking.openURL(mapsUrl);
      }
    } catch {
      Alert.alert('Opening Google Maps', `Navigating to ${ride.pickup} → ${ride.destination}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.8}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topTitleBox}>
          <Text style={styles.topTitle}>{targetLocation}</Text>
          <Text style={styles.topSubtitle}>{ride.pickup} → {ride.destination}</Text>
        </View>
      </View>

      <View style={styles.mapCanvasContainer}>
        {/* Visual Simulated Route Map Canvas with Pins & Polylines */}
        <View style={styles.simulatedMapBg}>
          <View style={styles.gridLineHorizontal1} />
          <View style={styles.gridLineHorizontal2} />
          <View style={styles.gridLineVertical1} />

          {/* Route Polyline Track */}
          <View style={styles.routeTrack} />

          {/* Pickup Marker Pin */}
          <View style={styles.pickupMarker}>
            <View style={styles.markerCircleOuter}>
              <View style={styles.markerCircleInner} />
            </View>
            <View style={styles.markerCard}>
              <Text style={styles.markerTitle}>{ride.pickup}</Text>
              <Text style={styles.markerSubtitle}>📍 {ride.meetingPoint}</Text>
            </View>
          </View>

          {/* Destination Marker Pin */}
          <View style={styles.destinationMarker}>
            <View style={styles.destMarkerCircleOuter}>
              <View style={styles.destMarkerCircleInner} />
            </View>
            <View style={styles.destMarkerCard}>
              <Text style={styles.markerTitle}>{ride.destination}</Text>
              <Text style={styles.markerSubtitle}>🏁 Drop-off location</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomFloatingBar}>
        <Button
          title="↗ Open in Google Maps"
          onPress={handleOpenGoogleMaps}
          style={styles.openMapsBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAECEE',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
    zIndex: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  topTitleBox: {
    flex: 1,
  },
  topTitle: {
    ...Typography.headlineMd,
    color: Colors.onSurface,
  },
  topSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  mapCanvasContainer: {
    flex: 1,
    position: 'relative',
  },
  simulatedMapBg: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#FFFFFF',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#FFE082',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '45%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#FFFFFF',
  },
  routeTrack: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 180,
    height: 320,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderColor: '#0284C7',
    borderBottomLeftRadius: 40,
  },
  pickupMarker: {
    position: 'absolute',
    top: '22%',
    left: '18%',
    alignItems: 'center',
  },
  markerCircleOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  destinationMarker: {
    position: 'absolute',
    bottom: '22%',
    right: '18%',
    alignItems: 'center',
  },
  destMarkerCircleOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destMarkerCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  destMarkerCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  markerTitle: {
    ...Typography.labelLg,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  markerSubtitle: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
  },
  bottomFloatingBar: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
  },
  openMapsBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
