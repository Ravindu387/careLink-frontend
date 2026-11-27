
import { useMemo, useState, useEffect, useCallback } from "react";
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
  Eye,
  Ban,
  RefreshCw,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { organizationService } from "../../services/organizationService";
import type {
  Organization,
  OrganizationStats,
} from "../../types/organization";

type OrganisationStatus = "Active" | "Pending" | "Suspended";
type VerificationStatus = "Verified" | "Pending Review";

interface LegacyOrgItem {
  id: string;
  name: string;
  type: string;
  scope: string;
  members: number;
  verification: VerificationStatus;
  status: OrganisationStatus;
}

const initialOrganisations: (Organization & { members?: number; verification?: VerificationStatus })[] = [
  {
    id: "ORG-001",
    code: "NDA",
    name: "National Disaster Authority",
    type: "Government Agency",
    scope: "National",
    membersCount: 482,
    members: 482,
    verificationStatus: "Verified",
    verification: "Verified",
    status: "Active",
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "ORG-014",
    code: "CSN",
    name: "CareLink Shelter Network",
    type: "Local NGO",
    scope: "Greater Riverton",
    membersCount: 164,
    members: 164,
    verificationStatus: "Verified",
    verification: "Verified",
    status: "Active",
    isActive: true,
    createdAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "ORG-027",
    code: "GRN",
    name: "Global Relief Network",
    type: "International NGO",
    scope: "4 districts",
    membersCount: 286,
    members: 286,
    verificationStatus: "Pending Review",
    verification: "Pending Review",
    status: "Pending",
    isActive: false,
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "ORG-042",
    code: "ELU",
    name: "Emergency Logistics Unit",
    type: "Government Agency",
    scope: "Central Region",
    membersCount: 98,
    members: 98,
    verificationStatus: "Verified",
    verification: "Verified",
    status: "Active",
    isActive: true,
    createdAt: "2024-03-20T00:00:00Z",
  },
  {
    id: "ORG-058",
    code: "CRA",
    name: "Community Response Alliance",
    type: "Community Organisation",
    scope: "North Ward",
    membersCount: 72,
    members: 72,
    verificationStatus: "Verified",
    verification: "Verified",
    status: "Active",
    isActive: true,
    createdAt: "2024-04-05T00:00:00Z",
  },
];

