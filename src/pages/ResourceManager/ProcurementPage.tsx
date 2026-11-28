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
  Check,
  Filter,
  X,
  Menu,
  CalendarDays,
  RotateCcw,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Trash2,
  DollarSign,
  AlertCircle,
} from "lucide-react";

import { procurementService } from "../../services/procurementService";
import type {
  PurchaseOrder,
  OrderStatus,
  ProcurementType,
  ProcurementSummary,
  CreatePurchaseOrderPayload,
} from "../../types/procurement";

const initialOrders: PurchaseOrder[] = [
  {
    id: "PO-2025-184",
    supplier: "MediSupply International",
    items: "Trauma Medical Kits",
    quantity: "200 units",
    value: "$18,400",
    type: "Emergency",
    deliveryDue: "24 Jun 2025",
    status: "Approved",
  },
  {
    id: "PO-2025-181",
    supplier: "AquaSafe Ltd.",
    items: "Drinking Water - 10L",
    quantity: "10,000 units",
    value: "$12,800",
    type: "Emergency",
    deliveryDue: "23 Jun 2025",
    status: "In Transit",
  },
  {
    id: "PO-2025-174",
    supplier: "ShelterWorks Cooperative",
    items: "Shelter Kits",
    quantity: "500 units",
    value: "$42,500",
    type: "Standard",
    deliveryDue: "28 Jun 2025",
    status: "Awaiting Approval",
  },
  {
    id: "PO-2025-169",
    supplier: "Regional Food Services",
    items: "Family Food Packs",
    quantity: "4,000 units",
    value: "$31,200",
    type: "Standard",
    deliveryDue: "21 Jun 2025",
    status: "Delivered",
  },
  {
    id: "PO-2025-165",
    supplier: "MediSupply International",
    items: "First Aid Supplies",
    quantity: "300 units",
    value: "$9,500",
    type: "Emergency",
    deliveryDue: "29 Jun 2025",
    status: "Approved",
  },
  {
    id: "PO-2025-162",
    supplier: "AquaSafe Ltd.",
    items: "Water Purification Tablets",
    quantity: "2,000 packs",
    value: "$6,800",
    type: "Standard",
    deliveryDue: "30 Jun 2025",
    status: "In Transit",
  },
  {
    id: "PO-2025-158",
    supplier: "ShelterWorks Cooperative",
    items: "Thermal Blankets",
    quantity: "600 units",
    value: "$15,000",
    type: "Standard",
    deliveryDue: "20 Jun 2025",
    status: "Rejected",
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

const statusStyles: Record<OrderStatus, string> = {
  Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "In Transit": "bg-sky-50 text-sky-700 border border-sky-200",
  "Awaiting Approval": "bg-amber-50 text-amber-700 border border-amber-200",
  Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border border-rose-200",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500";

export default function ProcurementPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [summary, setSummary] = useState<ProcurementSummary | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All suppliers");
  const [typeFilter, setTypeFilter] = useState("All procurement types");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    supplier: "",
    items: "",
    quantity: "",
    value: "",
    type: "Standard" as ProcurementType,
    deliveryDue: "",
  });

  const pageSize = 5;

  // FETCH DATA FROM BACKEND
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersData, summaryData] = await Promise.all([
        procurementService.getOrders({
          search: search || undefined,
          supplier: supplierFilter !== "All suppliers" ? supplierFilter : undefined,
          type: typeFilter !== "All procurement types" ? typeFilter : undefined,
          status: statusFilter !== "All statuses" ? statusFilter : undefined,
          tab: activeTab !== "All" ? activeTab : undefined,
        }),
        procurementService.getSummary(),
      ]);

      if (ordersData && Array.isArray(ordersData)) {
        setOrders(ordersData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local procurement orders:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search, supplierFilter, typeFilter, statusFilter, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CLIENT-SIDE FILTERING (fallback / instant reactivity)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = [
        order.id,
        order.supplier,
        order.items,
        order.quantity,
        order.value,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSupplier =
        supplierFilter === "All suppliers" || order.supplier === supplierFilter;

      const matchesType =
        typeFilter === "All procurement types" || order.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" || order.status === statusFilter;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          order.status === "Awaiting Approval") ||
        (activeTab === "Active" &&
          ["Approved", "In Transit"].includes(order.status)) ||
        (activeTab === "Completed" && order.status === "Delivered") ||
        (activeTab === "Exceptions" && order.status === "Rejected");

      return (
        matchesSearch &&
        matchesSupplier &&
        matchesType &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [orders, search, supplierFilter, typeFilter, statusFilter, activeTab]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const displayedOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setSupplierFilter("All suppliers");
    setTypeFilter("All procurement types");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // CREATE PURCHASE ORDER
  const handleCreateOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.supplier.trim() ||
      !formData.items.trim() ||
      !formData.quantity.trim() ||
      !formData.value.trim() ||
      !formData.deliveryDue
    )
      return;

    const payload: CreatePurchaseOrderPayload = {
      supplier: formData.supplier.trim(),
      items: formData.items.trim(),
      quantity: formData.quantity.trim(),
      value: formData.value.startsWith("$")
        ? formData.value.trim()
        : `$${formData.value.trim()}`,
      type: formData.type,
      deliveryDue: new Date(formData.deliveryDue).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Awaiting Approval",
    };

    try {
      const created = await procurementService.createOrder(payload);
      setOrders((prev) => [created, ...prev]);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adding order locally:", err);
      const nextNumber =
        Math.max(
          ...orders.map((o) => Number(o.id.split("-")[2]) || 184),
          184
        ) + 1;
      const localOrder: PurchaseOrder = {
        id: `PO-2025-${nextNumber}`,
        supplier: payload.supplier,
        items: payload.items,
        quantity: payload.quantity,
        value: payload.value,
        type: payload.type,
        deliveryDue: payload.deliveryDue,
        status: "Awaiting Approval",
      };
      setOrders((prev) => [localOrder, ...prev]);
    } finally {
      setFormData({
        supplier: "",
        items: "",
        quantity: "",
        value: "",
        type: "Standard",
        deliveryDue: "",
      });
      setShowCreateModal(false);
      resetFilters();
    }
  };

  // UPDATE ORDER STATUS
  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    setActionInProgress(id);
    try {
      await procurementService.updateOrderStatus(id, { status: newStatus });
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, updating status locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // DELETE / CANCEL ORDER
  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm(`Are you sure you want to cancel purchase order ${id}?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      await procurementService.deleteOrder(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, deleting order locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(null);
    }
  };

  // EXPORT CSV
  const handleExport = () => {
    const headers = [
      "Purchase Order",
      "Supplier",
      "Items",
      "Quantity",
      "Value",
      "Procurement Type",
      "Delivery Due",
      "Status",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.supplier,
      order.items,
      order.quantity,
      order.value,
      order.type,
      order.deliveryDue,
      order.status,
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
    link.download = `carelink-procurement-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // STATS
  const stats = [
    {
      title: "Open orders",
      value: summary?.openOrders ?? (24 + orders.length - initialOrders.length),
      note: summary?.totalCommittedValue ?? "$186K committed",
      icon: ShoppingCart,
      color: "bg-sky-50 text-sky-700",
    },
    {
      title: "Emergency orders",
      value: summary?.emergencyOrders ?? (orders.filter((o) => o.type === "Emergency").length + 5),
      note: "Priority sourcing",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Due this week",
      value: summary?.dueThisWeek ?? 12,
      note: "3 arriving today",
      icon: CalendarDays,
      color: "bg-sky-50 text-sky-700",
    },
    {
      title: "Supplier fulfilment",
      value: summary?.supplierFulfilment ?? "95.4%",
      note: "Rolling 90 days",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const needsActionCount =
    summary?.awaitingApprovalCount ??
    orders.filter((o) => o.status === "Awaiting Approval").length;

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

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Procurement";

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
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-xs">
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

          <div className="flex max-w-[480px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              placeholder="Search purchase orders, suppliers, items..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
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
              title="Refresh Procurement"
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

        {/* PAGE CONTENT */}
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB */}
          <div className="text-[13px] text-slate-400">
            Resource Operations <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">Procurement</span>
          </div>

          {/* TITLE & ACTIONS */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Procurement</h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage emergency and planned purchasing from approval through receipt.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
              >
                <Download size={14} /> Export CSV
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Plus size={15} /> Create Purchase Order
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] text-slate-400">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                    <p className="text-[13px] text-slate-400">{card.note}</p>
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
                  className={`relative flex items-center gap-1.5 pb-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? "font-bold text-sky-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}

                  {tab === "All" && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-sm text-sky-800 font-semibold">
                      {orders.length}
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
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="flex flex-wrap gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search procurement by PO, supplier, item, value..."
                className="w-full py-2.5 text-sm sm:text-[15px] outline-none"
              />
            </div>

            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All suppliers</option>
              {[...new Set(orders.map((o) => o.supplier))].map((supplier) => (
                <option key={supplier}>{supplier}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All procurement types</option>
              <option>Emergency</option>
              <option>Standard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All statuses</option>
              {(
                [
                  "Approved",
                  "In Transit",
                  "Awaiting Approval",
                  "Delivered",
                  "Rejected",
                ] as OrderStatus[]
              ).map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={() => setShowMoreFilters(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
            >
              <Filter size={14} /> More filters
            </button>

            {(search ||
              supplierFilter !== "All suppliers" ||
              typeFilter !== "All procurement types" ||
              statusFilter !== "All statuses" ||
              activeTab !== "All") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </section>

          {/* PURCHASE ORDER TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Purchase Order</th>
                    <th className="px-4 py-3.5 font-semibold">Supplier</th>
                    <th className="px-4 py-3.5 font-semibold">Items</th>
                    <th className="px-4 py-3.5 font-semibold">Quantity</th>
                    <th className="px-4 py-3.5 font-semibold">Value</th>
                    <th className="px-4 py-3.5 font-semibold">Procurement Type</th>
                    <th className="px-4 py-3.5 font-semibold">Delivery Due</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-slate-100 text-sm hover:bg-slate-50/80 transition"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800">
                        {order.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                        {order.supplier}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-800">
                        {order.items}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {order.quantity}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-slate-900">
                        {order.value}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            order.type === "Emergency"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {order.deliveryDue}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`View ${order.id}`}
                          className="rounded p-1 text-slate-400 hover:bg-sky-50 hover:text-sky-700 transition"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {displayedOrders.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <ShoppingCart size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No purchase orders found
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
                  {filteredOrders.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(safePage * pageSize, filteredOrders.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`h-7 min-w-7 rounded-lg border px-2 text-xs font-semibold transition ${
                      safePage === n
                        ? "border-[#287ba5] bg-[#287ba5] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateOrder}
            className="max-h-[90vh] w-full max-w-lg space-y-3.5 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Create Purchase Order
                </h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Procure essential goods from contracted vendors
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supplier Name *
              </label>
              <input
                required
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="e.g., MediSupply International"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Items Description *
              </label>
              <input
                required
                value={formData.items}
                onChange={(e) =>
                  setFormData({ ...formData, items: e.target.value })
                }
                placeholder="e.g., Trauma Medical Kits"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  required
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="e.g., 200 units"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Value *
                </label>
                <input
                  required
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="e.g., 18400"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Procurement Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ProcurementType,
                    })
                  }
                  className={inputClass}
                >
                  <option>Standard</option>
                  <option>Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.deliveryDue}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDue: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2 text-sm font-bold text-white hover:bg-[#1c668d]"
              >
                Create Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ORDER DETAILS MODAL WITH LIVE STATUS ACTIONS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Purchase Order Details
                </h3>
                <p className="mt-0.5 font-mono text-sm text-[#287ba5]">
                  {selectedOrder.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/80 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">
                    Supplier
                  </span>
                  <p className="font-bold text-slate-800">{selectedOrder.supplier}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[selectedOrder.status]}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Items</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedOrder.items}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Quantity</p>
                <p className="font-bold text-slate-800 mt-0.5 font-mono">
                  {selectedOrder.quantity}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Total Value</p>
                <p className="font-bold text-slate-900 mt-0.5 font-mono">
                  {selectedOrder.value}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Procurement Type</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedOrder.type}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Delivery Due</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedOrder.deliveryDue}
                </p>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="mt-2 rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Notes / Reasons</p>
                <p className="font-medium text-slate-700 mt-0.5">{selectedOrder.notes}</p>
              </div>
            )}

            {/* LIVE STATUS TRANSITIONS */}
            <div className="mt-4 border-t pt-3">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Order Status Actions:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={actionInProgress === selectedOrder.id || selectedOrder.status === "Approved"}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "Approved")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                >
                  Approve Order
                </button>
                <button
                  disabled={actionInProgress === selectedOrder.id || selectedOrder.status === "In Transit"}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "In Transit")}
                  className="rounded-lg border border-sky-200 bg-sky-50 py-1.5 text-center text-sm font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-40"
                >
                  Mark In Transit
                </button>
                <button
                  disabled={actionInProgress === selectedOrder.id || selectedOrder.status === "Delivered"}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "Delivered")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                >
                  Mark Delivered
                </button>
                <button
                  disabled={actionInProgress === selectedOrder.id || selectedOrder.status === "Rejected"}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "Rejected")}
                  className="rounded-lg border border-rose-200 bg-rose-50 py-1.5 text-center text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                >
                  Reject Order
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 border-t pt-3">
              <button
                disabled={actionInProgress === selectedOrder.id}
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="flex items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 py-2 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
              >
                <Trash2 size={13} /> Cancel Order
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
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
                  Supplier
                </label>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All suppliers</option>
                  {[...new Set(orders.map((o) => o.supplier))].map((supplier) => (
                    <option key={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Procurement Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All procurement types</option>
                  <option>Emergency</option>
                  <option>Standard</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Order Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All statuses</option>
                  {(
                    [
                      "Approved",
                      "In Transit",
                      "Awaiting Approval",
                      "Delivered",
                      "Rejected",
                    ] as OrderStatus[]
                  ).map((status) => (
                    <option key={status}>{status}</option>
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
                  setCurrentPage(1);
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
