
import { useMemo, useState } from "react";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
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
  CalendarDays,
  Activity,
  X,
} from "lucide-react";

type Report = {
  title: string;
  description: string;
  icon: typeof FileText;
  category: string;
};

const reports: Report[] = [
  {
    title: "Shelter Occupancy Report",
    description: "Capacity, occupancy, and available beds",
    icon: FileText,
    category: "Shelter",
  },
  {
    title: "Resident Registration Report",
    description: "Admissions, departures, and demographics",
    icon: Users,
    category: "Residents",
  },
  {
    title: "Bed Availability Report",
    description: "Room and bed status by shelter",
    icon: BedDouble,
    category: "Shelter",
  },
  {
    title: "Resource Inventory Report",
    description: "Stock levels, distribution, and expiry",
    icon: Package,
    category: "Resources",
  },
  {
    title: "Accommodation Request Report",
    description: "Request outcomes and assignment times",
    icon: ClipboardList,
    category: "Requests",
  },
  {
    title: "Staff Activity Report",
    description: "Shifts, attendance, and responsibilities",
    icon: UserRound,
    category: "Staff",
  },
  {
    title: "Health & Safety Report",
    description: "Incidents, inspections, and resolutions",
    icon: HeartPulse,
    category: "Health",
  },
  {
    title: "Shelter Performance Overview",
    description: "Cross-shelter operational metrics",
    icon: ChartNoAxesColumn,
    category: "Performance",
  },
];

const trendData = [
  { day: "18 Jun", value: 48 },
  { day: "19 Jun", value: 55 },
  { day: "20 Jun", value: 54 },
  { day: "21 Jun", value: 65 },
  { day: "22 Jun", value: 64 },
  { day: "23 Jun", value: 77 },
  { day: "24 Jun", value: 83 },
];

const shelterData: Record<string, {
  occupancy: number;
  admissions: number;
  approved: number;
  resources: number;
  pending: number;
  rejected: number;
  departed: number;
}> = {
  "All shelters": {
    occupancy: 66.2,
    admissions: 342,
    approved: 84,
    resources: 12480,
    pending: 14,
    rejected: 7,
    departed: 158,
  },
  "Riverton Central": {
    occupancy: 92,
    admissions: 128,
    approved: 88,
    resources: 4200,
    pending: 5,
    rejected: 2,
    departed: 42,
  },
  "North Community": {
    occupancy: 57,
    admissions: 84,
    approved: 82,
    resources: 3100,
    pending: 4,
    rejected: 2,
    departed: 38,
  },
  "St. Mary Civic": {
    occupancy: 100,
    admissions: 65,
    approved: 76,
    resources: 2200,
    pending: 3,
    rejected: 2,
    departed: 32,
  },
  "Lakeside Sports": {
    occupancy: 49,
    admissions: 65,
    approved: 90,
    resources: 2980,
    pending: 2,
    rejected: 1,
    departed: 46,
  },
};

const districts = [
  "All districts",
  "Central District",
  "North District",
  "Eastbank",
  "West District",
];

const shelters = [
  "All shelters",
  "Riverton Central",
  "North Community",
  "St. Mary Civic",
  "Lakeside Sports",
];

