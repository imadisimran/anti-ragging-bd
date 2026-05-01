import React from "react";
import { Home as HomeIcon, AlertCircle, BookOpen, LifeBuoy, Settings } from "lucide-react";

export const LeftSidebar = () => {
  return (
    <aside className="sticky top-16 h-[calc(100vh-64px)] w-64 shrink-0 border-r border-base-200 bg-base-100 hidden lg:flex flex-col p-4 space-y-2 overflow-y-auto custom-scrollbar">
      <nav className="flex flex-col space-y-1">
        <a
          className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg font-semibold transition-all scale-95 active:scale-100"
          href="#"
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-base">Home</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg"
          href="#"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="text-base">My Complaints</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg"
          href="#"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-base">Anti-Raggingging Policies</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg"
          href="#"
        >
          <LifeBuoy className="w-5 h-5" />
          <span className="text-base">Support</span>
        </a>
        <hr className="my-4 border-base-200" />
        <a
          className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg"
          href="#"
        >
          <Settings className="w-5 h-5" />
          <span className="text-base">Settings</span>
        </a>
      </nav>
    </aside>
  );
};
