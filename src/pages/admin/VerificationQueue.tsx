import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Check,
  Clock,
  AlertTriangle,
  Users,
  Search,
  ChevronRight,
  MoreHorizontal,
  X,
  Building2,
  FileText,
  Download,
  Loader2,
  MapPin,
  UserCheck,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { verificationService } from "../../services/verificationService";
import { organizationService } from "../../services/organizationService";
import type {
  VerificationDocumentItem,
  VerificationRequestItem,
  VerificationStats,
  VerificationStatus,
} from "../../types/verification";

const statusStyles: Record<VerificationStatus, string> = {
  "Pending Review": "bg-orange-50 text-orange-700",
  "Additional Info": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-600",
};

function StatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
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
  value: string;
  description: string;
  icon: typeof Clock;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#D8E6EC] bg-white p-4 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="mt-0.5 text-2xl font-bold text-[#123B5C]">{value}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default function VerificationQueue() {
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All request types");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [statusFilter, setStatusFilter] = useState("All states");
  const [dateFilter, setDateFilter] = useState("Date submitted");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequestItem | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paged, statData] = await Promise.all([
        verificationService.getRequests({ pageSize: 50 }),
        verificationService.getStats(),
      ]);
      setRequests(paged?.items || []);
      setStats(statData);
    } catch (err: any) {
      setError(
        err.message || "Failed to load verification applications from server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch = `${request.id} ${request.applicant} ${
        request.organizationName || ""
      } ${request.representativeFullName || ""} ${request.type} ${
        request.evidence
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All request types" || request.type === typeFilter;

      const priorityMatch =
        priorityFilter === "All priorities" ||
        request.priority === priorityFilter;

      const statusMatch =
        statusFilter === "All states" || request.status === statusFilter;

      return searchMatch && typeMatch && priorityMatch && statusMatch;
    });
  }, [requests, search, typeFilter, priorityFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / pageSize)
  );

  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pendingCount =
    stats?.totalPending ??
    requests.filter((r) => r.status === "Pending Review").length;

  const highPriorityCount =
    stats?.highPriority ??
    requests.filter(
      (r) => r.priority === "High" && r.status === "Pending Review"
    ).length;

  const approvedCount =
    stats?.approvedToday ??
    requests.filter((r) => r.status === "Approved").length;

  const additionalInfoCount =
    stats?.additionalInfo ??
    requests.filter((r) => r.status === "Additional Info").length;

  const openReview = (request: VerificationRequestItem) => {
    setSelectedRequest(request);
    setRationale(request.decisionRationale || request.decisionNote || "");
    setActionMessage("");
    setActiveMenu(null);
  };

  const handleDownloadDocument = async (doc: VerificationDocumentItem) => {
    const orgId = doc.organizationId || selectedRequest?.organizationId;
    const docId = doc.documentId || doc.id;
    if (!orgId || !docId) {
      setActionMessage("Document binary is only available for uploaded files.");
      return;
    }
    try {
      await organizationService.downloadDocument(
        orgId,
        docId,
        doc.originalFileName || doc.name
      );
    } catch (err: any) {
      setActionMessage(err.message || "Could not download document.");
    }
  };

  const updateRequest = async (
    status: VerificationStatus,
    message: string
  ) => {
    if (!selectedRequest) return;

    if (!rationale.trim()) {
      setActionMessage(
        "Please provide a decision rationale or comments before continuing."
      );
      return;
    }

    setIsSubmitting(true);
    setActionMessage("");

    const decisionMap: Record<
      VerificationStatus,
      "Approve" | "Reject" | "RequestInfo"
    > = {
      Approved: "Approve",
      Rejected: "Reject",
      "Additional Info": "RequestInfo",
      "Pending Review": "RequestInfo",
    };

    try {
      const updated = await verificationService.recordDecision(
        selectedRequest.id,
        {
          decision: decisionMap[status] || "Approve",
          status,
          decisionNote: rationale.trim(),
          rationale: rationale.trim(),
        }
      );

      setRequests((previous) =>
        previous.map((request) =>
          request.id === selectedRequest.id ? updated : request
        )
      );

      setSelectedRequest(updated);
      setActionMessage(message);
      verificationService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setActionMessage(
        err.message || "Failed to persist verification decision."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSV = () => {
    const header = [
      "Request ID",
      "Applicant",
      "Request Type",
      "Evidence",
      "Priority",
      "Submitted",
      "Status",
    ];

    const rows = filteredRequests.map((r) => [
      r.id,
      r.applicant,
      r.type,
      r.evidence,
      r.priority,
      r.submitted,
      r.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "verification-queue.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#EFF6F7]">
      {/* BREADCRUMB */}
      <div className="flex h-10 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-xs text-slate-500">
        <span>Administration</span>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#123B5C]">Verification Queue</span>
      </div>

      <main className="mx-auto max-w-[1800px] space-y-4 px-4 py-6 md:px-6 lg:px-8">
        {/* PAGE HEADING */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
              Verification Queue
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Review Partner Organisation registrations, humanitarian
              capabilities, authorised representatives, and uploaded
              verification certificates before enabling access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* SLA ALERT */}
        <div className="flex flex-col gap-3 rounded-lg border border-[#F4D18A] border-l-2 border-l-orange-400 bg-[#FFF9EC] px-4 py-3 sm:flex-row sm:items-center">
          <Check className="shrink-0 text-[#9A6400]" size={19} />

          <div className="flex-1">
            <p className="text-sm font-bold text-[#8C5800]">
              {pendingCount} Partner Organisation &amp; privileged requests
              awaiting review
            </p>
            <p className="mt-1 text-xs text-[#9A6400]">
              {stats?.oldestPendingText ||
                "All pending requests are within fresh review window."}
            </p>
          </div>

          <div className="rounded-md bg-[#FFF3D8] px-3 py-2 text-xs font-semibold text-[#A36B12] sm:min-w-[30%]">
            SLA: {stats?.slaTarget || "24 hours"}
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total pending"
            value={String(pendingCount)}
            description="Awaiting review"
            icon={Clock}
            color="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="High priority"
            value={String(highPriorityCount)}
            description="Partner Organisations"
            icon={AlertTriangle}
            color="bg-red-50 text-red-600"
          />

          <StatCard
            title="Approved"
            value={String(approvedCount)}
            description="Verified & active"
            icon={Check}
            color="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Additional info"
            value={String(additionalInfoCount)}
            description="Awaiting applicant"
            icon={Users}
            color="bg-sky-50 text-sky-600"
          />
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col gap-2 xl:flex-row">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D7E5EA] bg-white px-3">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search request ID, organisation, or representative..."
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All request types</option>
              <option>Partner Organisation</option>
              <option>Partner Officer</option>
              <option>Medical Partner</option>
              <option>Resource Manager</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All priorities</option>
              <option>High</option>
              <option>Standard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All states</option>
              <option>Pending Review</option>
              <option>Additional Info</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>Date submitted</option>
              <option>Today</option>
              <option>Older</option>
            </select>
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="h-11 rounded-lg border border-[#B9D1DD] bg-white px-4 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
          >
            More filters
          </button>
        </div>

        {showMoreFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D7E5EA] bg-white p-4">
            <p className="text-[13px] text-slate-500">
              Filter requests by their priority, type, status and submission
              date.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All request types");
                setPriorityFilter("All priorities");
                setStatusFilter("All states");
                setDateFilter("Date submitted");
                setCurrentPage(1);
              }}
              className="text-sm font-semibold text-[#2785B2]"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* REQUEST TABLE */}
        <section className="overflow-visible rounded-xl border border-[#D7E5EA] bg-white shadow-sm">
          <div className="overflow-x-auto rounded-t-xl">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-[#D7E5EA] bg-[#F6F9FA] text-[13px] font-semibold text-slate-500">
                  <th className="px-4 py-4">Request ID</th>
                  <th className="px-4 py-4">Organisation / Applicant</th>
                  <th className="px-4 py-4">Classification</th>
                  <th className="px-4 py-4">Authorised Representative</th>
                  <th className="px-4 py-4">Uploaded Documents</th>
                  <th className="px-4 py-4">Submitted</th>
                  <th className="px-4 py-4">Approval Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-400"
                    >
                      <Loader2
                        size={18}
                        className="mx-auto mb-2 animate-spin text-[#2785B2]"
                      />
                      Loading verification queue...
                    </td>
                  </tr>
                ) : (
                  visibleRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => openReview(request)}
                      className="cursor-pointer border-b border-[#E5EDF1] text-sm text-slate-600 transition hover:bg-[#F5FAFC]"
                    >
                      <td className="px-4 py-5 font-bold text-[#123B5C]">
                        {request.id}
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-[#123B5C]">
                          {request.organizationName || request.applicant}
                        </p>
                        {request.registrationNumber && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            Reg No: {request.registrationNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <p>{request.organizationType || request.type}</p>
                        {(request.district || request.province) && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {[request.district, request.province]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-medium text-[#123B5C]">
                          {request.representativeFullName || request.applicant}
                        </p>
                        {request.representativeEmail && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {request.representativeEmail}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-5">{request.evidence}</td>
                      <td className="px-4 py-5">{request.submitted}</td>
                      <td className="px-4 py-5">
                        <StatusBadge status={request.status} />
                      </td>

                      <td
                        className="relative px-4 py-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === request.id ? null : request.id
                            )
                          }
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                          aria-label="Request actions"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeMenu === request.id && (
                          <div className="absolute right-8 top-10 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                            <button
                              onClick={() => openReview(request)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                            >
                              <FileText size={13} />
                              Review organisation
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}

                {!loading && visibleRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-400"
                    >
                      No verification requests found.
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
              {filteredRequests.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredRequests.length)} of{" "}
              {filteredRequests.length}
            </p>

            <div className="flex items-center gap-2">
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
                        ? "border-[#2785B2] bg-[#2785B2] text-white"
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
                className="rounded-lg border border-[#B9D1DD] px-4 py-2 text-sm text-[#2785B2] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <footer className="py-3 text-xs text-slate-400">
          © 2026 Humanitarian Aid Platform · CareLink
        </footer>
      </main>

      {/* COMPREHENSIVE PARTNER ORGANISATION REVIEW MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="my-auto w-full max-w-[880px] overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#D7E5EA] px-6 py-5">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#42B99A]">
                  PARTNER ORGANISATION VERIFICATION REVIEW
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-[#123B5C]">
                    {selectedRequest.organizationName ||
                      selectedRequest.applicant}{" "}
                    ({selectedRequest.id})
                  </h2>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                aria-label="Close review"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
              {/* 1. ORGANISATION BASIC INFORMATION */}
              <div className="rounded-xl border border-[#D7E5EA] bg-[#F8FBFC] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#123B5C]">
                  <Building2 size={16} className="text-[#2785B2]" />
                  <span>Organisation Basic Information</span>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Organisation Name
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {selectedRequest.organizationName ||
                        selectedRequest.applicant}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Organisation Type
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {selectedRequest.organizationType || selectedRequest.type}
                      {selectedRequest.otherOrganizationType
                        ? ` (${selectedRequest.otherOrganizationType})`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Registration Number
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {selectedRequest.registrationNumber || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Official Email
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[#123B5C]">
                      <Mail size={12} className="text-slate-400" />
                      {selectedRequest.applicantEmail || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Official Contact Number
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[#123B5C]">
                      <Phone size={12} className="text-slate-400" />
                      {selectedRequest.applicantPhone || "Not provided"}
                      {selectedRequest.secondaryContactPhone
                        ? ` / ${selectedRequest.secondaryContactPhone}`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Registration Country &amp; Year
                    </p>
                    <p className="mt-0.5 text-[#123B5C]">
                      {selectedRequest.registrationCountry || "Sri Lanka"}
                      {selectedRequest.yearEstablished
                        ? ` · Est. ${selectedRequest.yearEstablished}`
                        : ""}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Address, District &amp; Province
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[#123B5C]">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      {[
                        selectedRequest.address,
                        selectedRequest.district,
                        selectedRequest.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Registration Date
                    </p>
                    <p className="mt-0.5 text-[#123B5C]">
                      {selectedRequest.submittedAt
                        ? new Date(selectedRequest.submittedAt).toLocaleString()
                        : selectedRequest.submitted}
                    </p>
                  </div>
                </div>

                {selectedRequest.description && (
                  <div className="mt-3 border-t border-slate-200/70 pt-2.5 text-xs">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Operational Scope / Description
                    </p>
                    <p className="mt-0.5 text-slate-700">
                      {selectedRequest.description}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. HUMANITARIAN OPERATIONAL INFORMATION */}
              <div className="rounded-xl border border-[#D7E5EA] bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#123B5C]">
                  <Globe size={16} className="text-[#2785B2]" />
                  <span>Humanitarian Operational Capabilities</span>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Main Areas of Operation
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(selectedRequest.areasOfOperation &&
                      selectedRequest.areasOfOperation.length > 0
                        ? selectedRequest.areasOfOperation
                        : [selectedRequest.district || "Regional"]
                      ).map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-[#EFF6F7] px-2.5 py-0.5 text-xs font-semibold text-[#123B5C]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Humanitarian Services / Areas of Assistance
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(selectedRequest.areasOfAssistance &&
                      selectedRequest.areasOfAssistance.length > 0
                        ? selectedRequest.areasOfAssistance
                        : ["General Humanitarian Relief"]
                      ).map((srv) => (
                        <span
                          key={srv}
                          className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Operational Capacity
                    </p>
                    <p className="mt-0.5 text-slate-700">
                      {selectedRequest.operationalCapacity ||
                        "Standard humanitarian partner capacity"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Emergency Response Availability
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {selectedRequest.emergencyResponseAvailability ||
                        "Available for emergency response"}
                    </p>
                    {selectedRequest.additionalResources && (
                      <p className="mt-1 text-[13px] text-slate-500">
                        Resources: {selectedRequest.additionalResources}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. AUTHORISED REPRESENTATIVE */}
              <div className="rounded-xl border border-[#D7E5EA] bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#123B5C]">
                  <UserCheck size={16} className="text-[#2785B2]" />
                  <span>Authorised Representative</span>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Representative Name &amp; Role
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {selectedRequest.representativeFullName ||
                        selectedRequest.applicant}
                    </p>
                    <p className="text-[13px] text-slate-500">
                      {selectedRequest.representativeDesignation ||
                        "Authorised Representative"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Representative Contact
                    </p>
                    <p className="mt-0.5 text-[#123B5C]">
                      {selectedRequest.representativeEmail ||
                        selectedRequest.applicantEmail}
                    </p>
                    <p className="text-[13px] text-slate-500">
                      {selectedRequest.representativePhone ||
                        selectedRequest.applicantPhone}
                      {selectedRequest.representativeAlternativePhone
                        ? ` / ${selectedRequest.representativeAlternativePhone}`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Account Login Username
                    </p>
                    <p className="mt-0.5 font-semibold text-[#123B5C]">
                      {selectedRequest.loginEmail ||
                        selectedRequest.representativeEmail ||
                        selectedRequest.applicantEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. UPLOADED VERIFICATION DOCUMENTS */}
              <div>
                <h3 className="mb-2.5 text-base font-bold text-[#123B5C]">
                  Uploaded Verification Documents (
                  {selectedRequest.documents.length})
                </h3>

                <div className="space-y-2">
                  {selectedRequest.documents.map((docItem, index) => {
                    const docObj: VerificationDocumentItem =
                      typeof docItem === "string"
                        ? {
                            id: `doc-${index}`,
                            name: docItem,
                            originalFileName: docItem,
                            type: "PDF",
                            size: "Uploaded",
                          }
                        : docItem;

                    return (
                      <div
                        key={docObj.id || index}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#D7E5EA] bg-white p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#2785B2]">
                            <FileText size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#123B5C]">
                              {docObj.name}
                            </p>
                            <p className="mt-0.5 text-[13px] text-slate-500">
                              File:{" "}
                              <span className="font-medium text-slate-700">
                                {docObj.originalFileName || docObj.name}
                              </span>{" "}
                              · {docObj.type} · {docObj.size}
                            </p>
                          </div>
                        </div>

                        {docObj.canDownload && (
                          <button
                            type="button"
                            onClick={() => handleDownloadDocument(docObj)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2785B2] bg-white px-3 py-1.5 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
                          >
                            <Download size={12} />
                            Download / View
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADDITIONAL INFORMATION REQUEST / RESPONSE HISTORY */}
              {(selectedRequest.additionalInfoRequest ||
                selectedRequest.additionalInfoResponse) && (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs">
                  {selectedRequest.additionalInfoRequest && (
                    <div>
                      <p className="text-xs font-bold uppercase text-amber-900">
                        Additional Information Requested by Admin:
                      </p>
                      <p className="mt-0.5 text-amber-800">
                        {selectedRequest.additionalInfoRequest}
                      </p>
                    </div>
                  )}
                  {selectedRequest.additionalInfoResponse && (
                    <div className="border-t border-amber-200 pt-2">
                      <p className="text-xs font-bold uppercase text-emerald-900">
                        Organisation Representative Response:
                      </p>
                      <p className="mt-0.5 text-emerald-800">
                        {selectedRequest.additionalInfoResponse}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* DECISION RATIONALE */}
              <div>
                <label
                  htmlFor="decision-rationale"
                  className="mb-2 block text-sm font-semibold text-[#123B5C]"
                >
                  Administrator Decision Rationale / Comments{" "}
                  <span className="text-red-600">*</span>
                </label>

                <textarea
                  id="decision-rationale"
                  rows={3}
                  value={rationale}
                  onChange={(e) => {
                    setRationale(e.target.value);
                    setActionMessage("");
                  }}
                  placeholder="Record the verification rationale, rejection reason, or additional information requested..."
                  className="w-full resize-y rounded-lg border border-[#D7E5EA] p-3 text-sm sm:text-[15px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {actionMessage && (
                <div
                  className={`rounded-lg p-3 text-sm font-medium ${
                    actionMessage.startsWith("Please") ||
                    actionMessage.startsWith("Failed")
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {actionMessage}
                </div>
              )}
            </div>

            {/* MODAL ACTIONS */}
            <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#D7E5EA] p-5 sm:flex-row">
              <button
                onClick={() =>
                  updateRequest(
                    "Rejected",
                    "Partner Organisation registration rejected and notification dispatched."
                  )
                }
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                Reject Organisation
              </button>

              <button
                onClick={() =>
                  updateRequest(
                    "Additional Info",
                    "Additional verification information requested from the representative."
                  )
                }
                disabled={isSubmitting}
                className="rounded-lg border border-[#B9D1DD] bg-white px-5 py-3 text-sm font-semibold text-[#2785B2] hover:bg-sky-50 disabled:opacity-40"
              >
                Request Additional Information
              </button>

              <button
                onClick={() =>
                  updateRequest(
                    "Approved",
                    "Partner Organisation approved, account activated, and permissions granted."
                  )
                }
                disabled={isSubmitting}
                className="rounded-lg bg-[#2785B2] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1D6F98] disabled:opacity-40"
              >
                Approve Organisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
