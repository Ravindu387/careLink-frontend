
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  Lock,
} from "lucide-react";

interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  record: string;
  previous: string;
  current: string;
  rationale: string;
  type: string;
}

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-482194",
    action: "AI priority approved",
    actor: "Amina Mensah",
    timestamp: "22 Jun · 13:51",
    record: "REQ-2841",
    previous: "Critical",
    current: "Critical",
    rationale: "Evidence and vulnerability confirmed",
    type: "AI Decision",
  },
  {
    id: "AUD-482188",
    action: "Resource dispatch approved",
    actor: "Amina Mensah",
    timestamp: "22 Jun · 13:28",
    record: "DEP-104",
    previous: "Pending",
    current: "Dispatched",
    rationale: "Critical water shortage",
    type: "Resource",
  },
  {
    id: "AUD-482174",
    action: "Case escalated",
    actor: "Joseph Okafor",
    timestamp: "22 Jun · 12:52",
    record: "REQ-2821",
    previous: "High",
    current: "Critical",
    rationale: "Immediate life risk",
    type: "Assistance Request",
  },
  {
    id: "AUD-482161",
    action: "Shelter status changed",
    actor: "Sanjana A.",
    timestamp: "22 Jun · 12:10",
    record: "SH-003",
    previous: "Near Capacity",
    current: "Full",
    rationale: "Capacity reached",
    type: "Shelter",
  },
  {
    id: "AUD-482155",
    action: "Request verified",
    actor: "Medical Team 3",
    timestamp: "22 Jun · 11:45",
    record: "REQ-2839",
    previous: "Unverified",
    current: "Verified",
    rationale: "Contact verification completed",
    type: "Assistance Request",
  },
  {
    id: "AUD-482142",
    action: "Partner organisation approved",
    actor: "Amina Mensah",
    timestamp: "22 Jun · 11:20",
    record: "ORG-014",
    previous: "Pending",
    current: "Approved",
    rationale: "Organisation documents verified",
    type: "Partner",
  },
  {
    id: "AUD-482130",
    action: "AI recommendation modified",
    actor: "Joseph Okafor",
    timestamp: "22 Jun · 10:55",
    record: "AI-9032",
    previous: "High",
    current: "Medium",
    rationale: "Additional evidence reviewed",
    type: "AI Decision",
  },
  {
    id: "AUD-482119",
    action: "Resource allocation updated",
    actor: "Sanjana A.",
    timestamp: "22 Jun · 10:30",
    record: "RES-102",
    previous: "Reserved",
    current: "Allocated",
    rationale: "Emergency supply requirement",
    type: "Resource",
  },
];

const recordTypes = [
  "AI Decision",
  "Resource",
  "Assistance Request",
  "Shelter",
  "Partner",
];

const badgeStyle = (value: string) => {
  const v = value.toLowerCase();

  if (v.includes("critical") || v.includes("full"))
    return "bg-red-50 text-red-700";

  if (v.includes("high") || v.includes("capacity"))
    return "bg-amber-50 text-amber-700";

  if (
    v.includes("dispatched") ||
    v.includes("verified") ||
    v.includes("approved") ||
    v.includes("allocated")
  )
    return "bg-emerald-50 text-emerald-700";

  return "bg-sky-50 text-sky-700";
};

