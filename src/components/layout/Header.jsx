import React from "react";
import Image from "next/image";
import { Search, Bell, HelpCircle } from "lucide-react";

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
        <div className="flex items-center gap-4">
          <button className="p-2 text-base-content/60 hover:bg-base-200 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-base-content/60 hover:bg-base-200 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-base-300 ml-2">
            <Image
              alt="User avatar"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaALiPueGbJ2qOLFo42ASybZUnhfCVisWWklWpFIK1kksyv2qRjDi6SUUibxWhxLj3B-doHYfN1Re0svyRXgWvPt0Ix9WPyes9BLSahvh1W0qTQj34pN0unEBTj2OsmjJfzlkoffSJYao_sxpFY0VinNo-LDSoWGyGSniiD72D6febrP6iDu5sXVkY0LSzyb3j94n7mnqUFfuxDq6FG6_R0dHtb232Gqn8lu3fCexnPjNwdfBhNiCGaeH4FWzA21U9hE44RowgciE"
              width={32}
              height={32}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
