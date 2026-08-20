"use client";

import { SafetyAlert } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

interface Props {
  alert: SafetyAlert | null;
  isLoading: boolean;
  onJustificationChange?: (text: string) => void;
  justification?: string;
}

export default function SafetyAlertBanner({
  alert,
  isLoading,
  onJustificationChange,
  justification = "",
}: Props) {
  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 border-l-4 border-gray-300 bg-gray-50 rounded-lg p-4 my-4 animate-pulse">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />
        <span className="text-sm text-gray-500 font-medium">
          Checking for drug interactions…
        </span>
      </div>
    );
  }

  // ── Nothing selected yet ────────────────────────────────────
  if (!alert) return null;

  // ── NONE / SAFE ─────────────────────────────────────────────
  if (alert.riskLevel === "NONE") {
    return (
      <div className="flex items-start gap-3 border-l-4 border-green-500 bg-green-50 rounded-lg p-4 my-4">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            ✅ No Conflicts Detected
          </p>
          <p className="text-sm text-green-700 mt-0.5">
            {alert.clinicalAction ||
              "This medication appears safe based on the patient's current profile."}
          </p>
        </div>
      </div>
    );
  }

  // ── LOW ─────────────────────────────────────────────────────
  if (alert.riskLevel === "LOW") {
    return (
      <div className="flex items-start gap-3 border-l-4 border-blue-400 bg-blue-50 rounded-lg p-4 my-4">
        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">
            ℹ️ Low Risk — Note for Review
          </p>
          {alert.conflictingItem && (
            <p className="text-sm text-blue-700 mt-1">
              <span className="font-medium">Conflict with:</span>{" "}
              {alert.conflictingItem}
            </p>
          )}
          {alert.reason && (
            <p className="text-sm text-blue-700">
              <span className="font-medium">Reason:</span> {alert.reason}
            </p>
          )}
          {alert.clinicalAction && (
            <p className="text-sm text-blue-700">
              <span className="font-medium">Action:</span>{" "}
              {alert.clinicalAction}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── MEDIUM ──────────────────────────────────────────────────
  if (alert.riskLevel === "MEDIUM") {
    return (
      <div className="border-l-4 border-amber-400 bg-amber-50 rounded-lg p-4 my-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">
              ⚠️ MEDIUM RISK — Review Recommended
            </p>
            {alert.conflictingItem && (
              <p className="text-sm text-amber-800 mt-1">
                <span className="font-semibold">Conflict with:</span>{" "}
                {alert.conflictingItem}
              </p>
            )}
            {alert.reason && (
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Reason:</span> {alert.reason}
              </p>
            )}
            {alert.clinicalAction && (
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Action:</span>{" "}
                {alert.clinicalAction}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── HIGH ────────────────────────────────────────────────────
  return (
    <div className="border-l-4 border-red-600 bg-red-50 rounded-lg p-4 my-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-base font-bold text-red-900 tracking-tight">
            🔴 HIGH RISK — Dangerous Interaction Detected
          </p>
          <div className="mt-2 space-y-1">
            {alert.conflictingItem && (
              <p className="text-sm text-red-800">
                <span className="font-semibold">Conflict with:</span>{" "}
                {alert.conflictingItem}
              </p>
            )}
            {alert.reason && (
              <p className="text-sm text-red-800">
                <span className="font-semibold">Reason:</span> {alert.reason}
              </p>
            )}
            {alert.clinicalAction && (
              <p className="text-sm text-red-800">
                <span className="font-semibold">Suggested Action:</span>{" "}
                {alert.clinicalAction}
              </p>
            )}
          </div>

          {/* Override justification */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-red-900 mb-1">
              ⚠️ To override, enter a clinical justification:
            </label>
            <textarea
              className="w-full rounded-lg border border-red-300 bg-white text-sm text-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-red-300 resize-none"
              rows={2}
              placeholder="e.g. Low-dose cardio protection — patient informed and monitored…"
              value={justification}
              onChange={(e) => onJustificationChange?.(e.target.value)}
            />
            <p className="text-xs text-red-600 mt-1">
              Submit button will be enabled only after justification is entered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
