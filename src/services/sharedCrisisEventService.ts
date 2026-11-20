export interface SharedCrisisEvent {
  id: string;
  event: string;
  type: string;
  severity: string;
  area: string;
  date: string;
  sectors: string;
  status: string;
  description?: string;
  coordinator?: string;
  districtsCovered?: number;
  affectedPeopleCount?: number;
}

export interface SharedCrisisMetrics {
  sharedEvents: number;
  sharedEventsSubtitle: string;
  majorResponse: number;
  majorResponseSubtitle: string;
  districtsCovered: number;
  districtsCoveredSubtitle: string;
  coordinationSectors: number;
  coordinationSectorsSubtitle: string;
  totalCount: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated: string;
}

export interface CreateCrisisAccessRequestPayload {
  eventName: string;
  reason: string;
  crisisId?: string;
  partnerName?: string;
}

export interface CrisisAccessRequestResponse {
  id: string;
  crisisId: string;
  eventName: string;
  partnerName: string;
  reason: string;
  status: string;
  submittedAt: string;
}

export interface SharedCrisisFilters {
  search?: string;
  tab?: string;
  type?: string;
  severity?: string;
  area?: string;
  status?: string;
}

const API_BASE_URL = "/api/shared-crisis-events";

class SharedCrisisEventService {
  private fallbackEvents: SharedCrisisEvent[] = [
    {
      id: "CR-2025-018",
      event: "Monsoon Floods 2025",
      type: "Flood",
      severity: "Level 4 - Major",
      area: "Greater Riverton",
      date: "18 Jun 2025",
      sectors: "Food · WASH · Shelter",
      status: "Active",
      description: "Extensive monsoon flooding along the Riverton basin affecting low-lying residential sectors.",
      coordinator: "Amina Mensah",
      districtsCovered: 3,
      affectedPeopleCount: 142000,
    },
    {
      id: "CR-2025-014",
      event: "North Ridge Landslide",
      type: "Landslide",
      severity: "Level 3 - Severe",
      area: "North District",
      date: "12 Jun 2025",
      sectors: "Shelter · Protection",
      status: "Monitoring",
      description: "Slope failure along North Ridge Highway causing localized evacuations and road closures.",
      coordinator: "Joseph Okafor",
      districtsCovered: 1,
      affectedPeopleCount: 18000,
    },
    {
      id: "CR-2025-009",
      event: "Dengue Outbreak",
      type: "Disease",
      severity: "Level 2 - Moderate",
      area: "Eastbank",
      date: "28 May 2025",
      sectors: "Community Health",
      status: "Active",
      description: "Seasonal mosquito-borne infection surge across high-density urban sectors in Eastbank.",
      coordinator: "Dr. M. Rao",
      districtsCovered: 2,
      affectedPeopleCount: 21500,
    },
    {
      id: "CR-2025-004",
      event: "Coastal Storm Response",
      type: "Storm",
      severity: "Level 1 - Low",
      area: "West Coast",
      date: "14 Apr 2025",
      sectors: "Food Assistance",
      status: "Completed",
      description: "Post-tropical coastal depression with localized power disruption, now fully restored.",
      coordinator: "Nadia Silva",
      districtsCovered: 1,
      affectedPeopleCount: 2500,
    },
    {
      id: "CR-2025-021",
      event: "Riverbank Flooding",
      type: "Flood",
      severity: "Level 3 - Severe",
      area: "South District",
      date: "22 Jun 2025",
      sectors: "Food · Shelter",
      status: "Active",
      description: "Secondary river overflow impacting agricultural settlements and rural transport routes.",
      coordinator: "Amina Mensah",
      districtsCovered: 1,
      affectedPeopleCount: 14500,
    },
    {
      id: "CR-2025-022",
      event: "Community Health Emergency",
      type: "Disease",
      severity: "Level 2 - Moderate",
      area: "East District",
      date: "25 Jun 2025",
      sectors: "Community Health",
      status: "Monitoring",
      description: "Localized waterborne infection monitoring following initial monsoon flood subsidence.",
      coordinator: "Dr. M. Rao",
      districtsCovered: 1,
      affectedPeopleCount: 8200,
    },
  ];

