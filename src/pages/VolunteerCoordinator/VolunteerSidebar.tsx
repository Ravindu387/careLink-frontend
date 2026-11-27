import { useState } from "react";
import {
  Users,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  ListTodo,
  CheckCheck,
  Sparkles,
  ChartNoAxesCombined,
  Award,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

type Props = {
  open: boolean;
  onClose: () => void;
};

const navigation = [
  {
    title: "COORDINATION WORKSPACE",
    items: [
      {
        name: "Volunteer Dashboard",
        path: "/volunteer-coordinator/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Volunteer Directory",
        path: "/volunteer-coordinator/directory",
        icon: Users,
      },
      {
        name: "Pending Verification",
        path: "/volunteer-coordinator/verification",
        icon: ShieldCheck,
        badge: "18",
      },
      {
        name: "Skills & Availability",
        path: "/volunteer-coordinator/skills",
        icon: SlidersHorizontal,
      },
      {
        name: "Tasks & Deployments",
        path: "/volunteer-coordinator/tasks",
        icon: ListTodo,
        badge: "12",
      },
      {
        name: "Volunteer Assignments",
        path: "/volunteer-coordinator/assignments",
        icon: CheckCheck,
      },
      {
        name: "AI Matching",
        path: "/volunteer-coordinator/ai-matching",
        icon: Sparkles,
        badge: "3",
      },
      {
        name: "Activity & Attendance",
        path: "/volunteer-coordinator/activity",
        icon: ChartNoAxesCombined,
      },
      {
        name: "Training & Certifications",
        path: "/volunteer-coordinator/training",
        icon: Award,
      },
      {
        name: "Communications",
        path: "/volunteer-coordinator/communications",
        icon: MessageSquare,
      },
      {
        name: "Reports & Analytics",
        path: "/volunteer-coordinator/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        name: "Notifications",
        path: "/volunteer-coordinator/notifications",
        icon: Bell,
        badge: "5",
      },
      {
        name: "Settings",
        path: "/volunteer-coordinator/settings",
        icon: Settings,
      },
    ],
  },
];

export default function VolunteerSidebar({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "COORDINATION WORKSPACE": true,
    ACCOUNT: true,
  });

  const displayName = user?.fullName || "Nadia Okafor";
  const initials = getUserInitials(displayName, "NO");

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !(prev[title] ?? true) }));
  };

  return (
    <>
      {open && (
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className={SIDEBAR_THEME.overlay}
        />
      )}

      <aside
        className={`${SIDEBAR_THEME.asideBase} ${
          collapsed ? SIDEBAR_THEME.widthCollapsed : SIDEBAR_THEME.widthExpanded
        } h-screen lg:sticky lg:top-0 lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND HEADER */}
        <div className={SIDEBAR_THEME.header}>
          <NavLink
            to="/volunteer-coordinator/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          >
            <CareLinkLogo size={collapsed ? "compact" : "sidebar"} />

            {!collapsed && (
              <div className="min-w-0">
                <h2 className={SIDEBAR_THEME.brandTitle}>CareLink</h2>
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

        {/* ACTIVE RESPONSE */}
        {!collapsed && (
          <div className={SIDEBAR_THEME.statusCardWrapper}>
            <div className={SIDEBAR_THEME.statusCard}>
              <div className={SIDEBAR_THEME.statusIndicatorRow}>
                <div className="flex items-center gap-2">
                  <span className={SIDEBAR_THEME.statusDot} />
                  <p className={SIDEBAR_THEME.statusLabel}>ACTIVE RESPONSE</p>
                </div>
              </div>

              <p className={SIDEBAR_THEME.statusTitle}>Monsoon Floods 2025</p>
              <p className={SIDEBAR_THEME.statusSubtitle}>
                Greater Riverton · Level 4
              </p>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className={SIDEBAR_THEME.navScroll}>
          {navigation.map((group) => {
            const isGroupExpanded = expandedGroups[group.title] ?? true;

            return (
              <div key={group.title} className="mb-4 last:mb-0">
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className={SIDEBAR_THEME.sectionHeadingBtn}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${
                        isGroupExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}

                {(isGroupExpanded || collapsed) && (
                  <div className={SIDEBAR_THEME.menuList}>
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/volunteer-coordinator/dashboard"}
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
              </div>
            );
          })}
        </nav>

        {/* USER PROFILE & SIGN OUT */}
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
                <p className={SIDEBAR_THEME.userRole}>Volunteer Coordinator</p>
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
