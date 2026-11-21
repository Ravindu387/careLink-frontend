import { request } from "./api";
import type {
  Role,
  RoleDetails,
  CreateRolePayload,
  UpdateRolePayload,
  PermissionCategory,
} from "../types/role";

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const res = await request<Role[]>("/roles", {
      method: "GET",
    });
    return res.data || [];
  },

  async getRoleById(id: string): Promise<RoleDetails> {
    const res = await request<RoleDetails>(`/roles/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  async createRole(payload: CreateRolePayload): Promise<RoleDetails> {
    const res = await request<RoleDetails>("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<RoleDetails> {
    const res = await request<RoleDetails>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteRole(id: string): Promise<boolean> {
    const res = await request<boolean>(`/roles/${id}`, {
      method: "DELETE",
    });
    return res.data ?? false;
  },

  async getRolePermissions(roleId: string): Promise<string[]> {
    const res = await request<string[]>(`/roles/${roleId}/permissions`, {
      method: "GET",
    });
    return res.data || [];
  },

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<boolean> {
    const res = await request<boolean>(`/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    });
    return res.data ?? false;
  },

  async getAllPermissions(): Promise<PermissionCategory[]> {
    const res = await request<PermissionCategory[]>("/permissions", {
      method: "GET",
    });
    return res.data || [];
  },
};
