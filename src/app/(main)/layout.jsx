import React from "react";
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />

      {/* Main Content */}
      <div className="pt-16 flex min-h-screen">
        <LeftSidebar />

        {/* Center Column: Infinite Scroll Feed */}
        <main className="flex-1 min-w-0 bg-base-200/50 p-6 md:p-8 flex flex-col min-h-[calc(100vh-64px)]">
          <div className="flex-1">{children}</div>
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
      <Footer />
    </>
  );
}
