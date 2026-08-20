# 🚀 MediShield — Digital Medication-Safety Identity

> **Digital medication-safety identity for every patient preventing duplicate, conflicting, or allergic prescriptions in real time.**

---

## 📌 Project Overview & Documentation Quick Links

MediShield is designed for rapid 2-hour hackathon execution by a team of 3 developers or AI coding agents working in parallel. All architecture, design decisions, API contracts, and task allocations are documented in detail below:

- [📋 **Product Requirement Document (PRD.md)**](file:///C:/Projects/MedTrack/PRD.md)  
  *Executive summary, problem statement, user personas, functional & non-functional requirements.*

- [🛠️ **Tech Stack & Implementation Specifications (TECH_STACK.md)**](file:///C:/Projects/MedTrack/TECH_STACK.md)  
  *Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, SQLite schema, and package dependencies.*

- [🎨 **System Architecture & Design Specification (DESIGN.md)**](file:///C:/Projects/MedTrack/DESIGN.md)  
  *System architecture diagram, sequence diagram, safety engine rules matrix, and UI/UX wireframes.*

- [⏱️ **2-Hour Speedrun Roadmap & Task Division (ROADMAP.md)**](file:///C:/Projects/MedTrack/ROADMAP.md)  
  *Minute-by-minute timeline, team member allocation (Person 1, Person 2, Person 3), API contracts, and AI prompts.*

---

## 💡 How It Works (The 1-Minute Summary)

1. **Patient Profile & Health ID:** Patient registers and gets a unique **Health ID + scannable QR Code** pointing to their record.
2. **Medication Timeline:** Patient adds active medications, past history, and allergies manually or via OCR script scanner.
3. **Doctor Scan:** Doctor scans the patient's QR code during consultation to instantly load active meds and allergy profile.
4. **Safety Check Engine:** As the doctor types a new prescription, the Safety Engine automatically checks in real-time against active drugs, allergies, and contraindications.
5. **Real-time Alert & Decision:** If a risk exists (e.g. Warfarin + Aspirin bleeding risk), an explainable alert appears. The doctor can override with clinical justification or alter the prescription.

---

## 👥 2-Hour Speedrun Team Breakdown

- **Person 1 (Doctor Portal & Safety UI Lead):** Doctor QR Camera Scanner, Patient View, Rx Builder, and Dynamic Alert Banner (`/doctor/scan`, `/doctor/patient/[id]`).
- **Person 2 (Patient Portal & Timeline Lead):** Patient Registration, QR Code Generator (`qrcode.react`), Timeline view, and Mock OCR parser (`/patient`, `/patient/add-med`).
- **Person 3 (Backend & Safety Engine Lead):** Prisma Database Schema, Seed data (John Doe), Safety check rule matrix, and REST APIs (`/api/safety-check`, `/api/patient/[id]`).

---

## 🚀 Quick Setup Instructions

```bash
# 1. Clone/Navigate to folder
cd C:\Projects\MedTrack

# 2. Install dependencies
npm install

# 3. Setup SQLite Database & Seed Demo Data
npx prisma db push
npx prisma db seed

# 4. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start the app.
