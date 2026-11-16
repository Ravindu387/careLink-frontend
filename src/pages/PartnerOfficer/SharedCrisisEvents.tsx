
import { useMemo, useState } from "react";
import {
  Download,
  Plus,
  AlertTriangle,
  Map,
  Check,
  Search,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";

type Crisis = {
  id: string;
  event: string;
  type: string;
  severity: string;
  area: string;
  date: string;
  sectors: string;
  status: string;
};

const crisisData: Crisis[] = [
  {
    id: "CR-2025-018",
    event: "Monsoon Floods 2025",
    type: "Flood",
    severity: "Level 4 - Major",
    area: "Greater Riverton",
    date: "18 Jun 2025",
    sectors: "Food · WASH · Shelter",
    status: "Active",
  },
  {
    id: "CR-2025-014",
    event: "North Ridge Landslide",
    type: "Landslide",
    severity: "Level 3 - Severe",
    area: "North District",
    date: "12 Jun 2025",
    sectors: "Shelter · Protection",
    status: "Monitoring",
  },
  {
    id: "CR-2025-009",
    event: "Dengue Outbreak",
    type: "Disease",
    severity: "Level 2 - Moderate",
    area: "Eastbank",
    date: "28 May 2025",
    sectors: "Community Health",
    status: "Active",
  },
  {
    id: "CR-2025-004",
    event: "Coastal Storm Response",
    type: "Storm",
    severity: "Level 1 - Low",
    area: "West Coast",
    date: "14 Apr 2025",
    sectors: "Food Assistance",
    status: "Completed",
  },
  {
    id: "CR-2025-021",
    event: "Riverbank Flooding",
    type: "Flood",
    severity: "Level 3 - Severe",
    area: "South District",
    date: "22 Jun 2025",
    sectors: "Food · Shelter",
    status: "Active",
  },
  {
    id: "CR-2025-022",
    event: "Community Health Emergency",
    type: "Disease",
    severity: "Level 2 - Moderate",
    area: "East District",
    date: "25 Jun 2025",
    sectors: "Community Health",
    status: "Monitoring",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const SharedCrisisEvents = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All event types");
  const [severityFilter, setSeverityFilter] = useState("All severity levels");
  const [areaFilter, setAreaFilter] = useState("All operational areas");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCrises = useMemo(() => {
    return crisisData.filter((crisis) => {
      const matchesSearch =
        `${crisis.id} ${crisis.event} ${crisis.area}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Active" && crisis.status === "Active") ||
        (activeTab === "Completed" && crisis.status === "Completed") ||
        (activeTab === "Archived" && crisis.status === "Archived") ||
        (activeTab === "Needs action" && crisis.status === "Monitoring");

      const matchesType =
        typeFilter === "All event types" || crisis.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All severity levels" ||
        crisis.severity === severityFilter;

      const matchesArea =
        areaFilter === "All operational areas" ||
        crisis.area === areaFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        crisis.status === statusFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesType &&
        matchesSeverity &&
        matchesArea &&
        matchesStatus
      );
    });
  }, [activeTab, search, typeFilter, severityFilter, areaFilter, statusFilter]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredCrises.length / pageSize));

  const displayedCrises = filteredCrises.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const exportCSV = () => {
    const headers = [
      "Crisis ID",
      "Event",
      "Type",
      "Severity",
      "Area",
      "Start Date",
      "Sectors",
      "Status",
    ];

    const rows = filteredCrises.map((c) => [
      c.id,
      c.event,
      c.type,
      c.severity,
      c.area,
      c.date,
      c.sectors,
      c.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shared-crisis-events.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Page Heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-slate-800">
              Shared Crisis Events
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Shared Crisis Events
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review authorised crisis information, coordination structures,
            and your organisation's response role.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowRequest(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Request Crisis Access
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<AlertTriangle size={19} />}
          title="Shared events"
          value="4"
          subtitle="3 currently active"
          color="blue"
        />

        <StatCard
          icon={<AlertTriangle size={19} />}
          title="Major response"
          value="1"
          subtitle="Level 4 operation"
          color="red"
        />

        <StatCard
          icon={<Map size={20} />}
          title="Districts covered"
          value="6"
          subtitle="4 active now"
          color="blue"
        />

        <StatCard
          icon={<Check size={20} />}
          title="Coordination sectors"
          value="4"
          subtitle="All leads assigned"
          color="green"
        />

      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`relative whitespace-nowrap pb-4 text-xs transition ${
              activeTab === tab
                ? "font-semibold text-[#267ba4]"
                : "text-slate-500 hover:text-[#267ba4]"
            }`}
          >
            {tab}

            {tab === "All" && (
              <span className="ml-2 rounded-full bg-[#e5eff4] px-2 py-0.5 text-[9px]">
                48
              </span>
            )}

            {tab === "Needs action" && (
              <span className="ml-2 rounded-full bg-[#e5eff4] px-2 py-0.5 text-[9px]">
                7
              </span>
            )}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">

        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search shared crisis events..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All event types</option>
          <option>Flood</option>
          <option>Landslide</option>
          <option>Disease</option>
          <option>Storm</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All severity levels</option>
          <option>Level 4 - Major</option>
          <option>Level 3 - Severe</option>
          <option>Level 2 - Moderate</option>
          <option>Level 1 - Low</option>
        </select>

        <select
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>Greater Riverton</option>
          <option>North District</option>
          <option>Eastbank</option>
          <option>West Coast</option>
          <option>South District</option>
          <option>East District</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Monitoring</option>
          <option>Completed</option>
          <option>Archived</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Filter size={15} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-[#d3e1e8] bg-white p-4">
          <p className="text-xs text-slate-600">
            Filter crisis events using the search and dropdown fields above.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("All event types");
              setSeverityFilter("All severity levels");
              setAreaFilter("All operational areas");
              setStatusFilter("All statuses");
              setActiveTab("All");
              setPage(1);
            }}
            className="text-xs font-medium text-[#267ba4]"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Crisis Events Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">

            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Crisis ID",
                  "Crisis Event",
                  "Type",
                  "Severity",
                  "Operational Area",
                  "Start Date",
                  "Our Sectors",
                  "Status",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayedCrises.map((crisis) => (
                <tr
                  key={crisis.id}
                  onClick={() => setSelectedCrisis(crisis)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-5 font-semibold text-[#153e5b]">
                    {crisis.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-5">
                    {crisis.event}
                  </td>

                  <td className="px-3 py-5">{crisis.type}</td>

                  <td className="whitespace-nowrap px-3 py-5">
                    {crisis.severity}
                  </td>

                  <td className="whitespace-nowrap px-3 py-5">
                    {crisis.area}
                  </td>

                  <td className="whitespace-nowrap px-3 py-5">
                    {crisis.date}
                  </td>

                  <td className="whitespace-nowrap px-3 py-5">
                    {crisis.sectors}
                  </td>

                  <td className="px-3 py-5">
                    <StatusBadge status={crisis.status} />
                  </td>

                  <td className="px-3 py-5">
                    <ChevronRight size={17} className="text-[#64849a]" />
                  </td>
                </tr>
              ))}

              {displayedCrises.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No crisis events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">

          <p className="text-[10px] text-slate-400">
            Showing {filteredCrises.length === 0 ? 0 : (page - 1) * pageSize + 1}
            {"–"}
            {Math.min(page * pageSize, filteredCrises.length)}
            {" "}of {filteredCrises.length} events
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  page === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Crisis Details Modal */}
      {selectedCrisis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#153e5b]">
                Crisis Event Details
              </h2>
              <button onClick={() => setSelectedCrisis(null)}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <p className="text-xs font-semibold text-[#267ba4]">
              {selectedCrisis.id}
            </p>

            <h3 className="mt-2 text-base font-semibold text-[#153e5b]">
              {selectedCrisis.event}
            </h3>

            <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
              <Detail label="Event Type" value={selectedCrisis.type} />
              <Detail label="Severity" value={selectedCrisis.severity} />
              <Detail label="Operational Area" value={selectedCrisis.area} />
              <Detail label="Start Date" value={selectedCrisis.date} />
              <Detail label="Our Sectors" value={selectedCrisis.sectors} />
              <Detail label="Status" value={selectedCrisis.status} />
            </div>

            <button
              onClick={() => setSelectedCrisis(null)}
              className="mt-6 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Request Crisis Access Modal */}
      {showRequest && (
        <RequestAccessModal onClose={() => setShowRequest(false)} />
      )}

    </div>
  );
};

// Statistics Card
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    red: "bg-[#fdebed] text-red-500",
    green: "bg-[#e5f6f0] text-[#299b7d]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-[9px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-[#e3f5f0] text-[#26977c]",
    Monitoring: "bg-[#edf2f5] text-[#617d90]",
    Completed: "bg-[#e3f5f0] text-[#26977c]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || styles.Archived}`}>
      {status}
    </span>
  );
}

// Detail Item
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Request Access Modal
function RequestAccessModal({ onClose }: { onClose: () => void }) {
  const [eventName, setEventName] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName || !reason) return;

    alert("Request submitted successfully! (Demo only)");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#153e5b]">
            Request Crisis Access
          </h2>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <label className="mb-2 block text-xs font-medium text-slate-600">
          Crisis Event
        </label>

        <input
          required
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Enter crisis event name"
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
        />

        <label className="mb-2 block text-xs font-medium text-slate-600">
          Reason for Access
        </label>

        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why your organisation needs access..."
          rows={4}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#267ba4] px-4 py-2 text-xs font-medium text-white"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default SharedCrisisEvents;
