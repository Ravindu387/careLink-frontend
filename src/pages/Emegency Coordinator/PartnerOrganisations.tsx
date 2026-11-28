import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Package,
  Handshake,
  ShieldCheck,
  Search,
  Download,
  Plus,
  Filter,
  ChevronRight,
  X,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Globe,
  User,
  FileText,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  partnerOrganisationService,
  type PartnerOrganisation,
  type PartnerOrganisationsMetrics,
} from "../../services/partnerOrganisationService";

const verificationStyles: Record<string, string> = {
  Verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Rejected: "bg-red-100 text-red-700 border border-red-200",
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function PartnerOrganisations() {
  const [partners, setPartners] = useState<PartnerOrganisation[]>([]);
  const [metrics, setMetrics] = useState<PartnerOrganisationsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All operational areas");
  const [status, setStatus] = useState("All statuses");
  const [availability, setAvailability] = useState("Any availability");

  const [showFilters, setShowFilters] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerOrganisation | null>(null);

  // Invite modal form fields
  const [organisationName, setOrganisationName] = useState("");
  const [organisationType, setOrganisationType] = useState("Local NGO");
  const [organisationEmail, setOrganisationEmail] = useState("");
  const [organisationPhone, setOrganisationPhone] = useState("");
  const [organisationRegion, setOrganisationRegion] = useState("Greater Riverton");
  const [organisationRole, setOrganisationRole] = useState("Shelter Operations");
  const [contactPerson, setContactPerson] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [partnersData, metricsData] = await Promise.all([
        partnerOrganisationService.getAll(),
        partnerOrganisationService.getMetrics(),
      ]);
      setPartners(partnersData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Error refreshing partner organisations:", err);
      setError("Failed to refresh partner organisations from server.");
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    let cancelled = false;

    partnerOrganisationService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setPartners(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Initial load error:", err);
          setError("Failed to load partner organisations from server. Using offline data.");
          setLoading(false);
        }
      });

    partnerOrganisationService
      .getMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = [
        partner.id,
        partner.name,
        partner.type,
        partner.region,
        partner.role,
        partner.contactPerson || "",
        partner.notes || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesArea =
        area === "All operational areas" ||
        partner.region.toLowerCase().includes(area.toLowerCase());

      const matchesStatus =
        status === "All statuses" ||
        partner.status.toLowerCase() === status.toLowerCase();

      const matchesAvailability =
        availability === "Any availability" ||
        partner.verification.toLowerCase() === availability.toLowerCase();

      return (
        matchesSearch &&
        matchesArea &&
        matchesStatus &&
        matchesAvailability
      );
    });
  }, [partners, search, area, status, availability]);

  const addPartner = async () => {
    if (
      !organisationName.trim() ||
      !organisationEmail.trim() ||
      !organisationPhone.trim()
    ) {
      setMessage("Please complete all required fields (Name, Email, Phone).");
      setIsSuccess(false);
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const newPartner = await partnerOrganisationService.invitePartner({
        name: organisationName.trim(),
        type: organisationType,
        region: organisationRegion,
        role: organisationRole,
        email: organisationEmail.trim(),
        phone: organisationPhone.trim(),
        contactPerson: contactPerson.trim() || undefined,
        address: address.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setPartners((prev) => [newPartner, ...prev]);
      setIsSuccess(true);
      setMessage("Partner invitation sent and registered successfully!");

      // Refresh metrics in background
      partnerOrganisationService.getMetrics().then(setMetrics).catch(() => {});

      // Reset form
      setOrganisationName("");
      setOrganisationEmail("");
      setOrganisationPhone("");
      setContactPerson("");
      setAddress("");
      setWebsite("");
      setNotes("");

      setTimeout(() => {
        setShowInvite(false);
        setMessage("");
      }, 1500);
    } catch (err: unknown) {
      setIsSuccess(false);
      setMessage(err instanceof Error ? err.message : "Failed to invite partner organisation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVerification = async (
    id: string,
    verification: "Verified" | "Pending" | "Rejected"
  ) => {
    setActionLoading(true);
    try {
      const updated = await partnerOrganisationService.updateVerification(id, verification);
      setPartners((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setSelectedPartner(updated);
      partnerOrganisationService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      console.error("Failed to update verification status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (partner: PartnerOrganisation) => {
    setActionLoading(true);
    const newStatus = partner.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await partnerOrganisationService.updateStatus(partner.id, newStatus);
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? updated : p)));
      setSelectedPartner(updated);
      partnerOrganisationService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Organisation ID",
      "Organisation Name",
      "Type",
      "Operational Region",
      "Response Role",
      "Shared Resources",
      "Verification",
      "Status",
      "Email",
      "Phone",
      "Contact Person",
      "Shared Resources",
      "Collaboration Requests",
      "Address",
      "Website",
    ];

    const rows = filteredPartners.map((p) => [
      p.id,
      p.name,
      p.type,
      p.region,
      p.role,
      p.verification,
      p.status,
      p.email,
      p.phone,
      p.contactPerson || "",
      p.sharedResourcesCount,
      p.collaborationRequestsCount,
      p.address || "",
      p.website || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `partner-organisations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setArea("All operational areas");
    setStatus("All statuses");
    setAvailability("Any availability");
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153f5e]">
              Partner Organisations
            </h1>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
              {partners.length} Registered
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Coordinate verified organisations, responsibilities, resources, and shared emergency operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b8d0df] bg-white px-3.5 py-2.5 text-sm text-[#175477] hover:bg-sky-50 transition"
            title="Refresh partner data from server"
          >
            <RefreshCw
              size={14}
              className={`${refreshing ? "animate-spin text-sky-600" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-sm text-[#175477] hover:bg-sky-50 transition"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#216789] transition shadow-sm"
          >
            <Plus size={15} />
            Invite partner
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="font-medium text-amber-900 underline hover:no-underline"
          >
            Retry connection
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Building2 size={19} />}
          title="Active partners"
          value={metrics ? String(metrics.activePartnersCount) : "48"}
          description={`Across ${metrics ? metrics.sectorsCount : 6} sectors`}
          color="blue"
        />

        <SummaryCard
          icon={<Package size={19} />}
          title="Shared resources"
          value={metrics ? String(metrics.sharedResourcesCount) : "218"}
          description="Verified contributions"
          color="blue"
        />

        <SummaryCard
          icon={<Handshake size={19} />}
          title="Collaboration requests"
          value={metrics ? String(metrics.collaborationRequestsCount) : "14"}
          description={`${metrics ? metrics.pendingCollaborationRequestsCount : 5} awaiting response`}
          color="amber"
        />

        <SummaryCard
          icon={<ShieldCheck size={19} />}
          title="Verification coverage"
          value={metrics ? `${metrics.verificationCoveragePercent}%` : "96%"}
          description={`${metrics ? metrics.pendingVerificationReviewsCount : 2} reviews pending`}
          color="green"
        />
      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(130px,auto))_auto]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, role, region..."
            className="w-full min-w-0 bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>Greater Riverton</option>
          <option>Central</option>
          <option>North</option>
          <option>Eastbank</option>
          <option>West District</option>
          <option>4 districts</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          <option>Any availability</option>
          <option>Verified</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
            showFilters
              ? "border-sky-700 bg-sky-50 text-sky-800"
              : "border-sky-600 bg-white text-sky-700 hover:bg-sky-50"
          }`}
        >
          <Filter size={13} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] bg-white p-3">
          <p className="text-[13px] text-slate-500">
            Active filters: Area: <strong>{area}</strong> · Status: <strong>{status}</strong> · Verification: <strong>{availability}</strong>
          </p>

          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Organisations table */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-[#d5e2e9] bg-[#f7fafb]">
              <tr>
                {[
                  "Organisation ID",
                  "Organisation",
                  "Type",
                  "Operational Regions",
                  "Response Role",
                  "Shared Resources",
                  "Verification",
                  "Status",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 text-[13px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && partners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-sky-600" />
                      <span>Loading partner organisations...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-[#153f5e]">
                      {partner.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-700">
                      <div>
                        {partner.name}
                        {partner.contactPerson && (
                          <span className="block text-xs font-normal text-slate-400">
                            Attn: {partner.contactPerson}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      {partner.type}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      {partner.region}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      {partner.role}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-sky-700">
                        <Package size={11} />
                        {partner.sharedResourcesCount} items
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          verificationStyles[partner.verification] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {partner.verification}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          statusStyles[partner.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <ChevronRight size={16} className="text-slate-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredPartners.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No partner organisations found matching the specified criteria.
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-[13px] text-slate-500">
            Showing {filteredPartners.length} of {partners.length} organisations
          </p>
          {refreshing && (
            <span className="flex items-center gap-1 text-sm text-sky-600">
              <Loader2 size={12} className="animate-spin" /> Synchronizing...
            </span>
          )}
        </div>
      </section>

      {/* Partner details modal */}
      {selectedPartner && (
        <Modal onClose={() => setSelectedPartner(null)}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#153f5e]">
                Organisation Details
              </h2>
              <span className="text-[13px] text-slate-400">
                System Reference: {selectedPartner.id}
              </span>
            </div>

            <button onClick={() => setSelectedPartner(null)} className="p-1 text-slate-400 hover:text-slate-600">
              <X size={19} />
            </button>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <Building2 size={28} className="mb-2 text-sky-600" />
                <h3 className="font-semibold text-[#153f5e] text-base">
                  {selectedPartner.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedPartner.id} · {selectedPartner.type}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    verificationStyles[selectedPartner.verification] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedPartner.verification}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    statusStyles[selectedPartner.status] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedPartner.status}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs text-slate-600">
              <p className="flex items-center gap-2.5">
                <MapPin size={15} className="text-sky-600 shrink-0" />
                <span><strong>Region:</strong> {selectedPartner.region}</span>
              </p>

              <p className="flex items-center gap-2.5">
                <Handshake size={15} className="text-sky-600 shrink-0" />
                <span><strong>Response Role:</strong> {selectedPartner.role}</span>
              </p>

              {selectedPartner.contactPerson && (
                <p className="flex items-center gap-2.5">
                  <User size={15} className="text-sky-600 shrink-0" />
                  <span><strong>Contact Person:</strong> {selectedPartner.contactPerson}</span>
                </p>
              )}

              <p className="flex items-center gap-2.5">
                <Mail size={15} className="text-sky-600 shrink-0" />
                <span><strong>Email:</strong> {selectedPartner.email}</span>
              </p>

              <p className="flex items-center gap-2.5">
                <Phone size={15} className="text-sky-600 shrink-0" />
                <span><strong>Phone:</strong> {selectedPartner.phone}</span>
              </p>

              {selectedPartner.website && (
                <p className="flex items-center gap-2.5">
                  <Globe size={15} className="text-sky-600 shrink-0" />
                  <span>
                    <strong>Website:</strong>{" "}
                    <a
                      href={selectedPartner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 hover:underline"
                    >
                      {selectedPartner.website}
                    </a>
                  </span>
                </p>
              )}

              {selectedPartner.notes && (
                <div className="mt-2 rounded bg-white p-2.5 border border-slate-200/60">
                  <p className="text-[13px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <FileText size={12} /> Notes & Operational Capability:
                  </p>
                  <p className="text-sm text-slate-600">{selectedPartner.notes}</p>
                </div>
              )}
            </div>

            {/* Quick coordinator action controls */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[13px] font-medium text-slate-500 mb-2">
                Coordinator Controls
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPartner.verification !== "Verified" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateVerification(selectedPartner.id, "Verified")}
                    className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    <CheckCircle2 size={13} />
                    Approve Verification
                  </button>
                )}

                {selectedPartner.verification !== "Rejected" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateVerification(selectedPartner.id, "Rejected")}
                    className="flex items-center gap-1.5 rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    <ShieldAlert size={13} />
                    Reject
                  </button>
                )}

                <button
                  disabled={actionLoading}
                  onClick={() => handleToggleStatus(selectedPartner)}
                  className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                    selectedPartner.status === "Active"
                      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      : "bg-[#153f5e] text-white hover:bg-[#205879]"
                  }`}
                >
                  {selectedPartner.status === "Active" ? "Set Inactive" : "Activate Partner"}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedPartner(null)}
            className="mt-4 w-full rounded-lg bg-[#153f5e] py-2.5 text-sm font-semibold text-white hover:bg-[#205879] transition"
          >
            Close Details
          </button>
        </Modal>
      )}

      {/* Invite partner modal */}
      {showInvite && (
        <Modal onClose={() => setShowInvite(false)}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#153f5e]">
                Invite Partner Organisation
              </h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Register a new partner organisation into CareLink.
              </p>
            </div>

            <button onClick={() => setShowInvite(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X size={19} />
            </button>
          </div>

          <div className="space-y-3">
            <FormInput
              label="Organisation Name *"
              value={organisationName}
              onChange={setOrganisationName}
              placeholder="e.g. River Valley Relief Network"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormInput
                label="Email Address *"
                value={organisationEmail}
                onChange={setOrganisationEmail}
                placeholder="contact@org.org"
                type="email"
              />

              <FormInput
                label="Contact Number *"
                value={organisationPhone}
                onChange={setOrganisationPhone}
                placeholder="+94 11 234 5678"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormSelect
                label="Organisation Type"
                value={organisationType}
                onChange={setOrganisationType}
                options={[
                  "Local NGO",
                  "Government",
                  "International NGO",
                  "Private Organisation",
                  "Community Organisation",
                ]}
              />

              <FormSelect
                label="Operational Region"
                value={organisationRegion}
                onChange={setOrganisationRegion}
                options={[
                  "Greater Riverton",
                  "Central Ward",
                  "North Ward",
                  "Eastbank",
                  "West District",
                  "4 districts",
                ]}
              />
            </div>

            <FormSelect
              label="Primary Response Role"
              value={organisationRole}
              onChange={setOrganisationRole}
              options={[
                "Shelter Operations",
                "Food - Medical",
                "Lead Coordinator",
                "Transport - Warehousing",
                "Emergency Assistance",
              ]}
            />

            <FormInput
              label="Contact Person (Optional)"
              value={contactPerson}
              onChange={setContactPerson}
              placeholder="Coordinator name"
            />

            <FormInput
              label="Website (Optional)"
              value={website}
              onChange={setWebsite}
              placeholder="https://example.org"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Operational Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key equipment, fleet size, warehouse capacity, etc."
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500 resize-none"
              />
            </div>

            {message && (
              <div
                className={`rounded-lg p-2.5 text-xs flex items-center gap-2 ${
                  isSuccess
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {isSuccess ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{message}</span>
              </div>
            )}

            <button
              onClick={addPartner}
              disabled={submitting}
              className="w-full rounded-lg bg-[#153f5e] py-3 text-sm font-semibold text-white hover:bg-[#205879] disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting invitation...</span>
                </>
              ) : (
                <span>Send Invitation & Register</span>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Reusable summary card
function SummaryCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: "blue" | "amber" | "green";
}) {
  const colors = {
    blue: "bg-sky-100 text-sky-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${colors[color]}`}>
          {icon}
        </div>

        <div>
          <p className="text-[13px] text-slate-500">{title}</p>
          <h2 className="text-2xl font-semibold text-[#153f5e]">
            {value}
          </h2>
          <p className="text-[13px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable modal
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

// Reusable form input
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
      />
    </div>
  );
}

// Reusable form select
function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
