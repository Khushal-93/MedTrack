# 🧑‍💻 PERSON 2 — ChatGPT Master Prompt: MediShield Patient Portal

> **Copy everything below this line and paste it into ChatGPT as your first message.**

---

---

## PASTE START ↓

You are my dedicated coding assistant helping me build **my portion** of a hackathon project called **MediShield** — a real-time medication safety system for patients and doctors. I am **Person 2 (Patient Portal & Timeline Lead)** on a 3-person team building this in Next.js 14.

We are working from the GitHub repo: **https://github.com/Khushal-93/MedTrack**

---

## 🎯 My Role (Person 2)

I own the entire **Patient-facing experience**:
1. **Patient Dashboard** (`/patient`) — profile card, health QR code, active medications, allergies
2. **Medication Timeline** (`src/components/Timeline.tsx`) — chronological list of all drugs (active + past)
3. **Add Medication Page** (`/patient/add-med`) — manual medicine entry form + Mock OCR prescription upload
4. **Global Navigation** (`src/app/layout.tsx`) — top navbar with links to Patient View and Doctor View

I am **NOT** responsible for:
- Doctor portal (Person 1's job)
- Backend/database/APIs (Person 3's job)
- The safety engine check logic (Person 3's job)

---

## 🛠️ Tech Stack (I must use exactly this)

- **Framework:** Next.js 14 App Router (TypeScript)
- **Styling:** Tailwind CSS only (no other CSS)
- **Icons:** `lucide-react` (Shield, Pill, AlertTriangle, QrCode, Plus, Upload, User, Heart, Clock, CheckCircle)
- **QR Code Generator:** `qrcode.react` (package: `qrcode.react`)
- **Database:** Prisma ORM + SQLite (Person 3 sets this up, I just call the APIs)
- **NO** external CSS libraries like Bootstrap or MUI

---

## 📁 Exact File Structure I Need to Create

```
src/
├── app/
│   ├── layout.tsx              ← Global layout with top nav
│   ├── page.tsx                ← Landing page (Portal Selector)
│   ├── patient/
│   │   ├── page.tsx            ← Patient Dashboard (MY MAIN FILE)
│   │   └── add-med/
│   │       └── page.tsx        ← Add medication page (Manual + OCR)
├── components/
│   ├── QrCodeDisplay.tsx       ← QR code renderer using qrcode.react
│   └── Timeline.tsx            ← Medication history list component
└── types/
    └── index.ts                ← Shared TypeScript interfaces (below)
```

---

## 📐 Shared TypeScript Interfaces (src/types/index.ts)

Person 3 defines these. I must use them exactly as-is:

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
```

---

## 🔌 API Contracts I Consume (Person 3 builds these, I just call them)

### GET `/api/patient/[healthId]`
Used to fetch patient profile on the dashboard.

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

### POST `/api/patient/[healthId]/prescribe`
Used when patient manually adds a medication.

**Request Body:**
```json
{
  "drugName": "Metformin",
  "genericName": "metformin hydrochloride",
  "dosage": "500mg",
  "frequency": "Twice Daily",
  "startDate": "2026-08-20",
  "status": "ACTIVE",
  "prescribedBy": "Self / Dr. Patel"
}
```

**Response:** `{ "success": true, "medication": { ...MedicationItem } }`

---

## 📋 Detailed Build Instructions (Build in this order)

---

### STEP 1 — `src/types/index.ts`
Create the shared type file with the exact interfaces shown above. Nothing else.

---

### STEP 2 — `src/app/layout.tsx` (Global Layout + Nav)

Create the root layout with:
- A **top navigation bar** with:
  - Left: "🛡️ MediShield" logo text in teal/blue
  - Middle/Right nav links: `[ Patient Portal ]` → `/patient` and `[ Doctor Portal ]` → `/doctor/scan`
  - Active link styling (underline or bold)
- Clean white background, subtle bottom border on nav
- `{children}` rendered below nav

---

### STEP 3 — `src/app/page.tsx` (Landing / Portal Selector)

A clean landing page with:
- Big centered heading: "**MediShield** — Medication Safety for Everyone"
- Tagline: "Preventing duplicate, conflicting, and allergic prescriptions in real time."
- Two large cards side-by-side:
  - **Card 1:** 🏥 "I'm a Patient" → Link to `/patient` (blue/teal theme)
  - **Card 2:** 👨‍⚕️ "I'm a Doctor" → Link to `/doctor/scan` (green theme)
- Use Tailwind CSS flexbox/grid layout

---

### STEP 4 — `src/components/QrCodeDisplay.tsx`

A reusable component that takes `healthId: string` as a prop and renders a QR code.

Requirements:
- Import `QRCodeSVG` from `qrcode.react`
- The QR code value should be: `https://medishield.app/doctor/scan?patient_id=${healthId}` 
- Size: 200x200
- Include a caption below: `Health ID: ${healthId}`
- Include two buttons below the QR: `📥 Download QR` and `🖨️ Print`
- Wrap the QR in a white card with shadow and rounded corners

---

### STEP 5 — `src/components/Timeline.tsx`

A reusable component that takes `medications: MedicationItem[]` as a prop.

Requirements:
- Section title: "💊 Medication Timeline"
- For each medication, render a timeline card showing:
  - **Drug name** (large, bold) + generic name (small, grey)
  - **Dosage** + Frequency badge
  - **Prescribed by** + Start date
  - **Status badge:**
    - `ACTIVE` → green pill badge
    - `DISCONTINUED` → red pill badge
    - `COMPLETED` → grey pill badge
- Sort: ACTIVE medications first, then historical
- If empty: show a friendly "No medications recorded yet." message with a Pill icon

---

### STEP 6 — `src/app/patient/page.tsx` (Patient Dashboard — MAIN PAGE)

This is the most important page. It must:

**A. Data Fetching:**
- On load, fetch patient data from `GET /api/patient/MS-9042`
- (Hardcode `MS-9042` for the demo — in real app this would come from session/auth)
- While loading: show a skeleton/spinner
- On error: show a red error card

**B. Profile Header Card:**
- Patient avatar (initials circle, e.g. "JD" for John Doe)
- Name, Age, Gender, Blood Group in a clean grid
- Allergy section: each allergy shown as a red badge (e.g. `⚠️ Penicillin — SEVERE`)
- Conditions section: shown as blue-grey tags (e.g. `Hypertension`)

**C. QR Code Card** (using `QrCodeDisplay` component):
- Titled: "Your Health QR Code"
- Subtitle: "Show this to your doctor for instant access to your medication history."
- Render `<QrCodeDisplay healthId={patient.healthId} />`

**D. Medication Timeline** (using `Timeline` component):
- Section: "Active Medications"
- Show count badge: "2 Active"
- Render `<Timeline medications={patient.medications} />`

**E. Add Medication Button:**
- A teal `➕ Add Medication` button that links to `/patient/add-med`

**Layout:** Two-column layout on desktop (Profile + QR on left, Timeline on right). Single column on mobile.

---

### STEP 7 — `src/app/patient/add-med/page.tsx` (Add Medication Page)

Two sections on this page:

**Section A — Manual Entry Form:**
- Form fields:
  - Drug Name (text input, required)
  - Generic Name (text input, optional)
  - Dosage (text input, e.g. "500mg", required)
  - Frequency (dropdown: Once Daily, Twice Daily, Three Times Daily, As Needed, required)
  - Start Date (date picker, required)
  - Prescribed By (text input, e.g. "Dr. Patel", required)
  - Notes (textarea, optional)
- Submit button: `💾 Add to Timeline`
- On submit: POST to `/api/patient/MS-9042/prescribe`
- On success: show green toast "✅ Medication added!" and redirect to `/patient`
- On error: show red error message

**Section B — Mock OCR Prescription Scanner:**
- A drag-and-drop file upload zone with dashed border
- Label: "📄 Upload Prescription / Medicine Strip"
- Subtitle: "Upload a photo and we'll extract the medicine details automatically."
- When a file is dropped/selected:
  1. Show a spinner with text "🔍 Scanning prescription..."
  2. After 1.5 seconds (simulated delay), auto-fill the form fields with:
     - Drug Name: `Amoxicillin`
     - Generic Name: `amoxicillin trihydrate`
     - Dosage: `500mg`
     - Frequency: `Three Times Daily`
  3. Show a green banner: "✅ Prescription scanned! Please review and confirm."
- Note in small text: "OCR parsing is simulated for demo. In production, this uses AI/Tesseract."

---

## 🎨 Visual Design System

Use this consistent color palette across all my pages:

| Element | Tailwind Class |
|---|---|
| Primary brand color | `teal-600` / `teal-700` |
| Active status badge | `bg-green-100 text-green-800` |
| Discontinued badge | `bg-red-100 text-red-800` |
| Completed badge | `bg-gray-100 text-gray-700` |
| HIGH allergy/alert | `bg-red-500 text-white` |
| MODERATE allergy | `bg-orange-400 text-white` |
| LOW allergy | `bg-yellow-300 text-gray-800` |
| Page background | `bg-gray-50` |
| Cards | `bg-white rounded-2xl shadow-md p-6` |
| Section headings | `text-xl font-bold text-gray-800` |
| Body text | `text-gray-600` |
| Nav bar | `bg-white border-b border-gray-200` |

---

## ✅ Definition of Done (How I Know My Part Works)

1. `npm run dev` starts with zero TypeScript errors.
2. Visiting `/` shows the portal selector landing page.
3. Visiting `/patient` shows John Doe's profile, QR code, and Warfarin in the timeline.
4. The QR code renders and shows Health ID `MS-9042`.
5. Visiting `/patient/add-med` shows the manual form and OCR upload zone.
6. Dropping any file into the OCR upload auto-fills the form with Amoxicillin 500mg details.
7. Submitting the form calls `POST /api/patient/MS-9042/prescribe` (you can mock the API response if Person 3 isn't ready yet).
8. All pages are mobile responsive.

---

## 🚀 How to Start (Tell Me What to Do First)

Please:
1. Start by generating ALL the files in order (Steps 1 → 7).
2. Give me complete, copy-pasteable code for each file — no placeholders, no "add your logic here" comments.
3. After generating all files, give me the exact terminal commands to install dependencies and run the project.
4. If you need to make any assumptions, tell me clearly.

The demo patient for all hardcoded fallbacks is:
- **Name:** John Doe
- **Health ID:** MS-9042
- **Active Drug:** Warfarin 5mg (Daily) — prescribed by Dr. Sarah Lin
- **Allergy:** Penicillin (Severity: HIGH)
- **Condition:** Hypertension

Let's go — build me Step 1 first.

## PASTE END ↑

---
---

## 📖 How to Use This Prompt (Your Instructions)

1. **Open ChatGPT** (GPT-4o recommended for best code quality).
2. **Copy everything between `PASTE START ↓` and `PASTE END ↑`** above.
3. **Paste it as your very first message** in a new ChatGPT conversation.
4. ChatGPT will start building Step 1. **Keep saying `"Next step"` or `"Continue to Step X"` to progress.**
5. When ChatGPT gives you a file, **immediately save it** at the exact path shown.

### 💡 Useful Follow-up Prompts
After pasting the master prompt, use these to guide ChatGPT:

| When you want... | Say this to ChatGPT |
|---|---|
| Next file | `"Great, now build Step 3 — layout.tsx"` |
| Fix a bug | `"This gives error: [paste error]. Fix it."` |
| API not ready yet | `"Person 3's API isn't ready. Use this mock data instead: [paste JSON above]"` |
| Better styling | `"Make the patient dashboard look more modern and medical"` |
| Test the OCR flow | `"Walk me through testing the OCR drag-and-drop flow manually"` |

### ⚠️ Common Issues & Fixes

| Issue | Fix |
|---|---|
| `Module not found: qrcode.react` | Run `npm install qrcode.react` |
| `QRCodeSVG is not exported` | Use `import { QRCodeSVG } from 'qrcode.react'` |
| TypeScript errors on `PatientProfile` | Make sure `src/types/index.ts` exists with exact interfaces |
| API call fails during demo | Temporarily replace fetch with mock data JSON inline |
| OCR upload doesn't trigger | Check the `onChange` event on `<input type="file">` |
