import { useMemo, useState } from "react";
import type { ElementType } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Download,
  Printer,
  Check,
  Clock,
  Activity,
  ShieldCheck,
  Users,
  ListChecks,
  Award,
  AlertTriangle,
  Sparkles,
  X,
  FileText,
  BarChart3,
  CalendarDays,
  MapPin,
  Filter,
  Eye,
} from "lucide-react";

// TYPES

interface Report {
  id: number;
  title: string;
  description: string;
  icon: ElementType;
  category: string;
}

interface AnalyticsData {
  tasks: number;
  hours: number;
  acceptance: number;
  incidentFree: number;
}

// DEMO DATA

const trendData = [
  { date: "18 Jun", value: 22 },
  { date: "19 Jun", value: 35 },
  { date: "20 Jun", value: 34 },
  { date: "21 Jun", value: 51 },
  { date: "22 Jun", value: 50 },
  { date: "23 Jun", value: 72 },
  { date: "24 Jun", value: 83 },
];

const skillData = [
  { name: "Logistics", hours: 3480 },
  { name: "Shelter support", hours: 2860 },
  { name: "Medical", hours: 2240 },
  { name: "Transport", hours: 1980 },
  { name: "Translation", hours: 1120 },
  { name: "Rescue", hours: 980 },
];

const reports: Report[] = [
  {
    id: 1,
    title: "Volunteer Roster Report",
    description:
      "View registered volunteers, availability, skills and assignments.",
    icon: Users,
    category: "Volunteer Management",
  },
  {
    id: 2,
    title: "Task Completion Report",
    description:
      "Analyze created, assigned and completed response tasks.",
    icon: ListChecks,
    category: "Task Management",
  },
  {
    id: 3,
    title: "Volunteer Hours Report",
    description:
      "Review volunteer working hours and contribution statistics.",
    icon: Clock,
    category: "Volunteer Performance",
  },
  {
    id: 4,
    title: "Verification & Compliance",
    description:
      "Monitor volunteer verification and qualification compliance.",
    icon: ShieldCheck,
    category: "Compliance",
  },
  {
    id: 5,
    title: "Training Readiness",
    description:
      "Analyze training completion and certification readiness.",
    icon: Award,
    category: "Training",
  },
  {
    id: 6,
    title: "Safety & Incident Report",
    description:
      "Review field incidents, safety alerts and incident-free shifts.",
    icon: AlertTriangle,
    category: "Safety",
  },
  {
    id: 7,
    title: "Performance by Area",
    description:
      "Compare volunteer performance across operational areas.",
    icon: Activity,
    category: "Performance",
  },
  {
    id: 8,
    title: "AI Matching Decisions",
    description:
      "Review AI recommendations, matching scores and human approvals.",
    icon: Sparkles,
    category: "AI Operations",
  },
];

// MAIN COMPONENT

