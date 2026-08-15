---
title: Go Together --- Find a Ride and Booking
---

# Objective

Make passenger discovery behave like the BlaBla-style pooling model.

## Search

Passenger provides:

``` text
Pickup A
Drop-off B
Date
Time
Seats
```

Search published rides.

## Exclude own rides

Exclude:

``` text
ride.driverId == currentUserId
```

A user should not discover their own ride as a passenger.

## Route matching

Exact endpoints are not required.

Example driver:

``` text
Bodhan → Nizamabad → Kamareddy → Hyderabad → Turrur
```

Passenger:

``` text
Nizamabad → Hyderabad
```

can match.

Passenger:

``` text
Hyderabad → Nizamabad
```

should not match when direction is reversed.

Check:

``` text
different user
ride active
date compatible
time compatible
seats available
pickup near driver route
drop-off near driver route
pickup occurs before drop-off along driver route
```

Backend is the source of truth.

## Booking

``` text
Ride Details
↓
Book Seat
↓
backend validation
↓
seat availability
↓
create booking
↓
atomic seat reservation
```

Booking must reference the ride and passenger; it must never change
`ride.driverId`.

## Negotiation

If the existing UI already supports negotiation, preserve it and expose
it only in the appropriate passenger/driver relationship. Do not add a
new negotiation architecture.
