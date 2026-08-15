# Go Together --- Location Selection & Maps System

## Overview

Go Together will use a Google Maps-based location system similar to the
location selection experience used by ride-sharing and carpooling
applications.

The system will allow users to:

-   Select their current location automatically.
-   Search for pickup and drop locations.
-   Receive Google Places autocomplete suggestions while typing.
-   Select a suggested place.
-   Move the map and select an exact location using a fixed center pin.
-   Automatically convert the selected coordinates into a readable
    address.
-   Store latitude and longitude for accurate ride matching and distance
    calculations.

------------------------------------------------------------------------

## Technology Stack

  Requirement               Technology
  ------------------------- -------------------------------------------------
  Interactive map           Google Maps SDK
  Location search           Google Places API --- Places Autocomplete (New)
  Place information         Google Places API
  Current device location   Expo Location / device GPS
  Coordinates → address     Google Geocoding / reverse geocoding
  Route and distance        Google Routes API
  Mobile app                Expo + React Native
  Backend                   Go Together backend on Render
  Database                  Neon PostgreSQL

------------------------------------------------------------------------

## User Experience

### 1. Pickup Location

When the user opens the pickup-location screen:

``` text
┌─────────────────────────────┐
│ ←  Where are you going?     │
│                             │
│ 🔍 Search pickup location   │
│                             │
│ 📍 Use my current location  │
│                             │
│          Google Map         │
│                             │
│              📍             │
│                             │
└─────────────────────────────┘
```

The application should request the user's current location and initially
center the map around it.

------------------------------------------------------------------------

## 2. Search Location

When the user starts typing:

``` text
De
```

Google Places Autocomplete should return relevant suggestions.

Example:

``` text
📍 Devarakonda
   Telangana, India

📍 Delhi
   India

📍 Deccan
   Hyderabad, Telangana
```

The app should not implement its own location database for normal place
searching. Google Places should provide the autocomplete results.

------------------------------------------------------------------------

## 3. Selecting a Suggested Place

When the user selects a Google Places result, obtain and keep:

``` text
placeId
placeName
formattedAddress
latitude
longitude
```

Example:

``` json
{
  "placeId": "GOOGLE_PLACE_ID",
  "placeName": "Devarakonda",
  "formattedAddress": "Devarakonda, Telangana, India",
  "latitude": 16.XXXXXX,
  "longitude": 79.XXXXXX
}
```

The map should then move to the selected location.

------------------------------------------------------------------------

# 4. Move Map + Fixed Center Pin

Go Together should support an experience where the user can move the map
underneath a fixed center pin.

Concept:

``` text
                📍
             Fixed Pin
                │
        ┌───────────────┐
        │               │
        │   Google Map  │
        │               │
        │     MAP       │
        │               │
        └───────────────┘
```

The pin itself does not move.

The user moves the map.

When the map stops moving:

``` text
Map Center
    ↓
Latitude + Longitude
    ↓
Reverse Geocoding
    ↓
Readable Address
```

Example:

``` text
Latitude: 16.XXXXXX
Longitude: 79.XXXXXX

↓

Devarakonda, Telangana, India
```

This allows the user to select an exact pickup/drop point even when
there is no specific business or place available.

------------------------------------------------------------------------

# 5. Current Location

The location screen should provide:

``` text
📍 Use my current location
```

When selected:

1.  Request location permission if required.
2.  Read the device GPS coordinates.
3.  Center the Google Map on the user's location.
4.  Reverse geocode the coordinates.
5.  Display the detected address.
6.  Allow the user to adjust the map manually.

The user must always be able to correct the automatically detected
location.

------------------------------------------------------------------------

# 6. Confirm Location

After selecting a location:

``` text
┌─────────────────────────────┐
│      Selected Location      │
│                             │
│ 📍 Devarakonda              │
│    Telangana, India         │
│                             │
│ Latitude: 16.XXXXXX         │
│ Longitude: 79.XXXXXX        │
│                             │
│      [ Confirm Location ]   │
└─────────────────────────────┘
```

On confirmation, return the complete location object to the ride
creation screen.

------------------------------------------------------------------------

# 7. Location Data Model

The application should keep structured location data rather than storing
only an address string.

Recommended object:

``` typescript
interface GoTogetherLocation {
  placeId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}
```

For example:

``` json
{
  "placeId": "ChIJXXXXXXXX",
  "name": "Devarakonda",
  "address": "Devarakonda, Telangana, India",
  "latitude": 16.XXXXXX,
  "longitude": 79.XXXXXX
}
```

------------------------------------------------------------------------

# 8. Database Storage

For a ride, store pickup and drop locations separately.

Example:

``` text
pickup_name
pickup_address
pickup_latitude
pickup_longitude
pickup_place_id

drop_name
drop_address
drop_latitude
drop_longitude
drop_place_id
```

Do not depend only on:

``` text
"Devarakonda to Hyderabad"
```

Instead store:

``` text
Pickup:
latitude + longitude

Drop:
latitude + longitude
```

