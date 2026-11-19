import { useMemo, useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
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
  Plus,
  Download,
  Check,
  Filter,
  X,
  Menu,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { supplierService } from "../../services/supplierService";
import type {
  Supplier,
  SupplierStatus,
  Verification,
  SupplierSummary
} from "../../types/supplier";

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
  { label: "Settings", path: "/resource-manager/settings", icon: Settings }
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
  Verified: "text-emerald-700 font-medium",
  Pending: "text-amber-600 font-medium",
  Rejected: "text-red-600 font-medium"
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500";

export default function SupplierPage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [summary, setSummary] = useState<SupplierSummary | null>(null);

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Medical",
    coverage: "",
    onTimeRate: "",
    leadTime: "",
    verification: "Pending" as Verification
  });

  const pageSize = 4;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [suppliersData, summaryData] = await Promise.all([
        supplierService.getSuppliers(),
        supplierService.getSummary().catch(() => null)
      ]);

      if (suppliersData && suppliersData.length > 0) {
        setSuppliers(suppliersData);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setIsBackendConnected(true);
    } catch (error) {
      console.warn("Backend unavailable, using local default suppliers:", error);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  const activeCount = summary?.activeCount ?? suppliers.filter(s => s.status === "Active").length;
  const pendingCount = summary?.pendingCount ?? suppliers.filter(s => s.verification === "Pending").length;
  const verifiedCount = summary?.verifiedCount ?? suppliers.filter(s => s.verification === "Verified").length;
  const exceptionCount = summary?.exceptionCount ?? suppliers.filter(s => s.verification === "Rejected").length;

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
  const handleAddSupplier = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.coverage.trim() ||
      !formData.onTimeRate.trim() ||
      !formData.leadTime.trim()
    ) return;

    setIsSubmitting(true);

    try {
      const created = await supplierService.createSupplier({
        name: formData.name.trim(),
        category: formData.category,
        coverage: formData.coverage.trim(),
        onTimeRate: formData.onTimeRate,
        leadTime: formData.leadTime.trim(),
        verification: formData.verification,
        status: "Active"
      });

      setSuppliers(prev => [created, ...prev]);
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Supplier ${created.name} (${created.id}) added successfully!`
      });
    } catch (error) {
      console.warn("Backend error on create, adding locally:", error);
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
      setStatusMessage({
        type: "info",
        text: `Supplier ${newSupplier.name} added locally (backend offline).`
      });
    } finally {
      setIsSubmitting(false);
      setShowCreateModal(false);
      setFormData({
        name: "",
        category: "Medical",
        coverage: "",
        onTimeRate: "",
        leadTime: "",
        verification: "Pending"
      });
      resetFilters();
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // UPDATE STATUS / VERIFICATION
  const handleUpdateSupplier = async (
    id: string,
    updates: { status?: SupplierStatus; verification?: Verification }
  ) => {
    try {
      setIsSubmitting(true);
      const updated = await supplierService.updateStatus(id, updates);
      setSuppliers(prev => prev.map(s => (s.id === id ? updated : s)));
      if (selectedSupplier && selectedSupplier.id === id) {
        setSelectedSupplier(updated);
      }
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Supplier ${id} updated successfully.`
      });
    } catch (error) {
      console.warn("Backend update failed, updating locally:", error);
      setSuppliers(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
      if (selectedSupplier && selectedSupplier.id === id) {
        setSelectedSupplier(prev => prev ? { ...prev, ...updates } : null);
      }
      setStatusMessage({
        type: "info",
        text: `Supplier ${id} updated locally.`
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // DELETE SUPPLIER
  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm(`Are you sure you want to remove supplier ${id}?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await supplierService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      setSelectedSupplier(null);
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: `Supplier ${id} removed successfully.`
      });
    } catch (error) {
      console.warn("Backend delete failed, removing locally:", error);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      setSelectedSupplier(null);
      setStatusMessage({
        type: "info",
        text: `Supplier ${id} removed locally.`
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
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
            <p className="text-[10px] text-sky-200">Resource Management</p>
          </div>
        </div>

        {/* ACTIVE OPERATION */}
        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>

          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>

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
                  if (active) return;
                  if (item.path) {
                    navigate(item.path);
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

        {/* USER PROFILE */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Daniel Perera</p>
            <p className="text-[10px] text-sky-200">Resource Manager</p>
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
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />

            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">Primary Hub</p>
              <p className="text-[10px] font-bold">Central Logistics Hub</p>
            </div>

            <button className="hidden rounded-lg border p-2.5 sm:block" title="Security Status">
              <ShieldCheck size={18} />
            </button>

            <button className="relative rounded-lg border p-2.5" title="Alerts">
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
              <p className="text-[9px] text-slate-400">Resource Manager</p>
            </div>

            <ChevronRight size={17} className="hidden sm:block text-slate-400" />
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB & API STATUS BADGE */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>
              Resource Operations
              <ChevronRight size={12} className="mx-1 inline" />
              <span className="font-semibold text-[#163d5c]">Suppliers</span>
            </div>

            <div className="flex items-center gap-2">
              {isBackendConnected === true && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  API Connected
                </span>
              )}
              {isBackendConnected === false && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Offline Mode
                </span>
              )}
            </div>
          </div>

          {/* STATUS NOTIFICATION BANNER */}
          {statusMessage && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-3.5 text-xs transition-all ${
                statusMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : statusMessage.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-sky-600 shrink-0" />
              )}
              <span className="flex-1 font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Suppliers</h2>
              <p className="mt-2 text-xs text-slate-500">
                Manage vendor profiles, contracts, performance ratings, and compliance.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700 hover:bg-slate-50"
              >
                <Download size={15} />
                Export
              </button>

              <button
                type="button"
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
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">{card.title}</p>
                    <h3 className="text-2xl font-bold">{card.value}</h3>
                    <p className="text-[9px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* TABS */}
          <section>
            <div className="flex flex-wrap gap-6 border-b border-slate-200">
              {tabs.map(tab => {
                const count =
                  tab === "All"
                    ? suppliers.length
                    : tab === "Needs action"
                    ? suppliers.filter(s => s.verification === "Pending").length
                    : tab === "Active"
                    ? suppliers.filter(s => s.status === "Active").length
                    : tab === "Completed"
                    ? suppliers.filter(s => s.verification === "Verified").length
                    : tab === "Exceptions"
                    ? suppliers.filter(s => s.verification === "Rejected").length
                    : 0;

                return (
                  <button
                    key={tab}
                    type="button"
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

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                        activeTab === tab
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>

                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                    )}
                  </button>
                );
              })}
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
                <option key={category} value={category}>
                  {category}
                </option>
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
              {[...new Set(suppliers.map(s => s.coverage))].map(coverage => (
                <option key={coverage} value={coverage}>
                  {coverage}
                </option>
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
              {(["Verified", "Pending", "Rejected"] as Verification[]).map(verification => (
                <option key={verification} value={verification}>
                  {verification}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-sky-700 hover:bg-slate-50"
            >
              <Filter size={15} />
              Reset Filters
            </button>
          </section>

          {/* SUPPLIERS TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 p-8">
                <Loader2 size={28} className="animate-spin text-[#287ba5]" />
                <p className="text-xs text-slate-500">Loading suppliers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-500">
                    <tr>
                      {[
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
                    {displayedSuppliers.map(item => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 text-[11px] hover:bg-slate-50"
                      >
                        <td className="px-3 py-4">
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.id}</p>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.category}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.coverage}
                        </td>

                        <td className="px-3 py-4 font-semibold text-slate-800">
                          {item.onTimeRate}
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {item.leadTime}
                        </td>

                        <td className="px-3 py-4">
                          <span className={verificationStyles[item.verification]}>
                            ● {item.verification}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${
                              statusStyles[item.status]
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedSupplier(item)}
                            aria-label={`View ${item.name}`}
                            className="p-1 hover:text-sky-700"
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
            )}

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                Showing{" "}
                {filteredSuppliers.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –{Math.min(safePage * pageSize, filteredSuppliers.length)}{" "}
                of {filteredSuppliers.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
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
                  type="button"
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

      {/* CREATE SUPPLIER MODAL */}
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
                  Enter supplier details to register in the procurement system.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <label className="block text-xs font-semibold">
              Supplier Name
              <input
                required
                value={formData.name}
                onChange={e =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
                placeholder="Enter supplier or company name"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Category
              <select
                value={formData.category}
                onChange={e =>
                  setFormData({
                    ...formData,
                    category: e.target.value
                  })
                }
                className={`mt-2 ${inputClass}`}
              >
                <option>Medical</option>
                <option>Food &amp; Water</option>
                <option>Shelter</option>
                <option>WASH</option>
                <option>Transport</option>
                <option>Equipment</option>
              </select>
            </label>

            <label className="block text-xs font-semibold">
              Coverage / Region
              <input
                required
                value={formData.coverage}
                onChange={e =>
                  setFormData({
                    ...formData,
                    coverage: e.target.value
                  })
                }
                placeholder="e.g. National, Central Region, All districts"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              On-time Delivery Rate (%)
              <input
                required
                type="number"
                min="0"
                max="100"
                value={formData.onTimeRate}
                onChange={e =>
                  setFormData({
                    ...formData,
                    onTimeRate: e.target.value
                  })
                }
                placeholder="Example: 95"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Average Lead Time
              <input
                required
                value={formData.leadTime}
                onChange={e =>
                  setFormData({
                    ...formData,
                    leadTime: e.target.value
                  })
                }
                placeholder="Example: 2.1 days"
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Verification Status
              <select
                value={formData.verification}
                onChange={e =>
                  setFormData({
                    ...formData,
                    verification: e.target.value as Verification
                  })
                }
                className={`mt-2 ${inputClass}`}
              >
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d] disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>Add Supplier</span>
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

              <button
                type="button"
                onClick={() => setSelectedSupplier(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl bg-sky-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
                  <Building2 size={22} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedSupplier.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedSupplier.category} · {selectedSupplier.coverage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSupplier(selectedSupplier.id)}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50"
                title="Remove supplier"
              >
                <Trash2 size={15} />
              </button>
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
              <div key={label} className="mb-2 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            ))}

            {/* SUPPLIER ACTIONS */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  Verification Actions
                </p>
                <div className="flex gap-2">
                  {selectedSupplier.verification !== "Verified" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleUpdateSupplier(selectedSupplier.id, {
                          verification: "Verified"
                        })
                      }
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Verify Supplier
                    </button>
                  )}
                  {selectedSupplier.verification !== "Pending" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleUpdateSupplier(selectedSupplier.id, {
                          verification: "Pending"
                        })
                      }
                      className="flex-1 rounded-lg bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      Set Pending
                    </button>
                  )}
                  {selectedSupplier.verification !== "Rejected" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleUpdateSupplier(selectedSupplier.id, {
                          verification: "Rejected"
                        })
                      }
                      className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  Operational Status
                </p>
                <div className="flex gap-2">
                  {selectedSupplier.status !== "Active" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleUpdateSupplier(selectedSupplier.id, {
                          status: "Active"
                        })
                      }
                      className="flex-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 py-1.5 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Set Active
                    </button>
                  )}
                  {selectedSupplier.status !== "Inactive" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleUpdateSupplier(selectedSupplier.id, {
                          status: "Inactive"
                        })
                      }
                      className="flex-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 py-1.5 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50"
                    >
                      Set Inactive
                    </button>
                  )}
                  {selectedSupplier.status !== "Suspended" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleUpdateSupplier(selectedSupplier.id, {
                          status: "Suspended"
                        })
                      }
                      className="flex-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 py-1.5 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSupplier(null)}
                className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
