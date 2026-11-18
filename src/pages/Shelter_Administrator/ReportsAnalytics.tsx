import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronRight,
  ChevronDown,
  Download,
  Printer,
  Users,
  Check,
  Package,
  BedDouble,
  FileText,
  HeartPulse,
  ChartNoAxesColumn,
  ClipboardList,
  UserRound,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { reportsAnalyticsService } from "../../services/reportsAnalyticsService";
import type {
  ReportsAnalytics,
  ReportsMetrics,
  TrendPoint,
  ReportDefinition,
} from "../../types/reportsAnalytics";

/* ================= DEFAULT FALLBACKS ================= */

const defaultDistricts = [
  "All districts",
  "Central District",
  "North District",
  "Eastbank",
  "West District",
];

const defaultShelters = [
  "All shelters",
  "Riverton Central",
  "North Community",
  "St. Mary Civic",
  "Lakeside Sports",
];

const defaultDateRanges = [
  "18–25 June 2025",
  "Last 7 days",
  "Last 30 days",
  "This month",
  "Last month",
];

const fallbackMetrics: ReportsMetrics = {
  occupancy: 66.2,
  admissions: 342,
  approved: 84,
  approvalCount: 287,
  resources: 12480,
  pending: 14,
  rejected: 7,
  departed: 158,
  occupancyChange: "+4.8% in period",
};

const fallbackTrendData: TrendPoint[] = [
  { day: "18 Jun", value: 48 },
  { day: "19 Jun", value: 55 },
  { day: "20 Jun", value: 54 },
  { day: "21 Jun", value: 65 },
  { day: "22 Jun", value: 64 },
  { day: "23 Jun", value: 77 },
  { day: "24 Jun", value: 83 },
];

const fallbackReports: ReportDefinition[] = [
  {
    id: "REP-01",
    title: "Shelter Occupancy Report",
    description: "Capacity, occupancy, and available beds",
    category: "Shelter",
    iconKey: "file",
  },
  {
    id: "REP-02",
    title: "Resident Registration Report",
    description: "Admissions, departures, and demographics",
    category: "Residents",
    iconKey: "users",
  },
  {
    id: "REP-03",
    title: "Bed Availability Report",
    description: "Room and bed status by shelter",
    category: "Shelter",
    iconKey: "bed",
  },
  {
    id: "REP-04",
    title: "Resource Inventory Report",
    description: "Stock levels, distribution, and expiry",
    category: "Resources",
    iconKey: "package",
  },
  {
    id: "REP-05",
    title: "Accommodation Request Report",
    description: "Request outcomes and assignment times",
    category: "Requests",
    iconKey: "clipboard",
  },
  {
    id: "REP-06",
    title: "Staff Activity Report",
    description: "Shifts, attendance, and responsibilities",
    category: "Staff",
    iconKey: "user",
  },
  {
    id: "REP-07",
    title: "Health & Safety Report",
    description: "Incidents, inspections, and resolutions",
    category: "Health",
    iconKey: "heart",
  },
  {
    id: "REP-08",
    title: "Shelter Performance Overview",
    description: "Cross-shelter operational metrics",
    category: "Performance",
    iconKey: "chart",
  },
];

/* ================= MAIN COMPONENT ================= */

