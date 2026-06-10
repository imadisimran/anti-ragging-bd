"use client";

import React, { useState } from "react";
import Image from "next/image";
import NavLinkDashboard from "@/components/layout/NavLinkDashboard";
import { 
  Home, 
  User, 
  Users,
  FileText, 
  MessageSquare, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  Scale
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Side Navigation */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-background border-r border-outline-variant z-40 flex flex-col py-stack-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-[240px]"
        }`}
      >
        {/* Top Header Logo & Collapse Trigger */}
        <div className={`px-4 mb-stack-lg flex ${
          isCollapsed ? "flex-col justify-center items-center gap-4" : "items-center justify-between gap-3"
        } logo-container`}>
          <div className="flex items-center gap-3">
            <div className="min-w-[40px] w-10 h-10 rounded bg-primary-container flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Anti-Ragging Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="logo-text whitespace-nowrap transition-opacity duration-200">
                <h2 className="text-label-md font-bold text-primary">Anti Ragging BD</h2>
                <p className="text-xs text-on-surface-variant">Safety Hub</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-md transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          <NavLinkDashboard href="/dashboard" isCollapsed={isCollapsed} icon={<Home className="w-5 h-5 flex-shrink-0" />}>
            Home
          </NavLinkDashboard>

          <NavLinkDashboard href="/dashboard/profile" isCollapsed={isCollapsed} icon={<User className="w-5 h-5 flex-shrink-0" />}>
            Profile
          </NavLinkDashboard>

          <NavLinkDashboard href="/dashboard/my-posts" isCollapsed={isCollapsed} icon={<FileText className="w-5 h-5 flex-shrink-0" />}>
            My Posts
          </NavLinkDashboard>

          {role === "ADMIN" && (
            <>
              <NavLinkDashboard href="/dashboard/appeals" isCollapsed={isCollapsed} icon={<Scale className="w-5 h-5 flex-shrink-0" />}>
                Appeals
              </NavLinkDashboard>
              <NavLinkDashboard href="/dashboard/user-management" isCollapsed={isCollapsed} icon={<Users className="w-5 h-5 flex-shrink-0" />}>
                User Registry
              </NavLinkDashboard>
            </>
          )}

          <NavLinkDashboard href="#" isCollapsed={isCollapsed} icon={<MessageSquare className="w-5 h-5 flex-shrink-0" />}>
            Messages
          </NavLinkDashboard>
        </nav>

        {/* Footer Navigation */}
        <div className="px-3 border-t border-outline-variant pt-stack-lg">
          <NavLinkDashboard href="#" isCollapsed={isCollapsed} icon={<HelpCircle className="w-5 h-5 flex-shrink-0" />}>
            Support
          </NavLinkDashboard>
          <Link href="/" className="text-label-md font-label-md label-text">Back To Home</Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main 
        className={`min-h-screen transition-all duration-300 ease-in-out bg-slate-50 ${
          isCollapsed ? "ml-16" : "ml-[240px]"
        }`}
        id="main-content"
      >
        <div className="max-w-container-max mx-auto p-margin-mobile md:p-margin-desktop">
          {children}
        </div>
      </main>
    </div>
  );
}
