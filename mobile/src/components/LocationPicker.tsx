import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoTogetherLocation, PlaceAutocompleteSuggestion } from '../types/location';
import {
  fetchPlacesAutocomplete,
  fetchPlaceDetails,
  reverseGeocode,
  getCurrentDeviceLocation,
} from '../services/locationService';
import { Colors, Spacing, Typography } from '../theme';

interface LocationPickerProps {
  title: string;
  placeholder?: string;
  initialLocation?: GoTogetherLocation;
  onConfirm: (location: GoTogetherLocation) => void;
  onBack?: () => void;
}

export function LocationPicker({
  title,
  placeholder = 'Enter the full address',
  initialLocation,
  onConfirm,
  onBack,
}: LocationPickerProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [selectedLocation, setSelectedLocation] = useState<GoTogetherLocation>(
    initialLocation || {
      placeId: 'default-hyderabad',
      name: 'Hyderabad',
      address: 'Hyderabad, Telangana, India',
      latitude: 17.3850,
      longitude: 78.4867,
    }
  );

  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || selectedLocation.address);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [geocodingMap, setGeocodingMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sync searchQuery when selectedLocation changes
  useEffect(() => {
    if (selectedLocation && selectedLocation.address) {
      setSearchQuery(selectedLocation.address);
    }
  }, [selectedLocation]);

  // Animate MapView camera when selectedLocation changes
  useEffect(() => {
    if (mapRef.current && selectedLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500
      );
    }
  }, [selectedLocation.latitude, selectedLocation.longitude]);

  // Debounced Places Autocomplete Search
  useEffect(() => {
    if (!isSearching || !searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await fetchPlacesAutocomplete(searchQuery);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearching]);

  const handleSelectSuggestion = async (s: PlaceAutocompleteSuggestion) => {
    setIsSearching(false);
    setSearchQuery(s.address);
    setLoadingSuggestions(true);

    try {
      const details = await fetchPlaceDetails(s.placeId, s.name || s.address);
      setSelectedLocation(details);
    } catch {
      setSelectedLocation(prev => ({
        ...prev,
        placeId: s.placeId,
        name: s.name,
        address: s.address,
      }));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsSearching(false);
    setLoadingSuggestions(true);
    try {
      const gpsLocation = await getCurrentDeviceLocation();
      setSelectedLocation(gpsLocation);
      setSearchQuery(gpsLocation.name || gpsLocation.address);
    } catch {
      // fallback
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRegionChangeComplete = async (region: { latitude: number; longitude: number }) => {
    // Only reverse geocode if moved away significantly
    const dist = Math.abs(region.latitude - selectedLocation.latitude) + Math.abs(region.longitude - selectedLocation.longitude);
    if (dist < 0.0003) return;

    setGeocodingMap(true);
    try {
      const revGeocoded = await reverseGeocode(region.latitude, region.longitude);
      setSelectedLocation(revGeocoded);
    } catch {
      setSelectedLocation(prev => ({
        ...prev,
        latitude: region.latitude,
        longitude: region.longitude,
      }));
    } finally {
      setGeocodingMap(false);
    }
  };

  const headerPaddingTop = Math.max(insets.top, 16) + 4;
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      {/* Search & Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: headerPaddingTop }]}>
        <View style={styles.topHeaderRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* Input Field with Clear Button */}
        <View style={styles.inputCard}>
          <Ionicons name="search-outline" size={18} color={Colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={txt => {
              setSearchQuery(txt);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            onSubmitEditing={async () => {
              if (searchQuery.trim().length > 2) {
                setIsSearching(false);
                setLoadingSuggestions(true);
                try {
                  const details = await fetchPlaceDetails(searchQuery.trim(), searchQuery.trim());
                  setSelectedLocation(details);
                } finally {
                  setLoadingSuggestions(false);
                }
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setIsSearching(true);
              }}
              style={styles.clearBtn}
            >
              <Ionicons name="close-circle" size={18} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Places Autocomplete Suggestions Dropdown */}
        {isSearching && (
          <View style={styles.autocompleteDropdown}>
            <TouchableOpacity style={styles.currentLocRow} onPress={handleUseCurrentLocation} activeOpacity={0.8}>
              <View style={styles.targetIconCircle}>
                <Ionicons name="locate-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.currentLocText}>Use current location</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
            </TouchableOpacity>

            {loadingSuggestions ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loaderText}>Searching Google Places...</Text>
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.suggestionsList}>
                {suggestions.map(s => (
                  <TouchableOpacity
                    key={s.placeId}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(s)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location-outline" size={18} color={Colors.primary} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionName} numberOfLines={1}>{s.name}</Text>
                      <Text style={styles.suggestionAddress} numberOfLines={1}>{s.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Native Interactive Map Canvas with Fixed Center Pin */}
      <View style={styles.mapCanvas}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* Tile Layer Overlay guaranteeing full street maps load in Expo Go & Standalone */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
        </MapView>

        {/* Fixed Center Pin & Location Card */}
        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={styles.locationBadgeCard}>
            <Text style={styles.badgeTitle} numberOfLines={1}>{selectedLocation.name}</Text>
            <Text style={styles.badgeSubtitle} numberOfLines={1}>{selectedLocation.address}</Text>
            {geocodingMap && <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 2 }} />}
          </View>

          <View style={styles.pinCircleDark}>
            <View style={styles.pinInnerDot} />
          </View>
          <View style={styles.pinShadow} />
        </View>

        <View style={styles.dragHintPill}>
          <Ionicons name="hand-right-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.dragHintText}>Move map to refine pin location</Text>
        </View>

        {/* GPS Locate Button */}
        <TouchableOpacity
          style={styles.gpsLocateBtn}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </TouchableOpacity>

        {/* Floating Confirm Button (Blue Arrow Button) */}
        <View style={[styles.bottomBarContainer, { paddingBottom: bottomInset }]}>
          <TouchableOpacity
            style={styles.floatingArrowBtn}
            onPress={() => onConfirm(selectedLocation)}
            activeOpacity={0.88}
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
  headerContainer: {
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
    paddingBottom: Spacing.sm,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    ...Typography.headlineLg,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: Spacing.sm,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...Typography.bodyLg,
    fontSize: 14.5,
    color: Colors.onSurface,
  },
  clearBtn: {
    padding: 4,
  },
  autocompleteDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  currentLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  targetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  currentLocText: {
    ...Typography.labelLg,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 8,
  },
  loaderText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  suggestionsList: {
    maxHeight: 180,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionName: {
    ...Typography.labelLg,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  suggestionAddress: {
    ...Typography.bodyMd,
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  locationBadgeCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    maxWidth: 280,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeTitle: {
    ...Typography.labelLg,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurface,
    textAlign: 'center',
  },
  badgeSubtitle: {
    ...Typography.bodyMd,
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
  pinCircleDark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  pinInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
  },
  pinShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 4,
  },
  dragHintPill: {
    position: 'absolute',
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dragHintText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gpsLocateBtn: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 25,
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
