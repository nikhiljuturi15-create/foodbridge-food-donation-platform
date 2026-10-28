# FoodBridge 3–5 Minute Hackathon Video Demonstration Script
**Project Title**: FoodBridge – Food Donation and Redistribution Platform  
**Problem Identifier**: HACK-P197  
**Target Duration**: 4 Minutes 30 Seconds  
**Format**: Screen capture with voiceover narration + web camera overlay (optional)  

---

## 1. Recording Setup & Preparation Checklist

Before initiating the video recording session, verify the following prerequisites:
- [ ] Backend server running on `http://localhost:5000` (`npm --prefix server run dev`).
- [ ] Frontend Vite development server running on `http://localhost:5173` (`npm --prefix client run dev`).
- [ ] Database seeded with demo listings: `Grand Plaza Hotel`, `Hope Food Bank`, `Metro Bakery`.
- [ ] Browser window set to 1920x1080 resolution, 100% zoom, bookmarks bar hidden.
- [ ] Three browser profiles or tabs ready:
  - Tab A: Public Homepage (`http://localhost:5173`)
  - Tab B: Incognito/Guest window for Recipient flow
  - Tab C: Admin Console
- [ ] Microphone tested for clear audio levels with ambient noise suppression.

---

## 2. Timed Scene-by-Scene Narration Script

### Scene 1: Introduction & The Food Waste Crisis (0:00 – 0:45)
- **Visual**: Homepage hero section with headline: *"Connecting Surplus Food with Community Need"*.
- **Presenter Narration**:
  > *"Hello esteemed judges and faculty evaluators. Welcome to our presentation of **FoodBridge**, addressing Hackathon Problem Statement **HACK-P197**.*
  >
  > *Every year, over 1.3 billion tonnes of nutritious, edible food is discarded globally, while more than 800 million individuals face acute food insecurity. The critical barrier isn't a shortage of surplus food—it's the absence of an immediate, reliable, and coordinated redistribution mechanism.*
  >
  > *FoodBridge bridges this gap by directly linking commercial food businesses—hotels, caterers, supermarkets, and bakeries—with verified community shelters, orphanages, and food banks."*

---

### Scene 2: Live Impact Metrics & Food Safety Governance (0:45 – 1:15)
- **Visual**: Scroll down to the live metrics cards (Meals Rescued, Kg Saved, CO2 Offset) and highlight the Food Safety Banner.
- **Presenter Narration**:
  > *"As seen here on our landing page, FoodBridge features real-time, database-backed impact telemetry. Every completed donation dynamically updates total meals redistributed, kilograms rescued, and greenhouse CO2 emissions avoided.*
  >
  > *Crucially, we incorporate a mandatory **Food Safety Governance Banner**. FoodBridge acts as an administrative coordination engine and does not certify food safety. Donors and recipients are contractually bound to standard temperature controls—hot foods held above 63°C, cold items below 4°C."*

---

### Scene 3: The Donor Journey – Publishing Surplus (1:15 – 2:00)
- **Visual**: Click 1-Click Demo Login as *"Grand Plaza Hotel"*. Navigate to Donor Dashboard, then click **"+ Post Food Listing"**.
- **Presenter Narration**:
  > *"Let's explore the Donor journey. We log in as the Grand Plaza Hotel. In our Donor Operations Center, we see our active inventory and pending requests.*
  >
  > *Let's publish a surplus item: 40 servings of prepared buffet dishes. We specify the category, dietary classification, cooked timestamp, use-by deadline, and collection window. Notice that listing publication strictly requires acknowledging our Food Safety Declaration checkbox.*
  >
  > *Once submitted, the listing is persisted directly to our relational database and immediately appears in the community feed."*

---

### Scene 4: The Recipient Experience – Browsing & Claiming (2:00 – 2:45)
- **Visual**: Switch to Recipient session as *"Hope Community Food Bank"*. Filter by 'Cooked Meals', sort by urgency. Open the listing detail view and submit claim.
- **Presenter Narration**:
  > *"Now switching to our recipient organisation, Hope Community Food Bank. Recipient NGOs can filter by food categories, dietary needs, or city proximity, with urgency sorting prioritizing donations nearing their use-by deadline.*
  >
  > *The recipient opens the listing, reviews the storage guidance, and clicks **Claim this Donation**. They enter their intake requirements—30 portions—and distribution purpose. The claim is submitted in `PENDING` status."*

---

### Scene 5: Double-Booking Prevention & Handover Code (2:45 – 3:30)
- **Visual**: Switch back to Donor tab. Show incoming request. Click **"Accept Claim"**. Show generated verification code. Switch to Recipient tab to show the code box.
- **Presenter Narration**:
  > *"Back on the Donor dashboard, the hotel reviews the incoming request. When the donor clicks **Accept Claim**, FoodBridge executes an **atomic database transaction**.*
  >
  > *This transaction enforces our strict **Double-Booking Prevention Guard**: it verifies the listing is still available, locks the status to `CONFIRMED`, automatically rejects any competing claims, and generates a tamper-evident 4-digit Handover Verification Code—here, code 4821.*
  >
  > *When the recipient arrives at the facility, they present this code. The donor enters it to confirm collection, transitioning the listing to `COMPLETED` and instantly incrementing the community impact statistics."*

---

### Scene 6: Administrative Moderation & Governance (3:30 – 4:10)
- **Visual**: Log in as Platform Admin. Show User verification toggle, listing moderation, and audit logs.
- **Presenter Narration**:
  > *"Finally, let's inspect the Admin Console. Platform administrators have comprehensive moderation oversight:*
  >
  > *First, **Organisation Verification**: Administrators verify registered NGOs against official tax IDs to protect food integrity.*
  > *Second, **Listing Moderation**: Administrators can flag or withdraw listings that violate safety standards.*
  > *Third, an immutable **System Audit Trail** logs every registration, acceptance, handover, and moderation action with cryptographic timestamps."*

---

### Scene 7: Testing Evidence & Conclusion (4:10 – 4:30)
- **Visual**: Open terminal showing passing Vitest test suite (23/23 tests passing).
- **Presenter Narration**:
  > *"The platform is backed by 23 automated integration tests verifying authentication, RBAC, input validation, double-booking prevention, and data persistence.*
  >
  > *FoodBridge is production-ready, fully documented, and engineered to deliver measurable progress toward UN Sustainable Development Goal 2: Zero Hunger. Thank you!"*
