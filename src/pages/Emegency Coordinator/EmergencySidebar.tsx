
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
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Operations Dashboard", path: "dashboard", icon: LayoutDashboard },
  { name: "Crisis Events", path: "crisis-events", icon: TriangleAlert },
  { name: "Assistance Requests", path: "assistance-requests", icon: Inbox, count: 86 },
  { name: "Priority Queue", path: "priority-queue", icon: ArrowUp, count: 12 },
  { name: "AI Recommendations", path: "emergency-coordinator/ai-recommendations", icon: Sparkles, count: 8 },
  { name: "Resource Overview", path: "resource-overview", icon: Package },
  { name: "Shelter Overview", path: "shelter-overview", icon: House },
  { name: "Partner Organisations", path: "partners", icon: Building2 },
  { name: "Live Operations Map", path: "live-map", icon: Map },
  { name: "Situation Reports", path: "situation-reports", icon: FileText },
  { name: "Audit Timeline", path: "audit-timeline", icon: Clock },
  { name: "Notifications", path: "notifications", icon: Bell, count: 14 },
  { name: "Settings", path: "settings", icon: Settings },
];

interface EmergencySidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function EmergencySidebar({
  mobileOpen,
  onClose,
}: EmergencySidebarProps) {
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
        {/* Logo */}
        <div className="flex h-[64px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#70c5ad]">
            <ShieldAlert size={23} />
          </div>

          <div>
            <h1 className="text-base font-bold">ReliefOS</h1>
            <p className="text-[10px] text-blue-200">
              Emergency Coordination
            </p>
          </div>

          <button onClick={onClose} className="ml-auto lg:hidden">
            <X size={19} />
          </button>
        </div>

        {/* Active Response */}
        <div className="mx-3 mt-3 shrink-0 rounded-lg border border-white/10 bg-white/10 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-semibold tracking-wider text-emerald-300">
              ACTIVE RESPONSE
            </span>
          </div>

          <h2 className="text-xs font-bold">Monsoon Floods 2025</h2>
          <p className="mt-1 text-[9px] text-blue-200">
            Greater Riverton · Level 4
          </p>
        </div>

        {/* Navigation */}
        <div className="shrink-0 px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold tracking-widest text-blue-300">
            EMERGENCY OPERATIONS
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={`/emergency-coordinator/${item.path}`}
                end={item.path === "dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-[11px] transition-all ${
                    isActive
                      ? "border-l-[3px] border-[#70c5ad] bg-[#287da5] font-semibold text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.name}
                </span>

                {item.count !== undefined && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da5] text-[10px] font-bold">
                AM
              </div>

              <div>
                <p className="text-[10px] font-semibold">Amina Mensah</p>
                <p className="text-[9px] text-blue-200">
                  Emergency Coordinator
                </p>
              </div>
            </div>
            <ChevronRight size={17} />
          </div>
        </div>
      </aside>
    </>
  );
}
