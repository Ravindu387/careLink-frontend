
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  MapPin,
  UserRound,
  CalendarDays,
  ClipboardList,
  Settings,
} from "lucide-react";

/* ================= TYPES ================= */

type Priority = "Critical" | "High" | "Medium" | "Low";

type RequestStatus =
  | "In Progress"
  | "Assigned"
  | "Completed"
  | "Pending"
  | "On Hold";

type MaintenanceRequest = {
  id: string;
  issue: string;
  category: string;
  shelter: string;
  room: string;
  reported: string;
  priority: Priority;
  technician: string;
  status: RequestStatus;
  description: string;
};

/* ================= SAMPLE DATA ================= */

const initialRequests: MaintenanceRequest[] = [
  {
    id: "MR-341",
    issue: "Water pump pressure failure",
    category: "Plumbing",
    shelter: "St. Mary Civic",
    room: "Utility Room",
    reported: "22 Jun · 12:02",
    priority: "Critical",
    technician: "N. Kumara",
    status: "In Progress",
    description:
      "Water pump pressure has dropped significantly. The maintenance team needs to inspect the pump and restore normal water supply.",
  },
  {
    id: "MR-337",
    issue: "Lighting fault",
    category: "Electrical",
    shelter: "Riverton Central",
    room: "Corridor B",
    reported: "22 Jun · 08:42",
    priority: "Medium",
    technician: "D. Silva",
    status: "Assigned",
    description:
      "Several corridor lights are not functioning. Electrical inspection and replacement are required.",
  },
  {
    id: "MR-329",
    issue: "Blocked drainage",
    category: "Plumbing",
    shelter: "North Community",
    room: "Rear Yard",
    reported: "21 Jun · 14:18",
    priority: "High",
    technician: "M. Perera",
    status: "Completed",
    description:
      "Drainage blockage reported in the rear yard. Cleaning and inspection have been completed.",
  },
];

const categories = [
  "Plumbing",
  "Electrical",
  "Structural",
  "HVAC",
  "Cleaning",
  "Equipment",
  "Other",
];

const technicians = [
  "N. Kumara",
  "D. Silva",
  "M. Perera",
  "Facilities Team",
  "Maintenance Team",
  "Unassigned",
];

const shelters = [
  "St. Mary Civic",
  "Riverton Central",
  "North Community",
  "Lakeside Sports",
  "Hillview College",
];

