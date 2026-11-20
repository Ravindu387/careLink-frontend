import { useState, useEffect, useCallback, useMemo } from "react";
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
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Send,
} from "lucide-react";
import {
  situationReportService,
  type SituationReport,
  type SituationReportMetrics,
} from "../../services/situationReportService";

const statusStyles: Record<SituationReport["status"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Published: "bg-sky-50 text-sky-700",
  Draft: "bg-amber-50 text-amber-700",
};

export default function SituationReports() {
  const [reports, setReports] = useState<SituationReport[]>([]);
  const [metrics, setMetrics] = useState<SituationReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All crisis events");
  const [statusFilter, setStatusFilter] = useState("All report states");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [selectedReport, setSelectedReport] = useState<SituationReport | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newEvent, setNewEvent] = useState("Monsoon Floods 2025");
  const [newSummary, setNewSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [list, met] = await Promise.all([
        situationReportService.getAll({
          search: search || undefined,
          event: eventFilter !== "All crisis events" ? eventFilter : undefined,
          status: statusFilter !== "All report states" ? statusFilter : undefined,
          dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
        }),
        situationReportService.getMetrics(),
      ]);
      setReports(list);
      setMetrics(met);
      setIsLiveConnected(true);
    } catch {
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, eventFilter, statusFilter, dateFilter]);

  useEffect(() => {
    let isMounted = true;
    situationReportService
      .getAll()
      .then((list) => {
        if (isMounted) setReports(list);
      })
      .catch(() => {});

    situationReportService
      .getMetrics()
      .then((met) => {
        if (isMounted) {
          setMetrics(met);
          setIsLiveConnected(true);
        }
      })
      .catch(() => {
        if (isMounted) setIsLiveConnected(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const interval = setInterval(() => {
      loadData();
    }, 25000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleResetData = async () => {
    setRefreshing(true);
    await situationReportService.reset();
    await loadData();
    notify("Situation reports reset to baseline fixtures.");
  };

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const createReport = async () => {
    if (!newTitle.trim()) {
      notify("Please enter a report title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await situationReportService.create({
        title: newTitle.trim(),
        event: newEvent,
        executiveSummary: newSummary.trim() || undefined,
      });

      setShowCreate(false);
      setNewTitle("");
      setNewSummary("");
      notify(`Draft created: ${created.id}`);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || "Failed to create report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransitionStatus = async (
    id: string,
    newStatus: "Approved" | "Published" | "Draft"
  ) => {
    try {
      const updated = await situationReportService.updateStatus(id, {
        status: newStatus,
        approvedBy: newStatus === "Draft" ? "Pending approval" : "Amina Mensah",
        recipients: newStatus === "Draft" ? 0 : 48,
      });

      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(updated);
      }
      notify(`${id} status updated to ${newStatus}.`);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || "Failed to update report status.");
    }
  };

  const downloadReport = (report: SituationReport) => {
    const content = `
SITUATION REPORT

${report.id} - ${report.title}

Reporting Period: ${report.period}
Crisis Event: ${report.event}
Status: ${report.status}

Prepared By: ${report.preparedBy}
Approved By: ${report.approvedBy}
Partner Recipients: ${report.recipients} organisations

EXECUTIVE SUMMARY:
${report.executiveSummary ?? "Ongoing coordinated disaster response in lowland and vulnerable sectors. All active personnel operating under unified incident command."}

HUMANITARIAN CRISIS MANAGEMENT PLATFORM · RELIEFOS TELEMETRY
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download the report.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${report.id} - Situation Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #153f5e;
              background-color: #ffffff;
            }
            h1 { color: #153f5e; border-bottom: 2px solid #287da5; padding-bottom: 10px; }
            pre {
              white-space: pre-wrap;
              font-size: 13px;
              line-height: 1.8;
              font-family: inherit;
            }
          </style>
        </head>
        <body>
          <h1>ReliefOS Situation Report</h1>
          <pre>${content}</pre>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const publishedCount = useMemo(() => {
    if (metrics) return metrics.publishedCount;
    return reports.filter((r) => r.status === "Approved" || r.status === "Published").length;
  }, [metrics, reports]);

  const draftCount = useMemo(() => {
    if (metrics) return metrics.draftCount;
    return reports.filter((r) => r.status === "Draft").length;
  }, [metrics, reports]);

  const totalRecipients = useMemo(() => {
    if (metrics) return metrics.totalRecipients;
    return reports.reduce((sum, r) => sum + r.recipients, 0);
  }, [metrics, reports]);

  const nextDue = metrics?.nextReportDue ?? "2h 18m";
  const nextReportNumber = metrics?.nextReportId ?? `SITREP ${String(reports.length + 22).padStart(3, "0")}`;

  const latestReport = useMemo(() => {
    if (metrics?.latestApproved) return metrics.latestApproved;
    return reports.find((r) => r.status === "Approved") ?? reports[0];
  }, [metrics, reports]);

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#153f5e] px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-[#70c5ad]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Page Heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#153f5e]">Situation Reports</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isLiveConnected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isLiveConnected ? "Live Backend Synchronized" : "Local Cached"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Create, review, approve, and distribute verified operational situation reports to humanitarian partners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh reports"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Reset to default seed fixtures"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 rounded-lg border border-[#c4d7e1] bg-white px-4 py-2 text-xs font-medium text-[#175477] hover:bg-sky-50 transition-colors"
          >
            <LayoutTemplate size={15} />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#153f5e] transition-colors"
          >
            <Plus size={16} />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Latest Approved Report Card */}
      {latestReport && (
        <div className="mb-4 rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-xs">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            LATEST APPROVED SITREP
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[280px]">
              <h2 className="text-base font-bold text-[#153f5e]">
                {latestReport.id} · {latestReport.title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Reporting period: {latestReport.period}
              </p>

              <div className="mt-3.5 flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Prepared by
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#153f5e]">
                    {latestReport.preparedBy}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Approved by
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#153f5e]">
                    {latestReport.approvedBy}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Distribution
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#153f5e]">
                    {latestReport.recipients} partner organisations
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReport(latestReport)}
                className="flex items-center gap-2 rounded-lg border border-[#c4d7e1] px-3.5 py-2 text-xs font-medium text-[#175477] hover:bg-sky-50 transition-colors"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>

              <button
                onClick={() => downloadReport(latestReport)}
                className="flex items-center gap-2 rounded-lg bg-[#287da5] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#153f5e] transition-colors"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          title="Reports Published"
          value={publishedCount.toString()}
          subtitle="Current operational cycle"
          color="blue"
        />

        <StatCard
          icon={Clock}
          title="Reports in Draft"
          value={draftCount.toString()}
          subtitle="Awaiting coordinator review"
          color="amber"
        />

        <StatCard
          icon={Building2}
          title="Partner Recipients"
          value={totalRecipients.toString()}
          subtitle="Receiving telemetry reports"
          color="blue"
        />

        <StatCard
          icon={AlertTriangle}
          title="Next Report Due"
          value={nextDue}
          subtitle={nextReportNumber}
          color="amber"
        />
      </div>

      {/* Search and Filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_auto_auto_auto]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 shadow-2xs">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID, title, or disaster..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 text-xs text-slate-700 outline-none shadow-2xs"
        >
          <option>All crisis events</option>
          <option>Monsoon Floods 2025</option>
          <option>North Ridge Landslide</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 text-xs text-slate-700 outline-none shadow-2xs"
        >
          <option>All report states</option>
          <option>Approved</option>
          <option>Published</option>
          <option>Draft</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 text-xs text-slate-700 outline-none shadow-2xs"
        >
          <option>Date range</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {loading ? (
          <div className="col-span-full rounded-xl border border-[#d5e2e9] bg-white py-16 text-center text-xs text-slate-400">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#287da5]" />
            Loading situation reports...
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-xs transition hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-[#e8f2f8] p-2.5 text-[#287da5] shrink-0">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#153f5e] truncate">
                      {report.id} · {report.title}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-slate-400 truncate">
                      {report.period} · {report.recipients} recipients
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                      statusStyles[report.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {report.status}
                  </span>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#287da5]"
                    title="View details"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-[#153f5e] leading-snug">
                  {report.id} · {report.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Event: <span className="font-semibold text-slate-700">{report.event}</span> · Period: {report.period}
                </p>

                {report.executiveSummary && (
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 bg-[#f8fafb] rounded-md p-2">
                    {report.executiveSummary}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Prepared by
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#153f5e]">
                        {report.preparedBy}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Approved by
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#153f5e]">
                        {report.approvedBy}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Recipients
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#153f5e]">
                        {report.recipients} orgs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {report.status === "Draft" ? (
                      <button
                        onClick={() => handleTransitionStatus(report.id, "Approved")}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 size={12} />
                        <span>Approve</span>
                      </button>
                    ) : report.status === "Approved" ? (
                      <button
                        onClick={() => handleTransitionStatus(report.id, "Published")}
                        className="flex items-center gap-1 rounded-lg bg-[#287da5] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#153f5e] transition-colors"
                      >
                        <Send size={12} />
                        <span>Publish</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-1 rounded-lg border border-[#c4d7e1] px-3 py-1.5 text-[11px] font-medium text-[#175477] hover:bg-sky-50 transition-colors"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => downloadReport(report)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && reports.length === 0 && (
        <div className="rounded-xl border border-[#d5e2e9] bg-white py-16 text-center">
          <FileText size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No reports found</p>
          <p className="mt-1 text-xs text-slate-400">
            Try modifying your search keywords or clear applied filters.
          </p>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreate && (
        <Modal title="Create Situation Report Draft" onClose={() => setShowCreate(false)}>
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700">Report Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Greater Riverton Lowland Evacuation Assessment"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#287da5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Crisis Event</label>
              <select
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#287da5]"
              >
                <option>Monsoon Floods 2025</option>
                <option>North Ridge Landslide</option>
                <option>Eastbank Emergency Response</option>
                <option>Northern Province Heatwave</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Executive Summary</label>
              <textarea
                rows={3}
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Key operational updates, sector casualties, and priority actions..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#287da5]"
              />
            </div>

            <button
              disabled={isSubmitting}
              onClick={createReport}
              className="mt-2 w-full rounded-lg bg-[#287da5] py-2.5 text-xs font-semibold text-white hover:bg-[#153f5e] transition-colors"
            >
              {isSubmitting ? "Creating Draft..." : "Create Draft Report"}
            </button>
          </div>
        </Modal>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <Modal title="Situation Report Preview" onClose={() => setSelectedReport(null)}>
          <div className="mb-4 rounded-xl bg-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider">
                {selectedReport.status.toUpperCase()} SITREP
              </span>
              <span className="text-[10px] font-mono text-emerald-800">
                {selectedReport.id}
              </span>
            </div>
            <h3 className="mt-1 text-base font-bold text-[#153f5e]">
              {selectedReport.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Event: {selectedReport.event} · Period: {selectedReport.period}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <Detail label="Crisis Event" value={selectedReport.event} />
            <Detail label="Reporting Period" value={selectedReport.period} />
            <Detail label="Prepared By" value={selectedReport.preparedBy} />
            <Detail label="Approved By" value={selectedReport.approvedBy} />
            <Detail label="Partner Recipients" value={`${selectedReport.recipients} organisations`} />
            {selectedReport.executiveSummary && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Executive Summary
                </span>
                <p className="mt-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                  {selectedReport.executiveSummary}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {selectedReport.status === "Draft" && (
              <button
                onClick={() => handleTransitionStatus(selectedReport.id, "Approved")}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Approve SITREP
              </button>
            )}
            {selectedReport.status === "Approved" && (
              <button
                onClick={() => handleTransitionStatus(selectedReport.id, "Published")}
                className="flex-1 rounded-lg bg-[#287da5] py-2.5 text-xs font-semibold text-white hover:bg-[#153f5e] transition-colors"
              >
                Publish & Distribute
              </button>
            )}
            <button
              onClick={() => downloadReport(selectedReport)}
              className="flex items-center justify-center gap-1.5 flex-1 rounded-lg border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </Modal>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <Modal title="Standard Report Templates" onClose={() => setShowTemplates(false)}>
          <div className="space-y-2.5">
            {[
              {
                title: "Situation Report (SITREP)",
                desc: "Standard 4-hourly incident coordination summary across all sectors.",
              },
              {
                title: "Daily Operations Report",
                desc: "24-hour tactical assessment of logistics, deployments, and shelter occupancy.",
              },
              {
                title: "Resource Distribution Report",
                desc: "Warehouse inventory requisitions, supplies dispatched, and remaining rations.",
              },
              {
                title: "Emergency Assessment Report",
                desc: "Rapid damage assessment covering infrastructure damage and humanitarian needs.",
              },
            ].map((tmpl) => (
              <button
                key={tmpl.title}
                onClick={() => {
                  setNewTitle(tmpl.title);
                  setShowTemplates(false);
                  setShowCreate(true);
                }}
                className="flex w-full items-start justify-between rounded-xl border border-slate-200 p-3.5 text-left transition hover:bg-[#edf4f7] hover:border-[#287da5]/40"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#e8f2f8] p-2 text-[#287da5] mt-0.5">
                    <FilePlus size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#153f5e]">{tmpl.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{tmpl.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 mt-1 shrink-0" />
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
    <div className="flex items-center gap-3 rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-xs">
      <div
        className={`rounded-lg p-3 ${
          color === "blue"
            ? "bg-[#e8f2f8] text-[#287da5]"
            : "bg-amber-50 text-amber-600"
        }`}
      >
        <Icon size={20} />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-[#153f5e]">{value}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#153f5e]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-[#153f5e]">{value}</span>
    </div>
  );
}
