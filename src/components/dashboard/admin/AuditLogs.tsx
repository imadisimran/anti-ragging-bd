"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  History,
  Loader2,
  Calendar,
  User,
  Shield,
  Search,
  Filter,
  Eye,
  Settings,
  AlertTriangle,
  Lock,
  ArrowRight,
  MapPin,
  Scale
} from "lucide-react";
import { getAuditLogs } from "@/actions/server/oversight";

interface AuditLog {
  _id: string;
  timestamp: Date;
  actorUserId: string;
  actorName: string;
  actionType: "DECRYPT_IDENTITY" | "PROMOTE_ADMIN" | "DEMOTE_ADMIN" | "REVOKE_AUTHORITY" | "SETUP_AUTHORITY" | "OVERRIDE_APPEAL" | "MANAGE_LOCATIONS";
  targetUserId?: string;
  details: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionTypeFilter, setActionTypeFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Infinite scroll
  const [hasMore, setHasMore] = useState(true);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  const loadData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    } else {
      setIsScrollingLoading(true);
    }

    try {
      const skip = isInitial ? 0 : logs.length;
      const res = await getAuditLogs({
        limit: 15,
        skip,
        actionTypeFilter
      });

      if (res.success && res.data) {
        setLogs((prev) => (isInitial ? (res.data as any as AuditLog[]) : [...prev, ...(res.data as any as AuditLog[])]));
        setHasMore(res.data.length === 15);
        setTotalCount(res.total || 0);
      } else {
        setError(res.error || "Failed to load audit logs.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
      setIsScrollingLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [actionTypeFilter]);

  // Infinite scroll listener
  useEffect(() => {
    if (!sentinelRef.current || isScrollingLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadData(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isScrollingLoading, logs.length, actionTypeFilter]);

  // Helper to render action specific icon
  const getActionIcon = (type: string) => {
    switch (type) {
      case "DECRYPT_IDENTITY":
        return <Eye className="w-5 h-5 text-red-500" />;
      case "PROMOTE_ADMIN":
      case "SETUP_AUTHORITY":
        return <Shield className="w-5 h-5 text-green-600" />;
      case "DEMOTE_ADMIN":
      case "REVOKE_AUTHORITY":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "OVERRIDE_APPEAL":
        return <Scale className="w-5 h-5 text-purple-600" />;
      case "MANAGE_LOCATIONS":
        return <MapPin className="w-5 h-5 text-blue-500" />;
      default:
        return <Settings className="w-5 h-5 text-slate-500" />;
    }
  };

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Load Failed</h3>
        <p className="text-body-md text-on-surface-variant leading-relaxed">{error}</p>
        <button
          onClick={() => loadData(true)}
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
        <h1 className="text-display text-primary mb-2">System Audit Logs</h1>
        <p className="text-body-md text-on-surface-variant">
          Complete compliance oversight tracking security decryption, administrative mandates, and dynamic configurations.
        </p>
      </div>

      {/* Audit Panel Table */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[500px]">
        {/* Table Operations */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Compliance Timeline Database</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review and audit master actions. Immutable tracking logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-label-md font-bold transition-all hover:bg-slate-50 cursor-pointer ${
                  actionTypeFilter !== "All"
                    ? "border-secondary text-secondary bg-secondary-fixed/10"
                    : "border-outline text-on-surface"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Action Filter</span>
              </button>

              {/* Filters Dropdown Card */}
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-outline-variant rounded-lg shadow-lg p-3 z-20 space-y-1.5 animate-in fade-in duration-100 max-h-[300px] overflow-y-auto">
                    <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1 px-1">Filter Action Type</h4>
                    {[
                      "All",
                      "DECRYPT_IDENTITY",
                      "PROMOTE_ADMIN",
                      "DEMOTE_ADMIN",
                      "SETUP_AUTHORITY",
                      "REVOKE_AUTHORITY",
                      "OVERRIDE_APPEAL",
                      "MANAGE_LOCATIONS"
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setActionTypeFilter(type);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-body-sm font-medium transition-all ${
                          actionTypeFilter === type
                            ? "bg-primary text-on-primary font-bold"
                            : "hover:bg-slate-50 text-on-surface-variant"
                        }`}
                      >
                        {type === "All" ? "All Actions" : type.replace("_", " ")}
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 w-16"></th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Actor Admin</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Action Type</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Log Detail Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <>
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-5"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-64"></div></td>
                    </tr>
                  ))}
                </>
              ) : logs.length > 0 ? (
                <>
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors duration-150 group animate-in fade-in duration-200">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          {getActionIcon(log.actionType)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium font-mono select-none">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-body-md text-on-surface font-semibold uppercase">{log.actorName}</span>
                          <span className="text-[10px] text-outline font-mono">{log.actorUserId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          log.actionType === "DECRYPT_IDENTITY"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : log.actionType === "OVERRIDE_APPEAL"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : log.actionType === "MANAGE_LOCATIONS"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {log.actionType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface font-semibold max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}

                  {/* Sentinel element for infinite scroll */}
                  {hasMore && (
                    <tr ref={sentinelRef} className="hover:bg-transparent">
                      <td colSpan={5} className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-on-surface-variant font-medium">
                            Loading more audit logs...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-on-surface-variant/40" />
                      <p>No audit timeline log entries found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scroll statistics footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-slate-50 text-label-sm font-bold text-outline">
          <span>Showing {logs.length} of {totalCount} total audit log entries</span>
          {!hasMore && logs.length > 0 && (
            <span className="text-xs text-on-surface-variant/60 font-medium italic">All logs loaded</span>
          )}
        </div>
      </div>
    </div>
  );
}
