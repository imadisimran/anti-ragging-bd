"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinkDashboardProps {
  href: string;
  isCollapsed: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function NavLinkDashboard({ href, isCollapsed, icon, children }: NavLinkDashboardProps) {
  const pathname = usePathname();

  // Active state: strict matching for home page, startsWith check for subpaths, ignore placeholder "#"
  const isActive = href !== "#" && (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-3 py-3 rounded transition-all nav-item ${
        isActive
          ? "bg-secondary-fixed text-on-secondary-fixed border-l-4 border-secondary font-semibold"
          : "text-on-surface-variant hover:bg-surface-container"
      } ${
        isCollapsed
          ? `justify-center px-0 ${isActive ? "border-l-0 border-b-4 border-secondary" : ""}`
          : ""
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && (
        <span className="text-label-md font-label-md label-text whitespace-nowrap transition-opacity duration-200">
          {children}
        </span>
      )}
    </Link>
  );
}
