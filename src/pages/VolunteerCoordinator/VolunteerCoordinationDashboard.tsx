import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Server,
  RefreshCw,
  Loader2,
  HelpCircle,
} from "lucide-react";

import { volunteerDashboardService } from "../../services/volunteerDashboardService";
import type {
  DashboardStatItem,
  DashboardSkillAvailability,
  WeeklyTaskChartItem,
  DashboardUrgentTask,
  DashboardActivityItem,
} from "../../types/volunteerDashboard";

const quickActions = [
  { title: "Create Task", icon: Plus, path: "/volunteer/tasks" },
  { title: "Find Volunteers", icon: Users, path: "/volunteer/directory" },
  { title: "Review Verification", icon: ShieldCheck, path: "/volunteer/verification" },
  { title: "AI Match", icon: Sparkles, path: "/volunteer/ai-matching" },
  { title: "Send Update", icon: MessageSquare, path: "/volunteer/communications" },
  { title: "Generate Report", icon: BarChart3, path: "/volunteer/reports" },
];

export default function VolunteerCoordinationDashboard() {
  const navigate = useNavigate();

  // Connection and loading state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Data states
  const [stats, setStats] = useState<DashboardStatItem[]>([]);
  const [skills, setSkills] = useState<DashboardSkillAvailability[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyTaskChartItem[]>([]);
  const [tasks, setTasks] = useState<DashboardUrgentTask[]>([]);
  const [activities, setActivities] = useState<DashboardActivityItem[]>([]);
  const [operationsAlert, setOperationsAlert] = useState<string>(
    "Realistic sample records for the Greater Riverton flood response."
  );

  // Search & Modal
  const [selectedTask, setSelectedTask] = useState<DashboardUrgentTask | null>(null);
  const [search, setSearch] = useState<string>("");

  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 3500);
  };

  // LOAD DASHBOARD
  const loadDashboard = useCallback(async (background: boolean = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await volunteerDashboardService.getOverview();
      const overview = result.data;
      setStats(overview.stats || []);
      setSkills(overview.skills || []);
      setWeeklyData(overview.weeklyData || []);
      setTasks(overview.urgentTasks || []);
      setActivities(overview.recentActivities || []);
      if (overview.operationsAlert) {
        setOperationsAlert(overview.operationsAlert);
      }
      setIsLiveBackend(result.isLiveBackend);
    } catch (err: unknown) {
      console.error("Failed to load volunteer dashboard overview:", err);
      notify("Could not reach backend; loaded fallback data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    loadDashboard(true);
  };

  // EXPORT SUMMARY
  const exportSummary = async () => {
    try {
      const blob = await volunteerDashboardService.exportSummary();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `volunteer-coordination-summary-${new Date().toISOString().slice(0, 10)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Dashboard summary exported successfully.");
    } catch (err: unknown) {
      console.error("Export summary failed:", err);
      notify("Failed to export dashboard summary.");
    }
  };

  // STYLES HELPER
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
        return "bg-[#f0f4f7] text-[#557086]";
    }
  };

  const getStatIcon = (key: string) => {
    switch (key) {
      case "registered_volunteers":
        return Users;
      case "available_now":
        return Check;
      case "active_assignments":
        return Activity;
      case "open_tasks":
        return ListTodo;
      case "pending_verification":
        return ShieldCheck;
      case "task_completion":
        return TrendingUp;
      case "hours_contributed":
        return Clock;
      case "safety_alerts":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getStatColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return { color: "text-[#52b89b]", bg: "bg-[#e5f5ef]" };
      case "amber":
        return { color: "text-[#e6a43e]", bg: "bg-[#fff3df]" };
      case "red":
        return { color: "text-[#e34d4d]", bg: "bg-[#fdebec]" };
      case "blue":
      default:
        return { color: "text-[#3189b2]", bg: "bg-[#e7f1f7]" };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return { icon: Check, color: "text-[#3189b2]", bg: "bg-[#e7f1f7]" };
      case "ai_match":
        return { icon: Sparkles, color: "text-[#8e52c8]", bg: "bg-[#f4eefb]" };
      case "verification":
        return { icon: ShieldCheck, color: "text-[#239879]", bg: "bg-[#e5f5ef]" };
      case "replacement":
        return { icon: AlertTriangle, color: "text-[#d64550]", bg: "bg-[#fdebec]" };
      default:
        return { icon: Activity, color: "text-[#3189b2]", bg: "bg-[#e7f1f7]" };
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      `${task.id} ${task.title} ${task.location} ${task.skills}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const maxWeekly = useMemo(() => {
    if (weeklyData.length === 0) return 27;
    const maxVal = Math.max(...weeklyData.map((w) => Math.max(w.created, w.completed)));
    return Math.max(20, maxVal);
  }, [weeklyData]);

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-[38px] pt-7 pb-12">
        {/* BREADCRUMB & BACKEND CONNECTION STATUS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={13} className="text-[#8296aa]" />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={13} className="text-[#8296aa]" />
            <span className="font-semibold text-[#123c5b]">Volunteer Coordination Dashboard</span>
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
              title="Refresh dashboard"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[32px] md:text-[34px] font-normal tracking-tight">
              Volunteer Coordination Dashboard
            </h1>
            <p className="text-[14px] text-[#718ba0] mt-1.5">
              Coordinate verified volunteers, urgent tasks, schedules, and field activity in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportSummary}
              className="h-[46px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-[12px] flex items-center gap-2 text-[#287fa9] hover:bg-[#f5fafc] transition-colors"
            >
              <Download size={16} />
              <span>Export summary</span>
            </button>

            <button
              onClick={() => navigate("/volunteer/tasks")}
              className="h-[46px] px-4 bg-[#287fa9] text-white rounded-lg text-[12px] font-semibold flex items-center gap-2 hover:bg-[#17678e] transition-colors shadow-xs"
            >
              <Plus size={17} />
              <span>Create task</span>
            </button>
          </div>
        </div>

        {/* DEMONSTRATION ALERT */}
        <div className="bg-[#effaf6] border border-[#bde8d8] rounded-xl px-5 py-3.5 flex items-center gap-3 mb-5">
          <Check size={16} className="text-[#39a98a] shrink-0" />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-[#23896f]">
              Demonstration operations data
            </p>
            <p className="text-[11px] text-[#4c947e] mt-0.5">
              {operationsAlert}
            </p>
          </div>
          <span className="text-[10px] text-[#8296aa] shrink-0">
            {isLiveBackend ? "Live API synced" : "Offline cached"}
          </span>
        </div>

        {/* STATISTICS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {isLoading ? (
            <div className="col-span-4 bg-white p-8 rounded-xl border border-[#d5e3e9] flex justify-center items-center gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin text-[#287fa9]" />
              <span className="text-xs">Loading coordination metrics...</span>
            </div>
          ) : (
            stats.map((stat) => {
              const Icon = getStatIcon(stat.key);
              const colorClasses = getStatColorClasses(stat.color);

              return (
                <div
                  key={stat.title}
                  className="bg-white border border-[#d5e3e9] rounded-xl px-4 py-4 flex items-center gap-3.5 shadow-xs min-h-[82px]"
                >
                  <div
                    className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 ${colorClasses.bg}`}
                  >
                    <Icon size={19} className={colorClasses.color} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-[#8296aa] truncate">{stat.title}</p>
                    <h2 className="text-[22px] font-bold leading-tight text-[#123c5b] mt-0.5">
                      {stat.value}
                    </h2>
                    <p className="text-[10px] text-[#8296aa] mt-0.5 truncate">{stat.subtitle}</p>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* FIRST ROW: SKILL AVAILABILITY & WEEKLY ACTIVITY CHART */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4 mb-5">
          {/* VOLUNTEER AVAILABILITY */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#d5e3e9] flex justify-between items-center">
              <div>
                <h2 className="text-[15px] font-semibold text-[#123c5b]">Volunteer availability</h2>
                <p className="text-[11px] text-[#8296aa] mt-0.5">Available volunteers by skill group</p>
              </div>

              <button
                onClick={() => navigate("/volunteer/skills")}
                className="text-[11px] text-[#287fa9] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>View skills</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3.5">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[12px] font-medium text-[#123c5b]">{skill.name}</p>
                    <span className="text-[11px] text-[#8296aa]">
                      {skill.available} available ({skill.percentage}%)
                    </span>
                  </div>

                  <div className="h-[6px] bg-[#e7eef1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#62b9a0] rounded-full transition-all duration-300"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WEEKLY TASK CHART */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#d5e3e9] flex justify-between items-center">
              <div>
                <h2 className="text-[15px] font-semibold text-[#123c5b]">Tasks this week</h2>
                <p className="text-[11px] text-[#8296aa] mt-0.5">Created vs completed tasks</p>
              </div>

              <span className="bg-[#e5f5ef] text-[#299879] rounded px-2 py-1 text-[10px] font-semibold">
                89.4% completion
              </span>
            </div>

            <div className="px-5 pt-5 pb-4">
              <div className="relative h-[160px]">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="border-t border-[#edf1f3] w-full" />
                  ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex justify-around items-end">
                  {weeklyData.map((item) => (
                    <div key={item.day} className="flex flex-col items-center justify-end h-full w-8">
                      <div className="flex items-end gap-[4px] h-[135px]">
                        <div
                          className="w-[8px] bg-[#287fa9] rounded-t-sm hover:bg-[#145d82] transition-colors"
                          style={{ height: `${(item.created / maxWeekly) * 100}%` }}
                          title={`${item.created} tasks created`}
                        />
                        <div
                          className="w-[8px] bg-[#62b9a0] rounded-t-sm hover:bg-[#399b81] transition-colors"
                          style={{ height: `${(item.completed / maxWeekly) * 100}%` }}
                          title={`${item.completed} tasks completed`}
                        />
                      </div>
                      <span className="text-[10px] text-[#8296aa] mt-2 font-medium">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#287fa9]" />
                  <span className="text-[11px] text-[#8296aa]">Created</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#62b9a0]" />
                  <span className="text-[11px] text-[#8296aa]">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECOND ROW: URGENT TASKS & LIVE COORDINATION ACTIVITY */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4 mb-5">
          {/* URGENT TASKS */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#123c5b]">Urgent open tasks</h2>
                <p className="text-[11px] text-[#8296aa] mt-0.5">Require volunteers or coordinator action</p>
              </div>

              <button
                onClick={() => navigate("/volunteer/tasks")}
                className="text-[11px] text-[#287fa9] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-[#f5f8f9] border-b border-[#e1eaf0]">
                  <tr className="text-[10px] text-[#8296aa]">
                    <th className="px-3.5 py-3 font-medium">Task</th>
                    <th className="px-3.5 py-3 font-medium">Title</th>
                    <th className="px-3.5 py-3 font-medium">Location</th>
                    <th className="px-3.5 py-3 font-medium">Skills</th>
                    <th className="px-3.5 py-3 font-medium">Priority</th>
                    <th className="px-3.5 py-3 font-medium">Schedule</th>
                    <th className="px-3.5 py-3 font-medium">Filled</th>
                    <th className="px-3.5 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 w-6"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                    >
                      <td className="px-3.5 py-3.5 text-[10px] font-semibold text-[#17648e] whitespace-nowrap">
                        {task.id}
                      </td>
                      <td className="px-3.5 py-3.5 text-[10px] font-medium text-[#123c5b] whitespace-nowrap">
                        {task.title}
                      </td>
                      <td className="px-3.5 py-3.5 text-[10px] text-[#557086] whitespace-nowrap">
                        {task.location}
                      </td>
                      <td className="px-3.5 py-3.5 text-[10px] text-[#557086] whitespace-nowrap">
                        {task.skills}
                      </td>
                      <td className="px-3.5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold ${priorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3.5 py-3.5 text-[10px] text-[#557086] whitespace-nowrap">
                        {task.schedule}
                      </td>
                      <td className="px-3.5 py-3.5 text-[10px] font-semibold text-[#123c5b] whitespace-nowrap">
                        {task.filled}
                      </td>
                      <td className="px-3.5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap ${statusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <ChevronRight size={14} className="text-[#8296aa]" />
                      </td>
                    </tr>
                  ))}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-xs text-gray-400">
                        No urgent open tasks currently found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LIVE ACTIVITY */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#d5e3e9] flex justify-between items-center">
              <div>
                <h2 className="text-[15px] font-semibold text-[#123c5b]">Live coordination activity</h2>
                <p className="text-[11px] text-[#8296aa] mt-0.5">Across all volunteer response teams</p>
              </div>

              <span className="bg-[#e5f5ef] text-[#299879] rounded px-2 py-1 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#299879] animate-pulse" />
                <span>Live</span>
              </span>
            </div>

            <div>
              {activities.map((item, index) => {
                const activityStyle = getActivityIcon(item.type);
                const Icon = activityStyle.icon;

                return (
                  <div
                    key={item.id || index}
                    className="px-4 py-3.5 flex items-center gap-3 border-b border-[#e1eaf0] hover:bg-[#f8fbfc] transition-colors"
                  >
                    <div
                      className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center shrink-0 ${activityStyle.bg}`}
                    >
                      <Icon size={16} className={activityStyle.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#123c5b] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#8296aa] mt-0.5 truncate">{item.description}</p>
                    </div>

                    <span className="text-[9px] text-[#8296aa] whitespace-nowrap">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <h2 className="text-[15px] font-semibold text-[#123c5b] mb-3">Quick actions</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="bg-white border border-[#d5e3e9] hover:border-[#62b9a0] hover:bg-[#f8fcfa] rounded-lg px-3 py-3.5 flex items-center gap-2.5 transition-all group shadow-2xs text-left cursor-pointer"
                >
                  <div className="w-[32px] h-[32px] bg-[#e5f5ef] rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon size={16} className="text-[#42a58c]" />
                  </div>

                  <span className="text-[11px] font-semibold text-[#123c5b] flex-1">
                    {action.title}
                  </span>

                  <ChevronRight size={13} className="text-[#8296aa] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* TASK DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-[440px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#17648e] bg-[#e8f1f6] px-2 py-0.5 rounded">
                  {selectedTask.id}
                </span>
                <h2 className="text-[16px] font-semibold text-[#123c5b] mt-1">Task details</h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-[15px] font-semibold text-[#123c5b]">{selectedTask.title}</h3>

              <div className="flex items-center gap-2.5 text-xs">
                <MapPin size={15} className="text-[#287fa9]" />
                <span className="text-[#557086]">{selectedTask.location}</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Users size={15} className="text-[#287fa9]" />
                <span className="text-[#557086]">{selectedTask.skills}</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <CalendarDays size={15} className="text-[#287fa9]" />
                <span className="text-[#557086]">{selectedTask.schedule}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold ${priorityStyle(
                    selectedTask.priority
                  )}`}
                >
                  {selectedTask.priority} Priority
                </span>

                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold ${statusStyle(
                    selectedTask.status
                  )}`}
                >
                  {selectedTask.status}
                </span>
              </div>

              <div className="bg-[#f3f7f9] p-3.5 rounded-lg border border-[#e1eaf0]">
                <p className="text-[11px] text-gray-500 font-medium">Volunteer Allocation</p>
                <p className="text-[20px] font-bold text-[#123c5b] mt-0.5">{selectedTask.filled}</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#e1eaf0] flex justify-between items-center bg-[#fafcfd]">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  navigate("/volunteer/tasks");
                }}
                className="text-xs text-[#287fa9] hover:underline font-semibold"
              >
                Open in Tasks page →
              </button>

              <button
                onClick={() => setSelectedTask(null)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check size={14} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        title="Help & Support"
        className="fixed bottom-4 right-4 bg-[#282828] hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
      >
        <HelpCircle size={19} />
      </button>
    </div>
  );
}
