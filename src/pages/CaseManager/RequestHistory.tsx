import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  X,
  Clock,
  ShieldCheck,
  CalendarDays,
  History,
  FileText,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface HistoryEvent {
  id: string;
  caseId: string;
  action: string;
  actor: string;
  change: string;
  rationale: string;
  timestamp: string;
  eventType: string;
}

// ==========================================
// DEMO DATA
// ==========================================

const initialEvents: HistoryEvent[] = [
  {
    id: "EVT-4821",
    caseId: "REQ-2841",
    action: "Priority recommendation reviewed",
    actor: "Amina Mensah",
    change: "Critical → Critical",
    rationale: "AI rationale approved",
    timestamp: "22 Jun · 13:42",
    eventType: "Decision",
  },
  {
    id: "EVT-4818",
    caseId: "REQ-2839",
    action: "Case assigned",
    actor: "System Queue",
    change: "Unassigned → Medical Team 3",
    rationale: "Skills and proximity",
    timestamp: "22 Jun · 13:28",
    eventType: "Assignment",
  },
  {
    id: "EVT-4811",
    caseId: "REQ-2828",
    action: "Additional information received",
    actor: "Citizen Portal",
    change: "Pending → Verified",
    rationale: "Contact confirmed",
    timestamp: "22 Jun · 12:55",
    eventType: "Verification",
  },
  {
    id: "EVT-4804",
    caseId: "REQ-2821",
    action: "Case escalated",
    actor: "Nadia Okafor",
    change: "High → Critical",
    rationale: "Immediate life risk",
    timestamp: "22 Jun · 12:31",
    eventType: "Escalation",
  },
  {
    id: "EVT-4798",
    caseId: "REQ-2814",
    action: "Information requested",
    actor: "You",
    change: "Under Review → Pending Info",
    rationale: "Prescription required",
    timestamp: "22 Jun · 11:58",
    eventType: "Information",
  },
  {
    id: "EVT-4792",
    caseId: "REQ-2809",
    action: "Evidence verified",
    actor: "Amina Mensah",
    change: "Pending → Verified",
    rationale: "Documents approved",
    timestamp: "22 Jun · 11:30",
    eventType: "Verification",
  },
  {
    id: "EVT-4786",
    caseId: "REQ-2798",
    action: "Case created",
    actor: "Citizen Portal",
    change: "New → Submitted",
    rationale: "Citizen assistance request",
    timestamp: "22 Jun · 10:45",
    eventType: "Creation",
  },
  {
    id: "EVT-4779",
    caseId: "REQ-2789",
    action: "Case status updated",
    actor: "Case Manager",
    change: "Submitted → Under Review",
    rationale: "Initial assessment completed",
    timestamp: "22 Jun · 10:12",
    eventType: "Status Change",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const RequestHistory: React.FC = () => {

  const [events] = useState<HistoryEvent[]>(initialEvents);

  const [searchTerm, setSearchTerm] = useState("");

  const [eventTypeFilter, setEventTypeFilter] =
    useState("All event types");

  const [actorFilter, setActorFilter] =
    useState("All actors");

  const [caseFilter, setCaseFilter] =
    useState("All cases");

  const [dateFilter, setDateFilter] =
    useState("Date range");

  const [showFilters, setShowFilters] = useState(false);

  const [showRetentionPolicy, setShowRetentionPolicy] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<HistoryEvent | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // ==========================================
  // FILTER EVENTS
  // ==========================================

  const filteredEvents = useMemo(() => {

    return events.filter((event) => {

      const search = searchTerm.toLowerCase();

      const searchMatch =
        event.id.toLowerCase().includes(search) ||
        event.caseId.toLowerCase().includes(search) ||
        event.action.toLowerCase().includes(search) ||
        event.actor.toLowerCase().includes(search) ||
        event.rationale.toLowerCase().includes(search) ||
        event.change.toLowerCase().includes(search);

      const eventMatch =
        eventTypeFilter === "All event types" ||
        event.eventType === eventTypeFilter;

      const actorMatch =
        actorFilter === "All actors" ||
        event.actor === actorFilter;

      const caseMatch =
        caseFilter === "All cases" ||
        event.caseId === caseFilter;

      const dateMatch =
        dateFilter === "Date range" ||
        dateFilter === "All time" ||
        (dateFilter === "Today" &&
          event.timestamp.includes("22 Jun"));

      return (
        searchMatch &&
        eventMatch &&
        actorMatch &&
        caseMatch &&
        dateMatch
      );

    });

  }, [
    events,
    searchTerm,
    eventTypeFilter,
    actorFilter,
    caseFilter,
    dateFilter,
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / itemsPerPage)
  );

  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {

    setSearchTerm("");
    setEventTypeFilter("All event types");
    setActorFilter("All actors");
    setCaseFilter("All cases");
    setDateFilter("Date range");
    setCurrentPage(1);

  };

  // ==========================================
  // EXPORT CSV
  // ==========================================

  const handleExport = () => {

    const headers = [
      "Event ID",
      "Case ID",
      "Action",
      "Actor",
      "Change",
      "Rationale",
      "Timestamp",
      "Event Type",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.caseId,
      event.action,
      event.actor,
      event.change,
      event.rationale,
      event.timestamp,
      event.eventType,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "request-history.csv";
    link.click();

    URL.revokeObjectURL(url);

  };

  // ==========================================
  // EVENT TYPE STYLE
  // ==========================================

  const getEventStyle = (type: string) => {

    switch (type) {

      case "Decision":
        return "bg-purple-50 text-purple-700";

      case "Assignment":
        return "bg-blue-50 text-blue-700";

      case "Verification":
        return "bg-emerald-50 text-emerald-700";

      case "Escalation":
        return "bg-red-50 text-red-700";

      case "Information":
        return "bg-amber-50 text-amber-700";

      case "Creation":
        return "bg-sky-50 text-sky-700";

      default:
        return "bg-slate-100 text-slate-600";

    }

  };

  // ==========================================
  // JSX
  // ==========================================

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">



      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-9">

        {/* BREADCRUMB */}

        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">

          <span>Operations</span>

          <ChevronRight size={13} />

          <span>Case Management</span>

          <ChevronRight size={13} />

          <span className="font-semibold text-slate-800">
            Request History
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Request History
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review read-only case events, decisions, assignments, and rationale.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              onClick={() => setShowRetentionPolicy(true)}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-xs font-medium text-[#287da8] transition hover:bg-sky-50"
            >
              Retention policy
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#17678f]"
            >

              <Download size={17} />

              Export

            </button>

          </div>

        </div>

        {/* =====================================
            READ ONLY NOTICE
        ===================================== */}

        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-[#d5e2eb] border-l-[4px] border-l-[#718b9a] bg-[#f5f8fa] px-4 py-4">

          <div className="flex items-center gap-3">

            <Clock
              size={21}
              className="shrink-0 text-[#587487]"
            />

            <div>

              <p className="text-xs font-bold text-[#35566e]">
                Read-only operational record
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Case history events cannot be edited or deleted through this workspace.
              </p>

            </div>

          </div>

          <span className="hidden whitespace-nowrap text-[10px] text-slate-500 sm:block">
            Retention: 7 years
          </span>

        </div>

        {/* =====================================
            SEARCH AND FILTERS
        ===================================== */}

        <section className="mb-4 flex flex-wrap items-center gap-2">

          {/* SEARCH */}

          <div className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3">

            <Search size={19} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search event, case, user, or rationale..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />

            {searchTerm && (

              <button onClick={() => setSearchTerm("")}>
                <X size={15} className="text-slate-400" />
              </button>

            )}

          </div>

          {/* EVENT TYPE */}

          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All event types</option>
            <option>Decision</option>
            <option>Assignment</option>
            <option>Verification</option>
            <option>Escalation</option>
            <option>Information</option>
            <option>Creation</option>
            <option>Status Change</option>

          </select>

          {/* ACTOR */}

          <select
            value={actorFilter}
            onChange={(e) => {
              setActorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All actors</option>
            <option>Amina Mensah</option>
            <option>System Queue</option>
            <option>Citizen Portal</option>
            <option>Nadia Okafor</option>
            <option>You</option>
            <option>Case Manager</option>

          </select>

          {/* CASE FILTER */}

          <select
            value={caseFilter}
            onChange={(e) => {
              setCaseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All cases</option>

            {events.map((event) => (

              <option key={event.caseId}>
                {event.caseId}
              </option>

            ))}

          </select>

          {/* DATE FILTER */}

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>Date range</option>
            <option>Today</option>
            <option>All time</option>

          </select>

          {/* MORE FILTERS */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-xs font-semibold text-[#287da8] hover:bg-sky-50"
          >

            <Filter size={17} />

            More filters

          </button>

        </section>

        {/* =====================================
            ADVANCED FILTERS
        ===================================== */}

        {showFilters && (

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Advanced filters
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Filter operational records by event type, actor and case.
              </p>

            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-sky-700 hover:underline"
            >
              Clear all filters
            </button>

          </div>

        )}

        {/* =====================================
            HISTORY TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] text-left">

              {/* TABLE HEADER */}

              <thead className="bg-[#f7f9fa]">

                <tr className="border-b border-[#d5e2eb] text-[11px] font-semibold text-slate-500">

                  <th className="px-3 py-4">
                    Event ID
                  </th>

                  <th className="px-3 py-4">
                    Case ID
                  </th>

                  <th className="px-3 py-4">
                    Action
                  </th>

                  <th className="px-3 py-4">
                    Actor
                  </th>

                  <th className="px-3 py-4">
                    Change
                  </th>

                  <th className="px-3 py-4">
                    Rationale
                  </th>

                  <th className="px-3 py-4">
                    Timestamp
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {currentEvents.length > 0 ? (

                  currentEvents.map((event) => (

                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="cursor-pointer border-b border-[#e5edf2] transition hover:bg-[#f8fbfd]"
                    >

                      {/* EVENT ID */}

                      <td className="whitespace-nowrap px-3 py-4">

                        <span className="text-[11px] font-bold text-[#173e5b]">
                          {event.id}
                        </span>

                      </td>

                      {/* CASE ID */}

                      <td className="whitespace-nowrap px-3 py-4">

                        <span className="text-[11px] font-bold text-[#173e5b]">
                          {event.caseId}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-3 py-4">

                        <p className="whitespace-nowrap text-[11px] text-slate-600">
                          {event.action}
                        </p>

                      </td>

                      {/* ACTOR */}

                      <td className="whitespace-nowrap px-3 py-4">

                        <span className="text-[11px] text-slate-600">
                          {event.actor}
                        </span>

                      </td>

                      {/* CHANGE */}

                      <td className="whitespace-nowrap px-3 py-4">

                        <span className="text-[11px] text-slate-600">
                          {event.change}
                        </span>

                      </td>

                      {/* RATIONALE */}

                      <td className="whitespace-nowrap px-3 py-4">

                        <span className="text-[11px] text-slate-600">
                          {event.rationale}
                        </span>

                      </td>

                      {/* TIMESTAMP */}

                      <td className="whitespace-nowrap px-3 py-4">

                        <span className="text-[11px] text-slate-600">
                          {event.timestamp}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={7}
                      className="py-16 text-center"
                    >

                      <FileText
                        size={35}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-600">
                        No history records found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filters.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =====================================
              PAGINATION
          ===================================== */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5edf2] px-5 py-4">

            <p className="text-xs text-slate-400">

              Showing{" "}

              {filteredEvents.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}

              –

              {Math.min(
                currentPage * itemsPerPage,
                filteredEvents.length
              )}

              {" "}of {filteredEvents.length === 0
                ? 0
                : "48,214"}

            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-4 py-2.5 text-xs text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ChevronLeft size={14} />

                Previous

              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg border text-xs transition ${
                    currentPage === page
                      ? "border-[#287da8] bg-[#287da8] font-semibold text-white"
                      : "border-[#d5e2eb] bg-white text-slate-600 hover:bg-sky-50"
                  }`}
                >
                  {page}
                </button>

              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(totalPages, previous + 1)
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-4 py-2.5 text-xs font-medium text-[#287da8] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                Next

                <ChevronRight size={14} />

              </button>

            </div>

          </div>

        </div>

      </main>

      {/* =====================================
          EVENT DETAILS MODAL
      ===================================== */}

      {selectedEvent && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <History
                    size={21}
                    className="text-sky-700"
                  />

                  <h2 className="text-lg font-semibold text-[#173e5b]">
                    Event Details
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedEvent.id}
                </p>

              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="mb-5 rounded-lg bg-sky-50 p-4">

              <p className="text-xs text-sky-600">
                Event type
              </p>

              <span
                className={`mt-2 inline-block rounded-md px-3 py-1.5 text-xs font-semibold ${getEventStyle(
                  selectedEvent.eventType
                )}`}
              >
                {selectedEvent.eventType}
              </span>

            </div>

            <div className="space-y-4">

              {[
                ["Event ID", selectedEvent.id],
                ["Case ID", selectedEvent.caseId],
                ["Action", selectedEvent.action],
                ["Actor", selectedEvent.actor],
                ["Change", selectedEvent.change],
                ["Rationale", selectedEvent.rationale],
                ["Timestamp", selectedEvent.timestamp],
              ].map(([label, value]) => (

                <div
                  key={label}
                  className="border-b border-slate-100 pb-3"
                >

                  <p className="text-[10px] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {value}
                  </p>

                </div>

              ))}

            </div>

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-3">

              <ShieldCheck
                size={17}
                className="text-emerald-600"
              />

              <p className="text-[10px] text-slate-500">
                This is a read-only historical record.
              </p>

            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-5 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white hover:bg-[#17678f]"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* =====================================
          RETENTION POLICY MODAL
      ===================================== */}

      {showRetentionPolicy && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={22}
                  className="text-sky-700"
                />

                <h2 className="text-lg font-semibold text-[#173e5b]">
                  Retention Policy
                </h2>

              </div>

              <button
                onClick={() => setShowRetentionPolicy(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-4">

              <div className="rounded-lg bg-sky-50 p-4">

                <div className="flex items-center gap-2">

                  <CalendarDays
                    size={19}
                    className="text-sky-700"
                  />

                  <p className="text-sm font-semibold text-sky-800">
                    Record Retention: 7 Years
                  </p>

                </div>

                <p className="mt-2 text-xs leading-5 text-sky-700">
                  Operational history records are retained for seven
                  years according to the configured demonstration policy.
                </p>

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Historical Record Protection
                </p>

                <ul className="mt-3 space-y-3 text-xs text-slate-500">

                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    Records cannot be edited through this workspace.
                  </li>

                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    Records cannot be deleted by ordinary users.
                  </li>

                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    Event timestamps and actor information are preserved.
                  </li>

                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                    Historical events are available for audit purposes.
                  </li>

                </ul>

              </div>

              <p className="text-[10px] leading-5 text-slate-400">
                Note: The seven-year period is a demonstration setting.
                Actual retention rules should follow the organisation's
                approved data retention policy.
              </p>

            </div>

            <button
              onClick={() => setShowRetentionPolicy(false)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white hover:bg-[#17678f]"
            >
              Close policy
            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default RequestHistory;