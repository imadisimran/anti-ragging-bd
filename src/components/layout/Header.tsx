import { Menu, Search } from "lucide-react";
import HeaderActions from "./HeaderActions";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-margin-desktop h-20 bg-surface-container-lowest border-b border-outline-variant">
      <div className="flex items-center gap-4 lg:gap-8">
        <button 
          className="md:hidden p-1 text-on-surface hover:text-secondary transition-colors cursor-pointer" 
          id="mobile-menu-toggle"
          onClick={() => {
            const sidebar = document.getElementById("sidebar");
            const overlay = document.getElementById("sidebar-overlay");
            if (sidebar && overlay) {
              const isOpen = sidebar.classList.contains("translate-x-0");
              if (isOpen) {
                sidebar.classList.remove("translate-x-0");
                sidebar.classList.add("-translate-x-full");
                overlay.classList.add("hidden");
                document.body.style.overflow = "";
              } else {
                sidebar.classList.remove("-translate-x-full");
                sidebar.classList.add("translate-x-0");
                overlay.classList.remove("hidden");
                document.body.style.overflow = "hidden";
              }
            }
          }}
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/logo.png"
            alt="Anti-Ragging Bangladesh Logo"
            width={100}
            height={100}
            className="w-18 h-18 object-contain rounded-md"
          />
          <span className="text-headline-sm md:text-headline-md font-extrabold text-primary truncate max-w-[180px] md:max-w-none">
            
          </span>
        </Link>
        <div className="relative hidden xl:block w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            className="w-full pl-10 pr-4 py-2 rounded-full border border-outline-variant bg-surface-container-low text-label-md focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface placeholder-on-surface-variant/50"
            placeholder="Search incidents, halls, or laws..."
            type="text"
          />
        </div>
      </div>
      <nav className="flex items-center gap-2 md:gap-stack-lg">
        <div className="hidden md:flex items-center gap-stack-lg">
          <a
            className="text-label-md font-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            href="#"
          >
            Guidelines
          </a>
          <a
            className="text-label-md font-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            href="#"
          >
            Resources
          </a>
        </div>
        <div className="hidden md:block h-6 w-px bg-outline-variant mx-2"></div>
        <Link href="/report" className="bg-primary text-on-primary px-3 md:px-4 py-2 rounded-lg text-label-sm md:text-label-md font-label-md hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer">
          Report Incident
        </Link>
        <div className="hidden md:block h-6 w-px bg-outline-variant mx-2"></div>
        <HeaderActions />
      </nav>
    </header>
  );
};
export default Header;
