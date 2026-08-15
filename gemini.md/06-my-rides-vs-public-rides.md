---
title: Go Together --- My Rides vs Public Rides
---

# Objective

Fix public rides appearing incorrectly inside My Rides.

## My Rides

My Rides means rides published by the current user:

``` text
WHERE ride.driverId = currentUserId
```

## Find a Ride

Find a Ride means published rides owned by other users that match
passenger criteria.

## Passenger bookings

If the UI has a booking/trips section, booked rides belong there as
passenger bookings, not as published rides in My Rides.

## Backend

Prefer separate semantics such as:

``` text
GET /rides/my
GET /rides/search
GET /bookings/my
```

Adapt to existing endpoint names.

Do not return every ride and ask the frontend to guess ownership.

## State audit

Check Zustand/Redux/context, AsyncStorage, query caches and navigation
params so public search results are not accidentally inserted into the
My Rides ownership state.

## Test

Aditya publishes Ride A. Karan publishes Ride B. Aditya My Rides = Ride
A. Karan My Rides = Ride B. Karan Find a Ride may show Ride A if it
matches, but Ride A is not Karan's My Ride.
