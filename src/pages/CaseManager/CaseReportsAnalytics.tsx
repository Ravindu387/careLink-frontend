import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  ChevronRight,
  Download,
  Printer,
  Inbox,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ArrowUpToLine,
  Users,
  ChartLine,
  X,
  FileText,
  MapPin,
  CalendarDays,
  Filter,
  RefreshCw,
  Server,
  CheckCircle2,
} from "lucide-react";

import { caseReportsService } from "../../services/caseReportsService";
import type {
  ReportsFilterDto,
  ReportsAnalyticsResponse,
  ReportItem,
} from "../../types/caseReports";

// Icon dictionary for report library
const REPORT_ICON_MAP: Record<string, React.ElementType> = {
  Inbox,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ArrowUpToLine,
  Sparkles,
  Users,
  ChartLine,
};

const CaseReportsAnalytics: React.FC = () => {
  // Filter states
  const [dateRange, setDateRange] = useState("18–25 June 2025");
  const [crisisEvent, setCrisisEvent] = useState("Monsoon Floods 2025");
  const [operationalArea, setOperationalArea] = useState("All areas");

  const [appliedFilters, setAppliedFilters] = useState<ReportsFilterDto>({
    dateRange: "18–25 June 2025",
    crisisEvent: "Monsoon Floods 2025",
    operationalArea: "All areas",
  });

  // Data & Backend states
  const [reportsData, setReportsData] = useState<ReportsAnalyticsResponse | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // UI states
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Flash success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Load analytics data
  const loadAnalytics = useCallback(async (filters: ReportsFilterDto, isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await caseReportsService.getReportsAnalytics(filters);
      setReportsData(result.data);
      setIsLiveBackend(result.isLiveBackend);
    } catch (err) {
      console.error("Failed to load reports analytics:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(appliedFilters);
  }, [loadAnalytics, appliedFilters]);

  // Apply filters
  const handleApplyFilters = () => {
    const newFilters: ReportsFilterDto = {
      dateRange,
      crisisEvent,
      operationalArea,
    };
    setAppliedFilters(newFilters);
    loadAnalytics(newFilters);
    showSuccess(`Report filters updated: ${operationalArea} (${dateRange})`);
  };

  // Export report
  const handleExport = async () => {
    if (!reportsData) return;
    setIsExporting(true);
    try {
      await caseReportsService.downloadExportReport(
        appliedFilters,
        reportsData.analytics,
        reportsData.categories
      );
      showSuccess("Report exported to CSV successfully.");
    } catch {
      showSuccess("Failed to export report CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Resolution Chart calculations
  const trendPoints = reportsData?.resolutionTrend || [];
  const maxReceived = useMemo(() => {
    const maxVal = Math.max(...trendPoints.map((p) => p.received), 100);
    return maxVal > 0 ? maxVal : 350;
  }, [trendPoints]);

  const chartPoints = useMemo(() => {
    return trendPoints.map((item, index) => {
      const x = 20 + index * 125;
      const y = 180 - (item.received / maxReceived) * 145;
      return `${x},${y}`;
    });
  }, [trendPoints, maxReceived]);

  const chartLine = useMemo(() => chartPoints.join(" "), [chartPoints]);
  const chartArea = useMemo(
    () => `20,185 ${chartLine} ${20 + (trendPoints.length - 1) * 125},185`,
    [chartLine, trendPoints]
  );

  const maxCategoryValue = useMemo(() => {
    if (!reportsData?.categories || reportsData.categories.length === 0) return 486;
    return Math.max(...reportsData.categories.map((c) => c.value), 100);
  }, [reportsData]);

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-7">
        {/* BREADCRUMB */}
        <div className="mb-7 flex items-center gap-2 text-[13px] text-slate-400">
          <span>Operations</span>
          <ChevronRight size={12} />
          <span>Case Management</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#173e5b]">
            Case Reports & Analytics
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#173e5b]">
              Case Reports & Analytics
            </h1>
            <p className="mt-2 text-[13px] text-slate-500">
              Analyse intake, verification, resolution, SLA performance, and human decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAnalytics(appliedFilters, true)}
              disabled={isRefreshing}
              title="Refresh reports analytics"
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-3.5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50 cursor-pointer"
            >
              <Printer size={15} />
              Print
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-[#287da8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#17678f] disabled:opacity-60 cursor-pointer"
            >
              <Download size={15} />
              {isExporting ? "Exporting..." : "Export report"}
            </button>
          </div>
        </div>

        {/* SUCCESS / TOAST NOTIFICATION */}
        {successMessage && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-800"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* SERVER STATUS / SOURCE ALERT */}
        <div
          className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3.5 ${
            isLiveBackend
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-sky-200 bg-sky-50 text-sky-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {isLiveBackend ? (
              <Server size={18} className="text-emerald-600" />
            ) : (
              <CheckCircle2 size={18} className="text-sky-700" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold">
                  {isLiveBackend
                    ? "Live Reports API Active (Port 5277)"
                    : "Demonstration Analytics Mode"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    isLiveBackend
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-sky-200 text-sky-800"
                  }`}
                >
                  {isLiveBackend ? "LIVE" : "DEMO"}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {isLiveBackend
                  ? `Real-time calculations for ${appliedFilters.operationalArea} · Event: ${appliedFilters.crisisEvent}`
                  : "Serving simulated disaster dataset for the Greater Riverton flood operations."}
              </p>
            </div>
          </div>

          <span className="hidden text-[13px] text-slate-400 sm:block">
            {reportsData?.generatedAt
              ? `Generated ${new Date(reportsData.generatedAt).toLocaleTimeString()}`
              : "Updated just now"}
          </span>
        </div>

        {/* =====================================
            FILTER SECTION
        ===================================== */}
        <section className="mb-3 rounded-lg border border-[#d5e2eb] bg-white p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            {/* DATE RANGE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">
                Date range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              >
                <option value="18–25 June 2025">18–25 June 2025</option>
                <option value="1–7 June 2025">1–7 June 2025</option>
                <option value="1–30 June 2025">1–30 June 2025</option>
                <option value="1–31 May 2025">1–31 May 2025</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="All time">All time</option>
              </select>
            </div>

            {/* CRISIS EVENT */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">
                Crisis event
              </label>
              <select
                value={crisisEvent}
                onChange={(e) => setCrisisEvent(e.target.value)}
                className="w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              >
                <option value="Monsoon Floods 2025">Monsoon Floods 2025</option>
                <option value="Coastal Storm 2025">Coastal Storm 2025</option>
                <option value="Landslide Emergency 2025">Landslide Emergency 2025</option>
                <option value="All crisis events">All crisis events</option>
              </select>
            </div>

            {/* OPERATIONAL AREA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">
                Operational area
              </label>
              <select
                value={operationalArea}
                onChange={(e) => setOperationalArea(e.target.value)}
                className="w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              >
                <option value="All areas">All areas</option>
                <option value="North Ward">North Ward</option>
                <option value="South Ward">South Ward</option>
                <option value="Eastbank">Eastbank</option>
                <option value="West District">West District</option>
              </select>
            </div>

            {/* APPLY */}
            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-sm font-semibold text-[#287da8] transition hover:bg-sky-50 lg:w-auto cursor-pointer"
              >
                Apply filters
              </button>
            </div>
          </div>
        </section>

        {/* =====================================
            ANALYTICS KPI CARDS
        ===================================== */}
        <section className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* CASES RECEIVED */}
          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-700">
              <Inbox size={19} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Cases received</p>
              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {isLoading && !reportsData
                  ? "..."
                  : reportsData?.analytics.received.toLocaleString()}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {reportsData?.analytics.receivedTrend || "+8% today"}
              </p>
            </div>
          </div>

          {/* CASES RESOLVED */}
          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Check size={19} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Cases resolved</p>
              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {isLoading && !reportsData
                  ? "..."
                  : reportsData?.analytics.resolved.toLocaleString()}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {reportsData?.analytics.resolutionRate} resolution
              </p>
            </div>
          </div>

          {/* MEDIAN RESPONSE */}
          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-700">
              <Clock size={19} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Median response</p>
              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {isLoading && !reportsData
                  ? "..."
                  : reportsData?.analytics.medianResponse}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {reportsData?.analytics.responseTrend || "-18 min this week"}
              </p>
            </div>
          </div>

          {/* AI OVERRIDES */}
          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="text-xs text-slate-400">AI overrides</p>
              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {isLoading && !reportsData
                  ? "..."
                  : reportsData?.analytics.aiOverrides}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {reportsData?.analytics.aiOverridesDetails || "126 of 1,498 reviews"}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================
            CHARTS SECTION
        ===================================== */}
        <section className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-[2.1fr_0.95fr]">
          {/* RESOLUTION PERFORMANCE */}
          <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="flex items-center justify-between border-b border-[#d5e2eb] px-4 py-4">
              <div>
                <h3 className="text-base font-semibold text-[#173e5b]">
                  Resolution performance
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Cases received and resolved across {appliedFilters.operationalArea}
                </p>
              </div>

              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                Target 80%
              </span>
            </div>

            {/* SVG LINE CHART */}
            <div className="px-4 pb-4 pt-5">
              <div className="h-[225px] w-full">
                <svg
                  viewBox="0 0 790 200"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  {/* GRID */}
                  {[35, 85, 135, 185].map((y) => (
                    <line
                      key={y}
                      x1="20"
                      y1={y}
                      x2="770"
                      y2={y}
                      stroke="#edf2f5"
                      strokeWidth="1"
                    />
                  ))}

                  {/* AREA */}
                  {chartPoints.length > 0 && (
                    <polygon points={chartArea} fill="#e9f5f1" />
                  )}

                  {/* LINE */}
                  {chartPoints.length > 0 && (
                    <polyline
                      points={chartLine}
                      fill="none"
                      stroke="#287da8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* POINTS */}
                  {chartPoints.map((point, index) => {
                    const [cx, cy] = point.split(",");
                    return (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r="3"
                        fill="#287da8"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* X AXIS */}
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                {reportsData?.resolutionTrend.map((item) => (
                  <span key={item.day}>{item.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* CASES BY CATEGORY */}
          <div className="rounded-xl border border-[#d5e2eb] bg-white shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="border-b border-[#d5e2eb] px-4 py-4">
              <h3 className="text-base font-semibold text-[#173e5b]">
                Cases by category
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {reportsData?.analytics.received.toLocaleString() || "0"} received in{" "}
                {appliedFilters.operationalArea}
              </p>
            </div>

            <div className="space-y-5 px-4 py-5">
              {reportsData?.categories.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-[85px] shrink-0 text-xs text-slate-600">
                    {item.name}
                  </span>

                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#e8eef1]">
                    <div
                      className="h-full rounded-full bg-[#65b8a0] transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (item.value / maxCategoryValue) * 100)}%`,
                      }}
                    />
                  </div>

                  <span className="w-8 text-right text-xs font-semibold text-[#173e5b]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================
            REPORT LIBRARY
        ===================================== */}
        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">Report library</h2>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-sky-700 cursor-pointer"
            >
              <Filter size={13} />
              {showFilters ? "Hide details" : "Report details"}
            </button>
          </div>

          {/* REPORT GRID */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {reportsData?.reportLibrary.map((report) => {
              const Icon = REPORT_ICON_MAP[report.iconKey] || Inbox;

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="flex min-h-[68px] items-center justify-between rounded-xl border border-[#d5e2eb] bg-white px-3 py-3 text-left shadow-[0_5px_15px_rgba(30,64,90,0.04)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md cursor-pointer"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`shrink-0 rounded-lg p-2.5 ${report.color}`}>
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#173e5b]">
                        {report.title}
                      </p>

                      {showFilters && (
                        <p className="mt-1 text-xs text-slate-400">
                          {report.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={18} className="ml-2 shrink-0 text-slate-700" />
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* =====================================
          REPORT DETAILS MODAL
      ===================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${selectedReport.color}`}>
                  {React.createElement(
                    REPORT_ICON_MAP[selectedReport.iconKey] || Inbox,
                    { size: 20 }
                  )}
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#173e5b]">
                    {selectedReport.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-slate-400">
                    CareLink Case Management Reports · {selectedReport.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              {selectedReport.description}
            </p>

            <div className="my-5 space-y-3 rounded-lg bg-[#f5f9fb] p-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CalendarDays size={15} className="text-sky-700" />
                <span>Date range: {appliedFilters.dateRange}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin size={15} className="text-sky-700" />
                <span>Area: {appliedFilters.operationalArea}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <FileText size={15} className="text-sky-700" />
                <span>Event: {appliedFilters.crisisEvent}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  handleExport();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#287da8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#17678f] cursor-pointer"
              >
                <Download size={15} />
                Export CSV
              </button>

              <button
                onClick={() => {
                  setSelectedReport(null);
                  handlePrint();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#b9d0df] px-4 py-3 text-sm font-semibold text-[#287da8] hover:bg-sky-50 cursor-pointer"
              >
                <Printer size={15} />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseReportsAnalytics;
