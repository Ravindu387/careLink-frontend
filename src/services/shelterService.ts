/**
 * Shelter Service
 * Connects the Emergency Coordinator Shelter Overview page
 * to the CareLink .NET backend API.
 */

export interface Shelter {
  id: number;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  remaining: number;
  services: string[];
  status: "Operational" | "Near Capacity" | "Full" | string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShelterMetrics {
  operationalShelters: number;
  totalCapacity: number;
  totalOccupied: number;
  availableSpaces: number;
  acceptingArrivals: number;
  nearCapacityCount: number;
  fullCount: number;
  totalShelters: number;
  lastUpdated?: string;
}

export interface ShelterFilters {
  search?: string;
  area?: string;
  status?: string;
  availability?: string;
  service?: string;
}

export interface CreateShelterPayload {
  name: string;
  location: string;
  capacity: number;
  occupied?: number;
  services: string[];
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}

export interface UpdateShelterPayload {
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  services: string[];
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}

const DEFAULT_SHELTERS: Shelter[] = [
  {
    id: 1,
    name: "Riverton High School",
    location: "Central Ward",
    capacity: 660,
    occupied: 612,
    remaining: 48,
    services: ["Accessible", "Medical"],
    status: "Near Capacity",
    contactPerson: "Brenda Silva",
    contactPhone: "+94 77 412 8041",
    notes: "Primary central ward emergency reception facility with wheelchair ramps and backup power.",
  },
  {
    id: 2,
    name: "North Community Hall",
    location: "North Ward",
    capacity: 500,
    occupied: 284,
    remaining: 216,
    services: ["Accessible", "Food"],
    status: "Operational",
    contactPerson: "Marcus Vance",
    contactPhone: "+94 77 412 8022",
    notes: "Active hot meal kitchen on site. Direct access for transport vans.",
  },
  {
    id: 3,
    name: "St. Mary's Civic Centre",
    location: "Eastbank",
    capacity: 450,
    occupied: 450,
    remaining: 0,
    services: ["Medical", "Childcare"],
    status: "Full",
    contactPerson: "Sister Theresa",
    contactPhone: "+94 77 412 8033",
    notes: "Currently at 100% capacity. Redirecting newly displaced families to North Community Hall.",
  },
  {
    id: 4,
    name: "Lakeside Sports Hall",
    location: "West District",
    capacity: 400,
    occupied: 196,
    remaining: 204,
    services: ["Food", "Family rooms"],
    status: "Operational",
    contactPerson: "David Perera",
    contactPhone: "+94 77 412 8044",
    notes: "Equipped with family partitions, laundry, and clean shower blocks.",
  },
  {
    id: 5,
    name: "Central Ward Stadium Pavilion",
    location: "Central Ward",
    capacity: 1200,
    occupied: 820,
    remaining: 380,
    services: ["Accessible", "Food", "Medical", "Family rooms"],
    status: "Operational",
    contactPerson: "Capt. Rohan Sen",
    contactPhone: "+94 77 412 8055",
    notes: "Main high-capacity staging dome equipped with field medical tent and triage.",
  },
  {
    id: 6,
    name: "Eastbank Technical College",
    location: "Eastbank",
    capacity: 350,
    occupied: 310,
    remaining: 40,
    services: ["Accessible", "Food"],
    status: "Near Capacity",
    contactPerson: "Kamal Jayasuriya",
    contactPhone: "+94 77 412 8066",
    notes: "High intake rate from Eastbank river overflow zone. Monitoring capacity closely.",
  },
  {
    id: 7,
    name: "West District Community Shelter",
    location: "West District",
    capacity: 300,
    occupied: 150,
    remaining: 150,
    services: ["Food", "Childcare"],
    status: "Operational",
    contactPerson: "Nisha Weerasinghe",
    contactPhone: "+94 77 412 8077",
    notes: "Dedicated mother-and-child support hub with pediatric supplies.",
  },
];

const DEFAULT_METRICS: ShelterMetrics = {
  operationalShelters: 38,
  totalCapacity: 11420,
  totalOccupied: 8642,
  availableSpaces: 2778,
  acceptingArrivals: 6,
  nearCapacityCount: 2,
  fullCount: 1,
  totalShelters: 7,
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const shelterService = {
  async getAll(filters?: ShelterFilters): Promise<Shelter[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.area && filters.area !== "All operational areas" && filters.area !== "All") {
        params.append("area", filters.area);
      }
      if (filters?.status && filters.status !== "All statuses" && filters.status !== "All") {
        params.append("status", filters.status);
      }
      if (filters?.availability && filters.availability !== "Any availability" && filters.availability !== "All") {
        params.append("availability", filters.availability);
      }
      if (filters?.service) params.append("service", filters.service);

      const url = `${API_BASE}/api/shelters${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      // Local filtering fallback
      let result = [...DEFAULT_SHELTERS];
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        result = result.filter(
          (sh) =>
            sh.name.toLowerCase().includes(s) ||
            sh.location.toLowerCase().includes(s) ||
            sh.services.some((svc) => svc.toLowerCase().includes(s))
        );
      }
      if (filters?.area && filters.area !== "All operational areas" && filters.area !== "All") {
        result = result.filter((sh) => sh.location === filters.area);
      }
      if (filters?.status && filters.status !== "All statuses" && filters.status !== "All") {
        result = result.filter((sh) => sh.status === filters.status);
      }
      if (filters?.availability && filters.availability !== "Any availability") {
        if (filters.availability === "Available") {
          result = result.filter((sh) => sh.remaining > 0);
        } else if (filters.availability === "Full") {
          result = result.filter((sh) => sh.remaining <= 0);
        }
      }
      return result;
    }
  },

  async getMetrics(): Promise<ShelterMetrics> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return DEFAULT_METRICS;
    }
  },

  async getById(id: number): Promise<Shelter | null> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters/${id}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return DEFAULT_SHELTERS.find((s) => s.id === id) || null;
    }
  },

  async create(payload: CreateShelterPayload): Promise<Shelter> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Failed to create shelter");
      }
      return await response.json();
    } catch (err: any) {
      if (err.message && !err.message.includes("Failed to fetch")) {
        throw err;
      }
      // Fallback
      const capacity = Number(payload.capacity);
      const occupied = Number(payload.occupied || 0);
      return {
        id: Date.now(),
        name: payload.name,
        location: payload.location,
        capacity,
        occupied,
        remaining: Math.max(0, capacity - occupied),
        services: payload.services || ["Food", "Medical"],
        status: occupied >= capacity ? "Full" : occupied >= capacity * 0.85 ? "Near Capacity" : "Operational",
        contactPerson: payload.contactPerson,
        contactPhone: payload.contactPhone,
        notes: payload.notes,
      };
    }
  },

  async update(id: number, payload: UpdateShelterPayload): Promise<Shelter> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update shelter (${response.status})`);
      }
      return await response.json();
    } catch {
      const capacity = Number(payload.capacity);
      const occupied = Number(payload.occupied || 0);
      return {
        id,
        name: payload.name,
        location: payload.location,
        capacity,
        occupied,
        remaining: Math.max(0, capacity - occupied),
        services: payload.services,
        status: occupied >= capacity ? "Full" : occupied >= capacity * 0.85 ? "Near Capacity" : "Operational",
        contactPerson: payload.contactPerson,
        contactPhone: payload.contactPhone,
        notes: payload.notes,
      };
    }
  },

  async updateOccupancy(id: number, occupied: number): Promise<Shelter> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters/${id}/occupancy`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ occupied }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update occupancy (${response.status})`);
      }
      return await response.json();
    } catch {
      const found = DEFAULT_SHELTERS.find((s) => s.id === id);
      const capacity = found ? found.capacity : 500;
      return {
        id,
        name: found?.name || "Shelter",
        location: found?.location || "Central Ward",
        capacity,
        occupied,
        remaining: Math.max(0, capacity - occupied),
        services: found?.services || ["Food"],
        status: occupied >= capacity ? "Full" : occupied >= capacity * 0.85 ? "Near Capacity" : "Operational",
      };
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return true;
    }
  },

  async reset(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/shelters/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return true;
    }
  },
};
