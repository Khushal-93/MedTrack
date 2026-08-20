import Link from "next/link";
import { Stethoscope, User, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="text-lg font-bold text-teal-700">MediShield</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-100 mb-6">
          <ShieldCheck className="w-10 h-10 text-teal-600" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Medi<span className="text-teal-600">Shield</span>
        </h1>
        <p className="text-lg text-gray-500 mt-3 max-w-xl">
          Medication Safety for Everyone — preventing duplicate, conflicting,
          and allergic prescriptions in real time.
        </p>

        {/* Portal cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
          {/* Patient */}
          <Link href="/patient" className="group">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center gap-4 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center transition-colors">
                <User className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  I&apos;m a Patient
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  View your medication timeline and share your QR health ID with
                  doctors.
                </p>
              </div>
              <span className="text-sm font-semibold text-teal-600 group-hover:underline">
                Open Patient Portal →
              </span>
            </div>
          </Link>

          {/* Doctor */}
          <Link href="/doctor/scan" className="group">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center gap-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                <Stethoscope className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  I&apos;m a Doctor
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Scan a patient&apos;s QR code and prescribe medications with
                  real-time safety checks.
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-600 group-hover:underline">
                Open Doctor Portal →
              </span>
            </div>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-10">
          Demo patient Health ID:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
            MS-9042
          </code>
        </p>
      </main>
    </div>
  );
}
