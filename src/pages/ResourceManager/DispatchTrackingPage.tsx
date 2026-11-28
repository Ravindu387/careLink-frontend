import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Package,
  Warehouse,
  ClipboardList,
  GitBranch,
  ArrowLeftRight,
  ShoppingCart,
  BriefcaseBusiness,
  AlertTriangle,
  ChartNoAxesCombined,
  Clock3,
  Settings,
  Search,
  Bell,
  ShieldCheck,
  ChevronRight,
  Plus,
  Download,
  Check,
  Filter,
  X,
  Menu,
  RotateCcw,
  Wifi,
  WifiOff,
  RefreshCw,
  Navigation,
  MapPin,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import { dispatchService } from "../../services/dispatchService";
import type {
  Dispatch,
  DispatchStatus,
  DispatchSummary,
  CreateDispatchPayload,
} from "../../types/dispatch";

const initialData: Dispatch[] = [
  {
    id: "DSP-1092",
    route: "Central Hub → North Ward",
    resource: "Drinking Water",
    quantity: "2,400 units",
    vehicle: "Truck · RT-204",
    driver: "Amir Khan",
    departed: "13:28",
    eta: "14:12",
    status: "In Transit",
    currentLocation: "Sector 3 Highway Junction",
  },
  {
    id: "DSP-1089",
    route: "West Depot → Central Ward",
    resource: "Fuel · Diesel",
    quantity: "1,200 L",
    vehicle: "Tanker · TK-018",
    driver: "L. Perera",
    departed: "12:55",
    eta: "13:48",
    status: "Delayed",
    currentLocation: "Bridge 4 Detour Route",
    notes: "Heavy flood waters causing route detour",
  },
  {
    id: "DSP-1084",
    route: "Eastbank → CareLink Shelter",
    resource: "Shelter Kits",
    quantity: "80 units",
    vehicle: "Truck · RT-118",
    driver: "N. Okafor",
    departed: "11:22",
    eta: "12:14",
    status: "Delivered",
    currentLocation: "CareLink Shelter Main Entrance",
  },
  {
    id: "DSP-1078",
    route: "North Hub → Riverton High",
    resource: "Food Packs",
    quantity: "420 units",
    vehicle: "Van · VN-042",
    driver: "S. Mensah",
    departed: "10:42",
    eta: "11:38",
    status: "Delivered",
    currentLocation: "Riverton High Shelter Hall",
  },
  {
    id: "DSP-1075",
    route: "Central Hub → South Shelter",
    resource: "Medical Kits",
    quantity: "150 units",
    vehicle: "Truck · RT-205",
    driver: "Daniel Silva",
    departed: "09:15",
    eta: "10:30",
    status: "In Transit",
    currentLocation: "South Avenue Bridge",
  },
  {
    id: "DSP-1072",
    route: "West Depot → Eastbank",
    resource: "Hygiene Kits",
    quantity: "300 units",
    vehicle: "Van · VN-051",
    driver: "A. Fernando",
    departed: "08:45",
    eta: "09:50",
    status: "Pending",
    currentLocation: "West Depot Loading Bay 2",
  },
  {
    id: "DSP-1069",
    route: "North Hub → Central Ward",
    resource: "Thermal Blankets",
    quantity: "200 units",
    vehicle: "Truck · RT-120",
    driver: "M. Perera",
    departed: "07:30",
    eta: "08:45",
    status: "Delayed",
    currentLocation: "North Corridor Checkpoint",
    notes: "Awaiting safety clearance for debris clearing",
  },
];

