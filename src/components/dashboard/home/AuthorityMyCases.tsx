"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthorityIncidents, BriefAuthorityIncident } from "@/actions/server/authority";
import PriorityBadge from "@/components/badge/PriorityConfigBadge";

export default function AuthorityMyCases() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<BriefAuthorityIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Load first page of reviewed cases on filters change
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuthorityIncidents({
          limit: 10,
          skip: 0,
          searchQuery,
          priorityFilter,
          statusFilter: "My Reviewed Cases"
        });
        if (!active) return;
        if (res.success && res.data) {
          setIncidents(res.data);
          setHasMore(res.data.length === 10);
          setTotalCount(res.total || 0);
        } else {
          setError(res.error || "Failed to load reviewed cases.");
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
  }, [searchQuery, priorityFilter]);

  const loadMore = async () => {
    if (isScrollingLoading || !hasMore) return;
    setIsScrollingLoading(true);
    try {
      const nextSkip = incidents.length;
      const res = await getAuthorityIncidents({
        limit: 10,
        skip: nextSkip,
        searchQuery,
        priorityFilter,
        statusFilter: "My Reviewed Cases"
      });
      if (res.success && res.data) {
        setIncidents((prev) => [...prev, ...res.data!]);
        setHasMore(res.data.length === 10);
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
  }, [hasMore, isScrollingLoading, incidents.length, searchQuery, priorityFilter]);

  const handleRowClick = (postId: string) => {
    router.push(`/dashboard/reports/${postId}`);
  };

  const renderStancePills = (reviews: any[]) => {
    const roles = ["Provost", "Warden", "GS", "Hall VP"];
    return (
      <div className="flex flex-wrap gap-1.5">
        {roles.map((role) => {
          const review = reviews.find((r) => r.designation.toLowerCase().includes(role.toLowerCase()));
          if (!review) return null;
          const status = review.status;
          let color = "bg-amber-50 text-amber-700 border-amber-200";
          if (status === "RESOLVED") color = "bg-green-50 text-green-700 border-green-200";
          else if (status === "FAKE") color = "bg-red-50 text-red-700 border-red-200";

          return (
            <span key={role} className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${color}`}>
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
        <h3 className="text-headline-md font-bold text-error">Failed to Load Cases</h3>
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
      <div className="mb-stack-lg flex items-center gap-3">
        <div className="p-3 bg-primary-container/20 text-primary rounded-xl">
          <FolderOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-display text-primary">My Case File Directory</h1>
          <p className="text-body-md text-on-surface-variant">
            A history directory of all safety complaint reports you have personally evaluated or commented on.
          </p>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[500px]">
        {/* Table Operations */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Assessed Grievances Timeline</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review history timeline for transparency audits and ongoing compliance tracking.
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
                placeholder="Search case files..."
                type="text"
              />
            </div>

            {/* Filter Toggle */}
            <div className="relative border border-outline rounded-md">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white text-label-md font-bold focus:outline-none rounded-md"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
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
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Review Statuses</th>
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
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-32"></div></td>
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
                        <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
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
                            Loading more cases...
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
                      <p>You have not personally reviewed or commented on any cases matching this query yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Infinite Scroll Footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-slate-50 text-label-sm font-bold text-outline">
          <span>Showing {incidents.length} of {totalCount} total cases</span>
          {!hasMore && incidents.length > 0 && (
            <span className="text-xs text-on-surface-variant/60 font-medium italic">All cases loaded</span>
          )}
        </div>
      </div>
    </div>
  );
}
