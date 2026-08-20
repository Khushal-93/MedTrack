# 🎨 System Architecture & Design Specification — MediShield

> **Document Focus:** System Architecture, Data Flow Diagrams, Safety Engine Logic Matrix, and UI Component Design.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Patient_Experience [Patient Experience]
        P1[Patient App / Web] -->|1. Register / Login| P2[View Profile & QR Code]
        P1 -->|2. Add Medicine / OCR Upload| P3[Update Timeline]
    end

    subgraph Doctor_Experience [Doctor Experience]
        D1[Doctor Dashboard] -->|3. Scan QR Code| D2[Webcam Scanner]
        D2 -->|4. Fetch Patient ID| D3[View Patient History & Allergies]
        D3 -->|5. Type New Prescription| D4[Interactive Rx Form]
    end

    subgraph Safety_Core [Medication Safety Engine]
        D4 -->|6. Trigger Live Check| SE1{Safety Engine Rules}
        SE1 -->|Check 1| SE_Dup[Duplicate Drug Check]
        SE1 -->|Check 2| SE_DDI[Drug-Drug Interaction Database]
        SE1 -->|Check 3| SE_Allergy[Allergy Cross-Match]
        SE1 -->|Check 4| SE_Contra[Condition Contraindication]
        
        SE_Dup --> SE_Res[Evaluate Risk Level]
        SE_DDI --> SE_Res
        SE_Allergy --> SE_Res
        SE_Contra --> SE_Res
        
        SE_Res -->|7. Return Alert Json| D4
    end

    subgraph Database_Layer [Persistence Layer]
        P2 <-->|SQLite / Prisma| DB[(MediShield DB)]
        P3 <-->|SQLite / Prisma| DB
        D3 <-->|SQLite / Prisma| DB
        D4 -->|8. Save Validated Rx| DB
    end
```

---

## 2. Sequence Diagram: End-to-End Clinical Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    actor Doctor
    participant UI as Next.js Web App
    participant Engine as Safety Check Engine
    participant DB as Database (Prisma/SQLite)

    Patient->>UI: Registers Profile & Active Meds (e.g. Warfarin 5mg, Penicillin Allergy)
    UI->>DB: Save Patient Record
    DB-->>UI: Return Health ID (MS-9042)
    UI-->>Patient: Render Dynamic QR Code (contains MS-9042)

    Note over Patient, Doctor: Patient arrives at Clinic / ER

    Doctor->>UI: Open Doctor Scanner & Scan Patient QR
    UI->>DB: GET /api/patient/MS-9042
    DB-->>UI: Return Profile + Active Meds + Allergies
    UI-->>Doctor: Display Timeline & Profile Summary

    Doctor->>UI: Select/Type New Drug: "Aspirin 81mg"
    UI->>Engine: POST /api/safety-check { patientId: "MS-9042", drug: "Aspirin" }
    
    Note over Engine: Engine evaluates Aspirin against active Warfarin & Penicillin
    Engine-->>UI: Return HIGH Risk Alert (Bleeding Risk: Warfarin + Aspirin)
    
    UI-->>Doctor: Display Red Warning Banner with Clinical Reason & Action
    
    alt Doctor Overrides Warning
        Doctor->>UI: Enter Override Note ("Low dose cardio protection, monitored")
        Doctor->>UI: Click "Confirm & Prescribe"
        UI->>DB: Append Aspirin to Patient Active Medications
        DB-->>UI: Prescription Saved
        UI-->>Doctor: Show Success Confirmation
    else Doctor Changes Drug
        Doctor->>UI: Change Drug to "Clopidogrel" (or alternative)
        UI->>Engine: Re-evaluate Safety
        Engine-->>UI: Return LOW / NO Risk
        Doctor->>UI: Click "Confirm & Prescribe"
        UI->>DB: Append to Patient Active Medications
    end
```

---

## 3. Medication Safety Engine Logic & Rules Matrix

The Safety Engine executes in deterministic memory for instant response (`<10ms`).

### 3.1 Decision Rules Order
```
Input: (Patient ID, New Prescribed Drug)
├── STEP 1: Fetch Patient Active Medications, Past Medications, Allergies, Conditions.
├── STEP 2: DUPLICATE CHECK
│    └── IF New Drug Name == Any Active Drug Name OR Generic Name
│         └── RETURN Risk: HIGH | Type: DUPLICATE | Reason: "Patient is already taking this active drug."
├── STEP 3: ALLERGY CHECK
│    └── IF New Drug / Drug Group matches Patient Allergies
│         └── RETURN Risk: HIGH | Type: ALLERGY | Reason: "Patient has documented allergy to this compound group."
├── STEP 4: DRUG-DRUG INTERACTION (DDI) CHECK
│    └── IF Pair (New Drug, Active Drug) in Interaction Database
│         └── RETURN Risk: HIGH / MEDIUM | Type: DRUG_DRUG | Reason: <Interaction Mechanism>
├── STEP 5: CONTRAINDICATION CHECK
│    └── IF Pair (New Drug, Condition) in Contraindication Database
│         └── RETURN Risk: HIGH / MEDIUM | Type: CONTRAINDICATION | Reason: <Condition Hazard>
└── STEP 6: DEFAULT
     └── RETURN Risk: NONE | Type: NONE | Reason: "No known conflicts detected."
```

