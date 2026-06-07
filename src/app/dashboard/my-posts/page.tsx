"use client";

import React, { useState, useEffect } from "react";
import { 
  Filter, 
  ChevronDown, 
  Loader2, 
  FileText, 
  AlertCircle, 
  Info
} from "lucide-react";
import { getMyDetailedReports, MyDetailedReport } from "@/actions/server/my-reports";
import MyReportCard from "@/components/dashboard/my-posts/MyReportCard";

export default function MyPostsPage() {
  const [reports, setReports] = useState<MyDetailedReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  
  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load reports on mount
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await getMyDetailedReports();
        if (res.success && res.data) {
          setReports(res.data);
        } else {
          setError(res.error || "Failed to load reports.");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching reports.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Show temporary toast feedback
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  // Helper to determine status category for filtering
  const getStatusCategory = (report: MyDetailedReport): string => {
    if (report.isRaggingIncident === false) {
      return "rejected";
    }
    if (report.status === "DISPUTED" || (report.adminVerification && report.adminVerification.status === "REJECTED")) {
      return "disputed";
    }
    if (report.status === "RESOLVED" || report.status === "APPROVED") {
      return "resolved";
    }
    return "investigating";
  };

  // Filter reports list based on active filter criteria
  const filteredReports = reports.filter((report) => {
    if (statusFilter === "all") return true;
    return getStatusCategory(report) === statusFilter;
  });

  const getFilterLabel = (filterValue: string) => {
    switch (filterValue) {
      case "investigating": return "Under Investigation";
      case "rejected": return "AI Rejected";
      case "disputed": return "Disputed";
      case "resolved": return "Resolved";
      default: return "All Statuses";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-body-md text-on-surface-variant font-medium">Loading your whistleblower reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Failed to Load Reports</h3>
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
    <div className="max-w-[900px] mx-auto space-y-8">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display text-primary mb-1">Public Ledger</h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            Managing your submitted reports and institutional accountability threads.
          </p>
        </div>
        
        {/* Status Dropdown Filter */}
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="bg-white border border-outline-variant px-4 py-2 rounded text-label-md font-bold flex items-center gap-2 hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm min-w-[180px] justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-[18px] h-[18px] text-on-surface-variant" />
              <span>{getFilterLabel(statusFilter)}</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-outline-variant rounded-md shadow-lg py-1 w-full z-50 animate-fade-in">
              {["all", "investigating", "rejected", "disputed", "resolved"].map((filterOpt) => (
                <button
                  key={filterOpt}
                  onClick={() => {
                    setStatusFilter(filterOpt);
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-label-sm font-semibold hover:bg-surface-container transition-colors ${
                    statusFilter === filterOpt ? "text-primary bg-primary/5" : "text-on-surface-variant"
                  }`}
                >
                  {getFilterLabel(filterOpt)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thread List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-outline-variant rounded-xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-headline-md font-bold text-primary">No Reports Found</h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {statusFilter === "all"
              ? "You have not submitted any whistleblower reports yet."
              : `No reports match the "${getFilterLabel(statusFilter)}" filter.`}
          </p>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="bg-primary text-on-primary px-4 py-2 rounded text-label-md font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <MyReportCard 
              key={report.postId} 
              report={report} 
              showToast={showToast} 
            />
          ))}
        </div>
      )}

      {/* Contextual Toast Notification popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-6 py-4 shadow-xl transition-all duration-300 flex items-center gap-3 z-[60] rounded-lg border border-primary-container animate-slide-up">
          <Info className="w-5 h-5 text-white" />
          <span className="text-label-md font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
