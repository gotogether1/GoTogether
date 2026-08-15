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
  placeholder = 'Enter the full address',
  initialLocation,
  onConfirm,
  onBack,
}: LocationPickerProps) {
  const insets = useSafeAreaInsets();

  // Mode: 'search' (Screenshots 2,3,4) or 'map' (Interactive Map Canvas with Pin)
  const [viewMode, setViewMode] = useState<'search' | 'map'>('search');

  const [selectedLocation, setSelectedLocation] = useState<GoTogetherLocation>(
    initialLocation || {
      placeId: 'default-hyderabad',
      name: 'Hyderabad',
      address: 'Hyderabad, Telangana, India',
      latitude: 17.3850,
      longitude: 78.4867,
    }
  );

  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [geocodingMap, setGeocodingMap] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced Places Autocomplete Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
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
  }, [searchQuery]);

  const handleSelectSuggestion = async (s: PlaceAutocompleteSuggestion) => {
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
      setViewMode('map'); // Transition to Map view centered on selected place
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoadingSuggestions(true);
    try {
      const gpsLocation = await getCurrentDeviceLocation();
      setSelectedLocation(gpsLocation);
      setSearchQuery(gpsLocation.address || gpsLocation.name);
    } catch {
      // fallback
    } finally {
      setLoadingSuggestions(false);
      setViewMode('map'); // Transition to Map view centered on GPS location
    }
  };

  const handleCenterChange = async (lat: number, lng: number) => {
    const dist = Math.abs(lat - selectedLocation.latitude) + Math.abs(lng - selectedLocation.longitude);
    if (dist < 0.0002) return;

    setGeocodingMap(true);
    try {
      const revGeocoded = await reverseGeocode(lat, lng);
      setSelectedLocation(revGeocoded);
      setSearchQuery(revGeocoded.address || revGeocoded.name);
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

  // VIEW 1: SEARCH SCREEN (Matching Screenshots 2, 3 & 4)
  if (viewMode === 'search') {
    return (
      <View style={[styles.container, { paddingTop: headerPaddingTop }]}>
        {/* Top Header Bar */}
        <View style={styles.searchHeaderRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.topBackBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={26} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.screenTitle}>{title}</Text>

        {/* Search Input Box (Screenshot 2 & 3) */}
        <View style={[styles.searchInputBox, isFocused && styles.searchInputBoxActive]}>
          {isFocused ? (
            <TouchableOpacity onPress={() => setIsFocused(false)} style={{ marginRight: 8 }}>
              <Ionicons name="chevron-back" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search-outline" size={20} color={Colors.outline} style={{ marginRight: 10 }} />
          )}

          <TextInput
            style={styles.searchInputText}
            placeholder={placeholder}
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onSubmitEditing={async () => {
              if (searchQuery.trim().length > 2) {
                setLoadingSuggestions(true);
                try {
                  const details = await fetchPlaceDetails(searchQuery.trim(), searchQuery.trim());
                  setSelectedLocation(details);
                  setViewMode('map');
                } finally {
                  setLoadingSuggestions(false);
                }
              }
            }}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={20} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content Below Input */}
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.searchContentScroll}>
          {/* Always show "Use current location" option at top when focused or query empty (Screenshot 3) */}
          {(isFocused || searchQuery.trim().length < 2) && (
            <TouchableOpacity style={styles.useCurrentLocRow} onPress={handleUseCurrentLocation} activeOpacity={0.8}>
              <View style={styles.locateIconCircle}>
                <Ionicons name="locate-outline" size={20} color="#0F172A" />
              </View>
              <Text style={styles.useCurrentLocTitle}>Use current location</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
          )}

          {/* Loading Indicator */}
          {loadingSuggestions && (
            <View style={styles.suggestionsLoaderRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.suggestionsLoaderText}>Searching places...</Text>
            </View>
          )}

          {/* Autocomplete Suggestions List (Screenshot 4) */}
          {suggestions.map(s => (
            <TouchableOpacity
              key={s.placeId}
              style={styles.suggestionRowItem}
              onPress={() => handleSelectSuggestion(s)}
              activeOpacity={0.8}
            >
              <View style={styles.suggestionTextGroup}>
                <Text style={styles.suggestionMainTitle} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.suggestionSubAddress} numberOfLines={1}>{s.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // VIEW 2: INTERACTIVE MAP CANVAS WITH 📍 PIN (Triggered by selecting place or Use Current Location)
  return (
    <View style={styles.container}>
      {/* Top Floating Map Header Bar */}
      <View style={[styles.mapHeaderContainer, { paddingTop: headerPaddingTop }]}>
        <View style={styles.mapInputCard}>
          <TouchableOpacity onPress={() => setViewMode('search')} style={styles.mapBackBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity style={{ flex: 1 }} onPress={() => setViewMode('search')} activeOpacity={0.9}>
            <Text style={styles.mapInputText} numberOfLines={1}>
              {searchQuery || selectedLocation.address}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setViewMode('search')} style={{ padding: 4 }}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Real Interactive Google Map Canvas */}
      <View style={styles.mapCanvas}>
        <GoogleMapView
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          isProgrammatic={true}
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

        {/* GPS Locate Button (Bottom Right) */}
        <TouchableOpacity
          style={[styles.gpsLocateBtn, { bottom: bottomInset + 75 }]}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </TouchableOpacity>

        {/* Floating Next Button at Bottom Left */}
        <View style={[styles.bottomBarContainerLeft, { bottom: bottomInset + 75 }]}>
          <TouchableOpacity
            style={styles.nextPillBtn}
            onPress={() => onConfirm(selectedLocation)}
            activeOpacity={0.88}
          >
            <Text style={styles.nextPillText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeaderRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  topBackBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  screenTitle: {
    ...Typography.headlineLg,
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputBoxActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  searchInputText: {
    flex: 1,
    ...Typography.bodyLg,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  searchContentScroll: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  useCurrentLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locateIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  useCurrentLocTitle: {
    ...Typography.labelLg,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  suggestionsLoaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 8,
  },
  suggestionsLoaderText: {
    ...Typography.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  suggestionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  suggestionMainTitle: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  suggestionSubAddress: {
    ...Typography.bodyMd,
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  mapHeaderContainer: {
    paddingHorizontal: Spacing.md,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  mapInputCard: {
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
  mapBackBtn: {
    paddingRight: 6,
  },
  mapInputText: {
    ...Typography.bodyLg,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
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
  bottomBarContainerLeft: {
    position: 'absolute',
    left: 20,
    zIndex: 30,
  },
  nextPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    height: 48,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  nextPillText: {
    ...Typography.labelLg,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
