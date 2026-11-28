import { useState, useEffect, useMemo, useId } from "react";
import {
  Users,
  ShieldCheck,
  Clock3,
  Activity,
  BriefcaseBusiness,
  Link2,
  LockKeyhole,
  Database,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Search,
  RefreshCw,
  X,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import type {
  ReportOverview,
  ReportFilter,
  ReportFilterOptions,
  ReportCatalogItem,
  ReportDetail,
  StatMetric,
} from "../../types/report";

const iconMap: Record<string, any> = {
  users: Users,
  "shield-check": ShieldCheck,
  briefcase: BriefcaseBusiness,
  link: Link2,
  lock: LockKeyhole,
  clock: Clock3,
  database: Database,
  chart: ChartNoAxesColumnIncreasing,
};

function getIcon(key: string, title?: string) {
  if (iconMap[key]) return iconMap[key];
  const t = (title || "").toLowerCase();
  if (t.includes("user")) return Users;
  if (t.includes("privileged") || t.includes("access")) return ShieldCheck;
  if (t.includes("organisation") || t.includes("organization")) return BriefcaseBusiness;
  if (t.includes("integration")) return Link2;
  if (t.includes("security")) return LockKeyhole;
  if (t.includes("audit")) return Clock3;
  if (t.includes("governance") || t.includes("data")) return Database;
  return ChartNoAxesColumnIncreasing;
}

function StatCard({ item }: { item: StatMetric }) {
  const Icon = getIcon("", item.label);
  const isGreen = item.tone === "green";

  return (
    <div className="flex min-h-[72px] items-center gap-3.5 rounded-xl border border-[#D8E5EB] bg-white p-3.5 shadow-[0_4px_12px_rgba(24,62,86,0.04)] transition hover:shadow-md">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isGreen ? "bg-[#E5F6F1] text-[#159879]" : "bg-[#E8F2F8] text-[#2383B5]"
        }`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-slate-500">{item.label}</p>
          {item.change && (
            <span
              className={`text-xs font-semibold ${
                item.change.startsWith("+")
                  ? "text-[#159879]"
                  : item.change.startsWith("-")
                  ? "text-[#2383B5]"
                  : "text-slate-400"
              }`}
            >
              {item.change}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[20px] font-bold leading-6 text-[#123B5C]">{item.value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{item.note}</p>
      </div>
    </div>
  );
}

function AdoptionChart({ trend }: { trend: { month: string; activeUsers: number; y: number }[] }) {
  const gradientId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; activeUsers: number } | null>(null);

  if (!trend || trend.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-[13px] text-slate-400">
        No trend data available.
      </div>
    );
  }

  // Generate SVG path coordinate points
  const points = trend.map((t, i) => {
    const x = 20 + i * (660 / Math.max(1, trend.length - 1));
    const y = Math.max(30, Math.min(160, t.y || 150 - i * 15));
    return { x, y, month: t.month, activeUsers: t.activeUsers };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} 175 L ${points[0].x} 175 Z`;

  return (
    <div className="relative h-[220px] w-full px-4 pb-3 pt-2">
      {hoveredPoint && (
        <div className="absolute right-4 top-2 rounded-md border border-[#CDE1EB] bg-[#F4F9FB] px-2.5 py-1 text-xs text-[#123B5C] shadow-sm">
          <span className="font-semibold">{hoveredPoint.month}:</span> {hoveredPoint.activeUsers.toLocaleString()} active users
        </div>
      )}
      <svg
        viewBox="0 0 700 190"
        preserveAspectRatio="none"
        className="h-[185px] w-full"
        role="img"
        aria-label="Monthly active users trend"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#63B9A4" stopOpacity=".22" />
            <stop offset="100%" stopColor="#63B9A4" stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={pathD} fill="none" stroke="#2785B2" strokeWidth="3" strokeLinecap="round" />
        {points.map((p) => (
          <g key={p.month} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#FFFFFF"
              stroke="#2785B2"
              strokeWidth="2.5"
              onMouseEnter={() => setHoveredPoint({ month: p.month, activeUsers: p.activeUsers })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            <text x={p.x} y="186" textAnchor="middle" fill="#8295A5" fontSize="9" fontWeight="500">
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BadgeRenderer({ value }: { value: string }) {
  const v = (value || "").toLowerCase();
  let bg = "bg-slate-100 text-slate-700";

  if (v.includes("active") || v.includes("verified") || v.includes("healthy") || v.includes("operational") || v.includes("compliant") || v.includes("resolved") || v.includes("low")) {
    bg = "bg-[#E6F7F1] text-[#16896F]";
  } else if (v.includes("high") || v.includes("critical") || v.includes("disabled") || v.includes("degraded") || v.includes("unavailable")) {
    bg = "bg-rose-50 text-rose-700 border border-rose-200/60";
  } else if (v.includes("medium") || v.includes("investigating") || v.includes("review") || v.includes("pending")) {
    bg = "bg-amber-50 text-amber-700 border border-amber-200/60";
  } else if (v.includes("admin") || v.includes("coordinator") || v.includes("manager")) {
    bg = "bg-[#E8F2F8] text-[#1D6E97]";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${bg}`}>
      {value}
    </span>
  );
}

export default function ReportsPage() {
  const [filterOptions, setFilterOptions] = useState<ReportFilterOptions>({
    dateRanges: ["01–30 June 2025", "01–31 May 2025", "01–30 April 2025", "Last 7 days", "Last 30 days", "Last 90 days", "This year", "All time"],
    organisations: ["All organisations", "National Disaster Management Centre", "CareLink Shelter Network", "Global Relief Network", "Community Response Alliance"],
    regions: ["All regions", "Western Province", "Central Province", "Southern Province", "Northern Province", "Eastern Province", "North Western Province", "North Central Province", "Uva Province", "Sabaragamuwa Province"],
  });

  const [dateRange, setDateRange] = useState("Last 30 days");
  const [organisation, setOrganisation] = useState("All organisations");
  const [region, setRegion] = useState("All regions");
  const [appliedFilters, setAppliedFilters] = useState<ReportFilter>({
    dateRange: "Last 30 days",
    organisation: "All organisations",
    region: "All regions",
  });

  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report Modal / Drawer State
  const [activeModalReport, setActiveModalReport] = useState<ReportCatalogItem | null>(null);
  const [modalDetail, setModalDetail] = useState<ReportDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [previewSearch, setPreviewSearch] = useState("");
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load initial filter options & report overview
  useEffect(() => {
    async function init() {
      try {
        const options = await reportService.getFilterOptions();
        setFilterOptions(options);
        if (options.dateRanges.length > 0) {
          setDateRange(options.dateRanges[0]);
          setAppliedFilters((prev) => ({ ...prev, dateRange: options.dateRanges[0] }));
        }
      } catch (err: any) {
        // Fallback filter options remain active
      }
    }
    init();
  }, []);

  // Fetch overview whenever appliedFilters changes
  useEffect(() => {
    let isCancelled = false;
    async function loadOverview() {
      setLoading(true);
      setError(null);
      try {
        const data = await reportService.getOverview(appliedFilters);
        if (!isCancelled) {
          setOverview(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "Failed to load report overview.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();
    return () => {
      isCancelled = true;
    };
  }, [appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters({ dateRange, organisation, region });
  };

  const resetFilters = () => {
    const defaultRange = filterOptions.dateRanges[0] || "Last 30 days";
    setDateRange(defaultRange);
    setOrganisation("All organisations");
    setRegion("All regions");
    setAppliedFilters({ dateRange: defaultRange, organisation: "All organisations", region: "All regions" });
  };

  const openReportModal = async (report: ReportCatalogItem) => {
    setActiveModalReport(report);
    setModalLoading(true);
    setModalError(null);
    setModalDetail(null);
    setPreviewSearch("");

    try {
      const detail = await reportService.generateReport(report.id, appliedFilters);
      setModalDetail(detail);
    } catch (err: any) {
      setModalError(err.message || "Failed to generate report preview.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeReportModal = () => {
    setActiveModalReport(null);
    setModalDetail(null);
    setModalError(null);
  };

  const handleExport = async (format: "csv" | "json") => {
    if (!activeModalReport) return;
    setExportLoading(format);
    setExportNotice(null);

    try {
      const res = await reportService.exportReport(activeModalReport.id, {
        format,
        dateRange: appliedFilters.dateRange,
        organisation: appliedFilters.organisation,
        region: appliedFilters.region,
        rationale: "Official Administrative Governance Export",
      });
      setExportNotice(`Successfully exported ${res.fileName}`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportLoading(null);
    }
  };

  // Filter preview table rows
  const filteredRows = useMemo(() => {
    if (!modalDetail?.rows) return [];
    if (!previewSearch.trim()) return modalDetail.rows;

    const term = previewSearch.toLowerCase();
    return modalDetail.rows.filter((row) =>
      Object.values(row).some((val) => val != null && String(val).toLowerCase().includes(term))
    );
  }, [modalDetail, previewSearch]);

  const stats = overview?.stats || [
    { label: "Monthly active users", value: "14,842", note: "80.3% of registered", tone: "blue", change: "+8.4%" },
    { label: "Access reviews completed", value: "96%", note: "142 privileged users", tone: "green", change: "+2%" },
    { label: "Security response time", value: "18m", note: "-22% this month", tone: "blue", change: "-22%" },
    { label: "Platform availability", value: "99.94%", note: "30-day average", tone: "green", change: "Normal" },
  ];

  const roleData = overview?.usersByRole || [
    { label: "Citizen", count: 8420, value: "8,420", width: "100%", roleKey: "Citizen", percentage: 45.6 },
    { label: "Volunteer", count: 4218, value: "4,218", width: "50%", roleKey: "Volunteer", percentage: 22.8 },
    { label: "Case Manager", count: 2184, value: "2,184", width: "26%", roleKey: "EmergencyCoordinator", percentage: 11.8 },
    { label: "Partner Officer", count: 1284, value: "1,284", width: "15%", roleKey: "PartnerOfficer", percentage: 6.9 },
    { label: "Operations Staff", count: 2376, value: "2,376", width: "28%", roleKey: "Admin", percentage: 12.9 },
  ];

  const catalogReports = overview?.reports || [];

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-5 md:px-6">
      {/* Header Banner */}
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#123B5C]">System & Governance Reports</h1>
          <p className="text-[13px] text-slate-500">
            Real-time administrative telemetry, compliance certifications, and humanitarian response analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-[#B9D0DC] bg-white px-3 py-2 text-sm font-medium text-[#176F9F] shadow-sm transition hover:bg-[#EDF6FA]"
            title="Reset to default filters"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report filters */}
      <section className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[#D8E5EB] bg-white p-3.5 shadow-[0_4px_12px_rgba(24,62,86,0.04)] md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-600">
            <SlidersHorizontal size={12} className="text-[#2383B5]" /> Date range
          </span>
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-sm sm:text-[15px] text-[#173B59] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
          >
            {filterOptions.dateRanges.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-600">
            Organisation
          </span>
          <select
            value={organisation}
            onChange={(event) => setOrganisation(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-sm sm:text-[15px] text-[#173B59] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
          >
            {filterOptions.organisations.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-600">
            Region
          </span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-sm sm:text-[15px] text-[#173B59] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
          >
            {filterOptions.regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2785B2] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F6E95] xl:w-auto"
          >
            Apply filters
          </button>
        </div>
      </section>

      {/* Applied filter summary */}
      {(appliedFilters.organisation !== "All organisations" ||
        appliedFilters.region !== "All regions" ||
        appliedFilters.dateRange !== filterOptions.dateRanges[0]) && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
          <span className="font-semibold text-[#173B59]">Active Filters:</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 font-medium text-[#123B5C] shadow-sm">
            {appliedFilters.dateRange}
          </span>
          {appliedFilters.organisation !== "All organisations" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 font-medium text-[#123B5C] shadow-sm">
              {appliedFilters.organisation}
            </span>
          )}
          {appliedFilters.region !== "All regions" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 font-medium text-[#123B5C] shadow-sm">
              {appliedFilters.region}
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-[#2785B2] underline hover:text-[#185370]"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error state alert */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="text-sm font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </section>

      {/* Analytics */}
      <section className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2.1fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-[#D8E5EB] bg-white shadow-[0_4px_12px_rgba(24,62,86,0.04)]">
          <div className="flex items-center justify-between border-b border-[#DCE7EC] px-4 py-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#173B59]">User adoption trend</h2>
              <p className="mt-0.5 text-xs text-slate-400">Monthly active users across relief network</p>
            </div>
            <span className="rounded-md bg-[#E6F7F1] px-2 py-0.5 text-xs font-bold text-[#16896F]">
              {overview?.adoptionGrowthBadge || "+8.4%"}
            </span>
          </div>
          <AdoptionChart trend={overview?.adoptionTrend || []} />
        </div>

        <div className="rounded-xl border border-[#D8E5EB] bg-white shadow-[0_4px_12px_rgba(24,62,86,0.04)]">
          <div className="border-b border-[#DCE7EC] px-4 py-3">
            <h2 className="text-base sm:text-lg font-bold text-[#173B59]">Users by role</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {overview?.totalRegisteredUsers
                ? `${overview.totalRegisteredUsers.toLocaleString()} registered users`
                : "18,482 registered users"}
            </p>
          </div>
          <div className="space-y-4 px-4 py-4">
            {roleData.map((role) => (
              <div key={role.label} className="grid grid-cols-[90px_1fr_45px] items-center gap-2.5">
                <span className="truncate text-sm font-medium text-[#526C80]">{role.label}</span>
                <div className="h-[7px] overflow-hidden rounded-full bg-[#E8EEF1]">
                  <div
                    className="h-full rounded-full bg-[#63B9A4] transition-all duration-500"
                    style={{ width: role.width }}
                  />
                </div>
                <span className="text-right text-sm font-bold text-[#173B59]">{role.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report library */}
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#173B59]">Report library</h2>
            <p className="text-[13px] text-slate-400">
              Generate on-demand compliance previews and export official audit datasets.
            </p>
          </div>
          <span className="text-[13px] font-semibold text-slate-500">
            {catalogReports.length} reports available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {catalogReports.map((report) => {
            const Icon = getIcon(report.iconKey, report.title);
            return (
              <button
                key={report.id}
                type="button"
                onClick={() => openReportModal(report)}
                className="group flex flex-col justify-between rounded-xl border border-[#D8E5EB] bg-white p-3.5 text-left shadow-[0_4px_12px_rgba(24,62,86,0.04)] transition hover:-translate-y-0.5 hover:border-[#8CBBD0] hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F2F8] text-[#2383B5] transition group-hover:bg-[#2785B2] group-hover:text-white">
                      <Icon size={19} />
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {report.category}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#173B59] group-hover:text-[#2785B2]">
                    {report.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
                    {report.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#EEF4F7] pt-2 text-xs text-slate-400">
                  <span>~{report.estimatedRecords.toLocaleString()} records</span>
                  <span className="flex items-center gap-1 font-semibold text-[#2785B2] transition group-hover:translate-x-0.5">
                    Preview & Export <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* REPORT MODAL / DRAWER */}
      {activeModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F2F8] text-[#2383B5]">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#123B5C]">{activeModalReport.title}</h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {activeModalReport.category}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-400">
                    {modalDetail ? modalDetail.filterSummary : "Standard humanitarian scope"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeReportModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {modalLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw size={28} className="animate-spin text-[#2785B2]" />
                  <p className="text-[12px] font-medium">Generating report dataset...</p>
                </div>
              ) : modalError ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl bg-rose-50 p-6 text-rose-700">
                  <AlertCircle size={32} />
                  <p className="text-sm font-semibold">{modalError}</p>
                </div>
              ) : modalDetail ? (
                <div>
                  {/* Summary Metric Cards */}
                  {modalDetail.summaryMetrics && Object.keys(modalDetail.summaryMetrics).length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {Object.entries(modalDetail.summaryMetrics).map(([key, val]) => (
                        <div key={key} className="rounded-xl border border-[#DCE7EC] bg-[#F8FBFC] p-3 text-center">
                          <p className="text-xs font-medium text-slate-500">{key}</p>
                          <p className="mt-0.5 text-base font-bold text-[#123B5C]">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table Toolbar */}
                  <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search within preview..."
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="h-9 w-full rounded-lg border border-[#D5E3EA] bg-white pl-9 pr-3 text-sm sm:text-[15px] text-[#173B59] outline-none transition focus:border-[#2785B2] focus:ring-1 focus:ring-[#2785B2]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={exportLoading !== null}
                        onClick={() => handleExport("csv")}
                        className="flex items-center gap-1.5 rounded-lg border border-[#B9D0DC] bg-white px-3 py-1.5 text-sm font-semibold text-[#176F9F] shadow-sm transition hover:bg-[#EDF6FA] disabled:opacity-50"
                      >
                        <FileSpreadsheet size={14} className="text-[#159879]" />
                        {exportLoading === "csv" ? "Exporting..." : "Export CSV"}
                      </button>

                      <button
                        type="button"
                        disabled={exportLoading !== null}
                        onClick={() => handleExport("json")}
                        className="flex items-center gap-1.5 rounded-lg border border-[#B9D0DC] bg-white px-3 py-1.5 text-sm font-semibold text-[#176F9F] shadow-sm transition hover:bg-[#EDF6FA] disabled:opacity-50"
                      >
                        <FileCode size={14} className="text-[#2383B5]" />
                        {exportLoading === "json" ? "Exporting..." : "Export JSON"}
                      </button>
                    </div>
                  </div>

                  {exportNotice && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#E6F7F1] px-3 py-2 text-sm font-medium text-[#16896F]">
                      <CheckCircle2 size={14} />
                      <span>{exportNotice}</span>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="overflow-x-auto rounded-xl border border-[#DCE7EC]">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#DCE7EC] bg-[#F4F9FB]">
                          {modalDetail.columns.map((col) => (
                            <th
                              key={col.key}
                              className={`px-3 py-2.5 font-bold text-[#173B59] ${
                                col.align === "center"
                                  ? "text-center"
                                  : col.align === "right"
                                  ? "text-right"
                                  : "text-left"
                              }`}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBF2F5] bg-white">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td colSpan={modalDetail.columns.length} className="py-8 text-center text-slate-400">
                              No matching preview records found.
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map((row, rIdx) => (
                            <tr key={rIdx} className="transition hover:bg-[#F9FCFD]">
                              {modalDetail.columns.map((col) => {
                                const raw = row[col.key];
                                const strVal = raw != null ? String(raw) : "—";
                                return (
                                  <td
                                    key={col.key}
                                    className={`px-3 py-2.5 text-slate-600 ${
                                      col.align === "center"
                                        ? "text-center"
                                        : col.align === "right"
                                        ? "text-right"
                                        : "text-left"
                                    }`}
                                  >
                                    {col.type === "badge" ? (
                                      <BadgeRenderer value={strVal} />
                                    ) : (
                                      <span className={col.type === "number" ? "font-mono font-medium" : ""}>
                                        {strVal}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Record Count Note */}
                  <div className="mt-3 flex items-center justify-between text-[13px] text-slate-400">
                    <span>
                      Showing {filteredRows.length} preview records • Total dataset records: {modalDetail.totalRecords.toLocaleString()}
                    </span>
                    <span>Generated by {modalDetail.generatedBy}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-3">
              <button
                type="button"
                onClick={closeReportModal}
                className="rounded-lg border border-[#B9D0DC] bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
