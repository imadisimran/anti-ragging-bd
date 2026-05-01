import { Filter, MapPin, Heart } from "lucide-react";


export default function Home() {
  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Stats for Feed */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-base-content">
            Recent Complaints
          </h2>
          <div className="flex gap-2">
            <button className="bg-base-100 px-3 py-1.5 rounded-full border border-base-300 text-sm font-semibold flex items-center gap-1 hover:bg-base-200 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Report Card 1 */}
        <article className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">Main Hostel</span>
            </div>
            <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Resolved
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-base-content">
              Ragging incident mediation completed
            </h3>
            <p className="text-base text-base-content/80 leading-relaxed">
              AI Summary: A restorative circle was facilitated between a senior
              and a junior student regarding inappropriate behavior. Both
              parties agreed on boundaries, restoring harmony in the dormitory.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <span className="text-xs font-medium text-base-content/60">
              2 hours ago
            </span>
            <button className="flex items-center gap-2 bg-primary text-primary-content px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
              <Heart className="w-4 h-4 fill-current" />
              Support (12)
            </button>
          </div>
        </article>

        {/* Report Card 2 */}
        <article className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">Science Building</span>
            </div>
            <span className="bg-warning/20 text-warning-content px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Under Review
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-base-content">
              Anonymous complaint investigation
            </h3>
            <p className="text-base text-base-content/80 leading-relaxed">
              AI Summary: A report regarding alleged ragging in the common area
              has been filed. The Anti-Raggingging squad is currently gathering
              testimonies from witnesses.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <span className="text-xs font-medium text-base-content/60">
              5 hours ago
            </span>
            <button className="flex items-center gap-2 border border-primary text-primary px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary/10 transition-all active:scale-95">
              <Heart className="w-4 h-4" />
              Support (8)
            </button>
          </div>
        </article>

        {/* Report Card 3 */}
        <article className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">Cafeteria</span>
            </div>
            <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Resolved
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-base-content">
              Awareness campaign proposal
            </h3>
            <p className="text-base text-base-content/80 leading-relaxed">
              AI Summary: Following a community meeting, a new awareness
              campaign about zero-tolerance towards ragging has been approved
              and scheduled for next week.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <span className="text-xs font-medium text-base-content/60">
              1 day ago
            </span>
            <button className="flex items-center gap-2 bg-primary text-primary-content px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
              <Heart className="w-4 h-4 fill-current" />
              Support (15)
            </button>
          </div>
        </article>

        {/* Infinite Scroll Indicator */}
        <div className="py-8 flex justify-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
              style={{ animationDelay: "100ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "200ms" }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}
