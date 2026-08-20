# 🧑‍⚕️ PERSON 1 — ChatGPT Master Prompt: MediShield Doctor Portal

> **Copy everything below this line and paste it into ChatGPT as your first message.**

---

---

## PASTE START ↓

You are my dedicated coding assistant helping me build **my portion** of a hackathon project called **MediShield** — a real-time medication safety system for patients and doctors. I am **Person 1 (Doctor Portal & Safety UI Lead)** on a 3-person team building this in Next.js 14.

We are working from the GitHub repo: **https://github.com/Khushal-93/MedTrack**

---

## 🎯 My Role (Person 1)

I own the entire **Doctor-facing experience**:
1. **Doctor QR Scanner** (`/doctor/scan`) — webcam-based QR code scanner + manual Health ID fallback
2. **Doctor Patient View** (`/doctor/patient/[id]`) — full patient history: active meds, allergies, conditions
3. **Prescription Builder** (inside `/doctor/patient/[id]`) — interactive drug entry form with live safety check
4. **Safety Alert Banner** (`src/components/SafetyAlertBanner.tsx`) — dynamic RED/YELLOW/GREEN risk display

I am **NOT** responsible for:
- Patient portal, QR code generator, OCR upload (Person 2's job)
- Backend/database/APIs/safety engine logic (Person 3's job)
- `src/types/index.ts` shared types (Person 2 creates this, I just use it)

---

## 🛠️ Tech Stack (I must use exactly this)

- **Framework:** Next.js 14 App Router (TypeScript)
- **Styling:** Tailwind CSS only (no other CSS frameworks)
- **Icons:** `lucide-react` (AlertTriangle, CheckCircle, Shield, Stethoscope, QrCode, User, Pill, Clock, XCircle, Search, Camera)
- **QR Scanner:** `html5-qrcode` (package: `html5-qrcode`)
- **NO** external CSS libraries like Bootstrap or MUI

---

## 📁 Exact File Structure I Need to Create

```
src/
├── app/
│   └── doctor/
│       ├── scan/
│       │   └── page.tsx            ← QR Camera Scanner + Manual ID Lookup
│       └── patient/
│           └── [id]/
│               └── page.tsx        ← Patient History + Live Prescription Builder
└── components/
    ├── QrScanner.tsx               ← Webcam QR scanner component (reusable)
    └── SafetyAlertBanner.tsx       ← Dynamic risk alert component (reusable)
```

---

## 📐 Shared TypeScript Interfaces (from src/types/index.ts)

Person 2 creates these. I must use them exactly as-is — do NOT redefine them, just import from `@/types`:

```typescript
export interface PatientProfile {
  id: string;
  healthId: string;      // e.g. "MS-9042"
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: AllergyItem[];
  conditions: ConditionItem[];
  medications: MedicationItem[];
}

export interface AllergyItem {
  id: string;
  allergen: string;         // e.g. "Penicillin"
  severity: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface ConditionItem {
  id: string;
  condition: string;        // e.g. "Hypertension"
}

export interface MedicationItem {
  id: string;
  drugName: string;         // e.g. "Warfarin"
  genericName: string;      // e.g. "warfarin sodium"
  dosage: string;           // e.g. "5mg"
  frequency: string;        // e.g. "Once Daily"
  startDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';
  prescribedBy: string;     // e.g. "Dr. Sarah Lin"
}

export interface SafetyAlert {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  conflictType: 'DRUG_DRUG' | 'ALLERGY' | 'DUPLICATE' | 'CONTRAINDICATION' | 'NONE';
  conflictingItem: string;   // e.g. "Warfarin 5mg (Active)"
  reason: string;            // Clinical explanation
  clinicalAction: string;    // Suggested doctor action
}
```

---

## 🔌 API Contracts I Consume (Person 3 builds these, I just call them)

### GET `/api/patient/[healthId]`
Fetch full patient profile using their Health ID.

**Example Response:**
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

### POST `/api/safety-check`
Triggered live as the doctor types a new drug name. Returns safety evaluation.

**Request Body:**
```json
{
  "patientId": "MS-9042",
  "newDrugName": "Aspirin"
}
```

**Response (HIGH RISK example):**
```json
{
  "riskLevel": "HIGH",
  "conflictType": "DRUG_DRUG",
  "conflictingItem": "Warfarin 5mg (Active)",
  "reason": "Concomitant use of Warfarin and Aspirin dramatically increases the risk of severe GI and internal bleeding.",
  "clinicalAction": "Avoid combination unless strictly monitored for cardiac indications. Consider acetaminophen for pain."
}
```

**Response (SAFE example):**
```json
{
  "riskLevel": "NONE",
  "conflictType": "NONE",
  "conflictingItem": "",
  "reason": "",
  "clinicalAction": "No known conflicts detected. Safe to prescribe."
}
```

### POST `/api/patient/[healthId]/prescribe`
Submit finalized prescription, appends to patient's active medications.

**Request Body:**
```json
{
  "drugName": "Aspirin",
  "genericName": "acetylsalicylic acid",
  "dosage": "81mg",
  "frequency": "Once Daily",
  "startDate": "2026-08-20",
  "status": "ACTIVE",
  "prescribedBy": "Dr. Jane Smith",
  "notes": "Low-dose cardio protection. Patient informed of risk."
}
```

**Response:** `{ "success": true, "medication": { ...MedicationItem } }`

---

## 📋 Detailed Build Instructions (Build in this order)

---

### STEP 1 — `src/components/SafetyAlertBanner.tsx`

This is the most critical UI component. It receives a `SafetyAlert` object as a prop and renders a color-coded risk banner.

**Props:**
```typescript
interface Props {
  alert: SafetyAlert | null;
  isLoading: boolean;
}
```

**Render Rules:**
- If `isLoading` is true → show a subtle grey pulsing skeleton: "🔍 Checking for drug interactions..."
- If `alert` is null → show nothing (return null)
- If `alert.riskLevel === 'NONE'` → **Green banner:**
  - Icon: `CheckCircle` (green)
  - Title: "✅ No Conflicts Detected"
  - Body: "This medication appears safe based on the patient's current profile."
- If `alert.riskLevel === 'MEDIUM'` → **Yellow/Amber banner:**
  - Icon: `AlertTriangle` (amber)
  - Title: "⚠️ MEDIUM RISK — Review Recommended"
  - Body: `Conflict with: {alert.conflictingItem}`
  - Body: `Reason: {alert.reason}`
  - Body: `Action: {alert.clinicalAction}`
- If `alert.riskLevel === 'HIGH'` → **Red banner:**
  - Icon: `AlertTriangle` (red, larger)
  - Title: "🔴 HIGH RISK — Dangerous Interaction Detected"
  - Body: `Conflict with: {alert.conflictingItem}`
  - Body: `Reason: {alert.reason}`
  - Body: `Suggested Action: {alert.clinicalAction}`
  - Extra: Show a mandatory `<textarea>` input: "⚠️ To override, you must enter a clinical justification:"
  - Extra: Show a red "Override & Prescribe Anyway" button (secondary, outlined)

Styling reference:
- HIGH: `border-red-500 bg-red-50 text-red-900`
- MEDIUM: `border-amber-400 bg-amber-50 text-amber-900`
- NONE/SAFE: `border-green-500 bg-green-50 text-green-900`
- All banners: `border-l-4 rounded-lg p-4 my-4`

---

### STEP 2 — `src/components/QrScanner.tsx`

A webcam-based QR code scanner with a manual ID fallback.

**Props:**
```typescript
interface Props {
  onScan: (healthId: string) => void;  // Called when a valid QR is scanned
}
```

**Requirements:**
- Use the `html5-qrcode` library. It MUST be a Client Component (`'use client'`).
- Initialize the scanner on mount using `Html5QrcodeScanner` with a `<div id="qr-reader">` container.
- On successful scan, call `onScan(decodedText)` with the decoded health ID.
- Include a clearly labeled **fallback section** below the camera:
  - Divider: `— OR enter Health ID manually —`
  - A text input: `placeholder="e.g. MS-9042"` 
  - A `🔍 Look Up Patient` button
  - On button click / Enter key press, call `onScan(inputValue)`
- Cleanup the scanner on component unmount to avoid camera memory leaks.
- Show a message if camera permission is denied: "Camera access denied. Please use the manual input below."

---

### STEP 3 — `src/app/doctor/scan/page.tsx` (Doctor QR Scanner Page)

**This is the Doctor's entry point.**

Requirements:
- Title: "👨‍⚕️ Doctor Scan Portal"
- Subtitle: "Scan the patient's MediShield QR code or enter their Health ID."
- Render `<QrScanner onScan={handleScan} />`
- `handleScan` function: when a health ID is received, use `router.push('/doctor/patient/' + healthId)` to navigate to the patient view.
- Clean centered card layout, teal/blue color scheme.
- Show a small note: "Patient must present their QR code from the MediShield Patient Portal."

---

### STEP 4 — `src/app/doctor/patient/[id]/page.tsx` (Patient View + Prescription Builder)

This is the most complex page. The `[id]` is the patient's `healthId` (e.g. `MS-9042`).

**A. Data Fetching:**
- On mount, fetch `GET /api/patient/${params.id}`
- Show loading spinner while fetching
- Show error state if patient not found

**B. Patient Safety Summary Card (top of page):**
- Display: Name, Age, Gender, Blood Group in a clean header
- **Active Medications** badges: each drug as a blue pill (e.g. `Warfarin 5mg`)
- **Allergy badges** in red (e.g. `⚠️ Penicillin — HIGH`)
- **Conditions** in grey (e.g. `Hypertension`)
- This gives the doctor at-a-glance safety context

**C. Full Medication History Table:**
- Tabbed or sectioned: "Active Medications" | "Past Medications"
- For each med: Drug name, dosage, frequency, prescribed by, start date, status badge
- Table or card list format

**D. New Prescription Builder Form (main interactive section):**

Form fields:
- **Drug Name** — Searchable dropdown (options: `Aspirin`, `Amoxicillin`, `Ibuprofen`, `Metformin`, `Lisinopril`, `Simvastatin`, `Clarithromycin`, `Warfarin`, `Clopidogrel`, `Omeprazole`, `Paracetamol`, `Atenolol`)
- **Dosage** — text input (e.g. `81mg`, `500mg`)
- **Frequency** — dropdown: `Once Daily`, `Twice Daily`, `Three Times Daily`, `As Needed`, `Weekly`
- **Duration / End Date** — date input (optional)
- **Prescribed By** — text input (doctor's own name, e.g. `Dr. Jane Smith`)
- **Notes** — textarea (optional)

**Live Safety Check behavior:**
- Whenever `Drug Name` changes (use `onChange` with 300ms debounce), automatically call `POST /api/safety-check` with `{ patientId: params.id, newDrugName: selectedDrug }`
- Render `<SafetyAlertBanner alert={safetyAlert} isLoading={isChecking} />` below the drug input
- The banner updates in real-time as the drug selection changes

**Submit Button logic:**
- If `safetyAlert.riskLevel === 'NONE' or 'LOW'`: Show green `✅ Confirm & Prescribe` button (enabled)
- If `safetyAlert.riskLevel === 'MEDIUM'`: Show amber `⚠️ Prescribe with Caution` button (enabled, requires acknowledgement checkbox: "I have reviewed the medium risk interaction")
- If `safetyAlert.riskLevel === 'HIGH'`: Show red `🔴 Override & Prescribe` button (only enabled after override justification textarea is filled in)

**On Submit:**
- POST to `/api/patient/${params.id}/prescribe` with all form data + override note if applicable
- On success: show green toast "✅ Prescription added to patient timeline"
- Refresh patient medication list to show new drug immediately
- Reset form fields

---

## 🎨 Visual Design System

Use this consistent color palette across all my pages:

| Element | Tailwind Class |
|---|---|
| Primary brand color | `teal-600` / `teal-700` |
| HIGH risk alert | `border-red-500 bg-red-50 text-red-900` |
| MEDIUM risk alert | `border-amber-400 bg-amber-50 text-amber-900` |
| SAFE / NONE | `border-green-500 bg-green-50 text-green-900` |
| Active med badge | `bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm` |
| Allergy badge | `bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm` |
| Condition badge | `bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm` |
| Page background | `bg-gray-50` |
| Cards | `bg-white rounded-2xl shadow-md p-6` |
| Section headings | `text-xl font-bold text-gray-800` |
| Body text | `text-gray-600` |
| Confirm button (safe) | `bg-teal-600 hover:bg-teal-700 text-white` |
| Override button (HIGH) | `border-2 border-red-500 text-red-600 hover:bg-red-50` |

---

## 🧪 Key Demo Scenario (Must Work Perfectly)

This is the showstopper demo flow that must work end-to-end:

1. Doctor opens `/doctor/scan`
2. Doctor types `MS-9042` in the manual input → clicks "Look Up Patient"
3. Doctor is navigated to `/doctor/patient/MS-9042`
4. Doctor sees: **John Doe**, 58M, O+, Active: **Warfarin 5mg**, Allergy: **⚠️ Penicillin**
5. Doctor selects **Aspirin** from the Drug Name dropdown
6. 🔴 RED banner appears: *"HIGH RISK — Warfarin + Aspirin interaction: Increased bleeding risk"*
7. Doctor selects **Amoxicillin** instead
8. 🔴 RED banner appears: *"HIGH RISK — Patient has documented Penicillin allergy. Amoxicillin is a penicillin-class drug."*
9. Doctor selects **Paracetamol** (or **Clopidogrel**)
10. 🟢 GREEN banner appears: *"No conflicts detected. Safe to prescribe."*
11. Doctor fills in dosage and clicks `✅ Confirm & Prescribe`
12. Success toast appears, new drug shows up in the medication list

---

## ✅ Definition of Done (How I Know My Part Works)

1. `npm run dev` starts with zero TypeScript errors.
2. Visiting `/doctor/scan` shows QR scanner and manual Health ID input.
3. Typing `MS-9042` + clicking Look Up navigates to `/doctor/patient/MS-9042`.
4. Patient profile shows John Doe, Warfarin (active), Penicillin allergy badge.
5. Selecting **Aspirin** in the prescription form → 🔴 HIGH RISK banner with Warfarin interaction message.
6. Selecting **Amoxicillin** → 🔴 HIGH RISK banner with Penicillin allergy message.
7. Selecting **Paracetamol** → 🟢 SAFE banner.
8. HIGH RISK override textarea appears and enables submit only when filled.
9. Successful prescription submission shows toast and appends to medication list.
10. All pages are fully mobile responsive.

---

## 🚀 How to Start (Tell Me What to Do First)

Please:
1. Start by generating ALL the files in order (Steps 1 → 4).
2. Give me complete, copy-pasteable code for each file — **no placeholders**, no "add your logic here" comments.
3. After all files, give me the exact terminal commands to install dependencies.
4. If Person 3's API isn't ready yet, add a clearly marked mock data fallback at the top of the fetch call that I can swap out.

The demo patient for all hardcoded fallbacks is:
- **Name:** John Doe
- **Health ID:** MS-9042
- **Active Drug:** Warfarin 5mg (Daily) — prescribed by Dr. Sarah Lin (status: ACTIVE)
- **Allergy:** Penicillin (Severity: HIGH)
- **Condition:** Hypertension

The mock safety check logic (if API isn't ready):
- Aspirin → HIGH RISK (Warfarin + Aspirin bleeding risk)
- Ibuprofen → HIGH RISK (Warfarin + Ibuprofen GI bleed risk)
- Amoxicillin → HIGH RISK (Penicillin allergy)
- Warfarin → HIGH RISK (Duplicate — already active)
- Everything else → NONE (Safe)

Let's go — build me Step 1 (SafetyAlertBanner.tsx) first.

## PASTE END ↑

---
---

## 📖 How to Use This Prompt (Your Instructions)

1. **Open ChatGPT** (GPT-4o recommended for best code quality).
2. **Copy everything between `PASTE START ↓` and `PASTE END ↑`** above.
3. **Paste it as your very first message** in a new ChatGPT conversation.
4. ChatGPT will start with Step 1. **Keep saying `"Continue to Step X"` to progress.**
5. When ChatGPT gives you a file, **immediately save it** at the exact path shown.

### 💡 Useful Follow-up Prompts

| When you want... | Say this to ChatGPT |
|---|---|
| Next file | `"Great, now build Step 2 — QrScanner.tsx"` |
| Fix a bug | `"This gives error: [paste error]. Fix it."` |
| API not ready yet | `"Person 3's API isn't ready. Use the mock data fallback."` |
| Test the alert flow | `"Walk me through testing the Aspirin → HIGH RISK banner manually"` |
| Better styling | `"Make the safety alert banner more dramatic and attention-grabbing"` |
| Webcam not working | `"The QR scanner camera isn't initializing. Debug and fix."` |

### ⚠️ Common Issues & Fixes

| Issue | Fix |
|---|---|
| `Module not found: html5-qrcode` | Run `npm install html5-qrcode` |
| `Html5QrcodeScanner is not a constructor` | Ensure `'use client'` is at the top of `QrScanner.tsx` |
| Camera not working in browser | Use `http://localhost:3000` not `https` for dev — or use manual fallback |
| TypeScript error on `SafetyAlert` | Import from `@/types` not redefine it locally |
| API call fails during demo | Swap the fetch with the mock safety logic listed above |
| Scanner doesn't stop on unmount | Add `scanner.clear()` in the `useEffect` cleanup return |
