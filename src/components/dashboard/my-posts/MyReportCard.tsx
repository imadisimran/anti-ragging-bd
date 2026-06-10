"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  MoreVertical, 
  ThumbsUp, 
  MessageSquare, 
  BarChart2, 
  Eye, 
  AlertCircle, 
  UserCheck, 
  Edit, 
  Gavel, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Download, 
  Archive
} from "lucide-react";
import { MyDetailedReport, submitReportAppeal } from "@/actions/server/my-reports";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { toggleUpvoteReport } from "@/actions/server/upvote";

interface MyReportCardProps {
  report: MyDetailedReport;
  showToast: (message: string) => void;
}

export default function MyReportCard({ report, showToast }: MyReportCardProps) {
  const [activeTab, setActiveTab] = useState<"public" | "original">("public");
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  
  const { data: session } = useSession();
  const userId = session?.user?.userId;

  const [upVotesCount, setUpVotesCount] = useState(report.upVotesCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    if (userId && report.upVotesBy) {
      setHasUpvoted(report.upVotesBy.includes(userId));
    } else {
      setHasUpvoted(false);
    }
  }, [userId, report.upVotesBy]);

  useEffect(() => {
    setUpVotesCount(report.upVotesCount || 0);
  }, [report.upVotesCount]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session || !userId) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to upvote.",
        icon: "warning",
        confirmButtonColor: "var(--p)",
      });
      return;
    }

    const nextHasUpvoted = !hasUpvoted;
    const nextCount = nextHasUpvoted ? upVotesCount + 1 : upVotesCount - 1;
    setHasUpvoted(nextHasUpvoted);
    setUpVotesCount(nextCount);

    try {
      const res = await toggleUpvoteReport(report.postId);
      if (res.success) {
        if (res.upVotesCount !== undefined) {
          setUpVotesCount(res.upVotesCount);
        }
        if (res.hasUpvoted !== undefined) {
          setHasUpvoted(res.hasUpvoted);
        }
      } else {
        setHasUpvoted(!nextHasUpvoted);
        setUpVotesCount(upVotesCount);
        Swal.fire({
          title: "Error",
          text: res.error || "Failed to toggle upvote.",
          icon: "error",
          confirmButtonColor: "var(--p)",
        });
      }
    } catch (err) {
      setHasUpvoted(!nextHasUpvoted);
      setUpVotesCount(upVotesCount);
      console.error(err);
    }
  };
  
  // Appeal state
  const [isAppealModalOpen, setIsAppealModalOpen] = useState<boolean>(false);
  const [appealNote, setAppealNote] = useState<string>("");
  const [submittingAppeal, setSubmittingAppeal] = useState<boolean>(false);

  // Helper to determine badge configurations based on DB model properties
  const getReportStatusConfig = (report: MyDetailedReport) => {
    if (report.isRaggingIncident === false) {
      if (report.adminVerification?.isRequested) {
        if (report.adminVerification.status === "PENDING") {
          return {
            label: "Appeal Pending",
            badgeClass: "bg-amber-100 text-amber-800 border border-amber-200/50",
            dotClass: "bg-amber-600",
            isAppealPending: true
          };
        }
        if (report.adminVerification.status === "REJECTED") {
          return {
            label: "Appeal Rejected",
            badgeClass: "bg-error-container text-on-error-container",
            dotClass: "bg-error",
            isAppealRejected: true
          };
        }
        if (report.adminVerification.status === "APPROVED") {
          return {
            label: "Resolved",
            badgeClass: "bg-green-100 text-green-800",
            dotClass: "bg-green-600",
            isResolved: true
          };
        }
      }
      return {
        label: "AI Rejected",
        badgeClass: "bg-error-container text-on-error-container",
        dotClass: "bg-error",
        isAiRejected: true
      };
    }

    if (report.status === "DISPUTED" || (report.adminVerification && report.adminVerification.status === "REJECTED")) {
      return {
        label: "Disputed",
        badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
        dotClass: "bg-tertiary",
        isDisputed: true
      };
    }

    if (report.status === "RESOLVED" || report.status === "APPROVED") {
      return {
        label: "Resolved",
        badgeClass: "bg-green-100 text-green-800",
        dotClass: "bg-green-600",
        isResolved: true
      };
    }

    return {
      label: report.status === "PENDING" ? "Pending Review" : "Under Investigation",
      badgeClass: "bg-secondary-fixed text-on-secondary-fixed",
      dotClass: "bg-secondary",
      isInvestigating: true
    };
  };

  const config = getReportStatusConfig(report);

  const formatReportDate = (date: Date | string | number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealNote.trim()) return;
    setSubmittingAppeal(true);
    try {
      const res = await submitReportAppeal(report.postId, appealNote);
      if (res.success) {
        showToast("Human review appeal submitted successfully.");
        setIsAppealModalOpen(false);
        // Reload page to fetch updated statuses from server actions
        window.location.reload();
      } else {
        showToast(res.error || "Failed to submit appeal.");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error occurred while submitting your appeal.");
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const isModerationFlow = config.isAiRejected || config.isAppealPending || config.isAppealRejected;

  return (
    <div className="bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col animate-fade-in">
      {/* Metadata Header */}
      <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-label-md font-bold tracking-wider text-on-surface-variant">
              #{report.postId}
            </span>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 text-label-sm font-semibold rounded ${config.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${config.dotClass}`}></span>
              {config.label}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-sm font-semibold text-on-surface-variant uppercase tracking-tight">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
              {report.university} • {report.specificLocation}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
              {formatReportDate(report.createdAt)}
            </span>
          </div>
        </div>
        <button 
          onClick={() => showToast(`Report Options for Case #${report.postId}`)}
          className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container cursor-pointer"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Moderation Flag / Appeal Banner */}
      {isModerationFlow && (
        <div className={`p-6 border-b border-outline-variant ${
          config.isAppealPending 
            ? "bg-amber-50/50" 
            : "bg-error-container/10"
        }`}>
          <div className="flex items-start gap-3">
            {config.isAppealPending ? (
              <Clock className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-600 animate-pulse" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-error" />
            )}
            <div>
              {config.isAppealPending && (
                <>
                  <h4 className="text-headline-sm font-bold mb-1 text-amber-800">Human Review Requested</h4>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    Appeal Note: "{report.adminVerification?.appealNote}"
                  </p>
                </>
              )}
              {config.isAppealRejected && (
                <>
                  <h4 className="text-headline-sm font-bold mb-1 text-error">Human Review Rejected</h4>
                  <p className="text-body-md text-on-surface-variant leading-relaxed font-bold mb-2">
                    Official Rejection Reason: "{report.adminVerification?.adminNote || 'No explanation provided.'}"
                  </p>
                  <p className="text-xs text-outline leading-relaxed">
                    This appeal has been closed. No further appeal submissions are permitted for this report.
                  </p>
                </>
              )}
              {config.isAiRejected && (
                <>
                  <h4 className="text-headline-sm font-bold mb-1 text-error">Moderation Flag: AI Content Analysis</h4>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {report.rejectionReason || "Automated analysis failed to verify concrete incident signals or specific location indicators required for platform verification."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Narrative Staging Area: Switches between public sanitized title/desc and student original submit */}
      {!isModerationFlow ? (
        <div className="flex flex-col border-b border-outline-variant bg-surface-container-low">
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setActiveTab("public")}
              className={`px-6 py-3 text-label-md font-bold transition-all cursor-pointer ${
                activeTab === "public" 
                  ? "text-secondary border-b-2 border-secondary bg-white" 
                  : "text-on-surface-variant font-medium hover:bg-surface-container-high"
              }`}
            >
              What the Public Sees
            </button>
            <button
              onClick={() => setActiveTab("original")}
              className={`px-6 py-3 text-label-md font-bold transition-all cursor-pointer ${
                activeTab === "original" 
                  ? "text-secondary border-b-2 border-secondary bg-white" 
                  : "text-on-surface-variant font-medium hover:bg-surface-container-high"
              }`}
            >
              My Original Submission
            </button>
          </div>
          
          {activeTab === "public" ? (
            <div className="p-6 bg-white animate-fade-in">
              <h3 className="text-headline-md text-primary font-bold mb-3">
                {report.sanitizedTitle || "Incognito Whistleblowing Log"}
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {report.sanitizedDescription || "This narrative has been redacted/sanitized to prevent retaliatory actions and protect key student identities."}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-white animate-fade-in">
              <h3 className="text-headline-md text-primary font-bold mb-3">
                {report.sanitizedTitle || "Incident Submitted Narrative"}
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {report.narrative || "No narrative content submitted."}
              </p>
            </div>
          )}
        </div>
      ) : (
        // If AI Rejected/Pending/Appeal Rejected, show the original submission directly (no public version)
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-headline-md text-primary font-bold mb-3">
            {report.sanitizedTitle || "Incident Log"}
          </h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {report.narrative || "No narrative content submitted."}
          </p>
        </div>
      )}

      {/* Resolution Message Banner if Resolved */}
      {config.isResolved && (
        <div className="p-6 bg-green-50/50 border-b border-outline-variant">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 fill-green-100" />
            <span className="font-bold text-label-md uppercase tracking-wider">
              Incident Resolved: Institutional Action Taken
            </span>
          </div>
        </div>
      )}

      {/* Engagement Metrics Bar */}
      {!isModerationFlow && (
        <div className="px-6 py-3 bg-surface flex flex-wrap items-center gap-8 border-b border-outline-variant">
          <button 
            onClick={handleUpvote}
            className={`flex items-center gap-2 text-label-sm font-semibold transition-colors duration-200 hover:text-secondary cursor-pointer ${
              hasUpvoted ? "text-secondary" : "text-on-surface-variant"
            }`}
          >
            <ThumbsUp className={`w-[18px] h-[18px] transition-transform duration-200 active:scale-125 ${hasUpvoted ? "text-secondary fill-secondary" : ""}`} />
            <span>{upVotesCount} Community Upvotes</span>
          </button>
          <div className="flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
            <MessageSquare className="w-[18px] h-[18px] text-primary fill-primary" />
            <span>
              {report.adminVerification?.adminNote ? "1 Authority Track" : "0 Authority Tracks"}
            </span>
          </div>
        </div>
      )}

      {/* Accordion Proctor Office response/objection if notes exist */}
      {report.adminVerification?.adminNote && !config.isAppealRejected && (
        <div className="flex flex-col border-b border-outline-variant">
          <div className="px-6 py-4 flex gap-3">
            <button 
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="bg-tertiary text-on-tertiary px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-tertiary/10"
            >
              <Gavel className="w-[18px] h-[18px]" />
              <span>View Faculty Objection</span>
              {isAccordionOpen ? (
                <ChevronUp className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </button>
          </div>
          
          {isAccordionOpen && (
            <div className="bg-surface-container-low p-6 transition-all duration-300 animate-slide-down border-t border-outline-variant">
              <div className="border-l-4 border-tertiary pl-4">
                <span className="text-label-sm font-bold uppercase text-on-surface-variant mb-2 block tracking-wider">
                  Official Response from Proctor Office
                </span>
                <p className="text-body-md italic text-on-surface-variant leading-relaxed">
                  "{report.adminVerification.adminNote}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contextual Action Button Row */}
      <div className="px-6 py-4 flex flex-wrap gap-3">
        {config.isAiRejected ? (
          <>
            <button 
              onClick={() => setIsAppealModalOpen(true)}
              className="bg-primary text-on-primary px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm shadow-primary/10"
            >
              <UserCheck className="w-[18px] h-[18px]" />
              <span>Request Human Review</span>
            </button>
            <button 
              onClick={() => showToast(`Amending text description interface for Case #${report.postId}`)}
              className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-[18px] h-[18px]" />
              <span>Amend Submission</span>
            </button>
          </>
        ) : config.isAppealPending ? (
          <>
            <button 
              onClick={() => showToast(`Your Human review appeal is currently pending evaluation.`)}
              className="bg-amber-600 text-white px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm shadow-amber-500/10"
            >
              <Clock className="w-[18px] h-[18px]" />
              <span>Appeal Pending Review</span>
            </button>
          </>
        ) : config.isAppealRejected ? (
          <>
            <button 
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 px-5 py-2.5 rounded font-bold text-label-md flex items-center gap-2 cursor-not-allowed"
            >
              <AlertCircle className="w-[18px] h-[18px]" />
              <span>Appeal Rejected (Closed)</span>
            </button>
          </>
        ) : config.isResolved ? (
          <>
            <button 
              onClick={() => showToast(`Downloading formal resolution docket for Case #${report.postId}...`)}
              className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-[18px] h-[18px]" />
              <span>Download Resolution Report</span>
            </button>
            <button 
              onClick={() => showToast(`Archiving Case #${report.postId} to private log repository...`)}
              className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Archive className="w-[18px] h-[18px]" />
              <span>Archive Post</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => showToast(`Tracking response timelines & disciplinary dockets for Case #${report.postId}`)}
              className="bg-secondary text-white px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm shadow-secondary/10"
            >
              <BarChart2 className="w-[18px] h-[18px]" />
              <span>View Authority Actions</span>
            </button>
            <Link 
              href={`/post/${report.postId}`}
              className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-[18px] h-[18px]" />
              <span>View Live Post</span>
            </Link>
          </>
        )}
      </div>

      {/* Human Review Appeal Modal */}
      {isAppealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsAppealModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <h3 className="text-headline-md font-bold text-primary">Request Human Review</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Explain why this report describes a valid ragging incident. Provide any additional context or details that the Proctor office should verify manually.
            </p>
            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <textarea
                value={appealNote}
                onChange={(e) => setAppealNote(e.target.value)}
                className="w-full h-32 p-3 bg-slate-50 border border-outline-variant rounded-md text-body-md focus:outline-none focus:border-primary placeholder-on-surface-variant/40"
                placeholder="Write your explanation note here..."
                required
                maxLength={500}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAppealModalOpen(false)}
                  className="px-4 py-2 border border-outline rounded text-label-md font-bold hover:bg-slate-50 cursor-pointer"
                  disabled={submittingAppeal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded text-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm shadow-primary/10"
                  disabled={submittingAppeal || !appealNote.trim()}
                >
                  {submittingAppeal ? "Submitting..." : "Submit Appeal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
