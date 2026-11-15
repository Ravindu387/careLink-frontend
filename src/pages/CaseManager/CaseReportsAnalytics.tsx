import React, { useMemo, useState } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
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
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface Category {
  name: string;
  value: number;
}

interface Report {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// ==========================================
// CATEGORY DATA
// ==========================================

const categories: Category[] = [
  { name: "Food & Water", value: 486 },
  { name: "Shelter", value: 394 },
  { name: "Medical", value: 318 },
  { name: "Transport", value: 246 },
  { name: "Accessibility", value: 128 },
  { name: "Other", value: 375 },
];

// ==========================================
// RESOLUTION DATA
// ==========================================

const resolutionData = [
  { day: "18 Jun", received: 120, resolved: 75 },
  { day: "19 Jun", received: 150, resolved: 100 },
  { day: "20 Jun", received: 165, resolved: 135 },
  { day: "21 Jun", received: 220, resolved: 180 },
  { day: "22 Jun", received: 210, resolved: 190 },
  { day: "23 Jun", received: 275, resolved: 225 },
  { day: "24 Jun", received: 315, resolved: 270 },
];

// ==========================================
// REPORT LIBRARY DATA
// ==========================================

const reports: Report[] = [
  {
    title: "Case Intake Report",
    description: "Analyse incoming cases, request volumes and categories.",
    icon: <Inbox size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Verification Report",
    description: "Review verification rates and evidence outcomes.",
    icon: <ShieldCheck size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Priority & SLA Report",
    description: "Analyse priority levels, overdue cases and SLA performance.",
    icon: <AlertTriangle size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Duplicate Review Report",
    description: "Review duplicate detection and human decisions.",
    icon: <Copy size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Escalation Report",
    description: "Track escalated cases and resolution progress.",
    icon: <ArrowUpToLine size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "AI Decision Audit",
    description: "Review AI recommendations and human overrides.",
    icon: <Sparkles size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Case Manager Performance",
    description: "Measure case manager workload and performance.",
    icon: <Users size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Operational Area Summary",
    description: "Compare operational activity across locations.",
    icon: <ChartLine size={20} />,
    color: "bg-sky-50 text-sky-700",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const CaseReportsAnalytics: React.FC = () => {

  const [dateRange, setDateRange] = useState("18–25 June 2025");

  const [crisisEvent, setCrisisEvent] = useState(
    "Monsoon Floods 2025"
  );

  const [operationalArea, setOperationalArea] = useState(
    "All areas"
  );

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "18–25 June 2025",
    crisisEvent: "Monsoon Floods 2025",
    operationalArea: "All areas",
  });

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const [notificationCount] = useState(11);

  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // APPLY FILTERS
  // ==========================================

  const applyFilters = () => {

    setAppliedFilters({
      dateRange,
      crisisEvent,
      operationalArea,
    });

    showSuccess("Report filters applied successfully.");

  };

  // ==========================================
  // SUCCESS MESSAGE
  // ==========================================

  const showSuccess = (message: string) => {

    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  };

  // ==========================================
  // FILTERED ANALYTICS
  // ==========================================

  const analytics = useMemo(() => {

    if (appliedFilters.operationalArea === "All areas") {
      return {
        received: 1947,
        resolved: 1502,
        response: "2h 18m",
        overrides: "8.4%",
        resolution: "77.1%",
      };
    }

    if (appliedFilters.operationalArea === "North Ward") {
      return {
        received: 645,
        resolved: 498,
        response: "1h 42m",
        overrides: "7.2%",
        resolution: "77.2%",
      };
    }

    if (appliedFilters.operationalArea === "South Ward") {
      return {
        received: 523,
        resolved: 416,
        response: "2h 05m",
        overrides: "9.1%",
        resolution: "79.5%",
      };
    }

    return {
      received: 779,
      resolved: 588,
      response: "2h 46m",
      overrides: "8.9%",
      resolution: "75.5%",
    };

  }, [appliedFilters]);

  // ==========================================
  // EXPORT REPORT
  // ==========================================

  const handleExport = () => {

    const rows = [
      ["Case Reports & Analytics"],
      ["Date Range", appliedFilters.dateRange],
      ["Crisis Event", appliedFilters.crisisEvent],
      ["Operational Area", appliedFilters.operationalArea],
      [],
      ["Metric", "Value"],
      ["Cases Received", analytics.received],
      ["Cases Resolved", analytics.resolved],
      ["Resolution Rate", analytics.resolution],
      ["Median Response", analytics.response],
      ["AI Overrides", analytics.overrides],
      [],
      ["Category", "Cases"],
      ...categories.map((item) => [
        item.name,
        item.value,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
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
    link.download = "case-reports-analytics.csv";
    link.click();

    URL.revokeObjectURL(url);

    showSuccess("Report exported successfully.");

  };

  // ==========================================
  // PRINT REPORT
  // ==========================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // RESOLUTION CHART
  // ==========================================

  const chartPoints = resolutionData.map((item, index) => {

    const x = 20 + index * 125;

    const y = 180 - (item.received / 350) * 145;

    return `${x},${y}`;

  });

  const chartLine = chartPoints.join(" ");

  const chartArea =
    `20,185 ${chartLine} 770,185`;

  // ==========================================
  // JSX
  // ==========================================

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">



      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-7">

        {/* BREADCRUMB */}

        <div className="mb-7 flex items-center gap-2 text-[10px] text-slate-400">

          <span>Operations</span>

          <ChevronRight size={12} />

          <span>Case Management</span>

          <ChevronRight size={12} />

          <span className="font-semibold text-[#173e5b]">
            Case Reports & Analytics
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-2xl font-medium tracking-tight text-[#173e5b]">
              Case Reports & Analytics
            </h1>

            <p className="mt-2 text-[11px] text-slate-500">
              Analyse intake, verification, resolution, SLA performance, and human decisions.
            </p>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-[11px] font-medium text-[#287da8] transition hover:bg-sky-50"
            >

              <Printer size={15} />

              Print

            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-[#287da8] px-4 py-3 text-[11px] font-semibold text-white transition hover:bg-[#17678f]"
            >

              <Download size={15} />

              Export report

            </button>

          </div>

        </div>

        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {successMessage && (

          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">

            <Check size={16} />

            {successMessage}

          </div>

        )}

        {/* =====================================
            FILTER SECTION
        ===================================== */}

        <section className="mb-3 rounded-lg border border-[#d5e2eb] bg-white p-3">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">

            {/* DATE RANGE */}

            <div>

              <label className="mb-2 block text-[9px] font-medium text-slate-500">
                Date range
              </label>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-[10px] outline-none focus:border-sky-500"
              >

                <option>18–25 June 2025</option>
                <option>1–7 June 2025</option>
                <option>1–30 June 2025</option>
                <option>1–31 May 2025</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>All time</option>

              </select>

            </div>

            {/* CRISIS EVENT */}

            <div>

              <label className="mb-2 block text-[9px] font-medium text-slate-500">
                Crisis event
              </label>

              <select
                value={crisisEvent}
                onChange={(e) => setCrisisEvent(e.target.value)}
                className="w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-[10px] outline-none focus:border-sky-500"
              >

                <option>Monsoon Floods 2025</option>
                <option>Coastal Storm 2025</option>
                <option>Landslide Emergency 2025</option>
                <option>All crisis events</option>

              </select>

            </div>

            {/* OPERATIONAL AREA */}

            <div>

              <label className="mb-2 block text-[9px] font-medium text-slate-500">
                Operational area
              </label>

              <select
                value={operationalArea}
                onChange={(e) => setOperationalArea(e.target.value)}
                className="w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-[10px] outline-none focus:border-sky-500"
              >

                <option>All areas</option>
                <option>North Ward</option>
                <option>South Ward</option>
                <option>Eastbank</option>
                <option>West District</option>

              </select>

            </div>

            {/* APPLY */}

            <div className="flex items-end">

              <button
                onClick={applyFilters}
                className="w-full rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-[10px] font-semibold text-[#287da8] transition hover:bg-sky-50 lg:w-auto"
              >
                Apply filters
              </button>

            </div>

          </div>

        </section>

        {/* =====================================
            ANALYTICS CARDS
        ===================================== */}

        <section className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {/* CASES RECEIVED */}

          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">

            <div className="rounded-lg bg-sky-100 p-3 text-sky-700">
              <Inbox size={19} />
            </div>

            <div>

              <p className="text-[9px] text-slate-400">
                Cases received
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {analytics.received.toLocaleString()}
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                +8% today
              </p>

            </div>

          </div>

          {/* CASES RESOLVED */}

          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Check size={19} />
            </div>

            <div>

              <p className="text-[9px] text-slate-400">
                Cases resolved
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {analytics.resolved.toLocaleString()}
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                {analytics.resolution} resolution
              </p>

            </div>

          </div>

          {/* MEDIAN RESPONSE */}

          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">

            <div className="rounded-lg bg-sky-100 p-3 text-sky-700">
              <Clock size={19} />
            </div>

            <div>

              <p className="text-[9px] text-slate-400">
                Median response
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {analytics.response}
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                -18 min this week
              </p>

            </div>

          </div>

          {/* AI OVERRIDES */}

          <div className="flex items-start gap-3 rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">

            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <Sparkles size={19} />
            </div>

            <div>

              <p className="text-[9px] text-slate-400">
                AI overrides
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#173e5b]">
                {analytics.overrides}
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                126 of 1,498 reviews
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

                <h3 className="text-xs font-medium text-[#173e5b]">
                  Resolution performance
                </h3>

                <p className="mt-1 text-[9px] text-slate-400">
                  Cases received and resolved
                </p>

              </div>

              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
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

                  <polygon
                    points={chartArea}
                    fill="#e9f5f1"
                  />

                  {/* LINE */}

                  <polyline
                    points={chartLine}
                    fill="none"
                    stroke="#287da8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

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

              <div className="mt-1 flex justify-between text-[9px] text-slate-400">

                {resolutionData.map((item) => (

                  <span key={item.day}>
                    {item.day}
                  </span>

                ))}

              </div>

            </div>

          </div>

          {/* CASES BY CATEGORY */}

          <div className="rounded-xl border border-[#d5e2eb] bg-white shadow-[0_5px_15px_rgba(30,64,90,0.04)]">

            <div className="border-b border-[#d5e2eb] px-4 py-4">

              <h3 className="text-xs font-medium text-[#173e5b]">
                Cases by category
              </h3>

              <p className="mt-1 text-[9px] text-slate-400">
                {analytics.received.toLocaleString()} received
              </p>

            </div>

            <div className="space-y-5 px-4 py-5">

              {categories.map((item) => (

                <div
                  key={item.name}
                  className="flex items-center gap-3"
                >

                  <span className="w-[85px] shrink-0 text-[9px] text-slate-600">
                    {item.name}
                  </span>

                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#e8eef1]">

                    <div
                      className="h-full rounded-full bg-[#65b8a0] transition-all duration-500"
                      style={{
                        width: `${(item.value / 486) * 100}%`,
                      }}
                    />

                  </div>

                  <span className="w-8 text-right text-[9px] font-semibold text-[#173e5b]">
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

            <h2 className="text-xs font-medium text-[#173e5b]">
              Report library
            </h2>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-sky-700"
            >

              <Filter size={13} />

              {showFilters ? "Hide details" : "Report details"}

            </button>

          </div>

          {/* REPORT GRID */}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">

            {reports.map((report) => (

              <button
                key={report.title}
                onClick={() => setSelectedReport(report)}
                className="flex min-h-[68px] items-center justify-between rounded-xl border border-[#d5e2eb] bg-white px-3 py-3 text-left shadow-[0_5px_15px_rgba(30,64,90,0.04)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div className={`shrink-0 rounded-lg p-2.5 ${report.color}`}>
                    {report.icon}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-[10px] font-semibold text-[#173e5b]">
                      {report.title}
                    </p>

                    {showFilters && (

                      <p className="mt-1 text-[9px] text-slate-400">
                        {report.description}
                      </p>

                    )}

                  </div>

                </div>

                <ChevronRight
                  size={18}
                  className="ml-2 shrink-0 text-slate-700"
                />

              </button>

            ))}

          </div>

        </section>

      </main>

      {/* =====================================
          REPORT DETAILS MODAL
      ===================================== */}

      {selectedReport && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className={`rounded-lg p-3 ${selectedReport.color}`}>
                  {selectedReport.icon}
                </div>

                <div>

                  <h2 className="text-base font-semibold text-[#173e5b]">
                    {selectedReport.title}
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Case Management Reports
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

            <p className="text-xs leading-6 text-slate-500">
              {selectedReport.description}
            </p>

            <div className="my-5 space-y-3 rounded-lg bg-[#f5f9fb] p-4">

              <div className="flex items-center gap-2 text-xs text-slate-600">

                <CalendarDays size={15} className="text-sky-700" />

                <span>
                  Date range: {appliedFilters.dateRange}
                </span>

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">

                <MapPin size={15} className="text-sky-700" />

                <span>
                  Area: {appliedFilters.operationalArea}
                </span>

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">

                <FileText size={15} className="text-sky-700" />

                <span>
                  Event: {appliedFilters.crisisEvent}
                </span>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => {
                  setSelectedReport(null);
                  handleExport();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#287da8] px-4 py-3 text-xs font-semibold text-white hover:bg-[#17678f]"
              >

                <Download size={15} />

                Export CSV

              </button>

              <button
                onClick={() => {
                  setSelectedReport(null);
                  handlePrint();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#b9d0df] px-4 py-3 text-xs font-semibold text-[#287da8] hover:bg-sky-50"
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