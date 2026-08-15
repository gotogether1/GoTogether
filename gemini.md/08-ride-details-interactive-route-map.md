---
title: Go Together --- Ride Details Interactive Route Map
---

# 1. Objective

Implement the interactive route map shown in the supplied reference
screenshots.

This feature is part of the previously defined Go Together ride
architecture and MUST connect to the existing:

-   Driver Pickup/Drop-off flow
-   Google Maps integration
-   Route Selection
-   Stored route/polyline
-   Ride publishing
-   Ride Details
-   Passenger search/matching
-   Booking
-   Vehicle type: CAR / BIKE

Do not create a separate mapping architecture.

------------------------------------------------------------------------

# 2. User flow

``` text
Driver creates ride
      ↓
Pickup
      ↓
Drop-off
      ↓
Route alternatives
      ↓
Driver selects route
      ↓
Selected route polyline is stored
      ↓
Ride is published
      ↓
Passenger opens Ride Details
      ↓
Small map icon beside pickup/drop-off
      ↓
RideRouteMapScreen
      ↓
Display the exact stored driver route
```

The map must display the route selected by the driver when publishing
the ride.

DO NOT calculate a new route merely because the passenger opened the
map.

------------------------------------------------------------------------

# 3. Ride Details screen

Beside the pickup and drop-off locations, display a small map icon.

Example:

``` text
Lake Merritt, Oakland       [map icon]

Financial District, SF      [map icon]
```

The icon must be tappable.

Recommended accessibility label:

``` text
View route on map
```

If the current Ride Details UI already has location rows, add the icon
to the existing component rather than creating a duplicate location
component.

------------------------------------------------------------------------

# 4. What happens when the icon is tapped

Open:

``` text
RideRouteMapScreen
```

The screen should contain:

``` text
┌─────────────────────────────┐
│ X                           │
│                             │
│                             │
│       INTERACTIVE MAP       │
│                             │
│   ● Driver pickup            │
│    ╲                         │
│     ╲ BLUE ROUTE             │
│      ╲                       │
│       ● Driver drop-off      │
│                             │
│                             │
│ [ Open in Google Maps ]      │
└─────────────────────────────┘
```

The map should occupy almost the entire screen.

------------------------------------------------------------------------

# 5. Interactive map requirements

The map is NOT a static image.

It must support the normal native map interactions supported by the
selected React Native/Expo Google Maps implementation:

-   pinch zoom
-   zoom in
-   zoom out
-   double-tap zoom where supported
-   pan/drag
-   two-finger gestures
-   rotate where supported
-   tilt where supported
-   map camera movement
-   automatic initial camera fitting

Do not disable gestures unless there is a specific UX reason.

------------------------------------------------------------------------

# 6. Initial camera

When the map opens:

1.  Read the stored driver route.
2.  Decode the stored encoded polyline.
3.  Calculate its geographic bounds.
4.  Include driver pickup and drop-off.
5.  Fit the map camera to the entire route.
6.  Add appropriate padding so markers are not hidden under UI.

Conceptually:

``` text
route polyline
     +
pickup coordinate
     +
drop-off coordinate
     ↓
calculateBounds()
     ↓
fitToCoordinates()
```

The entire route should normally be visible when the screen first opens.

For very long routes, use sensible maximum zoom-out behavior so the map
remains useful.

------------------------------------------------------------------------

# 7. Route source

The route shown here MUST come from the ride's stored selected route.

Use:

``` text
ride.route_polyline
ride.route_distance_meters
ride.route_duration_seconds
ride.route_summary
ride.route_tolls
```

and:

``` text
ride.pickup_latitude
ride.pickup_longitude
ride.dropoff_latitude
ride.dropoff_longitude
```

Do not call Google Directions/Routes API again just to redraw an already
published route.

This avoids:

-   unnecessary API calls
-   unnecessary API cost
-   route differences caused by current traffic/road changes
-   a passenger seeing a different route from the one selected by the
    driver

------------------------------------------------------------------------

# 8. Database contract

The published ride must contain enough information to reconstruct the
map.

Required:

``` text
pickup_latitude
pickup_longitude

dropoff_latitude
dropoff_longitude

route_provider
route_polyline
route_distance_meters
route_duration_seconds
route_summary
route_tolls
```

If the existing database already has these fields, reuse them.

Do not create duplicate route tables unless the existing architecture
requires normalized route storage.

------------------------------------------------------------------------

# 9. Route polyline

The selected route should be stored as an encoded polyline.

Example conceptual field:

``` text
route_polyline TEXT
```

Mobile:

``` text
encoded polyline
      ↓
decode
      ↓
[{ latitude, longitude }, ...]
      ↓
MapPolyline
```

