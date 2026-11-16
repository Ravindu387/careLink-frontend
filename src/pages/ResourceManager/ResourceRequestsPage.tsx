
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type Request = {
  id: string;
  unit: string;
  resource: string;
  quantity: string;
  priority: "Critical" | "High" | "Medium";
  category: string;
  source: string;
  age: string;
  status: "Awaiting Approval" | "Partially Available" | "Allocated" | "Processing" | "Fulfilled";
};

const initialRequests: Request[] = [
  { id: "RR-2841", unit: "North Ward Shelter Network", resource: "Drinking Water - 10L", quantity: "2,400 units", priority: "Critical", category: "Food & Water", source: "Central Hub", age: "18 min", status: "Awaiting Approval" },
  { id: "RR-2839", unit: "Medical Team 3", resource: "Trauma Medical Kit", quantity: "24 units", priority: "Critical", category: "Medical", source: "Central Hub", age: "34 min", status: "Partially Available" },
  { id: "RR-2836", unit: "Eastbank Community Centre", resource: "Family Food Pack", quantity: "500 units", priority: "High", category: "Food & Water", source: "North Hub", age: "49 min", status: "Awaiting Approval" },
  { id: "RR-2828", unit: "Mobility Response Team", resource: "Fuel - Diesel", quantity: "1,200 L", priority: "High", category: "Transport & Fuel", source: "West Depot", age: "1h 12m", status: "Allocated" },
  { id: "RR-2821", unit: "Riverton High Shelter", resource: "Thermal Blanket", quantity: "180 units", priority: "Medium", category: "Shelter", source: "North Hub", age: "2h 04m", status: "Processing" },
  { id: "RR-2818", unit: "Emergency Medical Unit", resource: "First Aid Kit", quantity: "60 units", priority: "High", category: "Medical", source: "Central Hub", age: "2h 30m", status: "Fulfilled" },
  { id: "RR-2815", unit: "South District Centre", resource: "Hygiene Kit", quantity: "300 units", priority: "Medium", category: "WASH", source: "West Depot", age: "3h 10m", status: "Awaiting Approval" },
];

const navigation = [
  { icon: "⬡", label: "Inventory" },
  { icon: "⌂", label: "Warehouses" },
  { icon: "▤", label: "Resource Requests", count: "18" },
  { icon: "♧", label: "Allocations", count: "7" },
  { icon: "▣", label: "Dispatch & Tracking", count: "12" },
  { icon: "⇄", label: "Stock Transfers" },
  { icon: "🛒", label: "Procurement" },
  { icon: "♙", label: "Suppliers" },
  { icon: "⚠", label: "Alerts", count: "9" },
  { icon: "⌁", label: "Reports & Analytics" },
  { icon: "◷", label: "Audit Log" },
  { icon: "⚙", label: "Settings" },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Exceptions"];

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-50 text-blue-700",
};

const statusStyles: Record<string, string> = {
  "Awaiting Approval": "bg-amber-50 text-amber-800",
  "Partially Available": "bg-slate-100 text-slate-700",
  Allocated: "bg-sky-50 text-sky-700",
  Processing: "bg-blue-50 text-blue-700",
  Fulfilled: "bg-emerald-50 text-emerald-700",
};

