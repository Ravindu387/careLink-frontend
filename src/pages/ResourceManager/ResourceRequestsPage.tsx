import { useMemo, useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Download,
  Menu, Check, FileText, Filter, Plus, RefreshCw,
  Wifi, WifiOff, Trash2, Eye, CheckCircle2,
  Boxes, FileSpreadsheet, ExternalLink, X, RotateCcw
} from "lucide-react";

import { resourceRequestService } from "../../services/resourceRequestService";
import type {
  ResourceRequest,
  ResourceRequestSummary,
  CreateResourceRequestPayload,
  RequestPriority,
  RequestStatus
} from "../../types/resourceRequest";

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

const initialRequests: ResourceRequest[] = [
  { id: "RR-2841", unit: "North Ward Shelter Network", resource: "Drinking Water - 10L", quantity: "2,400 units", priority: "Critical", category: "Food & Water", source: "Central Hub", age: "18 min", status: "Awaiting Approval" },
  { id: "RR-2839", unit: "Medical Team 3", resource: "Trauma Medical Kit", quantity: "24 units", priority: "Critical", category: "Medical", source: "Central Hub", age: "34 min", status: "Partially Available" },
  { id: "RR-2836", unit: "Eastbank Community Centre", resource: "Family Food Pack", quantity: "500 units", priority: "High", category: "Food & Water", source: "North Hub", age: "49 min", status: "Awaiting Approval" },
  { id: "RR-2828", unit: "Mobility Response Team", resource: "Fuel - Diesel", quantity: "1,200 L", priority: "High", category: "Transport & Fuel", source: "West Depot", age: "1h 12m", status: "Allocated" },
  { id: "RR-2821", unit: "Riverton High Shelter", resource: "Thermal Blanket", quantity: "180 units", priority: "Medium", category: "Shelter", source: "North Hub", age: "2h 04m", status: "Processing" },
  { id: "RR-2818", unit: "Emergency Medical Unit", resource: "First Aid Kit", quantity: "60 units", priority: "High", category: "Medical", source: "Central Hub", age: "2h 30m", status: "Fulfilled" },
  { id: "RR-2815", unit: "South District Centre", resource: "Hygiene Kit", quantity: "300 units", priority: "Medium", category: "WASH", source: "West Depot", age: "3h 10m", status: "Awaiting Approval" },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Exceptions"];

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border border-red-200",
  High: "bg-amber-50 text-amber-800 border border-amber-200",
  Medium: "bg-blue-50 text-blue-700 border border-blue-200",
  Low: "bg-slate-100 text-slate-700 border border-slate-200",
};

