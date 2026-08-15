import * as Location from 'expo-location';
import { GoTogetherLocation, PlaceAutocompleteSuggestion, RouteOption } from '../types/location';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Fallback regional locations for instant testing & seamless offline/keyless dev experience
const FALLBACK_PLACES: GoTogetherLocation[] = [
  {
    placeId: 'fallback-banswada',
    name: 'Banswada',
    address: 'Banswada, Kamareddy District, Telangana, India',
    latitude: 18.3842,
    longitude: 77.8821,
  },
  {
    placeId: 'fallback-ibrahimpet',
    name: 'Ibrahimpet',
    address: 'Ibrahimpet, Telangana 503187, India',
    latitude: 18.3965,
    longitude: 77.9124,
  },
  {
    placeId: 'fallback-devarakonda',
    name: 'Devarakonda',
    address: 'Devarakonda, Nalgonda District, Telangana, India',
    latitude: 16.6983,
    longitude: 78.9324,
  },
  {
    placeId: 'fallback-hyderabad',
    name: 'Hyderabad',
    address: 'Hyderabad, Telangana, India',
    latitude: 17.3850,
    longitude: 78.4867,
  },
  {
    placeId: 'fallback-gachibowli',
    name: 'Gachibowli Financial District',
    address: 'Gachibowli, Hyderabad, Telangana 500032, India',
    latitude: 17.4401,
    longitude: 78.3489,
  },
  {
    placeId: 'fallback-hitech-city',
    name: 'HITECH City',
    address: 'HITECH City, Madhapur, Hyderabad, Telangana, India',
    latitude: 17.4435,
    longitude: 78.3772,
  },
  {
    placeId: 'fallback-nizamabad',
    name: 'Nizamabad',
    address: 'Nizamabad, Telangana, India',
    latitude: 18.6725,
    longitude: 78.0941,
  },
  {
    placeId: 'fallback-warangal',
    name: 'Warangal',
    address: 'Warangal, Telangana, India',
    latitude: 17.9689,
    longitude: 79.5941,
  },
];

/**
 * Fetch Google Places Autocomplete Suggestions
 */
export async function fetchPlacesAutocomplete(query: string): Promise<PlaceAutocompleteSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();

  // If Google API Key is present, call Google Places API
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=geocode|establishment&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.predictions)) {
        return data.predictions.map((p: any) => ({
          placeId: p.place_id,
          name: p.structured_formatting?.main_text || p.description.split(',')[0],
          address: p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
        }));
      }
    } catch (err) {
      console.warn('Google Places Autocomplete API call failed, using fallback:', err);
    }
  }

  // Fallback search over regional list
  const matches = FALLBACK_PLACES.filter(
    p => p.name.toLowerCase().includes(cleanQuery) || p.address.toLowerCase().includes(cleanQuery)
  );

  return matches.map(p => ({
    placeId: p.placeId || `loc-${p.latitude}-${p.longitude}`,
    name: p.name,
    address: p.address,
    secondaryText: p.address.replace(`${p.name}, `, ''),
  }));
}

/**
 * Get Location details from placeId or geocode place name
 */
export async function fetchPlaceDetails(placeId: string, fallbackName?: string): Promise<GoTogetherLocation> {
  const match = FALLBACK_PLACES.find(p => p.placeId === placeId);
  if (match) return match;

  if (GOOGLE_MAPS_API_KEY) {
    // First try Google Place Details API by place_id
    if (placeId && !placeId.startsWith('fallback-') && !placeId.startsWith('loc-')) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.result && data.result.geometry) {
          const r = data.result;
          return {
            placeId: r.place_id,
            name: r.name || fallbackName || 'Selected Location',
            address: r.formatted_address || '',
            latitude: r.geometry.location.lat,
            longitude: r.geometry.location.lng,
          };
        }
      } catch (err) {
        console.warn('Google Place Details API failed, trying Geocoding API:', err);
      }
    }

    // Secondary try Google Geocoding API by address string
    if (fallbackName || placeId) {
      try {
        const queryText = fallbackName || placeId;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(queryText)}&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const topResult = data.results[0];
          return {
            placeId: topResult.place_id,
            name: topResult.address_components?.[0]?.long_name || fallbackName || 'Selected Location',
            address: topResult.formatted_address,
            latitude: topResult.geometry.location.lat,
            longitude: topResult.geometry.location.lng,
          };
        }
      } catch (err) {
        console.warn('Google Geocoding address fetch failed:', err);
      }
    }
  }

  return {
    placeId,
    name: fallbackName || 'Selected Location',
    address: `${fallbackName || 'Selected Point'}, Telangana, India`,
    latitude: 17.3850, // Default to Telangana hub (Hyderabad) instead of hardcoding Banswada
    longitude: 78.4867,
  };
}

