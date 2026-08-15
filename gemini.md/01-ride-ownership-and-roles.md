---
title: Go Together --- Ride Ownership and Roles
---

# Objective

Fix the core ownership model without changing UI design.

## Ownership

Every ride must have:

``` text
ride.id
ride.driverId
```

`driverId` is the authenticated user who published the ride.

## My Rides

My Rides is an ownership view:

``` text
ride.driverId == currentUserId
```

Do not put public/search rides into this collection.

## Find a Ride

Find a Ride searches published rides belonging to other users:

``` text
ride.driverId != currentUserId
```

and applies route/date/time/seat/status matching.

## Owner UI

When `currentUserId == ride.driverId`, show the existing owner/driver
controls such as Edit, Manage, Cancel, passenger management. Do NOT show
Book Seat or passenger Negotiate CTA.

## Passenger UI

When `currentUserId != ride.driverId`, show the existing passenger
actions such as Book Seat/Negotiate where already supported.

## Backend

Enforce ownership on the backend too. Do not trust frontend visibility.
A user cannot edit/cancel another user's ride or impersonate its driver.

## Acceptance

-   Aditya's published ride appears in Aditya's My Rides.
-   It does not appear as Karan's owned ride.
-   Karan can discover it through Find a Ride when it matches.
-   Aditya sees owner controls.
-   Karan sees passenger controls.
