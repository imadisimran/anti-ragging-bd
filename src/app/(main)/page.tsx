import React from "react";
import Image from "next/image";
import { Filter, ThumbsUp, MessageSquare, Bookmark, Share2, FileText, Clock } from "lucide-react";

export default function Home() {
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
        {/* Thread Card 1 */}
        <article className="bg-white rounded-xl p-4 sm:p-6 border border-outline-variant shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-all active:scale-[0.99] touch-manipulation group">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiQYR4KHWErFh6ymT_bNcUMNuxr5jfvB_HFER1UHlVCt3pVS7io91meohrKAX4DK8KI1KkTeJbDS9wweBXdNp1iOWH-dHLOQ5BBLpI7JGkF1M4Cx0ymM5m3TBIcYekTro1ePUu1jJD4AnIEynY-E7hJY4F9He8B_01_vDCcbRb6rlAnU_VEKAr3G6eDvse54tuPWlPDqi8_8z7bLjrXFOHWmcdw0aUycJkSYVyKixqKDvmpy95Vcopu71Hk5-cN2UolfHZROprA5I"
                  width={48}
                  height={48}
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-headline-sm md:text-headline-md font-headline-md text-primary leading-tight">Unauthorized midnight interaction in hall corridor</h2>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Anonymous • 2h ago</p>
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#64748B]"></span>
                Awaiting Response
              </span>
              <span className="text-[11px] sm:text-label-sm font-label-sm text-secondary bg-secondary/5 px-2 py-0.5 rounded truncate">DU - Jagannath Hall</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed line-clamp-3 sm:line-clamp-none">
              A first-year student from Room 302 reported being summoned to the shared balcony by senior students after midnight. The interaction involved verbal intimidation and forced physical exercises under the guise of "introduction."
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
            <div className="flex gap-4 sm:gap-6">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors py-1 cursor-pointer">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-label-md font-label-md">42</span>
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors py-1 cursor-pointer">
                <MessageSquare className="w-5 h-5" />
                <span className="text-label-md font-label-md">3</span>
              </button>
            </div>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer text-on-surface-variant hover:text-secondary">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer text-on-surface-variant hover:text-secondary">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </article>

        {/* Thread Card 2 */}
        <article className="bg-white rounded-xl p-4 sm:p-6 border border-outline-variant shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-all active:scale-[0.99] touch-manipulation">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-headline-sm md:text-headline-md font-headline-md text-primary leading-tight">Investigation Launched: Physical assault allegations</h2>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Verified Eyewitness • 1d ago</p>
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                Investigating
              </span>
              <span className="text-[11px] sm:text-label-sm font-label-sm text-secondary bg-secondary/5 px-2 py-0.5 rounded truncate">BUET - Suhrawardy Hall</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed line-clamp-3 sm:line-clamp-none">
              Following multiple reports from the Civil Engineering department, the institutional proctorial body has officially initiated a probe...
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
            <div className="flex gap-4 sm:gap-6">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors py-1 cursor-pointer">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-label-md font-label-md">128</span>
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors py-1 cursor-pointer">
                <MessageSquare className="w-5 h-5" />
                <span className="text-label-md font-label-md">15</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-label-sm font-semibold text-amber-700">
              <Clock className="w-4 h-4" />
              <span>ETA: 48h</span>
            </div>
          </div>
        </article>
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