export default function ReportsAnalyticsPage() {
  const [dateRange, setDateRange] = useState("18–25 June 2025");
  const [shelter, setShelter] = useState("All shelters");
  const [district, setDistrict] = useState("All districts");

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "18–25 June 2025",
    shelter: "All shelters",
    district: "All districts",
  });

  const [selectedReport, setSelectedReport] = useState<Report | null>(
    null
  );

  const [notification, setNotification] = useState("");

  const metrics = useMemo(() => {
    const data = shelterData[appliedFilters.shelter];

    return {
      ...data,
      occupancy: data.occupancy,
      approvalCount: Math.round(
        data.admissions * data.approved / 100
      ),
    };
  }, [appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters({
      dateRange,
      shelter,
      district,
    });
    setNotification("Report filters applied successfully.");
  };

  // Download report data as CSV
  const downloadCSV = (reportName: string) => {
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
      ["Resources distributed", metrics.resources],
      ["Pending requests", metrics.pending],
      ["Rejected requests", metrics.rejected],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotification(`${reportName} exported successfully.`);
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
          <span className="text-slate-400">
            Shelter Administration
          </span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="font-semibold">
            Reports & Analytics
          </span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

          <div>
            <h1 className="text-[21px] font-normal">
              Reports & Analytics
            </h1>

            <p className="text-[9px] text-slate-500 mt-1.5">
              Create transparent operational reports and analyse shelter performance.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={printReport}
              className="h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-slate-50 flex items-center gap-2"
            >
              <Printer size={12} />
              Print
            </button>

            <button
              onClick={() => downloadCSV("Operational Performance Report")}
              className="h-[31px] px-3 bg-[#1c638a] text-white rounded-md text-[9px] font-semibold hover:bg-[#144665] flex items-center gap-2"
            >
              <Download size={12} />
              Export report
            </button>
          </div>
        </div>

        {/* FILTER PANEL */}

        <section className="bg-white border border-[#d5e3e9] rounded-lg p-2.5 mb-3">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-2">

            <FilterSelect
              label="Date range"
              value={dateRange}
              options={[
                "18–25 June 2025",
                "Last 7 days",
                "Last 30 days",
                "This month",
                "Last month",
              ]}
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
                onClick={applyFilters}
                className="w-full h-[30px] px-4 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-[#f0f8fa]"
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
            subtitle="+4.8% in period"
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
              <h2 className="text-[11px] font-semibold">
                Occupancy trend
              </h2>

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
              <h2 className="text-[11px] font-semibold">
                Request outcomes
              </h2>

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
                  value={Math.round(
                    metrics.admissions * metrics.approved / 100
                  )}
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

          <h2 className="text-[10px] font-semibold mb-2">
            Report library
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">

            {reports.map((report) => {
              const Icon = report.icon;

              return (
                <button
                  key={report.title}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm px-2.5 py-3 flex items-center gap-2.5 text-left hover:border-[#45b99b] hover:shadow-md transition min-w-0"
                >

                  <div className="w-8 h-8 bg-[#eaf3f8] text-[#287da7] rounded-md flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-semibold truncate">
                      {report.title}
                    </p>

                    <p className="text-[7px] text-slate-400 mt-1 truncate">
                      {report.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={13}
                    className="text-[#123e60] shrink-0"
                  />
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
                  <selectedReport.icon size={21} />
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

              <button onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#f5f9fa] rounded-lg p-4 mt-5 space-y-3">

              <p className="text-xs font-semibold">
                Report information
              </p>

              <p className="text-[10px] text-slate-500">
                {selectedReport.description}
              </p>

              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Date range</span>
                <span className="font-semibold">
                  {appliedFilters.dateRange}
                </span>
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Shelter</span>
                <span className="font-semibold">
                  {appliedFilters.shelter}
                </span>
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">District</span>
                <span className="font-semibold">
                  {appliedFilters.district}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">

              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  downloadCSV(selectedReport.title);
                  setSelectedReport(null);
                }}
                className="flex-1 h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
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

          <button onClick={() => setNotification("")}>
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
      <label className="block text-[7px] text-slate-400 mb-1">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[30px] appearance-none bg-white border border-[#d5e3e9] rounded-md pl-2.5 pr-7 text-[8px] outline-none focus:border-[#45b99b] cursor-pointer"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
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
    <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm px-3 py-3 flex items-center gap-2.5 min-w-0">

      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${styles[color]}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[7px] text-slate-400">
          {title}
        </p>

        <p className="text-[18px] font-bold leading-tight">
          {value}
        </p>

        <p className="text-[7px] text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ================= OCCUPANCY AREA CHART ================= */

function OccupancyChart({
  data,
}: {
  data: { day: string; value: number }[];
}) {
  const width = 700;
  const height = 125;
  const left = 5;
  const right = 5;
  const top = 12;
  const bottom = 20;

  const points = data.map((item, index) => ({
    x: left + (index / (data.length - 1)) * (width - left - right),
    y:
      top +
      (1 - (item.value - 35) / 60) *
        (height - top - bottom),
    ...item,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

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

          <p className="text-[7px] text-slate-400">
            Approved
          </p>
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

        <span className="text-slate-500">
          {label}
        </span>
      </div>

      <span className="font-semibold">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
