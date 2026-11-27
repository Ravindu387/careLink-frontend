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
  XCircle,
  CheckCircle2,
  Edit3,
  Phone,
  Send,
  AlertTriangle,
} from "lucide-react";
import { userService } from "../../services/userService";
import type { UserDetails, UserStats, UserStatus, Verification } from "../../types/user";

export type User = {
  id: string;
  userName: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  initials: string;
  organisation: string;
  organisationType?: string | null;
  registrationNumber?: string | null;
  role: string;
  verification: Verification;
  status: UserStatus;
  rejectionReason?: string | null;
  skills?: string | null;
  availability?: string | null;
  preferredLocation?: string | null;
  requiresPasswordSetup?: boolean;
  emailSent?: boolean;
  emailDeliveryStatus?: string | null;
  lastActive: string;
};

const roles = [
  "Emergency Coordinator",
  "Case Manager",
  "Funding Officer",
  "Partner Officer",
  "Resource Manager",
  "Shelter Administrator",
  "Volunteer Coordinator",
  "System Administrator",
  "Admin",
  "Citizen",
  "Volunteer",
];

function formatRoleDisplay(role: string): string {
  switch (role) {
    case "SystemAdmin":
    case "Admin":
      return "System Administrator";
    case "CaseManager":
    case "IncidentManager":
      return "Case Manager";
    case "Citizen":
      return "Citizen";
    case "EmergencyCoordinator":
      return "Emergency Coordinator";
    case "FundingOfficer":
    case "Donor":
      return "Funding Officer";
    case "PartnerOfficer":
      return "Partner Officer";
    case "ResourceManager":
    case "LogisticsManager":
      return "Resource Manager";
    case "ShelterAdministrator":
    case "ShelterAdmin":
      return "Shelter Administrator";
    case "VolunteerCoordinator":
      return "Volunteer Coordinator";
    case "Volunteer":
      return "Volunteer";
    default:
      return role;
  }
}

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

  let status: UserStatus = "Active";
  if (details.accountStatus === "PendingApproval") {
    status = "PendingApproval";
  } else if (details.accountStatus === "Rejected") {
    status = "Rejected";
  } else if (
    details.accountStatus === "PendingPasswordSetup" ||
    details.requiresPasswordSetup
  ) {
    status = "PendingPasswordSetup";
  } else if (!details.isActive || details.accountStatus === "Disabled") {
    status = "Disabled";
  }

  let verification: Verification = "Verified";
  if (status === "PendingApproval") {
    verification = "Pending Approval";
  } else if (status === "Rejected") {
    verification = "Rejected";
  } else if (status === "PendingPasswordSetup" || details.requiresPasswordSetup) {
    verification = "Setup Pending";
  }

  const rawRole = details.role || (details.roles && details.roles[0]) || "Citizen";

  return {
    id: details.id,
    userName: details.userName || details.email,
    name: details.fullName,
    email: details.email,
    phoneNumber: details.phoneNumber,
    initials: initials || "U",
    organisation: details.organizationName || "Independent",
    organisationType: details.organizationType,
    registrationNumber: details.registrationNumber,
    role: formatRoleDisplay(rawRole),
    verification,
    status,
    rejectionReason: details.rejectionReason,
    skills: details.skills,
    availability: details.availability,
    preferredLocation: details.preferredLocation,
    requiresPasswordSetup: details.requiresPasswordSetup,
    emailSent: details.emailSent,
    emailDeliveryStatus: details.emailDeliveryStatus,
    lastActive: details.lastActive || "Recently",
  };
}

