"use client";
import React from "react";
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="pt-16 flex min-h-screen bg-background">
        <LeftSidebar />

        {/* Center Column: Infinite Scroll Feed */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-8 md:ml-sidebar-width xl:mr-detail-panel-width flex flex-col min-h-[calc(100vh-64px)]">
          <div className="flex-1">{children}</div>
        </main>

        <RightSidebar />
      </div>

      {/* Overlay for mobile sidebar */}
      <div
        id="sidebar-overlay"
        className="fixed inset-0 bg-black/50 z-30 hidden cursor-pointer transition-opacity"
        onClick={() => {
          const sidebar = document.getElementById("sidebar");
          const overlay = document.getElementById("sidebar-overlay");
          if (sidebar && overlay) {
            sidebar.classList.add("-translate-x-full");
            sidebar.classList.remove("translate-x-0");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";
          }
        }}
      />

      <MobileNav />
      <Footer />
    </>
  );
}
