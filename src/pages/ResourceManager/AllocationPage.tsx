import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Check,
  X, Menu, Timer, RefreshCw, Plus, Download,
  Wifi, WifiOff, Trash2, Eye, SlidersHorizontal, CheckCircle2
} from "lucide-react";

import { allocationService } from "../../services/allocationService";
import type {
  Allocation,
  AllocationStatus,
  CreateAllocationPayload,
} from "../../types/allocation";

const initialAllocations: Allocation[] = [
  {
    id: "AL-1048",
    request: "RR-2839",
    resource: "Trauma Medical Kit",
    quantity: "18 / 24",
    source: "Central Hub",
    destination: "Medical Team 3",
    approvedBy: "Daniel Perera",
    approvedAt: "22 Jun - 13:42",
    status: "Partially Allocated",
    warehouse: "Central Hub",
  },
  {
    id: "AL-1044",
    request: "RR-2828",
    resource: "Fuel - Diesel",
    quantity: "1,200 L",
    source: "West Depot",
    destination: "Mobility Team",
    approvedBy: "Daniel Perera",
    approvedAt: "22 Jun - 12:55",
    status: "Allocated",
    warehouse: "West Depot",
  },
  {
    id: "AL-1039",
    request: "RR-2812",
    resource: "Shelter Kit",
    quantity: "80 units",
    source: "Eastbank",
    destination: "CareLink Network",
    approvedBy: "Maya Silva",
    approvedAt: "22 Jun - 11:18",
    status: "Released",
    warehouse: "Eastbank",
  },
  {
    id: "AL-1034",
    request: "RR-2801",
    resource: "Drinking Water",
    quantity: "3,000 units",
    source: "Central Hub",
    destination: "North Ward",
    approvedBy: "Daniel Perera",
    approvedAt: "22 Jun - 09:20",
    status: "Completed",
    warehouse: "Central Hub",
  },
  {
    id: "AL-1031",
    request: "RR-2798",
    resource: "Family Food Pack",
    quantity: "500 units",
    source: "North Hub",
    destination: "Eastbank Community",
    approvedBy: "Maya Silva",
    approvedAt: "21 Jun - 16:30",
    status: "Pending",
    warehouse: "North Hub",
  },
  {
    id: "AL-1028",
    request: "RR-2791",
    resource: "Thermal Blanket",
    quantity: "200 units",
    source: "West Depot",
    destination: "Riverton Shelter",
    approvedBy: "Daniel Perera",
    approvedAt: "21 Jun - 14:10",
    status: "Allocated",
    warehouse: "West Depot",
  },
  {
    id: "AL-1025",
    request: "RR-2785",
    resource: "Hygiene Kit",
    quantity: "150 units",
    source: "Eastbank",
    destination: "South District",
    approvedBy: "Maya Silva",
    approvedAt: "21 Jun - 10:45",
    status: "Completed",
    warehouse: "Eastbank",
  },
];

