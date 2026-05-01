import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col antialiased">
      <div className="p-6 fixed top-0 left-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-base-content/70 hover:text-primary hover:bg-base-300 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      <main className="grow flex items-center justify-center px-6 py-16">
        {children}
      </main>
    </div>
  );
}