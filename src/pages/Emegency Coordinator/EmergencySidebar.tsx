import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  TriangleAlert,
  Inbox,
  ArrowUp,
  Sparkles,
  Package,
  House,
  Building2,
  Map,
  FileText,
  Clock,
  Bell,
  Settings,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  emergencySidebarService,
  type EmergencySidebarState,
} from "../../services/emergencySidebarService";
import { SIDEBAR_THEME, getUserInitials } from "../../constants/layoutTheme";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

interface EmergencySidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const baseNavigation = [
  { name: "Operations Dashboard", path: "dashboard", icon: LayoutDashboard },
  {
    name: "Crisis Events",
    path: "crisis-events",
    icon: TriangleAlert,
    badgeKey: "crisisEvents" as const,
  },
  {
    name: "Assistance Requests",
    path: "assistance-requests",
    icon: Inbox,
    badgeKey: "assistanceRequests" as const,
  },
  {
    name: "Priority Queue",
    path: "priority-queue",
    icon: ArrowUp,
    badgeKey: "priorityQueue" as const,
  },
  {
    name: "AI Recommendations",
    path: "ai-recommendations",
    icon: Sparkles,
    badgeKey: "aiRecommendations" as const,
  },
  { name: "Resource Overview", path: "resource-overview", icon: Package },
  { name: "Shelter Overview", path: "shelter-overview", icon: House },
  { name: "Partner Organisations", path: "partners", icon: Building2 },
  { name: "Live Operations Map", path: "live-map", icon: Map },
  { name: "Situation Reports", path: "situation-reports", icon: FileText },
  {
    name: "Audit Timeline",
    path: "audit-timeline",
    icon: Clock,
    badgeKey: "auditTimeline" as const,
  },
  {
    name: "Notifications",
    path: "notifications",
    icon: Bell,
    badgeKey: "notifications" as const,
  },
  { name: "Settings", path: "settings", icon: Settings },
];

const DUTY_STATUS_OPTIONS = [
  { label: "On Duty", color: "bg-emerald-500", text: "text-emerald-300" },
  { label: "Incident Command", color: "bg-amber-500", text: "text-amber-300" },
  { label: "On Call", color: "bg-sky-500", text: "text-sky-300" },
  { label: "Standby", color: "bg-slate-400", text: "text-slate-300" },
];

