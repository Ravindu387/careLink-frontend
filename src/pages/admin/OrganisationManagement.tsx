
import { useMemo, useState } from "react";
import {
  Building2,
  Check,
  Clock,
  LockKeyhole,
  Download,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  X,
  MapPin,
  Users,
  ShieldCheck,
  FileText,
  Globe,
  Eye,
  Pencil,
  Ban,
} from "lucide-react";

type OrganisationStatus = "Active" | "Pending" | "Suspended";
type VerificationStatus = "Verified" | "Pending Review";

type Organisation = {
  id: string;
  name: string;
  type: string;
  scope: string;
  members: number;
  verification: VerificationStatus;
  status: OrganisationStatus;
};

const initialOrganisations: Organisation[] = [
  {
    id: "ORG-001",
    name: "National Disaster Authority",
    type: "Government Agency",
    scope: "National",
    members: 482,
    verification: "Verified",
    status: "Active",
  },
  {
    id: "ORG-014",
    name: "CareLink Shelter Network",
    type: "Local NGO",
    scope: "Greater Riverton",
    members: 164,
    verification: "Verified",
    status: "Active",
  },
  {
    id: "ORG-027",
    name: "Global Relief Network",
    type: "International NGO",
    scope: "4 districts",
    members: 286,
    verification: "Pending Review",
    status: "Pending",
  },
  {
    id: "ORG-042",
    name: "Emergency Logistics Unit",
    type: "Government Agency",
    scope: "Central Region",
    members: 98,
    verification: "Verified",
    status: "Active",
  },
  {
    id: "ORG-058",
    name: "Community Response Alliance",
    type: "Community Organisation",
    scope: "North Ward",
    members: 72,
    verification: "Verified",
    status: "Active",
  },
];

