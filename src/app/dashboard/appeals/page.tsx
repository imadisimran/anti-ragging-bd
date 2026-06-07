"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  CheckCircle,
  Hourglass,
  Scale,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Paperclip,
  ZoomIn,
  X,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Swal from "sweetalert2";
import { getAppealsList, resolveAppeal } from "@/actions/server/admin";
import { MyDetailedReport } from "@/actions/server/my-reports";

export default function AppealsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = session?.user?.role;

  const [appeals, setAppeals] = useState<MyDetailedReport[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<MyDetailedReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);

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

  // Data loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingModeration, setProcessingModeration] = useState<boolean>(false);
  const [appealResponseNote, setAppealResponseNote] = useState<string>("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadAppeals = async () => {
    try {
      setLoading(true);
      const res = await getAppealsList();
      if (res.success && res.data) {
        setAppeals(res.data);
      } else {
        setError(res.error || "Failed to load appeals queue.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching appeals.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch appeals on load if authorized
  useEffect(() => {
    if (sessionStatus === "authenticated" && role === "ADMIN") {
      loadAppeals();
    }
  }, [sessionStatus, role]);

  const handleResolveAppealClick = async (action: "APPROVE" | "REJECT") => {
    if (!selectedAppeal) return;
    if (action === "REJECT" && !appealResponseNote.trim()) {
      Swal.fire({
        title: "Explanation Required",
        text: "Please provide a reason or explanation to reject this appeal.",
        icon: "warning",
        confirmButtonColor: "var(--color-primary, #0051d5)"
      });
      return;
    }

    setProcessingModeration(true);
    try {
      const res = await resolveAppeal(selectedAppeal.postId, action, appealResponseNote);
      if (res.success) {
        Swal.fire({
          title: `Appeal ${action === "APPROVE" ? "Approved" : "Rejected"}`,
          text: res.message || "Appeal status updated successfully.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
        handleCloseModal();
        loadAppeals(); // Refresh queue
      } else {
        Swal.fire({
          title: "Error",
          text: res.error || "Failed to resolve appeal.",
          icon: "error"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred while resolving appeal.",
        icon: "error"
      });
    } finally {
      setProcessingModeration(false);
    }
  };

  const handleRowClick = (appeal: MyDetailedReport) => {
    setSelectedAppeal(appeal);
    setAppealResponseNote("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveProofUrl(null);
  };

  // Keyboard close support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Auth checking state
  if (sessionStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-body-md text-on-surface-variant font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || role !== "ADMIN") {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Access Denied</h3>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          You do not have permission to view the Student Appeals Pipeline. Only administrator accounts are allowed.
        </p>
      </div>
    );
  }

  // Filtered appeals
  const filteredAppeals = appeals.filter((appeal) => {
    const matchesSearch =
      appeal.postId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appeal.harassmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appeal.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appeal.sanitizedDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appeal.adminVerification?.appealNote?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === "All" || appeal.detectedSeverity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // Paginated appeals
  const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);
  const paginatedAppeals = filteredAppeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredAppeals.length, totalPages, currentPage]);

  const formatYYYYMMDD = (dateVal: Date | string | number) => {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">
      {/* Header */}
      <header className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Student Appeals Pipeline</h1>
        <p className="text-body-md text-on-surface-variant">
          Review and resolve appeals submitted by students regarding AI-moderated reports.
        </p>
      </header>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-stack-lg">
        <div className="bg-white border-l-[6px] border-l-amber-500 border border-outline-variant p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-label-sm font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded">PENDING REVIEW</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{appeals.length}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Total Pending Appeals</p>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[400px]">
        {/* Table Operations Header */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Appeals Queue</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review flagged complaints requiring human verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 bg-white border border-outline-variant text-body-md rounded-md focus:outline-none focus:border-secondary w-full sm:w-64 placeholder-on-surface-variant/40"
                placeholder="Search Appeals..."
                type="text"
              />
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-label-md font-bold transition-all hover:bg-slate-50 cursor-pointer ${severityFilter !== "All"
                    ? "border-secondary text-secondary bg-secondary-fixed/10"
                    : "border-outline text-on-surface"
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Filters Dropdown Card */}
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-outline-variant rounded-lg shadow-lg p-4 z-20 space-y-4 animate-in fade-in duration-100">
                    <div>
                      <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Severity</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                          <button
                            key={sev}
                            onClick={() => { setSeverityFilter(sev); setCurrentPage(1); }}
                            className={`px-3 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${severityFilter === sev
                                ? "bg-primary text-white border-primary"
                                : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                              }`}
                          >
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex justify-between">
                      <button
                        onClick={() => {
                          setSeverityFilter("All");
                          setCurrentPage(1);
                          setShowFilterDropdown(false);
                        }}
                        className="text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterDropdown(false)}
                        className="text-xs text-secondary font-bold hover:underline cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Appeal ID</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Appeal Date</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">University</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p>Loading appeals queue...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-error font-body-lg bg-red-50/10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-error" />
                      <p>{error}</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedAppeals.length > 0 ? (
                paginatedAppeals.map((appeal) => {
                  const isHigh = appeal.detectedSeverity === "HIGH";
                  const isMedium = appeal.detectedSeverity === "MEDIUM";

                  return (
                    <tr
                      key={appeal.postId}
                      onClick={() => handleRowClick(appeal)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 text-label-md font-bold text-primary group-hover:text-secondary transition-colors">
                        #{appeal.postId}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {formatYYYYMMDD(appeal.adminVerification?.appealSubmittedAt || appeal.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface font-semibold truncate max-w-[150px]">
                        {appeal.university}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-body-md text-on-surface font-semibold">{appeal.harassmentType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider inline-block ${isHigh
                              ? "bg-error-container/50 text-error border border-error/20"
                              : isMedium
                                ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                                : "bg-slate-100 text-on-surface-variant border border-slate-200"
                            }`}
                        >
                          {appeal.detectedSeverity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-on-surface-variant/40" />
                      <p>No pending student appeals found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-slate-50 text-label-sm font-bold text-outline">
            <span>
              Showing {Math.min(filteredAppeals.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredAppeals.length, currentPage * itemsPerPage)} of {filteredAppeals.length} reports
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-outline rounded bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-on-surface cursor-pointer flex items-center gap-1 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 border rounded cursor-pointer transition-colors ${currentPage === i + 1
                      ? "bg-primary text-white border-primary"
                      : "bg-white hover:bg-slate-100 border-outline text-on-surface"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-outline rounded bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-on-surface cursor-pointer flex items-center gap-1 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appeal Details Modal */}
      {isModalOpen && selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={handleCloseModal}></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Appeal Ref</span>
                <span className="text-headline-md font-extrabold text-primary">#{selectedAppeal.postId}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${selectedAppeal.detectedSeverity === "HIGH"
                      ? "bg-error-container/50 text-error border border-error/20"
                      : selectedAppeal.detectedSeverity === "MEDIUM"
                        ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                        : "bg-slate-100 text-on-surface-variant border border-slate-200"
                    }`}
                >
                  {selectedAppeal.detectedSeverity} SEVERITY
                </span>
                <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  APPEAL PENDING
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Side: Metadata and proof list */}
                <div className="md:col-span-1 space-y-6">
                  {/* Location Info Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-on-surface-variant" />
                      <span>Location</span>
                    </div>
                    <p className="text-body-lg font-bold text-on-surface">{selectedAppeal.university}</p>
                    <p className="text-body-md font-semibold text-on-surface-variant">{selectedAppeal.specificLocation}</p>
                  </div>

                  {/* Timestamp Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-on-surface-variant" />
                      <span>Submission Date</span>
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">{formatYYYYMMDD(selectedAppeal.createdAt)}</p>
                  </div>

                  {/* Appeal Date Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-on-surface-variant" />
                      <span>Appeal Date</span>
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">
                      {selectedAppeal.adminVerification?.appealSubmittedAt ? formatYYYYMMDD(selectedAppeal.adminVerification.appealSubmittedAt) : "N/A"}
                    </p>
                  </div>

                  {/* Evidence Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <Paperclip className="w-4 h-4 text-on-surface-variant" />
                      <span>Attachments</span>
                    </div>
                    {selectedAppeal.proofUrls && selectedAppeal.proofUrls.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-label-md font-bold text-secondary">{selectedAppeal.proofUrls.length} Files Attached</p>
                        <ul className="text-xs text-on-surface-variant space-y-1">
                          {selectedAppeal.proofUrls.map((url, idx) => (
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

                {/* Right Side: Details, Narrative and Appeal forms */}
                <div className="md:col-span-2 space-y-6">
                  {/* Harassment Type */}
                  <div>
                    <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Harassment Category</span>
                    <h3 className="text-headline-md font-bold text-primary mt-1">{selectedAppeal.harassmentType}</h3>
                  </div>

                  {/* AI Moderation & Student Appeal Note */}
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg space-y-4 animate-fade-in">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">AI Moderation Trigger</span>
                      <p className="text-body-md text-on-surface-variant leading-relaxed">
                        AI Rejection Reason: <span className="font-semibold italic text-red-700">"{selectedAppeal.rejectionReason || 'No specific flag description recorded'}"</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Student Human Review Appeal Note</span>
                      <p className="text-body-md text-on-surface font-semibold leading-relaxed italic bg-white p-3 border border-amber-200 rounded">
                        &quot;{selectedAppeal.adminVerification?.appealNote}&quot;
                      </p>
                    </div>

                    {/* Resolution form */}
                    <div className="border-t border-amber-200 pt-4 space-y-3">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider block">Moderation Notes / Explanation (Required for Rejections)</label>
                      <textarea
                        value={appealResponseNote}
                        onChange={(e) => setAppealResponseNote(e.target.value)}
                        placeholder="Enter decision explanation context here..."
                        className="w-full h-20 p-2.5 bg-white border border-outline-variant rounded text-body-md focus:outline-none focus:border-secondary"
                        disabled={processingModeration}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResolveAppealClick("APPROVE")}
                          className="px-4 py-2 bg-green-700 text-white font-bold text-label-md rounded hover:bg-green-800 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          disabled={processingModeration}
                        >
                          Approve Appeal (Publish Post)
                        </button>
                        <button
                          onClick={() => handleResolveAppealClick("REJECT")}
                          className="px-4 py-2 bg-error text-on-error font-bold text-label-md rounded hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          disabled={processingModeration || !appealResponseNote.trim()}
                        >
                          Reject Appeal (Permanently Hide)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div>
                    <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-2">Original Narrative</p>
                    <div className="p-5 bg-slate-50 border-l-4 border-primary rounded-r-lg text-body-lg text-on-surface leading-relaxed italic">
                      &quot;{selectedAppeal.sanitizedDescription || selectedAppeal.narrative}&quot;
                    </div>
                  </div>

                  {/* Proof Preview */}
                  {selectedAppeal.proofUrls && selectedAppeal.proofUrls.length > 0 ? (
                    <div>
                      <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-3">Verification Video/Image Proof</p>
                      <div
                        onClick={() => setActiveProofUrl(selectedAppeal.proofUrls[0])}
                        className="relative group cursor-pointer border border-outline-variant h-64 rounded-lg overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center"
                      >
                        {getProofType(selectedAppeal.proofUrls[0]) === "video" ? (
                          <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
                            <video src={selectedAppeal.proofUrls[0]} className="w-full h-full object-cover opacity-60" muted />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary ml-1">
                                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        ) : getProofType(selectedAppeal.proofUrls[0]) === "audio" ? (
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
                            src={selectedAppeal.proofUrls[0]}
                          />
                        )}
                        {getProofType(selectedAppeal.proofUrls[0]) === "image" && (
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
                <span>Case monitored under Judicial Integrity commission.</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-primary text-on-primary font-bold text-label-md rounded hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
              >
                Close Queue Item
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {activeProofUrl && selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-150">
          <button
            onClick={() => setActiveProofUrl(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Close Zoom"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full max-h-[85vh] relative flex flex-col items-center justify-center">
            {getProofType(activeProofUrl) === "video" ? (
              <video
                src={activeProofUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg border border-white/10 shadow-2xl"
              />
            ) : getProofType(activeProofUrl) === "audio" ? (
              <div className="bg-slate-900 p-8 rounded-lg border border-white/10 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                <Clock className="w-12 h-12 text-white animate-pulse" />
                <audio src={activeProofUrl} controls autoPlay className="w-80" />
                <span className="text-white text-xs">Audio Evidence Playback</span>
              </div>
            ) : (
              <img
                className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
                alt="Zoomed proof capture"
                src={activeProofUrl}
              />
            )}
            <p className="text-white/60 text-xs font-semibold mt-4 text-center">
              Attachment Extract - Ref ID: #{selectedAppeal.postId} - University: {selectedAppeal.university}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
