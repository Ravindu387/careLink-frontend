import { request, authFetch } from "./api";
import type {
  VolunteerDashboardOverviewResponse,
  DashboardStatItem,
  DashboardSkillAvailability,
  WeeklyTaskChartItem,
  DashboardUrgentTask,
  DashboardActivityItem,
} from "../types/volunteerDashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialStats: DashboardStatItem[] = [
  { title: "Registered volunteers", value: "2,418", subtitle: "+84 this week", key: "registered_volunteers", color: "blue" },
  { title: "Available now", value: "642", subtitle: "Within affected areas", key: "available_now", color: "green" },
  { title: "Active assignments", value: "387", subtitle: "92% accepted", key: "active_assignments", color: "blue" },
  { title: "Open tasks", value: "74", subtitle: "18 urgent", key: "open_tasks", color: "amber" },
  { title: "Pending verification", value: "18", subtitle: "4 high priority", key: "pending_verification", color: "amber" },
  { title: "Task completion", value: "89.4%", subtitle: "+2.3% this week", key: "task_completion", color: "green" },
  { title: "Hours contributed", value: "14,280", subtitle: "Current reporting period", key: "hours_contributed", color: "blue" },
  { title: "Safety alerts", value: "3", subtitle: "1 action required", key: "safety_alerts", color: "red" },
];

const initialSkills: DashboardSkillAvailability[] = [
  { name: "Logistics & distribution", available: 184, percentage: 84 },
  { name: "First aid & medical", available: 96, percentage: 70 },
  { name: "Driving & transport", available: 128, percentage: 81 },
  { name: "Shelter support", available: 142, percentage: 80 },
  { name: "Translation", available: 52, percentage: 58 },
  { name: "Search & rescue", available: 40, percentage: 57 },
];

const initialWeeklyData: WeeklyTaskChartItem[] = [
  { day: "Mon", created: 12, completed: 9 },
  { day: "Tue", created: 16, completed: 11 },
  { day: "Wed", created: 14, completed: 10 },
  { day: "Thu", created: 20, completed: 17 },
  { day: "Fri", created: 18, completed: 15 },
  { day: "Sat", created: 25, completed: 21 },
  { day: "Today", created: 17, completed: 11 },
];

const initialUrgentTasks: DashboardUrgentTask[] = [
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

const initialActivities: DashboardActivityItem[] = [
  {
    id: "ACT-1",
    title: "Volunteer checked in",
    description: "Elena Rossi · TASK-782",
    time: "4 min",
    type: "checkin",
  },
  {
    id: "ACT-2",
    title: "AI match ready for review",
    description: "TASK-774 · 6 candidates",
    time: "12 min",
    type: "ai_match",
  },
  {
    id: "ACT-3",
    title: "Verification approved",
    description: "Maya Fernando · Nursing",
    time: "19 min",
    type: "verification",
  },
  {
    id: "ACT-4",
    title: "Task needs replacement",
    description: "TASK-768 · North Ward",
    time: "27 min",
    type: "replacement",
  },
];

function getCachedOverview(): VolunteerDashboardOverviewResponse {
  try {
    const raw = localStorage.getItem("carelink_volunteer_dashboard");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  return {
    stats: initialStats,
    skills: initialSkills,
    weeklyData: initialWeeklyData,
    urgentTasks: initialUrgentTasks,
    recentActivities: initialActivities,
    operationsAlert: "Realistic sample records for the Greater Riverton flood response.",
    lastUpdated: new Date().toISOString(),
  };
}

export const volunteerDashboardService = {
  /**
   * Retrieves full dashboard overview
   */
  async getOverview(): Promise<{ data: VolunteerDashboardOverviewResponse; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerDashboardOverviewResponse>("/volunteer/dashboard/summary");
      if (response && response.success && response.data) {
        localStorage.setItem("carelink_volunteer_dashboard", JSON.stringify(response.data));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    return {
      data: getCachedOverview(),
      isLiveBackend: false,
    };
  },

  /**
   * Exports dashboard summary
   */
  async exportSummary(): Promise<Blob> {
    try {
      const res = await authFetch(`${API_BASE_URL}/volunteer/dashboard/export`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const overview = getCachedOverview();
    const report = [
      "Volunteer Coordination Dashboard Summary",
      `Generated: ${new Date().toLocaleString()}`,
      "----------------------------------------",
      "",
      "KEY METRICS:",
      ...overview.stats.map((s) => `${s.title}: ${s.value} (${s.subtitle})`),
      "",
      "SKILL AVAILABILITY:",
      ...overview.skills.map((sk) => `${sk.name}: ${sk.available} available (${sk.percentage}%)`),
      "",
      "URGENT OPEN TASKS:",
      ...overview.urgentTasks.map((t) => `${t.id},${t.title},${t.location},${t.priority},${t.status}`),
    ].join("\n");

    return new Blob([report], { type: "text/plain;charset=utf-8;" });
  },
};
