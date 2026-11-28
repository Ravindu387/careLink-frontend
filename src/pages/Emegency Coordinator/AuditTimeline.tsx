import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  Lock,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import {
  auditTimelineService,
  type AuditEvent,
  type AuditTimelineMetrics,
} from "../../services/auditTimelineService";

const recordTypes = [
  "AI Decision",
  "Resource",
  "Assistance Request",
  "Shelter",
  "Partner",
];

const badgeStyle = (value: string) => {
  const v = value.toLowerCase();

  if (v.includes("critical") || v.includes("full"))
    return "bg-red-50 text-red-700";

  if (v.includes("high") || v.includes("capacity"))
    return "bg-amber-50 text-amber-700";

  if (
    v.includes("dispatched") ||
    v.includes("verified") ||
    v.includes("approved") ||
    v.includes("allocated")
  )
    return "bg-emerald-50 text-emerald-700";

  return "bg-sky-50 text-sky-700";
};

export default function AuditTimeline() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<AuditTimelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [userFilter, setUserFilter] = useState("All users");
  const [typeFilter, setTypeFilter] = useState("All record types");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [showFilters, setShowFilters] = useState(false);
  const [showRetention, setShowRetention] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [evList, met] = await Promise.all([
        auditTimelineService.getAll(),
        auditTimelineService.getMetrics(),
      ]);
      setEvents(evList);
      setMetrics(met);
      setIsLiveConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load audit events:", err);
      const msg = err instanceof Error ? err.message : "Unable to reach CareLink API backend.";
      setError(msg);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initialize() {
      try {
        const [evList, met] = await Promise.all([
          auditTimelineService.getAll(),
          auditTimelineService.getMetrics(),
        ]);
        if (!isCancelled) {
          setEvents(evList);
          setMetrics(met);
          setIsLiveConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Failed to initialize audit events:", err);
          const msg = err instanceof Error ? err.message : "Unable to reach CareLink API backend.";
          setError(msg);
          setIsLiveConnected(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    void loadData();
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const res = await auditTimelineService.verifyIntegrity();
      showToast(`Log verification passed: ${res.recordsChecked} records verified via ${res.algorithm}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Integrity check failed.";
      showToast(`Error: ${msg}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Reset audit timeline to baseline state?")) return;
    setLoading(true);
    try {
      const res = await auditTimelineService.reset();
      const freshEvents = await auditTimelineService.getAll();
      setEvents(freshEvents);
      setMetrics(res.metrics);
      showToast("Audit timeline reset to default baseline.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset data.";
      showToast(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const uniqueActors = useMemo(() => {
    const set = new Set(events.map((e) => e.actor));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const text = [
        event.id,
        event.action,
        event.actor,
        event.record,
        event.rationale,
        event.type,
      ].join(" ").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesAction =
        actionFilter === "All action types" ||
        event.action.toLowerCase().includes(actionFilter.toLowerCase());

      const matchesUser =
        userFilter === "All users" ||
        event.actor.toLowerCase() === userFilter.toLowerCase();

      const matchesType =
        typeFilter === "All record types" ||
        event.type.toLowerCase() === typeFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesAction &&
        matchesUser &&
        matchesType
      );
    });
  }, [events, search, actionFilter, userFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));

  const currentEvents = filteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const exportCSV = () => {
    const headers = [
      "Event ID",
      "Action",
      "Actor",
      "Timestamp",
      "Record",
      "Previous Value",
      "New Value",
      "Rationale",
      "Record Type",
      "Checksum (SHA-256)",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.action,
      event.actor,
      event.timestamp,
      event.record,
      event.previous,
      event.current,
      event.rationale,
      event.type,
      event.checksum,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-timeline-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredEvents.length} audit records to CSV.`);
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("All action types");
    setUserFilter("All users");
    setTypeFilter("All record types");
    setDateFilter("Date range");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153f5e]">
              Audit Timeline
            </h1>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Connecting...
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Review read-only operational decisions, changes, AI recommendations, and human rationale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh audit log"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Reset to default seed dataset"
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 shadow-sm disabled:opacity-50"
          >
            {verifying ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
            Verify Integrity
          </button>

          <button
            onClick={() => setShowRetention(true)}
            className="rounded-lg border border-[#c4d7e1] bg-white px-3.5 py-2 text-sm font-medium text-[#175477] hover:bg-sky-50 shadow-sm"
          >
            Retention policy
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#216789] shadow-sm"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Error state if backend fails */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">{error}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Read only & Verification notice banner */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] border-l-[3px] border-l-[#287da5] bg-[#f6f9fa] px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={20}
            className="shrink-0 text-[#287da5]"
          />
          <div>
            <p className="text-sm font-semibold text-[#153f5e]">
              Read-only accountability & cryptographic chain
            </p>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Operational audit events cannot be modified or deleted. Each record is sealed with an immutable SHA-256 hash.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle size={11} />
            {metrics ? `${metrics.integrityScore}% Tamper-Proof` : "100% Tamper-Proof"}
          </span>
          <span className="text-[13px] font-medium text-slate-500">
            Retention: {metrics ? metrics.retentionPeriod : "7 Years"}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_auto_auto_auto_auto]">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search event, user, record, or rationale..."
            className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Action filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>All action types</option>
          <option>approved</option>
          <option>changed</option>
          <option>escalated</option>
          <option>verified</option>
          <option>updated</option>
          <option>dispatched</option>
          <option>modified</option>
        </select>

        {/* User filter */}
        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>All users</option>
          {uniqueActors.map((actor) => (
            <option key={actor} value={actor}>{actor}</option>
          ))}
        </select>

        {/* Record type */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>All record types</option>
          {recordTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        {/* Date range */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>Date range</option>
          <option>Today</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>

      {/* More filters Toggle */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-[#c4d7e1] bg-white px-4 py-2 text-sm font-medium text-[#175477] hover:bg-sky-50"
        >
          <Filter size={13} />
          More filters
          <ChevronDown size={13} />
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] bg-white p-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Lock size={15} className="text-[#287da5]" />
            Filtered results: {filteredEvents.length} records matching criteria
          </div>

          <button
            onClick={resetFilters}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Audit table */}
      <div className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-[#d5e2e9] bg-[#f5f8f9]">
                {[
                  "Event ID",
                  "Action",
                  "Actor",
                  "Timestamp",
                  "Record",
                  "Previous → New",
                  "Rationale",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-3 text-[13px] font-semibold text-[#49647a]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[#287da5]" />
                    <p className="text-xs text-slate-500">Loading audit records from backend...</p>
                  </td>
                </tr>
              ) : (
                currentEvents.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="cursor-pointer border-b border-[#e6edf1] transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm font-bold text-[#153f5e]">
                      {event.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-[#49647a]">
                      {event.action}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-[#49647a]">
                      {event.actor}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-[#49647a]">
                      {event.timestamp}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-[#49647a]">
                      <span className="font-semibold text-sky-900">{event.record}</span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeStyle(event.previous)}`}>
                          {event.previous}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeStyle(event.current)}`}>
                          {event.current}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="inline-block max-w-[200px] truncate rounded-md bg-[#e8f2f8] px-2 py-1 text-xs font-medium text-[#286d91]">
                        {event.rationale}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <ChevronRight
                        size={17}
                        className="text-slate-400"
                      />
                    </td>
                  </tr>
                ))
              )}

              {!loading && currentEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Search
                      size={28}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="text-sm font-medium text-slate-600">
                      No audit records found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6edf1] px-4 py-3">
          <p className="text-[13px] text-slate-500">
            Showing {filteredEvents.length === 0 ? 0 : (page - 1) * pageSize + 1}
            –{Math.min(page * pageSize, filteredEvents.length)} of {filteredEvents.length.toLocaleString()} records
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d5e2e9] px-3 py-1.5 text-sm text-[#287da5] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-7 w-7 rounded-md border text-sm ${
                  page === number
                    ? "border-[#287da5] bg-[#287da5] font-semibold text-white"
                    : "border-[#d5e2e9] bg-white text-[#175477] hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d5e2e9] px-3 py-1.5 text-sm text-[#287da5] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          title="Audit event details"
          onClose={() => setSelectedEvent(null)}
        >
          <div className="mb-4 rounded-lg bg-[#f0f6f8] p-4 border border-sky-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#287da5]">
                <ShieldCheck size={18} />
                <span className="text-xs font-semibold">
                  Verified audit record
                </span>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Tamper-Evident SHA-256
              </span>
            </div>

            <h3 className="mt-2 text-base font-semibold text-[#153f5e]">
              {selectedEvent.id}
            </h3>

            <p className="mt-0.5 text-sm text-slate-600">
              {selectedEvent.action}
            </p>
          </div>

          <div className="space-y-3">
            <Detail label="Actor" value={selectedEvent.actor} />
            <Detail label="Timestamp" value={selectedEvent.timestamp} />
            <Detail label="Record ID" value={selectedEvent.record} />
            <Detail label="Record type" value={selectedEvent.type} />
            <Detail label="Previous value" value={selectedEvent.previous} />
            <Detail label="New value" value={selectedEvent.current} />
            <Detail label="Rationale" value={selectedEvent.rationale} />
            {selectedEvent.ipAddress && (
              <Detail label="Source IP" value={selectedEvent.ipAddress} />
            )}
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[13px] text-slate-400 block mb-1">Cryptographic Checksum (SHA-256)</span>
              <span className="font-mono text-xs text-slate-600 break-all bg-slate-50 p-2 rounded block border border-slate-200">
                {selectedEvent.checksum}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-[#f6f9fa] p-3">
            <Lock size={15} className="text-[#54778b] shrink-0" />
            <p className="text-[13px] text-slate-500">
              This audit record is sealed, read-only, and part of the immutable emergency log.
            </p>
          </div>
        </Modal>
      )}

      {/* Retention Policy Modal */}
      {showRetention && (
        <Modal
          title="Audit retention policy"
          onClose={() => setShowRetention(false)}
        >
          <div className="mb-4 rounded-lg bg-[#e8f2f8] p-4 border border-sky-200">
            <div className="flex items-center gap-2 text-[#287da5]">
              <ShieldCheck size={20} />
              <span className="text-xs font-semibold">
                Accountability and data retention
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold text-[#153f5e]">
              {metrics ? metrics.retentionPeriod : "7 Years"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Configured audit record retention period for humanitarian disaster logs.
            </p>
          </div>

          <div className="space-y-3">
            <Detail
              label="Record storage"
              value="Secure immutable audit repository"
            />
            <Detail
              label="Record modification"
              value="Strictly prohibited (WORM)"
            />
            <Detail
              label="Cryptographic hashing"
              value="SHA-256 Chained Integrity"
            />
            <Detail
              label="Record deletion"
              value="Restricted until retention expiration"
            />
            <Detail
              label="Access control"
              value="Authorised Emergency Officers & Auditors"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 border border-emerald-200">
            <KeyRound size={16} className="text-emerald-700 shrink-0" />
            <p className="text-sm text-emerald-800">
              All records are cryptographically verified for authenticity and non-repudiation.
            </p>
          </div>
        </Modal>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 max-w-sm rounded-lg bg-[#153f5e] px-4 py-3 text-xs text-white shadow-xl">
          <CheckCircle size={15} className="shrink-0 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-[#153f5e]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// Details row component
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-2">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-xs font-medium text-[#153f5e]">
        {value}
      </span>
    </div>
  );
}