const navigation = [
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

const tabs = [
  "All",
  "Needs action",
  "Active",
  "Completed",
  "Exceptions",
];

const statusStyles: Record<string, string> = {
  "Partially Allocated": "bg-sky-50 text-sky-700 border border-sky-200",
  Allocated: "bg-blue-50 text-blue-700 border border-blue-200",
  Released: "bg-slate-100 text-slate-700 border border-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function AllocationPage() {
  const navigate = useNavigate();

  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const [destination, setDestination] = useState("All destinations");
  const [status, setStatus] = useState("All allocation states");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [newAllocation, setNewAllocation] = useState<CreateAllocationPayload>({
    request: "",
    resource: "",
    quantity: "",
    source: "Central Hub",
    destination: "",
  });

  const pageSize = 4;

  // FETCH ALLOCATIONS FROM BACKEND
  const loadAllocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await allocationService.getAllocations();
      if (data && Array.isArray(data) && data.length > 0) {
        setAllocations(data);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local allocations:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllocations();
  }, [loadAllocations]);

  // Search and filters
  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      const searchMatch =
        `${item.id} ${item.request} ${item.resource} ${item.destination} ${item.source}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const warehouseMatch =
        warehouse === "All warehouses" ||
        item.warehouse === warehouse ||
        item.source === warehouse;

      const destinationMatch =
        destination === "All destinations" ||
        item.destination === destination;

      const statusMatch =
        status === "All allocation states" ||
        item.status === status;

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Pending", "Partially Allocated"].includes(item.status)) ||
        (activeTab === "Active" &&
          ["Allocated", "Released"].includes(item.status)) ||
        (activeTab === "Completed" &&
          item.status === "Completed") ||
        (activeTab === "Exceptions" &&
          item.status === "Partially Allocated");

      return (
        searchMatch &&
        warehouseMatch &&
        destinationMatch &&
        statusMatch &&
        tabMatch
      );
    });
  }, [
    allocations,
    search,
    warehouse,
    destination,
    status,
    activeTab,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAllocations.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const displayedAllocations = filteredAllocations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Statistics
  const activeCount = allocations.length;
  const awaitingCount = allocations.filter(
    (item) => item.status === "Pending" ||
      item.status === "Partially Allocated"
  ).length;

  const completedCount = allocations.filter(
    (item) => item.status === "Completed"
  ).length;

  const exceptionCount = allocations.filter(
    (item) => item.status === "Partially Allocated"
  ).length;

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setWarehouse("All warehouses");
    setDestination("All destinations");
    setStatus("All allocation states");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Create allocation
  const handleCreateAllocation = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !newAllocation.request.trim() ||
      !newAllocation.resource.trim() ||
      !newAllocation.quantity.trim() ||
      !newAllocation.destination.trim()
    ) {
      return;
    }

    try {
      const created = await allocationService.createAllocation({
        ...newAllocation,
        approvedBy: "Daniel Perera"
      });
      setAllocations((previous) => [created, ...previous]);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adding locally:", err);
      const fallbackItem: Allocation = {
        id: `AL-${String(Date.now()).slice(-4)}`,
        request: newAllocation.request.trim(),
        resource: newAllocation.resource.trim(),
        quantity: newAllocation.quantity.trim(),
        source: newAllocation.source,
        destination: newAllocation.destination.trim(),
        approvedBy: "Pending Approval",
        approvedAt: "Just now",
        status: "Pending",
        warehouse: newAllocation.source,
      };
      setAllocations((previous) => [fallbackItem, ...previous]);
    }

    setNewAllocation({
      request: "",
      resource: "",
      quantity: "",
      source: "Central Hub",
      destination: "",
    });

    setShowCreateModal(false);
    resetFilters();
  };

  // Update status (Approve/Allocate, Release, Complete, etc.)
  const handleStatusChange = async (id: string, newStatus: AllocationStatus) => {
    setActionInProgress(id);
    try {
      await allocationService.updateAllocationStatus(id, {
        status: newStatus,
        approvedBy: "Daniel Perera"
      });
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, updating locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setAllocations(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              approvedBy: "Daniel Perera",
              approvedAt: "Just now"
            }
          : item
      )
    );

    if (selectedAllocation && selectedAllocation.id === id) {
      setSelectedAllocation(prev =>
        prev
          ? {
              ...prev,
              status: newStatus,
              approvedBy: "Daniel Perera",
              approvedAt: "Just now"
            }
          : null
      );
    }
  };

  // Delete allocation
  const handleDeleteAllocation = async (id: string) => {
    if (!window.confirm(`Are you sure you want to cancel allocation ${id}?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      await allocationService.deleteAllocation(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, deleting locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setAllocations(prev => prev.filter(item => item.id !== id));
    setSelectedAllocation(null);
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      "Allocation ID",
      "Request",
      "Resource",
      "Quantity",
      "Source",
      "Destination",
      "Approved By",
      "Approved At",
      "Status",
    ];

    const rows = filteredAllocations.map((item) => [
      item.id,
      item.request,
      item.resource,
      item.quantity,
      item.source,
      item.destination,
      item.approvedBy,
      item.approvedAt,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "allocation-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-800">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#123e60] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Logo */}
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#58b8a5] text-[#123e60]">
            <GitBranch size={22} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">ReliefOS</h1>
            <p className="text-sm text-sky-200">
              Resource Management
            </p>
          </div>
        </div>

        {/* Active Operation */}
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active Operation
          </div>

          <p className="mt-2 text-sm font-bold">
            Monsoon Floods 2025
          </p>

          <p className="mt-1 text-sm text-sky-200">
            Greater Riverton - Level 4
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = item.label === "Allocations";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (selected) return;
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                  selected
                    ? "border-l-[3px] border-[#58b8a5] bg-[#287ba5] font-bold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.label}</span>

                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold">Daniel Perera</p>
            <p className="text-sm text-sky-200">
              Resource Manager
            </p>
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
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-7">

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-700"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="flex w-full max-w-[470px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search allocations, requests, resources..."
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none"
            />

            {search ? (
              <button onClick={() => setSearch("")}>
                <X size={15} className="text-slate-400" />
              </button>
            ) : (
              <span className="hidden rounded border bg-white px-2 py-1 text-xs text-slate-400 sm:block">
                ⌘ K
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">

            {/* BACKEND API STATUS BADGE */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              {isBackendConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Wifi size={12} /> Backend API Online
                  </span>
                </>
              ) : isBackendConnected === false ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <WifiOff size={12} /> Local Fallback Mode
                  </span>
                </>
              ) : (
                <span className="text-slate-400">Connecting...</span>
              )}
            </div>

            <div className="hidden border-r border-slate-200 pr-4 text-right md:block">
              <p className="text-xs uppercase text-slate-400">
                Primary Hub
              </p>
              <p className="text-sm font-bold text-slate-800">
                Central Logistics Hub
              </p>
            </div>

            <button
              onClick={loadAllocations}
              title="Refresh allocations from backend"
              className="rounded-lg border p-2.5 text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw size={17} className={isLoading ? "animate-spin text-sky-700" : ""} />
            </button>

            <button className="hidden rounded-lg border p-2.5 text-slate-600 sm:block">
              <ShieldCheck size={18} />
            </button>

            <button
              onClick={() => navigate("/resource-manager/alerts")}
              className="relative rounded-lg border p-2.5 text-slate-600"
            >
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
                9
              </span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
                DP
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-bold">Daniel P.</p>
                <p className="text-xs text-slate-400">
                  Resource Manager
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">

          {/* PAGE HEADING */}
          <section className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="mb-2 flex items-center gap-1 text-[13px] text-slate-400">
                Resource Operations
                <ChevronRight size={12} />
                <span className="font-bold text-slate-700">
                  Allocations
                </span>
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Allocations
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Reserve, track, and release verified stock against approved operational requests in real time.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Download size={14} />
                Export
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#267da5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17658b] transition shadow-sm"
              >
                <Plus size={15} />
                Create Allocation
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Active records",
                value: activeCount,
                note: "Across current operation",
                icon: GitBranch,
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Awaiting action",
                value: awaitingCount,
                note: "Assigned to your team",
                icon: Clock3,
                style: "bg-amber-50 text-amber-600",
              },
              {
                title: "Completed",
                value: completedCount,
                note: "All audit recorded",
                icon: CheckCircle2,
                style: "bg-emerald-50 text-emerald-600",
              },
              {
                title: "Exceptions",
                value: exceptionCount,
                note: "Partially allocated",
                icon: AlertTriangle,
                style: "bg-red-50 text-red-600",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.style}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] text-slate-400">
                      {card.title}
                    </p>

                    <h3 className="text-2xl font-bold text-slate-800">
                      {card.value}
                    </h3>

                    <p className="text-xs text-slate-400">
                      {card.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* TABS */}
          <section>
            <div className="flex flex-wrap gap-6 border-b border-slate-200">

              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`relative flex items-center gap-1.5 pb-4 text-sm transition ${
                    activeTab === tab
                      ? "font-bold text-sky-700"
                      : "text-slate-500 hover:text-sky-700"
                  }`}
                >
                  {tab}

                  {tab === "All" && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-xs font-bold text-sky-700">
                      {allocations.length}
                    </span>
                  )}

                  {tab === "Needs action" && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700">
                      {awaitingCount}
                    </span>
                  )}

                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(140px,auto))_auto]">

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <Search size={16} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search allocations..."
                className="w-full text-sm sm:text-[15px] outline-none"
              />
            </div>

            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] outline-none"
            >
              <option>All warehouses</option>
              {["Central Hub", "West Depot", "Eastbank", "North Hub"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] outline-none"
            >
              <option>All destinations</option>
              {[...new Set(allocations.map((a) => a.destination))].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] outline-none"
            >
              <option>All allocation states</option>
              {[
                "Partially Allocated",
                "Allocated",
                "Released",
                "Completed",
                "Pending",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <SlidersHorizontal size={14} />
              Reset filters
            </button>
          </section>

          {/* ALLOCATIONS TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">

                <thead className="bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wider">
                  <tr>
                    {[
                      "Allocation",
                      "Request",
                      "Resource",
                      "Quantity",
                      "Source",
                      "Destination",
                      "Approved By",
                      "Approved At",
                      "Status",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={index}
                        className="px-4 py-3.5 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayedAllocations.map((item) => (
                    <tr
                      key={item.id}
                      className="text-sm transition hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {item.id}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-600">
                        {item.request}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {item.resource}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {item.source}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {item.destination}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {item.approvedBy}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-sm">
                        {item.approvedAt}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            title="View allocation details"
                            onClick={() => setSelectedAllocation(item)}
                            className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50 transition"
                          >
                            <Eye size={13} />
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayedAllocations.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400">
                <GitBranch size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600 text-sm">No allocations found</p>
                <p className="mt-1">Try clearing or adjusting your search filters.</p>
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

              <p className="text-[13px] text-slate-500">
                Showing{" "}
                {filteredAllocations.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –
                {Math.min(
                  safePage * pageSize,
                  filteredAllocations.length
                )}{" "}
                of {filteredAllocations.length}
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 min-w-7 rounded-lg border px-2 text-xs ${
                      safePage === page
                        ? "border-sky-700 bg-sky-700 font-bold text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <footer className="py-2 text-center text-[13px] text-slate-400">
            ReliefOS · Humanitarian Resource Management Platform · Connected to CareLink API
          </footer>

        </div>
      </main>

      {/* CREATE ALLOCATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleCreateAllocation}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Create Allocation
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Allocate inventory against an approved resource request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Request ID
              </label>
              <input
                required
                value={newAllocation.request}
                onChange={(e) =>
                  setNewAllocation({
                    ...newAllocation,
                    request: e.target.value,
                  })
                }
                placeholder="Example: RR-2841"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Resource Name
              </label>
              <input
                required
                value={newAllocation.resource}
                onChange={(e) =>
                  setNewAllocation({
                    ...newAllocation,
                    resource: e.target.value,
                  })
                }
                placeholder="e.g. Trauma Medical Kit, Drinking Water"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Quantity
              </label>
              <input
                required
                value={newAllocation.quantity}
                onChange={(e) =>
                  setNewAllocation({
                    ...newAllocation,
                    quantity: e.target.value,
                  })
                }
                placeholder="Example: 500 units / 1,200 L"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Source Warehouse
                </label>
                <select
                  value={newAllocation.source}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      source: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] bg-white"
                >
                  <option>Central Hub</option>
                  <option>West Depot</option>
                  <option>Eastbank</option>
                  <option>North Hub</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Destination Unit
                </label>
                <input
                  required
                  value={newAllocation.destination}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      destination: e.target.value,
                    })
                  }
                  placeholder="e.g. Medical Team 3"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition"
              >
                Create Allocation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALLOCATION DETAILS MODAL */}
      {selectedAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedAllocation.id}
                  </h3>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusStyles[selectedAllocation.status]}`}
                  >
                    {selectedAllocation.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Request Ref: {selectedAllocation.request}
                </p>
              </div>

              <button
                onClick={() => setSelectedAllocation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Resource", selectedAllocation.resource],
                ["Quantity", selectedAllocation.quantity],
                ["Source Warehouse", selectedAllocation.source],
                ["Destination", selectedAllocation.destination],
                ["Approved By", selectedAllocation.approvedBy],
                ["Approved At", selectedAllocation.approvedAt],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-50 p-3"
                >
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* STATUS TRANSITION BUTTONS */}
            <div className="border-t pt-3">
              <p className="text-sm font-semibold text-slate-700 mb-2">Update Allocation Status</p>
              <div className="flex flex-wrap gap-2">
                {selectedAllocation.status !== "Allocated" && (
                  <button
                    disabled={actionInProgress === selectedAllocation.id}
                    onClick={() => handleStatusChange(selectedAllocation.id, "Allocated")}
                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
                  >
                    Set Allocated
                  </button>
                )}

                {selectedAllocation.status !== "Released" && (
                  <button
                    disabled={actionInProgress === selectedAllocation.id}
                    onClick={() => handleStatusChange(selectedAllocation.id, "Released")}
                    className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Release Stock
                  </button>
                )}

                {selectedAllocation.status !== "Completed" && (
                  <button
                    disabled={actionInProgress === selectedAllocation.id}
                    onClick={() => handleStatusChange(selectedAllocation.id, "Completed")}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    Mark Completed
                  </button>
                )}

                {selectedAllocation.status !== "Partially Allocated" && (
                  <button
                    disabled={actionInProgress === selectedAllocation.id}
                    onClick={() => handleStatusChange(selectedAllocation.id, "Partially Allocated")}
                    className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition"
                  >
                    Partial Allocation
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <button
                disabled={actionInProgress === selectedAllocation.id}
                onClick={() => handleDeleteAllocation(selectedAllocation.id)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={13} />
                Cancel Allocation
              </button>

              <button
                onClick={() => setSelectedAllocation(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
