
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
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
} from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  sector: string;
  area: string;
  contact: string;
  email: string;
  lastActive: string;
  status: string;
};

const initialMembers: TeamMember[] = [
  {
    id: "USR-0142",
    name: "Sara Khan",
    role: "Partner Officer",
    sector: "Coordination",
    area: "Greater Riverton",
    contact: "+94 77 412 8014",
    email: "sara.khan@example.org",
    lastActive: "Online",
    status: "Active",
  },
  {
    id: "USR-0188",
    name: "Michael Torres",
    role: "Programme Manager",
    sector: "Food Security",
    area: "Central · North",
    contact: "+94 77 412 8042",
    email: "michael.torres@example.org",
    lastActive: "18 min ago",
    status: "Active",
  },
  {
    id: "USR-0241",
    name: "Nafisa Silva",
    role: "Field Team Lead",
    sector: "WASH",
    area: "North Ward",
    contact: "+94 77 412 8098",
    email: "nafisa.silva@example.org",
    lastActive: "6 min ago",
    status: "Active",
  },
  {
    id: "USR-0284",
    name: "Ayo Mensah",
    role: "Protection Officer",
    sector: "Protection",
    area: "All districts",
    contact: "+94 77 412 8063",
    email: "ayo.mensah@example.org",
    lastActive: "42 min ago",
    status: "Active",
  },
  {
    id: "USR-0301",
    name: "Daniel Perera",
    role: "Logistics Officer",
    sector: "Logistics",
    area: "Eastbank",
    contact: "+94 77 412 8011",
    email: "daniel.perera@example.org",
    lastActive: "Yesterday",
    status: "Needs Review",
  },
  {
    id: "USR-0315",
    name: "Amara Fernando",
    role: "Health Coordinator",
    sector: "Health",
    area: "South Ward",
    contact: "+94 77 412 8055",
    email: "amara.fernando@example.org",
    lastActive: "2 hours ago",
    status: "Active",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const TeamContacts = () => {
  const [members, setMembers] = useState(initialMembers);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

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
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          member.status === "Needs Review") ||
        (activeTab === "Active" && member.status === "Active") ||
        (activeTab === "Completed" && member.status === "Completed") ||
        (activeTab === "Archived" && member.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (roleFilter === "All roles" || member.role === roleFilter) &&
        (sectorFilter === "All sectors" ||
          member.sector === sectorFilter) &&
        (locationFilter === "All locations" ||
          member.area.includes(locationFilter)) &&
        (statusFilter === "All statuses" ||
          member.status === statusFilter)
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
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / pageSize)
  );

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
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "team-contacts.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Invite new member
  const handleInvite = (member: TeamMember) => {
    setMembers((prev) => [member, ...prev]);
    setActiveTab("All");
    setSearch("");
    setRoleFilter("All roles");
    setSectorFilter("All sectors");
    setLocationFilter("All locations");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowInviteModal(false);
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

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

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

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Team & Contacts
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage organisation staff, response roles, deployment
            areas, and coordination contacts.
          </p>
        </div>

        <div className="flex gap-2">
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
          value="48"
          subtitle="Organisation-scoped"
          color="blue"
        />

        <StatCard
          icon={<Clock size={20} />}
          title="Needs review"
          value="3"
          subtitle="Assigned to your team"
          color="orange"
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Verified"
          value="96%"
          subtitle="Current assurance"
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Due soon"
          value="2"
          subtitle="Within 30 days"
          color="orange"
        />

      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">

        {tabs.map((tab) => (
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

            {tab === "All" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                48
              </span>
            )}

            {tab === "Needs action" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                7
              </span>
            )}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}

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
            placeholder="Search team & contacts..."
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
              Additional filters
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine team records using the filters above.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4]"
          >
            Clear all filters
          </button>
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

                  <td className="whitespace-nowrap px-3 py-4">
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

                  <td className="whitespace-nowrap px-3 py-4">
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
                    No team members found.
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
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((number) => (
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
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
    Completed: "bg-[#e5f6f0] text-[#299b7d]",
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
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Member Details Modal
function MemberDetailsModal({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f5f8fa] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#267ba4] text-sm font-semibold text-white">
            {member.name.split(" ").map((n) => n[0]).join("")}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#153e5b]">
              {member.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{member.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Detail label="Sector" value={member.sector} />
          <Detail label="Operational Area" value={member.area} />
          <Detail label="Phone" value={member.contact} />
          <Detail label="Email" value={member.email} />
          <Detail label="Last Active" value={member.lastActive} />
          <Detail label="Status" value={member.status} />
        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
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
  onSubmit: (member: TeamMember) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Field Team Lead");
  const [sector, setSector] = useState("WASH");
  const [area, setArea] = useState("North Ward");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const member: TeamMember = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      role,
      sector,
      area,
      contact: phone,
      email,
      lastActive: "Invited",
      status: "Active",
    };

    onSubmit(member);
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
              Add a new member to your organisation team.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Full Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Phone Number
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>North Ward</option>
              <option>Greater Riverton</option>
              <option>Central Ward</option>
              <option>Eastbank</option>
              <option>South Ward</option>
              <option>All districts</option>
            </select>
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            Send Invitation
          </button>
        </div>

      </form>
    </div>
  );
}

export default TeamContacts;
