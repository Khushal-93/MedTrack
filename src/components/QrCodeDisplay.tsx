"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, QrCode, Copy, Check, ShieldAlert } from "lucide-react";

interface QrCodeDisplayProps {
  healthId: string;
}

export default function QrCodeDisplay({ healthId }: QrCodeDisplayProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://medishield.app/doctor/scan?patient_id=${healthId}`;

  const handleDownload = () => {
    if (!qrContainerRef.current) return;
    const svgElement = qrContainerRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Scale up for high-resolution download
    const scale = 4;
    canvas.width = 240 * scale;
    canvas.height = 240 * scale;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `MediShield-Pass-${healthId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">Patient Health Pass</h3>
            <p className="text-[11px] text-slate-500">Emergency &amp; Clinical Scan</p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          {healthId}
        </span>
      </div>

      {/* QR Code Canvas */}
      <div
        ref={qrContainerRef}
        className="p-4 bg-white rounded-2xl border-2 border-dashed border-teal-200 shadow-inner flex items-center justify-center group relative hover:border-teal-400 transition-colors"
      >
        <QRCodeSVG
          value={qrUrl}
          size={180}
          level="H"
          includeMargin={false}
          className="w-40 h-40 sm:w-44 sm:h-44"
        />
      </div>

      {/* Health ID Badge */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Health ID:</span>
          <span className="text-sm font-extrabold font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
            {healthId}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-[220px]">
          Target: <span className="font-mono text-[10px] truncate block">{qrUrl}</span>
        </p>
      </div>

      {/* Safety Notice */}
      <div className="mt-4 w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-left flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-snug">
          Providers scan this pass to verify clinical history and run real-time drug interaction checks.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 w-full grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          type="button"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors"
          title="Download PNG QR code"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save PNG</span>
        </button>

        <button
          onClick={handlePrint}
          type="button"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          title="Print Health QR"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>
      </div>

      <button
        onClick={handleCopyLink}
        type="button"
        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-600 font-medium">Scan Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy Scan URL</span>
          </>
        )}
      </button>
    </div>
  );
}