const statusStyles: Record<string, string> = {
  "Awaiting Approval": "bg-amber-50 text-amber-800 border border-amber-200",
  "Partially Available": "bg-slate-100 text-slate-700 border border-slate-200",
  Allocated: "bg-sky-50 text-sky-700 border border-sky-200",
  Processing: "bg-blue-50 text-blue-700 border border-blue-200",
  Fulfilled: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-sky-500";

export default function ResourceRequestsPage() {
  const navigate = useNavigate();

  // Requests State
  const [requests, setRequests] = useState<ResourceRequest[]>(initialRequests);
  const [summary, setSummary] = useState<ResourceRequestSummary | null>(null);

  // Filters State
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [category, setCategory] = useState("All categories");
  const [requester, setRequester] = useState("All requesters");
  const [status, setStatus] = useState("All statuses");

  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);

  const [newRequest, setNewRequest] = useState<CreateResourceRequestPayload>({
    unit: "",
    resource: "",
    quantity: "100 units",
    priority: "Medium",
    category: "Food & Water",
    source: "Central Hub",
  });

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // LOAD DATA FROM BACKEND
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const [requestsData, summaryData] = await Promise.all([
        resourceRequestService.getRequests(),
        resourceRequestService.getSummary(),
      ]);

      if (requestsData && Array.isArray(requestsData)) {
        setRequests(requestsData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (err: any) {
      console.warn("CareLink API not reachable, running with cached requests:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setPriority("All priorities");
    setCategory("All categories");
    setRequester("All requesters");
    setStatus("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // FILTERED REQUESTS
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const searchMatch =
        `${item.id} ${item.unit} ${item.resource} ${item.source} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const priorityMatch =
        priority === "All priorities" || item.priority === priority;

      const categoryMatch =
        category === "All categories" || item.category === category;

      const requesterMatch =
        requester === "All requesters" || item.unit === requester;

      const statusMatch =
        status === "All statuses" || item.status === status;

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Awaiting Approval", "Partially Available"].includes(item.status)) ||
        (activeTab === "Active" &&
          ["Allocated", "Processing"].includes(item.status)) ||
        (activeTab === "Completed" && item.status === "Fulfilled") ||
        (activeTab === "Exceptions" && item.status === "Partially Available");

      return searchMatch && priorityMatch && categoryMatch &&
        requesterMatch && statusMatch && tabMatch;
    });
  }, [requests, search, priority, category, requester, status, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const displayedRequests = filteredRequests.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // SUMMARY METRICS
  const openCount = summary?.openCount ?? requests.filter(r => r.status !== "Fulfilled").length;
  const approvalCount = summary?.awaitingApprovalCount ?? requests.filter(r => r.status === "Awaiting Approval").length;
  const partialCount = summary?.partiallyAvailableCount ?? requests.filter(r => r.status === "Partially Available").length;
  const fulfilledCount = summary?.fulfilledTodayCount ?? requests.filter(r => r.status === "Fulfilled").length;

  // CREATE REQUEST
  const handleCreateRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRequest.unit.trim() || !newRequest.resource.trim()) return;

    setActionInProgress("create");
    try {
      const created = await resourceRequestService.createRequest(newRequest);
      setRequests(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewRequest({
        unit: "",
        resource: "",
        quantity: "100 units",
        priority: "Medium",
        category: "Food & Water",
        source: "Central Hub",
      });
      setNotification({
        type: "success",
        message: `Resource request "${created.id}" created successfully.`
      });
      loadRequests();
    } catch (err: any) {
      // Local fallback
      const fallbackItem: ResourceRequest = {
        id: `RR-${Date.now().toString().slice(-4)}`,
        unit: newRequest.unit.trim(),
        resource: newRequest.resource.trim(),
        quantity: newRequest.quantity.trim(),
        priority: newRequest.priority,
        category: newRequest.category,
        source: newRequest.source || "Central Hub",
        age: "Just now",
        status: "Awaiting Approval",
      };
      setRequests(prev => [fallbackItem, ...prev]);
      setShowCreateModal(false);
      setNotification({
        type: "success",
        message: `Resource request "${fallbackItem.id}" recorded locally.`
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // UPDATE REQUEST STATUS
  const handleStatusUpdate = async (id: string, newStatus: RequestStatus) => {
    setActionInProgress(`status-${id}`);
    try {
      const updated = await resourceRequestService.updateRequestStatus(id, { status: newStatus });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated);
      }
      setNotification({
        type: "success",
        message: `Request ${id} status updated to ${newStatus}.`
      });
      loadRequests();
    } catch (err: any) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      setNotification({
        type: "success",
        message: `Status updated locally to ${newStatus}.`
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // DELETE REQUEST
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete resource request ${id}?`)) return;

    setActionInProgress(`delete-${id}`);
    try {
      await resourceRequestService.deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
      setNotification({
        type: "success",
        message: `Request ${id} deleted successfully.`
      });
      loadRequests();
    } catch (err: any) {
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
      setNotification({
        type: "success",
        message: `Request ${id} removed.`
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // EXPORT
  const handleExport = async (format: "csv" | "pdf") => {
    setShowExportMenu(false);
    try {
      await resourceRequestService.downloadExport({
        search: search || undefined,
        priority: priority !== "All priorities" ? priority : undefined,
        category: category !== "All categories" ? category : undefined,
        requester: requester !== "All requesters" ? requester : undefined,
        status: status !== "All statuses" ? status : undefined,
        tab: activeTab !== "All" ? activeTab : undefined,
      }, format);
      setNotification({
        type: "success",
        message: `Exporting resource requests as ${format.toUpperCase()}...`
      });
    } catch (err) {
      exportClientCsv();
    }
  };

  // CLIENT CSV FALLBACK
  const exportClientCsv = () => {
    const headers = ["Request ID", "Requesting Unit", "Resource", "Quantity", "Priority", "Category", "Suggested Source", "Age", "Status"];
    const rows = filteredRequests.map(r => [r.id, r.unit, r.resource, r.quantity, r.priority, r.category, r.source, r.age, r.status]);
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-resource-requests-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Distinct units for filter
  const requesterOptions = useMemo(() => {
    return Array.from(new Set(requests.map(r => r.unit)));
  }, [requests]);

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
            const active = item.label === "Resource Requests";

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
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search resource requests, units, items..."
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
                onClick={loadRequests}
                disabled={isLoading}
                title="Refresh resource requests"
                className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin text-sky-600" : ""} />
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
              Resource Requests
            </span>
          </div>

          {/* PAGE TITLE & ACTIONS */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Resource Requests
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Assess operational demand, source available stock, and authorise fulfilment.
              </p>
            </div>

            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                >
                  <Download size={14} />
                  Export
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl z-30">
                    <button
                      onClick={() => handleExport("csv")}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium"
                    >
                      <FileSpreadsheet size={15} className="text-emerald-600" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium border-t border-slate-100"
                    >
                      <FileText size={15} className="text-rose-600" />
                      Export as PDF Document
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Plus size={15} />
                Create Request
              </button>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Open requests",
                value: openCount,
                note: "7 high or critical",
                icon: ClipboardList,
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Awaiting approval",
                value: approvalCount,
                note: "Oldest is 49 min",
                icon: Clock3,
                style: "bg-amber-50 text-amber-600",
              },
              {
                title: "Partially available",
                value: partialCount,
                note: "Sourcing required",
                icon: Boxes,
                style: "bg-red-50 text-red-600",
              },
              {
                title: "Fulfilled today",
                value: fulfilledCount,
                note: "93.8% service level",
                icon: CheckCircle2,
                style: "bg-emerald-50 text-emerald-600",
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.style}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                    <p className="text-[9px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* CONTROLLED ALLOCATION WORKFLOW BANNER */}
          <section className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-900">
                Controlled allocation workflow
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Approvals reserve stock but do not release it. Dispatch release requires separate authorisation and stock verification.
              </p>
            </div>
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
                  className={`relative flex items-center gap-1.5 pb-3.5 text-xs transition ${
                    activeTab === tab
                      ? "font-bold text-[#287ba5]"
                      : "text-slate-500 hover:text-[#287ba5]"
                  }`}
                >
                  {tab}

                  {tab === "All" && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[9px] font-bold text-sky-800">
                      {requests.length}
                    </span>
                  )}

                  {tab === "Needs action" && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                      {approvalCount + partialCount}
                    </span>
                  )}

                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287ba5]" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_repeat(4,minmax(110px,auto))_auto]">

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search requests..."
                className="w-full text-xs outline-none"
              />
            </div>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
            >
              <option>All priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
            </select>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
            >
              <option>All categories</option>
              {["Food & Water", "Medical", "Shelter", "WASH", "Transport & Fuel"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={requester}
              onChange={(e) => {
                setRequester(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
            >
              <option>All requesters</option>
              {requesterOptions.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
            >
              <option>All statuses</option>
              {["Awaiting Approval", "Partially Available", "Allocated", "Processing", "Fulfilled"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </section>

          {/* REQUESTS TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50 text-[10px] text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">Request</th>
                    <th className="px-4 py-3.5">Requesting Unit</th>
                    <th className="px-4 py-3.5">Resource</th>
                    <th className="px-4 py-3.5">Quantity</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Suggested Source</th>
                    <th className="px-4 py-3.5">Age</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-t border-slate-100 text-[11px] transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {request.id}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {request.unit}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {request.resource}
                      </td>

                      <td className="px-4 py-3.5 font-medium">
                        {request.quantity}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${priorityStyles[request.priority] || "bg-slate-100 text-slate-700"}`}>
                          {request.priority}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500">
                        {request.source}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">
                        {request.age}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-semibold ${statusStyles[request.status] || "bg-slate-100 text-slate-700"}`}>
                          {request.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            title="View request details"
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition"
                          >
                            <Eye size={13} />
                            View
                          </button>

                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={actionInProgress === `delete-${request.id}`}
                            title="Delete request"
                            className="inline-flex items-center rounded p-1 text-slate-400 hover:text-rose-600 transition disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayedRequests.length === 0 && (
              <div className="p-10 text-center text-xs text-slate-400">
                No resource requests found matching criteria. Try resetting filters.
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                Showing {filteredRequests.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
                –{Math.min(safePage * pageSize, filteredRequests.length)}
                {" "}of {filteredRequests.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 min-w-7 rounded-lg border px-2 text-[10px] font-semibold transition ${
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
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <footer className="py-2 text-center text-[10px] text-slate-400 border-t border-slate-200/60">
            CareLink Resource Management Platform · Operational Demand Command
          </footer>
        </div>
      </main>

      {/* CREATE REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleCreateRequest}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Create Resource Request</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Log operational requisition for field dispatch.
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
              <label className="block text-xs font-semibold text-slate-700">Requesting Unit</label>
              <input
                required
                value={newRequest.unit}
                onChange={(e) => setNewRequest({ ...newRequest, unit: e.target.value })}
                placeholder="e.g. North Ward Shelter Network"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Resource Name</label>
              <input
                required
                value={newRequest.resource}
                onChange={(e) => setNewRequest({ ...newRequest, resource: e.target.value })}
                placeholder="e.g. Trauma Medical Kit, Drinking Water"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className={`mt-1.5 ${inputClass}`}
                >
                  {["Food & Water", "Medical", "Shelter", "WASH", "Transport & Fuel"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Quantity</label>
                <input
                  required
                  placeholder="e.g. 2,400 units, 1,200 L"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as RequestPriority })}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Suggested Source</label>
                <select
                  value={newRequest.source || "Central Hub"}
                  onChange={(e) => setNewRequest({ ...newRequest, source: e.target.value })}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Central Hub</option>
                  <option>North Hub</option>
                  <option>Eastbank</option>
                  <option>West Depot</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={actionInProgress === "create"}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] disabled:opacity-50 shadow-sm"
              >
                {actionInProgress === "create" ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Create Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUEST DETAILS MODAL WITH DIRECT STATUS TRANSITIONS */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-sky-50 p-4 border border-sky-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800">{selectedRequest.id}</span>
                <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${statusStyles[selectedRequest.status]}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <h4 className="mt-1 text-base font-bold text-slate-800">{selectedRequest.resource}</h4>
              <p className="mt-0.5 text-xs text-slate-500">{selectedRequest.unit}</p>
            </div>

            <div className="space-y-2">
              {[
                ["Quantity Required", selectedRequest.quantity],
                ["Category", selectedRequest.category],
                ["Priority Level", selectedRequest.priority],
                ["Suggested Source", selectedRequest.source],
                ["Submission Age", selectedRequest.age],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            {/* STATUS TRANSITION CONTROLS */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workflow Actions
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedRequest.status === "Awaiting Approval" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, "Allocated")}
                      disabled={actionInProgress?.startsWith("status-")}
                      className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Authorize & Allocate
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, "Partially Available")}
                      disabled={actionInProgress?.startsWith("status-")}
                      className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Partial Sourcing
                    </button>
                  </>
                )}

                {selectedRequest.status === "Partially Available" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "Allocated")}
                    disabled={actionInProgress?.startsWith("status-")}
                    className="flex-1 rounded-lg bg-[#287ba5] py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] transition"
                  >
                    Allocate Remaining
                  </button>
                )}

                {selectedRequest.status === "Allocated" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "Processing")}
                    disabled={actionInProgress?.startsWith("status-")}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Start Processing
                  </button>
                )}

                {selectedRequest.status === "Processing" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "Fulfilled")}
                    disabled={actionInProgress?.startsWith("status-")}
                    className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    Mark Fulfilled
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    navigate("/resource-manager/allocations");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Allocations Page
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
