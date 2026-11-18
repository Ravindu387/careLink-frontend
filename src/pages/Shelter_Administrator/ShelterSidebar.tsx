import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  Building2,
  ChartNoAxesColumn,
  ClipboardList,
  Users,
  BedDouble,
  Package,
  UserRound,
  Wrench,
  FileBarChart,
  Megaphone,
  Bell,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";

import type { LucideIcon } from "lucide-react";

interface AdminSidebarProps {
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/shelter-admin/dashboard", icon: LayoutDashboard },
  { name: "Shelter Management", path: "/shelter-admin/shelters", icon: Building2 },
  { name: "Occupancy Management", path: "/shelter-admin/occupancy", icon: ChartNoAxesColumn },
  { name: "Accommodation Requests", path: "/shelter-admin/requests", icon: ClipboardList, badge: "12" },
  { name: "Resident Management", path: "/shelter-admin/residents", icon: Users },
  { name: "Room & Bed Management", path: "/shelter-admin/rooms", icon: BedDouble },
  { name: "Resource & Inventory", path: "/shelter-admin/resources", icon: Package, badge: "5" },
  { name: "Staff Management", path: "/shelter-admin/staff", icon: UserRound },
  { name: "Health & Safety", path: "/shelter-admin/health-safety", icon: HeartPulse },
  { name: "Maintenance & Incidents", path: "/shelter-admin/maintenance", icon: Wrench, badge: "3" },
  { name: "Reports & Analytics", path: "/shelter-admin/reports", icon: FileBarChart },
  { name: "Disaster Updates", path: "/shelter-admin/disaster-updates", icon: Megaphone },
  { name: "Notifications", path: "/shelter-admin/notifications", icon: Bell, badge: "8" },
  { name: "Settings", path: "/shelter-admin/settings", icon: Settings },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    notificationService
      .getUnreadCount("ShelterAdmin")
      .then((count) => {
        if (isMounted) setUnreadCount(count);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <aside className="flex h-full w-[222px] shrink-0 flex-col bg-[#153f5e] text-white">
      {/* LOGO */}
      <div className="mx-4 flex h-[64px] shrink-0 items-center gap-3 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#49bea7] text-[#123d5b]">
          <HeartPulse size={23} />
        </div>

        <div>
          <h1 className="text-[17px] font-bold">CareLink</h1>
          <p className="text-[9px] text-blue-200">Shelter Operations</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="ml-auto lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={19} />
        </button>
      </div>

      {/* ACTIVE OPERATION */}
      <div className="mx-4 mt-3 shrink-0 rounded-xl border border-white/10 bg-white/10 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#49d4a8]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#70d9c2]">
            Active Operation
          </span>
        </div>

        <h3 className="text-[11px] font-bold">Riverton Flood Response</h3>
        <p className="mt-1 text-[9px] text-blue-200">
          5 shelters · Greater Riverton
        </p>
      </div>

      {/* SECTION TITLE */}
      <div className="shrink-0 px-5 pb-2 pt-5">
        <p className="text-[9px] font-bold uppercase tracking-[1px] text-blue-300/70">
          Shelter Administration
        </p>
      </div>

      {/* NAVIGATION - scrollbar hidden, scrolling remains enabled */}
      <nav className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.name === "Dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex min-h-[39px] items-center gap-3 rounded-lg border-l-[3px] px-3 py-2 transition-all ${
                  isActive
                    ? "border-[#55d3b1] bg-[#23688e] text-white"
                    : "border-transparent text-blue-100 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.8} />

              <span className="flex-1 text-[10px] font-medium">{item.name}</span>

              {(() => {
                const badge =
                  item.name === "Notifications" && unreadCount !== null
                    ? unreadCount > 0
                      ? String(unreadCount)
                      : null
                    : item.badge;

                if (!badge) return null;

                return (
                  <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {badge}
                  </span>
                );
              })()}
            </NavLink>
          );
        })}
      </nav>

      {/* USER PROFILE */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left hover:bg-white/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#26749c] text-[10px] font-bold">
            SA
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold">Sanjana Amarasinghe</p>
            <p className="text-[8px] text-blue-200">Shelter Administrator</p>
          </div>

          <ChevronRight size={15} />
        </button>
      </div>
    </aside>
  );
}
