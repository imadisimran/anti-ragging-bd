"use client";

import React, { useState } from "react";
import { 
  Search, 
  Eye, 
  ShieldCheck, 
  Building, 
  BadgeCheck, 
  Printer, 
  Download, 
  CheckCheck, 
  Paperclip, 
  Image as ImageIcon, 
  Lock, 
  Send,
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle2
} from "lucide-react";

interface CaseThread {
  id: string;
  location: string;
  excerpt: string;
  time: string;
  status: string;
  statusType: "disputed" | "progress" | "pending" | "resolved";
  unread?: boolean;
}

export default function MessagesPage() {
  const [activeCase, setActiveCase] = useState("#INC-94821");
  const [searchQuery, setSearchQuery] = useState("");

  const threads: CaseThread[] = [
    {
      id: "#INC-94821",
      location: "DU - Jagannath Hall",
      excerpt: "The Hall administration has reviewed the claims regarding Room 302. While an internal probe is active...",
      time: "11:15 AM",
      status: "DISPUTED",
      statusType: "disputed",
      unread: true
    },
    {
      id: "#INC-82710",
      location: "RU - Sher-e-Bangla Hall",
      excerpt: "Identity verification successful. Case assigned to senior investigator Mahmudul...",
      time: "Yesterday",
      status: "IN PROGRESS",
      statusType: "progress"
    },
    {
      id: "#INC-71629",
      location: "BUET - Ahsan Ullah",
      excerpt: "New evidence uploaded: Time-stamped corridor footage from 2:00 AM...",
      time: "May 22",
      status: "PENDING",
      statusType: "pending",
      unread: true
    },
    {
      id: "#INC-60518",
      location: "CU - Shahjalal Hall",
      excerpt: "Case closed. Disciplinary action taken against four students...",
      time: "May 15",
      status: "RESOLVED",
      statusType: "resolved"
    }
  ];

  const filteredThreads = threads.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-100px)] border border-outline-variant bg-white rounded-lg flex overflow-hidden shadow-sm">
      
      {/* Left Panel: Case Thread List (35%) */}
      <div className="w-[35%] flex flex-col border-r border-outline-variant h-full bg-white flex-shrink-0">
        <div className="p-6 border-b border-outline-variant bg-white">
          <h2 className="text-headline-md font-bold mb-4 text-primary">Case Feedback Hub</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Incident ID or Hall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface"
            />
          </div>
        </div>

        {/* Thread Cards Stack */}
        <div className="flex-grow overflow-y-auto divide-y divide-outline-variant">
          {filteredThreads.map((thread) => {
            const isActive = activeCase === thread.id;
            
            return (
              <div
                key={thread.id}
                onClick={() => setActiveCase(thread.id)}
                className={`p-5 cursor-pointer transition-colors duration-150 relative ${
                  isActive 
                    ? "bg-surface-container border-l-4 border-l-secondary" 
                    : "bg-white hover:bg-surface-container-low"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-semibold text-label-sm ${isActive ? "text-secondary" : "text-outline"}`}>
                    {thread.id}
                  </span>
                  {thread.unread && (
                    <span className="w-2.5 h-2.5 bg-error rounded-full" />
                  )}
                </div>
                
                <h3 className="text-headline-sm text-primary font-bold mb-1 truncate">
                  {thread.location}
                </h3>
                
                <p className="text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                  {thread.excerpt}
                </p>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-label-sm text-outline">{thread.time}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded ${
                    thread.statusType === "disputed" ? "bg-error-container text-on-error-container border border-error/20" :
                    thread.statusType === "resolved" ? "bg-green-100 text-green-800" :
                    "bg-surface-container-highest text-on-surface-variant"
                  }`}>
                    {thread.status}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-body-md text-on-surface-variant">
              No incidents match your search.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Active Message Ledger (65%) */}
      <div className="w-[65%] flex flex-col bg-white h-full justify-between">
        
        {/* Active Thread Details Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white z-10 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-headline-sm font-bold text-primary truncate uppercase">
              CASE {activeCase} • {threads.find(t => t.id === activeCase)?.location || "DU - Jagannath Hall"}
            </h2>
            {activeCase === "#INC-94821" && (
              <span className="bg-error-container text-on-error-container px-3 py-1 rounded text-label-sm font-bold border border-error/30 flex-shrink-0">
                ⚠️ Disputed
              </span>
            )}
            {activeCase === "#INC-82710" && (
              <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded text-label-sm font-bold border border-outline-variant flex-shrink-0 uppercase">
                Investigation Active
              </span>
            )}
            {activeCase === "#INC-71629" && (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded text-label-sm font-bold border border-amber-300/30 flex-shrink-0 uppercase">
                Pending Proof
              </span>
            )}
            {activeCase === "#INC-60518" && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-label-sm font-bold border border-green-300/30 flex-shrink-0 uppercase">
                Resolved
              </span>
            )}
          </div>
          <button className="flex items-center gap-2 border border-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors text-label-md font-bold cursor-pointer flex-shrink-0">
            <Eye className="w-[18px] h-[18px]" />
            <span>View Public</span>
          </button>
        </div>

        {/* Active Content Ledger Feed */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/20">
          
          {/* Anonymity Security Notice */}
          <div className="border border-secondary/20 bg-secondary/5 p-4 flex gap-4 items-start rounded-lg">
            <ShieldCheck className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-headline-sm font-bold text-secondary">Zero-Knowledge Handshake Active</h4>
              <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
                Your personal identity records are cryptographically isolated from the institution. Only the evidence provided in this ledger is visible to the Provost Office.
              </p>
            </div>
          </div>

          {/* Timeline Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 text-label-sm text-outline font-bold tracking-widest uppercase bg-white px-2">
              Official Correspondence
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Case Content Switching */}
          {activeCase === "#INC-94821" && (
            <>
              {/* Authority Memo Block */}
              <div className="border border-outline-variant bg-surface-container-lowest shadow-sm rounded-lg overflow-hidden flex flex-col">
                {/* Memo Header */}
                <div className="p-4 bg-primary text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-label-md font-bold leading-tight">Official Hall Provost Office</p>
                      <p className="text-[10px] opacity-80 uppercase tracking-tighter">Dhaka University</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-label-sm opacity-80">May 24, 2026 • 11:15 AM</span>
                    <span className="bg-white text-primary px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1 rounded">
                      <BadgeCheck className="w-[12px] h-[12px] fill-current" />
                      VERIFIED
                    </span>
                  </div>
                </div>
                {/* Memo Content */}
                <div className="p-8 bg-surface-container-low border-b border-outline-variant">
                  <div className="max-w-2xl space-y-4">
                    <p className="text-body-lg text-primary leading-relaxed font-semibold">
                      The Hall administration has reviewed the claims regarding Room 302. While an internal probe is active, we dispute the timeline provided.
                    </p>
                    <p className="text-body-lg text-primary leading-relaxed font-semibold">
                      The records for entry and exit at the North Gate on the night of May 21st do not align with the narrative submitted in the incident report. We require secondary verification metrics from witnesses before further administrative sanctions can be considered.
                    </p>
                    
                    <div className="mt-8 pt-8 border-t border-outline-variant grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-label-sm text-outline uppercase font-bold mb-1">Reference ID</p>
                        <p className="text-body-md font-mono font-medium">DU-JAG-2026-X94</p>
                      </div>
                      <div>
                        <p className="text-label-sm text-outline uppercase font-bold mb-1">Authorized By</p>
                        <p className="text-body-md font-bold">Acting Provost - Wing A</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Memo Footer */}
                <div className="p-4 flex flex-wrap gap-4 justify-between items-center bg-white">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-surface-container text-on-surface-variant transition-colors rounded cursor-pointer">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-surface-container text-on-surface-variant transition-colors rounded cursor-pointer">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button className="text-label-md font-bold text-on-surface-variant px-4 py-2 border border-outline-variant hover:bg-surface-container-low transition-all cursor-pointer">
                      Request Clarification
                    </button>
                    <button className="text-label-md font-bold text-white bg-secondary px-6 py-2 hover:shadow-lg transition-all cursor-pointer">
                      Submit Counter-Evidence
                    </button>
                  </div>
                </div>
              </div>

              {/* User message block */}
              <div className="flex flex-col items-end space-y-2 opacity-90 animate-fade-in">
                <div className="bg-primary text-white p-4 max-w-lg shadow-sm rounded-lg">
                  <p className="text-body-md leading-relaxed">
                    Initial report submitted with 3 photographic attachments of property damage and formal statement regarding the harassment incident at 1:45 AM.
                  </p>
                  <p className="text-[11px] mt-2 opacity-70 font-mono font-semibold">
                    MAY 21, 2026 • 03:30 AM
                  </p>
                </div>
                <span className="text-label-sm text-outline flex items-center gap-1 font-semibold">
                  <CheckCheck className="w-4 h-4 text-secondary" /> Delivered to Institution
                </span>
              </div>
            </>
          )}

          {activeCase === "#INC-82710" && (
            <div className="space-y-6">
              <div className="border border-outline-variant bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 text-secondary mb-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <h4 className="text-headline-sm font-bold">Investigation Underway</h4>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Identity verification checks on witness profiles completed. Incident command has routed this case file to Mahmudul Hassan (Senior Student Affairs Investigator). You will receive updates here once the statement verification session has been scheduled.
                </p>
                <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center text-xs text-outline font-semibold">
                  <span>ROUTED: MAY 23, 2026</span>
                  <span>ASSIGNEE: M. HASSAN</span>
                </div>
              </div>
            </div>
          )}

          {activeCase === "#INC-71629" && (
            <div className="space-y-6">
              <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 text-amber-800 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                  <h4 className="text-headline-sm font-bold">Evidence Validation Request</h4>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-4">
                  The uploaded video recording file `corridor_2am.mp4` has been flagged for analysis. The system was unable to verify the timestamp signature metadata. Please upload a secondary picture of room status or submit a verification request.
                </p>
                <button className="bg-amber-600 text-white font-bold text-label-md px-5 py-2 rounded hover:bg-amber-700 transition-colors cursor-pointer">
                  Upload Secondary Proof
                </button>
              </div>
            </div>
          )}

          {activeCase === "#INC-60518" && (
            <div className="space-y-6">
              <div className="bg-green-50/50 border border-green-200 p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 text-green-800 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="text-headline-sm font-bold">Case Resolved: Action Confirmed</h4>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  The institutional disciplinary board has completed its case hearing. Four senior students found in violation of Section 4(a) regarding forced entry and asset containment have been placed on institutional suspension for 1 semester. The seized student items have been cataloged and returned.
                </p>
                <div className="mt-4 pt-4 border-t border-outline-variant text-xs text-outline font-semibold">
                  HEARING CONCLUDED: MAY 15, 2026
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Input response console area */}
        <div className="p-6 border-t border-outline-variant bg-white flex-shrink-0">
          <div className="border border-outline-variant focus-within:border-secondary transition-colors rounded-lg overflow-hidden bg-white">
            <textarea 
              className="w-full p-4 text-body-md outline-none min-h-[90px] resize-none text-on-surface placeholder-on-surface-variant/60"
              placeholder="Type your response to the Institution... (Your identity remains cryptographically hidden)"
            />
            <div className="flex justify-between items-center p-3 border-t border-outline-variant bg-slate-50/50">
              <div className="flex gap-2">
                <button className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all rounded cursor-pointer">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all rounded cursor-pointer">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all rounded cursor-pointer" title="Sealed with End-to-End Encryption">
                  <Lock className="w-5 h-5" />
                </button>
              </div>
              
              <button className="bg-primary text-white font-bold text-label-md px-8 py-2 rounded hover:bg-tertiary transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shadow-primary/10">
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
