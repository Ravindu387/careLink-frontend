
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpToLine,
  Users,
  Check,
  Search,
  ChevronRight,
  Filter,
  X,
  Plus,
  Archive,
} from "lucide-react";

interface CrisisEvent {
  id: string;
  name: string;
  type: string;
  severity: string;
  area: string;
  startDate: string;
  status: string;
  requests: string;
  coordinator: string;
}

const initialEvents: CrisisEvent[] = [
  {
    id: "CR-2025-018",
    name: "Monsoon Floods 2025",
    type: "Flood",
    severity: "Major · Level 4",
    area: "Greater Riverton",
    startDate: "18 Jun 2025",
    status: "Active",
    requests: "1,284",
    coordinator: "Amina Mensah",
  },
  {
    id: "CR-2025-014",
    name: "North Ridge Landslide",
    type: "Landslide",
    severity: "Severe · Level 3",
    area: "North District",
    startDate: "12 Jun 2025",
    status: "Monitoring",
    requests: "218",
    coordinator: "Joseph Okafor",
  },
  {
    id: "CR-2025-009",
    name: "Dengue Outbreak",
    type: "Disease",
    severity: "Moderate · Level 2",
    area: "Eastbank",
    startDate: "28 May 2025",
    status: "Active",
    requests: "486",
    coordinator: "Dr. M. Rao",
  },
  {
    id: "CR-2025-004",
    name: "Coastal Storm Response",
    type: "Storm",
    severity: "Low · Level 1",
    area: "West Coast",
    startDate: "14 Apr 2025",
    status: "Resolved",
    requests: "92",
    coordinator: "Nadia Silva",
  },
];

