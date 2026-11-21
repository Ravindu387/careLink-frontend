import { request } from "./api";
import type {
  UserDetails,
  UserStats,
  PaginatedList,
  CreateUserRequest,
  UpdateUserRequest,
  UserListQuery,
} from "../types/user";

export const userService = {
  async getUsers(query?: UserListQuery) {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.role && query.role !== "All roles") params.append("role", query.role);
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
    const response = await request<UserDetails>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    const response = await request<UserDetails>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateUserStatus(id: string, isActive: boolean) {
    const response = await request<boolean>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
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
    const response = await request<boolean>(`/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
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
