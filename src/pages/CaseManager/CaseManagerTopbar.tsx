import { useState } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function CaseManagerTopbar() {

  const [search, setSearch] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  return (

    <header className="sticky top-0 z-30 flex h-[75px] w-full items-center justify-between gap-4 border-b border-[#d5e3e9] bg-white px-5 md:px-7">

      {/* SEARCH BAR */}

      <div className="flex h-[43px] w-full max-w-[485px] items-center gap-3 rounded-lg border border-[#d5e3e9] bg-[#f8fafb] px-3">

        <Search
          size={17}
          className="shrink-0 text-[#8296aa]"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case ID, applicant, location..."
          className="w-full bg-transparent text-[12px] text-[#123c5b] outline-none placeholder:text-[#a0b1c0]"
        />

        <div className="flex h-[30px] w-[29px] shrink-0 items-center justify-center rounded-md border border-[#d5e3e9] text-[10px] text-[#8296aa]">
          ⌘
        </div>

      </div>

      {/* RIGHT NAVIGATION */}

      <div className="hidden items-center gap-3 md:flex">

        {/* OPERATIONAL AREA */}

        <button className="flex items-center gap-3 border-r border-[#d5e3e9] pr-4">

          <div className="text-right">

            <p className="text-[9px] font-medium uppercase tracking-wide text-[#8296aa]">
              OPERATIONAL AREA
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-[#123c5b]">
              Greater Riverton
            </p>

          </div>

          <ChevronRight size={14} className="text-[#8296aa]" />

        </button>

        {/* LANGUAGE */}

        <button className="flex h-[41px] items-center gap-2 rounded-lg border border-[#d5e3e9] px-3 text-[11px] text-[#45647d] hover:bg-[#f5f9fb]">

          <Globe size={17} />

          EN

        </button>

        {/* HELP */}

        <button
          className="flex h-[41px] w-[41px] items-center justify-center rounded-lg border border-[#d5e3e9] text-[#45647d] hover:bg-[#f5f9fb]"
          title="Help"
        >
          <HelpCircle size={19} />
        </button>

        {/* NOTIFICATIONS */}

        <div className="relative">

          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative flex h-[41px] w-[41px] items-center justify-center rounded-lg border border-[#d5e3e9] text-[#45647d] hover:bg-[#f5f9fb]"
          >

            <Bell size={19} />

            <span className="absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#e53945] px-1 text-[9px] font-bold text-white">
              11
            </span>

          </button>

          {showNotifications && (

            <div className="absolute right-0 top-12 z-50 w-[280px] rounded-xl border border-[#d5e3e9] bg-white p-4 shadow-xl">

              <h3 className="text-[14px] font-semibold text-[#123c5b]">
                Notifications
              </h3>

              <div className="mt-4 space-y-3">

                <div className="border-b border-[#edf1f3] pb-3">

                  <p className="text-[12px] font-medium">
                    New assistance request
                  </p>

                  <p className="mt-1 text-[10px] text-[#8296aa]">
                    A new case requires verification.
                  </p>

                </div>

                <div className="border-b border-[#edf1f3] pb-3">

                  <p className="text-[12px] font-medium">
                    Critical case escalated
                  </p>

                  <p className="mt-1 text-[10px] text-[#8296aa]">
                    A case needs immediate attention.
                  </p>

                </div>

              </div>

              <button
                onClick={() => setShowNotifications(false)}
                className="mt-3 w-full text-center text-[11px] text-[#287fa9]"
              >
                Close
              </button>

            </div>

          )}

        </div>

        {/* USER PROFILE */}

        <div className="relative border-l border-[#d5e3e9] pl-3">

          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5"
          >

            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#287fa9] text-[12px] font-bold text-white">
              AM
            </div>

            <div className="text-left">

              <p className="text-[11px] font-semibold text-[#123c5b]">
                Amina M.
              </p>

              <p className="text-[9px] text-[#8296aa]">
                Case Manager
              </p>

            </div>

            <ChevronDown
              size={14}
              className="text-[#8296aa]"
            />

          </button>

          {showProfile && (

            <div className="absolute right-0 top-12 z-50 w-[190px] rounded-xl border border-[#d5e3e9] bg-white p-2 shadow-xl">

              <button
                onClick={() => setShowProfile(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] hover:bg-[#f1f6f8]"
              >
                <User size={15} />
                My Profile
              </button>

              <button
                onClick={() => setShowProfile(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] hover:bg-[#f1f6f8]"
              >
                <Settings size={15} />
                Account Settings
              </button>

              <div className="my-1 border-t border-[#e5edf1]" />

              <button
                onClick={() => setShowProfile(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-red-500 hover:bg-red-50"
              >
                <LogOut size={15} />
                Sign Out
              </button>

            </div>

          )}

        </div>

      </div>

    </header>

  );
}