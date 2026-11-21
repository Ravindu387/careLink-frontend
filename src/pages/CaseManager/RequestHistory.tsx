import React, { useState, useEffect, useCallback } from "react";

import {
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  X,
  Clock,
  ShieldCheck,
  CalendarDays,
  History,
  FileText,
  RefreshCw,
  Server,
  CheckCircle2,
} from "lucide-react";

import { requestHistoryService } from "../../services/requestHistoryService";
import type {
  HistoryEvent,
  RequestHistoryStatsDto,
  RequestHistoryQueryDto,
} from "../../types/requestHistory";

const RequestHistory: React.FC = () => {
  // Data states
  const [stats, setStats] = useState<RequestHistoryStatsDto | null>(null);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [uniqueActors, setUniqueActors] = useState<string[]>([]);
  const [uniqueCases, setUniqueCases] = useState<string[]>([]);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("All event types");
  const [actorFilter, setActorFilter] = useState("All actors");
  const [caseFilter, setCaseFilter] = useState("All cases");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [showRetentionPolicy, setShowRetentionPolicy] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Data
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const query: RequestHistoryQueryDto = {
          search: searchTerm.trim() || undefined,
          eventType: eventTypeFilter !== "All event types" ? eventTypeFilter : undefined,
          actor: actorFilter !== "All actors" ? actorFilter : undefined,
          caseId: caseFilter !== "All cases" ? caseFilter : undefined,
          dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        };

        const [statsRes, eventsRes, actorsRes, casesRes] = await Promise.all([
          requestHistoryService.getStats(),
          requestHistoryService.getEvents(query),
          requestHistoryService.getUniqueActors(),
          requestHistoryService.getUniqueCaseIds(),
        ]);

        setStats(statsRes.data);
        setEvents(eventsRes.data.items);
        setTotalCount(eventsRes.data.totalCount);
        setTotalPages(eventsRes.data.totalPages);
        setUniqueActors(actorsRes);
        setUniqueCases(casesRes);
        setIsLiveBackend(statsRes.isLiveBackend || eventsRes.isLiveBackend);
      } catch (err) {
        console.error("Failed to load request history", err);
        showToast("Error connecting to backend; offline demo data active.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, eventTypeFilter, actorFilter, caseFilter, dateFilter, currentPage, itemsPerPage]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const query: RequestHistoryQueryDto = {
        search: searchTerm.trim() || undefined,
        eventType: eventTypeFilter !== "All event types" ? eventTypeFilter : undefined,
        actor: actorFilter !== "All actors" ? actorFilter : undefined,
        caseId: caseFilter !== "All cases" ? caseFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
      };
      await requestHistoryService.downloadExportCsv(query);
      showToast("CSV file exported successfully!");
    } catch (err) {
      console.error("Export failed", err);
      showToast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm("");
    setEventTypeFilter("All event types");
    setActorFilter("All actors");
    setCaseFilter("All cases");
    setDateFilter("Date range");
    setCurrentPage(1);
  };

  // Event Type Style
  const getEventStyle = (type: string) => {
    switch (type) {
      case "Decision":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "Assignment":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Verification":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Escalation":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Information":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Creation":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-5 py-4 shadow-xl">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-9">
        {/* Breadcrumb & Live Sync Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operations</span>
            <ChevronRight size={13} />
            <span>Case Management</span>
            <ChevronRight size={13} />
            <span className="font-semibold text-slate-800">Request History</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isLiveBackend
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Server size={12} className={isLiveBackend ? "text-emerald-600" : "text-amber-600"} />
              {isLiveBackend ? "Backend Live (Port 5277)" : "Demo Mode (Offline)"}
            </span>

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0df] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
              title="Refresh audit log"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da8]" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">Request History</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review tamper-evident case events, decisions, assignments, and audit rationale.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRetentionPolicy(true)}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-xs font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50"
            >
              Retention policy
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#17678f] disabled:opacity-50"
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Total Audit Events</span>
              <p className="mt-1 text-2xl font-bold text-[#173e5b]">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Decisions Recorded</span>
              <p className="mt-1 text-2xl font-bold text-purple-700">{stats.decisionsCount}</p>
            </div>
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Assignments Logged</span>
              <p className="mt-1 text-2xl font-bold text-blue-700">{stats.assignmentsCount}</p>
            </div>
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Escalations Logged</span>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.escalationsCount}</p>
            </div>
          </div>
        )}

        {/* Read-Only Notice */}
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-[#d5e2eb] border-l-[4px] border-l-[#718b9a] bg-[#f5f8fa] px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock size={21} className="shrink-0 text-[#587487]" />
            <div>
              <p className="text-xs font-bold text-[#35566e]">Read-only operational record</p>
              <p className="mt-1 text-xs text-slate-500">
                Case history events cannot be edited or deleted through this workspace.
              </p>
            </div>
          </div>

          <span className="hidden whitespace-nowrap text-[10px] font-semibold text-slate-500 sm:block">
            Retention: 7 years
          </span>
        </div>

        {/* Search and Filters */}
        <section className="mb-4 flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search event, case, actor, or rationale..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Event Type */}
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none shadow-sm focus:border-sky-500"
          >
            <option>All event types</option>
            <option>Decision</option>
            <option>Assignment</option>
            <option>Verification</option>
            <option>Escalation</option>
            <option>Information</option>
            <option>Creation</option>
            <option>Status Change</option>
          </select>

          {/* Actor */}
          <select
            value={actorFilter}
            onChange={(e) => {
              setActorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none shadow-sm focus:border-sky-500"
          >
            <option>All actors</option>
            {uniqueActors.map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>

          {/* Case Filter */}
          <select
            value={caseFilter}
            onChange={(e) => {
              setCaseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none shadow-sm focus:border-sky-500"
          >
            <option>All cases</option>
            {uniqueCases.map((caseId) => (
              <option key={caseId} value={caseId}>
                {caseId}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none shadow-sm focus:border-sky-500"
          >
            <option>Date range</option>
            <option>Today</option>
            <option>All time</option>
          </select>

          {/* More Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-xs font-semibold shadow-sm transition ${
              showFilters
                ? "border-[#287da8] bg-sky-50 text-[#287da8]"
                : "border-[#b9d0df] bg-white text-[#287da8] hover:bg-sky-50"
            }`}
          >
            <Filter size={16} />
            More filters
          </button>
        </section>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-800">Advanced Filter Management</p>
              <p className="mt-1 text-xs text-slate-400">
                Displaying {totalCount} history events matching selected filters.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* History Table */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#f7f9fa]">
                <tr className="border-b border-[#d5e2eb] text-[11px] font-semibold text-slate-500">
                  <th className="px-4 py-4">Event ID</th>
                  <th className="px-3 py-4">Case ID</th>
                  <th className="px-3 py-4">Event Type</th>
                  <th className="px-3 py-4">Action</th>
                  <th className="px-3 py-4">Actor</th>
                  <th className="px-3 py-4">Change</th>
                  <th className="px-3 py-4">Rationale</th>
                  <th className="px-4 py-4">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-[#287da8]" />
                        <span>Loading audit events...</span>
                      </div>
                    </td>
                  </tr>
                ) : events.length > 0 ? (
                  events.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="cursor-pointer border-b border-[#e5edf2] transition hover:bg-[#f8fbfd]"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-[11px] font-bold text-[#173e5b]">{event.id}</span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="text-[11px] font-semibold text-[#173e5b]">{event.caseId}</span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${getEventStyle(
                            event.eventType
                          )}`}
                        >
                          {event.eventType}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <p className="whitespace-nowrap text-[11px] text-slate-700">{event.action}</p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="text-[11px] text-slate-600">{event.actor}</span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                          {event.change}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="text-[11px] text-slate-600">{event.rationale}</span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-[11px] text-slate-500">{event.timestamp}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <FileText size={35} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No history records found</p>
                      <p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5edf2] px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} records (Aggregate:{" "}
              {stats?.totalEvents.toLocaleString() ?? "48,214"})
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-3.5 py-2 text-xs text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg border text-xs transition ${
                    currentPage === page
                      ? "border-[#287da8] bg-[#287da8] font-semibold text-white"
                      : "border-[#d5e2eb] bg-white text-slate-600 hover:bg-sky-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-3.5 py-2 text-xs font-medium text-[#287da8] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          EVENT DETAILS MODAL
      ============================================================ */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <History size={20} className="text-[#287da8]" />
                  <h2 className="text-lg font-semibold text-[#173e5b]">Audit Event Details</h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{selectedEvent.id}</p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-sky-50 p-4">
              <p className="text-xs font-semibold text-sky-800">Event Classification</p>
              <span
                className={`mt-2 inline-block rounded-md px-3 py-1.5 text-xs font-semibold ${getEventStyle(
                  selectedEvent.eventType
                )}`}
              >
                {selectedEvent.eventType}
              </span>
            </div>

            <div className="space-y-3.5 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Event ID:</span>
                <span className="font-semibold text-slate-700">{selectedEvent.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Case ID:</span>
                <span className="font-semibold text-[#173e5b]">{selectedEvent.caseId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Action:</span>
                <span className="font-semibold text-slate-700">{selectedEvent.action}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Actor:</span>
                <span className="font-semibold text-slate-700">{selectedEvent.actor}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Change:</span>
                <span className="font-semibold text-slate-700">{selectedEvent.change}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-semibold text-slate-700">{selectedEvent.timestamp}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400">Rationale / Justification:</span>
                <p className="mt-1 text-xs text-slate-700">{selectedEvent.rationale}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-800">
              <ShieldCheck size={17} className="text-emerald-600" />
              <p className="text-xs">Immutable, tamper-evident audit record.</p>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-5 w-full rounded-lg bg-[#287da8] py-2.5 text-xs font-semibold text-white hover:bg-[#17678f]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          RETENTION POLICY MODAL
      ============================================================ */}
      {showRetentionPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} className="text-sky-700" />
                <h2 className="text-lg font-semibold text-[#173e5b]">Audit Retention Policy</h2>
              </div>

              <button
                onClick={() => setShowRetentionPolicy(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-sky-50 p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-sky-700" />
                  <p className="text-sm font-semibold text-sky-800">Mandatory Record Retention: 7 Years</p>
                </div>
                <p className="mt-2 leading-5 text-sky-700">
                  Operational history records are retained for seven years in compliance with national disaster response data governance.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-700">Historical Record Protection</p>
                <ul className="mt-3 space-y-2.5 text-slate-600">
                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    Records are append-only and cannot be altered via any workspace interface.
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    Full provenance tracking preserves user identity, IP address, and system actor IDs.
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    All triage overrides, priority bumps, and claim transfers preserve original timestamps.
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowRetentionPolicy(false)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-2.5 text-xs font-semibold text-white hover:bg-[#17678f]"
            >
              Close policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
