import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoTogetherLocation, RouteOption } from '../types/location';
import { calculateRoutes } from '../services/locationService';
import { Colors, Spacing, Typography } from '../theme';

interface RouteSelectorProps {
  origin: GoTogetherLocation;
  destination: GoTogetherLocation;
  onSelectRoute: (route: RouteOption) => void;
  onBack?: () => void;
}

export function RouteSelector({ origin, destination, onSelectRoute, onBack }: RouteSelectorProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutes() {
      setLoading(true);
      try {
        const calculated = await calculateRoutes(origin, destination);
        setRoutes(calculated);
        if (calculated.length > 0) {
          setSelectedRouteId(calculated[0].id);
        }
      } catch {
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    }
    loadRoutes();
  }, [origin, destination]);

  useEffect(() => {
    if (mapRef.current && origin && destination) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        }
      );
    }
  }, [origin, destination]);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const headerPaddingTop = Math.max(insets.top, 16) + 4;
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      {/* Top Map Preview Canvas */}
      <View style={styles.topMapCanvas}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: (origin.latitude + destination.latitude) / 2,
            longitude: (origin.longitude + destination.longitude) / 2,
            latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 1.5 || 0.05,
            longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 1.5 || 0.05,
          }}
        >
          {/* Pickup Marker */}
          <Marker
            coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
            title={origin.name}
            description={origin.address}
            pinColor="#2563EB"
          />

          {/* Dropoff Marker */}
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title={destination.name}
            description={destination.address}
            pinColor="#10B981"
          />

          {/* Connecting Route Line */}
          <Polyline
            coordinates={[
              { latitude: origin.latitude, longitude: origin.longitude },
              { latitude: destination.latitude, longitude: destination.longitude },
            ]}
            strokeColor="#2563EB"
            strokeWidth={4}
          />
        </MapView>

        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backCircleBtn, { top: headerPaddingTop }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
        )}

        {/* Top Progress Line Indicator */}
        <View style={[styles.progressTrack, { top: headerPaddingTop + 8 }]}>
          <View style={styles.progressBarActive} />
        </View>
      </View>

      {/* Bottom Sheet Card: What is your route? */}
      <View style={[styles.bottomSheetCard, { paddingBottom: bottomInset + 70 }]}>
        <Text style={styles.sheetTitle}>What is your route?</Text>

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loaderText}>Calculating Google Routes...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {routes.map(r => {
              const isSelected = r.id === selectedRouteId;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.routeOptionRow, isSelected && styles.selectedRouteOption]}
                  onPress={() => setSelectedRouteId(r.id)}
                  activeOpacity={0.88}
                >
                  <View style={[styles.radioCircle, isSelected && styles.selectedRadio]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.routeMeta}>
                    <Text style={styles.routeTimeText}>
                      {r.durationMins} min - {r.hasTolls ? 'Has tolls' : 'No tolls'}
                    </Text>
                    <Text style={styles.routeDetailText}>{r.viaRoads}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Floating Confirm Button (Blue Arrow Button) */}
        <View style={[styles.bottomBarContainer, { bottom: bottomInset }]}>
          <TouchableOpacity
            style={styles.floatingArrowBtn}
            onPress={() => selectedRoute && onSelectRoute(selectedRoute)}
            activeOpacity={0.88}
            disabled={!selectedRoute}
          >
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topMapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backCircleBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
  },
  progressTrack: {
    position: 'absolute',
    left: 70,
    right: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 20,
    overflow: 'hidden',
  },
  progressBarActive: {
    width: '65%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: '48%',
  },
  sheetTitle: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 10,
  },
  loaderText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  routeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  selectedRouteOption: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
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
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  routeDetailText: {
    ...Typography.bodyMd,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  bottomBarContainer: {
    position: 'absolute',
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
