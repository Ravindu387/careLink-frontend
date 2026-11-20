import { useState, useEffect, useCallback } from "react";
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
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  ClipboardList,
  Server,
  RefreshCw,
} from "lucide-react";

import { assignmentsService } from "../../services/assignmentsService";
import type {
  Assignment,
  AssignmentStatus,
  AssignmentsStatsDto,
} from "../../types/assignments";

// STATUS COLORS
const statusStyles: Record<AssignmentStatus, string> = {
  "Checked In": "bg-[#e5f5ef] text-[#159879]",
  "In Progress": "bg-[#e8f1f6] text-[#287fa9]",
  "Awaiting Acceptance": "bg-[#fff3df] text-[#b87813]",
  Completed: "bg-[#e5f5ef] text-[#159879]",
};

export default function AssignmentsPage() {
  // Sync and connection state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Stats
  const [stats, setStats] = useState<AssignmentsStatsDto>({
    activeAssignments: 387,
    awaitingAcceptance: 28,
    checkedIn: 294,
    replacementNeeded: 6,
    tasksCount: 64,
    expiringSoonAlert: "12 expire within 2 hours",
    checkedInRate: "76% of active",
  });

  // Table items & pagination
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Filter options
  const [availableTasks, setAvailableTasks] = useState<string[]>([
    "Evacuation Support",
    "Clinic Support",
    "Supply Dispatch",
    "Rescue Vehicle Standby",
    "Shelter Support",
    "Medical Assistance",
    "Transport Support",
  ]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([
    "North Ward",
    "Central Clinic",
    "Central Ward",
    "West Warehouse",
    "West District",
    "Eastbank",
  ]);

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All assignment states");
  const [taskFilter, setTaskFilter] = useState<string>("All tasks");
  const [locationFilter, setLocationFilter] = useState<string>("All locations");
  const [scheduleFilter, setScheduleFilter] = useState<string>("Today");
  const [progressFilter, setProgressFilter] = useState<string>("All");
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [newAssignment, setNewAssignment] = useState({
    volunteer: "",
    task: "",
    location: "",
    schedule: "",
  });

  // NOTIFICATION
  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // LOAD DATA
  const loadData = useCallback(async (page: number = 1) => {
    try {
      const parsedProgress =
        progressFilter === "0" ? 0 : progressFilter === "100" ? 100 : undefined;

      const [statsRes, assignmentsRes, optionsRes] = await Promise.all([
        assignmentsService.getStats(),
        assignmentsService.getAssignments({
          search,
          status: statusFilter,
          task: taskFilter,
          location: locationFilter,
          schedule: scheduleFilter,
          progress: parsedProgress,
          pageNumber: page,
          pageSize: itemsPerPage,
        }),
        assignmentsService.getOptions(),
      ]);

      setIsLiveBackend(statsRes.isLiveBackend || assignmentsRes.isLiveBackend);
      setStats(statsRes.data);
      setAssignments(assignmentsRes.data.items);
      setTotalCount(assignmentsRes.data.totalCount);

      if (optionsRes.tasks.length > 0) setAvailableTasks(optionsRes.tasks);
      if (optionsRes.locations.length > 0) setAvailableLocations(optionsRes.locations);
    } catch (err) {
      console.error("Failed to load assignments", err);
      notify("Notice: Using offline demonstration dataset.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    search,
    statusFilter,
    taskFilter,
    locationFilter,
    scheduleFilter,
    progressFilter,
    itemsPerPage,
  ]);

  useEffect(() => {
    loadData(currentPage);
  }, [loadData, currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentPage);
    notify("Assignments updated successfully.");
  };

  // CREATE ASSIGNMENT
  const handleCreateAssignment = async () => {
    if (
      !newAssignment.volunteer.trim() ||
      !newAssignment.task ||
      !newAssignment.location ||
      !newAssignment.schedule
    ) {
      notify("Please complete all assignment fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignmentsService.createAssignment({
        volunteer: newAssignment.volunteer.trim(),
        task: newAssignment.task,
        location: newAssignment.location,
        schedule: newAssignment.schedule.trim(),
      });

      setNewAssignment({
        volunteer: "",
        task: "",
        location: "",
        schedule: "",
      });

      setStatusFilter("All assignment states");
      setTaskFilter("All tasks");
      setLocationFilter("All locations");
      setScheduleFilter("Today");
      setSearch("");
      setShowCreateModal(false);
      setCurrentPage(1);

      notify("Assignment created successfully!");
      await loadData(1);
    } catch (err) {
      console.error(err);
      notify("Failed to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE STATUS DIRECTLY IN DETAILS MODAL
  const handleUpdateStatus = async (newStatus: AssignmentStatus) => {
    if (!selectedAssignment) return;
    try {
      const updated = await assignmentsService.updateAssignment(selectedAssignment.id, {
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : selectedAssignment.progress,
      });

      if (updated) {
        setSelectedAssignment(updated);
        notify(`Assignment updated to ${newStatus}.`);
        await loadData(currentPage);
      }
    } catch (err) {
      console.error(err);
      notify("Failed to update assignment.");
    }
  };

  // CSV EXPORT
  const handleExport = async () => {
    try {
      const parsedProgress =
        progressFilter === "0" ? 0 : progressFilter === "100" ? 100 : undefined;

      const blob = await assignmentsService.exportCsv({
        search,
        status: statusFilter,
        task: taskFilter,
        location: locationFilter,
        schedule: scheduleFilter,
        progress: parsedProgress,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carelink-assignments-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      notify("Assignments exported successfully!");
    } catch (err) {
      console.error(err);
      notify("Failed to export assignments.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

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
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-3.5 shadow-xs flex items-center gap-3 min-h-[77px]">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={17} />
      </div>

      <div>
        <p className="text-[9px] text-[#8296aa]">{title}</p>
        <h2 className="text-[22px] leading-7 font-semibold text-[#123c5b]">{value}</h2>
        <p className="text-[8px] text-[#8296aa]">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-full bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
        {/* BREADCRUMB & STATUS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] mb-6">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#123c5b]">Assignments</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
                isLiveBackend
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Server size={12} />
              <span>{isLiveBackend ? "Live Server (API)" : "Offline Demo"}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh queue"
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-1 text-[10px] text-slate-700 hover:bg-[#f5fafc] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-[#287fa9]" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[25px] font-normal text-[#173e5b]">Assignments</h1>
            <p className="text-[11px] text-[#718ba0] mt-1.5">
              Track invitations, acceptance, check-in, progress, and completion.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="h-[36px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] flex items-center gap-1.5 hover:bg-[#f5fafc] shadow-xs"
            >
              <Download size={13} />
              <span>Export</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[36px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-1.5 text-[10px] font-semibold shadow-xs"
            >
              <Plus size={14} />
              <span>Create assignment</span>
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <StatCard
            title="Active assignments"
            value={stats.activeAssignments}
            description={`Across ${stats.tasksCount} tasks`}
            icon={Activity}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Awaiting acceptance"
            value={stats.awaitingAcceptance}
            description={stats.expiringSoonAlert}
            icon={Clock}
            color="bg-[#fff3df] text-[#c17b08]"
          />

          <StatCard
            title="Checked in"
            value={stats.checkedIn}
            description={stats.checkedInRate}
            icon={Check}
            color="bg-[#e5f5ef] text-[#239879]"
          />

          <StatCard
            title="Replacement needed"
            value={stats.replacementNeeded}
            description="Urgent coordinator action"
            icon={AlertTriangle}
            color="bg-[#fdebec] text-[#dc3545]"
          />
        </section>

        {/* FILTERS */}
        <section className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[2.2fr_1fr_0.9fr_0.9fr_0.7fr_auto] gap-2">
            {/* SEARCH */}
            <div className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 flex items-center gap-2 shadow-xs">
              <Search size={14} className="text-[#8296aa]" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search assignment, volunteer, or task..."
                className="w-full text-[10px] outline-none bg-transparent placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={12} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] text-slate-700 outline-none shadow-xs"
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
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] text-slate-700 outline-none shadow-xs"
            >
              <option>All tasks</option>
              {availableTasks.map((task) => (
                <option key={task} value={task}>
                  {task}
                </option>
              ))}
            </select>

            {/* LOCATION */}
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] text-slate-700 outline-none shadow-xs"
            >
              <option>All locations</option>
              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* SCHEDULE */}
            <select
              value={scheduleFilter}
              onChange={(e) => {
                setScheduleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] text-slate-700 outline-none shadow-xs"
            >
              <option>Today</option>
              <option>Any schedule</option>
            </select>

            {/* MORE FILTERS */}
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`h-[36px] px-3.5 border rounded-lg text-[10px] flex items-center justify-center gap-1.5 shadow-xs transition ${
                showMoreFilters
                  ? "bg-[#e8f1f6] border-[#287fa9] text-[#17648e] font-semibold"
                  : "bg-white border-[#b9d0dc] text-[#17648e] hover:bg-sky-50"
              }`}
            >
              <Filter size={12} />
              <span>More filters</span>
            </button>
          </div>

          {/* EXTRA FILTERS */}
          {showMoreFilters && (
            <div className="mt-2.5 bg-white border border-[#d5e3e9] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-slate-600">
                  Progress Range:
                </span>
                <select
                  value={progressFilter}
                  onChange={(e) => {
                    setProgressFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[32px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none bg-white text-slate-700"
                >
                  <option value="All">All progress levels</option>
                  <option value="0">Not started (0%)</option>
                  <option value="100">Fully completed (100%)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All assignment states");
                  setTaskFilter("All tasks");
                  setLocationFilter("All locations");
                  setScheduleFilter("Today");
                  setProgressFilter("All");
                  setCurrentPage(1);
                  notify("Filters reset to default.");
                }}
                className="text-[10px] text-[#287fa9] font-semibold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </section>

        {/* ASSIGNMENT TABLE */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden">
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
                      className="px-4 py-3.5 text-[9px] font-semibold text-[#718ba0] uppercase tracking-wider whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5edf1]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-xs text-slate-400">
                      <RefreshCw size={18} className="mx-auto mb-2 animate-spin text-[#287fa9]" />
                      Loading assignments...
                    </td>
                  </tr>
                ) : assignments.length > 0 ? (
                  assignments.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f7fafb] transition-colors"
                    >
                      <td className="px-4 py-3.5 text-[10px] font-bold text-[#173e5b] whitespace-nowrap">
                        <button
                          onClick={() => setSelectedAssignment(item)}
                          className="hover:text-[#287fa9] hover:underline"
                        >
                          {item.id}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-[11px] font-medium text-slate-700 whitespace-nowrap">
                        {item.volunteer}
                      </td>

                      <td className="px-4 py-3.5 text-[10px] whitespace-nowrap text-slate-600">
                        {item.task}
                      </td>

                      <td className="px-4 py-3.5 text-[10px] whitespace-nowrap text-slate-600">
                        {item.location}
                      </td>

                      <td className="px-4 py-3.5 text-[10px] whitespace-nowrap text-slate-600">
                        {item.schedule}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 rounded-md text-[9px] font-semibold ${
                            statusStyles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex bg-[#e8f1f6] text-[#287fa9] px-2 py-0.5 rounded-md text-[9px] font-semibold">
                          {item.progress}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedAssignment(item)}
                          className="p-1 hover:bg-[#e8f1f6] rounded text-[#718ba0] hover:text-[#287fa9]"
                          title="View assignment details"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <ClipboardList size={28} className="mx-auto text-[#9aafbd] mb-2" />
                      <p className="text-[11px] font-medium text-slate-700">No assignments found</p>
                      <p className="text-[9px] text-[#8296aa] mt-0.5">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#d5e3e9] bg-slate-50/50">
            <p className="text-[10px] text-[#8296aa]">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              {" "}–{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} assignments
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-[30px] px-3 border border-[#d5e3e9] bg-white rounded-lg text-[9px] text-slate-700 disabled:opacity-40 hover:bg-sky-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[29px] h-[29px] rounded-md border text-[9px] transition ${
                    currentPage === page
                      ? "bg-[#287fa9] text-white border-[#287fa9] font-semibold"
                      : "bg-white border-[#d5e3e9] text-slate-700 hover:bg-[#f1f8fc]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-[30px] px-3 border border-[#b9d0dc] bg-white rounded-lg text-[9px] text-[#17648e] disabled:opacity-40 hover:bg-sky-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-[15px] font-bold text-[#173e5b]">Create Assignment</h2>
                <p className="text-[10px] text-[#8296aa] mt-0.5">
                  Assign a volunteer to an operational task.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-200 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* VOLUNTEER */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1.5">
                  Volunteer Name
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
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[11px] outline-none focus:border-[#287fa9]"
                />
              </div>

              {/* TASK */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1.5">
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
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[11px] outline-none bg-white text-slate-700"
                >
                  <option value="">Select task</option>
                  {availableTasks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* LOCATION */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1.5">
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
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[11px] outline-none bg-white text-slate-700"
                >
                  <option value="">Select location</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* SCHEDULE */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1.5">
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
                  className="w-full h-[38px] border border-[#d5e3e9] rounded-lg px-3 text-[11px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div className="bg-[#eaf5f9] p-3 rounded-lg flex gap-2.5 border border-sky-100">
                <CheckCircle2 size={16} className="text-[#287fa9] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#527d96] leading-relaxed">
                  The volunteer will receive an assignment invitation. The assignment remains
                  pending until accepted.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-[#d5e3e9] rounded-lg text-[10px] text-slate-600 hover:bg-white"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateAssignment}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Plus size={14} />
                <span>Create assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENT DETAILS MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[440px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-[15px] font-bold text-[#173e5b]">Assignment Details</h2>
                <p className="text-[10px] text-[#8296aa] mt-0.5">{selectedAssignment.id}</p>
              </div>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 hover:bg-gray-200 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8296aa] font-medium">Assignment Status</span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[9px] font-semibold ${
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
                    className="flex items-center gap-3 bg-[#f5f9fb] rounded-lg p-3 border border-slate-100"
                  >
                    <Icon size={16} className="text-[#287fa9]" />
                    <div>
                      <p className="text-[8px] text-[#8296aa] uppercase font-semibold">{item.label}</p>
                      <p className="text-[11px] font-medium text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                );
              })}

              {/* PROGRESS */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-[#8296aa] font-medium">Assignment Progress</span>
                  <span className="text-[11px] font-bold text-[#173e5b]">{selectedAssignment.progress}%</span>
                </div>
                <div className="h-2 bg-[#e8eef1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#65bda5] rounded-full transition-all duration-300"
                    style={{ width: `${selectedAssignment.progress}%` }}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-wrap gap-2">
                {selectedAssignment.status !== "Completed" && (
                  <button
                    onClick={() => handleUpdateStatus("Completed")}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    Mark Completed
                  </button>
                )}
                {selectedAssignment.status === "Awaiting Acceptance" && (
                  <button
                    onClick={() => handleUpdateStatus("Checked In")}
                    className="flex-1 rounded-lg bg-[#287fa9] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[#17678e] transition"
                  >
                    Check In Volunteer
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="bg-[#287fa9] text-white rounded-lg px-5 py-2 text-[10px] font-semibold hover:bg-[#17678e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-xl px-5 py-3 shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* HELP BUTTON */}
      <button
        onClick={() => notify("Assignments Help: Track and schedule field volunteer assignments.")}
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#173e5b] hover:bg-[#205175] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        title="Help & Info"
      >
        <HelpCircle size={18} />
      </button>
    </div>
  );
}
