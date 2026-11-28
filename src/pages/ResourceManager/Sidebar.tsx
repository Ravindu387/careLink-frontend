import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Package,
  LayoutDashboard,
  Warehouse,
  ClipboardList,
  Network,
  Truck,
  ArrowLeftRight,
  ShoppingCart,
  Users,
  TriangleAlert,
  ChartNoAxesCombined,
  Clock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    section: "LOGISTICS OPERATIONS",
    items: [
      {
        name: "Resource Dashboard",
        path: "/resource-manager/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Inventory",
        path: "/resource-manager/inventory",
        icon: Package,
      },
      {
        name: "Warehouses",
        path: "/resource-manager/warehouses",
        icon: Warehouse,
      },
      {
        name: "Resource Requests",
        path: "/resource-manager/requests",
        icon: ClipboardList,
        badge: 18,
      },
      {
        name: "Allocations",
        path: "/resource-manager/allocations",
        icon: Network,
        badge: 7,
      },
      {
        name: "Dispatch & Tracking",
        path: "/resource-manager/dispatch",
        icon: Truck,
        badge: 12,
      },
      {
        name: "Stock Transfers",
        path: "/resource-manager/transfers",
        icon: ArrowLeftRight,
      },
      {
        name: "Procurement",
        path: "/resource-manager/procurement",
        icon: ShoppingCart,
      },
      {
        name: "Suppliers",
        path: "/resource-manager/suppliers",
        icon: Users,
      },
      {
        name: "Alerts",
        path: "/resource-manager/alerts",
        icon: TriangleAlert,
        badge: 9,
      },
      {
        name: "Reports & Analytics",
        path: "/resource-manager/reports",
        icon: ChartNoAxesCombined,
      },
      {
        name: "Audit Log",
        path: "/resource-manager/audit-log",
        icon: Clock,
      },
      {
        name: "Settings",
        path: "/resource-manager/settings",
        icon: Settings,
      },
    ],
  },
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

  const displayName = user?.fullName || "Daniel Perera";
  const initials = getUserInitials(displayName, "DP");

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
            onClick={() => navigate("/resource-manager/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-90"
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
                    ACTIVE OPERATION
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
          {menuItems.map((section) => (
            <div key={section.section} className="mb-4 last:mb-0">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setSectionOpen((prev) => !prev)}
                  className={SIDEBAR_THEME.sectionHeadingBtn}
                >
                  <span>{section.section}</span>
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
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = activePage
                      ? activePage === item.name
                      : location.pathname === item.path;

                    return (
                      <button
                        key={item.name}
                        type="button"
                        title={collapsed ? item.name : undefined}
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate(item.name);
                          } else {
                            navigate(item.path);
                          }
                          onClose?.();
                        }}
                        className={`${SIDEBAR_THEME.menuItemBase} ${
                          active
                            ? SIDEBAR_THEME.menuItemActive
                            : SIDEBAR_THEME.menuItemInactive
                        } ${collapsed ? "justify-center px-0" : ""}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icon
                            size={17}
                            strokeWidth={1.8}
                            className={
                              active
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
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
                <p className={SIDEBAR_THEME.userRole}>Resource Manager</p>
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
