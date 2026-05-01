import React from "react";
import { PlusCircle, CheckCircle } from "lucide-react";

export const RightSidebar = () => {
  return (
    <aside className="sticky top-16 h-[calc(100vh-64px)] w-80 shrink-0 border-l border-base-200 bg-base-100 hidden xl:flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Submit CTA */}
      <button className="w-full bg-primary text-primary-content py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
        <PlusCircle className="w-5 h-5" />
        <span className="text-base">File a Complaint</span>
      </button>

      {/* Safety Stats Widget */}
      <div className="bg-base-200 rounded-xl p-6 border border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-base-content">
            System Health
          </h4>
          <CheckCircle className="text-success w-5 h-5" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-5xl font-bold text-primary leading-none">
              12
            </p>
            <p className="text-sm text-base-content/60 font-medium mt-1">
              Cases Resolved This Month
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
            <div>
              <p className="text-2xl font-semibold text-base-content">
                98%
              </p>
              <p className="text-xs font-medium text-base-content/60">
                Resolution Rate
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-base-content">
                4.2h
              </p>
              <p className="text-xs font-medium text-base-content/60">
                Avg Response
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
