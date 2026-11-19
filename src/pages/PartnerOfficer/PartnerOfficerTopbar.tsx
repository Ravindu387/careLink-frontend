
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Globe,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

const PartnerOfficerTopbar = ({
  onMenuClick,
}: TopbarProps) => {
  const [search, setSearch] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("English");

  return (
    <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-[#d7e5eb] bg-white px-4 md:px-6">

      {/* Left section */}
      <div className="flex min-w-0 flex-1 items-center gap-3">

        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#153e5b] hover:bg-slate-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="relative w-full max-w-[440px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crises, referrals, partners, documents..."
            className="h-[39px] w-full rounded-lg border border-[#d3e1e8] bg-[#f8fafb] pl-9 pr-3 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#267ba4]"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="ml-3 flex shrink-0 items-center gap-2 md:gap-3">

        {/* Active operation */}
        <div className="hidden border-r border-[#d7e5eb] px-3 text-right sm:block md:px-5">
          <p className="text-[8px] uppercase text-slate-400">
            Active Operation
          </p>

          <p className="text-[10px] font-semibold text-[#153e5b]">
            Monsoon Floods 2025
          </p>
        </div>

        {/* Language */}
        <div className="relative">
          <button
            onClick={() => {
              setLanguageOpen(!languageOpen);
              setProfileOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e5eb] text-[#496c82] hover:bg-slate-50"
            title="Language"
          >
            <Globe size={18} />
          </button>

          {languageOpen && (
            <div className="absolute right-0 top-12 z-50 w-36 rounded-lg border border-[#d7e5eb] bg-white p-2 shadow-lg">
              {["English", "Sinhala", "Tamil"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setLanguageOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-xs hover:bg-slate-50 ${
                    language === lang
                      ? "bg-[#eaf3f7] font-semibold text-[#267ba4]"
                      : "text-slate-600"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          to="/partner/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e5eb] text-[#496c82] hover:bg-slate-50"
        >
          <Bell size={18} />

          <span className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#e84c59] px-1 text-[8px] font-bold text-white">
            9
          </span>
        </Link>

        {/* User profile */}
        <div className="relative border-l border-[#d7e5eb] pl-2 md:pl-3">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setLanguageOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#267ba4] text-[11px] font-bold text-white">
              SK
            </div>

            <div className="hidden text-left md:block">
              <p className="text-[10px] font-semibold text-[#153e5b]">
                Sara K.
              </p>

              <p className="text-[9px] text-slate-400">
                Partner Officer
              </p>
            </div>

            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-[#d7e5eb] bg-white p-2 shadow-lg">

              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold text-[#153e5b]">
                  Sara Khan
                </p>
                <p className="text-[10px] text-slate-400">
                  sara@globalrelief.org
                </p>
              </div>

              <Link
                to="/partner/organisation-profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                <User size={15} />
                My Profile
              </Link>

              <Link
                to="/partner/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                <Settings size={15} />
                Settings
              </Link>

              <button
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-xs text-red-500 hover:bg-red-50"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PartnerOfficerTopbar;
