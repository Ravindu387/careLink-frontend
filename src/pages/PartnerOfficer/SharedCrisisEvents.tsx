import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Download,
  Plus,
  AlertTriangle,
  Map,
  Check,
  Search,
  ChevronRight,
  Filter,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import {
  sharedCrisisEventService,
  type SharedCrisisEvent,
  type SharedCrisisMetrics,
  type CreateCrisisAccessRequestPayload,
} from "../../services/sharedCrisisEventService";

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const SharedCrisisEvents = () => {
  const [events, setEvents] = useState<SharedCrisisEvent[]>([]);
  const [metrics, setMetrics] = useState<SharedCrisisMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All event types");
  const [severityFilter, setSeverityFilter] = useState("All severity levels");
  const [areaFilter, setAreaFilter] = useState("All operational areas");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [page, setPage] = useState(1);
  const pageSize = 4;

  const [selectedCrisis, setSelectedCrisis] = useState<SharedCrisisEvent | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
      const [fetchedEvents, fetchedMetrics] = await Promise.all([
        sharedCrisisEventService.getAll(),
        sharedCrisisEventService.getMetrics(),
      ]);

      setEvents(fetchedEvents);
      setMetrics(fetchedMetrics);
      setIsLiveBackend(true);
    } catch (err) {
      console.warn("Using offline fallback crisis events:", err);
      setIsLiveBackend(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [fetchedEvents, fetchedMetrics] = await Promise.all([
          sharedCrisisEventService.getAll(),
          sharedCrisisEventService.getMetrics(),
        ]);
        if (isMounted) {
          setEvents(fetchedEvents);
          setMetrics(fetchedMetrics);
          setIsLiveBackend(true);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Initial load offline:", err);
          setIsLiveBackend(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCrises = useMemo(() => {
    return events.filter((crisis) => {
      const matchesSearch =
        `${crisis.id} ${crisis.event} ${crisis.area} ${crisis.sectors}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Active" && crisis.status === "Active") ||
        (activeTab === "Completed" && crisis.status === "Completed") ||
        (activeTab === "Archived" && crisis.status === "Archived") ||
        (activeTab === "Needs action" && crisis.status === "Monitoring");

      const matchesType =
        typeFilter === "All event types" || crisis.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All severity levels" ||
        crisis.severity === severityFilter;

      const matchesArea =
        areaFilter === "All operational areas" ||
        crisis.area === areaFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        crisis.status === statusFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesType &&
        matchesSeverity &&
        matchesArea &&
        matchesStatus
      );
    });
  }, [events, activeTab, search, typeFilter, severityFilter, areaFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCrises.length / pageSize));

  const displayedCrises = filteredCrises.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const exportCSV = () => {
    const headers = [
      "Crisis ID",
      "Crisis Event",
      "Type",
      "Severity",
      "Area",
      "Start Date",
      "Our Sectors",
      "Status",
      "Coordinator",
    ];

    const rows = filteredCrises.map((c) => [
      c.id,
      c.event,
      c.type,
      c.severity,
      c.area,
      c.date,
      c.sectors,
      c.status,
      c.coordinator || "Unassigned",
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
    link.download = `shared-crisis-events-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Shared crisis events exported to CSV successfully.");
  };

  const handleRequestAccessSubmit = async (payload: CreateCrisisAccessRequestPayload) => {
    try {
      const res = await sharedCrisisEventService.requestAccess(payload);
      showNotification(`Access request submitted for '${res.eventName}' (ID: ${res.id}).`);
      setShowRequest(false);
      loadData(true);
    } catch {
      showNotification("Failed to submit crisis access request. Please try again.", "error");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All event types");
    setSeverityFilter("All severity levels");
    setAreaFilter("All operational areas");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setPage(1);
  };

  // Dynamic tab count helper
  const getTabCount = (tab: string): number => {
    if (metrics) {
      if (tab === "All") return metrics.totalCount;
      if (tab === "Needs action") return metrics.needsActionCount;
      if (tab === "Active") return metrics.activeCount;
      if (tab === "Completed") return metrics.completedCount;
      if (tab === "Archived") return metrics.archivedCount;
    }
    if (tab === "All") return events.length;
    if (tab === "Active") return events.filter((c) => c.status === "Active").length;
    if (tab === "Needs action") return events.filter((c) => c.status === "Monitoring").length;
    if (tab === "Completed") return events.filter((c) => c.status === "Completed").length;
    if (tab === "Archived") return events.filter((c) => c.status === "Archived").length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Toast Feedback */}
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

      {/* Page Heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Partner Coordination
              <span className="mx-2">›</span>
              <span className="font-semibold text-[#153e5b]">Shared Crisis Events</span>
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

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Shared Crisis Events
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review authorised crisis information, coordination structures, and your organisation's response role.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            title="Refresh shared crisis events from API"
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            Sync
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowRequest(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Request Crisis Access
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<AlertTriangle size={19} />}
          title="Shared events"
          value={metrics ? String(metrics.sharedEvents) : "4"}
          subtitle={metrics?.sharedEventsSubtitle ?? "3 currently active"}
          color="blue"
        />

        <StatCard
          icon={<AlertTriangle size={19} />}
          title="Major response"
          value={metrics ? String(metrics.majorResponse) : "1"}
          subtitle={metrics?.majorResponseSubtitle ?? "Level 4 operation"}
          color="red"
        />

        <StatCard
          icon={<Map size={20} />}
          title="Districts covered"
          value={metrics ? String(metrics.districtsCovered) : "6"}
          subtitle={metrics?.districtsCoveredSubtitle ?? "4 active now"}
          color="blue"
        />

        <StatCard
          icon={<Check size={20} />}
          title="Coordination sectors"
          value={metrics ? String(metrics.coordinationSectors) : "4"}
          subtitle={metrics?.coordinationSectorsSubtitle ?? "All leads assigned"}
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`relative whitespace-nowrap pb-4 text-xs transition ${
              activeTab === tab
                ? "font-semibold text-[#267ba4]"
                : "text-slate-500 hover:text-[#267ba4]"
            }`}
          >
            {tab}
            <span className="ml-2 rounded-full bg-[#e5eff4] px-2 py-0.5 text-[9px] font-medium text-slate-600">
              {getTabCount(tab)}
            </span>

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search shared crisis events by ID, event name, area, or sector..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All event types</option>
          <option>Flood</option>
          <option>Landslide</option>
          <option>Disease</option>
          <option>Storm</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All severity levels</option>
          <option>Level 4 - Major</option>
          <option>Level 3 - Severe</option>
          <option>Level 2 - Moderate</option>
          <option>Level 1 - Low</option>
        </select>

        <select
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>Greater Riverton</option>
          <option>North District</option>
          <option>Eastbank</option>
          <option>West Coast</option>
          <option>South District</option>
          <option>East District</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Monitoring</option>
          <option>Completed</option>
          <option>Archived</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Filter size={15} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-[#d3e1e8] bg-white p-4">
          <p className="text-xs text-slate-600">
            Filter crisis events using the search and dropdown fields above.
          </p>
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Crisis Events Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Crisis ID",
                  "Crisis Event",
                  "Type",
                  "Severity",
                  "Operational Area",
                  "Start Date",
                  "Our Sectors",
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
                      <span>Loading shared crisis events...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedCrises.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No crisis events match your filter criteria.
                  </td>
                </tr>
              ) : (
                displayedCrises.map((crisis) => (
                  <tr
                    key={crisis.id}
                    onClick={() => setSelectedCrisis(crisis)}
                    className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                  >
                    <td className="whitespace-nowrap px-3 py-5 font-semibold text-[#153e5b]">
                      {crisis.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-5 font-medium text-[#153e5b]">
                      {crisis.event}
                    </td>

                    <td className="px-3 py-5">{crisis.type}</td>

                    <td className="whitespace-nowrap px-3 py-5">
                      {crisis.severity}
                    </td>

                    <td className="whitespace-nowrap px-3 py-5">
                      {crisis.area}
                    </td>

                    <td className="whitespace-nowrap px-3 py-5">
                      {crisis.date}
                    </td>

                    <td className="whitespace-nowrap px-3 py-5">
                      {crisis.sectors}
                    </td>

                    <td className="px-3 py-5">
                      <StatusBadge status={crisis.status} />
                    </td>

                    <td className="px-3 py-5 text-right">
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
            Showing {filteredCrises.length === 0 ? 0 : (page - 1) * pageSize + 1}
            {"–"}
            {Math.min(page * pageSize, filteredCrises.length)}{" "}
            of {filteredCrises.length} events
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  page === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Crisis Details Modal */}
      {selectedCrisis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#267ba4]">
                    {selectedCrisis.id}
                  </span>
                  <StatusBadge status={selectedCrisis.status} />
                </div>
                <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
                  Crisis Event Details
                </h2>
              </div>
              <button onClick={() => setSelectedCrisis(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <h3 className="mb-3 text-base font-semibold text-[#153e5b]">
              {selectedCrisis.event}
            </h3>

            {selectedCrisis.description && (
              <div className="mb-4 rounded-lg bg-[#f8fafc] p-3 text-xs leading-relaxed text-slate-600">
                {selectedCrisis.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <Detail label="Event Type" value={selectedCrisis.type} />
              <Detail label="Severity Level" value={selectedCrisis.severity} />
              <Detail label="Operational Area" value={selectedCrisis.area} />
              <Detail label="Start Date" value={selectedCrisis.date} />
              <Detail label="Our Response Sectors" value={selectedCrisis.sectors} />
              <Detail label="Designated Coordinator" value={selectedCrisis.coordinator || "Amina Mensah"} />
              <Detail label="Districts Covered" value={`${selectedCrisis.districtsCovered || 1} districts`} />
              <Detail
                label="Estimated Affected Population"
                value={
                  selectedCrisis.affectedPeopleCount
                    ? `${selectedCrisis.affectedPeopleCount.toLocaleString()} people`
                    : "10,000+ people"
                }
              />
            </div>

            <button
              onClick={() => setSelectedCrisis(null)}
              className="mt-6 w-full rounded-lg bg-[#267ba4] py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Request Crisis Access Modal */}
      {showRequest && (
        <RequestAccessModal
          onClose={() => setShowRequest(false)}
          onSubmit={handleRequestAccessSubmit}
          availableEvents={events.map((e) => e.event)}
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
    red: "bg-[#fdebed] text-red-500",
    green: "bg-[#e5f6f0] text-[#299b7d]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color] || colors.blue}`}>
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

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-[#e3f5f0] text-[#26977c]",
    Monitoring: "bg-[#edf2f5] text-[#617d90]",
    Completed: "bg-[#e3f5f0] text-[#26977c]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`inline-block rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || styles.Archived}`}>
      {status}
    </span>
  );
}

// Detail Item
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Request Access Modal
function RequestAccessModal({
  onClose,
  onSubmit,
  availableEvents,
}: {
  onClose: () => void;
  onSubmit: (payload: CreateCrisisAccessRequestPayload) => void;
  availableEvents: string[];
}) {
  const [eventName, setEventName] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !reason.trim()) return;

    onSubmit({
      eventName: eventName.trim(),
      reason: reason.trim(),
      partnerName: "Global Relief Network",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Request Crisis Access
            </h2>
            <p className="text-[10px] text-slate-500">
              Submit an official request to access coordination data for this event.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Crisis Event *
            </label>
            <input
              required
              list="crisis-event-list"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Select or enter crisis event name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
            <datalist id="crisis-event-list">
              {availableEvents.map((ev) => (
                <option key={ev} value={ev} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Reason for Access & Response Role *
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why your organisation requires coordination access, sector response role, or target beneficiary scope..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-4 py-2 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Send size={13} />
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default SharedCrisisEvents;
