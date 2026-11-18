export type ActivityType =
  | "Checked in"
  | "Progress update"
  | "Break started"
  | "Assignment accepted"
  | "Training completed"
  | "Checked out";

export interface ActivityRecord {
  id: string;
  time: string;
  volunteer: string;
  activity: ActivityType;
  task: string;
  location: string;
  verification: string;
  notes?: string;
  createdAt?: string;
}

export interface PresenceArea {
  name: string;
  count: number;
  position: string;
}

export interface FieldPresenceSummaryDto {
  medicalTeams: number;
  logistics: number;
  shelterSupport: number;
  areas: PresenceArea[];
}

export interface ActivityTrackingStatsDto {
  volunteersCheckedIn: number;
  hoursToday: string;
  tasksOnTrack: string;
  safetyAlerts: number;
  lastSync: string;
  operationalAreasCount: number;
  presenceSummary: FieldPresenceSummaryDto;
}

export interface ActivityTrackingQueryDto {
  search?: string;
  activity?: string;
  location?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ManualCheckInRequest {
  volunteer: string;
  task: string;
  location: string;
  verification: string;
}

export interface RecordActivityRequest {
  volunteer: string;
  activity: ActivityType;
  task: string;
  location: string;
  verification: string;
}

export interface UpdateActivityRequest {
  volunteer?: string;
  activity?: ActivityType;
  task?: string;
  location?: string;
  verification?: string;
  notes?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
