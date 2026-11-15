
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
  Accessibility,
  ClipboardCheck,
  CalendarDays,
  UserRound,
  MapPin,
  Clock,
  CheckCircle2,
  Filter,
  Activity,
  HeartPulse,
  FileWarning,
} from "lucide-react";

/* ================= TYPES ================= */

type Severity = "Critical" | "High" | "Medium" | "Low";

type IncidentStatus =
  | "Action Required"
  | "Under Investigation"
  | "Resolved";

type Incident = {
  id: string;
  type: string;
  location: string;
  reportedBy: string;
  date: string;
  time: string;
  severity: Severity;
  assignedStaff: string;
  status: IncidentStatus;
  description: string;
};

/* ================= SAMPLE DATA ================= */

const initialIncidents: Incident[] = [
  {
    id: "HI-202",
    type: "Medical assistance",
    location: "Resident RES-10831",
    reportedBy: "Nurse M. Rao",
    date: "22 Jun",
    time: "11:42",
    severity: "High",
    assignedStaff: "Dr. M. Rao",
    status: "Action Required",
    description:
      "A resident requires medical assistance and immediate assessment by the medical team.",
  },
  {
    id: "HI-198",
    type: "Sanitation inspection",
    location: "Kitchen Area B",
    reportedBy: "S. Nirosha",
    date: "22 Jun",
    time: "09:15",
    severity: "Medium",
    assignedStaff: "Facilities Team",
    status: "Under Investigation",
    description:
      "A sanitation concern was reported in the kitchen area. Inspection is required.",
  },
  {
    id: "HI-191",
    type: "Accessibility concern",
    location: "Entrance Ramp",
    reportedBy: "A. Perera",
    date: "21 Jun",
    time: "16:20",
    severity: "Low",
    assignedStaff: "Maintenance",
    status: "Resolved",
    description:
      "An accessibility issue was identified near the entrance ramp and referred to maintenance.",
  },
];

const incidentTypes = [
  "Medical assistance",
  "Sanitation inspection",
  "Fire safety",
  "Accessibility concern",
  "Evacuation",
  "Water safety",
  "Food safety",
  "Other",
];

const staffMembers = [
  "Dr. M. Rao",
  "Nurse M. Rao",
  "Facilities Team",
  "Maintenance",
  "Security Team",
  "Shelter Manager",
];

const severityOptions: Severity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const statusOptions: IncidentStatus[] = [
  "Action Required",
  "Under Investigation",
  "Resolved",
];

/* ================= MAIN COMPONENT ================= */