export default function ReportsAnalyticsPage() {
  // FILTER STATES

  const [dateRange, setDateRange] = useState("18-25 June 2025");

  const [operationalArea, setOperationalArea] =
    useState("All areas");

  const [skillGroup, setSkillGroup] = useState("All skills");

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "18-25 June 2025",
    operationalArea: "All areas",
    skillGroup: "All skills",
  });

  // MODAL STATE

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [notification, setNotification] = useState("");

  // NOTIFICATION

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // FILTER APPLICATION

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateRange,
      operationalArea,
      skillGroup,
    });

    notify("Analytics filters applied successfully!");
  };

  // DEMO ANALYTICS

  const analytics: AnalyticsData = useMemo(() => {
    let multiplier = 1;

    if (appliedFilters.operationalArea !== "All areas") {
      multiplier *= 0.65;
    }

    if (appliedFilters.skillGroup !== "All skills") {
      multiplier *= 0.45;
    }

    return {
      tasks: Math.round(1284 * multiplier),
      hours: Math.round(14280 * multiplier),
      acceptance: 92,
      incidentFree: 98.7,
    };
  }, [appliedFilters]);

  // CSV EXPORT

  const handleExport = () => {
    const rows = [
      ["CareLink - Reports & Analytics"],
      ["Date Range", appliedFilters.dateRange],
      ["Operational Area", appliedFilters.operationalArea],
      ["Skill Group", appliedFilters.skillGroup],
      [],
      ["Metric", "Value"],
      ["Tasks Completed", analytics.tasks],
      ["Volunteer Hours", analytics.hours],
      ["Acceptance Rate", `${analytics.acceptance}%`],
      ["Incident-free Shifts", `${analytics.incidentFree}%`],
      [],
      ["Skill Group", "Volunteer Hours"],
      ...skillData.map((item) => [
        item.name,
        item.hours,
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

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "carelink-reports-analytics.csv";

    link.click();

    URL.revokeObjectURL(url);

    notify("Report exported successfully!");
  };

  // PRINT

  const handlePrint = () => {
    window.print();
  };

  // STAT CARD

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string;
    description: string;
    icon: ElementType;
    color: string;
  }) => (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 shadow-[0_5px_15px_rgba(30,70,90,0.05)] flex items-center gap-3 min-h-[77px]">

      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">

        <p className="text-[9px] text-[#8296aa]">
          {title}
        </p>

        <h2 className="text-[22px] leading-7 font-semibold text-[#123c5b]">
          {value}
        </h2>

        <p className="text-[8px] text-[#8296aa]">
          {description}
        </p>

      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}


      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-7">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            Reports & Analytics
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

          <div>

            <h1 className="text-[25px] font-normal">
              Reports & Analytics
            </h1>

            <p className="text-[11px] text-[#718ba0] mt-2">
              Measure volunteer readiness, assignment outcomes, contribution, and safety.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={handlePrint}
              className="h-[37px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-2"
            >

              <Printer size={13} />

              Print

            </button>

            <button
              onClick={handleExport}
              className="h-[37px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold"
            >

              <Download size={13} />

              Export report

            </button>

          </div>

        </div>

        {/* FILTER SECTION */}

        <section className="bg-white border border-[#d5e3e9] rounded-lg p-3 mb-3">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">

            {/* DATE RANGE */}

            <div>

              <label className="block text-[8px] text-[#8296aa] mb-1.5">
                Date range
              </label>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-[36px] border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none focus:border-[#287fa9] bg-white"
              >
                <option>18-25 June 2025</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This month</option>
                <option>This year</option>
              </select>

            </div>

            {/* OPERATIONAL AREA */}

            <div>

              <label className="block text-[8px] text-[#8296aa] mb-1.5">
                Operational area
              </label>

              <select
                value={operationalArea}
                onChange={(e) =>
                  setOperationalArea(e.target.value)
                }
                className="w-full h-[36px] border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none focus:border-[#287fa9] bg-white"
              >
                <option>All areas</option>
                <option>North Ward</option>
                <option>Central Ward</option>
                <option>Eastbank</option>
                <option>West District</option>
              </select>

            </div>

            {/* SKILL GROUP */}

            <div>

              <label className="block text-[8px] text-[#8296aa] mb-1.5">
                Skill group
              </label>

              <select
                value={skillGroup}
                onChange={(e) => setSkillGroup(e.target.value)}
                className="w-full h-[36px] border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none focus:border-[#287fa9] bg-white"
              >
                <option>All skills</option>
                <option>Logistics</option>
                <option>Shelter support</option>
                <option>Medical</option>
                <option>Transport</option>
                <option>Translation</option>
                <option>Rescue</option>
              </select>

            </div>

            {/* APPLY */}

            <button
              onClick={handleApplyFilters}
              className="h-[36px] px-4 border border-[#b9d0dc] hover:bg-[#f1f8fc] rounded-lg text-[9px] text-[#17648e] font-medium flex items-center justify-center gap-2"
            >

              <Filter size={12} />

              Apply filters

            </button>

          </div>

        </section>

        {/* STATISTICS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

          <StatCard
            title="Tasks completed"
            value={analytics.tasks.toLocaleString()}
            description="89.4% completion"
            icon={Check}
            color="bg-[#e5f5ef] text-[#239879]"
          />

          <StatCard
            title="Volunteer hours"
            value={analytics.hours.toLocaleString()}
            description="+12% vs previous week"
            icon={Clock}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Acceptance rate"
            value={`${analytics.acceptance}%`}
            description="3,418 invitations"
            icon={Activity}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Incident-free shifts"
            value={`${analytics.incidentFree}%`}
            description="18 minor incidents"
            icon={ShieldCheck}
            color="bg-[#e5f5ef] text-[#239879]"
          />

        </section>

        {/* CHARTS SECTION */}

        <section className="grid grid-cols-1 xl:grid-cols-[2.15fr_0.97fr] gap-3 mb-4">

          {/* TASK COMPLETION TREND */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            <div className="px-4 py-4 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[12px] font-medium">
                  Task completion trend
                </h2>

                <p className="text-[8px] text-[#8296aa] mt-1">
                  Created versus completed tasks
                </p>

              </div>

              <span className="bg-[#e5f5ef] text-[#239879] px-2 py-1 rounded-md text-[8px] font-semibold">
                Target exceeded
              </span>

            </div>

            {/* SVG CHART */}

            <div className="p-4 pt-5">

              <div className="w-full h-[210px]">

                <svg
                  viewBox="0 0 800 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >

                  <defs>

                    <linearGradient
                      id="chartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#65bda5"
                        stopOpacity="0.18"
                      />

                      <stop
                        offset="100%"
                        stopColor="#65bda5"
                        stopOpacity="0.03"
                      />

                    </linearGradient>

                  </defs>

                  {/* HORIZONTAL GRID */}

                  {[40, 80, 120, 160].map((y) => (

                    <line
                      key={y}
                      x1="5"
                      y1={y}
                      x2="795"
                      y2={y}
                      stroke="#edf2f5"
                      strokeWidth="1"
                    />

                  ))}

                  {/* AREA */}

                  <path
                    d="
                      M 5 165
                      C 75 158, 105 148, 160 140
                      S 245 145, 300 140
                      S 380 119, 440 113
                      S 510 122, 570 108
                      S 680 76, 795 66
                      L 795 195
                      L 5 195
                      Z
                    "
                    fill="url(#chartFill)"
                  />

                  {/* TREND LINE */}

                  <path
                    d="
                      M 5 165
                      C 75 158, 105 148, 160 140
                      S 245 145, 300 140
                      S 380 119, 440 113
                      S 510 122, 570 108
                      S 680 76, 795 66
                    "
                    fill="none"
                    stroke="#287fa9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              {/* DATES */}

              <div className="flex justify-between text-[8px] text-[#8296aa] mt-1">

                {trendData.map((item) => (
                  <span key={item.date}>
                    {item.date}
                  </span>
                ))}

              </div>

            </div>

          </div>

          {/* HOURS BY SKILL GROUP */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            <div className="px-4 py-4 border-b border-[#d5e3e9]">

              <h2 className="text-[12px] font-medium">
                Hours by skill group
              </h2>

              <p className="text-[8px] text-[#8296aa] mt-1">
                14,280 contributed hours
              </p>

            </div>

            <div className="p-4 space-y-5">

              {skillData.map((skill) => (

                <div
                  key={skill.name}
                  className="flex items-center gap-3"
                >

                  <span className="text-[8px] w-[76px] shrink-0">
                    {skill.name}
                  </span>

                  <div className="flex-1 h-[7px] bg-[#e7eef1] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#65bda5] rounded-full transition-all duration-500"
                      style={{
                        width: `${(skill.hours / 3480) * 100}%`,
                      }}
                    />

                  </div>

                  <span className="text-[8px] font-semibold w-[36px] text-right">
                    {skill.hours}h
                  </span>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* REPORT LIBRARY */}

        <section>

          <div className="mb-3">

            <h2 className="text-[12px] font-medium">
              Report library
            </h2>

            <p className="text-[8px] text-[#8296aa] mt-1">
              Explore detailed operational reports and analytics.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

            {reports.map((report) => {

              const Icon = report.icon;

              return (

                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white border border-[#d5e3e9] rounded-xl p-3 flex items-center justify-between gap-3 shadow-[0_5px_15px_rgba(30,70,90,0.05)] hover:border-[#65bda5] hover:shadow-md transition-all text-left min-h-[66px]"
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-8 h-8 bg-[#e5f5ef] text-[#239879] rounded-lg flex items-center justify-center shrink-0">

                      <Icon size={17} />

                    </div>

                    <div className="min-w-0">

                      <p className="text-[9px] font-semibold truncate">
                        {report.title}
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    size={16}
                    className="text-[#123c5b] shrink-0"
                  />

                </button>

              );

            })}

          </div>

        </section>

      </main>

      {/* REPORT PREVIEW MODAL */}

      {selectedReport && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 bg-[#e5f5ef] text-[#239879] rounded-lg flex items-center justify-center">

                  <selectedReport.icon size={20} />

                </div>

                <div>

                  <h2 className="text-[15px] font-semibold">
                    {selectedReport.title}
                  </h2>

                  <p className="text-[9px] text-[#8296aa] mt-1">
                    {selectedReport.category}
                  </p>

                </div>

              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>

            </div>

            {/* CONTENT */}

            <div className="p-5 space-y-4">

              <p className="text-[11px] text-[#718ba0] leading-5">
                {selectedReport.description}
              </p>

              <div className="bg-[#f5f9fb] rounded-lg p-4 space-y-3">

                <div className="flex items-center gap-2 text-[10px]">
                  <CalendarDays size={14} className="text-[#287fa9]" />
                  Date range: {appliedFilters.dateRange}
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <MapPin size={14} className="text-[#287fa9]" />
                  Area: {appliedFilters.operationalArea}
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <Users size={14} className="text-[#287fa9]" />
                  Skill group: {appliedFilters.skillGroup}
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-[#f5f9fb] p-3 rounded-lg">

                  <p className="text-[8px] text-[#8296aa]">
                    Tasks completed
                  </p>

                  <p className="text-[20px] font-semibold mt-1">
                    {analytics.tasks.toLocaleString()}
                  </p>

                </div>

                <div className="bg-[#f5f9fb] p-3 rounded-lg">

                  <p className="text-[8px] text-[#8296aa]">
                    Volunteer hours
                  </p>

                  <p className="text-[20px] font-semibold mt-1">
                    {analytics.hours.toLocaleString()}
                  </p>

                </div>

              </div>

              <div className="bg-[#eaf5f9] rounded-lg p-3 flex items-start gap-2">

                <FileText
                  size={16}
                  className="text-[#287fa9] shrink-0"
                />

                <p className="text-[9px] text-[#527d96] leading-4">
                  This report will use the currently selected analytics filters.
                  Detailed report data can be connected through the Spring Boot API.
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="p-4 border-t flex justify-end gap-2">

              <button
                onClick={() => setSelectedReport(null)}
                className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-[10px]"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleExport();
                  setSelectedReport(null);
                }}
                className="bg-[#287fa9] text-white rounded-lg px-4 py-2.5 text-[10px] flex items-center gap-2"
              >

                <Download size={13} />

                Export data

              </button>

            </div>

          </div>

        </div>

      )}

      {/* TOAST NOTIFICATION */}

      {notification && (

        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2">

          <Check size={15} />

          {notification}

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg">

        <HelpCircle size={21} />

      </button>

    </div>
  );
}