import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Map,
  Users,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  X,
  RefreshCw,
  Clock,
  Radio,
  Archive,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  fieldActivityService,
  type FieldActivity,
  type FieldActivityMetrics,
  type CreateFieldActivityPayload,
} from "../../services/fieldActivityService";

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const FieldActivities = () => {
  const [activities, setActivities] = useState<FieldActivity[]>([]);
  const [metrics, setMetrics] = useState<FieldActivityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [teamFilter, setTeamFilter] = useState("All teams");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<FieldActivity | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const loadData = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }

    try {
      const [activityList, metricData] = await Promise.all([
        fieldActivityService.getAll(),
        fieldActivityService.getMetrics(),
      ]);
      setActivities(activityList);
      setMetrics(metricData);
      setIsConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.warn("Failed to fetch field activities from API:", err);
      setIsConnected(false);
      setError("Working with offline cached data.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const [activityList, metricData] = await Promise.all([
          fieldActivityService.getAll(),
          fieldActivityService.getMetrics(),
        ]);
        if (isMounted) {
          setActivities(activityList);
          setMetrics(metricData);
          setIsConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Initial load from API failed:", err);
          setIsConnected(false);
          setError("Working with offline cached data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search and filter
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const searchableText = [
        item.id,
        item.name,
        item.location,
        item.team,
        item.target,
        item.sector,
        item.description || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Scheduled", "Overdue"].includes(item.status)) ||
        (activeTab === "Active" &&
          ["Active", "In Progress"].includes(item.status)) ||
        (activeTab === "Completed" && item.status === "Completed") ||
        (activeTab === "Archived" && item.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (sectorFilter === "All sectors" || item.sector === sectorFilter) &&
        (locationFilter === "All locations" ||
          item.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
        (teamFilter === "All teams" || item.team === teamFilter) &&
        (statusFilter === "All statuses" || item.status === statusFilter)
      );
    });
  }, [
    activities,
    activeTab,
    search,
    sectorFilter,
    locationFilter,
    teamFilter,
    statusFilter,
  ]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: metrics?.totalActivities ?? activities.length,
      "Needs action":
        metrics?.needsActionCount ??
        activities.filter((a) => ["Scheduled", "Overdue"].includes(a.status)).length,
      Active:
        metrics?.activeCount ??
        activities.filter((a) => ["Active", "In Progress"].includes(a.status)).length,
      Completed:
        metrics?.completedCount ??
        activities.filter((a) => a.status === "Completed").length,
      Archived:
        metrics?.archivedCount ??
        activities.filter((a) => a.status === "Archived").length,
    };
  }, [metrics, activities]);

  // Distinct dropdown options derived from live data
  const sectorOptions = useMemo(() => {
    const defaultSectors = ["Food Security", "WASH", "Protection", "Health", "Shelter"];
    const fromData = activities.map((a) => a.sector).filter(Boolean);
    return Array.from(new Set([...defaultSectors, ...fromData]));
  }, [activities]);

  const teamOptions = useMemo(() => {
    const defaultTeams = [
      "Field Team North",
      "WASH Team 2",
      "Protection Team",
      "Health Outreach",
      "Food Support Team",
    ];
    const fromData = activities.map((a) => a.team).filter(Boolean);
    return Array.from(new Set([...defaultTeams, ...fromData]));
  }, [activities]);

  const locationOptions = useMemo(() => {
    const defaultLocs = ["North Ward", "Eastbank", "Riverton", "South Ward", "Central Ward"];
    return defaultLocs;
  }, []);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));

  const displayedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Activity ID",
      "Activity Name",
      "Location",
      "Scheduled",
      "Team",
      "Target/Result",
      "Sector",
      "Status",
      "Description",
      "Beneficiaries Reached",
    ];

    const rows = filteredActivities.map((item) => [
      item.id,
      item.name,
      item.location,
      item.scheduled,
      item.team,
      item.target,
      item.sector,
      item.status,
      item.description || "",
      item.beneficiariesReached ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `field-activities-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Create activity handler
  const handleCreateActivity = async (payload: CreateFieldActivityPayload) => {
    setActionInProgress("create");
    try {
      const created = await fieldActivityService.create(payload);
      setActivities((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setShowCreateModal(false);
      setActiveTab("All");
      setSearch("");
      setSectorFilter("All sectors");
      setLocationFilter("All locations");
      setTeamFilter("All teams");
      setStatusFilter("All statuses");
      setCurrentPage(1);
      // Refresh metrics
      const newMetrics = await fieldActivityService.getMetrics();
      setMetrics(newMetrics);
    } catch (err: unknown) {
      console.error("Failed to create activity on backend:", err);
      // Local fallback
      const fallbackItem: FieldActivity = {
        id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name,
        location: payload.location,
        scheduled: payload.scheduled,
        team: payload.team,
        target: payload.target,
        sector: payload.sector,
        status: payload.status || "Scheduled",
        description: payload.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActivities((prev) => [fallbackItem, ...prev]);
      setShowCreateModal(false);
    } finally {
      setActionInProgress(null);
    }
  };

  // Status transition handler
  const handleStatusChange = async (activityId: string, newStatus: string) => {
    setActionInProgress(activityId);
    try {
      const updated = await fieldActivityService.updateStatus(activityId, newStatus);
      setActivities((prev) =>
        prev.map((item) => (item.id === activityId ? updated : item))
      );
      if (selectedActivity && selectedActivity.id === activityId) {
        setSelectedActivity(updated);
      }
      const newMetrics = await fieldActivityService.getMetrics();
      setMetrics(newMetrics);
    } catch (err: unknown) {
      console.error(`Failed to update status to ${newStatus}:`, err);
      // Optimistic update
      setActivities((prev) =>
        prev.map((item) =>
          item.id === activityId
            ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
            : item
        )
      );
      if (selectedActivity && selectedActivity.id === activityId) {
        setSelectedActivity({ ...selectedActivity, status: newStatus });
      }
    } finally {
      setActionInProgress(null);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSectorFilter("All sectors");
    setLocationFilter("All locations");
    setTeamFilter("All teams");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs text-slate-500">
              Partner Coordination
              <span className="mx-2">›</span>
              <span className="font-semibold text-[#153e5b]">Field Activities</span>
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Radio size={10} className={isConnected ? "animate-pulse text-emerald-600" : "text-amber-600"} />
              {isConnected ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#153e5b]">Field Activities</h1>

          <p className="mt-1 text-sm text-slate-500">
            Plan and monitor distributions, assessments, outreach, and service delivery in the field.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(false)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh from server"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-[#267ba4]" : ""} />
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Create Field Activity
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="font-semibold text-amber-900 underline hover:no-underline"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Map size={20} />}
          title="Active today"
          value={metrics ? String(metrics.activeToday) : "12"}
          subtitle="Across active zones"
          color="blue"
        />

        <StatCard
          icon={<Users size={20} />}
          title="People targeted"
          value={metrics?.peopleTargeted || "4,840"}
          subtitle={`${metrics?.peopleReachedToday || "1,864"} reached today`}
          color="blue"
        />

        <StatCard
          icon={<Users size={20} />}
          title="Teams deployed"
          value={metrics ? String(metrics.teamsDeployed) : "18"}
          subtitle={`${metrics ? metrics.staffInField : 62} staff in field`}
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Updates overdue"
          value={metrics ? String(metrics.updatesOverdue) : "0"}
          subtitle={metrics && metrics.updatesOverdue > 0 ? "Require field check-in" : "All check-ins on schedule"}
          color={metrics && metrics.updatesOverdue > 0 ? "red" : "green"}
        />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => {
          const count = tabCounts[tab as keyof typeof tabCounts];
          return (
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
              {typeof count === "number" && (
                <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px] font-semibold text-[#153e5b]">
                  {count}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">
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
            placeholder="Search field activities..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All sectors</option>
          {sectorOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All locations</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={teamFilter}
          onChange={(e) => {
            setTeamFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All teams</option>
          {teamOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
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
          <option>In Progress</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Scheduled</option>
          <option>Overdue</option>
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

      {/* Additional Filters Banner */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#153e5b]">Active Filter Summary</p>
            <p className="mt-1 text-[10px] text-slate-500">
              Filtering by: Sector ({sectorFilter}), Location ({locationFilter}), Team ({teamFilter}), Status ({statusFilter}).
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Activities Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Activity",
                  "Activity Name",
                  "Location",
                  "Scheduled",
                  "Team",
                  "Target / Result",
                  "Sector",
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
                  <td colSpan={9} className="py-16 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-[#267ba4]" />
                      <span>Loading field activities from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedActivities.length > 0 ? (
                displayedActivities.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedActivity(item)}
                    className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                  >
                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                      {item.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                      {item.name}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {item.location}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {item.scheduled}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {item.team}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {item.target}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      {item.sector}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-3 py-4">
                      <ChevronRight size={17} className="text-[#64849a]" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No field activities found matching criteria.
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
            {filteredActivities.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredActivities.length)} of{" "}
            {filteredActivities.length} activities
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
                className={`h-8 w-8 rounded-lg border text-[10px] font-medium transition ${
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

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onStatusChange={handleStatusChange}
          isActionLoading={actionInProgress === selectedActivity.id}
        />
      )}

      {/* Create Activity Modal */}
      {showCreateModal && (
        <CreateActivityModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateActivity}
          isSubmitting={actionInProgress === "create"}
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
    red: "bg-[#fdebed] text-red-500",
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

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Progress": "bg-[#e8f2f8] text-[#267ba4]",
    Active: "bg-[#e5f6f0] text-[#299b7d]",
    Completed: "bg-[#e5f6f0] text-[#299b7d]",
    Scheduled: "bg-[#fff4df] text-[#bd8229]",
    Overdue: "bg-[#fdebed] text-red-500",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[9px] font-medium ${
        styles[status] || "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

// Detail Item
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
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value || "—"}</p>
    </div>
  );
}

// Activity Details Modal
function ActivityDetailsModal({
  activity,
  onClose,
  onStatusChange,
  isActionLoading,
}: {
  activity: FieldActivity;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  isActionLoading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#267ba4]">
                {activity.id}
              </span>
              <StatusBadge status={activity.status} />
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Activity Details
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-4 text-sm font-semibold text-[#153e5b]">
          {activity.name}
        </h3>

        {activity.description && (
          <div className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-[#153e5b] mb-1">Operational Scope</p>
            <p>{activity.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Detail label="Location" value={activity.location} />
          <Detail label="Scheduled" value={activity.scheduled} />
          <Detail label="Assigned Team" value={activity.team} />
          <Detail label="Target / Result" value={activity.target} />
          <Detail label="Sector" value={activity.sector} />
          <Detail
            label="Beneficiaries Reached"
            value={
              typeof activity.beneficiariesReached === "number"
                ? `${activity.beneficiariesReached.toLocaleString()} individuals`
                : "Tracking in progress"
            }
          />
        </div>

        {/* Action Buttons based on status */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {activity.status === "Scheduled" && (
            <button
              disabled={isActionLoading}
              onClick={() => onStatusChange(activity.id, "In Progress")}
              className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-4 py-2 text-xs font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
            >
              <Play size={13} />
              Start Operation
            </button>
          )}

          {activity.status === "In Progress" && (
            <button
              disabled={isActionLoading}
              onClick={() => onStatusChange(activity.id, "Completed")}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Clock size={13} />
              Mark Completed
            </button>
          )}

          {activity.status === "Active" && (
            <button
              disabled={isActionLoading}
              onClick={() => onStatusChange(activity.id, "Completed")}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Clock size={13} />
              Mark Completed
            </button>
          )}

          {activity.status === "Completed" && (
            <button
              disabled={isActionLoading}
              onClick={() => onStatusChange(activity.id, "Archived")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Archive size={13} />
              Archive Activity
            </button>
          )}

          {activity.status === "Archived" && (
            <button
              disabled={isActionLoading}
              onClick={() => onStatusChange(activity.id, "Scheduled")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={13} />
              Restore Activity
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Activity Modal
function CreateActivityModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (activity: CreateFieldActivityPayload) => void;
  isSubmitting?: boolean;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [scheduled, setScheduled] = useState("");
  const [team, setTeam] = useState("Field Team North");
  const [target, setTarget] = useState("");
  const [sector, setSector] = useState("Food Security");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let scheduledDisplay = scheduled;
    if (scheduled) {
      try {
        scheduledDisplay = new Date(`${scheduled}T12:00:00`).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
          }
        );
      } catch {
        scheduledDisplay = scheduled;
      }
    }

    const payload: CreateFieldActivityPayload = {
      name,
      location,
      scheduled: scheduledDisplay || "Upcoming",
      team,
      target,
      sector,
      status: "Scheduled",
      description: description.trim() || undefined,
    };

    onSubmit(payload);
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
              Create Field Activity
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Add a new field operation to the coordination ledger.
            </p>
          </div>

          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Activity Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Household food distribution"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Location *
            </label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. North Ward - Zone 3"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Scheduled Date *
              </label>
              <input
                required
                type="date"
                value={scheduled}
                onChange={(e) => setScheduled(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Target / Result *
              </label>
              <input
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 420 households"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Assigned Team *
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              >
                <option>Field Team North</option>
                <option>WASH Team 2</option>
                <option>Protection Team</option>
                <option>Health Outreach</option>
                <option>Food Support Team</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Sector *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              >
                <option>Food Security</option>
                <option>WASH</option>
                <option>Protection</option>
                <option>Health</option>
                <option>Shelter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Operational Scope / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of activities, target population, and logistics..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
          >
            {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
            Create Activity
          </button>
        </div>
      </form>
    </div>
  );
}

export default FieldActivities;
