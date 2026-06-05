"use client"
import { Bell, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function HeaderActions() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <span className="loading loading-spinner loading-md text-primary"></span>
  }

  if (status === "unauthenticated") {
    return <Link href="/login" className="btn btn-primary">Login</Link>
  }

  const user = session?.user;

  return (
    <div className="flex items-center gap-4">
      <button className="p-2 text-base-content/60 hover:bg-base-200 rounded-full transition-colors">
        <Bell className="w-5 h-5" />
      </button>

      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar border border-base-300 ml-2">
          <div className="w-8 rounded-full overflow-hidden flex items-center justify-center bg-base-200">
            {user?.image ? (
              <Image
                alt="User avatar"
                className="h-full w-full object-cover"
                src={user.image}
                width={32}
                height={32}
              />
            ) : (
              <User className="w-5 h-5 text-base-content/70" />
            )}
          </div>
        </label>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-2xl bg-base-100 rounded-box w-64 border border-base-200">
          <li className="px-4 py-3 border-b border-base-200 mb-2 pointer-events-none">
            <div className="flex flex-col gap-1 p-0">
              <span className="font-bold text-base leading-none text-base-content">{user?.name || "User"}</span>
              <span className="text-xs text-base-content/60 truncate">{user?.email}</span>
            </div>
          </li>
          <li>
            <Link href="/dashboard" className="flex items-center gap-3 py-3">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/profile" className="flex items-center gap-3 py-3">
              <User className="w-4 h-4" />
              Profile
            </Link>
          </li>
          <li>
            <Link href="/settings" className="flex items-center gap-3 py-3">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </li>
          <div className="divider my-1 opacity-50"></div>
          <li>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 py-3 text-error hover:bg-error/10 active:bg-error/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

