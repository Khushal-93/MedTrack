import type { Metadata } from "next";
import Link from "next/link";
import { Shield, User, Stethoscope } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediShield — Medication Safety for Everyone",
  description: "Preventing duplicate, conflicting, and allergic prescriptions in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand */}
              <Link
                href="/"
                className="flex items-center gap-2.5 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xl tracking-tight text-slate-900">
                      Medi<span className="text-teal-600">Shield</span>
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
                    Medication Safety System
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/patient"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/80 transition-colors border border-transparent hover:border-teal-200"
                >
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Patient Portal</span>
                </Link>

                <Link
                  href="/doctor/scan"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/80 transition-colors border border-transparent hover:border-indigo-200"
                >
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>Doctor Portal</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="font-medium text-slate-700">MediShield</span> — Real-time Clinical Safety & Patient Timeline
            </div>
            <p>Democratizing medication safety across clinics, hospitals, and pharmacies.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
