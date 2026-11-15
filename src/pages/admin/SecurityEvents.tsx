
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Lock,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  X,
} from "lucide-react";

type SecurityEvent = {
  id: string;
  type: string;
  user: string;
  source: string;
  severity: "High" | "Medium" | "Low";
  timestamp: string;
  status: "Investigating" | "Review Required" | "Resolved";
};

const initialEvents: SecurityEvent[] = [
  {
    id: "SEC-8842",
    type: "Repeated failed sign-in",
    user: "USR-10312",
    source: "185.42.18.9",
    severity: "High",
    timestamp: "22 Jun · 13:42",
    status: "Investigating",
  },
  {
    id: "SEC-8839",
    type: "Privileged role assignment",
    user: "USR-10458",
    source: "Admin Console",
    severity: "Medium",
    timestamp: "22 Jun · 12:18",
    status: "Review Required",
  },
  {
    id: "SEC-8831",
    type: "New device sign-in",
    user: "USR-10482",
    source: "41.74.22.18",
    severity: "Low",
    timestamp: "22 Jun · 11:46",
    status: "Resolved",
  },
  {
    id: "SEC-8824",
    type: "Session token revoked",
    user: "USR-10291",
    source: "System Policy",
    severity: "Low",
    timestamp: "22 Jun · 10:30",
    status: "Resolved",
  },
  {
    id: "SEC-8819",
    type: "Multiple login attempts",
    user: "USR-10521",
    source: "192.168.1.24",
    severity: "High",
    timestamp: "22 Jun · 09:15",
    status: "Review Required",
  },
  {
    id: "SEC-8814",
    type: "Unusual account activity",
    user: "USR-10410",
    source: "Web Portal",
    severity: "Medium",
    timestamp: "21 Jun · 17:40",
    status: "Resolved",
  },
];

