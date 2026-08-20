import Link from "next/link";
import {
  Shield,
  User,
  Stethoscope,
  QrCode,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-teal-50/60 via-slate-50 to-white">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-teal-200/30 via-emerald-200/20 to-indigo-200/30 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Next-Generation Healthcare Safety</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight text-balance max-w-4xl mx-auto">
            Medi<span className="text-teal-600">Shield</span>
            <span className="block mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Medication Safety for Everyone
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto text-balance leading-relaxed">
            Preventing duplicate, conflicting, and allergic prescriptions in real time with instant QR health passes and clinical safety checks.
          </p>

          {/* Dual Portal Action Cards */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Patient Portal Card */}
            <div className="relative group bg-white rounded-2xl p-7 border border-teal-200/80 shadow-lg shadow-teal-900/5 hover:shadow-xl hover:border-teal-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Patient Pass
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  I&apos;m a Patient
                </h2>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Access your personal health timeline, emergency allergy alerts, and your secure QR medical passport.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Instant Health ID &amp; printable QR code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>High-visibility allergy warnings (Penicillin)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Active &amp; past medication timeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Prescription OCR strip scanner demo</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/patient"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/25 transition-colors group/btn"
              >
                <span>Enter Patient Portal</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Doctor Portal Card */}
            <div className="relative group bg-white rounded-2xl p-7 border border-indigo-200/80 shadow-lg shadow-indigo-900/5 hover:shadow-xl hover:border-indigo-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Clinical Suite
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  I&apos;m a Doctor
                </h2>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Scan patient QR codes to inspect current regimens and run real-time drug interaction safety checks.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Instant camera/file QR code scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Real-time drug-drug interaction matrix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Cross-allergy safety validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>One-click safe prescribing</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/doctor/scan"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-colors group/btn"
              >
                <span>Enter Doctor Portal</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick Demo Info Banner */}
          <div className="mt-8 max-w-2xl mx-auto p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
            <span className="font-semibold text-slate-800">Demo Patient Loaded:</span>
            <span>John Doe (MS-9042) • Penicillin Allergy (HIGH) • Warfarin 5mg Active</span>
          </div>
        </div>
      </section>

      {/* Safety Pillars Section */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Zero Allergy Mishaps</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatic cross-referencing flags penicillin and compound allergies before prescriptions can be issued.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Unified Regimen Timeline</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consolidated chronological history of active and completed treatments across multiple practitioners.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Instant QR Portability</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lightweight and privacy-preserving QR code acts as an emergency clinical entry point for any hospital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
