import { useState, useEffect, useCallback, useMemo } from "react";
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
  Server,
  RefreshCw,
} from "lucide-react";

import { shelterReportsService } from "../../services/shelterReportsService";
import type {
  ShelterReportsFilterDto,
  ShelterMetricsDto,
  ShelterTrendDataPoint,
  ShelterReportItem,
} from "../../types/shelterReports";

function getReportIcon(iconName: string) {
  switch (iconName) {
    case "Users":
      return Users;
    case "BedDouble":
      return BedDouble;
    case "Package":
      return Package;
    case "ClipboardList":
      return ClipboardList;
    case "UserRound":
      return UserRound;
    case "HeartPulse":
      return HeartPulse;
    case "ChartNoAxesColumn":
      return ChartNoAxesColumn;
    default:
      return FileText;
  }
}

export default function ReportsAnalyticsPage() {
  const [dateRange, setDateRange] = useState("18–25 June 2025");
  const [shelter, setShelter] = useState("All shelters");
  const [district, setDistrict] = useState("All districts");

  const [appliedFilters, setAppliedFilters] = useState<ShelterReportsFilterDto>({
    dateRange: "18–25 June 2025",
    shelter: "All shelters",
    district: "All districts",
  });

  const [metrics, setMetrics] = useState<ShelterMetricsDto>({
    occupancy: 66.2,
    admissions: 342,
    approved: 84,
    resources: 12480,
    pending: 14,
    rejected: 7,
    departed: 158,
    approvalCount: 287,
    occupancyTrend: "+4.8% in period",
    admissionsSubtitle: "158 departures",
    resourcesSubtitle: "Across 8 categories",
  });

  const [trendData, setTrendData] = useState<ShelterTrendDataPoint[]>([
    { day: "18 Jun", value: 48 },
    { day: "19 Jun", value: 55 },
    { day: "20 Jun", value: 54 },
    { day: "21 Jun", value: 65 },
    { day: "22 Jun", value: 64 },
    { day: "23 Jun", value: 77 },
    { day: "24 Jun", value: 83 },
  ]);

  const [reportsList, setReportsList] = useState<ShelterReportItem[]>([
    {
      id: 1,
      title: "Shelter Occupancy Report",
      description: "Capacity, occupancy, and available beds",
      iconName: "FileText",
      category: "Shelter",
    },
    {
      id: 2,
      title: "Resident Registration Report",
      description: "Admissions, departures, and demographics",
      iconName: "Users",
      category: "Residents",
    },
    {
      id: 3,
      title: "Bed Availability Report",
      description: "Room and bed status by shelter",
      iconName: "BedDouble",
      category: "Shelter",
    },
    {
      id: 4,
      title: "Resource Inventory Report",
      description: "Stock levels, distribution, and expiry",
      iconName: "Package",
      category: "Resources",
    },
    {
      id: 5,
      title: "Accommodation Request Report",
      description: "Request outcomes and assignment times",
      iconName: "ClipboardList",
      category: "Requests",
    },
    {
      id: 6,
      title: "Staff Activity Report",
      description: "Shifts, attendance, and responsibilities",
      iconName: "UserRound",
      category: "Staff",
    },
    {
      id: 7,
      title: "Health & Safety Report",
      description: "Incidents, inspections, and resolutions",
      iconName: "HeartPulse",
      category: "Health",
    },
    {
      id: 8,
      title: "Shelter Performance Overview",
      description: "Cross-shelter operational metrics",
      iconName: "ChartNoAxesColumn",
      category: "Performance",
    },
  ]);

  const [shelterOptions, setShelterOptions] = useState<string[]>([
    "All shelters",
    "Riverton Central",
    "North Community",
    "St. Mary Civic",
    "Lakeside Sports",
  ]);

  const [districtOptions, setDistrictOptions] = useState<string[]>([
    "All districts",
    "Central District",
    "North District",
    "Eastbank",
    "West District",
  ]);

  const [dateRangeOptions, setDateRangeOptions] = useState<string[]>([
    "18–25 June 2025",
    "Last 7 days",
    "Last 30 days",
    "This month",
    "Last month",
  ]);

  const [selectedReport, setSelectedReport] = useState<ShelterReportItem | null>(null);
  const [notification, setNotification] = useState("");
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const notify = (msg: string) => {
    setNotification(msg);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  const loadData = useCallback(async (filters: ShelterReportsFilterDto, isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const response = await shelterReportsService.getOverview(filters);
      setIsLiveBackend(response.isLiveBackend);
      setMetrics(response.data.metrics);
      setTrendData(response.data.trendData);
      setReportsList(response.data.reports);
      if (response.data.shelters?.length) setShelterOptions(response.data.shelters);
      if (response.data.districts?.length) setDistrictOptions(response.data.districts);
      if (response.data.dateRanges?.length) setDateRangeOptions(response.data.dateRanges);
    } catch {
      notify("Failed to retrieve shelter reports and analytics data.");
    } finally {
      if (isRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(appliedFilters);
  }, [loadData, appliedFilters]);

  const applyFilters = () => {
    const updated = {
      dateRange,
      shelter,
      district,
    };
    setAppliedFilters(updated);
    loadData(updated);
    notify("Report filters applied successfully.");
  };

  // Download overview report data as CSV
  const downloadCSV = async (reportName = "Operational Performance Report") => {
    setIsExporting(true);
    try {
      notify(`Exporting ${reportName}...`);
      const blob = await shelterReportsService.exportOverviewCsv(appliedFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify(`${reportName} exported successfully.`);
    } catch {
      notify(`Failed to export ${reportName}.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export specific report item from modal
  const handleExportReportItem = async (report: ShelterReportItem) => {
    try {
      notify(`Exporting ${report.title}...`);
      const blob = await shelterReportsService.exportReportItemCsv(report.title, appliedFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSelectedReport(null);
      notify(`${report.title} exported successfully.`);
    } catch {
      notify(`Failed to export ${report.title}.`);
    }
  };

  const printReport = () => {
    window.print();
  };

  const selectedReportIcon = useMemo(() => {
    return selectedReport ? getReportIcon(selectedReport.iconName) : FileText;
  }, [selectedReport]);

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-4 pb-8">
        {/* BREADCRUMB & API STATUS */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2 text-[8px]">
            <span className="text-slate-400">CareLink</span>
            <ChevronRight size={10} className="text-slate-400" />
            <span className="text-slate-400">Shelter Administration</span>
            <ChevronRight size={10} className="text-slate-400" />
            <span className="font-semibold">Reports & Analytics</span>
          </div>

          {/* BACKEND API STATUS BADGE */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wide border shadow-xs ${
                isLiveBackend
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <Server size={11} />
              <span>{isLiveBackend ? "Backend API: Online" : "Local Fallback Mode"}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveBackend ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
            </span>

            <button
              type="button"
              onClick={() => loadData(appliedFilters, true)}
              disabled={isRefreshing}
              title="Refresh Analytics from API"
              className="p-1 text-slate-400 hover:text-[#123e60] transition-colors rounded hover:bg-white"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da7]" : ""} />
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[21px] font-normal">Reports & Analytics</h1>
            <p className="text-[9px] text-slate-500 mt-1.5">
              Create transparent operational reports and analyse shelter performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printReport}
              className="h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer size={12} />
              Print
            </button>

            <button
              onClick={() => downloadCSV("Operational Performance Report")}
              disabled={isExporting}
              className="h-[31px] px-3 bg-[#1c638a] text-white rounded-md text-[9px] font-semibold hover:bg-[#144665] flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Download size={12} />
              {isExporting ? "Exporting..." : "Export report"}
            </button>
          </div>
        </div>

        {/* FILTER PANEL */}
        <section className="bg-white border border-[#d5e3e9] rounded-lg p-2.5 mb-3 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <FilterSelect
              label="Date range"
              value={dateRange}
              options={dateRangeOptions}
              onChange={setDateRange}
            />

            <FilterSelect
              label="Shelter"
              value={shelter}
              options={shelterOptions}
              onChange={setShelter}
            />

            <FilterSelect
              label="District"
              value={district}
              options={districtOptions}
              onChange={setDistrict}
            />

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full h-[30px] px-4 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-[#f0f8fa] transition cursor-pointer"
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
            subtitle={metrics.occupancyTrend || "+4.8% in period"}
            color="blue"
          />

          <MetricCard
            icon={<Users size={16} />}
            title="New admissions"
            value={metrics.admissions.toLocaleString()}
            subtitle={metrics.admissionsSubtitle || `${metrics.departed} departures`}
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
            subtitle={metrics.resourcesSubtitle || "Across 8 categories"}
            color="blue"
          />
        </section>

        {/* CHART SECTION */}
        <section className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-2.5 mb-3">
          {/* OCCUPANCY TREND */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden">
            <div className="px-3.5 py-3 border-b border-slate-200">
              <h2 className="text-[11px] font-semibold">Occupancy trend</h2>
              <p className="text-[7px] text-slate-400 mt-1">Daily occupied beds</p>
            </div>

            <div className="px-3 pt-3 pb-4">
              <OccupancyChart data={trendData} />
            </div>
          </div>

          {/* REQUEST OUTCOMES */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden">
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
            {reportsList.map((report) => {
              const Icon = getReportIcon(report.iconName);

              return (
                <button
                  key={report.id || report.title}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white border border-[#d5e3e9] rounded-lg shadow-xs px-2.5 py-3 flex items-center gap-2.5 text-left hover:border-[#45b99b] hover:shadow-md transition min-w-0 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-[#eaf3f8] text-[#287da7] rounded-md flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-semibold truncate">{report.title}</p>
                    <p className="text-[7px] text-slate-400 mt-1 truncate">{report.description}</p>
                  </div>

                  <ChevronRight size={13} className="text-[#123e60] shrink-0" />
                </button>
              );
            })}
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
                  {(() => {
                    const Icon = selectedReportIcon;
                    return <Icon size={21} />;
                  })()}
                </div>

                <div>
                  <h2 className="text-sm font-semibold">{selectedReport.title}</h2>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {selectedReport.category} report
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#f5f9fa] rounded-lg p-4 mt-5 space-y-3">
              <p className="text-xs font-semibold">Report information</p>
              <p className="text-[10px] text-slate-500">{selectedReport.description}</p>

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
                className="flex-1 h-10 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => handleExportReportItem(selectedReport)}
                className="flex-1 h-10 bg-[#1c638a] hover:bg-[#144665] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <Check size={16} />
          <p className="text-xs">{notification}</p>
          <button onClick={() => setNotification("")} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
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
  icon: React.ReactNode;
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
    <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-xs px-3 py-3 flex items-center gap-2.5 min-w-0">
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

function OccupancyChart({ data }: { data: { day: string; value: number }[] }) {
  const width = 700;
  const height = 125;
  const left = 5;
  const right = 5;
  const top = 12;
  const bottom = 20;

  const points = data.map((item, index) => ({
    x: left + (index / (data.length - 1)) * (width - left - right),
    y: top + (1 - (item.value - 35) / 60) * (height - top - bottom),
    ...item,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - bottom} L ${points[0].x} ${height - bottom} Z`;

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
          <circle key={point.day} cx={point.x} cy={point.y} r="2.2" fill="#226c98" />
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
          <p className="text-[17px] font-bold">{Math.round((approved / total) * 100)}%</p>
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
        <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: color }} />
        <span className="text-slate-500">{label}</span>
      </div>

      <span className="font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}