export default function EmergencySidebar({
  mobileOpen,
  onClose,
}: EmergencySidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);
  const [sidebarState, setSidebarState] =
    useState<EmergencySidebarState | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const loadSidebarState = useCallback(async () => {
    try {
      const data = await emergencySidebarService.getState();
      setSidebarState(data);
      setIsLiveConnected(true);
    } catch {
      setIsLiveConnected(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchState = () => {
      emergencySidebarService
        .getState()
        .then((data) => {
          if (isMounted) {
            setSidebarState(data);
            setIsLiveConnected(true);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsLiveConnected(false);
          }
        });
    };

    fetchState();
    const timer = setInterval(fetchState, 20000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (!sidebarState) return;
    setUpdatingStatus(true);
    try {
      const updatedCoordinator =
        await emergencySidebarService.updateDutyStatus(newStatus);
      setSidebarState((prev) =>
        prev
          ? {
              ...prev,
              coordinator: updatedCoordinator,
            }
          : null
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetSidebar = async () => {
    setUpdatingStatus(true);
    try {
      const reset = await emergencySidebarService.resetState();
      setSidebarState(reset);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const activeCrisis = sidebarState?.activeCrisis ?? {
    id: "CR-2025-001",
    shortTitle: "Monsoon Floods 2025",
    operationalArea: "Greater Riverton",
    level: 4,
  };

  const coordinator = sidebarState?.coordinator ?? {
    id: "COORD-001",
    name: user?.fullName || "Amina Mensah",
    role: "Emergency Coordinator",
    initials: getUserInitials(user?.fullName, "AM"),
    email: user?.email || "amina.mensah@reliefos.org",
    dutyStatus: "On Duty",
    operationalArea: "Greater Riverton",
    badgeNumber: "EC-8842",
    phone: "+94 77 123 4567",
    shiftStartedAt: "",
    shiftDuration: "4h 15m",
  };

  const badges = sidebarState?.badges ?? {
    crisisEvents: 3,
    assistanceRequests: 86,
    priorityQueue: 12,
    aiRecommendations: 8,
    notifications: 14,
    auditTimeline: 0,
  };

  const currentStatusConfig =
    DUTY_STATUS_OPTIONS.find((s) => s.label === coordinator.dutyStatus) ??
    DUTY_STATUS_OPTIONS[0];

  const displayName = user?.fullName || coordinator.name;
  const displayInitials = getUserInitials(displayName, coordinator.initials);

  return (
    <>
      {mobileOpen && (
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
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND HEADER */}
        <div className={SIDEBAR_THEME.header}>
          <NavLink
            to="/emergency-coordinator/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          >
            <CareLinkLogo size={collapsed ? "compact" : "sidebar"} />

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className={SIDEBAR_THEME.brandTitle}>CareLink</h1>
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      isLiveConnected
                        ? "animate-pulse bg-[#63BDA6]"
                        : "bg-slate-400"
                    }`}
                    title={
                      isLiveConnected ? "Live Backend Synchronized" : "Offline"
                    }
                  />
                </div>
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

        {/* ACTIVE RESPONSE HIGHLIGHT CARD */}
        {!collapsed && (
          <div className={SIDEBAR_THEME.statusCardWrapper}>
            <NavLink
              to="/emergency-coordinator/crisis-events"
              onClick={onClose}
              className={`block ${SIDEBAR_THEME.statusCard}`}
            >
              <div className={SIDEBAR_THEME.statusIndicatorRow}>
                <div className="flex items-center gap-2">
                  <span className={SIDEBAR_THEME.statusDot} />
                  <span className={SIDEBAR_THEME.statusLabel}>
                    ACTIVE RESPONSE
                  </span>
                </div>
                <span className="rounded bg-[#287DA6] px-1.5 py-0.5 text-xs font-bold text-white">
                  L{activeCrisis.level}
                </span>
              </div>

              <h2 className={SIDEBAR_THEME.statusTitle}>
                {activeCrisis.shortTitle}
              </h2>
              <p className={SIDEBAR_THEME.statusSubtitle}>
                {activeCrisis.operationalArea} · Level {activeCrisis.level}
              </p>
            </NavLink>
          </div>
        )}

        {/* NAVIGATION MENU */}
        <nav className={SIDEBAR_THEME.navScroll}>
          {!collapsed && (
            <div className="mb-2 flex items-center justify-between px-3">
              <button
                type="button"
                onClick={() => setSectionOpen((prev) => !prev)}
                className="flex flex-1 items-center justify-between text-sm font-bold uppercase tracking-[0.12em] text-[#8BAFC5] transition hover:text-white"
              >
                <span>EMERGENCY OPERATIONS</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${
                    sectionOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={loadSidebarState}
                className="ml-2 rounded p-1 text-[#8BAFC5] transition hover:text-white"
                title="Sync sidebar status"
              >
                <RefreshCw
                  size={11}
                  className={updatingStatus ? "animate-spin" : ""}
                />
              </button>
            </div>
          )}

          {(sectionOpen || collapsed) && (
            <div className={SIDEBAR_THEME.menuList}>
              {baseNavigation.map((item) => {
                const Icon = item.icon;
                const count = item.badgeKey ? badges[item.badgeKey] : undefined;
                const showCount = count !== undefined && count > 0;

                return (
                  <NavLink
                    key={item.path}
                    to={`/emergency-coordinator/${item.path}`}
                    end={item.path === "dashboard"}
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
                            <span className="truncate">{item.name}</span>
                          )}
                        </span>

                        {!collapsed && showCount && (
                          <span className={SIDEBAR_THEME.badge}>{count}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>

        {/* COORDINATOR PROFILE FOOTER */}
        <div className={SIDEBAR_THEME.footer}>
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className={`flex w-full items-center justify-between rounded-lg p-1.5 text-left transition hover:bg-white/10 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className={`relative ${SIDEBAR_THEME.avatar}`}>
                {displayInitials}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#153E5D] ${currentStatusConfig.color}`}
                  title={coordinator.dutyStatus}
                />
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className={SIDEBAR_THEME.userName}>{displayName}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`text-xs font-medium ${currentStatusConfig.text}`}
                    >
                      Emergency Coordinator
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronRight size={15} className="shrink-0 text-[#A9C8DD]" />
            )}
          </button>

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

      {/* Coordinator Duty Status & Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-[#287DA6]" />
                <h3 className="text-base font-bold text-[#153E5D]">
                  Coordinator Duty Profile
                </h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="my-4 rounded-lg bg-[#EDF4F7] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#287DA6] text-xs font-bold text-white">
                  {displayInitials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#153E5D]">
                    {displayName}
                  </h4>
                  <p className="text-[13px] text-slate-500">
                    {coordinator.role}
                  </p>
                  <p className="font-mono text-xs text-[#287DA6]">
                    Badge: {coordinator.badgeNumber} ·{" "}
                    {coordinator.operationalArea}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-sm">
                <span className="text-slate-500">Active Shift:</span>
                <span className="font-semibold text-slate-700">
                  {coordinator.shiftDuration}
                  {coordinator.shiftStartedAt
                    ? ` · Started ${coordinator.shiftStartedAt.slice(11, 16)} UTC`
                    : ""}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Change Duty Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DUTY_STATUS_OPTIONS.map((opt) => {
                  const isSelected = coordinator.dutyStatus === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(opt.label)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "border-[#287DA6] bg-[#EDF4F7] font-bold text-[#153E5D]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                      <span className="text-sm">{opt.label}</span>
                      {isSelected && (
                        <CheckCircle2
                          size={13}
                          className="ml-auto text-[#287DA6]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleResetSidebar}
                disabled={updatingStatus}
                className="text-sm text-slate-500 transition-colors hover:text-red-600"
              >
                Reset to Baseline
              </button>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="rounded-lg bg-[#287DA6] px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#153E5D]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
