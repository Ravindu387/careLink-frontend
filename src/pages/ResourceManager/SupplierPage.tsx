
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Plus,
  Download, Check, Filter, X, Menu, Building2
} from "lucide-react";

type SupplierStatus = "Active" | "Inactive" | "Suspended";
type Verification = "Verified" | "Pending" | "Rejected";

type Supplier = {
  id: string;
  name: string;
  category: string;
  coverage: string;
  onTimeRate: string;
  leadTime: string;
  verification: Verification;
  status: SupplierStatus;
};

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-0014",
    name: "MediSupply International",
    category: "Medical",
    coverage: "National",
    onTimeRate: "98%",
    leadTime: "2.1 days",
    verification: "Verified",
    status: "Active"
  },
  {
    id: "SUP-0021",
    name: "AquaSafe Ltd.",
    category: "Food & Water",
    coverage: "Central - North",
    onTimeRate: "96%",
    leadTime: "1.4 days",
    verification: "Verified",
    status: "Active"
  },
  {
    id: "SUP-0032",
    name: "ShelterWorks Cooperative",
    category: "Shelter",
    coverage: "All districts",
    onTimeRate: "91%",
    leadTime: "3.2 days",
    verification: "Verified",
    status: "Active"
  },
  {
    id: "SUP-0048",
    name: "Regional Food Services",
    category: "Food & Water",
    coverage: "Central Region",
    onTimeRate: "94%",
    leadTime: "1.8 days",
    verification: "Verified",
    status: "Active"
  },
  {
    id: "SUP-0052",
    name: "HealthCare Essentials",
    category: "Medical",
    coverage: "North Region",
    onTimeRate: "88%",
    leadTime: "2.8 days",
    verification: "Pending",
    status: "Active"
  },
  {
    id: "SUP-0057",
    name: "SafeHome Supplies",
    category: "Shelter",
    coverage: "West Region",
    onTimeRate: "85%",
    leadTime: "4.2 days",
    verification: "Pending",
    status: "Inactive"
  },
  {
    id: "SUP-0061",
    name: "CleanWater Solutions",
    category: "WASH",
    coverage: "All districts",
    onTimeRate: "97%",
    leadTime: "1.5 days",
    verification: "Verified",
    status: "Active"
  },
  {
    id: "SUP-0065",
    name: "Emergency Logistics Ltd.",
    category: "Transport",
    coverage: "Central Region",
    onTimeRate: "90%",
    leadTime: "2.5 days",
    verification: "Rejected",
    status: "Suspended"
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

const statusStyles: Record<SupplierStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
  Suspended: "bg-red-50 text-red-700"
};