export default function ReportsAnalyticsPage() {
  const [dateRange, setDateRange] = useState("18–25 June 2025");
  const [shelter, setShelter] = useState("All shelters");
  const [district, setDistrict] = useState("All districts");

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "18–25 June 2025",
    shelter: "All shelters",
    district: "All districts",
  });

  const [analytics, setAnalytics] = useState<ReportsAnalytics | null>(null);
  const [library, setLibrary] = useState<ReportDefinition[]>(fallbackReports);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(
    null
  );
  const [notification, setNotification] = useState("");

  /* ================= FETCH ANALYTICS ================= */

  const loadAnalytics = useCallback(async (filters = appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAnalyticsService.getAnalytics({
        dateRange: filters.dateRange,
        shelter: filters.shelter,
        district: filters.district,
      });
      setAnalytics(data);
    } catch (err: any) {
      console.error("Failed to load reports analytics:", err);
      setError(err?.message || "Failed to load reports analytics.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  /* ================= FETCH LIBRARY ================= */

  const loadLibrary = useCallback(async () => {
    try {
      const data = await reportsAnalyticsService.getLibrary();
      if (data && data.length > 0) {
        setLibrary(data);
      }
    } catch (err: any) {
      console.error("Failed to load report library:", err);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadLibrary();
  }, [loadAnalytics, loadLibrary]);

  /* ================= METRICS & OPTIONS ================= */

  const metrics: ReportsMetrics = analytics?.metrics ?? fallbackMetrics;
  const trendData: TrendPoint[] = analytics?.trendData ?? fallbackTrendData;
  const shelters: string[] = analytics?.shelters ?? defaultShelters;
  const districts: string[] = analytics?.districts ?? defaultDistricts;
  const dateRanges: string[] = analytics?.dateRanges ?? defaultDateRanges;

  /* ================= APPLY FILTERS ================= */

  const handleApplyFilters = () => {
    const newFilters = {
      dateRange,
      shelter,
      district,
    };
    setAppliedFilters(newFilters);
    loadAnalytics(newFilters);
    setNotification("Report filters applied successfully.");
  };

  /* ================= CSV EXPORT ================= */

  const handleDownloadCSV = async (reportName: string) => {
    try {
      setExporting(true);
      try {
        const blob = await reportsAnalyticsService.exportCsv(
          reportName,
          appliedFilters
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (apiErr) {
        console.warn("Backend CSV export failed, falling back to client CSV:", apiErr);
        // Fallback to client-generated CSV
        const rows = [
          ["CareLink - Reports & Analytics"],
          ["Report", reportName],
          ["Date range", appliedFilters.dateRange],
          ["Shelter", appliedFilters.shelter],
          ["District", appliedFilters.district],
          [],
          ["Metric", "Value"],
          ["Average occupancy", `${metrics.occupancy}%`],
          ["New admissions", metrics.admissions],
          ["Requests approved", `${metrics.approved}%`],
          ["Approval count", metrics.approvalCount],
          ["Resources distributed", metrics.resources],
          ["Pending requests", metrics.pending],
          ["Rejected requests", metrics.rejected],
          ["Departures", metrics.departed],
        ];

        const csv = rows
          .map((row) =>
            row
              .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
              .join(",")
          )
          .join("\n");

        const blob = new Blob(["\uFEFF" + csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      setNotification(`${reportName} exported successfully.`);
    } catch (err: any) {
      console.error("Export failed:", err);
      alert(err?.message || "Failed to export report CSV.");
    } finally {
      setExporting(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-4 pb-8">
        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[8px] mb-6">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="font-semibold">Reports & Analytics</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[21px] font-normal">Reports & Analytics</h1>

            <p className="text-[9px] text-slate-500 mt-1.5">
              Create transparent operational reports and analyse shelter
              performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAnalytics()}
              title="Refresh Analytics"
              className="h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <RefreshCw
                size={12}
                className={loading ? "animate-spin text-[#1c638a]" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={printReport}
              className="h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-slate-50 flex items-center gap-2 transition"
            >
              <Printer size={12} />
              Print
            </button>

            <button
              onClick={() => handleDownloadCSV("Operational Performance Report")}
              disabled={exporting}
              className="h-[31px] px-3 bg-[#1c638a] text-white rounded-md text-[9px] font-semibold hover:bg-[#144665] flex items-center gap-2 transition disabled:opacity-50"
            >
              <Download size={12} />
              {exporting ? "Exporting..." : "Export report"}
            </button>
          </div>
        </div>

        {/* ERROR STATE */}

        {error && (
          <div className="bg-[#fdebed] border border-[#f8bcc2] text-[#c82e3e] px-4 py-2.5 rounded-lg mb-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadAnalytics()}
              className="underline font-semibold hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* FILTER PANEL */}

        <section className="bg-white border border-[#d5e3e9] rounded-lg p-2.5 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <FilterSelect
              label="Date range"
              value={dateRange}
              options={dateRanges}
              onChange={setDateRange}
            />

            <FilterSelect
              label="Shelter"
              value={shelter}
              options={shelters}
              onChange={setShelter}
            />

            <FilterSelect
              label="District"
              value={district}
              options={districts}
              onChange={setDistrict}
            />

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full h-[30px] px-4 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-[#f0f8fa] transition"
              >
                Apply filters
              </button>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3">
          <MetricCard
            icon={<ChartNoAxesColumn size={16} />}
            title="Average occupancy"
            value={`${metrics.occupancy}%`}
            subtitle={metrics.occupancyChange || "+4.8% in period"}
            color="blue"
          />

          <MetricCard
            icon={<Users size={16} />}
            title="New admissions"
            value={metrics.admissions.toLocaleString()}
            subtitle={`${metrics.departed} departures`}
            color="blue"
          />

          <MetricCard
            icon={<Check size={16} />}
            title="Requests approved"
            value={`${metrics.approved}%`}
            subtitle={`${metrics.approvalCount} of ${metrics.admissions} requests`}
            color="green"
          />

          <MetricCard
            icon={<Package size={16} />}
            title="Resources distributed"
            value={metrics.resources.toLocaleString()}
            subtitle="Across 8 categories"
            color="blue"
          />
        </section>

        {/* CHART SECTION */}

        <section className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-2.5 mb-3">
          {/* OCCUPANCY TREND */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            <div className="px-3.5 py-3 border-b border-slate-200">
              <h2 className="text-[11px] font-semibold">Occupancy trend</h2>

              <p className="text-[7px] text-slate-400 mt-1">
                Daily occupied beds
              </p>
            </div>

            <div className="px-3 pt-3 pb-4">
              <OccupancyChart data={trendData} />
            </div>
          </div>

          {/* REQUEST OUTCOMES */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            <div className="px-3.5 py-3 border-b border-slate-200">
              <h2 className="text-[11px] font-semibold">Request outcomes</h2>

              <p className="text-[7px] text-slate-400 mt-1">
                {metrics.admissions} accommodation requests
              </p>
            </div>

            <div className="p-3">
              <DonutChart
                approved={metrics.approved}
                pending={metrics.pending}
                rejected={metrics.rejected}
              />

              <div className="space-y-2 mt-3 px-3">
                <LegendItem
                  color="#40b99a"
                  label="Approved"
                  value={metrics.approvalCount}
                />

                <LegendItem
                  color="#f2b640"
                  label="Pending"
                  value={metrics.pending}
                />

                <LegendItem
                  color="#ed5260"
                  label="Rejected"
                  value={metrics.rejected}
                />
              </div>
            </div>
          </div>
        </section>

        {/* REPORT LIBRARY */}

        <section className="mb-2">
          <h2 className="text-[10px] font-semibold mb-2">Report library</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {library.map((report) => (
              <button
                key={report.id || report.title}
                onClick={() => setSelectedReport(report)}
                className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm px-2.5 py-3 flex items-center gap-2.5 text-left hover:border-[#45b99b] hover:shadow-md transition min-w-0"
              >
                <div className="w-8 h-8 bg-[#eaf3f8] text-[#287da7] rounded-md flex items-center justify-center shrink-0">
                  {renderReportIcon(report.iconKey)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-semibold truncate">
                    {report.title}
                  </p>

                  <p className="text-[7px] text-slate-400 mt-1 truncate">
                    {report.description}
                  </p>
                </div>

                <ChevronRight size={13} className="text-[#123e60] shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* REPORT DETAILS MODAL */}

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#eaf3f8] text-[#287da7] rounded-lg flex items-center justify-center">
                  {renderReportIcon(selectedReport.iconKey, 21)}
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    {selectedReport.title}
                  </h2>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {selectedReport.category} report
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#f5f9fa] rounded-lg p-4 mt-5 space-y-3">
              <p className="text-xs font-semibold">Report information</p>

              <p className="text-[10px] text-slate-500">
                {selectedReport.description}
              </p>

              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Date range</span>
                <span className="font-semibold">{appliedFilters.dateRange}</span>
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Shelter</span>
                <span className="font-semibold">{appliedFilters.shelter}</span>
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">District</span>
                <span className="font-semibold">{appliedFilters.district}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleDownloadCSV(selectedReport.title);
                  setSelectedReport(null);
                }}
                disabled={exporting}
                className="flex-1 h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#144665] transition disabled:opacity-50"
              >
                <Download size={14} />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}

      {notification && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <Check size={16} className="text-emerald-400 shrink-0" />

          <p className="text-xs">{notification}</p>

          <button
            onClick={() => setNotification("")}
            className="text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= ICON RENDER HELPER ================= */

function renderReportIcon(iconKey: string, size = 15): ReactNode {
  switch (iconKey?.toLowerCase()) {
    case "users":
      return <Users size={size} />;
    case "bed":
      return <BedDouble size={size} />;
    case "package":
      return <Package size={size} />;
    case "clipboard":
      return <ClipboardList size={size} />;
    case "user":
      return <UserRound size={size} />;
    case "heart":
      return <HeartPulse size={size} />;
    case "chart":
      return <ChartNoAxesColumn size={size} />;
    case "file":
    default:
      return <FileText size={size} />;
  }
}

/* ================= FILTER COMPONENT ================= */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="block text-[7px] text-slate-400 mb-1">{label}</label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[30px] appearance-none bg-white border border-[#d5e3e9] rounded-md pl-2.5 pr-7 text-[8px] outline-none focus:border-[#45b99b] cursor-pointer"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        />
      </div>
    </div>
  );
}

/* ================= METRIC CARD ================= */

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green";
}) {
  const styles = {
    blue: "bg-[#eaf3f8] text-[#287da7]",
    green: "bg-[#e5f8f1] text-[#35b48e]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm px-3 py-3 flex items-center gap-2.5 min-w-0">
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${styles[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[7px] text-slate-400">{title}</p>
        <p className="text-[18px] font-bold leading-tight">{value}</p>
        <p className="text-[7px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ================= OCCUPANCY AREA CHART ================= */

function OccupancyChart({ data }: { data: TrendPoint[] }) {
  const width = 700;
  const height = 125;
  const left = 5;
  const right = 5;
  const top = 12;
  const bottom = 20;

  const validData = data && data.length > 0 ? data : fallbackTrendData;

  const points = validData.map((item, index) => ({
    x: left + (index / Math.max(1, validData.length - 1)) * (width - left - right),
    y:
      top +
      (1 - Math.max(0, item.value - 30) / 70) * (height - top - bottom),
    ...item,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - bottom
  } L ${points[0].x} ${height - bottom} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[155px] overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#40b99a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#40b99a" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {[0, 1, 2].map((n) => (
          <line
            key={n}
            x1="0"
            y1={35 + n * 30}
            x2={width}
            y2={35 + n * 30}
            stroke="#edf1f3"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#occupancyFill)" />

        <path
          d={linePath}
          fill="none"
          stroke="#226c98"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((point) => (
          <circle
            key={point.day}
            cx={point.x}
            cy={point.y}
            r="2.2"
            fill="#226c98"
          />
        ))}

        {points.map((point) => (
          <text
            key={point.day}
            x={point.x}
            y={height - 3}
            textAnchor="middle"
            fontSize="8"
            fill="#8194a7"
          >
            {point.day}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ================= DONUT CHART ================= */

function DonutChart({
  approved,
  pending,
  rejected,
}: {
  approved: number;
  pending: number;
  rejected: number;
}) {
  const total = approved + pending + rejected || 1;

  const approvedAngle = (approved / total) * 360;
  const pendingAngle = (pending / total) * 360;

  return (
    <div className="flex justify-center py-1">
      <div
        className="w-[118px] h-[118px] rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(
            #40b99a 0deg ${approvedAngle}deg,
            #f2b640 ${approvedAngle}deg ${approvedAngle + pendingAngle}deg,
            #ed5260 ${approvedAngle + pendingAngle}deg 360deg
          )`,
        }}
      >
        <div className="w-[78px] h-[78px] bg-white rounded-full flex flex-col items-center justify-center">
          <p className="text-[17px] font-bold">
            {Math.round((approved / total) * 100)}%
          </p>
          <p className="text-[7px] text-slate-400">Approved</p>
        </div>
      </div>
    </div>
  );
}

/* ================= CHART LEGEND ================= */

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-[8px]">
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-slate-500">{label}</span>
      </div>

      <span className="font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}
