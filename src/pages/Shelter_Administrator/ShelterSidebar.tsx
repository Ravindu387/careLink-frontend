import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/shelter-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Shelter Management",
    path: "/shelter-admin/shelters",
    icon: Building2,
  },
  {
    name: "Occupancy Management",
    path: "/shelter-admin/occupancy",
    icon: ChartNoAxesColumn,
  },
  {
    name: "Accommodation Requests",
    path: "/shelter-admin/requests",
    icon: ClipboardList,
    badge: "12",
  },
  {
    name: "Resident Management",
    path: "/shelter-admin/residents",
    icon: Users,
  },
  {
    name: "Room & Bed Management",
    path: "/shelter-admin/rooms",
    icon: BedDouble,
  },
  {
    name: "Resource & Inventory",
    path: "/shelter-admin/resources",
    icon: Package,
    badge: "5",
  },
  { name: "Staff Management", path: "/shelter-admin/staff", icon: UserRound },
  {
    name: "Health & Safety",
    path: "/shelter-admin/health-safety",
    icon: HeartPulse,
  },
  {
    name: "Maintenance & Incidents",
    path: "/shelter-admin/maintenance",
    icon: Wrench,
    badge: "3",
  },
  {
    name: "Reports & Analytics",
    path: "/shelter-admin/reports",
    icon: FileBarChart,
  },
  {
    name: "Disaster Updates",
    path: "/shelter-admin/disaster-updates",
    icon: Megaphone,
  },
  {
    name: "Notifications",
    path: "/shelter-admin/notifications",
    icon: Bell,
    badge: "8",
  },
  { name: "Settings", path: "/shelter-admin/settings", icon: Settings },
];

export default function AdminSidebar({
  open = false,
  onClose,
}: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  const displayName = user?.fullName || "Sanjana Amarasinghe";
  const initials = getUserInitials(displayName, "SA");

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className={SIDEBAR_THEME.overlay}
        />
      )}

      <aside
        className={`${SIDEBAR_THEME.asideBase} ${
          collapsed ? SIDEBAR_THEME.widthCollapsed : SIDEBAR_THEME.widthExpanded
        } h-full lg:static lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND HEADER */}
        <div className={SIDEBAR_THEME.header}>
          <NavLink
            to="/shelter-admin/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          >
            <CareLinkLogo size={collapsed ? "compact" : "sidebar"} />

            {!collapsed && (
              <div className="min-w-0">
                <h1 className={SIDEBAR_THEME.brandTitle}>CareLink</h1>
                <p className={SIDEBAR_THEME.brandSubtitle}>
                  Connecting Help. Saving Lives.
                </p>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={SIDEBAR_THEME.collapseBtn}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className={SIDEBAR_THEME.mobileCloseBtn}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ACTIVE OPERATION */}
        {!collapsed && (
          <div className={SIDEBAR_THEME.statusCardWrapper}>
            <div className={SIDEBAR_THEME.statusCard}>
              <div className={SIDEBAR_THEME.statusIndicatorRow}>
                <div className="flex items-center gap-2">
                  <span className={SIDEBAR_THEME.statusDot} />
                  <span className={SIDEBAR_THEME.statusLabel}>
                    ACTIVE OPERATION
                  </span>
                </div>
              </div>

              <h3 className={SIDEBAR_THEME.statusTitle}>
                Riverton Flood Response
              </h3>
              <p className={SIDEBAR_THEME.statusSubtitle}>
                5 shelters · Greater Riverton
              </p>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className={SIDEBAR_THEME.navScroll}>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setSectionOpen((prev) => !prev)}
              className={SIDEBAR_THEME.sectionHeadingBtn}
            >
              <span>SHELTER ADMINISTRATION</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${
                  sectionOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>
          )}

          {(sectionOpen || collapsed) && (
            <div className={SIDEBAR_THEME.menuList}>
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.name === "Dashboard"}
                    onClick={onClose}
                    title={collapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `${SIDEBAR_THEME.menuItemBase} ${
                        isActive
                          ? SIDEBAR_THEME.menuItemActive
                          : SIDEBAR_THEME.menuItemInactive
                      } ${collapsed ? "justify-center px-0" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex min-w-0 items-center gap-3">
                          <Icon
                            size={17}
                            strokeWidth={1.8}
                            className={
                              isActive
                                ? SIDEBAR_THEME.iconActive
                                : SIDEBAR_THEME.iconInactive
                            }
                          />
                          {!collapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>

                        {!collapsed && item.badge && (
                          <span className={SIDEBAR_THEME.badge}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>

        {/* USER PROFILE FOOTER */}
        <div className={SIDEBAR_THEME.footer}>
          <div
            className={`${SIDEBAR_THEME.profileRow} ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className={SIDEBAR_THEME.avatar}>{initials}</div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className={SIDEBAR_THEME.userName}>{displayName}</p>
                <p className={SIDEBAR_THEME.userRole}>Shelter Administrator</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            title="Sign out"
            className={SIDEBAR_THEME.signOutBtn}
          >
            <LogOut size={14} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
