
import { useMemo, useState, type FormEvent } from "react";
import {
  Download,
  Plus,
  Inbox,
  AlertTriangle,
  Check,
  Users,
  Search,
  Filter,
  ChevronRight,
  X,
  ShieldCheck,
} from "lucide-react";

type Referral = {
  id: string;
  assistance: string;
  location: string;
  affected: number;
  priority: string;
  received: string;
  assigned: string;
  status: string;
  crisis: string;
  sector: string;
};

const initialReferrals: Referral[] = [
  {
    id: "REF-2841",
    assistance: "Emergency shelter",
    location: "Riverside - North Ward",
    affected: 6,
    priority: "Critical",
    received: "22 Jun - 13:02",
    assigned: "Case Support Team",
    status: "Awaiting Acceptance",
    crisis: "Monsoon Floods 2025",
    sector: "Shelter",
  },
  {
    id: "REF-2838",
    assistance: "Food assistance",
    location: "Central District",
    affected: 12,
    priority: "High",
    received: "22 Jun - 11:45",
    assigned: "Food Distribution Team",
    status: "Accepted",
    crisis: "Monsoon Floods 2025",
    sector: "Food",
  },
  {
    id: "REF-2835",
    assistance: "Medical supplies",
    location: "Eastbank",
    affected: 8,
    priority: "Critical",
    received: "21 Jun - 16:20",
    assigned: "Medical Response Team",
    status: "In Progress",
    crisis: "Dengue Outbreak",
    sector: "Health",
  },
  {
    id: "REF-2830",
    assistance: "Clean drinking water",
    location: "North District",
    affected: 20,
    priority: "High",
    received: "21 Jun - 10:15",
    assigned: "WASH Team",
    status: "Accepted",
    crisis: "Monsoon Floods 2025",
    sector: "WASH",
  },
  {
    id: "REF-2825",
    assistance: "Temporary housing",
    location: "West Coast",
    affected: 5,
    priority: "Medium",
    received: "20 Jun - 09:30",
    assigned: "Shelter Team",
    status: "Completed",
    crisis: "Coastal Storm Response",
    sector: "Shelter",
  },
  {
    id: "REF-2820",
    assistance: "Emergency food packs",
    location: "South District",
    affected: 15,
    priority: "Low",
    received: "19 Jun - 14:10",
    assigned: "Food Distribution Team",
    status: "Archived",
    crisis: "Monsoon Floods 2025",
    sector: "Food",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const AssistanceReferrals = () => {
  const [referrals, setReferrals] = useState(initialReferrals);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [crisisFilter, setCrisisFilter] = useState("All crisis events");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReferral, setSelectedReferral] =
    useState<Referral | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const matchesSearch = [
        item.id,
        item.assistance,
        item.location,
        item.assigned,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          item.status === "Awaiting Acceptance") ||
        (activeTab === "Active" &&
          ["Accepted", "In Progress"].includes(item.status)) ||
        (activeTab === "Completed" && item.status === "Completed") ||
        (activeTab === "Archived" && item.status === "Archived");

      const matchesCrisis =
        crisisFilter === "All crisis events" ||
        item.crisis === crisisFilter;

      const matchesPriority =
        priorityFilter === "All priorities" ||
        item.priority === priorityFilter;

      const matchesSector =
        sectorFilter === "All sectors" ||
        item.sector === sectorFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesCrisis &&
        matchesPriority &&
        matchesSector &&
        matchesStatus
      );
    });
  }, [
    referrals,
    activeTab,
    search,
    crisisFilter,
    priorityFilter,
    sectorFilter,
    statusFilter,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReferrals.length / pageSize)
  );

  const displayedReferrals = filteredReferrals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Referral ID",
      "Assistance",
      "Location",
      "Affected People",
      "Priority",
      "Received",
      "Assigned",
      "Status",
    ];

    const rows = filteredReferrals.map((item) => [
      item.id,
      item.assistance,
      item.location,
      item.affected,
      item.priority,
      item.received,
      item.assigned,
      item.status,
    ]);

    const csv = [headers, ...rows]
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
    link.download = "assistance-referrals.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Create referral
  const handleCreateReferral = (newReferral: Referral) => {
    setReferrals((prev) => [newReferral, ...prev]);
    setActiveTab("All");
    setSearch("");
    setCrisisFilter("All crisis events");
    setPriorityFilter("All priorities");
    setSectorFilter("All sectors");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowCreateModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setCrisisFilter("All crisis events");
    setPriorityFilter("All priorities");
    setSectorFilter("All sectors");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Page Heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Assistance Referrals
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Assistance Referrals
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Accept, assign, update, and close referrals shared with your
            organisation.
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Create Referral
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Inbox size={20} />}
          title="Open referrals"
          value="24"
          subtitle="12 awaiting action"
          color="orange"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Critical priority"
          value="4"
          subtitle="Human review required"
          color="red"
        />

        <StatCard
          icon={<Check size={20} />}
          title="Accepted today"
          value="18"
          subtitle="92% within target"
          color="green"
        />

        <StatCard
          icon={<Users size={20} />}
          title="People supported"
          value="1,284"
          subtitle="+218 today"
          color="blue"
        />

      </div>

      {/* Data Sharing Information */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#c8e0e9] border-l-[3px] border-l-[#2783b1] bg-[#edf7fa] px-4 py-3">

        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-[#267ba4]"
        />

        <div>
          <p className="text-[11px] font-semibold text-[#153e5b]">
            Data is shared for authorised response only
          </p>

          <p className="mt-1 text-[10px] text-[#52778c]">
            Accept only referrals your organisation can support. Personal
            details remain restricted to assigned personnel.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`relative whitespace-nowrap pb-4 text-xs ${
              activeTab === tab
                ? "font-semibold text-[#267ba4]"
                : "text-slate-500 hover:text-[#267ba4]"
            }`}
          >
            {tab}

            {tab === "All" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                60
              </span>
            )}

            {tab === "Needs action" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                7
              </span>
            )}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}

      </div>

      {/* Search & Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">

        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search assistance referrals..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={crisisFilter}
          onChange={(e) => {
            setCrisisFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All crisis events</option>
          <option>Monsoon Floods 2025</option>
          <option>Dengue Outbreak</option>
          <option>Coastal Storm Response</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All sectors</option>
          <option>Shelter</option>
          <option>Food</option>
          <option>Health</option>
          <option>WASH</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Awaiting Acceptance</option>
          <option>Accepted</option>
          <option>In Progress</option>
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

      {/* Additional Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#153e5b]">
              Additional filters
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine the referral list using the available filters.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4]"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Referral Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">

            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Referral",
                  "Assistance",
                  "Location",
                  "Affected",
                  "Priority",
                  "Received",
                  "Assigned",
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
              {displayedReferrals.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedReferral(item)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {item.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.assistance}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.location}
                  </td>

                  <td className="px-3 py-4">
                    {item.affected} people
                  </td>

                  <td className="px-3 py-4">
                    <PriorityBadge priority={item.priority} />
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.received}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.assigned}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight
                      size={17}
                      className="text-[#64849a]"
                    />
                  </td>
                </tr>
              ))}

              {displayedReferrals.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No assistance referrals found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">

          <p className="text-[10px] text-slate-400">
            Showing{" "}
            {filteredReferrals.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(
              currentPage * pageSize,
              filteredReferrals.length
            )}{" "}
            of {filteredReferrals.length} referrals
          </p>

          <div className="flex items-center gap-1">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  currentPage === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>
      </div>

      {/* Referral Details Modal */}
      {selectedReferral && (
        <ReferralDetailsModal
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
        />
      )}

      {/* Create Referral Modal */}
      {showCreateModal && (
        <CreateReferralModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReferral}
        />
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
    orange: "bg-[#fff4df] text-[#d69b30]",
    red: "bg-[#fdebed] text-red-500",
    green: "bg-[#e5f6f0] text-[#299b7d]",
    blue: "bg-[#e8f2f8] text-[#2783b1]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}
      >
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

// Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Critical: "bg-[#fde8e9] text-[#d34c55]",
    High: "bg-[#fff0df] text-[#c27a29]",
    Medium: "bg-[#fff6df] text-[#a8872d]",
    Low: "bg-[#e8f2f8] text-[#267ba4]",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[9px] font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Awaiting Acceptance": "bg-[#fff4df] text-[#bd8229]",
    Accepted: "bg-[#e5f6f0] text-[#299b7d]",
    "In Progress": "bg-[#e8f2f8] text-[#267ba4]",
    Completed: "bg-[#e5f6f0] text-[#299b7d]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

// Details Modal
function ReferralDetailsModal({
  referral,
  onClose,
}: {
  referral: Referral;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {referral.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Referral Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Detail label="Assistance" value={referral.assistance} />
          <Detail label="Priority" value={referral.priority} />
          <Detail label="Location" value={referral.location} />
          <Detail label="Affected people" value={`${referral.affected} people`} />
          <Detail label="Received" value={referral.received} />
          <Detail label="Assigned team" value={referral.assigned} />
          <Detail label="Crisis event" value={referral.crisis} />
          <Detail label="Sector" value={referral.sector} />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] text-slate-400">Current status</p>
          <StatusBadge status={referral.status} />
        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Detail Item
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Create Referral Modal
function CreateReferralModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (referral: Referral) => void;
}) {
  const [assistance, setAssistance] = useState("");
  const [location, setLocation] = useState("");
  const [affected, setAffected] = useState("1");
  const [priority, setPriority] = useState("High");
  const [crisis, setCrisis] = useState("Monsoon Floods 2025");
  const [sector, setSector] = useState("Shelter");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newReferral: Referral = {
      id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      assistance,
      location,
      affected: Number(affected),
      priority,
      received: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      assigned: "Unassigned",
      status: "Awaiting Acceptance",
      crisis,
      sector,
    };

    onSubmit(newReferral);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Create Referral
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Create a new assistance referral.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Assistance Required
            </label>
            <input
              required
              value={assistance}
              onChange={(e) => setAssistance(e.target.value)}
              placeholder="e.g. Emergency shelter"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Location
            </label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter affected location"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Affected People
              </label>
              <input
                required
                type="number"
                min="1"
                value={affected}
                onChange={(e) => setAffected(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Crisis Event
            </label>
            <select
              value={crisis}
              onChange={(e) => setCrisis(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Monsoon Floods 2025</option>
              <option>Dengue Outbreak</option>
              <option>Coastal Storm Response</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Assistance Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Shelter</option>
              <option>Food</option>
              <option>Health</option>
              <option>WASH</option>
            </select>
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            Create Referral
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssistanceReferrals;
