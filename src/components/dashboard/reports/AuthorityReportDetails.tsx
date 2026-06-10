"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Shield,
  Loader2,
  X,
  Send,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Reply
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getAuthorityIncidentDetails, submitAuthorityReview, postReportComment } from "@/actions/server/authority";
import { DetailedAuthorityIncident } from "@/actions/server/authority";
import { ReportComment } from "@/types/DashboardTypes";
import PriorityBadge from "@/components/badge/PriorityConfigBadge";
import EvidenceAttachmentList from "@/components/evidence/EvidenceAttachmentList";
import ProofLightboxModal from "@/components/modal/ProofLightboxModal";

interface Props {
  postId: string;
}

export default function AuthorityReportDetails({ postId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [report, setReport] = useState<DetailedAuthorityIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review status submission states
  const [reviewStatus, setReviewStatus] = useState<"INVESTIGATING" | "FAKE" | "RESOLVED">("INVESTIGATING");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Comment posting states
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Lightbox
  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);

  // Fetch report details
  const fetchDetails = async () => {
    try {
      const res = await getAuthorityIncidentDetails(postId);
      if (res.success && res.data) {
        setReport(res.data);
        // Pre-fill user's previous review if exists
        const userReview = res.data.authorityReviews.find((r) => r.userId === session?.user?.userId);
        if (userReview) {
          setReviewStatus(userReview.status);
          setReviewComment(userReview.comment);
        }
      } else {
        setError(res.error || "Failed to load report details.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.userId) {
      fetchDetails();
    }
  }, [postId, session?.user?.userId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    if ((reviewStatus === "FAKE" || reviewStatus === "RESOLVED") && !reviewComment.trim()) {
      Swal.fire({
        title: "Comment Required",
        text: `Please provide an explanation details for marking this case as ${reviewStatus}.`,
        icon: "warning",
        confirmButtonColor: "var(--color-primary, #000000)"
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await submitAuthorityReview(postId, reviewStatus, reviewComment.trim());
      if (res.success) {
        Swal.fire({
          title: "Assessment Saved",
          text: "Your review stance has been recorded and posted in the timeline.",
          icon: "success",
          confirmButtonColor: "var(--color-primary, #000000)"
        });
        fetchDetails(); // Reload data
      } else {
        Swal.fire("Error", res.error || "Failed to submit review.", "error");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "An unexpected error occurred.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await postReportComment(postId, commentText.trim(), replyToId || undefined);
      if (res.success) {
        setCommentText("");
        setReplyToId(null);
        fetchDetails(); // Reload data
      } else {
        Swal.fire("Error", res.error || "Failed to post comment.", "error");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "An unexpected error occurred.", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Helper to determine if the current user can post comments/replies
  const canReply = () => {
    if (!session?.user || !report) return false;
    const role = session.user.role;
    if (role === "ADMIN") return true;
    if (role === "student") {
      // Allow only the original poster of the report
      return report.narrative !== undefined; // In backend, getAuthorityIncidentDetails checks matchesReporter
    }
    if (role === "AUTHORITY") {
      // Allow authorities belonging to the same university and hall
      // (This is validated on the backend too)
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant font-bold">Fetching incident details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Access Restricted</h3>
        <p className="text-body-md text-on-surface-variant leading-relaxed">{error || "Incident report could not be found."}</p>
      </div>
    );
  }

  // Render comments as tree/indented list
  const renderCommentTree = (parentId: string | null = null, depth = 0) => {
    const list = report.comments.filter((c) => (parentId ? c.parentId === parentId : !c.parentId));
    if (list.length === 0) return null;

    return (
      <div className={`space-y-4 ${depth > 0 ? "ml-8 md:ml-12 border-l border-outline-variant pl-4 mt-2" : ""}`}>
        {list.map((comment) => (
          <div key={comment.commentId} className="bg-white border border-outline-variant/60 rounded-lg p-4 shadow-sm relative group/item">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-label-sm font-bold uppercase tracking-wider ${
                  comment.isAuthority ? "text-secondary" : "text-primary"
                }`}>
                  {comment.authorName}
                </span>
                <span className="text-[10px] bg-slate-100 text-on-surface-variant font-extrabold px-1.5 py-0.5 rounded uppercase">
                  {comment.authorRole}
                </span>
              </div>
              <span className="text-[10px] text-outline">
                {new Date(comment.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            
            <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {canReply() && !comment.content.includes("📢 Status update") && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    setReplyToId(comment.commentId);
                    setCommentText(`@${comment.authorName} `);
                  }}
                  className="text-xs text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            )}

            {/* Recursively render replies */}
            {renderCommentTree(comment.commentId, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  const roles = ["Provost", "Warden", "Home Tutor", "Assistant Home Tutor", "Hall VP", "GS", "AGS"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header breadcrumb */}
      <nav className="flex items-center text-xs text-on-surface-variant space-x-1.5 font-medium">
        <span className="cursor-pointer hover:underline" onClick={() => router.push("/dashboard")}>Dashboard</span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-bold">Ref: {report.postId}</span>
      </nav>

      {/* Main Grid Details Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Report details (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-6">
            
            {/* Title category */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-outline-variant pb-4">
              <div>
                <span className="text-xs text-outline font-bold uppercase tracking-wider">Incident Category</span>
                <h2 className="text-headline-md font-bold text-primary uppercase mt-0.5">{report.harassmentType}</h2>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={report.detectedSeverity === "HIGH" ? "High" : report.detectedSeverity === "MEDIUM" ? "Medium" : "Low"} />
                <span className="text-xs font-mono font-bold bg-primary-container/20 text-primary px-3 py-1.5 rounded">
                  REF: {report.postId}
                </span>
              </div>
            </div>

            {/* Location & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-outline-variant/60 rounded-lg flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Specific Location</span>
                  <p className="text-body-md font-bold text-on-surface mt-0.5">{report.university}</p>
                  <p className="text-xs text-on-surface-variant">{report.specificLocation} ({report.locationCategory})</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-outline-variant/60 rounded-lg flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Incident Date & Time</span>
                  <p className="text-body-md font-bold text-on-surface mt-0.5">
                    {new Date(report.dateTime).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Time: {new Date(report.dateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Narrative description */}
            <div className="space-y-2">
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Student Narrative Account</span>
              <div className="p-5 bg-slate-50 border-l-4 border-primary rounded-r-lg text-body-lg text-on-surface leading-relaxed italic select-all">
                &quot;{report.narrative}&quot;
              </div>
            </div>

            {/* Evidence details list */}
            <div className="border-t border-outline-variant pt-4">
              <EvidenceAttachmentList
                proofUrls={report.proofUrls}
                onSelectProof={setActiveProofUrl}
              />
            </div>

          </div>
        </div>

        {/* Right Column - Board Reviews consensus and user submission panel (5 cols) */}
        <div className="xl:col-span-5 space-y-6 w-full">
          
          {/* Option C consensus status registry */}
          <section className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
              <h3 className="text-label-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span>Board Assessment Reviews</span>
              </h3>
              <span className="text-[10px] bg-slate-200 text-on-surface-variant font-bold px-2 py-0.5 rounded">OPTION C</span>
            </div>
            
            <div className="divide-y divide-outline-variant max-h-[350px] overflow-y-auto">
              {roles.map((role) => {
                const review = report.authorityReviews.find((r) => r.designation === role);
                return (
                  <div key={role} className="p-4 flex flex-col gap-1 hover:bg-slate-50/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-label-md font-bold text-on-surface">{role}</span>
                        {review && (
                          <span className="text-[10px] text-secondary font-bold uppercase">{review.name}</span>
                        )}
                      </div>
                      
                      {review ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          review.status === "RESOLVED"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : review.status === "FAKE"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {review.status}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-400 border border-slate-200/50">
                          Awaiting Review
                        </span>
                      )}
                    </div>

                    {review && review.comment && (
                      <p className="text-xs text-on-surface-variant bg-slate-50 p-2 border border-outline-variant/30 rounded mt-1.5 italic">
                        &quot;{review.comment}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Submission (Only for logged-in authorities) */}
          {session?.user?.role === "AUTHORITY" && (
            <section className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-label-sm font-bold text-outline uppercase border-b border-outline-variant pb-2 mb-1">
                Submit My Assessment Review
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Select stance */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-outline font-bold uppercase tracking-wider block">Assessed Stance Status</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full p-2 bg-white border border-outline-variant rounded text-label-sm font-bold focus:outline-none"
                    disabled={submittingReview}
                  >
                    <option value="INVESTIGATING">INVESTIGATING (formal inquiry running)</option>
                    <option value="FAKE">FAKE (report claims are untruthful)</option>
                    <option value="RESOLVED">RESOLVED (issue addressed successfully)</option>
                  </select>
                </div>

                {/* Stance details comment */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-outline font-bold uppercase tracking-wider block">
                    Stance Details & Reason {(reviewStatus === "FAKE" || reviewStatus === "RESOLVED") && <span className="text-error font-bold">*Mandatory</span>}
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Provide detailed reasons or observations on this status assessment. This comment will be public."
                    className="w-full p-2 bg-white border border-outline-variant rounded text-body-md focus:outline-none placeholder-on-surface-variant/40 resize-none"
                    disabled={submittingReview}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-opacity-95 text-on-primary font-bold text-label-md rounded transition-all cursor-pointer flex justify-center items-center gap-2"
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Recording Review...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            </section>
          )}

        </div>
      </div>

      {/* Discussion Timeline Feed (unified comments feed) */}
      <section className="bg-white border border-outline-variant rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-headline-sm font-bold text-primary">Public Incident Log & Timeline</h3>
        </div>

        {/* Comment tree */}
        <div className="space-y-4">
          {report.comments && report.comments.length > 0 ? (
            renderCommentTree(null)
          ) : (
            <p className="text-body-md text-on-surface-variant/70 italic text-center py-6">
              No actions or discussions recorded on this timeline yet.
            </p>
          )}
        </div>

        {/* Discussion form input */}
        {canReply() && (
          <form onSubmit={handleCommentSubmit} className="border-t border-outline-variant/80 pt-6 space-y-3">
            {replyToId && (
              <div className="flex justify-between items-center bg-secondary-fixed/15 text-secondary text-xs px-3 py-1.5 rounded font-bold">
                <span>Replying to comment thread...</span>
                <button
                  type="button"
                  onClick={() => {
                    setReplyToId(null);
                    setCommentText("");
                  }}
                  className="p-0.5 hover:bg-slate-200/50 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-3 items-end">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post an update, leave notes, or reply to reviews..."
                className="flex-1 p-3 bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none placeholder-on-surface-variant/40 resize-none"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="bg-primary text-on-primary hover:bg-opacity-95 p-3 rounded-lg flex items-center justify-center cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 transition-all shrink-0 h-[48px] w-[48px]"
              >
                {submittingComment ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Lightbox attachment previewer */}
      <ProofLightboxModal
        isOpen={!!activeProofUrl}
        proofUrl={activeProofUrl}
        onClose={() => setActiveProofUrl(null)}
        subText={`Evidence Feed extract - Ref ID: ${report.postId} - Location: ${report.specificLocation}`}
      />
    </div>
  );
}
