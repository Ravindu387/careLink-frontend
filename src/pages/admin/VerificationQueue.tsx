
import { useMemo, useState } from "react";
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
  ShieldCheck,
  FileText,
  Download,
} from "lucide-react";

type RequestStatus =
  | "Pending Review"
  | "Additional Info"
  | "Approved"
  | "Rejected";

type VerificationRequest = {
  id: string;
  applicant: string;
  type: string;
  evidence: string;
  priority: "High" | "Standard";
  submitted: string;
  status: RequestStatus;
  documents: string[];
};

const initialRequests: VerificationRequest[] = [
  {
    id: "VER-2048",
    applicant: "Global Relief Network",
    type: "Partner Organisation",
    evidence: "Registration · Tax · Safeguarding",
    priority: "High",
    submitted: "2 hours ago",
    status: "Pending Review",
    documents: ["Registration", "Tax", "Safeguarding"],
  },
  {
    id: "VER-2044",
    applicant: "Sara Khan",
    type: "Partner Officer",
    evidence: "Identity · Employment Letter",
    priority: "High",
    submitted: "5 hours ago",
    status: "Pending Review",
    documents: ["Identity", "Employment Letter"],
  },
  {
    id: "VER-2039",
    applicant: "Riverton Medical Collective",
    type: "Medical Partner",
    evidence: "Registration · Medical Licence",
    priority: "Standard",
    submitted: "Yesterday",
    status: "Additional Info",
    documents: ["Registration", "Medical Licence"],
  },
  {
    id: "VER-2031",
    applicant: "Abdul Rahman",
    type: "Resource Manager",
    evidence: "Identity · Appointment Letter",
    priority: "Standard",
    submitted: "Yesterday",
    status: "Pending Review",
    documents: ["Identity", "Appointment Letter"],
  },
  {
    id: "VER-2027",
    applicant: "Community Response Alliance",
    type: "Partner Organisation",
    evidence: "Registration · Tax",
    priority: "High",
    submitted: "2 days ago",
    status: "Pending Review",
    documents: ["Registration", "Tax"],
  },
  {
    id: "VER-2022",
    applicant: "Daniel Perera",
    type: "Resource Manager",
    evidence: "Identity · Employment Letter",
    priority: "Standard",
    submitted: "3 days ago",
    status: "Approved",
    documents: ["Identity", "Employment Letter"],
  },
  {
    id: "VER-2018",
    applicant: "Emergency Logistics Unit",
    type: "Partner Organisation",
    evidence: "Registration · Tax · Safeguarding",
    priority: "High",
    submitted: "4 days ago",
    status: "Pending Review",
    documents: ["Registration", "Tax", "Safeguarding"],
  },
  {
    id: "VER-2012",
    applicant: "Nadia Okafor",
    type: "Partner Officer",
    evidence: "Identity · Appointment Letter",
    priority: "Standard",
    submitted: "5 days ago",
    status: "Rejected",
    documents: ["Identity", "Appointment Letter"],
  },
];

