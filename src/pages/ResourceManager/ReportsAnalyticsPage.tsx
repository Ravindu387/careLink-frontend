
import { useMemo, useState } from "react";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Download,
  Menu, Check, CalendarDays, FileText, Filter,
  X, Plus, Mail, BarChart3
} from "lucide-react";

type Report = {
  id: number;
  name: string;
  category: string;
  period: string;
  generated: string;
  format: string;
};

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

const initialReports: Report[] = [
  {
    id: 1,
    name: "Resource Fulfilment Report",
    category: "Fulfilment",
    period: "Last 30 days",
    generated: "Today, 09:30 AM",
    format: "PDF"
  },
  {
    id: 2,
    name: "Inventory Stock Summary",
    category: "Inventory",
    period: "Last 30 days",
    generated: "Yesterday, 04:15 PM",
    format: "CSV"
  },
  {
    id: 3,
    name: "Warehouse Performance",
    category: "Warehouse",
    period: "Last 7 days",
    generated: "Yesterday, 11:20 AM",
    format: "PDF"
  },
  {
    id: 4,
    name: "Supplier Delivery Analysis",
    category: "Suppliers",
    period: "Last 30 days",
    generated: "22 Jun 2025",
    format: "CSV"
  },
  {
    id: 5,
    name: "Stock Movement Report",
    category: "Inventory",
    period: "Last 90 days",
    generated: "21 Jun 2025",
    format: "PDF"
  }
];

const weeks = [
  { label: "Week 1", received: 68, fulfilled: 61 },
  { label: "Week 2", received: 82, fulfilled: 73 },
  { label: "Week 3", received: 94, fulfilled: 86 },
  { label: "Week 4", received: 103, fulfilled: 96 }
];

