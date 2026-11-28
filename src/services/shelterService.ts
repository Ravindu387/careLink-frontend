/**
 * Shelter Service
 * Connects Citizen and Emergency Coordinator shelter management to the CareLink .NET backend.
 */

import { request, authFetch } from "./api";
import type {
  Shelter,
  ShelterSummary,
  ShelterFilterParams,
  RequestShelterSpacePayload,
  ShelterBooking,
} from "../types/shelter";

export type { Shelter };

export interface CoordinatorShelter {
  id: number | string;
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
  lastUpdated?: string;
}

export interface PagedShelters {
  items: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateShelterPayload {
  name: string;
  location: string;
  capacity: number;
  occupied?: number;
  services?: string[];
  status?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}

export const MOCK_SHELTERS: Shelter[] = [
  {
    id: 1,
    name: "Riverton High School",
    area: "Central Ward",
    address: "45 College Road, Central Ward, Greater Riverton",
    distance: 1.4,
    capacity: 300,
    availability: 48,
    occupied: 252,
    services: ["Accessible", "Medical", "Families", "Food"],
    status: "Space available",
    accessible: true,
    contactPhone: "+94 11 234 5678",
    managerName: "Major Sarath Wickramasinghe",
    operatingHours: "24 Hours · Open Intake",
    isEvacuationHub: true,
    occupancyPercentage: 84,
  },
  {
    id: 2,
    name: "North Community Hall",
    area: "North Ward",
    address: "12 Market Road, North Ward, Greater Riverton",
    distance: 2.2,
    capacity: 400,
    availability: 216,
    occupied: 184,
    services: ["Accessible", "Food", "Pets", "Childcare", "Blankets"],
    status: "Space available",
    accessible: true,
    contactPhone: "+94 11 234 8912",
    managerName: "Mrs. Sunethra Perera",
    operatingHours: "24 Hours · Open Intake",
    isEvacuationHub: true,
    occupancyPercentage: 46,
  },
  {
    id: 3,
    name: "Lakeside Sports Hall",
    area: "West District",
    address: "88 Lake Circular Road, West District",
    distance: 3.8,
    capacity: 350,
    availability: 204,
    occupied: 146,
    services: ["Food", "Family rooms", "Shower facilities"],
    status: "Space available",
    accessible: false,
    contactPhone: "+94 11 234 9901",
    managerName: "Officer K. Fernando",
    operatingHours: "06:00 - 22:00 (Security on site 24/7)",
    isEvacuationHub: false,
    occupancyPercentage: 42,
  },
  {
    id: 4,
    name: "St. Mary Civic Centre",
    area: "Eastbank",
    address: "14 Church Street, Eastbank",
    distance: 2.8,
    capacity: 150,
    availability: 0,
    occupied: 150,
    services: ["Medical", "Childcare", "Psychosocial support"],
    status: "Full",
    accessible: false,
    contactPhone: "+94 11 234 4455",
    managerName: "Fr. Anthony Silva",
    operatingHours: "Capacity Reached",
    isEvacuationHub: false,
    occupancyPercentage: 100,
  },
];

export const DEFAULT_COORDINATOR_SHELTERS: CoordinatorShelter[] = [
  {
    id: 1,
    name: "Central Community Hall Shelter",
    location: "Central Ward, Riverton",
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
    name: "North Ward Secondary School",
    location: "North Ward, Sector 3",
    capacity: 400,
    occupied: 184,
    remaining: 216,
    services: ["Food Service", "Families"],
    status: "Operational",
    contactPerson: "Kamal Wickrama",
    contactPhone: "+94 71 884 1002",
    notes: "Spacious gymnasium and classrooms activated for multi-family temporary sheltering.",
  },
  {
    id: 3,
    name: "Lakeside Stadium Annex",
    location: "West District, Riverton",
    capacity: 350,
    occupied: 146,
    remaining: 204,
    services: ["Medical", "Accessible"],
    status: "Operational",
    contactPerson: "Dr. Rohana Dias",
    contactPhone: "+94 70 339 2145",
    notes: "Equipped with auxiliary medical triage beds and ambulance access.",
  },
  {
    id: 4,
    name: "East River Relief Center",
    location: "Eastbank District",
    capacity: 150,
    occupied: 150,
    remaining: 0,
    services: ["Childcare", "Food Service"],
    status: "Full",
    contactPerson: "Anura Senanayake",
    contactPhone: "+94 76 991 3004",
    notes: "At absolute maximum safe holding capacity. Directing new arrivals to West District.",
  },
];

let localSheltersStore: Shelter[] = [...MOCK_SHELTERS];
let localBookingsStore: ShelterBooking[] = [];
let coordinatorSheltersStore: CoordinatorShelter[] = [...DEFAULT_COORDINATOR_SHELTERS];

const ENDPOINT = "/api/shelters";

export const shelterService = {
  // Citizen methods
  async getShelters(params?: ShelterFilterParams): Promise<Shelter[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.area && params.area !== "All") query.append("area", params.area);
    if (params?.maxDistance) query.append("maxDistance", params.maxDistance.toString());
    if (params?.availability && params.availability !== "All") {
      query.append("availability", params.availability);
    }
    if (params?.accessibleOnly) query.append("accessibleOnly", "true");
    if (params?.service && params.service !== "All") query.append("service", params.service);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    try {
      const response = await request<Shelter[]>(`/citizen/shelters${queryString}`, {
        method: "GET",
      });
      return response.data || localSheltersStore;
    } catch {
      let filtered = [...localSheltersStore];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (item) => item.name.toLowerCase().includes(s) || item.address.toLowerCase().includes(s)
        );
      }
      if (params?.area && params.area !== "All") {
        filtered = filtered.filter((item) => item.area === params.area);
      }
      if (params?.accessibleOnly) {
        filtered = filtered.filter((item) => item.accessible);
      }
      return filtered;
    }
  },

  async getShelterById(id: string | number): Promise<Shelter> {
    try {
      const response = await request<Shelter>(`/citizen/shelters/${id}`, {
        method: "GET",
      });
      return response.data;
    } catch {
      const found = localSheltersStore.find((s) => String(s.id) === String(id));
      if (found) return found;
      throw new Error(`Shelter ${id} not found.`);
    }
  },

  async requestSpace(payload: RequestShelterSpacePayload): Promise<ShelterBooking> {
    try {
      const response = await request<ShelterBooking>("/citizen/shelters/request-space", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    } catch {
      const shelter = localSheltersStore.find((s) => String(s.id) === String(payload.shelterId));
      const booking: ShelterBooking = {
        bookingReference: `SHL-${Math.floor(1000 + Math.random() * 9000)}`,
        shelterId: payload.shelterId,
        shelterName: shelter ? shelter.name : "Assigned Shelter",
        citizenName: payload.citizenName || "Samira Khan",
        contactPhone: payload.contactPhone || "+94 77 123 4567",
        numberOfPeople: payload.numberOfPeople,
        specialNeeds: payload.specialNeeds,
        status: "Confirmed",
        bookedAt: new Date().toISOString(),
        confirmationMessage: `Space reserved for ${payload.numberOfPeople} person(s) at ${
          shelter ? shelter.name : "Shelter"
        }. Please arrive within 4 hours.`,
      };
      localBookingsStore.push(booking);
      if (shelter && shelter.availability >= payload.numberOfPeople) {
        shelter.availability -= payload.numberOfPeople;
        shelter.occupied += payload.numberOfPeople;
      }
      return booking;
    }
  },

  async getUserBookings(citizenName?: string): Promise<ShelterBooking[]> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    try {
      const response = await request<ShelterBooking[]>(`/citizen/shelters/bookings${query}`, {
        method: "GET",
      });
      return response.data || localBookingsStore;
    } catch {
      return localBookingsStore;
    }
  },

  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/citizen/shelters/bookings/${bookingId}`, {
        method: "DELETE",
      });
      return response.data ?? response.success;
    } catch {
      localBookingsStore = localBookingsStore.filter((b) => b.bookingReference !== bookingId);
      return true;
    }
  },

  async getSummary(): Promise<ShelterSummary> {
    try {
      const response = await request<ShelterSummary>("/citizen/shelters/summary", {
        method: "GET",
      });
      return response.data;
    } catch {
      const available = localSheltersStore.filter((s) => s.availability > 0);
      const totalCapacity = localSheltersStore.reduce((sum, s) => sum + s.capacity, 0);
      const totalOccupied = localSheltersStore.reduce((sum, s) => sum + s.occupied, 0);
      const totalAvailable = localSheltersStore.reduce((sum, s) => sum + s.availability, 0);

      return {
        totalShelters: localSheltersStore.length,
        availableSheltersCount: available.length,
        fullSheltersCount: localSheltersStore.length - available.length,
        totalCapacity,
        totalAvailableSpaces: totalAvailable,
        totalOccupiedSpaces: totalOccupied,
        accessibleCount: localSheltersStore.filter((s) => s.accessible).length,
        nearestAvailableShelter: available[0] || null,
      };
    }
  },

  // Coordinator methods
  async getAll(filters?: any): Promise<any[]> {
    try {
      const res = await authFetch(`${ENDPOINT}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return coordinatorSheltersStore;
  },

  async getPaged(filters?: any): Promise<PagedShelters> {
    const all = await this.getAll(filters);
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    return {
      items,
      totalCount: all.length,
      page,
      pageSize,
      totalPages,
    };
  },

  async getMetrics(): Promise<ShelterMetrics> {
    try {
      const res = await authFetch(`${ENDPOINT}/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const totalCap = coordinatorSheltersStore.reduce((s, x) => s + x.capacity, 0);
    const totalOcc = coordinatorSheltersStore.reduce((s, x) => s + x.occupied, 0);
    return {
      operationalShelters: coordinatorSheltersStore.length,
      totalCapacity: totalCap,
      totalOccupied: totalOcc,
      availableSpaces: Math.max(0, totalCap - totalOcc),
      acceptingArrivals: coordinatorSheltersStore.filter((x) => x.status === "Operational").length,
      nearCapacityCount: coordinatorSheltersStore.filter((x) => x.status === "Near Capacity").length,
      fullCount: coordinatorSheltersStore.filter((x) => x.status === "Full").length,
      lastUpdated: new Date().toISOString(),
    };
  },

  async getById(id: number | string): Promise<any> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const found = coordinatorSheltersStore.find((x) => String(x.id) === String(id));
    if (found) return found;
    throw new Error(`Shelter ${id} not found.`);
  },

  async create(shelter: CreateShelterPayload): Promise<any> {
    try {
      const res = await authFetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(shelter),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const newShelter: CoordinatorShelter = {
      id: coordinatorSheltersStore.length + 1,
      name: shelter.name,
      location: shelter.location,
      capacity: shelter.capacity,
      occupied: shelter.occupied || 0,
      remaining: Math.max(0, shelter.capacity - (shelter.occupied || 0)),
      services: shelter.services || ["General"],
      status: shelter.status || "Operational",
      contactPerson: shelter.contactPerson || "Shelter Staff",
      contactPhone: shelter.contactPhone || "+94 11 234 5678",
      notes: shelter.notes,
    };
    coordinatorSheltersStore.push(newShelter);
    return newShelter;
  },

  async updateOccupancy(id: number | string, occupied: number): Promise<any> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}/occupancy`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ occupied }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const shelter = coordinatorSheltersStore.find((x) => String(x.id) === String(id));
    if (shelter) {
      shelter.occupied = occupied;
      shelter.remaining = Math.max(0, shelter.capacity - occupied);
      shelter.status = shelter.remaining === 0 ? "Full" : shelter.remaining < 50 ? "Near Capacity" : "Operational";
      return shelter;
    }
    throw new Error(`Shelter ${id} not found.`);
  },

  async update(id: number | string, patch: Partial<CoordinatorShelter>): Promise<any> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(patch),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const index = coordinatorSheltersStore.findIndex((x) => String(x.id) === String(id));
    if (index !== -1) {
      coordinatorSheltersStore[index] = { ...coordinatorSheltersStore[index], ...patch };
      return coordinatorSheltersStore[index];
    }
    throw new Error(`Shelter ${id} not found.`);
  },

  async delete(id: number | string): Promise<boolean> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    coordinatorSheltersStore = coordinatorSheltersStore.filter((x) => String(x.id) !== String(id));
    return true;
  },

  async reset(): Promise<boolean> {
    try {
      const res = await authFetch(`${ENDPOINT}/reset`, {
        method: "POST",
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    coordinatorSheltersStore = [...DEFAULT_COORDINATOR_SHELTERS];
    localSheltersStore = [...MOCK_SHELTERS];
    localBookingsStore = [];
    return true;
  },
};
