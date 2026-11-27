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
  Check,
  CalendarDays,
  FileText,
  Filter,
  X,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react";

import { reportsService } from "../../services/reportsService";
import type {
  Report,
  AnalyticsDashboard,
  WeeklyTrend,
  CategoryDistribution,
  GenerateReportPayload,
  CreateReportSchedulePayload,
} from "../../types/reports";

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

const initialReports: Report[] = [
  {
    id: 1,
    name: "Resource Fulfilment Report",
    category: "Fulfilment",
    period: "Last 30 days",
    generated: "Today, 09:30 AM",
    format: "PDF",
  },
  {
    id: 2,
    name: "Inventory Stock Summary",
    category: "Inventory",
    period: "Last 30 days",
    generated: "Yesterday, 04:15 PM",
    format: "CSV",
  },
  {
    id: 3,
    name: "Warehouse Performance",
    category: "Warehouse",
    period: "Last 7 days",
    generated: "Yesterday, 11:20 AM",
    format: "PDF",
  },
  {
    id: 4,
    name: "Supplier Delivery Analysis",
    category: "Suppliers",
    period: "Last 30 days",
    generated: "22 Jun 2025",
    format: "CSV",
  },
  {
    id: 5,
    name: "Stock Movement Report",
    category: "Inventory",
    period: "Last 90 days",
    generated: "21 Jun 2025",
    format: "PDF",
  },
];

const fallbackWeeks: WeeklyTrend[] = [
  { label: "Week 1", received: 68, fulfilled: 61 },
  { label: "Week 2", received: 82, fulfilled: 73 },
  { label: "Week 3", received: 94, fulfilled: 86 },
  { label: "Week 4", received: 103, fulfilled: 96 },
];

