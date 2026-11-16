
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Plus,
  Download, Check, Filter, X, Menu, CalendarDays
} from "lucide-react";

type OrderStatus =
  | "Approved"
  | "In Transit"
  | "Awaiting Approval"
  | "Delivered"
  | "Rejected";

type PurchaseOrder = {
  id: string;
  supplier: string;
  items: string;
  quantity: string;
  value: string;
  type: "Emergency" | "Standard";
  deliveryDue: string;
  status: OrderStatus;
};

const initialOrders: PurchaseOrder[] = [
  {
    id: "PO-2025-184",
    supplier: "MediSupply International",
    items: "Trauma Medical Kits",
    quantity: "200 units",
    value: "$18,400",
    type: "Emergency",
    deliveryDue: "24 Jun 2025",
    status: "Approved"
  },
  {
    id: "PO-2025-181",
    supplier: "AquaSafe Ltd.",
    items: "Drinking Water - 10L",
    quantity: "10,000 units",
    value: "$12,800",
    type: "Emergency",
    deliveryDue: "23 Jun 2025",
    status: "In Transit"
  },
  {
    id: "PO-2025-174",
    supplier: "ShelterWorks Cooperative",
    items: "Shelter Kits",
    quantity: "500 units",
    value: "$42,500",
    type: "Standard",
    deliveryDue: "28 Jun 2025",
    status: "Awaiting Approval"
  },
  {
    id: "PO-2025-169",
    supplier: "Regional Food Services",
    items: "Family Food Packs",
    quantity: "4,000 units",
    value: "$31,200",
    type: "Standard",
    deliveryDue: "21 Jun 2025",
    status: "Delivered"
  },
  {
    id: "PO-2025-165",
    supplier: "MediSupply International",
    items: "First Aid Supplies",
    quantity: "300 units",
    value: "$9,500",
    type: "Emergency",
    deliveryDue: "29 Jun 2025",
    status: "Approved"
  },
  {
    id: "PO-2025-162",
    supplier: "AquaSafe Ltd.",
    items: "Water Purification Tablets",
    quantity: "2,000 packs",
    value: "$6,800",
    type: "Standard",
    deliveryDue: "30 Jun 2025",
    status: "In Transit"
  },
  {
    id: "PO-2025-158",
    supplier: "ShelterWorks Cooperative",
    items: "Thermal Blankets",
    quantity: "600 units",
    value: "$15,000",
    type: "Standard",
    deliveryDue: "20 Jun 2025",
    status: "Rejected"
  }
];