The decoded coordinates should be used only for rendering/matching.

Do not store thousands of coordinate rows in the normal ride table
unless there is a specific backend requirement.

------------------------------------------------------------------------

# 10. Markers

At minimum show:

### Driver pickup

``` text
Pickup marker
```

### Driver drop-off

``` text
Drop-off marker
```

Use the existing Go Together map marker design if one already exists.

The marker positions MUST come from the stored coordinates, not
geocoding the displayed address again.

------------------------------------------------------------------------

# 11. Route appearance

Use a clearly visible route line.

Recommended visual hierarchy:

``` text
Map
   ↓
Route = strong blue line
   ↓
Markers = clearly distinguishable
```

The route must remain visible against the Google map background.

Do not use an extremely thin line.

Do not use a screenshot/image of the route.

Use a native map polyline.

------------------------------------------------------------------------

# 12. Passenger intermediate route

This feature MUST support Go Together's route-based pooling model.

Example:

``` text
Driver:
Hyderabad → Mumbai

Passenger:
Nizamabad → Nagpur
```

The passenger does NOT need the same endpoints as the driver.

The driver route remains the primary route shown on the
RideRouteMapScreen.

If the booking already contains passenger pickup/drop-off coordinates,
optionally show:

``` text
Driver pickup
       ↓
Passenger pickup
       ↓
Passenger drop-off
       ↓
Driver drop-off
```

The passenger's A → B segment can be highlighted separately if the final
UI design includes it.

This is especially useful because the passenger can visually understand
where they are joining and leaving the driver's route.

------------------------------------------------------------------------

# 13. Route order

The map screen must respect the route order already validated by the
matching system.

For example:

``` text
Hyderabad
   ↓
Nizamabad
   ↓
Nagpur
   ↓
Mumbai
```

Valid passenger:

``` text
Nizamabad → Nagpur
```

Invalid:

``` text
Mumbai → Hyderabad
```

Route order validation belongs to `RouteMatchingService`, not the map
UI.

The map is responsible for displaying the already validated data.

------------------------------------------------------------------------

# 14. Open in Google Maps

At the bottom of the screen show a prominent button:

``` text
↗ Open in Google Maps
```

The button should open Google Maps using the ride's actual
route/location information.

Use the existing URL/deep-link utility if Go Together already has one.

Do not invent a second external-navigation implementation.

If the Google Maps app is unavailable, fall back to an appropriate
web/maps URL according to the existing app architecture.

------------------------------------------------------------------------

# 15. Important distinction

There are TWO different map operations.

## A. In-app route viewing

Used when:

``` text
Passenger taps map icon
```

Display:

``` text
RideRouteMapScreen
```

with an interactive native map.

## B. External navigation

Used when:

``` text
Passenger taps Open in Google Maps
```

Launch Google Maps externally.

Do not automatically launch Google Maps when the small map icon is
tapped.

The user should first see the route inside Go Together.

------------------------------------------------------------------------

# 16. API requirements

Ride Details API must return route data required by the map.

Example:

``` json
{
  "id": "ride-id",
  "pickup": {
    "address": "Hyderabad",
    "latitude": 17.385,
    "longitude": 78.4867
  },
  "dropoff": {
    "address": "Mumbai",
    "latitude": 19.076,
    "longitude": 72.8777
  },
  "route": {
    "provider": "GOOGLE",
    "polyline": "encoded-polyline",
    "distanceMeters": 700000,
    "durationSeconds": 25200,
    "summary": "NH 44",
    "tolls": true
  }
}
```

Adapt this to the existing Go Together DTO/API naming.

Do not create a second Ride Details API if one already exists.

------------------------------------------------------------------------

# 17. Missing/corrupt route handling

The app must not crash if an old ride has no stored polyline.

Fallback:

``` text
route_polyline missing
      ↓
show pickup/drop-off markers
      ↓
show message:
"Route preview is unavailable for this ride."
      ↓
allow Open in Google Maps if coordinates exist
```

Do not silently calculate a different route unless the product
explicitly decides to support that fallback.

------------------------------------------------------------------------

# 18. Loading state

When opening the map:

``` text
Loading map...
```

The screen should not show a broken polyline while route data is
loading.

If route decoding fails:

``` text
Unable to display route
```

with a retry/close action where appropriate.

------------------------------------------------------------------------

# 19. Performance

Important:

-   do not request route calculation every time the screen opens
-   decode the polyline only when required
-   memoize decoded coordinates where appropriate
-   do not continuously update the route
-   do not poll Google Routes API for a static published ride
-   avoid unnecessary map re-renders
-   use stable marker/polyline references

For long routes, avoid unnecessary transformations of thousands of
coordinates on every render.

------------------------------------------------------------------------

# 20. Mobile architecture

