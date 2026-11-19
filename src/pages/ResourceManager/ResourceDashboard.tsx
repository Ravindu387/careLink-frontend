import { useEffect, useState, useMemo, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Download,
  Menu, Check, FileText, Filter, Plus, RefreshCw,
  Wifi, WifiOff, Trash2, Eye, CheckCircle2, DollarSign,
  Boxes, FileSpreadsheet, ExternalLink, X
} from "lucide-react";

import { resourceDashboardService } from "../../services/resourceDashboardService";
import type {
  ResourceDashboardData,
  DashboardStat,
  DashboardRequestItem,
  RecordReceiptPayload
} from "../../types/dashboard";

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

const fallbackStats: DashboardStat[] = [
  { title: "Total stock value", value: "$4.82M", note: "+6.4% this month", icon: "DollarSign", color: "blue" },
  { title: "Available inventory", value: "68%", note: "3 critical shortages", icon: "Boxes", color: "orange" },
  { title: "Pending requests", value: "18", note: "7 high or critical", icon: "ClipboardList", color: "red" },
  { title: "Active dispatches", value: "12", note: "2 delayed in transit", icon: "Truck", color: "blue" },
  { title: "Warehouse usage", value: "72%", note: "North Hub at 91%", icon: "Warehouse", color: "orange" },
  { title: "Fulfilment rate", value: "93.8%", note: "+2.1% this week", icon: "CheckCircle2", color: "green" },
  { title: "Open purchase orders", value: "24", note: "$186K committed", icon: "ShoppingCart", color: "blue" },
  { title: "Verified suppliers", value: "48", note: "4 categories covered", icon: "BriefcaseBusiness", color: "green" },
];

const fallbackRequests: DashboardRequestItem[] = [
  { id: "RR-2841", unit: "North Ward Shelter Network", resource: "Drinking Water - 10L", quantity: "2,400 units", priority: "Critical", source: "Central Hub", age: "18 min", status: "Awaiting Approval" },
  { id: "RR-2839", unit: "Medical Team 3", resource: "Trauma Medical Kit", quantity: "24 units", priority: "Critical", source: "Central Hub", age: "34 min", status: "Partially Available" },
  { id: "RR-2836", unit: "Eastbank Community Centre", resource: "Family Food Pack", quantity: "500 units", priority: "High", source: "North Hub", age: "49 min", status: "Awaiting Approval" },
  { id: "RR-2828", unit: "Mobility Response Team", resource: "Fuel - Diesel", quantity: "1,200 L", priority: "High", source: "West Depot", age: "1h 12m", status: "Allocated" },
];

const fallbackStockMovement = [
  { day: "Mon", received: 68, issued: 45 },
  { day: "Tue", received: 42, issued: 61 },
  { day: "Wed", received: 85, issued: 55 },
  { day: "Thu", received: 60, issued: 70 },
  { day: "Fri", received: 96, issued: 73 },
  { day: "Sat", received: 48, issued: 38 },
  { day: "Today", received: 78, issued: 60 },
];

const fallbackStockHealth = [
  { name: "Food & Water", value: 82, color: "bg-emerald-500" },
  { name: "Shelter", value: 68, color: "bg-sky-600" },
  { name: "Medical", value: 24, color: "bg-red-600" },
  { name: "WASH", value: 74, color: "bg-emerald-500" },
  { name: "Transport & Fuel", value: 36, color: "bg-amber-500" },
  { name: "Non-food Items", value: 57, color: "bg-sky-600" },
];

const fallbackActivities = [
  { icon: "Truck", title: "Dispatch DSP-1092 departed", detail: "2,400 water units · North Ward", time: "4 min" },
  { icon: "GitBranch", title: "Allocation AL-1048 approved", detail: "18 trauma kits reserved", time: "12 min" },
  { icon: "AlertTriangle", title: "Low-stock threshold reached", detail: "Family Food Packs · North Hub", time: "21 min" },
  { icon: "Package", title: "Stock receipt completed", detail: "500 hygiene kits · West Depot", time: "38 min" },
];

const colorMap: Record<string, string> = {
  blue: "bg-sky-50 text-sky-700",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  green: "bg-emerald-50 text-emerald-600",
};

const priorityStyle: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border border-red-200",
  High: "bg-amber-100 text-amber-800 border border-amber-200",
  Medium: "bg-sky-100 text-sky-700 border border-sky-200",
  Low: "bg-slate-100 text-slate-700 border border-slate-200",
};

