import Image from "next/image";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Home as HomeIcon, 
  AlertCircle, 
  BookOpen, 
  LifeBuoy, 
  Settings, 
  Filter, 
  MapPin, 
  Heart, 
  PlusCircle, 
  Plus,
  CheckCircle
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* TopNavBar Header Shell */}
      <header className="bg-base-100/90 backdrop-blur-md border-b border-base-200 docked full-width top-0 z-50 shadow-sm fixed w-full">
        <div className="flex justify-between items-center h-16 px-6 w-full max-w-full mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <span className="text-xl font-black tracking-tighter text-primary">Anti-Ragging BD</span>
          </div>
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 w-5 h-5" />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-base-200 border border-base-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                placeholder="Search Complaints" 
                type="text" 
              />
            </div>
          </div>
          {/* Profile & Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-base-content/60 hover:bg-base-200 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-base-content/60 hover:bg-base-200 rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-base-300 ml-2">
              <Image 
                alt="User avatar" 
                className="h-full w-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaALiPueGbJ2qOLFo42ASybZUnhfCVisWWklWpFIK1kksyv2qRjDi6SUUibxWhxLj3B-doHYfN1Re0svyRXgWvPt0Ix9WPyes9BLSahvh1W0qTQj34pN0unEBTj2OsmjJfzlkoffSJYao_sxpFY0VinNo-LDSoWGyGSniiD72D6febrP6iDu5sXVkY0LSzyb3j94n7mnqUFfuxDq6FG6_R0dHtb232Gqn8lu3fCexnPjNwdfBhNiCGaeH4FWzA21U9hE44RowgciE" 
                width={32}
                height={32}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 flex min-h-screen">
        {/* Left Sidebar: Minimalist Navigation */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-base-200 bg-base-100 hidden lg:flex flex-col p-4 space-y-2">
          <nav className="flex flex-col space-y-1">
            <a className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg font-semibold transition-all scale-95 active:scale-100" href="#">
              <HomeIcon className="w-5 h-5" />
              <span className="text-base">Home</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg" href="#">
              <AlertCircle className="w-5 h-5" />
              <span className="text-base">My Complaints</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg" href="#">
              <BookOpen className="w-5 h-5" />
              <span className="text-base">Anti-Raggingging Policies</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg" href="#">
              <LifeBuoy className="w-5 h-5" />
              <span className="text-base">Support</span>
            </a>
            <hr className="my-4 border-base-200" />
            <a className="flex items-center gap-3 px-4 py-3 text-base-content/60 hover:text-primary hover:bg-base-200 transition-all rounded-lg" href="#">
              <Settings className="w-5 h-5" />
              <span className="text-base">Settings</span>
            </a>
          </nav>
          
          <div className="mt-auto p-4 bg-base-200 rounded-xl">
            <p className="text-xs text-base-content/60 uppercase tracking-widest mb-2 font-semibold">Community</p>
            <div className="flex -space-x-2">
              <Image width={32} height={32} className="h-8 w-8 rounded-full border-2 border-base-100" alt="Community member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv01OCly1P8qVv65zYTrqya0pDHaZ2GHGNW9M5RNk9Yb9fAEMoBev3lJWzPh4z_aPO0ajpfzNNYe_7mcB8Tu_TdNgBOjGAXSjWwpo7r3peCR8lxDk7YEq6VXWlAxHUsdOjs4RDloxuo5-_5-i9Qo5iMhdGGroGZrTaEOu7W7ZOMuLQkuOKtCjKpKkg514O_dz0CdLgwe_WTvg1EmE9nw4EiKqkOYN53CibV6Qa9zZC20vF_8C_Rzmz3w_zF8UzH43_RMPM6lhTOPY" />
              <Image width={32} height={32} className="h-8 w-8 rounded-full border-2 border-base-100" alt="Community member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkMefgHrAisXATRXgSTKcpSBsJ1rfxa_MVFrFCEV5aLXpuvhVtJMoJZcmVKNTyFkBheq-NYtvVNIjNxWG_4JQUeQWUD7t_j63IbrTlNr0Mg2uU964Dxuhrcu-ECAWtH-5i3PfYyyNjxk61Mykyqttv8y8Th5oyVOqEppqSJBtj21M4dOg5Ugaf39ABGZS32z-69pUUMUeEytk0XXUBxuY6TyUrM2TYKaj0WC3j73_9LI0lY4wtLrfV5_9Fn_pTr1o6dlT0r43CTSg" />
              <Image width={32} height={32} className="h-8 w-8 rounded-full border-2 border-base-100" alt="Community member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIG_NaWzbFpDimrbl8jfpy-TAqTfNnuuXWazJwv-hNDIa_1l4Apx5oW0IrmVODM2mr_kprd6zRmPYcNdBR9JmSjQ-apxd0Rgo7Yjkg1t1sTh3jyhdXFoRG4SABmHVwNc6ick6NoC2Vm3QzEx0mAzRsrIwRafKoqbriOa7idxjMmbODVzAbT7nT--DsdYt2mkPdJfjN_Rseqb0s5iOdOZ6IahXmzBUhQac0Jpmr-hYVeoLXyJmILk03LJ9ytK0z-46tSU1l0pBYhhI" />
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border-2 border-base-100">+12</div>
            </div>
          </div>
        </aside>

        {/* Center Column: Infinite Scroll Feed */}
        <main className="flex-1 bg-base-200/50 lg:ml-64 lg:mr-80 p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header Stats for Feed */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-base-content">Recent Complaints</h2>
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
                <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Resolved</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-base-content">Ragging incident mediation completed</h3>
                <p className="text-base text-base-content/80 leading-relaxed">AI Summary: A restorative circle was facilitated between a senior and a junior student regarding inappropriate behavior. Both parties agreed on boundaries, restoring harmony in the dormitory.</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-base-200">
                <span className="text-xs font-medium text-base-content/60">2 hours ago</span>
                <button className="flex items-center gap-2 bg-primary text-primary-content px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
                  <Heart className="w-4 h-4 fill-current" />
                  Support
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
                <span className="bg-warning/20 text-warning-content px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Under Review</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-base-content">Anonymous complaint investigation</h3>
                <p className="text-base text-base-content/80 leading-relaxed">AI Summary: A report regarding alleged ragging in the common area has been filed. The Anti-Raggingging squad is currently gathering testimonies from witnesses.</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-base-200">
                <span className="text-xs font-medium text-base-content/60">5 hours ago</span>
                <button className="flex items-center gap-2 border border-primary text-primary px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary/10 transition-all active:scale-95">
                  <Heart className="w-4 h-4" />
                  Support
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
                <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Resolved</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-base-content">Awareness campaign proposal</h3>
                <p className="text-base text-base-content/80 leading-relaxed">AI Summary: Following a community meeting, a new awareness campaign about zero-tolerance towards ragging has been approved and scheduled for next week.</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-base-200">
                <span className="text-xs font-medium text-base-content/60">1 day ago</span>
                <button className="flex items-center gap-2 bg-primary text-primary-content px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-95">
                  <Heart className="w-4 h-4 fill-current" />
                  Support
                </button>
              </div>
            </article>

            {/* Infinite Scroll Indicator */}
            <div className="py-8 flex justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Safety Stats & CTA */}
        <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-80 border-l border-base-200 bg-base-100 hidden xl:flex flex-col p-6 space-y-6">
          {/* Submit CTA */}
          <button className="w-full bg-primary text-primary-content py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
            <PlusCircle className="w-5 h-5" />
            <span className="text-base">File a Complaint</span>
          </button>
          
          {/* Safety Stats Widget */}
          <div className="bg-base-200 rounded-xl p-6 border border-base-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-base-content">System Health</h4>
              <CheckCircle className="text-success w-5 h-5" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-5xl font-bold text-primary leading-none">12</p>
                <p className="text-sm text-base-content/60 font-medium mt-1">Cases Resolved This Month</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
                <div>
                  <p className="text-2xl font-semibold text-base-content">98%</p>
                  <p className="text-xs font-medium text-base-content/60">Resolution Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-base-content">4.2h</p>
                  <p className="text-xs font-medium text-base-content/60">Avg Response</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visualization Widget */}
          <div className="flex-1 rounded-xl bg-base-100 border border-base-200 overflow-hidden relative">
            <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent z-10">
              <p className="text-white font-bold text-sm">Safety Hotspot Map</p>
              <p className="text-white/80 text-xs font-medium">Live data visualization</p>
            </div>
            <Image 
              className="h-full w-full object-cover absolute inset-0" 
              alt="Safety Hotspot Map" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2HnYrPZ_YzqSAXYaEFGAL8TS7crMHCyxyNlRPmyDV54xrkkLzCW1rjOyjzViRKOL1kdV4tNSlztzEt7ZdXO1Xta9zxWhVzyLc2CIfFBo2U3emV9BPco0OprUGYcHuxFHZ-FsQ2QTjgjRJy4IacDlONl6JSrEIAx01F48hr-ngfDHb7gznbo2Zb-_r-hd2oGuKay0W0dCck8mKUOhZ7iPI2n1FdWCsdBhoVyRclwBf5qR8qvSSDeCPQ3YrBU-17PUScKboQlrY8nw" 
              fill
            />
          </div>
          
          {/* Solidarity Leaderboard */}
          <div className="p-4 rounded-xl border border-dashed border-base-300">
            <h4 className="text-xs font-semibold text-base-content/70 uppercase mb-3">Top Contributors</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-base-300 border border-base-300"></div>
                <span className="text-sm text-base-content/80">Jordan S. (8 Resolved)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-base-300 border border-base-300"></div>
                <span className="text-sm text-base-content/80">Amara P. (5 Resolved)</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Bottom Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-base-100 border-t border-base-200 flex items-center justify-around md:hidden z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-base-content/50">
          <AlertCircle className="w-6 h-6" />
          <span className="text-[10px]">Complaints</span>
        </button>
        <button className="flex flex-col items-center gap-1 -mt-8">
          <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center text-primary-content shadow-lg">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-primary font-bold mt-1">Submit</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-base-content/50">
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px]">Policies</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-base-content/50">
          <Settings className="w-6 h-6" />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>
    </>
  );
}
