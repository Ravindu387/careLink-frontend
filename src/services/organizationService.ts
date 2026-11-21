import { request } from "./api";
import type {
  Organization,
  OrganizationStats,
  OrganizationQuery,
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
} from "../types/organization";
import type { PaginatedList } from "../types/user";

export const organizationService = {
  async getOrganizations(query?: OrganizationQuery): Promise<PaginatedList<Organization>> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.status && query.status !== "All statuses") params.append("status", query.status);
    if (query?.type && query.type !== "All types") params.append("type", query.type);
    if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await request<PaginatedList<Organization>>(`/organizations${qs}`, {
      method: "GET",
    });
    return res.data;
  },

  async getStats(): Promise<OrganizationStats> {
    const res = await request<OrganizationStats>("/organizations/stats", {
      method: "GET",
    });
    return res.data;
  },

  async getTypes(): Promise<string[]> {
    const res = await request<string[]>("/organizations/types", {
      method: "GET",
    });
    return res.data || [];
  },

  async getById(id: string): Promise<Organization> {
    const res = await request<Organization>(`/organizations/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  async createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
    const res = await request<Organization>("/organizations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateOrganization(id: string, payload: UpdateOrganizationPayload): Promise<Organization> {
    const res = await request<Organization>(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    const res = await request<boolean>(`/organizations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data ?? false;
  },

  async approveVerification(id: string): Promise<boolean> {
    const res = await request<boolean>(`/organizations/${id}/verify`, {
      method: "POST",
    });
    return res.data ?? false;
  },

  async deleteOrganization(id: string): Promise<boolean> {
    const res = await request<boolean>(`/organizations/${id}`, {
      method: "DELETE",
    });
    return res.data ?? false;
  },
};
