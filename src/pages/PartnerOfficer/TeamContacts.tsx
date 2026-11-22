import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Archive,
  RotateCcw,
} from "lucide-react";
import {
  teamContactService,
  initialTeamMembers,
  type TeamMember,
  type TeamContactsMetrics,
  type CreateTeamMemberPayload,
} from "../../services/teamContactService";

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const TeamContacts = () => {
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [metrics, setMetrics] = useState<TeamContactsMetrics>({
    activeRecords: 48,
    activeRecordsSubtitle: "Organisation-scoped",
    needsReview: 3,
    needsReviewSubtitle: "Assigned to your team",
    verified: "96%",
    verifiedSubtitle: "Current assurance",
    dueSoon: 2,
    dueSoonSubtitle: "Within 30 days",
    totalCount: 48,
    needsActionCount: 7,
    activeCount: 48,
    completedCount: 0,
    archivedCount: 0,
  });

  const [isLive, setIsLive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [membersRes, metricsRes] = await Promise.all([
        teamContactService.getAll(),
        teamContactService.getMetrics(),
      ]);
      setMembers(membersRes.data);
      setMetrics(metricsRes.data);
      setIsLive(membersRes.isLive && metricsRes.isLive);
    } catch {
      setIsLive(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [membersRes, metricsRes] = await Promise.all([
          teamContactService.getAll(),
          teamContactService.getMetrics(),
        ]);
        if (isMounted) {
          setMembers(membersRes.data);
          setMetrics(metricsRes.data);
          setIsLive(membersRes.isLive && metricsRes.isLive);
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSync = async () => {
    await loadData();
    showToast("Team contacts synced with backend");
  };

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage(null);
    }, 3500);
  };

  // Search and filtering
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const searchableText = [
        member.id,
        member.name,
        member.role,
        member.sector,
        member.area,
        member.contact,
        member.email,
        member.description || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          (member.status === "Needs Review" || member.status === "Needs Action")) ||
        (activeTab === "Active" && member.status === "Active") ||
        (activeTab === "Completed" && member.status === "Completed") ||
        (activeTab === "Archived" && member.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (roleFilter === "All roles" || member.role === roleFilter) &&
        (sectorFilter === "All sectors" || member.sector === sectorFilter) &&
        (locationFilter === "All locations" || member.area.includes(locationFilter)) &&
        (statusFilter === "All statuses" || member.status === statusFilter)
      );
    });
  }, [
    members,
    search,
    activeTab,
    roleFilter,
    sectorFilter,
    locationFilter,
    statusFilter,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

  const displayedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "User ID",
      "Name",
      "Role",
      "Sector",
      "Operational Area",
      "Contact",
      "Email",
      "Last Active",
      "Status",
      "Description",
    ];

    const rows = filteredMembers.map((member) => [
      member.id,
      member.name,
      member.role,
      member.sector,
      member.area,
      member.contact,
      member.email,
      member.lastActive,
      member.status,
      member.description || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `carelink-team-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Invite new member
  const handleInvite = async (payload: CreateTeamMemberPayload) => {
    const result = await teamContactService.create(payload);
    setMembers((prev) => [result.data, ...prev.filter((m) => m.id !== result.data.id)]);
    setActiveTab("All");
    setSearch("");
    setRoleFilter("All roles");
    setSectorFilter("All sectors");
    setLocationFilter("All locations");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowInviteModal(false);
    showToast(`Team member ${result.data.name} invited (${result.data.id})`);
    const metricsRes = await teamContactService.getMetrics();
    setMetrics(metricsRes.data);
  };

  // Update status
  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await teamContactService.updateStatus(id, newStatus);
    setMembers((prev) => prev.map((m) => (m.id === id ? result.data : m)));
    if (selectedMember?.id === id) {
      setSelectedMember(result.data);
    }
    showToast(`Status updated to ${newStatus}`);
    const metricsRes = await teamContactService.getMetrics();
    setMetrics(metricsRes.data);
  };

  // Delete member
  const handleDeleteMember = async (id: string) => {
    if (window.confirm(`Are you sure you want to remove team member ${id}?`)) {
      await teamContactService.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setSelectedMember(null);
      showToast(`Team member ${id} removed`);
      const metricsRes = await teamContactService.getMetrics();
      setMetrics(metricsRes.data);
    }
  };

  // Reset to seeds
  const handleResetDefaults = async () => {
    if (window.confirm("Reset all team contacts to standard seed defaults?")) {
      await teamContactService.reset();
      await loadData();
      resetFilters();
      showToast("Team contacts reset to defaults");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setRoleFilter("All roles");
    setSectorFilter("All sectors");
    setLocationFilter("All locations");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Dynamic tab count helper
  const getTabCount = (tab: string): number => {
    switch (tab) {
      case "All":
        return metrics.totalCount || members.length;
      case "Needs action":
        return (
          metrics.needsActionCount ||
          members.filter((m) => m.status === "Needs Review" || m.status === "Needs Action").length
        );
      case "Active":
        return metrics.activeCount || members.filter((m) => m.status === "Active").length;
      case "Completed":
        return metrics.completedCount || members.filter((m) => m.status === "Completed").length;
      case "Archived":
        return metrics.archivedCount || members.filter((m) => m.status === "Archived").length;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Toast notification banner */}
      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#153e5b] px-4 py-3 text-xs text-white shadow-lg animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Team & Contacts
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#153e5b]">
              Team & Contacts
            </h1>

            {/* Live Backend Connection Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isLive
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isLive ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Manage organisation staff, response roles, deployment areas, and coordination contacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3.5 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
            title="Refresh team contacts from server"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            Sync
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Invite Team Member
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BriefcaseBusiness size={20} />}
          title="Active records"
          value={String(metrics.activeRecords)}
          subtitle={metrics.activeRecordsSubtitle || "Organisation-scoped"}
          color="blue"
        />

        <StatCard
          icon={<Clock size={20} />}
          title="Needs review"
          value={String(metrics.needsReview)}
          subtitle={metrics.needsReviewSubtitle || "Assigned to your team"}
          color="orange"
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Verified"
          value={metrics.verified || "96%"}
          subtitle={metrics.verifiedSubtitle || "Current assurance"}
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Due soon"
          value={String(metrics.dueSoon)}
          subtitle={metrics.dueSoonSubtitle || "Within 30 days"}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => {
          const count = getTabCount(tab);
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`relative whitespace-nowrap pb-4 text-xs ${
                activeTab === tab
                  ? "font-semibold text-[#267ba4]"
                  : "text-slate-500 hover:text-[#267ba4]"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
                  {count}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search team & contacts by ID, name, role, sector, location..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All roles</option>
          <option>Partner Officer</option>
          <option>Programme Manager</option>
          <option>Field Team Lead</option>
          <option>Protection Officer</option>
          <option>Logistics Officer</option>
          <option>Health Coordinator</option>
        </select>

        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All sectors</option>
          <option>Coordination</option>
          <option>Food Security</option>
          <option>WASH</option>
          <option>Protection</option>
          <option>Logistics</option>
          <option>Health</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All locations</option>
          <option>Greater Riverton</option>
          <option>Central</option>
          <option>North Ward</option>
          <option>Eastbank</option>
          <option>South Ward</option>
          <option>All districts</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Needs Review</option>
          <option>Completed</option>
          <option>Archived</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Filter size={15} />
          More filters
        </button>
      </div>

      {/* More Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#153e5b]">
              Additional options
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine team records, clear search queries, or reset sample data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              <RotateCcw size={13} />
              Reset Defaults
            </button>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#267ba4] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "User ID",
                  "Name",
                  "Role",
                  "Sector",
                  "Operational Area",
                  "Contact",
                  "Last Active",
                  "Status",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayedMembers.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {member.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                    {member.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {member.role}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {member.sector}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {member.area}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                    {member.contact}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {member.lastActive}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={member.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight
                      size={17}
                      className="text-[#64849a]"
                    />
                  </td>
                </tr>
              ))}

              {displayedMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No team members found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-[10px] text-slate-400">
            Showing{" "}
            {filteredMembers.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(
              currentPage * pageSize,
              filteredMembers.length
            )}{" "}
            of {filteredMembers.length} members
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  currentPage === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteMember}
        />
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInvite}
        />
      )}
    </div>
  );
};

// Statistics Card
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    green: "bg-[#e5f6f0] text-[#299b7d]",
    orange: "bg-[#fff4df] text-[#d69b30]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color] || colors.blue}`}>
        {icon}
      </div>

      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-[9px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-[#e5f6f0] text-[#299b7d]",
    "Needs Review": "bg-[#fff4df] text-[#bd8229]",
    "Needs Action": "bg-[#fff4df] text-[#bd8229]",
    Completed: "bg-[#e8f2f8] text-[#2783b1]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// Details Item
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b] break-words">{value || "—"}</p>
    </div>
  );
}

// Member Details Modal
function MemberDetailsModal({
  member,
  onClose,
  onStatusChange,
  onDelete,
}: {
  member: TeamMember;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (status: string) => {
    setUpdating(true);
    try {
      await onStatusChange(member.id, status);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setUpdating(true);
    try {
      await onDelete(member.id);
    } finally {
      setUpdating(false);
    }
  };

  const initials = member.name
    ? member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {member.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Team Member Details
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f5f8fa] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#267ba4] text-sm font-semibold text-white">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#153e5b]">
                {member.name}
              </h3>
              <StatusBadge status={member.status} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{member.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Detail label="Sector" value={member.sector} />
          <Detail label="Operational Area" value={member.area} />
          <Detail label="Phone" value={member.contact} />
          <Detail label="Email" value={member.email} />
          <Detail label="Last Active" value={member.lastActive} />
          <Detail label="Status" value={member.status} />
        </div>

        {member.description && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-medium text-slate-400">Role & Assignment Notes</p>
            <p className="mt-1 text-xs text-slate-600">{member.description}</p>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Quick Actions
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {member.status !== "Active" && (
              <button
                disabled={updating}
                onClick={() => handleUpdate("Active")}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                Set Active
              </button>
            )}

            {member.status !== "Needs Review" && (
              <button
                disabled={updating}
                onClick={() => handleUpdate("Needs Review")}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                <Clock size={13} />
                Request Review
              </button>
            )}

            {member.status !== "Archived" ? (
              <button
                disabled={updating}
                onClick={() => handleUpdate("Archived")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <Archive size={13} />
                Archive
              </button>
            ) : (
              <button
                disabled={updating}
                onClick={() => handleUpdate("Active")}
                className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <RotateCcw size={13} />
                Restore
              </button>
            )}

            <button
              disabled={updating}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 ml-auto"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#267ba4] py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Invite Member Modal
function InviteMemberModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: CreateTeamMemberPayload) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Field Team Lead");
  const [sector, setSector] = useState("WASH");
  const [area, setArea] = useState("North Ward");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        role,
        sector,
        area,
        contact: phone,
        email,
        description: description || undefined,
        lastActive: "Invited",
        status: "Active",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Invite Team Member
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Add a new member to your organisation team and sync across response operations.
            </p>
          </div>

          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Full Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kasun Jayawardena"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasun.j@example.org"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Phone Number *
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>Field Team Lead</option>
                <option>Partner Officer</option>
                <option>Programme Manager</option>
                <option>Protection Officer</option>
                <option>Logistics Officer</option>
                <option>Health Coordinator</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>WASH</option>
                <option>Coordination</option>
                <option>Food Security</option>
                <option>Protection</option>
                <option>Logistics</option>
                <option>Health</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Operational Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
            >
              <option>North Ward</option>
              <option>Greater Riverton</option>
              <option>Central · North</option>
              <option>Eastbank</option>
              <option>South Ward</option>
              <option>All districts</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Assignment Notes / Role Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief note on duties, focal point assignments, or field station..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
          >
            {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
            Send Invitation
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeamContacts;
