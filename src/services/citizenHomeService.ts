import { request } from "./api";
import type {
  CitizenHomeOverview,
  CitizenRequest,
  CreateCitizenRequestPayload,
  UpdateCitizenRequestStatusPayload,
  NearbyFacility,
  CrisisOperation,
} from "../types/citizenHome";

export const citizenHomeService = {
  async getHomeOverview(citizenName?: string): Promise<CitizenHomeOverview> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<CitizenHomeOverview>(`/citizen/home/overview${query}`, {
      method: "GET",
    });
    return response.data;
  },

  async getRequests(params?: {
    citizenName?: string;
    search?: string;
    status?: string;
  }): Promise<CitizenRequest[]> {
    const query = new URLSearchParams();
    if (params?.citizenName) query.append("citizenName", params.citizenName);
    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "all") query.append("status", params.status);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<CitizenRequest[]>(`/citizen/requests${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getRequestById(id: string): Promise<CitizenRequest> {
    const response = await request<CitizenRequest>(`/citizen/requests/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async createRequest(payload: CreateCitizenRequestPayload): Promise<CitizenRequest> {
    const response = await request<CitizenRequest>("/citizen/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateRequestStatus(
    id: string,
    payload: UpdateCitizenRequestStatusPayload
  ): Promise<CitizenRequest> {
    const response = await request<CitizenRequest>(`/citizen/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async getFacilities(search?: string): Promise<NearbyFacility[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await request<NearbyFacility[]>(`/citizen/facilities${query}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getActiveOperation(): Promise<CrisisOperation> {
    const response = await request<CrisisOperation>("/citizen/operation", {
      method: "GET",
    });
    return response.data;
  },
};