/**
 * Reverse Geocode coordinates to readable address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GoTogetherLocation> {
  // Try Google Geocoding API if key exists
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const topResult = data.results[0];
        const mainName = topResult.address_components?.[0]?.long_name || 'Selected Point';
        return {
          placeId: topResult.place_id,
          name: mainName,
          address: topResult.formatted_address,
          latitude,
          longitude,
        };
      }
    } catch (err) {
      console.warn('Google Reverse Geocoding failed:', err);
    }
  }

  // Fallback using Expo Location native geocoder (only if permission granted)
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const name = addr.name || addr.street || addr.district || addr.city || 'Selected Location';
        const formatted = [addr.name, addr.street, addr.subregion, addr.city, addr.region, addr.country]
          .filter(Boolean)
          .join(', ');

        return {
          name,
          address: formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          latitude,
          longitude,
        };
      }
    }
  } catch {
    // Silence location permission rejection on emulator
  }

  // General coordinate fallback
  return {
    name: 'Pinned Point',
    address: `Point at ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
    latitude,
    longitude,
  };
}

/**
 * Get current device GPS location
 */
export async function getCurrentDeviceLocation(): Promise<GoTogetherLocation> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const geocoded = await reverseGeocode(lat, lng);
    return {
      ...geocoded,
      name: geocoded.name !== 'Pinned Point' ? geocoded.name : 'Current Location',
    };
  } catch (err) {
    console.warn('Current device GPS failed, returning default location:', err);
    return FALLBACK_PLACES[0];
  }
}

/**
 * Calculate distance between two coordinates in Kilometers (Haversine Formula)
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculate Driving Routes between Pickup and Destination using Google Routes API / Directions API
 */
export async function calculateRoutes(
  origin: GoTogetherLocation,
  destination: GoTogetherLocation
): Promise<RouteOption[]> {
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.routes) && data.routes.length > 0) {
        return data.routes.map((r: any, idx: number) => {
          const leg = r.legs[0];
          const distKm = Math.round((leg.distance?.value || 0) / 100) / 10;
          const durationMin = Math.round((leg.duration?.value || 0) / 60);
          const hasTolls = (r.warnings || []).some((w: string) => w.toLowerCase().includes('toll'));

          return {
            id: `google-route-${idx}`,
            summary: leg.summary || r.summary || (idx === 0 ? 'Fastest Route' : 'Alternative Route'),
            distanceKm: distKm || calculateHaversineDistanceKm(origin.latitude, origin.longitude, destination.latitude, destination.longitude),
            durationMins: durationMin || 16,
            hasTolls,
            viaRoads: r.summary ? `${distKm} km - ${r.summary}` : `${distKm} km - NH 765D`,
          };
        });
      }
    } catch (err) {
      console.warn('Google Directions API call failed, generating calculated fallback routes:', err);
    }
  }

  // Calculate realistic route options based on actual coordinates distance
  const baseDistance = calculateHaversineDistanceKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  const roundedDist = Math.max(Math.round(baseDistance * 1.2 * 10) / 10, 9);
  const durationEst = Math.max(Math.round((roundedDist / 40) * 60), 16);

  return [
    {
      id: 'route-fastest',
      summary: 'Fastest Route',
      distanceKm: roundedDist,
      durationMins: durationEst,
      hasTolls: false,
      viaRoads: `${roundedDist} km - NH 765D`,
    },
    {
      id: 'route-shortest',
      summary: 'Shortest Route',
      distanceKm: Math.max(Math.round((roundedDist - 2) * 10) / 10, 7),
      durationMins: durationEst + 1,
      hasTolls: false,
      viaRoads: `${Math.max(Math.round((roundedDist - 2) * 10) / 10, 7)} km - NH 765D and Ibrahimpet Rd`,
    },
  ];
}