function StatusBadge({ status }: { status: OrganisationStatus }) {
  const styles = {
    Active: "bg-[#E5F6F1] text-[#16866A]",
    Pending: "bg-orange-50 text-orange-700",
    Suspended: "bg-red-50 text-red-600",
  };

  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function VerificationBadge({
  verification,
}: {
  verification: string;
}) {
  if (verification === "Verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F6F1] px-2.5 py-1 text-xs font-semibold text-[#16866A]">
        <Check size={11} />
        Verified
      </span>
    );
  }
  if (verification === "Additional Info") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <Clock size={11} />
        Additional Info
      </span>
    );
  }
  if (verification === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
        <Ban size={11} />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
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
          <p className="text-xs text-slate-500">{title}</p>
          <h3 className="mt-0.5 text-2xl font-bold text-[#123B5C]">
            {value}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrganisationManagement() {
  const [organisations, setOrganisations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All organisation types");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetails, setShowDetails] = useState<Organization | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Administrative action modal fields
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState("Local NGO");
  const [newOrgScope, setNewOrgScope] = useState("Greater Riverton");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [newOrgEmail, setNewOrgEmail] = useState("");
  const [newOrgPhone, setNewOrgPhone] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [approvalType, setApprovalType] = useState(
    "Standard administrator approval"
  );
  const [administrativeRationale, setAdministrativeRationale] = useState("");
  const [actionTitle, setActionTitle] = useState("");
  const [actionScope, setActionScope] = useState("Local NGOs");
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reviewRationale, setReviewRationale] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchOrganisations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, statData, typeList] = await Promise.all([
        organizationService.getOrganizations(),
        organizationService.getStats(),
        organizationService.getTypes(),
      ]);
      setOrganisations(res?.items || []);
      setStats(statData);
      setAvailableTypes(typeList);
    } catch (err: any) {
      setError(err.message || "Failed to load organizations from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  const filteredOrganisations = useMemo(() => {
    return organisations.filter((org) => {
      const searchMatch =
        `${org.id} ${org.code || ""} ${org.name} ${org.type} ${org.scope}`
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
        org.verificationStatus === verificationFilter;

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

  const totalCount = stats?.totalOrganizations ?? organisations.length;
  const activeCount =
    stats?.activeOrganizations ??
    organisations.filter((org) => org.isActive || org.status === "Active").length;
  const verifiedCount =
    stats?.verifiedOrganizations ??
    organisations.filter((org) => org.verificationStatus === "Verified").length;
  const verifiedPercentage = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;
  const pendingCount =
    stats?.pendingOrganizations ??
    organisations.filter((org) => org.verificationStatus === "Pending Review").length;
  const suspendedCount =
    stats?.suspendedOrganizations ??
    organisations.filter((org) => org.status === "Suspended").length;

  const handleAdministrativeAction = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setModalError(null);

    const nameToRegister = (newOrgName.trim() || actionTitle.trim()).trim();

    if (!nameToRegister) {
      setModalError("Organisation name is required.");
      return;
    }

    const orgType =
      newOrgType ||
      (actionScope === "Local NGOs" ? "Local NGO" :
       actionScope === "International NGOs" ? "International NGO" :
       actionScope === "Government agencies" ? "Government Agency" :
       actionScope === "Community organisations" ? "Community Organisation" : "Local NGO");

    const orgScope = newOrgScope.trim() || "Greater Riverton";

    setIsSubmitting(true);
    try {
      const created = await organizationService.createOrganization({
        name: nameToRegister,
        type: orgType,
        scope: orgScope,
        registrationNumber: registrationNumber.trim() || undefined,
        contactEmail: newOrgEmail.trim() || undefined,
        contactPhone: newOrgPhone.trim() || undefined,
        description: administrativeRationale.trim() || undefined,
      });

      setOrganisations((prev) => [created, ...prev]);
      setShowRegisterModal(false);
      setNewOrgName("");
      setActionTitle("");
      setRegistrationNumber("");
      setNewOrgEmail("");
      setNewOrgPhone("");
      setAdministrativeRationale("");
      setModalError(null);

      setToastMessage(`Organisation "${created.name}" registered and activated successfully.`);

      organizationService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setModalError(err.message || "Failed to register organisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (
    id: string,
    status: "Active" | "Pending" | "Suspended"
  ) => {
    try {
      await organizationService.updateStatus(id, status);
      setOrganisations((previous) =>
        previous.map((org) =>
          org.id === id
            ? {
                ...org,
                status,
                verificationStatus:
                  status === "Active" ? "Verified" : org.verificationStatus,
                isActive: status === "Active",
              }
            : org
        )
      );

      setShowDetails((previous) =>
        previous?.id === id
          ? {
              ...previous,
              status,
              verificationStatus:
                status === "Active" ? "Verified" : previous.verificationStatus,
              isActive: status === "Active",
            }
          : previous
      );

      setMenuId(null);
      const targetOrg = organisations.find((o) => o.id === id);
      setToastMessage(`Status for "${targetOrg?.name || 'Organisation'}" updated to ${status}.`);
      organizationService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToastMessage(`Failed to update status: ${err.message || "Backend error."}`);
    }
  };

  const handleReviewDecision = async (
    id: string,
    decision: "Approve" | "Reject" | "RequestInfo"
  ) => {
    const note =
      reviewRationale.trim() ||
      (decision === "Approve"
        ? "Partner Organisation credentials verified and approved."
        : "");

    if (!note) {
      setToastMessage(
        "Please enter a review rationale or comment before rejecting or requesting additional information."
      );
      return;
    }

    setIsReviewing(true);
    try {
      const updated = await organizationService.reviewOrganization(id, {
        decision,
        rationale: note,
      });
      setOrganisations((prev) =>
        prev.map((org) => (org.id === id ? updated : org))
      );
      setShowDetails(updated);
      setReviewRationale("");
      setToastMessage(
        `Decision "${decision}" recorded for "${updated.name}".`
      );
      organizationService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setToastMessage(
        err.message || "Failed to record organisation review decision."
      );
    } finally {
      setIsReviewing(false);
    }
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
      org.membersCount ?? (org as any).members ?? 0,
      org.verificationStatus ?? (org as any).verification ?? "Verified",
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

      <div className="flex h-10 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-xs text-slate-500">
        <span>Administration</span>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#123B5C]">
          Organisation Management
        </span>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 rounded-lg border border-[#2785B2]/30 bg-[#123B5C] px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Info size={16} className="text-[#56B69E]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6 lg:px-8">

        {/* PAGE HEADING */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
              Organisation Management
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Manage verified agencies, memberships, operational scope, and collaboration access.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => {
                setNewOrgName("");
                setActionTitle("");
                setRegistrationNumber("");
                setNewOrgEmail("");
                setNewOrgPhone("");
                setNewOrgType("Local NGO");
                setNewOrgScope("Greater Riverton");
                setEnvironment("Production");
                setActionScope("Local NGOs");
                setApprovalType("Standard administrator approval");
                setAdministrativeRationale("");
                setModalError(null);
                setShowRegisterModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D6F98]"
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
            value={String(totalCount)}
            description={`${activeCount} active`}
            icon={Building2}
            iconStyle="bg-sky-50 text-sky-600"
          />

          <StatCard
            title="Verified partners"
            value={String(verifiedCount)}
            description={`${verifiedPercentage}% verified`}
            icon={Check}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Pending review"
            value={String(pendingCount)}
            description="Operational verification"
            icon={Clock}
            iconStyle="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="Suspended"
            value={String(suspendedCount)}
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
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
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
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
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
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All verification states</option>
              <option>Verified</option>
              <option>Pending Review</option>
            </select>

          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
          >
            More filters
          </button>

        </div>

        {/* MORE FILTERS */}

        {showMoreFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-[#D7E5EA] bg-white p-4">

            <label className="flex items-center gap-2 text-sm text-slate-600">
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

            <label className="flex items-center gap-2 text-sm text-slate-600">
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
              className="ml-auto text-sm font-semibold text-[#2785B2]"
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
                <tr className="border-b border-[#D7E5EA] bg-[#F6F9FA] text-[13px] font-medium text-slate-500">
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
                    className="border-b border-[#E5EDF1] text-sm text-slate-600 transition hover:bg-[#F8FBFC]"
                  >

                    <td className="px-4 py-4 font-bold text-[#123B5C]" title={org.id}>
                      {org.code || (org.id.length > 12 ? `ORG-${org.id.slice(0, 6).toUpperCase()}` : org.id)}
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
                      {org.membersCount ?? (org as any).members ?? 0}
                    </td>

                    <td className="px-4 py-4">
                      <VerificationBadge verification={org.verificationStatus ?? (org as any).verification ?? "Verified"} />
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
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            <Eye size={13} />
                            View details
                          </button>

                          {org.status === "Pending" && (
                            <button
                              onClick={() => updateStatus(org.id, "Active")}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
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
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
                      className="px-4 py-12 text-center text-sm text-slate-400"
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

            <p className="text-xs text-slate-500">
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
                className="rounded-lg border border-[#D7E5EA] px-4 py-2 text-sm text-[#2785B2] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
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
                className="rounded-lg border border-[#B9D1DD] px-4 py-2 text-sm font-medium text-[#2785B2] disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

        <footer className="py-5 text-xs text-slate-400">
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
                <p className="text-xs font-bold tracking-wider text-[#56B69E]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2 className="mt-2 text-[19px] font-semibold text-[#34495B]">
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

            {/* In-modal error banner */}
            {modalError && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Administrative action form */}
            <form onSubmit={handleAdministrativeAction} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Organisation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={newOrgName || actionTitle}
                    onChange={(e) => {
                      setNewOrgName(e.target.value);
                      setActionTitle(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    placeholder="e.g. World Health Organization"
                    className="h-12 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Organisation Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newOrgType}
                      onChange={(e) => {
                        setNewOrgType(e.target.value);
                        setActionScope(e.target.value);
                      }}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option value="Local NGO">Local NGO</option>
                      <option value="International NGO">International NGO</option>
                      <option value="Government Agency">Government Agency</option>
                      <option value="Community Organisation">Community Organisation</option>
                      <option value="Academic / Research">Academic / Research</option>
                      <option value="Private Sector Partner">Private Sector Partner</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Operational Scope / Region
                  </label>
                  <div className="relative">
                    <select
                      value={newOrgScope}
                      onChange={(e) => setNewOrgScope(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option value="Greater Riverton">Greater Riverton</option>
                      <option value="National">National</option>
                      <option value="Central Region">Central Region</option>
                      <option value="North Ward">North Ward</option>
                      <option value="Riverton East">Riverton East</option>
                      <option value="Sector 4">Sector 4</option>
                      <option value="4 districts">4 districts</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Registration / NGO Number
                  </label>
                  <input
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. NGO-2026-9041"
                    className="h-12 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newOrgEmail}
                    onChange={(e) => setNewOrgEmail(e.target.value)}
                    placeholder="e.g. operations@who.org"
                    className="h-12 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={newOrgPhone}
                    onChange={(e) => setNewOrgPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="h-12 w-full rounded-lg border border-[#D5E3EA] px-3 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Environment
                  </label>
                  <div className="relative">
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Production</option>
                      <option>Staging</option>
                      <option>Development</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                    Approval Type
                  </label>
                  <div className="relative">
                    <select
                      value={approvalType}
                      onChange={(e) => setApprovalType(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 pr-10 text-sm sm:text-[15px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Standard administrator approval</option>
                      <option>Senior administrator approval</option>
                      <option>Two-person approval</option>
                      <option>Emergency authorisation</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#34495B]">
                  Administrative Rationale / Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={administrativeRationale}
                  onChange={(e) => setAdministrativeRationale(e.target.value)}
                  placeholder="Explain the authorised reason or operational scope for onboarding this agency..."
                  className="w-full resize-y rounded-lg border border-[#D5E3EA] p-3 text-sm sm:text-[15px] outline-none placeholder:text-slate-400 focus:border-[#287FA8]"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[#EFF6F7] border border-[#C5DFEA] px-4 py-3">
                <ShieldCheck size={20} className="shrink-0 text-[#2785B2]" />
                <p className="text-sm leading-5 text-[#1D5F8A]">
                  This registration record is synchronized directly with the CareLink API and enforced under administrator governance audit standards.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowRegisterModal(false)}
                  className="h-11 rounded-lg border border-[#C7D8E2] bg-white px-5 text-sm font-semibold text-[#287FA8] hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 h-11 rounded-lg bg-[#287FA8] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1C668C] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Confirm & record"
                  )}
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

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[540px] flex-col bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <p className="text-xs font-bold tracking-widest text-[#2785B2]">
                  ORGANISATION PROFILE &amp; VERIFICATION
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
                  <h3 className="text-base font-bold text-[#123B5C]">
                    {showDetails.name}
                  </h3>

                  <p className="mt-1 text-[13px] text-slate-400">
                    {showDetails.code || showDetails.id} · Registered{" "}
                    {new Date(showDetails.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={showDetails.status} />
                    <VerificationBadge
                      verification={
                        showDetails.verificationStatus ??
                        (showDetails as any).verification ??
                        "Verified"
                      }
                    />
                  </div>
                </div>

              </div>

              {/* BASIC INFORMATION */}
              <div className="space-y-3 rounded-lg border border-slate-200 p-4 text-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2785B2]">
                  Basic &amp; Registration Details
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">ORGANISATION TYPE</p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {showDetails.type}
                      {showDetails.otherOrganizationType
                        ? ` (${showDetails.otherOrganizationType})`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">REGISTRATION NUMBER</p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {showDetails.registrationNumber || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">OFFICIAL EMAIL</p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {showDetails.contactEmail || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">CONTACT NUMBER</p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {showDetails.contactPhone || "Not provided"}
                      {showDetails.secondaryContactPhone
                        ? ` / ${showDetails.secondaryContactPhone}`
                        : ""}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-slate-400">
                      ADDRESS, DISTRICT &amp; PROVINCE
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {[
                        showDetails.address,
                        showDetails.district,
                        showDetails.province,
                        showDetails.registrationCountry,
                      ]
                        .filter(Boolean)
                        .join(", ") || showDetails.scope}
                    </p>
                  </div>
                </div>

                {showDetails.description && (
                  <div>
                    <p className="text-xs text-slate-400">
                      OPERATIONAL SCOPE / DESCRIPTION
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      {showDetails.description}
                    </p>
                  </div>
                )}
              </div>

              {/* HUMANITARIAN OPERATIONAL INFORMATION */}
              <div className="space-y-3 rounded-lg border border-slate-200 p-4 text-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2785B2]">
                  Humanitarian Capabilities
                </p>

                <div>
                  <p className="text-xs text-slate-400">
                    AREAS OF OPERATION
                  </p>
                  <p className="mt-0.5 font-semibold text-[#123B5C]">
                    {showDetails.areasOfOperation &&
                    showDetails.areasOfOperation.length > 0
                      ? showDetails.areasOfOperation.join(", ")
                      : showDetails.scope}
                  </p>
                </div>

                {showDetails.areasOfAssistance &&
                  showDetails.areasOfAssistance.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400">
                        HUMANITARIAN SERVICES
                      </p>
                      <p className="mt-0.5 font-semibold text-[#123B5C]">
                        {showDetails.areasOfAssistance.join(", ")}
                      </p>
                    </div>
                  )}

                {showDetails.operationalCapacity && (
                  <div>
                    <p className="text-xs text-slate-400">
                      OPERATIONAL CAPACITY
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      {showDetails.operationalCapacity}
                    </p>
                  </div>
                )}

                {showDetails.emergencyResponseAvailability && (
                  <div>
                    <p className="text-xs text-slate-400">
                      EMERGENCY AVAILABILITY
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {showDetails.emergencyResponseAvailability}
                    </p>
                  </div>
                )}
              </div>

              {/* AUTHORISED REPRESENTATIVE */}
              {(showDetails.representativeFullName ||
                showDetails.representativeEmail) && (
                <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2785B2]">
                    Authorised Representative
                  </p>
                  <p className="font-semibold text-[#123B5C]">
                    {showDetails.representativeFullName}{" "}
                    {showDetails.representativeDesignation
                      ? `(${showDetails.representativeDesignation})`
                      : ""}
                  </p>
                  <p className="text-slate-600">
                    {showDetails.representativeEmail} ·{" "}
                    {showDetails.representativePhone}
                  </p>
                </div>
              )}

              {/* UPLOADED VERIFICATION DOCUMENTS */}
              {showDetails.documents && showDetails.documents.length > 0 && (
                <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2785B2]">
                    Uploaded Verification Documents (
                    {showDetails.documents.length})
                  </p>
                  {showDetails.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#123B5C]">
                          {doc.label}
                        </p>
                        <p className="truncate text-[13px] text-slate-500">
                          {doc.originalFileName} ({doc.fileSizeDisplay})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          organizationService.downloadDocument(
                            showDetails.id,
                            doc.id,
                            doc.originalFileName
                          )
                        }
                        className="shrink-0 rounded border border-[#2785B2] bg-white px-2.5 py-1 text-xs font-semibold text-[#2785B2] hover:bg-sky-50"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* REVIEW DECISION CONTROLS */}
              <div className="space-y-3 rounded-lg border border-sky-200 bg-sky-50/60 p-4">
                <div className="flex items-center gap-2 text-[#123B5C]">
                  <ShieldCheck size={16} className="text-[#2785B2]" />
                  <p className="text-sm font-bold">
                    Administrator Verification Decision
                  </p>
                </div>

                <textarea
                  rows={2}
                  value={reviewRationale}
                  onChange={(e) => setReviewRationale(e.target.value)}
                  placeholder="Enter decision rationale, rejection reason, or additional information request..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm sm:text-[15px] text-[#123B5C] outline-none focus:border-[#2785B2]"
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() =>
                      handleReviewDecision(showDetails.id, "Approve")
                    }
                    className="rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve Organisation
                  </button>

                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() =>
                      handleReviewDecision(showDetails.id, "RequestInfo")
                    }
                    className="rounded-lg border border-[#2785B2] bg-white py-2 text-sm font-semibold text-[#2785B2] hover:bg-sky-50 disabled:opacity-50"
                  >
                    Request Info
                  </button>

                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() =>
                      handleReviewDecision(showDetails.id, "Reject")
                    }
                    className="rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Organisation
                  </button>
                </div>
              </div>

            </div>

            <div className="space-y-2 border-t border-slate-200 p-4">

              <button
                onClick={() =>
                  updateStatus(
                    showDetails.id,
                    showDetails.status === "Suspended"
                      ? "Active"
                      : "Suspended"
                  )
                }
                className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
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