const navigation = [
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

const tabs = [
  "All",
  "Needs action",
  "Active",
  "Completed",
  "Exceptions"
];

const statusStyles: Record<OrderStatus, string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  "In Transit": "bg-sky-50 text-sky-700",
  "Awaiting Approval": "bg-amber-50 text-amber-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700"
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500";

export default function ProcurementPage() {
  const [orders, setOrders] = useState(initialOrders);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All suppliers");
  const [typeFilter, setTypeFilter] = useState("All procurement types");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    supplier: "",
    items: "",
    quantity: "",
    value: "",
    type: "Standard" as "Emergency" | "Standard",
    deliveryDue: ""
  });

  const pageSize = 4;

  // FILTER ORDERS
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = [
        order.id,
        order.supplier,
        order.items,
        order.quantity,
        order.value
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesSupplier =
        supplierFilter === "All suppliers" ||
        order.supplier === supplierFilter;

      const matchesType =
        typeFilter === "All procurement types" ||
        order.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        order.status === statusFilter;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          order.status === "Awaiting Approval") ||
        (activeTab === "Active" &&
          ["Approved", "In Transit"].includes(order.status)) ||
        (activeTab === "Completed" &&
          order.status === "Delivered") ||
        (activeTab === "Exceptions" &&
          order.status === "Rejected");

      return matchesSearch &&
        matchesSupplier &&
        matchesType &&
        matchesStatus &&
        matchesTab;
    });
  }, [
    orders,
    search,
    supplierFilter,
    typeFilter,
    statusFilter,
    activeTab
  ]);

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const displayedOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // STATISTICS
  const emergencyCount = orders.filter(
    o => o.type === "Emergency"
  ).length;

  const awaitingCount = orders.filter(
    o => o.status === "Awaiting Approval"
  ).length;

  const activeCount = orders.filter(
    o => ["Approved", "In Transit"].includes(o.status)
  ).length;

  const deliveredCount = orders.filter(
    o => o.status === "Delivered"
  ).length;

  const stats = [
    {
      title: "Open orders",
      value: 24 + orders.length - initialOrders.length,
      note: "$186K committed",
      icon: ShoppingCart,
      color: "bg-sky-50 text-sky-700"
    },
    {
      title: "Emergency orders",
      value: emergencyCount + 5,
      note: "Priority sourcing",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Due this week",
      value: 12,
      note: "3 arriving today",
      icon: CalendarDays,
      color: "bg-sky-50 text-sky-700"
    },
    {
      title: "Supplier fulfilment",
      value: "95.4%",
      note: "Rolling 90 days",
      icon: Check,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

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
  const handleCreateOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.supplier.trim() ||
      !formData.items.trim() ||
      !formData.quantity.trim() ||
      !formData.value.trim() ||
      !formData.deliveryDue
    ) return;

    const nextNumber =
      Math.max(
        ...orders.map(o => Number(o.id.split("-")[2])),
        184
      ) + 1;

    const newOrder: PurchaseOrder = {
      id: `PO-2025-${nextNumber}`,
      supplier: formData.supplier,
      items: formData.items,
      quantity: formData.quantity,
      value: formData.value.startsWith("$")
        ? formData.value
        : `$${formData.value}`,
      type: formData.type,
      deliveryDue: new Date(formData.deliveryDue).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short", year: "numeric" }
      ),
      status: "Awaiting Approval"
    };

    setOrders(prev => [newOrder, ...prev]);

    setFormData({
      supplier: "",
      items: "",
      quantity: "",
      value: "",
      type: "Standard",
      deliveryDue: ""
    });

    setShowCreateModal(false);
    resetFilters();
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
      "Status"
    ];

    const rows = filteredOrders.map(order => [
      order.id,
      order.supplier,
      order.items,
      order.quantity,
      order.value,
      order.type,
      order.deliveryDue,
      order.status
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
    link.download = "procurement-orders.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>

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
            const active = item.label === "Procurement";

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
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">

          {/* BREADCRUMB */}
          <div className="text-[10px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Procurement
            </span>
          </div>

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Procurement
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Manage emergency and planned purchasing from approval through receipt.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700 hover:bg-slate-50"
              >
                <Download size={15} />
                Export
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Plus size={16} />
                Create Purchase Order
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
              {tabs.map(tab => (
                <button
                  key={tab}
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

                  {tab === "All" && (
                    <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] text-sky-700">
                      48
                    </span>
                  )}

                  {tab === "Needs action" && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px]">
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
          <section className="flex flex-wrap gap-2">

            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search procurement..."
                className="w-full py-3 text-xs outline-none"
              />
            </div>

            <select
              value={supplierFilter}
              onChange={e => {
                setSupplierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All suppliers</option>

              {[...new Set(orders.map(o => o.supplier))].map(supplier => (
                <option key={supplier}>{supplier}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All procurement types</option>
              <option>Emergency</option>
              <option>Standard</option>
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
              {([
                "Approved",
                "In Transit",
                "Awaiting Approval",
                "Delivered",
                "Rejected"
              ] as OrderStatus[]).map(status => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-sky-700 hover:bg-slate-50"
            >
              <Filter size={15} />
              More filters
            </button>
          </section>

          {/* PURCHASE ORDER TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">

                <thead className="bg-slate-50 text-[10px] text-slate-500">
                  <tr>
                    {[
                      "Purchase Order",
                      "Supplier",
                      "Items",
                      "Quantity",
                      "Value",
                      "Procurement Type",
                      "Delivery Due",
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
                  {displayedOrders.map(order => (
                    <tr
                      key={order.id}
                      className="border-t border-slate-100 text-[11px] hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-800">
                        {order.id}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {order.supplier}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {order.items}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {order.quantity}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {order.value}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                          order.type === "Emergency"
                            ? "bg-slate-100 text-slate-600"
                            : "text-slate-600"
                        }`}>
                          {order.type}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {order.deliveryDue}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`View ${order.id}`}
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

              {displayedOrders.length === 0 && (
                <div className="p-10 text-center text-sm text-slate-400">
                  No purchase orders found.
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredOrders.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –
                {Math.min(safePage * pageSize, filteredOrders.length)}
                {" "}of {filteredOrders.length}
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map(n => (
                  <button
                    key={n}
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

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleCreateOrder}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Create Purchase Order
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter purchasing information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <label className="block text-xs font-semibold">
              Supplier Name
              <input
                required
                value={formData.supplier}
                onChange={e => setFormData({
                  ...formData,
                  supplier: e.target.value
                })}
                placeholder="Enter supplier name"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Items
              <input
                required
                value={formData.items}
                onChange={e => setFormData({
                  ...formData,
                  items: e.target.value
                })}
                placeholder="Enter item name"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Quantity
              <input
                required
                value={formData.quantity}
                onChange={e => setFormData({
                  ...formData,
                  quantity: e.target.value
                })}
                placeholder="Example: 200 units"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Total Value
              <input
                required
                value={formData.value}
                onChange={e => setFormData({
                  ...formData,
                  value: e.target.value
                })}
                placeholder="Example: 18400"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Procurement Type
              <select
                value={formData.type}
                onChange={e => setFormData({
                  ...formData,
                  type: e.target.value as "Emergency" | "Standard"
                })}
                className={`mt-2 ${inputClass}`}
              >
                <option>Standard</option>
                <option>Emergency</option>
              </select>
            </label>

            <label className="block text-xs font-semibold">
              Delivery Due Date
              <input
                type="date"
                required
                value={formData.deliveryDue}
                onChange={e => setFormData({
                  ...formData,
                  deliveryDue: e.target.value
                })}
                className={`mt-2 ${inputClass}`}
              />
            </label>

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
                className="rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                Create Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Purchase Order Details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedOrder.id}
                </p>
              </div>

              <button onClick={() => setSelectedOrder(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-sky-50 p-4">
              <p className="text-xs text-sky-600">
                Order Status
              </p>

              <span className={`mt-2 inline-block rounded-md px-3 py-1.5 text-xs font-semibold ${statusStyles[selectedOrder.status]}`}>
                {selectedOrder.status}
              </span>
            </div>

            {[
              ["Purchase Order", selectedOrder.id],
              ["Supplier", selectedOrder.supplier],
              ["Items", selectedOrder.items],
              ["Quantity", selectedOrder.quantity],
              ["Value", selectedOrder.value],
              ["Procurement Type", selectedOrder.type],
              ["Delivery Due", selectedOrder.deliveryDue]
            ].map(([label, value]) => (
              <div
                key={label}
                className="mb-2 rounded-lg bg-slate-50 p-3"
              >
                <p className="text-[10px] text-slate-400">
                  {label}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            ))}

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full rounded-lg bg-[#287ba5] py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
