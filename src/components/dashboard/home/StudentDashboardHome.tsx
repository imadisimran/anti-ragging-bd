"use client";
import { 
  Folder, 
  Gavel, 
  CheckCircle, 
  Hourglass, 
  Scale, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  UserCheck,
  ChevronRight,
  BookOpen,
  ArrowUp
} from "lucide-react";

export default function StudentDashboardHome() {
  return (
    <div className="space-y-stack-lg">
      
      {/* Welcome Header */}
      <header className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Student Safety Dashboard</h1>
        <p className="text-body-md text-on-surface-variant">
          System oversight and institutional accountability metrics.
        </p>
      </header>

      {/* 1. Top Metric Cards (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter mb-stack-lg">
        
        {/* Total Reports */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-colors group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Total Reports</span>
            <Folder className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">1,284</div>
          <div className="flex items-center gap-1 text-green-600 mt-2">
            <ArrowUp className="w-4 h-4" />
            <span className="text-xs font-bold">+12% from last month</span>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-colors group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Active Cases</span>
            <Gavel className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">42</div>
          <div className="flex items-center gap-1 text-on-surface-variant mt-2">
            <Hourglass className="w-3.5 h-3.5" />
            <span className="text-xs font-bold ml-1">14 critical priority</span>
          </div>
        </div>

        {/* Resolved percentage */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-colors group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Resolved</span>
            <CheckCircle className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">96%</div>
          <div className="flex items-center gap-1 text-on-surface-variant mt-2 text-xs font-bold">
            Average resolution: 4.2 days
          </div>
        </div>

        {/* Pending Appeals */}
        <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:border-secondary transition-colors group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-md font-bold text-on-surface-variant">Pending Appeals</span>
            <Scale className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-display font-display text-primary">08</div>
          <div className="flex items-center gap-1 text-error mt-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold">Requires urgent review</span>
          </div>
        </div>

      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        
        {/* 2. Live Audit Timeline */}
        <div className="col-span-12 lg:col-span-8 space-y-stack-md">
          <div className="bg-white border border-outline-variant rounded-lg p-stack-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
            <div className="flex justify-between items-center mb-stack-lg">
              <h2 className="text-headline-sm font-bold text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Live Audit Timeline
              </h2>
              <button className="text-label-md font-bold text-secondary hover:underline cursor-pointer">
                Download Report
              </button>
            </div>

            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
              
              {/* Item 1 */}
              <div className="relative">
                <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center z-10">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider">AI Analysis</span>
                      <h3 className="text-body-lg font-bold text-primary mt-1">AI sanitized text approved for Incident #4901</h3>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        Sensitive metadata removed from public statement per victim request.
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">2 mins ago</span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center z-10 border border-outline-variant">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-bold text-primary-container uppercase tracking-wider">Provost Action</span>
                      <h3 className="text-body-lg font-bold text-primary mt-1">Status change: Investigation Commenced</h3>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        Hall Provost Dr. Ahmed initiated formal hearing for Case #4882.
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">1 hour ago</span>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative">
                <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center z-10 border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Resolution</span>
                      <h3 className="text-body-lg font-bold text-primary mt-1">Institutional Penalty Applied</h3>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        Academic suspension confirmed for Incident #4711 following judicial review.
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">5 hours ago</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. Platform Health & Detail Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-stack-md">
          
          {/* Health Widget */}
          <div className="bg-primary-container text-on-primary-fixed p-stack-lg rounded-lg shadow-sm">
            <h3 className="text-label-md font-bold uppercase tracking-widest opacity-80 mb-4 text-white">Platform Health</h3>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="text-display font-display text-white">92.4%</div>
              <div className="text-right">
                <div className="text-xs font-bold text-secondary-fixed">Responsiveness</div>
                <div className="text-xs text-white opacity-70">Nationwide Average</div>
              </div>
            </div>
            {/* Mock Graph Visual */}
            <div className="flex items-end gap-2 h-24 mb-4">
              <div className="bg-secondary-fixed opacity-40 w-full h-[40%] rounded-t-sm"></div>
              <div className="bg-secondary-fixed opacity-60 w-full h-[60%] rounded-t-sm"></div>
              <div className="bg-secondary-fixed opacity-40 w-full h-[30%] rounded-t-sm"></div>
              <div className="bg-secondary-fixed opacity-80 w-full h-[85%] rounded-t-sm"></div>
              <div className="bg-secondary-fixed w-full h-[92%] rounded-t-sm"></div>
              <div className="bg-secondary-fixed opacity-70 w-full h-[55%] rounded-t-sm"></div>
            </div>
            <p className="text-body-md text-white/80 leading-relaxed">
              University response times have decreased by <span className="font-bold text-white">18%</span> since the implementation of AI triage pipelines.
            </p>
          </div>

          {/* Active Investigations */}
          <div className="bg-white border border-outline-variant p-stack-lg rounded-lg shadow-sm">
            <h3 className="text-headline-sm font-bold text-primary mb-4">Active Investigations</h3>
            <div className="space-y-4">
              
              {/* Institution 1 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                  BU
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label-md font-bold text-primary truncate">Bangladesh University</div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-secondary h-full w-[75%]"></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-on-surface-variant flex-shrink-0">12</span>
              </div>

              {/* Institution 2 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                  DU
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label-md font-bold text-primary truncate">Dhaka Institute</div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-secondary h-full w-[40%]"></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-on-surface-variant flex-shrink-0">08</span>
              </div>

            </div>
          </div>

          {/* CTA Panel */}
          <div className="relative overflow-hidden bg-black text-white p-stack-lg rounded-lg min-h-[160px] flex flex-col justify-end shadow-sm group">
            <div className="absolute top-0 right-0 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="text-white/10 w-24 h-24" />
            </div>
            <h4 className="text-headline-sm font-bold relative z-10 text-white">Legal Resource Center</h4>
            <p className="text-body-md text-white/70 mb-4 relative z-10 leading-snug">
              Access pro-bono legal templates and institutional bylaws.
            </p>
            <button className="bg-secondary-container text-white py-2 rounded text-label-md font-bold relative z-10 hover:opacity-90 transition-opacity cursor-pointer">
              Access Library
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
