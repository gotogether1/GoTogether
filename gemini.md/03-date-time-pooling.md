---
title: Go Together --- Pooling Date and Time
---

# Objective

Add the missing date/time step without redesigning the existing pooling
UI.

## Flow

``` text
Pickup
↓
Drop-off
↓
Stops
↓
Google route alternatives
↓
Select route
↓
Date
↓
Time
↓
Vehicle
↓
Capacity/options
↓
Publish
```

Store real:

``` text
departureDate
departureTime
timezone
```

Use existing model names if already present.

Date/time belongs to the ride or existing occurrence model, not the
user.

Find a Ride must filter by the stored date/time.

Preserve any existing multiple-date functionality; do not build an
unrelated recurring system.

## Acceptance

-   Driver can select date.
-   Driver can select time.
-   Values survive navigation.
-   Values are persisted.
-   Ride Details displays them.
-   Search uses them.