export default function HealthSafetyPage() {
  const [incidents, setIncidents] =
    useState<Incident[]>(initialIncidents);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("All incident types");

  const [severityFilter, setSeverityFilter] =
    useState("All severities");

  const [statusFilter, setStatusFilter] =
    useState("All statuses");

  const [dateFilter, setDateFilter] =
    useState("Date range");

  const [showFilters, setShowFilters] = useState(false);

  const [showRegisterModal, setShowRegisterModal] =
    useState(false);

  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [newIncident, setNewIncident] = useState({
    type: "Medical assistance",
    location: "",
    reportedBy: "",
    severity: "Medium" as Severity,
    assignedStaff: "Nurse M. Rao",
    description: "",
  });

  /* ================= KPI CALCULATIONS ================= */

  const actionRequired = incidents.filter(
    (incident) => incident.status === "Action Required"
  ).length;

  const underInvestigation = incidents.filter(
    (incident) =>
      incident.status === "Under Investigation"
  ).length;

  const resolved = incidents.filter(
    (incident) => incident.status === "Resolved"
  ).length;

  /* ================= FILTERING ================= */

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = [
        incident.id,
        incident.type,
        incident.location,
        incident.reportedBy,
        incident.assignedStaff,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      const matchesType =
        typeFilter === "All incident types" ||
        incident.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All severities" ||
        incident.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        incident.status === statusFilter;

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = incident.date === "22 Jun";
      } else if (dateFilter === "Last 7 days") {
        matchesDate = ["22 Jun", "21 Jun"].includes(
          incident.date
        );
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    incidents,
    search,
    typeFilter,
    severityFilter,
    statusFilter,
    dateFilter,
  ]);

  /* ================= RESET FILTERS ================= */

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All incident types");
    setSeverityFilter("All severities");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
  };

  /* ================= REGISTER INCIDENT ================= */

  const handleRegisterIncident = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const incident: Incident = {
      id: `HI-${Math.max(
        0,
        ...incidents.map(
          (item) => Number(item.id.replace("HI-", "")) || 0
        )
      ) + 1}`,
      type: newIncident.type,
      location: newIncident.location.trim(),
      reportedBy: newIncident.reportedBy.trim(),
      date: "22 Jun",
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      severity: newIncident.severity,
      assignedStaff: newIncident.assignedStaff,
      status: "Action Required",
      description: newIncident.description.trim(),
    };

    setIncidents((prev) => [incident, ...prev]);

    setNewIncident({
      type: "Medical assistance",
      location: "",
      reportedBy: "",
      severity: "Medium",
      assignedStaff: "Nurse M. Rao",
      description: "",
    });

    resetFilters();
    setShowRegisterModal(false);
    setSuccessMessage(
      `Incident ${incident.id} registered successfully.`
    );
  };

  /* ================= UPDATE INCIDENT ================= */

  const updateIncident = (
    id: string,
    changes: Partial<Incident>
  ) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id
          ? { ...incident, ...changes }
          : incident
      )
    );

    setSelectedIncident((prev) =>
      prev && prev.id === id
        ? { ...prev, ...changes }
        : prev
    );

    setSuccessMessage("Incident updated successfully.");
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
          <span className="text-slate-400">
            Shelter Administration
          </span>
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
              Monitor health incidents, safety inspections, sanitation, and evacuation readiness.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 hover:bg-[#144665]"
          >
            <Plus size={14} />
            Register incident
          </button>
        </div>

        {/* ================= SAFETY CHECK CARDS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

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
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-[10px] outline-none focus:border-[#45b99b]"
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
              options={[
                "Date range",
                "Today",
                "Last 7 days",
              ]}
              onChange={setDateFilter}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap ${
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
                className="text-[10px] text-[#267ca6] font-semibold"
              >
                Clear filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <FormInput
                label="Reported by"
                placeholder="Search reporter name"
                value=""
                onChange={(value) => {
                  setSearch(value);
                }}
              />

              <FormInput
                label="Incident location"
                placeholder="Search incident location"
                value=""
                onChange={(value) => {
                  setSearch(value);
                }}
              />
            </div>
          </section>
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
                  <th className="px-3 py-3 font-medium">Resident / Location</th>
                  <th className="px-3 py-3 font-medium">Reported By</th>
                  <th className="px-3 py-3 font-medium">Date & Time</th>
                  <th className="px-3 py-3 font-medium">Severity</th>
                  <th className="px-3 py-3 font-medium">Assigned Staff</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-[8px] transition"
                  >

                    <td className="px-3 py-3.5 font-semibold whitespace-nowrap">
                      {incident.id}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
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
                      <ChevronRight
                        size={13}
                        className="text-slate-400"
                      />
                    </td>
                  </tr>
                ))}

                {filteredIncidents.length === 0 && (
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
              Showing {filteredIncidents.length} records
            </p>

            <div className="flex items-center gap-1">

              <button
                disabled
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] opacity-40"
              >
                Previous
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  disabled={page !== 1}
                  className={`w-7 h-8 rounded-lg border text-[9px] ${
                    page === 1
                      ? "bg-[#1c638a] text-white border-[#1c638a]"
                      : "border-slate-200 opacity-40"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] opacity-40"
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
            value={actionRequired}
            color="red"
          />

          <SummaryCard
            icon={<Clock size={16} />}
            title="Under investigation"
            value={underInvestigation}
            color="orange"
          />

          <SummaryCard
            icon={<CheckCircle2 size={16} />}
            title="Resolved incidents"
            value={resolved}
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
          <form
            onSubmit={handleRegisterIncident}
            className="space-y-4"
          >

            <FormSelect
              label="Incident type"
              value={newIncident.type}
              options={incidentTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              onChange={(v) =>
                setNewIncident({ ...newIncident, type: v })
              }
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
              submitLabel="Register incident"
            />
          </form>
        </Modal>
      )}

      {/* ================= INCIDENT DETAILS PANEL ================= */}

      {selectedIncident && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">

          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Incident details
              </h2>

              <button onClick={() => setSelectedIncident(null)}>
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

              <h3 className="text-xs font-semibold">
                Update incident
              </h3>

              <FormSelect
                label="Assigned staff"
                value={selectedIncident.assignedStaff}
                options={staffMembers.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  updateIncident(selectedIncident.id, {
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
                  updateIncident(selectedIncident.id, {
                    severity: v as Severity,
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
                  updateIncident(selectedIncident.id, {
                    status: v as IncidentStatus,
                  })
                }
              />

              <button
                onClick={() => setSelectedIncident(null)}
                className="w-full bg-[#1c638a] text-white py-3 rounded-lg text-xs font-semibold hover:bg-[#144665]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}

      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">

          <CheckCircle2 size={17} className="shrink-0" />

          <p className="text-xs">{successMessage}</p>

          <button onClick={() => setSuccessMessage("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
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

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles[color]}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold">{title}</p>
        <p className="text-[8px] text-slate-400 mt-1">
          {description}
        </p>
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
        className="w-full xl:w-[120px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: Severity;
}) {
  const styles: Record<Severity, string> = {
    Critical: "bg-[#fdebed] text-[#c82e3e]",
    High: "bg-[#fff0df] text-[#c47a1b]",
    Medium: "bg-[#fff5df] text-[#a97a20]",
    Low: "bg-[#eaf3f8] text-[#287da7]",
  };

  return (
    <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function IncidentStatusBadge({
  status,
}: {
  status: IncidentStatus;
}) {
  const styles: Record<IncidentStatus, string> = {
    "Action Required": "bg-[#edf1f3] text-[#4f6979]",
    "Under Investigation": "bg-[#edf1f3] text-[#4f6979]",
    Resolved: "bg-[#e5f8f1] text-[#218d70]",
  };

  return (
    <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${styles[status]}`}>
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
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles[color]}`}>
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
      <label className="block text-xs font-medium mb-1.5">
        {label}
      </label>

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
      <label className="block text-xs font-medium mb-1.5">
        {label}
      </label>

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
            <p className="text-[10px] text-slate-400 mt-1">
              {subtitle}
            </p>
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
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-3">

      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665]"
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
        <p className="text-xs font-semibold mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
