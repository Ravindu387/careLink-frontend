import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Users,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ChevronRight,
  X,
  Check,
  Eye,
  Edit3,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";
import type { Role, PermissionCategory } from "../../types/role";
import type { UserDetails } from "../../types/user";

export default function RolesPermissions() {
  // State
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Role Permissions Edit Modal
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Create Role State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePurpose, setNewRolePurpose] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Detail Modal
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [detailPermissions, setDetailPermissions] = useState<string[]>([]);

  // Selected Category Modal
  const [selectedCategory, setSelectedCategory] = useState<PermissionCategory | null>(null);

  // User Management in Roles page
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [editingUserRoles, setEditingUserRoles] = useState<string[]>([]);
  const [userEffectivePerms, setUserEffectivePerms] = useState<string[]>([]);
  const [isSavingUserRoles, setIsSavingUserRoles] = useState(false);

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Load Roles & Permissions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getAllPermissions(),
      ]);
      setRoles(rolesData);
      setCategories(permsData);
    } catch (err: any) {
      setError(err.message || "Failed to load roles and permissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Users when tab switched
  const loadUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await userService.getUsers({
        search: userSearch || undefined,
        pageSize: 50,
      });
      setUsers(res.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users list.");
    } finally {
      setIsUsersLoading(false);
    }
  }, [userSearch]);

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  // Filter Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = `${role.id} ${role.name} ${role.purpose}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All statuses" || role.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const visibleRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Open Edit Permissions Modal
  const handleOpenEditPermissions = async (role: Role) => {
    setEditingRole(role);
    setError(null);
    try {
      const perms = await roleService.getRolePermissions(role.id);
      setEditingPermissions(perms);
    } catch (err: any) {
      setError(err.message || "Could not retrieve role permissions.");
    }
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!editingRole) return;

    setConfirmDialog({
      isOpen: true,
      title: `Update Permissions for ${editingRole.name}?`,
      message: `You are about to modify operational authorizations for '${editingRole.name}'. Active sessions assigned to this role will reflect these changes immediately.`,
      onConfirm: async () => {
        setIsSavingPermissions(true);
        setError(null);
        try {
          await roleService.updateRolePermissions(editingRole.id, editingPermissions);
          notifySuccess(`Permissions for role '${editingRole.name}' updated successfully.`);
          setEditingRole(null);
          await loadData();
        } catch (err: any) {
          setError(err.message || "Failed to update permissions.");
        } finally {
          setIsSavingPermissions(false);
        }
      },
    });
  };

  // Open View Details
  const handleOpenDetail = async (role: Role) => {
    setDetailRole(role);
    try {
      const perms = await roleService.getRolePermissions(role.id);
      setDetailPermissions(perms);
    } catch {
      setDetailPermissions([]);
    }
  };

  // Create Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreatingRole(true);
    setError(null);
    try {
      await roleService.createRole({
        name: newRoleName.trim(),
        purpose: newRolePurpose.trim(),
        permissions: newRolePermissions,
      });
      notifySuccess(`Custom role '${newRoleName.trim()}' created successfully.`);
      setShowCreateModal(false);
      setNewRoleName("");
      setNewRolePurpose("");
      setNewRolePermissions([]);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create role.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Open User Role Editing
  const handleOpenUserRoleModal = async (u: UserDetails) => {
    setEditingUser(u);
    setEditingUserRoles(u.roles || [u.role || "Citizen"]);
    try {
      const perms = await userService.getUserPermissions(u.id);
      setUserEffectivePerms(perms);
    } catch {
      setUserEffectivePerms([]);
    }
  };

  // Save User Roles
  const handleSaveUserRoles = () => {
    if (!editingUser) return;

    setConfirmDialog({
      isOpen: true,
      title: `Update Role Assignment for ${editingUser.fullName}?`,
      message: `Are you sure you want to assign [${editingUserRoles.join(", ")}] to ${editingUser.fullName}? This will update their operational system privileges immediately.`,
      onConfirm: async () => {
        setIsSavingUserRoles(true);
        setError(null);
        try {
          await userService.updateUserRoles(editingUser.id, editingUserRoles);
          notifySuccess(`Roles for ${editingUser.fullName} updated successfully.`);
          setEditingUser(null);
          await loadUsers();
          await loadData();
        } catch (err: any) {
          setError(err.message || "Failed to update user roles.");
        } finally {
          setIsSavingUserRoles(false);
        }
      },
    });
  };

  // Export Matrix CSV
  const exportMatrix = () => {
    const allPermNames = categories.flatMap((c) => c.permissions.map((p) => p.name));
    const header = ["Role Name", "Type", "Status", "Users", ...allPermNames];
    const rows = roles.map((r) => {
      return [
        r.name,
        r.isSystemRole ? "System" : "Custom",
        r.status,
        r.usersCount,
        ...allPermNames.map((p) => (r.name.includes("Admin") ? "YES" : "—")),
      ];
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "carelink-role-permission-matrix.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-6 md:px-6 lg:px-7">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[9px] text-slate-500">
            <span>Administration</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#123B5C]">Roles &amp; Permissions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#123B5C] md:text-[26px]">
            Roles &amp; Access Control
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Centrally administer system roles, granular permissions, and user role provisioning.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportMatrix}
            className="flex items-center gap-2 rounded-xl border border-[#B9D1DD] bg-white px-3.5 py-2 text-xs font-semibold text-[#2785B2] shadow-xs transition hover:bg-sky-50"
          >
            <Download size={14} />
            Export Matrix
          </button>
          <button
            onClick={() => setShowMatrix(true)}
            className="flex items-center gap-2 rounded-xl border border-[#B9D1DD] bg-white px-3.5 py-2 text-xs font-semibold text-[#123B5C] shadow-xs transition hover:bg-slate-50"
          >
            <ShieldCheck size={14} />
            View Full Matrix
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#123B5C] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0E2E48]"
          >
            <Plus size={15} />
            Create Role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "roles"
              ? "border-[#123B5C] text-[#123B5C]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          System Roles &amp; Permissions
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "users"
              ? "border-[#123B5C] text-[#123B5C]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          User Role Assignments
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            {successMessage}
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-rose-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Security Notice Banner */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50/70 px-4 py-3 text-xs text-purple-900">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
        <div>
          <span className="font-bold">Role-Based Security Enforcement:</span> System roles are
          protected. Changes to role permission sets or user roles take effect in real time on the
          backend. The last active administrator cannot be demoted or deleted.
        </div>
      </div>

      {activeTab === "roles" ? (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-xs">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search roles by name or purpose..."
                className="w-full bg-transparent text-xs outline-hidden placeholder:text-slate-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-hidden shadow-xs"
            >
              <option>All statuses</option>
              <option>Protected</option>
              <option>Active</option>
            </select>
            <button
              onClick={loadData}
              title="Refresh"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Roles Table */}
          <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold text-[#123B5C]">Configured System Roles</h2>
                <p className="text-[10px] text-slate-400">
                  {roles.length} registered roles · {roles.filter((r) => r.isSystemRole).length} built-in
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-semibold text-slate-500">
                    <th className="px-4 py-3">Role Name</th>
                    <th className="px-4 py-3">Purpose &amp; Scope</th>
                    <th className="px-4 py-3 text-center">Assigned Users</th>
                    <th className="px-4 py-3 text-center">Permissions</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-[#123B5C]" />
                          Loading platform roles...
                        </div>
                      </td>
                    </tr>
                  ) : visibleRoles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">
                        No roles match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    visibleRoles.map((role) => (
                      <tr key={role.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 font-bold text-[#123B5C]">{role.name}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                          {role.purpose}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-800">
                          {role.usersCount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                            {role.permissionsCount} perms
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[10px] font-medium text-slate-500">
                            {role.isSystemRole ? "System" : "Custom"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-md px-2.5 py-0.5 text-[10px] font-semibold ${
                              role.status === "Protected"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {role.status}
                          </span>
                        </td>
                        <td className="relative px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenDetail(role)}
                              title="View details"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEditPermissions(role)}
                              title="Edit permissions"
                              className="rounded-lg p-1.5 text-[#2785B2] hover:bg-sky-50"
                            >
                              <Edit3 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 sm:flex-row text-xs text-slate-500">
              <span>
                Showing {filteredRoles.length ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, filteredRoles.length)} of {filteredRoles.length} roles
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-[#123B5C] text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* Permission Categories Section */}
          <section className="mt-8">
            <h2 className="mb-3 text-xs font-bold text-[#123B5C] uppercase tracking-wider">
              Permission Domains ({categories.reduce((acc, c) => acc + c.count, 0)} Total Granular Rights)
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-[#123B5C]/40 hover:shadow-sm"
                >
                  <div>
                    <span className="block text-xs font-bold text-[#123B5C]">{cat.category}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {cat.count} granular permissions
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* USERS TAB */
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 p-5 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#123B5C]">User Role Assignments</h2>
              <p className="text-[10px] text-slate-400">
                Inspect user accounts, assign authorized roles, and inspect effective permissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                <Search size={14} className="text-slate-400" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadUsers()}
                  placeholder="Search user name or email..."
                  className="w-full bg-transparent text-xs outline-hidden"
                />
              </div>
              <button
                onClick={loadUsers}
                className="rounded-xl bg-[#123B5C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0E2E48]"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-semibold text-slate-500">
                  <th className="px-4 py-3">Full Name &amp; Email</th>
                  <th className="px-4 py-3">Current Role(s)</th>
                  <th className="px-4 py-3">Organisation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isUsersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(u.roles && u.roles.length > 0 ? u.roles : [u.role || "Citizen"]).map((r) => (
                            <span
                              key={r}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                r.includes("Admin")
                                  ? "bg-purple-100 text-purple-800"
                                  : r.includes("Coordinator")
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {u.organizationName || "Independent"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenUserRoleModal(u)}
                          className="inline-flex items-center gap-1 rounded-xl border border-[#B9D1DD] px-3 py-1.5 text-xs font-semibold text-[#123B5C] hover:bg-slate-50"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Assign Roles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL: EDIT ROLE PERMISSIONS */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#2785B2] uppercase">
                  Manage Role Permissions
                </span>
                <h3 className="text-base font-bold text-[#123B5C]">
                  Editing: {editingRole.name}
                </h3>
              </div>
              <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
              <p className="text-xs text-slate-600">
                Select or uncheck the specific granular rights for this role. Administrators always
                maintain essential security and assignment rights to avoid lockouts.
              </p>

              {categories.map((cat) => (
                <div key={cat.category} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-[#123B5C]">{cat.category}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const catPermNames = cat.permissions.map((p) => p.name);
                        const allSelected = catPermNames.every((p) => editingPermissions.includes(p));
                        if (allSelected) {
                          setEditingPermissions(editingPermissions.filter((p) => !catPermNames.includes(p)));
                        } else {
                          setEditingPermissions(Array.from(new Set([...editingPermissions, ...catPermNames])));
                        }
                      }}
                      className="text-[10px] font-semibold text-[#2785B2] hover:underline"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {cat.permissions.map((p) => {
                      const isChecked = editingPermissions.includes(p.name);
                      return (
                        <label
                          key={p.name}
                          className={`flex items-start gap-2 rounded-lg p-2 text-xs transition cursor-pointer ${
                            isChecked ? "bg-sky-50/70 text-[#123B5C] font-medium" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setEditingPermissions(editingPermissions.filter((x) => x !== p.name));
                              } else {
                                setEditingPermissions([...editingPermissions, p.name]);
                              }
                            }}
                            className="mt-0.5 rounded accent-[#123B5C]"
                          />
                          <div>
                            <div>{p.displayName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{p.name}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <span className="text-xs text-slate-500">
                {editingPermissions.length} permissions assigned
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingPermissions}
                  onClick={handleSavePermissions}
                  className="rounded-xl bg-[#123B5C] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0E2E48] disabled:opacity-40"
                >
                  {isSavingPermissions ? "Saving..." : "Save Role Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ROLE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#2785B2] uppercase">
                  Administrative Action
                </span>
                <h3 className="text-base font-bold text-[#123B5C]">Create Custom Role</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700">Role Name *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. FieldTriageOfficer"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-hidden focus:border-[#123B5C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Purpose / Scope</label>
                <textarea
                  rows={2}
                  value={newRolePurpose}
                  onChange={(e) => setNewRolePurpose(e.target.value)}
                  placeholder="Operational responsibilities and duties of this role..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-hidden focus:border-[#123B5C]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Select Permissions</label>
                  <span className="text-[10px] text-slate-500">
                    {newRolePermissions.length} selected
                  </span>
                </div>
                <div className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-slate-200 p-3">
                  {categories.map((cat) => (
                    <div key={cat.category}>
                      <span className="text-[11px] font-bold text-[#2785B2]">{cat.category}</span>
                      <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {cat.permissions.map((p) => {
                          const isSel = newRolePermissions.includes(p.name);
                          return (
                            <label
                              key={p.name}
                              className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => {
                                  if (isSel) {
                                    setNewRolePermissions(newRolePermissions.filter((x) => x !== p.name));
                                  } else {
                                    setNewRolePermissions([...newRolePermissions, p.name]);
                                  }
                                }}
                                className="rounded accent-[#123B5C]"
                              />
                              {p.displayName}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRole || !newRoleName.trim()}
                  className="rounded-xl bg-[#123B5C] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0E2E48] disabled:opacity-40"
                >
                  {isCreatingRole ? "Creating..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN USER ROLES */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#2785B2] uppercase">
                  Role Provisioning
                </span>
                <h3 className="text-base font-bold text-[#123B5C]">
                  {editingUser.fullName}
                </h3>
                <p className="text-[10px] text-slate-500">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Assigned Roles
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-3">
                  {roles.map((r) => {
                    const isChecked = editingUserRoles.some(
                      (role) => role.toLowerCase() === r.name.toLowerCase()
                    );
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 rounded-lg p-2 text-xs transition cursor-pointer ${
                          isChecked ? "bg-sky-50 font-bold text-[#123B5C]" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setEditingUserRoles(
                                editingUserRoles.filter((x) => x.toLowerCase() !== r.name.toLowerCase())
                              );
                            } else {
                              setEditingUserRoles([...editingUserRoles, r.name]);
                            }
                          }}
                          className="rounded accent-[#123B5C]"
                        />
                        {r.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Effective permissions preview */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Current Effective Permissions ({userEffectivePerms.length})
                </span>
                <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2 text-[10px] text-slate-600 flex flex-wrap gap-1">
                  {userEffectivePerms.length === 0 ? (
                    <span className="text-slate-400 italic">No effective permissions calculated yet.</span>
                  ) : (
                    userEffectivePerms.map((p) => (
                      <span key={p} className="rounded bg-white border border-slate-200 px-1.5 py-0.5">
                        {p}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingUserRoles || editingUserRoles.length === 0}
                onClick={handleSaveUserRoles}
                className="rounded-xl bg-[#123B5C] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0E2E48] disabled:opacity-40"
              >
                {isSavingUserRoles ? "Saving..." : "Update Roles"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ROLE DETAILS */}
      {detailRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#2785B2] uppercase">
                  Role Inspection
                </span>
                <h3 className="text-base font-bold text-[#123B5C]">{detailRole.name}</h3>
              </div>
              <button onClick={() => setDetailRole(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Role Identifier</span>
                <span className="font-mono font-bold text-slate-800">{detailRole.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-800">{detailRole.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Active Users</span>
                <span className="font-semibold text-slate-800">{detailRole.usersCount}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Purpose</span>
                <span className="text-slate-700 leading-relaxed">{detailRole.purpose}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">
                  Assigned Permissions ({detailPermissions.length})
                </span>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-wrap gap-1 text-[11px]">
                  {detailPermissions.length === 0 ? (
                    <span className="text-slate-400 italic">No permissions mapped.</span>
                  ) : (
                    detailPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-700 font-medium"
                      >
                        {perm}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailRole(null)}
                className="rounded-xl bg-[#123B5C] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0E2E48]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FULL PERMISSION MATRIX */}
      {showMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#2785B2] uppercase">
                  Centralized Access Matrix
                </span>
                <h3 className="text-base font-bold text-[#123B5C]">Role vs Domain Matrix</h3>
              </div>
              <button onClick={() => setShowMatrix(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-6">
              <table className="w-full min-w-[750px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500">
                    <th className="p-3">Role</th>
                    {categories.map((c) => (
                      <th key={c.category} className="p-3 text-center">
                        {c.category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#123B5C]">{r.name}</td>
                      {categories.map((c) => {
                        const hasFull = r.name.includes("Admin");
                        const hasCoord =
                          r.name === "EmergencyCoordinator" &&
                          !c.category.includes("User Management");
                        const hasAny = hasFull || hasCoord;
                        return (
                          <td key={c.category} className="p-3 text-center">
                            {hasAny ? (
                              <Check className="mx-auto h-4 w-4 text-emerald-600" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowMatrix(false)}
                className="rounded-xl bg-[#123B5C] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0E2E48]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h4>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {confirmDialog.message}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((d) => ({ ...d, isOpen: false }))}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog((d) => ({ ...d, isOpen: false }));
                  action();
                }}
                className="rounded-xl bg-[#123B5C] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0E2E48]"
              >
                Confirm &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
