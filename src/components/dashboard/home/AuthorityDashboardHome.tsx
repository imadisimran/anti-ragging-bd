"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Hourglass,
  Scale,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getAuthorityIncidents, BriefAuthorityIncident } from "@/actions/server/authority";
import PriorityBadge from "@/components/badge/PriorityConfigBadge";

export default function AuthorityDashboardHome() {
  const router = useRouter();
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<BriefAuthorityIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Stats Metrics
  const [stats, setStats] = useState({
    pendingMyReview: 0,
    investigating: 0,
    totalJurisdiction: 0
  });

  // Load first page on filters change
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuthorityIncidents({
          limit: 5,
          skip: 0,
          searchQuery,
          priorityFilter,
          statusFilter
        });
        if (!active) return;
        if (res.success && res.data) {
          setIncidents(res.data);
          setHasMore(res.data.length === 5);
          setTotalCount(res.total || 0);
        } else {
          setError(res.error || "Failed to load incidents.");
        }
      } catch (err: any) {
        console.error(err);
        if (active) setError(err.message || "An unexpected error occurred.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [searchQuery, priorityFilter, statusFilter]);

  // Load stats counts
  useEffect(() => {
    // Queries to calculate metrics counts
    getAuthorityIncidents({ limit: 1, skip: 0, statusFilter: "Awaiting My Review" }).then((res) => {
      if (res.success) {
        getAuthorityIncidents({ limit: 1, skip: 0, statusFilter: "INVESTIGATING" }).then((iRes) => {
          getAuthorityIncidents({ limit: 1, skip: 0, statusFilter: "All" }).then((tRes) => {
            setStats({
              pendingMyReview: res.total || 0,
              investigating: iRes.total || 0,
              totalJurisdiction: tRes.total || 0
            });
          });
        });
      }
    });
  }, [incidents.length]);

  const loadMore = async () => {
    if (isScrollingLoading || !hasMore) return;
    setIsScrollingLoading(true);
    try {
      const nextSkip = incidents.length;
      const res = await getAuthorityIncidents({
        limit: 5,
        skip: nextSkip,
        searchQuery,
        priorityFilter,
        statusFilter
      });
      if (res.success && res.data) {
        setIncidents((prev) => [...prev, ...res.data!]);
        setHasMore(res.data.length === 5);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScrollingLoading(false);
    }
  };

  // Intersection Observer
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
  }, [hasMore, isScrollingLoading, incidents.length, searchQuery, priorityFilter, statusFilter]);

  const handleRowClick = (postId: string) => {
    router.push(`/dashboard/reports/${postId}`);
  };

  // Helper to render member-specific review stances
  const renderStancePills = (reviews: any[]) => {
    const roles = ["Provost", "Warden", "GS", "Hall VP"];
    return (
      <div className="flex flex-wrap gap-1.5">
        {roles.map((role) => {
          const review = reviews.find((r) => r.designation.toLowerCase().includes(role.toLowerCase()));
          if (!review) {
            return (
              <span key={role} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200/50 font-bold uppercase">
                {role}: Pending
              </span>
            );
          }
          const status = review.status;
          let color = "bg-amber-50 text-amber-700 border-amber-200";
          if (status === "RESOLVED") color = "bg-green-50 text-green-700 border-green-200";
          else if (status === "FAKE") color = "bg-red-50 text-red-700 border-red-200";

          return (
            <span key={role} className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${color}`} title={`${review.name}: "${review.comment}"`}>
              {role}: {status}
            </span>
          );
        })}
      </div>
    );
  };

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
        <h1 className="text-display text-primary mb-2">Authority Command Center</h1>
        <p className="text-body-md text-on-surface-variant">
          Collaborative review panel, live local jurisdiction telemetry, and student grievance resolution pipeline.
        </p>
      </div>

      {/* 1. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Awaiting Review */}
        <div
          onClick={() => setStatusFilter("Awaiting My Review")}
          className={`bg-white border-l-[6px] border-l-error border border-outline-variant p-5 rounded-lg shadow-sm hover:border-error transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${
            statusFilter === "Awaiting My Review" ? "ring-5 ring-error/50 bg-red-50/10" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <ShieldAlert className="w-5 h-5 text-error group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-error bg-red-100/50 px-2 py-0.5 rounded">REQUIRED</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{stats.pendingMyReview}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Awaiting My Review</p>
        </div>

        {/* Active Investigations */}
        <div
          onClick={() => setStatusFilter("INVESTIGATING")}
          className={`bg-white border-l-[6px] border-l-amber-500 border border-outline-variant p-5 rounded-lg shadow-sm hover:border-amber-500 transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${
            statusFilter === "INVESTIGATING" ? "ring-5 ring-amber-500/50 bg-amber-50/10" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <Hourglass className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded">IN PROGRESS</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{stats.investigating}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Active Inquiries</p>
        </div>

        {/* Total Jurisdiction */}
        <div
          onClick={() => setStatusFilter("All")}
          className={`bg-white border-l-[6px] border-l-primary border border-outline-variant p-5 rounded-lg shadow-sm hover:border-primary transition-all group cursor-pointer hover:-translate-y-0.5 duration-200 ${
            statusFilter === "All" ? "ring-5 ring-primary/50 bg-slate-50/10" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <ClipboardList className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-label-sm font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded">TOTAL</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{stats.totalJurisdiction}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Total Jurisdiction Cases</p>
        </div>
      </div>

      {/* 2. Incident Log Data Table */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[500px]">
        {/* Table Operations Header */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Local Jurisdiction Log</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Showing reports matching your university and residential hall/hostel oversight scope.
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
                placeholder="Search local logs..."
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
                <span>Filters</span>
              </button>

              {/* Filters Dropdown */}
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
                            onClick={() => setPriorityFilter(p)}
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
                      <h4 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Assessment Filter</h4>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { key: "All", label: "All Cases" },
                          { key: "Awaiting My Review", label: "Awaiting My Review" },
                          { key: "INVESTIGATING", label: "In Investigation" },
                          { key: "FAKE", label: "Marked Fake" },
                          { key: "RESOLVED", label: "Marked Resolved" }
                        ].map((s) => (
                          <button
                            key={s.key}
                            onClick={() => {
                              setStatusFilter(s.key);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs rounded font-semibold border cursor-pointer transition-all ${
                              statusFilter === s.key
                                ? "bg-secondary text-white border-secondary"
                                : "bg-slate-50 text-on-surface-variant border-outline-variant hover:bg-slate-100"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex justify-between">
                      <button
                        onClick={() => {
                          setPriorityFilter("All");
                          setStatusFilter("All");
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
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Board Assessment Checklist (Option C)</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <>
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-48"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-5 bg-slate-200 rounded w-5 ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              ) : incidents.length > 0 ? (
                <>
                  {incidents.map((incident) => {
                    const formattedDate = incident.createdAt
                      ? new Date(incident.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "";
                    const mappedPriority =
                      incident.detectedSeverity === "HIGH"
                        ? "High"
                        : incident.detectedSeverity === "MEDIUM"
                        ? "Medium"
                        : "Low";

                    return (
                      <tr
                        key={incident.postId}
                        onClick={() => handleRowClick(incident.postId)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 group animate-in fade-in duration-200"
                      >
                        <td className="px-6 py-4 text-label-md font-bold text-primary group-hover:text-secondary transition-colors font-mono">
                          {incident.postId}
                        </td>
                        <td className="px-6 py-4 text-body-md text-on-surface-variant">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-body-md text-on-surface font-semibold uppercase">
                            {incident.harassmentType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={mappedPriority} />
                        </td>
                        <td className="px-6 py-4">
                          {renderStancePills(incident.authorityReviews)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </td>
                      </tr>
                    );
                  })}

                  {/* Sentinel element for infinite scroll */}
                  {hasMore && (
                    <tr ref={sentinelRef} className="hover:bg-transparent">
                      <td colSpan={6} className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-on-surface-variant font-medium">
                            Loading more incidents...
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
                      <AlertTriangle className="w-8 h-8 text-on-surface-variant/40" />
                      <p>No incidents match the search criteria or selected filters within your jurisdiction.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Infinite Scroll Footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-slate-50 text-label-sm font-bold text-outline">
          <span>Showing {incidents.length} of {totalCount} reports</span>
          {!hasMore && incidents.length > 0 && (
            <span className="text-xs text-on-surface-variant/60 font-medium italic">All incidents loaded</span>
          )}
        </div>
      </div>
    </div>
  );
}