  private fallbackMetrics: SharedCrisisMetrics = {
    sharedEvents: 4,
    sharedEventsSubtitle: "3 currently active",
    majorResponse: 1,
    majorResponseSubtitle: "Level 4 operation",
    districtsCovered: 6,
    districtsCoveredSubtitle: "4 active now",
    coordinationSectors: 4,
    coordinationSectorsSubtitle: "All leads assigned",
    totalCount: 6,
    needsActionCount: 2,
    activeCount: 3,
    completedCount: 1,
    archivedCount: 0,
    lastUpdated: new Date().toISOString(),
  };

  public async getAll(filters?: SharedCrisisFilters): Promise<SharedCrisisEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
      if (filters?.type && filters.type !== "All event types") params.append("type", filters.type);
      if (filters?.severity && filters.severity !== "All severity levels") params.append("severity", filters.severity);
      if (filters?.area && filters.area !== "All operational areas") params.append("area", filters.area);
      if (filters?.status && filters.status !== "All statuses") params.append("status", filters.status);

      const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch shared crisis events: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      let filtered = [...this.fallbackEvents];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.event.toLowerCase().includes(q) ||
            c.area.toLowerCase().includes(q) ||
            c.sectors.toLowerCase().includes(q)
        );
      }
      if (filters?.tab && filters.tab !== "All") {
        if (filters.tab === "Active") {
          filtered = filtered.filter((c) => c.status === "Active");
        } else if (filters.tab === "Needs action") {
          filtered = filtered.filter((c) => c.status === "Monitoring");
        } else if (filters.tab === "Completed") {
          filtered = filtered.filter((c) => c.status === "Completed");
        } else if (filters.tab === "Archived") {
          filtered = filtered.filter((c) => c.status === "Archived");
        }
      }
      if (filters?.type && filters.type !== "All event types") {
        filtered = filtered.filter((c) => c.type === filters.type);
      }
      if (filters?.severity && filters.severity !== "All severity levels") {
        filtered = filtered.filter((c) => c.severity === filters.severity);
      }
      if (filters?.area && filters.area !== "All operational areas") {
        filtered = filtered.filter((c) => c.area === filters.area);
      }
      if (filters?.status && filters.status !== "All statuses") {
        filtered = filtered.filter((c) => c.status === filters.status);
      }
      return filtered;
    }
  }

  public async getMetrics(): Promise<SharedCrisisMetrics> {
    try {
      const res = await fetch(`${API_BASE_URL}/metrics`);
      if (!res.ok) {
        throw new Error(`Failed to fetch shared crisis metrics: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      return this.fallbackMetrics;
    }
  }

  public async getById(id: string): Promise<SharedCrisisEvent | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch crisis event ${id}`);
      }
      const data = await res.json();
      return {
        id: data.id,
        event: data.event || data.name,
        type: data.type,
        severity: data.severity,
        area: data.area,
        date: data.date || data.startDate,
        sectors: data.sectors || "Food · WASH · Shelter",
        status: data.status === "Resolved" ? "Completed" : data.status,
        description: data.description,
        coordinator: data.coordinator,
        districtsCovered: data.districtsCovered,
        affectedPeopleCount: data.affectedPeopleCount,
      };
    } catch {
      return this.fallbackEvents.find((c) => c.id === id) || null;
    }
  }

  public async requestAccess(payload: CreateCrisisAccessRequestPayload): Promise<CrisisAccessRequestResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/access-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Failed to submit crisis access request: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      return {
        id: `REQ-CR-${Math.floor(1000 + Math.random() * 9000)}`,
        crisisId: payload.crisisId || "",
        eventName: payload.eventName,
        partnerName: payload.partnerName || "Global Relief Network",
        reason: payload.reason,
        status: "Pending",
        submittedAt: new Date().toISOString(),
      };
    }
  }

  public async reset(): Promise<boolean> {
    try {
      const res = await fetch("/api/crisis-events/reset", {
        method: "POST",
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const sharedCrisisEventService = new SharedCrisisEventService();
