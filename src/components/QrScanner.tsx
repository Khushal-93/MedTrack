"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Search } from "lucide-react";

interface Props {
  onScan: (healthId: string) => void;
}

export default function QrScanner({ onScan }: Props) {
  const scannerRef = useRef<import("html5-qrcode").Html5QrcodeScanner | null>(
    null
  );
  const [cameraError, setCameraError] = useState(false);
  const [manualId, setManualId] = useState("");
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Dynamically import html5-qrcode to avoid SSR issues
    import("html5-qrcode")
      .then(({ Html5QrcodeScanner }) => {
        if (!mounted) return;

        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: false,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText: string) => {
            // Extract patient id from full URL if needed
            let healthId = decodedText;
            try {
              const url = new URL(decodedText);
              const param = url.searchParams.get("patient_id");
              if (param) healthId = param;
            } catch {
              // plain text — use as-is
            }
            scanner.clear().catch(() => {});
            onScan(healthId.trim());
          },
          () => {
            // Scan failure — camera may be unavailable
            if (mounted) setCameraError(true);
          }
        );

        scannerRef.current = scanner;
        setScannerReady(true);
      })
      .catch(() => {
        if (mounted) setCameraError(true);
      });

    return () => {
      mounted = false;
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  const handleManualLookup = () => {
    const trimmed = manualId.trim();
    if (trimmed) onScan(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleManualLookup();
  };

  return (
    <div className="space-y-6">
      {/* ── Camera ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-teal-50">
          <Camera className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-semibold text-teal-700">
            Camera QR Scanner
          </span>
        </div>

        {cameraError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
            <CameraOff className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500 font-medium">
              Camera access denied or unavailable.
            </p>
            <p className="text-xs text-gray-400">
              Please use the manual Health ID input below.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div id="qr-reader" className="w-full" />
            {!scannerReady && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Initialising camera…
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Manual fallback ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            — OR enter Health ID manually —
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. MS-9042"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={handleManualLookup}
            disabled={!manualId.trim()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
            Look Up Patient
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Ask the patient to open their MediShield app and share their Health
          ID.
        </p>
      </div>
    </div>
  );
}
