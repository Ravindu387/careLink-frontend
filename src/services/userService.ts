import { request } from "./api";
import type {
  UserDetails,
  UserStats,
  PaginatedList,
  CreateUserRequest,
  UpdateUserRequest,
  UserListQuery,
} from "../types/user";

/**
 * Normalizes a UI display role label (e.g. "Case Manager", "Funding Officer")
 * into the canonical backend Identity role token accepted by CareLink.API.
 */
export function mapRoleToBackendRole(role?: string): string {
  if (!role) return "";
  switch (role.trim()) {
    case "System Administrator":
    case "Admin":
    case "SystemAdmin":
      return "SystemAdmin";
    case "Case Manager":
    case "CaseManager":
    case "Incident Manager":
    case "IncidentManager":
      return "IncidentManager";
    case "Citizen":
    case "Affected Citizen":
      return "Citizen";
    case "Emergency Coordinator":
    case "EmergencyCoordinator":
      return "EmergencyCoordinator";
    case "Funding Officer":
    case "FundingOfficer":
    case "Donor":
      return "Donor";
    case "Partner Officer":
    case "PartnerOfficer":
    case "Partner Organisation Officer":
      return "PartnerOfficer";
    case "Resource Manager":
    case "ResourceManager":
    case "Logistics Manager":
    case "LogisticsManager":
      return "LogisticsManager";
    case "Shelter Administrator":
    case "ShelterAdministrator":
    case "ShelterAdmin":
      return "ShelterAdmin";
    case "Volunteer Coordinator":
    case "VolunteerCoordinator":
      return "VolunteerCoordinator";
    case "Volunteer":
      return "Volunteer";
    default:
      return role.trim();
  }
}

export const userService = {
  async getUsers(query?: UserListQuery) {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.role && query.role !== "All roles") {
      params.append("role", mapRoleToBackendRole(query.role));
    }
    if (query?.status && query.status !== "All statuses") params.append("status", query.status);
    if (query?.tab && query.tab !== "All users") params.append("tab", query.tab);
    if (query?.organization && query.organization !== "All organisations") {
      params.append("organization", query.organization);
    }
    if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await request<PaginatedList<UserDetails>>(`/users${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  async getUserStats() {
    const response = await request<UserStats>("/users/stats", {
      method: "GET",
    });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await request<UserDetails>(`/users/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async createUser(data: CreateUserRequest) {
    const payload: CreateUserRequest = {
      ...data,
      role: mapRoleToBackendRole(data.role),
    };
    const response = await request<UserDetails>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async resendInvitation(id: string) {
    const response = await request<UserDetails>(`/users/${id}/resend-invitation`, {
      method: "POST",
    });
    return response.data;
  },

  async getSmtpDiagnostics() {
    const response = await request<{
      senderName: string;
      senderEmail: string;
      smtpServer: string;
      smtpPort: number;
      username: string;
      enableSsl: boolean;
      isPasswordConfigured: boolean;
      isAppPasswordFormatValid: boolean;
      configuredPasswordLength: number;
      senderMatchesUsername: boolean;
      statusSummary: string;
    }>("/users/smtp-diagnostics", {
      method: "GET",
    });
    return response.data;
  },

  async sendTestEmail(recipientEmail: string) {
    const response = await request<{
      success: boolean;
      failureCategory: string;
      diagnosticMessage: string;
      smtpStatusCode?: string | null;
      timestampUtc: string;
    }>("/users/test-email", {
      method: "POST",
      body: JSON.stringify({ recipientEmail }),
    });
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    const payload: UpdateUserRequest = {
      ...data,
      role: data.role ? mapRoleToBackendRole(data.role) : data.role,
    };
    const response = await request<UserDetails>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateUserStatus(id: string, isActive: boolean, status?: string) {
    const response = await request<boolean>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive, status }),
    });
    return response.data;
  },

  async approvePartner(id: string, notes?: string) {
    const response = await request<UserDetails>(`/users/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
    return response.data;
  },

  async rejectPartner(id: string, reason: string) {
    const response = await request<UserDetails>(`/users/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await request<boolean>(`/users/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },

  async updateUserRoles(id: string, roles: string[]) {
    const normalizedRoles = roles.map((r) => mapRoleToBackendRole(r));
    const response = await request<boolean>(`/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles: normalizedRoles }),
    });
    return response.data;
  },

  async getUserPermissions(id: string) {
    const response = await request<string[]>(`/users/${id}/permissions`, {
      method: "GET",
    });
    return response.data || [];
  },
};
