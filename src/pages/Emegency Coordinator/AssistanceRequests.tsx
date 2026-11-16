
import { useMemo, useState } from "react";
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
} from "lucide-react";

interface AssistanceRequest {
  id: string;
  category: string;
  location: string;
  reported: string;
  priority: string;
  verification: string;
  assigned: string;
  age: string;
  status: string;
  organisation: string;
}

const initialRequests: AssistanceRequest[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    location: "Riverside, North Ward",
    reported: "12 min ago",
    priority: "Critical · 94%",
    verification: "Evidence pending",
    assigned: "Unassigned",
    age: "18 min",
    status: "Under Review",
    organisation: "National Disaster Authority",
  },
  {
    id: "REQ-2839",
    category: "Medical supplies",
    location: "Old Town, Sector 4",
    reported: "26 min ago",
    priority: "High · 91%",
    verification: "Verified",
    assigned: "Medical Team 3",
    age: "34 min",
    status: "Assigned",
    organisation: "Health Services",
  },
  {
    id: "REQ-2836",
    category: "Food & water",
    location: "Eastbank, Sector 2",
    reported: "41 min ago",
    priority: "High · 87%",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
    organisation: "Relief Organisation",
  },
  {
    id: "REQ-2828",
    category: "Accessible transport",
    location: "Central Ward",
    reported: "1 hr ago",
    priority: "High · 82%",
    verification: "Verified",
    assigned: "Mobility Team",
    age: "1h 12m",
    status: "In Progress",
    organisation: "Transport Authority",
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
    location: "North Ward",
    reported: "1 hr ago",
    priority: "Critical · 96%",
    verification: "Verified",
    assigned: "Rescue Unit 2",
    age: "1h 34m",
    status: "Escalated",
    organisation: "Emergency Services",
  },
  {
    id: "REQ-2819",
    category: "Medical supplies",
    location: "West District",
    reported: "2 hrs ago",
    priority: "Medium · 76%",
    verification: "Verified",
    assigned: "Medical Team 2",
    age: "2h 10m",
    status: "Assigned",
    organisation: "Health Services",
  },
  {
    id: "REQ-2815",
    category: "Food & water",
    location: "Eastbank",
    reported: "3 hrs ago",
    priority: "High · 85%",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "3h 20m",
    status: "Submitted",
    organisation: "Relief Organisation",
  },
  {
    id: "REQ-2808",
    category: "Emergency shelter",
    location: "Central Ward",
    reported: "4 hrs ago",
    priority: "Medium · 72%",
    verification: "Verified",
    assigned: "Shelter Team 1",
    age: "4h 15m",
    status: "Completed",
    organisation: "National Disaster Authority",
  },
];

const tabs = [
  { name: "All requests", count: "1,284" },
  { name: "Unassigned", count: "63" },
  { name: "Overdue", count: "12" },
  { name: "Potential duplicates", count: "9" },
];

