
import { useNavigate } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

const menuItems = [
  {
    section: "LOGISTICS OPERATIONS",
    items: [
      { name: "Resource Dashboard", icon: LayoutDashboard },
      { name: "Inventory", icon: Package },
      { name: "Warehouses", icon: Warehouse },
      { name: "Resource Requests", icon: ClipboardList, badge: 18 },
      { name: "Allocations", icon: Network, badge: 7 },
      { name: "Dispatch & Tracking", icon: Truck, badge: 12 },
      { name: "Stock Transfers", icon: ArrowLeftRight },
      { name: "Procurement", icon: ShoppingCart },
      { name: "Suppliers", icon: Users },
      { name: "Alerts", icon: TriangleAlert, badge: 9 },
      { name: "Reports & Analytics", icon: ChartNoAxesCombined },
      { name: "Audit Log", icon: Clock },
      { name: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({
  activePage = "Audit Log",
  onNavigate,
}: SidebarProps) {
  const navigate = useNavigate();

  const resourceRouteMap: Record<string, string> = {
    "Resource Dashboard": "/resource-manager/dashboard",
    "Inventory": "/resource-manager/inventory",
    "Warehouses": "/resource-manager/warehouses",
    "Resource Requests": "/resource-manager/requests",
    "Allocations": "/resource-manager/allocations",
    "Dispatch & Tracking": "/resource-manager/dispatch",
    "Stock Transfers": "/resource-manager/transfers",
    "Procurement": "/resource-manager/procurement",
    "Suppliers": "/resource-manager/suppliers",
    "Alerts": "/resource-manager/alerts",
    "Reports & Analytics": "/resource-manager/reports",
    "Audit Log": "/resource-manager/audit-log",
    "Settings": "/resource-manager/settings",
  };
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[293px] flex-col bg-[#153f5e] text-white">

      {/* Logo */}
      <div className="mx-4 flex h-[127px] shrink-0 items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-[43px] w-[43px] items-center justify-center rounded-xl bg-[#65b9aa] text-[#153f5e]">
            <Package size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ReliefOS
            </h1>
            <p className="text-[11px] text-sky-200">
              Resource Management
            </p>
          </div>
        </div>
      </div>

      {/* Active Operation */}
      <div className="mx-4 mt-4 shrink-0 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#65b9aa]" />
          <span className="text-[9px] font-bold tracking-wider text-[#65b9aa]">
            ACTIVE OPERATION
          </span>
        </div>

        <h3 className="mt-2 text-xs font-bold">
          Monsoon Floods 2025
        </h3>

        <p className="mt-1 text-[10px] text-sky-200">
          Greater Riverton · Level 4
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-3">

        {menuItems.map((section) => (
          <div key={section.section}>
            <p className="mb-3 px-3 text-[9px] font-bold tracking-widest text-sky-300">
              {section.section}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(item.name);
                      } else if (resourceRouteMap[item.name]) {
                        navigate(resourceRouteMap[item.name]);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-[11px] text-left text-[11px] transition-colors ${active
                        ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                        : "border-transparent text-sky-100 hover:bg-white/10"
                      }`}
                  >
                    <Icon size={19} strokeWidth={1.8} />

                    <span className="flex-1">
                      {item.name}
                    </span>

                    {item.badge !== undefined && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ed4c5c] px-1 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="flex h-[70px] shrink-0 items-center gap-3 border-t border-white/10 px-5">
        <div className="flex h-[39px] w-[39px] items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
          DP
        </div>

        <div className="flex-1">
          <p className="text-[11px] font-bold">
            Daniel Perera
          </p>
          <p className="mt-1 text-[9px] text-sky-200">
            Resource Manager
          </p>
        </div>

        <ChevronRight size={20} />
      </div>

    </aside>
  );
}
