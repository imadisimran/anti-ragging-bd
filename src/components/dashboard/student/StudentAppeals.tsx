"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Search,
  Filter,
  Loader2,
  X,
  AlertTriangle,
  Calendar,
  MapPin,
  ShieldAlert,
  FileText,
  Clock,
  UserCheck,
  Building
} from "lucide-react";
import Swal from "sweetalert2";
import { getMyAppeals } from "@/actions/server/student-appeals";
import { MyDetailedReport } from "@/actions/server/my-reports";

export default function StudentAppeals() {
  const [appeals, setAppeals] = useState<MyDetailedReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Detail Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MyDetailedReport | null>(null);

  // Load first page of appeals on mount or filter change
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyAppeals({
          limit: 10,
          skip: 0,
          searchQuery,
          statusFilter
        });
        if (!active) return;
        if (res.success && res.data) {
          setAppeals(res.data);
          setHasMore(res.data.length === 10);
          setTotalCount(res.total || 0);
        } else {
          setError(res.error || "Failed to load appeals data.");
        }
      } catch (err) {
        console.error(err);
        if (active) setError("An unexpected error occurred while loading appeals.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [searchQuery, statusFilter]);

  const loadMore = async () => {
    if (isScrollingLoading || !hasMore) return;
    setIsScrollingLoading(true);
    try {
      const nextSkip = appeals.length;
      const res = await getMyAppeals({
        limit: 10,
        skip: nextSkip,
        searchQuery,
        statusFilter
      });
      if (res.success && res.data) {
        setAppeals((prev) => [...prev, ...res.data!]);
        setHasMore(res.data.length === 10);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error("Error loading more appeals:", err);
    } finally {
      setIsScrollingLoading(false);
    }
  };

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current || isScrollingLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isScrollingLoading, appeals.length, searchQuery, statusFilter]);

  const handleOpenDetailModal = (report: MyDetailedReport) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Failed to Load Appeals</h3>
        <p className="text-body-md text-on-surface-variant leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
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
        <h1 className="text-display text-primary mb-2">My Appeals Queue</h1>
        <p className="text-body-md text-on-surface-variant">
          Track human review requests for reports flagged or rejected by the AI guardrails.
        </p>
      </div>

      {/* Main Appeals Table Panel */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[500px]">
        {/* Table Operations */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Appeals Directory</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review current status, AI flag details, and administrator verdicts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-outline-variant text-body-md rounded-md focus:outline-none focus:border-secondary w-full sm:w-64 placeholder-on-surface-variant/40"
                placeholder="Search by ID, type, title..."
                type="text"
              />
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-label-md font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                  statusFilter !== "All"
                    ? "border-secondary text-secondary bg-secondary-fixed/10"
                    : "border-outline text-on-surface"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Status Filter</span>
              </button>

              {/* Filters Dropdown Card */}
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant rounded-lg shadow-lg p-3 z-20 space-y-2 animate-in fade-in duration-100">
                    <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1 px-1">Filter by Status</h4>
                    {["All", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-body-md font-medium transition-all ${
                          statusFilter === st
                            ? "bg-primary text-on-primary font-bold"
                            : "hover:bg-slate-50 text-on-surface-variant"
                        }`}
                      >
                        {st === "PENDING" ? "Pending" : st === "APPROVED" ? "Approved" : st === "REJECTED" ? "Rejected" : "All Appeals"}
                      </button>
                    ))}
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
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Appeal Filed</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Incident Title</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Harassment Category</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Appeal Status</th>
                <th className="px-6 py-4 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <>
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              ) : appeals.length > 0 ? (
                <>
                  {appeals.map((report) => (
                    <tr
                      key={report.postId}
                      className="hover:bg-slate-50/50 transition-colors duration-150 group animate-in fade-in duration-200"
                    >
                      <td className="px-6 py-4 text-label-md font-bold text-primary font-mono select-all">
                        {report.postId}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
                        {report.adminVerification?.appealSubmittedAt
                          ? new Date(report.adminVerification.appealSubmittedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })
                          : new Date(report.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface font-semibold max-w-xs truncate">
                        {report.sanitizedTitle}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
                        {report.harassmentType}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${
                            report.adminVerification?.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : report.adminVerification?.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.adminVerification?.status || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetailModal(report)}
                          className="border border-primary text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded text-label-sm font-bold transition-all ml-auto cursor-pointer shadow-sm active:scale-95"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Sentinel element for infinite scroll */}
                  {hasMore && (
                    <tr ref={sentinelRef} className="hover:bg-transparent">
                      <td colSpan={6} className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-on-surface-variant font-medium">
                            Loading more appeals...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Scale className="w-8 h-8 text-on-surface-variant/40 animate-pulse" />
                      <p>No human review appeals found matching the search/filter parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scroll statistics footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-slate-50 text-label-sm font-bold text-outline">
          <span>Showing {appeals.length} of {totalCount} total appeals</span>
          {!hasMore && appeals.length > 0 && (
            <span className="text-xs text-on-surface-variant/60 font-medium italic">All appeals loaded</span>
          )}
        </div>
      </div>

      {/* Appeal Details Drawer Modal */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={handleCloseModal}></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-headline-sm font-bold text-primary">Appeal Detailed Status</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 font-mono select-all">CASE ID: {selectedReport.postId}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                selectedReport.adminVerification?.status === "APPROVED"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : selectedReport.adminVerification?.status === "REJECTED"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}>
                <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-body-md uppercase tracking-wider">
                    Verdict: {selectedReport.adminVerification?.status || "PENDING HUMAN REVIEW"}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {selectedReport.adminVerification?.status === "APPROVED"
                      ? "The appeal was approved by administration. The report has been verified as a ragging incident."
                      : selectedReport.adminVerification?.status === "REJECTED"
                      ? "The appeal was reviewed and rejected. The report will remain flagged/inactive."
                      : "An administrator has been notified. This request is queued for formal human verification."}
                  </p>
                </div>
              </div>

              {/* Incident Basics */}
              <div className="space-y-3">
                <h4 className="text-label-sm font-bold text-outline uppercase tracking-wider border-b pb-1.5">Incident Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                    <Calendar className="w-4 h-4 text-outline" />
                    <span>Incident Date: {new Date(selectedReport.dateTime).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                    <Building className="w-4 h-4 text-outline" />
                    <span>Institution: {selectedReport.university}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-md text-on-surface-variant sm:col-span-2">
                    <MapPin className="w-4 h-4 text-outline" />
                    <span>Location: {selectedReport.specificLocation}</span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="text-headline-xs font-bold text-primary">{selectedReport.sanitizedTitle}</div>
                <div className="bg-slate-50 p-4 rounded-lg border border-outline-variant/30 text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                  {selectedReport.sanitizedDescription || selectedReport.narrative}
                </div>
              </div>

              {/* AI Flags / Rejection Reason */}
              <div className="space-y-2">
                <h4 className="text-label-sm font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>AI Guardrails Detection & Rejection Reason</span>
                </h4>
                <div className="p-4 rounded-lg bg-red-50/50 border border-red-100 text-body-md text-red-900 leading-relaxed font-medium">
                  {selectedReport.rejectionReason || "Report flagged as not related to ragging incident or containing potential spam."}
                </div>
              </div>

              {/* Student Appeal Details */}
              <div className="space-y-2">
                <h4 className="text-label-sm font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Your Appeal Explanation Note</span>
                </h4>
                <div className="p-4 rounded-lg bg-blue-50/30 border border-blue-100/70 text-body-md text-on-surface leading-relaxed">
                  {selectedReport.adminVerification?.appealNote || "No appeal description provided."}
                </div>
                {selectedReport.adminVerification?.appealSubmittedAt && (
                  <div className="text-[10px] text-outline flex items-center gap-1 mt-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>Submitted: {new Date(selectedReport.adminVerification.appealSubmittedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Admin Resolution Verdict */}
              {selectedReport.adminVerification?.status !== "PENDING" && (
                <div className="space-y-2">
                  <h4 className="text-label-sm font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span>Administrator Resolution Verdict Note</span>
                  </h4>
                  <div className="p-4 rounded-lg bg-green-50/20 border border-green-100 text-body-md text-on-surface leading-relaxed font-semibold">
                    {selectedReport.adminVerification?.adminNote || "No detailed verdict summary provided."}
                  </div>
                  {selectedReport.adminVerification?.resolvedAt && (
                    <div className="text-[10px] text-outline flex items-center gap-1 mt-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>Resolved: {new Date(selectedReport.adminVerification.resolvedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 bg-primary text-on-primary font-bold text-label-md rounded hover:bg-opacity-95 cursor-pointer shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
