// ============================================================
// MediShield — Shared TypeScript Interfaces
// Created by Person 1 as temporary types.
// Person 2 / Person 3 should replace/extend this file.
// ============================================================

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
  severity: "HIGH" | "MODERATE" | "LOW";
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
  status: "ACTIVE" | "DISCONTINUED" | "COMPLETED";
  prescribedBy: string;
}

export interface SafetyCheckRequest {
  patientId: string;
  newDrugName: string;
  dosage?: string;
}

export interface SafetyAlert {
  riskLevel: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  conflictType:
    | "DRUG_DRUG"
    | "ALLERGY"
    | "DUPLICATE"
    | "CONTRAINDICATION"
    | "NONE";
  conflictingItem: string;
  reason: string;
  clinicalAction: string;
}
