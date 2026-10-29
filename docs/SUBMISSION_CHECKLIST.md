# College Hackathon Submission Checklist & Verification Sheet
**Project Title**: FoodBridge – Food Donation and Redistribution Platform  
**Problem Identifier**: HACK-P197  
**Submission Category**: Internal & External College Hackathon Submission  
**Academic Year**: 2026–2027  

---

## 1. Student Team Identification (Exactly 4 Team Members)

> [!IMPORTANT]
> The following table contains official placeholders for the four registered team members. Please update with your real college identification records prior to final institutional dispatch.

| Team Role | Full Name | College Roll Number | Engineering Branch | Section / Batch |
| :--- | :--- | :--- | :--- | :--- |
| **Team Lead / Full-Stack** | `[Member 1 Name - Lead]` | `[Member 1 Roll No]` | `[Branch, e.g. CSE / IT]` | `[Section, e.g. A]` |
| **Backend & DB Engineer** | `[Member 2 Name]` | `[Member 2 Roll No]` | `[Branch, e.g. CSE / IT]` | `[Section, e.g. A]` |
| **Frontend & UI/UX** | `[Member 3 Name]` | `[Member 3 Roll No]` | `[Branch, e.g. CSE / IT]` | `[Section, e.g. B]` |
| **QA, Testing & Docs** | `[Member 4 Name]` | `[Member 4 Roll No]` | `[Branch, e.g. CSE / IT]` | `[Section, e.g. B]` |

---

## 2. Deliverables Compliance Matrix

| # | Required Submission Deliverable | File / Artifact Path | Verification Status |
| :---: | :--- | :--- | :---: |
| **1** | Complete Working Source Code | `client/`, `server/`, `package.json` | ✅ **VERIFIED** (React 18 + Express + Prisma) |
| **2** | Comprehensive README Documentation | `README.md` | ✅ **VERIFIED** (Covers all 12 college sections) |
| **3** | REST API Specification | `docs/API_DOCUMENTATION.md` | ✅ **VERIFIED** (Endpoints, bodies, responses) |
| **4** | Architecture & Security Design | `docs/ARCHITECTURE.md` | ✅ **VERIFIED** (Mermaid sequence & system flows) |
| **5** | Database & ER Diagram | `docs/DATABASE.md` | ✅ **VERIFIED** (Complete ER diagram & data dictionary) |
| **6** | Automated Integration Test Evidence | `tests/test_results.txt` | ✅ **VERIFIED** (23 / 23 Tests Passing) |
| **7** | Postman API Test Collection | `postman/foodbridge_collection.json` | ✅ **VERIFIED** (Tests & Environment included) |
| **8** | Actual Application UI Screenshots | `screenshots/` (01 to 08) | ✅ **VERIFIED** (Live headless captures) |
| **9** | 12-Slide Presentation (.pptx) | `deliverables/FoodBridge_Presentation_HACK-P197.pptx` | ✅ **VERIFIED** (Generated editable deck) |
| **10**| Mandatory Food Safety Disclaimer | In UI & API `/food-safety` | ✅ **VERIFIED** (Non-certification compliant) |
| **11**| Git Repository & Verified History | Local Git & Remote Configuration | ✅ **VERIFIED** (Clean commit history, no secrets) |

---

## 3. Pre-Submission Self-Audit Checklist

- [x] All 23 backend automated integration tests execute cleanly with zero failures.
- [x] Frontend builds cleanly for production (`vite build`) without TypeScript warnings.
- [x] Database seeded with 10 realistic demo listings and 3 verified recipient organisations.
- [x] Double-booking prevention verified under concurrent race conditions using atomic database transactions.
- [x] No credentials, private API keys, or `.env` files are tracked in the Git repository.
- [x] Food safety disclaimer is prominently displayed across homepage, footer, and create listing forms.
- [x] 1-Click quick evaluation demo logins are available on the web portal for rapid judging.
