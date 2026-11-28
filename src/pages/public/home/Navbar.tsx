import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, User, LogOut, LayoutDashboard } from "lucide-react";
import { CareLinkLogo } from "../../../components/common/CareLinkLogo";
import { useAuth } from "../../../context/AuthContext";

export interface NavItem {
  label: string;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Our Services", id: "services" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Emergency Response", id: "response" },
  { label: "Contact", id: "contact" },
];

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout, dashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  const handleDashboardRedirect = () => {
    if (dashboardPath) {
      navigate(dashboardPath);
    } else {
      navigate("/citizen/dashboard");
    }
  };

  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/90 py-2.5"
          : "bg-white/95 backdrop-blur-sm border-b border-slate-200/60 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Official Logo Brand */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("home");
            }}
            className="group flex items-center shrink-0 cursor-pointer transition hover:opacity-95"
            aria-label="CareLink Home"
          >
            <CareLinkLogo
              size="header"
              showText
              titleClassName="text-[#123B5C] font-extrabold tracking-tight text-xl sm:text-2xl"
              subtitleClassName="text-[#1D5F8A] font-semibold text-xs hidden sm:block"
              tagline="Connecting Help. Saving Lives."
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  type="button"
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-[#123B5C] bg-[#EFF6F7] font-semibold shadow-xs"
                      : "text-slate-600 hover:text-[#123B5C] hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#42B99A] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDashboardRedirect}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#123B5C] rounded-lg shadow-xs hover:bg-[#1D5F8A] transition-all cursor-pointer"
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#123B5C] border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#123B5C] rounded-lg shadow-xs hover:bg-[#1D5F8A] transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 rounded-lg text-[#123B5C] hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#EFF6F7] text-[#123B5C] border-l-4 border-[#42B99A]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <button
                  type="button"
                  onClick={handleDashboardRedirect}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#123B5C] rounded-lg shadow-sm"
                >
                  <LayoutDashboard size={16} />
                  <span>Go to My Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  <LogOut size={14} />
                  <span>Sign Out ({user.fullName || user.email})</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-[#123B5C] border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#123B5C] rounded-lg shadow-sm hover:bg-[#1D5F8A]"
                >
                  Get Started · Free Access
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
