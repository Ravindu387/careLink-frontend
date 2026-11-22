/**
 * Live Operations Map Service
 * Connects the Live Operations Map frontend interface to the CareLink .NET backend.
 */

export interface OperationPoint {
  id: string;
  requestId: string;
  title: string;
  district: string;
  location: string;
  type: "Request" | "Shelter" | "Warehouse" | "Team";
  priority: "Critical" | "High" | "Medium" | "Low";
  people: number;
  confidence: number;
  nearestShelter: string;
  assignedTeam: string;
  status: string;
  time: string;
  x: number;
  y: number;
  latitude?: number | null;
  longitude?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  capacity?: number | null;
  currentOccupancy?: number | null;
  suppliesStatus?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface LiveOperationsMapMetrics {
  totalPoints: number;
  requestCount: number;
  shelterCount: number;
  warehouseCount: number;
  teamCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  totalPeopleAffected: number;
  districts: string[];
  layers: string[];
  lastSyncedAt: string;
}

export interface LiveOperationsMapFilters {
  search?: string;
  district?: string;
  layer?: string;
  priority?: string;
  status?: string;
}

export interface CreateOperationPointPayload {
  title: string;
  district: string;
  location: string;
  type: "Request" | "Shelter" | "Warehouse" | "Team";
  priority?: "Critical" | "High" | "Medium" | "Low";
  people?: number;
  confidence?: number;
  nearestShelter?: string;
  assignedTeam?: string;
  status?: string;
  x?: number;
  y?: number;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  capacity?: number;
  suppliesStatus?: string;
  notes?: string;
}

export interface UpdateOperationPointPayload {
  title?: string;
  district?: string;
  location?: string;
  type?: "Request" | "Shelter" | "Warehouse" | "Team";
  priority?: "Critical" | "High" | "Medium" | "Low";
  people?: number;
  confidence?: number;
  nearestShelter?: string;
  assignedTeam?: string;
  status?: string;
  x?: number;
  y?: number;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  capacity?: number;
  currentOccupancy?: number;
  suppliesStatus?: string;
  notes?: string;
}

export interface AssignTeamPayload {
  assignedTeam: string;
  status?: string;
  notes?: string;
}

export interface UpdateCoordinatesPayload {
  x: number;
  y: number;
  latitude?: number;
  longitude?: number;
}

const FALLBACK_POINTS: OperationPoint[] = [
  {
    id: "1",
    requestId: "REQ-2841",
    title: "Emergency shelter",
    district: "North Ward",
    location: "Riverside, North Ward",
    type: "Request",
    priority: "Critical",
    people: 6,
    confidence: 94,
    nearestShelter: "1.4 km",
    assignedTeam: "Unassigned",
    status: "Active",
    time: "18 minutes ago",
    x: 27,
    y: 58,
    contactName: "Rohan Fernando",
    contactPhone: "+94 77 234 5671",
    notes: "Families stranded due to rapid river level rise.",
  },
  {
    id: "2",
    requestId: "REQ-2839",
    title: "Medical supplies",
    district: "Central Ward",
    location: "Old Town, Central Ward",
    type: "Request",
    priority: "High",
    people: 12,
    confidence: 91,
    nearestShelter: "2.1 km",
    assignedTeam: "Medical Team 3",
    status: "Dispatched",
    time: "26 minutes ago",
    x: 48,
    y: 42,
    contactName: "Dr. K. Silva",
    contactPhone: "+94 71 890 1234",
    notes: "Insulin and emergency dressing kits urgently required.",
  },
  {
    id: "3",
    requestId: "SHEL-038",
    title: "Riverton High School",
    district: "Central Ward",
    location: "Central Ward",
    type: "Shelter",
    priority: "Medium",
    people: 84,
    confidence: 96,
    nearestShelter: "Current location",
    assignedTeam: "Shelter Team 1",
    status: "Operational",
    time: "Updated recently",
    x: 72,
    y: 34,
    capacity: 200,
    currentOccupancy: 84,
    suppliesStatus: "Adequate food and bedding for 3 days",
    contactName: "Principal D. Alwis",
  },
  {
    id: "4",
    requestId: "WH-012",
    title: "Central Warehouse",
    district: "Eastbank",
    location: "Eastbank Logistics Hub",
    type: "Warehouse",
    priority: "Medium",
    people: 0,
    confidence: 98,
    nearestShelter: "3.2 km",
    assignedTeam: "Logistics Team",
    status: "Operational",
    time: "Updated recently",
    x: 82,
    y: 72,
    capacity: 5000,
    suppliesStatus: "8,500 food ration packs, 12,000 bottled water units",
  },
  {
    id: "5",
    requestId: "TEAM-024",
    title: "Response Team 24",
    district: "Central Ward",
    location: "Central Ward Base",
    type: "Team",
    priority: "High",
    people: 8,
    confidence: 90,
    nearestShelter: "2.0 km",
    assignedTeam: "Rescue Unit 24",
    status: "Dispatched",
    time: "5 minutes ago",
    x: 53,
    y: 78,
    contactName: "Capt. Nuwan Gunawardena",
  },
  {
    id: "6",
    requestId: "REQ-2834",
    title: "Food & water rations",
    district: "North Ward",
    location: "North Bank Road, North Ward",
    type: "Request",
    priority: "High",
    people: 28,
    confidence: 89,
    nearestShelter: "1.9 km",
    assignedTeam: "Unassigned",
    status: "Active",
    time: "34 minutes ago",
    x: 35,
    y: 22,
  },
  {
    id: "7",
    requestId: "REQ-2821",
    title: "Elderly evacuation support",
    district: "West District",
    location: "West River Bridge, West District",
    type: "Request",
    priority: "Critical",
    people: 4,
    confidence: 98,
    nearestShelter: "0.9 km",
    assignedTeam: "Swift Water Rescue Unit",
    status: "Dispatched",
    time: "12 minutes ago",
    x: 22,
    y: 82,
  },
  {
    id: "8",
    requestId: "SHEL-042",
    title: "Community Sports Complex",
    district: "North Ward",
    location: "Riverside Avenue, North Ward",
    type: "Shelter",
    priority: "High",
    people: 140,
    confidence: 92,
    nearestShelter: "Current location",
    assignedTeam: "Shelter Support Unit 2",
    status: "Operational",
    time: "Updated recently",
    x: 19,
    y: 36,
  },
  {
    id: "9",
    requestId: "WH-015",
    title: "North Regional Depot",
    district: "North Ward",
    location: "Industrial Zone, North Ward",
    type: "Warehouse",
    priority: "Medium",
    people: 0,
    confidence: 95,
    nearestShelter: "1.2 km",
    assignedTeam: "North Logistics Unit",
    status: "Operational",
    time: "Updated recently",
    x: 15,
    y: 20,
  },
  {
    id: "10",
    requestId: "TEAM-018",
    title: "Rapid Medical Unit 1",
    district: "North Ward",
    location: "North Ward Transit Post",
    type: "Team",
    priority: "Critical",
    people: 6,
    confidence: 95,
    nearestShelter: "1.5 km",
    assignedTeam: "Medical Team 3",
    status: "In Transit",
    time: "8 minutes ago",
    x: 30,
    y: 48,
  },
  {
    id: "11",
    requestId: "TEAM-031",
    title: "Swift Water Rescue Unit",
    district: "West District",
    location: "River Sector West",
    type: "Team",
    priority: "Critical",
    people: 10,
    confidence: 94,
    nearestShelter: "1.0 km",
    assignedTeam: "Swift Water Rescue Unit",
    status: "Dispatched",
    time: "15 minutes ago",
    x: 18,
    y: 68,
  },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";
const ENDPOINT = `${API_BASE}/api/live-operations-map`;

export const liveOperationsMapService = {
  async getAll(filters?: LiveOperationsMapFilters): Promise<OperationPoint[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.district && filters.district !== "All districts") {
      params.append("district", filters.district);
    }
    if (filters?.layer && filters.layer !== "All operational layers") {
      params.append("layer", filters.layer);
    }
    if (filters?.priority && filters.priority !== "Any priority") {
      params.append("priority", filters.priority);
    }
    if (filters?.status && filters.status !== "All statuses") {
      params.append("status", filters.status);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    try {
      const response = await fetch(`${ENDPOINT}${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch operations map: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Falling back to local points due to error:", err);
      // Client-side fallback filter
      return FALLBACK_POINTS.filter((p) => {
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const match =
            p.requestId.toLowerCase().includes(s) ||
            p.title.toLowerCase().includes(s) ||
            p.location.toLowerCase().includes(s) ||
            p.district.toLowerCase().includes(s);
          if (!match) return false;
        }
        if (filters?.district && filters.district !== "All districts") {
          if (p.district !== filters.district) return false;
        }
        if (filters?.layer && filters.layer !== "All operational layers") {
          if (p.type !== filters.layer) return false;
        }
        if (filters?.priority && filters.priority !== "Any priority") {
          if (p.priority !== filters.priority) return false;
        }
        return true;
      });
    }
  },

  async getMetrics(): Promise<LiveOperationsMapMetrics | null> {
    try {
      const response = await fetch(`${ENDPOINT}/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch map metrics: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Could not fetch remote map metrics:", err);
      return null;
    }
  },

  async getById(id: string): Promise<OperationPoint | null> {
    try {
      const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch point: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_POINTS.find((p) => p.id === id || p.requestId === id) || null;
    }
  },

  async create(payload: CreateOperationPointPayload): Promise<OperationPoint> {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create operation point: ${response.status} ${errorText}`);
    }

    return await response.json();
  },

  async update(id: string, payload: UpdateOperationPointPayload): Promise<OperationPoint> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update operation point: ${response.status} ${errorText}`);
    }

    return await response.json();
  },

  async assignTeam(id: string, payload: AssignTeamPayload): Promise<OperationPoint> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to assign team: ${response.status} ${errorText}`);
    }

    return await response.json();
  },

  async updateCoordinates(id: string, payload: UpdateCoordinatesPayload): Promise<OperationPoint> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/coordinates`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update coordinates: ${response.status} ${errorText}`);
    }

    return await response.json();
  },

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    return response.ok;
  },

  async reset(): Promise<boolean> {
    const response = await fetch(`${ENDPOINT}/reset`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    return response.ok;
  },
};
