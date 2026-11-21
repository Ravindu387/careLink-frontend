export interface DashboardStatItem {
  title: string;
  value: string;
  subtitle: string;
  key: string;
  color: string;
}

export interface DashboardSkillAvailability {
  name: string;
  available: number;
  percentage: number;
}

export interface WeeklyTaskChartItem {
  day: string;
  created: number;
  completed: number;
}

export interface DashboardUrgentTask {
  id: string;
  title: string;
  location: string;
  skills: string;
  priority: "Critical" | "High" | "Medium";
  schedule: string;
  filled: string;
  status: "In Progress" | "Assigned" | "Open";
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: string;
  createdAt?: string;
}

export interface VolunteerDashboardOverviewResponse {
  stats: DashboardStatItem[];
  skills: DashboardSkillAvailability[];
  weeklyData: WeeklyTaskChartItem[];
  urgentTasks: DashboardUrgentTask[];
  recentActivities: DashboardActivityItem[];
  operationsAlert: string;
  lastUpdated: string;
}
