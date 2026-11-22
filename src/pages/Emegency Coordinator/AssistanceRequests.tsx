import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  ChevronRight,
  Filter,
  Download,
  Plus,
  X,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import {
  assistanceRequestService,
  type AssistanceRequest,
  type AssistanceRequestMetrics,
} from "../../services/assistanceRequestService";

export default function AssistanceRequests() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [metrics, setMetrics] = useState<AssistanceRequestMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [activeTab, setActiveTab] = useState("All requests");
  const [search, setSearch] = useState("");
  const [crisisFilter, setCrisisFilter] = useState("All crisis events");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [organisationFilter, setOrganisationFilter] = useState("All organisations");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const [newRequest, setNewRequest] = useState({
    category: "Emergency shelter",
    location: "",
    priority: "High · 91%",
    assigned: "Unassigned",
    organisation: "National Disaster Authority",
    description: "",
    affectedPeopleCount: 1,
    hasVulnerableMembers: false,
    isLifeThreatening: false,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [reqs, met] = await Promise.all([
        assistanceRequestService.getAll(),
        assistanceRequestService.getMetrics(),
      ]);
      setRequests(reqs);
      setMetrics(met);
      setIsLiveConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load assistance requests:", err);
      const message = err instanceof Error ? err.message : "Unable to reach CareLink API backend.";
      setError(message);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initialize() {
      try {
        const [reqs, met] = await Promise.all([
          assistanceRequestService.getAll(),
          assistanceRequestService.getMetrics(),
        ]);
        if (!isCancelled) {
          setRequests(reqs);
          setMetrics(met);
          setIsLiveConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Failed to initialize assistance requests:", err);
          const message = err instanceof Error ? err.message : "Unable to reach CareLink API backend.";
          setError(message);
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

  const pageSize = 5;

  const tabs = useMemo(() => [
    { name: "All requests", count: metrics ? metrics.totalRequests.toLocaleString() : "1,284" },
    { name: "Unassigned", count: metrics ? metrics.unassigned.toLocaleString() : "63" },
    { name: "Overdue", count: metrics ? metrics.overdue.toLocaleString() : "12" },
    { name: "Potential duplicates", count: metrics ? metrics.potentialDuplicates.toLocaleString() : "9" },
  ], [metrics]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch =
        `${request.id} ${request.category} ${request.location} ${request.assigned} ${request.organisation} ${request.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const priorityMatch =
        priorityFilter === "All priorities" ||
        request.priority.startsWith(priorityFilter) ||
        request.priorityLevel === priorityFilter;

      const categoryMatch =
        categoryFilter === "All categories" ||
        request.category.toLowerCase() === categoryFilter.toLowerCase();

      const statusMatch =
        statusFilter === "All statuses" ||
        request.status.toLowerCase() === statusFilter.toLowerCase();

      const organisationMatch =
        organisationFilter === "All organisations" ||
        request.organisation.toLowerCase() === organisationFilter.toLowerCase();

      const crisisMatch =
        crisisFilter === "All crisis events" ||
        request.crisisEvent.toLowerCase() === crisisFilter.toLowerCase();

      const tabMatch =
        activeTab === "All requests" ||
        (activeTab === "Unassigned" && request.assigned === "Unassigned") ||
        (activeTab === "Overdue" && (request.status === "Escalated" || request.isOverdue)) ||
        (activeTab === "Potential duplicates" && (request.isPotentialDuplicate || request.id === "REQ-2836"));

      const verifiedMatch = !verifiedOnly || request.verification === "Verified" || request.verification === "Contact verified";
      const unassignedMatch = !unassignedOnly || request.assigned === "Unassigned";

      return (
        searchMatch &&
        priorityMatch &&
        categoryMatch &&
        statusMatch &&
        organisationMatch &&
        crisisMatch &&
        tabMatch &&
        verifiedMatch &&
        unassignedMatch
      );
    });
  }, [
    requests,
    search,
    priorityFilter,
    categoryFilter,
    statusFilter,
    organisationFilter,
    crisisFilter,
    activeTab,
    verifiedOnly,
    unassignedOnly,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearch("");
    setCrisisFilter("All crisis events");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setOrganisationFilter("All organisations");
    setActiveTab("All requests");
    setVerifiedOnly(false);
    setUnassignedOnly(false);
    setCurrentPage(1);
  };

  const handleCreateRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const created = await assistanceRequestService.create({
        category: newRequest.category,
        location: newRequest.location,
        priority: newRequest.priority,
        assigned: newRequest.assigned,
        organisation: newRequest.organisation,
        description: newRequest.description,
        affectedPeopleCount: Number(newRequest.affectedPeopleCount) || 1,
        hasVulnerableMembers: newRequest.hasVulnerableMembers,
        isLifeThreatening: newRequest.isLifeThreatening,
      });

      setRequests((prev) => [created, ...prev]);

      // Refresh metrics
      try {
        const freshMetrics = await assistanceRequestService.getMetrics();
        setMetrics(freshMetrics);
      } catch {
        // Ignored
      }

      setShowCreateModal(false);
      setActiveTab("All requests");
      setCurrentPage(1);

      setNewRequest({
        category: "Emergency shelter",
        location: "",
        priority: "High · 91%",
        assigned: "Unassigned",
        organisation: "National Disaster Authority",
        description: "",
        affectedPeopleCount: 1,
        hasVulnerableMembers: false,
        isLifeThreatening: false,
      });

      showToast(`Request ${created.id} created with AI priority ${created.priority}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create request.";
      showToast(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignInModal = async (targetTeam: string) => {
    if (!selectedRequest || updatingAssignment) return;
    setUpdatingAssignment(true);

    try {
      const updated = await assistanceRequestService.assign(selectedRequest.id, {
        assigned: targetTeam,
      });

      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRequest(updated);

      try {
        const freshMetrics = await assistanceRequestService.getMetrics();
        setMetrics(freshMetrics);
      } catch {
        // Ignored
      }

      showToast(`Assigned ${updated.id} to ${targetTeam}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update assignment.";
      showToast(`Error: ${message}`);
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleStatusChangeInModal = async (newStatus: string) => {
    if (!selectedRequest || updatingStatus) return;
    setUpdatingStatus(true);

    try {
      const updated = await assistanceRequestService.updateStatus(selectedRequest.id, {
        status: newStatus,
      });

      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRequest(updated);

      try {
        const freshMetrics = await assistanceRequestService.getMetrics();
        setMetrics(freshMetrics);
      } catch {
        // Ignored
      }

      showToast(`Status of ${updated.id} updated to ${newStatus}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status.";
      showToast(`Error: ${message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Reset assistance requests to default baseline?")) return;
    setLoading(true);
    try {
      const res = await assistanceRequestService.reset();
      const freshRequests = await assistanceRequestService.getAll();
      setRequests(freshRequests);
      setMetrics(res.metrics);
      showToast("Assistance requests reset to default baseline.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset data.";
      showToast(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "Request ID",
      "Category",
      "Location",
      "Reported",
      "AI Priority",
      "Verification",
      "Assigned",
      "Age",
      "Status",
      "Organisation",
      "Description",
    ];

    const rows = filteredRequests.map((r) => [
      r.id,
      r.category,
      r.location,
      r.reported,
      r.priority,
      r.verification,
      r.assigned,
      r.age,
      r.status,
      r.organisation,
      r.description || "",
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
    link.download = `carelink-assistance-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredRequests.length} requests to CSV.`);
  };

  const selectClass =
    "min-w-0 w-full rounded-lg border border-[#d6e2e9] bg-white px-2.5 py-2.5 text-[9px] text-slate-700 outline-none focus:border-sky-500";

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-medium text-[#153f5e] sm:text-2xl">
              Assistance Requests
            </h1>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                <Clock size={10} />
                Connecting...
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            Monitor verification, priority, assignment, and response status across active cases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh requests from server"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Reset data to baseline"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-sky-600 bg-white px-3 py-2 text-[10px] font-medium text-sky-800 hover:bg-sky-50 shadow-sm"
          >
            <Download size={13} />
            Export
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-3.5 py-2 text-[10px] font-semibold text-white hover:bg-[#1e668b] shadow-sm"
          >
            <Plus size={14} />
            Create request
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-medium">{error}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="rounded bg-red-600 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-6 border-b border-[#d3e1e8]">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-0 pb-3 text-[9px] transition ${
              activeTab === tab.name
                ? "border-[#287da5] font-semibold text-[#287da5]"
                : "border-transparent text-slate-500 hover:text-sky-800"
            }`}
          >
            {tab.name}

            <span className={`rounded-full px-1.5 py-0.5 text-[8px] ${
              activeTab === tab.name ? "bg-sky-100 text-sky-800 font-bold" : "bg-slate-200/70 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d6e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search request ID, category, location, or assigned unit..."
            className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
          <select
            value={crisisFilter}
            onChange={(e) => {
              setCrisisFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            <option>All crisis events</option>
            <option>Monsoon Floods 2025</option>
            <option>North Ridge Landslide</option>
            <option>Dengue Outbreak</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            <option>All priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            <option>All categories</option>
            <option>Emergency shelter</option>
            <option>Medical supplies</option>
            <option>Food & water</option>
            <option>Accessible transport</option>
            <option>Rescue assistance</option>
            <option>Sanitation & Hygiene</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            <option>All statuses</option>
            <option>Submitted</option>
            <option>Under Review</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Escalated</option>
            <option>Completed</option>
          </select>

          <select
            value={organisationFilter}
            onChange={(e) => {
              setOrganisationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            <option>All organisations</option>
            <option>National Disaster Authority</option>
            <option>Health Services</option>
            <option>Relief Organisation</option>
            <option>Transport Authority</option>
            <option>Emergency Services</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-800 hover:bg-sky-50 sm:col-span-1"
          >
            <Filter size={13} />
            More filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d6e2e9] bg-white p-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-sky-600" />
            <span className="text-[10px] font-medium text-sky-950">
              Advanced request filters
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-[9px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="accent-sky-700"
              />
              Verified only
            </label>

            <label className="flex items-center gap-1.5 text-[9px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={(e) => {
                  setUnassignedOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="accent-sky-700"
              />
              Unassigned only
            </label>

            <button
              onClick={resetFilters}
              className="text-[9px] font-semibold text-sky-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <section className="overflow-hidden rounded-xl border border-[#d6e2e9] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d6e2e9] bg-[#f7fafb]">
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
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-3 py-3 text-[8px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[#287da5]" />
                    <p className="text-xs text-slate-500">Loading assistance requests from backend...</p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] font-semibold text-sky-950">
                      {request.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-700">
                      {request.category}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                      {request.location}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-500">
                      {request.reported}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                          request.priority.startsWith("Critical")
                            ? "bg-red-100 text-red-700"
                            : request.priority.startsWith("High")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {request.priority}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px]">
                      {request.verification === "Verified" || request.verification === "Contact verified" ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                          {request.verification}
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-medium text-slate-600">
                          {request.verification}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                      {request.assigned === "Unassigned" ? (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700 border border-amber-200">
                          Unassigned
                        </span>
                      ) : (
                        request.assigned
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-semibold text-sky-700">
                        {request.age}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                          request.status === "Escalated"
                            ? "bg-red-100 text-red-700"
                            : request.status === "Under Review"
                            ? "bg-sky-100 text-sky-700"
                            : request.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : request.status === "Assigned"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {request.status}
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

        {!loading && filteredRequests.length === 0 && (
          <div className="py-14 text-center">
            <FileText size={26} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-medium text-slate-600">
              No assistance requests found
            </p>
            <p className="mt-1 text-[9px] text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filteredRequests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length} requests
            {requests.length > 0 && ` (${requests.length} active in memory)`}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 rounded-md border text-[9px] ${
                  currentPage === page
                    ? "border-[#287da5] bg-[#287da5] font-semibold text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleCreateRequest}
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-sky-950">
                  Create assistance request
                </h2>
                <p className="mt-1 text-[9px] text-slate-500">
                  Register a new humanitarian assistance case with automated AI triage.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Assistance category *
                </span>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className={selectClass}
                >
                  <option>Emergency shelter</option>
                  <option>Medical supplies</option>
                  <option>Food & water</option>
                  <option>Accessible transport</option>
                  <option>Rescue assistance</option>
                  <option>Sanitation & Hygiene</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Location / Sector *
                </span>
                <input
                  required
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  placeholder="e.g. Riverside, North Ward Sector 2"
                  className={selectClass}
                />
              </label>

              <label>
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Priority
                </span>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                  className={selectClass}
                >
                  <option>Critical · 94%</option>
                  <option>High · 91%</option>
                  <option>Medium · 76%</option>
                  <option>Low · 50%</option>
                </select>
              </label>

              <label>
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Assignment
                </span>
                <select
                  value={newRequest.assigned}
                  onChange={(e) => setNewRequest({ ...newRequest, assigned: e.target.value })}
                  className={selectClass}
                >
                  <option>Unassigned</option>
                  <option>Medical Team 3</option>
                  <option>Medical Team 2</option>
                  <option>Mobility Team</option>
                  <option>Rescue Unit 2</option>
                  <option>Shelter Team 1</option>
                </select>
              </label>

              <label>
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Estimated Affected People
                </span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newRequest.affectedPeopleCount}
                  onChange={(e) => setNewRequest({ ...newRequest, affectedPeopleCount: parseInt(e.target.value) || 1 })}
                  className={selectClass}
                />
              </label>

              <label>
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Organisation
                </span>
                <select
                  value={newRequest.organisation}
                  onChange={(e) => setNewRequest({ ...newRequest, organisation: e.target.value })}
                  className={selectClass}
                >
                  <option>National Disaster Authority</option>
                  <option>Health Services</option>
                  <option>Relief Organisation</option>
                  <option>Transport Authority</option>
                  <option>Emergency Services</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1 block text-[10px] font-medium text-slate-600">
                  Incident Description & Conditions
                </span>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Detail physical hazards, flood level, medical urgency, or road blockages..."
                  rows={2}
                  className={selectClass}
                />
              </label>

              <div className="sm:col-span-2 space-y-1.5 rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.isLifeThreatening}
                    onChange={(e) => setNewRequest({ ...newRequest, isLifeThreatening: e.target.checked })}
                    className="h-3 w-3 rounded accent-red-600"
                  />
                  <span className="text-[9px] font-medium text-red-700">
                    Immediate life threat / high urgency rescue
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.hasVulnerableMembers}
                    onChange={(e) => setNewRequest({ ...newRequest, hasVulnerableMembers: e.target.checked })}
                    className="h-3 w-3 rounded accent-sky-700"
                  />
                  <span className="text-[9px] font-medium text-slate-700">
                    Includes vulnerable individuals (elderly, infants, disabled)
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#1e668b] disabled:opacity-50"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                <Plus size={13} />
                Create request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request Details & Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-sky-600">
                  REQUEST DETAILS
                </p>
                <h2 className="mt-1 text-base font-semibold text-sky-950">
                  {selectedRequest.id} · {selectedRequest.crisisEvent}
                </h2>
              </div>

              <button onClick={() => setSelectedRequest(null)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-sky-950">
                  {selectedRequest.category}
                </h3>
                <span className={`rounded px-2 py-0.5 text-[8px] font-semibold ${
                  selectedRequest.priority.startsWith("Critical")
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {selectedRequest.priority}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-600">
                {selectedRequest.location}
              </p>
              {selectedRequest.description && (
                <p className="mt-2 text-[10px] text-slate-500 italic border-t border-slate-200/60 pt-2">
                  "{selectedRequest.description}"
                </p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {[
                ["Reported", selectedRequest.reported],
                ["AI Priority Level", selectedRequest.priorityLevel],
                ["Verification", selectedRequest.verification],
                ["Assigned to", selectedRequest.assigned],
                ["Age", selectedRequest.age],
                ["Status", selectedRequest.status],
                ["Responsible Organisation", selectedRequest.organisation],
                ["Affected Persons", `${selectedRequest.affectedPeopleCount} people`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <span className="text-right text-[10px] font-medium text-sky-950">{value}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions inside modal */}
            <div className="space-y-3 rounded-lg bg-[#edf4f7] p-3 border border-sky-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#153f5e] flex items-center gap-1">
                  <UserCheck size={12} /> Quick Assignment
                </span>
                {updatingAssignment && <Loader2 size={11} className="animate-spin text-[#287da5]" />}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Medical Team 3",
                  "Mobility Team",
                  "Rescue Unit 2",
                  "Shelter Team 1",
                  "Unassigned",
                ].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => handleAssignInModal(unit)}
                    disabled={updatingAssignment || selectedRequest.assigned === unit}
                    className={`rounded px-2.5 py-1 text-[8px] font-medium transition ${
                      selectedRequest.assigned === unit
                        ? "bg-[#287da5] text-white font-semibold"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-semibold text-[#153f5e]">Update Status</span>
                {updatingStatus && <Loader2 size={11} className="animate-spin text-[#287da5]" />}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Under Review",
                  "Assigned",
                  "In Progress",
                  "Escalated",
                  "Completed",
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChangeInModal(st)}
                    disabled={updatingStatus || selectedRequest.status === st}
                    className={`rounded px-2.5 py-1 text-[8px] font-medium transition ${
                      selectedRequest.status === st
                        ? "bg-sky-950 text-white font-semibold"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-4 w-full rounded-lg bg-sky-950 py-2.5 text-[10px] font-semibold text-white hover:bg-sky-900"
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