export default function CrisisEvents() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All crisis types");
  const [severityFilter, setSeverityFilter] = useState("All severity levels");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    name: "",
    type: "Flood",
    severity: "Moderate · Level 2",
    area: "",
    startDate: "",
    coordinator: "",
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        `${event.id} ${event.name} ${event.area} ${event.coordinator}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All crisis types" || event.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All severity levels" ||
        event.severity.startsWith(severityFilter);

      const matchesStatus =
        statusFilter === "All statuses" || event.status === statusFilter;

      const matchesDate =
        dateFilter === "Date range" ||
        (dateFilter === "2025" && event.startDate.includes("2025")) ||
        (dateFilter === "June 2025" && event.startDate.includes("Jun 2025"));

      const matchesArchive = showArchived
        ? event.status === "Resolved"
        : event.status !== "Resolved";

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity &&
        matchesStatus &&
        matchesDate &&
        matchesArchive
      );
    });
  }, [events, search, typeFilter, severityFilter, statusFilter, dateFilter, showArchived]);

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const event: CrisisEvent = {
      id: `CR-2025-${String(events.length + 1).padStart(3, "0")}`,
      name: newEvent.name,
      type: newEvent.type,
      severity: newEvent.severity,
      area: newEvent.area,
      startDate: new Date(newEvent.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Active",
      requests: "0",
      coordinator: newEvent.coordinator,
    };

    setEvents((prev) => [event, ...prev]);
    setNewEvent({
      name: "",
      type: "Flood",
      severity: "Moderate · Level 2",
      area: "",
      startDate: "",
      coordinator: "",
    });
    setShowCreateModal(false);
    setShowArchived(false);
  };

  const stats = [
    {
      title: "Active events",
      value: String(events.filter((e) => e.status === "Active" || e.status === "Monitoring").length),
      description: "Across 6 districts",
      icon: AlertTriangle,
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Major severity",
      value: String(events.filter((e) => e.severity.startsWith("Major")).length),
      description: "Level 4 response",
      icon: ArrowUpToLine,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Affected people",
      value: "184K",
      description: "Estimated verified data",
      icon: Users,
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Assigned coordinators",
      value: "12",
      description: "All active events covered",
      icon: Check,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-[#153f5e] sm:text-2xl">
            Crisis Events
          </h1>
          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            Create, monitor, and coordinate active humanitarian emergency operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] font-medium transition ${
              showArchived
                ? "border-sky-700 bg-sky-50 text-sky-800"
                : "border-slate-300 bg-white text-sky-900 hover:bg-slate-50"
            }`}
          >
            <Archive size={13} />
            {showArchived ? "Active events" : "Archived events"}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-3 py-2.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1e668b]"
          >
            <Plus size={14} />
            Create crisis event
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="flex items-center gap-3 rounded-xl border border-[#d6e5ec] bg-white px-4 py-4 shadow-sm"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] text-slate-500">
                  {stat.title}
                </p>
                <h2 className="text-xl font-bold text-[#153f5e]">
                  {stat.value}
                </h2>
                <p className="text-[8px] text-slate-400">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-3 flex flex-col gap-2 lg:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d6e5ec] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crisis name or area..."
            className="w-full bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-[9px] text-slate-700 outline-none"
          >
            <option>All crisis types</option>
            <option>Flood</option>
            <option>Landslide</option>
            <option>Disease</option>
            <option>Storm</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-[9px] text-slate-700 outline-none"
          >
            <option>All severity levels</option>
            <option>Major</option>
            <option>Severe</option>
            <option>Moderate</option>
            <option>Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-[9px] text-slate-700 outline-none"
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>Monitoring</option>
            <option>Resolved</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="min-w-0 rounded-lg border border-[#d6e5ec] bg-white px-2 py-2.5 text-[9px] text-slate-700 outline-none"
          >
            <option>Date range</option>
            <option>2025</option>
            <option>June 2025</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-800 hover:bg-sky-50 sm:col-span-1"
          >
            <Filter size={13} />
            More filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d6e5ec] bg-white p-3">
          <div>
            <p className="text-[10px] font-semibold text-sky-950">
              Advanced filters
            </p>
            <p className="mt-1 text-[9px] text-slate-400">
              Filter the crisis events using the options above.
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("All crisis types");
              setSeverityFilter("All severity levels");
              setStatusFilter("All statuses");
              setDateFilter("Date range");
            }}
            className="text-[9px] font-medium text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#d6e5ec] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d6e5ec] bg-[#f7fafb]">
                {[
                  "Crisis ID",
                  "Crisis Name",
                  "Type",
                  "Severity",
                  "Operational Area",
                  "Start Date",
                  "Status",
                  "Requests",
                  "Coordinator",
                  "",
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-3 py-3 text-[8px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                >
                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] font-semibold text-sky-950">
                    {event.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] font-medium text-sky-900">
                    {event.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {event.type}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {event.severity}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {event.area}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {event.startDate}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                      event.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : event.status === "Monitoring"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {event.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-semibold text-sky-700">
                      {event.requests}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-medium text-sky-800">
                      {event.coordinator}
                    </span>
                  </td>

                  <td className="px-3 py-3.5">
                    <ChevronRight size={15} className="text-slate-500" />
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <Search size={25} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">
                      No crisis events found
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filteredEvents.length} of {events.length} crisis events
          </p>

          <span className="text-[9px] text-slate-400">
            Demonstration data
          </span>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleCreateEvent}
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-sky-950">
                  Create crisis event
                </h2>
                <p className="mt-1 text-[9px] text-slate-500">
                  Register a new humanitarian emergency.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Crisis name
                </span>
                <input
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="Enter crisis name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-sky-500"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Crisis type
                </span>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
                >
                  <option>Flood</option>
                  <option>Landslide</option>
                  <option>Disease</option>
                  <option>Storm</option>
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Severity
                </span>
                <select
                  value={newEvent.severity}
                  onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
                >
                  <option>Major · Level 4</option>
                  <option>Severe · Level 3</option>
                  <option>Moderate · Level 2</option>
                  <option>Low · Level 1</option>
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Operational area
                </span>
                <input
                  required
                  value={newEvent.area}
                  onChange={(e) => setNewEvent({ ...newEvent, area: e.target.value })}
                  placeholder="Enter location"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-sky-500"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Start date
                </span>
                <input
                  required
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-sky-500"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[10px] font-medium text-slate-600">
                  Assigned coordinator
                </span>
                <input
                  required
                  value={newEvent.coordinator}
                  onChange={(e) => setNewEvent({ ...newEvent, coordinator: e.target.value })}
                  placeholder="Coordinator name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-sky-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1e668b]"
              >
                <Plus size={13} />
                Create event
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-sky-950">
                Crisis event details
              </h2>
              <button onClick={() => setSelectedEvent(null)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <p className="text-[9px] font-semibold text-sky-600">
              {selectedEvent.id}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-sky-950">
              {selectedEvent.name}
            </h3>

            <div className="mt-4 space-y-3">
              {[
                ["Type", selectedEvent.type],
                ["Severity", selectedEvent.severity],
                ["Operational area", selectedEvent.area],
                ["Start date", selectedEvent.startDate],
                ["Status", selectedEvent.status],
                ["Requests", selectedEvent.requests],
                ["Coordinator", selectedEvent.coordinator],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <span className="text-right text-[10px] font-medium text-sky-950">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-5 w-full rounded-lg bg-sky-950 py-2.5 text-[10px] font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
