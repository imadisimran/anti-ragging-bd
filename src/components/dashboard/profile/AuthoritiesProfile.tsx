"use client";

import React, { useState } from "react";
import {
  BadgeCheck,
  Shield,
  Eye,
  ShieldCheck,
  KeyRound,
  Edit3,
  History,
  Laptop,
  ClipboardList
} from "lucide-react";
import Swal from "sweetalert2";

interface ProfileData {
  name: string;
  role: string;
  department: string;
  oversight: string;
  designation: string;
  email: string;
  image: string;
}

export default function AuthoritiesProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "DR. AHMED MANSUR",
    role: "SENIOR HALL PROVOST",
    department: "Department of Sociology",
    oversight: "Jagannath Hall",
    designation: "Primary Investigator (Level 3)",
    email: "a.mansur@university-edu.bd",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5oskI4OkPzf5oLeAH1FLk55TwnpTvDtg1lWMO7m0wssIhhvHnBJ7t_LMlZ4E58S1MeCqr7anOLRd4RyY9TYsc7hQoLKXoz2KgFo9UHzCbB5dwX-0GfofprXogfEwPLpdBa7IBuWhDVfjB-3J3knG380CSpDstP2ImRRemVO89lgMQYakHA0C3tkQuHjQG95X04SG4NRayvtZXy9jy8my88pSAYPYcD3ULHdGvqm1xHDfHtJkF2zOuahwWD0F-CL8gpB3S90nXop0"
  });

  const handleChangePassword = () => {
    Swal.fire({
      title: "CHANGE PASSWORD",
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Current Password</label>
            <input type="password" id="swal-input-curr" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">New Password</label>
            <input type="password" id="swal-input-new" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Confirm New Password</label>
            <input type="password" id="swal-input-conf" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" placeholder="••••••••">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "UPDATE PASSWORD",
      cancelButtonText: "CANCEL",
      confirmButtonColor: "var(--color-primary, #000000)",
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
          title: "SUCCESSFUL",
          text: "Your administrative account password has been updated.",
          icon: "success",
          confirmButtonColor: "var(--color-primary, #000000)"
        });
      }
    });
  };

  const handleUpdateCredentials = () => {
    Swal.fire({
      title: "UPDATE CREDENTIALS",
      html: `
        <div class="space-y-3 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
            <input type="text" id="swal-edit-name" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" value="${profile.name}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Role / Title</label>
            <input type="text" id="swal-edit-role" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" value="${profile.role}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Primary Affiliation</label>
            <input type="text" id="swal-edit-dept" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" value="${profile.department}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Residential Oversight</label>
            <input type="text" id="swal-edit-oversight" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" value="${profile.oversight}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">System Designation</label>
            <input type="text" id="swal-edit-desig" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" value="${profile.designation}">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Institutional Email</label>
            <input type="email" id="swal-edit-email" class="w-full px-3 py-2 border rounded-none border-slate-200 focus:outline-none focus:border-secondary" value="${profile.email}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "SAVE CHANGES",
      cancelButtonText: "CANCEL",
      confirmButtonColor: "var(--color-primary, #000000)",
      preConfirm: () => {
        const name = (document.getElementById("swal-edit-name") as HTMLInputElement).value;
        const role = (document.getElementById("swal-edit-role") as HTMLInputElement).value;
        const department = (document.getElementById("swal-edit-dept") as HTMLInputElement).value;
        const oversight = (document.getElementById("swal-edit-oversight") as HTMLInputElement).value;
        const designation = (document.getElementById("swal-edit-desig") as HTMLInputElement).value;
        const email = (document.getElementById("swal-edit-email") as HTMLInputElement).value;

        if (!name || !role || !department || !oversight || !designation || !email) {
          Swal.showValidationMessage("Please fill out all fields!");
          return false;
        }
        return { name, role, department, oversight, designation, email };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setProfile({
          ...profile,
          ...result.value,
          name: result.value.name.toUpperCase(),
          role: result.value.role.toUpperCase()
        });
        Swal.fire({
          title: "SUCCESSFUL",
          text: "Your profile details have been updated.",
          icon: "success",
          confirmButtonColor: "var(--color-primary, #000000)"
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-on-surface-variant space-x-1.5 font-medium">
        <span>Institutional Registry</span>
        <span className="text-outline-variant">/</span>
        <span>Faculty Directory</span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-bold">Investigator Profile</span>
      </nav>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Main Info Panels (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Profile Main Card */}
          <section className="bg-white border border-outline-variant p-10 flex flex-col md:flex-row gap-8 items-start shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] rounded-lg">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <img 
                alt="Faculty Profile Authoritative grayscale headshot" 
                className="w-36 h-36 object-cover border-4 border-white ring-1 ring-outline-variant grayscale rounded-md shadow-sm" 
                src={profile.image}
              />
              <div className="absolute -bottom-1 -right-1 bg-secondary w-9 h-9 border border-white flex items-center justify-center rounded shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-secondary fill-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left w-full">
              <h2 className="text-headline-lg font-bold text-on-surface uppercase tracking-wide">{profile.name}</h2>
              <p className="text-secondary font-bold bg-secondary-fixed inline-block px-3 py-1.5 text-label-sm rounded">
                {profile.role}
              </p>
              
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] tracking-wider text-outline font-bold uppercase">Primary Affiliation</span>
                  <p className="text-body-md font-bold text-on-surface">{profile.department}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] tracking-wider text-outline font-bold uppercase">Residential Oversight</span>
                  <p className="text-body-md font-bold text-on-surface">{profile.oversight}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] tracking-wider text-outline font-bold uppercase">System Designation</span>
                  <p className="text-body-md font-bold text-on-surface">{profile.designation}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] tracking-wider text-outline font-bold uppercase">Institutional Email</span>
                  <p className="text-body-md font-bold text-on-surface select-all break-all">{profile.email}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Administrative Authority Section */}
          <section className="bg-white border border-outline-variant shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] rounded-lg">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-white rounded-t-lg">
              <h3 className="text-headline-sm font-bold uppercase text-on-surface tracking-wide">Administrative Authority</h3>
              <ClipboardList className="w-5 h-5 text-outline" />
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Col 1: Case Adjudication */}
              <div className="p-5 border border-outline-variant bg-white flex flex-col gap-3 rounded-md">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span className="font-bold text-body-md leading-tight text-secondary">
                    Case<br />Adjudication
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Authorized to preside over initial disciplinary hearings and issue provisional sanctions within the Hall jurisdiction.
                </p>
              </div>

              {/* Col 2: Audit Rights */}
              <div className="p-5 border border-outline-variant bg-white flex flex-col gap-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-bold text-body-md leading-tight text-secondary">
                    Audit Rights
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Full access to residential CCTV logs and student entry/exit registries for investigation purposes.
                </p>
              </div>

              {/* Col 3: Protection Orders */}
              <div className="p-5 border border-outline-variant bg-white flex flex-col gap-3 rounded-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-bold text-body-md leading-tight text-secondary">
                    Protection Orders
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Mandate to issue immediate &apos;No-Contact&apos; directives between parties during active investigations.
                </p>
              </div>

            </div>
          </section>

        </div>

        {/* Right Side: Credential Management, Stats & Session info (4 cols) */}
        <div className="xl:col-span-4 space-y-6 w-full">
          
          {/* Actions Panel */}
          <section className="bg-white border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] rounded-lg">
            <h3 className="text-label-sm font-bold text-outline uppercase border-b border-outline-variant pb-2.5 mb-4">
              Credential Management
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={handleChangePassword}
                className="w-full bg-primary text-on-primary py-3 px-4 font-bold text-label-sm border border-primary hover:bg-opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 rounded cursor-pointer uppercase tracking-wider"
              >
                <KeyRound className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              
              <button 
                onClick={handleUpdateCredentials}
                className="w-full bg-white text-primary py-3 px-4 font-bold text-label-sm border border-primary hover:bg-surface-container-low active:scale-95 transition-all flex justify-center items-center gap-2 rounded cursor-pointer uppercase tracking-wider"
              >
                <Edit3 className="w-4 h-4" />
                <span>Update Credentials</span>
              </button>
            </div>
          </section>

          {/* Session Security */}
          <section className="bg-white border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] rounded-lg">
            <h3 className="text-label-sm font-bold text-outline uppercase border-b border-outline-variant pb-2.5 mb-4">
              Session Security
            </h3>
            
            <div className="space-y-6">
              
              {/* Last Auth */}
              <div className="flex items-start">
                <div className="p-3 bg-surface-container-low border border-outline-variant/30 mr-3 flex items-center justify-center shrink-0 w-10 h-10 rounded">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Last Authentication</p>
                  <p className="text-body-md font-bold text-on-surface mt-0.5">Oct 24, 2023 — 09:14 AM</p>
                  <p className="text-xs text-outline">Dhaka, Bangladesh (IP: 103.25.1.42)</p>
                </div>
              </div>

              {/* Active Device */}
              <div className="flex items-start">
                <div className="p-3 bg-surface-container-low border border-outline-variant/30 mr-3 flex items-center justify-center shrink-0 w-10 h-10 rounded">
                  <Laptop className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Active Device</p>
                  <p className="text-body-md font-bold text-on-surface mt-0.5">MacBook Pro (Chrome)</p>
                  <div className="flex items-center mt-1">
                    <span className="w-2.5 h-2.5 bg-secondary inline-block shrink-0 mr-1.5"></span>
                    <span className="text-label-sm text-secondary font-bold">Currently Online</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Investigator Activity (Stats) */}
          <section className="bg-white border border-outline-variant p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] rounded-lg">
            <h3 className="text-label-sm font-bold text-outline uppercase border-b border-outline-variant pb-2.5 mb-4">
              Investigator Activity
            </h3>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/20">
                <span className="text-body-md text-on-surface-variant font-medium">Cases Resolved</span>
                <span className="font-bold text-headline-sm text-on-surface">42</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/20">
                <span className="text-body-md text-on-surface-variant font-medium">Active Inquiries</span>
                <span className="font-bold text-headline-sm text-secondary">03</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-body-md text-on-surface-variant font-medium">Avg Response Time</span>
                <span className="font-bold text-headline-sm text-on-surface">4.2h</span>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
