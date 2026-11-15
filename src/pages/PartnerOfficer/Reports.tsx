
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
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

type Report = {
  id: string;
  title: string;
  type: string;
  owner: string;
  period: string;
  submitted: string;
  status: string;
  progress: number;
};

const initialReports: Report[] = [
  {
    id: "RPT-1042",
    title: "Daily Partner Activity Report",
    type: "Daily Report",
    owner: "Sara Khan",
    period: "22 Jun 2025",
    submitted: "22 Jun - 12:18",
    status: "Submitted",
    progress: 100,
  },
  {
    id: "RPT-1038",
    title: "Food Distribution Progress Report",
    type: "Operational Report",
    owner: "Michael Torres",
    period: "21 Jun 2025",
    submitted: "21 Jun - 17:30",
    status: "Approved",
    progress: 100,
  },
  {
    id: "RPT-1034",
    title: "WASH Activity Report",
    type: "Sector Report",
    owner: "Nadia Silva",
    period: "20 Jun 2025",
    submitted: "20 Jun - 15:10",
    status: "Under Review",
    progress: 82,
  },
  {
    id: "RPT-1029",
    title: "Shelter Assessment Report",
    type: "Assessment Report",
    owner: "Sara Khan",
    period: "19 Jun 2025",
    submitted: "19 Jun - 14:00",
    status: "Draft",
    progress: 65,
  },
];

const weeklyData = [
  { day: "Mon", planned: 3200, reached: 2800 },
  { day: "Tue", planned: 5400, reached: 4200 },
  { day: "Wed", planned: 7600, reached: 6800 },
  { day: "Thu", planned: 9200, reached: 8200 },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const Reports = () => {
  const [reports, setReports] = useState(initialReports);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All report types");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const text = [
        report.id,
        report.title,
        report.type,
        report.owner,
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
        (typeFilter === "All report types" ||
          report.type === typeFilter) &&
        (statusFilter === "All statuses" ||
          report.status === statusFilter)
      );
    });
  }, [reports, search, activeTab, typeFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / pageSize)
  );

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
    link.download = "partner-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Create report
  const handleCreateReport = (report: Report) => {
    setReports((prev) => [report, ...prev]);
    setActiveTab("All");
    setSearch("");
    setTypeFilter("All report types");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Reports
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Submit partner updates and analyse reach, delivery,
            referrals, and operational performance.
          </p>
        </div>

        <div className="flex gap-2">
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

      {/* Daily Report Reminder */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#f2d49a] border-l-4 border-l-[#e9a12d] bg-[#fff8e9] p-4">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0cd] text-[#bd8229]">
            <Clock size={19} />
          </div>

          <div>
            <span className="rounded bg-[#fff0cd] px-2 py-1 text-[9px] font-semibold text-[#a96a12]">
              DUE TODAY - 18:00
            </span>

            <h3 className="mt-2 text-xs font-semibold text-[#153e5b]">
              Daily Partner Activity Report · Monsoon Floods 2025
            </h3>

            <p className="mt-1 text-[10px] text-slate-500">
              Progress saved · 82% complete · 3 sections require review
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c668a]"
        >
          Continue report
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<FileText size={20} />}
          title="Reports submitted"
          value="28"
          subtitle="Current operation"
          color="blue"
        />

        <StatCard
          icon={<Check size={20} />}
          title="On-time rate"
          value="96%"
          subtitle="↑ 4% this month"
          color="green"
        />

        <StatCard
          icon={<Users size={20} />}
          title="People reached"
          value="18.6K"
          subtitle="Across 4 sectors"
          color="blue"
        />

        <StatCard
          icon={<Clock size={20} />}
          title="Next deadline"
          value="4h 12m"
          subtitle="Daily activity report"
          color="orange"
        />

      </div>

      {/* Analytics */}
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
              <BarChart data={weeklyData} barGap={5}>
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

        {/* Response Performance */}
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
            <ProgressItem
              title="Referral acceptance"
              target="Target 90%"
              value={92}
            />

            <ProgressItem
              title="Resource delivery"
              target="Target 95%"
              value={88}
            />

            <ProgressItem
              title="Shelter coverage"
              target="Target 85%"
              value={96}
            />

            <ProgressItem
              title="Field activity completion"
              target="Target 90%"
              value={82}
            />
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

            {tab === "All" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                48
              </span>
            )}

            {tab === "Needs action" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                7
              </span>
            )}

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
            placeholder="Search reports..."
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
              {displayedReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {report.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
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

                  <td className="whitespace-nowrap px-3 py-4">
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
                      <span>{report.progress}%</span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={report.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight size={17} className="text-[#64849a]" />
                  </td>
                </tr>
              ))}

              {displayedReports.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No reports found.
                  </td>
                </tr>
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
            {Math.min(
              currentPage * pageSize,
              filteredReports.length
            )}{" "}
            of {filteredReports.length} reports
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
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
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
        />
      )}

      {showSchedule && (
        <ScheduleModal onClose={() => setShowSchedule(false)} />
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
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
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
          <p className="text-[10px] font-semibold text-[#153e5b]">
            {title}
          </p>
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
    <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}>
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
  onSubmit: (report: Report) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Daily Report");
  const [owner, setOwner] = useState("Sara Khan");
  const [period, setPeriod] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const report: Report = {
      id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      type,
      owner,
      period: new Date(`${period}T12:00:00`).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short", year: "numeric" }
      ),
      submitted: "Not submitted",
      status: "Draft",
      progress: 0,
    };

    onSubmit(report);
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
              Create a new partner activity report.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Report Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter report title"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Report Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Sara Khan</option>
              <option>Michael Torres</option>
              <option>Nadia Silva</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Reporting Period
            </label>
            <input
              required
              type="date"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600"
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
}: {
  report: Report;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {report.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Report Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <h3 className="mb-5 text-sm font-semibold text-[#153e5b]">
          {report.title}
        </h3>

        <div className="grid grid-cols-2 gap-5">
          <Detail label="Report Type" value={report.type} />
          <Detail label="Owner" value={report.owner} />
          <Detail label="Reporting Period" value={report.period} />
          <Detail label="Submitted" value={report.submitted} />
          <Detail label="Status" value={report.status} />
          <Detail label="Progress" value={`${report.progress}%`} />
        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Reporting Schedule Modal
function ScheduleModal({ onClose }: { onClose: () => void }) {
  const schedules = [
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Reporting Schedule
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Required reporting deadlines.
            </p>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          {schedules.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#d7e5eb] p-4"
            >
              <div>
                <p className="text-xs font-semibold text-[#153e5b]">
                  {item.name}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {item.deadline}
                </p>
              </div>

              <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-medium ${
                item.status === "Due today"
                  ? "bg-[#fff4df] text-[#bd8229]"
                  : "bg-[#e8f2f8] text-[#267ba4]"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

export default Reports;
