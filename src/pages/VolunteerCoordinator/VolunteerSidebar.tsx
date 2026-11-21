import {
  Users,
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  ListTodo,
  CheckCheck,
  Sparkles,
  ChartNoAxesCombined,
  Award,
  MessageSquare,
  Bell,
  Settings,
  ChevronRight,
  X,
  Globe,
} from "lucide-react";

import { NavLink } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

const navigation = [
  {
    title: "COORDINATION WORKSPACE",
    items: [
      {
        name: "Dashboard",
        path: "/volunteer/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Volunteer Directory",
        path: "/volunteer/directory",
        icon: Users,
      },
      {
        name: "Pending Verification",
        path: "/volunteer/verification",
        icon: ShieldCheck,
        badge: "18",
      },
      {
        name: "Skills & Availability",
        path: "/volunteer/skills",
        icon: SlidersHorizontal,
      },
      {
        name: "Tasks",
        path: "/volunteer/tasks",
        icon: ListTodo,
        badge: "12",
      },
      {
        name: "Assignments",
        path: "/volunteer/assignments",
        icon: CheckCheck,
      },
      {
        name: "AI Matching",
        path: "/volunteer/ai-matching",
        icon: Sparkles,
        badge: "3",
      },
      {
        name: "Activity Tracking",
        path: "/volunteer/activity",
        icon: ChartNoAxesCombined,
      },
      {
        name: "Training & Certifications",
        path: "/volunteer/training",
        icon: Award,
      },
      {
        name: "Communications",
        path: "/volunteer/communications",
        icon: MessageSquare,
      },
      {
        name: "Reports & Analytics",
        path: "/volunteer/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        name: "Notifications",
        path: "/volunteer/notifications",
        icon: Bell,
        badge: "5",
      },
      {
        name: "Settings",
        path: "/volunteer/settings",
        icon: Settings,
      },
    ],
  },
];

export default function VolunteerSidebar({
  open,
  onClose,
}: Props) {
  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[230px]
          flex-col bg-[#153F60] text-white
          transition-transform duration-300
          lg:sticky lg:top-0 lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO */}
        <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 px-4">
          <NavLink
            to="/volunteer/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#65BDA7] text-[#153F60]">
              <Users size={21} />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                ReliefOS
              </h2>

              <p className="mt-0.5 text-[9px] text-slate-300">
                Volunteer Coordination
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="ml-auto lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="px-3 pt-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#65C9A9]" />

              <p className="text-[8px] font-bold tracking-wider text-[#65C9A9]">
                ACTIVE RESPONSE
              </p>
            </div>

            <p className="text-[10px] font-bold">
              Monsoon Floods 2025
            </p>

            <p className="mt-1 text-[8px] text-slate-300">
              Greater Riverton · Level 4
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigation.map((group) => (
            <div key={group.title} className="mb-4">
              <h3 className="mb-2 px-3 text-[8px] font-bold tracking-[0.15em] text-[#83A9C1]">
                {group.title}
              </h3>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `
                        relative flex min-h-[35px] items-center gap-2.5
                        rounded-md px-2.5 py-2
                        text-[10px] font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-[#2785B2] text-white shadow-sm"
                            : "text-slate-200 hover:bg-white/10 hover:text-white"
                        }
                        `
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#65C9A9]" />
                          )}

                          <Icon size={14} />

                          <span className="flex-1">
                            {item.name}
                          </span>

                          {item.badge && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* USER PROFILE */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <NavLink
            to="/"
            onClick={onClose}
            className="mb-4 flex items-center gap-2 px-1 text-[10px] font-semibold text-slate-200 hover:text-white"
          >
            <Globe size={14} />
            Citizen portal
          </NavLink>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2785B2] text-[9px] font-bold">
              NC
            </div>

            <div className="flex-1">
              <p className="text-[9px] font-bold">
                Nadia Okafor
              </p>

              <p className="mt-0.5 text-[8px] text-slate-300">
                Volunteer Coordinator
              </p>
            </div>

            <ChevronRight size={13} />
          </div>
        </div>
      </aside>
    </>
  );
}