---
title: Go Together --- Dynamic Locations, Stops and Google Routes
---

# Objective

Fix the bug where every ride shows one default route such as Nizamabad →
Hyderabad.

## Driver input

Pickup, destination and optional intermediate stops must come from the
current ride draft.

Example:

``` text
Bodhan → Nizamabad → Kamareddy → Turrur Mandal
```

Never use hardcoded/default/sample locations, stale state, previous-user
locations or a global route.

## Location data

Each location must contain at least:

``` text
address
latitude
longitude
placeId (when available)
```

## Stops

Stops belong to a specific ride:

``` text
rideStop.id
rideStop.rideId
rideStop.sequence
rideStop.address
rideStop.latitude
rideStop.longitude
rideStop.placeId
```

## Google routes

Send the actual pickup/destination/stops to the existing Google
Maps/Routes integration. Display the real route alternatives returned by
Google. Do not hardcode route names, distances, durations or polylines.

## Selected route

When the driver selects a route, persist it against that ride:

``` text
routeProvider
routePolyline
routeDistanceMeters
routeDurationSeconds
routeSummary
routeTolls
```

Never keep one global/default route.

## Ride Details

Opening ride R123 must load R123's pickup, destination, stops and
selected route. Do not load a route from profile, vehicle, previous
navigation state or app defaults.

## Acceptance

Publish: - Bodhan → Turrur - Nizamabad → Hyderabad - Hyderabad → Mumbai

Each ride must display its own locations and selected route.