const statusStyles: Record<RequestStatus, string> = {
  "Pending Review": "bg-orange-50 text-orange-700",
  "Additional Info": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-600",
};

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1.5 text-[9px] font-semibold ${statusStyles[status]}`}
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
        <p className="text-[9px] text-slate-500">{title}</p>
        <h3 className="mt-0.5 text-2xl font-bold text-[#123B5C]">
          {value}
        </h3>
        <p className="mt-0.5 text-[9px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function VerificationQueue() {
  const [requests, setRequests] =
    useState<VerificationRequest[]>(initialRequests);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All request types");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [statusFilter, setStatusFilter] = useState("All states");
  const [dateFilter, setDateFilter] = useState("Date submitted");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch =
        `${request.id} ${request.applicant} ${request.type} ${request.evidence}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All request types" ||
        request.type === typeFilter;

      const priorityMatch =
        priorityFilter === "All priorities" ||
        request.priority === priorityFilter;

      const statusMatch =
        statusFilter === "All states" ||
        request.status === statusFilter;

      const dateMatch =
        dateFilter === "Date submitted" ||
        (dateFilter === "Today" &&
          ["2 hours ago", "5 hours ago"].includes(request.submitted)) ||
        (dateFilter === "Older" &&
          !["2 hours ago", "5 hours ago"].includes(request.submitted));

      return (
        searchMatch &&
        typeMatch &&
        priorityMatch &&
        statusMatch &&
        dateMatch
      );
    });
  }, [requests, search, typeFilter, priorityFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / pageSize)
  );

  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pendingCount = requests.filter(
    (r) => r.status === "Pending Review"
  ).length;

  const highPriorityCount = requests.filter(
    (r) => r.priority === "High" && r.status === "Pending Review"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "Approved"
  ).length;

  const additionalInfoCount = requests.filter(
    (r) => r.status === "Additional Info"
  ).length;

  const openReview = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setRationale("");
    setActionMessage("");
    setActiveMenu(null);
  };

  const updateRequest = (
    status: RequestStatus,
    message: string
  ) => {
    if (!selectedRequest) return;

    if (!rationale.trim()) {
      setActionMessage("Please provide a decision rationale before continuing.");
      return;
    }

    setRequests((previous) =>
      previous.map((request) =>
        request.id === selectedRequest.id
          ? { ...request, status }
          : request
      )
    );

    setSelectedRequest({
      ...selectedRequest,
      status,
    });

    setActionMessage(message);
    setRationale("");
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
      <div className="flex h-10 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[9px] text-slate-500">
        <span>Administration</span>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#123B5C]">
          Verification Queue
        </span>
      </div>

      <main className="mx-auto max-w-[1800px] space-y-4 px-4 py-6 md:px-6 lg:px-8">

        {/* PAGE HEADING */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-[28px]">
              Verification Queue
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Review identity, organisation, and privileged role requests before enabling access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() =>
                alert(
                  "Verification policy: Review all submitted evidence and provide an auditable decision rationale."
                )
              }
              className="rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              Verification policy
            </button>
          </div>
        </div>

        {/* SLA ALERT */}
        <div className="flex flex-col gap-3 rounded-lg border border-[#F4D18A] border-l-2 border-l-orange-400 bg-[#FFF9EC] px-4 py-3 sm:flex-row sm:items-center">
          <Check className="shrink-0 text-[#9A6400]" size={19} />

          <div className="flex-1">
            <p className="text-[11px] font-bold text-[#8C5800]">
              {pendingCount || 14} privileged requests awaiting review
            </p>
            <p className="mt-1 text-[9px] text-[#9A6400]">
              Oldest unresolved request was submitted 2 days ago.
            </p>
          </div>

          <div className="rounded-md bg-[#FFF3D8] px-3 py-2 text-[9px] font-semibold text-[#A36B12] sm:min-w-[45%]">
            SLA: 24 hours
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total pending"
            value="64"
            description="All request types"
            icon={Clock}
            color="bg-orange-50 text-orange-600"
          />

          <StatCard
            title="High priority"
            value={String(highPriorityCount || 14)}
            description="Privileged access"
            icon={AlertTriangle}
            color="bg-red-50 text-red-600"
          />

          <StatCard
            title="Approved today"
            value={String(approvedCount || 28)}
            description="Median 4h 12m"
            icon={Check}
            color="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Additional info"
            value={String(additionalInfoCount || 9)}
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
              placeholder="Search request, applicant, or organisation..."
              className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
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
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
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
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
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
              className="h-11 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>Date submitted</option>
              <option>Today</option>
              <option>Older</option>
            </select>
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="h-11 rounded-lg border border-[#B9D1DD] bg-white px-4 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
          >
            More filters
          </button>
        </div>

        {showMoreFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D7E5EA] bg-white p-4">
            <p className="text-[10px] text-slate-500">
              Filter requests by their priority, type, status and submission date.
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
              className="text-[10px] font-semibold text-[#2785B2]"
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
                <tr className="border-b border-[#D7E5EA] bg-[#F6F9FA] text-[9px] font-semibold text-slate-500">
                  <th className="px-4 py-4">Request ID</th>
                  <th className="px-4 py-4">Applicant</th>
                  <th className="px-4 py-4">Request Type</th>
                  <th className="px-4 py-4">Evidence</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Submitted</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {visibleRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => openReview(request)}
                    className="cursor-pointer border-b border-[#E5EDF1] text-[10px] text-slate-600 transition hover:bg-[#F5FAFC]"
                  >
                    <td className="px-4 py-5 font-bold text-[#123B5C]">
                      {request.id}
                    </td>
                    <td className="px-4 py-5 font-medium text-[#315C7B]">
                      {request.applicant}
                    </td>
                    <td className="px-4 py-5">{request.type}</td>
                    <td className="px-4 py-5">{request.evidence}</td>
                    <td className="px-4 py-5">
                      <span
                        className={
                          request.priority === "High"
                            ? "font-semibold text-orange-600"
                            : "text-slate-500"
                        }
                      >
                        {request.priority}
                      </span>
                    </td>
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
                        <div className="absolute right-8 top-10 z-30 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                          <button
                            onClick={() => openReview(request)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[10px] hover:bg-slate-50"
                          >
                            <FileText size={13} />
                            Review request
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {visibleRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-xs text-slate-400"
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
            <p className="text-[9px] text-slate-500">
              Showing{" "}
              {filteredRequests.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(currentPage * pageSize, filteredRequests.length)}
              {" "}of {filteredRequests.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#D7E5EA] px-4 py-2 text-[10px] text-[#2785B2] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg border px-3 py-2 text-[10px] ${
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
                className="rounded-lg border border-[#B9D1DD] px-4 py-2 text-[10px] text-[#2785B2] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <footer className="py-3 text-[9px] text-slate-400">
          © 2026 Humanitarian Aid Platform · CareLink
        </footer>
      </main>

      {/* REVIEW MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="my-auto w-full max-w-[750px] overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#D7E5EA] px-6 py-5">
              <div>
                <p className="text-[9px] font-bold tracking-widest text-[#42B99A]">
                  SECURE ADMINISTRATIVE ACTION
                </p>
                <h2 className="mt-2 text-lg font-medium text-[#123B5C]">
                  Review {selectedRequest.id}
                </h2>
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

              {/* APPLICANT DETAILS */}
              <div className="flex items-center gap-3 rounded-xl bg-[#F4F8F9] p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E6F1F6] text-[#2785B2]">
                  <Building2 size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-[#123B5C]">
                    {selectedRequest.applicant}
                  </h3>
                  <p className="mt-1 text-[9px] text-slate-500">
                    {selectedRequest.type} · submitted{" "}
                    {selectedRequest.submitted}
                  </p>
                </div>

                <span
                  className={`rounded-lg px-3 py-2 text-[9px] font-bold ${
                    selectedRequest.priority === "High"
                      ? "bg-red-50 text-red-600"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {selectedRequest.priority} priority
                </span>
              </div>

              {/* SUBMITTED EVIDENCE */}
              <div>
                <h3 className="mb-3 text-xs font-semibold text-[#123B5C]">
                  Submitted evidence
                </h3>

                <div className="space-y-2">
                  {selectedRequest.documents.map((document) => (
                    <div
                      key={document}
                      className="flex items-center gap-3 rounded-lg border border-[#D7E5EA] p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#2785B2]">
                        <ShieldCheck size={19} />
                      </div>

                      <div className="flex-1">
                        <p className="text-[10px] font-semibold text-[#123B5C]">
                          {document}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-400">
                          Uploaded · document appears complete
                        </p>
                      </div>

                      <span className="rounded-lg bg-[#E6F7F1] px-3 py-2 text-[9px] font-semibold text-[#16866A]">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DECISION RATIONALE */}
              <div>
                <label
                  htmlFor="decision-rationale"
                  className="mb-2 block text-xs font-semibold text-[#123B5C]"
                >
                  Decision rationale <span className="text-red-600">*</span>
                </label>

                <textarea
                  id="decision-rationale"
                  rows={4}
                  value={rationale}
                  onChange={(e) => {
                    setRationale(e.target.value);
                    setActionMessage("");
                  }}
                  placeholder="Record the basis for this verification decision..."
                  className="w-full resize-y rounded-lg border border-[#D7E5EA] p-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {actionMessage && (
                <div
                  className={`rounded-lg p-3 text-[10px] ${
                    actionMessage.startsWith("Please")
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
                  updateRequest("Rejected", "Request rejected in this demo.")
                }
                disabled={
                  selectedRequest.status === "Approved" ||
                  selectedRequest.status === "Rejected"
                }
                className="rounded-lg bg-red-600 px-5 py-3 text-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                Reject
              </button>

              <button
                onClick={() =>
                  updateRequest(
                    "Additional Info",
                    "Additional information requested in this demo."
                  )
                }
                disabled={
                  selectedRequest.status === "Approved" ||
                  selectedRequest.status === "Rejected"
                }
                className="rounded-lg border border-[#B9D1DD] bg-white px-5 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50 disabled:opacity-40"
              >
                Request information
              </button>

              <button
                onClick={() =>
                  updateRequest("Approved", "Request approved and verified in this demo.")
                }
                disabled={
                  selectedRequest.status === "Approved" ||
                  selectedRequest.status === "Rejected"
                }
                className="rounded-lg bg-[#2785B2] px-5 py-3 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D6F98] disabled:opacity-40"
              >
                Approve &amp; verify
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
