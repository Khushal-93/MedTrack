# ⏱️ 2-Hour Speedrun Roadmap & Task Division — MediShield

> **Target Execution Time:** 120 Minutes  
> **Team Allocation:** 3 Developers (Person 1, Person 2, Person 3)  
> **Objective:** Deliver a flawless end-to-end working MVP of MediShield for live demonstration.

---

## 1. High-Level Role Matrix

| Developer | Core Responsibilities | Key Deliverables | Dependencies |
| :--- | :--- | :--- | :--- |
| **Person 1** *(Doctor Lead)* | Doctor Portal, QR Scanner, Prescription Form & Live Warning Banner | `/doctor/scan`, `/doctor/patient/[id]`, `QrScanner.tsx`, `SafetyAlertBanner.tsx` | Needs Safety API endpoint from Person 3 |
| **Person 2** *(Patient Lead)* | Patient Portal, Dynamic QR Code Generator, Timeline & Mock OCR Upload | `/patient`, `/patient/add-med`, `QrCodeDisplay.tsx`, `Timeline.tsx` | Uses shared TypeScript types |
| **Person 3** *(Backend Lead)* | Prisma DB Schema, Demo Data Seeding, Safety Checking Engine & REST APIs | `prisma/schema.prisma`, `seed.ts`, `safety-engine.ts`, `/api/safety-check` | Provides API contracts to Person 1 & 2 |

---

## 2. Minute-by-Minute Timeline (120 Minutes)

```
[00:00 - 00:15] Phase 1: Groundwork & Setup (All Hands)
  ├── Initialize Next.js project with Tailwind CSS & Lucide React.
  ├── Person 3 sets up Prisma SQLite schema & seeds mock patient "John Doe" (Warfarin + Penicillin allergy).
  └── Establish shared interfaces in `src/types/index.ts`.

[00:15 - 00:45] Phase 2: Parallel Component Development
  ├── Person 1: Build Webcam QR Scanner component + Doctor Patient View layout.
  ├── Person 2: Build Patient Dashboard, QR code generator (`qrcode.react`), and Timeline list.
  └── Person 3: Write Safety Engine logic (Drug-Drug interaction matrix, Duplicate & Allergy checkers).

[00:45 - 01:15] Phase 3: Integration & Safety Engine Connection
  ├── Person 3 deploys API endpoints: `/api/patient/[id]` and `/api/safety-check`.
  ├── Person 1 connects Prescription Form input to `/api/safety-check` with debounced execution.
  └── Person 2 connects Patient "Add Med" form to backend DB write.

[01:15 - 01:45] Phase 4: Polish, Alert Banner & Mock OCR
  ├── Person 1: Finalize Red/Yellow/Green Safety Alert Banners with human-readable explanations.
  ├── Person 2: Add quick Mock OCR prescription upload button (pre-fills sample drug).
  └── Person 3: Verify edge cases (e.g. Warfarin + Aspirin alert, Amoxicillin + Penicillin alert).

[01:45 - 02:00] Phase 5: End-to-End Demo Dry Run
  ├── Run full user flow: Patient QR -> Doctor Scan -> Add Aspirin -> See Risk -> Submit Rx -> Update Timeline.
  └── Reset database using `npm run db:seed`. Ready to present!
```

---

## 3. Individual Developer Action Plans

---

### 👨‍💻 PERSON 1: Doctor Portal & Safety UI Lead

#### Objective
Build the Doctor QR Scanner interface, Patient History view, Interactive Prescription builder, and Real-time Safety Alert display.

#### Step-by-Step Task List
1. **[00:00 - 00:20] Component Creation:**
   - Create `src/components/QrScanner.tsx` using `html5-qrcode`. Include a manual ID search input fallback (`MS-9042`) for presentation reliability.
2. **[00:20 - 00:50] Doctor Patient Dashboard (`src/app/doctor/patient/[id]/page.tsx`):**
   - Header showing Patient Name, Age, Blood Group, Active Meds badges, Allergy warnings.
   - Main card: **Prescription Builder**.
   - Input dropdowns for `Drug Name` (Warfarin, Aspirin, Amoxicillin, Metformin, Lisinopril, Ibuprofen), `Dosage`, `Frequency`.
3. **[00:50 - 01:20] Live Safety Warning Call:**
   - On drug selection change, trigger POST request to `/api/safety-check`.
   - Render `SafetyAlertBanner.tsx`:
     - 🔴 **HIGH RISK:** Red border, AlertTriangle icon, bold reason, and mandatory override input box.
     - 🟡 **MEDIUM RISK:** Yellow border, caution icon.
     - 🟢 **SAFE:** Green checkmark banner.
4. **[01:20 - 01:50] Form Submission:**
   - On "Confirm & Prescribe", POST new drug to `/api/patient/[id]/prescribe`.
   - Show toast/notification and append to patient active medication list.

#### AI Prompt for Person 1 (Copy-Paste to AI Assistant)
> "You are Person 1 on the MediShield hackathon team. Your job is to build the Doctor Portal in Next.js 14 App Router using Tailwind CSS and Lucide React. Build `src/components/QrScanner.tsx` with `html5-qrcode` (and a fallback manual text box for patient ID 'MS-9042'). Build `src/app/doctor/patient/[id]/page.tsx` displaying patient summary and a prescription form. When a drug is selected, call `POST /api/safety-check` and dynamically render a red/yellow/green safety alert banner with clinical explanation and an override input."

---

### 👨‍💻 PERSON 2: Patient Portal & Timeline Lead

#### Objective
Build the Patient Registration/Dashboard, QR Code generator, Medication Timeline display, and Mock OCR upload feature.

