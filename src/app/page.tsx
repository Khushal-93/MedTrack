import Link from "next/link";
import { Stethoscope, User, ShieldCheck, Sparkles } from "lucide-react";
import { ShaderBackground } from "@/components/ui/hero";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Dynamic Shader Background layer */}
      <ShaderBackground className="absolute inset-0 opacity-40 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-md bg-gray-950/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldCheck className="w-5 h-5 text-gray-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Medi<span className="text-teal-400">Shield</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/doctor/scan"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Demo Health ID: MS-9042
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 backdrop-blur-md mb-6 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-teal-400" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Digital Medication-Safety <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            Identity for Every Patient
          </span>
        </h1>

        <p className="text-lg text-gray-300 mt-4 max-w-2xl leading-relaxed">
          Preventing duplicate, conflicting, and allergic prescriptions in real time with an intelligent medication timeline and instant doctor QR safety checks.
        </p>

        {/* Portal cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
          {/* Patient Portal */}
          <Link href="/patient" className="group">
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/10 p-8 flex flex-col items-center gap-4 hover:border-teal-500/50 hover:bg-gray-900/90 hover:shadow-2xl hover:shadow-teal-500/10 transition-all cursor-pointer text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500/20 flex items-center justify-center transition-colors">
                <User className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  I&apos;m a Patient
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Access your digital health profile, view your active medication timeline, and generate your scannable QR identity.
                </p>
              </div>
              <span className="mt-2 text-sm font-semibold text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
                Open Patient Portal →
              </span>
            </div>
          </Link>

          {/* Doctor Portal */}
          <Link href="/doctor/scan" className="group">
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/10 p-8 flex flex-col items-center gap-4 hover:border-cyan-500/50 hover:bg-gray-900/90 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all cursor-pointer text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <Stethoscope className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  I&apos;m a Doctor
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Scan patient QR codes to inspect medical history and evaluate real-time drug interaction & allergy warnings.
                </p>
              </div>
              <span className="mt-2 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                Open Doctor Workspace →
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-xs text-gray-500 flex items-center gap-2">
          <span>Powered by WebGL Shader Engine</span>
          <span>•</span>
          <span>MediShield Safety Core v1.0</span>
        </div>
      </main>
    </div>
  );
}