export default function AuditTimeline() {
  const [events] = useState<AuditEvent[]>(initialEvents);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [userFilter, setUserFilter] = useState("All users");
  const [typeFilter, setTypeFilter] = useState("All record types");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [showFilters, setShowFilters] = useState(false);
  const [showRetention, setShowRetention] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<AuditEvent | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 4;

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const text = [
        event.id,
        event.action,
        event.actor,
        event.record,
        event.rationale,
      ].join(" ").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesAction =
        actionFilter === "All action types" ||
        event.action.toLowerCase().includes(actionFilter.toLowerCase());

      const matchesUser =
        userFilter === "All users" || event.actor === userFilter;

      const matchesType =
        typeFilter === "All record types" ||
        event.type === typeFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesUser &&
        matchesType
      );
    });
  }, [events, search, actionFilter, userFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / pageSize)
  );

  const currentEvents = filteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const exportCSV = () => {
    const headers = [
      "Event ID",
      "Action",
      "Actor",
      "Timestamp",
      "Record",
      "Previous Value",
      "New Value",
      "Rationale",
      "Record Type",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.action,
      event.actor,
      event.timestamp,
      event.record,
      event.previous,
      event.current,
      event.rationale,
      event.type,
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
    link.download = "audit-timeline.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("All action types");
    setUserFilter("All users");
    setTypeFilter("All record types");
    setDateFilter("Date range");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Audit Timeline
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Review read-only operational decisions, changes,
            AI recommendations, and human rationale.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => setShowRetention(true)}
            className="rounded-lg border border-[#c4d7e1] bg-white px-4 py-2.5 text-xs font-medium text-[#175477] hover:bg-sky-50"
          >
            Retention policy
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            <Download size={15} />
            Export
          </button>

        </div>
      </div>

      {/* Read only notice */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] border-l-[3px] border-l-[#668493] bg-[#f6f9fa] px-4 py-3">

        <div className="flex items-center gap-3">

          <ShieldCheck
            size={20}
            className="shrink-0 text-[#54778b]"
          />

          <div>
            <p className="text-xs font-semibold text-[#153f5e]">
              Read-only accountability records
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Operational audit events cannot be edited or deleted
              through this workspace.
            </p>
          </div>

        </div>

        <span className="text-[10px] text-slate-500">
          Retention: 7 years
        </span>

      </div>

      {/* Filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_auto_auto_auto_auto]">

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">

          <Search size={15} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search event, user, record, or rationale..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />

        </div>

        {/* Action filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>All action types</option>
          <option>approved</option>
          <option>changed</option>
          <option>escalated</option>
          <option>verified</option>
          <option>updated</option>
        </select>

        {/* User filter */}
        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>All users</option>
          <option>Amina Mensah</option>
          <option>Joseph Okafor</option>
          <option>Sanjana A.</option>
          <option>Medical Team 3</option>
        </select>

        {/* Record type */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>All record types</option>

          {recordTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        {/* Date range */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>Date range</option>
          <option>Today</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>

      </div>

      {/* More filters */}
      <div className="mb-3 flex justify-end">

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-[#c4d7e1] bg-white px-4 py-2.5 text-xs font-medium text-[#175477] hover:bg-sky-50"
        >
          <Filter size={14} />
          More filters
          <ChevronDown size={14} />
        </button>

      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] bg-white p-4">

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Lock size={15} className="text-[#287da5]" />
            Advanced audit filters
          </div>

          <button
            onClick={resetFilters}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            Clear all filters
          </button>

        </div>
      )}

      {/* Audit table */}
      <div className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead>
              <tr className="border-b border-[#d5e2e9] bg-[#f5f8f9]">

                {[
                  "Event ID",
                  "Action",
                  "Actor",
                  "Timestamp",
                  "Record",
                  "Previous → New",
                  "Rationale",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-3 text-[10px] font-semibold text-[#49647a]"
                  >
                    {heading}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {currentEvents.map((event) => (

                <tr
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="cursor-pointer border-b border-[#e6edf1] transition hover:bg-[#f0f6f8]"
                >

                  <td className="whitespace-nowrap px-3 py-4 text-[10px] font-bold text-[#153f5e]">
                    {event.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#49647a]">
                    {event.action}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#49647a]">
                    {event.actor}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#49647a]">
                    {event.timestamp}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#49647a]">
                    {event.record}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">

                    <div className="flex items-center gap-1.5">

                      <span className={`rounded-md px-2 py-1.5 text-[9px] font-semibold ${badgeStyle(event.previous)}`}>
                        {event.previous}
                      </span>

                      <span className="text-slate-400">→</span>

                      <span className={`rounded-md px-2 py-1.5 text-[9px] font-semibold ${badgeStyle(event.current)}`}>
                        {event.current}
                      </span>

                    </div>

                  </td>

                  <td className="px-3 py-4">

                    <span className="inline-block max-w-[180px] truncate rounded-md bg-[#e8f2f8] px-2 py-1.5 text-[9px] font-medium text-[#286d91]">
                      {event.rationale}
                    </span>

                  </td>

                  <td className="px-3 py-4">

                    <ChevronRight
                      size={17}
                      className="text-slate-400"
                    />

                  </td>

                </tr>

              ))}

              {currentEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">

                    <Search
                      size={28}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No audit records found
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

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6edf1] px-4 py-3">

          <p className="text-[10px] text-slate-500">
            Showing {filteredEvents.length === 0 ? 0 : (page - 1) * pageSize + 1}
            –{Math.min(page * pageSize, filteredEvents.length)} of {filteredEvents.length.toLocaleString()} records
          </p>

          <div className="flex items-center gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d5e2e9] px-3 py-2 text-[10px] text-[#287da5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((number) => (

              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-8 min-w-8 rounded-lg border text-[10px] ${
                  page === number
                    ? "border-[#287da5] bg-[#287da5] text-white"
                    : "border-[#d5e2e9] bg-white text-[#175477]"
                }`}
              >
                {number}
              </button>

            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d5e2e9] px-3 py-2 text-[10px] text-[#287da5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* Event details modal */}
      {selectedEvent && (
        <Modal
          title="Audit event details"
          onClose={() => setSelectedEvent(null)}
        >

          <div className="mb-4 rounded-lg bg-[#f0f6f8] p-4">

            <div className="flex items-center gap-2 text-[#287da5]">
              <ShieldCheck size={20} />
              <span className="text-xs font-semibold">
                Verified audit record
              </span>
            </div>

            <h3 className="mt-3 text-lg font-semibold text-[#153f5e]">
              {selectedEvent.id}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {selectedEvent.action}
            </p>

          </div>

          <div className="space-y-4">

            <Detail label="Actor" value={selectedEvent.actor} />

            <Detail label="Timestamp" value={selectedEvent.timestamp} />

            <Detail label="Record ID" value={selectedEvent.record} />

            <Detail label="Record type" value={selectedEvent.type} />

            <Detail label="Previous value" value={selectedEvent.previous} />

            <Detail label="New value" value={selectedEvent.current} />

            <Detail label="Rationale" value={selectedEvent.rationale} />

          </div>

          <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-[#f6f9fa] p-3">

            <Lock size={16} className="text-[#54778b]" />

            <p className="text-[10px] text-slate-500">
              This audit record is read-only and cannot be modified.
            </p>

          </div>

        </Modal>
      )}

      {/* Retention policy modal */}
      {showRetention && (
        <Modal
          title="Audit retention policy"
          onClose={() => setShowRetention(false)}
        >

          <div className="mb-4 rounded-lg bg-[#e8f2f8] p-4">

            <div className="flex items-center gap-2 text-[#287da5]">
              <ShieldCheck size={22} />
              <span className="text-xs font-semibold">
                Accountability and data retention
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold text-[#153f5e]">
              7 Years
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Configured audit record retention period.
            </p>

          </div>

          <div className="space-y-4">

            <Detail
              label="Record storage"
              value="Secure audit archive"
            />

            <Detail
              label="Record modification"
              value="Not permitted"
            />

            <Detail
              label="Record deletion"
              value="Restricted"
            />

            <Detail
              label="Access"
              value="Authorised personnel"
            />

          </div>

          <p className="mt-5 text-[10px] leading-relaxed text-slate-500">
            These are demonstration policy details. Actual retention
            rules must be configured according to the organisation's
            approved data governance policy.
          </p>

        </Modal>
      )}

    </div>
  );
}

// Modal
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-base font-semibold text-[#153f5e]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>

        </div>

        {children}

      </div>

    </div>
  );
}

// Details row
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-3">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-xs font-medium text-[#153f5e]">
        {value}
      </span>

    </div>
  );
}
