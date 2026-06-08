import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Paperclip,
  X,
  ZoomIn,
  Clock,
  Hourglass,
  CheckCircle,
  AlertCircle,
  Scale
} from "lucide-react";
import { StudentReport } from "@/actions/server/dashboard";
import ProofLightboxModal from "@/components/modal/ProofLightboxModal";

interface StudentReportModalProps {
  isOpen: boolean;
  report: StudentReport | null;
  onClose: () => void;
}

const getProofType = (url: string): "image" | "video" | "audio" | "unknown" => {
  const lowercaseUrl = url.toLowerCase();
  if (
    lowercaseUrl.includes("/video/upload/") ||
    lowercaseUrl.endsWith(".mp4") ||
    lowercaseUrl.endsWith(".webm") ||
    lowercaseUrl.endsWith(".ogg") ||
    lowercaseUrl.endsWith(".mov")
  ) {
    return "video";
  }
  if (
    lowercaseUrl.includes("/image/upload/") ||
    lowercaseUrl.endsWith(".jpg") ||
    lowercaseUrl.endsWith(".jpeg") ||
    lowercaseUrl.endsWith(".png") ||
    lowercaseUrl.endsWith(".webp") ||
    lowercaseUrl.endsWith(".gif")
  ) {
    return "image";
  }
  if (
    lowercaseUrl.includes("/audio/upload/") ||
    lowercaseUrl.endsWith(".mp3") ||
    lowercaseUrl.endsWith(".wav") ||
    lowercaseUrl.endsWith(".aac") ||
    lowercaseUrl.endsWith(".m4a")
  ) {
    return "audio";
  }
  return "unknown";
};

const getFileName = (url: string, index: number) => {
  const type = getProofType(url);
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1] || "";
  const dotParts = lastPart.split(".");
  const ext = dotParts.length > 1 ? `.${dotParts[dotParts.length - 1]}` : "";
  return `proof_attachment_0${index + 1}${ext ? ext : ` (${typeLabel})`}`;
};

const getStatusBadgeConfig = (status: string, isRaggingIncident: boolean) => {
  if (!isRaggingIncident) {
    return {
      bgClass: "bg-error-container text-on-error-container border border-error/20",
      label: "REJECTED",
      icon: <AlertCircle className="w-[18px] h-[18px] text-error" />
    };
  }
  const s = status?.toUpperCase() || "SUBMITTED";
  switch (s) {
    case "REJECTED":
      return {
        bgClass: "bg-error-container text-on-error-container border border-error/20",
        label: "REJECTED",
        icon: <AlertCircle className="w-[18px] h-[18px] text-error" />
      };
    case "APPROVED":
    case "RESOLVED":
    case "VERIFIED":
      return {
        bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
        label: s,
        icon: <CheckCircle className="w-[18px] h-[18px] text-emerald-600" />
      };
    case "PENDING":
    case "INVESTIGATING":
      return {
        bgClass: "bg-amber-50 text-amber-700 border-amber-200/50",
        label: s,
        icon: <Hourglass className="w-[18px] h-[18px] text-amber-600 animate-pulse" />
      };
    case "SUBMITTED":
    default:
      return {
        bgClass: "bg-slate-100 text-on-surface-variant border border-slate-200",
        label: "SUBMITTED",
        icon: <Scale className="w-[18px] h-[18px] text-outline" />
      };
  }
};