function StatusBadge({ status }: { status: OrganisationStatus }) {
  const styles = {
    Active: "bg-[#E5F6F1] text-[#16866A]",
    Pending: "bg-orange-50 text-orange-700",
    Suspended: "bg-red-50 text-red-600",
  };

  return (
    <span className={`rounded-md px-2.5 py-1 text-[9px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function VerificationBadge({
  verification,
}: {
  verification: VerificationStatus;
}) {
  return verification === "Verified" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F6F1] px-2.5 py-1 text-[9px] font-semibold text-[#16866A]">
      <Check size={11} />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1 text-[9px] font-semibold text-orange-700">
      <Clock size={11} />
      Pending Review
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconStyle,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Building2;
  iconStyle: string;
}) {
  return (
    <div className="rounded-xl border border-[#D7E5EA] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
          <Icon size={19} />
        </div>

        <div>
          <p className="text-[9px] text-slate-500">{title}</p>
          <h3 className="mt-0.5 text-2xl font-bold text-[#123B5C]">
            {value}
          </h3>
          <p className="mt-0.5 text-[9px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrganisationManagement() {
  const [organisations, setOrganisations] =
    useState<Organisation[]>(initialOrganisations);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All organisation types");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetails, setShowDetails] = useState<Organisation | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Administrative action modal fields
  const [actionTitle, setActionTitle] = useState("Register Organisation");
  const [environment, setEnvironment] = useState("Production");
  const [actionScope, setActionScope] = useState("Selected record");
  const [approvalType, setApprovalType] = useState(
    "Standard administrator approval"
  );
  const [administrativeRationale, setAdministrativeRationale] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Local NGO");
  const [newScope, setNewScope] = useState("");
  const [newMembers, setNewMembers] = useState("1");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredOrganisations = useMemo(() => {
    return organisations.filter((org) => {
      const searchMatch =
        `${org.id} ${org.name} ${org.type} ${org.scope}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All organisation types" ||
        org.type === typeFilter;

      const regionMatch =
        regionFilter === "All regions" ||
        org.scope === regionFilter;

      const verificationMatch =
        verificationFilter === "All verification states" ||
        org.verification === verificationFilter;

      return searchMatch && typeMatch && regionMatch && verificationMatch;
    });
  }, [
    organisations,
    search,
    typeFilter,
    regionFilter,
    verificationFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrganisations.length / pageSize)
  );

  const displayedOrganisations = filteredOrganisations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeCount = organisations.filter(
    (org) => org.status === "Active"
  ).length;

  const pendingCount = organisations.filter(
    (org) => org.verification === "Pending Review"
  ).length;

  const suspendedCount = organisations.filter(
    (org) => org.status === "Suspended"
  ).length;

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newOrganisation: Organisation = {
      id: `ORG-${String(
        Math.floor(100 + Math.random() * 900)
      )}`,
      name: newName.trim(),
      type: newType,
      scope: newScope.trim(),
      members: Math.max(1, Number(newMembers)),
      verification: "Pending Review",
      status: "Pending",
    };

    setOrganisations((previous) => [
      ...previous,
      newOrganisation,
    ]);

    setSearch("");
    setTypeFilter("All organisation types");
    setRegionFilter("All regions");
    setVerificationFilter("All verification states");
    setCurrentPage(Math.ceil((organisations.length + 1) / pageSize));

    setShowRegisterModal(false);
    setNewName("");
    setNewType("Local NGO");
    setNewScope("");
    setNewMembers("1");
  };

  const handleAdministrativeAction = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const actionData = {
      actionTitle,
      environment,
      scope: actionScope,
      approvalType,
      administrativeRationale,
      recordedAt: new Date().toISOString(),
    };

    // Demo only: connect this action to your ASP.NET Core API for persistence.
    console.log("Administrative action:", actionData);
    alert("Administrative action recorded successfully (demo).");

    setShowRegisterModal(false);
    setAdministrativeRationale("");
  };

  const updateStatus = (
    id: string,
    status: OrganisationStatus
  ) => {
    setOrganisations((previous) =>
      previous.map((org) =>
        org.id === id
          ? {
              ...org,
              status,
              verification:
                status === "Active" ? "Verified" : org.verification,
            }
          : org
      )
    );

    setShowDetails((previous) =>
      previous?.id === id
        ? {
            ...previous,
            status,
            verification:
              status === "Active" ? "Verified" : previous.verification,
          }
        : previous
    );

    setMenuId(null);
  };

  const exportCSV = () => {
    const headers = [
      "Organisation ID",
      "Name",
      "Type",
      "Operational Scope",
      "Members",
      "Verification",
      "Status",
    ];

    const rows = filteredOrganisations.map((org) => [
      org.id,
      org.name,
      org.type,
      org.scope,
      org.members,
      org.verification,
      org.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "carelink-organisations.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#EFF6F7]">

      {/* BREADCRUMB */}

      <div className="flex h-10 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[9px] text-slate-500">
        <span>Administration</span>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#123B5C]">
          Organisation Management
        </span>
      </div>

      <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6 lg:px-8">

        {/* PAGE HEADING */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-[28px]">
              Organisation Management
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Manage verified agencies, memberships, operational scope, and collaboration access.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => {
                setActionTitle("Register Organisation");
                setEnvironment("Production");
                setActionScope("Selected record");
                setApprovalType("Standard administrator approval");
                setAdministrativeRationale("");
                setShowRegisterModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#1D6F98]"
            >
              <Plus size={16} />
              Register organisation
            </button>

          </div>
        </div>

        {/* STATISTICS */}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Registered organisations"
            value="312"
            description="284 active"
            icon={Building2}
            iconStyle="bg-sky-50 text-sky-600"
          />

          <StatCard
            title="Verified partners"
            value="278"
            description="89.1% verified"
            icon={Check}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Pending review"
            value={String(pendingCount === 0 ? 14 : pendingCount)}
            description="3 high priority"
            icon={Clock}
            iconStyle="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="Suspended"
            value={String(suspendedCount === 0 ? 8 : suspendedCount)}
            description="Access restricted"
            icon={LockKeyhole}
            iconStyle="bg-red-50 text-red-600"
          />

        </div>

        {/* SEARCH AND FILTERS */}

        <div className="mb-4 flex flex-col gap-2 xl:flex-row">

          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D7E5EA] bg-white px-3">
            <Search size={17} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search organisation name or ID..."
              className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>All organisation types</option>
              <option>Government Agency</option>
              <option>Local NGO</option>
              <option>International NGO</option>
              <option>Community Organisation</option>
            </select>

            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>All regions</option>
              {[...new Set(organisations.map((org) => org.scope))].map(
                (scope) => (
                  <option key={scope}>{scope}</option>
                )
              )}
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>All verification states</option>
              <option>Verified</option>
              <option>Pending Review</option>
            </select>

          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 text-[10px] font-medium text-[#2785B2] hover:bg-sky-50"
          >
            More filters
          </button>

        </div>

        {/* MORE FILTERS */}

        {showMoreFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-[#D7E5EA] bg-white p-4">

            <label className="flex items-center gap-2 text-[10px] text-slate-600">
              <input
                type="checkbox"
                onChange={(e) => {
                  setVerificationFilter(
                    e.target.checked ? "Verified" : "All verification states"
                  );
                  setCurrentPage(1);
                }}
                className="accent-[#2785B2]"
              />
              Verified organisations only
            </label>

            <label className="flex items-center gap-2 text-[10px] text-slate-600">
              <input
                type="checkbox"
                onChange={(e) => {
                  setTypeFilter(
                    e.target.checked
                      ? "Government Agency"
                      : "All organisation types"
                  );
                  setCurrentPage(1);
                }}
                className="accent-[#2785B2]"
              />
              Government agencies only
            </label>

            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All organisation types");
                setRegionFilter("All regions");
                setVerificationFilter("All verification states");
                setCurrentPage(1);
              }}
              className="ml-auto text-[10px] font-semibold text-[#2785B2]"
            >
              Clear filters
            </button>

          </div>
        )}

        {/* ORGANISATION TABLE */}

        <section className="overflow-visible rounded-xl border border-[#D7E5EA] bg-white shadow-sm">

          <div className="overflow-x-auto rounded-xl">

            <table className="w-full min-w-[950px] text-left">

              <thead>
                <tr className="border-b border-[#D7E5EA] bg-[#F6F9FA] text-[9px] font-medium text-slate-500">
                  <th className="px-4 py-4">Organisation ID</th>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Operational Scope</th>
                  <th className="px-4 py-4">Members</th>
                  <th className="px-4 py-4">Verification</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>

              <tbody>

                {displayedOrganisations.map((org) => (

                  <tr
                    key={org.id}
                    className="border-b border-[#E5EDF1] text-[10px] text-slate-600 transition hover:bg-[#F8FBFC]"
                  >

                    <td className="px-4 py-4 font-bold text-[#123B5C]">
                      {org.id}
                    </td>

                    <td className="px-4 py-4 font-medium text-[#315C7B]">
                      {org.name}
                    </td>

                    <td className="px-4 py-4">
                      {org.type}
                    </td>

                    <td className="px-4 py-4">
                      {org.scope}
                    </td>

                    <td className="px-4 py-4">
                      {org.members}
                    </td>

                    <td className="px-4 py-4">
                      <VerificationBadge verification={org.verification} />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={org.status} />
                    </td>

                    <td className="relative px-4 py-4">

                      <button
                        onClick={() =>
                          setMenuId(menuId === org.id ? null : org.id)
                        }
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                        aria-label={`Actions for ${org.name}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {menuId === org.id && (

                        <div className="absolute right-8 top-8 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">

                          <button
                            onClick={() => {
                              setShowDetails(org);
                              setMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[10px] hover:bg-slate-50"
                          >
                            <Eye size={13} />
                            View details
                          </button>

                          {org.status === "Pending" && (
                            <button
                              onClick={() => updateStatus(org.id, "Active")}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[10px] text-emerald-700 hover:bg-emerald-50"
                            >
                              <Check size={13} />
                              Verify organisation
                            </button>
                          )}

                          <button
                            onClick={() =>
                              updateStatus(
                                org.id,
                                org.status === "Suspended"
                                  ? "Active"
                                  : "Suspended"
                              )
                            }
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[10px] text-red-600 hover:bg-red-50"
                          >
                            <Ban size={13} />
                            {org.status === "Suspended"
                              ? "Reactivate"
                              : "Suspend"}
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))}

                {displayedOrganisations.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-xs text-slate-400"
                    >
                      No organisations found. Try changing your search or filters.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row">

            <p className="text-[9px] text-slate-500">
              Showing{" "}
              {filteredOrganisations.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(currentPage * pageSize, filteredOrganisations.length)}
              {" "}of {filteredOrganisations.length} organisations
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#D7E5EA] px-4 py-2 text-[9px] text-[#2785B2] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg border px-3 py-2 text-[9px] ${
                      currentPage === page
                        ? "border-[#2785B2] bg-[#2785B2] font-bold text-white"
                        : "border-[#D7E5EA] text-[#123B5C] hover:bg-sky-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="rounded-lg border border-[#B9D1DD] px-4 py-2 text-[9px] font-medium text-[#2785B2] disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

        <footer className="py-5 text-[9px] text-slate-400">
          © 2026 Humanitarian Aid Platform · CareLink
        </footer>

      </main>

      {/* REGISTER ORGANISATION - ADMINISTRATIVE ACTION MODAL */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowRegisterModal(false);
          }}
        >
          <div className="max-h-[95vh] w-full max-w-[745px] overflow-y-auto rounded-xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#DCE7EC] px-6 py-5">
              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#56B69E]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2 className="mt-2 text-[19px] font-medium text-[#34495B]">
                  Register Organisation
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close modal"
                className="rounded-md p-1 text-[#34495B] hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Administrative action form */}
            <form onSubmit={handleAdministrativeAction} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#34495B]">
                    Action title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={actionTitle}
                    onChange={(e) => setActionTitle(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D5E3EA] px-3 text-[11px] outline-none focus:border-[#287FA8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#34495B]">
                    Environment
                  </label>
                  <div className="relative">
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-[11px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Production</option>
                      <option>Staging</option>
                      <option>Development</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#34495B]">
                    Scope
                  </label>
                  <div className="relative">
                    <select
                      value={actionScope}
                      onChange={(e) => setActionScope(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-[11px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Selected record</option>
                      <option>All organisations</option>
                      <option>Government agencies</option>
                      <option>Local NGOs</option>
                      <option>International NGOs</option>
                      <option>Community organisations</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#34495B]">
                    Approval type
                  </label>
                  <div className="relative">
                    <select
                      value={approvalType}
                      onChange={(e) => setApprovalType(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-[11px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Standard administrator approval</option>
                      <option>Senior administrator approval</option>
                      <option>Two-person approval</option>
                      <option>Emergency authorisation</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold text-[#34495B]">
                  Administrative rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={administrativeRationale}
                  onChange={(e) => setAdministrativeRationale(e.target.value)}
                  placeholder="Explain the authorised reason for this change..."
                  className="w-full resize-y rounded-lg border border-[#D5E3EA] p-3 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#287FA8]"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[#FFF6E3] px-4 py-4">
                <ShieldCheck size={21} className="shrink-0 text-[#98630C]" />
                <p className="text-[10px] leading-5 text-[#94620B]">
                  This operation is performed locally for demonstration. In production it requires backend permission enforcement.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="h-11 rounded-lg border border-[#C7D8E2] bg-white px-5 text-[11px] font-semibold text-[#287FA8] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-[#287FA8] px-5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#1C668C]"
                >
                  Confirm &amp; record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORGANISATION DETAILS DRAWER */}

      {showDetails && (

        <div className="fixed inset-0 z-[75]">

          <button
            onClick={() => setShowDetails(null)}
            aria-label="Close details"
            className="absolute inset-0 bg-slate-900/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[450px] flex-col bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <p className="text-[9px] font-bold tracking-widest text-[#2785B2]">
                  ORGANISATION PROFILE
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#123B5C]">
                  Organisation details
                </h2>
              </div>

              <button
                onClick={() => setShowDetails(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-[#2785B2]">
                  <Building2 size={26} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#123B5C]">
                    {showDetails.name}
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {showDetails.id}
                  </p>

                  <div className="mt-2">
                    <StatusBadge status={showDetails.status} />
                  </div>
                </div>

              </div>

              <div className="space-y-4 rounded-lg border border-slate-200 p-4">

                <div>
                  <p className="text-[9px] text-slate-400">
                    ORGANISATION TYPE
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#123B5C]">
                    {showDetails.type}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">
                    OPERATIONAL SCOPE
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#123B5C]">
                    <MapPin size={13} />
                    {showDetails.scope}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">
                    MEMBERS
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#123B5C]">
                    <Users size={13} />
                    {showDetails.members}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">
                    VERIFICATION
                  </p>
                  <div className="mt-2">
                    <VerificationBadge verification={showDetails.verification} />
                  </div>
                </div>

              </div>

              <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">

                <div className="flex items-center gap-2 text-[#2785B2]">
                  <ShieldCheck size={16} />
                  <p className="text-[10px] font-semibold">
                    Organisation verification
                  </p>
                </div>

                <p className="mt-2 text-[9px] leading-5 text-slate-600">
                  Organisation registration and verification should be reviewed by an authorised administrator before granting operational access.
                </p>

              </div>

            </div>

            <div className="space-y-2 border-t border-slate-200 p-4">

              {showDetails.status === "Pending" && (
                <button
                  onClick={() => updateStatus(showDetails.id, "Active")}
                  className="w-full rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Verify and activate organisation
                </button>
              )}

              <button
                onClick={() =>
                  updateStatus(
                    showDetails.id,
                    showDetails.status === "Suspended"
                      ? "Active"
                      : "Suspended"
                  )
                }
                className="w-full rounded-lg border border-red-200 py-3 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                {showDetails.status === "Suspended"
                  ? "Reactivate organisation"
                  : "Suspend organisation"}
              </button>

            </div>

          </aside>

        </div>

      )}

    </div>
  );
}
