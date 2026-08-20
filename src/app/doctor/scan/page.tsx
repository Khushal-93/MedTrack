"use client";

import { useRouter } from "next/navigation";
import QrScanner from "@/components/QrScanner";
import { QrCode, Stethoscope } from "lucide-react";

export default function DoctorScanPage() {
  const router = useRouter();

  const handleScan = (healthId: string) => {
    router.push(`/doctor/patient/${healthId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="text-lg font-bold text-teal-700">MediShield</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="/patient"
            className="text-gray-500 hover:text-teal-600 font-medium transition-colors"
          >
            Patient Portal
          </a>
          <span className="text-teal-700 font-semibold border-b-2 border-teal-600 pb-0.5">
            Doctor Portal
          </span>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 mb-4">
            <Stethoscope className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Doctor Scan Portal
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            Scan the patient&apos;s MediShield QR code or enter their Health
            ID.
          </p>
        </div>

        {/* Scanner card */}
        <QrScanner onScan={handleScan} />

        {/* Info note */}
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-teal-50 border border-teal-100 p-4">
          <QrCode className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal-700">
            Patient must present their QR code from the MediShield Patient
            Portal. The QR code contains their unique Health ID and securely
            points to their medication record.
          </p>
        </div>
      </main>
    </div>
  );
}
