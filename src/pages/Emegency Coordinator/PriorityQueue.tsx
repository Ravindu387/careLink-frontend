
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  Plus,
  X,
  AlertTriangle,
} from "lucide-react";

interface Request {
  id: string;
  category: string;
  location: string;
  reported: string;
  priority: string;
  verification: string;
  assigned: string;
  age: string;
  status: string;
  overdue: boolean;
}

const initialData: Request[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    location: "Riverside, North Ward",
    reported: "12 min ago",
    priority: "Critical · 94%",
    verification: "Evidence pending",
    assigned: "Unassigned",
    age: "18 min",
    status: "Under Review",
    overdue: true,
  },
  {
    id: "REQ-2839",
    category: "Medical supplies",
    location: "Old Town, Sector 4",
    reported: "26 min ago",
    priority: "High · 91%",
    verification: "Verified",
    assigned: "Medical Team 3",
    age: "34 min",
    status: "Assigned",
    overdue: false,
  },
  {
    id: "REQ-2836",
    category: "Food & water",
    location: "Eastbank, Sector 2",
    reported: "41 min ago",
    priority: "High · 87%",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
    overdue: false,
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
    location: "North Ward",
    reported: "1 hr ago",
    priority: "Critical · 96%",
    verification: "Verified",
    assigned: "Rescue Unit 2",
    age: "1h 34m",
    status: "Escalated",
    overdue: true,
  },
  {
    id: "REQ-2828",
    category: "Accessible transport",
    location: "Central Ward",
    reported: "1 hr ago",
    priority: "Medium · 82%",
    verification: "Verified",
    assigned: "Mobility Team",
    age: "1h 12m",
    status: "In Progress",
    overdue: false,
  },
  {
    id: "REQ-2819",
    category: "Medical supplies",
    location: "West District",
    reported: "2 hrs ago",
    priority: "High · 89%",
    verification: "Verified",
    assigned: "Medical Team 2",
    age: "2h 10m",
    status: "Assigned",
    overdue: false,
  },
  {
    id: "REQ-2815",
    category: "Food & water",
    location: "Eastbank",
    reported: "3 hrs ago",
    priority: "High · 85%",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "3h 20m",
    status: "Submitted",
    overdue: true,
  },
  {
    id: "REQ-2808",
    category: "Emergency shelter",
    location: "Central Ward",
    reported: "4 hrs ago",
    priority: "Medium · 72%",
    verification: "Verified",
    assigned: "Shelter Team 1",
    age: "4h 15m",
    status: "Completed",
    overdue: false,
  },
];

const tabs = [
  { name: "All requests", count: "1,284" },
  { name: "Unassigned", count: "63" },
  { name: "Overdue", count: "12" },
  { name: "Potential duplicates", count: "9" },
];

