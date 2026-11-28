import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Heart,
  Home,
  Plus,
  ClipboardList,
  Map,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  Bell,
  HeartHandshake,
  Accessibility,
  LogOut,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  { name: "Home", icon: Home },
  { name: "Request Help", icon: Plus },
  { name: "My Requests", icon: ClipboardList, count: 2 },
  { name: "Nearby Support", icon: Map },
  { name: "Shelters", icon: House },
  { name: "Safety Updates", icon: TriangleAlert, count: 3 },
  { name: "My Household", icon: Users },
  { name: "My Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare, count: 2 },
  { name: "Notifications", icon: Bell, count: 4 },
  { name: "Feedback", icon: HeartHandshake },
  { name: "Profile & Settings", icon: Accessibility },
];

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  const citizenRoutes: Record<string, string> = {
    Home: "/citizen/dashboard",
    "Request Help": "/citizen/request-help",
    "My Requests": "/citizen/my-requests",
    "Nearby Support": "/citizen/nearby-support",
    Shelters: "/citizen/shelters",
    "Safety Updates": "/citizen/safety-updates",
    "My Household": "/citizen/my-household",
    "My Documents": "/citizen/my-documents",
    Messages: "/citizen/messages",
    Notifications: "/citizen/notifications",
    Feedback: "/citizen/feedback",
    "Profile & Settings": "/citizen/profile",
  };

  const displayName = user?.fullName || "Samira Khan";
  const initials = getUserInitials(displayName, "SK");

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
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
        } h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND HEADER */}
        <div className={SIDEBAR_THEME.header}>
          <button
            type="button"
            onClick={() => navigate("/citizen/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-90"
          >
            <CareLinkLogo size={collapsed ? "compact" : "sidebar"} />

            {!collapsed && (
              <div className="min-w-0">
                <h1 className={SIDEBAR_THEME.brandTitle}>CareLink</h1>
                <p className={SIDEBAR_THEME.brandSubtitle}>Connecting Help. Saving Lives.</p>
              </div>
            )}
          </button>

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
                    ACTIVE LOCAL RESPONSE
                  </span>
                </div>
              </div>

              <h3 className={SIDEBAR_THEME.statusTitle}>
                Greater Riverton Floods
              </h3>

              <p className={SIDEBAR_THEME.statusSubtitle}>
                Help centres and shelters are open
              </p>
            </div>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className={SIDEBAR_THEME.navScroll}>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setSectionOpen((prev) => !prev)}
              className={SIDEBAR_THEME.sectionHeadingBtn}
            >
              <span>YOUR SUPPORT</span>
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
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const targetPath = citizenRoutes[item.name];
                const isPathMatch =
                  location.pathname === targetPath ||
                  (item.name === "Home" &&
                    (location.pathname === "/citizen/dashboard" ||
                      location.pathname === "/citizen/home"));
                const isActive = activePage
                  ? activePage === item.name
                  : isPathMatch;

                return (
                  <button
                    key={item.name}
                    type="button"
                    title={collapsed ? item.name : undefined}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(item.name);
                      } else if (citizenRoutes[item.name]) {
                        navigate(citizenRoutes[item.name]);
                      }
                      onClose?.();
                    }}
                    className={`${SIDEBAR_THEME.menuItemBase} ${
                      isActive
                        ? SIDEBAR_THEME.menuItemActive
                        : SIDEBAR_THEME.menuItemInactive
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
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

                    {!collapsed && item.count !== undefined && (
                      <span className={SIDEBAR_THEME.badge}>{item.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* EMERGENCY HELP LINE */}
        {!collapsed && (
          <div className="mx-3.5 mb-2 shrink-0 rounded-xl border border-white/15 bg-white/[0.08] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#63BDA6]/20 text-[#63BDA6]">
                <Phone size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-[#A9C8DD]">
                  Emergency help line
                </p>
                <a
                  href="tel:112"
                  className="text-xs font-bold text-[#63BDA6] hover:underline"
                >
                  Call 112
                </a>
              </div>
            </div>
          </div>
        )}

        {/* CITIZEN PROFILE */}
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
                <p className={SIDEBAR_THEME.userRole}>Citizen account</p>
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
