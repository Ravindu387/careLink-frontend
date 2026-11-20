import { request } from "./api";
import type {
  Shelter,
  ShelterSummary,
  ShelterFilterParams,
  RequestShelterSpacePayload,
  ShelterBooking,
} from "../types/shelter";

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

let localSheltersStore: Shelter[] = [...MOCK_SHELTERS];
let localBookingsStore: ShelterBooking[] = [];

export const shelterService = {
  async getShelters(params?: ShelterFilterParams): Promise<Shelter[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.area && params.area !== "All" && params.area !== "All areas") {
        query.append("area", params.area);
      }
      if (params?.maxDistance) query.append("maxDistance", params.maxDistance.toString());
      if (params?.availability && params.availability !== "All statuses") {
        query.append("availability", params.availability);
      }
      if (params?.accessibleOnly) query.append("accessibleOnly", "true");
      if (params?.service && params.service !== "All services") {
        query.append("service", params.service);
      }

      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await request<Shelter[]>(`/citizen/shelters${queryString}`, {
        method: "GET",
      });
      if (response.data) {
        localSheltersStore = response.data;
        return response.data;
      }
      return localSheltersStore;
    } catch (err) {
      console.warn("Could not fetch shelters from backend API, utilizing local fallback store:", err);
      let filtered = [...localSheltersStore];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.area.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        );
      }

      if (params?.area && params.area !== "All" && params.area !== "All areas") {
        filtered = filtered.filter((s) => s.area.toLowerCase() === params.area?.toLowerCase());
      }

      if (params?.maxDistance) {
        filtered = filtered.filter((s) => s.distance <= params.maxDistance!);
      }

      if (params?.availability && params.availability !== "All statuses") {
        filtered = filtered.filter((s) => s.status === params.availability);
      }

      if (params?.accessibleOnly) {
        filtered = filtered.filter((s) => s.accessible);
      }

      if (params?.service && params.service !== "All services") {
        const sv = params.service.toLowerCase();
        filtered = filtered.filter((s) =>
          s.services.some((item) => item.toLowerCase().includes(sv))
        );
      }

      return filtered;
    }
  },

  async getById(id: string | number): Promise<Shelter> {
    try {
      const response = await request<Shelter>(`/citizen/shelters/${id}`, {
        method: "GET",
      });
      return response.data;
    } catch {
      const found = localSheltersStore.find((s) => String(s.id) === String(id));
      if (found) return found;
      throw new Error(`Shelter '${id}' not found.`);
    }
  },

  async getSummary(citizenLocation?: string): Promise<ShelterSummary> {
    try {
      const query = citizenLocation ? `?citizenLocation=${encodeURIComponent(citizenLocation)}` : "";
      const response = await request<ShelterSummary>(`/citizen/shelters/summary${query}`, {
        method: "GET",
      });
      return response.data;
    } catch {
      const available = localSheltersStore
        .filter((s) => s.availability > 0)
        .sort((a, b) => a.distance - b.distance);

      return {
        totalShelters: localSheltersStore.length,
        availableSheltersCount: available.length,
        fullSheltersCount: localSheltersStore.filter((s) => s.availability <= 0).length,
        totalCapacity: localSheltersStore.reduce((acc, s) => acc + s.capacity, 0),
        totalAvailableSpaces: localSheltersStore.reduce((acc, s) => acc + s.availability, 0),
        totalOccupiedSpaces: localSheltersStore.reduce((acc, s) => acc + s.occupied, 0),
        accessibleCount: localSheltersStore.filter((s) => s.accessible).length,
        nearestAvailableShelter: available[0] || null,
      };
    }
  },

  async requestSpace(payload: RequestShelterSpacePayload): Promise<ShelterBooking> {
    try {
      const response = await request<ShelterBooking>(
        `/citizen/shelters/${payload.shelterId}/request-space`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (response.data) {
        localBookingsStore.unshift(response.data);
        return response.data;
      }
    } catch (err) {
      console.warn("API reservation call failed, creating local reservation confirmation:", err);
    }

    const shelter = localSheltersStore.find((s) => String(s.id) === String(payload.shelterId));
    if (shelter) {
      shelter.availability = Math.max(0, shelter.availability - payload.numberOfPeople);
      shelter.occupied = Math.min(shelter.capacity, shelter.occupied + payload.numberOfPeople);
      shelter.status = shelter.availability > 0 ? "Space available" : "Full";
    }

    const booking: ShelterBooking = {
      bookingReference: `SH-RES-${Math.floor(1000 + Math.random() * 9000)}`,
      shelterId: payload.shelterId,
      shelterName: shelter ? shelter.name : "Evacuation Shelter",
      citizenName: payload.citizenName || "Samira Khan",
      contactPhone: payload.contactPhone || "+94 77 123 4567",
      numberOfPeople: payload.numberOfPeople,
      specialNeeds: payload.specialNeeds,
      status: "Confirmed",
      bookedAt: new Date().toISOString(),
      confirmationMessage: `Confirmed reservation for ${payload.numberOfPeople} space(s) at ${
        shelter ? shelter.name : "the shelter"
      }.`,
    };

    localBookingsStore.unshift(booking);
    return booking;
  },

  async getMyBookings(citizenName?: string): Promise<ShelterBooking[]> {
    try {
      const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
      const response = await request<ShelterBooking[]>(`/citizen/shelters/my-bookings${query}`, {
        method: "GET",
      });
      return response.data || [];
    } catch {
      return localBookingsStore;
    }
  },
};
