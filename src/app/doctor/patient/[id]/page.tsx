"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Clock,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";
import SafetyAlertBanner from "@/components/SafetyAlertBanner";
import type { MedicationItem, PatientProfile, SafetyAlert } from "@/types";
import {
  checkSafety,
  fetchPatient,
  submitPrescription,
} from "@/lib/mock";

// ── Constants ────────────────────────────────────────────────

const DRUG_OPTIONS = [
  "Aspirin",
  "Amoxicillin",
  "Ibuprofen",
  "Metformin",
  "Lisinopril",
  "Simvastatin",
  "Clarithromycin",
  "Warfarin",
  "Clopidogrel",
  "Omeprazole",
  "Paracetamol",
  "Atenolol",
];

const FREQUENCY_OPTIONS = [
  "Once Daily",
  "Twice Daily",
  "Three Times Daily",
  "As Needed",
  "Weekly",
];

// ── Sub-components ───────────────────────────────────────────

function StatusBadge({ status }: { status: MedicationItem["status"] }) {
  const map: Record<MedicationItem["status"], string> = {
    ACTIVE: "bg-green-100 text-green-800",
    DISCONTINUED: "bg-red-100 text-red-800",
    COMPLETED: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status]}`}
    >
      {status}
    </span>
  );
}

function MedicationCard({ med }: { med: MedicationItem }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
      <div className="flex items-start gap-3">
        <Pill className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-gray-800 text-sm">
            {med.drugName}{" "}
            <span className="font-normal text-gray-500">{med.dosage}</span>
          </p>
          <p className="text-xs text-gray-500">{med.genericName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {med.frequency} · Prescribed by {med.prescribedBy}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            From {med.startDate}
            {med.endDate ? ` → ${med.endDate}` : ""}
          </p>
        </div>
      </div>
      <StatusBadge status={med.status} />
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl shadow-lg px-5 py-3 text-sm font-medium transition-all
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertTriangle className="w-5 h-5" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

interface PrescriptionForm {
  drugName: string;
  dosage: string;
  frequency: string;
  endDate: string;
  prescribedBy: string;
  notes: string;
}

const EMPTY_FORM: PrescriptionForm = {
  drugName: "",
  dosage: "",
  frequency: "Once Daily",
  endDate: "",
  prescribedBy: "",
  notes: "",
};

export default function DoctorPatientPage() {
  const params = useParams();
  const router = useRouter();
  const healthId = typeof params.id === "string" ? params.id : String(params.id);

  // ── Patient data ─────────────────────────────────────────
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Prescription state ────────────────────────────────────
  const [form, setForm] = useState<PrescriptionForm>(EMPTY_FORM);
  const [safetyAlert, setSafetyAlert] = useState<SafetyAlert | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [justification, setJustification] = useState("");
  const [medAck, setMedAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Fetch patient ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetchPatient(healthId)
      .then((p) => {
        setPatient(p);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load patient record.");
        setLoading(false);
      });
  }, [healthId]);

  // ── Debounced safety check ────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSafetyCheck = useCallback(
    (drugName: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!drugName) {
        setSafetyAlert(null);
        return;
      }
      setSafetyLoading(true);
      debounceRef.current = setTimeout(async () => {
        const result = await checkSafety(healthId, drugName);
        setSafetyAlert(result);
        setSafetyLoading(false);
      }, 300);
    },
    [healthId]
  );

  const handleDrugChange = (drug: string) => {
    setForm((f) => ({ ...f, drugName: drug }));
    setSafetyAlert(null);
    setJustification("");
    setMedAck(false);
    triggerSafetyCheck(drug);
  };

  // ── Submit ────────────────────────────────────────────────
  const canSubmit = (() => {
    if (!form.drugName || !form.dosage || !form.prescribedBy) return false;
    if (!safetyAlert || safetyAlert.riskLevel === "NONE") return true;
    if (safetyAlert.riskLevel === "LOW") return true;
    if (safetyAlert.riskLevel === "MEDIUM") return medAck;
    if (safetyAlert.riskLevel === "HIGH") return justification.trim().length > 5;
    return false;
  })();

  const handleSubmit = async () => {
    if (!patient || !canSubmit) return;
    setSubmitting(true);
    try {
      await submitPrescription(healthId, {
        drugName: form.drugName,
        genericName: form.drugName.toLowerCase(),
        dosage: form.dosage,
        frequency: form.frequency,
        startDate: new Date().toISOString().split("T")[0],
        endDate: form.endDate || undefined,
        prescribedBy: form.prescribedBy,
        notes: form.notes || undefined,
        status: "ACTIVE",
        overrideNote: justification || undefined,
      });

      // Optimistically update local state
      const newMed: MedicationItem = {
        id: `local-${Date.now()}`,
        drugName: form.drugName,
        genericName: form.drugName.toLowerCase(),
        dosage: form.dosage,
        frequency: form.frequency,
        startDate: new Date().toISOString().split("T")[0],
        endDate: form.endDate || null,
        status: "ACTIVE",
        prescribedBy: form.prescribedBy,
      };

      setPatient((prev) =>
        prev
          ? { ...prev, medications: [newMed, ...prev.medications] }
          : prev
      );

      setToast({ message: "✅ Prescription added to patient timeline!", type: "success" });
      setForm(EMPTY_FORM);
      setSafetyAlert(null);
      setJustification("");
      setMedAck(false);
    } catch {
      setToast({ message: "Failed to submit prescription. Try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit button label ───────────────────────────────────
  const submitLabel = (() => {
    if (!safetyAlert || safetyAlert.riskLevel === "NONE" || safetyAlert.riskLevel === "LOW")
      return "✅ Confirm & Prescribe";
    if (safetyAlert.riskLevel === "MEDIUM") return "⚠️ Prescribe with Caution";
    return "🔴 Override & Prescribe";
  })();

  const submitClass = (() => {
    const base = "w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed";
    if (!safetyAlert || safetyAlert.riskLevel === "NONE" || safetyAlert.riskLevel === "LOW")
      return `${base} bg-teal-600 hover:bg-teal-700 text-white`;
    if (safetyAlert.riskLevel === "MEDIUM")
      return `${base} bg-amber-500 hover:bg-amber-600 text-white`;
    return `${base} border-2 border-red-500 text-red-600 hover:bg-red-50`;
  })();

  // ── Loading / error states ────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading patient record…</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">Patient Not Found</p>
          <p className="text-gray-500 text-sm mt-1">
            {error || "Could not load record for Health ID: " + healthId}
          </p>
          <button
            onClick={() => router.push("/doctor/scan")}
            className="mt-4 text-sm text-teal-600 hover:underline"
          >
            ← Back to Scanner
          </button>
        </div>
      </div>
    );
  }

  const activeMeds = patient.medications.filter((m) => m.status === "ACTIVE");
  const pastMeds = patient.medications.filter((m) => m.status !== "ACTIVE");

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="text-lg font-bold text-teal-700">MediShield</span>
          <span className="hidden sm:block text-gray-300 mx-2">|</span>
          <span className="hidden sm:block text-sm text-gray-500">
            Clinical Workspace
          </span>
        </div>
        <button
          onClick={() => router.push("/doctor/scan")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Scan New Patient
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* ── Patient Header ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-teal-600" />
            </div>

            {/* Identity */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.name}
                </h1>
                <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                  {patient.healthId}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {patient.age} yrs · {patient.gender} · Blood Group:{" "}
                <span className="font-semibold text-gray-700">
                  {patient.bloodGroup}
                </span>
              </p>

              {/* Active meds quick badges */}
              {activeMeds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeMeds.map((m) => (
                    <span
                      key={m.id}
                      className="text-xs bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full"
                    >
                      💊 {m.drugName} {m.dosage}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Safety summary column */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              {/* Allergies */}
              {patient.allergies.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((a) => (
                      <span
                        key={a.id}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          a.severity === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : a.severity === "MODERATE"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        ⚠️ {a.allergen} · {a.severity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {patient.conditions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Conditions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {patient.conditions.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {c.condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column layout ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: Medication History ──────────────────── */}
          <div className="space-y-4">
            {/* Active */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-green-500" />
                  Active Medications
                </h2>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  {activeMeds.length} active
                </span>
              </div>
              {activeMeds.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No active medications on record.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeMeds.map((m) => (
                    <MedicationCard key={m.id} med={m} />
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {pastMeds.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Past Medications
                </h2>
                <div className="space-y-2">
                  {pastMeds.map((m) => (
                    <MedicationCard key={m.id} med={m} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Prescription Builder ───────────────── */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              New Prescription
            </h2>

            <div className="space-y-4">
              {/* Drug Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Drug Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.drugName}
                    onChange={(e) => handleDrugChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                  >
                    <option value="">Select a drug…</option>
                    {DRUG_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Safety Banner */}
              <SafetyAlertBanner
                alert={safetyAlert}
                isLoading={safetyLoading}
                justification={justification}
                onJustificationChange={setJustification}
              />

              {/* Dosage + Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 81mg"
                    value={form.dosage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dosage: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.frequency}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, frequency: e.target.value }))
                      }
                      className="w-full appearance-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* End date + Prescribed By */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Prescribed By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={form.prescribedBy}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, prescribedBy: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional — dosage rationale, patient instructions…"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* MEDIUM acknowledgement */}
              {safetyAlert?.riskLevel === "MEDIUM" && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medAck}
                    onChange={(e) => setMedAck(e.target.checked)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className="text-sm text-amber-800 font-medium">
                    I have reviewed the medium risk interaction and accept
                    clinical responsibility.
                  </span>
                </label>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={submitClass}
              >
                {submitting ? "Submitting…" : submitLabel}
              </button>

              {!form.drugName && (
                <p className="text-xs text-center text-gray-400">
                  Select a drug to begin safety evaluation.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
