
import {
  Search,
  Globe,
  Accessibility,
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[74px] w-full items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

      {/* Left Side - Search */}
      <div className="flex flex-1 items-center gap-3">

        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#173d5b] hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="flex w-full max-w-[520px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search help, shelters, services..."
            className="w-full bg-transparent text-xs text-[#173d5b] outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Language */}
        <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-[#173d5b] sm:flex">
          <Globe size={16} />
          English
        </button>

        {/* Accessibility */}
        <button
          className="hidden rounded-lg border border-slate-200 p-2 text-[#173d5b] hover:bg-slate-50 sm:block"
          aria-label="Accessibility"
        >
          <Accessibility size={19} />
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-lg border border-slate-200 p-2 text-[#173d5b] hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            4
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
          SK
        </div>

        {/* User Information */}
        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-[#173d5b]">
            Samira
          </p>

          <p className="text-[9px] text-slate-400">
            North Ward
          </p>
        </div>

        <button
          className="text-[#173d5b]"
          aria-label="Open profile"
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </header>
  );
}
