import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  Briefcase,
  Inbox,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ArrowUpToLine,
  Clock,
  Bell,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

interface CaseManagerSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    name: "Case Dashboard",
    path: "/case-manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Cases",
    path: "/case-manager/my-cases",
    icon: Briefcase,
    badge: "28",
  },
  {
    name: "Unassigned Cases",
    path: "/case-manager/unassigned-cases",
    icon: Inbox,
    badge: "63",
  },
  {
    name: "Case Verification",
    path: "/case-manager/verification",
    icon: ShieldCheck,
    badge: "14",
  },
  {
    name: "Priority Queue",
    path: "/case-manager/priority-queue",
    icon: AlertTriangle,
    badge: "12",
  },
  {
    name: "Potential Duplicates",
    path: "/case-manager/potential-duplicates",
    icon: Copy,
    badge: "9",
  },
  {
    name: "Escalated Cases",
    path: "/case-manager/escalated-cases",
    icon: ArrowUpToLine,
    badge: "7",
  },
  {
    name: "Request History",
    path: "/case-manager/request-history",
    icon: Clock,
  },
  {
    name: "Notifications",
    path: "/case-manager/notifications",
    icon: Bell,
    badge: "11",
  },
  {
    name: "Reports & Analytics",
    path: "/case-manager/reports",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Settings",
    path: "/case-manager/settings",
    icon: Settings,
  },
];

export default function CaseManagerSidebar({
  open = false,
  onClose,
}: CaseManagerSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  const displayName = user?.fullName || "Amina Mensah";
  const initials = getUserInitials(displayName, "AM");

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
        } lg:static lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND HEADER */}
        <div className={SIDEBAR_THEME.header}>
          <NavLink
            to="/case-manager/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          >
            <CareLinkLogo size={collapsed ? "compact" : "sidebar"} />

            {!collapsed && (
              <div className="min-w-0">
                <h1 className={SIDEBAR_THEME.brandTitle}>CareLink</h1>
                <p className={SIDEBAR_THEME.brandSubtitle}>Connecting Help. Saving Lives.</p>
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

        {/* ACTIVE RESPONSE */}
        {!collapsed && (
          <div className={SIDEBAR_THEME.statusCardWrapper}>
            <div className={SIDEBAR_THEME.statusCard}>
              <div className={SIDEBAR_THEME.statusIndicatorRow}>
                <div className="flex items-center gap-2">
                  <span className={SIDEBAR_THEME.statusDot} />
                  <span className={SIDEBAR_THEME.statusLabel}>
                    ACTIVE RESPONSE
                  </span>
                </div>
              </div>

              <h3 className={SIDEBAR_THEME.statusTitle}>Monsoon Floods 2025</h3>
              <p className={SIDEBAR_THEME.statusSubtitle}>
                Greater Riverton · Level 4
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
              <span>CASE OPERATIONS</span>
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
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/case-manager/dashboard"}
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

        {/* BOTTOM PROFILE */}
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
                <p className={SIDEBAR_THEME.userRole}>Case Manager</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
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
