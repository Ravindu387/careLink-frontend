import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function VolunteerTopbar({
  onMenuClick,
}: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between gap-3 border-b border-[#D8E6EA] bg-white px-4 md:px-6">

      {/* LEFT SIDE */}
      <div className="flex min-w-0 flex-1 items-center gap-3">

        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-[#153F60] hover:bg-slate-100 lg:hidden"
        >
          <Menu size={19} />
        </button>

        {/* SEARCH */}
        <div className="flex h-9 w-full max-w-[420px] items-center gap-2 rounded-md border border-[#D7E5EA] bg-[#F6F9FA] px-3">
          <Search
            size={14}
            className="shrink-0 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search volunteers, tasks, skills..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />

          <span className="hidden rounded border border-[#D7E5EA] px-1.5 py-1 text-[8px] text-slate-400 sm:block">
            ⌘ K
          </span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">

        {/* OPERATIONAL AREA */}
        <div className="hidden items-center gap-2 border-r border-slate-200 pr-3 sm:flex">
          <div className="text-right">
            <p className="text-[7px] text-slate-400">
              OPERATIONAL AREA
            </p>

            <p className="text-[9px] font-bold text-[#153F60]">
              Greater Riverton
            </p>
          </div>

          <ChevronDown
            size={12}
            className="text-slate-500"
          />
        </div>

        {/* LANGUAGE */}
        <button className="hidden items-center gap-1 rounded-md border border-[#D7E5EA] px-2 py-2 text-[9px] text-slate-600 sm:flex">
          <Globe size={13} />
          EN
        </button>

        {/* HELP */}
        <button className="hidden rounded-md border border-[#D7E5EA] p-2 text-slate-600 hover:bg-slate-50 sm:block">
          <HelpCircle size={15} />
        </button>

        {/* NOTIFICATIONS */}
        <button className="relative rounded-md border border-[#D7E5EA] p-2 text-slate-600 hover:bg-slate-50">
          <Bell size={15} />

          <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[7px] font-bold text-white">
            5
          </span>
        </button>

        {/* DIVIDER */}
        <div className="hidden h-7 border-l border-slate-200 sm:block" />

        {/* USER PROFILE */}
        <button className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2785B2] text-[9px] font-bold text-white">
            NO
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-[9px] font-bold text-[#153F60]">
              Nadia O.
            </p>

            <p className="text-[8px] text-slate-400">
              Coordinator
            </p>
          </div>

          <ChevronDown
            size={12}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}