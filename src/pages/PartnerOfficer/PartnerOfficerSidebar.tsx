import { NavLink } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const basePath = "/partner-officer/partner";

const navigation = [
  { label: "Partner Dashboard", path: `${basePath}/dashboard`, icon: LayoutDashboard },
  { label: "Organisation Profile", path: `${basePath}/organisation-profile`, icon: Building2 },
  { label: "Shared Crisis Events", path: `${basePath}/shared-crisis-events`, icon: AlertTriangle, badge: 3 },
  { label: "Assistance Referrals", path: `${basePath}/assistance-referrals`, icon: Inbox, badge: 12 },
  { label: "Resource Sharing", path: `${basePath}/resource-sharing`, icon: Package, badge: 5 },
  { label: "Collaboration Requests", path: `${basePath}/collaboration-requests`, icon: Handshake, badge: 7 },
  { label: "Field Activities", path: `${basePath}/field-activities`, icon: Map },
  { label: "Team & Contacts", path: `${basePath}/team-contacts`, icon: Users },
  { label: "Documents", path: `${basePath}/documents`, icon: FileText },
  { label: "Reports", path: `${basePath}/reports`, icon: ChartNoAxesColumn },
  { label: "Notifications", path: `${basePath}/notifications`, icon: Bell, badge: 9 },
  { label: "Audit Log", path: `${basePath}/audit-log`, icon: Clock },
  { label: "Settings", path: `${basePath}/settings`, icon: Settings },
];

const PartnerOfficerSidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[264px] flex-col overflow-hidden bg-[#153e5b] text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[65px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#69bca5] text-[#153e5b]">
            <HeartHandshake size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold">ReliefOS</h2>
            <p className="text-[10px] text-blue-200">Partner Coordination</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto text-white/70 hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mx-3 mt-4 shrink-0 rounded-lg border border-white/10 bg-white/[0.07] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#69c7a9]" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#69c7a9]">
              Verified Partner
            </span>
          </div>
          <h3 className="text-xs font-semibold">Global Relief Network</h3>
          <p className="mt-1 text-[9px] text-blue-200">
            International NGO · ORG-027
          </p>
        </div>

        <div className="shrink-0 px-5 pb-2 pt-5">
          <p className="text-[9px] font-semibold uppercase tracking-[1.2px] text-blue-300/70">
            Partner Workspace
          </p>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex min-h-[39px] items-center justify-between rounded-lg border-l-[3px] px-2.5 py-2 transition-all ${
                    isActive
                      ? "border-[#69c7a9] bg-[#287fa7] text-white"
                      : "border-transparent text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon size={17} className="shrink-0" />
                  <span className="truncate text-[11px] font-medium">
                    {item.label}
                  </span>
                </span>

                {item.badge !== undefined && (
                  <span className="ml-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#e84c59] px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex w-full items-center gap-3 rounded-lg p-2 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#267ba4] text-xs font-bold">
              SK
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold">Sara Khan</p>
              <p className="text-[9px] text-blue-200">Partner Officer</p>
            </div>
            <ChevronRight size={17} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default PartnerOfficerSidebar;
