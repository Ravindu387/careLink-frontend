
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type Allocation = {
  id: string;
  request: string;
  resource: string;
  quantity: string;
  source: string;
  destination: string;
  approvedBy: string;
  approvedAt: string;
  status: "Partially Allocated" | "Allocated" | "Released" | "Completed" | "Pending";
  warehouse: string;
};

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

const tabs = [
  "All",
  "Needs action",
  "Active",
  "Completed",
  "Exceptions",
];

const statusStyles: Record<string, string> = {
  "Partially Allocated": "bg-sky-50 text-sky-700",
  Allocated: "bg-blue-50 text-blue-700",
  Released: "bg-slate-100 text-slate-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
};

export default function AllocationPage() {
  const [allocations, setAllocations] = useState(initialAllocations);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const [destination, setDestination] = useState("All destinations");
  const [status, setStatus] = useState("All allocation states");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] =
    useState<Allocation | null>(null);

  const [newAllocation, setNewAllocation] = useState({
    request: "",
    resource: "",
    quantity: "",
    source: "Central Hub",
    destination: "",
  });

  const pageSize = 4;

  // Search and filters
  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      const searchMatch =
        `${item.id} ${item.request} ${item.resource} ${item.destination} ${item.source}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const warehouseMatch =
        warehouse === "All warehouses" ||
        item.warehouse === warehouse;

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
  const handleCreateAllocation = (
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

    const allocation: Allocation = {
      id: `AL-${String(Date.now()).slice(-4)}`,
      request: newAllocation.request,
      resource: newAllocation.resource,
      quantity: newAllocation.quantity,
      source: newAllocation.source,
      destination: newAllocation.destination,
      approvedBy: "Pending Approval",
      approvedAt: "Just now",
      status: "Pending",
      warehouse: newAllocation.source,
    };

    setAllocations((previous) => [allocation, ...previous]);

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col bg-[#123e60] text-white lg:flex">

        {/* Logo */}
        <div className="flex h-[70px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#58b8a5] text-2xl text-[#123e60]">
            ◈
          </div>

          <div>
            <h1 className="text-lg font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">
              Resource Management
            </p>
          </div>
        </div>

        {/* Active Operation */}
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active Operation
          </div>

          <p className="mt-2 text-xs font-bold">
            Monsoon Floods 2025
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Greater Riverton - Level 4
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const selected = item.label === "Allocations";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!selected) {
                    window.alert(
                      `${item.label} page is not connected yet.`
                    );
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] transition ${
                  selected
                    ? "border-l-[3px] border-[#58b8a5] bg-[#287ba5] font-bold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <span className="w-4 text-center text-lg">
                  {item.icon}
                </span>

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

        {/* User */}
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
              <p className="text-[9px] uppercase text-slate-400">
                Primary Hub
              </p>
              <p className="text-[10px] font-bold">
                Central Logistics Hub
              </p>
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
                <p className="text-[9px] text-slate-400">
                  Resource Manager
                </p>
              </div>
            </div>

            <span className="hidden text-xl text-slate-500 sm:block">
              ›
            </span>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">

          {/* PAGE HEADING */}
          <section className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="mb-6 text-[10px] text-slate-400">
                Resource Operations
                <span className="mx-2">›</span>
                <span className="font-bold text-slate-700">
                  Allocations
                </span>
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Allocations
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Reserve and release verified stock against approved operational requests.
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
                + Create Allocation
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
                icon: "⬡",
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Awaiting action",
                value: awaitingCount,
                note: "Assigned to your team",
                icon: "◷",
                style: "bg-amber-50 text-amber-600",
              },
              {
                title: "Completed today",
                value: completedCount,
                note: "All audit recorded",
                icon: "✓",
                style: "bg-emerald-50 text-emerald-600",
              },
              {
                title: "Exceptions",
                value: exceptionCount,
                note: "Require review",
                icon: "⚠",
                style: "bg-red-50 text-red-600",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${card.style}`}
                >
                  {card.icon}
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">
                    {card.title}
                  </p>

                  <h3 className="text-2xl font-bold text-slate-800">
                    {card.value}
                  </h3>

                  <p className="text-[9px] text-slate-400">
                    {card.note}
                  </p>
                </div>
              </div>
            ))}
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
                      48
                    </span>
                  )}

                  {tab === "Needs action" && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px]">
                      7
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
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_repeat(3,minmax(130px,auto))_auto]">

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-xl text-slate-400">⌕</span>

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search allocations..."
                className="w-full text-xs outline-none"
              />
            </div>

            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
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
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ⚑ More filters
            </button>
          </section>

          {/* ALLOCATIONS TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">

                <thead className="bg-slate-50 text-[9px] text-slate-500">
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
                      "",
                    ].map((heading, index) => (
                      <th
                        key={index}
                        className="px-3 py-4 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {displayedAllocations.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 text-[10px] transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-800">
                        {item.id}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {item.request}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {item.resource}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {item.source}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {item.destination}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {item.approvedBy}
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-slate-600">
                        {item.approvedAt}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold ${statusStyles[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          title="View allocation details"
                          onClick={() => setSelectedAllocation(item)}
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

            {displayedAllocations.length === 0 && (
              <div className="p-10 text-center text-xs text-slate-400">
                No allocations found. Try changing your filters.
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

              <p className="text-[10px] text-slate-400">
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
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
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

      {/* CREATE ALLOCATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleCreateAllocation}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  Create Allocation
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter allocation information below.
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
              <label className="mb-1 block text-xs font-medium">
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
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Resource
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
                placeholder="Enter resource name"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
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
                placeholder="Example: 100 units"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
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
                className="w-full rounded-lg border p-3 text-sm"
              >
                <option>Central Hub</option>
                <option>West Depot</option>
                <option>Eastbank</option>
                <option>North Hub</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Destination
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
                placeholder="Enter destination"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
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
                Create Allocation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALLOCATION DETAILS MODAL */}
      {selectedAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Allocation Details
              </h3>

              <button
                onClick={() => setSelectedAllocation(null)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            {[
              ["Allocation ID", selectedAllocation.id],
              ["Request ID", selectedAllocation.request],
              ["Resource", selectedAllocation.resource],
              ["Quantity", selectedAllocation.quantity],
              ["Source", selectedAllocation.source],
              ["Destination", selectedAllocation.destination],
              ["Approved By", selectedAllocation.approvedBy],
              ["Approved At", selectedAllocation.approvedAt],
              ["Status", selectedAllocation.status],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg bg-slate-50 p-3"
              >
                <p className="text-[10px] text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {value}
                </p>
              </div>
            ))}

            <button
              onClick={() => setSelectedAllocation(null)}
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
