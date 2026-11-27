import { authFetch } from "./api";
export interface FieldActivity {
  id: string;
  name: string;
  location: string;
  scheduled: string;
  team: string;
  target: string;
  sector: string;
  status: string;
  description?: string;
  beneficiariesReached?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface FieldActivityMetrics {
  activeToday: number;
  peopleTargeted: string;
  peopleReachedToday: string;
  teamsDeployed: number;
  staffInField: number;
  updatesOverdue: number;
  totalActivities: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated: string;
}

export interface CreateFieldActivityPayload {
  name: string;
  location: string;
  scheduled: string;
  team: string;
  target: string;
  sector: string;
  status?: string;
  description?: string;
}

export interface UpdateFieldActivityPayload {
  name?: string;
  location?: string;
  scheduled?: string;
  team?: string;
  target?: string;
  sector?: string;
  status?: string;
  description?: string;
  beneficiariesReached?: number;
}

export interface FieldActivityFilters {
  search?: string;
  tab?: string;
  sector?: string;
  location?: string;
  team?: string;
  status?: string;
}

const API_BASE_URL = "/api/field-activities";

class FieldActivityService {
  private fallbackData: FieldActivity[] = [
    {
      id: "ACT-1042",
      name: "Household food distribution",
      location: "North Ward - Zone 3",
      scheduled: "22 Jun - 14:00",
      team: "Field Team North",
      target: "420 households",
      sector: "Food Security",
      status: "In Progress",
      description: "Dry rations pack and essential clean water packs delivered to vulnerable households.",
      beneficiariesReached: 380,
    },
    {
      id: "ACT-1038",
      name: "Water quality monitoring",
      location: "Eastbank - Sites 2–6",
      scheduled: "22 Jun - 12:30",
      team: "WASH Team 2",
      target: "5 water points",
      sector: "WASH",
      status: "Completed",
      description: "Routine water sample collection and chlorine residual testing across public boreholes.",
      beneficiariesReached: 750,
    },
    {
      id: "ACT-1034",
      name: "Protection desk",
      location: "Riverton High Shelter",
      scheduled: "22 Jun - 09:00",
      team: "Protection Team",
      target: "86 consultations",
      sector: "Protection",
      status: "Active",
      description: "Psychosocial first aid and child-friendly space monitoring desk.",
      beneficiariesReached: 86,
    },
    {
      id: "ACT-1029",
      name: "Health awareness session",
      location: "Eastbank Community Centre",
      scheduled: "21 Jun - 16:00",
      team: "Health Outreach",
      target: "124 participants",
      sector: "Health",
      status: "Completed",
      description: "Hygiene awareness and cholera prevention demonstration.",
      beneficiariesReached: 124,
    },
    {
      id: "ACT-1025",
      name: "Emergency shelter assessment",
      location: "North Ward - Zone 2",
      scheduled: "23 Jun - 10:00",
      team: "Field Team North",
      target: "60 households",
      sector: "Shelter",
      status: "Scheduled",
      description: "Structural safety assessment and emergency tarpaulin kit distribution planning.",
      beneficiariesReached: 0,
    },
    {
      id: "ACT-1020",
      name: "Community food outreach",
      location: "South Ward",
      scheduled: "23 Jun - 13:00",
      team: "Food Support Team",
      target: "200 families",
      sector: "Food Security",
      status: "Active",
      description: "Supplementary nutrition distribution for pregnant and lactating mothers.",
      beneficiariesReached: 140,
    },
  ];

  async getAll(filters?: FieldActivityFilters): Promise<FieldActivity[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
      if (filters?.sector && filters.sector !== "All sectors") params.append("sector", filters.sector);
      if (filters?.location && filters.location !== "All locations") params.append("location", filters.location);
      if (filters?.team && filters.team !== "All teams") params.append("team", filters.team);
      if (filters?.status && filters.status !== "All statuses") params.append("status", filters.status);

      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch field activities: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Using fallback field activities data:", err);
      let list = [...this.fallbackData];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((a) =>
          [a.id, a.name, a.location, a.team, a.target, a.sector].some((v) =>
            v.toLowerCase().includes(q)
          )
        );
      }
      if (filters?.tab && filters.tab !== "All") {
        if (filters.tab === "Needs action") {
          list = list.filter((a) => ["Scheduled", "Overdue"].includes(a.status));
        } else if (filters.tab === "Active") {
          list = list.filter((a) => ["Active", "In Progress"].includes(a.status));
        } else if (filters.tab === "Completed") {
          list = list.filter((a) => a.status === "Completed");
        } else if (filters.tab === "Archived") {
          list = list.filter((a) => a.status === "Archived");
        }
      }
      if (filters?.sector && filters.sector !== "All sectors") {
        list = list.filter((a) => a.sector.toLowerCase() === filters.sector!.toLowerCase());
      }
      if (filters?.location && filters.location !== "All locations") {
        list = list.filter((a) => a.location.toLowerCase().includes(filters.location!.toLowerCase()));
      }
      if (filters?.team && filters.team !== "All teams") {
        list = list.filter((a) => a.team.toLowerCase() === filters.team!.toLowerCase());
      }
      if (filters?.status && filters.status !== "All statuses") {
        list = list.filter((a) => a.status.toLowerCase() === filters.status!.toLowerCase());
      }
      return list;
    }
  }

  async getMetrics(): Promise<FieldActivityMetrics> {
    try {
      const response = await authFetch(`${API_BASE_URL}/metrics`);
      if (!response.ok) {
        throw new Error(`Failed to fetch field activity metrics: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Using fallback metrics:", err);
      const items = this.fallbackData;
      return {
        activeToday: items.filter((a) => ["Active", "In Progress"].includes(a.status)).length,
        peopleTargeted: "4,840",
        peopleReachedToday: "1,864",
        teamsDeployed: 18,
        staffInField: 62,
        updatesOverdue: items.filter((a) => a.status === "Overdue").length || 2,
        totalActivities: items.length,
        needsActionCount: items.filter((a) => ["Scheduled", "Overdue"].includes(a.status)).length,
        activeCount: items.filter((a) => ["Active", "In Progress"].includes(a.status)).length,
        completedCount: items.filter((a) => a.status === "Completed").length,
        archivedCount: items.filter((a) => a.status === "Archived").length,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async getById(id: string): Promise<FieldActivity> {
    const response = await authFetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch field activity ${id}: ${response.statusText}`);
    }
    return await response.json();
  }

  async create(payload: CreateFieldActivityPayload): Promise<FieldActivity> {
    const response = await authFetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to create field activity: ${response.statusText}`);
    }
    return await response.json();
  }

  async update(id: string, payload: UpdateFieldActivityPayload): Promise<FieldActivity> {
    const response = await authFetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to update field activity: ${response.statusText}`);
    }
    return await response.json();
  }

  async updateStatus(id: string, status: string): Promise<FieldActivity> {
    const response = await authFetch(`${API_BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update activity status: ${response.statusText}`);
    }
    return await response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete field activity: ${response.statusText}`);
    }
  }

  async reset(): Promise<FieldActivityMetrics> {
    const response = await authFetch(`${API_BASE_URL}/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to reset field activities: ${response.statusText}`);
    }
    return await response.json();
  }
}

export const fieldActivityService = new FieldActivityService();
