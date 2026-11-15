import { useMemo, useState } from "react";
import type { ElementType } from "react";

import {
  Search,
  HelpCircle,
  ChevronRight,
  Activity,
  Clock,
  Check,
  AlertTriangle,
  Plus,
  Download,
  Filter,
  X,
  Users,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

// TYPES

type AssignmentStatus =
  | "Checked In"
  | "In Progress"
  | "Awaiting Acceptance"
  | "Completed";

interface Assignment {
  id: string;
  volunteer: string;
  task: string;
  location: string;
  schedule: string;
  status: AssignmentStatus;
  progress: number;
}

// DEMO DATA

const initialAssignments: Assignment[] = [
  {
    id: "ASN-4421",
    volunteer: "Elena Rossi",
    task: "Evacuation Support",
    location: "North Ward",
    schedule: "13:30–18:00",
    status: "Checked In",
    progress: 82,
  },
  {
    id: "ASN-4418",
    volunteer: "Lin Wei",
    task: "Clinic Support",
    location: "Central Clinic",
    schedule: "12:00–20:00",
    status: "In Progress",
    progress: 65,
  },
  {
    id: "ASN-4412",
    volunteer: "Daniel Okafor",
    task: "Supply Dispatch",
    location: "West Warehouse",
    schedule: "10:00–17:00",
    status: "In Progress",
    progress: 76,
  },
  {
    id: "ASN-4407",
    volunteer: "Musa Bello",
    task: "Rescue Vehicle Standby",
    location: "North Ward",
    schedule: "14:00–22:00",
    status: "Awaiting Acceptance",
    progress: 0,
  },
  {
    id: "ASN-4402",
    volunteer: "Sara Khan",
    task: "Shelter Support",
    location: "Central Ward",
    schedule: "09:00–16:00",
    status: "Checked In",
    progress: 55,
  },
  {
    id: "ASN-4398",
    volunteer: "Maya Fernando",
    task: "Medical Assistance",
    location: "Central Clinic",
    schedule: "08:00–16:00",
    status: "Completed",
    progress: 100,
  },
  {
    id: "ASN-4392",
    volunteer: "Theo Martin",
    task: "Rescue Operations",
    location: "West District",
    schedule: "11:00–19:00",
    status: "In Progress",
    progress: 45,
  },
  {
    id: "ASN-4387",
    volunteer: "Abdul Rahman",
    task: "Transport Support",
    location: "North Ward",
    schedule: "14:00–22:00",
    status: "Awaiting Acceptance",
    progress: 0,
  },
];

// STATUS COLORS

const statusStyles: Record<AssignmentStatus, string> = {
  "Checked In": "bg-[#e5f5ef] text-[#159879]",
  "In Progress": "bg-[#e8f1f6] text-[#287fa9]",
  "Awaiting Acceptance": "bg-[#fff3df] text-[#b87813]",
  Completed: "bg-[#e5f5ef] text-[#159879]",
};

// MAIN COMPONENT

export default function AssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All assignment states");

  const [taskFilter, setTaskFilter] =
    useState("All tasks");

  const [locationFilter, setLocationFilter] =
    useState("All locations");

  const [scheduleFilter, setScheduleFilter] =
    useState("Today");

  const [showMoreFilters, setShowMoreFilters] =
    useState(false);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [notification, setNotification] = useState("");

  const [newAssignment, setNewAssignment] = useState({
    volunteer: "",
    task: "",
    location: "",
    schedule: "",
  });

  const itemsPerPage = 4;

  // NOTIFICATION

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // STATISTICS

  const activeAssignments = assignments.filter(
    (a) => a.status !== "Completed"
  ).length;

  const awaitingAcceptance = assignments.filter(
    (a) => a.status === "Awaiting Acceptance"
  ).length;

  const checkedIn = assignments.filter(
    (a) => a.status === "Checked In"
  ).length;

  const replacementNeeded = 6;

  // FILTER ASSIGNMENTS

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const searchMatch = [
        item.id,
        item.volunteer,
        item.task,
        item.location,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "All assignment states" ||
        item.status === statusFilter;

      const taskMatch =
        taskFilter === "All tasks" ||
        item.task === taskFilter;

      const locationMatch =
        locationFilter === "All locations" ||
        item.location === locationFilter;

      const scheduleMatch =
        scheduleFilter === "Any schedule" ||
        scheduleFilter === "Today" ||
        item.schedule === scheduleFilter;

      return (
        searchMatch &&
        statusMatch &&
        taskMatch &&
        locationMatch &&
        scheduleMatch
      );
    });
  }, [
    assignments,
    search,
    statusFilter,
    taskFilter,
    locationFilter,
    scheduleFilter,
  ]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssignments.length / itemsPerPage)
  );

  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CREATE ASSIGNMENT

  const handleCreateAssignment = () => {
    if (
      !newAssignment.volunteer.trim() ||
      !newAssignment.task ||
      !newAssignment.location ||
      !newAssignment.schedule
    ) {
      notify("Please complete all assignment fields.");
      return;
    }

    const assignment: Assignment = {
      id: `ASN-${Date.now().toString().slice(-4)}`,
      volunteer: newAssignment.volunteer,
      task: newAssignment.task,
      location: newAssignment.location,
      schedule: newAssignment.schedule,
      status: "Awaiting Acceptance",
      progress: 0,
    };

    setAssignments((prev) => [assignment, ...prev]);

    setCurrentPage(1);

    setNewAssignment({
      volunteer: "",
      task: "",
      location: "",
      schedule: "",
    });

    setStatusFilter("All assignment states");
    setTaskFilter("All tasks");
    setLocationFilter("All locations");
    setScheduleFilter("Any schedule");
    setSearch("");

    setShowCreateModal(false);

    notify("Assignment created successfully!");
  };

  // CSV EXPORT

  const handleExport = () => {
    const headers = [
      "Assignment ID",
      "Volunteer",
      "Task",
      "Location",
      "Schedule",
      "Status",
      "Progress",
    ];

    const rows = filteredAssignments.map((item) => [
      item.id,
      item.volunteer,
      item.task,
      item.location,
      item.schedule,
      item.status,
      `${item.progress}%`,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "carelink-assignments.csv";

    link.click();

    URL.revokeObjectURL(url);

    notify("Assignments exported successfully!");
  };

  // STAT CARD

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: ElementType;
    color: string;
  }) => (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-3.5 shadow-[0_5px_15px_rgba(30,70,90,0.05)] flex items-center gap-3 min-h-[77px]">

      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={17} />
      </div>

      <div>

        <p className="text-[9px] text-[#8296aa]">
          {title}
        </p>

        <h2 className="text-[22px] leading-7 font-semibold text-[#123c5b]">
          {value}
        </h2>

        <p className="text-[8px] text-[#8296aa]">
          {description}
        </p>

      </div>

    </div>
  );

  return (
    <div className="w-full min-h-full bg-[#eff6f8] text-[#123c5b]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-7">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            Assignments
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

          <div>

            <h1 className="text-[25px] font-normal">
              Assignments
            </h1>

            <p className="text-[11px] text-[#718ba0] mt-2">
              Track invitations, acceptance, check-in, progress, and completion.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={handleExport}
              className="h-[36px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-[9px] text-[#17648e] flex items-center gap-2 hover:bg-[#f5fafc]"
            >
              <Download size={13} />
              Export
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[36px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[9px] font-semibold"
            >
              <Plus size={15} />
              Create assignment
            </button>

          </div>

        </div>

        {/* STATISTICS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

          <StatCard
            title="Active assignments"
            value={387 + assignments.length - initialAssignments.length}
            description="Across 64 tasks"
            icon={Activity}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Awaiting acceptance"
            value={28 + Math.max(0, awaitingAcceptance - 2)}
            description="12 expire within 2 hours"
            icon={Clock}
            color="bg-[#fff3df] text-[#c17b08]"
          />

          <StatCard
            title="Checked in"
            value={294 + Math.max(0, checkedIn - 2)}
            description="76% of active"
            icon={Check}
            color="bg-[#e5f5ef] text-[#239879]"
          />

          <StatCard
            title="Replacement needed"
            value={replacementNeeded}
            description="Urgent coordinator action"
            icon={AlertTriangle}
            color="bg-[#fdebec] text-[#dc3545]"
          />

        </section>

        {/* FILTERS */}

        <section className="mb-3">

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[2.2fr_1fr_0.9fr_0.9fr_0.7fr_auto] gap-2">

            {/* SEARCH */}

            <div className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 flex items-center gap-2">

              <Search size={15} className="text-[#8296aa]" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search assignment, volunteer, or task..."
                className="w-full text-[9px] outline-none bg-transparent"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none"
            >
              <option>All assignment states</option>
              <option>Checked In</option>
              <option>In Progress</option>
              <option>Awaiting Acceptance</option>
              <option>Completed</option>
            </select>

            {/* TASK */}

            <select
              value={taskFilter}
              onChange={(e) => {
                setTaskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none"
            >
              <option>All tasks</option>
              {[...new Set(assignments.map((a) => a.task))].map(
                (task) => (
                  <option key={task}>{task}</option>
                )
              )}
            </select>

            {/* LOCATION */}

            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none"
            >
              <option>All locations</option>
              {[...new Set(assignments.map((a) => a.location))].map(
                (location) => (
                  <option key={location}>{location}</option>
                )
              )}
            </select>

            {/* SCHEDULE */}

            <select
              value={scheduleFilter}
              onChange={(e) => {
                setScheduleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none"
            >
              <option>Today</option>
              <option>Any schedule</option>
            </select>

            {/* MORE FILTERS */}

            <button
              onClick={() =>
                setShowMoreFilters(!showMoreFilters)
              }
              className={`h-[36px] px-3 border rounded-lg text-[9px] flex items-center justify-center gap-2 ${
                showMoreFilters
                  ? "bg-[#e8f1f6] border-[#287fa9] text-[#17648e]"
                  : "bg-white border-[#b9d0dc] text-[#17648e]"
              }`}
            >
              <Filter size={12} />
              More filters
            </button>

          </div>

          {/* EXTRA FILTERS */}

          {showMoreFilters && (

            <div className="mt-2 bg-white border border-[#d5e3e9] rounded-lg p-4 flex flex-wrap items-center gap-4">

              <div>

                <p className="text-[9px] text-[#8296aa] mb-2">
                  Progress
                </p>

                <select
                  className="h-[34px] border border-[#d5e3e9] rounded-lg px-3 text-[9px] outline-none"
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "All") return;

                    setSearch(value);
                  }}
                >
                  <option value="All">All progress</option>
                  <option value="0">Not started</option>
                  <option value="100">Completed</option>
                </select>

              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All assignment states");
                  setTaskFilter("All tasks");
                  setLocationFilter("All locations");
                  setScheduleFilter("Today");
                  setCurrentPage(1);
                }}
                className="mt-4 text-[9px] text-[#287fa9] underline"
              >
                Reset filters
              </button>

            </div>

          )}

        </section>

        {/* ASSIGNMENT TABLE */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left">

              <thead>

                <tr className="bg-[#f5f8f9] border-b border-[#d5e3e9]">

                  {[
                    "Assignment ID",
                    "Volunteer",
                    "Task",
                    "Location",
                    "Schedule",
                    "Status",
                    "Progress",
                    "",
                  ].map((heading) => (

                    <th
                      key={heading}
                      className="px-3 py-3 text-[8px] font-medium text-[#718ba0] whitespace-nowrap"
                    >
                      {heading}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {paginatedAssignments.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b border-[#e5edf1] hover:bg-[#f7fafb] transition-colors"
                  >

                    <td className="px-3 py-3.5 text-[9px] font-semibold whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="px-3 py-3.5 text-[9px] whitespace-nowrap">
                      {item.volunteer}
                    </td>

                    <td className="px-3 py-3.5 text-[9px] whitespace-nowrap">
                      {item.task}
                    </td>

                    <td className="px-3 py-3.5 text-[9px] whitespace-nowrap">
                      {item.location}
                    </td>

                    <td className="px-3 py-3.5 text-[9px] whitespace-nowrap">
                      {item.schedule}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">

                      <span
                        className={`inline-flex px-2 py-1 rounded-md text-[8px] font-semibold ${
                          statusStyles[item.status]
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="px-3 py-3.5">

                      <span className="inline-flex bg-[#e8f1f6] text-[#287fa9] px-2 py-1 rounded-md text-[8px] font-semibold">
                        {item.progress}%
                      </span>

                    </td>

                    <td className="px-3 py-3.5">

                      <button
                        onClick={() =>
                          setSelectedAssignment(item)
                        }
                        className="p-1 hover:bg-[#e8f1f6] rounded"
                      >
                        <ChevronRight
                          size={15}
                          className="text-[#718ba0]"
                        />
                      </button>

                    </td>

                  </tr>

                ))}

                {paginatedAssignments.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="text-center py-12"
                    >

                      <ClipboardList
                        size={30}
                        className="mx-auto text-[#9aafbd] mb-3"
                      />

                      <p className="text-[11px] font-medium">
                        No assignments found
                      </p>

                      <p className="text-[9px] text-[#8296aa] mt-1">
                        Try changing your search or filters.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="px-3 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-[8px] text-[#8296aa]">

              Showing{" "}

              {filteredAssignments.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}

              –

              {Math.min(
                currentPage * itemsPerPage,
                filteredAssignments.length
              )}

              {" "}of {filteredAssignments.length}

            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => p - 1)
                }
                className="h-[30px] px-3 border border-[#d5e3e9] rounded-lg text-[8px] disabled:opacity-40"
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
                  className={`w-[29px] h-[29px] rounded-md border text-[9px] ${
                    currentPage === page
                      ? "bg-[#287fa9] text-white border-[#287fa9]"
                      : "bg-white border-[#d5e3e9] hover:bg-[#f1f8fc]"
                  }`}
                >
                  {page}
                </button>

              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => p + 1)
                }
                className="h-[30px] px-3 border border-[#b9d0dc] rounded-lg text-[8px] text-[#17648e] disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* CREATE ASSIGNMENT MODAL */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[15px] font-semibold">
                  Create assignment
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  Assign a volunteer to an operational task.
                </p>

              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={17} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              {/* VOLUNTEER */}

              <div>

                <label className="block text-[9px] font-medium mb-2">
                  Volunteer name
                </label>

                <input
                  value={newAssignment.volunteer}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      volunteer: e.target.value,
                    }))
                  }
                  placeholder="Enter volunteer name"
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none focus:border-[#287fa9]"
                />

              </div>

              {/* TASK */}

              <div>

                <label className="block text-[9px] font-medium mb-2">
                  Task
                </label>

                <select
                  value={newAssignment.task}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      task: e.target.value,
                    }))
                  }
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none bg-white"
                >

                  <option value="">Select task</option>

                  <option>Evacuation Support</option>
                  <option>Clinic Support</option>
                  <option>Supply Dispatch</option>
                  <option>Rescue Vehicle Standby</option>
                  <option>Shelter Support</option>
                  <option>Medical Assistance</option>
                  <option>Transport Support</option>

                </select>

              </div>

              {/* LOCATION */}

              <div>

                <label className="block text-[9px] font-medium mb-2">
                  Location
                </label>

                <select
                  value={newAssignment.location}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none bg-white"
                >

                  <option value="">Select location</option>
                  <option>North Ward</option>
                  <option>Central Clinic</option>
                  <option>Central Ward</option>
                  <option>West Warehouse</option>
                  <option>West District</option>
                  <option>Eastbank</option>

                </select>

              </div>

              {/* SCHEDULE */}

              <div>

                <label className="block text-[9px] font-medium mb-2">
                  Schedule
                </label>

                <input
                  type="text"
                  value={newAssignment.schedule}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      schedule: e.target.value,
                    }))
                  }
                  placeholder="e.g. 14:00–20:00"
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none focus:border-[#287fa9]"
                />

              </div>

              <div className="bg-[#eaf5f9] p-3 rounded-lg flex gap-2">

                <CheckCircle2
                  size={15}
                  className="text-[#287fa9] shrink-0"
                />

                <p className="text-[9px] text-[#527d96] leading-4">
                  The volunteer will receive an assignment invitation.
                  The assignment remains pending until accepted.
                </p>

              </div>

            </div>

            <div className="p-4 border-t flex justify-end gap-2">

              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-[#d5e3e9] rounded-lg text-[10px]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateAssignment}
                className="px-5 py-2.5 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2"
              >
                <Plus size={13} />
                Create assignment
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ASSIGNMENT DETAILS MODAL */}

      {selectedAssignment && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[440px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[15px] font-semibold">
                  Assignment details
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  {selectedAssignment.id}
                </p>

              </div>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={17} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-[9px] text-[#8296aa]">
                  Assignment status
                </span>

                <span
                  className={`px-2 py-1 rounded-md text-[8px] font-semibold ${
                    statusStyles[selectedAssignment.status]
                  }`}
                >
                  {selectedAssignment.status}
                </span>

              </div>

              {[
                {
                  icon: User,
                  label: "Volunteer",
                  value: selectedAssignment.volunteer,
                },
                {
                  icon: ClipboardList,
                  label: "Task",
                  value: selectedAssignment.task,
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: selectedAssignment.location,
                },
                {
                  icon: Calendar,
                  label: "Schedule",
                  value: selectedAssignment.schedule,
                },
              ].map((item) => {

                const Icon = item.icon;

                return (

                  <div
                    key={item.label}
                    className="flex items-center gap-3 bg-[#f5f9fb] rounded-lg p-3"
                  >

                    <Icon
                      size={16}
                      className="text-[#287fa9]"
                    />

                    <div>

                      <p className="text-[8px] text-[#8296aa]">
                        {item.label}
                      </p>

                      <p className="text-[10px] font-medium mt-1">
                        {item.value}
                      </p>

                    </div>

                  </div>

                );

              })}

              {/* PROGRESS */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-[9px] text-[#8296aa]">
                    Assignment progress
                  </span>

                  <span className="text-[10px] font-semibold">
                    {selectedAssignment.progress}%
                  </span>

                </div>

                <div className="h-2 bg-[#e8eef1] rounded-full overflow-hidden">

                  <div
                    className="h-full bg-[#65bda5] rounded-full"
                    style={{
                      width: `${selectedAssignment.progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="p-4 border-t flex justify-end">

              <button
                onClick={() => setSelectedAssignment(null)}
                className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-[10px]"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* TOAST */}

      {notification && (

        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2">

          <Check size={15} />

          {notification}

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg">

        <HelpCircle size={21} />

      </button>

    </div>
  );
}