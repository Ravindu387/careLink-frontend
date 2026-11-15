import { useState } from "react";
import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Plus,
  Users,
  Check,
  ShieldCheck,
  Activity,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  Download,
  MapPin,
  Sparkles,
  MessageSquare,
  BarChart3,
  X,
  CalendarDays,
} from "lucide-react";

// TYPES

interface Stat {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface Skill {
  name: string;
  available: number;
  percentage: number;
}

interface Task {
  id: string;
  title: string;
  location: string;
  skills: string;
  priority: "Critical" | "High" | "Medium";
  schedule: string;
  filled: string;
  status: "In Progress" | "Assigned" | "Open";
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

// STATISTICS

const stats: Stat[] = [
  { title: "Registered volunteers", value: "2,418", subtitle: "+84 this week", icon: Users, color: "text-[#3189b2]", bg: "bg-[#e7f1f7]" },
  { title: "Available now", value: "642", subtitle: "Within affected areas", icon: Check, color: "text-[#52b89b]", bg: "bg-[#e5f5ef]" },
  { title: "Active assignments", value: "387", subtitle: "92% accepted", icon: Activity, color: "text-[#3189b2]", bg: "bg-[#e7f1f7]" },
  { title: "Open tasks", value: "74", subtitle: "18 urgent", icon: ListTodo, color: "text-[#e6a43e]", bg: "bg-[#fff3df]" },
  { title: "Pending verification", value: "18", subtitle: "4 high priority", icon: ShieldCheck, color: "text-[#e6a43e]", bg: "bg-[#fff3df]" },
  { title: "Task completion", value: "89.4%", subtitle: "+2.3% this week", icon: TrendingUp, color: "text-[#52b89b]", bg: "bg-[#e5f5ef]" },
  { title: "Hours contributed", value: "14,280", subtitle: "Current reporting period", icon: Clock, color: "text-[#3189b2]", bg: "bg-[#e7f1f7]" },
  { title: "Safety alerts", value: "3", subtitle: "1 action required", icon: AlertTriangle, color: "text-[#e34d4d]", bg: "bg-[#fdebec]" },
];

// VOLUNTEER SKILLS

const skills: Skill[] = [
  { name: "Logistics & distribution", available: 184, percentage: 84 },
  { name: "First aid & medical", available: 96, percentage: 70 },
  { name: "Driving & transport", available: 128, percentage: 81 },
  { name: "Shelter support", available: 142, percentage: 80 },
  { name: "Translation", available: 52, percentage: 58 },
  { name: "Search & rescue", available: 40, percentage: 57 },
];

// WEEKLY CHART

const weeklyData = [
  { day: "Mon", created: 12, completed: 9 },
  { day: "Tue", created: 16, completed: 11 },
  { day: "Wed", created: 14, completed: 10 },
  { day: "Thu", created: 20, completed: 17 },
  { day: "Fri", created: 18, completed: 15 },
  { day: "Sat", created: 25, completed: 21 },
  { day: "Today", created: 17, completed: 11 },
];

// TASKS

const initialTasks: Task[] = [
  {
    id: "TASK-782",
    title: "Evacuation transport support",
    location: "North Ward",
    skills: "Driving · Rescue",
    priority: "Critical",
    schedule: "Today · 14:00",
    filled: "2 / 3",
    status: "In Progress",
  },
  {
    id: "TASK-779",
    title: "Medical point registration",
    location: "Central Clinic",
    skills: "First Aid · Admin",
    priority: "High",
    schedule: "Today · 15:30",
    filled: "1 / 2",
    status: "Assigned",
  },
  {
    id: "TASK-774",
    title: "Food pack distribution",
    location: "Eastbank Hub",
    skills: "Logistics",
    priority: "High",
    schedule: "Today · 16:00",
    filled: "4 / 6",
    status: "Open",
  },
];

// ACTIVITIES

const activities: ActivityItem[] = [
  {
    title: "Volunteer checked in",
    description: "Elena Rossi · TASK-782",
    time: "4 min",
    icon: Check,
    color: "text-[#3189b2]",
    bg: "bg-[#e7f1f7]",
  },
  {
    title: "AI match ready for review",
    description: "TASK-774 · 6 candidates",
    time: "12 min",
    icon: Sparkles,
    color: "text-[#3189b2]",
    bg: "bg-[#e7f1f7]",
  },
  {
    title: "Verification approved",
    description: "Maya Fernando · Nursing",
    time: "19 min",
    icon: ShieldCheck,
    color: "text-[#3189b2]",
    bg: "bg-[#e7f1f7]",
  },
  {
    title: "Task needs replacement",
    description: "TASK-768 · North Ward",
    time: "27 min",
    icon: AlertTriangle,
    color: "text-[#3189b2]",
    bg: "bg-[#e7f1f7]",
  },
];

// QUICK ACTIONS

const quickActions = [
  { title: "Create Task", icon: Plus, path: "/volunteers/tasks/create" },
  { title: "Find Volunteers", icon: Users, path: "/volunteers/directory" },
  { title: "Review Verification", icon: ShieldCheck, path: "/volunteers/pending-verification" },
  { title: "AI Match", icon: Sparkles, path: "/volunteers/ai-matching" },
  { title: "Send Update", icon: MessageSquare, path: "/volunteers/updates" },
  { title: "Generate Report", icon: BarChart3, path: "/volunteers/reports" },
];

// MAIN COMPONENT

export default function VolunteerCoordinationDashboard() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState("");
  const [search, setSearch] = useState("");

  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 3000);
  };

  // EXPORT

  const exportSummary = () => {
    const report = [
      "Volunteer Coordination Dashboard Summary",
      "",
      "Registered Volunteers: 2,418",
      "Available Volunteers: 642",
      "Active Assignments: 387",
      "Open Tasks: 74",
      "Task Completion: 89.4%",
      "",
      "Urgent Tasks",
      ...tasks.map(
        (task) =>
          `${task.id},${task.title},${task.location},${task.priority},${task.status}`
      ),
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "volunteer-coordination-summary.txt";
    link.click();

    URL.revokeObjectURL(url);
    notify("Dashboard summary exported successfully.");
  };

  // STYLES

  const priorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-[#fde9e9] text-[#d64b4b]";
      case "High":
        return "bg-[#fff2dc] text-[#b77a16]";
      default:
        return "bg-[#e8f1f6] text-[#287fa9]";
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-[#e8f1f6] text-[#287fa9]";
      case "Assigned":
        return "bg-[#e5f5ef] text-[#239879]";
      default:
        return "bg-[#e8f1f6] text-[#287fa9]";
    }
  };

  const filteredTasks = tasks.filter((task) =>
    `${task.id} ${task.title} ${task.location} ${task.skills}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleQuickAction = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}


      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-[38px] pt-7 pb-12">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[12px] mb-9">
          <span className="text-[#8296aa]">Operations</span>
          <ChevronRight size={15} />
          <span className="text-[#8296aa]">Volunteer Coordination</span>
          <ChevronRight size={15} />
          <span className="font-semibold">
            Volunteer Coordination Dashboard
          </span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">

          <div>
            <h1 className="text-[34px] md:text-[36px] font-normal tracking-tight">
              Volunteer Coordination Dashboard
            </h1>

            <p className="text-[15px] text-[#718ba0] mt-2">
              Coordinate verified volunteers, urgent tasks, schedules, and field activity.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={exportSummary}
              className="h-[52px] px-5 bg-white border border-[#b9d0dc] rounded-lg text-[13px] flex items-center gap-2 text-[#287fa9] hover:bg-[#f5fafc]"
            >
              <Download size={18} />
              Export summary
            </button>

            <button
              onClick={() => handleQuickAction("/volunteers/tasks/create")}
              className="h-[52px] px-5 bg-[#287fa9] text-white rounded-lg text-[13px] flex items-center gap-2 hover:bg-[#17678e]"
            >
              <Plus size={19} />
              Create task
            </button>

          </div>
        </div>

        {/* DEMONSTRATION ALERT */}

        <div className="bg-[#effaf6] border border-[#bde8d8] rounded-xl px-5 py-4 flex items-center gap-3 mb-4">

          <Check size={16} className="text-[#39a98a]" />

          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#23896f]">
              Demonstration operations data
            </p>
            <p className="text-[11px] text-[#4c947e]">
              Realistic sample records for the Greater Riverton flood response.
            </p>
          </div>

          <span className="text-[10px] text-[#8296aa]">
            Updated just now
          </span>
        </div>

        {/* STATISTICS */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white border border-[#d5e3e9] rounded-xl px-5 py-5 flex items-center gap-4 shadow-sm min-h-[82px]"
              >
                <div className={`w-[44px] h-[44px] rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] text-[#8296aa] truncate">
                    {stat.title}
                  </p>
                  <h2 className="text-[23px] font-bold leading-tight">
                    {stat.value}
                  </h2>
                  <p className="text-[10px] text-[#8296aa]">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}

        </section>

        {/* FIRST ROW */}

        <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4 mb-4">

          {/* VOLUNTEER AVAILABILITY */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-5 border-b border-[#d5e3e9] flex justify-between items-center">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Volunteer availability
                </h2>
                <p className="text-[11px] text-[#8296aa] mt-1">
                  Available volunteers by skill group
                </p>
              </div>

              <button
                onClick={() => handleQuickAction("/volunteers/skills-availability")}
                className="text-[11px] text-[#287fa9] flex items-center gap-1"
              >
                View skills <ChevronRight size={15} />
              </button>
            </div>

            <div className="px-5 py-3 space-y-4">

              {skills.map((skill) => (
                <div key={skill.name}>

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-medium">
                      {skill.name}
                    </p>
                    <span className="text-[11px] text-[#8296aa]">
                      {skill.available} available
                    </span>
                  </div>

                  <div className="h-[5px] bg-[#e7eef1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#62b9a0] rounded-full"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* WEEKLY TASK CHART */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-5 border-b border-[#d5e3e9] flex justify-between items-center">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Tasks this week
                </h2>
                <p className="text-[11px] text-[#8296aa] mt-1">
                  Created and completed
                </p>
              </div>

              <span className="bg-[#e5f5ef] text-[#299879] rounded px-2 py-1.5 text-[10px]">
                89.4% completion
              </span>
            </div>

            <div className="px-5 pt-5 pb-4">

              <div className="relative h-[165px]">

                <div className="absolute inset-0 flex flex-col justify-between">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="border-t border-[#edf1f3] w-full"
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex justify-around items-end">

                  {weeklyData.map((item) => (
                    <div
                      key={item.day}
                      className="flex flex-col items-center justify-end h-full w-8"
                    >

                      <div className="flex items-end gap-[4px] h-[140px]">

                        <div
                          className="w-[8px] bg-[#287fa9] rounded-t-sm hover:bg-[#145d82]"
                          style={{ height: `${(item.created / 27) * 100}%` }}
                          title={`${item.created} tasks created`}
                        />

                        <div
                          className="w-[8px] bg-[#62b9a0] rounded-t-sm hover:bg-[#399b81]"
                          style={{ height: `${(item.completed / 27) * 100}%` }}
                          title={`${item.completed} tasks completed`}
                        />

                      </div>

                      <span className="text-[10px] text-[#8296aa] mt-2">
                        {item.day}
                      </span>

                    </div>
                  ))}

                </div>
              </div>

              <div className="flex justify-center gap-5 mt-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-[#287fa9]" />
                  <span className="text-[11px] text-[#8296aa]">Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-[#62b9a0]" />
                  <span className="text-[11px] text-[#8296aa]">Completed</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* SECOND ROW */}

        <section className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4 mb-5">

          {/* URGENT TASKS */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-5 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Urgent open tasks
                </h2>
                <p className="text-[11px] text-[#8296aa] mt-1">
                  Require volunteers or coordinator action
                </p>
              </div>

              <button
                onClick={() => handleQuickAction("/volunteers/tasks")}
                className="text-[11px] text-[#287fa9] flex items-center gap-1"
              >
                View all <ChevronRight size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left min-w-[900px]">

                <thead className="bg-[#f5f8f9]">
                  <tr className="text-[11px] text-[#8296aa]">
                    <th className="px-3 py-4 font-medium">Task</th>
                    <th className="px-3 py-4 font-medium">Title</th>
                    <th className="px-3 py-4 font-medium">Location</th>
                    <th className="px-3 py-4 font-medium">Skills</th>
                    <th className="px-3 py-4 font-medium">Priority</th>
                    <th className="px-3 py-4 font-medium">Schedule</th>
                    <th className="px-3 py-4 font-medium">Filled</th>
                    <th className="px-3 py-4 font-medium">Status</th>
                    <th className="px-3 py-4"></th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="border-t border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer"
                    >
                      <td className="px-3 py-5 text-[11px] font-semibold whitespace-nowrap">
                        {task.id}
                      </td>
                      <td className="px-3 py-5 text-[11px] whitespace-nowrap">
                        {task.title}
                      </td>
                      <td className="px-3 py-5 text-[11px] whitespace-nowrap">
                        {task.location}
                      </td>
                      <td className="px-3 py-5 text-[11px] whitespace-nowrap">
                        {task.skills}
                      </td>
                      <td className="px-3 py-5">
                        <span className={`px-2 py-1.5 rounded text-[10px] font-semibold ${priorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-5 text-[11px] whitespace-nowrap">
                        {task.schedule}
                      </td>
                      <td className="px-3 py-5 text-[11px] whitespace-nowrap">
                        {task.filled}
                      </td>
                      <td className="px-3 py-5">
                        <span className={`px-2 py-1.5 rounded text-[10px] font-semibold whitespace-nowrap ${statusStyle(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-5">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  ))}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-sm text-gray-400">
                        No tasks found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>

            </div>
          </div>

          {/* LIVE ACTIVITY */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-sm">

            <div className="px-5 py-5 border-b border-[#d5e3e9] flex justify-between items-center">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Live coordination activity
                </h2>
                <p className="text-[11px] text-[#8296aa] mt-1">
                  Across all response teams
                </p>
              </div>

              <span className="bg-[#e5f5ef] text-[#299879] rounded px-2 py-1.5 text-[10px]">
                Live
              </span>
            </div>

            <div>
              {activities.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="px-4 py-4 flex items-center gap-3 border-b border-[#e1eaf0] hover:bg-[#f8fbfc]"
                  >
                    <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                      <Icon size={17} className={item.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-[#8296aa] mt-1 truncate">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-[10px] text-[#8296aa] whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section>

          <h2 className="text-[15px] font-semibold mb-3">
            Quick actions
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  onClick={() => handleQuickAction(action.path)}
                  className="bg-white border border-[#d5e3e9] hover:border-[#62b9a0] hover:bg-[#f8fcfa] rounded-lg px-3 py-4 flex items-center gap-2.5 transition-all group"
                >
                  <div className="w-[32px] h-[32px] bg-[#e5f5ef] rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-[#42a58c]" />
                  </div>

                  <span className="text-[11px] font-semibold text-left flex-1">
                    {action.title}
                  </span>

                  <ChevronRight size={14} className="shrink-0" />
                </button>
              );
            })}

          </div>

        </section>

      </main>

      {/* TASK DETAILS MODAL */}

      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-[450px] shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex justify-between items-center">
              <div>
                <h2 className="text-[17px] font-semibold">Task details</h2>
                <p className="text-[12px] text-gray-400 mt-1">
                  {selectedTask.id}
                </p>
              </div>

              <button onClick={() => setSelectedTask(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">

              <h3 className="text-[17px] font-semibold">
                {selectedTask.title}
              </h3>

              <div className="flex items-center gap-3 text-[13px]">
                <MapPin size={17} className="text-[#287fa9]" />
                {selectedTask.location}
              </div>

              <div className="flex items-center gap-3 text-[13px]">
                <Users size={17} className="text-[#287fa9]" />
                {selectedTask.skills}
              </div>

              <div className="flex items-center gap-3 text-[13px]">
                <CalendarDays size={17} className="text-[#287fa9]" />
                {selectedTask.schedule}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-2 rounded-md text-[12px] ${priorityStyle(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>

                <span className={`px-3 py-2 rounded-md text-[12px] ${statusStyle(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
              </div>

              <div className="bg-[#f3f7f9] p-4 rounded-lg">
                <p className="text-[12px] text-gray-500">
                  Volunteer allocation
                </p>
                <p className="text-[22px] font-bold mt-1">
                  {selectedTask.filled}
                </p>
              </div>

            </div>

            <div className="p-5 border-t flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-6 py-3 text-[13px]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NOTIFICATION */}

      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-[13px]">
          {notification}
        </div>
      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-4 right-4 bg-[#282828] hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
        <HelpCircle size={19} />
      </button>

    </div>
  );
}