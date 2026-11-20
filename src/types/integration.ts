export type HealthStatus = "Operational" | "Degraded" | "Unavailable";

export interface Integration {
  id: string;
  name: string;
  type: string;
  availability: string;
  latency: string;
  latencyMs: number;
  health: HealthStatus;
  lastCheck: string;
  lastCheckedAt: string;
  icon: string;
  endpoint?: string;
  description?: string;
  version?: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  heading: string;
  description: string;
  timeAgo: string;
  timestamp: string;
  status: "Success" | "Warning" | "Error";
}

export interface PlatformHealthOverview {
  corePlatformStatus: HealthStatus;
  servicesHealthyPercentage: number;
  apiAvailability: string;
  medianLatency: string;
  totalServices: number;
  operationalCount: number;
  degradedCount: number;
  unavailableCount: number;
  lastChecked: string;
  lastCheckedAt: string;
}

export interface IntegrationActionRequest {
  actionTitle: string;
  environment: string;
  scope: string;
  approvalType: string;
  administrativeRationale: string;
}
