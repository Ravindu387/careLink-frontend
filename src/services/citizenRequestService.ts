import { request } from "./api";
import type {
  CitizenHelpRequest,
  CreateCitizenHelpRequestPayload,
  CitizenRequestsSummary,
  CitizenRequestFilterParams,
} from "../types/citizenRequest";

export const MOCK_REQUESTS: CitizenHelpRequest[] = [
  {
    id: "REQ-2841",
    title: "Emergency shelter",
    category: "Emergency shelter",
    description: "A case worker is checking your information.",
    status: "Under review",
    priority: "High",
    citizenName: "Samira Khan",
    contactPhone: "+94 77 123 4567",
    address: "54 Riverside Lane, North Ward, Greater Riverton",
    district: "North Ward",
    color: "amber",
    progress: 2,
    formattedDate: "Submitted 22 Jun 2025 · 13:28",
    updated: "8 minutes ago",
    canMessage: true,
  },
  {
    id: "REQ-2794",
    title: "Food and drinking water",
    category: "Food and water",
    description: "Delivery DSP-1092 is expected by 14:20.",
    status: "Help on the way",
    priority: "Normal",
    citizenName: "Samira Khan",
    contactPhone: "+94 77 123 4567",
    address: "54 Riverside Lane, North Ward, Greater Riverton",
    district: "North Ward",
    color: "blue",
    progress: 3,
    formattedDate: "Submitted 20 Jun 2025 · 09:16",
    updated: "Today · 11:40",
    canMessage: true,
    dispatchTrackingId: "DSP-1092",
  },
  {
    id: "REQ-2812",
    title: "Medical support",
    category: "Medical support",
    description: "Support was delivered and confirmed.",
    status: "Completed",
    priority: "Normal",
    citizenName: "Samira Khan",
    contactPhone: "+94 77 123 4567",
    address: "54 Riverside Lane, North Ward, Greater Riverton",
    district: "North Ward",
    color: "green",
    progress: 4,
    formattedDate: "Submitted 17 Jun 2025 · 15:42",
    updated: "18 Jun · 13:14",
    canMessage: false,
  },
];

let localRequestsStore: CitizenHelpRequest[] = [...MOCK_REQUESTS];

export const citizenRequestService = {
  async getRequests(params?: CitizenRequestFilterParams): Promise<CitizenHelpRequest[]> {
    try {
      const query = new URLSearchParams();
      if (params?.citizenName) query.append("citizenName", params.citizenName);
      if (params?.search) query.append("search", params.search);
      if (params?.status && params.status !== "all") query.append("status", params.status);
      if (params?.category && params.category !== "all") query.append("category", params.category);

      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await request<CitizenHelpRequest[]>(`/citizen/requests${queryString}`, {
        method: "GET",
      });
      if (response.data) {
        localRequestsStore = response.data;
        return response.data;
      }
      return localRequestsStore;
    } catch (err) {
      console.warn("Unable to fetch requests from backend API, using local storage:", err);
      let filtered = [...localRequestsStore];
      if (params?.status && params.status !== "all") {
        filtered = filtered.filter((r) => r.status.toLowerCase() === params.status?.toLowerCase());
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  },

  async getRequestById(id: string): Promise<CitizenHelpRequest> {
    try {
      const response = await request<CitizenHelpRequest>(`/citizen/requests/${id}`, {
        method: "GET",
      });
      return response.data;
    } catch {
      const found = localRequestsStore.find((r) => r.id === id);
      if (found) return found;
      throw new Error(`Request '${id}' not found.`);
    }
  },

  async createRequest(payload: CreateCitizenHelpRequestPayload): Promise<CitizenHelpRequest> {
    try {
      const response = await request<CitizenHelpRequest>("/citizen/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (response.data) {
        localRequestsStore.unshift(response.data);
        return response.data;
      }
    } catch (err) {
      console.warn("API request failed, saving request in local fallback store:", err);
    }

    // Local fallback creation
    const newReq: CitizenHelpRequest = {
      id: `REQ-${Math.floor(2840 + Math.random() * 500)}`,
      title: payload.category || "General Assistance",
      category: payload.category,
      description: payload.situation || payload.description || `${payload.category} requested.`,
      status: "Under review",
      priority: payload.immediateThreat ? "Urgent" : (payload.priority || "Normal"),
      citizenName: payload.contactName || payload.citizenName || "Samira Khan",
      contactPhone: payload.phone || payload.contactPhone || "+94 77 123 4567",
      address: payload.address || "North Ward, Greater Riverton",
      district: payload.district || "North Ward",
      color: payload.immediateThreat ? "red" : "amber",
      immediateThreat: payload.immediateThreat,
      additionalInfo: payload.additionalInfo,
      peopleCount: payload.peopleCount || 1,
      progress: 2,
      formattedDate: `Submitted Today · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      updated: "Just now",
      canMessage: true,
      createdAt: new Date().toISOString(),
    };
    localRequestsStore.unshift(newReq);
    return newReq;
  },

  async updateStatus(id: string, status: string): Promise<CitizenHelpRequest> {
    try {
      const response = await request<CitizenHelpRequest>(`/citizen/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response.data;
    } catch {
      const item = localRequestsStore.find((r) => r.id === id);
      if (item) {
        item.status = status;
        return item;
      }
      throw new Error(`Request '${id}' not found`);
    }
  },

  async deleteRequest(id: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/citizen/requests/${id}`, {
        method: "DELETE",
      });
      localRequestsStore = localRequestsStore.filter((r) => r.id !== id);
      return response.data ?? response.success;
    } catch {
      localRequestsStore = localRequestsStore.filter((r) => r.id !== id);
      return true;
    }
  },

  async getSummary(citizenName?: string): Promise<CitizenRequestsSummary> {
    try {
      const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
      const response = await request<CitizenRequestsSummary>(`/citizen/requests/summary${query}`, {
        method: "GET",
      });
      return response.data;
    } catch {
      return {
        totalRequests: localRequestsStore.length,
        activeCount: localRequestsStore.filter((r) => r.progress < 4).length,
        completedCount: localRequestsStore.filter((r) => r.progress === 4).length,
        draftsCount: 0,
      };
    }
  },
};
