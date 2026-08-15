import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleMapView } from './GoogleMapView';
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
  placeholder = 'Search location',
  initialLocation,
  onConfirm,
  onBack,
}: LocationPickerProps) {
  const insets = useSafeAreaInsets();

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
      setSearchQuery(details.address || details.name);
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
      setSearchQuery(gpsLocation.address || gpsLocation.name);
    } catch {
      // fallback
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCenterChange = async (lat: number, lng: number) => {
    const dist = Math.abs(lat - selectedLocation.latitude) + Math.abs(lng - selectedLocation.longitude);
    if (dist < 0.0002) return;

    setGeocodingMap(true);
    try {
      const revGeocoded = await reverseGeocode(lat, lng);
      setSelectedLocation(revGeocoded);
      if (!isSearching) {
        setSearchQuery(revGeocoded.address || revGeocoded.name);
      }
    } catch {
      setSelectedLocation(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    } finally {
      setGeocodingMap(false);
    }
  };

  const headerPaddingTop = Math.max(insets.top, 16) + 4;
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      {/* Floating Pill Search & Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: headerPaddingTop }]}>
        <View style={styles.inputCard}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={22} color="#0F172A" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search-outline" size={18} color={Colors.primary} style={styles.searchIcon} />
          )}

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
                  setSearchQuery(details.address || details.name);
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
              <Ionicons name="close" size={20} color="#64748B" />
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
                <Text style={styles.loaderText}>Searching locations...</Text>
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

      {/* Real Interactive Google Map Canvas with Fixed Center Pin */}
      <View style={styles.mapCanvas}>
        <GoogleMapView
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          onCenterChange={handleCenterChange}
        />

        {/* Fixed Center Pin 📍 Location Marker & Card */}
        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={styles.locationBadgeCard}>
            <Text style={styles.badgeTitle} numberOfLines={1}>{selectedLocation.name}</Text>
            <Text style={styles.badgeSubtitle} numberOfLines={1}>{selectedLocation.address}</Text>
            {geocodingMap && <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 2 }} />}
          </View>

          {/* Red 📍 Location Pin Marker */}
          <View style={styles.redPinWrapper}>
            <Ionicons name="location" size={44} color="#EF4444" />
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* GPS Locate Button (Clean Stack Position) */}
        <TouchableOpacity
          style={[styles.gpsLocateBtn, { bottom: bottomInset + 80 }]}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </TouchableOpacity>

        {/* Floating Confirm Button (Blue Arrow Button - Clean Bottom Position) */}
        <View style={[styles.bottomBarContainer, { paddingBottom: bottomInset + 10 }]}>
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
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  backBtn: {
    paddingRight: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...Typography.bodyLg,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  autocompleteDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 8,
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
    backgroundColor: '#74BBE3',
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
    marginBottom: 6,
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
  redPinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    marginTop: -8,
  },
  gpsLocateBtn: {
    position: 'absolute',
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
    right: 20,
    zIndex: 30,
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
