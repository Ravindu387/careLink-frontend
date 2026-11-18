export type Severity = "Critical" | "High" | "Medium" | "Low";

export type IncidentStatus =
  | "Action Required"
  | "Under Investigation"
  | "Resolved";

export interface HealthSafetyIncident {
  id: string;
  type: string;
  location: string;
  reportedBy: string;
  date: string;
  time: string;
  severity: Severity;
  assignedStaff: string;
  status: IncidentStatus;
  description: string;
  incidentDateUtc?: string;
}

export interface SafetyCheckItem {
  id: number;
  title: string;
  description: string;
  color: string;
  iconKey: string;
}

export interface HealthSafetySummary {
  actionRequired: number;
  underInvestigation: number;
  resolved: number;
  total: number;
  safetyChecks: SafetyCheckItem[];
}

export interface HealthSafetyMeta {
  incidentTypes: string[];
  staffMembers: string[];
  severities: Severity[];
  statuses: IncidentStatus[];
}

export interface HealthSafetyQueryParams {
  search?: string;
  type?: string;
  severity?: string;
  status?: string;
  dateRange?: string;
  shelterId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateHealthSafetyIncidentInput {
  type: string;
  location: string;
  reportedBy: string;
  severity?: string;
  assignedStaff?: string;
  description: string;
}

export interface UpdateHealthSafetyIncidentInput {
  assignedStaff?: string;
  severity?: string;
  status?: string;
  description?: string;
  location?: string;
}
