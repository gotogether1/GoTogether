---
title: Go Together --- Fix Default Route and Ride-Specific Map
---

# Objective

Remove the architectural cause of the default-route bug.

## Audit

Search for: - hardcoded Nizamabad/Hyderabad - hardcoded coordinates -
sample polyline - demo route - default pickup/dropoff - global route
state - stale AsyncStorage route - static map coordinates - route
constants - incorrect navigation params

Do not merely replace one hardcoded route with another.

## Correct flow

``` text
User input
↓
Ride Draft
↓
Google Routes API
↓
Selected route
↓
Create/update ride
↓
Database
↓
Ride ID
↓
Load exact ride
↓
Ride Details
↓
Interactive Map
```

## Map data

Map must consume:

``` text
ride.pickup
ride.dropoff
ride.stops
ride.selectedRoute.polyline
```

No global/default route.

Google calculates the route. The app sends the real user-selected
points, displays alternatives, saves the selected route and later
displays that saved route.

## Test

Ride A = Bodhan → Turrur. Ride B = Hyderabad → Mumbai. Each must show
its own route. No route may be shared accidentally.
