
import { useMemo, useState } from "react";
import {
  FileText,
  Clock,
  Building2,
  AlertTriangle,
  Search,
  Download,
  Plus,
  Eye,
  X,
  FilePlus,
  ChevronRight,
  LayoutTemplate,
  Printer,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  period: string;
  status: "Approved" | "Published" | "Draft";
  preparedBy: string;
  approvedBy: string;
  recipients: number;
  event: string;
}

const initialReports: Report[] = [
  {
    id: "SITREP 024",
    title: "Greater Riverton Flood Response",
    period: "22 June 2025 · 08:00–12:00 UTC",
    status: "Approved",
    preparedBy: "Operations Analysis Team",
    approvedBy: "Amina Mensah",
    recipients: 48,
    event: "Monsoon Floods 2025",
  },
  {
    id: "SITREP 023",
    title: "Greater Riverton Flood Response",
    period: "22 June 2025 · 06:00–08:00 UTC",
    status: "Published",
    preparedBy: "Operations Analysis Team",
    approvedBy: "Amina Mensah",
    recipients: 48,
    event: "Monsoon Floods 2025",
  },
  {
    id: "SITREP 022",
    title: "North Ridge Landslide Response",
    period: "21 June 2025 · 16:00–20:00 UTC",
    status: "Approved",
    preparedBy: "Emergency Coordination Team",
    approvedBy: "Amina Mensah",
    recipients: 32,
    event: "North Ridge Landslide",
  },
  {
    id: "SITREP 021",
    title: "Eastbank Emergency Response",
    period: "20 June 2025 · 08:00–12:00 UTC",
    status: "Draft",
    preparedBy: "Operations Analysis Team",
    approvedBy: "Pending approval",
    recipients: 0,
    event: "Monsoon Floods 2025",
  },
];

const statusStyles: Record<Report["status"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Published: "bg-sky-50 text-sky-700",
  Draft: "bg-amber-50 text-amber-700",
};

export default function SituationReports() {
  const [reports, setReports] = useState(initialReports);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All crisis events");
  const [statusFilter, setStatusFilter] = useState("All report states");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newEvent, setNewEvent] = useState("Monsoon Floods 2025");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        `${report.id} ${report.title} ${report.event}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesEvent =
        eventFilter === "All crisis events" ||
        report.event === eventFilter;

      const matchesStatus =
        statusFilter === "All report states" ||
        report.status === statusFilter;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [reports, search, eventFilter, statusFilter]);

  const publishedCount = reports.filter(
    (r) => r.status === "Approved" || r.status === "Published"
  ).length;

  const draftCount = reports.filter(
    (r) => r.status === "Draft"
  ).length;

  const totalRecipients = reports.reduce(
    (sum, r) => sum + r.recipients,
    0
  );

  const downloadReport = (report: Report) => {
    const content = `
SITUATION REPORT

${report.id} - ${report.title}

Reporting Period: ${report.period}
Crisis Event: ${report.event}
Status: ${report.status}

Prepared By: ${report.preparedBy}
Approved By: ${report.approvedBy}
Partner Recipients: ${report.recipients}

