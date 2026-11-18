import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  SlidersHorizontal,
  CalendarDays,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { accommodationService } from "../../services/accommodationService";
import type {
  AccommodationRequest,
  Priority,
  RequestCounts,
  RequestStatus,
  Shelter,
} from "../../types/accommodation";

const fallbackShelters: Shelter[] = [
  { id: "SH-001", name: "Riverton Central" },
  { id: "SH-002", name: "North Community" },
  { id: "SH-003", name: "St. Mary Civic Centre" },
  { id: "SH-004", name: "Lakeside Sports" },
];

const tabs = [
  "All requests",
  "Pending",
  "Under Review",
  "Approved",
  "Assigned",
] as const;

type TabName = (typeof tabs)[number];

const initialCounts: RequestCounts = {
  "All requests": 0,
  Pending: 0,
  "Under Review": 0,
  Approved: 0,
  Assigned: 0,
};

export default function AccommodationRequestsPage() {
  const [requests, setRequests] = useState<AccommodationRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>(fallbackShelters);
  const [counts, setCounts] = useState<RequestCounts>(initialCounts);

  const [activeTab, setActiveTab] = useState<TabName>("All requests");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [status, setStatus] = useState("All statuses");
  const [shelter, setShelter] = useState("All shelters");
  const [dateRange, setDateRange] = useState("Date range");

  const [moreFilters, setMoreFilters] = useState(false);
  const [minFamily, setMinFamily] = useState("");
  const [maxFamily, setMaxFamily] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<AccommodationRequest | null>(null);
  const [newRequestOpen, setNewRequestOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newRequest, setNewRequest] = useState({
    applicant: "",
    familyMembers: "1",
    currentLocation: "",
    requestedShelter: "SH-001",
    priority: "Medium" as Priority,
  });

  const getTabStatus = (tab: TabName): RequestStatus | null => {
    return tab === "All requests" ? null : tab;
  };

  /* ================= FETCH COUNTS & SHELTERS ================= */

  const fetchCounts = useCallback(async () => {
    try {
      const data = await accommodationService.getRequestCounts();
      setCounts(data);
    } catch (err: any) {
      console.error("Failed to fetch request counts:", err);
    }
  }, []);

  const fetchShelters = useCallback(async () => {
    try {
      const data = await accommodationService.getShelters();
      if (data && data.length > 0) {
        setShelters(data);
        if (!newRequest.requestedShelter) {
          setNewRequest((prev) => ({
            ...prev,
            requestedShelter: data[0].id,
          }));
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch shelters:", err);
    }
  }, [newRequest.requestedShelter]);

  /* ================= FETCH REQUESTS ================= */

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const tabStatus = getTabStatus(activeTab);
      const effectiveStatus = tabStatus
        ? tabStatus
        : status !== "All statuses"
        ? status
        : undefined;

      const result = await accommodationService.getRequests({
        search: search.trim() || undefined,
        status: effectiveStatus,
        priority: priority !== "All priorities" ? priority : undefined,
        shelterId: shelter !== "All shelters" ? shelter : undefined,
        dateRange:
          dateRange !== "Date range" && dateRange !== "All dates"
            ? dateRange
            : undefined,
        minFamilyMembers: minFamily ? Number(minFamily) : undefined,
        maxFamilyMembers: maxFamily ? Number(maxFamily) : undefined,
        location: locationFilter.trim() || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      });

      setRequests(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.max(1, result.totalPages || 1));
    } catch (err: any) {
      console.error("Error fetching accommodation requests:", err);
      setErrorMessage(
        err.message || "Failed to load accommodation requests from server."
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    search,
    priority,
    status,
    shelter,
    dateRange,
    minFamily,
    maxFamily,
    locationFilter,
    currentPage,
  ]);

  // Initial load: shelters & counts
  useEffect(() => {
    fetchCounts();
    fetchShelters();
  }, [fetchCounts, fetchShelters]);

  // Fetch requests whenever filters or pagination change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRequests();
    }, 200);

    return () => clearTimeout(handler);
  }, [fetchRequests]);

  /* ================= TAB & FILTER ACTIONS ================= */

  const changeTab = (tab: TabName) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setPriority("All priorities");
    setStatus("All statuses");
    setShelter("All shelters");
    setDateRange("Date range");
    setMinFamily("");
    setMaxFamily("");
    setLocationFilter("");
    setActiveTab("All requests");
    setCurrentPage(1);
  };

  /* ================= CREATE REQUEST ================= */

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const familyMembers = Number(newRequest.familyMembers);

    if (!newRequest.applicant.trim() || familyMembers < 1) {
      setErrorMessage("Please enter an applicant name and at least 1 family member.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await accommodationService.createRequest({
        applicant: newRequest.applicant.trim(),
        familyMembers,
        currentLocation: newRequest.currentLocation.trim(),
        requestedShelter: newRequest.requestedShelter,
        priority: newRequest.priority,
      });

      // Reset form
      setNewRequest({
        applicant: "",
        familyMembers: "1",
        currentLocation: "",
        requestedShelter: shelters[0]?.id || "SH-001",
        priority: "Medium",
      });

      setNewRequestOpen(false);
      setSuccessMessage(
        `Request ${created.id} for ${created.applicant} created successfully.`
      );

      // Refresh list & counts
      setActiveTab("All requests");
      setCurrentPage(1);
      await fetchCounts();
      await fetchRequests();
    } catch (err: any) {
      console.error("Error creating accommodation request:", err);
      setErrorMessage(err.message || "Failed to create accommodation request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UPDATE REQUEST STATUS ================= */

  const updateRequestStatus = async (newStatus: RequestStatus) => {
    if (!selectedRequest) return;

    const requestId = selectedRequest.id;
    setIsUpdatingStatus(true);
    setErrorMessage("");

    try {
      await accommodationService.updateRequestStatus(
        requestId,
        newStatus
      );

      // Update in local requests list
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );

      // Update selected request in drawer
      setSelectedRequest((prev) =>
        prev && prev.id === requestId ? { ...prev, status: newStatus } : prev
      );

      setSuccessMessage(
        `Request ${requestId} status updated to ${newStatus}.`
      );

      // Refresh counts
      await fetchCounts();
    } catch (err: any) {
      console.error("Error updating accommodation request status:", err);
      setErrorMessage(
        err.message || "Failed to update accommodation request status."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Accommodation Requests</span>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Accommodation Requests
            </h1>

            <p className="text-[11px] text-slate-500 mt-2">
              Review, approve, and assign displaced households to safe accommodation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchRequests();
                fetchCounts();
              }}
              title="Refresh requests"
              className="h-9 px-3 bg-white border border-[#aac4d2] text-[#1c638a] rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => setNewRequestOpen(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              New request
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-800"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ================= TABS ================= */}
        <div className="flex items-center gap-5 md:gap-7 overflow-x-auto border-b border-[#d5e3e9] mb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`flex items-center gap-1.5 py-3 text-[9px] whitespace-nowrap border-b-2 transition ${
                activeTab === tab
                  ? "border-[#21638d] text-[#174f75] font-bold"
                  : "border-transparent text-slate-500 hover:text-[#21638d]"
              }`}
            >
              {tab}

              <span
                className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                  activeTab === tab
                    ? "bg-[#e5eff5] text-[#21638d]"
                    : "bg-[#edf2f5] text-slate-500"
                }`}
              >
                {counts[tab] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* ================= SEARCH + FILTERS ================= */}
        <section className="flex flex-col xl:flex-row gap-2 mb-3">
          <div className="relative flex-1 min-w-0">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search request ID or applicant..."
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-[10px] outline-none focus:border-[#45b99b]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2">
            <FilterSelect
              value={priority}
              options={[
                "All priorities",
                "Critical",
                "High",
                "Medium",
                "Low",
              ]}
              onChange={(v) => {
                setPriority(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={status}
              options={[
                "All statuses",
                "Pending",
                "Under Review",
                "Approved",
                "Assigned",
              ]}
              onChange={(v) => {
                setStatus(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={shelter}
              options={["All shelters", ...shelters.map((s) => s.id)]}
              onChange={(v) => {
                setShelter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={dateRange}
              options={["Date range", "All dates", "Last 7 days"]}
              onChange={(v) => {
                setDateRange(v);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={() => setMoreFilters(!moreFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center justify-center gap-2 ${
                moreFilters
                  ? "border-[#2785b7] text-[#2785b7]"
                  : "border-[#aac4d2]"
              }`}
            >
              <SlidersHorizontal size={13} />
              More filters
            </button>
          </div>
        </section>

        {/* MORE FILTERS */}
        {moreFilters && (
          <section className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">Advanced filters</h3>

              <button
                onClick={resetFilters}
                className="text-[10px] text-[#267ca6] font-semibold hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormInput
                label="Minimum family members"
                type="number"
                value={minFamily}
                onChange={(v) => {
                  setMinFamily(v);
                  setCurrentPage(1);
                }}
                placeholder="Minimum"
              />

              <FormInput
                label="Maximum family members"
                type="number"
                value={maxFamily}
                onChange={(v) => {
                  setMaxFamily(v);
                  setCurrentPage(1);
                }}
                placeholder="Maximum"
              />

              <FormInput
                label="Current location"
                value={locationFilter}
                onChange={(v) => {
                  setLocationFilter(v);
                  setCurrentPage(1);
                }}
                placeholder="Search location"
              />
            </div>
          </section>
        )}

        {/* ================= REQUESTS TABLE ================= */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-[#1c638a] text-xs font-semibold">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Loading requests...</span>
                </div>
              </div>
            )}

            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#f5f9fa] border-b border-slate-200">
                <tr className="text-[8px] text-slate-500">
                  <th className="px-3 py-3 font-medium">Request ID</th>
                  <th className="px-3 py-3 font-medium">Applicant</th>
                  <th className="px-3 py-3 font-medium">Family Members</th>
                  <th className="px-3 py-3 font-medium">Current Location</th>
                  <th className="px-3 py-3 font-medium">Requested Shelter</th>
                  <th className="px-3 py-3 font-medium">Priority</th>
                  <th className="px-3 py-3 font-medium">Request Date</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-[8px] transition"
                  >
                    <td className="px-3 py-4 font-semibold text-[#174f75]">
                      {request.id}
                    </td>

                    <td className="px-3 py-4">{request.applicant}</td>

                    <td className="px-3 py-4">{request.familyMembers}</td>

                    <td className="px-3 py-4">{request.currentLocation}</td>

                    <td className="px-3 py-4">{request.requestedShelter}</td>

                    <td className="px-3 py-4">
                      <PriorityBadge priority={request.priority} />
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      {request.requestDate}
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    <td className="px-3 py-4">
                      <ChevronRight size={13} className="text-slate-400" />
                    </td>
                  </tr>
                ))}

                {!loading && requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-xs text-slate-400"
                    >
                      No accommodation requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-3.5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              Showing{" "}
              {totalCount === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              to {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
              {totalCount}
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-8 rounded-lg border text-[9px] ${
                      currentPage === page
                        ? "bg-[#1c638a] text-white border-[#1c638a]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= REQUEST DETAILS PANEL ================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request details</h2>

              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">
              <p className="text-xs text-[#2785b7] font-semibold">
                {selectedRequest.id}
              </p>

              <h3 className="text-lg font-semibold mt-2">
                {selectedRequest.applicant}
              </h3>

              <div className="flex items-center gap-2 mt-3">
                <PriorityBadge priority={selectedRequest.priority} />
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <DetailRow
                icon={<Users size={15} />}
                label="Family members"
                value={String(selectedRequest.familyMembers)}
              />

              <DetailRow
                icon={<MapPin size={15} />}
                label="Current location"
                value={selectedRequest.currentLocation}
              />

              <DetailRow
                icon={<Users size={15} />}
                label="Requested shelter"
                value={selectedRequest.requestedShelter}
              />

              <DetailRow
                icon={<CalendarDays size={15} />}
                label="Request date"
                value={selectedRequest.requestDate}
              />

              <DetailRow
                icon={<Clock size={15} />}
                label="Request status"
                value={selectedRequest.status}
              />
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold">Update request status</h3>
                {isUpdatingStatus && (
                  <span className="text-[10px] text-[#2785b7] flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Saving...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => updateRequestStatus("Under Review")}
                  className={`border border-slate-200 rounded-lg py-2.5 text-[10px] font-semibold hover:bg-slate-50 disabled:opacity-50 ${
                    selectedRequest.status === "Under Review"
                      ? "ring-2 ring-[#ad7413]"
                      : ""
                  }`}
                >
                  Under Review
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => updateRequestStatus("Approved")}
                  className={`bg-[#e5f8f1] text-[#269a77] rounded-lg py-2.5 text-[10px] font-semibold hover:bg-[#d5f1e7] disabled:opacity-50 ${
                    selectedRequest.status === "Approved"
                      ? "ring-2 ring-[#269a77]"
                      : ""
                  }`}
                >
                  Approve
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => updateRequestStatus("Assigned")}
                  className={`bg-[#1c638a] text-white rounded-lg py-2.5 text-[10px] font-semibold hover:bg-[#144665] disabled:opacity-50 ${
                    selectedRequest.status === "Assigned"
                      ? "ring-2 ring-[#1c638a]"
                      : ""
                  }`}
                >
                  Assign shelter
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => updateRequestStatus("Pending")}
                  className={`border border-slate-200 rounded-lg py-2.5 text-[10px] font-semibold hover:bg-slate-50 disabled:opacity-50 ${
                    selectedRequest.status === "Pending"
                      ? "ring-2 ring-slate-400"
                      : ""
                  }`}
                >
                  Set Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW REQUEST MODAL ================= */}
      {newRequestOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-semibold">
                  New accommodation request
                </h2>

                <p className="text-[10px] text-slate-400 mt-1">
                  Create a request for a displaced household.
                </p>
              </div>

              <button
                onClick={() => setNewRequestOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <FormInput
                label="Applicant name"
                placeholder="Enter applicant name"
                value={newRequest.applicant}
                onChange={(v) =>
                  setNewRequest({ ...newRequest, applicant: v })
                }
              />

              <FormInput
                label="Number of family members"
                type="number"
                value={newRequest.familyMembers}
                onChange={(v) =>
                  setNewRequest({ ...newRequest, familyMembers: v })
                }
              />

              <FormInput
                label="Current location"
                placeholder="Enter current location"
                value={newRequest.currentLocation}
                onChange={(v) =>
                  setNewRequest({ ...newRequest, currentLocation: v })
                }
              />

              <FormSelect
                label="Requested shelter"
                value={newRequest.requestedShelter}
                options={shelters.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                onChange={(v) =>
                  setNewRequest({ ...newRequest, requestedShelter: v })
                }
              />

              <FormSelect
                label="Priority"
                value={newRequest.priority}
                options={[
                  { value: "Critical", label: "Critical" },
                  { value: "High", label: "High" },
                  { value: "Medium", label: "Medium" },
                  { value: "Low", label: "Low" },
                ]}
                onChange={(v) =>
                  setNewRequest({
                    ...newRequest,
                    priority: v as Priority,
                  })
                }
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setNewRequestOpen(false)}
                  className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665] disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {isSubmitting ? "Creating..." : "Create request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[60] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />
          <p className="text-xs flex-1">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-white/70 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full xl:w-[105px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-7 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    Critical: "bg-[#fff3dc] text-[#ad7413]",
    High: "bg-[#edf3f8] text-[#39799f]",
    Medium: "bg-[#eef2f5] text-[#657b8b]",
    Low: "bg-[#e5f8f1] text-[#269a77]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${
        styles[priority] || styles.Medium
      }`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    "Under Review": "bg-[#fff3dc] text-[#ad7413]",
    Pending: "bg-[#edf2f5] text-[#607b8e]",
    Approved: "bg-[#e5f8f1] text-[#269a77]",
    Assigned: "bg-[#edf1f4] text-[#526f83]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <input
        required
        type={type}
        min={type === "number" ? 1 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="text-[#2785b7]">{icon}</div>

      <div className="flex-1">
        <p className="text-[9px] text-slate-400">{label}</p>
        <p className="text-xs font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
}
