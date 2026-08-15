---
title: Go Together --- BlaBla Core Architecture Repair
---

# Objective

Repair the existing Go Together application so its core behavior follows
the BlaBla-style carpool model. Preserve the existing UI, navigation,
components, branding and working functionality. The only product-level
addition beyond the BlaBla-style model is BIKE POOLING.

## Non-negotiable rules

1.  Inspect the existing implementation before changing code.
2.  Reuse existing UI/components/services.
3.  Do not redesign the current UI.
4.  Do not create duplicate authentication, Maps, API, ride or booking
    systems.
5.  Never hardcode locations or routes.
6.  Every published ride belongs to the user who published it.
7.  Public/search rides must not become part of another user's My Rides
    ownership list.
8.  Owner/driver controls and passenger controls must be separated.
9.  Chat is available only after the required booking/confirmed
    relationship exists.
10. Add the missing pooling date/time step.
11. Fix database relationships and data binding rather than screen-only
    hacks.

## Core model

``` text
User
 ├── Published Rides (driverId = user.id)
 │    └── Ride
 │         ├── pickup
 │         ├── destination
 │         ├── stops
 │         ├── selected Google route
 │         ├── date/time
 │         ├── vehicle
 │         └── seats
 └── Passenger Bookings
      └── Booking → Ride
```

Example: Aditya publishes Bodhan → Turrur. The ride has
`driverId=Aditya`. Karan searches Nizamabad → Hyderabad. If the ride
matches, Karan sees it in Find a Ride and may book it. Karan does not
own the ride and it must not appear in Karan's My Rides as a published
ride.

Read and implement all accompanying MD specifications, adapting names to
the existing codebase.
