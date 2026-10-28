# FoodBridge REST API Documentation
**Problem ID**: HACK-P197  
**Base URL**: `http://localhost:5000/api/v1`  
**Authentication**: Bearer Token via `Authorization: Bearer <jwt_token>` header

---

## 1. System & Governance Endpoints

### `GET /health`
Returns service availability, timestamp, and hackathon problem identifier.
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-10-28T18:00:00.000Z",
  "service": "FoodBridge API",
  "version": "1.0.0",
  "hackathonProblemId": "HACK-P197"
}
```

### `GET /food-safety`
Returns platform food safety governance terms and non-certification disclosures.
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "title": "FoodBridge Food Safety Disclaimer & Standards",
  "disclaimer": "FoodBridge is a technology-enabled redistribution coordination platform. FoodBridge DOES NOT inspect, test, certify, or guarantee the physical condition, temperature history, bacteriological safety, or suitability for consumption of any donated food.",
  "responsibilities": {
    "donor": "Donors must ensure that donated food was prepared under sanitary conditions and stored at safe temperatures (cold foods <= 4°C, hot foods >= 63°C).",
    "recipient": "Recipients must inspect donations at pickup, maintain safe transport temperatures, and consume or serve food within recommended use-by guidance."
  },
  "version": "1.0"
}
```

---

## 2. Authentication & User Management

### `POST /auth/register`
Registers a new user account (Donor or Recipient NGO).
- **Body**:
```json
{
  "email": "donor@grandplaza.com",
  "password": "Password@123",
  "name": "Grand Plaza Hotel & Catering",
  "role": "DONOR",
  "phone": "+1-555-0301",
  "address": "500 Grand Avenue",
  "city": "Metropolis",
  "organizationType": "Hotel & Hospitality"
}
```
- **Responses**:
  - `201 Created`: `{ "success": true, "token": "...", "user": { ... } }`
  - `409 Conflict`: Email already exists
  - `400 Bad Request`: Validation failure

### `POST /auth/login`
Authenticates user with email and password.
- **Body**:
```json
{
  "email": "donor@grandplaza.com",
  "password": "Password@123"
}
```
- **Responses**:
  - `200 OK`: `{ "success": true, "token": "...", "user": { ... } }`
  - `401 Unauthorized`: Invalid credentials

### `GET /auth/me`
Retrieves authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with user profile object

---

## 3. Food Listings Endpoints

### `GET /listings`
Browse surplus food listings with query filters and urgency sorting.
- **Query Parameters**:
  - `category` (Optional): `COOKED_MEALS`, `BAKERY`, `PRODUCE`, `DAIRY`, `PACKAGED_GOODS`, `OTHER`
  - `dietaryInfo` (Optional): `Vegetarian`, `Vegan`, `Halal`, `Gluten-Free`
  - `city` (Optional): Substring search in city name
  - `search` (Optional): Keywords matched across title and description
  - `sortBy` (Optional): `urgency` (default), `newest`, `quantity`
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 10,
  "listings": [ ... ]
}
```

### `POST /listings`
Create a new food donation listing.
- **Access**: Restricted to `DONOR` and `ADMIN`
- **Body**:
```json
{
  "title": "Fresh Mediterranean Grilled Chicken Buffet Surplus",
  "description": "Maintained below 4°C in food-grade aluminum chafing pans.",
  "category": "COOKED_MEALS",
  "quantity": 40,
  "unit": "servings",
  "dietaryInfo": "Halal",
  "preparedAt": "2026-10-28T14:00:00.000Z",
  "useBy": "2026-10-29T18:00:00.000Z",
  "pickupWindowStart": "2026-10-28T16:00:00.000Z",
  "pickupWindowEnd": "2026-10-28T21:00:00.000Z",
  "pickupAddress": "500 Grand Avenue, Dock C",
  "pickupCity": "Metropolis",
  "storageInstructions": "Keep chilled below 4°C",
  "foodSafetyConfirmed": true
}
```
- **Responses**:
  - `201 Created`: Returns created listing with ID
  - `400 Bad Request`: Validation failure or food safety unchecked
  - `403 Forbidden`: User role is not DONOR

### `GET /listings/:id`
Retrieves single listing by ID with donor metadata and active claims.

### `PUT /listings/:id`
Update an existing listing before it is claimed.
- **Access**: Owner Donor or Admin

### `DELETE /listings/:id`
Cancel and withdraw an active listing.
- **Access**: Owner Donor or Admin

---

## 4. Donation Claims & Fulfillment Workflow

### `POST /requests`
Recipient organisation claims an available food listing.
- **Access**: Restricted to `RECIPIENT`
- **Body**:
```json
{
  "listingId": "c0a8012e-1234-4567-89ab-cdef01234567",
  "requestedQuantity": 30,
  "pickupTime": "2026-10-28T18:30:00.000Z",
  "purpose": "Evening shelter meal service"
}
```
- **Responses**:
  - `201 Created`: Request created in `PENDING` status
  - `409 Conflict`: Listing is already confirmed/completed (double-booking prevented)

### `POST /requests/:id/accept`
Donor accepts recipient claim. Triggers atomic transaction:
1. Marks claim `ACCEPTED`.
2. Generates secure 4-digit handover code.
3. Sets listing status to `CONFIRMED`.
4. Automatically rejects any competing pending requests.
- **Access**: Owner Donor or Admin
- **Response**: `200 OK` with `verificationCode`

### `POST /requests/:id/reject`
Donor declines claim with optional reason.
- **Body**: `{ "reason": "Capacity already reached" }`

### `POST /requests/:id/cancel`
Recipient withdraws pending or accepted claim before pickup.
- **Behavior**: If request was `ACCEPTED`, listing reverts back to `AVAILABLE`.

### `POST /requests/:id/complete`
Confirms pickup handover and marks donation as `COMPLETED`.
- **Body**: `{ "verificationCode": "4821" }`
- **Responses**:
  - `200 OK`: Updated request and listing status to `COMPLETED`
  - `400 Bad Request`: Invalid verification handover code

---

## 5. Platform Impact Statistics

### `GET /stats/platform`
Returns aggregate public metrics calculated directly from database records:
```json
{
  "success": true,
  "stats": {
    "totalFoodRescuedKg": 3420,
    "totalMealsRescued": 8550,
    "totalCO2AvoidedKg": 8550,
    "totalCompletedDonations": 2,
    "totalActiveListings": 10,
    "totalDonors": 4,
    "totalRecipients": 3,
    "totalUsers": 8
  }
}
```

---

## 6. Administrative Moderation & Governance

- `GET /admin/users`: View all registered users with filter by role and verification flag.
- `PATCH /admin/users/:id/verify`: Toggle NGO verification (`{ "isVerified": true }`).
- `GET /admin/listings`: View and filter all listings across all statuses.
- `PATCH /admin/listings/:id/moderate`: Flag or cancel an inappropriate listing.
- `GET /admin/audit-logs`: Review cryptographic chronological activity log.