const formatYYYYMMDD = (dateVal: Date | string | number) => {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "N/A";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function StudentReportModal({
  isOpen,
  report,
  onClose,
}: StudentReportModalProps) {
  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);

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

  if (!isOpen || !report) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Modal Backdrop click listener */}
        <div className="absolute inset-0" onClick={onClose}></div>

        {/* Modal Container */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          {/* Modal Header */}
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Report Ref</span>
              <span className="text-headline-md font-extrabold text-primary">#{report.postId}</span>
              
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                  report.detectedSeverity.toUpperCase() === "HIGH"
                    ? "bg-error-container/50 text-error border border-error/20"
                    : report.detectedSeverity.toUpperCase() === "MEDIUM"
                    ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                    : "bg-slate-100 text-on-surface-variant border border-slate-200"
                }`}
              >
                {report.detectedSeverity} SEVERITY
              </span>
              
              <div className={`px-2.5 py-1 rounded uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5 ${getStatusBadgeConfig(report.status, report.isRaggingIncident).bgClass}`}>
                {getStatusBadgeConfig(report.status, report.isRaggingIncident).icon}
                {getStatusBadgeConfig(report.status, report.isRaggingIncident).label}
              </div>
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
              
              {/* Left Side: Metadata snapshot */}
              <div className="md:col-span-1 space-y-6">
                {/* Location Info Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-on-surface-variant" />
                    <span>University & Location</span>
                  </div>
                  <p className="text-body-lg font-bold text-on-surface">{report.university}</p>
                  <p className="text-body-md font-semibold text-on-surface-variant">{report.specificLocation}</p>
                </div>

                {/* Timestamp Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-on-surface-variant" />
                    <span>Date Occurred</span>
                  </div>
                  <p className="text-body-md font-semibold text-on-surface">{formatYYYYMMDD(report.dateTime)}</p>
                </div>

                {/* Date Reported Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-on-surface-variant" />
                    <span>Date Reported</span>
                  </div>
                  <p className="text-body-md font-semibold text-on-surface">{formatYYYYMMDD(report.createdAt)}</p>
                </div>

                 {/* Evidence Card */}
                <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                    <Paperclip className="w-4 h-4 text-on-surface-variant" />
                    <span>Proof Attachments</span>
                  </div>
                  {report.proofUrls && report.proofUrls.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-label-md font-bold text-secondary">{report.proofUrls.length} Files Attached</p>
                      <ul className="text-xs text-on-surface-variant space-y-1">
                        {report.proofUrls.map((url, idx) => (
                          <li 
                            key={idx} 
                            onClick={() => setActiveProofUrl(url)}
                            className="flex items-center gap-1.5 hover:text-primary hover:underline cursor-pointer"
                          >
                            <Paperclip className="w-3 h-3 text-outline" />
                            <span className="truncate flex-1">{getFileName(url, idx)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-body-md text-on-surface-variant italic">No proof provided.</p>
                  )}
                </div>
              </div>

              {/* Right Side: Narrative */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Harassment Category</span>
                  <h3 className="text-headline-md font-bold text-primary mt-1">{report.harassmentType}</h3>
                </div>

                <div>
                  <p className="text-label-sm font-bold text-outline uppercase tracking-wider">Sanitized Title</p>
                  <h4 className="text-headline-sm font-semibold text-primary mt-1">{report.sanitizedTitle || "Untitled"}</h4>
                </div>

                <div>
                  <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-2">Sanitized Narrative</p>
                  <div className="p-5 bg-slate-50 border-l-4 border-primary rounded-r-lg text-body-lg text-on-surface leading-relaxed italic">
                    &quot;{report.sanitizedDescription}&quot;
                  </div>
                </div>

                 {report.proofUrls && report.proofUrls.length > 0 ? (
                  <div>
                    <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-3">Verification Video/Image Proof</p>
                    <div
                      onClick={() => setActiveProofUrl(report.proofUrls![0])}
                      className="relative group cursor-pointer border border-outline-variant h-64 rounded-lg overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center"
                    >
                      {getProofType(report.proofUrls[0]) === "video" ? (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
                          <video src={report.proofUrls[0]} className="w-full h-full object-cover opacity-60" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary ml-1">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      ) : getProofType(report.proofUrls[0]) === "audio" ? (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3 relative">
                          <Clock className="w-12 h-12 text-outline animate-pulse" />
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Audio Evidence Proof</span>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-white/90 text-primary px-4 py-2 font-bold text-label-md flex items-center gap-2 rounded shadow">
                              Play Audio Proof
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          alt="Submitted proof capture"
                          src={report.proofUrls[0]}
                        />
                      )}
                      {getProofType(report.proofUrls[0]) === "image" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white/90 text-primary px-4 py-2 font-bold text-label-md flex items-center gap-2 rounded shadow">
                            <ZoomIn className="w-4 h-4" />
                            Zoom and Analyze Proof
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-3">Verification Video/Image Proof</p>
                    <div className="border border-dashed border-outline-variant rounded-lg p-8 text-center text-on-surface-variant italic bg-slate-50/50">
                      No proof provided.
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-outline-variant bg-slate-50 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <div className="text-xs text-on-surface-variant flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Case monitored under Safety Mandate Guidelines.</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-primary text-on-primary font-bold text-label-md rounded hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
            >
              Close Details
            </button>
          </div>

        </div>
      </div>

      <ProofLightboxModal
        isOpen={!!activeProofUrl}
        proofUrl={activeProofUrl}
        onClose={() => setActiveProofUrl(null)}
        subText={report ? `Attachment Extract - Ref ID: #${report.postId} - University: ${report.university}` : undefined}
      />
    </>
  );
}