Recommended structure:

``` text
RideDetailsScreen
       ↓
RideLocationRow
       ↓
MapIconButton
       ↓
RideRouteMapScreen
       ↓
RideRouteMap component
       ├── MapView
       ├── PickupMarker
       ├── DropoffMarker
       ├── RoutePolyline
       └── OpenInGoogleMapsButton
```

Services:

``` text
routeDisplayService
  ├── decodePolyline()
  ├── calculateBounds()
  └── buildGoogleMapsDeepLink()
```

Reuse the existing Maps service if available.

Do NOT create a second Google Maps API client.

------------------------------------------------------------------------

# 21. Integration with driver route selection

This feature is directly dependent on the earlier route-selection
implementation.

Driver:

``` text
Pickup
  ↓
Drop-off
  ↓
Route alternatives
  ↓
Driver selects Route #2
  ↓
routePolyline = Route #2 polyline
  ↓
Publish
```

Later:

``` text
Passenger
  ↓
Ride Details
  ↓
Map icon
  ↓
RideRouteMapScreen
  ↓
Render Route #2
```

Therefore the map screen is a consumer of the published route, not a
route calculator.

------------------------------------------------------------------------

# 22. Integration with passenger matching

The same stored route is used for:

``` text
RouteMatchingService
```

and:

``` text
RideRouteMapScreen
```

This is important.

The route used to determine:

``` text
Passenger A → B matches Driver route
```

must be the same published route that the passenger sees on the map.

This prevents:

``` text
Matching route ≠ displayed route
```

------------------------------------------------------------------------

# 23. Integration with booking

Before booking:

``` text
Passenger searches
      ↓
Matching algorithm finds driver route
      ↓
Passenger opens Ride Details
      ↓
Map shows driver's stored route
      ↓
Passenger understands route
      ↓
Passenger books
```

After booking, if passenger-specific coordinates are stored:

``` text
Booking
 ├── passenger pickup
 └── passenger drop-off
```

the RideRouteMapScreen can optionally display those points.

------------------------------------------------------------------------

# 24. Security

The route map endpoint must follow existing authorization rules.

A passenger should only receive data that is appropriate for a ride they
can view.

Never expose: - driver private information - internal database IDs
unnecessarily - authentication secrets - Google server-side API keys

Google Maps API keys must remain configured according to the existing
mobile/backend security architecture.

------------------------------------------------------------------------

# 25. QA checklist

## Map opening

-   [ ] Map icon appears beside pickup.
-   [ ] Map icon appears beside drop-off where applicable.
-   [ ] Tapping icon opens RideRouteMapScreen.
-   [ ] Back/close returns to Ride Details.

## Route display

-   [ ] Correct pickup marker.
-   [ ] Correct drop-off marker.
-   [ ] Correct stored route.
-   [ ] Polyline is clearly visible.
-   [ ] Entire route initially fits screen.
-   [ ] No unrelated route is generated.

## Gestures

-   [ ] Pinch zoom works.
-   [ ] Pan works.
-   [ ] Double-tap zoom works where supported.
-   [ ] Rotate works where supported.
-   [ ] Tilt works where supported.
-   [ ] Camera remains stable during gestures.

## External maps

-   [ ] Open in Google Maps button works.
-   [ ] Correct locations are passed.
-   [ ] Correct route endpoints are used.
-   [ ] App does not automatically leave Go Together when map icon is
    tapped.

## Pooling

-   [ ] Hyderabad → Mumbai driver route displays correctly.
-   [ ] Nizamabad → Nagpur passenger can see the driver's full route.
-   [ ] Passenger's A → B relationship to the route can be understood.
-   [ ] Displayed route is identical to the route used for matching.

## Error cases

-   [ ] Missing polyline does not crash.
-   [ ] Invalid polyline does not crash.
-   [ ] Missing coordinates are handled.
-   [ ] Network errors have a clear UI.
-   [ ] Old rides remain viewable.

------------------------------------------------------------------------

# 26. Final definition of done

The feature is complete only when this entire chain works:

``` text
DRIVER

Pickup
  ↓
Drop-off
  ↓
Google route alternatives
  ↓
Driver selects route
  ↓
Encoded polyline stored
  ↓
Ride published
```

then:

``` text
PASSENGER

Search Point A
  ↓
Search Point B
  ↓
Backend route matching
  ↓
Matching driver ride
  ↓
Ride Details
  ↓
Tap small map icon
  ↓
Interactive RideRouteMapScreen
  ↓
Exact stored driver route displayed
  ↓
Passenger zooms/pans/explores
  ↓
Open in Google Maps if desired
  ↓
Book ride
```

This must integrate with the existing Go Together architecture and must
not replace already-working implementations.
