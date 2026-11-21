import { useMemo, useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
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
  Check,
  Filter,
  X,
  Menu,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { stockTransferService } from "../../services/stockTransferService";
import type {
  Transfer,
  TransferStatus,
  TransferSummary
} from "../../types/stockTransfer";

const initialTransfers: Transfer[] = [
  {
    id: "TR-0581",
    source: "Central Logistics Hub",
    destination: "North District Hub",
    resource: "Drinking Water",
    quantity: "4,000 units",
    requestedBy: "Daniel Perera",
    scheduled: "22 Jun · 15:30",
    status: "Approved"
  },
  {
    id: "TR-0578",
    source: "West Coast Depot",
    destination: "Eastbank Warehouse",
    resource: "Hygiene Kits",
    quantity: "500 units",
    requestedBy: "Maya Silva",
    scheduled: "22 Jun · 14:10",
    status: "In Transit"
  },
  {
    id: "TR-0572",
    source: "Central Logistics Hub",
    destination: "West Coast Depot",
    resource: "Trauma Kits",
    quantity: "20 units",
    requestedBy: "Daniel Perera",
    scheduled: "21 Jun · 17:42",
    status: "Completed"
  },
  {
    id: "TR-0564",
    source: "North District Hub",
    destination: "Central Logistics Hub",
    resource: "Blankets",
    quantity: "100 units",
    requestedBy: "R. Khan",
    scheduled: "21 Jun · 12:18",
    status: "Rejected"
  },
  {
    id: "TR-0560",
    source: "Eastbank Warehouse",
    destination: "North District Hub",
    resource: "Family Food Packs",
    quantity: "300 units",
    requestedBy: "Maya Silva",
    scheduled: "23 Jun · 09:00",
    status: "Pending"
  },
  {
    id: "TR-0558",
    source: "West Coast Depot",
    destination: "Central Logistics Hub",
    resource: "Medical Kits",
    quantity: "80 units",
    requestedBy: "Daniel Perera",
    scheduled: "23 Jun · 11:30",
    status: "Approved"
  },
  {
    id: "TR-0552",
    source: "North District Hub",
    destination: "Eastbank Warehouse",
    resource: "Shelter Kits",
    quantity: "150 units",
    requestedBy: "R. Khan",
    scheduled: "20 Jun · 14:00",
    status: "Completed"
  }
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
  { label: "Settings", path: "/resource-manager/settings", icon: Settings }
];

const tabs = [
  "All",
  "Needs action",
  "Active",
  "Completed",
  "Exceptions"
];

const statusStyles: Record<TransferStatus, string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  "In Transit": "bg-sky-50 text-sky-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700"
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500";

export default function StockTransferPage() {
  const navigate = useNavigate();

  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [summary, setSummary] = useState<TransferSummary | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All source hubs");
  const [destinationFilter, setDestinationFilter] = useState("All destinations");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    source: "Central Logistics Hub",
    destination: "",
    resource: "",
    quantity: "",
    requestedBy: "Daniel Perera",
    scheduled: ""
  });

  const pageSize = 4;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [transfersData, summaryData] = await Promise.all([
        stockTransferService.getTransfers(),
        stockTransferService.getSummary().catch(() => null)
      ]);

      if (transfersData && transfersData.length > 0) {
        setTransfers(transfersData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (error) {
      console.warn("Backend unavailable, using local default transfers:", error);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      const matchesSearch = [
        item.id,
        item.source,
        item.destination,
        item.resource,
        item.requestedBy
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesSource =
        sourceFilter === "All source hubs" ||
        item.source === sourceFilter;

      const matchesDestination =
        destinationFilter === "All destinations" ||
        item.destination === destinationFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        item.status === statusFilter;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Pending", "Rejected"].includes(item.status)) ||
        (activeTab === "Active" &&
          ["Approved", "In Transit"].includes(item.status)) ||
        (activeTab === "Completed" &&
          item.status === "Completed") ||
        (activeTab === "Exceptions" &&
          item.status === "Rejected");

      return (
        matchesSearch &&
        matchesSource &&
        matchesDestination &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [
    transfers,
    search,
    sourceFilter,
    destinationFilter,
    statusFilter,
    activeTab
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransfers.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const displayedTransfers = filteredTransfers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Statistics
  const activeCount = summary?.activeCount ?? transfers.length;
  const awaitingCount = summary?.awaitingCount ?? transfers.filter(t => t.status === "Pending").length;
  const completedCount = summary?.completedCount ?? transfers.filter(t => t.status === "Completed").length;
  const exceptionCount = summary?.exceptionCount ?? transfers.filter(t => t.status === "Rejected").length;

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSourceFilter("All source hubs");
    setDestinationFilter("All destinations");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Create transfer
  const handleCreateTransfer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.source ||
      !formData.destination.trim() ||
      !formData.resource.trim() ||
      !formData.quantity.trim() ||
      !formData.scheduled
    ) return;

    setIsSubmitting(true);

    try {
      const created = await stockTransferService.createTransfer(formData);
      setTransfers(prev => [created, ...prev]);
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Stock transfer ${created.id} created successfully!`
      });
    } catch (error) {
      console.warn("Backend error on create, adding locally:", error);
      const nextNumber =
        Math.max(
          ...transfers.map(t => Number(t.id.replace("TR-", ""))),
          581
        ) + 1;

      const newTransfer: Transfer = {
        id: `TR-${String(nextNumber).padStart(4, "0")}`,
        source: formData.source,
        destination: formData.destination,
        resource: formData.resource,
        quantity: formData.quantity,
        requestedBy: formData.requestedBy,
        scheduled: new Date(formData.scheduled).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }),
        status: "Pending"
      };

      setTransfers(prev => [newTransfer, ...prev]);
      setStatusMessage({
        type: "info",
        text: `Stock transfer ${newTransfer.id} added locally (backend offline).`
      });
    } finally {
      setIsSubmitting(false);
      setShowCreateModal(false);
      setFormData({
        source: "Central Logistics Hub",
        destination: "",
        resource: "",
        quantity: "",
        requestedBy: "Daniel Perera",
        scheduled: ""
      });
      resetFilters();
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Update Status
  const handleStatusChange = async (id: string, newStatus: TransferStatus) => {
    try {
      setIsSubmitting(true);
      const updated = await stockTransferService.updateStatus(id, newStatus);
      setTransfers(prev => prev.map(t => (t.id === id ? updated : t)));
      if (selectedTransfer && selectedTransfer.id === id) {
        setSelectedTransfer(updated);
      }
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Transfer ${id} status updated to ${newStatus}.`
      });
    } catch (error) {
      console.warn("Backend error on status update, updating locally:", error);
      setTransfers(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      );
      if (selectedTransfer && selectedTransfer.id === id) {
        setSelectedTransfer(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setStatusMessage({
        type: "info",
        text: `Transfer ${id} status updated to ${newStatus} locally.`
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Delete Transfer
  const handleDeleteTransfer = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete transfer ${id}?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await stockTransferService.deleteTransfer(id);
      setTransfers(prev => prev.filter(t => t.id !== id));
      setSelectedTransfer(null);
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Transfer ${id} deleted successfully.`
      });
    } catch (error) {
      console.warn("Backend error on delete, deleting locally:", error);
      setTransfers(prev => prev.filter(t => t.id !== id));
      setSelectedTransfer(null);
      setStatusMessage({
        type: "info",
        text: `Transfer ${id} deleted locally.`
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      "Transfer ID",
      "Source",
      "Destination",
      "Resource",
      "Quantity",
      "Requested By",
      "Scheduled",
      "Status"
    ];

    const rows = filteredTransfers.map(t => [
      t.id,
      t.source,
      t.destination,
      t.resource,
      t.quantity,
      t.requestedBy,
      t.scheduled,
      t.status
    ]);

    const csv = [headers, ...rows]
      .map(row =>
        row.map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "stock-transfers.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: "Active records",
      value: activeCount,
      note: "Across current operation",
      icon: Package,
      color: "bg-sky-50 text-sky-700"
    },
    {
      title: "Awaiting action",
      value: awaitingCount,
      note: "Assigned to your team",
      icon: Clock3,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Completed today",
      value: completedCount,
      note: "All audit recorded",
      icon: Check,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Exceptions",
      value: exceptionCount,
      note: "Require review",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">
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

        {/* Active operation */}
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

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Stock Transfers";

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
        {/* TOP HEADER */}
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
              onChange={e => {
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

        {/* PAGE BODY */}
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB & API STATUS BADGE */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>
              Resource Operations
              <ChevronRight size={12} className="mx-1 inline" />
              <span className="font-semibold text-[#163d5c]">
                Stock Transfers
              </span>
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

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Stock Transfers
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Rebalance inventory between warehouses with controlled approval and receipt.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700 hover:bg-slate-50"
              >
                <Download size={15} />
                Export
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Plus size={16} />
                Create Transfer
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(card => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">
                      {card.title}
                    </p>

                    <h3 className="text-2xl font-bold">
                      {card.value}
                    </h3>

                    <p className="text-[9px] text-slate-400">
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
              {tabs.map(tab => {
                const count =
                  tab === "All"
                    ? transfers.length
                    : tab === "Needs action"
                    ? transfers.filter(t => ["Pending", "Rejected"].includes(t.status)).length
                    : tab === "Active"
                    ? transfers.filter(t => ["Approved", "In Transit"].includes(t.status)).length
                    : tab === "Completed"
                    ? transfers.filter(t => t.status === "Completed").length
                    : tab === "Exceptions"
                    ? transfers.filter(t => t.status === "Rejected").length
                    : 0;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`relative flex items-center gap-1.5 pb-4 text-[11px] ${
                      activeTab === tab
                        ? "font-bold text-sky-700"
                        : "text-slate-500 hover:text-sky-700"
                    }`}
                  >
                    {tab}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                        activeTab === tab
                          ? "bg-sky-100 text-sky-700"
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
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search stock transfers..."
                className="w-full py-3 text-xs outline-none"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={e => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All source hubs</option>
              {[...new Set(transfers.map(t => t.source))].map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <select
              value={destinationFilter}
              onChange={e => {
                setDestinationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All destinations</option>
              {[...new Set(transfers.map(t => t.destination))].map(destination => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All statuses</option>
              {(["Approved", "In Transit", "Completed", "Rejected", "Pending"] as TransferStatus[]).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-sky-700 hover:bg-slate-50"
            >
              <Filter size={15} />
              Reset Filters
            </button>
          </section>

          {/* TRANSFER TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 p-8">
                <Loader2 size={28} className="animate-spin text-[#287ba5]" />
                <p className="text-xs text-slate-500">Loading stock transfers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-500">
                    <tr>
                      {[
                        "Transfer",
                        "Source",
                        "Destination",
                        "Resource",
                        "Quantity",
                        "Requested By",
                        "Scheduled",
                        "Status",
                        ""
                      ].map((heading, i) => (
                        <th key={i} className="px-3 py-4 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {displayedTransfers.map(item => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 text-[11px] hover:bg-slate-50"
                      >
                        <td className="px-3 py-4 font-bold text-slate-800">
                          {item.id}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.source}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.destination}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.resource}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.quantity}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.requestedBy}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                          {item.scheduled}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
                              statusStyles[item.status]
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedTransfer(item)}
                            aria-label={`View ${item.id}`}
                            className="p-1 hover:text-sky-700"
                          >
                            <ChevronRight
                              size={18}
                              className="text-slate-500 hover:text-sky-700"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {displayedTransfers.length === 0 && (
                  <div className="p-10 text-center text-sm text-slate-400">
                    No stock transfers found.
                  </div>
                )}
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredTransfers.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –{Math.min(safePage * pageSize, filteredTransfers.length)}{" "}
                of {filteredTransfers.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCurrentPage(n)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-[10px] ${
                      safePage === n
                        ? "border-sky-700 bg-sky-700 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* CREATE TRANSFER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleCreateTransfer}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Create Transfer
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter stock transfer details to initiate request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <label className="block text-xs font-semibold">
              Source Warehouse
              <select
                value={formData.source}
                onChange={e =>
                  setFormData({
                    ...formData,
                    source: e.target.value
                  })
                }
                className={`mt-2 ${inputClass}`}
              >
                <option>Central Logistics Hub</option>
                <option>West Coast Depot</option>
                <option>Eastbank Warehouse</option>
                <option>North District Hub</option>
              </select>
            </label>

            <label className="block text-xs font-semibold">
              Destination Warehouse
              <input
                required
                value={formData.destination}
                onChange={e =>
                  setFormData({
                    ...formData,
                    destination: e.target.value
                  })
                }
                placeholder="Enter destination warehouse"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Resource
              <input
                required
                value={formData.resource}
                onChange={e =>
                  setFormData({
                    ...formData,
                    resource: e.target.value
                  })
                }
                placeholder="Enter resource name"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Quantity
              <input
                required
                value={formData.quantity}
                onChange={e =>
                  setFormData({
                    ...formData,
                    quantity: e.target.value
                  })
                }
                placeholder="Example: 500 units"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Requested By
              <input
                required
                value={formData.requestedBy}
                onChange={e =>
                  setFormData({
                    ...formData,
                    requestedBy: e.target.value
                  })
                }
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Scheduled Date & Time
              <input
                type="datetime-local"
                required
                value={formData.scheduled}
                onChange={e =>
                  setFormData({
                    ...formData,
                    scheduled: e.target.value
                  })
                }
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>Create Transfer</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSFER DETAILS MODAL */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Transfer Details
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedTransfer.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-sky-50 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-sky-600">Transfer Status</p>
                <span
                  className={`mt-1 inline-block rounded-md px-3 py-1.5 text-xs font-semibold ${
                    statusStyles[selectedTransfer.status]
                  }`}
                >
                  {selectedTransfer.status}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteTransfer(selectedTransfer.id)}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50"
                title="Delete this transfer"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>

            {[
              ["Transfer ID", selectedTransfer.id],
              ["Source", selectedTransfer.source],
              ["Destination", selectedTransfer.destination],
              ["Resource", selectedTransfer.resource],
              ["Quantity", selectedTransfer.quantity],
              ["Requested By", selectedTransfer.requestedBy],
              ["Scheduled", selectedTransfer.scheduled]
            ].map(([label, value]) => (
              <div key={label} className="mb-2 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            ))}

            {/* STATUS TRANSITION ACTIONS */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Workflow Actions
              </p>

              {selectedTransfer.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleStatusChange(selectedTransfer.id, "Approved")}
                    className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve Transfer
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleStatusChange(selectedTransfer.id, "Rejected")}
                    className="flex-1 rounded-lg bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selectedTransfer.status === "Approved" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange(selectedTransfer.id, "In Transit")}
                  className="w-full rounded-lg bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  Dispatch · Mark In Transit
                </button>
              )}

              {selectedTransfer.status === "In Transit" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange(selectedTransfer.id, "Completed")}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Confirm Receipt · Mark Completed
                </button>
              )}

              {selectedTransfer.status === "Completed" && (
                <p className="text-center text-xs text-emerald-600 py-1 font-medium">
                  ✓ Transfer fulfilled &amp; inventory receipt verified.
                </p>
              )}

              {selectedTransfer.status === "Rejected" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange(selectedTransfer.id, "Pending")}
                  className="w-full rounded-lg bg-slate-600 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Reopen for Review
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