export default function AssistanceRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState("All requests");
  const [search, setSearch] = useState("");
  const [crisisFilter, setCrisisFilter] = useState("All crisis events");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [organisationFilter, setOrganisationFilter] = useState("All organisations");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [newRequest, setNewRequest] = useState({
    category: "Emergency shelter",
    location: "",
    priority: "High · 91%",
    assigned: "Unassigned",
    organisation: "National Disaster Authority",
  });

  const pageSize = 5;

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch =
        `${request.id} ${request.category} ${request.location} ${request.assigned}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const priorityMatch =
        priorityFilter === "All priorities" ||
        request.priority.startsWith(priorityFilter);

      const categoryMatch =
        categoryFilter === "All categories" ||
        request.category === categoryFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        request.status === statusFilter;

      const organisationMatch =
        organisationFilter === "All organisations" ||
        request.organisation === organisationFilter;

      const tabMatch =
        activeTab === "All requests" ||
        (activeTab === "Unassigned" && request.assigned === "Unassigned") ||
        (activeTab === "Overdue" && request.status === "Escalated") ||
        (activeTab === "Potential duplicates" && request.id === "REQ-2836");

      return (
        searchMatch &&
        priorityMatch &&
        categoryMatch &&
        statusMatch &&
        organisationMatch &&
        tabMatch
      );
    });
  }, [
    requests,
    search,
    priorityFilter,
    categoryFilter,
    statusFilter,
    organisationFilter,
    activeTab,
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
    setCurrentPage(1);
  };

  const handleCreateRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const request: AssistanceRequest = {
      id: `REQ-${2842 + requests.length - initialRequests.length}`,
      category: newRequest.category,
      location: newRequest.location,
      reported: "Just now",
      priority: newRequest.priority,
      verification: "Pending verification",
      assigned: newRequest.assigned,
      age: "Just now",
      status: "Submitted",
      organisation: newRequest.organisation,
    };

    setRequests((prev) => [request, ...prev]);
    setShowCreateModal(false);
    setActiveTab("All requests");
    setCurrentPage(1);

    setNewRequest({
      category: "Emergency shelter",
      location: "",
      priority: "High · 91%",
      assigned: "Unassigned",
      organisation: "National Disaster Authority",
    });
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
    link.download = "carelink-assistance-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectClass =
    "min-w-0 w-full rounded-lg border border-[#d6e2e9] bg-white px-2.5 py-2.5 text-[9px] text-slate-700 outline-none focus:border-sky-500";

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-[#153f5e] sm:text-2xl">
            Assistance Requests
          </h1>

          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            Monitor verification, priority, assignment, and response status across active cases.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-800 hover:bg-sky-50"
          >
            <Download size={13} />
            Export
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-3 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1e668b]"
          >
            <Plus size={14} />
            Create request
          </button>
        </div>
      </div>

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

            <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[8px] text-slate-500">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-col gap-2 xl:flex-row">

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d6e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search request ID, category, or location..."
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
            onChange={(e) => setCrisisFilter(e.target.value)}
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
            <option>Under Review</option>
            <option>Assigned</option>
            <option>Submitted</option>
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
            <label className="flex items-center gap-1.5 text-[9px] text-slate-600">
              <input type="checkbox" className="accent-sky-700" />
              Verified only
            </label>

            <label className="flex items-center gap-1.5 text-[9px] text-slate-600">
              <input type="checkbox" className="accent-sky-700" />
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
              {paginatedRequests.map((request) => (
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
                      {request.priority.split(" · ")[0]}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px]">
                    {request.verification === "Verified" ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                        Verified
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        {request.verification}
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {request.assigned}
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
              ))}
            </tbody>

          </table>
        </div>

        {paginatedRequests.length === 0 && (
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
                  Register a new humanitarian assistance case.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Assistance category
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
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Location
                </span>
                <input
                  required
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  placeholder="Enter location"
                  className={selectClass}
                />
              </label>

              <label>
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
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
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Assignment
                </span>
                <select
                  value={newRequest.assigned}
                  onChange={(e) => setNewRequest({ ...newRequest, assigned: e.target.value })}
                  className={selectClass}
                >
                  <option>Unassigned</option>
                  <option>Medical Team 3</option>
                  <option>Mobility Team</option>
                  <option>Rescue Unit 2</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
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

            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1e668b]"
              >
                <Plus size={13} />
                Create request
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-sky-600">
                  REQUEST DETAILS
                </p>
                <h2 className="mt-1 text-base font-semibold text-sky-950">
                  {selectedRequest.id}
                </h2>
              </div>

              <button onClick={() => setSelectedRequest(null)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-sky-950">
                {selectedRequest.category}
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {selectedRequest.location}
              </p>
            </div>

            <div className="space-y-3">
              {[
                ["Reported", selectedRequest.reported],
                ["AI Priority", selectedRequest.priority],
                ["Verification", selectedRequest.verification],
                ["Assigned to", selectedRequest.assigned],
                ["Age", selectedRequest.age],
                ["Status", selectedRequest.status],
                ["Organisation", selectedRequest.organisation],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <span className="text-right text-[10px] font-medium text-sky-950">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-5 w-full rounded-lg bg-sky-950 py-2.5 text-[10px] font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
