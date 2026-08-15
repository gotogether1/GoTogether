import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleMapView } from '../../src/components/GoogleMapView';
import { SEED_RIDES } from '../../src/demo/seedData';
import { Colors, Spacing, Typography } from '../../src/theme';
import { safeBack } from '../../src/utils/navigation';

export default function RouteMapModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rideId, location } = useLocalSearchParams();
  const ride: any = SEED_RIDES.find(r => r.id === rideId) || SEED_RIDES[0];

  const targetLocation = (typeof location === 'string' && location) || ride.pickup;

  // Pickup & Dropoff Coordinates
  const pickupLat = ride.pickupLatitude || 17.3850;
  const pickupLng = ride.pickupLongitude || 78.4867;
  const dropoffLat = ride.dropoffLatitude || 18.6725;
  const dropoffLng = ride.dropoffLongitude || 78.0941;

  const handleOpenGoogleMaps = async () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropoffLat},${dropoffLng}&travelmode=driving`;

    try {
      const supported = await Linking.canOpenURL(mapsUrl);
      if (supported) {
        await Linking.openURL(mapsUrl);
      } else {
        await Linking.openURL(mapsUrl);
      }
    } catch {
      Alert.alert('Opening Google Maps', `Navigating from ${ride.pickup} to ${ride.destination}`);
    }
  };

  const topInsetPadding = Math.max(insets.top, 16) + 4;
  const bottomInsetPadding = Math.max(insets.bottom, 24);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={[styles.topBar, { paddingTop: topInsetPadding }]}>
        <TouchableOpacity onPress={() => safeBack(router)} style={styles.closeBtn} activeOpacity={0.8}>
          <Ionicons name="close" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.topTitleBox}>
          <Text style={styles.topTitle} numberOfLines={1}>{targetLocation}</Text>
          <Text style={styles.topSubtitle} numberOfLines={1}>{ride.pickup} → {ride.destination}</Text>
        </View>
      </View>

      {/* Real Interactive Route Map Canvas with Markers & Polyline */}
      <View style={styles.mapCanvasContainer}>
        <GoogleMapView
          latitude={(pickupLat + dropoffLat) / 2}
          longitude={(pickupLng + dropoffLng) / 2}
          zoom={10}
          isProgrammatic={true}
          pickupCoords={{ latitude: pickupLat, longitude: pickupLng, name: ride.pickup }}
          dropoffCoords={{ latitude: dropoffLat, longitude: dropoffLng, name: ride.destination }}
        />
      </View>

      {/* Floating Bottom Bar with "↗ Open in Google Maps" */}
      <View style={[styles.bottomFloatingBar, { paddingBottom: bottomInsetPadding }]}>
        <TouchableOpacity style={styles.openMapsBtn} onPress={handleOpenGoogleMaps} activeOpacity={0.88}>
          <Ionicons name="open-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.openMapsBtnText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 50,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topTitleBox: {
    flex: 1,
  },
  topTitle: {
    ...Typography.headlineLg,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  topSubtitle: {
    ...Typography.bodyMd,
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  mapCanvasContainer: {
    flex: 1,
    backgroundColor: '#74BBE3',
  },
  bottomFloatingBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    zIndex: 50,
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  openMapsBtnText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
