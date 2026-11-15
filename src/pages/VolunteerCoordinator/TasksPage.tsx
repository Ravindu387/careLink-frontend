import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Plus,
  Download,
  Menu,
  X,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// TYPES

type Priority = "Critical" | "High" | "Medium" | "Low";

type TaskStatus =
  | "In Progress"
  | "Assigned"
  | "Open"
  | "Awaiting Acceptance"
  | "Completed";

interface Task {
  id: string;
  title: string;
  location: string;
  skills: string[];
  priority: Priority;
  schedule: string;
  volunteers: string;
  status: TaskStatus;
}

// DEMO TASK DATA

const initialTasks: Task[] = [
  {
    id: "TASK-782",
    title: "Evacuation transport support",
    location: "North Ward",
    skills: ["Driving", "Rescue"],
    priority: "Critical",
    schedule: "Today · 14:00",
    volunteers: "2 / 3",
    status: "In Progress",
  },
  {
    id: "TASK-779",
    title: "Medical point registration",
    location: "Central Clinic",
    skills: ["First Aid", "Admin"],
    priority: "High",
    schedule: "Today · 15:30",
    volunteers: "1 / 2",
    status: "Assigned",
  },
  {
    id: "TASK-774",
    title: "Food pack distribution",
    location: "Eastbank Hub",
    skills: ["Logistics"],
    priority: "High",
    schedule: "Today · 16:00",
    volunteers: "4 / 6",
    status: "Open",
  },
  {
    id: "TASK-768",
    title: "Shelter childcare support",
    location: "Riverton School",
    skills: ["Childcare"],
    priority: "Medium",
    schedule: "Tomorrow · 08:00",
    volunteers: "0 / 3",
    status: "Open",
  },
  {
    id: "TASK-761",
    title: "Multilingual hotline",
    location: "Remote",
    skills: ["Translation"],
    priority: "Medium",
    schedule: "Tomorrow · 09:00",
    volunteers: "2 / 4",
    status: "Awaiting Acceptance",
  },
  {
    id: "TASK-682",
    title: "Evacuation transport support",
    location: "North Ward",
    skills: ["Driving", "Rescue"],
    priority: "Critical",
    schedule: "Today · 14:00",
    volunteers: "2 / 3",
    status: "In Progress",
  },
  {
    id: "TASK-679",
    title: "Medical point registration",
    location: "Central Clinic",
    skills: ["First Aid", "Admin"],
    priority: "High",
    schedule: "Today · 15:30",
    volunteers: "1 / 2",
    status: "Assigned",
  },
  {
    id: "TASK-674",
    title: "Food pack distribution",
    location: "Eastbank Hub",
    skills: ["Logistics"],
    priority: "High",
    schedule: "Today · 16:00",
    volunteers: "4 / 6",
    status: "Open",
  },
  {
    id: "TASK-668",
    title: "Shelter childcare support",
    location: "Riverton School",
    skills: ["Childcare"],
    priority: "Medium",
    schedule: "Tomorrow · 08:00",
    volunteers: "0 / 3",
    status: "Open",
  },
  {
    id: "TASK-661",
    title: "Multilingual hotline",
    location: "Remote",
    skills: ["Translation"],
    priority: "Medium",
    schedule: "Tomorrow · 09:00",
    volunteers: "2 / 4",
    status: "Awaiting Acceptance",
  },
  {
    id: "TASK-655",
    title: "Emergency medical assistance",
    location: "Central Ward",
    skills: ["Medical", "First Aid"],
    priority: "Critical",
    schedule: "Today · 17:00",
    volunteers: "1 / 4",
    status: "Open",
  },
  {
    id: "TASK-648",
    title: "Warehouse supply management",
    location: "West District",
    skills: ["Logistics"],
    priority: "Low",
    schedule: "Tomorrow · 10:00",
    volunteers: "3 / 3",
    status: "Completed",
  },
];

// TAB DATA

const tabs = [
  { label: "All tasks", count: 146 },
  { label: "Open", count: 74 },
  { label: "Assigned", count: 32 },
  { label: "In progress", count: 28 },
  { label: "Completed", count: 12 },
];

