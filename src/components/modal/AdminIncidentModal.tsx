import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  AlertCircle,
  X,
  ShieldAlert,

} from "lucide-react";
import Swal from "sweetalert2";
import { getReporterBanStats, banReporter, rejectAdminIncident } from "@/actions/server/admin";
import StatusBadge from "@/components/badge/StatusConfigBadge";
import PriorityBadge from "@/components/badge/PriorityConfigBadge";
import ProofLightboxModal from "@/components/modal/ProofLightboxModal";
import EvidenceAttachmentList from "@/components/evidence/EvidenceAttachmentList";
import { AdminIncidentModalProps, Incident } from "@/types/DashboardTypes";


export default function AdminIncidentModal({
  isOpen,
  incident,
  onClose,
  onUpdateIncident,
}: AdminIncidentModalProps) {
  const [banHistoryCount, setBanHistoryCount] = useState<number>(0);
  const [banReason, setBanReason] = useState<string>("");
  const [banDuration, setBanDuration] = useState<"3" | "6" | "permanent">("3");
  const [processingModeration, setProcessingModeration] = useState<boolean>(false);
  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);

  // Retrieve suspension count when selected incident details change
  useEffect(() => {
    if (incident) {
      setProcessingModeration(true);
      getReporterBanStats(incident.id).then((res) => {
        if (res.success && res.banHistoryCount !== undefined) {
          setBanHistoryCount(res.banHistoryCount);
        }
        setProcessingModeration(false);
      });
      setBanReason("");
      setBanDuration("3");
    }
  }, [incident]);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !incident) return null;

  const handleBanStudentClick = async () => {
    if (!incident) return;
    if (!banReason.trim()) {
      Swal.fire({
        title: "Reason Required",
        text: "Please provide a reason/explanation for suspending the reporter.",
        icon: "warning",
        confirmButtonColor: "var(--color-primary, #0051d5)"
      });
      return;
    }

    const durationLabel = banDuration === "permanent" ? "permanently" : `for ${banDuration} months`;

    Swal.fire({
      title: "Suspend Student?",
      text: `Are you sure you want to suspend this reporter ${durationLabel}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Suspend",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-error, #ba1a1a)",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessingModeration(true);
        try {
          const res = await banReporter(incident.id, banDuration, banReason);
          if (res.success) {
            Swal.fire({
              title: "Student Suspended",
              text: res.message || "Reporter suspended successfully.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
            getReporterBanStats(incident.id).then((res) => {
              if (res.success && res.banHistoryCount !== undefined) {
                setBanHistoryCount(res.banHistoryCount);
              }
            });
            setBanReason("");
          } else {
            Swal.fire({
              title: "Error",
              text: res.error || "Failed to suspend student.",
              icon: "error"
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Error",
            text: "An unexpected error occurred.",
            icon: "error"
          });
        } finally {
          setProcessingModeration(false);
        }
      }
    });
  };

  const handleRejectReport = (incidentId: string) => {
    Swal.fire({
      title: "Reject Report",
      input: "textarea",
      inputLabel: "Rejection Reason / Details",
      inputPlaceholder: "Explain why this case is rejected...",
      inputAttributes: {
        "aria-label": "Explain why this case is rejected"
      },
      showCancelButton: true,
      confirmButtonText: "Reject Report",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-error, #ba1a1a)",
      inputValidator: (value) => {
        if (!value) {
          return "Please provide a reason for rejection!";
        }
        return null;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const reason = result.value;
        setProcessingModeration(true);
        try {
          const res = await rejectAdminIncident(incidentId, reason);
          if (res.success) {
            const updatedIncident: Incident = {
              ...incident,
              status: "REJECTED",
              rejectionReason: reason
            };
            onUpdateIncident(updatedIncident);
            Swal.fire({
              title: "Report Rejected",
              text: `Case ${incidentId} has been rejected.`,
              icon: "error",
              timer: 2000,
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              title: "Error",
              text: res.error || "Failed to reject report.",
              icon: "error"
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Error",
            text: "An unexpected error occurred.",
            icon: "error"
          });
        } finally {
          setProcessingModeration(false);
        }
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="absolute inset-0" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

          {/* Modal Header */}
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Reference ID</span>
              <span className="text-headline-md font-extrabold text-primary">{incident.id}</span>
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} variant="filled" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Reporter ID</span>
              <span className="text-headline-md font-extrabold text-primary">{incident.userId}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Left Side: Metadata and Evidence Details */}
              <div className="md:col-span-1 space-y-6">
                {/* Location Info Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-on-surface-variant" />
                    <span>Incident Location</span>
                  </div>
                  <p className="text-body-lg font-bold text-on-surface">{incident.location}</p>
                </div>

                {/* Timestamp Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-on-surface-variant" />
                    <span>Report Timestamp</span>
                  </div>
                  <p className="text-body-md font-semibold text-on-surface">{incident.timestamp}</p>
                </div>

                {/* Evidence Card */}
                <EvidenceAttachmentList
                  proofUrls={incident?.proofUrls || []}
                  onSelectProof={setActiveProofUrl}
                />

                {/* Rejection Reason Card */}
                {incident.status === "REJECTED" && incident.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-error/20 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-error text-label-sm font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      <span>Rejection Reason</span>
                    </div>
                    <p className="text-body-md text-on-error-container italic leading-relaxed">
                      &quot;{incident.rejectionReason}&quot;
                    </p>
                  </div>
                )}

                {/* Reporter Suspension Control Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-error" />
                    <span>Reporter Suspension Control</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] text-outline font-semibold uppercase tracking-wider">Previous Suspensions</span>
                      <p className="text-body-md font-extrabold text-primary">{banHistoryCount} Times Banned</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-outline font-semibold uppercase tracking-wider block">Suspension Duration</label>
                      <select
                        value={banDuration}
                        onChange={(e) => setBanDuration(e.target.value as any)}
                        className="w-full p-2 bg-white border border-outline-variant rounded text-label-sm font-bold focus:outline-none"
                        disabled={processingModeration}
                      >
                        <option value="3">3 Months Suspension</option>
                        <option value="6">6 Months Suspension</option>
                        {banHistoryCount >= 2 && (
                          <option value="permanent">Permanent Suspension</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-outline font-semibold uppercase tracking-wider block">Suspension Reason</label>
                      <input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Why is this user suspended?"
                        className="w-full p-2 bg-white border border-outline-variant rounded text-body-md focus:outline-none placeholder-on-surface-variant/40"
                        disabled={processingModeration}
                      />
                    </div>

                    <button
                      onClick={handleBanStudentClick}
                      className="w-full py-2 bg-error text-on-error font-bold text-label-md rounded hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm"
                      disabled={processingModeration || !banReason.trim()}
                    >
                      Apply Suspension
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Narrative and Surveillance Verification */}
              <div className="md:col-span-2 space-y-6">
                {/* Category Banner */}
                <div>
                  <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Incident Category</span>
                  <h3 className="text-headline-md font-bold text-primary mt-1">{incident.category}</h3>
                </div>

                {/* Appeal Status Information (Read-only reference) */}
                {incident.adminVerification?.isRequested && (
                  <div className="p-5 bg-amber-50/50 border border-amber-200/50 rounded-lg space-y-3 animate-fade-in">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">AI Moderation Trigger</span>
                      <p className="text-body-md text-on-surface-variant leading-relaxed">
                        AI Rejection Reason: <span className="font-semibold italic text-red-700">&quot;{incident.rejectionReason || 'No specific flag description recorded'}&quot;</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Student Human Review Appeal Note</span>
                      <p className="text-body-md text-on-surface font-semibold leading-relaxed italic bg-white p-3 border border-amber-200/30 rounded">
                        &quot;{incident.adminVerification.appealNote}&quot;
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-outline uppercase tracking-wider block mb-1">Appeal Decision Status</span>
                      <div className={`inline-block px-3 py-1 rounded text-label-sm font-bold uppercase tracking-wider ${incident.adminVerification.status === "APPROVED" ? "bg-green-100 text-green-800" : incident.adminVerification.status === "PENDING" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-red-100 text-red-800"
                        }`}>
                        Appeal {incident.adminVerification.status}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Box */}
                <div>
                  <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-2">Detailed Narrative</p>
                  <div className="p-5 bg-slate-50 border-l-4 border-primary rounded-r-lg text-body-lg text-on-surface leading-relaxed italic">
                    &quot;{incident.description}&quot;
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="p-6 border-t border-outline-variant bg-slate-50 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <div className="text-xs text-on-surface-variant flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Case monitored under Judicial Integrity commission.</span>
            </div>

            <div className="flex justify-end w-full sm:w-auto">
              <button
                disabled={incident.status === "REJECTED" || processingModeration}
                onClick={() => handleRejectReport(incident.id)}
                className="px-4 py-2.5 border border-error text-error font-bold text-label-md rounded hover:bg-red-50 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto disabled:opacity-50"
              >
                {incident.status !== "REJECTED" ? "Reject Report" : "Rejected"}
              </button>
            </div>
          </div>

        </div>
      </div>

      <ProofLightboxModal
        isOpen={!!activeProofUrl}
        proofUrl={activeProofUrl}
        onClose={() => setActiveProofUrl(null)}
        subText={incident ? `Evidence Feed Extract - Ref ID: ${incident.id} - Location: ${incident.location}` : undefined}
      />
    </>
  );
}
