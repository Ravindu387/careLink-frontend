import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  FileText,
  Check,
  Users,
  Clock,
  Plus,
  CalendarDays,
  Download,
  Search,
  X,
  ChevronRight,
  RefreshCw,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Archive,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  partnerReportService,
  type PartnerReport,
  type PartnerReportsAnalytics,
  type CreatePartnerReportPayload,
} from "../../services/partnerReportService";

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const defaultWeeklyData = [
  { day: "Mon", planned: 3200, reached: 2800 },
  { day: "Tue", planned: 5400, reached: 4200 },
  { day: "Wed", planned: 7600, reached: 6800 },
  { day: "Thu", planned: 9200, reached: 8200 },
];

const defaultPerformanceTargets = [
  { title: "Referral acceptance", target: "Target 90%", value: 92 },
  { title: "Resource delivery", target: "Target 95%", value: 88 },
  { title: "Shelter coverage", target: "Target 85%", value: 96 },
  { title: "Field activity completion", target: "Target 90%", value: 82 },
];

const Reports = () => {
  const [reports, setReports] = useState<PartnerReport[]>([]);
  const [analytics, setAnalytics] = useState<PartnerReportsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All report types");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PartnerReport | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [fetchedReports, fetchedAnalytics] = await Promise.all([
        partnerReportService.getAll(),
        partnerReportService.getAnalytics(),
      ]);

      setReports(fetchedReports);
      setAnalytics(fetchedAnalytics);
      setIsLiveBackend(true);
    } catch (err) {
      console.warn("Using offline fallback reports data:", err);
      setIsLiveBackend(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fetchedReports, fetchedAnalytics] = await Promise.all([
          partnerReportService.getAll(),
          partnerReportService.getAnalytics(),
        ]);
        if (mounted) {
          setReports(fetchedReports);
          setAnalytics(fetchedAnalytics);
          setIsLiveBackend(true);
        }
      } catch (e) {
        if (mounted) {
          console.warn("Failed initial fetch", e);
          setIsLiveBackend(false);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const text = [
        report.id,
        report.title,
        report.type,
        report.owner,
        report.description || "",
      ].join(" ").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Draft", "Under Review"].includes(report.status)) ||
        (activeTab === "Active" &&
          ["Draft", "Under Review"].includes(report.status)) ||
        (activeTab === "Completed" &&
          ["Submitted", "Approved"].includes(report.status)) ||
        (activeTab === "Archived" && report.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (typeFilter === "All report types" || report.type === typeFilter) &&
        (statusFilter === "All statuses" || report.status === statusFilter)
      );
    });
  }, [reports, search, activeTab, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));

  const displayedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Report ID",
      "Title",
      "Type",
      "Owner",
      "Period",
      "Submitted",
      "Status",
      "Progress",
      "Description",
    ];

    const rows = filteredReports.map((r) => [
      r.id,
      r.title,
      r.type,
      r.owner,
      r.period,
      r.submitted,
      r.status,
      `${r.progress}%`,
      r.description || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `partner-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showNotification("Reports exported to CSV successfully.");
  };

  // Create report
  const handleCreateReport = async (payload: CreatePartnerReportPayload) => {
    try {
      const created = await partnerReportService.create(payload);
      setReports((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setActiveTab("All");
      setSearch("");
      setTypeFilter("All report types");
      setStatusFilter("All statuses");
      setCurrentPage(1);
      setShowCreateModal(false);
      showNotification(`Report '${created.title}' created successfully.`);
      loadData(true);
    } catch {
      showNotification("Failed to create report. Please try again.", "error");
    }
  };

  // Update status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await partnerReportService.updateStatus(id, newStatus);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReport?.id === id) {
        setSelectedReport(updated);
      }
      showNotification(`Report '${id}' marked as ${newStatus}.`);
      loadData(true);
    } catch {
      showNotification("Failed to update status. Please try again.", "error");
    }
  };

  // Delete report
  const handleDeleteReport = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete report ${id}?`)) {
      return;
    }
    try {
      await partnerReportService.delete(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setSelectedReport(null);
      showNotification(`Report '${id}' removed.`);
      loadData(true);
    } catch {
      showNotification("Failed to delete report.", "error");
    }
  };

  // Continue Daily Report reminder
  const handleContinueDailyReport = () => {
    const daily = reports.find((r) => r.type === "Daily Report" && r.status !== "Approved");
    if (daily) {
      setSelectedReport(daily);
    } else {
      setShowCreateModal(true);
    }
  };

  // Dynamic tab count helper
  const getTabCount = (tab: string): number => {
    if (analytics) {
      if (tab === "All") return analytics.totalReports;
      if (tab === "Needs action") return analytics.needsActionCount;
      if (tab === "Active") return analytics.activeCount;
      if (tab === "Completed") return analytics.completedCount;
      if (tab === "Archived") return analytics.archivedCount;
    }
    if (tab === "All") return reports.length;
    if (tab === "Needs action" || tab === "Active") {
      return reports.filter((r) => ["Draft", "Under Review"].includes(r.status)).length;
    }
    if (tab === "Completed") {
      return reports.filter((r) => ["Submitted", "Approved"].includes(r.status)).length;
    }
    if (tab === "Archived") {
      return reports.filter((r) => r.status === "Archived").length;
    }
    return 0;
  };

  const reminder = analytics?.reminder ?? {
    title: "Daily Partner Activity Report · Monsoon Floods 2025",
    deadline: "DUE TODAY - 18:00",
    subtitle: "Progress saved · 82% complete · 3 sections require review",
    progress: 82,
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg p-3 text-xs shadow-sm transition ${
            feedbackMessage.type === "success"
              ? "border border-[#8ad1b8] bg-[#e6f7f1] text-[#1e7a5d]"
              : "border border-[#f5b8b8] bg-[#fdeeee] text-[#b92c2c]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Partner Coordination
              <span className="mx-2">›</span>
              <span className="font-semibold text-[#153e5b]">Reports</span>
            </p>

            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isLiveBackend
                  ? "bg-[#e5f6f0] text-[#299b7d]"
                  : "bg-[#fff4df] text-[#bd8229]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveBackend ? "bg-[#299b7d]" : "bg-[#bd8229]"
                }`}
              />
              {isLiveBackend ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#153e5b]">Reports</h1>

          <p className="mt-2 text-sm text-slate-500">
            Submit partner updates and analyse reach, delivery, referrals, and operational performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            title="Refresh reports data from API"
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            Sync
          </button>

          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <CalendarDays size={15} />
            Reporting schedule
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Create report
          </button>
        </div>
      </div>

      {/* Daily Report Reminder Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#f2d49a] border-l-4 border-l-[#e9a12d] bg-[#fff8e9] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0cd] text-[#bd8229]">
            <Clock size={19} />
          </div>

          <div>
            <span className="rounded bg-[#fff0cd] px-2 py-1 text-[9px] font-semibold text-[#a96a12]">
              {reminder.deadline}
            </span>

            <h3 className="mt-2 text-xs font-semibold text-[#153e5b]">
              {reminder.title}
            </h3>

            <p className="mt-1 text-[10px] text-slate-500">
              {reminder.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleContinueDailyReport}
          className="rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668a]"
        >
          Continue report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FileText size={20} />}
          title="Reports submitted"
          value={analytics?.reportsSubmitted ?? `${reports.filter((r) => r.status === "Submitted" || r.status === "Approved").length}`}
          subtitle="Current operation"
          color="blue"
        />

        <StatCard
          icon={<Check size={20} />}
          title="On-time rate"
          value={analytics?.onTimeRate ?? "96%"}
          subtitle={analytics?.onTimeTrend ?? "↑ 4% this month"}
          color="green"
        />

        <StatCard
          icon={<Users size={20} />}
          title="People reached"
          value={analytics?.peopleReached ?? "18.6K"}
          subtitle={analytics?.peopleReachedSubtitle ?? "Across 4 sectors"}
          color="blue"
        />

        <StatCard
          icon={<Clock size={20} />}
          title="Next deadline"
          value={analytics?.nextDeadline ?? "4h 12m"}
          subtitle={analytics?.nextDeadlineSubtitle ?? "Daily activity report"}
          color="orange"
        />
      </div>

      {/* Analytics Charts & Progress */}
      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* Weekly Chart */}
        <div className="rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-[#d7e5eb] px-4 py-4">
            <div>
              <h2 className="text-sm font-medium text-[#153e5b]">
                People reached by week
              </h2>
              <p className="mt-1 text-[10px] text-slate-400">
                Planned compared with verified reach
              </p>
            </div>

            <div className="flex gap-3 text-[9px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[#287fa8]" />
                Planned
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[#62b99e]" />
                Reached
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.weeklyReach?.length ? analytics.weeklyReach : defaultWeeklyData}
                barGap={5}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e7eef2"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#71869a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#71869a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="planned"
                  name="Planned"
                  fill="#287fa8"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="reached"
                  name="Reached"
                  fill="#62b99e"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Performance Targets */}
        <div className="rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
          <div className="border-b border-[#d7e5eb] px-4 py-4">
            <h2 className="text-sm font-medium text-[#153e5b]">
              Response performance
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Current operational targets
            </p>
          </div>

          <div className="space-y-5 p-4">
            {(analytics?.performanceTargets?.length
              ? analytics.performanceTargets
              : defaultPerformanceTargets
            ).map((item) => (
              <ProgressItem
                key={item.title}
                title={item.title}
                target={item.target}
                value={item.value}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`relative whitespace-nowrap pb-4 text-xs ${
              activeTab === tab
                ? "font-semibold text-[#267ba4]"
                : "text-slate-500 hover:text-[#267ba4]"
            }`}
          >
            {tab}
            <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
              {getTabCount(tab)}
            </span>

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reports by title, ID, type, or owner..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All report types</option>
          <option>Daily Report</option>
          <option>Operational Report</option>
          <option>Sector Report</option>
          <option>Assessment Report</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Submitted</option>
          <option>Approved</option>
          <option>Under Review</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Download size={15} />
          Export
        </button>
      </div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Report ID",
                  "Report",
                  "Type",
                  "Owner",
                  "Reporting Period",
                  "Submitted",
                  "Progress",
                  "Status",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={15} className="animate-spin text-[#267ba4]" />
                      <span>Loading partner reports...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                displayedReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                  >
                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                      {report.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-medium text-[#153e5b]">
                      {report.title}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {report.type}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {report.owner}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {report.period}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                      {report.submitted}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#62b99e]"
                            style={{ width: `${report.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600">{report.progress}%</span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="px-3 py-4 text-right">
                      <ChevronRight size={17} className="inline text-[#64849a]" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-[10px] text-slate-400">
            Showing{" "}
            {filteredReports.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredReports.length)}{" "}
            of {filteredReports.length} reports
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  currentPage === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateReportModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReport}
        />
      )}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteReport}
        />
      )}

      {showSchedule && (
        <ScheduleModal
          schedules={analytics?.schedules}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
};

// Statistics Card
function StatCard({
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
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    green: "bg-[#e5f6f0] text-[#299b7d]",
    orange: "bg-[#fff4df] text-[#d69b30]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          colors[color] || colors.blue
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-[9px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// Performance Progress
function ProgressItem({
  title,
  target,
  value,
}: {
  title: string;
  target: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[#153e5b]">{title}</p>
          <p className="text-[9px] text-slate-400">{target}</p>
        </div>
        <span className="text-[10px] font-semibold text-[#153e5b]">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#e9eff2]">
        <div
          className="h-full rounded-full bg-[#62b99e]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Submitted: "bg-[#e5f6f0] text-[#299b7d]",
    Approved: "bg-[#e5f6f0] text-[#299b7d]",
    "Under Review": "bg-[#e8f2f8] text-[#267ba4]",
    Draft: "bg-[#fff4df] text-[#bd8229]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`inline-block rounded-md px-2 py-1 text-[9px] font-medium ${
        styles[status] || "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

// Create Report Modal
function CreateReportModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (report: CreatePartnerReportPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Daily Report");
  const [owner, setOwner] = useState("Sara Khan");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedPeriod = period
      ? new Date(`${period}T12:00:00`).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

    onSubmit({
      title,
      type,
      owner,
      period: formattedPeriod,
      status: "Draft",
      progress,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Create Report
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Create a new partner activity or sectoral assessment report.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Report Title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Partner Activity Report · Flood Response"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Report Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>Daily Report</option>
                <option>Operational Report</option>
                <option>Sector Report</option>
                <option>Assessment Report</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Report Owner
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>Sara Khan</option>
                <option>Michael Torres</option>
                <option>Nadia Silva</option>
                <option>Partner Lead</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Reporting Period *
              </label>
              <input
                required
                type="date"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Initial Progress ({progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="mt-2 w-full accent-[#267ba4]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Summary / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight key achievements, field sectors covered, or pending review points..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={14} />
            Create Report
          </button>
        </div>
      </form>
    </div>
  );
}

// Report Details Modal
function ReportDetailsModal({
  report,
  onClose,
  onUpdateStatus,
  onDelete,
}: {
  report: PartnerReport;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#267ba4]">
                {report.id}
              </span>
              <StatusBadge status={report.status} />
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Report Details
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-4 text-sm font-semibold text-[#153e5b]">
          {report.title}
        </h3>

        {report.description && (
          <div className="mb-4 rounded-lg bg-[#f8fafc] p-3 text-xs leading-relaxed text-slate-600">
            {report.description}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Detail label="Report Type" value={report.type} />
          <Detail label="Owner" value={report.owner} />
          <Detail label="Reporting Period" value={report.period} />
          <Detail label="Submitted" value={report.submitted} />
          <Detail label="Completion Progress" value={`${report.progress}%`} />
          <Detail label="Last Updated" value={report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : "Recent"} />
        </div>

        {/* Status Actions */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {report.status !== "Submitted" && report.status !== "Approved" && (
              <button
                onClick={() => onUpdateStatus(report.id, "Submitted")}
                className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-3 py-2 text-xs font-medium text-white hover:bg-[#1c668a]"
              >
                <Send size={13} />
                Submit Report
              </button>
            )}

            {report.status === "Submitted" && (
              <button
                onClick={() => onUpdateStatus(report.id, "Approved")}
                className="flex items-center gap-1.5 rounded-lg bg-[#299b7d] px-3 py-2 text-xs font-medium text-white hover:bg-[#208369]"
              >
                <Check size={13} />
                Approve Report
              </button>
            )}

            {report.status !== "Archived" ? (
              <button
                onClick={() => onUpdateStatus(report.id, "Archived")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Archive size={13} />
                Archive
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(report.id, "Draft")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Restore to Draft
              </button>
            )}

            <button
              onClick={() => onDelete(report.id)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Reporting Schedule Modal
function ScheduleModal({
  schedules,
  onClose,
}: {
  schedules?: PartnerReportsAnalytics["schedules"];
  onClose: () => void;
}) {
  const fallbackSchedules = [
    {
      name: "Daily Partner Activity Report",
      deadline: "Every day · 18:00",
      status: "Due today",
    },
    {
      name: "Weekly Operational Report",
      deadline: "Every Friday · 16:00",
      status: "Upcoming",
    },
    {
      name: "Monthly Performance Report",
      deadline: "Last day of month",
      status: "Upcoming",
    },
  ];

  const list = schedules?.length ? schedules : fallbackSchedules;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Reporting Schedule
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Required operational reporting deadlines for partner organizations.
            </p>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#d7e5eb] p-4"
            >
              <div>
                <p className="text-xs font-semibold text-[#153e5b]">{item.name}</p>
                <p className="mt-1 text-[10px] text-slate-500">{item.deadline}</p>
              </div>

              <span
                className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-medium ${
                  item.status === "Due today"
                    ? "bg-[#fff4df] text-[#bd8229]"
                    : "bg-[#e8f2f8] text-[#267ba4]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

export default Reports;
