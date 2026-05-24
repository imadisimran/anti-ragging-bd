"use client";

import React from "react";
import { 
  BadgeCheck, 
  Lock, 
  KeyRound, 
  ChevronRight, 
  AlertTriangle, 
  Trash2 
} from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-gutter">
      
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-headline-lg font-bold text-primary">Student Profile</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Manage your institutional identity and security settings.
        </p>
      </header>

      <div className="space-y-gutter">
        
        {/* Top Section: Profile Card */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary opacity-80"></div>
          
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  Full Name
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Md. Arifur Rahman
                </div>
              </div>

              {/* University Email */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  University Email
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md flex items-center justify-between transition-colors duration-200">
                  <span>arifur.2019@univ-du.ac.bd</span>
                  <BadgeCheck className="w-5 h-5 text-secondary fill-secondary-container" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  Department
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Computer Science and Engineering
                </div>
              </div>

              {/* Academic Session */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  Academic Session
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  2019-2020 (Year 4)
                </div>
              </div>

              {/* Residential Hall / Hostel */}
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                  Residential Hall / Hostel
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Bijoy Ekattor Hall, Room 402-B
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Section: Grid Layout for Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          
          {/* Security Card */}
          <div className="bg-white rounded-xl border border-outline-variant p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-outline-variant">
              <Lock className="w-6 h-6 text-secondary" />
              <h3 className="text-headline-sm font-bold text-primary">Account Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg flex flex-col gap-3">
                <h4 className="text-label-md font-bold text-primary">Two-Factor Authentication</h4>
                <p className="text-body-md text-on-surface-variant">
                  Add an extra layer of security to your safety portal account.
                </p>
                <button className="text-secondary font-bold text-label-sm text-left hover:underline cursor-pointer">
                  Enable 2FA Now →
                </button>
              </div>

              <button className="w-full py-3 px-4 border border-outline text-on-surface font-bold text-label-md rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-on-surface-variant" />
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-red-50/50 rounded-xl border border-red-200 p-6 flex flex-col justify-between gap-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-error" />
                <h3 className="text-headline-sm font-bold text-error">Danger Zone</h3>
              </div>
              <p className="text-body-md text-error/85 leading-relaxed">
                Deleting your account is permanent. All filed reports will be anonymized further and you will lose access to active case tracking.
              </p>
            </div>
            
            <button className="w-full py-3 px-4 bg-error text-white font-bold text-label-md rounded-lg hover:bg-error/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-error/10">
              <Trash2 className="w-5 h-5 text-white" />
              <span>Delete Account</span>
            </button>
          </div>

        </div>

        {/* Footer Policy Info */}
        <div className="pt-8 border-t border-outline-variant/30">
          <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-50 text-label-sm text-on-surface-variant font-semibold">
            <a className="hover:underline" href="#">Transparency Report</a>
            <a className="hover:underline" href="#">Legal Rights</a>
            <a className="hover:underline" href="#">Data Protection</a>
          </div>
          <p className="mt-4 text-[11px] text-on-surface-variant opacity-40 leading-relaxed uppercase tracking-tighter font-semibold">
            © {new Date().getFullYear()} Anti-Ragging Bangladesh. Monitored by Judicial Integrity Commission.
          </p>
        </div>

      </div>
    </div>
  );
}
