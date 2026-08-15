---
title: Go Together --- Chat Only After Booking
---

# Objective

Keep chat behavior simple: users can chat about a ride only after the
required booking/confirmed relationship exists according to the existing
booking lifecycle.

## Before booking

Users may view public ride details and existing passenger actions. They
must not receive unrestricted ride chat access.

## After booking

When the booking reaches the existing allowed confirmed/completed state,
the driver and passenger can chat.

Reuse the existing chat implementation. Do not create a second messaging
backend.

Conceptually:

``` text
canChat =
 booking exists
 AND booking belongs to current user
 AND booking has allowed status
```

Backend/WebSocket authorization must enforce this; hiding the UI button
is not enough.

Do not redesign the current chat UI.

## Acceptance

-   No booking → no ride chat.
-   Valid booking → chat available.
-   Driver can chat with valid passengers.
-   Passenger can chat with their driver.
-   Unrelated users cannot access ride chat.