const navigation = [
  { label: "Resource Dashboard", path: "/resource-manager/dashboard", icon: ChartNoAxesCombined },
  { label: "Inventory", path: "/resource-manager/inventory", icon: Package },
  { label: "Warehouses", path: "/resource-manager/warehouses", icon: Warehouse },
  { label: "Resource Requests", path: "/resource-manager/requests", icon: ClipboardList, count: 18 },
  { label: "Allocations", path: "/resource-manager/allocations", icon: GitBranch, count: 7 },
  { label: "Dispatch & Tracking", path: "/resource-manager/dispatch", icon: Truck, count: 12 },
  { label: "Stock Transfers", path: "/resource-manager/transfers", icon: ArrowLeftRight },
  { label: "Procurement", path: "/resource-manager/procurement", icon: ShoppingCart },
  { label: "Suppliers", path: "/resource-manager/suppliers", icon: BriefcaseBusiness },
  { label: "Alerts", path: "/resource-manager/alerts", icon: AlertTriangle, count: 9 },
  { label: "Reports & Analytics", path: "/resource-manager/reports", icon: ChartNoAxesCombined },
  { label: "Audit Log", path: "/resource-manager/audit-log", icon: Clock3 },
  { label: "Settings", path: "/resource-manager/settings", icon: Settings },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Exceptions"];

const statusColor: Record<DispatchStatus, string> = {
  "In Transit": "bg-sky-50 text-sky-700 border border-sky-200",
  Delayed: "bg-amber-50 text-amber-700 border border-amber-200",
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending: "bg-slate-100 text-slate-700 border border-slate-200",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500";

export default function DispatchTrackingPage() {
  const navigate = useNavigate();

  const [dispatches, setDispatches] = useState<Dispatch[]>(initialData);
  const [summary, setSummary] = useState<DispatchSummary | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [route, setRoute] = useState("All routes");
  const [vehicle, setVehicle] = useState("All vehicles");
  const [status, setStatus] = useState("All delivery states");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selected, setSelected] = useState<Dispatch | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [newDispatch, setNewDispatch] = useState({
    from: "Central Hub",
    to: "",
    resource: "",
    quantity: "",
    vehicle: "",
    driver: "",
    eta: "",
    notes: "",
  });

  const pageSize = 5;

  // FETCH DISPATCHES FROM API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dispatchesData, summaryData] = await Promise.all([
        dispatchService.getDispatches({
          search: search || undefined,
          status: status !== "All delivery states" ? status : undefined,
          route: route !== "All routes" ? route : undefined,
          vehicle: vehicle !== "All vehicles" ? vehicle : undefined,
          tab: activeTab !== "All" ? activeTab : undefined,
        }),
        dispatchService.getDispatchSummary(),
      ]);

      if (dispatchesData && Array.isArray(dispatchesData)) {
        setDispatches(dispatchesData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local dispatches:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, route, vehicle, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CLIENT-SIDE FILTERING (fallback / rapid reactivity)
  const filtered = useMemo(() => {
    return dispatches.filter((item) => {
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRoute = route === "All routes" || item.route === route;

      const matchesVehicle =
        vehicle === "All vehicles" || item.vehicle === vehicle;

      const matchesStatus =
        status === "All delivery states" || item.status === status;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Delayed", "Pending"].includes(item.status)) ||
        (activeTab === "Active" && item.status === "In Transit") ||
        (activeTab === "Completed" && item.status === "Delivered") ||
        (activeTab === "Exceptions" && item.status === "Delayed");

      return (
        matchesSearch &&
        matchesRoute &&
        matchesVehicle &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [dispatches, search, route, vehicle, status, activeTab]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const counts = {
    active:
      summary?.active ??
      dispatches.filter((d) => d.status !== "Delivered").length,
    onSchedule:
      summary?.onSchedule ??
      dispatches.filter((d) => d.status === "In Transit").length,
    delayed:
      summary?.delayed ??
      dispatches.filter((d) => d.status === "Delayed").length,
    delivered:
      summary?.delivered ??
      dispatches.filter((d) => d.status === "Delivered").length,
  };

  const needsActionCount =
    summary?.needsAction ??
    dispatches.filter((d) => d.status === "Delayed" || d.status === "Pending")
      .length;

  const resetFilters = () => {
    setSearch("");
    setRoute("All routes");
    setVehicle("All vehicles");
    setStatus("All delivery states");
    setActiveTab("All");
    setPage(1);
  };

  // CREATE DISPATCH
  const createDispatch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !newDispatch.to.trim() ||
      !newDispatch.resource.trim() ||
      !newDispatch.quantity.trim() ||
      !newDispatch.vehicle.trim() ||
      !newDispatch.driver.trim() ||
      !newDispatch.eta
    )
      return;

    const payload: CreateDispatchPayload = {
      from: newDispatch.from,
      to: newDispatch.to,
      route: `${newDispatch.from} → ${newDispatch.to}`,
      resource: newDispatch.resource.trim(),
      quantity: newDispatch.quantity.trim(),
      vehicle: newDispatch.vehicle.trim(),
      driver: newDispatch.driver.trim(),
      departed: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      eta: newDispatch.eta,
      status: "Pending",
      notes: newDispatch.notes.trim() || undefined,
    };

    try {
      const created = await dispatchService.createDispatch(payload);
      setDispatches((prev) => [created, ...prev]);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adding dispatch locally:", err);
      const nextId =
        Math.max(
          ...dispatches.map((d) => Number(d.id.split("-")[1]) || 1092),
          1092
        ) + 1;
      const localItem: Dispatch = {
        id: `DSP-${nextId}`,
        route: `${newDispatch.from} → ${newDispatch.to}`,
        resource: newDispatch.resource,
        quantity: newDispatch.quantity,
        vehicle: newDispatch.vehicle,
        driver: newDispatch.driver,
        departed: payload.departed || "Just now",
        eta: newDispatch.eta,
        status: "Pending",
        notes: newDispatch.notes,
      };
      setDispatches((prev) => [localItem, ...prev]);
    } finally {
      setShowCreate(false);
      setNewDispatch({
        from: "Central Hub",
        to: "",
        resource: "",
        quantity: "",
        vehicle: "",
        driver: "",
        eta: "",
        notes: "",
      });
      resetFilters();
    }
  };

  // UPDATE DISPATCH STATUS
  const handleUpdateStatus = async (id: string, newStatus: DispatchStatus) => {
    setActionInProgress(id);
    try {
      await dispatchService.updateDispatchStatus(id, { status: newStatus });
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, updating status locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setDispatches((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );

    if (selected && selected.id === id) {
      setSelected((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // DELETE / CANCEL DISPATCH
  const handleDeleteDispatch = async (id: string) => {
    if (!window.confirm(`Are you sure you want to cancel dispatch ${id}?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      await dispatchService.deleteDispatch(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, deleting dispatch locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setDispatches((prev) => prev.filter((d) => d.id !== id));
    if (selected && selected.id === id) {
      setSelected(null);
    }
  };

  // EXPORT CSV
  const exportCSV = () => {
    const headers = [
      "Dispatch ID",
      "Route",
      "Resources",
      "Quantity",
      "Vehicle",
      "Driver",
      "Departed",
      "ETA",
      "Status",
      "Current Location",
      "Notes",
    ];

    const rows = filtered.map((d) => [
      d.id,
      d.route,
      d.resource,
      d.quantity,
      d.vehicle,
      d.driver,
      d.departed,
      d.eta,
      d.status,
      d.currentLocation ?? "",
      d.notes ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-dispatches-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Active dispatches",
      value: counts.active,
      note: "Across 4 districts",
      icon: Truck,
      color: "bg-sky-50 text-sky-700",
    },
    {
      label: "On schedule",
      value: counts.onSchedule,
      note: "Active fleet on route",
      icon: Check,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Delayed",
      value: counts.delayed,
      note: "Route exceptions",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Delivered",
      value: counts.delivered,
      note: "Successful deliveries",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#eef4f7] font-sans text-[#163d5c]">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">ReliefOS</h1>
            <p className="text-sm text-sky-200">Resource Management</p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>
          <p className="mt-2 text-sm font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-sm text-sky-200">Greater Riverton · Level 4</p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Dispatch & Tracking";
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (active) return;
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                  active
                    ? "border-l-[3px] border-[#62b7a8] bg-[#287ba5] font-semibold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-xs text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Daniel Perera</p>
            <p className="text-sm text-sky-200">Resource Manager</p>
          </div>
          <ChevronRight size={18} />
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN PAGE */}
      <main className="min-h-screen lg:ml-[280px]">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-7">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="flex max-w-[480px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              placeholder="Search resources, routes, vehicles, drivers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
            <span className="hidden rounded border bg-white px-2 py-1 text-xs text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend Connection Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {isBackendConnected === true ? (
                <>
                  <Wifi size={13} className="text-emerald-500" />
                  <span className="hidden sm:inline text-emerald-700">API Connected</span>
                </>
              ) : isBackendConnected === false ? (
                <>
                  <WifiOff size={13} className="text-amber-500" />
                  <span className="hidden sm:inline text-amber-700">Offline Fallback</span>
                </>
              ) : (
                <>
                  <RefreshCw size={13} className="animate-spin text-slate-400" />
                  <span className="hidden sm:inline text-slate-500">Connecting...</span>
                </>
              )}
            </div>

            <button
              onClick={() => loadData()}
              disabled={isLoading}
              title="Refresh Dispatches"
              className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-xs uppercase text-slate-400">Primary Hub</p>
              <p className="text-sm font-bold">Central Logistics Hub</p>
            </div>
            <button className="hidden rounded-lg border p-2.5 sm:block" aria-label="Security">
              <ShieldCheck size={18} />
            </button>
            <button className="relative rounded-lg border p-2.5" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
                9
              </span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
              DP
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold">Daniel P.</p>
              <p className="text-xs text-slate-400">Resource Manager</p>
            </div>
            <ChevronRight size={17} className="hidden sm:block" />
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* HEADING */}
          <div className="text-[13px] text-slate-400">
            Resource Operations <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Dispatch & Tracking
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Dispatch & Tracking
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Coordinate vehicle loading, route release, real-time tracking, proof of delivery, and exception handling.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Plus size={15} /> Create Dispatch
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-400">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                    <p className="text-[13px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-6 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`relative flex items-center gap-1.5 pb-3 text-sm font-medium transition ${
                  activeTab === tab ? "font-bold text-sky-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
                {tab === "All" && (
                  <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-sm text-sky-800 font-semibold">
                    {dispatches.length}
                  </span>
                )}
                {tab === "Needs action" && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-sm text-amber-800 font-semibold">
                    {needsActionCount}
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                )}
              </button>
            ))}
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="flex flex-wrap gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search dispatch, driver, vehicle..."
                className="w-full py-2.5 text-sm sm:text-[15px] outline-none"
              />
            </div>

            <select
              value={route}
              onChange={(e) => {
                setRoute(e.target.value);
                setPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All routes</option>
              {[...new Set(dispatches.map((d) => d.route))].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <select
              value={vehicle}
              onChange={(e) => {
                setVehicle(e.target.value);
                setPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All vehicles</option>
              {[...new Set(dispatches.map((d) => d.vehicle))].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All delivery states</option>
              {(
                ["In Transit", "Delayed", "Delivered", "Pending"] as DispatchStatus[]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMoreFilters(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
            >
              <Filter size={14} /> More filters
            </button>

            {(search ||
              route !== "All routes" ||
              vehicle !== "All vehicles" ||
              status !== "All delivery states" ||
              activeTab !== "All") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Dispatch ID</th>
                    <th className="px-4 py-3.5 font-semibold">Route</th>
                    <th className="px-4 py-3.5 font-semibold">Resources</th>
                    <th className="px-4 py-3.5 font-semibold">Quantity</th>
                    <th className="px-4 py-3.5 font-semibold">Vehicle</th>
                    <th className="px-4 py-3.5 font-semibold">Driver</th>
                    <th className="px-4 py-3.5 font-semibold">Departed</th>
                    <th className="px-4 py-3.5 font-semibold">ETA</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((d) => (
                    <tr
                      key={d.id}
                      className="border-t border-slate-100 text-sm hover:bg-slate-50/80 transition"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800">
                        {d.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                        {d.route}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-800">
                        {d.resource}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {d.quantity}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {d.vehicle}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-medium">
                        {d.driver}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {d.departed}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {d.eta}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[d.status]}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelected(d)}
                            title="View tracking details"
                            className="rounded p-1 text-slate-400 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <Truck size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No dispatches found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try adjusting your search criteria or resetting filters.
                  </p>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs">
              <p className="text-[13px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * pageSize, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length}
                </span>{" "}
                dispatches
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-7 min-w-7 rounded-lg border px-2 text-xs font-semibold transition ${
                      currentPage === n
                        ? "border-[#287ba5] bg-[#287ba5] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={currentPage === pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE DISPATCH MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={createDispatch}
            className="max-h-[90vh] w-full max-w-lg space-y-3.5 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Create Dispatch</h3>
                <p className="text-[13px] text-slate-400">
                  Dispatch relief items to shelter, medical facility, or distribution point
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Source Warehouse *
                </label>
                <select
                  value={newDispatch.from}
                  onChange={(e) =>
                    setNewDispatch({ ...newDispatch, from: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>Central Hub</option>
                  <option>West Depot</option>
                  <option>Eastbank</option>
                  <option>North Hub</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination *
                </label>
                <input
                  required
                  value={newDispatch.to}
                  onChange={(e) =>
                    setNewDispatch({ ...newDispatch, to: e.target.value })
                  }
                  placeholder="e.g., North Ward Shelter"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resource Item *
                </label>
                <input
                  required
                  value={newDispatch.resource}
                  onChange={(e) =>
                    setNewDispatch({ ...newDispatch, resource: e.target.value })
                  }
                  placeholder="e.g., Drinking Water"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  required
                  value={newDispatch.quantity}
                  onChange={(e) =>
                    setNewDispatch({ ...newDispatch, quantity: e.target.value })
                  }
                  placeholder="e.g., 2,000 units"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicle / Carrier *
                </label>
                <input
                  required
                  value={newDispatch.vehicle}
                  onChange={(e) =>
                    setNewDispatch({ ...newDispatch, vehicle: e.target.value })
                  }
                  placeholder="e.g., Truck · RT-204"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Driver Name *
                </label>
                <input
                  required
                  value={newDispatch.driver}
                  onChange={(e) =>
                    setNewDispatch({ ...newDispatch, driver: e.target.value })
                  }
                  placeholder="e.g., Amir Khan"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Arrival Time (ETA) *
              </label>
              <input
                type="time"
                required
                value={newDispatch.eta}
                onChange={(e) =>
                  setNewDispatch({ ...newDispatch, eta: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dispatch Notes
              </label>
              <input
                value={newDispatch.notes}
                onChange={(e) =>
                  setNewDispatch({ ...newDispatch, notes: e.target.value })
                }
                placeholder="Optional notes or delivery instructions"
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2 text-sm font-bold text-white hover:bg-[#1c668d]"
              >
                Create Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DISPATCH DETAILS MODAL WITH LIVE STATUS CONTROLS */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Dispatch Details</h3>
                <p className="mt-0.5 font-mono text-sm text-[#287ba5]">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/80 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{selected.route}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[selected.status]}`}
                >
                  {selected.status}
                </span>
              </div>
              {selected.currentLocation && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin size={13} className="text-sky-600 shrink-0" />
                  <span>Current: {selected.currentLocation}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Resource</p>
                <p className="font-bold text-slate-800 mt-0.5">{selected.resource}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Quantity</p>
                <p className="font-bold text-slate-800 mt-0.5">{selected.quantity}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Vehicle</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selected.vehicle}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Driver</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selected.driver}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Departed</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selected.departed}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">ETA</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selected.eta}</p>
              </div>
            </div>

            {selected.notes && (
              <div className="mt-2 rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Notes</p>
                <p className="font-medium text-slate-700 mt-0.5">{selected.notes}</p>
              </div>
            )}

            {/* QUICK STATUS UPDATE ACTIONS */}
            <div className="mt-4 border-t pt-3">
              <p className="text-sm font-semibold text-slate-600 mb-2">
                Update Tracking Status:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={actionInProgress === selected.id || selected.status === "In Transit"}
                  onClick={() => handleUpdateStatus(selected.id, "In Transit")}
                  className="rounded-lg border border-sky-200 bg-sky-50 py-1.5 text-center text-sm font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-40"
                >
                  Mark In Transit
                </button>
                <button
                  disabled={actionInProgress === selected.id || selected.status === "Delayed"}
                  onClick={() => handleUpdateStatus(selected.id, "Delayed")}
                  className="rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-center text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                >
                  Mark Delayed
                </button>
                <button
                  disabled={actionInProgress === selected.id || selected.status === "Delivered"}
                  onClick={() => handleUpdateStatus(selected.id, "Delivered")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                >
                  Mark Delivered
                </button>
                <button
                  disabled={actionInProgress === selected.id}
                  onClick={() => handleDeleteDispatch(selected.id)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 py-1.5 text-center text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                >
                  <Trash2 size={13} /> Cancel
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-lg bg-[#287ba5] py-2.5 text-sm font-bold text-white hover:bg-[#1c668d] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MORE FILTERS MODAL */}
      {showMoreFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-xs">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">More Filters</h3>
              <button
                onClick={() => setShowMoreFilters(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Route
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className={inputClass}
                >
                  <option>All routes</option>
                  {[...new Set(dispatches.map((d) => d.route))].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fleet Vehicle
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className={inputClass}
                >
                  <option>All vehicles</option>
                  {[...new Set(dispatches.map((d) => d.vehicle))].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  <option>All delivery states</option>
                  {(
                    ["In Transit", "Delayed", "Delivered", "Pending"] as DispatchStatus[]
                  ).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-between gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  resetFilters();
                  setShowMoreFilters(false);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setShowMoreFilters(false);
                }}
                className="rounded-lg bg-[#287ba5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1c668d]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
