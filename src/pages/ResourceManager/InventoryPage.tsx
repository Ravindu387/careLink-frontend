
import { useMemo, useState } from "react";

type InventoryItem = {
  id: string;
  resource: string;
  category: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  inTransit: number;
  available: number;
  status: "Healthy" | "Low Stock" | "Critical";
};

const initialInventory: InventoryItem[] = [
  { id: "RES-00128", resource: "Drinking Water - 10L", category: "Food & Water", warehouse: "Central Logistics Hub", onHand: 8420, reserved: 3100, inTransit: 2500, available: 2820, status: "Healthy" },
  { id: "RES-00241", resource: "Family Food Pack", category: "Food & Water", warehouse: "North District Hub", onHand: 1284, reserved: 940, inTransit: 250, available: 94, status: "Low Stock" },
  { id: "RES-00314", resource: "Emergency Shelter Kit", category: "Shelter", warehouse: "Eastbank Warehouse", onHand: 342, reserved: 218, inTransit: 76, available: 48, status: "Healthy" },
  { id: "RES-00402", resource: "Trauma Medical Kit", category: "Medical", warehouse: "Central Logistics Hub", onHand: 86, reserved: 64, inTransit: 18, available: 4, status: "Critical" },
  { id: "RES-00518", resource: "Hygiene Kit", category: "WASH", warehouse: "West Coast Depot", onHand: 2450, reserved: 1220, inTransit: 600, available: 630, status: "Healthy" },
  { id: "RES-00610", resource: "Thermal Blanket", category: "Non-food Item", warehouse: "North District Hub", onHand: 520, reserved: 412, inTransit: 90, available: 18, status: "Low Stock" },
  { id: "RES-00721", resource: "Diesel Fuel", category: "Transport & Fuel", warehouse: "West Coast Depot", onHand: 1800, reserved: 1500, inTransit: 100, available: 200, status: "Critical" },
  { id: "RES-00832", resource: "Emergency Tent", category: "Shelter", warehouse: "Eastbank Warehouse", onHand: 680, reserved: 210, inTransit: 100, available: 370, status: "Healthy" },
  { id: "RES-00915", resource: "First Aid Kit", category: "Medical", warehouse: "Central Logistics Hub", onHand: 340, reserved: 180, inTransit: 40, available: 120, status: "Healthy" },
];

