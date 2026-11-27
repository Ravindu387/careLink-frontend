import { useState, useEffect, useCallback } from "react";
import type { ElementType } from "react";

import {
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
  CalendarDays,
  MapPin,
  Filter,
  Server,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

import { volunteerReportsService } from "../../services/volunteerReportsService";
import type {
  VolunteerAnalyticsData,
  TrendDataPoint,
  SkillHoursBreakdown,
  VolunteerReportItem,
} from "../../types/volunteerReports";

// HELPER: Map icon name string to Lucide component
function getReportIcon(iconName: string): ElementType {
  switch (iconName) {
    case "Users":
      return Users;
    case "ListChecks":
      return ListChecks;
    case "Clock":
      return Clock;
    case "ShieldCheck":
      return ShieldCheck;
    case "Award":
      return Award;
    case "AlertTriangle":
      return AlertTriangle;
    case "Activity":
      return Activity;
    case "Sparkles":
      return Sparkles;
    default:
      return FileText;
  }
}

// SUBCOMPONENT: KPI Stat Card
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
  color: string;
}

function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 shadow-[0_4px_12px_rgba(30,70,90,0.04)] flex items-center gap-3.5 min-h-[77px] transition-all hover:border-[#b9d0dc]">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#8296aa] uppercase tracking-wider">{title}</p>
        <h2 className="text-[22px] leading-7 font-bold text-[#123c5b] mt-0.5">{value}</h2>
        <p className="text-xs text-[#527d96]">{description}</p>
      </div>
    </div>
  );
}

