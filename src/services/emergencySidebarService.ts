import { authFetch } from "./api";
/**
 * Emergency Sidebar Service
 * Connects the emergency coordinator sidebar to the CareLink .NET backend.
 */

export interface CoordinatorProfile {
  id: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  dutyStatus: string;
  operationalArea: string;
  badgeNumber: string;
  phone: string;
  shiftStartedAt: string;
  shiftDuration: string;
}

export interface ActiveCrisisSummary {
  id: string;
  name: string;
  shortTitle: string;
  type: string;
  severity: string;
  level: number;
  operationalArea: string;
  status: string;
  affectedPeople: number;
  formattedAffectedPeople: string;
  startedDate: string;
}

export interface SidebarBadgeCounts {
  crisisEvents: number;
  assistanceRequests: number;
  priorityQueue: number;
  aiRecommendations: number;
  notifications: number;
  auditTimeline: number;
}

export interface SystemReadiness {
  status: string;
  isActiveResponse: boolean;
  lastSyncedAt: string;
  activeOperationsCount: number;
  heartbeat: string;
}

export interface EmergencySidebarState {
  coordinator: CoordinatorProfile;
  activeCrisis: ActiveCrisisSummary;
  badges: SidebarBadgeCounts;
  system: SystemReadiness;
}

const DEFAULT_STATE: EmergencySidebarState = {
  coordinator: {
    id: "COORD-001",
    name: "Amina Mensah",
    role: "Emergency Coordinator",
    initials: "AM",
    email: "amina.mensah@reliefos.org",
    dutyStatus: "On Duty",
    operationalArea: "Greater Riverton",
    badgeNumber: "EC-8842",
    phone: "+94 77 123 4567",
    shiftStartedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    shiftDuration: "4h 15m",
  },
  activeCrisis: {
    id: "CR-2025-001",
    name: "Western Province Monsoon Flash Floods 2025",
    shortTitle: "Monsoon Floods 2025",
    type: "Flood",
    severity: "Severe · Level 4",
    level: 4,
    operationalArea: "Greater Riverton",
    status: "Active",
    affectedPeople: 112000,
    formattedAffectedPeople: "112K",
    startedDate: "2025-10-12",
  },
  badges: {
    crisisEvents: 3,
    assistanceRequests: 86,
    priorityQueue: 12,
    aiRecommendations: 8,
    notifications: 14,
    auditTimeline: 0,
  },
  system: {
    status: "Operational · Level 4",
    isActiveResponse: true,
    lastSyncedAt: new Date().toISOString(),
    activeOperationsCount: 3,
    heartbeat: "Healthy",
  },
};

const BASE_URL = "/api/emergency-sidebar";

export const emergencySidebarService = {
  async getState(): Promise<EmergencySidebarState> {
    try {
      const response = await authFetch(BASE_URL, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return DEFAULT_STATE;
    }
  },

  async updateDutyStatus(dutyStatus: string): Promise<CoordinatorProfile> {
    try {
      const response = await authFetch(`${BASE_URL}/duty-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ dutyStatus }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return {
        ...DEFAULT_STATE.coordinator,
        dutyStatus,
      };
    }
  },

  async setActiveCrisis(crisisId: string): Promise<ActiveCrisisSummary> {
    try {
      const response = await authFetch(`${BASE_URL}/active-crisis/${encodeURIComponent(crisisId)}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return {
        ...DEFAULT_STATE.activeCrisis,
        id: crisisId,
      };
    }
  },

  async markNotificationRead(): Promise<number> {
    try {
      const response = await authFetch(`${BASE_URL}/notifications/read`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      return data.remainingCount ?? 13;
    } catch {
      return 13;
    }
  },

  async resetState(): Promise<EmergencySidebarState> {
    try {
      const response = await authFetch(`${BASE_URL}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return DEFAULT_STATE;
    }
  },
};
