export type SafetyUpdateLevel =
  | "Emergency alert"
  | "Warning"
  | "Service update"
  | "Advisory"
  | string;

export type SafetyUpdateSeverity = "Critical" | "High" | "Medium" | "Low";

export interface SafetyUpdate {
  id: string | number;
  type: string;
  level: SafetyUpdateLevel;
  severity: SafetyUpdateSeverity;
  title: string;
  description: string;
  location: string;
  area: string;
  time: string;
  source: string;
  actionInstructions?: string;
  safeRoutes?: string[];
  hazardAreas?: string[];
  helpline?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface CreateSafetyUpdatePayload {
  title: string;
  description: string;
  level: SafetyUpdateLevel;
  severity?: SafetyUpdateSeverity;
  type?: string;
  location: string;
  area: string;
  source?: string;
  actionInstructions?: string;
  safeRoutes?: string[];
  hazardAreas?: string[];
  helpline?: string;
}

export interface SafetyUpdateSummary {
  totalUpdates: number;
  emergencyCount: number;
  warningsCount: number;
  serviceUpdatesCount: number;
  monitoredAreas: string[];
  lastUpdatedAt: string;
}

export interface SafetyUpdateFilterParams {
  area?: string;
  level?: string;
  search?: string;
}
