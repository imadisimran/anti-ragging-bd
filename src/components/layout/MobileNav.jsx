import React from "react";
import { Home as HomeIcon, AlertCircle, Plus, BookOpen, Settings } from "lucide-react";

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-base-100 border-t border-base-200 flex items-center justify-around md:hidden z-50">
      <button className="flex flex-col items-center gap-1 text-primary">
        <HomeIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-base-content/50">
        <AlertCircle className="w-6 h-6" />
        <span className="text-[10px]">Complaints</span>
      </button>
      <button className="flex flex-col items-center gap-1 -mt-8">
        <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center text-primary-content shadow-lg">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] text-primary font-bold mt-1">
          Submit
        </span>
      </button>
      <button className="flex flex-col items-center gap-1 text-base-content/50">
        <BookOpen className="w-6 h-6" />
        <span className="text-[10px]">Policies</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-base-content/50">
        <Settings className="w-6 h-6" />
        <span className="text-[10px]">Settings</span>
      </button>
    </nav>
  );
};
