---
title: Go Together --- BlaBla Core Regression Checklist
---

# Driver publishing

-   [ ] Existing UI preserved.
-   [ ] Pickup dynamic.
-   [ ] Drop-off dynamic.
-   [ ] Stops preserved/working where already supported.
-   [ ] Google route alternatives use actual input.
-   [ ] Driver selects route.
-   [ ] Selected route persists.
-   [ ] Date works.
-   [ ] Time works.
-   [ ] CAR and BIKE work.
-   [ ] Capacity persists.
-   [ ] Ride publishes.

# Ownership

-   [ ] Every ride has driverId.
-   [ ] My Rides shows only own published rides.
-   [ ] Public/search results are not inserted into My Rides ownership
    state.
-   [ ] Booking does not change ride.driverId.
-   [ ] Owner does not see Book Seat/Negotiate passenger CTA.
-   [ ] Passenger sees appropriate actions.

# Find a Ride

-   [ ] Passenger search works.
-   [ ] Own rides excluded.
-   [ ] Other users' rides can match.
-   [ ] Intermediate A→B matching works.
-   [ ] Date/time matching works.
-   [ ] Seats work.
-   [ ] Route direction is enforced.

# Booking

-   [ ] Booking references rideId.
-   [ ] Booking references passengerId.
-   [ ] Seats update safely.
-   [ ] Duplicate booking is prevented.

# Chat

-   [ ] No booking = no ride chat.
-   [ ] Valid booking = chat.
-   [ ] Only related driver/passenger can chat.

# Maps

-   [ ] No global default route.
-   [ ] No hardcoded Nizamabad/Hyderabad route.
-   [ ] Ride A shows Ride A route.
-   [ ] Ride B shows Ride B route.
-   [ ] Pickup/drop-off/stops are correct.
-   [ ] Selected Google route is preserved.
-   [ ] Interactive map works.

# Final test

Aditya publishes Bodhan → Turrur, selects a Google route, date/time and
car. Aditya My Rides shows that ride with owner controls and no Book
Seat. Karan searches Nizamabad → Hyderabad. If matching, Aditya's ride
appears in Find a Ride. Karan can open details and use the existing
passenger action. Karan does not own the ride. Only after the required
booking state can Aditya and Karan use ride chat.
