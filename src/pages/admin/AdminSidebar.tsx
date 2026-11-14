
import {
  Heart,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Activity,
  AlertTriangle,
  Clock,
  Bell,
  Settings,
  Globe,
  ChevronRight,
  X,
  Check,
  ChartNoAxesCombined,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const groups = [
  {
    title: "ADMINISTRATION",
    items: [
      {
        name: "System Overview",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "User Management",
        path: "/admin/users",
        icon: Users,
      },
      {
        name: "Roles & Permissions",
        path: "/admin/roles",
        icon: ShieldCheck,
      },
      {
        name: "Organisation Management",
        path: "/admin/organisations",
        icon: Building2,
      },
      {
        name: "Verification Queue",
        path: "/admin/verification",
        icon: Check,
        badge: 14,
      },
      {
        name: "Integration Health",
        path: "/admin/integrations",
        icon: Activity,
      },
      {
        name: "Security Events",
        path: "/admin/security-events",
        icon: AlertTriangle,
        badge: 3,
      },
      {
        name: "Audit Logs",
        path: "/admin/audit-logs",
        icon: Clock,
      },
      {
        name: "System Settings",
        path: "/admin/settings",
        icon: Settings,
      },
      {
        name: "Reports",
        path: "/admin/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

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
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col overflow-hidden bg-[#153E5D] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[73px] items-center gap-3 border-b border-white/10 px-4">
          <NavLink
            to="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#63BDA6] text-[#123B5C]">
              <Heart size={22} />
            </div>

            <div>
              <h2 className="text-sm font-bold leading-5">
                Humanitarian Aid Platform
              </h2>

              <p className="mt-1 text-[10px] text-slate-300">
                Secure response network
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="ml-auto lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.07] px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />

              <div>
                <p className="text-[9px] font-bold text-red-300">
                  ACTIVE RESPONSE
                </p>

                <p className="mt-1 text-[11px] font-semibold">
                  Monsoon Floods 2025
                </p>
              </div>
            </div>

            <ChevronRight size={15} />
          </div>
        </div>

        {/* NAVIGATION */}
        <div 
          className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >

          {groups.map((group) => (
            <div key={group.title} className="mb-4">

              <h3 className="mb-3 px-3 text-[9px] font-bold tracking-widest text-[#8BAFC5]">
                {group.title}
              </h3>

              <div className="space-y-1">

                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `relative flex min-h-[49px] items-center gap-3 rounded-[9px] px-3 text-[11px] transition-all duration-200 ${
                          isActive
                            ? "bg-[#287FA8] font-semibold text-white shadow-sm before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r-full before:bg-[#63BDA6]"
                            : "font-medium text-slate-200 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            strokeWidth={1.9}
                            className={
                              isActive
                                ? "shrink-0 text-white"
                                : "shrink-0 text-[#B8D0DF]"
                            }
                          />

                          <span className="flex-1 whitespace-nowrap">
                            {item.name}
                          </span>

                          {"badge" in item && item.badge !== undefined && (
                            <span className="flex h-[19px] min-w-[23px] items-center justify-center rounded-full bg-[#E64D5A] px-1.5 text-[9px] font-bold text-white">
                              {item.badge}
                            </span>
                          )}

                        </>
                      )}
                    </NavLink>
                  );
                })}

              </div>
            </div>
          ))}

          {/* ACCOUNT SECTION */}
          <div className="mb-4">
            <h3 className="mb-3 px-3 text-[9px] font-bold tracking-widest text-[#8BAFC5]">
              ACCOUNT
            </h3>

            <div className="space-y-1">

              <NavLink
                to="/admin/notifications"
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex min-h-[49px] items-center gap-3 rounded-[9px] px-3 text-[11px] transition ${
                    isActive
                      ? "bg-[#287FA8] font-semibold text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r-full before:bg-[#63BDA6]"
                      : "font-medium text-slate-200 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Bell size={18} />

                <span className="flex-1">Notifications</span>

                <span className="flex h-[19px] min-w-[23px] items-center justify-center rounded-full bg-[#E64D5A] px-1.5 text-[9px] font-bold text-white">
                  12
                </span>
              </NavLink>

            </div>
          </div>
        </div>

        {/* USER PROFILE */}
        <div className="border-t border-white/10 px-4 py-4">

          <NavLink
            to="/"
            onClick={onClose}
            className="mb-4 flex items-center gap-2 text-[11px] font-semibold text-slate-200 transition hover:text-white"
          >
            <Globe size={15} />
            Citizen portal
          </NavLink>

          <div className="mb-3 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2785B2] text-[10px] font-bold">
              {getInitials(user?.fullName)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold">
                {user?.fullName || "Authenticated User"}
              </p>

              <p className="truncate text-[9px] text-slate-300">
                {user?.roles?.[0] || "Authorized Officer"}
              </p>
            </div>

          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-white/5 py-1.5 text-[10px] font-medium text-red-200 transition hover:bg-red-500/20 hover:text-red-100"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>

      </aside>
    </>
  );
}