#### Step-by-Step Task List
1. **[00:00 - 00:20] Patient Dashboard (`src/app/patient/page.tsx`):**
   - Profile Header (Name, Age, Blood Group, Emergency Contact).
   - Prominent **Health QR Code Card** using `qrcode.react`. Render `patient.healthId`.
2. **[00:20 - 00:50] Timeline Component (`src/components/Timeline.tsx`):**
   - Render active medications with status badges (`ACTIVE` in green, `HISTORICAL` in grey).
   - Display allergy warnings in prominent red badge box.
3. **[00:50 - 01:20] Add Medication Form & Mock OCR (`src/app/patient/add-med/page.tsx`):**
   - Manual form: `Drug Name`, `Dosage`, `Frequency`, `Start Date`.
   - **Mock OCR Prescriptions Scanner:** File upload dropzone. When an image is dropped, display a 1-second loading spinner and pre-fill "Amoxicillin 500mg, 3x daily".
4. **[01:20 - 01:50] Navigation & Styling:**
   - Add clean top navigation bar with toggle between "Patient View" and "Doctor View".

#### AI Prompt for Person 2 (Copy-Paste to AI Assistant)
> "You are Person 2 on the MediShield hackathon team. Build the Patient Portal in Next.js 14 App Router using Tailwind CSS. Build `src/app/patient/page.tsx` featuring a patient profile, scannable QR Code using `qrcode.react`, and a medication timeline. Build `src/app/patient/add-med/page.tsx` with a manual form and a Mock OCR file drag-and-drop component that simulates parsing a prescription image and populating the form fields."

---

### 👨‍💻 PERSON 3: Backend & Safety Engine Lead

#### Objective
Setup Prisma DB schema, seed demo data, implement the Safety Check Rule Engine, and create REST API endpoints.

#### Step-by-Step Task List
1. **[00:00 - 00:20] Database Schema & Seeding (`prisma/`):**
   - Initialize SQLite database using Prisma.
   - Define models: `Patient`, `Allergy`, `Condition`, `Medication`.
   - Create `prisma/seed.ts` seeding demo patient:
     - Name: **John Doe**, Health ID: **MS-9042**, Age: **58**, Blood Group: **O+**
     - Active Med: **Warfarin 5mg (Daily)**
     - Allergy: **Penicillin (Severity: HIGH)**
     - Condition: **Hypertension**
2. **[00:20 - 00:50] Core Safety Engine (`src/lib/safety-engine.ts`):**
   - Write `evaluateSafety(patientId, newDrugName)` logic.
   - Check Duplicate: Match against patient active meds.
   - Check Allergy: Amoxicillin / Ampicillin vs Penicillin allergy.
   - Check Drug-Drug Interactions:
     - Warfarin + Aspirin -> 🔴 HIGH (Bleeding Risk)
     - Warfarin + Ibuprofen -> 🔴 HIGH (GI Bleed Risk)
     - Lisinopril + Potassium -> 🔴 HIGH (Hyperkalemia)
     - Simvastatin + Clarithromycin -> 🔴 HIGH (Rhabdomyolysis)
3. **[00:50 - 01:20] API Route Implementation:**
   - `GET /api/patient/[id]`: Returns full patient profile with active meds & allergies.
   - `POST /api/safety-check`: Receives `{ patientId, newDrugName }` and returns `SafetyAlert` JSON.
   - `POST /api/patient/[id]/prescribe`: Saves new medication to DB.
4. **[01:20 - 01:50] Edge Case Testing:**
   - Verify safety check response time (`<10ms`).
   - Ensure CORS / JSON parsing handles invalid inputs gracefully.

#### AI Prompt for Person 3 (Copy-Paste to AI Assistant)
> "You are Person 3 on the MediShield hackathon team. Set up Prisma ORM with SQLite in Next.js 14. Create models for Patient, Allergy, Condition, and Medication. Write a seed script for patient 'John Doe' (Health ID: MS-9042) with active Warfarin and Penicillin allergy. Build `src/lib/safety-engine.ts` containing the interaction checking matrix (Warfarin+Aspirin, Penicillin+Amoxicillin, etc.) and create API routes `GET /api/patient/[id]`, `POST /api/safety-check`, and `POST /api/patient/[id]/prescribe`."

---

## 4. Contract Definition (Shared API Specs)

To work in parallel without friction, all 3 developers adhere to these exact JSON contracts:

### API Contract 1: `GET /api/patient/MS-9042`
**Response:**
```json
{
  "id": "c123-uuid",
  "healthId": "MS-9042",
  "name": "John Doe",
  "age": 58,
  "gender": "Male",
  "bloodGroup": "O+",
  "allergies": [
    { "id": "a1", "allergen": "Penicillin", "severity": "HIGH" }
  ],
  "conditions": [
    { "id": "c1", "condition": "Hypertension" }
  ],
  "medications": [
    {
      "id": "m1",
      "drugName": "Warfarin",
      "genericName": "warfarin sodium",
      "dosage": "5mg",
      "frequency": "Once Daily",
      "startDate": "2026-01-10",
      "status": "ACTIVE",
      "prescribedBy": "Dr. Sarah Lin"
    }
  ]
}
```

### API Contract 2: `POST /api/safety-check`
**Request Body:**
```json
{
  "patientId": "MS-9042",
  "newDrugName": "Aspirin"
}
```
**Response:**
```json
{
  "riskLevel": "HIGH",
  "conflictType": "DRUG_DRUG",
  "conflictingItem": "Warfarin 5mg (Active)",
  "reason": "Concomitant use of Warfarin and Aspirin dramatically increases the risk of severe GI and internal bleeding.",
  "clinicalAction": "Avoid combination unless strictly monitored for cardiac indications. Consider acetaminophen for pain."
}
```
