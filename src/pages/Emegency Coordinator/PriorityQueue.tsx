import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  Plus,
  X,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle,
  UserCheck,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import {
  priorityQueueService,
  type PriorityQueueItem,
  type PriorityQueueMetrics,
  type SlaPolicy,
} from "../../services/priorityQueueService";

const selectStyle =
  "w-full min-w-0 rounded-lg border border-[#d4e0e8] bg-white px-2.5 py-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500";

export default function PriorityQueue() {
  const [requests, setRequests] = useState<PriorityQueueItem[]>([]);
  const [metrics, setMetrics] = useState<PriorityQueueMetrics | null>(null);
  const [slaPolicies, setSlaPolicies] = useState<SlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All requests");
  const [search, setSearch] = useState("");
  const [crisisEvent, setCrisisEvent] = useState("All crisis events");
  const [priority, setPriority] = useState("All priorities");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [organisation, setOrganisation] = useState("All organisations");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [selected, setSelected] = useState<PriorityQueueItem | null>(null);
  const [page, setPage] = useState(1);

  // Quick action state in details modal
  const [assignTeamName, setAssignTeamName] = useState("Medical Team 3");
  const [actionLoading, setActionLoading] = useState(false);

  // Create request form
  const [form, setForm] = useState({
    category: "Emergency shelter",
    location: "",
    crisisEvent: "Monsoon Floods 2025",
    priority: "Critical · 94%",
    priorityLevel: "Critical",
    assigned: "Unassigned",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const pageSize = 5;

  const showToastNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Refresh data from server
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [items, metricsData, policies] = await Promise.all([
        priorityQueueService.getAll(),
        priorityQueueService.getMetrics(),
        priorityQueueService.getSlaPolicies(),
      ]);
      setRequests(items);
      setMetrics(metricsData);
      setSlaPolicies(policies);
    } catch (err) {
      console.error("Error refreshing priority queue:", err);
      setError("Failed to refresh priority queue data from server.");
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      priorityQueueService.getAll(),
      priorityQueueService.getMetrics(),
      priorityQueueService.getSlaPolicies(),
    ])
      .then(([items, metricsData, policies]) => {
        if (!cancelled) {
          setRequests(items);
          setMetrics(metricsData);
          setSlaPolicies(policies);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load initial priority queue:", err);
          setError("Failed to connect to backend service. Using offline data.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = useMemo(() => [
    {
      name: "All requests",
      count: metrics ? metrics.totalCount.toLocaleString() : "1,284",
    },
    {
      name: "Unassigned",
      count: metrics ? metrics.unassignedCount.toLocaleString() : "63",
    },
    {
      name: "Overdue",
      count: metrics ? metrics.overdueCount.toLocaleString() : "12",
    },
    {
      name: "Potential duplicates",
      count: metrics ? metrics.potentialDuplicatesCount.toLocaleString() : "9",
    },
  ], [metrics]);

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch = [
        item.id,
        item.category,
        item.location,
        item.assigned,
        item.description || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCrisis =
        crisisEvent === "All crisis events" ||
        item.crisisEvent === crisisEvent;

      const matchesPriority =
        priority === "All priorities" ||
        item.priority.startsWith(priority) ||
        item.priorityLevel.toLowerCase() === priority.toLowerCase();

      const matchesCategory =
        category === "All categories" ||
        item.category === category;

      const matchesStatus =
        status === "All statuses" ||
        item.status === status;

      const matchesOrganisation =
        organisation === "All organisations" ||
        (organisation === "Unassigned" && item.assigned === "Unassigned") ||
        (organisation === "Medical Teams" && item.assigned.includes("Medical")) ||
        (organisation === "Rescue Teams" && item.assigned.includes("Rescue")) ||
        item.assigned.toLowerCase().includes(organisation.toLowerCase());

      const matchesTab =
        activeTab === "All requests" ||
        (activeTab === "Unassigned" && item.assigned === "Unassigned") ||
        (activeTab === "Overdue" && (item.overdue || item.status === "Escalated")) ||
        (activeTab === "Potential duplicates" && (item.id === "REQ-2836" || item.description?.includes("duplicate")));

      return (
        matchesSearch &&
        matchesCrisis &&
        matchesPriority &&
        matchesCategory &&
        matchesStatus &&
        matchesOrganisation &&
        matchesTab
      );
    });
  }, [requests, search, crisisEvent, priority, category, status, organisation, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const visibleRequests = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const clearFilters = () => {
    setSearch("");
    setCrisisEvent("All crisis events");
    setPriority("All priorities");
    setCategory("All categories");
    setStatus("All statuses");
    setOrganisation("All organisations");
    setActiveTab("All requests");
    setPage(1);
  };

  const exportCSV = () => {
    const headers = [
      "Request ID",
      "Category",
      "Location",
      "Crisis Event",
      "Priority",
      "Verification",
      "Assigned",
      "Age",
      "Status",
      "Overdue",
    ];

    const rows = filtered.map((r) => [
      r.id,
      r.category,
      r.location,
      r.crisisEvent,
      r.priority,
      r.verification,
      r.assigned,
      r.age,
      r.status,
      r.overdue ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `priority-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const createRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.location.trim()) return;

    setSubmitting(true);
    try {
      const created = await priorityQueueService.create({
        category: form.category,
        location: form.location.trim(),
        crisisEvent: form.crisisEvent,
        priority: form.priority,
        priorityLevel: form.priorityLevel,
        assigned: form.assigned,
        description: form.description.trim() || undefined,
      });

      setRequests((prev) => [created, ...prev]);
      setActiveTab("All requests");
      setPage(1);
      setShowCreate(false);

      setForm({
        category: "Emergency shelter",
        location: "",
        crisisEvent: "Monsoon Floods 2025",
        priority: "Critical · 94%",
        priorityLevel: "Critical",
        assigned: "Unassigned",
        description: "",
      });

      showToastNotification(`Priority request ${created.id} created successfully!`);
      priorityQueueService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      console.error("Failed to create priority request:", err);
      showToastNotification("Failed to create priority request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTeam = async (requestId: string, team: string) => {
    setActionLoading(true);
    try {
      const updated = await priorityQueueService.assignTeam(requestId, team);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      setSelected(updated);
      showToastNotification(`Assigned to ${team}`);
      priorityQueueService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      console.error("Failed to assign team:", err);
      showToastNotification("Failed to update team assignment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const updated = await priorityQueueService.updateStatus(requestId, newStatus);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      setSelected(updated);
      showToastNotification(`Status updated to ${newStatus}`);
      priorityQueueService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      console.error("Failed to update status:", err);
      showToastNotification("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#153f5e] px-4 py-3 text-xs text-white shadow-xl animate-bounce">
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium text-[#153f5e]">
              Priority Queue
            </h1>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
              Live Triage
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Review critical, high-priority, and overdue humanitarian cases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b8d0df] bg-white px-3.5 py-2.5 text-[10px] font-medium text-[#175477] hover:bg-sky-50 transition"
            title="Refresh priority queue from backend"
          >
            <RefreshCw
              size={13}
              className={`${refreshing ? "animate-spin text-sky-600" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-[10px] font-medium text-[#175477] hover:bg-sky-50 transition"
          >
            <Download size={14} />
            Export
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1c668d] transition shadow-sm"
          >
            <Plus size={14} />
            Create request
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="font-medium text-amber-900 underline hover:no-underline"
          >
            Retry connection
          </button>
        </div>
      )}

      {/* Critical SLA attention banner */}
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 border-l-[3px] border-l-red-600 bg-[#fff5f5] p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <AlertTriangle size={19} className="shrink-0 text-red-700" />
          <div>
            <p className="text-[10px] font-semibold text-red-800">
              {metrics ? metrics.criticalOrOverdueRequiringAttentionCount : 12} critical or overdue cases require attention
            </p>
            <p className="mt-0.5 text-[9px] text-red-600">
              Human review is required before priority or escalation decisions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPolicy(true)}
          className="shrink-0 rounded-lg border border-[#b8d0df] bg-white px-3 py-2 text-[9px] font-medium text-[#175477] hover:bg-sky-50 transition"
        >
          Review SLA policy
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-6 border-b border-[#d4e0e8]">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 border-b-2 pb-3 text-[10px] whitespace-nowrap transition ${
              activeTab === tab.name
                ? "border-[#287da5] font-semibold text-[#287da5]"
                : "border-transparent text-slate-500 hover:text-sky-800"
            }`}
          >
            {tab.name}
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                activeTab === tab.name
                  ? "bg-sky-100 text-[#287da5]"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(180px,1fr)_repeat(5,minmax(100px,auto))]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d4e0e8] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search request ID, category, or location..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>

        <select
          value={crisisEvent}
          onChange={(e) => {
            setCrisisEvent(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All crisis events</option>
          <option>Monsoon Floods 2025</option>
          <option>North Ridge Landslide</option>
          <option>Dengue Outbreak</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All categories</option>
          <option>Emergency shelter</option>
          <option>Medical supplies</option>
          <option>Food & water</option>
          <option>Rescue assistance</option>
          <option>Accessible transport</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All statuses</option>
          <option>Under Review</option>
          <option>Assigned</option>
          <option>Submitted</option>
          <option>In Progress</option>
          <option>Escalated</option>
          <option>Completed</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] font-medium transition ${
            showFilters
              ? "border-sky-700 bg-sky-50 text-sky-800"
              : "border-sky-600 bg-white text-sky-800 hover:bg-sky-50"
          }`}
        >
          <Filter size={13} />
          More filters
          <ChevronDown size={12} />
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 grid grid-cols-1 gap-3 rounded-lg border border-[#d4e0e8] bg-white p-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[9px] font-medium text-slate-500">
              Assigned organisation / team
            </label>
            <select
              value={organisation}
              onChange={(e) => {
                setOrganisation(e.target.value);
                setPage(1);
              }}
              className={selectStyle}
            >
              <option>All organisations</option>
              <option>Unassigned</option>
              <option>Medical Teams</option>
              <option>Rescue Teams</option>
              <option>Mobility Team</option>
              <option>Shelter Team 1</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="rounded-lg bg-slate-100 px-4 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200 transition"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <section className="overflow-hidden rounded-xl border border-[#d4e0e8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d4e0e8] bg-[#f7fafb]">
                {[
                  "Request",
                  "Category",
                  "Location",
                  "Reported",
                  "AI Priority",
                  "Verification",
                  "Assigned",
                  "Age",
                  "Status",
                  "",
                ].map((heading, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-sky-600" />
                      <span>Loading priority requests...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleRequests.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] font-semibold text-[#153f5e]">
                      {item.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-700">
                      {item.category}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                      {item.location}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-500">
                      {item.reported}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                          item.priority.startsWith("Critical")
                            ? "bg-red-100 text-red-700"
                            : item.priority.startsWith("High")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.priority.split(" · ")[0]}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px]">
                      {item.verification === "Verified" ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                          Verified
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          {item.verification}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                      {item.assigned}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-semibold text-sky-700">
                        {item.age}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                          item.status === "Escalated"
                            ? "bg-red-100 text-red-700"
                            : item.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <ChevronRight size={15} className="text-slate-500" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && visibleRequests.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No priority requests found matching the current filters.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length === 0 ? 0 : (metrics ? metrics.totalCount : 1284)} requests
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-md border text-[9px] transition ${
                  page === p
                    ? "border-[#287da5] bg-[#287da5] text-white font-medium"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Create Priority Request Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={createRequest}
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#153f5e]">
                  Create Priority Request
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Triage high-urgency humanitarian demand.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] text-slate-600">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Emergency shelter</option>
                  <option>Medical supplies</option>
                  <option>Food & water</option>
                  <option>Rescue assistance</option>
                  <option>Accessible transport</option>
                </select>
              </label>

              <label className="block text-[10px] text-slate-600">
                Location *
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Riverside, North Ward"
                  className={`${selectStyle} mt-1`}
                />
              </label>

              <label className="block text-[10px] text-slate-600">
                Crisis Event
                <select
                  value={form.crisisEvent}
                  onChange={(e) => setForm({ ...form, crisisEvent: e.target.value })}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Monsoon Floods 2025</option>
                  <option>North Ridge Landslide</option>
                  <option>Dengue Outbreak</option>
                </select>
              </label>

              <label className="block text-[10px] text-slate-600">
                Priority Level
                <select
                  value={form.priority}
                  onChange={(e) => {
                    const val = e.target.value;
                    const level = val.split(" · ")[0];
                    setForm({
                      ...form,
                      priority: val,
                      priorityLevel: level,
                    });
                  }}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Critical · 94%</option>
                  <option>High · 91%</option>
                  <option>Medium · 76%</option>
                  <option>Low · 50%</option>
                </select>
              </label>

              <label className="block text-[10px] text-slate-600">
                Assign Team
                <select
                  value={form.assigned}
                  onChange={(e) => setForm({ ...form, assigned: e.target.value })}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Unassigned</option>
                  <option>Medical Team 3</option>
                  <option>Medical Team 2</option>
                  <option>Rescue Unit 2</option>
                  <option>Mobility Team</option>
                  <option>Shelter Team 1</option>
                </select>
              </label>

              <label className="block text-[10px] text-slate-600">
                Operational Description (Optional)
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of stranded persons, immediate hazards, or urgent needs"
                  rows={2}
                  className={`${selectStyle} mt-1 resize-none`}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#287da5] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#206788] disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                <span>Create request</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Request Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-sky-600">
                  PRIORITY REQUEST DETAILS
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#153f5e]">
                  {selected.id}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-700">
                  {selected.priority}
                </span>
                {selected.overdue && (
                  <span className="rounded bg-red-200 px-1.5 py-0.5 text-[8px] font-bold text-red-800">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-slate-600">
                {selected.category} · {selected.location}
              </p>
              {selected.description && (
                <p className="mt-1 text-[10px] text-slate-700 italic">
                  "{selected.description}"
                </p>
              )}
            </div>

            {[
              ["Reported", selected.reported],
              ["Verification", selected.verification],
              ["Assigned", selected.assigned],
              ["Age", selected.age],
              ["Status", selected.status],
              ["Crisis Event", selected.crisisEvent],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-2.5 text-[10px]">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}

            {/* Quick Triage Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-[9px] font-medium text-slate-500">
                Assign / Dispatch Team
              </label>
              <div className="flex gap-2">
                <select
                  value={assignTeamName}
                  onChange={(e) => setAssignTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] text-slate-700 outline-none"
                >
                  <option>Medical Team 3</option>
                  <option>Medical Team 2</option>
                  <option>Rescue Unit 2</option>
                  <option>Mobility Team</option>
                  <option>Shelter Team 1</option>
                  <option>Unassigned</option>
                </select>

                <button
                  disabled={actionLoading}
                  onClick={() => handleAssignTeam(selected.id, assignTeamName)}
                  className="rounded-lg bg-[#287da5] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[#206788] disabled:opacity-50 transition shrink-0 flex items-center gap-1"
                >
                  <UserCheck size={12} />
                  <span>Assign</span>
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                {selected.status !== "Escalated" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selected.id, "Escalated")}
                    className="flex-1 rounded-lg border border-red-300 bg-white py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition flex items-center justify-center gap-1"
                  >
                    <ShieldAlert size={12} />
                    <span>Escalate Case</span>
                  </button>
                )}

                {selected.status !== "In Progress" && selected.status !== "Completed" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selected.id, "In Progress")}
                    className="flex-1 rounded-lg border border-sky-300 bg-white py-2 text-[10px] font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50 transition"
                  >
                    Mark In Progress
                  </button>
                )}

                {selected.status !== "Completed" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selected.id, "Completed")}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    Resolve Case
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-lg bg-[#153f5e] py-2 text-[10px] font-semibold text-white hover:bg-[#205879] transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* SLA Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#153f5e]">
                  Operational SLA Policy
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Target response time horizons by priority classification.
                </p>
              </div>
              <button onClick={() => setShowPolicy(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {(slaPolicies.length > 0 ? slaPolicies : [
                { level: "Critical", time: "Immediate response", color: "bg-red-100 text-red-700", description: "Life-threatening triage or critical structural failure", targetMinutes: 15 },
                { level: "High", time: "Within 30 minutes", color: "bg-amber-100 text-amber-700", description: "Urgent medical supplies, displaced families", targetMinutes: 30 },
                { level: "Medium", time: "Within 2 hours", color: "bg-sky-100 text-sky-700", description: "Accessible transport, secondary shelter allocation", targetMinutes: 120 },
                { level: "Low", time: "Within 24 hours", color: "bg-slate-100 text-slate-700", description: "General welfare inquiries and non-urgent aid", targetMinutes: 1440 },
              ]).map((policy) => (
                <div
                  key={policy.level}
                  className="rounded-lg border border-slate-100 p-3 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md px-2 py-1 text-[9px] font-semibold ${policy.color}`}
                    >
                      {policy.level}
                    </span>
                    <span className="text-[10px] font-medium text-slate-700">
                      {policy.time}
                    </span>
                  </div>
                  {policy.description && (
                    <p className="mt-1.5 text-[9px] text-slate-500">
                      {policy.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-4 text-[9px] text-slate-400">
              Active CareLink operational SLA framework. Human review overrides AI confidence scores when evidence is pending.
            </p>

            <button
              onClick={() => setShowPolicy(false)}
              className="mt-4 w-full rounded-lg bg-[#153f5e] py-2.5 text-[10px] font-semibold text-white hover:bg-[#205879] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
