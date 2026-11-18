import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
  Accessibility,
  ClipboardCheck,
  UserRound,
  MapPin,
  Clock,
  CheckCircle2,
  Filter,
  FileWarning,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { healthSafetyService } from "../../services/healthSafetyService";
import type {
  HealthSafetyIncident,
  HealthSafetySummary,
  HealthSafetyMeta,
  Severity,
  IncidentStatus,
  SafetyCheckItem,
} from "../../types/healthSafety";

/* ================= DEFAULT FALLBACK OPTIONS ================= */

const defaultIncidentTypes = [
  "Medical assistance",
  "Sanitation inspection",
  "Fire safety",
  "Accessibility concern",
  "Evacuation",
  "Water safety",
  "Food safety",
  "Other",
];

const defaultStaffMembers = [
  "Dr. M. Rao",
  "Nurse M. Rao",
  "Facilities Team",
  "Maintenance",
  "Security Team",
  "Shelter Manager",
];

const defaultSeverityOptions: Severity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const defaultStatusOptions: IncidentStatus[] = [
  "Action Required",
  "Under Investigation",
  "Resolved",
];

/* ================= MAIN COMPONENT ================= */

export default function HealthSafetyPage() {
  const [incidents, setIncidents] = useState<HealthSafetyIncident[]>([]);
  const [summary, setSummary] = useState<HealthSafetySummary | null>(null);
  const [meta, setMeta] = useState<HealthSafetyMeta | null>(null);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All incident types");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [reporterFilter, setReporterFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedIncident, setSelectedIncident] =
    useState<HealthSafetyIncident | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [newIncident, setNewIncident] = useState({
    type: "Medical assistance",
    location: "",
    reportedBy: "",
    severity: "Medium" as Severity,
    assignedStaff: "Nurse M. Rao",
    description: "",
  });

  const incidentTypes = meta?.incidentTypes ?? defaultIncidentTypes;
  const staffMembers = meta?.staffMembers ?? defaultStaffMembers;
  const severityOptions = meta?.severities ?? defaultSeverityOptions;
  const statusOptions = meta?.statuses ?? defaultStatusOptions;

  /* ================= FETCH DATA ================= */

  const loadSummaryAndMeta = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const [summaryRes, metaRes] = await Promise.all([
        healthSafetyService.getSummary(),
        healthSafetyService.getMeta(),
      ]);
      setSummary(summaryRes);
      setMeta(metaRes);
    } catch (err: any) {
      console.error("Failed to load health safety summary or meta:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter && !typeFilter.startsWith("All")) params.type = typeFilter;
      if (severityFilter && !severityFilter.startsWith("All"))
        params.severity = severityFilter;
      if (statusFilter && !statusFilter.startsWith("All"))
        params.status = statusFilter;
      if (dateFilter && !dateFilter.startsWith("Date"))
        params.dateRange = dateFilter;

      const data = await healthSafetyService.getIncidents(params);
      setIncidents(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Failed to fetch health & safety incidents:", err);
      setError(err?.message || "Failed to load incidents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, severityFilter, statusFilter, dateFilter]);

  useEffect(() => {
    loadSummaryAndMeta();
  }, [loadSummaryAndMeta]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  /* ================= CLIENT-SIDE ADVANCED FILTERING & PAGINATION ================= */

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (
        reporterFilter.trim() &&
        !incident.reportedBy
          .toLowerCase()
          .includes(reporterFilter.toLowerCase().trim())
      ) {
        return false;
      }
      if (
        locationFilter.trim() &&
        !incident.location
          .toLowerCase()
          .includes(locationFilter.toLowerCase().trim())
      ) {
        return false;
      }
      return true;
    });
  }, [incidents, reporterFilter, locationFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIncidents.length / pageSize)
  );

  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIncidents.slice(start, start + pageSize);
  }, [filteredIncidents, currentPage, pageSize]);

  /* ================= RESET FILTERS ================= */

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All incident types");
    setSeverityFilter("All severities");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
    setReporterFilter("");
    setLocationFilter("");
    setCurrentPage(1);
  };

  /* ================= REGISTER INCIDENT ================= */

  const handleRegisterIncident = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newIncident.location.trim() || !newIncident.reportedBy.trim()) return;

    try {
      setActionLoading(true);
      const created = await healthSafetyService.createIncident({
        type: newIncident.type,
        location: newIncident.location.trim(),
        reportedBy: newIncident.reportedBy.trim(),
        severity: newIncident.severity,
        assignedStaff: newIncident.assignedStaff,
        description: newIncident.description.trim(),
      });

      setIncidents((prev) => [created, ...prev]);
      setNewIncident({
        type: incidentTypes[0] || "Medical assistance",
        location: "",
        reportedBy: "",
        severity: "Medium",
        assignedStaff: staffMembers[0] || "Nurse M. Rao",
        description: "",
      });

      setShowRegisterModal(false);
      setSuccessMessage(`Incident ${created.id} registered successfully.`);
      loadSummaryAndMeta();
    } catch (err: any) {
      console.error("Failed to register incident:", err);
      alert(err?.message || "Failed to register incident.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= UPDATE INCIDENT ================= */

  const handleUpdateIncident = async (
    id: string,
    changes: {
      assignedStaff?: string;
      severity?: string;
      status?: string;
      description?: string;
      location?: string;
    }
  ) => {
    try {
      setActionLoading(true);
      const updated = await healthSafetyService.updateIncident(id, changes);

      setIncidents((prev) =>
        prev.map((incident) => (incident.id === id ? updated : incident))
      );

      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(updated);
      }

      setSuccessMessage(`Incident ${id} updated successfully.`);
      loadSummaryAndMeta();
    } catch (err: any) {
      console.error("Failed to update incident:", err);
      alert(err?.message || "Failed to update incident.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= DELETE INCIDENT ================= */

  const handleDeleteIncident = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete incident ${id}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await healthSafetyService.deleteIncident(id);
      setIncidents((prev) => prev.filter((item) => item.id !== id));
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(null);
      }
      setSuccessMessage(`Incident ${id} deleted successfully.`);
      loadSummaryAndMeta();
    } catch (err: any) {
      console.error("Failed to delete incident:", err);
      alert(err?.message || "Failed to delete incident.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* ================= MAIN CONTENT ================= */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">
        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Health & Safety</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Health & Safety
            </h1>

            <p className="text-[11px] text-slate-500 mt-2">
              Monitor health incidents, safety inspections, sanitation, and
              evacuation readiness.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadIncidents();
                loadSummaryAndMeta();
              }}
              title="Refresh data"
              className="h-9 px-3 bg-white border border-[#d5e3e9] text-[#1c638a] rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition"
            >
              <RefreshCw
                size={13}
                className={loading || summaryLoading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 hover:bg-[#144665] transition shadow-sm"
            >
              <Plus size={14} />
              Register incident
            </button>
          </div>
        </div>

        {/* ================= SAFETY CHECK CARDS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          {summaryLoading && !summary ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#d5e3e9] rounded-xl p-3 flex items-center gap-3 min-h-[62px] animate-pulse"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-slate-200 rounded w-24" />
                  <div className="h-2 bg-slate-100 rounded w-16" />
                </div>
              </div>
            ))
          ) : summary?.safetyChecks && summary.safetyChecks.length > 0 ? (
            summary.safetyChecks.map((check) => (
              <SafetyCard
                key={check.id}
                icon={renderSafetyCheckIcon(check.iconKey)}
                color={normalizeColor(check.color)}
                title={check.title}
                description={check.description}
              />
            ))
          ) : (
            <>
              <SafetyCard
                icon={<Check size={17} />}
                color="green"
                title="Fire safety check"
                description="Completed · 21 Jun"
              />
              <SafetyCard
                icon={<AlertTriangle size={17} />}
                color="orange"
                title="Sanitation inspection"
                description="Due today"
              />
              <SafetyCard
                icon={<ShieldCheck size={17} />}
                color="blue"
                title="Evacuation drill"
                description="Scheduled · 24 Jun"
              />
              <SafetyCard
                icon={<Accessibility size={17} />}
                color="red"
                title="Accessibility review"
                description="2 concerns open"
              />
            </>
          )}
        </section>

        {/* ================= SEARCH + FILTERS ================= */}

        <section className="flex flex-col xl:flex-row gap-2 mb-3">
          <div className="relative flex-1 min-w-0">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search health incidents..."
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-[10px] outline-none focus:border-[#45b99b] transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2">
            <FilterSelect
              value={typeFilter}
              options={["All incident types", ...incidentTypes]}
              onChange={setTypeFilter}
            />

            <FilterSelect
              value={severityFilter}
              options={["All severities", ...severityOptions]}
              onChange={setSeverityFilter}
            />

            <FilterSelect
              value={statusFilter}
              options={["All statuses", ...statusOptions]}
              onChange={setStatusFilter}
            />

            <FilterSelect
              value={dateFilter}
              options={["Date range", "Today", "Last 7 days", "Last 30 days"]}
              onChange={setDateFilter}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition ${
                showFilters
                  ? "border-[#2785b7] text-[#2785b7]"
                  : "border-[#aac4d2]"
              }`}
            >
              <Filter size={13} />
              More filters
            </button>
          </div>
        </section>

        {/* ================= ADVANCED FILTERS ================= */}

        {showFilters && (
          <section className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">
                Advanced incident filters
              </h3>

              <button
                onClick={resetFilters}
                className="text-[10px] text-[#267ca6] font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Reported by"
                placeholder="Search reporter name"
                value={reporterFilter}
                onChange={setReporterFilter}
              />

              <FormInput
                label="Incident location"
                placeholder="Search incident location"
                value={locationFilter}
                onChange={setLocationFilter}
              />
            </div>
          </section>
        )}

        {/* ================= ERROR STATE ================= */}

        {error && (
          <div className="bg-[#fdebed] border border-[#f8bcc2] text-[#c82e3e] px-4 py-3 rounded-xl mb-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadIncidents}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= INCIDENT TABLE ================= */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
          {/* TABLE HEADER */}

          <div className="px-3.5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold">
                Health & safety incidents
              </h2>

              <p className="text-[8px] text-slate-400 mt-1">
                Sensitive information restricted to authorised staff
              </p>
            </div>

            <span className="px-2 py-1 rounded-md bg-[#eaf3f8] text-[#287da7] text-[8px] font-semibold w-fit">
              Authorised access
            </span>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#f5f9fa] border-b border-slate-200">
                <tr className="text-[8px] text-slate-500">
                  <th className="px-3 py-3 font-medium">Incident ID</th>
                  <th className="px-3 py-3 font-medium">Incident Type</th>
                  <th className="px-3 py-3 font-medium">
                    Resident / Location
                  </th>
                  <th className="px-3 py-3 font-medium">Reported By</th>
                  <th className="px-3 py-3 font-medium">Date & Time</th>
                  <th className="px-3 py-3 font-medium">Severity</th>
                  <th className="px-3 py-3 font-medium">Assigned Staff</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td colSpan={9} className="px-3 py-3.5">
                        <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : paginatedIncidents.length > 0 ? (
                  paginatedIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-[8px] transition"
                    >
                      <td className="px-3 py-3.5 font-semibold whitespace-nowrap text-[#1c638a]">
                        {incident.id}
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap font-medium">
                        {incident.type}
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {incident.location}
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {incident.reportedBy}
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {incident.date} · {incident.time}
                      </td>

                      <td className="px-3 py-3.5">
                        <SeverityBadge severity={incident.severity} />
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {incident.assignedStaff}
                      </td>

                      <td className="px-3 py-3.5">
                        <IncidentStatusBadge status={incident.status} />
                      </td>

                      <td className="px-3 py-3.5">
                        <ChevronRight size={13} className="text-slate-400" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-xs text-slate-400"
                    >
                      No incidents found. Try changing your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="px-3.5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              Showing{" "}
              {paginatedIncidents.length > 0
                ? (currentPage - 1) * pageSize + 1
                : 0}
              -
              {Math.min(
                currentPage * pageSize,
                filteredIncidents.length
              )}{" "}
              of {filteredIncidents.length} records
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage <= 1}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-8 rounded-lg border text-[9px] transition ${
                      page === currentPage
                        ? "bg-[#1c638a] text-white border-[#1c638a]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* ================= INCIDENT SUMMARY ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <SummaryCard
            icon={<AlertTriangle size={16} />}
            title="Action required"
            value={
              summary
                ? summary.actionRequired
                : incidents.filter((i) => i.status === "Action Required")
                    .length
            }
            color="red"
          />

          <SummaryCard
            icon={<Clock size={16} />}
            title="Under investigation"
            value={
              summary
                ? summary.underInvestigation
                : incidents.filter((i) => i.status === "Under Investigation")
                    .length
            }
            color="orange"
          />

          <SummaryCard
            icon={<CheckCircle2 size={16} />}
            title="Resolved incidents"
            value={
              summary
                ? summary.resolved
                : incidents.filter((i) => i.status === "Resolved").length
            }
            color="green"
          />
        </section>
      </main>

      {/* ================= REGISTER INCIDENT MODAL ================= */}

      {showRegisterModal && (
        <Modal
          title="Register health & safety incident"
          subtitle="Record an incident for review and follow-up."
          onClose={() => setShowRegisterModal(false)}
        >
          <form onSubmit={handleRegisterIncident} className="space-y-4">
            <FormSelect
              label="Incident type"
              value={newIncident.type}
              options={incidentTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              onChange={(v) => setNewIncident({ ...newIncident, type: v })}
            />

            <FormInput
              label="Resident / Location"
              placeholder="Example: Kitchen Area B"
              value={newIncident.location}
              onChange={(v) =>
                setNewIncident({ ...newIncident, location: v })
              }
            />

            <FormInput
              label="Reported by"
              placeholder="Enter staff name"
              value={newIncident.reportedBy}
              onChange={(v) =>
                setNewIncident({ ...newIncident, reportedBy: v })
              }
            />

            <FormSelect
              label="Severity"
              value={newIncident.severity}
              options={severityOptions.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewIncident({
                  ...newIncident,
                  severity: v as Severity,
                })
              }
            />

            <FormSelect
              label="Assign staff"
              value={newIncident.assignedStaff}
              options={staffMembers.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewIncident({
                  ...newIncident,
                  assignedStaff: v,
                })
              }
            />

            <div>
              <label className="block text-xs font-medium mb-1.5">
                Incident description
              </label>

              <textarea
                required
                rows={3}
                value={newIncident.description}
                onChange={(e) =>
                  setNewIncident({
                    ...newIncident,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the incident and any immediate action taken..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b] resize-none"
              />
            </div>

            <ModalActions
              onCancel={() => setShowRegisterModal(false)}
              submitLabel={
                actionLoading ? "Registering..." : "Register incident"
              }
              submitting={actionLoading}
            />
          </form>
        </Modal>
      )}

      {/* ================= INCIDENT DETAILS PANEL ================= */}

      {selectedIncident && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Incident details</h2>

              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">
              <div className="w-14 h-14 rounded-xl bg-[#eaf3f8] text-[#287da7] flex items-center justify-center">
                <FileWarning size={25} />
              </div>

              <h3 className="text-lg font-semibold mt-4">
                {selectedIncident.type}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {selectedIncident.id}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <SeverityBadge severity={selectedIncident.severity} />
                <IncidentStatusBadge status={selectedIncident.status} />
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <DetailRow
                icon={<MapPin size={15} />}
                label="Resident / Location"
                value={selectedIncident.location}
              />

              <DetailRow
                icon={<UserRound size={15} />}
                label="Reported by"
                value={selectedIncident.reportedBy}
              />

              <DetailRow
                icon={<Clock size={15} />}
                label="Date & Time"
                value={`${selectedIncident.date} · ${selectedIncident.time}`}
              />

              <DetailRow
                icon={<UserRound size={15} />}
                label="Assigned staff"
                value={selectedIncident.assignedStaff}
              />
            </div>

            <div className="mt-7">
              <h3 className="text-xs font-semibold mb-2">
                Incident description
              </h3>

              <p className="bg-[#f5f9fa] rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>

            <div className="mt-7 space-y-4">
              <h3 className="text-xs font-semibold">Update incident</h3>

              <FormSelect
                label="Assigned staff"
                value={selectedIncident.assignedStaff}
                options={staffMembers.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  handleUpdateIncident(selectedIncident.id, {
                    assignedStaff: v,
                  })
                }
              />

              <FormSelect
                label="Severity"
                value={selectedIncident.severity}
                options={severityOptions.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  handleUpdateIncident(selectedIncident.id, {
                    severity: v,
                  })
                }
              />

              <FormSelect
                label="Incident status"
                value={selectedIncident.status}
                options={statusOptions.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  handleUpdateIncident(selectedIncident.id, {
                    status: v,
                  })
                }
              />

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="w-full bg-[#1c638a] text-white py-3 rounded-lg text-xs font-semibold hover:bg-[#144665] transition"
                >
                  Done
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteIncident(selectedIncident.id)}
                  disabled={actionLoading}
                  className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Delete incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}

      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />

          <p className="text-xs">{successMessage}</p>

          <button onClick={() => setSuccessMessage("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= HELPER FUNCTIONS ================= */

function renderSafetyCheckIcon(iconKey: string): ReactNode {
  switch (iconKey) {
    case "Check":
      return <Check size={17} />;
    case "AlertTriangle":
      return <AlertTriangle size={17} />;
    case "ShieldCheck":
      return <ShieldCheck size={17} />;
    case "Accessibility":
      return <Accessibility size={17} />;
    default:
      return <ClipboardCheck size={17} />;
  }
}

function normalizeColor(color?: string): "green" | "orange" | "blue" | "red" {
  const c = color?.toLowerCase();
  if (c === "green" || c === "orange" || c === "blue" || c === "red") {
    return c;
  }
  return "blue";
}

/* ================= REUSABLE COMPONENTS ================= */

function SafetyCard({
  icon,
  color,
  title,
  description,
}: {
  icon: ReactNode;
  color: "green" | "orange" | "blue" | "red";
  title: string;
  description: string;
}) {
  const styles = {
    green: "bg-[#e5f8f1] text-[#37b18d]",
    orange: "bg-[#fff4df] text-[#dc9a24]",
    blue: "bg-[#eaf3f8] text-[#287da7]",
    red: "bg-[#fdebed] text-[#ed5260]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-3 flex items-center gap-3 min-h-[62px]">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold">{title}</p>
        <p className="text-[8px] text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full xl:w-[130px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
      />
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity | string }) {
  const styles: Record<string, string> = {
    Critical: "bg-[#fdebed] text-[#c82e3e]",
    High: "bg-[#fff0df] text-[#c47a1b]",
    Medium: "bg-[#fff5df] text-[#a97a20]",
    Low: "bg-[#eaf3f8] text-[#287da7]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${
        styles[severity] || styles.Low
      }`}
    >
      {severity}
    </span>
  );
}

function IncidentStatusBadge({ status }: { status: IncidentStatus | string }) {
  const styles: Record<string, string> = {
    "Action Required": "bg-[#edf1f3] text-[#4f6979]",
    "Under Investigation": "bg-[#edf1f3] text-[#4f6979]",
    Resolved: "bg-[#e5f8f1] text-[#218d70]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  color: "red" | "orange" | "green";
}) {
  const styles = {
    red: "bg-[#fdebed] text-[#d83d4b]",
    orange: "bg-[#fff4df] text-[#dc9a24]",
    green: "bg-[#e5f8f1] text-[#218d70]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-3 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
  submitting,
}: {
  onCancel: () => void;
  submitLabel: string;
  submitting?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665] disabled:opacity-50 transition"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="text-[#2785b7]">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-slate-400">{label}</p>
        <p className="text-xs font-semibold mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}