export default function PriorityQueue() {
  const [requests, setRequests] = useState(initialData);
  const [activeTab, setActiveTab] = useState("All requests");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [organisation, setOrganisation] = useState("All organisations");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [selected, setSelected] = useState<Request | null>(null);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    category: "Emergency shelter",
    location: "",
    priority: "Critical · 94%",
    assigned: "Unassigned",
  });

  const pageSize = 5;

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch = [
        item.id,
        item.category,
        item.location,
        item.assigned,
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priority === "All priorities" ||
        item.priority.startsWith(priority);

      const matchesCategory =
        category === "All categories" ||
        item.category === category;

      const matchesStatus =
        status === "All statuses" ||
        item.status === status;

      const matchesOrganisation =
        organisation === "All organisations" ||
        (organisation === "Unassigned" && item.assigned === "Unassigned") ||
        (organisation === "Medical Teams" && item.assigned.includes("Medical")) ||
        (organisation === "Rescue Teams" && item.assigned.includes("Rescue"));

      const matchesTab =
        activeTab === "All requests" ||
        (activeTab === "Unassigned" && item.assigned === "Unassigned") ||
        (activeTab === "Overdue" && item.overdue) ||
        (activeTab === "Potential duplicates" && item.id === "REQ-2836");

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCategory &&
        matchesStatus &&
        matchesOrganisation &&
        matchesTab
      );
    });
  }, [requests, search, priority, category, status, organisation, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const visibleRequests = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const clearFilters = () => {
    setSearch("");
    setPriority("All priorities");
    setCategory("All categories");
    setStatus("All statuses");
    setOrganisation("All organisations");
    setActiveTab("All requests");
    setPage(1);
  };

  const exportCSV = () => {
    const headers = [
      "Request ID",
      "Category",
      "Location",
      "Priority",
      "Verification",
      "Assigned",
      "Age",
      "Status",
    ];

    const rows = filtered.map((r) => [
      r.id,
      r.category,
      r.location,
      r.priority,
      r.verification,
      r.assigned,
      r.age,
      r.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "priority-queue.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const createRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newItem: Request = {
      id: `REQ-${2842 + requests.length - initialData.length}`,
      category: form.category,
      location: form.location,
      reported: "Just now",
      priority: form.priority,
      verification: "Pending verification",
      assigned: form.assigned,
      age: "Just now",
      status: "Submitted",
      overdue: false,
    };

    setRequests((prev) => [newItem, ...prev]);
    setActiveTab("All requests");
    setPage(1);
    setShowCreate(false);

    setForm({
      category: "Emergency shelter",
      location: "",
      priority: "Critical · 94%",
      assigned: "Unassigned",
    });
  };

  const selectStyle =
    "w-full min-w-0 rounded-lg border border-[#d4e0e8] bg-white px-2.5 py-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500";

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Priority Queue
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review critical, high-priority, and overdue humanitarian cases.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-[10px] font-medium text-[#175477] hover:bg-sky-50"
          >
            <Download size={14} />
            Export
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1c668d]"
          >
            <Plus size={14} />
            Create request
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 border-l-[3px] border-l-red-600 bg-[#fff5f5] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={19} className="shrink-0 text-red-700" />
          <div>
            <p className="text-[10px] font-semibold text-red-800">
              12 critical or overdue cases require attention
            </p>
            <p className="mt-0.5 text-[9px] text-red-600">
              Human review is required before priority or escalation decisions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPolicy(true)}
          className="shrink-0 rounded-lg border border-[#b8d0df] bg-white px-3 py-2.5 text-[9px] font-medium text-[#175477] hover:bg-sky-50"
        >
          Review SLA policy
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-6 border-b border-[#d4e0e8]">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 border-b-2 pb-3 text-[9px] whitespace-nowrap ${
              activeTab === tab.name
                ? "border-[#287da5] font-semibold text-[#287da5]"
                : "border-transparent text-slate-500 hover:text-sky-800"
            }`}
          >
            {tab.name}
            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] text-slate-500">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(180px,1fr)_repeat(5,minmax(100px,auto))]">

        <div className="flex items-center gap-2 rounded-lg border border-[#d4e0e8] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search request ID, category, or location..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
        </div>

        <select className={selectStyle}>
          <option>All crisis events</option>
          <option>Monsoon Floods 2025</option>
          <option>North Ridge Landslide</option>
          <option>Dengue Outbreak</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All categories</option>
          <option>Emergency shelter</option>
          <option>Medical supplies</option>
          <option>Food & water</option>
          <option>Rescue assistance</option>
          <option>Accessible transport</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={selectStyle}
        >
          <option>All statuses</option>
          <option>Under Review</option>
          <option>Assigned</option>
          <option>Submitted</option>
          <option>In Progress</option>
          <option>Escalated</option>
          <option>Completed</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-800 hover:bg-sky-50"
        >
          <Filter size={13} />
          More filters
          <ChevronDown size={12} />
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 grid grid-cols-1 gap-3 rounded-lg border border-[#d4e0e8] bg-white p-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[9px] text-slate-500">
              Assigned organisation / team
            </label>
            <select
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              className={selectStyle}
            >
              <option>All organisations</option>
              <option>Unassigned</option>
              <option>Medical Teams</option>
              <option>Rescue Teams</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="rounded-lg bg-slate-100 px-4 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-[#d4e0e8] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">

            <thead>
              <tr className="border-b border-[#d4e0e8] bg-[#f7fafb]">
                {[
                  "Request",
                  "Category",
                  "Location",
                  "Reported",
                  "AI Priority",
                  "Verification",
                  "Assigned",
                  "Age",
                  "Status",
                  "",
                ].map((heading, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleRequests.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                >
                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] font-semibold text-[#153f5e]">
                    {item.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-700">
                    {item.category}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {item.location}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-500">
                    {item.reported}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span
                      className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                        item.priority.startsWith("Critical")
                          ? "bg-red-100 text-red-700"
                          : item.priority.startsWith("High")
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.priority.split(" · ")[0]}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px]">
                    {item.verification === "Verified" ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                        Verified
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        {item.verification}
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-[9px] text-slate-600">
                    {item.assigned}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-semibold text-sky-700">
                      {item.age}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span
                      className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                        item.status === "Escalated"
                          ? "bg-red-100 text-red-700"
                          : item.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-3 py-3.5">
                    <ChevronRight size={15} className="text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleRequests.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No priority requests found.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length === 0 ? 0 : 1284} requests
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-md border text-[9px] ${
                  page === p
                    ? "border-[#287da5] bg-[#287da5] text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={createRequest}
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#153f5e]">
                Create Priority Request
              </h2>
              <button type="button" onClick={() => setShowCreate(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] text-slate-600">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Emergency shelter</option>
                  <option>Medical supplies</option>
                  <option>Food & water</option>
                  <option>Rescue assistance</option>
                  <option>Accessible transport</option>
                </select>
              </label>

              <label className="block text-[10px] text-slate-600">
                Location
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Enter location"
                  className={`${selectStyle} mt-1`}
                />
              </label>

              <label className="block text-[10px] text-slate-600">
                Priority
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Critical · 94%</option>
                  <option>High · 91%</option>
                  <option>Medium · 76%</option>
                  <option>Low · 50%</option>
                </select>
              </label>

              <label className="block text-[10px] text-slate-600">
                Assign team
                <select
                  value={form.assigned}
                  onChange={(e) => setForm({ ...form, assigned: e.target.value })}
                  className={`${selectStyle} mt-1`}
                >
                  <option>Unassigned</option>
                  <option>Medical Team 3</option>
                  <option>Rescue Unit 2</option>
                  <option>Mobility Team</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#287da5] px-4 py-2 text-[10px] font-semibold text-white"
              >
                Create request
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-sky-600">
                  PRIORITY REQUEST DETAILS
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#153f5e]">
                  {selected.id}
                </h2>
              </div>
              <button onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">
                {selected.priority}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                {selected.category} · {selected.location}
              </p>
            </div>

            {[
              ["Reported", selected.reported],
              ["Verification", selected.verification],
              ["Assigned", selected.assigned],
              ["Age", selected.age],
              ["Status", selected.status],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-2.5 text-[10px]">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-lg bg-[#153f5e] py-2.5 text-[10px] font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#153f5e]">
                SLA Policy
              </h2>
              <button onClick={() => setShowPolicy(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                ["Critical", "Immediate response", "bg-red-100 text-red-700"],
                ["High", "Within 30 minutes", "bg-amber-100 text-amber-700"],
                ["Medium", "Within 2 hours", "bg-sky-100 text-sky-700"],
                ["Low", "Within 24 hours", "bg-slate-100 text-slate-700"],
              ].map(([level, time, color]) => (
                <div key={level} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${color}`}>
                    {level}
                  </span>
                  <span className="text-[10px] text-slate-600">{time}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[9px] text-slate-400">
              Demonstration SLA policy. Actual response targets should follow the organisation's approved policy.
            </p>

            <button
              onClick={() => setShowPolicy(false)}
              className="mt-4 w-full rounded-lg bg-[#153f5e] py-2.5 text-[10px] font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
