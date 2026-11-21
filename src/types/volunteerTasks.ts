export type Priority = "Critical" | "High" | "Medium" | "Low";

export type TaskStatus =
  | "In Progress"
  | "Assigned"
  | "Open"
  | "Awaiting Acceptance"
  | "Completed";

export interface VolunteerTaskItem {
  id: string;
  title: string;
  location: string;
  skills: string[];
  priority: Priority;
  schedule: string;
  volunteers: string;
  requiredVolunteers?: number;
  assignedVolunteers?: number;
  status: TaskStatus;
  createdAt?: string;
}

export interface VolunteerTaskQuery {
  tab?: string;
  search?: string;
  priority?: string;
  location?: string;
  skill?: string;
  schedule?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface VolunteerTaskTabsCount {
  allTasks: number;
  open: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

export interface CreateVolunteerTaskPayload {
  title: string;
  location: string;
  skills: string[];
  priority: Priority;
  date: string;
  time: string;
  volunteers: number | string;
}

export interface UpdateVolunteerTaskPayload {
  title?: string;
  location?: string;
  skills?: string[];
  priority?: Priority;
  schedule?: string;
  requiredVolunteers?: number;
  assignedVolunteers?: number;
  status?: TaskStatus;
}

export interface VolunteerTasksOverviewResponse {
  tasks: VolunteerTaskItem[];
  tabCounts: VolunteerTaskTabsCount;
  locations: string[];
  skillGroups: string[];
  priorities: string[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
