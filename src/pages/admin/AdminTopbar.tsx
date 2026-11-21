import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  Globe,
  Bell,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";

type Props = {
  onMenu: () => void;
};

export default function AdminTopbar({ onMenu }: Props) {
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let isCancelled = false;
    const fetchUnread = async () => {
      try {
        const stats = await notificationService.getStats();
        if (!isCancelled) {
          setUnreadCount(stats.unreadCount);
        }
      } catch {
        // Fallback silently if offline
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Polling every 30s
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-[#64C9AD] bg-white px-4 md:px-6">

      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenu}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex h-9 w-full max-w-[360px] items-center gap-2 rounded-md border border-slate-200 bg-[#F5F8F9] px-3">
          <Search size={15} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests, people, locations..."
            className="w-full bg-transparent text-[11px] outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-[8px] text-slate-400">
            OPERATIONAL AREA
          </p>
          <p className="text-[10px] font-semibold">
            Greater Riverton
          </p>
        </div>

        <button className="flex h-8 items-center gap-1 rounded-md border border-[#64C9AD] px-2 text-[10px]">
          <Globe size={13} />
          EN
        </button>

        <button
          onClick={() => navigate("/admin/notifications")}
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 transition hover:bg-slate-50"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/admin/requests")}
          className="hidden h-8 items-center gap-2 rounded-md bg-[#123B5C] px-3 text-[10px] font-semibold text-white sm:flex"
        >
          <Plus size={13} />
          New request
        </button>

        <div
          title={user?.fullName || "User Profile"}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#123B5C] text-[9px] font-bold text-white shadow-sm"
        >
          {getInitials(user?.fullName)}
        </div>
      </div>
    </header>
  );
}
