
import {
  Search,
  ShieldCheck,
  Bell,
  ChevronRight,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[74px] w-full items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-7">

      {/* Search Bar */}
      <div className="flex w-full max-w-[488px] items-center gap-3 rounded-lg border border-slate-200 bg-[#f8fafb] px-3 py-3">

        <Search
          size={17}
          className="shrink-0 text-slate-500"
        />

        <input
          type="text"
          placeholder="Search resources, requests, dispatches..."
          className="w-full bg-transparent text-[11px] text-[#173f5d] outline-none placeholder:text-slate-400"
        />

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 text-[10px] text-slate-500">
          ⌘
        </div>
      </div>

      {/* Right Section */}
      <div className="ml-4 flex shrink-0 items-center gap-2 lg:gap-3">

        {/* Primary Hub */}
        <div className="hidden min-w-[155px] flex-col lg:flex">
          <span className="text-[8px] font-medium text-slate-400">
            PRIMARY HUB
          </span>

          <span className="mt-1 text-[10px] font-bold text-[#173f5d]">
            Central Logistics Hub
          </span>
        </div>

        {/* Divider */}
        <div className="mx-1 hidden h-11 border-l border-slate-200 lg:block" />

        {/* Security */}
        <button
          aria-label="Security"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#47677f] hover:bg-slate-50"
        >
          <ShieldCheck size={20} />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#47677f] hover:bg-slate-50"
        >
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
            9
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
          DP
        </div>

        {/* User Details */}
        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-[#173f5d]">
            Daniel P.
          </p>

          <p className="text-[9px] text-slate-400">
            Resource Manager
          </p>
        </div>

        {/* Profile Arrow */}
        <button
          aria-label="Profile"
          className="ml-1 text-[#47677f] hover:text-[#287da6]"
        >
          <ChevronRight size={19} />
        </button>

      </div>
    </header>
  );
}
