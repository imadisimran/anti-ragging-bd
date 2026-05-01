import React from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  HelpCircle,
  Home as HomeIcon,
  AlertCircle,
  BookOpen,
  LifeBuoy,
  Settings,
  PlusCircle,
  Plus,
  CheckCircle,
} from "lucide-react";

export default function MainLayout({children}) {
  return (
    <>
      {/* TopNavBar Header Shell */}
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

      {/* Main Content */}
      <div className="pt-16 flex min-h-screen">
        {/* Left Sidebar: Minimalist Navigation */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-base-200 bg-base-100 hidden lg:flex flex-col p-4 space-y-2">
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

        {/* Center Column: Infinite Scroll Feed */}
        <main className="flex-1 bg-base-200/50 lg:ml-64 lg:mr-80 p-6 md:p-8">
          {children}
        </main>

        {/* Right Sidebar: Safety Stats & CTA */}
        <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 border-l border-base-200 bg-base-100 hidden xl:flex flex-col p-6 space-y-6">
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
      </div>

      {/* Bottom Mobile Nav */}
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
    </>
  );
}
