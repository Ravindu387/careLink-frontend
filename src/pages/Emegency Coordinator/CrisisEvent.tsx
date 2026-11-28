import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  ArrowUpToLine,
  Users,
  Check,
  Search,
  ChevronRight,
  Filter,
  X,
  Plus,
  Archive,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  Loader2,
  Activity,
} from "lucide-react";
import {
  crisisEventService,
  type CrisisEvent,
  type CrisisEventMetrics,
} from "../../services/crisisEventService";

export default function CrisisEvents() {
  const [events, setEvents] = useState<CrisisEvent[]>([]);
  const [metrics, setMetrics] = useState<CrisisEventMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All crisis types");
  const [severityFilter, setSeverityFilter] = useState("All severity levels");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState("");

  const [newEvent, setNewEvent] = useState(() => ({
    name: "",
    type: "Flood",
    severity: "Moderate · Level 2",
    area: "",
    startDate: new Date().toISOString().slice(0, 10),
    coordinator: "",
    description: "",
  }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [list, met] = await Promise.all([
        crisisEventService.getAll(),
        crisisEventService.getMetrics(),
      ]);
      setEvents(list);
      setMetrics(met);
      setIsLiveConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load crisis events:", err);
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
        const [list, met] = await Promise.all([
          crisisEventService.getAll(),
          crisisEventService.getMetrics(),
        ]);
        if (!isCancelled) {
          setEvents(list);
          setMetrics(met);
          setIsLiveConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Failed to initialize crisis events:", err);
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

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEvent.name.trim() || !newEvent.area.trim() || !newEvent.coordinator.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await crisisEventService.create({
        name: newEvent.name.trim(),
        type: newEvent.type,
        severity: newEvent.severity,
        area: newEvent.area.trim(),
        startDate: newEvent.startDate,
        coordinator: newEvent.coordinator.trim(),
        description: newEvent.description.trim() || undefined,
        status: "Active",
      });

      setEvents((prev) => [created, ...prev]);

      try {
        const freshMetrics = await crisisEventService.getMetrics();
        setMetrics(freshMetrics);
      } catch {
        // Ignored
      }

      setNewEvent({
        name: "",
        type: "Flood",
        severity: "Moderate · Level 2",
        area: "",
        startDate: new Date().toISOString().slice(0, 10),
        coordinator: "",
        description: "",
      });

      setShowCreateModal(false);
      setShowArchived(false);
      showToast(`Crisis event ${created.id} (${created.name}) created successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create crisis event.";
      showToast(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChangeInModal = async (newStatus: string) => {
    if (!selectedEvent || updatingStatus) return;
    setUpdatingStatus(true);

    try {
      const updated = await crisisEventService.updateStatus(selectedEvent.id, newStatus);
      setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
      setSelectedEvent(updated);

      try {
        const freshMetrics = await crisisEventService.getMetrics();
        setMetrics(freshMetrics);
      } catch {
        // Ignored
      }

      showToast(`Status of ${updated.id} changed to ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      showToast(`Error: ${msg}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Reset crisis events to default baseline?")) return;
    setLoading(true);
    try {
      const res = await crisisEventService.reset();
      const freshEvents = await crisisEventService.getAll();
      setEvents(freshEvents);
      setMetrics(res.metrics);
      showToast("Crisis events reset to baseline.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset data.";
      showToast(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        `${event.id} ${event.name} ${event.area} ${event.coordinator} ${event.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All crisis types" || event.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All severity levels" ||
        event.severity.startsWith(severityFilter);

      const matchesStatus =
        statusFilter === "All statuses" || event.status === statusFilter;

      const matchesDate =
        dateFilter === "Date range" ||
        (dateFilter === "2025" && event.startDate.includes("2025")) ||
        (dateFilter === "June 2025" && event.startDate.includes("Jun 2025"));

      const matchesArchive = showArchived
        ? event.status === "Resolved"
        : event.status !== "Resolved";

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity &&
        matchesStatus &&
        matchesDate &&
        matchesArchive
      );
    });
  }, [events, search, typeFilter, severityFilter, statusFilter, dateFilter, showArchived]);

  const stats = useMemo(() => [
    {
      title: "Active events",
      value: metrics ? String(metrics.activeEvents) : String(events.filter((e) => e.status === "Active" || e.status === "Monitoring").length),
      description: `Across ${metrics ? metrics.districtsCount : 6} districts`,
      icon: AlertTriangle,
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Major severity",
      value: metrics ? String(metrics.majorSeverityEvents) : String(events.filter((e) => e.severity.startsWith("Major")).length),
      description: "Level 4 response",
      icon: ArrowUpToLine,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Affected people",
      value: metrics ? metrics.formattedAffectedPeople : "184K",
      description: "Estimated verified data",
      icon: Users,
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Assigned coordinators",
      value: metrics ? String(metrics.assignedCoordinators) : "12",
      description: "All active events covered",
      icon: Check,
      color: "bg-emerald-100 text-emerald-700",
    },
  ], [metrics, events]);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All crisis types");
    setSeverityFilter("All severity levels");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Top Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153f5e]">
              Crisis Events
            </h1>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <Activity size={10} />
                Connecting...
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-slate-500 sm:text-xs">
            Create, monitor, and coordinate active humanitarian emergency operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh events from server"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Reset data to baseline"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition shadow-sm ${
              showArchived
                ? "border-sky-700 bg-sky-50 text-sky-800"
                : "border-slate-300 bg-white text-sky-900 hover:bg-slate-50"
            }`}
          >
            <Archive size={13} />
            {showArchived ? "Active events" : "Archived events"}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e668b]"
          >
            <Plus size={14} />
            Create crisis event
          </button>
        </div>
      </div>

      {/* Error state if backend fails */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="flex items-center gap-3 rounded-xl border border-[#d6e5ec] bg-white px-4 py-4 shadow-sm"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {stat.title}
                </p>
                <h2 className="text-xl font-bold text-[#153f5e]">
                  {stat.value}
                </h2>
                <p className="text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-3 flex flex-col gap-2 lg:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d6e5ec] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crisis name, operational area, or coordinator..."
            className="w-full bg-transparent text-sm sm:text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-sm sm:text-[15px] text-slate-700 outline-none"
          >
            <option>All crisis types</option>
            <option>Flood</option>
            <option>Landslide</option>
            <option>Disease</option>
            <option>Storm</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-sm sm:text-[15px] text-slate-700 outline-none"
          >
            <option>All severity levels</option>
            <option>Major</option>
            <option>Severe</option>
            <option>Moderate</option>
            <option>Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-sm sm:text-[15px] text-slate-700 outline-none"
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>Monitoring</option>
            <option>Resolved</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-sm sm:text-[15px] text-slate-700 outline-none"
          >
            <option>Date range</option>
            <option>2025</option>
            <option>June 2025</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-sm font-medium text-sky-800 hover:bg-sky-50 sm:col-span-1"
          >
            <Filter size={13} />
            More filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d6e5ec] bg-white p-3">
          <div>
            <p className="text-sm font-semibold text-sky-950">
              Active filters
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Filtering {filteredEvents.length} events matching query criteria.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-[#d6e5ec] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d6e5ec] bg-[#f7fafb]">
                {[
                  "Crisis ID",
                  "Crisis Name",
                  "Type",
                  "Severity",
                  "Operational Area",
                  "Start Date",
                  "Status",
                  "Requests",
                  "Coordinator",
                  "",
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-3 py-3 text-[13px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[#287da5]" />
                    <p className="text-xs text-slate-500">Loading crisis events from backend...</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-sky-950">
                      {event.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm font-medium text-sky-900">
                      {event.name}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-600">
                      {event.type}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-600">
                      {event.severity}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-600">
                      {event.area}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-600">
                      {event.startDate}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        event.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : event.status === "Monitoring"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {event.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                        {event.requests}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
                        {event.coordinator}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <ChevronRight size={15} className="text-slate-500" />
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <Search size={25} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      No crisis events found
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

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredEvents.length} of {events.length} crisis events
          </p>

          <span className="text-xs text-slate-400">
            Real-time emergency operations
          </span>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleCreateEvent}
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-sky-950">
                  Create crisis event
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Register a new humanitarian emergency in active operations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Crisis name *
                </span>
                <input
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="e.g. River Valley Flash Flood"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Crisis type
                </span>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
                >
                  <option>Flood</option>
                  <option>Landslide</option>
                  <option>Disease</option>
                  <option>Storm</option>
                  <option>Earthquake</option>
                  <option>Wildfire</option>
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Severity
                </span>
                <select
                  value={newEvent.severity}
                  onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
                >
                  <option>Major · Level 4</option>
                  <option>Severe · Level 3</option>
                  <option>Moderate · Level 2</option>
                  <option>Low · Level 1</option>
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Operational area *
                </span>
                <input
                  required
                  value={newEvent.area}
                  onChange={(e) => setNewEvent({ ...newEvent, area: e.target.value })}
                  placeholder="e.g. Greater Riverton Basin"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Start date
                </span>
                <input
                  required
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Assigned coordinator *
                </span>
                <input
                  required
                  value={newEvent.coordinator}
                  onChange={(e) => setNewEvent({ ...newEvent, coordinator: e.target.value })}
                  placeholder="e.g. Amina Mensah"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Situation Summary
                </span>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Brief summary of situational conditions and primary hazards..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e668b] disabled:opacity-50"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                <Plus size={13} />
                Create event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Details & Status Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-sky-950">
                Crisis event details
              </h2>
              <button onClick={() => setSelectedEvent(null)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <p className="text-xs font-semibold text-sky-600">
              {selectedEvent.id}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-sky-950">
              {selectedEvent.name}
            </h3>

            {selectedEvent.description && (
              <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedEvent.description}
              </p>
            )}

            <div className="mt-4 space-y-2.5">
              {[
                ["Type", selectedEvent.type],
                ["Severity", selectedEvent.severity],
                ["Operational area", selectedEvent.area],
                ["Start date", selectedEvent.startDate],
                ["Current Status", selectedEvent.status],
                ["Tracked Requests", selectedEvent.requests],
                ["Coordinator", selectedEvent.coordinator],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5">
                  <span className="text-[13px] text-slate-500">{label}</span>
                  <span className="text-right text-sm font-medium text-sky-950">{value}</span>
                </div>
              ))}
            </div>

            {/* Quick Status Change */}
            <div className="mt-4 rounded-lg bg-[#edf4f7] p-3 border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#153f5e]">
                  Update Operational Status
                </span>
                {updatingStatus && <Loader2 size={11} className="animate-spin text-[#287da5]" />}
              </div>

              <div className="flex gap-2">
                {["Active", "Monitoring", "Resolved"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChangeInModal(st)}
                    disabled={updatingStatus || selectedEvent.status === st}
                    className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                      selectedEvent.status === st
                        ? "bg-[#287da5] text-white font-semibold"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 w-full rounded-lg bg-sky-950 py-2.5 text-sm font-semibold text-white hover:bg-sky-900"
            >
              Close
            </button>
          </div>
        </div>
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