const statusStyle: Record<string, string> = {
  "Awaiting Approval": "bg-amber-100 text-amber-800 border border-amber-200",
  "Partially Available": "bg-slate-100 text-slate-700 border border-slate-200",
  Allocated: "bg-sky-100 text-sky-700 border border-sky-200",
  Processing: "bg-blue-100 text-blue-700 border border-blue-200",
  Fulfilled: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const statIconMap: Record<string, any> = {
  DollarSign: DollarSign,
  Boxes: Boxes,
  ClipboardList: ClipboardList,
  Truck: Truck,
  Warehouse: Warehouse,
  CheckCircle2: CheckCircle2,
  ShoppingCart: ShoppingCart,
  BriefcaseBusiness: BriefcaseBusiness,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-sky-500";

export default function ResourceDashboard() {
  const navigate = useNavigate();

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<ResourceDashboardData | null>(null);
  const [requests, setRequests] = useState<DashboardRequestItem[]>(fallbackRequests);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DashboardRequestItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Record Receipt Form
  const [receiptForm, setReceiptForm] = useState<RecordReceiptPayload>({
    resource: "",
    category: "Food & Water",
    quantity: 100,
    warehouse: "Central Hub",
    supplier: "",
    receivedBy: "Daniel Perera",
    notes: ""
  });

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // LOAD DASHBOARD DATA
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resourceDashboardService.getDashboardData();
      if (data) {
        setDashboardData(data);
        if (data.priorityRequests && data.priorityRequests.length > 0) {
          setRequests(data.priorityRequests);
        }
      }
      setIsBackendConnected(true);
    } catch (err: any) {
      console.warn("CareLink API not reachable, running with cached data:", err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // SUBMIT STOCK RECEIPT
  const handleRecordReceipt = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await resourceDashboardService.recordReceipt(receiptForm);
      setNotification({
        type: "success",
        message: `Stock receipt recorded: ${receiptForm.quantity} units of ${receiptForm.resource} added to ${receiptForm.warehouse}.`
      });
      setShowReceiptModal(false);
      setReceiptForm({
        resource: "",
        category: "Food & Water",
        quantity: 100,
        warehouse: "Central Hub",
        supplier: "",
        receivedBy: "Daniel Perera",
        notes: ""
      });
      // Refresh dashboard to reflect new stock
      loadDashboard();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to record stock receipt."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // EXPORT SNAPSHOT
  const handleExport = async (format: "csv" | "pdf") => {
    setShowExportMenu(false);
    try {
      await resourceDashboardService.downloadSnapshot(format);
      setNotification({
        type: "success",
        message: `Exporting dashboard snapshot as ${format.toUpperCase()}...`
      });
    } catch (err) {
      exportClientCsv();
    }
  };

  // CLIENT CSV FALLBACK
  const exportClientCsv = () => {
    const csv = [
      ["Request ID", "Unit", "Resource", "Quantity", "Priority", "Source", "Status", "Age"],
      ...requests.map((r) => [
        r.id, r.unit, r.resource, r.quantity, r.priority, r.source, r.status, r.age
      ]),
    ].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-dashboard-snapshot-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter priority requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = [r.id, r.unit, r.resource, r.source].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "All priorities" || r.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [requests, search, priorityFilter]);

  // Derived state from dashboardData or fallback
  const stats = dashboardData?.stats || fallbackStats;
  const criticalAlert = dashboardData?.criticalAlert || {
    shortagesCount: 3,
    title: "3 Critical shortages",
    description: "Medical kits and fuel require immediate action",
    pendingRequestsCount: 18,
    districtsCount: 4
  };
  const stockMovement = dashboardData?.stockMovement || fallbackStockMovement;
  const stockHealth = dashboardData?.stockHealth || fallbackStockHealth;
  const activities = dashboardData?.recentActivities || fallbackActivities;

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>

        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">
              Resource Management
            </p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>

          <p className="mt-2 text-xs font-bold">
            Monsoon Floods 2025
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Greater Riverton · Level 4
          </p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Resource Dashboard";

            return (
              <button
                key={item.label}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.path);
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

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Daniel Perera</p>
            <p className="text-[10px] text-sky-200">
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

      {/* MAIN */}
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />

            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Badge */}
            <div className="flex items-center gap-2">
              {isBackendConnected === true && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Connected
                </span>
              )}
              {isBackendConnected === false && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 border border-amber-200">
                  <WifiOff size={11} />
                  Offline Mode
                </span>
              )}

              <button
                onClick={loadDashboard}
                disabled={loading}
                title="Refresh dashboard metrics"
                className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-sky-600" : ""} />
              </button>
            </div>

            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">
                Primary Hub
              </p>
              <p className="text-[10px] font-bold">
                Central Logistics Hub
              </p>
            </div>

            <button className="hidden rounded-lg border p-2.5 sm:block">
              <ShieldCheck size={18} />
            </button>

            <button className="relative rounded-lg border p-2.5">
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
              <p className="text-[9px] text-slate-400">
                Resource Manager
              </p>
            </div>

            <ChevronRight size={17} className="hidden sm:block" />
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="px-4 sm:px-6 lg:px-7 pt-4">
            <div className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium shadow-sm transition ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-600" />
                )}
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <div className="space-y-5 p-4 sm:p-6 lg:p-7">

          {/* BREADCRUMB */}
          <div className="text-[10px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Resource Dashboard
            </span>
          </div>

          {/* PAGE TITLE & ACTIONS */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Resource Dashboard
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Monitor inventory, fulfilment, storage, procurement, and field delivery across active operations.
              </p>
            </div>

            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                >
                  <Download size={14} />
                  Export snapshot
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-30">
                    <button
                      onClick={() => handleExport("csv")}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium"
                    >
                      <FileSpreadsheet size={15} className="text-emerald-600" />
                      Snapshot CSV
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium border-t border-slate-100"
                    >
                      <FileText size={15} className="text-rose-600" />
                      Snapshot PDF Document
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowReceiptModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Plus size={15} />
                Record receipt
              </button>
            </div>
          </section>

          {/* CRITICAL SHORTAGES ALERT BANNER */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-red-50/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={22} />
              </div>
              <div>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">
                  {criticalAlert.title}
                </span>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {criticalAlert.description}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {criticalAlert.pendingRequestsCount} resource requests are awaiting approval across {criticalAlert.districtsCount} districts.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/resource-manager/alerts")}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 shadow-sm transition"
            >
              Review alerts
            </button>
          </section>

          {/* 8 STATISTICS CARDS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const IconComponent = statIconMap[stat.icon] || Package;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[stat.color] || "bg-sky-50 text-sky-700"}`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                      <p className="text-[9px] text-slate-400">{stat.note}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* CHARTS */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">

            {/* STOCK MOVEMENT */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-xs font-semibold">Stock movement</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">Received and issued over the last 7 days</p>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#287ba5]" />Received</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#62b7a8]" />Issued</span>
                </div>
              </div>

              <div className="relative h-56 px-5 pb-7 pt-5">
                <div className="absolute inset-x-5 top-1/4 border-t border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-5 top-2/4 border-t border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-5 top-3/4 border-t border-slate-100 pointer-events-none" />

                <div className="relative z-10 flex h-full items-end justify-around gap-2">
                  {stockMovement.map((item) => (
                    <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end">
                      <div className="flex h-full w-full items-end justify-center gap-1.5">
                        <div
                          title={`Received: ${item.received}`}
                          className="w-3 max-w-5 rounded-t-sm bg-[#287ba5] transition-all hover:opacity-80"
                          style={{ height: `${Math.min(100, Math.max(10, item.received))}%` }}
                        />
                        <div
                          title={`Issued: ${item.issued}`}
                          className="w-3 max-w-5 rounded-t-sm bg-[#62b7a8] transition-all hover:opacity-80"
                          style={{ height: `${Math.min(100, Math.max(8, item.issued))}%` }}
                        />
                      </div>
                      <span className="mt-2 text-[9px] font-medium text-slate-500">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STOCK HEALTH BY CATEGORY */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-xs font-semibold">Stock health by category</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">Availability against operational thresholds</p>
                </div>
                <button
                  onClick={() => navigate("/resource-manager/inventory")}
                  className="flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline"
                >
                  View inventory <ChevronRight size={13} />
                </button>
              </div>

              <div className="space-y-4 p-5">
                {stockHealth.map((item) => (
                  <div key={item.name} className="grid grid-cols-[115px_45px_1fr] items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-700">{item.name}</span>
                    <span className="text-right text-[10px] font-medium text-slate-400">{item.value}%</span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* REQUESTS & LIVE LOGISTICS ACTIVITY */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.85fr_1fr]">

            {/* PRIORITY RESOURCE REQUESTS */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-xs font-semibold">Priority resource requests</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">Awaiting review or active fulfilment</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 outline-none"
                  >
                    <option>All priorities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>

                  <button
                    onClick={() => navigate("/resource-manager/requests")}
                    className="flex items-center gap-0.5 text-xs font-semibold text-sky-700 hover:underline ml-2"
                  >
                    View all <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Request</th>
                      <th className="px-4 py-3">Requesting Unit</th>
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-100 text-[11px] hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{request.id}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">{request.unit}</td>
                        <td className="px-4 py-3.5 text-slate-600">{request.resource}</td>
                        <td className="px-4 py-3.5 font-medium">{request.quantity}</td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded px-2 py-0.5 text-[9px] font-semibold ${priorityStyle[request.priority] || "bg-slate-100 text-slate-600"}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">{request.source}</td>
                        <td className="px-4 py-3.5 text-slate-400">{request.age}</td>
                        <td className="px-4 py-3.5">
                          <span className={`whitespace-nowrap rounded px-2 py-0.5 text-[9px] font-semibold ${statusStyle[request.status] || "bg-slate-100 text-slate-600"}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRequests.length === 0 && (
                <p className="p-8 text-center text-xs text-slate-400">No resource requests matching criteria.</p>
              )}
            </div>

            {/* LIVE LOGISTICS ACTIVITY */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-xs font-semibold">Live logistics activity</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">Latest movements and decisions</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      {activity.icon === "Truck" && <Truck size={17} />}
                      {activity.icon === "GitBranch" && <GitBranch size={17} />}
                      {activity.icon === "AlertTriangle" && <AlertTriangle size={17} className="text-amber-600" />}
                      {activity.icon === "Package" && <Package size={17} />}
                      {activity.icon === "ClipboardList" && <ClipboardList size={17} />}
                      {!["Truck", "GitBranch", "AlertTriangle", "Package", "ClipboardList"].includes(activity.icon) && (
                        <CheckCircle2 size={17} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800">{activity.title}</p>
                      <p className="text-[10px] text-slate-400">{activity.detail}</p>
                    </div>
                    <span className="shrink-0 text-[9px] font-medium text-slate-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section>
            <h3 className="mb-3 text-xs font-semibold text-slate-700">Quick actions</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { icon: Plus, label: "Record Receipt", action: () => setShowReceiptModal(true) },
                { icon: ClipboardList, label: "Review Requests", action: () => navigate("/resource-manager/requests") },
                { icon: GitBranch, label: "Create Allocation", action: () => navigate("/resource-manager/allocations") },
                { icon: Truck, label: "New Dispatch", action: () => navigate("/resource-manager/dispatch") },
                { icon: ArrowLeftRight, label: "Stock Transfer", action: () => navigate("/resource-manager/transfers") },
                { icon: ShoppingCart, label: "Purchase Order", action: () => navigate("/resource-manager/procurement") },
              ].map((action) => {
                const ActionIcon = action.icon;

                return (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50/50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <ActionIcon size={20} />
                    </span>
                    <span className="flex-1 text-xs font-semibold text-slate-800">{action.label}</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                );
              })}
            </div>
          </section>

          <footer className="py-4 text-center text-[10px] text-slate-400 border-t border-slate-200/60">
            CareLink Humanitarian Operations Platform · Central Logistics Command
          </footer>

        </div>
      </main>

      {/* RECORD RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleRecordReceipt}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Record Stock Receipt
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Log incoming supplies into warehouse inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Resource Name
              <input
                required
                placeholder="e.g., Trauma Medical Kit, Drinking Water"
                value={receiptForm.resource}
                onChange={e => setReceiptForm({ ...receiptForm, resource: e.target.value })}
                className={`mt-1.5 ${inputClass}`}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700">
                Category
                <select
                  value={receiptForm.category}
                  onChange={e => setReceiptForm({ ...receiptForm, category: e.target.value })}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Food & Water</option>
                  <option>Shelter</option>
                  <option>Medical</option>
                  <option>WASH</option>
                  <option>Transport & Fuel</option>
                  <option>Non-food Items</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Quantity (Units)
                <input
                  required
                  type="number"
                  min="1"
                  value={receiptForm.quantity}
                  onChange={e => setReceiptForm({ ...receiptForm, quantity: parseInt(e.target.value) || 0 })}
                  className={`mt-1.5 ${inputClass}`}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700">
                Destination Warehouse
                <select
                  value={receiptForm.warehouse}
                  onChange={e => setReceiptForm({ ...receiptForm, warehouse: e.target.value })}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Central Hub</option>
                  <option>North Hub</option>
                  <option>Eastbank</option>
                  <option>West Depot</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Supplier (Optional)
                <input
                  placeholder="e.g. Apex Health Logistics"
                  value={receiptForm.supplier || ""}
                  onChange={e => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
                  className={`mt-1.5 ${inputClass}`}
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Notes / Delivery Reference
              <input
                placeholder="e.g. Delivery TR-0489 batch #104"
                value={receiptForm.notes || ""}
                onChange={e => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                className={`mt-1.5 ${inputClass}`}
              />
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Confirm Receipt
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUEST DETAIL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Request Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-sky-50 p-4 border border-sky-100">
              <p className="text-xs font-bold text-sky-800">{selectedRequest.id}</p>
              <h4 className="mt-1 text-base font-bold text-slate-800">{selectedRequest.resource}</h4>
              <p className="mt-0.5 text-xs text-slate-500">{selectedRequest.unit}</p>
            </div>

            <div className="space-y-2">
              {[
                ["Quantity Required", selectedRequest.quantity],
                ["Priority Level", selectedRequest.priority],
                ["Warehouse Source", selectedRequest.source],
                ["Status", selectedRequest.status],
                ["Age", selectedRequest.age],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  navigate("/resource-manager/allocations");
                }}
                className="flex-1 rounded-lg bg-[#287ba5] py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] shadow-sm transition text-center"
              >
                Allocate Resource
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
