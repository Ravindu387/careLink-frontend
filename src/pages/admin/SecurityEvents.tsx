import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Lock,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Plus,
  Info,
} from "lucide-react";
import { securityEventService } from "../../services/securityEventService";
import type {
  SecurityEvent,
  SecurityEventStats,
  SecuritySeverity,
  SecurityEventStatus,
} from "../../types/securityEvent";

export default function SecurityEvents() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityEventStats | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters and Pagination
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [typeFilter, setTypeFilter] = useState("All event types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Last 24 hours");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // Resolve Modal
  const [resolvingEvent, setResolvingEvent] = useState<SecurityEvent | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  // Create Event Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newType, setNewType] = useState("Repeated failed sign-in");
  const [newUser, setNewUser] = useState("");
  const [newSource, setNewSource] = useState("Web Portal");
  const [newSeverity, setNewSeverity] = useState<SecuritySeverity>("Medium");
  const [newDescription, setNewDescription] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Security Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyTitle, setPolicyTitle] = useState("Security Policy");
  const [environment, setEnvironment] = useState("Production");
  const [scope, setScope] = useState("Selected record");
  const [approvalType, setApprovalType] = useState("Standard administrator approval");
  const [policyReason, setPolicyReason] = useState("");
  const [submittingPolicy, setSubmittingPolicy] = useState(false);

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
      const [eventsRes, statsRes, typesRes] = await Promise.all([
        securityEventService.getEvents({
          search: search.trim() || undefined,
          severity: severityFilter,
          type: typeFilter,
          status: statusFilter,
          dateFilter: dateFilter,
          pageNumber: currentPage,
          pageSize,
        }),
        securityEventService.getStats(),
        securityEventService.getEventTypes(),
      ]);

      setEvents(eventsRes.items);
      setTotalCount(eventsRes.totalCount);
      setTotalPages(eventsRes.totalPages || 1);
      setStats(statsRes);
      if (typesRes && typesRes.length > 0) {
        setEventTypes(typesRes);
      }
    } catch (err: any) {
      console.error("Failed to load security events:", err);
      setError(err?.message || "Failed to load security events from the backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, severityFilter, typeFilter, statusFilter, dateFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Status Update (e.g., Mark Resolved)
  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingEvent) return;

    setUpdatingId(resolvingEvent.id);
    try {
      const updated = await securityEventService.updateEventStatus(resolvingEvent.id, {
        status: "Resolved",
        resolutionNote: resolutionNote.trim() || "Resolved by administrator after review.",
      });

      if (updated) {
        setEvents((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        showNotification(`Event ${updated.id} marked as Resolved.`);
        // Refresh stats
        const freshStats = await securityEventService.getStats();
        if (freshStats) setStats(freshStats);
      }
      setResolvingEvent(null);
      setResolutionNote("");
    } catch (err: any) {
      showNotification(`Failed to update event: ${err?.message || "Unknown error"}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Change Status dropdown
  const handleChangeStatus = async (event: SecurityEvent, newStatus: SecurityEventStatus) => {
    if (newStatus === event.status) return;
    setUpdatingId(event.id);
    try {
      const updated = await securityEventService.updateEventStatus(event.id, {
        status: newStatus,
        resolutionNote: newStatus === "Resolved" ? "Marked as resolved." : `Status set to ${newStatus}.`,
      });

      if (updated) {
        setEvents((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        showNotification(`Event ${updated.id} status changed to ${newStatus}.`);
        const freshStats = await securityEventService.getStats();
        if (freshStats) setStats(freshStats);
      }
    } catch (err: any) {
      showNotification(`Status change failed: ${err?.message || "Unknown error"}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Policy Submit
  const handlePolicySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!policyTitle.trim() || !policyReason.trim()) {
      return;
    }

    setSubmittingPolicy(true);
    try {
      const action = await securityEventService.recordPolicyAction({
        policyTitle: policyTitle.trim(),
        environment,
        scope,
        approvalType,
        policyReason: policyReason.trim(),
      });

      showNotification(
        action
          ? `Security policy '${action.policyTitle}' successfully recorded (${action.id}).`
          : "Security policy action recorded successfully."
      );

      setShowPolicyModal(false);
      setPolicyReason("");
      loadData(true);
    } catch (err: any) {
      showNotification(`Failed to record policy action: ${err?.message || "Unknown error"}`);
    } finally {
      setSubmittingPolicy(false);
    }
  };

  // Handle Create Event Submit
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim() || !newUser.trim() || !newSource.trim()) return;

    setCreatingEvent(true);
    try {
      const created = await securityEventService.createEvent({
        type: newType.trim(),
        user: newUser.trim(),
        source: newSource.trim(),
        severity: newSeverity,
        status: "Investigating",
        description: newDescription.trim() || undefined,
        environment: "Production",
      });

      if (created) {
        showNotification(`New security event ${created.id} recorded.`);
        setShowCreateModal(false);
        setNewUser("");
        setNewDescription("");
        loadData(true);
      }
    } catch (err: any) {
      showNotification(`Failed to create security event: ${err?.message || "Unknown error"}`);
    } finally {
      setCreatingEvent(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      await securityEventService.downloadExportCsv({
        search: search.trim() || undefined,
        severity: severityFilter,
        type: typeFilter,
        status: statusFilter,
        dateFilter: dateFilter,
      });
      showNotification("Security events report exported successfully.");
    } catch (err: any) {
      console.warn("Backend export failed, falling back to client CSV:", err);
      // Client-side fallback
      const csv = [
        ["Event ID", "Event Type", "User", "Source", "Severity", "Timestamp", "Status"],
        ...events.map((event) => [
          event.id,
          event.type,
          event.user,
          event.source,
          event.severity,
          event.timestamp,
          event.status,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `security-events-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification("Security events CSV generated locally.");
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Investigating":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Review Required":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-[#E5F6F1] text-[#168D72] border border-[#C2E9DE]";
    }
  };

  const threatLevel = stats?.threatLevel || "Elevated";
  const threatHeadline =
    stats?.threatHeadline || "One high-severity authentication event requires investigation.";
  const threatBannerConfig = {
    Critical: {
      border: "border-red-400 border-l-red-600 bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-800",
      badgeBg: "bg-red-200 text-red-900",
    },
    Elevated: {
      border: "border-[#F0D18B] border-l-[#E9A22B] bg-[#FFF8E9]",
      iconBg: "bg-[#FFF0CE]",
      textColor: "text-[#95600A]",
      badgeBg: "bg-[#FFF2D8] text-[#94620B]",
    },
    Normal: {
      border: "border-blue-200 border-l-blue-500 bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-900",
      badgeBg: "bg-blue-200 text-blue-900",
    },
    Secure: {
      border: "border-emerald-300 border-l-emerald-600 bg-emerald-50",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-900",
      badgeBg: "bg-emerald-200 text-emerald-900",
    },
  }[threatLevel] || {
    border: "border-[#F0D18B] border-l-[#E9A22B] bg-[#FFF8E9]",
    iconBg: "bg-[#FFF0CE]",
    textColor: "text-[#95600A]",
    badgeBg: "bg-[#FFF2D8] text-[#94620B]",
  };

  const displayStats = [
    {
      label: "Open events",
      value: stats ? stats.openEvents : events.filter((e) => e.status !== "Resolved").length,
      detail: stats?.openEventsDetail || "3 require action",
      icon: AlertTriangle,
      color: "text-[#C47A0B]",
      bg: "bg-[#FFF4DE]",
    },
    {
      label: "High severity",
      value: stats ? stats.highSeverityEvents : events.filter((e) => e.severity === "High").length,
      detail: stats?.highSeverityDetail || "Investigation active",
      icon: Lock,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Blocked attempts",
      value: stats ? stats.blockedAttempts.toLocaleString() : "842",
      detail: stats?.blockedAttemptsDetail || "Last 24 hours",
      icon: ShieldCheck,
      color: "text-[#2785B2]",
      bg: "bg-[#E8F2F7]",
    },
    {
      label: "Resolved today",
      value: stats ? stats.resolvedToday : events.filter((e) => e.status === "Resolved").length,
      detail: stats?.resolvedTodayDetail || "Median 18 minutes",
      icon: Check,
      color: "text-[#168D72]",
      bg: "bg-[#E5F6F1]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#153B59]">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 rounded-lg border border-[#287FA8]/30 bg-[#153B59] px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
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

      {/* TOP BREADCRUMB */}
      <div className="border-b border-[#DCE7EC] bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Administration</span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="font-semibold text-[#153B59]">Security Events</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1800px] px-5 py-7 md:px-8">
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
                Security Events
              </h1>
              <button
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                title="Refresh from backend"
                className="rounded-md border border-[#D3E1E8] bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#287FA8] disabled:opacity-40"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin text-[#287FA8]" : ""} />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Investigate authentication risks, policy violations, and privileged activity in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-11 items-center gap-2 rounded-lg border border-[#C7D8E2] bg-white px-4 text-sm font-semibold text-[#287FA8] hover:bg-slate-50"
            >
              <Plus size={15} />
              Record event
            </button>

            <button
              onClick={handleExportCsv}
              className="flex h-11 items-center gap-2 rounded-lg border border-[#C7D8E2] bg-white px-4 text-sm font-semibold text-[#287FA8] hover:bg-slate-50"
            >
              <Download size={15} />
              Export report
            </button>

            <button
              onClick={() => {
                setPolicyTitle("Security Policy");
                setShowPolicyModal(true);
              }}
              className="h-11 rounded-lg bg-[#287FA8] px-5 text-sm font-semibold text-white transition hover:bg-[#1C668C]"
            >
              Security policy
            </button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* THREAT ALERT BANNER */}
        <div
          className={`mb-4 flex flex-col gap-3 rounded-xl border border-l-4 p-4 md:flex-row md:items-center ${threatBannerConfig.border}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${threatBannerConfig.iconBg}`}
            >
              <ShieldCheck size={22} className={threatBannerConfig.textColor} />
            </div>

            <div>
              <p className={`text-sm font-bold ${threatBannerConfig.textColor}`}>
                Current threat level: {threatLevel}
              </p>

              <h2 className={`mt-1 text-lg sm:text-xl font-semibold md:text-lg ${threatBannerConfig.textColor} font-semibold`}>
                {threatHeadline}
              </h2>
            </div>
          </div>

          <div
            className={`ml-auto w-full rounded-lg px-3 py-2 text-center text-sm font-semibold md:w-auto md:min-w-[140px] ${threatBannerConfig.badgeBg}`}
          >
            {stats?.monitoringStatus || "Monitoring active"}
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {displayStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex min-h-[94px] items-center gap-3 rounded-xl border border-[#D7E5EB] bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon size={21} className={stat.color} />
                </div>

                <div>
                  <p className="text-[13px] text-slate-500">{stat.label}</p>

                  <h3 className="mt-1 text-2xl font-bold text-[#153B59]">{stat.value}</h3>

                  <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="mb-4 flex flex-col gap-2 xl:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search event ID, type, user, source, or description..."
              className="h-11 w-full rounded-lg border border-[#D3E1E8] bg-white pl-11 pr-4 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All severities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-sm sm:text-[15px] outline-none max-w-[200px] truncate"
            >
              <option>All event types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All statuses</option>
              <option>Investigating</option>
              <option>Review Required</option>
              <option>Resolved</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All time</option>
            </select>
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="h-11 rounded-lg border border-[#C7D8E2] bg-white px-4 text-sm font-semibold text-[#287FA8] hover:bg-slate-50"
          >
            {showMoreFilters ? "Hide options" : "More options"}
          </button>
        </div>

        {showMoreFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D3E1E8] bg-white p-4">
            <p className="text-sm text-slate-600">
              Filter by date range, specific threat signatures, or reset all active filter criteria.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearch("");
                  setSeverityFilter("All severities");
                  setTypeFilter("All event types");
                  setStatusFilter("All statuses");
                  setDateFilter("Last 24 hours");
                  setCurrentPage(1);
                }}
                className="text-sm font-semibold text-[#287FA8] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* EVENTS TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#D7E5EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-[#F5F8F9] text-sm font-semibold text-slate-500">
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Event ID</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Event Type</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Associated User</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Source</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Severity</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Timestamp</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Status</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="animate-spin text-[#287FA8]" />
                        <span>Loading security events from backend...</span>
                      </div>
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldCheck size={28} className="text-slate-300" />
                        <span>No security events found matching the criteria.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="transition hover:bg-[#F7FAFB]">
                      <td className="border-b border-[#E7EEF1] px-4 py-5 text-sm font-bold text-[#123B5C]">
                        {event.id}
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5 text-sm">
                        <span className="font-medium text-slate-800">{event.type}</span>
                        {event.description && (
                          <p className="mt-0.5 line-clamp-1 text-[13px] text-slate-400">
                            {event.description}
                          </p>
                        )}
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5 text-sm text-slate-700">
                        {event.user}
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5 text-sm text-slate-600">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                          {event.source}
                        </span>
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${getSeverityClass(
                            event.severity
                          )}`}
                        >
                          {event.severity}
                        </span>
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5 text-sm text-slate-500">
                        {event.timestamp}
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${getStatusClass(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>

                          {/* Quick status dropdown */}
                          <select
                            disabled={updatingId === event.id}
                            value={event.status}
                            onChange={(e) =>
                              handleChangeStatus(event, e.target.value as SecurityEventStatus)
                            }
                            className="h-6 rounded border border-[#D5E3EA] bg-white px-1 text-sm sm:text-[15px] text-slate-600 outline-none hover:border-[#287FA8]"
                          >
                            <option value="Investigating">Investigating</option>
                            <option value="Review Required">Review Required</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </td>

                      <td className="border-b border-[#E7EEF1] px-4 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            title="View event details"
                            onClick={() => setSelectedEvent(event)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#287FA8]"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Mark as resolved button */}
                          {event.status !== "Resolved" ? (
                            <button
                              title="Resolve with notes"
                              disabled={updatingId === event.id}
                              onClick={() => {
                                setResolvingEvent(event);
                                setResolutionNote("");
                              }}
                              className="rounded p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
                            >
                              {updatingId === event.id ? (
                                <Loader2 size={15} className="animate-spin text-[#287FA8]" />
                              ) : (
                                <Check size={15} />
                              )}
                            </button>
                          ) : (
                            <span
                              title="Event resolved"
                              className="inline-flex p-1.5 text-emerald-600"
                            >
                              <Check size={15} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center">
            <p className="text-[13px] text-slate-500">
              Showing{" "}
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} events
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-9 rounded-lg border border-[#D3E1E8] px-4 text-sm font-medium text-[#287FA8] disabled:opacity-40"
              >
                Previous
              </button>

              <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#287FA8] px-3 text-sm font-semibold text-white">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 rounded-lg border border-[#D3E1E8] px-4 text-sm font-medium text-[#287FA8] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCE7EC] px-6 py-5">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#287FA8]">
                  SECURITY INCIDENT DOSSIER
                </span>
                <h2 className="mt-1 text-lg font-bold text-[#153B59]">
                  {selectedEvent.id}: {selectedEvent.type}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#E7EEF1] bg-[#F9FBFC] p-3">
                  <span className="text-[13px] font-semibold text-slate-400">SEVERITY</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${getSeverityClass(
                        selectedEvent.severity
                      )}`}
                    >
                      {selectedEvent.severity}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-[#E7EEF1] bg-[#F9FBFC] p-3">
                  <span className="text-[13px] font-semibold text-slate-400">STATUS</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${getStatusClass(
                        selectedEvent.status
                      )}`}
                    >
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[13px] font-semibold text-slate-400">ASSOCIATED USER</span>
                  <p className="mt-1 font-medium text-slate-800">{selectedEvent.user}</p>
                </div>

                <div>
                  <span className="text-[13px] font-semibold text-slate-400">SOURCE IP / AGENT</span>
                  <p className="mt-1 font-mono text-slate-800">{selectedEvent.source}</p>
                </div>
              </div>

              <div>
                <span className="text-[13px] font-semibold text-slate-400">TIMESTAMP</span>
                <p className="mt-1 text-slate-600">{selectedEvent.timestamp}</p>
              </div>

              <div>
                <span className="text-[13px] font-semibold text-slate-400">INCIDENT DETAILS</span>
                <p className="mt-1 rounded-lg border border-[#E7EEF1] bg-[#F9FBFC] p-3 text-slate-700 leading-relaxed">
                  {selectedEvent.description || "No additional technical notes provided for this event."}
                </p>
              </div>

              {selectedEvent.status === "Resolved" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-emerald-900">
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <Check size={14} className="text-emerald-700" />
                    <span>Resolution Summary</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-800">
                    {selectedEvent.resolutionNote || "Event marked as resolved by administrator."}
                  </p>
                  {selectedEvent.resolvedBy && (
                    <p className="mt-1 text-sm text-emerald-700 font-medium">
                      Resolved by: {selectedEvent.resolvedBy}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#DCE7EC] px-6 py-4">
              {selectedEvent.status !== "Resolved" && (
                <button
                  onClick={() => {
                    setResolvingEvent(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Mark as resolved
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-[#C7D8E2] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE EVENT MODAL */}
      {resolvingEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setResolvingEvent(null);
          }}
        >
          <div className="w-full max-w-[500px] rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCE7EC] px-6 py-5">
              <div>
                <span className="text-sm font-bold text-emerald-600">RESOLUTION WORKFLOW</span>
                <h2 className="mt-1 text-lg sm:text-xl font-bold text-[#153B59]">
                  Resolve {resolvingEvent.id}
                </h2>
              </div>
              <button
                onClick={() => setResolvingEvent(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4 p-6">
              <p className="text-sm text-slate-600">
                You are marking security event <strong>{resolvingEvent.id}</strong> (
                {resolvingEvent.type}) as <strong>Resolved</strong>. Please supply an optional
                administrative audit note:
              </p>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-500">
                  RESOLUTION RATIONALE / REMEDIATION NOTE
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Account unlocked, OTP verified, or IP blocked at firewall..."
                  className="w-full rounded-lg border border-[#D5E3EA] p-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingEvent(null)}
                  className="h-10 rounded-lg border border-[#C7D8E2] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === resolvingEvent.id}
                  className="flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {updatingId === resolvingEvent.id && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Confirm resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCE7EC] px-6 py-5">
              <div>
                <span className="text-sm font-bold text-[#287FA8]">RECORD SECURITY EVENT</span>
                <h2 className="mt-1 text-lg font-bold text-[#153B59]">
                  Log New Security Incident
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-600">
                  EVENT TYPE <span className="text-red-500">*</span>
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                >
                  <option>Repeated failed sign-in</option>
                  <option>Privileged role assignment</option>
                  <option>New device sign-in</option>
                  <option>Session token revoked</option>
                  <option>Multiple login attempts</option>
                  <option>Unusual account activity</option>
                  <option>Unauthorized API access attempt</option>
                  <option>Brute force attack blocked</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">
                    ASSOCIATED USER / EMAIL <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    placeholder="e.g. USR-10482 or user@carelink.org"
                    className="h-11 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">
                    SOURCE / IP / CHANNEL <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="e.g. 192.168.1.100 or Web Portal"
                    className="h-11 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-600">
                  SEVERITY
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as SecuritySeverity)}
                  className="h-11 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                >
                  <option value="High">High (Immediate investigation)</option>
                  <option value="Medium">Medium (Review required)</option>
                  <option value="Low">Low (Informational)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-600">
                  TECHNICAL DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail relevant indicators of compromise or alert telemetry..."
                  className="w-full rounded-lg border border-[#D5E3EA] p-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 rounded-lg border border-[#C7D8E2] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="flex h-10 items-center gap-1.5 rounded-lg bg-[#287FA8] px-5 text-sm font-semibold text-white hover:bg-[#1C668C] disabled:opacity-50"
                >
                  {creatingEvent && <Loader2 size={14} className="animate-spin" />}
                  Record event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY POLICY MODAL */}
      {showPolicyModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowPolicyModal(false);
          }}
        >
          <div className="max-h-[95vh] w-full max-w-[775px] overflow-y-auto rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DCE7EC] px-6 py-5">
              <div>
                <p className="text-xs font-bold tracking-wider text-[#56B69E]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2 className="mt-2 text-[19px] font-semibold text-[#34495B]">
                  Security Policy Enforcement
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="rounded-md p-1 text-[#34495B] hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePolicySubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Action title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={policyTitle}
                    onChange={(e) => setPolicyTitle(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Environment
                  </label>
                  <div className="relative">
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Production</option>
                      <option>Staging</option>
                      <option>Development</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-4 text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Scope
                  </label>
                  <div className="relative">
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Selected record</option>
                      <option>All security events</option>
                      <option>High severity events</option>
                      <option>All users</option>
                      <option>All organisations</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-4 text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Approval type
                  </label>
                  <div className="relative">
                    <select
                      value={approvalType}
                      onChange={(e) => setApprovalType(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Standard administrator approval</option>
                      <option>Senior administrator approval</option>
                      <option>Two-person approval</option>
                      <option>Emergency authorisation</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-4 text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                  Administrative rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={policyReason}
                  onChange={(e) => setPolicyReason(e.target.value)}
                  placeholder="Explain the authorized operational reason for this security policy change..."
                  className="w-full resize-y rounded-lg border border-[#D5E3EA] p-3 text-sm sm:text-[15px] outline-none placeholder:text-slate-400 focus:border-[#287FA8]"
                />
              </div>

              {/* Warning note */}
              <div className="flex items-center gap-3 rounded-lg bg-[#FFF6E3] px-4 py-4">
                <ShieldCheck size={21} className="shrink-0 text-[#98630C]" />
                <p className="text-sm leading-5 text-[#94620B]">
                  Security policy actions are verified against current administrative privileges and
                  logged permanently to the system security ledger.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="h-11 rounded-lg border border-[#C7D8E2] bg-white px-5 text-sm font-semibold text-[#287FA8] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPolicy}
                  className="flex h-11 items-center gap-2 rounded-lg bg-[#287FA8] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#1C668C] disabled:opacity-50"
                >
                  {submittingPolicy && <Loader2 size={15} className="animate-spin" />}
                  Confirm &amp; record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
