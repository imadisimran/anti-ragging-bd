"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Hourglass,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { getAdminIncidents } from "@/actions/server/admin";
import StatusBadge from "@/components/badge/StatusConfigBadge";
import PriorityBadge from "@/components/badge/PriorityConfigBadge";
import AdminIncidentModal, { Incident } from "@/components/modal/AdminIncidentModal";


export default function AdminDashboardHome() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // DB status loader state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;



  // Load incidents on mount
  useEffect(() => {
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
    loadData();
  }, []);




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
      <div className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Admin Command Center</h1>
        <p className="text-body-md text-on-surface-variant">
          System oversight, real-time incident tracking, and institutional enforcement pipelines.
        </p>
      </div>

      {/* 1. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Pending Incidents */}
        <div
          onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
          className={`bg-white border-l-[6px] border-l-error border border-outline-variant p-5 rounded-lg shadow-sm hover:border-error transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${statusFilter === "PENDING" ? "ring-5 ring-error/50 bg-red-50/10" : ""}`}
        >
          <div className="flex justify-between items-start mb-2">
            <ShieldAlert className="w-5 h-5 text-error group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-error bg-red-100/50 px-2 py-0.5 rounded">PENDING</span>
          </div>
          <p className="text-display font-display text-primary mt-2">0</p>
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
          <p className="text-display font-display text-primary mt-2">0</p>
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
          <p className="text-display font-display text-primary mt-2">0</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Disputed Claims</p>
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
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-label-md font-bold transition-all hover:bg-slate-50 cursor-pointer ${priorityFilter !== "All" || statusFilter !== "All"
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
                            className={`px-3 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${priorityFilter === p
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
                        {["All", "PENDING", "INVESTIGATING", "DISPUTED", "RESOLVED"].map((s) => (
                          <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold border cursor-pointer transition-all ${statusFilter === s
                              ? "bg-secondary text-white border-secondary"
                              : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset button for filters */}

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

                      {/* Apply button for filters */}

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
                        <span className="text-body-md text-on-surface font-semibold">{incident.category.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={incident.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={incident.status} />
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
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminIncidentModal
        isOpen={isModalOpen}
        incident={selectedIncident}
        onClose={handleCloseModal}
        onUpdateIncident={(updatedIncident) => {
          setIncidents((prev) =>
            prev.map((i) => (i.id === updatedIncident.id ? updatedIncident : i))
          );
          setSelectedIncident(updatedIncident);
        }}
      />
    </div>
  );
}
