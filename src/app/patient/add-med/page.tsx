"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePatientMedication } from "@/lib/patientStorage";
import {
  Pill,
  Upload,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ScanLine,
  Save,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  FileCheck2,
} from "lucide-react";

const FREQUENCY_OPTIONS = [
  "Once Daily",
  "Twice Daily",
  "Three Times Daily",
  "As Needed",
] as const;

export default function AddMedicationPage() {
  const router = useRouter();

  // Form State
  const [drugName, setDrugName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<string>("Once Daily");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [prescribedBy, setPrescribedBy] = useState("Dr. Sarah Lin");
  const [notes, setNotes] = useState("");

  // UI / OCR States
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [scannedFileName, setScannedFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Trigger Mock OCR Scan
  const simulateOcrScan = (fileName: string = "prescription-sample.png") => {
    setIsScanning(true);
    setScannedSuccess(false);
    setScannedFileName(fileName);
    setErrorMsg("");

    setTimeout(() => {
      // Mock Extracted Prescription Data
      setDrugName("Amoxicillin");
      setGenericName("amoxicillin trihydrate");
      setDosage("500mg");
      setFrequency("Three Times Daily");
      setPrescribedBy("Dr. Kumar");
      setNotes("Extracted via Mock OCR: 500mg capsule, 1 capsule TID for 7 days.");

      setIsScanning(false);
      setScannedSuccess(true);
    }, 1300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      simulateOcrScan(files[0].name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateOcrScan(e.dataTransfer.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!drugName.trim() || !dosage.trim() || !startDate.trim() || !prescribedBy.trim()) {
      setErrorMsg("Please fill in all required fields (Drug Name, Dosage, Start Date, Prescribed By).");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await savePatientMedication("MS-9042", {
        drugName: drugName.trim(),
        genericName: genericName.trim() || drugName.trim().toLowerCase(),
        dosage: dosage.trim(),
        frequency: frequency || "Once Daily",
        startDate: startDate.trim(),
        status: "ACTIVE",
        prescribedBy: prescribedBy.trim(),
      });

      if (result.success) {
        setSuccessToast(true);
        setTimeout(() => {
          router.push("/patient");
        }, 800);
      } else {
        setErrorMsg(result.error || "Failed to add medication. Please try again.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please check values and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Back Navigation */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/patient"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Patient:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              John Doe (MS-9042)
            </span>
          </div>
        </div>

        {/* Page Title Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Add Medication to Timeline
              </h1>
              <p className="text-xs text-slate-500">
                Log a new prescription via smart prescription scan or manual entry
              </p>
            </div>
          </div>
        </div>

        {/* Success Toast / Notification */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-md animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Medication successfully added! Redirecting to patient timeline...</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-sm font-semibold flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main 2-Section Grid (OCR Scanner + Manual Entry Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SECTION B: Mock Prescription Scanner (Left Column on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">Mock Prescription Scanner</h2>
                    <p className="text-[11px] text-slate-500">Fast Auto-fill</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Demo OCR
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive
                    ? "border-teal-500 bg-teal-50/50 scale-[0.99]"
                    : "border-slate-300 hover:border-teal-400 bg-slate-50/60"
                }`}
              >
                {isScanning ? (
                  <div className="py-8 flex flex-col items-center justify-center relative">
                    <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 relative overflow-hidden">
                      <ScanLine className="w-8 h-8 animate-pulse" />
                      <div className="absolute left-0 right-0 h-1 bg-teal-500 shadow-sm animate-scan-beam" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      🔍 Scanning prescription...
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Extracting drug name, dosage &amp; regimen
                    </p>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      📄 Upload Prescription / Medicine Strip
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mb-4">
                      Upload a prescription image or medicine strip to automatically extract details.
                    </p>

                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Select Image / PDF</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Demo Quick Samples for Instant Hackathon Demonstration */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Instant Demo Triggers:
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => simulateOcrScan("sample-amoxicillin-500mg.jpg")}
                    disabled={isScanning}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-slate-800">Sample: Amoxicillin 500mg Strip</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-2 py-0.5 rounded">
                      Simulate Scan →
                    </span>
                  </button>
                </div>
              </div>

              {/* OCR Extracted Confirmation Notice */}
              {scannedSuccess && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✅ Prescription scanned!</span>
                  </div>
                  <p className="text-emerald-700 leading-snug">
                    Amoxicillin 500mg extracted from <code className="font-mono bg-white px-1 py-0.5 rounded text-[10px]">{scannedFileName}</code>. Please review details on the right and confirm.
                  </p>
                </div>
              )}

              {/* Disclaimer Notice */}
              <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed">
                Demo OCR: Simulates optical character recognition for hackathon demonstration. Always verify dosage with your pharmacist.
              </p>
            </div>
          </div>

          {/* SECTION A: Manual Entry & Verification Form (Right Column on large screens) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">Medication Details</h2>
                    <p className="text-xs text-slate-500">Enter or verify prescription values</p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  * Required fields
                </span>
              </div>

              {/* Drug Name & Generic Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Drug Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin, Lipitor"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Generic Name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. amoxicillin trihydrate"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Dosage & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg, 10mg, 1 tab"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & Prescribed By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Prescribed By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Lin, Dr. Kumar, Self"
                    value={prescribedBy}
                    onChange={(e) => setPrescribedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Notes / Special Instructions <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with food. Discontinue if rash appears."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 bg-white placeholder-slate-400 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  href="/patient"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold text-center transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "Adding to Timeline..." : "💾 Add to Timeline"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
