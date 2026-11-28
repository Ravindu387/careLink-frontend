import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Globe,
  Bell,
  ChevronRight,
  X,
  Download,
  Play,
  KeyRound,
  Database,
  Link2,
  MoreHorizontal,
  ShieldCheck,
  CheckCircle2,
  Zap,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { integrationService } from "../../services/integrationService";
import type {
  Integration,
  HealthStatus,
  IntegrationLog,
  PlatformHealthOverview,
} from "../../types/integration";

type ModalType =
  | "report"
  | "health-check"
  | "details"
  | "logs"
  | "retry"
  | null;

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  KeyRound,
  Bell,
  Database,
  Link2,
  Zap,
  Globe,
};

function getIconComponent(iconName: string) {
  return iconMap[iconName] || KeyRound;
}

const healthStyles: Record<HealthStatus, string> = {
  Operational: "bg-[#E5F6F0] text-[#13856A]",
  Degraded: "bg-[#FFF4DD] text-[#A96A00]",
  Unavailable: "bg-[#FDEBEC] text-[#C43B42]",
};

function StatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold ${healthStyles[status] || healthStyles.Operational}`}
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
      ? "Run Platform Health Check"
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For logs
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (type === "logs" && integration?.id) {
      setLoadingLogs(true);
      integrationService
        .getLogs(integration.id)
        .then((data) => setLogs(data))
        .catch(() => setLogs([]))
        .finally(() => setLoadingLogs(false));
    }
  }, [type, integration]);

  if (!type) return null;

  const handleConfirm = async () => {
    if (!title.trim()) {
      setError("Action title is required.");
      return;
    }

    if (!rationale.trim()) {
      setError("Please provide an administrative rationale.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (type === "retry" && integration) {
        await integrationService.retryIntegration(integration.id, {
          actionTitle: title,
          environment,
          scope,
          approvalType: approval,
          administrativeRationale: rationale,
        });
        onConfirm(`Recovery recorded for ${integration.name} (${environment}).`);
      } else {
        await integrationService.recordAction(
          {
            actionTitle: title,
            environment,
            scope,
            approvalType: approval,
            administrativeRationale: rationale,
          },
          integration?.id
        );
        onConfirm(`${title} recorded successfully for ${environment} environment.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete administrative action.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLogs = type === "logs";
  const isDetails = type === "details";

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
            <p className="text-xs font-bold tracking-widest text-[#55BBA3]">
              SECURE ADMINISTRATIVE ACTION
            </p>

            <h2 className="mt-2 text-lg font-semibold text-[#183D59]">
              {isLogs
                ? `Integration Logs: ${integration?.name}`
                : type === "health-check"
                  ? "Run Health Check"
                  : isDetails
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
                <p className="text-sm font-semibold text-[#183D59]">
                  Recorded Telemetry Events
                </p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Live backend diagnostics and administrative actions for {integration?.name}.
                </p>
              </div>

              {loadingLogs ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 size={20} className="animate-spin text-[#2785B2]" />
                  <span className="ml-2 text-xs">Loading telemetry records...</span>
                </div>
              ) : logs.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No log entries recorded for this service.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 border-b border-slate-100 pb-3"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        log.status === "Error"
                          ? "bg-red-500"
                          : log.status === "Warning"
                          ? "bg-amber-500"
                          : "bg-[#55BBA3]"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#183D59]">
                        {log.heading}
                      </p>
                      <p className="mt-1 text-[13px] text-slate-500">
                        {log.description}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{log.timeAgo}</span>
                  </div>
                ))
              )}
            </div>
          ) : isDetails && integration ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#F2F7F9] p-4">
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-400">SERVICE ID</span>
                  <p className="text-sm font-semibold text-[#183D59]">{integration.id}</p>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-400">CURRENT HEALTH</span>
                  <div className="mt-1">
                    <StatusBadge status={integration.health} />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-400">AVAILABILITY</span>
                  <p className="text-sm font-semibold text-[#183D59]">{integration.availability}</p>
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-400">LATENCY</span>
                  <p className="text-sm font-semibold text-[#183D59]">{integration.latency}</p>
                </div>
                {integration.endpoint && (
                  <div className="col-span-2">
                    <span className="text-xs font-bold tracking-wider text-slate-400">ENDPOINT</span>
                    <p className="break-all font-mono text-sm text-slate-700">{integration.endpoint}</p>
                  </div>
                )}
                {integration.description && (
                  <div className="col-span-2">
                    <span className="text-xs font-bold tracking-wider text-slate-400">DESCRIPTION</span>
                    <p className="text-sm text-slate-600">{integration.description}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ACTION TITLE AND ENVIRONMENT */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#344C60]">
                    Action title <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] px-3 text-sm sm:text-[15px] text-[#29465A] outline-none focus:border-[#2785B2]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#344C60]">
                    Environment
                  </label>

                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  >
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#344C60]">
                    Scope
                  </label>

                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  >
                    <option>Selected record</option>
                    <option>All integrations</option>
                    <option>Communications services</option>
                    <option>External services</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#344C60]">
                    Approval type
                  </label>

                  <select
                    value={approval}
                    onChange={(e) => setApproval(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#D6E5EC] bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  >
                    <option>Standard administrator approval</option>
                    <option>Privileged administrator approval</option>
                    <option>Emergency authorised action</option>
                  </select>
                </div>
              </div>

              {/* RATIONALE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#344C60]">
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
                  placeholder="Explain the authorised reason for this administrative intervention..."
                  className="w-full resize-y rounded-lg border border-[#D6E5EC] p-3 text-sm sm:text-[15px] outline-none placeholder:text-slate-400 focus:border-[#2785B2]"
                />
              </div>

              {/* WARNING */}
              <div className="flex items-center gap-3 rounded-lg bg-sky-50 px-4 py-3.5 text-[#185374]">
                <ShieldCheck size={20} className="shrink-0 text-[#2785B2]" />
                <p className="text-sm leading-5">
                  This operation is enforced by the ASP.NET Core backend and recorded in the permanent audit trail.
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* FOOTER BUTTONS */}
          <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#E1E9ED] pt-4 sm:flex-row">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#BCD0DA] px-5 py-3 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              {isLogs || isDetails ? "Close" : "Cancel"}
            </button>

            {!isLogs && !isDetails && (
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2785B2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D6F98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Confirm & record"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationHealth() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [overview, setOverview] = useState<PlatformHealthOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All service types");
  const [healthFilter, setHealthFilter] = useState("All health states");
  const [latencyFilter, setLatencyFilter] = useState("Any latency");
  const [moreFilters, setMoreFilters] = useState(false);

  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  const [modal, setModal] = useState<ModalType>(null);
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [integrationsData, overviewData] = await Promise.all([
        integrationService.getIntegrations({
          type: typeFilter !== "All service types" ? typeFilter : undefined,
          health: healthFilter !== "All health states" ? healthFilter : undefined,
          search: search || undefined,
        }),
        integrationService.getOverview(),
      ]);

      if (integrationsData) {
        setIntegrations(integrationsData);
      }
      if (overviewData) {
        setOverview(overviewData);
      }
    } catch (err: any) {
      console.warn("Failed to reach backend integration health endpoint:", err);
      setApiError(err.message || "Unable to reach the CareLink server. Please ensure the backend API is running.");
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, healthFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      const latencyValue = item.latencyMs;

      const latencyMatch =
        latencyFilter === "Any latency" ||
        (latencyFilter === "Below 500 ms" && latencyValue < 500 && latencyValue > 0) ||
        (latencyFilter === "500 ms or above" && latencyValue >= 500);

      return searchMatch && typeMatch && healthMatch && latencyMatch;
    });
  }, [integrations, search, typeFilter, healthFilter, latencyFilter]);

  const operationalCount = overview?.operationalCount ?? integrations.filter(
    (item) => item.health === "Operational"
  ).length;

  const healthyPercentage = overview?.servicesHealthyPercentage ?? (
    integrations.length > 0
      ? Math.round((operationalCount / integrations.length) * 100)
      : 100
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
    link.download = `integration-health-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunHealthCheck = async () => {
    setIsChecking(true);
    setApiError(null);
    try {
      const updated = await integrationService.runHealthCheck();
      if (updated) {
        setIntegrations(updated);
      }
      const refreshedOverview = await integrationService.getOverview();
      if (refreshedOverview) {
        setOverview(refreshedOverview);
      }
      setNotice("Health check completed across all endpoints.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err: any) {
      setApiError(err.message || "Failed to trigger live health checks.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleModalConfirm = (message: string) => {
    setModal(null);
    setNotice(message);
    loadData();
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
      <div className="flex h-9 items-center gap-2 border-b border-[#55BBA3] bg-white px-5 text-xs text-slate-500">
        <span>Administration</span>
        <ChevronRight size={12} />
        <span className="font-semibold text-[#123B5C]">
          Integration Health
        </span>

        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#55BBA3]" />
          <span>Live telemetry · Updated {overview?.lastChecked || "Just now"}</span>
        </span>
      </div>

      {/* PAGE CONTENT */}
      <main className="mx-auto max-w-[1800px] space-y-3 px-4 py-5 md:px-6">

        {/* HEADING */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
              Integration Health
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Monitor connected services, API performance, delivery health, and failures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              title="Refresh integrations"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#B9D1DD] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-[#2785B2]" : ""} />
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
            >
              <Download size={13} />
              Export status
            </button>

            <button
              onClick={handleRunHealthCheck}
              disabled={isChecking}
              className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1D6F98] disabled:opacity-60"
            >
              {isChecking ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Play size={13} />
                  Run health check
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {apiError && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{apiError}</span>
            </div>
            <button onClick={() => setApiError(null)} className="text-red-500 hover:text-red-800">
              <X size={15} />
            </button>
          </div>
        )}

        {/* CORE PLATFORM STATUS */}
        <section className="grid grid-cols-1 gap-4 rounded-xl bg-[#153F60] p-4 text-white md:grid-cols-[2fr_0.8fr_0.8fr_0.8fr] md:items-center md:px-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  overview?.corePlatformStatus === "Unavailable"
                    ? "bg-red-400"
                    : overview?.corePlatformStatus === "Degraded"
                    ? "bg-amber-400"
                    : "bg-[#55BBA3]"
                }`}
              />
              <p className="text-sm font-semibold text-[#8DDAC6]">
                CORE PLATFORM
              </p>
            </div>

            <h2 className="mt-1 text-lg sm:text-xl font-bold">
              {overview?.corePlatformStatus || "Operational"}
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              Last checked {overview?.lastChecked || "Just now"}
            </p>
          </div>

          <div className="border-l border-white/15 pl-4">
            <h3 className="text-lg font-bold">{healthyPercentage}%</h3>
            <p className="text-sm text-slate-300">Services healthy</p>
          </div>

          <div className="border-l border-white/15 pl-4">
            <h3 className="text-lg font-bold">{overview?.apiAvailability || "99.94%"}</h3>
            <p className="text-sm text-slate-300">API availability</p>
          </div>

          <div className="border-l border-white/15 pl-4">
            <h3 className="text-lg font-bold">{overview?.medianLatency || "248 ms"}</h3>
            <p className="text-sm text-slate-300">Median latency</p>
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
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All service types</option>
              <option>Authentication</option>
              <option>Database</option>
              <option>Communications</option>
              <option>Location</option>
              <option>AI Service</option>
              <option>External API</option>
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>All health states</option>
              <option>Operational</option>
              <option>Degraded</option>
              <option>Unavailable</option>
            </select>

            <select
              value={latencyFilter}
              onChange={(e) => setLatencyFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-sm sm:text-[15px] outline-none"
            >
              <option>Any latency</option>
              <option>Below 500 ms</option>
              <option>500 ms or above</option>
            </select>
          </div>

          <button
            onClick={() => setMoreFilters(!moreFilters)}
            className="h-10 rounded-lg border border-[#B9D1DD] bg-white px-4 text-sm font-semibold text-[#2785B2] hover:bg-sky-50"
          >
            More filters
          </button>
        </section>

        {moreFilters && (
          <div className="flex items-center justify-between rounded-lg border border-[#D7E5EA] bg-white p-3">
            <p className="text-[13px] text-slate-500">
              Showing {filteredIntegrations.length} matching integrations.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All service types");
                setHealthFilter("All health states");
                setLatencyFilter("Any latency");
              }}
              className="text-sm font-semibold text-[#2785B2]"
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
                <tr className="border-b border-[#D7E5EA] bg-[#F5F8F9] text-sm font-semibold text-slate-500">
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
                    className="cursor-pointer border-b border-[#E5EDF1] text-sm text-slate-600 transition hover:bg-[#F5FAFC]"
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
                      <span className="rounded-md bg-[#F0F4F6] px-2 py-1.5 text-xs">
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
                        title="Actions"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredIntegrations.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      No integrations found.
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                      <Loader2 size={18} className="mx-auto animate-spin text-[#2785B2]" />
                      <span className="mt-2 block">Loading integration telemetry...</span>
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
            const Icon = getIconComponent(item.icon);

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

                <h3 className="mt-4 text-base font-semibold text-[#123B5C]">
                  {item.name}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {item.type} · checked {item.lastCheck.toLowerCase()}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#D7E5EA] pt-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Availability
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#123B5C]">
                      {item.availability}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Latency</p>
                    <p className="mt-1 text-sm font-bold text-[#123B5C]">
                      {item.latency}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-3 border-t border-[#D7E5EA] pt-2">
                  <button
                    onClick={() => openModal("logs", item)}
                    className="text-sm font-medium text-[#2785B2] hover:underline"
                  >
                    View logs
                  </button>

                  <button
                    onClick={() => openModal("retry", item)}
                    className="text-sm font-medium text-[#2785B2] hover:underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* FOOTER */}
        <footer className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs text-slate-400">
          <span>© 2026 Humanitarian Aid Platform · CareLink</span>
          <span>Integration monitoring dashboard</span>
        </footer>
      </main>

      {/* SUCCESS NOTIFICATION */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white p-4 shadow-xl">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-sm text-[#123B5C]">{notice}</p>
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