export default function ResourceRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [category, setCategory] = useState("All categories");
  const [requester, setRequester] = useState("All requesters");
  const [status, setStatus] = useState("All statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const [newRequest, setNewRequest] = useState({
    unit: "",
    resource: "",
    quantity: "100",
    priority: "Medium" as Request["priority"],
    category: "Food & Water",
  });

  const pageSize = 5;

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const searchMatch =
        `${item.id} ${item.unit} ${item.resource} ${item.source}`
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

  const openCount = requests.filter(
    (r) => r.status !== "Fulfilled"
  ).length;

  const approvalCount = requests.filter(
    (r) => r.status === "Awaiting Approval"
  ).length;

  const partialCount = requests.filter(
    (r) => r.status === "Partially Available"
  ).length;

  const fulfilledCount = requests.filter(
    (r) => r.status === "Fulfilled"
  ).length;

  const resetFilters = () => {
    setSearch("");
    setPriority("All priorities");
    setCategory("All categories");
    setRequester("All requesters");
    setStatus("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  const handleCreateRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newRequest.unit.trim() || !newRequest.resource.trim()) return;

    const request: Request = {
      id: `RR-${String(Date.now()).slice(-4)}`,
      unit: newRequest.unit.trim(),
      resource: newRequest.resource.trim(),
      quantity: `${newRequest.quantity} units`,
      priority: newRequest.priority,
      category: newRequest.category,
      source: "Pending Assignment",
      age: "Just now",
      status: "Awaiting Approval",
    };

    setRequests((previous) => [request, ...previous]);

    setNewRequest({
      unit: "",
      resource: "",
      quantity: "100",
      priority: "Medium",
      category: "Food & Water",
    });

    setShowCreateModal(false);
    resetFilters();
  };

  const handleExport = () => {
    const headers = [
      "Request ID", "Requesting Unit", "Resource", "Quantity",
      "Priority", "Category", "Suggested Source", "Age", "Status",
    ];

    const rows = filteredRequests.map((r) => [
      r.id, r.unit, r.resource, r.quantity,
      r.priority, r.category, r.source, r.age, r.status,
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
    link.download = "resource-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-800">

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col bg-[#123e60] text-white lg:flex">

        <div className="flex h-[70px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#58b8a5] text-2xl text-[#123e60]">
            ◈
          </div>
          <div>
            <h1 className="text-lg font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">Resource Management</p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active Operation
          </div>
          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-[10px] text-sky-200">Greater Riverton - Level 4</p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const selected = item.label === "Resource Requests";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!selected) {
                    window.alert(`${item.label} page is not connected yet.`);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] transition ${
                  selected
                    ? "border-l-[3px] border-[#58b8a5] bg-[#287ba5] font-bold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <span className="w-4 text-center text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold">
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
          <span>›</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[280px]">

        {/* HEADER */}
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">

          <div className="flex w-full max-w-[470px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-xl text-slate-400">⌕</span>
            <input
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />
            <span className="rounded border bg-white px-2 py-1 text-[9px] text-slate-400">
              ⌘ K
            </span>
          </div>

          <div className="ml-4 flex shrink-0 items-center gap-3 sm:gap-5">
            <div className="hidden text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">Primary Hub</p>
              <p className="text-[10px] font-bold">Central Logistics Hub</p>
            </div>

            <button className="hidden rounded-lg border p-2.5 text-slate-600 sm:block">
              ♢
            </button>

            <button className="relative rounded-lg border p-2.5 text-slate-600">
              ♧
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                9
              </span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">
                DP
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold">Daniel P.</p>
                <p className="text-[9px] text-slate-400">Resource Manager</p>
              </div>
            </div>
            <span className="hidden text-xl text-slate-500 sm:block">›</span>
          </div>
        </header>

        <div className="space-y-5 p-4 sm:p-6 lg:p-7">

          {/* PAGE HEADING */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-6 text-[10px] text-slate-400">
                Resource Operations <span className="mx-2">›</span>
                <span className="font-bold text-slate-700">Resource Requests</span>
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Resource Requests
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Assess operational demand, source available stock, and authorise fulfilment.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ↓ Export
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg bg-[#267da5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#17658b]"
              >
                + Create Request
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
                icon: "▤",
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Awaiting approval",
                value: approvalCount,
                note: "Oldest is 49 min",
                icon: "◷",
                style: "bg-amber-50 text-amber-600",
              },
              {
                title: "Partially available",
                value: partialCount,
                note: "Sourcing required",
                icon: "⬡",
                style: "bg-red-50 text-red-600",
              },
              {
                title: "Fulfilled today",
                value: fulfilledCount,
                note: "93.8% service level",
                icon: "✓",
                style: "bg-emerald-50 text-emerald-600",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${card.style}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-[9px] text-slate-400">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                  <p className="text-[9px] text-slate-400">{card.note}</p>
                </div>
              </div>
            ))}
          </section>

          {/* WORKFLOW ALERT */}
          <section className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50/70 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-sky-800">
              ♢
            </div>
            <div>
              <p className="text-[10px] font-bold text-sky-900">
                Controlled allocation workflow
              </p>
              <p className="mt-1 text-[9px] text-slate-600">
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
                  className={`relative flex items-center gap-1.5 pb-4 text-[10px] ${
                    activeTab === tab
                      ? "font-bold text-sky-700"
                      : "text-slate-500 hover:text-sky-700"
                  }`}
                >
                  {tab}

                  {tab === "All" && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[8px] text-sky-700">
                      60
                    </span>
                  )}

                  {tab === "Needs action" && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px]">7</span>
                  )}

                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_repeat(4,minmax(110px,auto))_auto]">

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-xl text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search resource requests..."
                className="w-full text-xs outline-none"
              />
            </div>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All requesters</option>
              {[...new Set(requests.map((r) => r.unit))].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All statuses</option>
              {["Awaiting Approval", "Partially Available", "Allocated", "Processing", "Fulfilled"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ⚑ More filters
            </button>
          </section>

          {/* REQUESTS TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">

                <thead className="bg-slate-50 text-[9px] text-slate-500">
                  <tr>
                    {[
                      "Request",
                      "Requesting Unit",
                      "Resource",
                      "Quantity",
                      "Priority",
                      "Suggested Source",
                      "Age",
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
                  {displayedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-t border-slate-100 text-[10px] transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-800">
                        {request.id}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {request.unit}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {request.resource}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {request.quantity}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${priorityStyles[request.priority]}`}>
                          {request.priority}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {request.source}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {request.age}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold ${statusStyles[request.status]}`}>
                          {request.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          title="View request details"
                          className="text-xl text-slate-500 hover:text-sky-700"
                        >
                          ›
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayedRequests.length === 0 && (
              <div className="p-10 text-center text-xs text-slate-400">
                No resource requests found. Try changing your filters.
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
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-[10px] ${
                      safePage === page
                        ? "border-sky-700 bg-sky-700 font-bold text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* CREATE REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleCreateRequest}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Create Resource Request</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the request information below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Requesting Unit</label>
              <input
                required
                value={newRequest.unit}
                onChange={(e) => setNewRequest({ ...newRequest, unit: e.target.value })}
                placeholder="Enter requesting unit"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Resource</label>
              <input
                required
                value={newRequest.resource}
                onChange={(e) => setNewRequest({ ...newRequest, resource: e.target.value })}
                placeholder="Enter resource name"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select
                value={newRequest.category}
                onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                className="w-full rounded-lg border p-3 text-sm"
              >
                {["Food & Water", "Medical", "Shelter", "WASH", "Transport & Fuel"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Quantity</label>
              <input
                required
                type="number"
                min="1"
                value={newRequest.quantity}
                onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                className="w-full rounded-lg border p-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Priority</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as Request["priority"] })}
                className="w-full rounded-lg border p-3 text-sm"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            {[
              ["Request ID", selectedRequest.id],
              ["Requesting Unit", selectedRequest.unit],
              ["Resource", selectedRequest.resource],
              ["Quantity", selectedRequest.quantity],
              ["Category", selectedRequest.category],
              ["Priority", selectedRequest.priority],
              ["Suggested Source", selectedRequest.source],
              ["Age", selectedRequest.age],
              ["Status", selectedRequest.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full rounded-lg bg-sky-700 py-3 text-xs font-semibold text-white hover:bg-sky-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
