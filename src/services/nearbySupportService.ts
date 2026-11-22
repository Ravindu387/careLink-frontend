import { request } from "./api";
import type {
  SupportLocation,
  NearbySupportSummary,
  NearbySupportFilterParams,
} from "../types/nearbySupport";

export const MOCK_SUPPORT_LOCATIONS: SupportLocation[] = [
  {
    id: 1,
    name: "North Community Support Centre",
    category: "Support centre",
    distance: "0.8 km",
    distanceKm: 0.8,
    status: "Open",
    address: "North Ward",
    services: ["Food", "Water", "Charging"],
    hours: "Open until 20:00",
    color: "green",
    x: 25,
    y: 23,
    description:
      "A local support centre providing essential supplies, food, water and charging facilities.",
    phone: "+94 21 222 1001",
  },
  {
    id: 2,
    name: "Riverton High School",
    category: "Emergency shelter",
    distance: "1.4 km",
    distanceKm: 1.4,
    status: "Space available",
    address: "Riverton",
    services: ["Accessible", "Medical"],
    hours: "Open 24 hours",
    color: "green",
    x: 66,
    y: 26,
    description:
      "Emergency accommodation for families and displaced residents.",
    phone: "+94 21 222 1002",
  },
  {
    id: 3,
    name: "Eastbank Mobile Clinic",
    category: "Medical support",
    distance: "2.1 km",
    distanceKm: 2.1,
    status: "Open",
    address: "Eastbank",
    services: ["First aid", "Medicines"],
    hours: "Open until 18:00",
    color: "green",
    x: 31,
    y: 72,
    description:
      "Mobile medical assistance, first aid and essential medicines.",
    phone: "+94 21 222 1003",
  },
  {
    id: 4,
    name: "St. Mary Civic Centre",
    category: "Emergency shelter",
    distance: "3.2 km",
    distanceKm: 3.2,
    status: "Full",
    address: "Central Ward",
    services: ["Food", "Medical", "Childcare"],
    hours: "Currently full",
    color: "red",
    x: 86,
    y: 64,
    description:
      "Community emergency shelter. Currently at full capacity.",
    phone: "+94 21 222 1004",
  },
];

function mapFacilityToLocation(item: any): SupportLocation {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    distance: item.distance,
    distanceKm: item.distanceKm,
    status: item.status,
    address: item.address,
    services: item.services || [],
    hours: item.hours,
    iconKey: item.iconKey || "House",
    color: item.color || (item.status === "Full" ? "red" : "green"),
    x: item.mapX ?? item.x ?? 50,
    y: item.mapY ?? item.y ?? 50,
    description: item.description,
    phone: item.phone,
  };
}

export const nearbySupportService = {
  async getLocations(params?: NearbySupportFilterParams): Promise<SupportLocation[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All support") {
      query.append("category", params.category);
    }
    if (params?.availability && params.availability !== "All availability") {
      query.append("availability", params.availability);
    }
    if (params?.distance && params.distance !== "Any distance") {
      query.append("distance", params.distance);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<any[]>(`/citizen/facilities${queryString}`, {
      method: "GET",
    });
    return (response.data || []).map(mapFacilityToLocation);
  },

  async getLocationById(id: string | number): Promise<SupportLocation> {
    const response = await request<any>(`/citizen/facilities/${id}`, {
      method: "GET",
    });
    return mapFacilityToLocation(response.data);
  },

  async getSummary(): Promise<NearbySupportSummary> {
    const response = await request<NearbySupportSummary>("/citizen/facilities/summary", {
      method: "GET",
    });
    return response.data;
  },

  async updateStatus(id: string | number, status: string): Promise<SupportLocation> {
    const response = await request<any>(`/citizen/facilities/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return mapFacilityToLocation(response.data);
  },
};