const categories = [
  { name: "Food & Water", value: 82, color: "bg-emerald-500" },
  { name: "Shelter", value: 68, color: "bg-sky-600" },
  { name: "Medical", value: 24, color: "bg-red-500" },
  { name: "WASH", value: 74, color: "bg-teal-500" },
  { name: "Transport & Fuel", value: 36, color: "bg-amber-500" },
  { name: "Non-food Items", value: 57, color: "bg-blue-500" }
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-sky-500";

export default function ReportsAnalyticsPage() {
  const [period, setPeriod] = useState("Last 30 days");
  const [operation, setOperation] = useState("Monsoon Floods 2025");
  const [warehouse, setWarehouse] = useState("All warehouses");

  const [appliedPeriod, setAppliedPeriod] = useState("Last 30 days");

  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("All reports");

  const [showSchedule, setShowSchedule] = useState(false);
  const [showReport, setShowReport] = useState<Report | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    name: "Weekly Resource Report",
    email: "",
    frequency: "Weekly",
    format: "PDF"
  });

  const [scheduled, setScheduled] = useState(false);

  // FILTER REPORT LIBRARY
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = [
        report.name,
        report.category,
        report.format
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        reportFilter === "All reports" ||
        report.category === reportFilter;

      return matchesSearch && matchesCategory;
    });
  }, [reports, search, reportFilter]);

  // EXPORT CSV
  const exportCSV = () => {
    const headers = [
      "Report Name",
      "Category",
      "Period",
      "Generated",
      "Format"
    ];

    const rows = filteredReports.map(r => [
      r.name,
      r.category,
      r.period,
      r.generated,
      r.format
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
    link.download = "reliefos-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // GENERATE REPORT
  const generateReport = () => {
    const newReport: Report = {
      id: Date.now(),
      name: "Operational Analytics Report",
      category: "Fulfilment",
      period: appliedPeriod,
      generated: new Date().toLocaleString(),
      format: "CSV"
    };

    setReports(prev => [newReport, ...prev]);
    setShowReport(newReport);
  };

  // SCHEDULE REPORT
  const handleSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setScheduled(true);
    setShowSchedule(false);
  };

  const stats = [
    {
      title: "Requests fulfilled",
      value: "93.8%",
      note: "+2.1% vs previous period",
      icon: Check,
      style: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Average fulfilment",
      value: "3h 18m",
      note: "-24 min improvement",
      icon: Clock3,
      style: "bg-sky-50 text-sky-700"
    },
    {
      title: "Inventory turnover",
      value: "4.6×",
      note: "Current operation",
      icon: ArrowLeftRight,
      style: "bg-sky-50 text-sky-700"
    },
    {
      title: "Stock loss rate",
      value: "0.42%",
      note: "Within 0.5% target",
      icon: ShieldCheck,
      style: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>

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

        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Reports & Analytics";

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
        <div className="space-y-4 p-4 sm:p-6 lg:p-7">

          {/* BREADCRUMB */}
          <div className="text-[10px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Reports & Analytics
            </span>
          </div>

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Reports & Analytics
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Analyse availability, fulfilment, stock movement, warehouse performance, and supplier delivery.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSchedule(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700 hover:bg-slate-50"
              >
                Schedule reports
              </button>

              <button
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Download size={15} />
                Export
              </button>
            </div>
          </section>

          {/* FILTER PANEL */}
          <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

              <label className="text-[10px] text-slate-500">
                Reporting period

                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                </select>
              </label>

              <label className="text-[10px] text-slate-500">
                Operation

                <select
                  value={operation}
                  onChange={e => setOperation(e.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                >
                  <option>Monsoon Floods 2025</option>
                  <option>Emergency Response 2025</option>
                  <option>All operations</option>
                </select>
              </label>

              <label className="text-[10px] text-slate-500">
                Warehouse

                <select
                  value={warehouse}
                  onChange={e => setWarehouse(e.target.value)}
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
                  onClick={() => setAppliedPeriod(period)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
                >
                  <Filter size={14} />
                  Apply filters
                </button>
              </div>
            </div>
          </section>

          {/* KPI CARDS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(card => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.style}`}>
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

          {/* CHARTS */}
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">

            {/* FULFILMENT CHART */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
                <div>
                  <h3 className="text-xs font-semibold">
                    Fulfilment performance
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Requests received and fulfilled by week
                  </p>
                </div>

                <div className="flex gap-3 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-[#287ba5]" />
                    Received
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-[#62b7a8]" />
                    Fulfilled
                  </span>
                </div>
              </div>

              <div className="relative h-[245px] px-5 pb-7 pt-5">

                <div className="absolute inset-x-5 top-5 bottom-8 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-full border-t border-slate-100"
                    />
                  ))}
                </div>

                <div className="relative z-10 flex h-full items-end justify-around gap-4">
                  {weeks.map(week => (
                    <div
                      key={week.label}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div className="flex h-full w-full items-end justify-center gap-1.5">

                        <div
                          title={`Received: ${week.received}`}
                          className="w-5 max-w-[35%] rounded-t-sm bg-[#287ba5] transition-all hover:opacity-80"
                          style={{
                            height: `${week.received / 110 * 100}%`
                          }}
                        />

                        <div
                          title={`Fulfilled: ${week.fulfilled}`}
                          className="w-5 max-w-[35%] rounded-t-sm bg-[#62b7a8] transition-all hover:opacity-80"
                          style={{
                            height: `${week.fulfilled / 110 * 100}%`
                          }}
                        />
                      </div>

                      <p className="absolute bottom-2 text-[9px] text-slate-400"
                        style={{
                          left: `${12.5 + weeks.indexOf(week) * 25}%`,
                          transform: "translateX(-50%)"
                        }}
                      >
                        {week.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* INVENTORY CATEGORY CHART */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-4">
                <h3 className="text-xs font-semibold">
                  Inventory by category
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Current stock value distribution
                </p>
              </div>

              <div className="space-y-4 p-5">
                {categories.map(category => (
                  <div key={category.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]">
                      <span className="font-semibold text-slate-700">
                        {category.name}
                      </span>

                      <span className="text-slate-400">
                        {category.value}% available
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${category.color}`}
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
                <h3 className="text-sm font-semibold">
                  Report library
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Generated reports and saved analytics.
                </p>
              </div>

              <button
                onClick={generateReport}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Plus size={15} />
                Generate report
              </button>
            </div>

            {/* REPORT SEARCH AND FILTER */}
            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                <Search size={16} className="text-slate-400" />

                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full py-3 text-xs outline-none"
                />
              </div>

              <select
                value={reportFilter}
                onChange={e => setReportFilter(e.target.value)}
                className={inputClass}
                style={{ width: "auto" }}
              >
                <option>All reports</option>
                <option>Fulfilment</option>
                <option>Inventory</option>
                <option>Warehouse</option>
                <option>Suppliers</option>
              </select>
            </div>

            {/* REPORT TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">

                  <thead className="bg-slate-50 text-[10px] text-slate-500">
                    <tr>
                      <th className="px-4 py-4">Report name</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Reporting period</th>
                      <th className="px-4 py-4">Generated</th>
                      <th className="px-4 py-4">Format</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map(report => (
                      <tr
                        key={report.id}
                        className="border-t border-slate-100 text-[11px] hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-sky-600" />
                            {report.name}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {report.category}
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {report.period}
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {report.generated}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600">
                            {report.format}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setShowReport(report)}
                            className="text-xs font-semibold text-sky-700 hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredReports.length === 0 && (
                  <div className="p-10 text-center text-xs text-slate-400">
                    No reports found.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-4 py-3 text-[10px] text-slate-400">
                Showing {filteredReports.length} reports
              </div>
            </div>
          </section>

          {scheduled && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
              <Check size={16} />
              Report schedule saved successfully.
            </div>
          )}

        </div>
      </main>

      {/* SCHEDULE REPORT MODAL */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleSchedule}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Schedule Reports
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Set up automatic report delivery.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSchedule(false)}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <label className="block text-xs font-semibold">
              Report name

              <input
                required
                value={scheduleData.name}
                onChange={e => setScheduleData({
                  ...scheduleData,
                  name: e.target.value
                })}
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Email address

              <input
                required
                type="email"
                placeholder="example@email.com"
                value={scheduleData.email}
                onChange={e => setScheduleData({
                  ...scheduleData,
                  email: e.target.value
                })}
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Frequency

              <select
                value={scheduleData.frequency}
                onChange={e => setScheduleData({
                  ...scheduleData,
                  frequency: e.target.value
                })}
                className={`mt-2 ${inputClass}`}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </label>

            <label className="block text-xs font-semibold">
              File format

              <select
                value={scheduleData.format}
                onChange={e => setScheduleData({
                  ...scheduleData,
                  format: e.target.value
                })}
                className={`mt-2 ${inputClass}`}
              >
                <option>PDF</option>
                <option>CSV</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSchedule(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT DETAILS MODAL */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Report Details
              </h3>

              <button onClick={() => setShowReport(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl bg-sky-50 p-4">
              <FileText size={26} className="text-sky-700" />

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {showReport.name}
                </p>

                <p className="text-xs text-slate-500">
                  {showReport.category}
                </p>
              </div>
            </div>

            {[
              ["Report name", showReport.name],
              ["Category", showReport.category],
              ["Period", showReport.period],
              ["Generated", showReport.generated],
              ["Format", showReport.format]
            ].map(([label, value]) => (
              <div key={label} className="mb-2 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {value}
                </p>
              </div>
            ))}

            <button
              onClick={() => {
                const content = [
                  ["Report", showReport.name],
                  ["Category", showReport.category],
                  ["Period", showReport.period],
                  ["Generated", showReport.generated],
                  ["Format", showReport.format]
                ];

                const csv = content.map(row => row.join(",")).join("\n");

                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;"
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${showReport.name.replace(/\s+/g, "-")}.csv`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#287ba5] py-3 text-xs font-semibold text-white"
            >
              <Download size={15} />
              Export report
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