const priorities: Priority[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const statuses: RequestStatus[] = [
  "In Progress",
  "Assigned",
  "Completed",
  "Pending",
  "On Hold",
];

/* ================= MAIN COMPONENT ================= */

export default function MaintenanceIncidentsPage() {
  const [requests, setRequests] =
    useState<MaintenanceRequest[]>(initialRequests);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All categories");
  const [priorityFilter, setPriorityFilter] =
    useState("All priorities");
  const [statusFilter, setStatusFilter] =
    useState("All statuses");
  const [technicianFilter, setTechnicianFilter] =
    useState("All technicians");
  const [shelterFilter, setShelterFilter] =
    useState("All shelters");

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    apiClient.get<any>("/maintenance-requests").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setRequests(
          items.map((r: any) => ({
            id: r.id || r.requestCode || "MR-300",
            issue: r.issue || r.title || "Maintenance issue",
            category: r.category || "Plumbing",
            shelter: r.shelter || r.shelterName || "Riverton Central",
            room: r.room || "General",
            reported: r.reported || "Today",
            priority: (r.priority as Priority) || "Medium",
            technician: r.technician || "Unassigned",
            status: (r.status as RequestStatus) || "Pending",
            description: r.description || "",
          }))
        );
      }
    }).catch(() => {});
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [newRequest, setNewRequest] = useState({
    issue: "",
    category: "Plumbing",
    shelter: "Riverton Central",
    room: "",
    priority: "Medium" as Priority,
    technician: "Unassigned",
    description: "",
  });

  /* ================= FILTER REQUESTS ================= */

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch = [
        request.id,
        request.issue,
        request.category,
        request.shelter,
        request.room,
        request.technician,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      return (
        searchMatch &&
        (categoryFilter === "All categories" ||
          request.category === categoryFilter) &&
        (priorityFilter === "All priorities" ||
          request.priority === priorityFilter) &&
        (statusFilter === "All statuses" ||
          request.status === statusFilter) &&
        (technicianFilter === "All technicians" ||
          request.technician === technicianFilter) &&
        (shelterFilter === "All shelters" ||
          request.shelter === shelterFilter)
      );
    });
  }, [
    requests,
    search,
    categoryFilter,
    priorityFilter,
    statusFilter,
    technicianFilter,
    shelterFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / pageSize)
  );

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ================= COUNTS ================= */

  const criticalCount = requests.filter(
    (r) => r.priority === "Critical" && r.status !== "Completed"
  ).length;

  const inProgressCount = requests.filter(
    (r) => r.status === "In Progress"
  ).length;

  const completedCount = requests.filter(
    (r) => r.status === "Completed"
  ).length;

  /* ================= RESET FILTERS ================= */

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All categories");
    setPriorityFilter("All priorities");
    setStatusFilter("All statuses");
    setTechnicianFilter("All technicians");
    setShelterFilter("All shelters");
    setCurrentPage(1);
  };

  /* ================= CREATE REQUEST ================= */

  const handleCreateRequest = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const nextNumber =
      Math.max(
        0,
        ...requests.map(
          (r) => Number(r.id.replace("MR-", "")) || 0
        )
      ) + 1;

    const request: MaintenanceRequest = {
      ...newRequest,
      id: `MR-${nextNumber}`,
      reported: `22 Jun · ${new Date().toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`,
      status: "Pending",
    };

    setRequests((prev) => [request, ...prev]);

    setNewRequest({
      issue: "",
      category: "Plumbing",
      shelter: "Riverton Central",
      room: "",
      priority: "Medium",
      technician: "Unassigned",
      description: "",
    });

    resetFilters();
    setShowCreateModal(false);
    setSuccessMessage(
      `${request.id} created successfully.`
    );
  };

  /* ================= UPDATE REQUEST ================= */

  const updateRequest = (
    id: string,
    changes: Partial<MaintenanceRequest>
  ) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? { ...request, ...changes }
          : request
      )
    );

    setSelectedRequest((prev) =>
      prev && prev.id === id
        ? { ...prev, ...changes }
        : prev
    );

    setSuccessMessage("Maintenance request updated.");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">
            Shelter Administration
          </span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">
            Maintenance & Incidents
          </span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Maintenance & Incidents
            </h1>

            <p className="text-[13px] text-slate-500 mt-2">
              Track facility faults, repairs, technicians, and resolution progress.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#144665]"
          >
            <Plus size={14} />
            Create request
          </button>
        </div>

        {/* SEARCH AND FILTERS */}

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
              placeholder="Search maintenance requests..."
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2">

            <FilterSelect
              value={categoryFilter}
              options={["All categories", ...categories]}
              onChange={(v) => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={priorityFilter}
              options={["All priorities", ...priorities]}
              onChange={(v) => {
                setPriorityFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={statusFilter}
              options={["All statuses", ...statuses]}
              onChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={technicianFilter}
              options={["All technicians", ...technicians]}
              onChange={(v) => {
                setTechnicianFilter(v);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap ${
                showFilters
                  ? "border-[#2785b7] text-[#2785b7]"
                  : "border-[#aac4d2]"
              }`}
            >
              <Filter size={13} />
              More filters
            </button>
          </div>
        </section>

        {/* ADVANCED FILTERS */}

        {showFilters && (
          <section className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3">

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold">
                Advanced filters
              </h3>

              <button
                onClick={resetFilters}
                className="text-sm text-[#267ca6] font-semibold"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <FilterSelect
                value={shelterFilter}
                options={["All shelters", ...shelters]}
                onChange={(v) => {
                  setShelterFilter(v);
                  setCurrentPage(1);
                }}
              />

              <p className="text-xs text-slate-400 self-center">
                Filter requests by the shelter where the fault was reported.
              </p>
            </div>
          </section>
        )}

        {/* MAINTENANCE REQUESTS TABLE */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

          {/* TABLE HEADER */}

          <div className="px-3.5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>
              <h2 className="text-base sm:text-lg font-semibold">
                Maintenance requests
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Sensitive information restricted to authorised staff
              </p>
            </div>

            <span className="px-2 py-1 rounded-md bg-[#eaf3f8] text-[#287da7] text-xs font-semibold w-fit">
              Authorised access
            </span>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="bg-[#f5f9fa] border-b border-slate-200">
                <tr className="text-sm text-slate-500">

                  <th className="px-3 py-3 font-medium">
                    Request ID
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Issue
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Shelter
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Room / Area
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Reported
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Priority
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Technician
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {paginatedRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-sm transition"
                  >

                    <td className="px-3 py-3.5 font-semibold whitespace-nowrap">
                      {request.id}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {request.issue}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {request.shelter}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {request.room}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {request.reported}
                    </td>

                    <td className="px-3 py-3.5">
                      <PriorityBadge priority={request.priority} />
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {request.technician}
                    </td>

                    <td className="px-3 py-3.5">
                      <StatusBadge status={request.status} />
                    </td>

                    <td className="px-3 py-3.5">
                      <ChevronRight
                        size={13}
                        className="text-slate-400"
                      />
                    </td>
                  </tr>
                ))}

                {paginatedRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-sm text-slate-400"
                    >
                      No maintenance requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="px-3.5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">

            <p className="text-xs text-slate-400">
              Showing {filteredRequests.length} records
            </p>

            <div className="flex items-center gap-1">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                className="h-8 px-3 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-8 rounded-lg border text-sm ${
                    currentPage === page
                      ? "bg-[#1c638a] text-white border-[#1c638a]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                className="h-8 px-3 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* REQUEST SUMMARY */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">

          <SummaryCard
            icon={<AlertTriangle size={17} />}
            title="Critical requests"
            value={criticalCount}
            color="red"
          />

          <SummaryCard
            icon={<Clock size={17} />}
            title="In progress"
            value={inProgressCount}
            color="orange"
          />

          <SummaryCard
            icon={<CheckCircle2 size={17} />}
            title="Completed"
            value={completedCount}
            color="green"
          />
        </section>
      </main>

      {/* CREATE REQUEST MODAL */}

      {showCreateModal && (
        <Modal
          title="Create maintenance request"
          subtitle="Report a facility fault or maintenance requirement."
          onClose={() => setShowCreateModal(false)}
        >
          <form
            onSubmit={handleCreateRequest}
            className="space-y-4"
          >

            <FormInput
              label="Issue title"
              placeholder="Example: Water pump failure"
              value={newRequest.issue}
              onChange={(v) =>
                setNewRequest({ ...newRequest, issue: v })
              }
            />

            <FormSelect
              label="Category"
              value={newRequest.category}
              options={categories.map((c) => ({
                value: c,
                label: c,
              }))}
              onChange={(v) =>
                setNewRequest({ ...newRequest, category: v })
              }
            />

            <FormSelect
              label="Shelter"
              value={newRequest.shelter}
              options={shelters.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewRequest({ ...newRequest, shelter: v })
              }
            />

            <FormInput
              label="Room / Area"
              placeholder="Example: Utility Room"
              value={newRequest.room}
              onChange={(v) =>
                setNewRequest({ ...newRequest, room: v })
              }
            />

            <FormSelect
              label="Priority"
              value={newRequest.priority}
              options={priorities.map((p) => ({
                value: p,
                label: p,
              }))}
              onChange={(v) =>
                setNewRequest({
                  ...newRequest,
                  priority: v as Priority,
                })
              }
            />

            <FormSelect
              label="Assign technician"
              value={newRequest.technician}
              options={technicians.map((t) => ({
                value: t,
                label: t,
              }))}
              onChange={(v) =>
                setNewRequest({ ...newRequest, technician: v })
              }
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Description
              </label>

              <textarea
                required
                rows={3}
                value={newRequest.description}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the issue and required repair..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#45b99b] resize-none"
              />
            </div>

            <ModalActions
              onCancel={() => setShowCreateModal(false)}
              submitLabel="Create request"
            />
          </form>
        </Modal>
      )}

      {/* REQUEST DETAILS PANEL */}

      {selectedRequest && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">

          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Request details
              </h2>

              <button onClick={() => setSelectedRequest(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">

              <div className="w-14 h-14 rounded-xl bg-[#eaf3f8] text-[#287da7] flex items-center justify-center">
                <Wrench size={25} />
              </div>

              <h3 className="text-lg font-semibold mt-4">
                {selectedRequest.issue}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {selectedRequest.id}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <PriorityBadge priority={selectedRequest.priority} />
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>

            <div className="mt-7 space-y-4">

              <DetailRow
                icon={<ClipboardList size={15} />}
                label="Category"
                value={selectedRequest.category}
              />

              <DetailRow
                icon={<MapPin size={15} />}
                label="Shelter"
                value={selectedRequest.shelter}
              />

              <DetailRow
                icon={<MapPin size={15} />}
                label="Room / Area"
                value={selectedRequest.room}
              />

              <DetailRow
                icon={<CalendarDays size={15} />}
                label="Reported"
                value={selectedRequest.reported}
              />

              <DetailRow
                icon={<UserRound size={15} />}
                label="Assigned technician"
                value={selectedRequest.technician}
              />
            </div>

            <div className="mt-7">
              <h3 className="text-base font-semibold mb-2">
                Description
              </h3>

              <p className="bg-[#f5f9fa] rounded-lg p-3 text-sm text-slate-600 leading-relaxed">
                {selectedRequest.description}
              </p>
            </div>

            <div className="mt-7 space-y-4">

              <h3 className="text-base font-semibold">
                Update request
              </h3>

              <FormSelect
                label="Assigned technician"
                value={selectedRequest.technician}
                options={technicians.map((t) => ({
                  value: t,
                  label: t,
                }))}
                onChange={(v) =>
                  updateRequest(selectedRequest.id, {
                    technician: v,
                  })
                }
              />

              <FormSelect
                label="Priority"
                value={selectedRequest.priority}
                options={priorities.map((p) => ({
                  value: p,
                  label: p,
                }))}
                onChange={(v) =>
                  updateRequest(selectedRequest.id, {
                    priority: v as Priority,
                  })
                }
              />

              <FormSelect
                label="Request status"
                value={selectedRequest.status}
                options={statuses.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  updateRequest(selectedRequest.id, {
                    status: v as RequestStatus,
                  })
                }
              />

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full bg-[#1c638a] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#144665]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">

          <CheckCircle2 size={17} className="shrink-0" />

          <p className="text-sm">{successMessage}</p>

          <button onClick={() => setSuccessMessage("")}>
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
        className="w-full xl:w-[120px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-sm sm:text-[15px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const styles: Record<Priority, string> = {
    Critical: "bg-[#fdebed] text-[#c82e3e]",
    High: "bg-[#fff0df] text-[#c47a1b]",
    Medium: "bg-[#edf1f3] text-[#4f6979]",
    Low: "bg-[#e5f8f1] text-[#218d70]",
  };

  return (
    <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-xs font-semibold ${styles[priority]}`}>
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
  const styles: Record<RequestStatus, string> = {
    "In Progress": "bg-[#edf1f3] text-[#4f6979]",
    Assigned: "bg-[#edf1f3] text-[#4f6979]",
    Completed: "bg-[#e5f8f1] text-[#218d70]",
    Pending: "bg-[#fff4df] text-[#a97a20]",
    "On Hold": "bg-[#fdebed] text-[#c82e3e]",
  };

  return (
    <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  color: "red" | "orange" | "green";
}) {
  const styles = {
    red: "bg-[#fdebed] text-[#d83d4b]",
    orange: "bg-[#fff4df] text-[#dc9a24]",
    green: "bg-[#e5f8f1] text-[#218d70]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <input
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
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
      <label className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
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

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[13px] text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-3">

      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-sm font-semibold hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#144665]"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">

      <div className="text-[#2785b7]">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
