"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Search,
  Loader2,
  AlertTriangle,
  Calendar,
  User,
  History,
  Unlock,
  CheckCircle,
  Clock
} from "lucide-react";
import Swal from "sweetalert2";
import { getRegisteredUsers, liftReporterSuspension, getBanMetrics } from "@/actions/server/admin";

interface SuspendedUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  isVerified: boolean;
  authorityDetails: any | null;
  studentDetails: any | null;
  reportingBanUntil: Date | null;
  reportingBanReason: string | null;
  banHistoryCount: number;
}

export default function BanManagement() {
  const [users, setUsers] = useState<SuspendedUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Stats State
  const [metrics, setMetrics] = useState({
    totalActiveBans: 0,
    temporarySuspensions: 0,
    permanentBans: 0
  });

  // Load metrics
  const loadMetrics = async () => {
    try {
      const res = await getBanMetrics();
      if (res.success) {
        setMetrics({
          totalActiveBans: res.totalActiveBans,
          temporarySuspensions: res.temporarySuspensions,
          permanentBans: res.permanentBans
        });
      }
    } catch (err) {
      console.error("Failed to load ban metrics:", err);
    }
  };

  // Load first page of suspended users
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getRegisteredUsers({
          limit: 10,
          skip: 0,
          searchQuery,
          roleFilter: "BANNED"
        });
        if (!active) return;
        if (res.success && res.data) {
          setUsers(res.data as SuspendedUser[]);
          setHasMore(res.data.length === 10);
          setTotalCount(res.total || 0);
        } else {
          setError(res.error || "Failed to load suspended users data.");
        }
      } catch (err) {
        console.error(err);
        if (active) setError("An unexpected error occurred while loading suspended users.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    loadMetrics();

    return () => {
      active = false;
    };
  }, [searchQuery]);

  const loadMore = async () => {
    if (isScrollingLoading || !hasMore) return;
    setIsScrollingLoading(true);
    try {
      const nextSkip = users.length;
      const res = await getRegisteredUsers({
        limit: 10,
        skip: nextSkip,
        searchQuery,
        roleFilter: "BANNED"
      });
      if (res.success && res.data) {
        setUsers((prev) => [...prev, ...(res.data as SuspendedUser[])]);
        setHasMore(res.data.length === 10);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error("Error loading more suspended users:", err);
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
  }, [hasMore, isScrollingLoading, users.length, searchQuery]);

  // Handle lift suspension action
  const handleLiftSuspension = (user: SuspendedUser) => {
    Swal.fire({
      title: "Lift Reporter Suspension?",
      html: `Are you sure you want to lift the suspension for:<br/><b>${user.name}</b> (${user.userId})?<br/><br/><span class="text-xs text-slate-500">This will restore their ability to submit safety reports immediately.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-primary, #0f172a)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Lift Suspension",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await liftReporterSuspension(user.userId);
          if (res.success) {
            Swal.fire({
              title: "Suspension Lifted",
              text: res.message || "User suspension has been lifted successfully.",
              icon: "success",
              confirmButtonColor: "var(--color-primary, #0f172a)"
            });

            // Update UI state locally
            setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
            setTotalCount((prev) => Math.max(0, prev - 1));
            loadMetrics();
          } else {
            Swal.fire("Failed", res.error || "Failed to lift suspension.", "error");
          }
        } catch (err: any) {
          console.error(err);
          Swal.fire("Error", "An unexpected error occurred while executing request.", "error");
        }
      }
    });
  };

  // Determine if a ban is permanent
  const isPermanentBan = (date: Date | null) => {
    if (!date) return false;
    const expiry = new Date(date);
    const tenYearsFromNow = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
    return expiry > tenYearsFromNow;
  };

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto bg-error-container/10 border border-error/20 p-6 rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-error mx-auto" />
        <h3 className="text-headline-md font-bold text-error">Failed to Load Suspension Panel</h3>
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
        <h1 className="text-display text-primary mb-2">Suspension & Ban Management</h1>
        <p className="text-body-md text-on-surface-variant">
          Monitor restricted accounts, view suspension history, and lift reporting bans.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Total Active Bans */}
        <div className="bg-white border-l-[6px] border-l-red-600 border border-outline-variant p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">ACTIVE BANS</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{metrics.totalActiveBans}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Total Restricted Accounts</p>
        </div>

        {/* Temporary Suspensions */}
        <div className="bg-white border-l-[6px] border-l-amber-500 border border-outline-variant p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">TEMPORARY</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{metrics.temporarySuspensions}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Temporary Suspensions</p>
        </div>

        {/* Permanent Bans */}
        <div className="bg-white border-l-[6px] border-l-slate-900 border border-outline-variant p-5 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <AlertTriangle className="w-5 h-5 text-slate-900" />
            <span className="text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded">PERMANENT</span>
          </div>
          <p className="text-display font-display text-primary mt-2">{metrics.permanentBans}</p>
          <p className="text-label-md font-bold text-outline uppercase tracking-wider mt-1">Indefinite / Permanent Bans</p>
        </div>
      </div>

      {/* Main Registry Table Panel */}
      <div className="bg-white border border-outline-variant flex-1 flex flex-col rounded-lg shadow-sm overflow-hidden min-h-[500px]">
        {/* Table Operations */}
        <div className="p-5 border-b border-outline-variant flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">Restricted Users Database</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review reasons for reporting suspensions and lift restrictions as appropriate.
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
                placeholder="Search restricted users..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Status / Expiry</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Suspension Reason</th>
                <th className="px-6 py-4 text-label-sm font-bold text-outline uppercase tracking-wider">Ban History</th>
                <th className="px-6 py-4 w-44"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <>
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-28 ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              ) : users.length > 0 ? (
                <>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-150 group animate-in fade-in duration-200">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-body-md text-on-surface font-semibold uppercase">{user.name}</span>
                          <span className="text-xs text-on-surface-variant font-mono">{user.userId}</span>
                          <span className="text-xs text-outline select-all">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isPermanentBan(user.reportingBanUntil) ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white uppercase tracking-wider">
                              Permanent
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                              Suspended
                            </span>
                            {user.reportingBanUntil && (
                              <div className="text-[10px] text-outline flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Expires: {new Date(user.reportingBanUntil).toLocaleDateString(undefined, { dateStyle: "short" })}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium max-w-xs truncate" title={user.reportingBanReason || ""}>
                        {user.reportingBanReason || "No details documented."}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-body-md text-on-surface-variant font-semibold">
                          <History className="w-4 h-4 text-outline" />
                          <span>{user.banHistoryCount} {user.banHistoryCount === 1 ? "time" : "times"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleLiftSuspension(user)}
                          className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded text-label-sm font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm active:scale-95"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>Lift Suspension</span>
                        </button>
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
                            Loading more restricted accounts...
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
                      <CheckCircle className="w-8 h-8 text-emerald-600 animate-bounce" />
                      <p className="font-bold text-on-surface">No restricted accounts found.</p>
                      <p className="text-xs text-outline">All users currently have active reporter accounts.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scroll statistics footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-slate-50 text-label-sm font-bold text-outline">
          <span>Showing {users.length} of {totalCount} total restricted accounts</span>
          {!hasMore && users.length > 0 && (
            <span className="text-xs text-on-surface-variant/60 font-medium italic">All accounts loaded</span>
          )}
        </div>
      </div>
    </div>
  );
}
