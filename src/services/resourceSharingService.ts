import { authFetch } from "./api";
export interface ResourceSharingCommitment {
  id: string;
  resource: string;
  quantity: number;
  source: string;
  destination: string;
  partner: string;
  scheduled: string;
  status: string;
  type: string;
  location: string;
  description?: string;
  contactPerson?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceSharingMetrics {
  activeCommitments: number;
  activeCommitmentsSubtitle: string;
  unitsCommitted: string;
  unitsCommittedSubtitle: string;
  deliveredThisWeek: string;
  deliveredThisWeekSubtitle: string;
  exceptions: number;
  exceptionsSubtitle: string;
  totalCommitments: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated: string;
}

export interface CreateResourceSharingPayload {
  resource: string;
  quantity: number;
  source: string;
  destination: string;
  partner?: string;
  scheduled?: string;
  status?: string;
  type: string;
  location: string;
  description?: string;
  contactPerson?: string;
}

export interface UpdateResourceSharingPayload {
  resource?: string;
  quantity?: number;
  source?: string;
  destination?: string;
  partner?: string;
  scheduled?: string;
  status?: string;
  type?: string;
  location?: string;
  description?: string;
  contactPerson?: string;
}

export interface ResourceSharingFilters {
  search?: string;
  tab?: string;
  type?: string;
  location?: string;
  partner?: string;
  status?: string;
}

const API_BASE_URL = "/api/resource-sharing";

class ResourceSharingService {
  private fallbackCommitments: ResourceSharingCommitment[] = [
    {
      id: "COM-1048",
      resource: "Family Food Packs",
      quantity: 500,
      source: "North District Hub",
      destination: "North Ward Shelters",
      partner: "Global Relief Network",
      scheduled: "22 Jun - 14:10",
      status: "In Transit",
      type: "Food",
      location: "North District",
      description: "Emergency family dry food rations with high-calorie biscuits and cooking essentials.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "COM-1044",
      resource: "Hygiene Kits",
      quantity: 300,
      source: "Eastbank Store",
      destination: "Eastbank Communities",
      partner: "CareLink Network",
      scheduled: "22 Jun - 13:48",
      status: "Approved",
      type: "Health",
      location: "Eastbank",
      description: "Essential personal hygiene kits containing soap, toothbrushes, towels, and sanitizer packs.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "COM-1039",
      resource: "Water Purification Tablets",
      quantity: 20000,
      source: "Central Hub",
      destination: "North Ward",
      partner: "Global Relief Network",
      scheduled: "22 Jun - 12:14",
      status: "Partial Delivery",
      type: "WASH",
      location: "North District",
      description: "Bulk water disinfection tablets for distribution to flooded residential communities.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "COM-1035",
      resource: "Emergency Medical Kits",
      quantity: 150,
      source: "Medical Store",
      destination: "Riverside Hospital",
      partner: "Health Support Foundation",
      scheduled: "21 Jun - 16:30",
      status: "Delivered",
      type: "Health",
      location: "Greater Riverton",
      description: "Trauma response bandages, antiseptic, burn dressings, and IV starter sets.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "COM-1028",
      resource: "Emergency Shelter Tents",
      quantity: 80,
      source: "South Logistics Hub",
      destination: "Coastal Relief Camp",
      partner: "Global Relief Network",
      scheduled: "21 Jun - 11:20",
      status: "Pending Approval",
      type: "Shelter",
      location: "West Coast",
      description: "Weather-resistant 6-person family shelters with groundsheet and installation frame.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "COM-1021",
      resource: "Drinking Water Bottles",
      quantity: 1000,
      source: "Eastbank Store",
      destination: "Eastbank Communities",
      partner: "CareLink Network",
      scheduled: "20 Jun - 09:15",
      status: "Completed",
      type: "WASH",
      location: "Eastbank",
      description: "Bottled clean mineral drinking water pallets for community evacuation point.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "COM-1014",
      resource: "Heavy Duty Water Pumps",
      quantity: 5,
      source: "Central Depot",
      destination: "Sub-Sector 4",
      partner: "Global Relief Network",
      scheduled: "19 Jun - 08:30",
      status: "Archived",
      type: "WASH",
      location: "North District",
      description: "High-flow submersible dewatering pumps for residential basement clearance.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private fallbackMetrics: ResourceSharingMetrics = {
    activeCommitments: 12,
    activeCommitmentsSubtitle: "5 in delivery",
    unitsCommitted: "24.8K",
    unitsCommittedSubtitle: "Across 8 categories",
    deliveredThisWeek: "18.4K",
    deliveredThisWeekSubtitle: "96% confirmed",
    exceptions: 3,
    exceptionsSubtitle: "Partial or delayed",
    totalCommitments: 7,
    needsActionCount: 2,
    activeCount: 2,
    completedCount: 2,
    archivedCount: 1,
    lastUpdated: new Date().toISOString(),
  };

  public async getAll(filters?: ResourceSharingFilters): Promise<ResourceSharingCommitment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
      if (filters?.type && filters.type !== "All resource types") params.append("type", filters.type);
      if (filters?.location && filters.location !== "All locations") params.append("location", filters.location);
      if (filters?.partner && filters.partner !== "All partners") params.append("partner", filters.partner);
      if (filters?.status && filters.status !== "All statuses") params.append("status", filters.status);

      const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
      const res = await authFetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch commitments: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      let filtered = [...this.fallbackCommitments];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(q) ||
            item.resource.toLowerCase().includes(q) ||
            item.source.toLowerCase().includes(q) ||
            item.destination.toLowerCase().includes(q) ||
            item.partner.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q)
        );
      }
      if (filters?.tab && filters.tab !== "All") {
        if (filters.tab === "Needs action") {
          filtered = filtered.filter((i) => ["Pending Approval", "Partial Delivery"].includes(i.status));
        } else if (filters.tab === "Active") {
          filtered = filtered.filter((i) => ["Approved", "In Transit"].includes(i.status));
        } else if (filters.tab === "Completed") {
          filtered = filtered.filter((i) => ["Delivered", "Completed"].includes(i.status));
        } else if (filters.tab === "Archived") {
          filtered = filtered.filter((i) => i.status === "Archived");
        }
      }
      if (filters?.type && filters.type !== "All resource types") {
        filtered = filtered.filter((i) => i.type === filters.type);
      }
      if (filters?.location && filters.location !== "All locations") {
        filtered = filtered.filter((i) => i.location === filters.location);
      }
      if (filters?.partner && filters.partner !== "All partners") {
        filtered = filtered.filter((i) => i.partner === filters.partner);
      }
      if (filters?.status && filters.status !== "All statuses") {
        filtered = filtered.filter((i) => i.status === filters.status);
      }
      return filtered;
    }
  }

  public async getMetrics(): Promise<ResourceSharingMetrics> {
    try {
      const res = await authFetch(`${API_BASE_URL}/metrics`);
      if (!res.ok) {
        throw new Error(`Failed to fetch metrics: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      return this.fallbackMetrics;
    }
  }

  public async getById(id: string): Promise<ResourceSharingCommitment | null> {
    try {
      const res = await authFetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch commitment ${id}`);
      }
      return await res.json();
    } catch {
      return this.fallbackCommitments.find((i) => i.id === id) || null;
    }
  }

  public async create(payload: CreateResourceSharingPayload): Promise<ResourceSharingCommitment> {
    try {
      const res = await authFetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Failed to create commitment: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      const newCommitment: ResourceSharingCommitment = {
        id: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
        resource: payload.resource,
        quantity: payload.quantity,
        source: payload.source,
        destination: payload.destination,
        partner: payload.partner || "Global Relief Network",
        scheduled: payload.scheduled || "Not scheduled",
        status: payload.status || "Pending Approval",
        type: payload.type,
        location: payload.location,
        description: payload.description,
        contactPerson: payload.contactPerson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackCommitments.unshift(newCommitment);
      return newCommitment;
    }
  }

  public async update(id: string, payload: UpdateResourceSharingPayload): Promise<ResourceSharingCommitment> {
    try {
      const res = await authFetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Failed to update commitment ${id}`);
      }
      return await res.json();
    } catch {
      const index = this.fallbackCommitments.findIndex((i) => i.id === id);
      if (index >= 0) {
        this.fallbackCommitments[index] = {
          ...this.fallbackCommitments[index],
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        return this.fallbackCommitments[index];
      }
      throw new Error(`Commitment ${id} not found`);
    }
  }

  public async updateStatus(id: string, status: string): Promise<ResourceSharingCommitment> {
    try {
      const res = await authFetch(`${API_BASE_URL}/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update status for ${id}`);
      }
      return await res.json();
    } catch {
      const index = this.fallbackCommitments.findIndex((i) => i.id === id);
      if (index >= 0) {
        this.fallbackCommitments[index] = {
          ...this.fallbackCommitments[index],
          status,
          updatedAt: new Date().toISOString(),
        };
        return this.fallbackCommitments[index];
      }
      throw new Error(`Commitment ${id} not found`);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const res = await authFetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch {
      const index = this.fallbackCommitments.findIndex((i) => i.id === id);
      if (index >= 0) {
        this.fallbackCommitments.splice(index, 1);
        return true;
      }
      return false;
    }
  }

  public async reset(): Promise<boolean> {
    try {
      const res = await authFetch(`${API_BASE_URL}/reset`, {
        method: "POST",
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const resourceSharingService = new ResourceSharingService();
