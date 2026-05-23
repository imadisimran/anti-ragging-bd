import React from "react";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";

export const RightSidebar = () => {
  return (
    <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-64px)] w-detail-panel-width bg-surface-container-low border-l border-outline-variant p-6 overflow-y-auto custom-scrollbar">
      <section className="mb-8">
        <h3 className="text-headline-sm font-headline-sm text-primary mb-4">Institutional Impact</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-xl border border-outline-variant">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Overall Response Rate</span>
              <span className="text-secondary font-bold">84%</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full" style={{ width: "84%" }}></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-outline-variant">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-sm font-label-sm text-on-surface-variant">Average Resolution Time</span>
              <span className="text-primary font-bold">4.2 Days</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-label-md font-bold text-primary uppercase tracking-wider">Top Responsive Units</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-outline-variant shrink-0 overflow-hidden">
              <Image
                alt="BUET"
                className="w-6 h-6 object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtyPMGsWoxSgeAmC7_rdvozyXfkQw0k6OnHUbpb-kSG6_8J1c1O4pbCycVvGXkQGmauOKWI3bYG0ekt_WsgGgt-tMdhG8cFBAPQnfidcW4UCIV_yymInnRuUAPlV7sOCc21umoF7EUbMNmUAjcTu2ARBb0KUEpStlRo9s6L9tddh9UNiuDtb_P3zOsU-oe_6XsVa-w8xfodjcjanKP6YDOF5uRUxcDZxorzgCm6cCy0t3ma4VTEakrDBaK856oj1ux1356kXOy1sk"
                width={24}
                height={24}
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-label-md font-medium truncate">BUET</span>
                <span className="text-label-md text-emerald-600 font-bold">98%</span>
              </div>
              <div className="w-full bg-surface-container-high h-1 rounded-full">
                <div className="bg-emerald-500 h-full" style={{ width: "98%" }}></div>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-label-md font-bold text-primary uppercase tracking-wider mb-4">Live Ticker</h3>
        <div className="space-y-3">
          <div className="p-3 bg-white/50 border-l-4 border-amber-400 rounded-r-lg">
            <p className="text-label-sm font-medium">DU Proctor Office</p>
            <p className="text-[11px] text-on-surface-variant">Looking into Thread #8821...</p>
          </div>
        </div>
      </section>

      {/* Faculty Login Portal */}
      <section className="mt-auto">
        <div className="bg-primary-container p-6 rounded-2xl text-on-primary">
          <h4 className="text-headline-sm font-headline-sm mb-2 text-white">Faculty Access</h4>
          <button className="w-full py-2.5 bg-white text-primary-container rounded-lg font-label-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer border-0">
            <ShieldAlert className="w-[20px] h-[20px] text-primary-container" />
            <span>Secure Login</span>
          </button>
        </div>
      </section>
    </aside>
  );
};
export default RightSidebar;
