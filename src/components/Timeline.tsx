"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { MedicationItem } from "@/types";
import {
  Pill,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock3,
  Plus,
  Filter,
} from "lucide-react";

interface TimelineProps {
  medications: MedicationItem[];
}

export default function Timeline({ medications = [] }: TimelineProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DISCONTINUED" | "COMPLETED">("ALL");

  // Sort: ACTIVE -> DISCONTINUED -> COMPLETED, then by startDate descending
  const sortedMedications = useMemo(() => {
    const statusOrder: Record<string, number> = {
      ACTIVE: 1,
      DISCONTINUED: 2,
      COMPLETED: 3,
    };

    const list = [...medications];
    list.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    if (filter === "ALL") return list;
    return list.filter((m) => m.status === filter);
  }, [medications, filter]);

  const activeCount = medications.filter((m) => m.status === "ACTIVE").length;
  const discontinuedCount = medications.filter((m) => m.status === "DISCONTINUED").length;
  const completedCount = medications.filter((m) => m.status === "COMPLETED").length;

  const getStatusBadge = (status: MedicationItem["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case "DISCONTINUED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Discontinued</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock3 className="w-3 h-3 text-slate-500" />
            <span>Completed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBorder = (status: MedicationItem["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "border-l-4 border-l-emerald-500 hover:border-emerald-300";
      case "DISCONTINUED":
        return "border-l-4 border-l-rose-500 hover:border-rose-300";
      case "COMPLETED":
        return "border-l-4 border-l-slate-400 hover:border-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
      {/* Timeline Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Medication Timeline</h2>
            <p className="text-xs text-slate-500">
              Chronological record of active and historic prescriptions
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("ALL")}
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({medications.length})
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "COMPLETED"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Completed ({completedCount})
          </button>
          {discontinuedCount > 0 && (
            <button
              onClick={() => setFilter("DISCONTINUED")}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === "DISCONTINUED"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Discontinued ({discontinuedCount})
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {sortedMedications.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
            <Pill className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">No medications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            {filter !== "ALL"
              ? `There are no medications matching the "${filter.toLowerCase()}" filter.`
              : "No current or past medications have been logged for this patient profile."}
          </p>
          <Link
            href="/patient/add-med"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Medication</span>
          </Link>
        </div>
      ) : (
        /* Timeline Items */
        <div className="mt-6 space-y-4 relative">
          {sortedMedications.map((med, idx) => (
            <div
              key={med.id || `med-${idx}`}
              className={`relative bg-slate-50/70 hover:bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${getStatusBorder(
                med.status
              )}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Medicine Title & Generic */}
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h4 className="text-base font-bold text-slate-900 tracking-tight">
                      {med.drugName}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-teal-100 text-teal-800 border border-teal-200">
                      {med.dosage}
                    </span>
                    {getStatusBadge(med.status)}
                  </div>

                  {med.genericName && (
                    <p className="text-xs text-slate-500 italic mb-3">
                      Generic: <span className="text-slate-700 font-medium">{med.genericName}</span>
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        Frequency: <strong className="text-slate-800 font-semibold">{med.frequency}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        Prescriber: <strong className="text-slate-800 font-semibold">{med.prescribedBy}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        Started: <strong className="text-slate-800 font-semibold">{med.startDate}</strong>
                        {med.endDate ? ` → ${med.endDate}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