HUMANITARIAN CRISIS MANAGEMENT PLATFORM
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to download the report.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${report.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #153f5e;
            }
            h1 { color: #153f5e; }
            pre {
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.8;
            }
          </style>
        </head>
        <body>
          <h1>Situation Report</h1>
          <pre>${content}</pre>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const createReport = () => {
    if (!newTitle.trim()) {
      alert("Please enter a report title.");
      return;
    }

    const newReport: Report = {
      id: `SITREP ${String(reports.length + 25).padStart(3, "0")}`,
      title: newTitle,
      period: "09 November 2026 · 08:00–12:00 UTC",
      status: "Draft",
      preparedBy: "Operations Analysis Team",
      approvedBy: "Pending approval",
      recipients: 0,
      event: newEvent,
    };

    setReports((previous) => [newReport, ...previous]);
    setShowCreate(false);
    setNewTitle("");
  };

  const latestReport =
    reports.find((report) => report.status === "Approved") || reports[0];

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">

      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Situation Reports
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Create, review, approve, and distribute verified
            operational situation reports.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 rounded-lg border border-[#c4d7e1] bg-white px-4 py-2.5 text-xs font-medium text-[#175477] hover:bg-sky-50"
          >
            <LayoutTemplate size={15} />
            Templates
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            <Plus size={16} />
            Create report
          </button>

        </div>
      </div>

      {/* Latest approved report */}
      {latestReport && (
        <div className="mb-4 rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">

          <div className="mb-2 rounded-md bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
            LATEST APPROVED
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex-1">
              <h2 className="text-base font-medium text-[#153f5e]">
                {latestReport.id} · {latestReport.title}
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Reporting period: {latestReport.period}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">

                <div>
                  <p className="text-[10px] text-slate-400">
                    Prepared by
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                    {latestReport.preparedBy}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Approved by
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                    {latestReport.approvedBy}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Distribution
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                    {latestReport.recipients} partner organisations
                  </p>
                </div>

              </div>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => setSelectedReport(latestReport)}
                className="flex items-center gap-2 rounded-lg border border-[#c4d7e1] px-4 py-2.5 text-xs text-[#175477] hover:bg-sky-50"
              >
                <Eye size={14} />
                Preview
              </button>

              <button
                onClick={() => downloadReport(latestReport)}
                className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
              >
                <Download size={14} />
                Download PDF
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={FileText}
          title="Reports published"
          value={publishedCount.toString()}
          subtitle="Current crisis event"
          color="blue"
        />

        <StatCard
          icon={Clock}
          title="Reports in draft"
          value={draftCount.toString()}
          subtitle="Awaiting review"
          color="amber"
        />

        <StatCard
          icon={Building2}
          title="Partner recipients"
          value={totalRecipients.toString()}
          subtitle="Across available reports"
          color="blue"
        />

        <StatCard
          icon={AlertTriangle}
          title="Next report due"
          value="2h 18m"
          subtitle="SITREP 025"
          color="amber"
        />

      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_auto_auto_auto]">

        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report number or title..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>All crisis events</option>
          <option>Monsoon Floods 2025</option>
          <option>North Ridge Landslide</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>All report states</option>
          <option>Approved</option>
          <option>Published</option>
          <option>Draft</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>Date range</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>

      </div>

      {/* Report list */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">

        {filteredReports.map((report) => (

          <div
            key={report.id}
            className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm transition hover:shadow-md"
          >

            <div className="flex items-center justify-between border-b border-slate-100 p-4">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-[#e8f2f8] p-2.5 text-[#287da5]">
                  <FileText size={20} />
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#153f5e]">
                    {report.id} · {report.title}
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {report.period} · {report.recipients} recipients
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <span className={`rounded-md px-2 py-2 text-[10px] font-semibold ${statusStyles[report.status]}`}>
                  {report.status}
                </span>

                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-slate-500 hover:text-[#287da5]"
                >
                  <ChevronRight size={19} />
                </button>

              </div>
            </div>

            <div className="p-4">

              <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2">
                <p className="text-[9px] font-bold text-emerald-700">
                  {report.status === "Approved"
                    ? "APPROVED REPORT"
                    : report.status === "Published"
                      ? "PUBLISHED REPORT"
                      : "DRAFT REPORT"}
                </p>
              </div>

              <h3 className="text-sm font-medium text-[#153f5e]">
                {report.id} · {report.title}
              </h3>

              <p className="mt-1 text-[10px] text-slate-500">
                Reporting period: {report.period}
              </p>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">

                <div className="flex flex-wrap gap-x-7 gap-y-2">

                  <div>
                    <p className="text-[10px] text-slate-400">
                      Prepared by
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[#153f5e]">
                      {report.preparedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">
                      Approved by
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[#153f5e]">
                      {report.approvedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">
                      Distribution
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[#153f5e]">
                      {report.recipients} organisations
                    </p>
                  </div>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#c4d7e1] px-3 py-2 text-[10px] text-[#175477] hover:bg-sky-50"
                  >
                    <Eye size={13} />
                    Preview
                  </button>

                  <button
                    onClick={() => downloadReport(report)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#216789]"
                  >
                    <Download size={13} />
                    Download PDF
                  </button>

                </div>

              </div>
            </div>
          </div>

        ))}

      </div>

      {filteredReports.length === 0 && (
        <div className="rounded-xl border border-[#d5e2e9] bg-white py-16 text-center">
          <FileText size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            No reports found
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try changing your search or filters.
          </p>
        </div>
      )}

      {/* Create report modal */}
      {showCreate && (
        <Modal title="Create situation report" onClose={() => setShowCreate(false)}>

          <label className="mb-2 block text-xs font-medium text-slate-600">
            Report title
          </label>

          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter report title"
            className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-500"
          />

          <label className="mb-2 block text-xs font-medium text-slate-600">
            Crisis event
          </label>

          <select
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            className="mb-5 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none"
          >
            <option>Monsoon Floods 2025</option>
            <option>North Ridge Landslide</option>
            <option>Eastbank Emergency Response</option>
          </select>

          <button
            onClick={createReport}
            className="w-full rounded-lg bg-[#287da5] py-3 text-sm font-semibold text-white hover:bg-[#216789]"
          >
            Create draft report
          </button>

        </Modal>
      )}

      {/* Report preview modal */}
      {selectedReport && (
        <Modal title="Situation report preview" onClose={() => setSelectedReport(null)}>

          <div className="mb-4 rounded-lg bg-emerald-50 p-3">
            <p className="text-[10px] font-bold text-emerald-700">
              {selectedReport.status.toUpperCase()}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#153f5e]">
              {selectedReport.id}
            </h3>
            <p className="text-sm text-slate-600">
              {selectedReport.title}
            </p>
          </div>

          <div className="space-y-4 text-xs">

            <Detail label="Crisis event" value={selectedReport.event} />
            <Detail label="Reporting period" value={selectedReport.period} />
            <Detail label="Prepared by" value={selectedReport.preparedBy} />
            <Detail label="Approved by" value={selectedReport.approvedBy} />
            <Detail label="Partner organisations" value={String(selectedReport.recipients)} />

          </div>

          <button
            onClick={() => downloadReport(selectedReport)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#287da5] py-3 text-xs font-semibold text-white"
          >
            <Printer size={15} />
            Print / Save as PDF
          </button>

        </Modal>
      )}

      {/* Templates modal */}
      {showTemplates && (
        <Modal title="Report templates" onClose={() => setShowTemplates(false)}>

          <div className="space-y-3">

            {[
              "Situation Report (SITREP)",
              "Daily Operations Report",
              "Resource Distribution Report",
              "Emergency Assessment Report",
            ].map((template) => (

              <button
                key={template}
                onClick={() => {
                  setNewTitle(template);
                  setShowTemplates(false);
                  setShowCreate(true);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-4 text-left text-xs font-medium text-[#153f5e] hover:bg-sky-50"
              >
                <span className="flex items-center gap-3">
                  <FilePlus size={17} className="text-[#287da5]" />
                  {template}
                </span>
                <ChevronRight size={16} />
              </button>

            ))}

          </div>
        </Modal>
      )}

    </div>
  );
}

// Statistics card
function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: typeof FileText;
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "amber";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">

      <div className={`rounded-lg p-3 ${
        color === "blue"
          ? "bg-[#e8f2f8] text-[#287da5]"
          : "bg-amber-50 text-amber-600"
      }`}>
        <Icon size={20} />
      </div>

      <div>
        <p className="text-[10px] text-slate-400">{title}</p>
        <p className="mt-0.5 text-2xl font-semibold text-[#153f5e]">
          {value}
        </p>
        <p className="text-[10px] text-slate-400">{subtitle}</p>
      </div>

    </div>
  );
}

// Modal component
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#153f5e]">
            {title}
          </h2>

          <button onClick={onClose}>
            <X size={19} className="text-slate-500" />
          </button>
        </div>

        {children}

      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-[#153f5e]">{value}</span>
    </div>
  );
}
