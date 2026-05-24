"use client";

import React from "react";
import { 
  BadgeCheck, 
  Lock, 
  KeyRound, 
  ChevronRight, 
  AlertTriangle, 
  Trash2,
  Building,
  Mail,
  Briefcase,
  MapPin,
  ShieldCheck,
  Shield
} from "lucide-react";
import Swal from "sweetalert2";

export default function AuthoritiesProfile() {
  
  const handleToggle2FA = () => {
    Swal.fire({
      title: "Two-Factor Authentication",
      text: "Two-factor authentication is mandatory for all administrative and proctor accounts. To change authentication keys, please contact University IT Support.",
      icon: "info",
      confirmButtonColor: "var(--color-secondary, #0051d5)",
    });
  };

  const handleChangePassword = () => {
    Swal.fire({
      title: "Change Password",
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Current Password</label>
            <input type="password" id="swal-input-curr" class="w-full px-3 py-2 border rounded border-slate-200 focus:outline-none focus:border-secondary" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">New Password</label>
            <input type="password" id="swal-input-new" class="w-full px-3 py-2 border rounded border-slate-200 focus:outline-none focus:border-secondary" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Confirm New Password</label>
            <input type="password" id="swal-input-conf" class="w-full px-3 py-2 border rounded border-slate-200 focus:outline-none focus:border-secondary" placeholder="••••••••">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Update Password",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-secondary, #0051d5)",
      preConfirm: () => {
        const curr = (document.getElementById("swal-input-curr") as HTMLInputElement).value;
        const nw = (document.getElementById("swal-input-new") as HTMLInputElement).value;
        const conf = (document.getElementById("swal-input-conf") as HTMLInputElement).value;
        
        if (!curr || !nw || !conf) {
          Swal.showValidationMessage("Please fill out all password fields!");
          return false;
        }
        if (nw.length < 8) {
          Swal.showValidationMessage("New password must be at least 8 characters long!");
          return false;
        }
        if (nw !== conf) {
          Swal.showValidationMessage("New password and confirmation do not match!");
          return false;
        }
        return { curr, nw };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Password Updated",
          text: "Your administrative account password has been successfully updated.",
          icon: "success",
          timer: 2000,
        });
      }
    });
  };

  const handleDeactivateCredentials = () => {
    Swal.fire({
      title: "Deactivate Proctor Credentials?",
      text: "This will temporarily suspend your active oversight access to the safety dashboard. Historical audit logs will retain your past actions.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Deactivate Credentials",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-error, #ba1a1a)",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Request Submitted",
          text: "Deactivation request forwarded to the University Registrar. Access will be suspended upon authorization.",
          icon: "success",
          timer: 2500,
        });
      }
    });
  };

  return (
    <div className="space-y-gutter animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-display text-primary">Faculty & Proctor Profile</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Manage your judicial credentials, proctoral settings, and enforcement identity.
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
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Full Name
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Prof. Dr. Syed Rafiqul Islam
                </div>
              </div>

              {/* University Email */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Official Email Address
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md flex items-center justify-between transition-colors duration-200">
                  <span>s.rafiq@du.ac.bd</span>
                  <BadgeCheck className="w-5 h-5 text-secondary fill-secondary-container" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Primary Department
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Computer Science and Engineering
                </div>
              </div>

              {/* Designation / Role */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Designation / Role
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Chief Proctor &amp; Hall Provost
                </div>
              </div>

              {/* Office Room */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Office Address
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  Administrative Building, Room 304
                </div>
              </div>

              {/* Enforcement Scope */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Enforcement Oversight Scope
                </label>
                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                  University-wide Disciplinary Board
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
              <h3 className="text-headline-sm font-bold text-primary">Authority Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-label-md font-bold text-primary">Two-Factor Authentication</h4>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Mandatory</span>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Access key and 2FA settings are configured. Keep security logs updated.
                </p>
                <button 
                  onClick={handleToggle2FA}
                  className="text-secondary font-bold text-label-sm text-left hover:underline cursor-pointer"
                >
                  Manage 2FA Credentials →
                </button>
              </div>

              <button 
                onClick={handleChangePassword}
                className="w-full py-3 px-4 border border-outline text-on-surface font-bold text-label-md rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-on-surface-variant" />
                  <span>Update Password</span>
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
                Deactivating your proctor credentials will revoke dashboard operations and safety case tracking permissions immediately. Historical case files and audit reports are retained.
              </p>
            </div>
            
            <button 
              onClick={handleDeactivateCredentials}
              className="w-full py-3 px-4 bg-error text-white font-bold text-label-md rounded-lg hover:bg-error/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-error/10"
            >
              <Trash2 className="w-5 h-5 text-white" />
              <span>Deactivate Proctor Credentials</span>
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
