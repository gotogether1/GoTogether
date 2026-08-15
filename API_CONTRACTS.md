# 🔌 GO TOGETHER — API CONTRACTS & REST SPECIFICATION

> **API Server Base URL**: `https://gotogether-backend-zceg.onrender.com`  
> **Authentication Header**: `Authorization: Bearer <Firebase_ID_Token>`  
> **Request / Response Body Format**: `application/json`  

---

## 1. Authentication & Profile Routes (`/v1/me`)

### `POST /v1/me/sync`
- **Access**: Authenticated
- **Description**: Synchronizes Firebase user session with Neon PostgreSQL `users` table.
- **Response `200 OK`**:
  ```json
  {
    "data": {
      "id": "usr_adithya_123",
      "firebaseUid": "fb_uid_adithya_123",
      "displayName": "Adithya",
      "email": "adithya@example.com",
      "averageRating": 5.00,
      "completedRideCount": 2
    }
  }
  ```

---

## 2. Ride Management Routes (`/v1/rides`)

### `GET /v1/rides`
- **Access**: Authenticated (Public Discovery)
- **Query Parameters**:
  - `pickup`: String (Pick-up city or waypoint name)
  - `destination`: String (Drop-off city or waypoint name)
  - `date`: YYYY-MM-DD (Scheduled travel date)
  - `vehicleType`: `'carpool'` \| `'bike_pool'` \| `'all'`
- **Filter Rules**:
  - `status = 'active'`
  - `available_seats > 0`
  - `departure_at >= CURRENT_TIMESTAMP - INTERVAL '15 minutes'`
  - `driver_id != authenticatedUserUid`
  - Direction sequence order (`pickupIndex < dropoffIndex`)

### `POST /v1/rides`
- **Access**: Authenticated
- **Request Body (Zod `createRideSchema`)**:
  ```json
  {
    "vehicleType": "carpool",
    "pickup": "Bodhan, Telangana",
    "destination": "Turrur Mandal, Telangana",
    "pickupLatitude": 18.6631,
    "pickupLongitude": 77.8994,
    "dropoffLatitude": 17.5512,
    "dropoffLongitude": 79.5214,
    "meetingPoint": "Bodhan Bus Stand",
    "departureAt": "2026-08-20T08:30:00.000Z",
    "totalSeats": 3,
    "suggestedContribution": 10.00,
    "stopovers": [{ "name": "Nizamabad" }, { "name": "Hyderabad" }],
    "routePolyline": [{ "latitude": 18.6631, "longitude": 77.8994 }, { "latitude": 17.5512, "longitude": 79.5214 }],
    "vehicleDetails": "Honda City 2024"
  }
  ```
- **Response `201 Created`**: Returns created `RideData` object.

### `POST /v1/rides/:rideId/complete`
- **Access**: Owner Only (`driver_id === req.auth.uid`)
- **Description**: Marks an active ride as completed. Updates `status = 'completed'`, removes ride from public search discovery, and increments driver's `completed_ride_count`.
- **Response `200 OK`**: `{ "message": "Ride marked as completed", "data": { "id": "ride_123", "status": "completed" } }`

---

## 3. Booking Routes (`/v1/bookings`)

### `POST /v1/rides/:rideId/bookings`
- **Access**: Non-Owner Only (`rider_id !== driver_id`)
- **Description**: Creates seat reservation request with status `'pending'`. Direct chat remains locked.

### `POST /v1/bookings/:bookingId/approve`
- **Access**: Ride Driver Only
- **Description**: Approves pending request, decrements `available_seats`, creates conversation channel, and unlocks direct messaging.
