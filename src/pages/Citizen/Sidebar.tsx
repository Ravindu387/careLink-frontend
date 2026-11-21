
import { useNavigate } from "react-router-dom";
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
  ChevronRight,
  Phone,
  X,
} from "lucide-react";

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
  activePage = "Home",
  onNavigate,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  const citizenRoutes: Record<string, string> = {
    "Home": "/citizen/home",
    "Request Help": "/citizen/request-help",
    "My Requests": "/citizen/my-requests",
    "Nearby Support": "/citizen/nearby-support",
    "Shelters": "/citizen/shelters",
    "Safety Updates": "/citizen/safety-updates",
    "My Household": "/citizen/my-household",
    "My Documents": "/citizen/my-documents",
    "Messages": "/citizen/messages",
    "Notifications": "/citizen/notifications",
    "Feedback": "/citizen/feedback",
    "Profile & Settings": "/citizen/profile",
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[295px] flex-col bg-[#153e5e] text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa] text-[#153e5e]">
              <Heart size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold">ReliefOS</h1>
              <p className="text-[10px] text-sky-200">
                Citizen Support
              </p>
            </div>
          </div>

          <button onClick={onClose} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Active Operation */}
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>

          <h3 className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </h3>

          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* Navigation Heading */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item.name);
                  } else if (citizenRoutes[item.name]) {
                    navigate(citizenRoutes[item.name]);
                  }
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs transition-all ${
                  isActive
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />

                <span className="flex-1">{item.name}</span>

                {item.count !== undefined && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Emergency Help */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#153e5e]">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#287da6]" />

            <div>
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>

              <a
                href="tel:112"
                className="text-sm font-bold text-red-600"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* Citizen Profile */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">
              Citizen account
            </p>
          </div>

          <ChevronRight size={18} />
        </div>
      </aside>
    </>
  );
}
