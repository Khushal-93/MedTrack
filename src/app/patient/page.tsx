"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PatientProfile } from "@/types";
import { fetchPatientProfile, DEMO_PATIENT } from "@/lib/patientStorage";
import QrCodeDisplay from "@/components/QrCodeDisplay";
import Timeline from "@/components/Timeline";
import {
  User,
  AlertTriangle,
  HeartPulse,
  Plus,
  Activity,
  Droplet,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Stethoscope,
} from "lucide-react";

export default function PatientDashboard() {
  const [patient, setPatient] = useState<PatientProfile>(DEMO_PATIENT);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPatientProfile("MS-9042");
      setPatient(data);
    } catch {
      setPatient(DEMO_PATIENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("medishield_patient_MS-9042");
    }
    setPatient(DEMO_PATIENT);
  };

  const activeMedsCount = patient.medications.filter((m) => m.status === "ACTIVE").length;
  const highRiskAllergiesCount = patient.allergies.filter((a) => a.severity === "HIGH").length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Breadcrumb & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <Link href="/" className="hover:text-teal-600 transition-colors">
                MediShield
              </Link>
              <span>/</span>
              <span className="text-teal-700 font-semibold">Patient Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Patient Health Dashboard</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Record
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemo}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
              title="Reset to default demo patient state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            <Link
              href="/patient/add-med"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Medication</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Regimen</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {activeMedsCount} <span className="text-xs font-normal text-slate-500">drugs</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">High Risk Allergies</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {highRiskAllergiesCount}{" "}
                <span className="text-xs font-normal text-red-500">flagged</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Chronic Conditions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {patient.conditions.length}{" "}
                <span className="text-xs font-normal text-slate-500">diagnosed</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Blood Group</p>
              <p className="text-2xl font-bold text-teal-700 mt-1">{patient.bloodGroup}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Content Layout: 2 Columns (Left: Profile, Allergies, Conditions; Right: QR Pass) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Identity, Allergies, Conditions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Identity Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 text-xl font-bold">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      {patient.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {patient.age} years • {patient.gender} • Blood Group {patient.bloodGroup}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    Universal Health ID
                  </span>
                  <span className="text-base sm:text-lg font-extrabold font-mono text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200 mt-0.5">
                    {patient.healthId}
                  </span>
                </div>
              </div>

              {/* Patient Identity Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Age</span>
                  <span className="text-sm font-bold text-slate-800">{patient.age} yrs</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Gender</span>
                  <span className="text-sm font-bold text-slate-800">{patient.gender}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Blood Type</span>
                  <span className="text-sm font-bold text-slate-800">{patient.bloodGroup}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Profile Status</span>
                  <span className="text-sm font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            {/* CRITICAL ALLERGY ALERT SECTION (High-prominence) */}
            <div className="bg-red-50/80 rounded-2xl p-6 sm:p-7 border-2 border-red-200 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-red-950 flex items-center gap-2">
                      <span>Documented Drug Allergies</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full uppercase tracking-wider">
                        High Alert
                      </span>
                    </h3>
                    <p className="text-xs text-red-700">
                      Severe allergic reactions flagged for clinical safety verification
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {patient.allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {allergy.allergen}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Contraindicated with all penicillin class antibiotics
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${
                        allergy.severity === "HIGH"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : allergy.severity === "MODERATE"
                          ? "bg-orange-100 text-orange-700 border-orange-300"
                          : "bg-yellow-100 text-yellow-700 border-yellow-300"
                      }`}
                    >
                      🔴 {allergy.severity} SEVERITY
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronic Conditions Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Diagnosed Medical Conditions</h3>
                  <p className="text-xs text-slate-500">Active health conditions under clinical monitoring</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {patient.conditions.map((c) => (
                  <div
                    key={c.id}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 font-semibold text-xs shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>{c.condition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Health QR Pass Card & Doctor Portal Bridge */}
          <div className="space-y-6">
            <QrCodeDisplay healthId={patient.healthId} />

            {/* Doctor Scan Demo Callout */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Doctor Scan Simulation</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2">
                Simulate Doctor Prescribing
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Open the Doctor Portal to scan John Doe&apos;s Health ID (<strong>MS-9042</strong>) and trigger interaction alerts against Penicillin and Warfarin.
              </p>
              <Link
                href={`/doctor/scan?patient_id=${patient.healthId}`}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Doctor Scan for {patient.healthId}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Full-width Medication Timeline Section */}
        <div className="pt-2">
          <Timeline medications={patient.medications} />
        </div>
      </div>
    </div>
  );
}
