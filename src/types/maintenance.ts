export type Priority = "Critical" | "High" | "Medium" | "Low";

export type RequestStatus =
  | "In Progress"
  | "Assigned"
  | "Completed"
  | "Pending"
  | "On Hold";

export interface MaintenanceRequest {
  id: string;
  issue: string;
  category: string;
  shelter: string;
  room: string;
  reported: string;
  reportedAtUtc?: string;
  priority: Priority;
  technician: string;
  status: RequestStatus;
  description: string;
}

export interface MaintenanceSummary {
  criticalCount: number;
  inProgressCount: number;
  completedCount: number;
  pendingCount: number;
  onHoldCount: number;
  totalCount: number;
}

export interface MaintenanceMeta {
  categories: string[];
  technicians: string[];
  shelters: string[];
  priorities: Priority[];
  statuses: RequestStatus[];
}

export interface MaintenanceQueryParams {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  technician?: string;
  shelter?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateMaintenanceRequestInput {
  issue: string;
  category: string;
  shelter: string;
  room: string;
  priority: Priority;
  technician: string;
  description: string;
}

export interface UpdateMaintenanceRequestInput {
  issue?: string;
  category?: string;
  shelter?: string;
  room?: string;
  priority?: Priority;
  technician?: string;
  status?: RequestStatus;
  description?: string;
}
