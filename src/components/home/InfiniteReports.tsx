"use client";

import React, { useState, useEffect, useRef } from "react";
import PostCard from "@/components/home/PostCard";
import { ShortReport } from "@/types/report.type";
import { getShortReports } from "@/actions/server/report";
import { Loader2 } from "lucide-react";

interface InfiniteReportsProps {
  initialReports: ShortReport[];
}

export default function InfiniteReports({ initialReports }: InfiniteReportsProps) {
  const [reports, setReports] = useState<ShortReport[]>(initialReports);
  const [hasMore, setHasMore] = useState(initialReports.length === 4);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = async () => {
    if (isScrollingLoading || !hasMore) return;
    setIsScrollingLoading(true);
    try {
      const nextSkip = reports.length;
      const res = await getShortReports(4, nextSkip);
      if (res.success && res.data) {
        setReports((prev) => [...prev, ...res.data!]);
        setHasMore(res.data.length === 4);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScrollingLoading(false);
    }
  };

  // Setup Intersection Observer for infinite scrolling
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
  }, [hasMore, isScrollingLoading, reports.length]);

  return (
    <div className="space-y-6">
      {reports.map((r) => (
        <PostCard key={r.postId} report={r} />
      ))}

      {reports.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-low border border-outline-variant rounded-xl">
          <h3 className="text-headline-sm font-bold text-on-surface-variant">No reports found</h3>
          <p className="text-body-md text-on-surface-variant mt-1">
            There are currently no documented incidents.
          </p>
        </div>
      )}

      {/* Sentinel element for infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-on-surface-variant font-medium">
            Loading more reports...
          </span>
        </div>
      )}

      {!hasMore && reports.length > 0 && (
        <div className="text-center py-6 text-xs text-on-surface-variant/60 font-medium italic">
          All reports loaded
        </div>
      )}
    </div>
  );
}
