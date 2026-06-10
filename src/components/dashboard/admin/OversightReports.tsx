"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  Loader2,
  Calendar,
  User,
  Shield,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";
import { getOversightReports, resolveOversightReport } from "@/actions/server/oversight";
import { revokeAuthorityMandate, demoteFromAdmin } from "@/actions/server/master-admin";

interface OversightReport {
  reportId: string;
  timestamp: Date;
  reporterUserId: string;
  reporterName: string;
  targetUserId: string;
  targetName: string;
  targetRole: "ADMIN" | "AUTHORITY";
  reason: string;
  status: "PENDING" | "INVESTIGATING" | "ACTION_TAKEN" | "DISMISSED";
  resolutionNote?: string;
  resolvedAt?: Date;
}

export default function OversightReports() {
  const [reports, setReports] = useState<OversightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOversightReports();
      if (res.success && res.data) {
        setReports(res.data as any as OversightReport[]);
      } else {
        setError(res.error || "Failed to load oversight reports.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, action: "RESOLVE" | "DISMISS") => {
    const statusLabel = action === "RESOLVE" ? "Resolve & Take Action" : "Dismiss Report";
    const inputPrompt = action === "RESOLVE" 
      ? "Enter a resolution summary note (e.g. demotion complete or formal warning issued):" 
      : "Enter a reason for dismissing this complaint:";

    const { value: note } = await Swal.fire({
      title: statusLabel,
      input: "textarea",
      inputLabel: inputPrompt,
      inputPlaceholder: "Type details here...",
      showCancelButton: true,
      confirmButtonColor: "var(--color-primary, #0f172a)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel"
    });

    if (note !== undefined) {
      try {
        const res = await resolveOversightReport(reportId, action, note.trim());
        if (res.success) {
          Swal.fire("Success", res.message || "Report updated successfully.", "success");
          fetchReports();
        } else {
          Swal.fire("Error", res.error || "Failed to update report.", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", err.message || "An error occurred.", "error");
      }
    }
  };

  // Quick Action to immediately demote the reported target colleague
  const handleDemoteTargetColleague = async (report: OversightReport) => {
    const targetName = report.targetName;
    const confirmTitle = report.targetRole === "AUTHORITY" ? "Revoke Authority Mandate?" : "Remove Admin Permissions?";
    const confirmText = report.targetRole === "AUTHORITY"
      ? `This will demote Authority member "${targetName}" back to student status. Proceed?`
      : `This will remove Admin permissions from "${targetName}". Proceed?`;

    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-primary, #0f172a)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Demote Target",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        let res;
        if (report.targetRole === "AUTHORITY") {
          res = await revokeAuthorityMandate(report.targetUserId);
        } else {
          res = await demoteFromAdmin(report.targetUserId);
        }

        if (res.success) {
          // Immediately trigger resolve report input
          Swal.fire({
            title: "Mandate Revoked",
            text: "Target has been demoted. Let's document the resolution note for this oversight report.",
            icon: "success",
            confirmButtonColor: "var(--color-primary, #0f172a)"
          }).then(() => {
            handleUpdateStatus(report.reportId, "RESOLVE");
          });
        } else {
          Swal.fire("Failed", res.error || "Failed to demote user.", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", err.message || "An error occurred.", "error");
      }
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "All") return true;
    return r.status === statusFilter;
  });

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Access Restricted or Load Failed</h3>
        <p className="text-body-md text-on-surface-variant leading-relaxed">{error}</p>
        <button
          onClick={fetchReports}
          className="bg-primary text-on-primary px-5 py-2 rounded text-label-md font-bold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Oversight Reports Queue</h1>
        <p className="text-body-md text-on-surface-variant">
          Review internal complaints and compliance issues filed by standard Admins regarding colleagues.
        </p>
      </div>

      {/* Filter tab controls */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant pb-2 bg-slate-50 p-2 rounded-t-lg">
        {["All", "PENDING", "ACTION_TAKEN", "DISMISSED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-label-sm font-bold rounded-md transition-all cursor-pointer ${
              statusFilter === status
                ? "bg-slate-900 text-white"
                : "text-on-surface-variant hover:bg-slate-200"
            }`}
          >
            {status === "All" ? "All Reports" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Oversight Log Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-on-surface-variant font-bold">Fetching reports queue...</p>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 gap-gutter">
          {filteredReports.map((report) => (
            <div 
              key={report.reportId} 
              className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md animate-in fade-in duration-200"
            >
              {/* Card Header Info */}
              <div className="flex flex-wrap justify-between items-start gap-3 border-b border-outline-variant/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded uppercase font-mono">
                      REF: {report.reportId}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      report.status === "PENDING"
                        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                        : report.status === "ACTION_TAKEN"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {report.status === "ACTION_TAKEN" ? "ACTION TAKEN" : report.status}
                    </span>
                  </div>
                  <div className="text-xs text-outline flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Filed: {new Date(report.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Actors Block */}
                <div className="flex flex-col sm:items-end text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-outline font-medium">Filed By:</span>
                    <span className="font-bold text-primary">{report.reporterName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-outline font-medium">Target User:</span>
                    <span className="font-extrabold text-secondary">{report.targetName}</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono font-extrabold uppercase">
                      {report.targetRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complaint Note Content */}
              <div className="bg-slate-50 p-4 rounded-lg border border-outline-variant/30 text-body-md text-on-surface leading-relaxed">
                <div className="text-xs font-bold text-outline uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  <span>Report Reason & Evidence Description:</span>
                </div>
                <p className="whitespace-pre-wrap">{report.reason}</p>
              </div>

              {/* Resolution Verdict Notes if Resolved */}
              {report.status !== "PENDING" && (
                <div className={`p-4 rounded-lg border text-body-md leading-relaxed ${
                  report.status === "ACTION_TAKEN"
                    ? "bg-emerald-50/30 border-emerald-100 text-emerald-900"
                    : "bg-slate-50 border-slate-100 text-on-surface-variant"
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    {report.status === "ACTION_TAKEN" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-500" />}
                    <span>Resolution Summary Note:</span>
                  </div>
                  <p className="italic font-medium">&quot;{report.resolutionNote || "No verdict summary provided."}&quot;</p>
                  {report.resolvedAt && (
                    <div className="text-[10px] text-outline text-right mt-1.5 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Resolved: {new Date(report.resolvedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {report.status === "PENDING" && (
                <div className="flex flex-wrap items-center gap-2 justify-end pt-2 border-t border-outline-variant/40">
                  <button
                    onClick={() => handleDemoteTargetColleague(report)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-label-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Demote reported colleague</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.reportId, "RESOLVE")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-label-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve Stance</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.reportId, "DISMISS")}
                    className="bg-slate-100 hover:bg-slate-200 text-on-surface-variant border border-outline px-4 py-2 rounded text-label-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Dismiss Report</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant/60 font-body-lg">
          <div className="flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
            <p className="font-bold text-on-surface">Oversight reports queue is clean.</p>
            <p className="text-xs text-outline">No pending colleague disputes or safety flags found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