export default function SecurityEvents() {
  const [events, setEvents] = useState(initialEvents);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [typeFilter, setTypeFilter] = useState("All event types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Last 24 hours");

  const [currentPage, setCurrentPage] = useState(1);

  // Security Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyTitle, setPolicyTitle] = useState("Security Policy");
  const [environment, setEnvironment] = useState("Production");
  const [scope, setScope] = useState("Selected record");
  const [approvalType, setApprovalType] = useState(
    "Standard administrator approval"
  );
  const [policyReason, setPolicyReason] = useState("");

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchMatch = [
        event.id,
        event.type,
        event.user,
        event.source,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const severityMatch =
        severityFilter === "All severities" ||
        event.severity === severityFilter;

      const typeMatch =
        typeFilter === "All event types" ||
        event.type === typeFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        event.status === statusFilter;

      return (
        searchMatch &&
        severityMatch &&
        typeMatch &&
        statusMatch
      );
    });
  }, [events, search, severityFilter, typeFilter, statusFilter]);

  const pageSize = 4;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / pageSize)
  );

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const stats = [
    {
      label: "Open events",
      value: events.filter((e) => e.status !== "Resolved").length,
      detail: "3 require action",
      icon: AlertTriangle,
      color: "text-[#C47A0B]",
      bg: "bg-[#FFF4DE]",
    },
    {
      label: "High severity",
      value: events.filter((e) => e.severity === "High").length,
      detail: "Investigation active",
      icon: Lock,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Blocked attempts",
      value: "842",
      detail: "Last 24 hours",
      icon: ShieldCheck,
      color: "text-[#2785B2]",
      bg: "bg-[#E8F2F7]",
    },
    {
      label: "Resolved today",
      value: events.filter((e) => e.status === "Resolved").length,
      detail: "Median 18 minutes",
      icon: Check,
      color: "text-[#168D72]",
      bg: "bg-[#E5F6F1]",
    },
  ];

  const handlePolicySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!policyTitle.trim() || !policyReason.trim()) {
      return;
    }

    console.log("Security policy action:", {
      policyTitle,
      environment,
      scope,
      approvalType,
      policyReason,
    });

    alert("Security policy action recorded successfully.");

    setShowPolicyModal(false);
    setPolicyReason("");
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-50 text-red-700";
      case "Medium":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-emerald-50 text-emerald-700";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Investigating":
        return "bg-red-50 text-red-700";
      case "Review Required":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-[#E5F6F1] text-[#168D72]";
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#153B59]">

      {/* TOP BREADCRUMB */}
      <div className="border-b border-[#DCE7EC] bg-white px-6 py-3">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">Administration</span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="font-semibold text-[#153B59]">
            Security Events
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1800px] px-5 py-7 md:px-8">

        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#123B5C] md:text-[28px]">
              Security Events
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Investigate authentication risks, policy violations, and privileged activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const csv = [
                  ["Event ID", "Event Type", "User", "Source", "Severity", "Timestamp", "Status"],
                  ...filteredEvents.map((event) => [
                    event.id,
                    event.type,
                    event.user,
                    event.source,
                    event.severity,
                    event.timestamp,
                    event.status,
                  ]),
                ]
                  .map((row) => row.join(","))
                  .join("\n");

                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;",
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "security-events.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex h-11 items-center gap-2 rounded-lg border border-[#C7D8E2] bg-white px-4 text-[11px] font-semibold text-[#287FA8] hover:bg-slate-50"
            >
              <Download size={15} />
              Export report
            </button>

            <button
              onClick={() => {
                setPolicyTitle("Security Policy");
                setShowPolicyModal(true);
              }}
              className="h-11 rounded-lg bg-[#287FA8] px-5 text-[11px] font-semibold text-white transition hover:bg-[#1C668C]"
            >
              Security policy
            </button>
          </div>
        </div>

        {/* THREAT ALERT */}
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#F0D18B] border-l-4 border-l-[#E9A22B] bg-[#FFF8E9] p-4 md:flex-row md:items-center">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0CE]">
              <ShieldCheck size={22} className="text-[#98630C]" />
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#94620B]">
                Current threat level: Elevated
              </p>

              <h2 className="mt-1 text-base font-medium text-[#95600A] md:text-lg">
                One high-severity authentication event requires investigation.
              </h2>
            </div>
          </div>

          <div className="ml-auto w-full rounded-lg bg-[#FFF2D8] px-3 py-2 text-[10px] font-semibold text-[#94620B] md:w-[42%]">
            Monitoring active
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex min-h-[94px] items-center gap-3 rounded-xl border border-[#D7E5EB] bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon size={21} className={stat.color} />
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    {stat.label}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-[#153B59]">
                    {stat.value}
                  </h3>

                  <p className="mt-1 text-[9px] text-slate-400">
                    {stat.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="mb-4 flex flex-col gap-2 xl:flex-row">

          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search event ID, user, or source..."
              className="h-11 w-full rounded-lg border border-[#D3E1E8] bg-white pl-11 pr-4 text-xs outline-none focus:border-[#287FA8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-[11px] outline-none"
            >
              <option>All severities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-[11px] outline-none"
            >
              <option>All event types</option>
              {[...new Set(events.map((e) => e.type))].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-[11px] outline-none"
            >
              <option>All statuses</option>
              <option>Investigating</option>
              <option>Review Required</option>
              <option>Resolved</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 rounded-lg border border-[#D3E1E8] bg-white px-3 text-[11px] outline-none"
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All time</option>
            </select>
          </div>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="h-11 rounded-lg border border-[#C7D8E2] bg-white px-4 text-[11px] font-semibold text-[#287FA8] hover:bg-slate-50"
          >
            More filters
          </button>
        </div>

        {showMoreFilters && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#D3E1E8] bg-white p-4">
            <p className="text-xs text-slate-600">
              Additional filters are available for advanced event investigation.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSeverityFilter("All severities");
                setTypeFilter("All event types");
                setStatusFilter("All statuses");
                setDateFilter("Last 24 hours");
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-[#287FA8]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* EVENTS TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#D7E5EB] bg-white shadow-sm">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">

              <thead>
                <tr className="bg-[#F5F8F9] text-[10px] font-semibold text-slate-500">
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Event ID</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Event Type</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Associated User</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Source</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Severity</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Timestamp</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4">Status</th>
                  <th className="border-b border-[#DCE7EC] px-4 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {paginatedEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="transition hover:bg-[#F7FAFB]"
                  >
                    <td className="border-b border-[#E7EEF1] px-4 py-5 text-[11px] font-bold">
                      {event.id}
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5 text-[11px]">
                      {event.type}
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5 text-[11px]">
                      {event.user}
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5 text-[11px]">
                      {event.source}
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5">
                      <span
                        className={`rounded-md px-2 py-1.5 text-[9px] font-semibold ${getSeverityClass(event.severity)}`}
                      >
                        {event.severity}
                      </span>
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5 text-[11px] text-slate-500">
                      {event.timestamp}
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5">
                      <span
                        className={`rounded-md px-2 py-1.5 text-[9px] font-semibold ${getStatusClass(event.status)}`}
                      >
                        {event.status}
                      </span>
                    </td>

                    <td className="border-b border-[#E7EEF1] px-4 py-5">
                      <button
                        title="Mark as resolved"
                        onClick={() => {
                          setEvents((previous) =>
                            previous.map((item) =>
                              item.id === event.id
                                ? { ...item, status: "Resolved" }
                                : item
                            )
                          );
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#287FA8]"
                      >
                        <Check size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedEvents.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-xs text-slate-400"
                    >
                      No security events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center">
            <p className="text-[10px] text-slate-500">
              Showing {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(currentPage * pageSize, filteredEvents.length)}
              {" "}of {filteredEvents.length} events
            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-9 rounded-lg border border-[#D3E1E8] px-4 text-[10px] font-medium text-[#287FA8] disabled:opacity-40"
              >
                Previous
              </button>

              <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#287FA8] px-3 text-[11px] font-semibold text-white">
                {currentPage}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 rounded-lg border border-[#D3E1E8] px-4 text-[10px] font-medium text-[#287FA8] disabled:opacity-40"
              >
                Next
              </button>

            </div>
          </div>
        </div>
      </main>

      {/* SECURITY POLICY MODAL */}
      {showPolicyModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowPolicyModal(false);
            }
          }}
        >
          <div className="max-h-[95vh] w-full max-w-[775px] overflow-y-auto rounded-xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DCE7EC] px-6 py-5">

              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#56B69E]">
                  SECURE ADMINISTRATIVE ACTION
                </p>

                <h2 className="mt-2 text-[19px] font-medium text-[#34495B]">
                  Security Policy
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="rounded-md p-1 text-[#34495B] hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePolicySubmit} className="space-y-5 p-6">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#34495B]">
                    Action title <span className="text-red-500">*</span>
                  </label>

                  <input
                    required
                    value={policyTitle}
                    onChange={(e) => setPolicyTitle(e.target.value)}
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
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 text-[11px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Production</option>
                      <option>Staging</option>
                      <option>Development</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-4"
                    />
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
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 text-[11px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Selected record</option>
                      <option>All security events</option>
                      <option>High severity events</option>
                      <option>All users</option>
                      <option>All organisations</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-4"
                    />
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
                      className="h-12 w-full appearance-none rounded-lg border border-[#D5E3EA] bg-white px-4 text-[11px] outline-none focus:border-[#287FA8]"
                    >
                      <option>Standard administrator approval</option>
                      <option>Senior administrator approval</option>
                      <option>Two-person approval</option>
                      <option>Emergency authorisation</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-4"
                    />
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
                  value={policyReason}
                  onChange={(e) => setPolicyReason(e.target.value)}
                  placeholder="Explain the authorised reason for this change..."
                  className="w-full resize-y rounded-lg border border-[#D5E3EA] p-3 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#287FA8]"
                />
              </div>

              {/* Warning */}
              <div className="flex items-center gap-3 rounded-lg bg-[#FFF6E3] px-4 py-4">
                <ShieldCheck
                  size={21}
                  className="shrink-0 text-[#98630C]"
                />

                <p className="text-[10px] leading-5 text-[#94620B]">
                  This operation is performed locally for demonstration.
                  In production it requires backend permission enforcement.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-1">

                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="h-11 rounded-lg border border-[#C7D8E2] bg-white px-5 text-[11px] font-semibold text-[#287FA8] hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-lg bg-[#287FA8] px-5 text-[11px] font-semibold text-white shadow-sm hover:bg-[#1C668C]"
                >
                  Confirm &amp; record
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
