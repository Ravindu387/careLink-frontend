export type AssignmentStatus =
  | "Checked In"
  | "In Progress"
  | "Awaiting Acceptance"
  | "Completed";

export interface Assignment {
  id: string;
  volunteer: string;
  task: string;
  location: string;
  schedule: string;
  status: AssignmentStatus;
  progress: number;
  notes?: string;
  createdAt?: string;
}

export interface AssignmentsStatsDto {
  activeAssignments: number;
  awaitingAcceptance: number;
  checkedIn: number;
  replacementNeeded: number;
  tasksCount: number;
  expiringSoonAlert: string;
  checkedInRate: string;
}

export interface AssignmentsQueryDto {
  search?: string;
  status?: string;
  task?: string;
  location?: string;
  schedule?: string;
  progress?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateAssignmentRequest {
  volunteer: string;
  task: string;
  location: string;
  schedule: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  status?: AssignmentStatus;
  progress?: number;
  schedule?: string;
  location?: string;
  notes?: string;
}

export interface AssignmentOptionsDto {
  tasks: string[];
  locations: string[];
  schedules: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
