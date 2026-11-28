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
  ChevronDown,
  ChevronLeft,
  X,
  Check,
  ChartNoAxesCombined,
  LogOut,
  Sparkles,
  Package,
  Building,
  UserCheck,
  Coins,
  ClipboardList,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { aiRecommendationService } from "../../services/aiRecommendationService";
import { verificationService } from "../../services/verificationService";
import { securityEventService } from "../../services/securityEventService";
import { notificationService } from "../../services/notificationService";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

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
        name: "AI Recommendation Review",
        path: "/admin/ai-review",
        icon: Sparkles,
        badge: 8,
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
      {
        name: "Notifications",
        path: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "OPERATIONS & LOGISTICS",
    items: [
      {
        name: "Crisis Management",
        path: "/admin/crises",
        icon: AlertTriangle,
      },
      {
        name: "Assistance Requests",
        path: "/admin/requests",
        icon: ClipboardList,
      },
      {
        name: "Resource Inventory",
        path: "/admin/resources",
        icon: Package,
      },
      {
        name: "Shelter Network",
        path: "/admin/shelters",
        icon: Building,
      },
      {
        name: "Volunteer Directory",
        path: "/admin/volunteers",
        icon: UserCheck,
      },
      {
        name: "Donation Records",
        path: "/admin/donations",
        icon: Coins,
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

  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    ADMINISTRATION: true,
    "OPERATIONS & LOGISTICS": true,
  });

  const [aiReviewCount, setAiReviewCount] = useState<number>(8);
  const [verificationCount, setVerificationCount] = useState<number>(14);
  const [securityCount, setSecurityCount] = useState<number>(3);
  const [notificationCount, setNotificationCount] = useState<number>(12);

  useEffect(() => {
    let isCancelled = false;
    const fetchBadges = async () => {
      try {
        const [aiMetrics, verStats, secStats, notifStats] =
          await Promise.allSettled([
            aiRecommendationService.getMetrics(),
            verificationService.getStats(),
            securityEventService.getStats(),
            notificationService.getStats(),
          ]);

        if (isCancelled) return;

        if (aiMetrics.status === "fulfilled" && aiMetrics.value) {
          setAiReviewCount(aiMetrics.value.awaitingReviewCount);
        }
        if (verStats.status === "fulfilled" && verStats.value) {
          setVerificationCount(verStats.value.totalPending);
        }
        if (secStats.status === "fulfilled" && secStats.value) {
          setSecurityCount(secStats.value.openEvents);
        }
        if (notifStats.status === "fulfilled" && notifStats.value) {
          setNotificationCount(notifStats.value.unreadCount);
        }
      } catch {
        // keep fallback values
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 15000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getBadgeValue = (
    path: string,
    defaultBadge?: number
  ): number | undefined => {
    if (path === "/admin/ai-review" || path === "/admin/ai-recommendations")
      return aiReviewCount;
    if (path === "/admin/verification") return verificationCount;
    if (path === "/admin/security-events") return securityCount;
    if (path === "/admin/notifications") return notificationCount;
    return defaultBadge;
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !(prev[title] ?? true) }));
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.fullName || "System Administrator";

  return (
    <>
      {open && (
        <button
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
            to="/admin/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          >
            <CareLinkLogo size={collapsed ? "compact" : "sidebar"} />

            {!collapsed && (
              <div className="min-w-0">
                <h2 className={SIDEBAR_THEME.brandTitle}>
                  CareLink
                </h2>
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
            <NavLink
              to="/admin/crises"
              onClick={onClose}
              className={`flex items-center justify-between ${SIDEBAR_THEME.statusCard}`}
            >
              <div className="min-w-0">
                <div className={SIDEBAR_THEME.statusIndicatorRow}>
                  <div className="flex items-center gap-2">
                    <span className={SIDEBAR_THEME.statusDot} />
                    <span className={SIDEBAR_THEME.statusLabel}>
                      ACTIVE RESPONSE
                    </span>
                  </div>
                </div>
                <p className={SIDEBAR_THEME.statusTitle}>Monsoon Floods 2025</p>
                <p className={SIDEBAR_THEME.statusSubtitle}>
                  Greater Riverton · Level 4
                </p>
              </div>
              <ChevronRight size={15} className="shrink-0 text-[#A9C8DD]" />
            </NavLink>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className={SIDEBAR_THEME.navScroll}>
          {groups.map((group) => {
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
                      const badgeVal = getBadgeValue(item.path, item.badge);

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end
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

                              {!collapsed &&
                                badgeVal !== undefined &&
                                badgeVal > 0 && (
                                  <span className={SIDEBAR_THEME.badge}>
                                    {badgeVal > 99 ? "99+" : badgeVal}
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

        {/* USER PROFILE FOOTER */}
        <div className={SIDEBAR_THEME.footer}>
          {!collapsed && (
            <NavLink
              to="/"
              onClick={onClose}
              className="mb-2.5 flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-[#D1E1EC] transition hover:bg-white/10 hover:text-white"
            >
              <Globe size={15} />
              <span>Citizen portal</span>
            </NavLink>
          )}

          <div
            className={`${SIDEBAR_THEME.profileRow} ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className={SIDEBAR_THEME.avatar}>
              {getUserInitials(displayName, "SA")}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className={SIDEBAR_THEME.userName}>{displayName}</p>
                <p className={SIDEBAR_THEME.userRole}>
                  {user?.roles?.[0] || "System Administrator"}
                </p>
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
