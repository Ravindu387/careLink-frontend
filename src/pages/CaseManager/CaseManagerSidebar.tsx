import { NavLink } from "react-router-dom";

import {
  BriefcaseBusiness,
  LayoutDashboard,
  Briefcase,
  Inbox,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ArrowUpToLine,
  Clock,
  Bell,
  ChartNoAxesCombined,
  Settings,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    name: "Case Dashboard",
    path: "/case-manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Cases",
    path: "/case-manager/my-cases",
    icon: Briefcase,
    badge: "28",
  },
  {
    name: "Unassigned Cases",
    path: "/case-manager/unassigned-cases",
    icon: Inbox,
    badge: "63",
  },
  {
    name: "Case Verification",
    path: "/case-manager/verification",
    icon: ShieldCheck,
    badge: "14",
  },
  {
    name: "Priority Queue",
    path: "/case-manager/priority-queue",
    icon: AlertTriangle,
    badge: "12",
  },
  {
    name: "Potential Duplicates",
    path: "/case-manager/potential-duplicates",
    icon: Copy,
    badge: "9",
  },
  {
    name: "Escalated Cases",
    path: "/case-manager/escalated-cases",
    icon: ArrowUpToLine,
    badge: "7",
  },
  {
    name: "Request History",
    path: "/case-manager/request-history",
    icon: Clock,
  },
  {
    name: "Notifications",
    path: "/case-manager/notifications",
    icon: Bell,
    badge: "11",
  },
  {
    name: "Reports & Analytics",
    path: "/case-manager/reports",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Settings",
    path: "/case-manager/settings",
    icon: Settings,
  },
];

export default function CaseManagerSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[295px] flex-col bg-[#153e5d] text-white">

      {/* BRAND */}

      <div className="px-[22px] pt-[22px]">

        <div className="flex items-center gap-3">

          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-[#65bba5] text-[#153e5d]">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <h1 className="text-[19px] font-bold">
              ReliefOS
            </h1>

            <p className="text-[11px] text-[#b8d1df]">
              Case Management
            </p>
          </div>

        </div>

        <div className="mt-5 border-b border-white/10" />

      </div>

      {/* ACTIVE RESPONSE */}

      <div className="px-[14px] pt-[15px]">

        <div className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3.5">

          <div className="mb-2 flex items-center gap-2">

            <span className="h-[7px] w-[7px] rounded-full bg-[#65c8a7]" />

            <span className="text-[9px] font-bold tracking-[0.8px] text-[#79d5b8]">
              ACTIVE RESPONSE
            </span>

          </div>

          <h3 className="text-[13px] font-bold">
            Monsoon Floods 2025
          </h3>

          <p className="mt-1 text-[10px] text-[#b7cbd9]">
            Greater Riverton · Level 4
          </p>

        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="mt-6 flex-1 overflow-y-auto px-[12px] pb-4">

        <p className="mb-3 px-3 text-[9px] font-bold tracking-[1px] text-[#78a5c2]">
          CASE OPERATIONS
        </p>

        <div className="space-y-[3px]">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex h-[46px] items-center justify-between rounded-lg px-3 transition-all ${
                    isActive
                      ? "bg-[#287fa9] text-white shadow-sm before:absolute before:left-0 before:top-2 before:h-[30px] before:w-[4px] before:rounded-r-full before:bg-[#65c5aa]"
                      : "text-[#d0e0ea] hover:bg-white/10 hover:text-white"
                  }`
                }
              >

                {({ isActive }) => (
                  <>

                    <div className="flex items-center gap-3">

                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        className={
                          isActive
                            ? "text-white"
                            : "text-[#b8d0df]"
                        }
                      />

                      <span className="text-[12px] font-medium">
                        {item.name}
                      </span>

                    </div>

                    {item.badge && (
                      <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#e94c59] px-1 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}

                  </>
                )}

              </NavLink>
            );

          })}

        </div>

      </nav>

      {/* BOTTOM PROFILE */}

      <div className="border-t border-white/10 px-[20px] py-4">

        <button className="flex w-full items-center justify-between gap-3 text-left">

          <div className="flex items-center gap-3">

            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#287fa9] text-[12px] font-bold">
              AM
            </div>

            <div>

              <p className="text-[11px] font-bold">
                Amina Mensah
              </p>

              <p className="mt-0.5 text-[9px] text-[#a9c5d5]">
                Incident Case Manager
              </p>

            </div>

          </div>

          <ChevronRight size={16} />

        </button>

      </div>

    </aside>
  );
}