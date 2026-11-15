
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";

interface FundingTopbarProps {
  onMenuClick: () => void;
}

export default function FundingTopbar({
  onMenuClick,
}: FundingTopbarProps) {
  return (
    <header className="h-[73px] shrink-0 bg-white border-b border-[#d5e3e9] px-5 md:px-7 flex items-center justify-between gap-4">

      {/* LEFT - SEARCH */}

      <div className="flex items-center gap-4 flex-1 min-w-0">

        <button
          onClick={onMenuClick}
          className="text-[#153e5d] hover:text-[#287da6]"
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div className="relative w-full max-w-[470px]">

          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search donations, donors, campaigns, references..."
            className="w-full h-[43px] rounded-xl border border-[#d5e3e9] bg-[#f8fafb] pl-11 pr-12 text-[12px] outline-none focus:border-[#287da6] transition"
          />

          <span className="absolute right-3 top-1/2 -translate-y-1/2 border border-[#d5e3e9] rounded-md px-2 py-1 text-[10px] text-slate-500">
            ⌘ K
          </span>

        </div>

      </div>

      {/* RIGHT - ACTIONS */}

      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        {/* CURRENCY */}

        <div className="hidden xl:block min-w-[115px]">

          <p className="text-[9px] text-slate-400 uppercase">
            Reporting Currency
          </p>

          <p className="text-[11px] font-semibold text-[#153e5d]">
            USD · $
          </p>

        </div>

        <ChevronRight
          size={16}
          className="hidden xl:block text-[#153e5d]"
        />

        {/* LANGUAGE */}

        <button className="h-[41px] px-2 md:px-3 border border-[#d5e3e9] rounded-xl flex items-center gap-1.5 hover:bg-slate-50">

          <Globe size={19} />

          <span className="text-[10px]">
            EN
          </span>

        </button>

        {/* HELP */}

        <button className="h-[41px] w-[41px] border border-[#d5e3e9] rounded-xl flex items-center justify-center hover:bg-slate-50">
          <CircleHelp size={20} />
        </button>

        {/* NOTIFICATIONS */}

        <button className="relative h-[41px] w-[41px] border border-[#d5e3e9] rounded-xl flex items-center justify-center hover:bg-slate-50">

          <Bell size={20} />

          <span className="absolute -top-1 -right-1 w-[17px] h-[17px] rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
            9
          </span>

        </button>

        {/* USER */}

        <button className="flex items-center gap-2 md:gap-3 border-l border-[#d5e3e9] pl-3 md:pl-4">

          <div className="w-[40px] h-[40px] rounded-full bg-[#237ba5] flex items-center justify-center text-white text-[12px] font-bold">
            MK
          </div>

          <div className="hidden sm:block text-left">

            <p className="text-[11px] font-semibold text-[#153e5d]">
              Maria K.
            </p>

            <p className="text-[9px] text-slate-500">
              Funding Officer
            </p>

          </div>

          <ChevronRight
            size={18}
            className="text-[#153e5d] ml-1"
          />

        </button>

      </div>

    </header>
  );
}
