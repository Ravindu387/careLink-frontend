
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
  ChevronRight,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

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

export default function FundingSidebar({
  open,
  onClose,
}: FundingSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-[290px] bg-[#153e5d] text-white
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* BRAND */}

        <div className="h-[87px] shrink-0 px-6 flex items-center justify-between border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="w-[43px] h-[43px] rounded-xl bg-[#63bda9] flex items-center justify-center text-[#153e5d]">
              <Heart size={25} strokeWidth={2} />
            </div>

            <div>
              <h1 className="text-[18px] font-bold">
                ReliefOS
              </h1>

              <p className="text-[10px] text-[#a9c8dd]">
                Funding & Transparency
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white"
          >
            <X size={21} />
          </button>

        </div>

        {/* ACTIVE RESPONSE */}

        <div className="shrink-0 px-4 pt-4 pb-3">

          <div className="rounded-xl border border-white/10 bg-white/[0.07] p-3">

            <div className="flex items-center gap-2 mb-2">

              <span className="w-[7px] h-[7px] rounded-full bg-[#60c7a7]" />

              <span className="text-[9px] tracking-wider font-bold text-[#70d3b8]">
                ACTIVE RESPONSE
              </span>

            </div>

            <p className="text-[12px] font-semibold">
              Monsoon Floods 2025
            </p>

            <p className="text-[10px] text-[#a9c8dd] mt-1">
              Greater Riverton · Level 4
            </p>

          </div>

        </div>

        {/* NAVIGATION - INDEPENDENT SCROLL */}

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 funding-sidebar-scroll">

          {navigation.map((group) => (
            <div key={group.label} className="mb-5">

              <p className="px-3 mb-2 text-[9px] font-bold tracking-[1.3px] text-[#6597b8]">
                {group.label}
              </p>

              <div className="space-y-1">

                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/funding-officer/dashboard"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `relative min-h-[44px] px-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                          isActive
                            ? "bg-[#287da6] text-white font-semibold shadow-sm before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4px] before:bg-[#69c9ac] before:rounded-l-lg"
                            : "text-[#d1e1ec] hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >

                      <Icon size={19} strokeWidth={1.8} />

                      <span className="flex-1 text-[11px]">
                        {item.name}
                      </span>

                      {item.badge !== undefined && (
                        <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-[#e84757] text-white text-[9px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}

                    </NavLink>
                  );
                })}

              </div>

            </div>
          ))}

        </div>

        {/* USER PROFILE */}

        <div className="shrink-0 border-t border-white/10 p-4">

          <button className="w-full flex items-center gap-3 text-left">

            <div className="w-[38px] h-[38px] rounded-full bg-[#2783ae] flex items-center justify-center text-white text-[12px] font-bold">
              MK
            </div>

            <div className="flex-1 min-w-0">

              <p className="text-[11px] font-semibold">
                Maria Kone
              </p>

              <p className="text-[9px] text-[#a9c8dd] mt-1">
                Funding Officer
              </p>

            </div>

            <ChevronRight size={17} />

          </button>

        </div>

      </aside>

      <style>{`
        .funding-sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .funding-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .funding-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #7593a8;
          border-radius: 10px;
        }
      `}</style>

    </>
  );
}