export default function ReportsAnalyticsPage() {
  // CONNECTION & LOADING STATES
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // FILTER STATES
  const [dateRange, setDateRange] = useState<string>("18-25 June 2025");
  const [operationalArea, setOperationalArea] = useState<string>("All areas");
  const [skillGroup, setSkillGroup] = useState<string>("All skills");

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "18-25 June 2025",
    operationalArea: "All areas",
    skillGroup: "All skills",
  });

  // ANALYTICS DATA
  const [analytics, setAnalytics] = useState<VolunteerAnalyticsData>({
    tasksCompleted: 1284,
    volunteerHours: 14280,
    acceptanceRate: 92,
    incidentFreeRate: 98.7,
    activeVolunteers: 2184,
    totalShifts: 3418,
    completionRate: "89.4% completion",
    hoursComparison: "+12% vs previous week",
    invitationsCount: "3,418 invitations",
    incidentsSummary: "18 minor incidents",
  });

  const [trendData, setTrendData] = useState<TrendDataPoint[]>([
    { date: "18 Jun", value: 22 },
    { date: "19 Jun", value: 35 },
    { date: "20 Jun", value: 34 },
    { date: "21 Jun", value: 51 },
    { date: "22 Jun", value: 50 },
    { date: "23 Jun", value: 72 },
    { date: "24 Jun", value: 83 },
  ]);

  const [skillData, setSkillData] = useState<SkillHoursBreakdown[]>([
    { name: "Logistics", hours: 3480, percentage: 24.4 },
    { name: "Shelter support", hours: 2860, percentage: 20.0 },
    { name: "Medical", hours: 2240, percentage: 15.7 },
    { name: "Transport", hours: 1980, percentage: 13.9 },
    { name: "Translation", hours: 1120, percentage: 7.8 },
    { name: "Rescue", hours: 980, percentage: 6.9 },
  ]);

  const [reportsList, setReportsList] = useState<VolunteerReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<VolunteerReportItem | null>(null);

  // TOAST NOTIFICATION
  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // LOAD DATA FROM BACKEND
  const loadData = useCallback(
    async (isRefresh = false, filters = appliedFilters) => {
      if (isRefresh) {
        setIsRefreshing(true);
      }

      try {
        const response = await volunteerReportsService.getOverview({
          dateRange: filters.dateRange,
          operationalArea: filters.operationalArea,
          skillGroup: filters.skillGroup,
        });

        setIsLiveBackend(response.isLiveBackend);
        setAnalytics(response.data.analytics);
        setTrendData(response.data.trendData);
        setSkillData(response.data.skillData);
        setReportsList(response.data.reports);
      } catch {
        notify("Failed to retrieve reports and analytics data.");
      } finally {
        setIsRefreshing(false);
      }
    },
    [appliedFilters]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // APPLY FILTERS
  const handleApplyFilters = () => {
    const updated = {
      dateRange,
      operationalArea,
      skillGroup,
    };
    setAppliedFilters(updated);
    loadData(false, updated);
    notify("Analytics filters applied successfully!");
  };

  // EXPORT OVERVIEW CSV
  const handleExportOverview = async () => {
    try {
      notify("Generating comprehensive analytics CSV export...");
      const blob = await volunteerReportsService.exportOverview(appliedFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carelink-reports-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      notify("Reports analytics exported successfully!");
    } catch {
      notify("Failed to export analytics report.");
    }
  };

  // EXPORT SPECIFIC REPORT ITEM CSV
  const handleExportReportItem = async (report: VolunteerReportItem) => {
    try {
      notify(`Exporting ${report.title}...`);
      const blob = await volunteerReportsService.exportReportItem(report.id, appliedFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carelink-${report.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setSelectedReport(null);
      notify(`${report.title} exported successfully!`);
    } catch {
      notify(`Failed to export ${report.title}.`);
    }
  };

  // PRINT
  const handlePrint = () => {
    window.print();
  };

  // CALCULATE MAX HOURS FOR SKILL BAR
  const maxSkillHours = Math.max(...skillData.map((s) => s.hours), 3480);

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <Check size={16} className="text-[#65bda5]" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <span className="text-[#8296aa]">Operations</span>
          <ChevronRight size={12} />
          <span className="text-[#8296aa]">Volunteer Coordination</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#17648e]">Reports & Analytics</span>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#123c5b]">
                Reports & Analytics
              </h1>

              {/* LIVE BACKEND STATUS BADGE */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${
                  isLiveBackend
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <Server size={11} />
                <span>{isLiveBackend ? "API Online (Live)" : "Demo Simulation"}</span>
              </div>
            </div>

            <p className="text-[12px] text-[#718ba0] mt-1">
              Measure volunteer mobilization readiness, task fulfillment, contribution hours, and safeguarding safety.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* REFRESH BUTTON */}
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-[38px] px-3.5 bg-white border border-[#d5e3e9] rounded-lg text-sm font-medium text-[#17648e] hover:bg-[#f5fafc] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              title="Refresh reports data"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            {/* PRINT BUTTON */}
            <button
              onClick={handlePrint}
              className="h-[38px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-sm font-medium text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-2 transition-colors"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            {/* EXPORT REPORT BUTTON */}
            <button
              onClick={handleExportOverview}
              className="h-[38px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-sm font-semibold shadow-xs transition-colors"
            >
              <Download size={13} />
              <span>Export report</span>
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl p-3.5 mb-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            {/* DATE RANGE */}
            <div>
              <label className="block text-sm font-bold text-[#123c5b] uppercase tracking-wider mb-1.5">
                Date range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white transition-colors cursor-pointer"
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
              <label className="block text-sm font-bold text-[#123c5b] uppercase tracking-wider mb-1.5">
                Operational area
              </label>
              <select
                value={operationalArea}
                onChange={(e) => setOperationalArea(e.target.value)}
                className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white transition-colors cursor-pointer"
              >
                <option>All areas</option>
                <option>North Ward</option>
                <option>Central Ward</option>
                <option>Eastbank</option>
                <option>West District</option>
                <option>South Ward</option>
              </select>
            </div>

            {/* SKILL GROUP */}
            <div>
              <label className="block text-sm font-bold text-[#123c5b] uppercase tracking-wider mb-1.5">
                Skill group
              </label>
              <select
                value={skillGroup}
                onChange={(e) => setSkillGroup(e.target.value)}
                className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white transition-colors cursor-pointer"
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

            {/* APPLY BUTTON */}
            <button
              onClick={handleApplyFilters}
              className="h-[38px] px-5 border border-[#b9d0dc] hover:bg-[#f1f8fc] rounded-lg text-sm text-[#17648e] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Filter size={13} />
              <span>Apply filters</span>
            </button>
          </div>
        </section>

        {/* KPI STATISTICS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
          <StatCard
            title="Tasks completed"
            value={analytics.tasksCompleted.toLocaleString()}
            description={analytics.completionRate || "89.4% completion"}
            icon={Check}
            color="bg-[#e5f5ef] text-[#239879]"
          />

          <StatCard
            title="Volunteer hours"
            value={analytics.volunteerHours.toLocaleString()}
            description={analytics.hoursComparison || "+12% vs previous week"}
            icon={Clock}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Acceptance rate"
            value={`${analytics.acceptanceRate}%`}
            description={analytics.invitationsCount || "3,418 invitations"}
            icon={Activity}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Incident-free shifts"
            value={`${analytics.incidentFreeRate}%`}
            description={analytics.incidentsSummary || "18 minor incidents"}
            icon={ShieldCheck}
            color="bg-[#e5f5ef] text-[#239879]"
          />
        </section>

        {/* CHARTS SECTION */}
        <section className="grid grid-cols-1 xl:grid-cols-[2.15fr_0.97fr] gap-4 mb-5">
          {/* TASK COMPLETION TREND */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d5e3e9] flex items-center justify-between bg-[#fbfdfe]">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">
                  Task completion trend
                </h2>
                <p className="text-[13px] text-[#8296aa] mt-0.5">
                  Created versus completed tasks across {appliedFilters.operationalArea}
                </p>
              </div>

              <span className="bg-[#e5f5ef] text-[#239879] px-2.5 py-1 rounded-md text-xs font-semibold border border-[#c4e8dc]">
                Target exceeded
              </span>
            </div>

            {/* SVG CHART */}
            <div className="p-5">
              <div className="w-full h-[210px]">
                <svg
                  viewBox="0 0 800 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#65bda5" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#65bda5" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* HORIZONTAL GRID LINES */}
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

                  {/* AREA SHAPE */}
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

                  {/* SMOOTH TREND LINE */}
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
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* TIMELINE DATES */}
              <div className="flex justify-between text-[13px] text-[#8296aa] mt-2 pt-2 border-t border-[#f1f5f8]">
                {trendData.map((item) => (
                  <span key={item.date} className="font-medium">
                    {item.date}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* HOURS BY SKILL GROUP */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.04)] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#d5e3e9] bg-[#fbfdfe]">
              <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">
                Hours by skill group
              </h2>
              <p className="text-[13px] text-[#8296aa] mt-0.5">
                {analytics.volunteerHours.toLocaleString()} contributed hours
              </p>
            </div>

            <div className="p-5 space-y-4.5 flex-1 flex flex-col justify-around">
              {skillData.map((skill) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#123c5b] w-[85px] shrink-0 truncate">
                    {skill.name}
                  </span>

                  <div className="flex-1 h-[8px] bg-[#e7eef1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#65bda5] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(5, (skill.hours / maxSkillHours) * 100))}%`,
                      }}
                    />
                  </div>

                  <span className="text-sm font-bold text-[#17648e] w-[45px] text-right">
                    {skill.hours.toLocaleString()}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REPORT LIBRARY */}
        <section>
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">Report Library</h2>
              <p className="text-[13px] text-[#8296aa] mt-0.5">
                Select an operational reporting module to inspect metrics or export filtered datasets.
              </p>
            </div>

            <span className="text-xs text-[#8296aa] bg-slate-100 px-2 py-0.5 rounded font-medium">
              {reportsList.length} report modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {reportsList.map((report) => {
              const Icon = getReportIcon(report.iconName);

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white border border-[#d5e3e9] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)] hover:border-[#287fa9] hover:shadow-md transition-all text-left min-h-[70px] group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-[#e5f5ef] text-[#239879] rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#d4f0e4] transition-colors">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#123c5b] group-hover:text-[#287fa9] transition-colors truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-[#8296aa] truncate mt-0.5">
                        {report.category}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-[#8296aa] group-hover:text-[#287fa9] group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* REPORT PREVIEW MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden border border-[#d5e3e9]">
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between bg-[#fbfdfe]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e5f5ef] text-[#239879] rounded-lg flex items-center justify-center">
                  {(() => {
                    const Icon = getReportIcon(selectedReport.iconName);
                    return <Icon size={20} />;
                  })()}
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b]">
                    {selectedReport.title}
                  </h2>
                  <p className="text-[13px] text-[#8296aa] mt-0.5">
                    {selectedReport.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#55728b] leading-5">
                {selectedReport.description}
              </p>

              {/* FILTER CONTEXT */}
              <div className="bg-[#f5f9fb] border border-[#e1eaf0] rounded-lg p-3.5 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#287fa9]" />
                  <span className="text-[#8296aa]">Date range:</span>
                  <strong className="text-[#123c5b]">{appliedFilters.dateRange}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#287fa9]" />
                  <span className="text-[#8296aa]">Operational Area:</span>
                  <strong className="text-[#123c5b]">{appliedFilters.operationalArea}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#287fa9]" />
                  <span className="text-[#8296aa]">Skill Group:</span>
                  <strong className="text-[#123c5b]">{appliedFilters.skillGroup}</strong>
                </div>
              </div>

              {/* SNAPSHOT METRICS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <p className="text-xs font-bold text-[#8296aa] uppercase tracking-wider">
                    Tasks in scope
                  </p>
                  <p className="text-[20px] font-bold text-[#123c5b] mt-0.5">
                    {analytics.tasksCompleted.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <p className="text-xs font-bold text-[#8296aa] uppercase tracking-wider">
                    Contributed Hours
                  </p>
                  <p className="text-[20px] font-bold text-[#159879] mt-0.5">
                    {analytics.volunteerHours.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* INFORMATION NOTICE */}
              <div className="bg-[#eaf5f9] border border-[#d1e8f2] rounded-lg p-3 flex items-start gap-2.5">
                <FileText size={16} className="text-[#287fa9] shrink-0 mt-0.5" />
                <p className="text-sm text-[#527d96] leading-4">
                  Exporting will package all volunteer log records for {selectedReport.title} into a formatted CSV spreadsheet ready for stakeholder review and operational audits.
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-[#d5e3e9] bg-[#fbfdfe] flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedReport(null)}
                className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-sm font-medium text-[#123c5b] hover:bg-slate-50 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => handleExportReportItem(selectedReport)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download size={13} />
                <span>Export CSV data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        type="button"
        onClick={() =>
          notify("Reports Helpdesk: Volunteer Analytics SLA metrics are synchronized with field dispatch logs.")
        }
        aria-label="Help"
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#153f60] hover:bg-[#123c5b] text-white rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
      >
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
