import { useCallback, useEffect, useState } from "react";
import {
  LockKeyhole,
  Search,
  Download,
  ChevronRight,
  MoreHorizontal,
  X,
  ShieldCheck,
  FileText,
  Eye,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info,
  Check,
} from "lucide-react";
import { auditLogService } from "../../services/auditLogService";
import type { AuditRecord, AuditLogStats } from "../../types/auditLog";

const inputClass =
  "h-11 rounded-lg border border-[#D5E3EA] bg-white px-3 text-[11px] text-[#29445A] outline-none focus:border-[#2785B2]";
const labelClass = "mb-2 block text-[10px] font-semibold text-[#34495B]";

export default function AuditLogs() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [userFilter, setUserFilter] = useState("All users");
  const [recordFilter, setRecordFilter] = useState("All record types");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Menu
  const [showExport, setShowExport] = useState(false);
  const [showRetention, setShowRetention] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Export Form State
  const [exportTitle, setExportTitle] = useState("Audit Export");
  const [environment, setEnvironment] = useState("Production");
  const [scope, setScope] = useState("Current filtered results");
  const [approvalType, setApprovalType] = useState("Standard administrator approval");
  const [rationale, setRationale] = useState("");
  const [exporting, setExporting] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [logsRes, statsRes] = await Promise.all([
        auditLogService.getAuditLogs({
          search: search.trim() || undefined,
          action: actionFilter,
          actor: userFilter,
          type: recordFilter,
          pageNumber: currentPage,
          pageSize,
        }),
        auditLogService.getStats(),
      ]);

      setRecords(logsRes.items);
      setTotalCount(logsRes.totalCount);
      setTotalPages(logsRes.totalPages || 1);
      if (statsRes) setStats(statsRes);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
      setError(err?.message || "Failed to load audit logs from the backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, actionFilter, userFilter, recordFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const confirmExport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rationale.trim()) return;

    setExporting(true);
    try {
      const result = await auditLogService.exportAuditLog({
        actionTitle: exportTitle.trim(),
        environment,
        scope,
        approvalType,
        rationale: rationale.trim(),
        selectedRecordId: scope === "Selected record" && selectedRecord ? selectedRecord.id : undefined,
        search: search.trim() || undefined,
        action: actionFilter,
        actor: userFilter,
        type: recordFilter,
      });

      showNotification(
        result.eventId
          ? `Audit log exported and recorded in ledger (${result.eventId}).`
          : "Audit log exported successfully."
      );

      setShowExport(false);
      setRationale("");
      // Reload so the new "Audit log exported" entry appears
      loadData(true);
    } catch (err: any) {
      showNotification(`Export failed: ${err?.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  const openExport = (recordToExport?: AuditRecord) => {
    setExportTitle("Audit Export");
    if (recordToExport) {
      setSelectedRecord(recordToExport);
      setScope("Selected record");
    } else {
      setScope("Current filtered results");
    }
    setRationale("");
    setShowExport(true);
  };

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showNotification(`Event ID ${id} copied to clipboard.`);
    }
    setMenuId(null);
  };

  const actionOptions = stats?.actionTypes || [];
  const actorOptions = stats?.actors || [];
  const recordOptions = stats?.recordTypes || [];

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-6 md:px-6 lg:px-7">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 rounded-lg border border-[#2785B2]/30 bg-[#123B5C] px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Info size={16} className="text-[#56B69E]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] text-slate-500">
            <span>Administration</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#123B5C]">Audit Logs</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-[27px]">
              Audit Logs
            </h1>
            <button
              onClick={() => loadData(true)}
              disabled={loading || refreshing}
              title="Refresh from backend"
              className="rounded-md border border-[#D3E1E8] bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#2785B2] disabled:opacity-40"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin text-[#2785B2]" : ""} />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Review immutable records of user, administrative, system, and AI-related activity in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowRetention(true)}
            className="rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
          >
            Retention policy
          </button>
          <button
            onClick={() => openExport()}
            className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-[10px] font-semibold text-white hover:bg-[#1D6F98]"
          >
            <Download size={15} />
            Export audit log
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* COMPLIANCE INFO BANNER */}
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-[#D5E0E5] border-l-[3px] border-l-[#718A99] bg-[#F5F8F9] px-4 py-3">
        <LockKeyhole size={18} className="shrink-0 text-[#527185]" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-[#344F61]">Read-only audit records</p>
          <p className="mt-1 text-[9px] text-slate-500">
            Audit events are immutable and cannot be modified or deleted. Every export action is logged.
          </p>
        </div>
        <span className="hidden text-[9px] text-slate-500 sm:block">
          Retention: {stats?.retentionPeriod || "7 years"}
        </span>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-4 flex flex-col gap-2 xl:flex-row">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D7E5EA] bg-white px-3">
          <Search size={17} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search event ID, action, user, or record..."
            className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        >
          <option>All action types</option>
          {actionOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        >
          <option>All users</option>
          {actorOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={recordFilter}
          onChange={(e) => {
            setRecordFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        >
          <option>All record types</option>
          {recordOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="h-11 rounded-lg border border-[#B9D1DD] bg-white px-4 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
        >
          {showFilters ? "Hide options" : "More options"}
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D7E5EA] bg-white p-4">
          <p className="text-[10px] text-slate-500">
            Total recorded audit trails: <strong>{totalCount.toLocaleString()}</strong> events across{" "}
            <strong>{stats?.uniqueActors ?? 0}</strong> active actors.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActionFilter("All action types");
              setUserFilter("All users");
              setRecordFilter("All record types");
              setCurrentPage(1);
            }}
            className="text-[10px] font-semibold text-[#2785B2] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* TABLE */}
      <section className="overflow-visible rounded-xl border border-[#D7E5EA] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead>
              <tr className="border-b border-[#D7E5EA] bg-[#F6F9FA] text-[9px] font-medium text-slate-500">
                <th className="px-3 py-3">Event ID</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Actor</th>
                <th className="px-3 py-3">Timestamp</th>
                <th className="px-3 py-3">Associated Record</th>
                <th className="px-3 py-3">Previous → New</th>
                <th className="px-3 py-3">Rationale</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[#2785B2]" />
                      <span>Loading audit logs from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText size={28} className="text-slate-300" />
                      <span>No audit records match your search criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#E5EDF1] text-[9px] text-slate-600 hover:bg-[#F8FBFC] transition"
                  >
                    <td className="px-3 py-4 font-bold text-[#123B5C]">{r.id}</td>
                    <td className="px-3 py-4 font-medium text-slate-800">{r.action}</td>
                    <td className="px-3 py-4">{r.actor}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-slate-500">{r.timestamp}</td>
                    <td className="px-3 py-4">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-700">
                        {r.record}
                      </span>
                    </td>
                    <td className="px-3 py-4 font-mono text-[9px] text-slate-600">{r.change}</td>
                    <td className="px-3 py-4">
                      <span className="rounded-md bg-[#EDF2F5] px-2 py-1 text-[8px] font-semibold text-[#557084]">
                        {r.rationale}
                      </span>
                    </td>
                    <td className="relative px-3 py-4 text-right">
                      <button
                        onClick={() => setMenuId(menuId === r.id ? null : r.id)}
                        aria-label={`Actions for ${r.id}`}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {menuId === r.id && (
                        <div className="absolute right-8 top-8 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                          <button
                            onClick={() => {
                              setSelectedRecord(r);
                              setMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50 text-slate-700"
                          >
                            <Eye size={13} className="text-[#2785B2]" />
                            View event
                          </button>
                          <button
                            onClick={() => handleCopyId(r.id)}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50 text-slate-700"
                          >
                            <Copy size={13} className="text-slate-400" />
                            Copy event ID
                          </button>
                          <button
                            onClick={() => {
                              setMenuId(null);
                              openExport(r);
                            }}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50 text-slate-700"
                          >
                            <Download size={13} className="text-emerald-600" />
                            Export this record
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row">
          <p className="text-[9px] text-slate-500">
            Showing {totalCount ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} events
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#D7E5EA] px-3 py-2 text-[9px] text-[#2785B2] disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`rounded-lg border px-3 py-2 text-[9px] ${
                  p === currentPage
                    ? "border-[#2785B2] bg-[#2785B2] text-white"
                    : "border-[#D7E5EA] text-[#123B5C] hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#B9D1DD] px-3 py-2 text-[9px] text-[#2785B2] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* AUDIT EXPORT MODAL */}
      {showExport && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowExport(false);
          }}
        >
          <div className="w-full max-w-[750px] overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D7E5EA] px-6 py-5">
              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#56B69E]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2 className="mt-2 text-lg font-medium text-[#34495B]">Audit Export</h2>
              </div>
              <button
                onClick={() => setShowExport(false)}
                aria-label="Close"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={confirmExport} className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className={labelClass}>
                    Action title <b className="text-red-500">*</b>
                  </span>
                  <input
                    required
                    value={exportTitle}
                    onChange={(e) => setExportTitle(e.target.value)}
                    className={`${inputClass} w-full`}
                  />
                </label>

                <label>
                  <span className={labelClass}>Environment</span>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                  </select>
                </label>

                <label>
                  <span className={labelClass}>Scope</span>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    {selectedRecord && <option>Selected record</option>}
                    <option>Current filtered results</option>
                    <option>All available records</option>
                  </select>
                </label>

                <label>
                  <span className={labelClass}>Approval type</span>
                  <select
                    value={approvalType}
                    onChange={(e) => setApprovalType(e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    <option>Standard administrator approval</option>
                    <option>Dual administrator approval</option>
                    <option>Emergency approval</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>
                  Administrative rationale <b className="text-red-500">*</b>
                </span>
                <textarea
                  required
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={4}
                  placeholder="Explain the authorised operational reason for this export..."
                  className="w-full rounded-lg border border-[#D5E3EA] p-3 text-[11px] outline-none focus:border-[#2785B2]"
                />
              </label>

              <div className="flex items-start gap-3 rounded-lg bg-[#FFF6E4] px-4 py-3 text-[9px] leading-5 text-[#94621B]">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#98630C]" />
                <span>
                  Export actions are permanently preserved as tamper-evident entries in the system audit
                  log pursuant to statutory accountability requirements.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowExport(false)}
                  className="rounded-lg border border-[#B9D1DD] px-5 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rationale.trim() || exporting}
                  className="flex items-center gap-1.5 rounded-lg bg-[#2785B2] px-5 py-3 text-[10px] font-semibold text-white disabled:opacity-40 hover:bg-[#1D6F98]"
                >
                  {exporting && <Loader2 size={13} className="animate-spin" />}
                  Confirm &amp; record export
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETENTION POLICY MODAL */}
      {showRetention && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowRetention(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#56B69E]">AUDIT GOVERNANCE</p>
                <h2 className="mt-1 text-lg font-medium text-[#123B5C]">Retention policy</h2>
              </div>
              <button
                onClick={() => setShowRetention(false)}
                aria-label="Close"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 text-[10px] text-slate-600">
              <div className="rounded-lg bg-[#F4F8FA] p-4">
                <p className="text-slate-400">Current retention period</p>
                <p className="mt-1 text-2xl font-semibold text-[#123B5C]">
                  {stats?.retentionPeriod || "7 years"}
                </p>
              </div>

              <p>
                Audit records are read-only and retained for compliance, security investigation, and
                operational accountability across all crisis response workflows.
              </p>

              <div>
                <p className="font-semibold text-[#123B5C]">Policy controls</p>
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  <li>Audit events cannot be edited or erased through the user interface.</li>
                  <li>Deletion and archival are managed exclusively by backend compliance policies.</li>
                  <li>Export actions require mandatory administrative rationale recorded permanently.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end border-t p-4">
              <button
                onClick={() => setShowRetention(false)}
                className="rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1D6F98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT EVENT DETAILS MODAL */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#56B69E]">
                  READ-ONLY AUDIT RECORD
                </p>
                <h2 className="mt-1 text-lg font-medium text-[#123B5C]">{selectedRecord.id}</h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                aria-label="Close"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 p-5 text-[10px]">
              {[
                ["Action", selectedRecord.action],
                ["Actor", selectedRecord.actor],
                ["Timestamp", selectedRecord.timestamp],
                ["Associated record", selectedRecord.record],
                ["Previous → New", selectedRecord.change],
                ["Rationale", selectedRecord.rationale],
                ["Record type", selectedRecord.type],
                ["Environment", selectedRecord.environment || "Production"],
                ["IP Address", selectedRecord.ipAddress || "127.0.0.1"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-slate-400">{k}</p>
                  <p className="mt-1 font-semibold text-[#123B5C] break-words">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 border-t p-4">
              <div className="flex items-center gap-1.5 text-slate-500">
                <FileText size={15} className="text-[#2785B2]" />
                <span className="text-[9px]">This record is immutable and verified.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyId(selectedRecord.id)}
                  className="rounded-lg border border-[#B9D1DD] px-4 py-2 text-[10px] font-semibold text-[#2785B2] hover:bg-slate-50"
                >
                  Copy ID
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-lg bg-[#2785B2] px-5 py-2 text-[10px] font-semibold text-white hover:bg-[#1D6F98]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
