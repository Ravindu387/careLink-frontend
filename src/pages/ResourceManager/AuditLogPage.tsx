
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
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
  CalendarDays,
  User,
  LockKeyhole,
  Eye,
  RotateCcw
} from "lucide-react";

type AuditRecord = {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  record: string;
  change: string;
  rationale: string;
  actionType: string;
  recordType: string;
  date: string;
};

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
    date: "2025-06-22"
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
    date: "2025-06-22"
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
    date: "2025-06-22"
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
    date: "2025-06-22"
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
    date: "2025-06-22"
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
    date: "2025-06-22"
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
    date: "2025-06-21"
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
    date: "2025-06-21"
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
    date: "2025-06-21"
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
    date: "2025-06-20"
  }
];

const navigation = [
  { label: "Resource Dashboard", icon: ChartNoAxesCombined },
  { label: "Inventory", icon: Package },
  { label: "Warehouses", icon: Warehouse },
  { label: "Resource Requests", icon: ClipboardList, count: 18 },
  { label: "Allocations", icon: GitBranch, count: 7 },
  { label: "Dispatch & Tracking", icon: Truck, count: 12 },
  { label: "Stock Transfers", icon: ArrowLeftRight },
  { label: "Procurement", icon: ShoppingCart },
  { label: "Suppliers", icon: BriefcaseBusiness },
  { label: "Alerts", icon: AlertTriangle, count: 9 },
  { label: "Reports & Analytics", icon: ChartNoAxesCombined },
  { label: "Audit Log", icon: Clock3 },
  { label: "Settings", icon: Settings }
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600 outline-none focus:border-sky-500";

export default function AuditLogPage() {
  const [records, setRecords] = useState(initialRecords);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [userFilter, setUserFilter] = useState("All users");
  const [recordFilter, setRecordFilter] = useState("All record types");
  const [dateFilter, setDateFilter] = useState("All dates");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] =
    useState<AuditRecord | null>(null);

  const [showRetention, setShowRetention] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageSize = 4;

  // FILTER RECORDS
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const searchText = [
        record.id,
        record.action,
        record.actor,
        record.record,
        record.change,
        record.rationale
      ].join(" ").toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesAction =
        actionFilter === "All action types" ||
        record.actionType === actionFilter;

      const matchesUser =
        userFilter === "All users" ||
        record.actor === userFilter;

      const matchesRecord =
        recordFilter === "All record types" ||
        record.recordType === recordFilter;

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = record.date === "2025-06-22";
      } else if (dateFilter === "Last 7 days") {
        matchesDate = [
          "2025-06-22",
          "2025-06-21",
          "2025-06-20"
        ].includes(record.date);
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesUser &&
        matchesRecord &&
        matchesDate
      );
    });
  }, [
    records,
    search,
    actionFilter,
    userFilter,
    recordFilter,
    dateFilter
  ]);

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize)
  );

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
      "Record Type"
    ];

    const rows = filteredRecords.map(record => [
      record.id,
      record.action,
      record.actor,
      record.timestamp,
      record.record,
      record.change,
      record.rationale,
      record.actionType,
      record.recordType
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
    link.download = "reliefos-audit-log.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // DEMONSTRATION: ADD AN AUDIT EVENT
  const addDemoEvent = () => {
    const newRecord: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action: "Audit review completed",
      actor: "Daniel Perera",
      timestamp: new Date().toLocaleString(),
      record: "SYS-0001",
      change: "Review completed",
      rationale: "Manual audit review",
      actionType: "Verification",
      recordType: "System",
      date: new Date().toISOString().slice(0, 10)
    };

    setRecords(prev => [newRecord, ...prev]);
    resetFilters();
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
            <h1 className="text-xl font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">
              Resource Management
            </p>
          </div>
        </div>

        {/* ACTIVE OPERATION */}
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

        {/* NAVIGATION */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Audit Log";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!active) {
                    alert(`${item.label} page is not connected yet.`);
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

        {/* PROFILE */}
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
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />

            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">

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

        {/* PAGE CONTENT */}
        <div className="space-y-5 p-4 sm:p-6 lg:p-7">

          {/* BREADCRUMB */}
          <div className="text-[10px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />

            <span className="font-semibold text-[#163d5c]">
              Audit Log
            </span>
          </div>

          {/* PAGE TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Audit Log
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Review immutable inventory, allocation, dispatch, transfer, and procurement decisions.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => setShowRetention(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700 hover:bg-slate-50"
              >
                Retention policy
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Download size={15} />
                Export
              </button>
            </div>
          </section>

          {/* READ ONLY NOTICE */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-300 border-l-[3px] border-l-slate-500 bg-slate-50 px-4 py-4">

            <div className="flex items-center gap-3">
              <ShieldCheck
                size={21}
                className="shrink-0 text-slate-600"
              />

              <div>
                <p className="text-[10px] font-bold text-slate-700">
                  Read-only accountability records
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Audit events cannot be edited or removed from the Resource Manager workspace.
                </p>
              </div>
            </div>

            <p className="text-[9px] text-slate-500">
              Retention: 7 years
            </p>
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="flex flex-wrap gap-2">

            {/* SEARCH */}
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search event, actor, record, or rationale..."
                className="w-full py-3 text-xs outline-none"
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={15} className="text-slate-400" />
                </button>
              )}
            </div>

            {/* ACTION TYPE */}
            <select
              value={actionFilter}
              onChange={e => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All action types</option>
              <option>Approval</option>
              <option>Dispatch</option>
              <option>Inventory</option>
              <option>Procurement</option>
              <option>Verification</option>
              <option>Transfer</option>
            </select>

            {/* USER */}
            <select
              value={userFilter}
              onChange={e => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All users</option>
              <option>Daniel Perera</option>
              <option>Maya Silva</option>
            </select>

            {/* RECORD TYPE */}
            <select
              value={recordFilter}
              onChange={e => {
                setRecordFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
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
            </select>

            {/* DATE RANGE */}
            <select
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All dates</option>
              <option>Today</option>
              <option>Last 7 days</option>
            </select>

            <button
              onClick={() => setShowMoreFilters(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-sky-700 hover:bg-slate-50"
            >
              <Filter size={15} />
              More filters
            </button>
          </section>

          {/* AUDIT TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">

                <thead className="bg-slate-50 text-[10px] text-slate-500">
                  <tr>
                    <th className="px-3 py-4 font-semibold">
                      Event ID
                    </th>

                    <th className="px-3 py-4 font-semibold">
                      Action
                    </th>

                    <th className="px-3 py-4 font-semibold">
                      Actor
                    </th>

                    <th className="px-3 py-4 font-semibold">
                      Timestamp
                    </th>

                    <th className="px-3 py-4 font-semibold">
                      Record
                    </th>

                    <th className="px-3 py-4 font-semibold">
                      Change
                    </th>

                    <th className="px-3 py-4 font-semibold">
                      Rationale
                    </th>

                    <th className="px-3 py-4" />
                  </tr>
                </thead>

                <tbody>
                  {displayedRecords.map(record => (
                    <tr
                      key={record.id}
                      className="border-t border-slate-100 text-[11px] hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-3 py-4 font-bold text-slate-800">
                        {record.id}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {record.action}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {record.actor}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {record.timestamp}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-600">
                        {record.record}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {record.change}
                      </td>

                      <td className="px-3 py-4">
                        <span className="inline-block whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">
                          {record.rationale}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          aria-label={`View ${record.id}`}
                        >
                          <ChevronRight
                            size={19}
                            className="text-slate-500 hover:text-sky-700"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {displayedRecords.length === 0 && (
                <div className="p-12 text-center">
                  <FileText
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No audit records found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or filters.
                  </p>

                  <button
                    onClick={resetFilters}
                    className="mt-4 text-xs font-semibold text-sky-700"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredRecords.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –
                {Math.min(
                  safePage * pageSize,
                  filteredRecords.length
                )}
                {" "}of {filteredRecords.length.toLocaleString()}
                {" "}records
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage(p => Math.max(1, p - 1))
                  }
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-[10px] ${
                      safePage === page
                        ? "border-sky-700 bg-sky-700 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER INFORMATION */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <p className="flex items-center gap-2">
              <LockKeyhole size={13} />
              Audit records are read-only and protected.
            </p>

            <p>Retention policy: 7 years</p>
          </div>
        </div>
      </main>

      {/* AUDIT DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Audit Record Details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedRecord.id}
                </p>
              </div>

              <button onClick={() => setSelectedRecord(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sky-700">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedRecord.action}
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Immutable accountability record
                </p>
              </div>
            </div>

            {[
              ["Event ID", selectedRecord.id],
              ["Action", selectedRecord.action],
              ["Actor", selectedRecord.actor],
              ["Timestamp", selectedRecord.timestamp],
              ["Record ID", selectedRecord.record],
              ["Record Type", selectedRecord.recordType],
              ["Action Type", selectedRecord.actionType],
              ["Change", selectedRecord.change],
              ["Rationale", selectedRecord.rationale]
            ].map(([label, value]) => (
              <div
                key={label}
                className="mb-2 rounded-lg bg-slate-50 p-3"
              >
                <p className="text-[10px] text-slate-400">
                  {label}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            ))}

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-[10px] text-slate-500">
              <LockKeyhole size={15} />
              This record cannot be edited or deleted.
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-4 w-full rounded-lg bg-[#287ba5] py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RETENTION POLICY MODAL */}
      {showRetention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Retention Policy
              </h3>

              <button onClick={() => setShowRetention(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50 p-4">
              <ShieldCheck size={25} className="text-sky-700" />

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Audit data protection
                </p>

                <p className="text-[10px] text-slate-500">
                  Read-only accountability records
                </p>
              </div>
            </div>

            {[
              ["Retention period", "7 years"],
              ["Record editing", "Not permitted"],
              ["Record deletion", "Not permitted"],
              ["Export access", "Authorized users"],
              ["Record security", "Protected audit history"]
            ].map(([label, value]) => (
              <div
                key={label}
                className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
              >
                <span className="text-[10px] text-slate-500">
                  {label}
                </span>

                <span className="text-[10px] font-bold text-slate-700">
                  {value}
                </span>
              </div>
            ))}

            <button
              onClick={() => setShowRetention(false)}
              className="mt-4 w-full rounded-lg bg-[#287ba5] py-3 text-xs font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MORE FILTERS MODAL */}
      {showMoreFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                More Filters
              </h3>

              <button onClick={() => setShowMoreFilters(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">

              <label className="block text-xs font-semibold">
                Action Type

                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                >
                  <option>All action types</option>
                  <option>Approval</option>
                  <option>Dispatch</option>
                  <option>Inventory</option>
                  <option>Procurement</option>
                  <option>Verification</option>
                  <option>Transfer</option>
                </select>
              </label>

              <label className="block text-xs font-semibold">
                User

                <select
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                >
                  <option>All users</option>
                  <option>Daniel Perera</option>
                  <option>Maya Silva</option>
                </select>
              </label>

              <label className="block text-xs font-semibold">
                Record Type

                <select
                  value={recordFilter}
                  onChange={e => setRecordFilter(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                >
                  <option>All record types</option>
                  <option>Allocation</option>
                  <option>Dispatch</option>
                  <option>Resource</option>
                  <option>Transfer</option>
                  <option>Purchase Order</option>
                  <option>Supplier</option>
                  <option>Request</option>
                </select>
              </label>

              <label className="block text-xs font-semibold">
                Date Range

                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                >
                  <option>All dates</option>
                  <option>Today</option>
                  <option>Last 7 days</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-between gap-2">

              <button
                onClick={resetFilters}
                className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold text-slate-600"
              >
                <RotateCcw size={14} />
                Reset
              </button>

              <button
                onClick={() => {
                  setCurrentPage(1);
                  setShowMoreFilters(false);
                }}
                className="rounded-lg bg-[#287ba5] px-5 py-2.5 text-xs font-semibold text-white"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
