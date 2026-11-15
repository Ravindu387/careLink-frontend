
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";

interface EmergencyTopbarProps {
  onMenuClick: () => void;
}

export default function EmergencyTopbar({
  onMenuClick,
}: EmergencyTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

      {/* Search */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex w-full max-w-[430px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            type="text"
            placeholder="Search incidents, requests, locations, teams..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />

          <span className="hidden rounded border border-slate-200 px-1.5 py-1 text-[9px] text-slate-400 sm:block">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden text-right md:block">
          <p className="text-[8px] text-slate-400">OPERATIONAL AREA</p>
          <p className="text-[10px] font-semibold text-[#153f5e]">
            Greater Riverton
          </p>
        </div>

        <ChevronRight size={16} className="hidden text-slate-500 md:block" />

        <button className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
          <Globe size={16} />
          <span className="text-[9px]">EN</span>
        </button>

        <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
          <CircleHelp size={16} />
        </button>

        <button className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
          <Bell size={16} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
            14
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da5] text-[10px] font-bold text-white">
            AM
          </div>

          <div className="hidden sm:block">
            <p className="text-[10px] font-semibold text-[#153f5e]">
              Amina M.
            </p>
            <p className="text-[9px] text-slate-400">Coordinator</p>
          </div>

          <ChevronRight size={15} className="hidden text-slate-500 sm:block" />
        </div>
      </div>
    </header>
  );
}