This is essential for ride matching and distance calculations.

------------------------------------------------------------------------

# 9. Ride Matching

The coordinates can later be used to find rides close to a user's
requested route.

Example:

``` text
User wants:

Devarakonda → Hyderabad
```

The backend can compare:

``` text
User pickup coordinates
        ↓
Existing ride pickup coordinates

User destination coordinates
        ↓
Existing ride destination coordinates
```

The system can then calculate geographic distance and identify suitable
rides.

------------------------------------------------------------------------

# 10. Route and Distance

For route calculations, use the Google Routes API.

It can be used for:

-   Driving distance.
-   Estimated travel time.
-   Route calculation.
-   Route matching.
-   Navigation-related information.

Example:

``` text
Pickup
  ↓
Google Routes API
  ↓
Distance: 105 km
Duration: 2 hr 15 min
```

The backend should not trust user-entered distance values.

Calculate important distance/time values from coordinates and routing
services.

------------------------------------------------------------------------

# 11. Recommended App Flow

``` text
Create Ride
     │
     ▼
Select Pickup
     │
     ├── Use Current Location
     │
     ├── Search Location
     │       │
     │       └── Places Autocomplete
     │
     └── Move Map
             │
             ▼
       Center Coordinates
             │
             ▼
       Reverse Geocoding
             │
             ▼
       Confirm Pickup
             │
             ▼
        Select Drop
             │
             ├── Search Location
             ├── Current Location
             └── Move Map
                     │
                     ▼
               Confirm Drop
                     │
                     ▼
             Calculate Route
                     │
                     ▼
              Create Ride
```

------------------------------------------------------------------------

# 12. API Architecture

The recommended architecture is:

``` text
                 Mobile App
              Expo / React Native
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
   Google Maps APIs            Go Together API
          │                         │
          │                         ▼
          │                  Render Backend
          │                         │
          │                         ▼
          │                    Neon PostgreSQL
          │
          ├── Places
          ├── Maps
          ├── Geocoding
          └── Routes
```

Google APIs should handle map/location-related operations.

The Go Together backend should handle:

-   Users.
-   Rides.
-   Ride matching.
-   Bookings.
-   Location data associated with rides.
-   Business/application logic.

------------------------------------------------------------------------

# 13. Security

Google API keys must be configured correctly.

Recommended approach:

### Mobile application key

Restrict the mobile key to:

-   Android application/package.
-   iOS application/bundle identifier, if iOS is supported.
-   Only the required Google APIs.

### Backend key

If server-side Google APIs are used, keep the server key in backend
environment variables.

Never hard-code sensitive server credentials inside the application
source code.

Example:

``` text
GOOGLE_MAPS_API_KEY=********
```

------------------------------------------------------------------------

# 14. Important Implementation Rules

### Rule 1 --- Store coordinates

Always store:

``` text
latitude
longitude
```

along with the address.

### Rule 2 --- Do not rely on address text

Addresses can vary in formatting.

Coordinates are more reliable for geographic calculations.

### Rule 3 --- Allow manual correction

GPS is not always accurate.

The user must be able to move the map and correct the location.

### Rule 4 --- Use autocomplete

Do not create a custom place-search database when Google Places can
provide the search results.

### Rule 5 --- Debounce search

Autocomplete requests should be debounced so that every individual
keystroke does not unnecessarily trigger an API request.

### Rule 6 --- Request only required place data

Use the required Google Places fields rather than requesting unnecessary
data.

### Rule 7 --- Separate display data from geographic data

Display:

``` text
Devarakonda, Telangana
```

Store:

``` text
latitude
longitude
placeId
```

------------------------------------------------------------------------

# 15. Go Together Location Component

The application should eventually have a reusable component similar to:

``` text
LocationPicker
```

Recommended responsibilities:

``` text
LocationPicker
│
├── Google Map
├── Search Bar
├── Places Autocomplete
├── Current Location Button
├── Fixed Center Pin
├── Reverse Geocoding
├── Selected Address
└── Confirm Button
```

It should return:

``` typescript
GoTogetherLocation
```

to the parent screen.

This component can then be reused for:

-   Pickup.
-   Drop.
-   Ride creation.
-   Ride editing.
-   Profile/home location.
-   Optional saved locations.

------------------------------------------------------------------------

# 16. Final Goal

The final Go Together location experience should feel similar to modern
mobility/carpooling applications:

``` text
Search Location
       ↓
Google Suggestions
       ↓
Select Place
       ↓
Map Opens
       ↓
Move Map if Necessary
       ↓
Fixed Pin Selects Exact Point
       ↓
Reverse Geocode
       ↓
Confirm Location
       ↓
Save Latitude + Longitude
       ↓
Use Coordinates for Ride Matching
```

The core technologies are:

**Google Maps SDK + Places Autocomplete + Device GPS + Reverse
Geocoding + Google Routes API.**

This provides the foundation for a professional BlaBlaCar/Rapido-style
location experience inside Go Together.
