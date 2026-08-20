// ============================================================
// MediShield — Mock Data & Safety Engine
// Isolated from UI — replace API calls when backend is ready.
// ============================================================

import type { PatientProfile, SafetyAlert } from "@/types";

// ── Mock patient (demo seed) ─────────────────────────────────
export const MOCK_PATIENT: PatientProfile = {
  id: "c123-uuid",
  healthId: "MS-9042",
  name: "John Doe",
  age: 58,
  gender: "Male",
  bloodGroup: "O+",
  allergies: [{ id: "a1", allergen: "Penicillin", severity: "HIGH" }],
  conditions: [{ id: "c1", condition: "Hypertension" }],
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
      startDate: "2025-06-01",
      endDate: "2025-12-31",
      status: "COMPLETED",
      prescribedBy: "Dr. Raj Patel",
    },
  ],
};

// ── Mock safety rules ────────────────────────────────────────
const SAFE_RESULT: SafetyAlert = {
  riskLevel: "NONE",
  conflictType: "NONE",
  conflictingItem: "",
  reason: "",
  clinicalAction: "No known conflicts detected. Safe to prescribe.",
};

const RULES: Record<string, SafetyAlert> = {
  aspirin: {
    riskLevel: "HIGH",
    conflictType: "DRUG_DRUG",
    conflictingItem: "Warfarin 5mg (Active)",
    reason:
      "Concomitant use of Warfarin and Aspirin dramatically increases the risk of severe GI and internal bleeding due to synergistic anticoagulant and antiplatelet effects.",
    clinicalAction:
      "Avoid combination unless strictly monitored for cardiac indications. Consider Acetaminophen (Paracetamol) for analgesia.",
  },
  ibuprofen: {
    riskLevel: "HIGH",
    conflictType: "DRUG_DRUG",
    conflictingItem: "Warfarin 5mg (Active)",
    reason:
      "NSAIDs like Ibuprofen inhibit platelet aggregation and cause gastric ulceration when combined with Warfarin, significantly increasing GI bleeding risk.",
    clinicalAction:
      "Switch to Acetaminophen (Paracetamol) for pain management. If NSAID is essential, monitor INR closely.",
  },
  amoxicillin: {
    riskLevel: "HIGH",
    conflictType: "ALLERGY",
    conflictingItem: "Penicillin (HIGH allergy on record)",
    reason:
      "Amoxicillin is an aminopenicillin antibiotic. Patients with a documented Penicillin allergy have significant cross-reactivity risk, including anaphylaxis.",
    clinicalAction:
      "Do NOT prescribe. Use a Macrolide antibiotic (e.g. Azithromycin 500mg) or Doxycycline as an alternative.",
  },
  warfarin: {
    riskLevel: "HIGH",
    conflictType: "DUPLICATE",
    conflictingItem: "Warfarin 5mg (Currently Active)",
    reason:
      "Patient is already actively prescribed Warfarin 5mg daily. Prescribing again constitutes a duplicate medication order.",
    clinicalAction:
      "Review current dosage. If dose adjustment is needed, modify the existing prescription rather than adding a new one.",
  },
};

/**
 * Evaluate safety locally (mock fallback).
 * Replace with real API call when backend is available.
 */
export function evaluateSafetyMock(drugName: string): SafetyAlert {
  const key = drugName.trim().toLowerCase();
  return RULES[key] ?? SAFE_RESULT;
}

// ── API wrappers (with automatic mock fallback) ──────────────

export async function fetchPatient(healthId: string): Promise<PatientProfile> {
  try {
    const res = await fetch(`/api/patient/${healthId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API not available");
    return res.json();
  } catch {
    // Backend not ready — use mock data
    if (healthId === MOCK_PATIENT.healthId) return MOCK_PATIENT;
    // Unknown id — still return mock so demo doesn't break
    return { ...MOCK_PATIENT, healthId };
  }
}

export async function checkSafety(
  patientId: string,
  newDrugName: string
): Promise<SafetyAlert> {
  try {
    const res = await fetch("/api/safety-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, newDrugName }),
    });
    if (!res.ok) throw new Error("API not available");
    return res.json();
  } catch {
    return evaluateSafetyMock(newDrugName);
  }
}

export async function submitPrescription(
  healthId: string,
  payload: {
    drugName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
    notes?: string;
    status: "ACTIVE";
    overrideNote?: string;
  }
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`/api/patient/${healthId}/prescribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("API not available");
    return res.json();
  } catch {
    // Mock success when backend is unavailable
    return { success: true };
  }
}
