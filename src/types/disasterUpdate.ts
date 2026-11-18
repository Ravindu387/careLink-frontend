export type UpdateType =
  | "Critical"
  | "Warning"
  | "Announcement"
  | "Update";

export interface DisasterUpdate {
  id: string;
  type: UpdateType;
  title: string;
  description: string;
  source: string;
  date: string;
  time: string;
  location: string;
  publishedBy: string;
  instructions: string;
  archived: boolean;
  isDraft: boolean;
  createdAtUtc?: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  number: string;
}

export interface DisasterUpdateSummary {
  totalActive: number;
  criticalCount: number;
  warningCount: number;
  announcementCount: number;
  updateCount: number;
  archivedCount: number;
  draftCount: number;
  latestCriticalAlert: DisasterUpdate | null;
}

export interface DisasterUpdateQueryParams {
  search?: string;
  type?: string;
  archived?: boolean;
  isDraft?: boolean;
}

export interface CreateDisasterUpdateInput {
  title: string;
  type: UpdateType;
  description: string;
  location?: string;
  source?: string;
  publishedBy?: string;
  instructions?: string;
  isDraft?: boolean;
}
