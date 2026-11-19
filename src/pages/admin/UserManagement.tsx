import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Check,
  Clock,
  LockKeyhole,
  Download,
  Plus,
  Search,
  ChevronRight,
  MoreHorizontal,
  ShieldCheck,
  X,
  Mail,
  UserPlus,
  Settings2,
  Loader2,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { userService } from "../../services/userService";
import type { UserDetails, UserStats } from "../../types/user";
import PermissionGuard from "../../components/common/PermissionGuard";

type UserStatus = "Active" | "Pending" | "Disabled";
type Verification = "Verified" | "Pending Approval" | "Email Verified";

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  organisation: string;
  role: string;
  verification: Verification;
  status: UserStatus;
  lastActive: string;
};

const initialUsers: User[] = [
  {
    id: "USR-10482",
    name: "Amina Mensah",
    email: "amina@ndha.gov",
    initials: "AM",
    organisation: "National Disaster Management Centre",
    role: "Emergency Coordinator",
    verification: "Verified",
    status: "Active",
    lastActive: "2 min ago",
  },
  {
    id: "USR-10476",
    name: "Sanjana Amarasinghe",
    email: "sanjana@carelink.org",
    initials: "SA",
    organisation: "CareLink Shelter Network",
    role: "Shelter Administrator",
    verification: "Verified",
    status: "Active",
    lastActive: "18 min ago",
  },
  {
    id: "USR-10469",
    name: "Nadia Okafor",
    email: "nadia@criefios.org",
    initials: "NO",
    organisation: "Community Response Alliance",
    role: "Volunteer Coordinator",
    verification: "Verified",
    status: "Active",
    lastActive: "42 min ago",
  },
  {
    id: "USR-10461",
    name: "Daniel Perera",
    email: "daniel@logistics.gov",
    initials: "DP",
    organisation: "Emergency Logistics Unit",
    role: "Resource Manager",
    verification: "Verified",
    status: "Active",
    lastActive: "1 hr ago",
  },
  {
    id: "USR-10458",
    name: "Sara Khan",
    email: "sara@globalrelief.org",
    initials: "SK",
    organisation: "Global Relief Network",
    role: "Partner Organisation Officer",
    verification: "Pending Approval",
    status: "Pending",
    lastActive: "Never",
  },
  {
    id: "USR-10444",
    name: "Musa Bello",
    email: "musa@example.org",
    initials: "MB",
    organisation: "Independent",
    role: "Volunteer",
    verification: "Email Verified",
    status: "Active",
    lastActive: "Yesterday",
  },
  {
    id: "USR-10431",
    name: "Lin Wei",
    email: "lin@example.org",
    initials: "LW",
    organisation: "Independent",
    role: "Citizen",
    verification: "Verified",
    status: "Disabled",
    lastActive: "12 days ago",
  },
];

const roles = [
  "Emergency Coordinator",
  "Shelter Administrator",
  "Volunteer Coordinator",
  "Resource Manager",
  "Partner Organisation Officer",
  "Volunteer",
  "Citizen",
  "System Administrator",
];

function mapUserDetailsToUser(details: UserDetails): User {
  const initials = details.fullName
    ? details.fullName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const status: UserStatus = !details.isActive
    ? "Disabled"
    : details.emailConfirmed
    ? "Active"
    : "Pending";

  const verification: Verification = details.emailConfirmed
    ? "Verified"
    : "Pending Approval";

  return {
    id: details.id,
    name: details.fullName,
    email: details.email,
    initials: initials || "U",
    organisation: details.organizationName || "Independent",
    role: details.role || (details.roles && details.roles[0]) || "Citizen",
    verification,
    status,
    lastActive: details.lastActive || "Recently",
  };
}

