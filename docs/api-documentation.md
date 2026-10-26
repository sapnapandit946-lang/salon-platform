# REST API Reference Documentation

## Base URL: `/api/v1`
Authentication: Bearer Token in `Authorization: Bearer <JWT_TOKEN>` header for protected endpoints.

---

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /auth/register`
Create a new user account with role selection.
- **Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword@123",
  "full_name": "Pooja Sharma",
  "phone": "+91 9876543210",
  "role": "CUSTOMER" // "CUSTOMER" or "SALON_OWNER"
}
```
- **Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "full_name": "Pooja Sharma",
    "phone": "+91 9876543210",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2026-10-26T15:30:00Z"
  }
}
```

#### `POST /auth/login`
Authenticate existing user.
- **Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword@123"
}
```
- **Response (200 OK):** Token response as above.

#### `GET /auth/me`
Retrieve authenticated user profile. (Requires Bearer token).

---

### 2. Salon Discovery Endpoints (`/api/v1/salons`)

#### `GET /salons`
Search and filter salons backed by actual database records.
- **Query Parameters:**
  - `query` (string): Keyword for salon name or locality.
  - `service_name` (string): Target service (e.g. `Haircut`).
  - `city` (string): City filter (e.g. `Mumbai`, `Bengaluru`).
  - `locality` (string): Locality (e.g. `Bandra`).
  - `min_price` (float): Minimum price for the requested service.
  - `max_price` (float): Maximum price for the requested service.
  - `min_rating` (float): Minimum salon rating (e.g. `4.5`).
  - `user_lat` (float): Customer latitude for Haversine distance calculation.
  - `user_lon` (float): Customer longitude for Haversine distance calculation.
  - `max_distance_km` (float): Distance threshold.
  - `sort_by` (string): `relevance`, `price_asc`, `price_desc`, `rating`, `distance`.
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Enrich Salon & Luxury Studio",
    "city": "Mumbai",
    "locality": "Bandra West",
    "address": "Shop 4, Hill Road, Bandra West",
    "rating": 4.7,
    "review_count": 38,
    "distance_km": 3.42,
    "matched_service_name": "Haircut & Styling",
    "matched_service_price": 450.0,
    "matched_service_duration": 40,
    "is_favourite": false
  }
]
```

#### `GET /salons/{id}`
Retrieve full salon profile, including categorized services, schedules, and verified customer reviews.

#### `POST /salons/{id}/favourite`
Toggle favourite status for authenticated customer.

---

### 3. Comparison & Decision Support (`/api/v1/compare`)

#### `POST /compare`
Central multi-factor decision evaluation matrix.
- **Request Body:**
```json
{
  "service_name": "Haircut & Styling",
  "city": "Mumbai",
  "max_budget": 500.0,
  "preferred_date": "2026-10-30",
  "preferred_time": "11:00",
  "user_latitude": 19.0596,
  "user_longitude": 72.8295
}
```
- **Response (200 OK):**
```json
{
  "queried_service": "Haircut & Styling",
  "customer_budget": 500.0,
  "total_candidates_found": 3,
  "ranking_explanation": "Rankings are calculated dynamically: Exact Service Budget Fit (35%), Travel Distance (25%), Bayesian-Weighted Client Rating (25%), and Appointment Availability (15%).",
  "items": [
    {
      "salon_id": 2,
      "salon_name": "Looks Unisex Salon & Grooming Bar",
      "exact_service_price": 300.0,
      "exact_service_duration": 30,
      "distance_km": 4.1,
      "rating": 4.4,
      "review_count": 52,
      "is_available_for_date": true,
      "has_preferred_slot": true,
      "score_breakdown": {
        "budget_fit": true,
        "budget_score": 82.0,
        "distance_score": 79.5,
        "rating_score": 87.0,
        "availability_score": 100.0,
        "total_composite_score": 85.3,
        "reasons": [
          "₹300 fits within your ₹500 budget (saves ₹200)",
          "Located 4.1 km away",
          "4.4 ★ verified rating across 52 client reviews",
          "Slots currently available for chosen schedule"
        ]
      }
    }
  ]
}
```

---

### 4. Bookings & Appointments (`/api/v1/bookings`)

#### `GET /bookings/slots`
Compute live available appointment slots based on operating hours, service duration, and chair capacity.
- **Query Parameters:** `salon_id`, `service_id`, `booking_date` (YYYY-MM-DD).
- **Response (200 OK):**
```json
[
  { "time_str": "09:30", "is_available": true, "remaining_capacity": 3 },
  { "time_str": "10:00", "is_available": true, "remaining_capacity": 2 },
  { "time_str": "10:30", "is_available": false, "remaining_capacity": 0 }
]
```

#### `POST /bookings`
Schedule and confirm an appointment. (Customer only).
- **Request Body:**
```json
{
  "salon_id": 1,
  "service_id": 1,
  "booking_date": "2026-10-30",
  "start_time": "10:00",
  "customer_notes": "First visit, textured fade"
}
```

#### `GET /bookings/my`
Retrieve customer appointment history.

#### `PUT /bookings/{id}/cancel`
Cancel an upcoming appointment.

---

### 5. Verified Reviews (`/api/v1/reviews`)

#### `POST /reviews`
Submit a verified review for a COMPLETED booking (Enforces one review per completed appointment).
- **Request Body:**
```json
{
  "booking_id": 14,
  "rating": 5,
  "comment": "Exceptional precision cut and very hygienic salon setup."
}
```

---

### 6. AI Virtual Hairstyle Preview (`/api/v1/ai-preview`)

#### `GET /ai-preview/styles`
Returns available hairstyle options and hair color palettes.

#### `POST /ai-preview/transform`
Upload portrait photo for style transformation.
- **Form Data:**
  - `file`: Multipart image file (JPG, PNG, WebP $\le$ 5 MB)
  - `hairstyle`: Selected hairstyle string
  - `hair_color`: Selected hair color string
  - `consent_given`: `true` (Mandatory boolean)
- **Response (200 OK):**
```json
{
  "status": "success",
  "is_mock": true,
  "hairstyle": "Textured Crop Fade",
  "hair_color": "Burgundy Wine",
  "preview_url": "/uploads/previews/preview_8a9f3b2c1d0e.jpg",
  "message": "Simulated transformation complete...",
  "processing_time_seconds": 0.42
}
```

---

### 7. Salon Owner Dashboard (`/api/v1/owner`)

Protected endpoints strictly requiring `SALON_OWNER` or `ADMIN` role.
- `GET /owner/my-salon`: Profile, services, and operating schedules.
- `POST /owner/my-salon`: Register business profile.
- `PUT /owner/my-salon`: Update business details.
- `GET /owner/services`: List services.
- `POST /owner/services`: Add a service with exact price & duration.
- `PUT /owner/services/{id}`: Modify service price or duration.
- `DELETE /owner/services/{id}`: Delete service.
- `PUT /owner/schedules`: Update weekly operating hours & chair capacity.
- `GET /owner/bookings`: Customer bookings for owner's salon.
- `PUT /owner/bookings/{id}/status`: Set status (`CONFIRMED`, `COMPLETED`, `CANCELLED`).
- `GET /owner/stats`: Aggregate analytics (Revenue in ₹, Bookings count, Ratings).
