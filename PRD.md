# 📋 Product Requirement Document (PRD) — MediShield

> **Project Name:** MediShield  
> **Tagline:** Digital Medication-Safety Identity & Real-Time Conflict Prevention System  
> **Target Execution Time:** 2-Hour Speedrun (Hackathon MVP)  
> **Target Team Size:** 3 Developers  

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
In healthcare settings, doctors frequently lack immediate, comprehensive access to a patient’s historical and active medication list, known allergies, and underlying medical conditions. This information asymmetry leads to severe medical errors:
- **Duplicate Prescriptions:** Prescribing the same active drug under different brand names.
- **Drug-Drug Interactions (DDI):** Prescribing medications that interact dangerously (e.g., Warfarin + Aspirin causing internal bleeding).
- **Allergy Violations:** Prescribing drugs containing compounds the patient is allergic to (e.g., Amoxicillin to a Penicillin-allergic patient).
- **Contraindications:** Prescribing drugs dangerous for specific pre-existing conditions (e.g., NSAIDs for severe renal impairment).

### 1.2 The MediShield Solution
**MediShield** provides a universal **Digital Medication-Safety Identity** for patients. 
- Every patient gets a unique **Health ID & dynamic QR Code**.
- Patients maintain a secure, comprehensive **Medication Timeline** (via OCR scan or manual entry).
- Doctors scan the patient's QR code during a visit, instantly viewing authorized medical history.
- When drafting a new prescription, the **Medication Safety Engine** automatically checks against active drugs, historical drugs, allergies, and pre-existing conditions, providing **explainable, real-time risk alerts** before final submission.

---

## 2. Speedrun Scope (2-Hour MVP)

To deliver a working end-to-end prototype in 2 hours, non-critical enterprise features (billing, multi-hospital SSO, full EHR integrations) are deferred.

### 🟢 In Scope for 2-Hour MVP
1. **Patient Profile & QR Generation:**
   - Patient registration with name, age, blood group, emergency contact, known allergies, and pre-existing conditions.
   - Generation of a scannable QR Code containing/pointing to `patient_id`.
2. **Medication Timeline:**
   - Display active and past medications with start/end dates, dosages, and prescribing doctors.
   - Manual medication entry form + mock/quick OCR prescription upload parser.
3. **Doctor QR Scanner & Patient Lookup:**
   - Doctor dashboard with camera-based QR reader or manual Health ID lookup.
   - Instant fetch and render of patient timeline & safety profile.
4. **Prescription Form & Real-Time Safety Engine:**
   - Interactive prescription builder (Drug search/select, dosage, frequency, duration).
   - Instant client/server-side safety evaluation against active meds, allergies, and contraindications.
   - Color-coded risk banner (HIGH / MEDIUM / LOW) with human-readable rationale and override capability.
5. **Prescription Finalization:**
   - Adding the validated prescription directly to the patient's timeline upon doctor confirmation.

### 🔴 Deferred / Future Scope (Post-MVP)
- Full HIPAA/GDPR audit log system (simplified log for MVP).
- Complex NLP parsing of unstructured handwritten clinical notes.
- Pharmacy dispensing module.

---

## 3. User Personas & Core User Flows

### Persona A: The Patient (e.g., John Doe, 58)
- **Goal:** Keep an updated digital list of active/past medications and show it to any doctor effortlessly.
- **Flow:**
  1. Opens MediShield app -> Registers profile.
  2. Adds active medications (e.g., *Warfarin 5mg Daily*, *Metformin 500mg*).
  3. Lists allergy: *Penicillin*.
  4. Obtains permanent QR Code on dashboard.

### Persona B: The Attending Doctor (e.g., Dr. Sarah Lin, Cardiologist)
- **Goal:** Quickly view John’s medical history and safely prescribe *Aspirin 81mg* or *Amoxicillin 500mg* without causing adverse interactions.
- **Flow:**
  1. Doctor opens Doctor Portal -> Clicks "Scan Patient QR".
  2. Scans John's QR code -> System loads John's active meds & allergies.
  3. Doctor starts typing new prescription: `Aspirin 81mg`.
  4. **Safety Engine fires instantly:**
     - 🔴 **HIGH RISK ALERT:** *Warfarin + Aspirin interaction detected (Increased bleeding risk).*
  5. Doctor reviews reason, adjusts dosage or changes drug, and submits final prescription.
  6. Prescription is appended to John's timeline.

---

## 4. Key Functional Requirements

### FR-1: Patient Health ID & QR System
- **FR-1.1:** Generate a unique `patient_id` (UUID or readable hash e.g., `MS-98231`).
- **FR-1.2:** Render QR code containing `patient_id` or deep link `https://medishield.app/doctor/scan?patient_id=MS-98231`.

### FR-2: Medication & Health Profile Management
- **FR-2.1:** Store active drugs, dosage, frequency, start date, end date, status (`ACTIVE` | `DISCONTINUED` | `COMPLETED`).
- **FR-2.2:** Store patient allergies with severity (`MILD` | `MODERATE` | `SEVERE`).
- **FR-2.3:** Provide simple OCR/Mock upload component extracting drug names from image files.

### FR-3: Doctor Scan & History View
- **FR-3.1:** Integrated webcam/camera QR scanner using HTML5 webcam feed.
- **FR-3.2:** Concise, tabbed timeline interface showing: Active Drugs, Historical Drugs, Allergies, Conditions.

### FR-4: Medication Safety & Warning Engine
- **FR-4.1 (Duplicate Detection):** Trigger alert if prescribed drug matches active drug exact name or active ingredient.
- **FR-4.2 (Interaction Detection):** Check input drug against active drugs using interaction matrix database (e.g., Warfarin + Aspirin, Lisinopril + Potassium, Clarithromycin + Simvastatin).
- **FR-4.3 (Allergy Warning):** Check input drug against known patient allergies (e.g., Amoxicillin vs Penicillin allergy group).
- **FR-4.4 (Explainable Output):** Output alert level (`HIGH`, `MEDIUM`, `LOW`), Mechanism/Reason, and Suggested Action.

### FR-5: Prescription Submission & Timeline Update
- **FR-5.1:** Doctor can finalize prescription with mandatory override note if a HIGH/MEDIUM alert is bypassed.
- **FR-5.2:** Real-time state update appending new drug to active medication list.

---

## 5. Non-Functional & Hackathon Quality Requirements

- **Latency:** Safety check engine must evaluate in `< 100ms` (in-memory execution).
- **UI Responsiveness:** Fully mobile-responsive layout (Tailwind CSS).
- **Reliability:** Local fallback data seeding available if external network fails during demo.
