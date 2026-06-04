import { Filter, AlertTriangle } from "lucide-react";
import PostCard from "@/components/home/PostCard";
import { getShortReports } from "@/actions/server/report";

export default async function Home() {
  const response = await getShortReports()
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-stack-lg flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-headline-lg md:text-display font-display text-primary">The Public Ledger</h1>
          <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">Transparent, real-time documentation of institutional safety.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-outline-variant bg-white text-label-md flex items-center justify-center gap-2 hover:bg-surface-container transition-colors cursor-pointer text-on-surface">
            <Filter className="w-[18px] h-[18px]" />
            <span>Sort</span>
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {!response.success ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-headline-sm font-bold text-red-700">Failed to load reports</h3>
            <p className="text-body-md text-red-600 mt-1 max-w-md">
              {response.error || "An unexpected database or connection error occurred."}
            </p>
          </div>
        ) : !response.data || response.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-low border border-outline-variant rounded-xl">
            <h3 className="text-headline-sm font-bold text-on-surface-variant">No reports found</h3>
            <p className="text-body-md text-on-surface-variant mt-1">
              There are currently no documented incidents.
            </p>
          </div>
        ) : (
          response.data.map(r => (<PostCard key={r.postId} report={r}></PostCard>))
        )}
      </div>

      {/* Responsive Tablet/Mobile Section (Stacked content) */}
      <div className="xl:hidden mt-12 space-y-8">
        <section>
          <h3 className="text-headline-sm font-bold text-primary mb-4">Institutional Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm">
              <span className="text-label-sm text-on-surface-variant block mb-2">Response Rate</span>
              <div className="flex items-end justify-between mb-1">
                <span className="text-headline-md font-bold text-secondary">84%</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full" style={{ width: "84%" }}></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">Resolution Time</span>
              <span className="text-headline-sm font-bold text-primary">4.2 Days</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
