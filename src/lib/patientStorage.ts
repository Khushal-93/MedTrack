import { MedicationItem, PatientProfile } from "@/types";

export const DEMO_PATIENT: PatientProfile = {
  id: "demo-001",
  healthId: "MS-9042",
  name: "John Doe",
  age: 58,
  gender: "Male",
  bloodGroup: "O+",
  allergies: [
    {
      id: "a1",
      allergen: "Penicillin",
      severity: "HIGH",
    },
  ],
  conditions: [
    {
      id: "c1",
      condition: "Hypertension",
    },
  ],
  medications: [
    {
      id: "m1",
      drugName: "Warfarin",
      genericName: "warfarin sodium",
      dosage: "5mg",
      frequency: "Once Daily",
      startDate: "2026-01-10",
      status: "ACTIVE",
      prescribedBy: "Dr. Sarah Lin",
    },
    {
      id: "m2",
      drugName: "Metformin",
      genericName: "metformin hydrochloride",
      dosage: "500mg",
      frequency: "Twice Daily",
      startDate: "2026-02-02",
      status: "ACTIVE",
      prescribedBy: "Dr. Patel",
    },
    {
      id: "m3",
      drugName: "Amoxicillin",
      genericName: "amoxicillin trihydrate",
      dosage: "500mg",
      frequency: "Three Times Daily",
      startDate: "2026-06-10",
      endDate: "2026-06-17",
      status: "COMPLETED",
      prescribedBy: "Dr. Kumar",
    },
  ],
};

const STORAGE_PREFIX = "medishield_patient_";

export async function fetchPatientProfile(healthId: string = "MS-9042"): Promise<PatientProfile> {
  // 1. Try Live Backend API if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`/api/patient/${healthId}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.healthId) {
        return data;
      }
    }
  } catch {
    // API unavailable or network timeout, fall through to storage fallback
  }

  // 2. Client-side local storage fallback
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${healthId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with DEMO_PATIENT
      localStorage.setItem(`${STORAGE_PREFIX}${healthId}`, JSON.stringify(DEMO_PATIENT));
    } catch {
      // LocalStorage access issues
    }
  }

  return DEMO_PATIENT;
}

export async function savePatientMedication(
  healthId: string = "MS-9042",
  medication: Omit<MedicationItem, "id">
): Promise<{ success: boolean; data?: MedicationItem; error?: string }> {
  // 1. Try Live Backend API if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`/api/patient/${healthId}/prescribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medication),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
  } catch {
    // Fall back to local storage simulation
  }

  // 2. Fallback: Save to LocalStorage
  if (typeof window !== "undefined") {
    try {
      const currentProfile = await fetchPatientProfile(healthId);
      const newMed: MedicationItem = {
        id: `med-${Date.now()}`,
        ...medication,
      };

      const updatedProfile: PatientProfile = {
        ...currentProfile,
        medications: [newMed, ...currentProfile.medications],
      };

      localStorage.setItem(`${STORAGE_PREFIX}${healthId}`, JSON.stringify(updatedProfile));
      return { success: true, data: newMed };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  return {
    success: true,
    data: {
      id: `med-${Date.now()}`,
      ...medication,
    },
  };
}
