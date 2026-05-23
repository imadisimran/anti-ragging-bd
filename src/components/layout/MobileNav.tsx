import React from "react";
import { Home, Gavel, Plus, BarChart2, User } from "lucide-react";

export const MobileNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant flex justify-around py-2 z-50 px-2 h-16 shadow-lg">
      <a className="flex flex-col items-center justify-center gap-0.5 text-secondary flex-1 cursor-pointer" href="#">
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Home</span>
      </a>
      <a className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant flex-1 cursor-pointer" href="#">
        <Gavel className="w-5 h-5" />
        <span className="text-[10px]">Incidents</span>
      </a>
      <div className="relative -top-4 flex-1 flex justify-center">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center border-4 border-surface-container-lowest active:scale-90 transition-transform cursor-pointer">
          <Plus className="w-8 h-8" />
        </button>
      </div>
      <a className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant flex-1 cursor-pointer" href="#">
        <BarChart2 className="w-5 h-5" />
        <span className="text-[10px]">Metrics</span>
      </a>
      <a className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant flex-1 cursor-pointer" href="#" id="mobile-profile-btn">
        <User className="w-5 h-5" />
        <span className="text-[10px]">Profile</span>
      </a>
    </nav>
  );
};
export default MobileNav;
