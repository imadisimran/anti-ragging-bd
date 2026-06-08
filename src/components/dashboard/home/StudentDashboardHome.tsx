"use client";

import React, { useState, useEffect } from "react";
import { 
  Folder, 
  Gavel, 
  CheckCircle, 
  Hourglass, 
  Scale, 
  AlertCircle, 
  ChevronRight,
  ArrowUp,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { getStudentReports, getStudentReportDetail, StudentReport } from "@/actions/server/dashboard";
import StudentReportModal from "@/components/modal/StudentReportModal";

export default function StudentDashboardHome() {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const res = await getStudentReports();
        if (res.success && res.data) {
          setReports(res.data);
        } else {
          setError(res.error || "Failed to load reports.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading reports.");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Dynamic Metric Cards Calculations
  const totalReportsCount = reports.length;

  const activeCasesCount = reports.filter(r => 
    r.isRaggingIncident && ["PENDING", "INVESTIGATING", "SUBMITTED"].includes(r.status.toUpperCase())
  ).length;

  const resolvedCount = reports.filter(r => 
    ["RESOLVED", "APPROVED", "VERIFIED"].includes(r.status.toUpperCase())
  ).length;

  const resolvedPct = totalReportsCount > 0 
    ? Math.round((resolvedCount / totalReportsCount) * 100) 
    : 0;

  const criticalActiveCount = reports.filter(r => 
    r.isRaggingIncident &&
    ["PENDING", "INVESTIGATING", "SUBMITTED"].includes(r.status.toUpperCase()) && 
    r.detectedSeverity.toUpperCase() === "HIGH"
  ).length;

  const handleRowClick = async (report: StudentReport) => {
    try {
      const res = await getStudentReportDetail(report.postId);
      if (res.success && res.data) {
        setSelectedReport(res.data);
      } else {
        setSelectedReport(report);
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setSelectedReport(report);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };



  const getDisplayStatus = (report: StudentReport) => {
    if (!report.isRaggingIncident) return "REJECTED";
    return report.status.toUpperCase();
  };

  // Filters logic
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.postId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.harassmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.sanitizedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.sanitizedDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === "All" || report.detectedSeverity.toUpperCase() === severityFilter.toUpperCase();

    const matchesStatus =
      statusFilter === "All" || getDisplayStatus(report) === statusFilter.toUpperCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


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

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <header className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Student Safety Dashboard</h1>
        <p className="text-body-md text-on-surface-variant">
          System oversight, personal reports log, and institutional accountability metrics.
        </p>
      </header>

      {/* 1. Top Metric Cards (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-stack-lg">
        
        {/* Total Reports */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Total Reports</span>
            <Folder className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">{totalReportsCount}</div>
          <div className="flex items-center gap-1 text-green-600 mt-2">
            <ArrowUp className="w-4 h-4" />
            {/* NOTE: Trend indicator is kept static per design specs */}
            <span className="text-xs font-bold">+12% from last month</span>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Active Cases</span>
            <Gavel className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">{activeCasesCount}</div>
          <div className="flex items-center gap-1 text-on-surface-variant mt-2">
            <Hourglass className="w-3.5 h-3.5" />
            <span className="text-xs font-bold ml-1">{criticalActiveCount} critical priority</span>
          </div>
        </div>

        {/* Resolved percentage */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Resolved</span>
            <CheckCircle className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">{resolvedPct}%</div>
          {/* NOTE: Resolution average is kept static per design specs */}
          <div className="flex items-center gap-1 text-on-surface-variant mt-2 text-xs font-bold">
            Average resolution: 4.2 days
          </div>
        </div>

      </div>

      {/* 2. My Submitted Reports Table */}
      <div className="bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">My Submitted Reports</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Track status, category classification, and AI/Admin verification of your submitted cases.
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
                placeholder="Search my reports..."
                type="text"
              />
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-label-md font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                  severityFilter !== "All" || statusFilter !== "All"
                    ? "border-secondary text-secondary bg-secondary-fixed/10"
                    : "border-outline text-on-surface"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilterDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Filters Dropdown Card */}
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-outline-variant rounded-lg shadow-lg p-4 z-20 space-y-4 animate-in fade-in duration-100">
                    <div>
                      <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Severity</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "High", "Medium", "Low"].map((sev) => (
                          <button
                            key={sev}
                            onClick={() => { setSeverityFilter(sev); setCurrentPage(1); }}
                            className={`px-3 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${
                              severityFilter.toUpperCase() === sev.toUpperCase()
                                ? "bg-primary text-white border-primary"
                                : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                            }`}
                          >
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "SUBMITTED", "PENDING", "INVESTIGATING", "RESOLVED", "REJECTED"].map((stat) => (
                          <button
                            key={stat}
                            onClick={() => { setStatusFilter(stat); setCurrentPage(1); }}
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${
                              statusFilter.toUpperCase() === stat.toUpperCase()
                                ? "bg-secondary text-white border-secondary"
                                : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                            }`}
                          >
                            {stat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex justify-between">
                      <button
                        onClick={() => {
                          setSeverityFilter("All");
                          setStatusFilter("All");
                          setCurrentPage(1);
                          setShowFilterDropdown(false);
                        }}
                        className="text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => setShowFilterDropdown(false)}
                        className="text-xs text-secondary font-bold hover:underline cursor-pointer"
                      >
                        Apply Filters
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
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Date Reported</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Hourglass className="w-8 h-8 animate-spin text-secondary" />
                      <p>Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-error font-body-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-error" />
                      <p>{error}</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedReports.length > 0 ? (
                paginatedReports.map((report) => {
                  const isHigh = report.detectedSeverity.toUpperCase() === "HIGH";
                  const isMedium = report.detectedSeverity.toUpperCase() === "MEDIUM";

                  return (
                    <tr
                      key={report.postId}
                      onClick={() => handleRowClick(report)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 text-label-md font-bold text-primary group-hover:text-secondary transition-colors">
                        #{report.postId}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {formatYYYYMMDD(report.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-body-md text-on-surface font-semibold line-clamp-1">{report.sanitizedTitle || "Untitled Report"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider inline-block ${
                            isHigh
                              ? "bg-error-container/50 text-error border border-error/20"
                              : isMedium
                              ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                              : "bg-slate-100 text-on-surface-variant border border-slate-200"
                          }`}
                        >
                          {report.detectedSeverity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`px-2.5 py-1 rounded uppercase tracking-wider text-[10px] font-bold inline-flex items-center gap-1.5 ${getStatusBadgeConfig(report.status, report.isRaggingIncident).bgClass}`}>
                          {getStatusBadgeConfig(report.status, report.isRaggingIncident).icon}
                          {getStatusBadgeConfig(report.status, report.isRaggingIncident).label}
                        </div>
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
                      <p>You have not submitted any reports matching the selected filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSeverityFilter("All");
                          setStatusFilter("All");
                        }}
                        className="text-secondary font-bold hover:underline text-xs mt-1"
                      >
                        Reset search filters
                      </button>
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
              Showing {Math.min(filteredReports.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredReports.length, currentPage * itemsPerPage)} of {filteredReports.length} reports
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
                  className={`px-3 py-1.5 border rounded cursor-pointer transition-colors ${
                    currentPage === i + 1
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

      <StudentReportModal
        isOpen={isModalOpen}
        report={selectedReport}
        onClose={handleCloseModal}
      />

    </div>
  );
}
