import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Inbox,
  Package,
  Handshake,
  Map,
  Users,
  FileText,
  ChartNoAxesColumn,
  Bell,
  Clock,
  Settings,
  HeartHandshake,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const basePath = "/partner";

const navigation = [
  {
    label: "Partner Dashboard",
    path: `${basePath}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    label: "Organisation Profile",
    path: `${basePath}/organisation-profile`,
    icon: Building2,
  },
  {
    label: "Shared Crisis Events",
    path: `${basePath}/shared-crisis-events`,
    icon: AlertTriangle,
    badge: 3,
  },
  {
    label: "Assistance Referrals",
    path: `${basePath}/assistance-referrals`,
    icon: Inbox,
    badge: 12,
  },
  {
    label: "Resource Sharing",
    path: `${basePath}/resource-sharing`,
    icon: Package,
    badge: 5,
  },
  {
    label: "Collaboration Requests",
    path: `${basePath}/collaboration-requests`,
    icon: Handshake,
    badge: 7,
  },
  { label: "Field Activities", path: `${basePath}/field-activities`, icon: Map },
  { label: "Team & Contacts", path: `${basePath}/team-contacts`, icon: Users },
  { label: "Documents", path: `${basePath}/documents`, icon: FileText },
  { label: "Reports", path: `${basePath}/reports`, icon: ChartNoAxesColumn },
  {
    label: "Notifications",
    path: `${basePath}/notifications`,
    icon: Bell,
    badge: 9,
  },
  { label: "Audit Log", path: `${basePath}/audit-log`, icon: Clock },
  { label: "Settings", path: `${basePath}/settings`, icon: Settings },
];

const PartnerOfficerSidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState<
    number | null
  >(null);

  const displayName = user?.fullName || user?.userName || "Partner Officer";
  const orgName = user?.organizationName || "Verified Partner";
  const initials = getUserInitials(displayName, "PO");

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const metrics = await notificationService.getMetrics("partner");
        if (isMounted) {
          setUnreadNotifications(metrics.unread);
        }
      } catch {
        // Fallback default
      }
    };
    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className={SIDEBAR_THEME.overlay}
        />
      )}

      <aside
        className={`${SIDEBAR_THEME.asideBase} ${
          collapsed ? SIDEBAR_THEME.widthCollapsed : SIDEBAR_THEME.widthExpanded
        } lg:static lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND HEADER */}
        <div className={SIDEBAR_THEME.header}>
          <NavLink
            to="/partner/dashboard"
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
            aria-label="Close sidebar"
            className={SIDEBAR_THEME.mobileCloseBtn}
          >
            <X size={18} />
          </button>
        </div>

        {/* VERIFIED PARTNER STATUS CARD */}
        {!collapsed && (
          <div className={SIDEBAR_THEME.statusCardWrapper}>
            <div className={SIDEBAR_THEME.statusCard}>
              <div className={SIDEBAR_THEME.statusIndicatorRow}>
                <div className="flex items-center gap-2">
                  <span className={SIDEBAR_THEME.statusDot} />
                  <span className={SIDEBAR_THEME.statusLabel}>
                    VERIFIED PARTNER
                  </span>
                </div>
              </div>
              <h3 className={SIDEBAR_THEME.statusTitle}>{orgName}</h3>
              <p className={SIDEBAR_THEME.statusSubtitle}>
                Verified Humanitarian Partner
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
              <span>PARTNER WORKSPACE</span>
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
                const badgeValue =
                  item.label === "Notifications"
                    ? (unreadNotifications ?? item.badge)
                    : item.badge;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
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
                        <span className="flex min-w-0 items-center gap-3">
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
                            <span className="truncate">{item.label}</span>
                          )}
                        </span>

                        {!collapsed &&
                          badgeValue !== undefined &&
                          badgeValue > 0 && (
                            <span className={SIDEBAR_THEME.badge}>
                              {badgeValue}
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
                <p className={SIDEBAR_THEME.userRole}>Partner Officer</p>
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
};

export default PartnerOfficerSidebar;
