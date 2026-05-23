import React from "react";
import Image from "next/image";
import { Home, Gavel, Shield, Landmark, PlusCircle, LogIn } from "lucide-react";

export const LeftSidebar = () => {
  return (
    <aside
      className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 bg-surface-container-low border-r border-outline-variant flex flex-col py-stack-lg px-4 overflow-y-auto custom-scrollbar transition-transform duration-300 -translate-x-full md:translate-x-0 w-sidebar-width"
      id="sidebar"
    >
      <div className="mb-stack-lg px-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              alt="University Logo"
              className="w-8 h-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBetXTKCr4vVd1xE5z0NQFht5lRnhEbRP6r81MxYuTSa8URYEPEXGOodH939F4kp416hi6eP2F24zBo7l9qPaR1T0RhisTY_EE1vRnWN9V4M6-oX6vakp9gZYRrI-DyWML5Fr_XKr4f1OHZQrTK-8eid8sXijGy1Ee7OwIayR8Sq-i9Sg4qj3c_0JvUgUEsM_fuSRgiDpBVxC82q12I7CpbliiyunK4ybFKkdarW1LG8bZbT_bk19mbd1NZX2ymCJCCsXQuDYBd0cw"
              width={32}
              height={32}
              unoptimized
            />
          </div>
          <div className="truncate">
            <h3 className="text-headline-sm font-headline-sm font-bold text-primary leading-tight">National Portal</h3>
            <p className="text-[11px] text-on-surface-variant leading-none">Institutional Safety Hub</p>
          </div>
        </div>

        <div className="space-y-1">
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-container-high text-primary border-l-4 border-secondary transition-all"
            href="#"
          >
            <Home className="w-5 h-5" />
            <span className="text-label-md font-label-md">Home Feed</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            href="#"
          >
            <Gavel className="w-5 h-5" />
            <span className="text-label-md font-label-md">Incidents</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            href="#"
          >
            <Shield className="w-5 h-5" />
            <span className="text-label-md font-label-md">Safety Center</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            href="#"
          >
            <Landmark className="w-5 h-5" />
            <span className="text-label-md font-label-md">Institutions</span>
          </a>
        </div>
      </div>

      <div className="mt-4 px-2 hidden lg:block">
        <h4 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-3 mb-2">
          Filter By Institution
        </h4>
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg group cursor-pointer">
            <span>Dhaka University</span>
            <span className="text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded font-semibold">12</span>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer">
            <span>BUET</span>
            <span className="text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded font-semibold">4</span>
          </button>
        </div>
      </div>

      <div className="mt-auto px-2 space-y-1 pt-stack-lg">
        <button className="w-full bg-secondary text-white py-3 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
          <PlusCircle className="w-[18px] h-[18px]" />
          <span className="text-label-md font-label-md">Submit Entry</span>
        </button>
        <div className="pt-4 border-t border-outline-variant mt-4">
          <a
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface text-label-md font-label-md transition-colors"
            href="#"
          >
            <LogIn className="w-5 h-5" />
            <span>Faculty Login</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
export default LeftSidebar;
