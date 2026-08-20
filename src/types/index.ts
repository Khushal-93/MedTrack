export type AllergySeverity = 'HIGH' | 'MODERATE' | 'LOW';
export type MedicationStatus = 'ACTIVE' | 'DISCONTINUED' | 'COMPLETED';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ConflictType = 'DRUG_DRUG' | 'ALLERGY' | 'DUPLICATE' | 'CONTRAINDICATION' | 'NONE';

export interface AllergyItem {
  id: string;
  allergen: string;
  severity: AllergySeverity;
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
  status: MedicationStatus;
  prescribedBy: string;
  notes?: string | null;
}

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

export interface SafetyCheckRequest {
  patientId: string;
  newDrugName: string;
  dosage?: string;
}

export interface SafetyAlert {
  riskLevel: RiskLevel;
  conflictType: ConflictType;
  conflictingItem: string;
  reason: string;
  clinicalAction: string;
}

export interface PrescriptionRequest {
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  status?: MedicationStatus;
  prescribedBy: string;
  notes?: string | null;
}

export interface PrescribeResponse {
  success: boolean;
  medication: MedicationItem;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

// Aliases for compatibility
export type Allergy = AllergyItem;
export type Condition = ConditionItem;
export type Medication = MedicationItem;
