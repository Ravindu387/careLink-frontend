import { authFetch } from "./api";
/**
 * Resource Service
 * Connects the Emergency Coordinator Resource Overview to the CareLink .NET backend.
 */

export interface ResourceItem {
  id: number;
  name: string;
  category: string;
  location: string;
  available: number;
  reserved: number;
  availability: number;
  status: "Healthy" | "Low Stock" | "Critical";
  unit?: string;
  lastRestocked?: string;
  updatedAt?: string;
}

export interface ResourceMetrics {
  availabilityPercent: number;
  totalWarehouses: number;
  criticalShortages: number;
  criticalShortagesSummary: string;
  activeDispatches: number;
  arrivingToday: number;
  pendingRequests: number;
  highPriorityRequests: number;
  lastUpdated: string;
}

export interface ResourceFilters {
  search?: string;
  area?: string;
  status?: string;
  availability?: string;
  category?: string;
}

export interface CreateResourceRequestPayload {
  resourceName: string;
  quantity: number;
  operationalArea: string;
  priority?: "Normal" | "High" | "Critical";
  notes?: string;
}

export interface ResourceRequestResponse {
  id: string;
  resourceName: string;
  quantity: number;
  operationalArea: string;
  priority: string;
  status: string;
  requestedBy: string;
  notes?: string;
  createdAt: string;
}

const DEFAULT_METRICS: ResourceMetrics = {
  availabilityPercent: 68,
  totalWarehouses: 12,
  criticalShortages: 3,
  criticalShortagesSummary: "Medical · transport",
  activeDispatches: 27,
  arrivingToday: 8,
  pendingRequests: 43,
  highPriorityRequests: 12,
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: 1,
    name: "Water - 10L",
    category: "Food & Water",
    location: "Central Depot",
    available: 8420,
    reserved: 3100,
    availability: 68,
    status: "Healthy",
    unit: "Bottles",
  },
  {
    id: 2,
    name: "Family Food Packs",
    category: "Food & Water",
    location: "North Hub",
    available: 1284,
    reserved: 940,
    availability: 42,
    status: "Low Stock",
    unit: "Packs",
  },
  {
    id: 3,
    name: "Shelter Kits",
    category: "Accommodation",
    location: "Eastbank Store",
    available: 342,
    reserved: 218,
    availability: 61,
    status: "Healthy",
    unit: "Kits",
  },
  {
    id: 4,
    name: "Trauma Kits",
    category: "Medical",
    location: "Central Depot",
    available: 86,
    reserved: 64,
    availability: 25,
    status: "Critical",
    unit: "Kits",
  },
  {
    id: 5,
    name: "Emergency Blankets",
    category: "Accommodation",
    location: "North Hub",
    available: 760,
    reserved: 240,
    availability: 75,
    status: "Healthy",
    unit: "Units",
  },
  {
    id: 6,
    name: "First Aid Kits",
    category: "Medical",
    location: "Eastbank Store",
    available: 125,
    reserved: 90,
    availability: 35,
    status: "Low Stock",
    unit: "Kits",
  },
];

const BASE_URL = "/api/resources";

export const resourceService = {
  async getAll(filters?: ResourceFilters): Promise<ResourceItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.area && filters.area !== "All operational areas") {
      params.append("area", filters.area);
    }
    if (filters?.status && filters.status !== "All statuses") {
      params.append("status", filters.status);
    }
    if (filters?.availability && filters.availability !== "Any availability") {
      params.append("availability", filters.availability);
    }
    if (filters?.category && filters.category !== "All categories") {
      params.append("category", filters.category);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    try {
      const response = await authFetch(`${BASE_URL}${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_RESOURCES.filter((r) => {
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const match =
            r.name.toLowerCase().includes(s) ||
            r.category.toLowerCase().includes(s) ||
            r.location.toLowerCase().includes(s);
          if (!match) return false;
        }
        if (filters?.area && filters.area !== "All operational areas") {
          if (r.location !== filters.area) return false;
        }
        if (filters?.status && filters.status !== "All statuses") {
          if (r.status !== filters.status) return false;
        }
        if (filters?.availability === "Above 60%" && r.availability <= 60) {
          return false;
        }
        if (filters?.availability === "Below 60%" && r.availability > 60) {
          return false;
        }
        return true;
      });
    }
  },

  async getMetrics(): Promise<ResourceMetrics> {
    try {
      const response = await authFetch(`${BASE_URL}/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_METRICS;
    }
  },

  async createRequest(payload: CreateResourceRequestPayload): Promise<ResourceRequestResponse> {
    const response = await authFetch(`${BASE_URL}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to submit request: ${err}`);
    }

    return await response.json();
  },

  async reset(): Promise<boolean> {
    try {
      const response = await authFetch(`${BASE_URL}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
