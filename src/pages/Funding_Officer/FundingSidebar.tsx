import { useState } from "react";
import {
  Heart,
  LayoutDashboard,
  Users,
  Megaphone,
  Package,
  Share2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Bell,
  ChartLine,
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

interface FundingSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "FUNDING OPERATIONS",
    items: [
      {
        name: "Funding Dashboard",
        path: "/funding-officer/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Donor Management",
        path: "/funding-officer/donors",
        icon: Users,
      },
      {
        name: "Donation Records",
        path: "/funding-officer/donations",
        icon: Heart,
        badge: 18,
      },
      {
        name: "Campaigns",
        path: "/funding-officer/campaigns",
        icon: Megaphone,
      },
      {
        name: "Resource Contributions",
        path: "/funding-officer/resources",
        icon: Package,
        badge: 8,
      },
      {
        name: "Fund Allocations",
        path: "/funding-officer/allocations",
        icon: Share2,
      },
      {
        name: "Expenditure",
        path: "/funding-officer/expenditure",
        icon: FileText,
      },
      {
        name: "Transparency Reports",
        path: "/funding-officer/transparency",
        icon: ShieldCheck,
      },
      {
        name: "Flagged Transactions",
        path: "/funding-officer/flagged",
        icon: AlertTriangle,
        badge: 5,
      },
      {
        name: "Notifications",
        path: "/funding-officer/notifications",
        icon: Bell,
        badge: 9,
      },
      {
        name: "Reports & Analytics",
        path: "/funding-officer/reports",
        icon: ChartLine,
      },
      {
        name: "Settings",
        path: "/funding-officer/settings",
        icon: FileText,
      },
    ],
  },
];

export default function FundingSidebar({ open, onClose }: FundingSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  const displayName = user?.fullName || "Maria Kone";
  const initials = getUserInitials(displayName, "MK");

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className={SIDEBAR_THEME.overlay}
          onClick={onClose}
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
            to="/funding-officer/dashboard"
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

              <p className={SIDEBAR_THEME.statusTitle}>Monsoon Floods 2025</p>
              <p className={SIDEBAR_THEME.statusSubtitle}>
                Greater Riverton · Level 4
              </p>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className={SIDEBAR_THEME.navScroll}>
          {navigation.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setSectionOpen((prev) => !prev)}
                  className={SIDEBAR_THEME.sectionHeadingBtn}
                >
                  <span>{group.label}</span>
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
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/funding-officer/dashboard"}
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

                            {!collapsed && item.badge !== undefined && (
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
          ))}
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
                <p className={SIDEBAR_THEME.userRole}>Funding Officer</p>
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