function StatusBadge({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    Active: "bg-[#E5F6F1] text-[#208D70]",
    PendingPasswordSetup: "bg-sky-50 text-sky-700",
    PendingApproval: "bg-orange-50 text-orange-700",
    Rejected: "bg-rose-50 text-rose-700",
    Disabled: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold ${
        styles[status] || styles.Active
      }`}
    >
      {status}
    </span>
  );
}

function VerificationBadge({ verification }: { verification: Verification }) {
  if (verification === "Pending Approval") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-orange-700">
        <Clock size={12} />
        Pending Approval
      </span>
    );
  }

  if (verification === "Rejected") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
        <XCircle size={12} />
        Rejected
      </span>
    );
  }

  if (verification === "Setup Pending") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-sky-700">
        <Clock size={12} />
        Password Setup Pending
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[#268D76]">
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
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          <Icon size={18} />
        </div>

        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <h3 className="mt-0.5 text-xl font-bold tracking-tight text-[#123B5C]">
            {value}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [organisationFilter, setOrganisationFilter] =
    useState("All organisations");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<User | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [menuUser, setMenuUser] = useState<string | null>(null);

  const [showEmailColumn, setShowEmailColumn] = useState(true);
  const [showLastActive, setShowLastActive] = useState(true);

  // Create User Modal Form Fields
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("Emergency Coordinator");
  const [inviteOrganisation, setInviteOrganisation] = useState("");
  const [inviteLocation, setInviteLocation] = useState("Greater Riverton");
  const [inviteSkills, setInviteSkills] = useState("");
  const [administrativeRationale, setAdministrativeRationale] = useState("");

  // Edit User Modal Form Fields
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<UserStatus>("Active");
  const [editSkills, setEditSkills] = useState("");
  const [editAvailability, setEditAvailability] = useState("");

  const loadUsersAndStats = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [pagedResult, statsResult] = await Promise.all([
        userService.getUsers({
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
      setApiError(err.message || "Failed to load user records from backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersAndStats();
  }, [loadUsersAndStats]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const tabs = useMemo(
    () => [
      {
        label: "All users",
        count: stats
          ? stats.totalUsers.toLocaleString()
          : users.length.toString(),
      },
      {
        label: "Pending approval",
        count: stats
          ? stats.pendingUsers.toLocaleString()
          : users
              .filter((u) => u.status === "PendingApproval")
              .length.toString(),
      },
      {
        label: "Pending setup",
        count:
          stats?.pendingSetupUsers !== undefined
            ? stats.pendingSetupUsers.toLocaleString()
            : users
                .filter((u) => u.status === "PendingPasswordSetup")
                .length.toString(),
      },
      {
        label: "Privileged users",
        count: stats ? stats.privilegedUsers.toLocaleString() : "0",
      },
      {
        label: "Rejected",
        count:
          stats?.rejectedUsers !== undefined
            ? stats.rejectedUsers.toLocaleString()
            : users.filter((u) => u.status === "Rejected").length.toString(),
      },
      {
        label: "Disabled",
        count: stats
          ? stats.disabledUsers.toLocaleString()
          : users.filter((u) => u.status === "Disabled").length.toString(),
      },
    ],
    [stats, users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        `${user.name} ${user.email} ${user.id} ${user.organisation} ${user.role}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const roleMatch = roleFilter === "All roles" || user.role === roleFilter;

      const organisationMatch =
        organisationFilter === "All organisations" ||
        user.organisation === organisationFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        user.status.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter === "Pending" && user.status === "PendingApproval");

      const tabMatch =
        activeTab === "All users" ||
        (activeTab === "Pending approval" &&
          user.status === "PendingApproval") ||
        (activeTab === "Pending setup" &&
          (user.status === "PendingPasswordSetup" ||
            user.requiresPasswordSetup)) ||
        (activeTab === "Rejected" && user.status === "Rejected") ||
        (activeTab === "Privileged users" &&
          [
            "Emergency Coordinator",
            "System Administrator",
            "Admin",
            "Case Manager",
            "Funding Officer",
            "Partner Officer",
            "Resource Manager",
            "Logistics Manager",
            "Shelter Administrator",
            "Volunteer Coordinator",
            "Incident Manager",
            "Partner Organisation Officer",
          ].includes(user.role)) ||
        (activeTab === "Disabled" && user.status === "Disabled");

      return (
        searchMatch &&
        roleMatch &&
        organisationMatch &&
        statusMatch &&
        tabMatch
      );
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
      await userService.updateUserStatus(id, newStatus === "Active", newStatus);
      setSuccessMessage(`User status updated to ${newStatus}.`);
      await loadUsersAndStats();
      setSelectedUser((previous) =>
        previous?.id === id ? { ...previous, status: newStatus } : previous
      );
    } catch (err: any) {
      setApiError(err.message || "Failed to update user status on server.");
    }
    setMenuUser(null);
  };

  const handleResendInvitation = async (user: User) => {
    setIsSubmitting(true);
    setApiError(null);
    setWarningMessage(null);
    try {
      const updated = await userService.resendInvitation(user.id);
      if (updated.emailSent) {
        setSuccessMessage(
          `Account setup invitation email resent successfully to ${user.email}.`
        );
      } else {
        setWarningMessage(
          `A fresh setup token was generated for ${user.name}, but the invitation email to ${user.email} could not be sent. Please check Gmail SMTP settings.`
        );
      }
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(
        err.message ||
          `Failed to resend invitation email to ${user.email}. Please verify SMTP settings.`
      );
    } finally {
      setIsSubmitting(false);
      setMenuUser(null);
    }
  };

  const handleApprovePartner = async (user: User) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const updated = await userService.approvePartner(
        user.id,
        "Approved by System Administrator after reviewing Partner Organization details."
      );
      const mapped = mapUserDetailsToUser(updated);
      setSuccessMessage(
        `Partner Organization "${user.organisation}" (${user.email}) approved and activated.`
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser(mapped);
      }
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(err.message || "Failed to approve Partner Organization.");
    } finally {
      setIsSubmitting(false);
      setMenuUser(null);
    }
  };

  const handleRejectPartnerSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!showRejectModal) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      const updated = await userService.rejectPartner(
        showRejectModal.id,
        rejectReasonInput.trim() ||
          "Organization credentials did not meet verification requirements."
      );
      const mapped = mapUserDetailsToUser(updated);
      setSuccessMessage(
        `Partner Organization "${showRejectModal.organisation}" (${showRejectModal.email}) rejected.`
      );
      if (selectedUser?.id === showRejectModal.id) {
        setSelectedUser(mapped);
      }
      setShowRejectModal(null);
      setRejectReasonInput("");
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(err.message || "Failed to reject Partner Organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditPhone(user.phoneNumber || "");
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditSkills(user.skills || "");
    setEditAvailability(user.availability || "");
    setShowEditModal(true);
    setMenuUser(null);
  };

  const handleEditUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editId) return;
    setIsSubmitting(true);
    setApiError(null);

    try {
      const updated = await userService.updateUser(editId, {
        fullName: editName.trim(),
        phoneNumber: editPhone.trim() || undefined,
        role: editRole,
        accountStatus: editStatus,
        isActive:
          editStatus === "Active" || editStatus === "PendingPasswordSetup",
        skills: editSkills.trim() || undefined,
        availability: editAvailability.trim() || undefined,
      });
      const mapped = mapUserDetailsToUser(updated);
      setSuccessMessage(`User "${mapped.name}" updated successfully.`);
      if (selectedUser?.id === editId) {
        setSelectedUser(mapped);
      }
      setShowEditModal(false);
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(err.message || "Failed to update user details.");
    } finally {
      setIsSubmitting(false);
    }
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
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setApiError("Full name and email address are required.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setWarningMessage(null);
    setSuccessMessage(null);

    try {
      const created = await userService.createUser({
        fullName: inviteName.trim(),
        email: inviteEmail.trim(),
        phoneNumber: invitePhone.trim() || undefined,
        role: inviteRole,
        organizationName: inviteOrganisation.trim() || undefined,
        preferredLocation: inviteLocation.trim() || undefined,
        skills: inviteSkills.trim() || undefined,
        isActive: true,
      });

      const assignedRoleLabel = formatRoleDisplay(
        created.role || inviteRole
      );

      if (created.emailSent) {
        setSuccessMessage(
          `Account created successfully for ${created.fullName}. Username: ${created.email} · Assigned role: ${assignedRoleLabel}. An account setup email has been sent to ${created.email}.`
        );
      } else {
        const failureReason = created.emailFailureDetail
          ? ` [${created.emailFailureCategory || "DeliveryFailed"}: ${created.emailFailureDetail}]`
          : "";
        setWarningMessage(
          `Account created for ${created.fullName} (Username: ${created.email} · Assigned role: ${assignedRoleLabel}), but the account setup invitation email could not be delivered.${failureReason} Please verify Gmail SMTP configuration or use 'Resend Invitation'.`
        );
      }

      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInvitePhone("");
      setInviteRole("Emergency Coordinator");
      setInviteOrganisation("");
      setInviteSkills("");
      setAdministrativeRationale("");
      await loadUsersAndStats();
    } catch (err: any) {
      setApiError(err.message || "Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "User ID",
      "Name",
      "Username / Email",
      "Organisation",
      "Role",
      "Verification",
      "Account Status",
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

    const csv = [headers, ...rows]
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
      <div className="flex h-8 items-center gap-2 bg-white px-6 text-xs text-slate-400">
        <span>Administration</span>
        <ChevronRight size={11} />
        <span className="font-semibold text-[#123B5C]">User Management</span>
      </div>

      <main className="mx-auto max-w-[1700px] px-4 py-6 md:px-7 lg:px-8">
        {/* Heading */}
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
              User Management
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Provision internal staff roles, approve Partner Organisations, and
              manage platform account access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadUsersAndStats()}
              disabled={isLoading}
              title="Refresh records"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isLoading ? "animate-spin text-[#2785B2]" : ""}
              />
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-md bg-[#2785B2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D6E98]"
            >
              <Plus size={14} />
              Create / Invite User
            </button>
          </div>
        </div>

        {/* Notifications / Alerts (No setup links or tokens are ever displayed) */}
        {apiError && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 shadow-sm"
          >
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

        {warningMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>{warningMessage}</span>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 shadow-sm"
          >
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
            description="Accounts in database"
            icon={Users}
            color="bg-[#EBF3F8] text-[#2785B2]"
          />

          <StatCard
            title="ACTIVE USERS"
            value={
              stats
                ? stats.activeUsers.toLocaleString()
                : users.filter((u) => u.status === "Active").length
            }
            description="Operational access allowed"
            icon={Check}
            color="bg-[#E7F6F1] text-[#42B99A]"
          />

          <StatCard
            title="PENDING PARTNER APPROVAL"
            value={
              stats
                ? stats.pendingUsers.toLocaleString()
                : users.filter((u) => u.status === "PendingApproval").length
            }
            description="Awaiting administrator decision"
            icon={Clock}
            color="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="DISABLED / RESTRICTED"
            value={
              stats
                ? (
                    stats.disabledUsers + (stats.rejectedUsers || 0)
                  ).toLocaleString()
                : users.filter(
                    (u) => u.status === "Disabled" || u.status === "Rejected"
                  ).length
            }
            description="Access revoked or rejected"
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
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.label
                  ? "border-[#2785B2] text-[#2785B2]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-slate-600">
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
              placeholder="Search name, email/username, user ID, or organisation..."
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All roles</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>

            <select
              value={organisationFilter}
              onChange={(e) => setOrganisationFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:text-[15px] outline-none"
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
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All statuses</option>
              <option value="Active">Active</option>
              <option value="PendingPasswordSetup">PendingPasswordSetup</option>
              <option value="PendingApproval">PendingApproval</option>
              <option value="Rejected">Rejected</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2785B2] bg-white px-3 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
          >
            <Settings2 size={13} />
            More filters
          </button>
        </div>

        {showMoreFilters && (
          <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("All roles");
                setOrganisationFilter("All organisations");
                setStatusFilter("All statuses");
                setActiveTab("All users");
              }}
              className="ml-auto text-sm font-semibold text-[#2785B2]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* User Table */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-[#123B5C]">
                  {activeTab}
                </h2>
                {isLoading && (
                  <Loader2 size={13} className="animate-spin text-[#2785B2]" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {filteredUsers.length} records retrieved from system
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowColumns(!showColumns)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
                >
                  Columns
                </button>

                {showColumns && (
                  <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                    <label className="flex items-center gap-2 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showEmailColumn}
                        onChange={(e) => setShowEmailColumn(e.target.checked)}
                      />
                      Email / Username
                    </label>

                    <label className="flex items-center gap-2 py-2 text-sm">
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
                className="rounded-md border border-[#2785B2] px-3 py-2 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
              >
                Bulk actions
              </button>
            </div>
          </div>

          {showBulkActions && (
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-sky-50 px-4 py-3">
              <span className="text-sm font-semibold">
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
                className="rounded border border-emerald-200 bg-white px-3 py-1.5 text-sm text-emerald-700 disabled:opacity-40"
              >
                Activate selected
              </button>

              <button
                disabled={selectedUsers.length === 0}
                onClick={async () => {
                  for (const id of selectedUsers) {
                    await userService
                      .updateUserStatus(id, false)
                      .catch(() => {});
                  }
                  setSelectedUsers([]);
                  await loadUsersAndStats();
                }}
                className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 disabled:opacity-40"
              >
                Disable selected
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F6F9FA] text-[13px] text-slate-500">
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
                    <th className="px-3 py-3">Username / Email</th>
                  )}

                  <th className="px-3 py-3">Organisation</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Verification</th>
                  <th className="px-3 py-3">Account Status</th>

                  {showLastActive && <th className="px-3 py-3">Last Active</th>}

                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 text-sm transition hover:bg-[#F8FBFC]"
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
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F1F6] text-xs font-bold text-[#2785B2]">
                          {user.initials}
                        </span>

                        <span>
                          <span className="block font-semibold text-[#123B5C]">
                            {user.name}
                          </span>
                          <span className="mt-1 block text-xs text-slate-400">
                            {user.id}
                          </span>
                        </span>
                      </button>
                    </td>

                    {showEmailColumn && (
                      <td className="px-3 py-3 text-slate-600">{user.email}</td>
                    )}

                    <td className="px-3 py-3">{user.organisation}</td>

                    <td className="px-3 py-3">
                      <span className="inline-flex whitespace-nowrap rounded bg-[#EAF3F8] px-2 py-1 text-xs font-medium text-[#26769E]">
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

                    <td className="relative px-3 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {(user.status === "PendingPasswordSetup" ||
                          user.requiresPasswordSetup) && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleResendInvitation(user)}
                            className="inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-[#2785B2] hover:bg-sky-100"
                          >
                            <Send size={10} />
                            Resend Invitation
                          </button>
                        )}

                        {user.status === "PendingApproval" && (
                          <>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleApprovePartner(user)}
                              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 size={11} />
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => {
                                setShowRejectModal(user);
                                setRejectReasonInput("");
                              }}
                              className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <XCircle size={11} />
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() =>
                            setMenuUser(menuUser === user.id ? null : user.id)
                          }
                          className="rounded p-1 text-slate-500 hover:bg-slate-100"
                          aria-label="User actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {menuUser === user.id && (
                        <div className="absolute right-8 top-9 z-20 w-48 rounded-lg border border-slate-200 bg-white p-1 text-left shadow-xl">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setMenuUser(null);
                            }}
                            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            View details
                          </button>

                          <button
                            onClick={() => openEditModal(user)}
                            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            Edit user
                          </button>

                          <button
                            onClick={() => handleResendInvitation(user)}
                            className="block w-full rounded px-3 py-2 text-left text-sm font-medium text-[#2785B2] hover:bg-sky-50"
                          >
                            Resend Invitation Email
                          </button>

                          {user.status === "PendingApproval" && (
                            <>
                              <button
                                onClick={() => handleApprovePartner(user)}
                                className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                              >
                                Approve Partner
                              </button>
                              <button
                                onClick={() => {
                                  setShowRejectModal(user);
                                  setRejectReasonInput("");
                                  setMenuUser(null);
                                }}
                                className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                              >
                                Reject Partner
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              updateUserStatus(
                                user.id,
                                user.status === "Disabled"
                                  ? "Active"
                                  : "Disabled"
                              )
                            }
                            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            {user.status === "Disabled"
                              ? "Activate user"
                              : "Disable user"}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No users found. Try changing your search or filters.
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-sm text-slate-400"
                    >
                      <Loader2
                        size={18}
                        className="mx-auto animate-spin text-[#2785B2]"
                      />
                      <span className="mt-2 block">Loading user records...</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Showing 1-{filteredUsers.length} of{" "}
              {stats?.totalUsers ?? filteredUsers.length} users
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400"
              >
                Previous
              </button>

              <button className="rounded-md bg-[#2785B2] px-3 py-2 text-sm font-semibold text-white">
                1
              </button>

              <button
                disabled
                className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-400"
              >
                Next
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </section>

        <footer className="py-4 text-xs text-slate-400">
          © 2026 Humanitarian Aid Platform · CareLink
        </footer>
      </main>

      {/* CREATE / INVITE USER MODAL */}
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
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#269C91]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2
                  id="invite-user-title"
                  className="mt-2 text-lg font-semibold text-[#123B5C]"
                >
                  Create / Invite User Account
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

            <form
              onSubmit={handleInvite}
              className="space-y-4 px-5 py-5 sm:px-6"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="invite-full-name"
                    className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
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
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-email"
                    className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
                  >
                    Email address (Username){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="invite-email"
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="officer@carelink.org"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-role"
                    className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
                  >
                    Assign role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
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
                    htmlFor="invite-phone"
                    className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
                  >
                    Phone number
                  </label>
                  <input
                    id="invite-phone"
                    type="tel"
                    value={invitePhone}
                    onChange={(event) => setInvitePhone(event.target.value)}
                    placeholder="+94 77 123 4567"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-organisation"
                    className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
                  >
                    Organisation / Unit
                  </label>
                  <input
                    id="invite-organisation"
                    value={inviteOrganisation}
                    onChange={(event) =>
                      setInviteOrganisation(event.target.value)
                    }
                    placeholder="e.g. National Disaster Management Centre"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-location"
                    className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
                  >
                    Operational District / Location
                  </label>
                  <input
                    id="invite-location"
                    value={inviteLocation}
                    onChange={(event) => setInviteLocation(event.target.value)}
                    placeholder="Greater Riverton"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="invite-rationale"
                  className="mb-1.5 block text-sm font-semibold text-[#123B5C]"
                >
                  Administrative notes / role specialization
                </label>
                <textarea
                  id="invite-rationale"
                  rows={2}
                  value={administrativeRationale}
                  onChange={(event) =>
                    setAdministrativeRationale(event.target.value)
                  }
                  placeholder="Optional administrative rationale or operational notes..."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#2785B2]"
                />
                <p className="text-xs leading-5 text-slate-700">
                  The user&apos;s email address will be set as their username. A
                  secure, one-time account setup invitation email will be sent
                  via Gmail SMTP so the user can configure their own password.
                </p>
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 pt-1 sm:flex-row">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowInvite(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#2785B2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D6E98] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Create User &amp; Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="w-full max-w-[520px] rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#2785B2]">
                  EDIT USER ACCOUNT
                </p>
                <h2 className="mt-1 text-lg sm:text-xl font-semibold text-[#123B5C]">
                  Update Profile, Role &amp; Status
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#123B5C]">
                  Full name *
                </label>
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#123B5C]">
                    Phone number
                  </label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#123B5C]">
                    Assigned Role *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#123B5C]">
                  Account Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                >
                  <option value="Active">Active</option>
                  <option value="PendingPasswordSetup">
                    PendingPasswordSetup
                  </option>
                  <option value="PendingApproval">PendingApproval</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#2785B2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D6E98] disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT PARTNER MODAL */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowRejectModal(null);
          }}
        >
          <div className="w-full max-w-[480px] rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-rose-600">
                  PARTNER ORGANISATION REVIEW
                </p>
                <h2 className="mt-1 text-lg sm:text-xl font-semibold text-[#123B5C]">
                  Reject Partner Registration
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(null)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleRejectPartnerSubmit}
              className="space-y-4 p-5"
            >
              <p className="text-sm text-slate-600">
                You are rejecting the Partner Organisation application for{" "}
                <strong>{showRejectModal.organisation}</strong> (
                {showRejectModal.email}). Their account will remain restricted
                and a notification email will be sent with the reason below.
              </p>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#123B5C]">
                  Rejection reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Provide the reason for rejecting this Partner Organisation registration..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm sm:text-[15px] outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
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

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#2785B2]">
                  USER PROFILE
                </p>
                <h2 className="mt-1 text-lg font-semibold">Account details</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedUser)}
                  className="inline-flex items-center gap-1 rounded border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-[#123B5C] hover:bg-slate-50"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close profile"
                >
                  <X size={18} />
                </button>
              </div>
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

              {(selectedUser.status === "PendingPasswordSetup" ||
                selectedUser.requiresPasswordSetup) && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#123B5C]">
                    Password Setup Pending
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    This user has been invited and must complete password setup
                    via the secure link sent to their email address.
                  </p>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleResendInvitation(selectedUser)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#2785B2] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1D6E98]"
                  >
                    <Send size={13} />
                    Resend Invitation Email
                  </button>
                </div>
              )}

              {selectedUser.status === "PendingApproval" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Partner Organisation Awaiting Approval
                  </p>
                  <p className="mt-1 text-sm text-amber-900">
                    Review the organisation credentials below and approve or
                    reject this registration.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleApprovePartner(selectedUser)}
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve Partner
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setShowRejectModal(selectedUser);
                        setRejectReasonInput("");
                      }}
                      className="flex-1 rounded-lg border border-rose-300 bg-white py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Reject Partner
                    </button>
                  </div>
                </div>
              )}

              {selectedUser.status === "Rejected" && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                  <p className="font-bold">Registration Rejected</p>
                  {selectedUser.rejectionReason && (
                    <p className="mt-1">
                      Reason: {selectedUser.rejectionReason}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleApprovePartner(selectedUser)}
                    className="mt-2 rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve &amp; Activate Now
                  </button>
                </div>
              )}

              <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-xs text-slate-400">
                    USERNAME / EMAIL ADDRESS
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                    <Mail size={13} />
                    {selectedUser.email}
                  </p>
                </div>

                {selectedUser.phoneNumber && (
                  <div>
                    <p className="text-xs text-slate-400">PHONE NUMBER</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                      <Phone size={13} />
                      {selectedUser.phoneNumber}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400">ORGANISATION</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedUser.organisation}
                    {selectedUser.organisationType
                      ? ` (${selectedUser.organisationType})`
                      : ""}
                  </p>
                  {selectedUser.registrationNumber && (
                    <p className="mt-0.5 text-[13px] text-slate-500">
                      Reg #: {selectedUser.registrationNumber}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-400">ASSIGNED ROLE</p>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={selectedUser.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        try {
                          await userService.updateUserRoles(selectedUser.id, [
                            newRole,
                          ]);
                          setSelectedUser({ ...selectedUser, role: newRole });
                          setSuccessMessage(
                            `Role updated to ${newRole} for ${selectedUser.name}.`
                          );
                          await loadUsersAndStats();
                        } catch (err: any) {
                          setApiError(
                            err.message || "Failed to update user role."
                          );
                        }
                      }}
                      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm sm:text-[15px] font-medium text-[#123B5C] outline-none focus:border-[#2785B2] focus:ring-1 focus:ring-sky-100"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedUser.skills && (
                  <div>
                    <p className="text-xs text-slate-400">
                      SKILLS &amp; AVAILABILITY
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {selectedUser.skills}
                      {selectedUser.availability
                        ? ` · ${selectedUser.availability}`
                        : ""}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400">VERIFICATION</p>
                  <div className="mt-1">
                    <VerificationBadge
                      verification={selectedUser.verification}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400">LAST ACTIVE</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedUser.lastActive}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                <div className="flex items-center gap-2 text-sky-700">
                  <ShieldCheck size={15} />
                  <p className="text-sm font-semibold">Account security</p>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Account status and permissions are enforced in real time by
                  the backend authorization policy.
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
                className={`flex-1 rounded-lg py-3 text-sm font-semibold ${
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
                className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
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
