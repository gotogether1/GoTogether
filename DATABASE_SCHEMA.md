# 🗄️ GO TOGETHER — DATABASE SCHEMA SPECIFICATION

> **Database Provider**: Neon Cloud PostgreSQL  
> **Schema Type**: Fully Normalized Relational Schema with JSONB Document Extensions  
> **Data Integrity**: Foreign Keys with `ON DELETE CASCADE`, Check Constraints, Unique Indexes  

---

## Entity Relationship Overview

```text
[ users ] ───1:N───> [ rides ] ───1:N───> [ bookings ] ───1:1───> [ conversations ] ───1:N───> [ messages ]
   │                    │                     │
   ├───1:N───> [ user_fcm_tokens ]           ├───1:1───> [ reviews ]
   ├───1:N───> [ notifications ]             
   ├───1:N───> [ reports ]                   
   └───1:N───> [ blocks ]                    
```

---

## Data Tables DDL

### 1. `users` Table
Stores authenticated user profiles and aggregated commute rating metrics.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Resolved User ID (`usr_...`) |
| `firebase_uid` | `VARCHAR(128)` | `UNIQUE NOT NULL` | Firebase Auth User Unique ID |
| `display_name` | `VARCHAR(255)` | `NOT NULL` | User Full Name |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Verified Account Email |
| `city` | `VARCHAR(255)` | `NULLABLE` | Home City |
| `bio` | `TEXT` | `NULLABLE` | Profile Bio Summary |
| `fcm_token` | `TEXT` | `NULLABLE` | Device Push FCM Token |
| `is_verified` | `BOOLEAN` | `DEFAULT TRUE` | Account Verification Status |
| `average_rating` | `NUMERIC(3,2)` | `DEFAULT 5.00` | Aggregated Star Rating (1.00–5.00) |
| `completed_ride_count` | `INT` | `DEFAULT 0` | Total Completed Commutes Count |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Account Creation Timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Profile Last Modified Timestamp |

---

### 2. `rides` Table
Stores driver-published carpools and bike pools, route waypoints, departure schedules, and JSONB GeoJSON polylines.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Ride Unique ID (`ride_...`) |
| `driver_id` | `VARCHAR(128)` | `FOREIGN KEY (users.id) CASCADE` | Driver Account Reference |
| `vehicle_type` | `VARCHAR(50)` | `CHECK ('carpool', 'bike_pool')` | Mode of Transport |
| `pickup` | `VARCHAR(255)` | `NOT NULL` | Pick-up Location Name |
| `destination` | `VARCHAR(255)` | `NOT NULL` | Drop-off Location Name |
| `pickup_address` | `TEXT` | `NULLABLE` | Full Pick-up Street Address |
| `pickup_latitude` | `NUMERIC(10,6)`| `NOT NULL` | Pick-up Latitude Coordinate |
| `pickup_longitude` | `NUMERIC(10,6)`| `NOT NULL` | Pick-up Longitude Coordinate |
| `dropoff_address` | `TEXT` | `NULLABLE` | Full Drop-off Street Address |
| `dropoff_latitude` | `NUMERIC(10,6)`| `NOT NULL` | Drop-off Latitude Coordinate |
| `dropoff_longitude` | `NUMERIC(10,6)`| `NOT NULL` | Drop-off Longitude Coordinate |
| `meeting_point` | `VARCHAR(255)` | `NOT NULL` | Pick-up Spot / Landmark |
| `departure_at` | `TIMESTAMPTZ` | `NOT NULL` | Scheduled Departure Timestamp |
| `total_seats` | `INT` | `CHECK (total_seats > 0)` | Total Offered Seats Capacity |
| `available_seats` | `INT` | `CHECK (available_seats >= 0)` | Current Unreserved Seats |
| `suggested_contribution` | `NUMERIC(10,2)`| `DEFAULT 0.00` | Price per Seat Contribution |
| `route_variant` | `VARCHAR(100)`| `DEFAULT 'fastest'` | Chosen OSRM Driving Variant |
| `route_polyline` | `JSONB` | `DEFAULT '[]'::jsonb` | GeoJSON Coordinate Array |
| `stopovers` | `JSONB` | `DEFAULT '[]'::jsonb` | Intermediate Cities Array |
| `vehicle_details` | `VARCHAR(255)` | `NOT NULL` | Vehicle Make, Model, License |
| `status` | `VARCHAR(50)` | `CHECK ('active', 'cancelled', 'completed')` | Ride Lifecycle Status |

---

### 3. `bookings` Table
Stores seat reservation requests and proposed price offers.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Booking Unique ID (`booking_...`) |
| `ride_id` | `VARCHAR(128)` | `FOREIGN KEY (rides.id) CASCADE` | Associated Ride Reference |
| `rider_id` | `VARCHAR(128)` | `FOREIGN KEY (users.id) CASCADE` | Passenger Account Reference |
| `seats_requested` | `INT` | `CHECK (seats_requested > 0)` | Number of Requested Seats |
| `negotiated_price` | `NUMERIC(10,2)`| `NULLABLE` | Proposed Seat Price Contribution |
| `rider_message` | `TEXT` | `NULLABLE` | Message to Driver |
| `status` | `VARCHAR(50)` | `CHECK ('pending', 'approved', 'rejected', 'cancelled')` | Request Approval Status |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Booking Submission Timestamp |

---

### 4. `conversations` & `messages` Tables
Stores 1-on-1 direct messaging channels unlocked upon driver approval.

- **`conversations`**: `id`, `booking_id` (UNIQUE), `driver_id`, `rider_id`, `status` (`'active'`).
- **`messages`**: `id`, `conversation_id`, `booking_id`, `sender_id`, `body`, `created_at`.

---

### 5. `notifications`, `reviews`, `reports` & `blocks` Tables
- **`notifications`**: User notification inbox feed (`user_id`, `title`, `body`, `type`, `is_read`).
- **`reviews`**: Trip star ratings (`booking_id` UNIQUE, `author_id`, `recipient_id`, `rating` 1–5, `text`).
- **`reports`**: Incident filings (`reporter_id`, `reported_user_id`, `reason`, `description`).
- **`blocks`**: Blocked pairs (`blocker_id`, `blocked_id` UNIQUE).