const navigation = [
  { icon: "▦", label: "Resource Dashboard" },
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

const statusClasses: Record<string, string> = {
  Healthy: "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  Critical: "bg-red-50 text-red-700",
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const [stockStatus, setStockStatus] = useState("All stock states");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    resource: "",
    category: "Food & Water",
    warehouse: "Central Logistics Hub",
    onHand: "100",
  });

  const pageSize = 6;

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        `${item.id} ${item.resource} ${item.category} ${item.warehouse}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All categories" || item.category === category;

      const matchesWarehouse =
        warehouse === "All warehouses" || item.warehouse === warehouse;

      const matchesStatus =
        stockStatus === "All stock states" || item.status === stockStatus;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" && item.status !== "Healthy") ||
        (activeTab === "Active" && item.status === "Healthy") ||
        (activeTab === "Completed" && item.available > 0) ||
        (activeTab === "Exceptions" && item.status === "Critical");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [inventory, search, category, warehouse, stockStatus, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const displayedItems = filteredInventory.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const formatNumber = (number: number) =>
    new Intl.NumberFormat("en-US").format(number);

  const resetFilters = () => {
    setSearch("");
    setCategory("All categories");
    setWarehouse("All warehouses");
    setStockStatus("All stock states");
    setActiveTab("All");
    setCurrentPage(1);
  };

  const exportInventory = () => {
    const headers = [
      "Resource ID", "Resource", "Category", "Warehouse",
      "On Hand", "Reserved", "In Transit", "Available", "Status",
    ];

    const rows = filteredInventory.map((item) => [
      item.id, item.resource, item.category, item.warehouse,
      item.onHand, item.reserved, item.inTransit, item.available, item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const addResource = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const quantity = Number(newResource.onHand);
    if (!newResource.resource.trim() || !Number.isFinite(quantity) || quantity < 0) return;

    const item: InventoryItem = {
      id: `RES-${String(Date.now()).slice(-5)}`,
      resource: newResource.resource.trim(),
      category: newResource.category,
      warehouse: newResource.warehouse,
      onHand: quantity,
      reserved: 0,
      inTransit: 0,
      available: quantity,
      status: quantity <= 10 ? "Critical" : quantity <= 100 ? "Low Stock" : "Healthy",
    };

    setInventory((previous) => [item, ...previous]);
    setNewResource({
      resource: "",
      category: "Food & Water",
      warehouse: "Central Logistics Hub",
      onHand: "100",
    });
    setShowAddForm(false);
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-800">

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col bg-[#123e60] text-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#58b8a5] text-2xl text-[#123e60]">
            ◈
          </div>
          <div>
            <h1 className="text-lg font-bold">ReliefOS</h1>
            <p className="text-xs text-sky-200">Resource Management</p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active Operation
          </div>
          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-[10px] text-sky-200">
            Greater Riverton - Level 4
          </p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const selected = item.label === "Inventory";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.label !== "Inventory") {
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

      {/* Main content */}
      <main className="min-h-screen lg:ml-[280px]">

        {/* Header */}
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
            <button className="hidden rounded-lg border p-2.5 text-slate-600 sm:block">♢</button>
            <button className="relative rounded-lg border p-2.5 text-slate-600">
              ♧
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">9</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">DP</div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold">Daniel P.</p>
                <p className="text-[9px] text-slate-400">Resource Manager</p>
              </div>
            </div>
            <span className="hidden text-xl text-slate-500 sm:block">›</span>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">

          {/* Breadcrumb and heading */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-6 text-[10px] text-slate-400">
                Resource Operations <span className="mx-2">›</span>
                <span className="font-bold text-slate-700">Inventory</span>
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Inventory
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Track available, reserved, in-transit, and usable stock across all storage locations.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportInventory}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ↓ Export
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-lg bg-[#267da5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#17658b]"
              >
                + Add Resource
              </button>
            </div>
          </section>

          {/* Statistics cards */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Total SKUs", value: "1,284", note: "Across 12 locations", icon: "⬡", style: "bg-sky-50 text-sky-700" },
              { title: "Low stock", value: "18", note: "6 require action", icon: "⚠", style: "bg-amber-50 text-amber-600" },
              { title: "Out of stock", value: "3", note: "Critical medical items", icon: "△", style: "bg-red-50 text-red-600" },
              { title: "Expiring soon", value: "42", note: "Within 30 days", icon: "▦", style: "bg-amber-50 text-amber-600" },
            ].map((card) => (
              <div key={card.title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

          {/* Tabs */}
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
                      72
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

          {/* Search and filters */}
          <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(125px,auto))_auto]">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-xl text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search inventory..."
                className="w-full text-xs outline-none"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All categories</option>
              {["Food & Water", "Shelter", "Medical", "WASH", "Non-food Item", "Transport & Fuel"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All warehouses</option>
              {["Central Logistics Hub", "North District Hub", "Eastbank Warehouse", "West Coast Depot"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All stock states</option>
              {["Healthy", "Low Stock", "Critical"].map((v) => (
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

          {/* Inventory table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 text-[9px] text-slate-500">
                  <tr>
                    {[
                      "Resource ID", "Resource", "Category", "Warehouse",
                      "On Hand", "Reserved", "In Transit", "Available", "Status", "",
                    ].map((heading, index) => (
                      <th key={index} className="px-3 py-4 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {displayedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 text-[10px] transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-800">{item.id}</td>
                      <td className="px-3 py-4 text-slate-600">{item.resource}</td>
                      <td className="px-3 py-4 text-slate-600">{item.category}</td>
                      <td className="px-3 py-4 text-slate-600">{item.warehouse}</td>
                      <td className="px-3 py-4 text-slate-600">{formatNumber(item.onHand)}</td>
                      <td className="px-3 py-4 text-slate-600">{formatNumber(item.reserved)}</td>
                      <td className="px-3 py-4 text-slate-600">{formatNumber(item.inTransit)}</td>
                      <td className="px-3 py-4 font-medium text-slate-700">{formatNumber(item.available)}</td>
                      <td className="px-3 py-4">
                        <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold ${statusClasses[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          title={`View ${item.resource}`}
                          onClick={() => window.alert(`${item.resource}\nResource ID: ${item.id}\nAvailable: ${item.available}`)}
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

            {displayedItems.length === 0 && (
              <div className="p-10 text-center text-xs text-slate-400">
                No inventory items found. Try changing your search or filters.
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                Showing {filteredInventory.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filteredInventory.length)} of {filteredInventory.length}
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
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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

      {/* Add Resource Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={addResource}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Add New Resource</h3>
                <p className="mt-1 text-xs text-slate-500">Enter the resource information below.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xl text-slate-400"
              >
                ×
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Resource Name</label>
              <input
                required
                value={newResource.resource}
                onChange={(e) => setNewResource({ ...newResource, resource: e.target.value })}
                placeholder="Enter resource name"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select
                value={newResource.category}
                onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                className="w-full rounded-lg border p-3 text-sm"
              >
                {["Food & Water", "Shelter", "Medical", "WASH", "Non-food Item", "Transport & Fuel"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Warehouse</label>
              <select
                value={newResource.warehouse}
                onChange={(e) => setNewResource({ ...newResource, warehouse: e.target.value })}
                className="w-full rounded-lg border p-3 text-sm"
              >
                {["Central Logistics Hub", "North District Hub", "Eastbank Warehouse", "West Coast Depot"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Quantity</label>
              <input
                required
                type="number"
                min="0"
                value={newResource.onHand}
                onChange={(e) => setNewResource({ ...newResource, onHand: e.target.value })}
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800"
              >
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
