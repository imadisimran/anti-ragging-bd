"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Hourglass,
  Scale,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  ZoomIn,
  X,
  MapPin,
  Calendar,
  ShieldAlert,
  Users,
  ChevronDown,
  Loader2,
  AlertCircle,
  Clock
} from "lucide-react";
import Swal from "sweetalert2";
import { getAdminIncidents, getReporterBanStats, banReporter } from "@/actions/server/admin";

interface Incident {
  id: string;
  timestamp: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "NEW" | "INVESTIGATING" | "DISPUTED" | "RESOLVED" | "REJECTED" | "PENDING" | "SUBMITTED";
  location: string;
  evidenceCount: number;
  description: string;
  verificationImage: string;
  assignedInvestigator?: string;
  disputeReason?: string;
  isRaggingIncident?: boolean;
  rejectionReason?: string | null;
  adminVerification?: any;
}

export default function AdminDashboardHome() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // DB status loader state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation / Ban states
  const [banHistoryCount, setBanHistoryCount] = useState<number>(0);
  const [banReason, setBanReason] = useState<string>("");
  const [banDuration, setBanDuration] = useState<"3" | "6" | "permanent">("3");
  const [processingModeration, setProcessingModeration] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    try {
      const res = await getAdminIncidents();
      if (res.success && res.data) {
        setIncidents(res.data as Incident[]);
      } else {
        setError(res.error || "Failed to load incidents data.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching incidents.");
    } finally {
      setLoading(false);
    }
  };

  // Load incidents on mount
  useEffect(() => {
    loadData();
  }, []);

  // Retrieve suspension count when selected incident details change
  useEffect(() => {
    if (selectedIncident) {
      setProcessingModeration(true);
      getReporterBanStats(selectedIncident.id).then((res) => {
        if (res.success && res.banHistoryCount !== undefined) {
          setBanHistoryCount(res.banHistoryCount);
        }
        setProcessingModeration(false);
      });
      setBanReason("");
      setBanDuration("3");
    }
  }, [selectedIncident]);

  const handleBanStudentClick = async () => {
    if (!selectedIncident) return;
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
          const res = await banReporter(selectedIncident.id, banDuration, banReason);
          if (res.success) {
            Swal.fire({
              title: "Student Suspended",
              text: res.message || "Reporter suspended successfully.",
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
            });
            getReporterBanStats(selectedIncident.id).then((res) => {
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

  // Impact Card metrics calculations
  const totalPending = incidents.filter((i) => i.status === "PENDING").length;
  const totalInvestigating = incidents.filter((i) => i.status === "INVESTIGATING").length;
  const totalDisputed = incidents.filter((i) => i.status === "DISPUTED").length;
  const totalResolved = incidents.filter((i) => i.status === "RESOLVED").length;
  const responseScore = incidents.length
    ? Math.round(((totalResolved + totalInvestigating) / incidents.length) * 100)
    : 0;

  // Filtered incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || incident.priority === priorityFilter;

    let matchesStatus = false;
    if (statusFilter === "All") {
      matchesStatus = incident.isRaggingIncident === true;
    } else {
      matchesStatus = incident.status === statusFilter;
    }

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Paginated incidents
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Adjust page number if filtered list shrinks
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredIncidents.length, totalPages, currentPage]);

  const handleRowClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsZoomed(false);
  };

  // Keyboard close modal support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Actions
  const handleOpenInvestigation = (incidentId: string) => {
    Swal.fire({
      title: "Initiate Investigation?",
      text: `Do you want to open a formal investigation for case ${incidentId}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, start investigation",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-secondary, #0051d5)",
    }).then((result) => {
      if (result.isConfirmed) {
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incidentId ? { ...i, status: "INVESTIGATING" } : i
          )
        );
        if (selectedIncident && selectedIncident.id === incidentId) {
          setSelectedIncident((prev) =>
            prev ? { ...prev, status: "INVESTIGATING" } : null
          );
        }
        Swal.fire({
          title: "Investigation Commenced",
          text: `Case ${incidentId} is now under active investigation.`,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  const handleAssignTeam = (incidentId: string) => {
    Swal.fire({
      title: "Assign Investigator",
      input: "select",
      inputOptions: {
        "Dr. Syed Rafiq": "Dr. Syed Rafiq (Dean of Student Affairs)",
        "Prof. Dr. M. A. Latif": "Prof. Dr. M. A. Latif (Hall Provost)",
        "Mrs. Nasrin Akter": "Mrs. Nasrin Akter (Proctoral Body)",
        "Major (Retd.) Rafiqul Islam": "Major (Retd.) Rafiqul Islam (Chief Security Officer)"
      },
      inputPlaceholder: "Select an investigator",
      showCancelButton: true,
      confirmButtonText: "Assign",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-secondary, #0051d5)",
      inputValidator: (value) => {
        if (!value) {
          return "You need to select an investigator!";
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const investigatorName = result.value;
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incidentId
              ? { ...i, status: "INVESTIGATING", assignedInvestigator: investigatorName }
              : i
          )
        );
        if (selectedIncident && selectedIncident.id === incidentId) {
          setSelectedIncident((prev) =>
            prev
              ? {
                  ...prev,
                  status: "INVESTIGATING",
                  assignedInvestigator: investigatorName,
                }
              : null
          );
        }
        Swal.fire({
          title: "Investigator Assigned",
          text: `${investigatorName} has been assigned to Case ${incidentId}.`,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  const handleFlagDispute = (incidentId: string) => {
    Swal.fire({
      title: "Flag Dispute",
      input: "textarea",
      inputLabel: "Dispute Reason / Details",
      inputPlaceholder: "Explain why this case is disputed...",
      inputAttributes: {
        "aria-label": "Explain why this case is disputed"
      },
      showCancelButton: true,
      confirmButtonText: "Flag Dispute",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-error, #ba1a1a)",
      inputValidator: (value) => {
        if (!value) {
          return "Please provide a reason for the dispute!";
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const reason = result.value;
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incidentId
              ? { ...i, status: "DISPUTED", disputeReason: reason }
              : i
          )
        );
        if (selectedIncident && selectedIncident.id === incidentId) {
          setSelectedIncident((prev) =>
            prev ? { ...prev, status: "DISPUTED", disputeReason: reason } : null
          );
        }
        Swal.fire({
          title: "Case Disputed",
          text: `Case ${incidentId} has been marked as disputed.`,
          icon: "warning",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-body-md text-on-surface-variant font-medium">Loading command center dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Failed to Load Dashboard</h3>
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
      {/* Welcome Header */}
      <header className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Faculty & Authorities Command Center</h1>
        <p className="text-body-md text-on-surface-variant">
          System oversight, real-time incident tracking, and institutional enforcement pipelines.
        </p>
      </header>

      {/* 1. Top Metric Cards (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        {/* Pending Incidents */}
        <div 
          onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
          className={`bg-white border-l-[6px] border-l-error border border-outline-variant p-5 rounded-lg shadow-sm hover:border-error transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${statusFilter === "PENDING" ? "ring-2 ring-error/50 bg-red-50/10" : ""}`}
        >
          <div className="flex justify-between items-start mb-2">
            <ShieldAlert className="w-5 h-5 text-error group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-error bg-red-100/50 px-2 py-0.5 rounded">PENDING</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{totalPending}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Pending Incidents</p>
        </div>

        {/* Active Investigations */}
        <div 
          onClick={() => { setStatusFilter("INVESTIGATING"); setCurrentPage(1); }}
          className={`bg-white border-l-[6px] border-l-amber-500 border border-outline-variant p-5 rounded-lg shadow-sm hover:border-amber-500 transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${statusFilter === "INVESTIGATING" ? "ring-2 ring-amber-500/50 bg-amber-50/10" : ""}`}
        >
          <div className="flex justify-between items-start mb-2">
            <Hourglass className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded">IN PROGRESS</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{totalInvestigating}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Active Investigations</p>
        </div>

        {/* Disputed Claims */}
        <div 
          onClick={() => { setStatusFilter("DISPUTED"); setCurrentPage(1); }}
          className={`bg-white border-l-[6px] border-l-rose-700 border border-outline-variant p-5 rounded-lg shadow-sm hover:border-rose-700 transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${statusFilter === "DISPUTED" ? "ring-2 ring-rose-700/50 bg-rose-50/10" : ""}`}
        >
          <div className="flex justify-between items-start mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-700 group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-rose-700 bg-red-100/50 px-2 py-0.5 rounded font-black">DISPUTED</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{totalDisputed.toString().padStart(2, "0")}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Disputed Claims</p>
        </div>

        {/* Response Score */}
        <div 
          onClick={() => { setStatusFilter("All"); setPriorityFilter("All"); setSearchQuery(""); setCurrentPage(1); }}
          className="bg-white border-l-[6px] border-l-green-600 border border-outline-variant p-5 rounded-lg shadow-sm hover:border-green-600 transition-all group cursor-pointer hover:-translate-y-0.5 duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-green-600 bg-green-100/50 px-2 py-0.5 rounded">OPTIMAL</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{responseScore}%</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Response Score</p>
        </div>
      </div>

      {/* 2. Main Data Table Container */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[500px]">
        {/* Table Operations Header */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Global Incident Log</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Showing active, resolved, and disputed safety complaints.
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
                placeholder="Search Incident Log..."
                type="text"
              />
            </div>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-label-md font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                  priorityFilter !== "All" || statusFilter !== "All"
                    ? "border-secondary text-secondary bg-secondary-fixed/10"
                    : "border-outline text-on-surface"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {showFilterDropdown ? <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" /> : <ChevronDown className="w-3.5 h-3.5 transition-transform" />}
              </button>

              {/* Filters Dropdown Card */}
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-outline-variant rounded-lg shadow-lg p-4 z-20 space-y-4 animate-in fade-in duration-100">
                    <div>
                      <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Priority</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "High", "Medium", "Low"].map((p) => (
                          <button
                            key={p}
                            onClick={() => { setPriorityFilter(p); setCurrentPage(1); }}
                            className={`px-3 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${
                              priorityFilter === p
                                ? "bg-primary text-white border-primary"
                                : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "PENDING", "INVESTIGATING", "DISPUTED", "RESOLVED", "REJECTED"].map((s) => (
                          <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${
                              statusFilter === s
                                ? "bg-secondary text-white border-secondary"
                                : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex justify-between">
                      <button
                        onClick={() => {
                          setPriorityFilter("All");
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
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Incident ID</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginatedIncidents.length > 0 ? (
                paginatedIncidents.map((incident) => {
                  const isHigh = incident.priority === "High";
                  const isMedium = incident.priority === "Medium";

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => handleRowClick(incident)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 text-label-md font-bold text-primary group-hover:text-secondary transition-colors">
                        {incident.id}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {incident.timestamp}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-body-md text-on-surface font-semibold">{incident.category}</span>
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
                          {incident.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(incident.status === "PENDING" || incident.status === "NEW" || incident.status === "SUBMITTED") && (
                            <>
                              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                              <span className="text-label-sm text-amber-600 font-bold uppercase tracking-wider">PENDING</span>
                            </>
                          )}
                          {incident.status === "INVESTIGATING" && (
                            <>
                              <Hourglass className="w-4 h-4 text-amber-600" />
                              <span className="text-label-sm text-amber-600 font-bold uppercase tracking-wider">INVESTIGATING</span>
                            </>
                          )}
                          {incident.status === "DISPUTED" && (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-700" />
                              <span className="text-label-sm text-rose-700 font-bold uppercase tracking-wider">DISPUTED</span>
                            </>
                          )}
                          {incident.status === "RESOLVED" && (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-700" />
                              <span className="text-label-sm text-green-700 font-bold uppercase tracking-wider">RESOLVED</span>
                            </>
                          )}
                          {incident.status === "REJECTED" && (
                            <>
                              <AlertCircle className="w-4 h-4 text-error" />
                              <span className="text-label-sm text-error font-bold uppercase tracking-wider">REJECTED</span>
                            </>
                          )}
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
                      <AlertTriangle className="w-8 h-8 text-on-surface-variant/40" />
                      <p>No incidents match the search criteria or selected filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setPriorityFilter("All");
                          setStatusFilter("All");
                        }}
                        className="text-secondary font-bold hover:underline text-xs mt-1"
                      >
                        Reset search queries
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
              Showing {Math.min(filteredIncidents.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredIncidents.length, currentPage * itemsPerPage)} of {filteredIncidents.length} reports
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-outline rounded bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-on-surface cursor-pointer flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
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
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {isModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={handleCloseModal}></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Reference ID</span>
                <span className="text-headline-md font-extrabold text-primary">{selectedIncident.id}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                    selectedIncident.priority === "High"
                      ? "bg-error-container/50 text-error border border-error/20"
                      : selectedIncident.priority === "Medium"
                      ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                      : "bg-slate-100 text-on-surface-variant border border-slate-200"
                  }`}
                >
                  {selectedIncident.priority} PRIORITY
                </span>
                
                {(selectedIncident.status === "PENDING" || selectedIncident.status === "NEW" || selectedIncident.status === "SUBMITTED") && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    PENDING
                  </span>
                )}
                {selectedIncident.status === "INVESTIGATING" && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <Hourglass className="w-3.5 h-3.5" />
                    INVESTIGATING
                  </span>
                )}
                {selectedIncident.status === "DISPUTED" && (
                  <span className="bg-rose-700 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    DISPUTED
                  </span>
                )}
                {selectedIncident.status === "RESOLVED" && (
                  <span className="bg-green-700 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    RESOLVED
                  </span>
                )}
                {selectedIncident.status === "REJECTED" && (
                  <span className="bg-error text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    REJECTED
                  </span>
                )}
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
                
                {/* Left Side: Metadata and Evidence Details */}
                <div className="md:col-span-1 space-y-6">
                  {/* Location Info Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-on-surface-variant" />
                      <span>Incident Location</span>
                    </div>
                    <p className="text-body-lg font-bold text-on-surface">{selectedIncident.location}</p>
                  </div>

                  {/* Timestamp Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-on-surface-variant" />
                      <span>Report Timestamp</span>
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">{selectedIncident.timestamp}</p>
                  </div>

                  {/* Evidence Card */}
                  <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
                      <Paperclip className="w-4 h-4 text-on-surface-variant" />
                      <span>Evidence Attachments</span>
                    </div>
                    {selectedIncident.evidenceCount > 0 ? (
                      <div className="space-y-2">
                        <p className="text-label-md font-bold text-secondary flex items-center gap-1.5">
                          <span>{selectedIncident.evidenceCount} Files Attached</span>
                        </p>
                        <ul className="text-xs text-on-surface-variant space-y-1 pl-1">
                          {Array.from({ length: selectedIncident.evidenceCount }).map((_, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 hover:text-primary hover:underline cursor-pointer">
                              <Paperclip className="w-3 h-3 text-outline" />
                              <span>verification_proof_0{idx + 1}.jpg</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-body-md text-on-surface-variant italic">No files attached to report.</p>
                    )}
                  </div>

                  {/* Investigator Card */}
                  {selectedIncident.assignedInvestigator && (
                    <div className="p-4 bg-secondary-fixed/15 border border-secondary/20 rounded-lg space-y-3">
                      <div className="flex items-center gap-2 text-secondary text-label-sm font-bold uppercase tracking-wider">
                        <Users className="w-4 h-4" />
                        <span>Assigned Investigator</span>
                      </div>
                      <p className="text-body-lg font-bold text-on-secondary-fixed-variant">
                        {selectedIncident.assignedInvestigator}
                      </p>
                    </div>
                  )}

                  {/* Dispute Reason Card */}
                  {selectedIncident.status === "DISPUTED" && selectedIncident.disputeReason && (
                    <div className="p-4 bg-red-50 border border-error/20 rounded-lg space-y-3">
                      <div className="flex items-center gap-2 text-error text-label-sm font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Dispute Details</span>
                      </div>
                      <p className="text-body-md text-on-error-container italic leading-relaxed">
                        &quot;{selectedIncident.disputeReason}&quot;
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

                {/* Right Side: Description and Camera verification */}
                <div className="md:col-span-2 space-y-6">
                  {/* Category Banner */}
                  <div>
                    <span className="text-label-sm font-bold text-outline uppercase tracking-wider">Incident Category</span>
                    <h3 className="text-headline-md font-bold text-primary mt-1">{selectedIncident.category}</h3>
                  </div>

                  {/* Appeal Status Information (Read-only reference) */}
                  {selectedIncident.adminVerification?.isRequested && (
                    <div className="p-5 bg-amber-50/50 border border-amber-200/50 rounded-lg space-y-3 animate-fade-in">
                      <div>
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">AI Moderation Trigger</span>
                        <p className="text-body-md text-on-surface-variant leading-relaxed">
                          AI Rejection Reason: <span className="font-semibold italic text-red-700">"{selectedIncident.rejectionReason || 'No specific flag description recorded'}"</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Student Human Review Appeal Note</span>
                        <p className="text-body-md text-on-surface font-semibold leading-relaxed italic bg-white p-3 border border-amber-200/30 rounded">
                          &quot;{selectedIncident.adminVerification.appealNote}&quot;
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-outline uppercase tracking-wider block mb-1">Appeal Decision Status</span>
                        <div className={`inline-block px-3 py-1 rounded text-label-sm font-bold uppercase tracking-wider ${
                          selectedIncident.adminVerification.status === "APPROVED" ? "bg-green-100 text-green-800" : selectedIncident.adminVerification.status === "PENDING" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-red-100 text-red-800"
                        }`}>
                          Appeal {selectedIncident.adminVerification.status}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description Box */}
                  <div>
                    <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-2">Detailed Narrative</p>
                    <div className="p-5 bg-slate-50 border-l-4 border-primary rounded-r-lg text-body-lg text-on-surface leading-relaxed italic">
                      &quot;{selectedIncident.description}&quot;
                    </div>
                  </div>

                  {/* Verification Proof Image preview */}
                  <div>
                    <p className="text-label-sm font-bold text-outline uppercase tracking-wider mb-3">Verification Video/Image Proof</p>
                    <div
                      onClick={() => setIsZoomed(true)}
                      className="relative group cursor-pointer border border-outline-variant h-64 rounded-lg overflow-hidden shadow-sm"
                    >
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        alt="Grainy CCTV security monitoring capture in hallway"
                        src={selectedIncident.verificationImage}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white/90 text-primary px-4 py-2 font-bold text-label-md flex items-center gap-2 rounded shadow">
                          <ZoomIn className="w-4 h-4" />
                          Zoom and Analyze Proof
                        </span>
                      </div>
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
              
              <div className="flex flex-wrap justify-end gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleFlagDispute(selectedIncident.id)}
                  className="px-4 py-2.5 border border-error text-error font-bold text-label-md rounded hover:bg-red-50 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  Flag Dispute
                </button>
                <button
                  onClick={() => handleAssignTeam(selectedIncident.id)}
                  className="px-4 py-2.5 border border-outline text-on-surface font-bold text-label-md rounded hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  Assign Investigator
                </button>
                {selectedIncident.status !== "RESOLVED" && (
                  <button
                    onClick={() => handleOpenInvestigation(selectedIncident.id)}
                    className="px-5 py-2.5 bg-primary text-on-primary font-bold text-label-md rounded hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    {(selectedIncident.status === "PENDING" || selectedIncident.status === "NEW" || selectedIncident.status === "SUBMITTED") ? "Open Formal Investigation" : "Progress Investigation"}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {isZoomed && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-150">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Close Zoom"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full max-h-[85vh] relative flex flex-col items-center justify-center">
            <img
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10 shadow-2xl"
              alt="Zoomed surveillance capture"
              src={selectedIncident.verificationImage}
            />
            <p className="text-white/60 text-xs font-semibold mt-4 text-center">
              Surveillance Camera Feed Extract - Ref ID: {selectedIncident.id} - Location: {selectedIncident.location}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