// MAIN COMPONENT

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const [activeTab, setActiveTab] = useState("All tasks");

  const [search, setSearch] = useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("All priorities");

  const [locationFilter, setLocationFilter] =
    useState("All locations");

  const [skillFilter, setSkillFilter] =
    useState("All skill groups");

  const [scheduleFilter, setScheduleFilter] =
    useState("Any schedule");

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [notification, setNotification] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const [newTask, setNewTask] = useState({
    title: "",
    location: "",
    skills: "",
    priority: "Medium" as Priority,
    date: "",
    time: "",
    volunteers: "3",
  });

  // NOTIFICATION

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // TASK FILTERING

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchMatch =
        task.id.toLowerCase().includes(search.toLowerCase()) ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.location.toLowerCase().includes(search.toLowerCase()) ||
        task.skills.join(" ").toLowerCase().includes(search.toLowerCase());

      const priorityMatch =
        priorityFilter === "All priorities" ||
        task.priority === priorityFilter;

      const locationMatch =
        locationFilter === "All locations" ||
        task.location === locationFilter;

      const skillMatch =
        skillFilter === "All skill groups" ||
        task.skills.some(
          (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
        );

      const scheduleMatch =
        scheduleFilter === "Any schedule" ||
        (scheduleFilter === "Today" &&
          task.schedule.startsWith("Today")) ||
        (scheduleFilter === "Tomorrow" &&
          task.schedule.startsWith("Tomorrow"));

      let tabMatch = true;

      if (activeTab === "Open") {
        tabMatch = task.status === "Open";
      } else if (activeTab === "Assigned") {
        tabMatch =
          task.status === "Assigned" ||
          task.status === "Awaiting Acceptance";
      } else if (activeTab === "In progress") {
        tabMatch = task.status === "In Progress";
      } else if (activeTab === "Completed") {
        tabMatch = task.status === "Completed";
      }

      return (
        searchMatch &&
        priorityMatch &&
        locationMatch &&
        skillMatch &&
        scheduleMatch &&
        tabMatch
      );
    });
  }, [
    tasks,
    search,
    priorityFilter,
    locationFilter,
    skillFilter,
    scheduleFilter,
    activeTab,
  ]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / pageSize)
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CREATE TASK

  const handleCreateTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const task: Task = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: newTask.title,
      location: newTask.location,
      skills: newTask.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      priority: newTask.priority,
      schedule: `${newTask.date} · ${newTask.time}`,
      volunteers: `0 / ${newTask.volunteers}`,
      status: "Open",
    };

    setTasks((prev) => [task, ...prev]);

    setActiveTab("All tasks");
    setSearch("");
    setPriorityFilter("All priorities");
    setLocationFilter("All locations");
    setSkillFilter("All skill groups");
    setScheduleFilter("Any schedule");
    setCurrentPage(1);

    setNewTask({
      title: "",
      location: "",
      skills: "",
      priority: "Medium",
      date: "",
      time: "",
      volunteers: "3",
    });

    setShowCreateModal(false);

    notify("New task created successfully!");
  };

  // EXPORT CSV

  const handleExport = () => {
    const headers = [
      "Task ID",
      "Task Title",
      "Location",
      "Required Skills",
      "Priority",
      "Schedule",
      "Volunteers",
      "Status",
    ];

    const rows = filteredTasks.map((task) => [
      task.id,
      task.title,
      task.location,
      task.skills.join(" / "),
      task.priority,
      task.schedule,
      task.volunteers,
      task.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "volunteer-tasks.csv";
    link.click();

    URL.revokeObjectURL(url);

    notify("Tasks exported successfully!");
  };

  // FILTER RESET

  const resetFilters = () => {
    setSearch("");
    setPriorityFilter("All priorities");
    setLocationFilter("All locations");
    setSkillFilter("All skill groups");
    setScheduleFilter("Any schedule");
    setActiveTab("All tasks");
    setCurrentPage(1);
  };

  // PRIORITY STYLE

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case "Critical":
        return "bg-[#fde9eb] text-[#d64550]";

      case "High":
        return "bg-[#fff2dc] text-[#b87813]";

      case "Medium":
        return "bg-[#e8f1f6] text-[#287fa9]";

      default:
        return "bg-[#e5f5ef] text-[#239879]";
    }
  };

  // STATUS STYLE

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

      default:
        return "bg-[#e8f1f6] text-[#287fa9]";
    }
  };

  // TAB COUNTS BASED ON AVAILABLE DATA

  const getTabCount = (label: string, defaultCount: number) => {
    if (label === "All tasks") return tasks.length;

    if (label === "Open") {
      return tasks.filter((t) => t.status === "Open").length;
    }

    if (label === "Assigned") {
      return tasks.filter(
        (t) =>
          t.status === "Assigned" ||
          t.status === "Awaiting Acceptance"
      ).length;
    }

    if (label === "In progress") {
      return tasks.filter((t) => t.status === "In Progress").length;
    }

    if (label === "Completed") {
      return tasks.filter((t) => t.status === "Completed").length;
    }

    return defaultCount;
  };

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      

      {/* MOBILE MENU */}

      {showMobileMenu && (
        <div className="md:hidden bg-white border-b p-4 flex flex-wrap gap-4 text-xs">
          <span>Greater Riverton</span>
          <span>Language: EN</span>
          <span>Notifications: 9</span>
          <span>Nadia O. · Coordinator</span>
        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">

          <span className="text-[#8296aa]">Operations</span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold text-[#123c5b]">
            Tasks
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">

          <div>

            <h1 className="text-[27px] md:text-[29px] font-normal">
              Tasks
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Create response tasks, define requirements, and monitor fulfilment.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={handleExport}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] rounded-lg flex items-center gap-2 text-[10px] text-[#17648e] hover:bg-[#f5fafc]"
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold"
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

              {tab.label}

              <span className="bg-[#e8f1f6] text-[#718ba0] rounded-full px-1.5 py-0.5 text-[8px]">
                {getTabCount(tab.label, tab.count)}
              </span>

            </button>

          ))}

        </div>

        {/* FILTER BAR */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_112px_113px_123px_118px_88px] gap-2.5 mb-4">

          {/* SEARCH */}

          <div className="h-[40px] bg-white border border-[#d3e2e9] rounded-lg flex items-center px-3 gap-3">

            <Search size={17} className="text-[#718ba0]" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search task ID or title..."
              className="w-full outline-none text-[10px] placeholder:text-[#a1b1c0]"
            />

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
            <option>North Ward</option>
            <option>Central Clinic</option>
            <option>Eastbank Hub</option>
            <option>Riverton School</option>
            <option>Remote</option>
            <option>Central Ward</option>
            <option>West District</option>
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
            <option>Driving</option>
            <option>Rescue</option>
            <option>First Aid</option>
            <option>Admin</option>
            <option>Logistics</option>
            <option>Childcare</option>
            <option>Translation</option>
            <option>Medical</option>
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

          {/* MORE FILTERS */}

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="h-[40px] bg-white border border-[#b9d0dc] rounded-lg flex items-center justify-center gap-1.5 text-[10px] text-[#17648e] hover:bg-[#f5fafc]"
          >
            <SlidersHorizontal size={13} />
            More filters
          </button>

        </section>

        {/* MORE FILTERS */}

        {showMoreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-4 flex flex-wrap justify-between items-center gap-3">

            <div>
              <h3 className="text-xs font-semibold">
                Advanced task filters
              </h3>

              <p className="text-[10px] text-gray-400 mt-1">
                Clear all active filters to view every task.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="text-[10px] text-[#287fa9] font-semibold"
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

                  <th className="px-3 py-3 font-medium">Task ID</th>

                  <th className="px-3 py-3 font-medium">Task Title</th>

                  <th className="px-3 py-3 font-medium">Location</th>

                  <th className="px-3 py-3 font-medium">Required Skills</th>

                  <th className="px-3 py-3 font-medium">Priority</th>

                  <th className="px-3 py-3 font-medium">Schedule</th>

                  <th className="px-3 py-3 font-medium">Volunteers</th>

                  <th className="px-3 py-3 font-medium">Status</th>

                  <th className="px-3 py-3"></th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {paginatedTasks.map((task) => (

                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                  >

                    <td className="px-3 py-[13px] text-[9px] font-semibold whitespace-nowrap">
                      {task.id}
                    </td>

                    <td className="px-3 py-[13px] text-[9px] whitespace-nowrap">
                      {task.title}
                    </td>

                    <td className="px-3 py-[13px] text-[9px] whitespace-nowrap">
                      {task.location}
                    </td>

                    <td className="px-3 py-[13px] text-[9px] whitespace-nowrap">
                      {task.skills.join(" · ")}
                    </td>

                    <td className="px-3 py-[13px]">

                      <span className={`inline-flex px-2 py-1.5 rounded-md text-[8px] font-semibold ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>

                    </td>

                    <td className="px-3 py-[13px] text-[9px] whitespace-nowrap">
                      {task.schedule}
                    </td>

                    <td className="px-3 py-[13px] text-[9px] whitespace-nowrap">
                      {task.volunteers}
                    </td>

                    <td className="px-3 py-[13px]">

                      <span className={`inline-flex px-2 py-1.5 rounded-md text-[8px] font-semibold whitespace-nowrap ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>

                    </td>

                    <td className="px-3 py-[13px]">

                      <ChevronRight
                        size={15}
                        className="text-[#718ba0]"
                      />

                    </td>

                  </tr>

                ))}

                {paginatedTasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-xs text-gray-400"
                    >
                      No tasks found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-[9px] text-[#8296aa]">

              Showing{" "}
              {filteredTasks.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(
                currentPage * pageSize,
                filteredTasks.length
              )}
              {" "}of {filteredTasks.length}

            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border border-[#d5e2e9] rounded-lg px-3.5 py-2 text-[9px] text-[#287fa9] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: Math.min(totalPages, 3) },
                (_, i) => i + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[33px] h-[33px] rounded-lg border text-[9px] ${
                    currentPage === page
                      ? "bg-[#287fa9] border-[#287fa9] text-white"
                      : "border-[#d5e2e9] text-[#123c5b] hover:bg-[#f0f7fa]"
                  }`}
                >
                  {page}
                </button>

              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border border-[#b9d0dc] rounded-lg px-3.5 py-2 text-[9px] text-[#287fa9] disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* CREATE TASK MODAL */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex items-center justify-between">

              <div>
                <h2 className="text-[17px] font-semibold">
                  Create new task
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Define the requirements for a response task.
                </p>
              </div>

              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">

              {/* TITLE */}

              <div>
                <label className="text-[11px] font-semibold">
                  Task title
                </label>

                <input
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter task title"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="text-[11px] font-semibold">
                  Location
                </label>

                <input
                  required
                  value={newTask.location}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter task location"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              {/* SKILLS */}

              <div>
                <label className="text-[11px] font-semibold">
                  Required skills
                </label>

                <input
                  required
                  value={newTask.skills}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      skills: e.target.value,
                    })
                  }
                  placeholder="Driving, Rescue, First Aid"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />

                <p className="text-[9px] text-gray-400 mt-1">
                  Separate multiple skills using commas.
                </p>
              </div>

              {/* PRIORITY */}

              <div>
                <label className="text-[11px] font-semibold">
                  Priority
                </label>

                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as Priority,
                    })
                  }
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
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
                  <label className="text-[11px] font-semibold">
                    Schedule date
                  </label>

                  <input
                    required
                    type="date"
                    value={newTask.date}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        date: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold">
                    Schedule time
                  </label>

                  <input
                    required
                    type="time"
                    value={newTask.time}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        time: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                  />
                </div>

              </div>

              {/* VOLUNTEERS */}

              <div>
                <label className="text-[11px] font-semibold">
                  Required volunteers
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={newTask.volunteers}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      volunteers: e.target.value,
                    })
                  }
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />
              </div>

              {/* ACTION BUTTONS */}

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2.5 text-xs"
                >
                  Create task
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* TASK DETAILS MODAL */}

      {selectedTask && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[430px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex items-center justify-between">

              <div>
                <h2 className="text-[16px] font-semibold">
                  Task details
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedTask.id}
                </p>
              </div>

              <button onClick={() => setSelectedTask(null)}>
                <X size={19} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              <h3 className="text-sm font-semibold">
                {selectedTask.title}
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <MapPin size={15} className="text-[#287fa9]" />
                {selectedTask.location}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Users size={15} className="text-[#287fa9]" />
                {selectedTask.skills.join(", ")}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <CalendarDays size={15} className="text-[#287fa9]" />
                {selectedTask.schedule}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Clock size={15} className="text-[#287fa9]" />
                Volunteers: {selectedTask.volunteers}
              </div>

              <div className="flex gap-2">

                <span className={`px-3 py-1.5 rounded-md text-[10px] ${getPriorityStyle(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>

                <span className={`px-3 py-1.5 rounded-md text-[10px] ${getStatusStyle(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>

              </div>

            </div>

            <div className="border-t p-4 flex justify-end">

              <button
                onClick={() => setSelectedTask(null)}
                className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* NOTIFICATION */}

      {notification && (

        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2">

          <CheckCircle2 size={15} />

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