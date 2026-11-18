
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    notificationService
      .getUnreadCount("ShelterAdmin")
      .then((count) => {
        if (isMounted) setUnreadCount(count);
      })
      .catch((err) => console.warn("Failed to fetch unread count:", err));

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <header className="z-30 flex h-[56px] w-full shrink-0 items-center justify-between gap-3 border-b border-[#d6e4e9] bg-white px-4 sm:px-5">

      {/* LEFT SIDE */}
      <div className="flex min-w-0 flex-1 items-center gap-2">

        {/* MOBILE MENU */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-[#17496b] hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        {/* SEARCH */}
        <div className="relative w-full max-w-[355px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search residents, shelters, requests..."
            className="h-[37px] w-full rounded-lg border border-[#d7e4e9] bg-[#f7fafb] pl-9 pr-12 text-[11px] text-[#153f5e] outline-none focus:border-[#2782a8] focus:ring-2 focus:ring-blue-100"
          />

          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#d7e4e9] bg-white px-1.5 py-1 text-[9px] text-slate-500">
            ⌘ K
          </span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        {/* OPERATIONAL AREA */}
        <div className="hidden items-center gap-2 border-r border-[#d7e4e9] pr-4 md:flex">
          <div>
            <p className="text-[8px] uppercase tracking-wide text-slate-400">
              Operational Area
            </p>

            <p className="text-[10px] font-bold text-[#153f5e]">
              Greater Riverton
            </p>
          </div>

          <ChevronRight
            size={14}
            className="ml-2 text-[#153f5e]"
          />
        </div>

        {/* LANGUAGE */}
        <button
          type="button"
          aria-label="Select language"
          className="flex h-[35px] items-center gap-1.5 rounded-lg border border-[#d7e4e9] px-2 text-[10px] text-[#153f5e] hover:bg-slate-50"
        >
          <Globe size={15} />
          EN
        </button>

        {/* HELP */}
        <button
          type="button"
          aria-label="Help"
          className="flex h-[35px] w-[35px] items-center justify-center rounded-lg border border-[#d7e4e9] text-[#496d85] hover:bg-slate-50"
        >
          <CircleHelp size={16} />
        </button>

        {/* NOTIFICATIONS */}
        <Link
          to="/shelter-admin/notifications"
          aria-label="Notifications"
          className="relative flex h-[35px] w-[35px] items-center justify-center rounded-lg border border-[#d7e4e9] text-[#496d85] hover:bg-slate-50 transition"
        >
          <Bell size={17} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* USER PROFILE */}
        <div className="flex items-center gap-2 border-l border-[#d7e4e9] pl-3">
          <div className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#236b92] text-[10px] font-bold text-white">
            SA
          </div>

          <div className="hidden sm:block">
            <p className="text-[10px] font-bold text-[#153f5e]">
              Sanjana A.
            </p>

            <p className="text-[8px] text-slate-400">
              Administrator
            </p>
          </div>

          <ChevronRight
            size={15}
            className="ml-1 text-[#496d85]"
          />
        </div>
      </div>
    </header>
  );
}
