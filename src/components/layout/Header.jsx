import React from "react";
import { Search } from "lucide-react";
import HeaderActions from "./HeaderActions";

export const Header = () => {
  return (
    <header className="bg-base-100/90 backdrop-blur-md border-b border-base-200 docked full-width top-0 z-50 shadow-sm fixed w-full">
      <div className="flex justify-between items-center h-16 px-6 w-full max-w-full mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-tighter text-primary">
            Anti-Ragging BD
          </span>
        </div>
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-base-200 border border-base-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Search Complaints"
              type="text"
            />
          </div>
        </div>
        {/* Profile & Actions */}
        <HeaderActions />
      </div>
    </header>
  );
};