const fallbackCategories: CategoryDistribution[] = [
  { name: "Food & Water", value: 82, color: "bg-emerald-500" },
  { name: "Shelter", value: 68, color: "bg-sky-600" },
  { name: "Medical", value: 24, color: "bg-red-500" },
  { name: "WASH", value: 74, color: "bg-teal-500" },
  { name: "Transport & Fuel", value: 36, color: "bg-amber-500" },
  { name: "Non-food Items", value: 57, color: "bg-blue-500" },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none focus:border-sky-500";

export default function ReportsAnalyticsPage() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("Last 30 days");
  const [operation, setOperation] = useState("Monsoon Floods 2025");
  const [warehouse, setWarehouse] = useState("All warehouses");

  const [appliedPeriod, setAppliedPeriod] = useState("Last 30 days");
  const [appliedOperation, setAppliedOperation] = useState("Monsoon Floods 2025");
  const [appliedWarehouse, setAppliedWarehouse] = useState("All warehouses");

  const [reports, setReports] = useState<Report[]>(initialReports);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);

  const [search, setSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("All reports");

  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showReport, setShowReport] = useState<Report | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [generateForm, setGenerateForm] = useState<GenerateReportPayload>({
    name: "Operational Analytics Report",
    category: "Fulfilment",
    period: "Last 30 days",
    format: "CSV",
  });

  const [scheduleData, setScheduleData] = useState<CreateReportSchedulePayload>({
    name: "Weekly Resource Report",
    email: "",
    frequency: "Weekly",
    format: "PDF",
    period: "Last 30 days",
  });

  const [scheduled, setScheduled] = useState(false);

  // LOAD DATA FROM BACKEND
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reportsData, analyticsData] = await Promise.all([
        reportsService.getReports({
          search: search || undefined,
          category: reportFilter !== "All reports" ? reportFilter : undefined,
        }),
        reportsService.getAnalytics({
          period: appliedPeriod,
          operation: appliedOperation !== "All operations" ? appliedOperation : undefined,
          warehouse: appliedWarehouse !== "All warehouses" ? appliedWarehouse : undefined,
        }),
      ]);

      if (reportsData && Array.isArray(reportsData)) {
        setReports(reportsData);
      }
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local reports & analytics:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search, reportFilter, appliedPeriod, appliedOperation, appliedWarehouse]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // FILTER REPORT LIBRARY
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = [report.name, report.category, report.format]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        reportFilter === "All reports" || report.category === reportFilter;

      return matchesSearch && matchesCategory;
    });
  }, [reports, search, reportFilter]);

  // APPLY ANALYTICS FILTERS
  const handleApplyFilters = () => {
    setAppliedPeriod(period);
    setAppliedOperation(operation);
    setAppliedWarehouse(warehouse);
  };

  // EXPORT CSV
  const exportCSV = () => {
    const headers = [
      "Report Name",
      "Category",
      "Period",
      "Generated",
      "Format",
    ];

    const rows = filteredReports.map((r) => [
      r.name,
      r.category,
      r.period,
      r.generated,
      r.format,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // GENERATE REPORT
  const handleGenerateReport = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const created = await reportsService.generateReport({
        ...generateForm,
        period: appliedPeriod,
      });
      setReports((prev) => [created, ...prev]);
      setShowReport(created);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, generating report locally:", err);
      const newReport: Report = {
        id: Date.now(),
        name: generateForm.name,
        category: generateForm.category,
        period: appliedPeriod,
        generated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        format: generateForm.format,
      };
      setReports((prev) => [newReport, ...prev]);
      setShowReport(newReport);
    } finally {
      setShowGenerateModal(false);
    }
  };

  // DELETE REPORT
  const handleDeleteReport = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    setActionInProgress(id);
    try {
      await reportsService.deleteReport(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, deleting locally:", err);
    } finally {
      setActionInProgress(null);
    }

    setReports((prev) => prev.filter((r) => r.id !== id));
    if (showReport && showReport.id === id) {
      setShowReport(null);
    }
  };

  // SCHEDULE REPORT
  const handleSchedule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await reportsService.createSchedule({
        ...scheduleData,
        period: appliedPeriod,
      });
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, saving schedule locally:", err);
    } finally {
      setScheduled(true);
      setShowSchedule(false);
      setTimeout(() => setScheduled(false), 5000);
    }
  };

  // STATS
  const stats = [
    {
      title: "Requests fulfilled",
      value: analytics?.kpis.requestsFulfilled ?? "93.8%",
      note: analytics?.kpis.requestsFulfilledTrend ?? "+2.1% vs previous period",
      icon: Check,
      style: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Average fulfilment",
      value: analytics?.kpis.averageFulfilmentTime ?? "3h 18m",
      note: analytics?.kpis.averageFulfilmentTimeTrend ?? "-24 min improvement",
      icon: Clock3,
      style: "bg-sky-50 text-sky-700",
    },
    {
      title: "Inventory turnover",
      value: analytics?.kpis.inventoryTurnover ?? "4.6×",
      note: analytics?.kpis.inventoryTurnoverNote ?? "Current operation",
      icon: ArrowLeftRight,
      style: "bg-sky-50 text-sky-700",
    },
    {
      title: "Stock loss rate",
      value: analytics?.kpis.stockLossRate ?? "0.42%",
      note: analytics?.kpis.stockLossRateNote ?? "Within 0.5% target",
      icon: ShieldCheck,
      style: "bg-emerald-50 text-emerald-600",
    },
  ];

  const weeks = analytics?.weeklyTrends ?? fallbackWeeks;
  const categories = analytics?.categoryDistributions ?? fallbackCategories;

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">ReliefOS</h1>
            <p className="text-sm text-sky-200">Resource Management</p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>

          <p className="mt-2 text-sm font-bold">Monsoon Floods 2025</p>

          <p className="mt-1 text-sm text-sky-200">Greater Riverton · Level 4</p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Reports & Analytics";

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
              placeholder="Search resources, requests, dispatches, reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none"
            />

            <span className="hidden rounded border bg-white px-2 py-1 text-xs text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend Connection Badge */}
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
              title="Refresh Reports & Analytics"
              className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-xs uppercase text-slate-400">Primary Hub</p>
              <p className="text-sm font-bold">Central Logistics Hub</p>
            </div>

            <button className="hidden rounded-lg border p-2.5 sm:block" aria-label="Security">
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

            <ChevronRight size={17} className="hidden sm:block" />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="space-y-5 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB */}
          <div className="text-[13px] text-slate-400">
            Resource Operations <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">Reports & Analytics</span>
          </div>

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h2>
              <p className="mt-1 text-xs text-slate-500">
                Analyse availability, fulfilment, stock movement, warehouse performance, and supplier delivery.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSchedule(true)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-sky-700 hover:bg-slate-50 shadow-sm"
              >
                Schedule Reports
              </button>

              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </section>

          {/* FILTER PANEL */}
          <section className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="text-sm font-semibold text-slate-500">
                Reporting period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-500">
                Operation
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Monsoon Floods 2025</option>
                  <option>Emergency Response 2025</option>
                  <option>All operations</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-500">
                Warehouse
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>All warehouses</option>
                  <option>Central Logistics Hub</option>
                  <option>North District Hub</option>
                  <option>Eastbank Warehouse</option>
                  <option>West Coast Depot</option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  onClick={handleApplyFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
                >
                  <Filter size={14} /> Apply filters
                </button>
              </div>
            </div>
          </section>

          {/* KPI CARDS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.style}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] text-slate-400">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                    <p className="text-[13px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* CHARTS */}
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {/* FULFILMENT CHART */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Fulfilment performance ({appliedPeriod})
                  </h3>
                  <p className="mt-0.5 text-[13px] text-slate-400">
                    Requests received and fulfilled across active timeline
                  </p>
                </div>

                <div className="flex gap-3 text-sm text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-[#287ba5]" />
                    Received
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-[#62b7a8]" />
                    Fulfilled
                  </span>
                </div>
              </div>

              <div className="relative h-[245px] px-5 pb-7 pt-5">
                <div className="absolute inset-x-5 top-5 bottom-8 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full border-t border-slate-100" />
                  ))}
                </div>

                <div className="relative z-10 flex h-full items-end justify-around gap-4">
                  {weeks.map((week, idx) => {
                    const maxVal = Math.max(...weeks.map((w) => Math.max(w.received, w.fulfilled)), 100);
                    return (
                      <div
                        key={week.label}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <div className="flex h-full w-full items-end justify-center gap-2">
                          <div
                            title={`Received: ${week.received}`}
                            className="w-5 max-w-[35%] rounded-t-sm bg-[#287ba5] transition-all hover:opacity-80"
                            style={{
                              height: `${(week.received / maxVal) * 100}%`,
                            }}
                          />

                          <div
                            title={`Fulfilled: ${week.fulfilled}`}
                            className="w-5 max-w-[35%] rounded-t-sm bg-[#62b7a8] transition-all hover:opacity-80"
                            style={{
                              height: `${(week.fulfilled / maxVal) * 100}%`,
                            }}
                          />
                        </div>

                        <p
                          className="absolute bottom-2 text-[13px] font-medium text-slate-500"
                          style={{
                            left: `${(100 / weeks.length) * (idx + 0.5)}%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          {week.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* INVENTORY CATEGORY CHART */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <h3 className="text-base font-bold text-slate-800">Inventory by category</h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Current stock availability and fulfillment coverage
                </p>
              </div>

              <div className="space-y-4 p-5">
                {categories.map((category) => (
                  <div key={category.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">
                        {category.name}
                      </span>

                      <span className="font-mono text-slate-500">
                        {category.value}% available
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${category.color} transition-all duration-500`}
                        style={{ width: `${category.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* REPORT LIBRARY */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Report library</h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Generated operational audits, fulfillment summaries, and compliance reports.
                </p>
              </div>

              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#287ba5] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1c668d] shadow-sm transition"
              >
                <Plus size={14} /> Generate report
              </button>
            </div>

            {/* REPORT SEARCH AND FILTER */}
            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports by title, category, format..."
                  className="w-full py-2.5 text-sm sm:text-[15px] outline-none"
                />
              </div>

              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className={`${inputClass} shadow-sm`}
                style={{ width: "auto" }}
              >
                <option>All reports</option>
                <option>Fulfilment</option>
                <option>Inventory</option>
                <option>Warehouse</option>
                <option>Suppliers</option>
              </select>

              {(search || reportFilter !== "All reports") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setReportFilter("All reports");
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
                >
                  Reset
                </button>
              )}
            </div>

            {/* REPORT TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-slate-50 text-[13px] text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Report name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Reporting period</th>
                      <th className="px-4 py-3.5">Generated</th>
                      <th className="px-4 py-3.5">Format</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-t border-slate-100 text-sm hover:bg-slate-50/80 transition"
                      >
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-sky-600 shrink-0" />
                            {report.name}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {report.category}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {report.period}
                        </td>

                        <td className="px-4 py-3.5 text-slate-500">
                          {report.generated}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {report.format}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setShowReport(report)}
                              className="text-sm font-semibold text-sky-700 hover:underline"
                            >
                              View
                            </button>
                            <button
                              disabled={actionInProgress === report.id}
                              onClick={() => handleDeleteReport(report.id)}
                              title="Delete report"
                              className="rounded p-1 text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredReports.length === 0 && (
                  <div className="p-10 text-center text-xs text-slate-400">
                    No reports found matching your criteria.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-4 py-3 text-[13px] text-slate-400">
                Showing {filteredReports.length} reports in archive
              </div>
            </div>
          </section>

          {scheduled && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
              <Check size={16} className="text-emerald-600" />
              Report schedule saved successfully. You will receive automated periodic digests.
            </div>
          )}
        </div>
      </main>

      {/* SCHEDULE REPORT MODAL */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSchedule}
            className="w-full max-w-md space-y-3.5 rounded-2xl bg-white p-6 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Schedule Reports</h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Set up automated email delivery for operational audits
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Report Title *
              </label>
              <input
                required
                value={scheduleData.name}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, name: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient Email *
              </label>
              <input
                required
                type="email"
                placeholder="example@reliefos.org"
                value={scheduleData.email}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, email: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Frequency
                </label>
                <select
                  value={scheduleData.frequency}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, frequency: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Format
                </label>
                <select
                  value={scheduleData.format}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, format: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>PDF</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2 text-sm font-bold text-white hover:bg-[#1c668d]"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GENERATE REPORT MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleGenerateReport}
            className="w-full max-w-md space-y-3.5 rounded-2xl bg-white p-6 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Generate Report</h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Compile and export operational data for {appliedPeriod}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Report Title *
              </label>
              <input
                required
                value={generateForm.name}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, name: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={generateForm.category}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, category: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>Fulfilment</option>
                  <option>Inventory</option>
                  <option>Warehouse</option>
                  <option>Suppliers</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Export Format
                </label>
                <select
                  value={generateForm.format}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, format: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>CSV</option>
                  <option>PDF</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2 text-sm font-bold text-white hover:bg-[#1c668d]"
              >
                Compile Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT DETAILS / PREVIEW MODAL */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Report Details</h3>
                <p className="mt-0.5 text-xs text-slate-400">ID #{showReport.id}</p>
              </div>

              <button
                onClick={() => setShowReport(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50/80 p-3.5 border border-sky-100">
              <FileText size={24} className="text-sky-700 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">{showReport.name}</p>
                <p className="text-[13px] text-slate-500">{showReport.category} Analytics</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                ["Report Name", showReport.name],
                ["Category", showReport.category],
                ["Reporting Period", showReport.period],
                ["Generated Date", showReport.generated],
                ["File Format", showReport.format],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5"
                >
                  <span className="text-[13px] text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const content = [
                    ["Report", showReport.name],
                    ["Category", showReport.category],
                    ["Period", showReport.period],
                    ["Generated", showReport.generated],
                    ["Format", showReport.format],
                  ];

                  const csv = content.map((row) => row.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${showReport.name.replace(/\s+/g, "-")}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#287ba5] py-2.5 text-sm font-bold text-white hover:bg-[#1c668d] transition"
              >
                <Download size={14} /> Download {showReport.format}
              </button>

              <button
                onClick={() => setShowReport(null)}
                className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
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
