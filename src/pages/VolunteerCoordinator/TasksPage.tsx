import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import {
  Search,
  ChevronRight,
  Plus,
  Download,
  X,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  Server,
  RefreshCw,
  AlertTriangle,
  Trash2,
  UserPlus,
  UserMinus,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { volunteerTasksService } from "../../services/volunteerTasksService";
import type {
  VolunteerTaskItem,
  Priority,
  TaskStatus,
  VolunteerTaskTabsCount,
} from "../../types/volunteerTasks";

const defaultTabs = [
  { label: "All tasks", count: 0 },
  { label: "Open", count: 0 },
  { label: "Assigned", count: 0 },
  { label: "In progress", count: 0 },
  { label: "Completed", count: 0 },
];

export default function TasksPage() {
  // Sync and backend status
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Data state
  const [tasks, setTasks] = useState<VolunteerTaskItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [tabCounts, setTabCounts] = useState<VolunteerTaskTabsCount>({
    allTasks: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  // Dynamic filter options
  const [locations, setLocations] = useState<string[]>([
    "North Ward",
    "Central Clinic",
    "Eastbank Hub",
    "Riverton School",
    "Remote",
    "Central Ward",
    "West District",
  ]);

  const [skillGroups, setSkillGroups] = useState<string[]>([
    "Driving",
    "Rescue",
    "First Aid",
    "Admin",
    "Logistics",
    "Childcare",
    "Translation",
    "Medical",
  ]);

  // Filters
  const [activeTab, setActiveTab] = useState<string>("All tasks");
  const [search, setSearch] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All priorities");
  const [locationFilter, setLocationFilter] = useState<string>("All locations");
  const [skillFilter, setSkillFilter] = useState<string>("All skill groups");
  const [scheduleFilter, setScheduleFilter] = useState<string>("Any schedule");
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<VolunteerTaskItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    location: "",
    skills: "",
    priority: "Medium" as Priority,
    date: "",
    time: "",
    volunteers: "3",
  });

  // Notifications helper
  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // Fetch tasks
  const loadTasks = useCallback(
    async (page: number = currentPage, background: boolean = false) => {
      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await volunteerTasksService.getTasks({
          tab: activeTab,
          search: search.trim() || undefined,
          priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
          location: locationFilter !== "All locations" ? locationFilter : undefined,
          skill: skillFilter !== "All skill groups" ? skillFilter : undefined,
          schedule: scheduleFilter !== "Any schedule" ? scheduleFilter : undefined,
          pageNumber: page,
          pageSize,
        });

        const overview = result.data;
        setTasks(overview.tasks || []);
        setTotalCount(overview.totalCount ?? 0);
        setTotalPages(Math.max(1, overview.totalPages ?? 1));
        setCurrentPage(overview.pageNumber || page);

        if (overview.tabCounts) {
          setTabCounts(overview.tabCounts);
        }

        if (overview.locations && overview.locations.length > 0) {
          setLocations((prev) => Array.from(new Set([...prev, ...overview.locations])));
        }

        if (overview.skillGroups && overview.skillGroups.length > 0) {
          setSkillGroups((prev) => Array.from(new Set([...prev, ...overview.skillGroups])));
        }

        setIsLiveBackend(result.isLiveBackend);
      } catch (err: unknown) {
        console.error("Failed to load tasks:", err);
        notify("Could not load tasks from backend, using fallback data.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, search, priorityFilter, locationFilter, skillFilter, scheduleFilter, currentPage]
  );

  // Initial load and filter change trigger
  useEffect(() => {
    loadTasks(currentPage);
  }, [loadTasks, currentPage]);

  const handleRefresh = () => {
    loadTasks(currentPage, true);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setPriorityFilter("All priorities");
    setLocationFilter("All locations");
    setSkillFilter("All skill groups");
    setScheduleFilter("Any schedule");
    setActiveTab("All tasks");
    setCurrentPage(1);
  };

  // Create Task
  const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.location.trim()) {
      notify("Please provide task title and location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = newTask.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await volunteerTasksService.createTask({
        title: newTask.title.trim(),
        location: newTask.location.trim(),
        skills: skillsArray.length > 0 ? skillsArray : ["General Support"],
        priority: newTask.priority,
        date: newTask.date,
        time: newTask.time,
        volunteers: Number(newTask.volunteers) || 1,
      });

      setIsLiveBackend(result.isLiveBackend);
      notify("New task created successfully!");

      setShowCreateModal(false);
      setNewTask({
        title: "",
        location: "",
        skills: "",
        priority: "Medium",
        date: "",
        time: "",
        volunteers: "3",
      });

      // Reload tasks on first page
      setCurrentPage(1);
      loadTasks(1, true);
    } catch (err: unknown) {
      console.error("Create task failed:", err);
      notify("Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const blob = await volunteerTasksService.exportTasksCsv({
        tab: activeTab,
        search: search.trim() || undefined,
        priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
        location: locationFilter !== "All locations" ? locationFilter : undefined,
        skill: skillFilter !== "All skill groups" ? skillFilter : undefined,
        schedule: scheduleFilter !== "Any schedule" ? scheduleFilter : undefined,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `volunteer-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      notify("Tasks exported successfully!");
    } catch (err: unknown) {
      console.error("Export tasks failed:", err);
      notify("Failed to export tasks CSV.");
    }
  };

  // Update Status
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setIsUpdatingStatus(true);
    try {
      const result = await volunteerTasksService.updateTaskStatus(taskId, newStatus);
      setIsLiveBackend(result.isLiveBackend);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      notify(`Task status updated to "${newStatus}"`);
      // Refresh tab counts
      volunteerTasksService.getCounts().then((counts) => {
        if (counts) setTabCounts(counts);
      });
    } catch (err: unknown) {
      console.error("Status update failed:", err);
      notify("Failed to update task status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Adjust volunteer count
  const handleAdjustVolunteers = async (taskId: string, delta: number) => {
    try {
      const result = await volunteerTasksService.adjustVolunteers(taskId, delta);
      setIsLiveBackend(result.isLiveBackend);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? result.data : t))
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(result.data);
      }

      notify("Volunteer assignment count updated.");
      volunteerTasksService.getCounts().then((counts) => {
        if (counts) setTabCounts(counts);
      });
    } catch (err: unknown) {
      console.error("Adjust volunteers failed:", err);
      notify("Failed to update volunteer count.");
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await volunteerTasksService.deleteTask(taskId);
      setIsLiveBackend(result.isLiveBackend);
      notify("Task deleted successfully.");

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setConfirmDeleteId(null);
      setSelectedTask(null);

      loadTasks(currentPage, true);
    } catch (err: unknown) {
      console.error("Delete task failed:", err);
      notify("Failed to delete task.");
    }
  };

  // Priority badge styling
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case "Critical":
        return "bg-[#fde9eb] text-[#d64550]";
      case "High":
        return "bg-[#fff2dc] text-[#b87813]";
      case "Medium":
        return "bg-[#e8f1f6] text-[#287fa9]";
      case "Low":
      default:
        return "bg-[#e5f5ef] text-[#239879]";
    }
  };

  // Status badge styling
  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "In Progress":
        return "bg-[#e8f1f6] text-[#287fa9]";
      case "Assigned":
        return "bg-[#e8f1f6] text-[#287fa9]";
      case "Awaiting Acceptance":
        return "bg-[#fff3dc] text-[#b87813]";
      case "Completed":
        return "bg-[#e5f5ef] text-[#239879]";
      case "Open":
      default:
        return "bg-[#f0f4f7] text-[#557086]";
    }
  };

  // Tab count resolver
  const getTabCountValue = (label: string): number => {
    switch (label) {
      case "All tasks":
        return tabCounts.allTasks;
      case "Open":
        return tabCounts.open;
      case "Assigned":
        return tabCounts.assigned;
      case "In progress":
        return tabCounts.inProgress;
      case "Completed":
        return tabCounts.completed;
      default:
        return 0;
    }
  };

  const tabs = defaultTabs.map((t) => ({
    label: t.label,
    count: getTabCountValue(t.label),
  }));

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">
        {/* BREADCRUMB & BACKEND CONNECTION STATUS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="font-semibold text-[#123c5b]">Tasks</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
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
              title="Refresh tasks"
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[27px] md:text-[29px] font-normal">Tasks</h1>
            <p className="text-[12px] text-[#718ba0] mt-1.5">
              Create response tasks, define requirements, and monitor fulfilment in real-time.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] rounded-lg flex items-center gap-2 text-[10px] text-[#17648e] hover:bg-[#f5fafc] transition-colors"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold transition-colors shadow-xs"
            >
              <Plus size={16} />
              Create task
            </button>
          </div>
        </div>

        {/* TASK STATUS TABS */}
        <div className="flex items-center gap-5 border-b border-[#d5e3e9] overflow-x-auto mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap pb-3 text-[10px] border-b-2 transition-colors ${
                activeTab === tab.label
                  ? "border-[#287fa9] text-[#287fa9] font-semibold"
                  : "border-transparent text-[#8296aa] hover:text-[#287fa9]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                  activeTab === tab.label
                    ? "bg-[#287fa9] text-white"
                    : "bg-[#e8f1f6] text-[#718ba0]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_120px_130px_130px_120px_95px] gap-2.5 mb-4">
          {/* SEARCH */}
          <div className="h-[40px] bg-white border border-[#d3e2e9] rounded-lg flex items-center px-3 gap-3">
            <Search size={16} className="text-[#718ba0]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search task ID or title..."
              className="w-full outline-none text-[10px] placeholder:text-[#a1b1c0]"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* PRIORITY */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[40px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>All priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* LOCATION */}
          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[40px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* SKILLS */}
          <select
            value={skillFilter}
            onChange={(e) => {
              setSkillFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[40px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>All skill groups</option>
            {skillGroups.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
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
            className="h-[40px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>Any schedule</option>
            <option>Today</option>
            <option>Tomorrow</option>
          </select>

          {/* MORE FILTERS TOGGLE */}
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="h-[40px] bg-white border border-[#b9d0dc] rounded-lg flex items-center justify-center gap-1.5 text-[10px] text-[#17648e] hover:bg-[#f5fafc]"
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>
        </section>

        {/* MORE FILTERS PANEL */}
        {showMoreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-4 flex flex-wrap justify-between items-center gap-3 shadow-xs">
            <div>
              <h3 className="text-xs font-semibold text-[#123c5b]">Active Filter Controls</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Quickly clear all filters or reset search terms to view all backend tasks.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="text-[10px] text-[#287fa9] hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* TASK TABLE */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              {/* TABLE HEADER */}
              <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">
                <tr className="text-[9px] text-[#718ba0]">
                  <th className="px-3.5 py-3 font-medium">Task ID</th>
                  <th className="px-3.5 py-3 font-medium">Task Title</th>
                  <th className="px-3.5 py-3 font-medium">Location</th>
                  <th className="px-3.5 py-3 font-medium">Required Skills</th>
                  <th className="px-3.5 py-3 font-medium">Priority</th>
                  <th className="px-3.5 py-3 font-medium">Schedule</th>
                  <th className="px-3.5 py-3 font-medium">Volunteers</th>
                  <th className="px-3.5 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={22} className="animate-spin text-[#287fa9]" />
                        <span className="text-xs font-medium">Loading volunteer tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-14 text-xs text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle size={24} className="text-amber-500" />
                        <p>No volunteer tasks found matching your criteria.</p>
                        <button
                          onClick={resetFilters}
                          className="mt-1 text-[11px] font-semibold text-[#287fa9] hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                    >
                      <td className="px-3.5 py-[13px] text-[9px] font-semibold text-[#17648e] whitespace-nowrap">
                        {task.id}
                      </td>

                      <td className="px-3.5 py-[13px] text-[9px] font-medium text-[#123c5b] whitespace-nowrap">
                        {task.title}
                      </td>

                      <td className="px-3.5 py-[13px] text-[9px] text-[#557086] whitespace-nowrap">
                        {task.location}
                      </td>

                      <td className="px-3.5 py-[13px] text-[9px] text-[#557086] whitespace-nowrap">
                        {task.skills && task.skills.length > 0
                          ? task.skills.join(" · ")
                          : "General"}
                      </td>

                      <td className="px-3.5 py-[13px]">
                        <span
                          className={`inline-flex px-2 py-1 rounded-md text-[8px] font-semibold ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-3.5 py-[13px] text-[9px] text-[#557086] whitespace-nowrap">
                        {task.schedule}
                      </td>

                      <td className="px-3.5 py-[13px] text-[9px] font-medium text-[#123c5b] whitespace-nowrap">
                        {task.volunteers}
                      </td>

                      <td className="px-3.5 py-[13px]">
                        <span
                          className={`inline-flex px-2 py-1 rounded-md text-[8px] font-semibold whitespace-nowrap ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="px-3 py-[13px] text-right">
                        <ChevronRight size={14} className="text-[#8296aa]" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-3 border-t border-[#d5e3e9] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fafcfd]">
            <p className="text-[10px] text-[#8296aa]">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} tasks
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="border border-[#d5e2e9] bg-white rounded-lg px-3 py-1.5 text-[9px] text-[#287fa9] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f0f7fa]"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="text-[10px] text-slate-400 px-1">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-[28px] h-[28px] rounded-lg text-[9px] font-medium border ${
                          currentPage === page
                            ? "bg-[#287fa9] border-[#287fa9] text-white shadow-xs"
                            : "border-[#d5e2e9] bg-white text-[#123c5b] hover:bg-[#f0f7fa]"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="border border-[#d5e2e9] bg-white rounded-lg px-3 py-1.5 text-[9px] text-[#287fa9] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f0f7fa]"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#123c5b]">Create new task</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Define requirements and schedule for relief response.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5">
              {/* TITLE */}
              <div>
                <label className="text-[11px] font-semibold text-[#123c5b]">
                  Task title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Evacuation transport support"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="text-[11px] font-semibold text-[#123c5b]">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={newTask.location}
                  onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                  placeholder="e.g. North Ward or Central Clinic"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              {/* SKILLS */}
              <div>
                <label className="text-[11px] font-semibold text-[#123c5b]">
                  Required skills <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={newTask.skills}
                  onChange={(e) => setNewTask({ ...newTask, skills: e.target.value })}
                  placeholder="Driving, Rescue, First Aid"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
                <p className="text-[9px] text-gray-400 mt-1">Separate multiple skills with commas.</p>
              </div>

              {/* PRIORITY */}
              <div>
                <label className="text-[11px] font-semibold text-[#123c5b]">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value as Priority })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none cursor-pointer"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              {/* DATE AND TIME */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#123c5b]">
                    Schedule date
                  </label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#123c5b]">
                    Schedule time
                  </label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* VOLUNTEERS */}
              <div>
                <label className="text-[11px] font-semibold text-[#123c5b]">
                  Required volunteers
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newTask.volunteers}
                  onChange={(e) => setNewTask({ ...newTask, volunteers: e.target.value })}
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#e1eaf0]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-xs hover:bg-[#f0f7fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmitting ? "Creating..." : "Create task"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[460px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-[#e1eaf0] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#17648e] bg-[#e8f1f6] px-2 py-0.5 rounded">
                    {selectedTask.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-semibold ${getStatusStyle(
                      selectedTask.status
                    )}`}
                  >
                    {selectedTask.status}
                  </span>
                </div>
                <h2 className="text-[16px] font-semibold text-[#123c5b] mt-1.5">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#f8fbfe] p-3 rounded-lg border border-[#e1eaf0]">
                <div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <MapPin size={12} className="text-[#287fa9]" /> Location
                  </div>
                  <div className="font-semibold text-[#123c5b] mt-0.5">
                    {selectedTask.location}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <CalendarDays size={12} className="text-[#287fa9]" /> Schedule
                  </div>
                  <div className="font-semibold text-[#123c5b] mt-0.5">
                    {selectedTask.schedule}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-[#287fa9]" /> Priority
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded mt-1 text-[9px] font-semibold ${getPriorityStyle(
                      selectedTask.priority
                    )}`}
                  >
                    {selectedTask.priority}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={12} className="text-[#287fa9]" /> Volunteers
                  </div>
                  <div className="font-semibold text-[#123c5b] mt-0.5">
                    {selectedTask.volunteers}
                  </div>
                </div>
              </div>

              {/* SKILLS */}
              <div>
                <label className="text-[11px] font-semibold text-[#123c5b] flex items-center gap-1 mb-1">
                  <Users size={13} className="text-[#287fa9]" /> Required Skills:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTask.skills && selectedTask.skills.length > 0 ? (
                    selectedTask.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-[#e8f1f6] text-[#287fa9] px-2 py-0.5 rounded-full text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-[10px]">General Support</span>
                  )}
                </div>
              </div>

              {/* VOLUNTEER ASSIGNMENT ADJUSTMENT */}
              <div className="pt-2 border-t border-[#e1eaf0]">
                <label className="text-[11px] font-semibold text-[#123c5b] block mb-2">
                  Volunteer Capacity & Allocation:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustVolunteers(selectedTask.id, 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f5ec] text-[#239879] hover:bg-[#d8eedf] rounded-lg text-[10px] font-semibold transition-colors"
                  >
                    <UserPlus size={13} />
                    <span>+1 Assigned</span>
                  </button>

                  <button
                    onClick={() => handleAdjustVolunteers(selectedTask.id, -1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fdebec] text-[#dc3545] hover:bg-[#fbdade] rounded-lg text-[10px] font-semibold transition-colors"
                  >
                    <UserMinus size={13} />
                    <span>-1 Assigned</span>
                  </button>
                </div>
              </div>

              {/* QUICK STATUS UPDATE */}
              <div className="pt-2 border-t border-[#e1eaf0]">
                <label className="text-[11px] font-semibold text-[#123c5b] block mb-2">
                  Change Task Status:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    ["Open", "Assigned", "In Progress", "Completed", "Awaiting Acceptance"] as TaskStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      disabled={isUpdatingStatus || selectedTask.status === st}
                      onClick={() => handleStatusChange(selectedTask.id, st)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                        selectedTask.status === st
                          ? "bg-[#287fa9] text-white"
                          : "border border-[#d5e2e9] bg-white text-[#123c5b] hover:bg-[#f0f7fa]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* DELETE TASK CONFIRMATION */}
              {confirmDeleteId === selectedTask.id ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <p className="text-[11px] font-semibold">Delete this task permanently?</p>
                  <p className="text-[10px] text-red-600 mt-0.5">
                    This will remove {selectedTask.id} from active deployments.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteTask(selectedTask.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-semibold hover:bg-red-700"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-[10px] text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-[#e1eaf0] p-4 flex items-center justify-between bg-[#fafcfd]">
              <button
                onClick={() => setConfirmDeleteId(selectedTask.id)}
                className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedTask(null)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-4 py-2 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        title="Help & Support"
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
      >
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
