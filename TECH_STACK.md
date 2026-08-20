# 🛠️ Tech Stack & Implementation Specification — MediShield

> **Target Build:** Next.js 14/15 Fullstack (App Router, TypeScript, Tailwind CSS)  
> **Optimized for:** High-speed development, zero complex infrastructure, plug-and-play execution.

---

## 1. Complete Technology Architecture

```
[ Frontend: Next.js App Router (React + TypeScript) ]
         │
         ├── UI Components: Tailwind CSS + Lucide Icons + Radix UI
         ├── QR Generator: qrcode.react
         ├── QR Reader: html5-qrcode
         └── OCR Parser: Tesseract.js / Gemini API / Mock Engine
         │
[ Backend: Next.js API Routes & Server Actions ]
         │
         ├── Safety Engine: Custom Rules Rule-Set + Drug Interaction Knowledge Base
         └── Database / Storage: Prisma ORM + SQLite (or Supabase / PostgreSQL)
```

---

## 2. Technology Choices & Justification

| Layer | Recommended Choice | Rationale for 2-Hour Speedrun |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14/15 (App Router)** | Fullstack in a single repository. Zero CORS issues, Server Actions for instant backend APIs. |
| **Language** | **TypeScript** | Shared interfaces (`Patient`, `Medication`, `SafetyAlert`) between frontend and backend. Prevents runtime bugs during demo. |
| **Styling** | **Tailwind CSS** | Rapid UI styling with pre-built utility classes. Clean medical aesthetic (blues/teals/red alerts). |
| **Icons & UI** | **Lucide-React** | Clean icons for alerts (Shield, AlertTriangle, CheckCircle, QrCode, Stethoscope, Pill). |
| **QR Code Gen** | **`qrcode.react`** | Zero-config React component to turn `patient_id` into SVG/PNG instantly. |
| **QR Scanner** | **`html5-qrcode`** | Uses laptop/mobile camera directly in browser with 5 lines of setup. |
| **Database** | **SQLite via Prisma ORM** | File-based database (`prisma/dev.db`). No cloud provisioning needed; boots in 2 seconds locally. |
| **Safety Engine** | **TypeScript Rule Matrix** | Pre-seeded dictionary of 50+ common drug interactions & allergy groups for instant sub-10ms response. |
| **Prescription OCR**| **Mock / Tesseract.js** | Fallback parser for extracting drug name/dosage from image upload for demonstration reliability. |

---

## 3. Recommended Directory Structure

```
MedTrack/
├── prisma/
│   ├── schema.prisma         # Database schema (Patients, Medications, Allergies, History)
│   └── seed.ts               # Seed data for demo (John Doe, Warfarin, Penicillin allergy)
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Global Layout with Nav
│   │   ├── page.tsx          # Landing / Portal Selector
│   │   ├── patient/
│   │   │   ├── page.tsx      # Patient Dashboard (Profile, Timeline, QR Display)
│   │   │   └── add-med/      # Add medication form (Manual + OCR Upload)
│   │   └── doctor/
│   │       ├── scan/         # Doctor Camera Scanner
│   │       └── patient/[id]/ # Doctor Patient View & Interactive Rx Safety Form
│   ├── components/
│   │   ├── QrScanner.tsx     # Webcam scanner component
│   │   ├── QrCodeDisplay.tsx # Patient QR rendering component
│   │   ├── SafetyAlertBanner.tsx # Dynamic Red/Yellow alert component
│   │   └── Timeline.tsx      # Chronological medication display
│   ├── lib/
│   │   ├── db.ts             # Prisma client instance
│   │   ├── safety-engine.ts  # Core drug interaction & allergy checking logic
│   │   └── drug-database.ts  # Drug interaction matrix & allergy cross-references
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 4. Dependencies (`package.json`)

```json
{
  "name": "medishield",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.12.0",
    "qrcode.react": "^3.1.0",
    "html5-qrcode": "^2.3.8",
    "lucide-react": "^0.368.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.2.0",
    "prisma": "^5.12.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 5. Data Model (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Patient {
  id               String       @id @default(uuid())
  healthId         String       @unique // e.g., MS-9042
  name             String
  age              Int
  gender           String
  bloodGroup       String
  allergies        Allergy[]
  conditions       Condition[]
  medications      Medication[]
  createdAt        DateTime     @default(now())
}

model Allergy {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  allergen    String   // e.g., "Penicillin", "Sulfa"
  severity    String   // "HIGH", "MODERATE", "LOW"
}

model Condition {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  condition   String   // e.g., "Chronic Kidney Disease", "Hypertension"
}

model Medication {
  id              String   @id @default(uuid())
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])
  drugName        String   // e.g., "Warfarin", "Aspirin"
  genericName     String   // e.g., "warfarin sodium"
  dosage          String   // e.g., "5mg"
  frequency       String   // e.g., "Once Daily"
  startDate       String
  endDate         String?
  status          String   // "ACTIVE", "DISCONTINUED", "COMPLETED"
  prescribedBy    String   // e.g., "Dr. Smith"
  notes           String?
  createdAt       DateTime @default(now())
}
```

---

## 6. Shared TypeScript Types (`src/types/index.ts`)

```typescript
export interface PatientProfile {
  id: string;
  healthId: string;
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
  allergen: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface ConditionItem {
  id: string;
  condition: string;
}

export interface MedicationItem {
  id: string;
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';
  prescribedBy: string;
}

export interface SafetyCheckRequest {
  patientId: string;
  newDrugName: string;
  dosage?: string;
}

export interface SafetyAlert {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  conflictType: 'DRUG_DRUG' | 'ALLERGY' | 'DUPLICATE' | 'CONTRAINDICATION' | 'NONE';
  conflictingItem: string;
  reason: string;
  clinicalAction: string;
}
```
