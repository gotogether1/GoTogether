import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleMapView } from './GoogleMapView';
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

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const headerPaddingTop = Math.max(insets.top, 16) + 4;
  const bottomInset = Math.max(insets.bottom, 16);

  // Map route objects directly to GoogleMapView polylines format
  const routePolylines = routes.map(r => ({
    id: r.id,
    points: r.polylinePoints && r.polylinePoints.length > 0
      ? r.polylinePoints
      : [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: (origin.latitude + destination.latitude) / 2, longitude: (origin.longitude + destination.longitude) / 2 },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
  }));

  return (
    <View style={styles.container}>
      {/* Interactive Top Google Map Canvas */}
      <View style={styles.topMapCanvas}>
        <GoogleMapView
          latitude={(origin.latitude + destination.latitude) / 2}
          longitude={(origin.longitude + destination.longitude) / 2}
          zoom={9}
          isProgrammatic={true}
          pickupCoords={{ latitude: origin.latitude, longitude: origin.longitude, name: origin.name }}
          dropoffCoords={{ latitude: destination.latitude, longitude: destination.longitude, name: destination.name }}
          routes={routePolylines}
          activeRouteId={selectedRouteId}
        />

        {/* Clean Header Back Button (Progress Bar Line Removed as requested) */}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backCircleBtn, { top: headerPaddingTop }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Floating Bottom Sheet Card: "What is your route?" */}
      <View style={[styles.bottomSheetCard, { paddingBottom: bottomInset + 12 }]}>
        <View style={styles.bottomSheetHeaderRow}>
          <Text style={styles.bottomSheetTitle}>What is your route?</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Calculating best routes...</Text>
          </View>
        ) : (
          <ScrollView style={styles.routesScroll} showsVerticalScrollIndicator={false}>
            {routes.map(r => {
              const isSelected = r.id === selectedRouteId;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.routeCardOption, isSelected && styles.routeCardOptionSelected]}
                  onPress={() => setSelectedRouteId(r.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radioButtonOuter, isSelected && styles.radioButtonOuterSelected]}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>

                  <View style={styles.routeCardTextGroup}>
                    <Text style={styles.routeMainTitle}>
                      {r.durationMins >= 60
                        ? `${Math.floor(r.durationMins / 60)} hr ${r.durationMins % 60 > 0 ? `${r.durationMins % 60} min` : ''}`
                        : `${r.durationMins} min`}{' '}
                      - {r.hasTolls ? 'Tolls' : 'No tolls'}
                    </Text>
                    <Text style={styles.routeSubDetails}>{r.viaRoads}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Clean Non-Overlapping Floating Confirm Arrow Button (Bottom Right) */}
        {selectedRoute && (
          <TouchableOpacity
            style={[styles.floatingConfirmArrowBtn, { bottom: bottomInset + 16 }]}
            onPress={() => onSelectRoute(selectedRoute)}
            activeOpacity={0.88}
          >
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topMapCanvas: {
    flex: 1,
    backgroundColor: '#F5EFE6',
  },
  backCircleBtn: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 50,
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    maxHeight: '46%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
  },
  bottomSheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bottomSheetTitle: {
    ...Typography.headlineLg,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 10,
  },
  loadingText: {
    ...Typography.bodyMd,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  routesScroll: {
    maxHeight: 180,
    paddingRight: 4,
  },
  routeCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 64, // Extra right padding so route card text never overlaps with blue arrow button!
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  routeCardOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  radioButtonOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioButtonOuterSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  routeCardTextGroup: {
    flex: 1,
  },
  routeMainTitle: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  routeSubDetails: {
    ...Typography.bodyMd,
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  floatingConfirmArrowBtn: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 60,
  },
});
