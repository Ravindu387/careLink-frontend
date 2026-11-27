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
  Download,
  Menu,
  X,
  Filter,
  FileText,
  LockKeyhole,
  RotateCcw,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
} from "lucide-react";

import { auditLogService } from "../../services/auditLogService";
import type {
  AuditRecord,
  AuditLogSummary,
  CreateAuditLogPayload,
} from "../../types/auditLog";

const initialRecords: AuditRecord[] = [
  {
    id: "AUD-482194",
    action: "Allocation approved",
    actor: "Daniel Perera",
    timestamp: "22 Jun · 13:51",
    record: "AL-1048",
    change: "18 trauma kits reserved",
    rationale: "Emergency medical request",
    actionType: "Approval",
    recordType: "Allocation",
    date: "2025-06-22",
  },
  {
    id: "AUD-482188",
    action: "Dispatch released",
    actor: "Daniel Perera",
    timestamp: "22 Jun · 13:28",
    record: "DSP-1092",
    change: "Pending → In Transit",
    rationale: "Priority water shortage",
    actionType: "Dispatch",
    recordType: "Dispatch",
    date: "2025-06-22",
  },
  {
    id: "AUD-482174",
    action: "Stock adjustment",
    actor: "Maya Silva",
    timestamp: "22 Jun · 12:52",
    record: "RES-00402",
    change: "88 → 86 units",
    rationale: "Cycle count correction",
    actionType: "Inventory",
    recordType: "Resource",
    date: "2025-06-22",
  },
  {
    id: "AUD-482161",
    action: "Transfer approved",
    actor: "Daniel Perera",
    timestamp: "22 Jun · 12:10",
    record: "TR-0581",
    change: "Draft → Approved",
    rationale: "North Hub rebalancing",
    actionType: "Approval",
    recordType: "Transfer",
    date: "2025-06-22",
  },
  {
    id: "AUD-482155",
    action: "Purchase order created",
    actor: "Maya Silva",
    timestamp: "22 Jun · 11:45",
    record: "PO-2025-184",
    change: "New purchase order created",
    rationale: "Emergency medical supplies",
    actionType: "Procurement",
    recordType: "Purchase Order",
    date: "2025-06-22",
  },
  {
    id: "AUD-482142",
    action: "Supplier verified",
    actor: "Daniel Perera",
    timestamp: "22 Jun · 10:30",
    record: "SUP-0014",
    change: "Pending → Verified",
    rationale: "Document verification completed",
    actionType: "Verification",
    recordType: "Supplier",
    date: "2025-06-22",
  },
  {
    id: "AUD-482130",
    action: "Warehouse stock received",
    actor: "Maya Silva",
    timestamp: "21 Jun · 16:20",
    record: "RES-00128",
    change: "500 → 1000 units",
    rationale: "Incoming stock receipt",
    actionType: "Inventory",
    recordType: "Resource",
    date: "2025-06-21",
  },
  {
    id: "AUD-482115",
    action: "Dispatch completed",
    actor: "Daniel Perera",
    timestamp: "21 Jun · 14:10",
    record: "DSP-1084",
    change: "In Transit → Delivered",
    rationale: "Proof of delivery received",
    actionType: "Dispatch",
    recordType: "Dispatch",
    date: "2025-06-21",
  },
  {
    id: "AUD-482102",
    action: "Request approved",
    actor: "Maya Silva",
    timestamp: "21 Jun · 11:30",
    record: "RR-2839",
    change: "Pending → Approved",
    rationale: "Critical medical request",
    actionType: "Approval",
    recordType: "Request",
    date: "2025-06-21",
  },
  {
    id: "AUD-482090",
    action: "Transfer rejected",
    actor: "Daniel Perera",
    timestamp: "20 Jun · 15:45",
    record: "TR-0570",
    change: "Pending → Rejected",
    rationale: "Insufficient available stock",
    actionType: "Transfer",
    recordType: "Transfer",
    date: "2025-06-20",
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

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none focus:border-sky-500";

const actionTypeStyles: Record<string, string> = {
  Approval: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Dispatch: "bg-blue-50 text-blue-700 border-blue-200",
  Inventory: "bg-purple-50 text-purple-700 border-purple-200",
  Procurement: "bg-amber-50 text-amber-700 border-amber-200",
  Verification: "bg-teal-50 text-teal-700 border-teal-200",
  Transfer: "bg-indigo-50 text-indigo-700 border-indigo-200",
  System: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AuditLogPage() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<AuditRecord[]>(initialRecords);
  const [summary, setSummary] = useState<AuditLogSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [userFilter, setUserFilter] = useState("All users");
  const [recordFilter, setRecordFilter] = useState("All record types");
  const [dateFilter, setDateFilter] = useState("All dates");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const [showRetention, setShowRetention] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New Audit Event Form State
  const [newEventAction, setNewEventAction] = useState("");
  const [newEventActor, setNewEventActor] = useState("Daniel Perera");
  const [newEventRecord, setNewEventRecord] = useState("");
  const [newEventChange, setNewEventChange] = useState("");
  const [newEventRationale, setNewEventRationale] = useState("");
  const [newEventActionType, setNewEventActionType] = useState("Verification");
  const [newEventRecordType, setNewEventRecordType] = useState("System");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 5;

  // FETCH DATA FROM BACKEND
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [logsData, summaryData] = await Promise.all([
        auditLogService.getAuditLogs({
          search: search || undefined,
          actionType: actionFilter !== "All action types" ? actionFilter : undefined,
          actor: userFilter !== "All users" ? userFilter : undefined,
          recordType: recordFilter !== "All record types" ? recordFilter : undefined,
          dateFilter: dateFilter !== "All dates" ? dateFilter : undefined,
        }),
        auditLogService.getAuditLogSummary(),
      ]);

      if (logsData && Array.isArray(logsData)) {
        setRecords(logsData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local audit records:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search, actionFilter, userFilter, recordFilter, dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CLIENT-SIDE FILTERING (fallback / seamless immediate response)
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchText = [
        record.id,
        record.action,
        record.actor,
        record.record,
        record.change,
        record.rationale,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesAction =
        actionFilter === "All action types" ||
        record.actionType.toLowerCase() === actionFilter.toLowerCase();

      const matchesUser =
        userFilter === "All users" ||
        record.actor.toLowerCase() === userFilter.toLowerCase();

      const matchesRecord =
        recordFilter === "All record types" ||
        record.recordType.toLowerCase() === recordFilter.toLowerCase();

      let matchesDate = true;
      if (dateFilter === "Today") {
        const today = new Date().toISOString().slice(0, 10);
        matchesDate = record.date === today || record.date === "2025-06-22";
      } else if (dateFilter === "Last 7 days") {
        matchesDate = ["2025-06-22", "2025-06-21", "2025-06-20"].includes(
          record.date
        );
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesUser &&
        matchesRecord &&
        matchesDate
      );
    });
  }, [records, search, actionFilter, userFilter, recordFilter, dateFilter]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const displayedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setActionFilter("All action types");
    setUserFilter("All users");
    setRecordFilter("All record types");
    setDateFilter("All dates");
    setCurrentPage(1);
  };

  // EXPORT CSV
  const handleExport = () => {
    const headers = [
      "Event ID",
      "Action",
      "Actor",
      "Timestamp",
      "Record",
      "Change",
      "Rationale",
      "Action Type",
      "Record Type",
      "Date",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.action,
      record.actor,
      record.timestamp,
      record.record,
      record.change,
      record.rationale,
      record.actionType,
      record.recordType,
      record.date,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CREATE NEW AUDIT EVENT
  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEventAction || !newEventRecord || !newEventRationale) return;

    setIsSubmitting(true);
    const payload: CreateAuditLogPayload = {
      action: newEventAction.trim(),
      actor: newEventActor.trim() || "Daniel Perera",
      record: newEventRecord.trim(),
      change: newEventChange.trim() || "Manual audit verification logged",
      rationale: newEventRationale.trim(),
      actionType: newEventActionType,
      recordType: newEventRecordType,
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      const created = await auditLogService.createAuditLog(payload);
      if (created) {
        setRecords((prev) => [created, ...prev]);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adding audit event locally:", err);
      const fallbackRecord: AuditRecord = {
        id: `AUD-${Date.now().toString().slice(-6)}`,
        action: payload.action,
        actor: payload.actor || "Daniel Perera",
        timestamp: "Just now",
        record: payload.record,
        change: payload.change,
        rationale: payload.rationale,
        actionType: payload.actionType || "Verification",
        recordType: payload.recordType || "System",
        date: payload.date || new Date().toISOString().slice(0, 10),
      };
      setRecords((prev) => [fallbackRecord, ...prev]);
    } finally {
      setIsSubmitting(false);
      setShowCreateModal(false);
      // Reset form
      setNewEventAction("");
      setNewEventRecord("");
      setNewEventChange("");
      setNewEventRationale("");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">ReliefOS</h1>
            <p className="text-sm text-sky-200">Resource Management</p>
          </div>
        </div>

        {/* ACTIVE OPERATION */}
        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>
          <p className="mt-2 text-sm font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-sm text-sky-200">Greater Riverton · Level 4</p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Audit Log";

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

        {/* PROFILE */}
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search event, actor, record, or rationale..."
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
            {/* Backend Connection Indicator */}
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
              title="Refresh Audit Logs"
              className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-xs uppercase text-slate-400">Primary Hub</p>
              <p className="text-sm font-bold">Central Logistics Hub</p>
            </div>

            <button className="hidden rounded-lg border p-2.5 sm:block" aria-label="Security status">
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
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="space-y-5 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB */}
          <div className="text-[13px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">Audit Log</span>
          </div>

          {/* PAGE TITLE & ACTIONS */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Audit Log</h2>
              <p className="mt-1 text-xs text-slate-500">
                Immutable, tamper-evident accountability records for inventory, allocation, dispatch, and procurement.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <Plus size={14} className="text-[#287ba5]" />
                Record Log Entry
              </button>

              <button
                onClick={() => setShowRetention(true)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
              >
                Retention Policy
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </section>

          {/* STATS OVERVIEW CARDS */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Total Events</span>
                <Layers size={16} className="text-sky-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {summary ? summary.totalLogs : records.length}
              </p>
              <p className="mt-1 text-[13px] text-slate-400">All registered audits</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Approvals</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {summary
                  ? summary.approvalsCount
                  : records.filter((r) => r.actionType === "Approval").length}
              </p>
              <p className="mt-1 text-[13px] text-slate-400">Requests & transfers</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Dispatches</span>
                <Truck size={16} className="text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-700">
                {summary
                  ? summary.dispatchesCount
                  : records.filter((r) => r.actionType === "Dispatch").length}
              </p>
              <p className="mt-1 text-[13px] text-slate-400">Transit & delivery events</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-medium">Today's Activity</span>
                <Activity size={16} className="text-teal-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-teal-700">
                {summary
                  ? summary.todayCount
                  : records.filter((r) => r.date === "2025-06-22").length}
              </p>
              <p className="mt-1 text-[13px] text-slate-400">Events in last 24h</p>
            </div>
          </section>

          {/* READ-ONLY ACCOUNTABILITY BANNER */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-300 border-l-[4px] border-l-slate-600 bg-slate-50 px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className="shrink-0 text-slate-700" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Read-only accountability records
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Audit events cannot be edited or removed. Cryptographically preserved for full compliance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
              <LockKeyhole size={13} className="text-slate-400" />
              Retention: 7 Years
            </div>
          </section>

          {/* FILTERS TOOLBAR */}
          <section className="flex flex-wrap gap-2">
            {/* SEARCH */}
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search event, actor, record, or rationale..."
                className="w-full py-2.5 text-sm sm:text-[15px] outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear filter search">
                  <X size={14} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* ACTION TYPE */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All action types</option>
              <option>Approval</option>
              <option>Dispatch</option>
              <option>Inventory</option>
              <option>Procurement</option>
              <option>Verification</option>
              <option>Transfer</option>
              <option>System</option>
            </select>

            {/* USER / ACTOR */}
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All users</option>
              <option>Daniel Perera</option>
              <option>Maya Silva</option>
            </select>

            {/* RECORD TYPE */}
            <select
              value={recordFilter}
              onChange={(e) => {
                setRecordFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All record types</option>
              <option>Allocation</option>
              <option>Dispatch</option>
              <option>Resource</option>
              <option>Transfer</option>
              <option>Purchase Order</option>
              <option>Supplier</option>
              <option>Request</option>
              <option>System</option>
            </select>

            {/* DATE RANGE */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} shadow-sm`}
              style={{ width: "auto" }}
            >
              <option>All dates</option>
              <option>Today</option>
              <option>Last 7 days</option>
            </select>

            <button
              onClick={() => setShowMoreFilters(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
            >
              <Filter size={14} />
              More filters
            </button>

            {(search ||
              actionFilter !== "All action types" ||
              userFilter !== "All users" ||
              recordFilter !== "All record types" ||
              dateFilter !== "All dates") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </section>

          {/* AUDIT TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Event ID</th>
                    <th className="px-4 py-3.5 font-semibold">Action</th>
                    <th className="px-4 py-3.5 font-semibold">Actor</th>
                    <th className="px-4 py-3.5 font-semibold">Timestamp</th>
                    <th className="px-4 py-3.5 font-semibold">Record ID</th>
                    <th className="px-4 py-3.5 font-semibold">Change Description</th>
                    <th className="px-4 py-3.5 font-semibold">Rationale</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRecords.map((record) => {
                    const badgeClass =
                      actionTypeStyles[record.actionType] ||
                      "bg-slate-100 text-slate-700 border-slate-200";

                    return (
                      <tr
                        key={record.id}
                        className="border-t border-slate-100 text-sm hover:bg-slate-50/80 transition"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800">
                          {record.id}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                            >
                              {record.actionType}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {record.action}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-medium">
                          {record.actor}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                          {record.timestamp}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-sm font-semibold text-[#287ba5]">
                          {record.record}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {record.change}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-block max-w-[220px] truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {record.rationale}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            aria-label={`View ${record.id}`}
                            className="rounded p-1 text-slate-400 hover:bg-sky-50 hover:text-sky-700 transition"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {displayedRecords.length === 0 && (
                <div className="p-12 text-center">
                  <FileText size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No audit records found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try adjusting your search criteria or resetting filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition"
                  >
                    <RotateCcw size={13} />
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs">
              <p className="text-[13px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredRecords.length === 0
                    ? 0
                    : (safePage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(safePage * pageSize, filteredRecords.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredRecords.length.toLocaleString()}
                </span>{" "}
                entries
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
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
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER AUDIT NOTICE */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-400">
            <p className="flex items-center gap-1.5">
              <LockKeyhole size={13} className="text-slate-400" />
              All audit records are immutable, cryptographically verifiable, and tamper-evident.
            </p>
            <p>ReliefOS Regulatory Compliance standard ISO-22301</p>
          </div>
        </div>
      </main>

      {/* RECORD DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Audit Record Details
                </h3>
                <p className="mt-0.5 text-xs font-mono text-slate-400">
                  {selectedRecord.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50/80 p-3.5 border border-sky-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-700 shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedRecord.action}
                </p>
                <p className="text-[13px] text-slate-500">
                  Immutable accountability record
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Event ID</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRecord.id}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Actor</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRecord.actor}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Timestamp</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedRecord.timestamp}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Record ID</p>
                <p className="font-semibold text-[#287ba5] mt-0.5">{selectedRecord.record}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Action Type</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedRecord.actionType}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Record Type</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedRecord.recordType}</p>
              </div>
            </div>

            <div className="mt-2 space-y-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Change Detail</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedRecord.change}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[13px] text-slate-400">Rationale / Justification</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedRecord.rationale}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-[13px] text-slate-500">
              <LockKeyhole size={14} className="text-slate-400" />
              <span>This record is verified and cannot be edited or deleted.</span>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-4 w-full rounded-lg bg-[#287ba5] py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CREATE AUDIT EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Record Audit Event
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Log a manual verification, cycle review, or compliance event
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action Summary *
                </label>
                <input
                  type="text"
                  required
                  value={newEventAction}
                  onChange={(e) => setNewEventAction(e.target.value)}
                  placeholder="e.g., Physical inventory audit completed"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Record ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventRecord}
                    onChange={(e) => setNewEventRecord(e.target.value)}
                    placeholder="e.g., WH-CENTRAL, AL-1048"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Actor
                  </label>
                  <input
                    type="text"
                    value={newEventActor}
                    onChange={(e) => setNewEventActor(e.target.value)}
                    placeholder="Daniel Perera"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={newEventActionType}
                    onChange={(e) => setNewEventActionType(e.target.value)}
                    className={inputClass}
                  >
                    <option>Verification</option>
                    <option>Approval</option>
                    <option>Inventory</option>
                    <option>Dispatch</option>
                    <option>Procurement</option>
                    <option>Transfer</option>
                    <option>System</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Record Type
                  </label>
                  <select
                    value={newEventRecordType}
                    onChange={(e) => setNewEventRecordType(e.target.value)}
                    className={inputClass}
                  >
                    <option>System</option>
                    <option>Allocation</option>
                    <option>Dispatch</option>
                    <option>Resource</option>
                    <option>Transfer</option>
                    <option>Purchase Order</option>
                    <option>Supplier</option>
                    <option>Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Change Description
                </label>
                <input
                  type="text"
                  value={newEventChange}
                  onChange={(e) => setNewEventChange(e.target.value)}
                  placeholder="e.g., Verified physical stock counts match ledger"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rationale / Justification *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newEventRationale}
                  onChange={(e) => setNewEventRationale(e.target.value)}
                  placeholder="e.g., Scheduled monthly cycle count and quality inspection"
                  className={inputClass}
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#287ba5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1c668d] disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Save Audit Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETENTION POLICY MODAL */}
      {showRetention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Retention Policy
              </h3>
              <button
                onClick={() => setShowRetention(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50 p-3.5 border border-sky-100">
              <ShieldCheck size={24} className="text-sky-700" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Audit Data Protection Standard
                </p>
                <p className="text-[13px] text-slate-500">
                  Read-only accountability and compliance guarantee
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                ["Retention period", "7 years (immutable)"],
                ["Record modification", "Strictly prohibited"],
                ["Record deletion", "Strictly prohibited"],
                ["Export access", "Authorized Resource Managers"],
                ["Integrity verification", "SHA-256 Audit Hashes"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRetention(false)}
              className="mt-5 w-full rounded-lg bg-[#287ba5] py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MORE FILTERS MODAL */}
      {showMoreFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">More Filters</h3>
              <button
                onClick={() => setShowMoreFilters(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All action types</option>
                  <option>Approval</option>
                  <option>Dispatch</option>
                  <option>Inventory</option>
                  <option>Procurement</option>
                  <option>Verification</option>
                  <option>Transfer</option>
                  <option>System</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  User
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All users</option>
                  <option>Daniel Perera</option>
                  <option>Maya Silva</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Record Type
                </label>
                <select
                  value={recordFilter}
                  onChange={(e) => setRecordFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All record types</option>
                  <option>Allocation</option>
                  <option>Dispatch</option>
                  <option>Resource</option>
                  <option>Transfer</option>
                  <option>Purchase Order</option>
                  <option>Supplier</option>
                  <option>Request</option>
                  <option>System</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={inputClass}
                >
                  <option>All dates</option>
                  <option>Today</option>
                  <option>Last 7 days</option>
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
                <RotateCcw size={13} />
                Reset
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
