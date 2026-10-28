# FoodBridge Database Schema & Entity-Relationship Design
**Problem ID**: HACK-P197  
**Platform**: FoodBridge – Food Donation and Redistribution Platform  

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ LISTING : "posts (as Donor)"
    USER ||--o{ DONATION_REQUEST : "submits (as Recipient)"
    USER ||--o{ AUDIT_LOG : "triggers"
    LISTING ||--o{ DONATION_REQUEST : "receives claims"

    USER {
        string id PK "UUID"
        string email UK "Unique email address"
        string password "Salted bcrypt hash"
        string name "Individual or Organisation Name"
        string role "DONOR | RECIPIENT | ADMIN"
        string phone "Contact phone number"
        string address "Street address"
        string city "City or municipality"
        string organizationType "Shelter | Food Bank | Restaurant | etc."
        string registrationNumber "NGO/Tax Registration ID"
        boolean isVerified "Default true for donor/admin, verified for NGO"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last modification timestamp"
    }

    LISTING {
        string id PK "UUID"
        string donorId FK "References User.id"
        string title "Food title / summary"
        string description "Detailed description & allergen notes"
        string category "COOKED_MEALS | BAKERY | PRODUCE | DAIRY | PACKAGED_GOODS | OTHER"
        float quantity "Numeric quantity"
        string unit "kg | servings | meals | boxes | loaves | liters"
        string dietaryInfo "Vegetarian | Vegan | Halal | Gluten-Free | Non-Vegetarian"
        datetime preparedAt "Preparation timestamp"
        datetime useBy "Mandatory consumption deadline"
        datetime pickupWindowStart "Pickup commencement window"
        datetime pickupWindowEnd "Pickup conclusion window"
        string pickupAddress "Physical pickup location"
        string pickupCity "City"
        string storageInstructions "Cold/hot holding instructions"
        boolean foodSafetyConfirmed "Mandatory donor acknowledgement"
        string status "AVAILABLE | REQUESTED | CONFIRMED | COMPLETED | CANCELLED | EXPIRED"
        string imageUrl "Visual asset URL"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    DONATION_REQUEST {
        string id PK "UUID"
        string listingId FK "References Listing.id"
        string recipientId FK "References User.id"
        string status "PENDING | ACCEPTED | REJECTED | CANCELLED | COMPLETED"
        float requestedQuantity "Claimed quantity"
        datetime pickupTime "Estimated arrival datetime"
        string purpose "Community meal feeding purpose"
        string rejectionReason "Reason if rejected"
        string cancellationReason "Reason if cancelled"
        string verificationCode "4-digit secure handover confirmation code"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    AUDIT_LOG {
        string id PK "UUID"
        string userId FK "References User.id (Nullable on delete)"
        string action "Event action code"
        string details "JSON payload of operation parameters"
        string ipAddress "Request IP"
        datetime createdAt "Timestamp"
    }
```

---

## 2. Table Specifications & Data Dictionary

### Table: `User`
Stores authenticated platform actors including donors, recipient NGOs, and administrators.
- `id` (String, Primary Key, UUID)
- `email` (String, Unique Index)
- `password` (String, bcrypt salted hash, 10 rounds)
- `name` (String, required)
- `role` (String, default: "DONOR", valid values: "DONOR", "RECIPIENT", "ADMIN")
- `isVerified` (Boolean, default: false for recipients without registration number)

### Table: `Listing`
Stores surplus food listings published by authenticated donors.
- `id` (String, Primary Key, UUID)
- `donorId` (String, Foreign Key -> `User.id`, Cascade on delete)
- `title` (String, required, min length 3)
- `category` (String, values: `COOKED_MEALS`, `BAKERY`, `PRODUCE`, `DAIRY`, `PACKAGED_GOODS`, `OTHER`)
- `quantity` (Float, strictly positive)
- `unit` (String, e.g. "kg", "servings", "meals", "boxes")
- `useBy` (DateTime, required consumption deadline)
- `pickupWindowStart` / `pickupWindowEnd` (DateTime, start must precede end)
- `foodSafetyConfirmed` (Boolean, required true to publish)
- `status` (String, values: `AVAILABLE`, `REQUESTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`)

### Table: `DonationRequest`
Coordinates claims between recipient organisations and available food donations.
- `id` (String, Primary Key, UUID)
- `listingId` (String, Foreign Key -> `Listing.id`, Cascade on delete)
- `recipientId` (String, Foreign Key -> `User.id`, Cascade on delete)
- `status` (String, values: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`)
- `verificationCode` (String, 4-digit code generated upon donor acceptance)

### Table: `AuditLog`
Immutable operational log tracking security events, listing moderation, and status transitions.
- `id` (String, Primary Key, UUID)
- `userId` (String, Nullable Foreign Key -> `User.id`)
- `action` (String, e.g. `LISTING_CREATED`, `REQUEST_ACCEPTED`, `PICKUP_COMPLETED`)
- `details` (String, serialized JSON)
- `createdAt` (DateTime, default: now)
