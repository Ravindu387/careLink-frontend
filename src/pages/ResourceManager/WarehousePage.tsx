
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type Warehouse = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  utilisation: number;
  stockLines: number;
  staff: number;
  status: "Operational" | "Near Capacity" | "Under Maintenance";
};

const initialWarehouses: Warehouse[] = [
  { id: "WH-001", name: "Central Logistics Hub", location: "Central Ward", capacity: 8420, utilisation: 78, stockLines: 1284, staff: 24, status: "Operational" },
  { id: "WH-004", name: "North District Hub", location: "North District", capacity: 4800, utilisation: 91, stockLines: 684, staff: 16, status: "Near Capacity" },
  { id: "WH-007", name: "Eastbank Warehouse", location: "Eastbank", capacity: 3600, utilisation: 62, stockLines: 342, staff: 11, status: "Operational" },
  { id: "WH-012", name: "West Coast Depot", location: "West District", capacity: 5200, utilisation: 48, stockLines: 520, staff: 14, status: "Operational" },
  { id: "WH-015", name: "South Emergency Store", location: "South District", capacity: 2800, utilisation: 85, stockLines: 410, staff: 9, status: "Near Capacity" },
  { id: "WH-018", name: "Riverside Storage", location: "Riverside", capacity: 4200, utilisation: 55, stockLines: 360, staff: 12, status: "Operational" },
  { id: "WH-021", name: "Emergency Medical Store", location: "Central Ward", capacity: 1900, utilisation: 35, stockLines: 220, staff: 8, status: "Under Maintenance" },
  { id: "WH-025", name: "Eastern Relief Centre", location: "East District", capacity: 3100, utilisation: 67, stockLines: 290, staff: 10, status: "Operational" },
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

const statusStyles: Record<string, string> = {
  Operational: "bg-emerald-50 text-emerald-700",
  "Near Capacity": "bg-amber-50 text-amber-700",
  "Under Maintenance": "bg-red-50 text-red-700",
};

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [capacityState, setCapacityState] = useState("All capacity states");
  const [status, setStatus] = useState("All statuses");

  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<Warehouse | null>(null);

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    capacity: "1000",
    staff: "5",
  });

  const pageSize = 4;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  // Filter warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const searchMatch =
        `${warehouse.id} ${warehouse.name} ${warehouse.location}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const districtMatch =
        district === "All districts" ||
        warehouse.location === district;

      const capacityMatch =
        capacityState === "All capacity states" ||
        (capacityState === "Normal" && warehouse.utilisation < 85) ||
        (capacityState === "Near Capacity" && warehouse.utilisation >= 85);

      const statusMatch =
        status === "All statuses" ||
        warehouse.status === status;

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          (warehouse.utilisation >= 85 ||
            warehouse.status === "Under Maintenance")) ||
        (activeTab === "Active" &&
          warehouse.status === "Operational") ||
        (activeTab === "Completed" &&
          warehouse.status === "Operational") ||
        (activeTab === "Exceptions" &&
          warehouse.status === "Under Maintenance");

      return searchMatch && districtMatch &&
        capacityMatch && statusMatch && tabMatch;
    });
  }, [warehouses, search, district, capacityState, status, activeTab]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWarehouses.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const displayedWarehouses = filteredWarehouses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Statistics
  const averageUtilisation = warehouses.length
    ? Math.round(
        warehouses.reduce((sum, item) => sum + item.utilisation, 0) /
        warehouses.length
      )
    : 0;

  const nearCapacityCount = warehouses.filter(
    (item) => item.utilisation >= 85
  ).length;

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setDistrict("All districts");
    setCapacityState("All capacity states");
    setStatus("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Add warehouse
  const handleAddWarehouse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const capacity = Number(newWarehouse.capacity);
    const staff = Number(newWarehouse.staff);

    if (
      !newWarehouse.name.trim() ||
      !newWarehouse.location.trim() ||
      !Number.isFinite(capacity) ||
      capacity <= 0 ||
      !Number.isInteger(staff) ||
      staff < 0
    ) return;

    const warehouse: Warehouse = {
      id: `WH-${String(Date.now()).slice(-3)}`,
      name: newWarehouse.name.trim(),
      location: newWarehouse.location.trim(),
      capacity,
      utilisation: 0,
      stockLines: 0,
      staff,
      status: "Operational",
    };

    setWarehouses((previous) => [...previous, warehouse]);

    setNewWarehouse({
      name: "",
      location: "",
      capacity: "1000",
      staff: "5",
    });

    setShowAddModal(false);
    resetFilters();
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      "Warehouse ID",
      "Warehouse",
      "Location",
      "Capacity",
      "Utilisation",
      "Stock Lines",
      "Staff",
      "Status",
    ];

    const rows = filteredWarehouses.map((item) => [
      item.id,
      item.name,
      item.location,
      item.capacity,
      `${item.utilisation}%`,
      item.stockLines,
      item.staff,
      item.status,
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
    link.download = "warehouse-report.csv";
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
            const selected = item.label === "Warehouses";

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

        {/* User profile */}
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
                  Warehouses
                </span>
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Warehouses
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Monitor storage capacity, stock coverage, staffing, and warehouse operations.
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
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-[#267da5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#17658b]"
              >
                + Add Warehouse
              </button>
            </div>
          </section>

          {/* STATISTICS CARDS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Operational sites",
                value: warehouses.length,
                note: "Across 6 districts",
                icon: "⌂",
                style: "bg-emerald-50 text-emerald-700",
              },
              {
                title: "Average utilisation",
                value: `${averageUtilisation}%`,
                note: "North Hub at 91%",
                icon: "⌁",
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Receiving today",
                value: "8",
                note: "14,200 total units",
                icon: "▤",
                style: "bg-sky-50 text-sky-700",
              },
              {
                title: "Capacity alerts",
                value: nearCapacityCount,
                note: "Require rebalancing",
                icon: "⚠",
                style: "bg-amber-50 text-amber-600",
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
                  className={`relative flex items-center gap-1.5 pb-4 text-[10px] transition ${
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
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(125px,auto))_auto]">

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-xl text-slate-400">⌕</span>

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search warehouses..."
                className="w-full text-xs outline-none"
              />
            </div>

            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All districts</option>
              {[
                "Central Ward",
                "North District",
                "Eastbank",
                "West District",
                "South District",
                "Riverside",
                "East District",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              value={capacityState}
              onChange={(e) => {
                setCapacityState(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All capacity states</option>
              <option>Normal</option>
              <option>Near Capacity</option>
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
              <option>Operational</option>
              <option>Near Capacity</option>
              <option>Under Maintenance</option>
            </select>

            <button
              onClick={resetFilters}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ⚑ More filters
            </button>
          </section>

          {/* WAREHOUSE TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50 text-[9px] text-slate-500">
                  <tr>
                    {[
                      "Warehouse ID",
                      "Warehouse",
                      "Location",
                      "Capacity",
                      "Utilisation",
                      "Stock Lines",
                      "Staff",
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
                  {displayedWarehouses.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      className="border-t border-slate-100 text-[10px] transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-800">
                        {warehouse.id}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {warehouse.name}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {warehouse.location}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {formatNumber(warehouse.capacity)} m²
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">
                            {warehouse.utilisation}%
                          </span>

                          <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-slate-100 sm:block">
                            <div
                              className={`h-full rounded-full ${
                                warehouse.utilisation >= 85
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${warehouse.utilisation}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {formatNumber(warehouse.stockLines)}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {warehouse.staff}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold ${statusStyles[warehouse.status]}`}>
                          {warehouse.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          title="View warehouse details"
                          onClick={() => setSelectedWarehouse(warehouse)}
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

            {displayedWarehouses.length === 0 && (
              <div className="p-10 text-center text-xs text-slate-400">
                No warehouses found. Try changing your search or filters.
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredWarehouses.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –
                {Math.min(safePage * pageSize, filteredWarehouses.length)}
                {" "}of {filteredWarehouses.length}
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
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
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
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

      {/* ADD WAREHOUSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleAddWarehouse}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  Add New Warehouse
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the warehouse details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Warehouse Name
              </label>

              <input
                required
                value={newWarehouse.name}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    name: e.target.value,
                  })
                }
                placeholder="Enter warehouse name"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Location / District
              </label>

              <input
                required
                value={newWarehouse.location}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    location: e.target.value,
                  })
                }
                placeholder="Enter location"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Storage Capacity (m²)
              </label>

              <input
                required
                type="number"
                min="1"
                value={newWarehouse.capacity}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    capacity: e.target.value,
                  })
                }
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Number of Staff
              </label>

              <input
                required
                type="number"
                min="0"
                step="1"
                value={newWarehouse.staff}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    staff: e.target.value,
                  })
                }
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800"
              >
                Save Warehouse
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WAREHOUSE DETAILS MODAL */}
      {selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Warehouse Details
              </h3>

              <button
                onClick={() => setSelectedWarehouse(null)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            {[
              ["Warehouse ID", selectedWarehouse.id],
              ["Warehouse Name", selectedWarehouse.name],
              ["Location", selectedWarehouse.location],
              ["Capacity", `${formatNumber(selectedWarehouse.capacity)} m²`],
              ["Utilisation", `${selectedWarehouse.utilisation}%`],
              ["Stock Lines", String(selectedWarehouse.stockLines)],
              ["Staff", String(selectedWarehouse.staff)],
              ["Status", selectedWarehouse.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}

            <button
              onClick={() => setSelectedWarehouse(null)}
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

