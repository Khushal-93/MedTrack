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