function StatusBadge({ status }: { status: UserStatus }) {
  const styles = {
    Active: "bg-[#E5F6F1] text-[#208D70]",
    Pending: "bg-orange-50 text-orange-700",
    Disabled: "bg-red-50 text-red-600",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function VerificationBadge({
  verification,
}: {
  verification: Verification;
}) {
  if (verification === "Pending Approval") {
    return (
      <span className="flex items-center gap-1.5 text-[9px] text-orange-700">
        <Clock size={12} />
        Pending Approval
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[9px] text-[#268D76]">
      <Check size={12} />
      {verification}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Users;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon size={18} />
        </div>

        <div>
          <p className="text-[9px] text-slate-500">{title}</p>
          <h3 className="mt-0.5 text-xl font-bold tracking-tight text-[#123B5C]">
            {value}
          </h3>
          <p className="mt-0.5 text-[8px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [organisationFilter, setOrganisationFilter] = useState("All organisations");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [menuUser, setMenuUser] = useState<string | null>(null);

  const [showEmailColumn, setShowEmailColumn] = useState(true);
  const [showLastActive, setShowLastActive] = useState(true);

  // Invite modal form fields
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Volunteer Coordinator");
  const [inviteEnvironment, setInviteEnvironment] = useState("Production");
  const [inviteScope, setInviteScope] = useState("Selected record");
  const [inviteApprovalType, setInviteApprovalType] = useState(
    "Standard administrator approval"
  );
  const [administrativeRationale, setAdministrativeRationale] = useState("");

  // Load data from backend API
  const loadUsersAndStats = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [pagedResult, statsResult] = await Promise.all([
        userService.getUsers({
          search: search || undefined,
          role: roleFilter !== "All roles" ? roleFilter : undefined,
          status: statusFilter !== "All statuses" ? statusFilter : undefined,
          tab: activeTab !== "All users" ? activeTab : undefined,
          pageSize: 100,
        }),
        userService.getUserStats(),
      ]);

      if (pagedResult && pagedResult.items) {
        const mappedUsers = pagedResult.items.map(mapUserDetailsToUser);
        setUsers(mappedUsers);
      }

      if (statsResult) {
        setStats(statsResult);
      }
    } catch (err: any) {
      console.warn("Could not load users from backend, maintaining existing view:", err);
      // Fallback to local filtering if server error occurs
      setApiError(err.message || "Failed to load latest user records from backend.");
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, activeTab]);

  useEffect(() => {
    loadUsersAndStats();
  }, [loadUsersAndStats]);

  // Flash message timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const tabs = useMemo(() => [
    { label: "All users", count: stats ? stats.totalUsers.toLocaleString() : users.length.toString() },
    { label: "Pending approval", count: stats ? stats.pendingUsers.toLocaleString() : "0" },
    { label: "Privileged users", count: stats ? stats.privilegedUsers.toLocaleString() : "3" },
    { label: "Disabled", count: stats ? stats.disabledUsers.toLocaleString() : "0" },
  ], [stats, users.length]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        `${user.name} ${user.email} ${user.id} ${user.organisation}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const roleMatch =
        roleFilter === "All roles" || user.role === roleFilter;

      const organisationMatch =
        organisationFilter === "All organisations" ||
        user.organisation === organisationFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        user.status === statusFilter;

      const tabMatch =
        activeTab === "All users" ||
        (activeTab === "Pending approval" &&
          user.verification === "Pending Approval") ||
        (activeTab === "Privileged users" &&
          ["Emergency Coordinator", "System Administrator", "Resource Manager", "Logistics Manager", "Shelter Administrator"].includes(user.role)) ||
        (activeTab === "Disabled" && user.status === "Disabled");

      return searchMatch && roleMatch && organisationMatch && statusMatch && tabMatch;
    });
  }, [users, search, roleFilter, organisationFilter, statusFilter, activeTab]);

  const toggleUser = (id: string) => {
    setSelectedUsers((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const updateUserStatus = async (id: string, newStatus: UserStatus) => {
    try {
      await userService.updateUserStatus(id, newStatus === "Active");
      setSuccessMessage(`User status updated to ${newStatus}.`);
      await loadUsersAndStats();
    } catch (err: any) {
      // Local fallback optimistic update
      setUsers((previous) =>
        previous.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
      setApiError(err.message || "Failed to update user status on server.");
    }

    setSelectedUser((previous) =>
      previous?.id === id ? { ...previous, status: newStatus } : previous
    );
    setMenuUser(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) {
      return;
    }

    try {
      await userService.deleteUser(id);
      setSuccessMessage("User account removed successfully.");
      setSelectedUser(null);
      setMenuUser(null);
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(err.message || "Failed to delete user account.");
    }
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    try {
      await userService.createUser({
        fullName: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        isActive: true,
      });

      setSuccessMessage(`User "${inviteName}" has been successfully provisioned.`);
      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Volunteer Coordinator");
      setInviteEnvironment("Production");
      setInviteScope("Selected record");
      setInviteApprovalType("Standard administrator approval");
      setAdministrativeRationale("");
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(err.message || "Failed to provision user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Organisation",
      "Role",
      "Verification",
      "Status",
      "Last Active",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.organisation,
      user.role,
      user.verification,
      user.status,
      user.lastActive,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `carelink-users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#EFF6F7]">

      {/* Top breadcrumb */}
      <div className="flex h-8 items-center gap-2 bg-white px-6 text-[9px] text-slate-400">
        <span>Administration</span>
        <ChevronRight size={11} />
        <span className="font-semibold text-[#123B5C]">
          User Management
        </span>
      </div>

      <main className="mx-auto max-w-[1700px] px-4 py-6 md:px-7 lg:px-8">

        {/* Heading */}
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#123B5C]">
              User Management
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Manage identities, organisation memberships, roles, verification, and account security.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadUsersAndStats()}
              disabled={isLoading}
              title="Refresh records"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-[#2785B2]" : ""} />
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-md bg-[#2785B2] px-4 py-2.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D6E98]"
            >
              <Plus size={14} />
              Invite User
            </button>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {apiError && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-red-500 hover:text-red-800"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Check size={16} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-800"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="TOTAL REGISTERED USERS"
            value={stats ? stats.totalUsers.toLocaleString() : users.length}
            description="Active accounts in database"
            icon={Users}
            color="bg-[#EBF3F8] text-[#2785B2]"
          />

          <StatCard
            title="ACTIVE USERS"
            value={stats ? stats.activeUsers.toLocaleString() : users.filter((u) => u.status === "Active").length}
            description="Operational access allowed"
            icon={Check}
            color="bg-[#E7F6F1] text-[#42B99A]"
          />

          <StatCard
            title="PENDING VERIFICATION"
            value={stats ? stats.pendingUsers.toLocaleString() : users.filter((u) => u.status === "Pending").length}
            description="Awaiting identity review"
            icon={Clock}
            color="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="DISABLED ACCOUNTS"
            value={stats ? stats.disabledUsers.toLocaleString() : users.filter((u) => u.status === "Disabled").length}
            description="Access revoked or blocked"
            icon={LockKeyhole}
            color="bg-red-50 text-red-600"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[10px] font-semibold transition ${
                activeTab === tab.label
                  ? "border-[#2785B2] text-[#2785B2]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[8px] text-slate-600">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, user ID, or organisation..."
              className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[10px] outline-none"
            >
              <option>All roles</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>

            <select
              value={organisationFilter}
              onChange={(e) => setOrganisationFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[10px] outline-none"
            >
              <option>All organisations</option>
              {[...new Set(users.map((user) => user.organisation))].map(
                (organisation) => (
                  <option key={organisation}>{organisation}</option>
                )
              )}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[10px] outline-none"
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Disabled</option>
            </select>
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2785B2] bg-white px-3 text-[10px] font-medium text-[#2785B2] hover:bg-sky-50"
          >
            <Settings2 size={13} />
            More filters
          </button>
        </div>

        {showMoreFilters && (
          <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex items-center gap-2 text-[10px]">
              <input type="checkbox" className="accent-[#2785B2]" />
              Verified accounts only
            </label>

            <label className="flex items-center gap-2 text-[10px]">
              <input type="checkbox" className="accent-[#2785B2]" />
              Privileged accounts
            </label>

            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("All roles");
                setOrganisationFilter("All organisations");
                setStatusFilter("All statuses");
                setActiveTab("All users");
              }}
              className="ml-auto text-[10px] font-semibold text-[#2785B2]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* User Table */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

          {/* Table header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-[#123B5C]">
                  {activeTab}
                </h2>
                {isLoading && <Loader2 size={13} className="animate-spin text-[#2785B2]" />}
              </div>
              <p className="mt-1 text-[9px] text-slate-400">
                {filteredUsers.length} records retrieved from system
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowColumns(!showColumns)}
                  className="rounded-md px-3 py-2 text-[9px] font-medium text-[#2785B2] hover:bg-sky-50"
                >
                  Columns
                </button>

                {showColumns && (
                  <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                    <label className="flex items-center gap-2 py-2 text-[10px]">
                      <input
                        type="checkbox"
                        checked={showEmailColumn}
                        onChange={(e) => setShowEmailColumn(e.target.checked)}
                      />
                      Email
                    </label>

                    <label className="flex items-center gap-2 py-2 text-[10px]">
                      <input
                        type="checkbox"
                        checked={showLastActive}
                        onChange={(e) => setShowLastActive(e.target.checked)}
                      />
                      Last active
                    </label>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="rounded-md border border-[#2785B2] px-3 py-2 text-[9px] font-medium text-[#2785B2] hover:bg-sky-50"
              >
                Bulk actions
              </button>
            </div>
          </div>

          {showBulkActions && (
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-sky-50 px-4 py-3">
              <span className="text-[10px] font-semibold">
                {selectedUsers.length} users selected
              </span>

              <button
                disabled={selectedUsers.length === 0}
                onClick={async () => {
                  for (const id of selectedUsers) {
                    await userService.updateUserStatus(id, true).catch(() => {});
                  }
                  setSelectedUsers([]);
                  await loadUsersAndStats();
                }}
                className="rounded border border-emerald-200 bg-white px-3 py-1.5 text-[9px] text-emerald-700 disabled:opacity-40"
              >
                Activate selected
              </button>

              <button
                disabled={selectedUsers.length === 0}
                onClick={async () => {
                  for (const id of selectedUsers) {
                    await userService.updateUserStatus(id, false).catch(() => {});
                  }
                  setSelectedUsers([]);
                  await loadUsersAndStats();
                }}
                className="rounded border border-red-200 bg-white px-3 py-1.5 text-[9px] text-red-600 disabled:opacity-40"
              >
                Disable selected
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F6F9FA] text-[9px] text-slate-500">
                  <th className="w-12 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedUsers.length === filteredUsers.length
                      }
                      onChange={toggleAll}
                      aria-label="Select all users"
                      className="accent-[#2785B2]"
                    />
                  </th>

                  <th className="px-3 py-3">User</th>

                  {showEmailColumn && (
                    <th className="px-3 py-3">Email</th>
                  )}

                  <th className="px-3 py-3">Organisation</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Verification</th>
                  <th className="px-3 py-3">Account Status</th>

                  {showLastActive && (
                    <th className="px-3 py-3">Last Active</th>
                  )}

                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 text-[9px] transition hover:bg-[#F8FBFC]"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        aria-label={`Select ${user.name}`}
                        className="accent-[#2785B2]"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-2 text-left"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F1F6] text-[9px] font-bold text-[#2785B2]">
                          {user.initials}
                        </span>

                        <span>
                          <span className="block font-semibold text-[#123B5C]">
                            {user.name}
                          </span>

                          <span className="mt-1 block text-[8px] text-slate-400">
                            {user.id}
                          </span>
                        </span>
                      </button>
                    </td>

                    {showEmailColumn && (
                      <td className="px-3 py-3 text-slate-500">
                        {user.email}
                      </td>
                    )}

                    <td className="px-3 py-3">
                      {user.organisation}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex whitespace-nowrap rounded bg-[#EAF3F8] px-2 py-1 text-[8px] font-medium text-[#26769E]">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <VerificationBadge verification={user.verification} />
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge status={user.status} />
                    </td>

                    {showLastActive && (
                      <td className="px-3 py-3 text-slate-500">
                        {user.lastActive}
                      </td>
                    )}

                    <td className="relative px-3 py-3">
                      <button
                        onClick={() =>
                          setMenuUser(menuUser === user.id ? null : user.id)
                        }
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        aria-label="User actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {menuUser === user.id && (
                        <div className="absolute right-8 top-7 z-20 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setMenuUser(null);
                            }}
                            className="block w-full rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"
                          >
                            View profile
                          </button>

                          <button
                            onClick={() => updateUserStatus(
                              user.id,
                              user.status === "Disabled" ? "Active" : "Disabled"
                            )}
                            className="block w-full rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"
                          >
                            {user.status === "Disabled" ? "Activate user" : "Disable user"}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="block w-full rounded px-3 py-2 text-left text-[10px] text-red-600 hover:bg-red-50"
                          >
                            Delete user
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-xs text-slate-400"
                    >
                      No users found. Try changing your search or filters.
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                      <Loader2 size={18} className="mx-auto animate-spin text-[#2785B2]" />
                      <span className="mt-2 block">Loading user records...</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row">
            <p className="text-[9px] text-slate-500">
              Showing 1-{filteredUsers.length} of {stats?.totalUsers ?? filteredUsers.length} users
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="rounded-md border border-slate-200 px-3 py-2 text-[9px] text-slate-400"
              >
                Previous
              </button>

              <button className="rounded-md bg-[#2785B2] px-3 py-2 text-[9px] font-semibold text-white">
                1
              </button>

              <button
                disabled
                className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-[9px] text-slate-400"
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </section>

        <footer className="py-4 text-[9px] text-slate-400">
          © 2026 Humanitarian Aid Platform · CareLink
        </footer>
      </main>

      {/* INVITE USER MODAL */}
      {showInvite && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowInvite(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-user-title"
            className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[9px] font-bold tracking-[0.16em] text-[#269C91]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2
                  id="invite-user-title"
                  className="mt-2 text-lg font-semibold text-[#123B5C]"
                >
                  Invite / Create User
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowInvite(false)}
                aria-label="Close invite user modal"
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 px-5 py-5 sm:px-6">
              {/* User details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="invite-full-name"
                    className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                  >
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="invite-full-name"
                    required
                    autoFocus
                    value={inviteName}
                    onChange={(event) => setInviteName(event.target.value)}
                    placeholder="Enter full name"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-email"
                    className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                  >
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="invite-email"
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="name@example.org"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-role"
                    className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                  >
                    Assign role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="invite-environment"
                    className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                  >
                    Environment
                  </label>
                  <select
                    id="invite-environment"
                    value={inviteEnvironment}
                    onChange={(event) => setInviteEnvironment(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  >
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="invite-scope"
                    className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                  >
                    Scope
                  </label>
                  <select
                    id="invite-scope"
                    value={inviteScope}
                    onChange={(event) => setInviteScope(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  >
                    <option>Selected record</option>
                    <option>Organisation</option>
                    <option>All users</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="invite-approval-type"
                    className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                  >
                    Approval type
                  </label>
                  <select
                    id="invite-approval-type"
                    value={inviteApprovalType}
                    onChange={(event) =>
                      setInviteApprovalType(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  >
                    <option>Standard administrator approval</option>
                    <option>Second administrator approval</option>
                    <option>Emergency approval</option>
                  </select>
                </div>
              </div>

              {/* Administrative rationale */}
              <div>
                <label
                  htmlFor="invite-rationale"
                  className="mb-1.5 block text-[10px] font-semibold text-[#123B5C]"
                >
                  Administrative rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="invite-rationale"
                  required
                  minLength={10}
                  rows={3}
                  value={administrativeRationale}
                  onChange={(event) =>
                    setAdministrativeRationale(event.target.value)
                  }
                  placeholder="Explain the authorised reason for this provision..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#2785B2]"
                />
                <p className="text-[9px] leading-5 text-slate-700">
                  This identity will be registered directly in ASP.NET Core Identity with role-based operational permissions and auditable credentials.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse justify-end gap-2 pt-1 sm:flex-row">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowInvite(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#1D6E98] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Confirm &amp; Provision
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-[75]">
          <button
            onClick={() => setSelectedUser(null)}
            aria-label="Close user details"
            className="absolute inset-0 bg-slate-900/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-[9px] font-bold tracking-widest text-[#2785B2]">
                  USER PROFILE
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  Account details
                </h2>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                aria-label="Close profile"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F1F6] text-lg font-bold text-[#2785B2]">
                  {selectedUser.initials}
                </div>

                <div>
                  <h3 className="text-base font-semibold">
                    {selectedUser.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedUser.id}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={selectedUser.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-[9px] text-slate-400">EMAIL ADDRESS</p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-medium">
                    <Mail size={13} />
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">ORGANISATION</p>
                  <p className="mt-1 text-xs font-medium">
                    {selectedUser.organisation}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">ROLE</p>
                  <p className="mt-1 text-xs font-medium">
                    {selectedUser.role}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">VERIFICATION</p>
                  <div className="mt-1">
                    <VerificationBadge verification={selectedUser.verification} />
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">LAST ACTIVE</p>
                  <p className="mt-1 text-xs font-medium">
                    {selectedUser.lastActive}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                <div className="flex items-center gap-2 text-sky-700">
                  <ShieldCheck size={15} />
                  <p className="text-[10px] font-semibold">
                    Account security
                  </p>
                </div>

                <p className="mt-2 text-[9px] leading-5 text-slate-600">
                  Account status and permissions are enforced in real time by the backend authorization policy.
                </p>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-200 p-4">
              <button
                onClick={() =>
                  updateUserStatus(
                    selectedUser.id,
                    selectedUser.status === "Disabled" ? "Active" : "Disabled"
                  )
                }
                className={`flex-1 rounded-lg py-3 text-xs font-semibold ${
                  selectedUser.status === "Disabled"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                {selectedUser.status === "Disabled"
                  ? "Activate account"
                  : "Disable account"}
              </button>

              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-100"
                title="Delete user"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
