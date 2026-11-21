import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Warehouse,
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
  Filter,
  X,
  Menu,
  RotateCcw,
  Wifi,
  WifiOff,
  RefreshCw,
  Box,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { inventoryService } from "../../services/inventoryService";
import type {
  InventoryItem,
  InventoryStatus,
  InventorySummary,
  CreateInventoryPayload,
} from "../../types/inventory";

const initialInventory: InventoryItem[] = [
  {
    id: "RES-00128",
    resource: "Drinking Water - 10L",
    category: "Food & Water",
    warehouse: "Central Logistics Hub",
    onHand: 8420,
    reserved: 3100,
    inTransit: 2500,
    available: 2820,
    status: "Healthy",
    unit: "bottles",
  },
  {
    id: "RES-00241",
    resource: "Family Food Pack",
    category: "Food & Water",
    warehouse: "North District Hub",
    onHand: 1284,
    reserved: 940,
    inTransit: 250,
    available: 94,
    status: "Low Stock",
    unit: "packs",
  },
  {
    id: "RES-00314",
    resource: "Emergency Shelter Kit",
    category: "Shelter",
    warehouse: "Eastbank Warehouse",
    onHand: 342,
    reserved: 218,
    inTransit: 76,
    available: 48,
    status: "Healthy",
    unit: "kits",
  },
  {
    id: "RES-00402",
    resource: "Trauma Medical Kit",
    category: "Medical",
    warehouse: "Central Logistics Hub",
    onHand: 86,
    reserved: 64,
    inTransit: 18,
    available: 4,
    status: "Critical",
    unit: "kits",
  },
  {
    id: "RES-00518",
    resource: "Hygiene Kit",
    category: "WASH",
    warehouse: "West Coast Depot",
    onHand: 2450,
    reserved: 1220,
    inTransit: 600,
    available: 630,
    status: "Healthy",
    unit: "kits",
  },
  {
    id: "RES-00610",
    resource: "Thermal Blanket",
    category: "Non-food Item",
    warehouse: "North District Hub",
    onHand: 520,
    reserved: 412,
    inTransit: 90,
    available: 18,
    status: "Low Stock",
    unit: "units",
  },
  {
    id: "RES-00721",
    resource: "Diesel Fuel",
    category: "Transport & Fuel",
    warehouse: "West Coast Depot",
    onHand: 1800,
    reserved: 1500,
    inTransit: 100,
    available: 200,
    status: "Critical",
    unit: "L",
  },
  {
    id: "RES-00832",
    resource: "Emergency Tent",
    category: "Shelter",
    warehouse: "Eastbank Warehouse",
    onHand: 680,
    reserved: 210,
    inTransit: 100,
    available: 370,
    status: "Healthy",
    unit: "units",
  },
  {
    id: "RES-00915",
    resource: "First Aid Kit",
    category: "Medical",
    warehouse: "Central Logistics Hub",
    onHand: 340,
    reserved: 180,
    inTransit: 40,
    available: 120,
    status: "Healthy",
    unit: "kits",
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

const statusClasses: Record<InventoryStatus, string> = {
  Healthy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Low Stock": "bg-amber-50 text-amber-700 border border-amber-200",
  Critical: "bg-rose-50 text-rose-700 border border-rose-200",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500";

export default function InventoryPage() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const [stockStatus, setStockStatus] = useState("All stock states");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // New Resource Form state
  const [newResource, setNewResource] = useState({
    resource: "",
    category: "Food & Water",
    warehouse: "Central Logistics Hub",
    onHand: "100",
    unit: "units",
  });

  const [adjustmentAmount, setAdjustmentAmount] = useState<string>("");

  const pageSize = 6;

  // FETCH DATA FROM BACKEND
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inventoryData, summaryData] = await Promise.all([
        inventoryService.getInventory({
          search: search || undefined,
          category: category !== "All categories" ? category : undefined,
          warehouse: warehouse !== "All warehouses" ? warehouse : undefined,
          status: stockStatus !== "All stock states" ? stockStatus : undefined,
          tab: activeTab !== "All" ? activeTab : undefined,
        }),
        inventoryService.getInventorySummary(),
      ]);

      if (inventoryData && Array.isArray(inventoryData)) {
        setInventory(inventoryData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local inventory:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, warehouse, stockStatus, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CLIENT-SIDE FILTERING (fallback / rapid reactivity)
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        `${item.id} ${item.resource} ${item.category} ${item.warehouse}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All categories" || item.category === category;

      const matchesWarehouse =
        warehouse === "All warehouses" || item.warehouse === warehouse;

      const matchesStatus =
        stockStatus === "All stock states" || item.status === stockStatus;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" && item.status !== "Healthy") ||
        (activeTab === "Active" && item.status === "Healthy") ||
        (activeTab === "Completed" && item.available > 0) ||
        (activeTab === "Exceptions" && item.status === "Critical");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [inventory, search, category, warehouse, stockStatus, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const displayedItems = filteredInventory.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const formatNumber = (number: number) =>
    new Intl.NumberFormat("en-US").format(number);

  const resetFilters = () => {
    setSearch("");
    setCategory("All categories");
    setWarehouse("All warehouses");
    setStockStatus("All stock states");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // EXPORT CSV
  const exportInventory = () => {
    const headers = [
      "Resource ID",
      "Resource",
      "Category",
      "Warehouse",
      "On Hand",
      "Reserved",
      "In Transit",
      "Available",
      "Status",
      "Unit",
    ];

    const rows = filteredInventory.map((item) => [
      item.id,
      item.resource,
      item.category,
      item.warehouse,
      item.onHand,
      item.reserved,
      item.inTransit,
      item.available,
      item.status,
      item.unit || "units",
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
    link.download = `carelink-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ADD RESOURCE
  const addResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quantity = Number(newResource.onHand);
    if (!newResource.resource.trim() || !Number.isFinite(quantity) || quantity < 0)
      return;

    const payload: CreateInventoryPayload = {
      resource: newResource.resource.trim(),
      category: newResource.category,
      warehouse: newResource.warehouse,
      onHand: quantity,
      reserved: 0,
      inTransit: 0,
      unit: newResource.unit.trim() || "units",
    };

    try {
      const created = await inventoryService.createInventoryItem(payload);
      setInventory((previous) => [created, ...previous]);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adding resource locally:", err);
      const item: InventoryItem = {
        id: `RES-${String(Date.now()).slice(-5)}`,
        resource: newResource.resource.trim(),
        category: newResource.category,
        warehouse: newResource.warehouse,
        onHand: quantity,
        reserved: 0,
        inTransit: 0,
        available: quantity,
        status:
          quantity <= 10 ? "Critical" : quantity <= 100 ? "Low Stock" : "Healthy",
        unit: newResource.unit,
      };
      setInventory((previous) => [item, ...previous]);
    } finally {
      setNewResource({
        resource: "",
        category: "Food & Water",
        warehouse: "Central Logistics Hub",
        onHand: "100",
        unit: "units",
      });
      setShowAddForm(false);
      resetFilters();
    }
  };

  // ADJUST STOCK
  const handleStockAdjustment = async (delta: number) => {
    if (!selectedItem) return;
    setActionInProgress(selectedItem.id);

    try {
      const updated = await inventoryService.adjustStock(selectedItem.id, {
        quantityDelta: delta,
        reason: "Manual adjustment via Inventory portal",
      });
      setInventory((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updated : i))
      );
      setSelectedItem(updated);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adjusting stock locally:", err);
      const newOnHand = Math.max(0, selectedItem.onHand + delta);
      const newAvailable = Math.max(0, newOnHand - selectedItem.reserved);
      const newStatus: InventoryStatus =
        newAvailable <= 10
          ? "Critical"
          : newAvailable <= 100
          ? "Low Stock"
          : "Healthy";

      const updated = {
        ...selectedItem,
        onHand: newOnHand,
        available: newAvailable,
        status: newStatus,
      };
      setInventory((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updated : i))
      );
      setSelectedItem(updated);
    } finally {
      setActionInProgress(null);
      setAdjustmentAmount("");
    }
  };

  // DELETE RESOURCE
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm(`Are you sure you want to remove item ${id} from inventory?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      await inventoryService.deleteInventoryItem(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, deleting locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setInventory((prev) => prev.filter((i) => i.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  // STATS
  const statsCards = [
    {
      title: "Total SKUs",
      value: summary?.totalSkus ? formatNumber(summary.totalSkus) : formatNumber(inventory.length),
      note: "Across 4 active hubs",
      icon: Layers,
      style: "bg-sky-50 text-sky-700",
    },
    {
      title: "Low stock",
      value: summary?.lowStock ?? inventory.filter((i) => i.status === "Low Stock").length,
      note: "Requires replenishment",
      icon: AlertTriangle,
      style: "bg-amber-50 text-amber-700",
    },
    {
      title: "Out of stock / Critical",
      value: summary?.outOfStock ?? inventory.filter((i) => i.status === "Critical").length,
      note: "Urgent procurement needed",
      icon: AlertCircle,
      style: "bg-rose-50 text-rose-700",
    },
    {
      title: "Expiring soon",
      value: summary?.expiringSoon ?? 42,
      note: "Within next 30 days",
      icon: Clock,
      style: "bg-purple-50 text-purple-700",
    },
  ];

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

        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>
          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-[10px] text-sky-200">Greater Riverton · Level 4</p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Inventory";
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
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] text-white">
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

          <div className="flex max-w-[480px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              placeholder="Search resources, categories, warehouses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend Connection Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
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
              title="Refresh Inventory"
              className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">Primary Hub</p>
              <p className="text-[10px] font-bold">Central Logistics Hub</p>
            </div>
            <button className="hidden rounded-lg border p-2.5 sm:block" aria-label="Security">
              <ShieldCheck size={18} />
            </button>
            <button className="relative rounded-lg border p-2.5" aria-label="Notifications">
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
            <ChevronRight size={17} className="hidden sm:block" />
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* Breadcrumb and heading */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] text-slate-400 mb-1">
                Resource Operations <ChevronRight size={12} className="mx-1 inline" />
                <span className="font-semibold text-[#163d5c]">Inventory</span>
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Inventory
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Track available, reserved, in-transit, and usable stock across all storage locations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportInventory}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Plus size={15} /> Add Resource
              </button>
            </div>
          </section>

          {/* Statistics cards */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.style}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                    <p className="text-[10px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Tabs */}
          <section>
            <div className="flex flex-wrap gap-6 border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`relative flex items-center gap-1.5 pb-3 text-xs font-medium transition ${
                    activeTab === tab
                      ? "font-bold text-sky-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {tab === "All" && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] text-sky-800 font-semibold">
                      {inventory.length}
                    </span>
                  )}
                  {tab === "Needs action" && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] text-amber-800 font-semibold">
                      {inventory.filter((i) => i.status !== "Healthy").length}
                    </span>
                  )}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Search and filters */}
          <section className="flex flex-wrap gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search inventory..."
                className="w-full py-2.5 text-xs outline-none"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All categories</option>
              {[
                "Food & Water",
                "Shelter",
                "Medical",
                "WASH",
                "Non-food Item",
                "Transport & Fuel",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All warehouses</option>
              {[
                "Central Logistics Hub",
                "North District Hub",
                "Eastbank Warehouse",
                "West Coast Depot",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All stock states</option>
              {["Healthy", "Low Stock", "Critical"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMoreFilters(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
            >
              <Filter size={14} /> More filters
            </button>

            {(search ||
              category !== "All categories" ||
              warehouse !== "All warehouses" ||
              stockStatus !== "All stock states" ||
              activeTab !== "All") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </section>

          {/* Inventory table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Resource ID</th>
                    <th className="px-4 py-3.5 font-semibold">Resource</th>
                    <th className="px-4 py-3.5 font-semibold">Category</th>
                    <th className="px-4 py-3.5 font-semibold">Warehouse</th>
                    <th className="px-4 py-3.5 font-semibold">On Hand</th>
                    <th className="px-4 py-3.5 font-semibold">Reserved</th>
                    <th className="px-4 py-3.5 font-semibold">In Transit</th>
                    <th className="px-4 py-3.5 font-semibold">Available</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 text-xs hover:bg-slate-50/80 transition"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800">
                        {item.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-800">
                        {item.resource}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {item.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {item.warehouse}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-mono">
                        {formatNumber(item.onHand)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-mono">
                        {formatNumber(item.reserved)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-mono">
                        {formatNumber(item.inTransit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold font-mono text-slate-900">
                        {formatNumber(item.available)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <button
                          title={`Manage ${item.resource}`}
                          onClick={() => setSelectedItem(item)}
                          className="rounded p-1 text-slate-400 hover:bg-sky-50 hover:text-sky-700 transition"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayedItems.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <Box size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No inventory items found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try adjusting your search criteria or resetting filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs">
              <p className="text-[11px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredInventory.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(safePage * pageSize, filteredInventory.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredInventory.length}
                </span>{" "}
                SKUs
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 min-w-7 rounded-lg border px-2 text-xs font-semibold transition ${
                      safePage === page
                        ? "border-[#287ba5] bg-[#287ba5] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
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

      {/* ADD RESOURCE MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={addResource}
            className="w-full max-w-md space-y-3.5 rounded-2xl bg-white p-6 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Add New Resource</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Register SKU in warehouse ledger
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resource Name *
              </label>
              <input
                required
                value={newResource.resource}
                onChange={(e) =>
                  setNewResource({ ...newResource, resource: e.target.value })
                }
                placeholder="e.g., Trauma Medical Kit"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={newResource.category}
                  onChange={(e) =>
                    setNewResource({ ...newResource, category: e.target.value })
                  }
                  className={inputClass}
                >
                  {[
                    "Food & Water",
                    "Shelter",
                    "Medical",
                    "WASH",
                    "Non-food Item",
                    "Transport & Fuel",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warehouse *
                </label>
                <select
                  value={newResource.warehouse}
                  onChange={(e) =>
                    setNewResource({ ...newResource, warehouse: e.target.value })
                  }
                  className={inputClass}
                >
                  {[
                    "Central Logistics Hub",
                    "North District Hub",
                    "Eastbank Warehouse",
                    "West Coast Depot",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial On-Hand Quantity *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={newResource.onHand}
                  onChange={(e) =>
                    setNewResource({ ...newResource, onHand: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit of Measure
                </label>
                <input
                  value={newResource.unit}
                  onChange={(e) =>
                    setNewResource({ ...newResource, unit: e.target.value })
                  }
                  placeholder="e.g. units, kits, L"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2 text-xs font-bold text-white hover:bg-[#1c668d]"
              >
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESOURCE DETAILS & ADJUSTMENT MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedItem.resource}
                </h3>
                <p className="mt-0.5 font-mono text-xs text-[#287ba5]">
                  {selectedItem.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/80 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Location
                  </span>
                  <p className="font-bold text-slate-800">{selectedItem.warehouse}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses[selectedItem.status]}`}
                >
                  {selectedItem.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">Category</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedItem.category}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">Available</p>
                <p className="font-bold text-slate-800 mt-0.5 font-mono">
                  {formatNumber(selectedItem.available)} {selectedItem.unit || "units"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">On Hand</p>
                <p className="font-semibold text-slate-700 mt-0.5 font-mono">
                  {formatNumber(selectedItem.onHand)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">Reserved</p>
                <p className="font-semibold text-slate-700 mt-0.5 font-mono">
                  {formatNumber(selectedItem.reserved)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">In Transit</p>
                <p className="font-semibold text-slate-700 mt-0.5 font-mono">
                  {formatNumber(selectedItem.inTransit)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">Unit</p>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {selectedItem.unit || "units"}
                </p>
              </div>
            </div>

            {/* QUICK ADJUSTMENT CONTROLS */}
            <div className="mt-4 border-t pt-3">
              <p className="text-[11px] font-semibold text-slate-700 mb-2">
                Quick Stock Adjustment:
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  disabled={actionInProgress === selectedItem.id}
                  onClick={() => handleStockAdjustment(10)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                >
                  <TrendingUp size={12} /> +10
                </button>
                <button
                  disabled={actionInProgress === selectedItem.id}
                  onClick={() => handleStockAdjustment(50)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                >
                  <TrendingUp size={12} /> +50
                </button>
                <button
                  disabled={actionInProgress === selectedItem.id || selectedItem.onHand < 10}
                  onClick={() => handleStockAdjustment(-10)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                >
                  <TrendingDown size={12} /> -10
                </button>
                <button
                  disabled={actionInProgress === selectedItem.id || selectedItem.onHand < 50}
                  onClick={() => handleStockAdjustment(-50)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                >
                  <TrendingDown size={12} /> -50
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Custom +/- amount"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none"
                />
                <button
                  disabled={!adjustmentAmount || actionInProgress === selectedItem.id}
                  onClick={() => {
                    const val = Number(adjustmentAmount);
                    if (Number.isFinite(val) && val !== 0) {
                      handleStockAdjustment(val);
                    }
                  }}
                  className="rounded-lg bg-[#287ba5] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1c668d] disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 border-t pt-3">
              <button
                disabled={actionInProgress === selectedItem.id}
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="flex items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 py-2 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
              >
                <Trash2 size={13} /> Delete SKU
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
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
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option>All categories</option>
                  {[
                    "Food & Water",
                    "Shelter",
                    "Medical",
                    "WASH",
                    "Non-food Item",
                    "Transport & Fuel",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warehouse
                </label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className={inputClass}
                >
                  <option>All warehouses</option>
                  {[
                    "Central Logistics Hub",
                    "North District Hub",
                    "Eastbank Warehouse",
                    "West Coast Depot",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Stock Status
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className={inputClass}
                >
                  <option>All stock states</option>
                  {["Healthy", "Low Stock", "Critical"].map((v) => (
                    <option key={v}>{v}</option>
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
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={13} /> Reset
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setShowMoreFilters(false);
                }}
                className="rounded-lg bg-[#287ba5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1c668d]"
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