### 3.2 Pre-seeded Drug Interaction Database (Sample Matrix)

| Drug A (Active) | Drug B (New Rx) | Risk Level | Conflict Type | Clinical Reason / Explanation | Suggested Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Warfarin** | **Aspirin** | 🔴 HIGH | DRUG_DRUG | Synergistic anti-platelet and anticoagulant effect dramatically increases major bleeding risk. | Avoid combination or closely monitor INR. |
| **Warfarin** | **Ibuprofen** | 🔴 HIGH | DRUG_DRUG | NSAIDs inhibit platelet aggregation and cause gastric ulceration when combined with Warfarin. | Switch to Acetaminophen (Paracetamol) for analgesia. |
| **Lisinopril** | **Potassium Supplements** | 🔴 HIGH | DRUG_DRUG | ACE inhibitors reduce potassium excretion; combination risks severe hyperkalemia and cardiac arrest. | Monitor serum potassium levels or choose alternative. |
| **Metformin** | **Contrast Dye** | 🟡 MEDIUM | CONTRAINDICATION | Intravenous iodinated contrast can induce acute renal failure, causing Metformin accumulation & lactic acidosis. | Discontinue Metformin 48 hours prior to contrast procedure. |
| **Simvastatin** | **Clarithromycin** | 🔴 HIGH | DRUG_DRUG | CYP3A4 inhibition by Clarithromycin leads to increased statin levels and rhabdomyolysis (muscle breakdown). | Suspend Simvastatin during antibiotic course. |
| **Penicillin Group** | **Amoxicillin** | 🔴 HIGH | ALLERGY | Amoxicillin is an aminopenicillin. Cross-reactivity in Penicillin-allergic patients causes anaphylaxis. | Do not prescribe. Use Macrolide (Azithromycin) instead. |

---

## 4. UI/UX Wireframe Specifications

### 4.1 Patient Dashboard (`/patient`)
```
+-----------------------------------------------------------------------+
|  🛡️ MediShield Patient Portal                     [ Health ID: MS-9042 ] |
+-----------------------------------------------------------------------+
|  John Doe | Age: 58 | Blood Group: O+ | Gender: Male                      |
|  Allergies: ⚠️ Penicillin (Severe)                                    |
+------------------------------------+----------------------------------+
|  Active Medications (2)            |  Your Health QR Code             |
|  ------------------------------    |  +----------------------------+  |
|  • Warfarin 5mg - Daily            |  |  [ QR CODE CANVAS ]        |  |
|    Prescribed by Dr. Smith         |  |  Scannable by any doctor   |  |
|  • Metformin 500mg - Twice Daily   |  +----------------------------+  |
|    Prescribed by Dr. Patel         |  [ 📥 Download QR ] [ 🖨️ Print ] |
|                                    |                                  |
|  [ ➕ Add Medication / Upload OCR ]|                                  |
+------------------------------------+----------------------------------+
```

### 4.2 Doctor Portal & Prescription View (`/doctor/patient/[id]`)
```
+-----------------------------------------------------------------------+
|  👨‍⚕️ MediShield Clinical Workspace                [ Patient: John Doe ]|
+-----------------------------------------------------------------------+
|  PATIENT SUMMARY                                                      |
|  Health ID: MS-9042 | Active Meds: Warfarin 5mg, Metformin 500mg        |
|  Known Allergies: Penicillin                                          |
+-----------------------------------------------------------------------+
|  NEW PRESCRIPTION BUILDER                                             |
|                                                                       |
|  Select Drug: [ Aspirin 81mg                ▼ ]                       |
|  Dosage:      [ 81mg            ]  Frequency: [ Once Daily       ▼ ]  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | 🔴 HIGH RISK SAFETY ALERT DETECTED                              |  |
|  | Conflict: Drug-Drug Interaction (Warfarin + Aspirin)            |  |
|  | Reason: Concomitant use increases severe GI & internal bleeding.|  |
|  | Action: Review before prescribing. Consider alternatives.      |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [ Optional Override Reason: _______________________________ ]        |
|                                                                       |
|  [ ❌ Cancel ]                             [ ⚠️ Override & Prescribe ]|
+-----------------------------------------------------------------------+
```

---

## 5. Mock OCR Engine Specifications

For the 2-hour speedrun, the OCR engine provides instant, fail-safe extraction:
- **Input:** Image File (`prescription.png`, `strip.jpg`).
- **Processing Logic:** 
  1. If client Tesseract.js finishes within 3 seconds, parse text for drug keywords (`Warfarin`, `Aspirin`, `Metformin`, `Amoxicillin`, `Lisinopril`).
  2. Fallback Mock Extractor: If image analysis is selected, match filename/preset to auto-fill sample medicine details.
- **Output:** Prefilled form fields `drugName`, `dosage`, `frequency` ready for patient confirmation.