const verificationStyles: Record<Verification, string> = {
  Verified: "text-emerald-700",
  Pending: "text-amber-600",
  Rejected: "text-red-600"
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Medical",
    coverage: "",
    onTimeRate: "",
    leadTime: "",
    verification: "Pending" as Verification
  });

  const pageSize = 4;

  // FILTER SUPPLIERS
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = [
        supplier.id,
        supplier.name,
        supplier.category,
        supplier.coverage,
        supplier.verification,
        supplier.status
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All categories" ||
        supplier.category === categoryFilter;

      const matchesRegion =
        regionFilter === "All regions" ||
        supplier.coverage === regionFilter;

      const matchesVerification =
        verificationFilter === "All verification states" ||
        supplier.verification === verificationFilter;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          supplier.verification === "Pending") ||
        (activeTab === "Active" &&
          supplier.status === "Active") ||
        (activeTab === "Completed" &&
          supplier.verification === "Verified") ||
        (activeTab === "Exceptions" &&
          supplier.verification === "Rejected");

      return matchesSearch &&
        matchesCategory &&
        matchesRegion &&
        matchesVerification &&
        matchesTab;
    });
  }, [
    suppliers,
    search,
    categoryFilter,
    regionFilter,
    verificationFilter,
    activeTab
  ]);

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const displayedSuppliers = filteredSuppliers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // STATISTICS
  const activeCount = suppliers.filter(
    s => s.status === "Active"
  ).length;

  const pendingCount = suppliers.filter(
    s => s.verification === "Pending"
  ).length;

  const verifiedCount = suppliers.filter(
    s => s.verification === "Verified"
  ).length;

  const exceptionCount = suppliers.filter(
    s => s.verification === "Rejected"
  ).length;

  const stats = [
    {
      title: "Active records",
      value: activeCount,
      note: "Across current operation",
      icon: Package,
      color: "bg-sky-50 text-sky-700"
    },
    {
      title: "Awaiting action",
      value: pendingCount,
      note: "Assigned to your team",
      icon: Clock3,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Completed today",
      value: verifiedCount,
      note: "All audit recorded",
      icon: Check,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Exceptions",
      value: exceptionCount,
      note: "Require review",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600"
    }
  ];

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All categories");
    setRegionFilter("All regions");
    setVerificationFilter("All verification states");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // ADD SUPPLIER
  const handleAddSupplier = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.coverage.trim() ||
      !formData.onTimeRate.trim() ||
      !formData.leadTime.trim()
    ) return;

    const nextNumber =
      Math.max(
        ...suppliers.map(s => Number(s.id.split("-")[1])),
        14
      ) + 1;

    const newSupplier: Supplier = {
      id: `SUP-${String(nextNumber).padStart(4, "0")}`,
      name: formData.name,
      category: formData.category,
      coverage: formData.coverage,
      onTimeRate: formData.onTimeRate.endsWith("%")
        ? formData.onTimeRate
        : `${formData.onTimeRate}%`,
      leadTime: formData.leadTime,
      verification: formData.verification,
      status: "Active"
    };

    setSuppliers(prev => [newSupplier, ...prev]);

    setFormData({
      name: "",
      category: "Medical",
      coverage: "",
      onTimeRate: "",
      leadTime: "",
      verification: "Pending"
    });

    setShowCreateModal(false);
    resetFilters();
  };

  // EXPORT CSV
  const handleExport = () => {
    const headers = [
      "Supplier ID",
      "Supplier",
      "Category",
      "Coverage",
      "On-time Rate",
      "Average Lead Time",
      "Verification",
      "Status"
    ];

    const rows = filteredSuppliers.map(s => [
      s.id,
      s.name,
      s.category,
      s.coverage,
      s.onTimeRate,
      s.leadTime,
      s.verification,
      s.status
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
    link.download = "suppliers.csv";
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
            const active = item.label === "Suppliers";

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
              Suppliers
            </span>
          </div>

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Suppliers
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Maintain verified supplier capability, performance, coverage, and agreements.
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
                Add Supplier
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
                placeholder="Search suppliers..."
                className="w-full py-3 text-xs outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All categories</option>
              {[...new Set(suppliers.map(s => s.category))].map(category => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <select
              value={regionFilter}
              onChange={e => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All regions</option>
              {[...new Set(suppliers.map(s => s.coverage))].map(region => (
                <option key={region}>{region}</option>
              ))}
            </select>

            <select
              value={verificationFilter}
              onChange={e => {
                setVerificationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All verification states</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-sky-700 hover:bg-slate-50"
            >
              <Filter size={15} />
              More filters
            </button>
          </section>

          {/* SUPPLIER TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">

                <thead className="bg-slate-50 text-[10px] text-slate-500">
                  <tr>
                    {[
                      "Supplier ID",
                      "Supplier",
                      "Category",
                      "Coverage",
                      "On-time Rate",
                      "Avg Lead Time",
                      "Verification",
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
                  {displayedSuppliers.map(supplier => (
                    <tr
                      key={supplier.id}
                      className="border-t border-slate-100 text-[11px] hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-bold text-slate-800">
                        {supplier.id}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {supplier.name}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {supplier.category}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {supplier.coverage}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {supplier.onTimeRate}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {supplier.leadTime}
                      </td>

                      <td className={`px-3 py-4 font-medium ${verificationStyles[supplier.verification]}`}>
                        {supplier.verification}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusStyles[supplier.status]}`}>
                          {supplier.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          onClick={() => setSelectedSupplier(supplier)}
                          aria-label={`View ${supplier.id}`}
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

              {displayedSuppliers.length === 0 && (
                <div className="p-10 text-center text-sm text-slate-400">
                  No suppliers found.
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredSuppliers.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –
                {Math.min(safePage * pageSize, filteredSuppliers.length)}
                {" "}of {filteredSuppliers.length}
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

      {/* ADD SUPPLIER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleAddSupplier}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Add Supplier
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter supplier information.
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
                value={formData.name}
                onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })}
                placeholder="Enter supplier name"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Category
              <select
                value={formData.category}
                onChange={e => setFormData({
                  ...formData,
                  category: e.target.value
                })}
                className={`mt-2 ${inputClass}`}
              >
                <option>Medical</option>
                <option>Food & Water</option>
                <option>Shelter</option>
                <option>WASH</option>
                <option>Transport</option>
                <option>Non-food Items</option>
              </select>
            </label>

            <label className="block text-xs font-semibold">
              Coverage / Region
              <input
                required
                value={formData.coverage}
                onChange={e => setFormData({
                  ...formData,
                  coverage: e.target.value
                })}
                placeholder="Example: Central Region"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              On-time Delivery Rate
              <input
                required
                type="number"
                min="0"
                max="100"
                value={formData.onTimeRate}
                onChange={e => setFormData({
                  ...formData,
                  onTimeRate: e.target.value
                })}
                placeholder="Example: 95"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Average Lead Time
              <input
                required
                value={formData.leadTime}
                onChange={e => setFormData({
                  ...formData,
                  leadTime: e.target.value
                })}
                placeholder="Example: 2.1 days"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Verification Status
              <select
                value={formData.verification}
                onChange={e => setFormData({
                  ...formData,
                  verification: e.target.value as Verification
                })}
                className={`mt-2 ${inputClass}`}
              >
                <option>Pending</option>
                <option>Verified</option>
                <option>Rejected</option>
              </select>
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
                Add Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUPPLIER DETAILS MODAL */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Supplier Details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedSupplier.id}
                </p>
              </div>

              <button onClick={() => setSelectedSupplier(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sky-700">
                <Building2 size={22} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedSupplier.name}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedSupplier.category}
                </p>
              </div>
            </div>

            {[
              ["Supplier ID", selectedSupplier.id],
              ["Supplier Name", selectedSupplier.name],
              ["Category", selectedSupplier.category],
              ["Coverage", selectedSupplier.coverage],
              ["On-time Rate", selectedSupplier.onTimeRate],
              ["Average Lead Time", selectedSupplier.leadTime],
              ["Verification", selectedSupplier.verification],
              ["Status", selectedSupplier.status]
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
              onClick={() => setSelectedSupplier(null)}
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
