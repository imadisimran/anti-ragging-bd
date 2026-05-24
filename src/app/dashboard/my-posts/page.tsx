"use client";

import React, { useState } from "react";
import { 
  Filter, 
  MapPin, 
  Clock, 
  MoreVertical, 
  ThumbsUp, 
  MessageSquare, 
  BarChart2, 
  Eye, 
  AlertCircle, 
  UserCheck, 
  Edit, 
  Gavel, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Download, 
  Archive 
} from "lucide-react";

export default function MyPostsPage() {
  // Card 1 active tab: 'public' | 'original'
  const [card1Tab, setCard1Tab] = useState<"public" | "original">("public");
  
  // Card 3 accordion active state: boolean
  const [card3AccordionOpen, setCard3AccordionOpen] = useState(false);

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-display text-primary mb-1">Public Ledger</h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            Managing your submitted reports and institutional accountability threads.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button className="bg-white border border-outline-variant px-4 py-2 rounded text-label-md font-bold flex items-center gap-2 hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm">
            <Filter className="w-[18px] h-[18px] text-on-surface-variant" />
            <span>All Statuses</span>
          </button>
        </div>
      </div>

      {/* Thread List */}
      <div className="space-y-6">
        
        {/* Card 1: Under Investigation */}
        <div className="bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Metadata Header */}
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold tracking-wider text-on-surface-variant">#INC-94821</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-label-sm font-semibold rounded">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Under Investigation
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-sm font-semibold text-on-surface-variant uppercase tracking-tight">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
                  DHAKA UNIVERSITY • JAGANNATH HALL
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                  May 24, 2026 • Midnight Block
                </span>
              </div>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Narrative Staging Area with tabs */}
          <div className="flex flex-col border-b border-outline-variant bg-surface-container-low">
            <div className="flex border-b border-outline-variant">
              <button
                onClick={() => setCard1Tab("public")}
                className={`px-6 py-3 text-label-md font-bold transition-all cursor-pointer ${
                  card1Tab === "public" 
                    ? "text-secondary border-b-2 border-secondary bg-white" 
                    : "text-on-surface-variant font-medium hover:bg-surface-container-high"
                }`}
              >
                What the Public Sees
              </button>
              <button
                onClick={() => setCard1Tab("original")}
                className={`px-6 py-3 text-label-md font-bold transition-all cursor-pointer ${
                  card1Tab === "original" 
                    ? "text-secondary border-b-2 border-secondary bg-white" 
                    : "text-on-surface-variant font-medium hover:bg-surface-container-high"
                }`}
              >
                My Original Submission
              </button>
            </div>
            
            {/* Tab content 1: Public */}
            {card1Tab === "public" && (
              <div className="p-6 bg-white animate-fade-in">
                <h3 className="text-headline-md text-primary font-bold mb-3">
                  Systemic Harassment in North Wing Dormitories
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  A formal investigation is currently being conducted regarding reported repetitive verbal and physical intimidation tactics used against first-year students in the North Wing of Jagannath Hall. The institutional disciplinary committee has been notified and evidence is being processed under the 2024 Safety Mandate.
                </p>
              </div>
            )}

            {/* Tab content 2: Original */}
            {card1Tab === "original" && (
              <div className="p-6 bg-white animate-fade-in">
                <h3 className="text-headline-md text-primary font-bold mb-3">
                  Harassment at Jagannath Hall North Wing
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Last night around 11:30 PM, senior students from the 3rd floor entered our room and forced us to stand for 3 hours. They were using abusive language and threatened us if we reported anything. This has happened twice this week already. I have a recording of the shouting from outside the door.
                </p>
              </div>
            )}
          </div>

          {/* Public Engagement Metrics Bar */}
          <div className="px-6 py-3 bg-surface flex flex-wrap items-center gap-8 border-b border-outline-variant">
            <div className="flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
              <ThumbsUp className="w-[18px] h-[18px] text-secondary fill-secondary" />
              <span>142 Community Upvotes</span>
            </div>
            <div className="flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
              <MessageSquare className="w-[18px] h-[18px] text-primary fill-primary" />
              <span>3 Authority Tracks</span>
            </div>
          </div>

          {/* Contextual Action Row */}
          <div className="px-6 py-4 flex flex-wrap gap-3">
            <button className="bg-secondary text-white px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm shadow-secondary/10">
              <BarChart2 className="w-[18px] h-[18px]" />
              <span>Track Responses</span>
            </button>
            <button className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer">
              <Eye className="w-[18px] h-[18px]" />
              <span>View Live Post</span>
            </button>
          </div>
        </div>

        {/* Card 2: AI Rejected */}
        <div className="bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Metadata Header */}
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold tracking-wider text-on-surface-variant">#INC-94710</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-error-container text-on-error-container text-label-sm font-semibold rounded">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  AI Rejected
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-sm font-semibold text-on-surface-variant uppercase tracking-tight">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
                  BRAC UNIVERSITY • RESIDENTIAL CAMPUS
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                  May 22, 2026 • Cafeteria Area
                </span>
              </div>
            </div>
          </div>

          {/* Moderation Flag banner */}
          <div className="p-6 bg-error-container/10 border-b border-outline-variant">
            <div className="flex items-start gap-3 text-error">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-headline-sm font-bold mb-1">Moderation Flag: Insufficient Detail</h4>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Automated analysis failed to identify specific institutional actors or concrete timestamps required for formal docketing. Report remains private.
                </p>
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="p-6">
            <h3 className="text-headline-md text-primary font-bold mb-3">General discomfort in common areas</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Students are feeling very uncomfortable when eating in the main cafeteria during the evenings. Some people are making the environment very toxic for freshers. Something needs to be done about the general atmosphere during dinner hours.
            </p>
          </div>

          {/* Action Row */}
          <div className="px-6 py-4 flex flex-wrap gap-3">
            <button className="bg-primary text-on-primary px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm shadow-primary/10">
              <UserCheck className="w-[18px] h-[18px]" />
              <span>Request Human Review</span>
            </button>
            <button className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer">
              <Edit className="w-[18px] h-[18px]" />
              <span>Amend Submission</span>
            </button>
          </div>
        </div>

        {/* Card 3: Disputed */}
        <div className="bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Metadata Header */}
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold tracking-wider text-on-surface-variant">#INC-94655</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-semibold rounded">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  Disputed
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-sm font-semibold text-on-surface-variant uppercase tracking-tight">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
                  RAJSHAHI UNIVERSITY • ADMIN BUILDING
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                  May 19, 2026 • 04:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="p-6 border-b border-outline-variant">
            <h3 className="text-headline-md text-primary font-bold mb-3">Retaliation for Anti-Ragging Advocacy</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Following my participation in the awareness seminar, I was targeted by student wing members near the admin building. They threatened my academic standing and warned me against continuing my "online activities" regarding the safety platform.
            </p>
          </div>

          {/* Public Engagement Metrics Bar */}
          <div className="px-6 py-3 bg-surface flex flex-wrap items-center gap-8 border-b border-outline-variant">
            <div className="flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
              <ThumbsUp className="w-[18px] h-[18px] text-secondary fill-secondary" />
              <span>305 Community Upvotes</span>
            </div>
            <div className="flex items-center gap-2 text-label-sm font-semibold text-on-surface-variant">
              <MessageSquare className="w-[18px] h-[18px] text-primary fill-primary" />
              <span>1 Authority Track</span>
            </div>
          </div>

          {/* Accordion Proctor Office objection */}
          <div className="flex flex-col">
            <div className="px-6 py-4 flex gap-3 border-b border-outline-variant">
              <button 
                onClick={() => setCard3AccordionOpen(!card3AccordionOpen)}
                className="bg-tertiary text-on-tertiary px-5 py-2.5 rounded font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-tertiary/10"
              >
                <Gavel className="w-[18px] h-[18px]" />
                <span>View Faculty Objection</span>
                {card3AccordionOpen ? (
                  <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                )}
              </button>
            </div>
            
            {card3AccordionOpen && (
              <div className="bg-surface-container-low p-6 transition-all duration-300 animate-slide-down">
                <div className="border-l-4 border-tertiary pl-4">
                  <span className="text-label-sm font-bold uppercase text-on-surface-variant mb-2 block tracking-wider">
                    Official Response from Proctor Office
                  </span>
                  <p className="text-body-md italic text-on-surface-variant leading-relaxed">
                    "The institution formally disputes the framing of this event. The meeting in question was a routine academic counseling session regarding the student's attendance. No threats were issued by any student groups present in the vicinity at that time. We request a full audit of the reporter's provided evidence."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* Metadata Header */}
          <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold tracking-wider text-on-surface-variant">#INC-92104</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-100 text-green-800 text-label-sm font-semibold rounded animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Resolved
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-sm font-semibold text-on-surface-variant uppercase tracking-tight">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
                  BUET • TITUMIR HALL
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                  April 12, 2026 • 2nd Floor Common
                </span>
              </div>
            </div>
          </div>

          {/* Resolution banner */}
          <div className="p-6 bg-green-50/50 border-b border-outline-variant">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 fill-green-100" />
              <span className="font-bold text-label-md uppercase tracking-wider">
                Incident Resolved: Institutional Action Taken
              </span>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="p-6">
            <h3 className="text-headline-md text-primary font-bold mb-3">Unauthorized Room Entry & Asset Seizure</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Following the verification of dormitory CCTV footage, the University Administration has suspended four students involved in the forced entry and seizure of personal belongings from the reporter's room. Assets have been returned and a formal apology was issued.
            </p>
          </div>

          {/* Contextual Action Row */}
          <div className="px-6 py-4 flex flex-wrap gap-3">
            <button className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer">
              <Download className="w-[18px] h-[18px]" />
              <span>Download Resolution Report</span>
            </button>
            <button className="border border-outline text-on-surface px-5 py-2.5 rounded font-bold text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer">
              <Archive className="w-[18px] h-[18px]" />
              <span>Archive Post</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
