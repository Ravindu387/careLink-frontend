import { useMemo, useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Warehouse as WarehouseIcon,
  ClipboardList,
  GitBranch,
  Truck,
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
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { warehouseService } from "../../services/warehouseService";
import type {
  Warehouse,
  WarehouseStatus,
  WarehouseSummary
} from "../../types/warehouse";

const initialWarehouses: Warehouse[] = [
  { id: "WH-001", name: "Central Logistics Hub", location: "Central Ward", capacity: 8420, utilisation: 78, stockLines: 1284, staff: 24, status: "Operational" },
  { id: "WH-004", name: "North District Hub", location: "North District", capacity: 4800, utilisation: 91, stockLines: 684, staff: 16, status: "Near Capacity" },
  { id: "WH-007", name: "Eastbank Warehouse", location: "Eastbank", capacity: 3600, utilisation: 62, stockLines: 342, staff: 11, status: "Operational" },
  { id: "WH-012", name: "West Coast Depot", location: "West District", capacity: 5200, utilisation: 48, stockLines: 520, staff: 14, status: "Operational" },
  { id: "WH-015", name: "South Emergency Store", location: "South District", capacity: 2800, utilisation: 85, stockLines: 410, staff: 9, status: "Near Capacity" },
  { id: "WH-018", name: "Riverside Storage", location: "Riverside", capacity: 4200, utilisation: 55, stockLines: 360, staff: 12, status: "Operational" },
  { id: "WH-021", name: "Emergency Medical Store", location: "Central Ward", capacity: 1900, utilisation: 35, stockLines: 220, staff: 8, status: "Under Maintenance" },
  { id: "WH-025", name: "Eastern Relief Centre", location: "East District", capacity: 3100, utilisation: 67, stockLines: 290, staff: 10, status: "Operational" },
];

const navigation = [
  { label: "Resource Dashboard", path: "/resource-manager/dashboard", icon: ChartNoAxesCombined },
  { label: "Inventory", path: "/resource-manager/inventory", icon: Package },
  { label: "Warehouses", path: "/resource-manager/warehouses", icon: WarehouseIcon },
  { label: "Resource Requests", path: "/resource-manager/requests", icon: ClipboardList, count: 18 },
  { label: "Allocations", path: "/resource-manager/allocations", icon: GitBranch, count: 7 },
  { label: "Dispatch & Tracking", path: "/resource-manager/dispatch", icon: Truck, count: 12 },
  { label: "Stock Transfers", path: "/resource-manager/transfers", icon: ArrowLeftRight },
  { label: "Procurement", path: "/resource-manager/procurement", icon: ShoppingCart },
  { label: "Suppliers", path: "/resource-manager/suppliers", icon: BriefcaseBusiness },
  { label: "Alerts", path: "/resource-manager/alerts", icon: AlertTriangle, count: 9 },
  { label: "Reports & Analytics", path: "/resource-manager/reports", icon: ChartNoAxesCombined },
  { label: "Audit Log", path: "/resource-manager/audit-log", icon: Clock3 },
  { label: "Settings", path: "/resource-manager/settings", icon: Settings }
];

const tabs = ["All", "Needs action", "Active", "Completed", "Exceptions"];

const statusStyles: Record<string, string> = {
  Operational: "bg-emerald-50 text-emerald-700",
  "Near Capacity": "bg-amber-50 text-amber-700",
  "Under Maintenance": "bg-red-50 text-red-700",
};

export default function WarehousePage() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [summary, setSummary] = useState<WarehouseSummary | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [capacityState, setCapacityState] = useState("All capacity states");
  const [status, setStatus] = useState("All statuses");

  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<Warehouse | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    capacity: "1000",
    staff: "5",
  });

  const pageSize = 4;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [warehousesData, summaryData] = await Promise.all([
        warehouseService.getWarehouses(),
        warehouseService.getSummary().catch(() => null)
      ]);

      if (warehousesData && warehousesData.length > 0) {
        setWarehouses(warehousesData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (error) {
      console.warn("Backend unavailable, loading local warehouse defaults:", error);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const searchMatch =
        `${warehouse.id} ${warehouse.name} ${warehouse.location}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const districtMatch =
        district === "All districts" ||
        warehouse.location === district;

      const capacityMatch =
        capacityState === "All capacity states" ||
        (capacityState === "Normal" && warehouse.utilisation < 85) ||
        (capacityState === "Near Capacity" && warehouse.utilisation >= 85);

      const statusMatch =
        status === "All statuses" ||
        warehouse.status === status;

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          (warehouse.utilisation >= 85 ||
            warehouse.status === "Under Maintenance")) ||
        (activeTab === "Active" &&
          warehouse.status === "Operational") ||
        (activeTab === "Completed" &&
          warehouse.status === "Operational") ||
        (activeTab === "Exceptions" &&
          warehouse.status === "Under Maintenance");

      return searchMatch && districtMatch &&
        capacityMatch && statusMatch && tabMatch;
    });
  }, [warehouses, search, district, capacityState, status, activeTab]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWarehouses.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const displayedWarehouses = filteredWarehouses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Statistics
  const averageUtilisation = summary?.averageUtilisation ?? (warehouses.length
    ? Math.round(
        warehouses.reduce((sum, item) => sum + item.utilisation, 0) /
        warehouses.length
      )
    : 0);

  const nearCapacityCount = summary?.capacityAlerts ?? warehouses.filter(
    (item) => item.utilisation >= 85 || item.status === "Near Capacity"
  ).length;

  const operationalSitesCount = summary?.operationalSites ?? warehouses.filter(
    (item) => item.status === "Operational"
  ).length;

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setDistrict("All districts");
    setCapacityState("All capacity states");
    setStatus("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Add warehouse
  const handleAddWarehouse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const capacity = Number(newWarehouse.capacity);
    const staff = Number(newWarehouse.staff);

    if (
      !newWarehouse.name.trim() ||
      !newWarehouse.location.trim() ||
      !Number.isFinite(capacity) ||
      capacity <= 0 ||
      !Number.isInteger(staff) ||
      staff < 0
    ) return;

    setIsSubmitting(true);

    try {
      const created = await warehouseService.createWarehouse({
        name: newWarehouse.name.trim(),
        location: newWarehouse.location.trim(),
        capacity,
        staff,
        utilisation: 0,
        stockLines: 0,
        status: "Operational"
      });

      setWarehouses((prev) => [created, ...prev]);
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Warehouse ${created.name} (${created.id}) added successfully!`
      });
    } catch (error) {
      console.warn("Backend error on create, adding locally:", error);
      const warehouse: Warehouse = {
        id: `WH-${String(Date.now()).slice(-3)}`,
        name: newWarehouse.name.trim(),
        location: newWarehouse.location.trim(),
        capacity,
        utilisation: 0,
        stockLines: 0,
        staff,
        status: "Operational",
      };

      setWarehouses((previous) => [warehouse, ...previous]);
      setStatusMessage({
        type: "info",
        text: `Warehouse ${warehouse.name} added locally (backend offline).`
      });
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
      setNewWarehouse({
        name: "",
        location: "",
        capacity: "1000",
        staff: "5",
      });
      resetFilters();
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: WarehouseStatus) => {
    try {
      setIsSubmitting(true);
      const updated = await warehouseService.updateStatus(id, { status: newStatus });
      setWarehouses((prev) => prev.map((w) => (w.id === id ? updated : w)));
      if (selectedWarehouse && selectedWarehouse.id === id) {
        setSelectedWarehouse(updated);
      }
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Warehouse ${id} status set to ${newStatus}.`
      });
    } catch (error) {
      console.warn("Backend update failed, updating locally:", error);
      setWarehouses((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
      );
      if (selectedWarehouse && selectedWarehouse.id === id) {
        setSelectedWarehouse((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      setStatusMessage({
        type: "info",
        text: `Warehouse ${id} status updated locally.`
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Delete Warehouse
  const handleDeleteWarehouse = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete warehouse ${id}?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await warehouseService.deleteWarehouse(id);
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
      setSelectedWarehouse(null);
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Warehouse ${id} deleted successfully.`
      });
    } catch (error) {
      console.warn("Backend delete failed, removing locally:", error);
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
      setSelectedWarehouse(null);
      setStatusMessage({
        type: "info",
        text: `Warehouse ${id} removed locally.`
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      "Warehouse ID",
      "Warehouse",
      "Location",
      "Capacity",
      "Utilisation",
      "Stock Lines",
      "Staff",
      "Status",
    ];

    const rows = filteredWarehouses.map((item) => [
      item.id,
      item.name,
      item.location,
      item.capacity,
      `${item.utilisation}%`,
      item.stockLines,
      item.staff,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "warehouse-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-800">
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
            <h1 className="text-xl font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">Resource Management</p>
          </div>
        </div>

        {/* Active Operation */}
        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>

          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>

          <p className="mt-1 text-[10px] text-sky-200">
            Greater Riverton · Level 4
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Warehouses";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (active) return;
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] transition ${
                  active
                    ? "border-l-[3px] border-[#62b7a8] bg-[#287ba5] font-semibold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.label}</span>

                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Daniel Perera</p>
            <p className="text-[10px] text-sky-200">Resource Manager</p>
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

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[280px]">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-7">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="flex max-w-[480px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <Search size={16} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />

            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">Primary Hub</p>
              <p className="text-[10px] font-bold">Central Logistics Hub</p>
            </div>

            <button className="hidden rounded-lg border p-2.5 sm:block" title="Security Status">
              <ShieldCheck size={18} />
            </button>

            <button className="relative rounded-lg border p-2.5" title="Alerts">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                9
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
              DP
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Daniel P.</p>
              <p className="text-[9px] text-slate-400">Resource Manager</p>
            </div>

            <ChevronRight size={17} className="hidden sm:block text-slate-400" />
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB & API STATUS BADGE */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>
              Resource Operations
              <ChevronRight size={12} className="mx-1 inline" />
              <span className="font-semibold text-[#163d5c]">Warehouses</span>
            </div>

            <div className="flex items-center gap-2">
              {isBackendConnected === true && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  API Connected
                </span>
              )}
              {isBackendConnected === false && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Offline Mode
                </span>
              )}
            </div>
          </div>

          {/* STATUS NOTIFICATION BANNER */}
          {statusMessage && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-3.5 text-xs transition-all ${
                statusMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : statusMessage.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-sky-600 shrink-0" />
              )}
              <span className="flex-1 font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* PAGE HEADING */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Warehouses
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Monitor storage capacity, stock coverage, staffing, and warehouse operations.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download size={15} />
                Export
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Plus size={16} />
                Add Warehouse
              </button>
            </div>
          </section>

          {/* STATISTICS CARDS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Operational sites",
                value: operationalSitesCount,
                note: `Across ${new Set(warehouses.map(w => w.location)).size} districts`,
                icon: WarehouseIcon,
                style: "bg-emerald-50 text-emerald-700",
              },
              {
                title: "Average utilisation",
                value: `${averageUtilisation}%`,
                note: "Storage efficiency index",
                icon: ChartNoAxesCombined,
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Receiving today",
                value: summary?.receivingToday ?? 8,
                note: "14,200 total units scheduled",
                icon: ClipboardList,
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Capacity alerts",
                value: nearCapacityCount,
                note: "Require rebalancing",
                icon: AlertTriangle,
                style: "bg-amber-50 text-amber-600",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.style}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {card.value}
                    </h3>
                    <p className="text-[9px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* TABS */}
          <section>
            <div className="flex flex-wrap gap-6 border-b border-slate-200">
              {tabs.map((tab) => {
                const count =
                  tab === "All"
                    ? warehouses.length
                    : tab === "Needs action"
                    ? warehouses.filter(w => w.utilisation >= 85 || w.status === "Under Maintenance").length
                    : tab === "Active"
                    ? warehouses.filter(w => w.status === "Operational").length
                    : tab === "Completed"
                    ? warehouses.filter(w => w.status === "Operational").length
                    : tab === "Exceptions"
                    ? warehouses.filter(w => w.status === "Under Maintenance").length
                    : 0;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`relative flex items-center gap-1.5 pb-4 text-[11px] transition ${
                      activeTab === tab
                        ? "font-bold text-sky-700"
                        : "text-slate-500 hover:text-sky-700"
                    }`}
                  >
                    {tab}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                        activeTab === tab
                          ? "bg-sky-100 text-sky-700 font-semibold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>

                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="flex flex-wrap gap-2">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <Search size={16} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search warehouses..."
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>

            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
            >
              <option>All districts</option>
              {[...new Set(warehouses.map(w => w.location))].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>

            <select
              value={capacityState}
              onChange={(e) => {
                setCapacityState(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
            >
              <option>All capacity states</option>
              <option>Normal</option>
              <option>Near Capacity</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
            >
              <option>All statuses</option>
              <option>Operational</option>
              <option>Near Capacity</option>
              <option>Under Maintenance</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Filter size={15} />
              Reset Filters
            </button>
          </section>

          {/* WAREHOUSE TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 p-8">
                <Loader2 size={28} className="animate-spin text-[#287ba5]" />
                <p className="text-xs text-slate-500">Loading warehouses...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-500">
                    <tr>
                      {[
                        "Warehouse ID",
                        "Warehouse",
                        "Location",
                        "Capacity",
                        "Utilisation",
                        "Stock Lines",
                        "Staff",
                        "Status",
                        "",
                      ].map((heading, index) => (
                        <th key={index} className="px-3 py-4 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {displayedWarehouses.map((warehouse) => (
                      <tr
                        key={warehouse.id}
                        className="border-t border-slate-100 text-[11px] transition hover:bg-slate-50"
                      >
                        <td className="px-3 py-4 font-bold text-slate-800">
                          {warehouse.id}
                        </td>

                        <td className="px-3 py-4 font-medium text-slate-700">
                          {warehouse.name}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {warehouse.location}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {formatNumber(warehouse.capacity)} m²
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-medium">
                              {warehouse.utilisation}%
                            </span>

                            <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-slate-100 sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  warehouse.utilisation >= 85
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, warehouse.utilisation)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {formatNumber(warehouse.stockLines)}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {warehouse.staff}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
                              statusStyles[warehouse.status]
                            }`}
                          >
                            {warehouse.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <button
                            type="button"
                            title="View warehouse details"
                            onClick={() => setSelectedWarehouse(warehouse)}
                            className="p-1 hover:text-sky-700"
                          >
                            <ChevronRight size={18} className="text-slate-400 hover:text-sky-700" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {displayedWarehouses.length === 0 && (
                  <div className="p-10 text-center text-xs text-slate-400">
                    No warehouses found. Try changing your search or filters.
                  </div>
                )}
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredWarehouses.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –{Math.min(safePage * pageSize, filteredWarehouses.length)}{" "}
                of {filteredWarehouses.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-[10px] ${
                      safePage === page
                        ? "border-sky-700 bg-sky-700 font-bold text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-[10px] text-slate-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <footer className="py-2 text-center text-[10px] text-slate-400">
            ReliefOS · Humanitarian Resource Management Platform
          </footer>
        </div>
      </main>

      {/* ADD WAREHOUSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleAddWarehouse}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Add New Warehouse</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the warehouse details below to register the facility.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Warehouse Name
              </label>

              <input
                required
                value={newWarehouse.name}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    name: e.target.value,
                  })
                }
                placeholder="Enter warehouse name"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Location / District
              </label>

              <input
                required
                value={newWarehouse.location}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    location: e.target.value,
                  })
                }
                placeholder="Enter district or city"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Storage Capacity (m²)
              </label>

              <input
                required
                type="number"
                min="1"
                value={newWarehouse.capacity}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    capacity: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Number of Staff
              </label>

              <input
                required
                type="number"
                min="0"
                step="1"
                value={newWarehouse.staff}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    staff: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1c668d] disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>Save Warehouse</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WAREHOUSE DETAILS MODAL */}
      {selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Warehouse Details</h3>
                <p className="text-xs text-slate-400">{selectedWarehouse.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWarehouse(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl bg-sky-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
                  <WarehouseIcon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedWarehouse.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedWarehouse.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteWarehouse(selectedWarehouse.id)}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50"
                title="Delete warehouse"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {[
              ["Warehouse ID", selectedWarehouse.id],
              ["Warehouse Name", selectedWarehouse.name],
              ["Location", selectedWarehouse.location],
              ["Capacity", `${formatNumber(selectedWarehouse.capacity)} m²`],
              ["Utilisation", `${selectedWarehouse.utilisation}%`],
              ["Stock Lines", formatNumber(selectedWarehouse.stockLines)],
              ["Staff", String(selectedWarehouse.staff)],
              ["Status", selectedWarehouse.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}

            {/* STATUS WORKFLOW ACTIONS */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Operational Status
              </p>
              <div className="flex gap-2">
                {selectedWarehouse.status !== "Operational" && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleUpdateStatus(selectedWarehouse.id, "Operational")
                    }
                    className="flex-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 py-1.5 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Set Operational
                  </button>
                )}
                {selectedWarehouse.status !== "Near Capacity" && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleUpdateStatus(selectedWarehouse.id, "Near Capacity")
                    }
                    className="flex-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 py-1.5 text-xs font-semibold hover:bg-amber-100 disabled:opacity-50"
                  >
                    Set Near Capacity
                  </button>
                )}
                {selectedWarehouse.status !== "Under Maintenance" && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleUpdateStatus(selectedWarehouse.id, "Under Maintenance")
                    }
                    className="flex-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 py-1.5 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50"
                  >
                    Under Maintenance
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedWarehouse(null)}
              className="w-full rounded-lg bg-[#287ba5] py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
