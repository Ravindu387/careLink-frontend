
import { useMemo, useState } from "react";
import {
  Activity,
  Search,
  Globe,
  HelpCircle,
  Bell,
  User,
  ChevronRight,
  X,
  Download,
  Play,
  KeyRound,
  Database,
  Link2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
  Server,
  Zap,
} from "lucide-react";

type HealthStatus = "Operational" | "Degraded" | "Unavailable";

type Integration = {
  id: string;
  name: string;
  type: string;
  availability: string;
  latency: string;
  health: HealthStatus;
  lastCheck: string;
  icon: typeof KeyRound;
};

type ModalType =
  | "report"
  | "health-check"
  | "details"
  | "logs"
  | "retry"
  | null;

const initialIntegrations: Integration[] = [
  {
    id: "INT-001",
    name: "Identity & Access Service",
    type: "Authentication",
    availability: "99.99%",
    latency: "42 ms",
    health: "Operational",
    lastCheck: "Just now",
    icon: KeyRound,
  },
  {
    id: "INT-004",
    name: "SMS Delivery Gateway",
    type: "Communications",
    availability: "97.42%",
    latency: "1.8 s",
    health: "Degraded",
    lastCheck: "1 min ago",
    icon: Bell,
  },
  {
    id: "INT-008",
    name: "Email Delivery Service",
    type: "Communications",
    availability: "99.94%",
    latency: "284 ms",
    health: "Operational",
    lastCheck: "Just now",
    icon: Database,
  },
  {
    id: "INT-012",
    name: "Mapping & Geocoding",
    type: "Location",
    availability: "99.87%",
    latency: "640 ms",
    health: "Operational",
    lastCheck: "2 min ago",
    icon: Link2,
  },
  {
    id: "INT-016",
    name: "AI Decision Support",
    type: "AI Service",
    availability: "99.91%",
    latency: "1.2 s",
    health: "Operational",
    lastCheck: "Just now",
    icon: Zap,
  },
  {
    id: "INT-021",
    name: "Government Alert Feed",
    type: "External API",
    availability: "94.10%",
    latency: "—",
    health: "Unavailable",
    lastCheck: "18 min ago",
    icon: Globe,
  },
];

const healthStyles: Record<HealthStatus, string> = {
  Operational: "bg-[#E5F6F0] text-[#13856A]",
  Degraded: "bg-[#FFF4DD] text-[#A96A00]",
  Unavailable: "bg-[#FDEBEC] text-[#C43B42]",
};

function StatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1.5 text-[9px] font-semibold ${healthStyles[status]}`}
    >
      {status}
    </span>
  );
}

function IntegrationHealthModal({
  type,
  integration,
  onClose,
  onConfirm,
}: {
  type: ModalType;
  integration: Integration | null;
  onClose: () => void;
  onConfirm: (message: string) => void;
}) {
  const [title, setTitle] = useState(
    type === "health-check"
      ? "Run Health Check"
      : type === "details"
        ? `Integration Details: ${integration?.name ?? ""}`
        : type === "retry"
          ? `Retry: ${integration?.name ?? ""}`
          : "Integration Health Report"
  );

  const [environment, setEnvironment] = useState("Production");
  const [scope, setScope] = useState("Selected record");
  const [approval, setApproval] = useState("Standard administrator approval");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState("");

  if (!type) return null;

  const handleConfirm = () => {
    if (!title.trim()) {
      setError("Action title is required.");
      return;
    }

    if (!rationale.trim()) {
      setError("Please provide an administrative rationale.");
      return;
    }

    onConfirm(
      `${title} recorded successfully for ${environment} environment.`
    );
  };

  const isLogs = type === "logs";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#10283B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-[750px] overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#D8E6EC] px-6 py-5">
          <div>
            <p className="text-[9px] font-bold tracking-widest text-[#55BBA3]">
              SECURE ADMINISTRATIVE ACTION
            </p>

            <h2 className="mt-2 text-lg font-medium text-[#183D59]">
              {isLogs
                ? `Integration Logs: ${integration?.name}`
                : type === "health-check"
                  ? "Run Health Check"
                  : type === "details"
                    ? `Integration Details: ${integration?.name}`
                    : type === "retry"
                      ? `Retry Integration: ${integration?.name}`
                      : "Integration Health Report"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#29465A] hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-5 p-6">

          {isLogs ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-[#F2F7F9] p-4">
                <p className="text-xs font-semibold text-[#183D59]">
                  Recent activity
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Latest recorded integration events.
                </p>
              </div>

              {[
                ["Health check completed", "Connection status checked successfully.", "Just now"],
                ["API response received", "Service returned a valid response.", "2 minutes ago"],
                ["Authentication verified", "Connection credentials validated.", "5 minutes ago"],
                ["Scheduled monitoring", "Automatic monitoring event recorded.", "10 minutes ago"],
              ].map(([heading, description, time]) => (
                <div
                  key={heading}
                  className="flex items-start gap-3 border-b border-slate-100 pb-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#55BBA3]" />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[#183D59]">
                      {heading}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {description}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400">{time}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ACTION TITLE AND ENVIRONMENT */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#344C60]">
                    Action title <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] px-3 text-[10px] text-[#29465A] outline-none focus:border-[#2785B2]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#344C60]">
                    Environment
                  </label>

                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] bg-white px-3 text-[10px] outline-none focus:border-[#2785B2]"
                  >
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#344C60]">
                    Scope
                  </label>

                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] bg-white px-3 text-[10px] outline-none focus:border-[#2785B2]"
                  >
                    <option>Selected record</option>
                    <option>All integrations</option>
                    <option>Communications services</option>
                    <option>External services</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold text-[#344C60]">
                    Approval type
                  </label>

                  <select
                    value={approval}
                    onChange={(e) => setApproval(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] bg-white px-3 text-[10px] outline-none focus:border-[#2785B2]"
                  >
                    <option>Standard administrator approval</option>
                    <option>Privileged administrator approval</option>
                    <option>Emergency authorised action</option>
                  </select>
                </div>
              </div>

              {/* RATIONALE */}
              <div>
                <label className="mb-2 block text-[10px] font-semibold text-[#344C60]">
                  Administrative rationale{" "}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={rationale}
                  onChange={(e) => {
                    setRationale(e.target.value);
                    setError("");
                  }}
                  rows={4}
                  placeholder="Explain the authorised reason for this change..."
                  className="w-full resize-y rounded-lg border border-[#D6E5EC] p-3 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#2785B2]"
                />
              </div>

              {/* WARNING */}
              <div className="flex items-center gap-3 rounded-lg bg-[#FFF7E5] px-4 py-4 text-[#95620D]">
                <ShieldCheck size={20} className="shrink-0" />
                <p className="text-[10px] leading-5">
                  This operation is performed locally for demonstration.
                  In production it requires backend permission enforcement.
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-[10px] text-red-600">
              {error}
            </p>
          )}

          {/* FOOTER BUTTONS */}
          <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#E1E9ED] pt-4 sm:flex-row">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#BCD0DA] px-5 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              {isLogs ? "Close" : "Cancel"}
            </button>

            {!isLogs && (
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-[#2785B2] px-5 py-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#1D6F98]"
              >
                Confirm &amp; record
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationHealth() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All service types");
  const [healthFilter, setHealthFilter] = useState("All health states");
  const [latencyFilter, setLatencyFilter] = useState("Any latency");
  const [moreFilters, setMoreFilters] = useState(false);

  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  const [modal, setModal] = useState<ModalType>(null);
  const [notice, setNotice] = useState("");
  const [lastChecked, setLastChecked] = useState("Just now");

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const searchMatch =
        `${item.id} ${item.name} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All service types" || item.type === typeFilter;

      const healthMatch =
        healthFilter === "All health states" ||
        item.health === healthFilter;

      const latencyValue = parseFloat(item.latency);

      const latencyMatch =
        latencyFilter === "Any latency" ||
        (latencyFilter === "Below 500 ms" &&
          !Number.isNaN(latencyValue) &&
          latencyValue < 500 &&
          item.latency.includes("ms")) ||
        (latencyFilter === "500 ms or above" &&
          (!Number.isNaN(latencyValue) &&
            latencyValue >= 500 &&
            item.latency.includes("ms") ||
            item.latency.includes("s")));

      return searchMatch && typeMatch && healthMatch && latencyMatch;
    });
  }, [integrations, search, typeFilter, healthFilter, latencyFilter]);

  const operationalCount = integrations.filter(
    (item) => item.health === "Operational"
  ).length;

  const healthyPercentage = Math.round(
    (operationalCount / integrations.length) * 100
  );

  const exportCSV = () => {
    const header = [
      "Integration ID",
      "Service",
      "Type",
      "Availability",
      "Latency",
      "Health",
      "Last Check",
    ];

    const rows = filteredIntegrations.map((item) => [
      item.id,
      item.name,
      item.type,
      item.availability,
      item.latency,
      item.health,
      item.lastCheck,
    ]);

    const csv = [header, ...rows]
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
    link.download = "integration-health-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const runHealthCheck = () => {
    setIntegrations((previous) =>
      previous.map((item) => ({
        ...item,
        lastCheck: "Just now",
      }))
    );
    setLastChecked("Just now");
  };

  const handleModalConfirm = (message: string) => {
    if (modal === "retry" && selectedIntegration) {
      setIntegrations((previous) =>
        previous.map((item) =>
          item.id === selectedIntegration.id
            ? {
                ...item,
                health: "Operational",
                lastCheck: "Just now",
              }
            : item
        )
      );
    }

    if (modal === "health-check") {
      runHealthCheck();
    }

    setModal(null);
    setNotice(message);

    window.setTimeout(() => setNotice(""), 4000);
  };

  const openModal = (
    type: ModalType,
    integration: Integration | null = null
  ) => {
    setSelectedIntegration(integration);
    setModal(type);
  };

  return (
    <div className="min-h-screen bg-[#EFF6F7]">
      {/* BREADCRUMB */}
      <div className="flex h-9 items-center gap-2 border-b border-[#55BBA3] bg-white px-5 text-[9px] text-slate-500">
        <span>Administration</span>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#123B5C]">
          Integration Health
        </span>

        <span className="ml-auto flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#55BBA3]" />
          Live data · Updated just now
        </span>
      </div>

      {/* PAGE CONTENT */}
      <main className="mx-auto max-w-[1800px] space-y-3 px-4 py-5 md:px-6">

        {/* HEADING */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#123B5C]">
              Integration Health
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Monitor connected services, API performance, delivery health, and failures.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openModal("report")}
              className="rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              Export status
            </button>

            <button
              onClick={() => openModal("health-check")}
              className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D6F98]"
            >
              <Play size={13} />
              Run health check
            </button>
          </div>
        </div>

        {/* CORE PLATFORM STATUS */}
        <section className="grid grid-cols-1 gap-4 rounded-xl bg-[#153F60] p-4 text-white md:grid-cols-[2fr_0.8fr_0.8fr_0.8fr] md:items-center md:px-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#55BBA3]" />
              <p className="text-[9px] font-semibold text-[#8DDAC6]">
                CORE PLATFORM
              </p>
            </div>

            <h2 className="mt-1 text-sm font-bold">
              {operationalCount === integrations.length
                ? "Operational"
                : operationalCount >= integrations.length - 2
                  ? "Operational"
                  : "Degraded"}
            </h2>

            <p className="mt-1 text-[9px] text-slate-300">
              Last checked {lastChecked}
            </p>
          </div>

          <div className="border-l border-white/15 pl-4">
            <h3 className="text-lg font-bold">{healthyPercentage}%</h3>
            <p className="text-[9px] text-slate-300">Services healthy</p>
          </div>

          <div className="border-l border-white/15 pl-4">
            <h3 className="text-lg font-bold">99.94%</h3>
            <p className="text-[9px] text-slate-300">API availability</p>
          </div>

          <div className="border-l border-white/15 pl-4">
            <h3 className="text-lg font-bold">248 ms</h3>
            <p className="text-[9px] text-slate-300">Median latency</p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="flex flex-col gap-2 xl:flex-row">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D7E5EA] bg-white px-3">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integration name or type..."
              className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>All service types</option>
              <option>Authentication</option>
              <option>Communications</option>
              <option>Location</option>
              <option>AI Service</option>
              <option>External API</option>
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>All health states</option>
              <option>Operational</option>
              <option>Degraded</option>
              <option>Unavailable</option>
            </select>

            <select
              value={latencyFilter}
              onChange={(e) => setLatencyFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"
            >
              <option>Any latency</option>
              <option>Below 500 ms</option>
              <option>500 ms or above</option>
            </select>
          </div>

          <button
            onClick={() => setMoreFilters(!moreFilters)}
            className="h-10 rounded-lg border border-[#B9D1DD] bg-white px-4 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"
          >
            More filters
          </button>
        </section>

        {moreFilters && (
          <div className="flex items-center justify-between rounded-lg border border-[#D7E5EA] bg-white p-3">
            <p className="text-[10px] text-slate-500">
              Showing {filteredIntegrations.length} matching integrations.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All service types");
                setHealthFilter("All health states");
                setLatencyFilter("Any latency");
              }}
              className="text-[10px] font-semibold text-[#2785B2]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* INTEGRATION TABLE */}
        <section className="overflow-hidden rounded-xl border border-[#D7E5EA] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-[#D7E5EA] bg-[#F5F8F9] text-[9px] font-semibold text-slate-500">
                  <th className="px-3 py-4">Integration ID</th>
                  <th className="px-3 py-4">Service</th>
                  <th className="px-3 py-4">Type</th>
                  <th className="px-3 py-4">Availability</th>
                  <th className="px-3 py-4">Latency</th>
                  <th className="px-3 py-4">Health</th>
                  <th className="px-3 py-4">Last Check</th>
                  <th className="px-3 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {filteredIntegrations.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openModal("details", item)}
                    className="cursor-pointer border-b border-[#E5EDF1] text-[9px] text-slate-600 transition hover:bg-[#F5FAFC]"
                  >
                    <td className="px-3 py-4 font-bold text-[#123B5C]">
                      {item.id}
                    </td>

                    <td className="px-3 py-4 font-medium">
                      {item.name}
                    </td>

                    <td className="px-3 py-4">{item.type}</td>
                    <td className="px-3 py-4">{item.availability}</td>
                    <td className="px-3 py-4">{item.latency}</td>

                    <td className="px-3 py-4">
                      <StatusBadge status={item.health} />
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-md bg-[#F0F4F6] px-2 py-1.5 text-[9px]">
                        {item.lastCheck}
                      </span>
                    </td>

                    <td
                      className="px-3 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openModal("details", item)}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredIntegrations.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-xs text-slate-400"
                    >
                      No integrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SERVICE SUMMARY CARDS */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {integrations.slice(0, 4).map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-[#D7E5EA] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F2F7] text-[#2785B2]">
                    <Icon size={20} />
                  </div>

                  <StatusBadge status={item.health} />
                </div>

                <h3 className="mt-4 text-[11px] font-semibold text-[#123B5C]">
                  {item.name}
                </h3>

                <p className="mt-1 text-[9px] text-slate-400">
                  {item.type} · checked {item.lastCheck.toLowerCase()}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#D7E5EA] pt-3">
                  <div>
                    <p className="text-[9px] text-slate-500">
                      Availability
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-[#123B5C]">
                      {item.availability}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-500">Latency</p>
                    <p className="mt-1 text-[10px] font-bold text-[#123B5C]">
                      {item.latency}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-3 border-t border-[#D7E5EA] pt-2">
                  <button
                    onClick={() => openModal("logs", item)}
                    className="text-[9px] font-medium text-[#2785B2] hover:underline"
                  >
                    View logs
                  </button>

                  <button
                    onClick={() => openModal("retry", item)}
                    className="text-[9px] font-medium text-[#2785B2] hover:underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* FOOTER */}
        <footer className="flex flex-wrap items-center justify-between gap-2 py-3 text-[9px] text-slate-400">
          <span>© 2026 Humanitarian Aid Platform · CareLink</span>
          <span>Integration monitoring dashboard</span>
        </footer>
      </main>

      {/* SUCCESS NOTIFICATION */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white p-4 shadow-xl">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-[10px] text-[#123B5C]">{notice}</p>
          <button onClick={() => setNotice("")}>
            <X size={15} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* MODALS */}
      {modal && (
        <IntegrationHealthModal
          type={modal}
          integration={selectedIntegration}
          onClose={() => setModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}
