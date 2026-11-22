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
  X,
  CheckCircle2,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  emergencySidebarService,
  type EmergencySidebarState,
} from "../../services/emergencySidebarService";

interface EmergencySidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const baseNavigation = [
  { name: "Operations Dashboard", path: "dashboard", icon: LayoutDashboard },
  { name: "Crisis Events", path: "crisis-events", icon: TriangleAlert, badgeKey: "crisisEvents" as const },
  { name: "Assistance Requests", path: "assistance-requests", icon: Inbox, badgeKey: "assistanceRequests" as const },
  { name: "Priority Queue", path: "priority-queue", icon: ArrowUp, badgeKey: "priorityQueue" as const },
  { name: "AI Recommendations", path: "ai-recommendations", icon: Sparkles, badgeKey: "aiRecommendations" as const },
  { name: "Resource Overview", path: "resource-overview", icon: Package },
  { name: "Shelter Overview", path: "shelter-overview", icon: House },
  { name: "Partner Organisations", path: "partners", icon: Building2 },
  { name: "Live Operations Map", path: "live-map", icon: Map },
  { name: "Situation Reports", path: "situation-reports", icon: FileText },
  { name: "Audit Timeline", path: "audit-timeline", icon: Clock, badgeKey: "auditTimeline" as const },
  { name: "Notifications", path: "notifications", icon: Bell, badgeKey: "notifications" as const },
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
  const [sidebarState, setSidebarState] = useState<EmergencySidebarState | null>(null);
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
      const updatedCoordinator = await emergencySidebarService.updateDutyStatus(newStatus);
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

  // Resolve current active crisis and badge numbers
  const activeCrisis = sidebarState?.activeCrisis ?? {
    id: "CR-2025-001",
    shortTitle: "Monsoon Floods 2025",
    operationalArea: "Greater Riverton",
    level: 4,
  };

  const coordinator = sidebarState?.coordinator ?? {
    id: "COORD-001",
    name: "Amina Mensah",
    role: "Emergency Coordinator",
    initials: "AM",
    email: "amina.mensah@reliefos.org",
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

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#153f5e] text-white transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo & Platform Name */}
        <div className="flex h-[64px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#70c5ad] text-[#153f5e] shadow-sm">
            <ShieldAlert size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold leading-none">ReliefOS</h1>
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isLiveConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                }`}
                title={isLiveConnected ? "Live Backend Synchronized" : "Offline"}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-blue-200">
              Emergency Coordination
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Active Response Highlight Card */}
        <NavLink
          to="/emergency-coordinator/crisis-events"
          onClick={onClose}
          className="group mx-3 mt-3 block shrink-0 rounded-lg border border-white/10 bg-white/10 p-3 transition-colors hover:border-[#70c5ad]/40 hover:bg-white/[0.14]"
        >
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-emerald-300">
                ACTIVE RESPONSE
              </span>
            </div>
            <span className="rounded bg-[#287da5]/80 px-1.5 py-0.5 text-[8px] font-semibold text-white">
              L{activeCrisis.level}
            </span>
          </div>

          <h2 className="text-xs font-bold leading-tight group-hover:text-[#70c5ad] transition-colors">
            {activeCrisis.shortTitle}
          </h2>
          <p className="mt-1 text-[9px] text-blue-200">
            {activeCrisis.operationalArea} · Level {activeCrisis.level}
          </p>
        </NavLink>

        {/* Section Heading */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-1.5 pt-4">
          <p className="text-[9px] font-bold tracking-widest text-blue-300">
            EMERGENCY OPERATIONS
          </p>
          <button
            onClick={loadSidebarState}
            className="rounded p-1 text-blue-300/60 hover:text-blue-100"
            title="Sync sidebar status"
          >
            <RefreshCw size={11} className={updatingStatus ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3 scrollbar-thin scrollbar-thumb-white/20">
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
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-[11px] transition-all ${
                    isActive
                      ? "border-l-[3px] border-[#70c5ad] bg-[#287da5] font-semibold text-white shadow-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="flex items-center gap-3 truncate">
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{item.name}</span>
                </span>

                {showCount && (
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white shadow-xs ${
                      item.badgeKey === "notifications"
                        ? "bg-red-500"
                        : item.badgeKey === "priorityQueue"
                        ? "bg-amber-500"
                        : item.badgeKey === "aiRecommendations"
                        ? "bg-[#70c5ad] text-[#153f5e]"
                        : "bg-red-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Coordinator Profile Footer */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-white/10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#287da5] text-[10px] font-bold text-white shadow-inner">
                {coordinator.initials}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#153f5e] ${currentStatusConfig.color}`}
                  title={coordinator.dutyStatus}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[10px] font-semibold text-white">
                    {coordinator.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-medium ${currentStatusConfig.text}`}>
                    ● {coordinator.dutyStatus}
                  </span>
                  <span className="text-[8px] text-blue-300">· {coordinator.shiftDuration}</span>
                </div>
              </div>
            </div>

            <ChevronRight size={16} className="shrink-0 text-blue-200" />
          </button>
        </div>
      </aside>

      {/* Coordinator Duty Status & Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-[#287da5]" />
                <h3 className="text-sm font-bold text-[#153f5e]">
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

            {/* Coordinator Info */}
            <div className="my-4 rounded-lg bg-[#edf4f7] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#287da5] text-xs font-bold text-white">
                  {coordinator.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#153f5e]">
                    {coordinator.name}
                  </h4>
                  <p className="text-[10px] text-slate-500">{coordinator.role}</p>
                  <p className="text-[9px] text-[#287da5] font-mono">
                    Badge: {coordinator.badgeNumber} · {coordinator.operationalArea}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[10px]">
                <span className="text-slate-500">Active Shift:</span>
                <span className="font-semibold text-slate-700">
                  {coordinator.shiftDuration}
                  {coordinator.shiftStartedAt ? ` · Started ${coordinator.shiftStartedAt.slice(11, 16)} UTC` : ""}
                </span>
              </div>
            </div>

            {/* Duty Status Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "border-[#287da5] bg-[#edf4f7] font-bold text-[#153f5e]"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                      <span className="text-[11px]">{opt.label}</span>
                      {isSelected && (
                        <CheckCircle2 size={13} className="ml-auto text-[#287da5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Reset */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleResetSidebar}
                disabled={updatingStatus}
                className="text-[10px] text-slate-500 hover:text-red-600 transition-colors"
              >
                Reset to Baseline
              </button>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="rounded-lg bg-[#287da5] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153f5e] transition-colors"
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
