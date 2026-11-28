import { request, authFetch } from "./api";
import type {
  Organization,
  OrganizationStats,
  OrganizationQuery,
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
  OrganizationReviewDecisionPayload,
} from "../types/organization";
import type { PaginatedList } from "../types/user";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5277/api";

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

  async reviewOrganization(
    id: string,
    payload: OrganizationReviewDecisionPayload
  ): Promise<Organization> {
    const res = await request<Organization>(`/organizations/${id}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async downloadDocument(
    organizationId: string,
    documentId: string,
    fileName: string
  ): Promise<void> {
    const token = localStorage.getItem("carelink_token");
    const response = await authFetch(
      `${API_BASE_URL}/organizations/${organizationId}/documents/${documentId}/download`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error("Unable to download verification document.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "verification-document";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  async deleteOrganization(id: string): Promise<boolean> {
    const res = await request<boolean>(`/organizations/${id}`, {
      method: "DELETE",
    });
    return res.data ?? false;
  },
};
