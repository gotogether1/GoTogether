export interface GoTogetherLocation {
  placeId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface PlaceAutocompleteSuggestion {
  placeId: string;
  name: string;
  address: string;
  secondaryText?: string;
}

export interface RouteOption {
  id: string;
  summary: string;
  distanceKm: number;
  durationMins: number;
  hasTolls: boolean;
  viaRoads: string;
  polylinePoints?: Array<{ latitude: number; longitude: number }>;
}
