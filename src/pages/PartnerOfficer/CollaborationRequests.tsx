
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Handshake,
  Clock3,
  BriefcaseBusiness,
  Check,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  X,
} from "lucide-react";

type Collaboration = {
  id: string;
  title: string;
  partner: string;
  sector: string;
  area: string;
  support: string;
  startDate: string;
  status: string;
};

const initialData: Collaboration[] = [
  {
    id: "COL-0742",
    title: "Mobile water distribution",
    partner: "National Disaster Authority",
    sector: "WASH",
    area: "North Ward",
    support: "Vehicles · staff",
    startDate: "24 Jun",
    status: "Awaiting Response",
  },
  {
    id: "COL-0739",
    title: "Shelter food service",
    partner: "CareLink Shelter Network",
    sector: "Food Security",
    area: "Central Ward",
    support: "1,200 meals/day",
    startDate: "23 Jun",
    status: "Accepted",
  },
  {
    id: "COL-0734",
    title: "Community health outreach",
    partner: "Eastbank Health Authority",
    sector: "Health",
    area: "Eastbank",
    support: "8 outreach workers",
    startDate: "25 Jun",
    status: "In Progress",
  },
  {
    id: "COL-0730",
    title: "Emergency shelter support",
    partner: "Global Relief Network",
    sector: "Shelter",
    area: "North Ward",
    support: "Temporary shelters",
    startDate: "26 Jun",
    status: "Completed",
  },
  {
    id: "COL-0728",
    title: "Food package distribution",
    partner: "CareLink Shelter Network",
    sector: "Food Security",
    area: "South Ward",
    support: "500 food packs",
    startDate: "27 Jun",
    status: "Awaiting Response",
  },
  {
    id: "COL-0725",
    title: "Medical assistance programme",
    partner: "Eastbank Health Authority",
    sector: "Health",
    area: "Eastbank",
    support: "Medical team",
    startDate: "28 Jun",
    status: "In Progress",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const CollaborationRequests = () => {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("All");

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [partnerFilter, setPartnerFilter] = useState("All partners");
  const [areaFilter, setAreaFilter] = useState("All operational areas");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Collaboration | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Search and filtering
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const text = [
        item.id,
        item.title,
        item.partner,
        item.area,
        item.support,
      ].join(" ").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          item.status === "Awaiting Response") ||
        (activeTab === "Active" &&
          ["Accepted", "In Progress"].includes(item.status)) ||
        (activeTab === "Completed" && item.status === "Completed") ||
        (activeTab === "Archived" && item.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (sectorFilter === "All sectors" ||
          item.sector === sectorFilter) &&
        (partnerFilter === "All partners" ||
          item.partner === partnerFilter) &&
        (areaFilter === "All operational areas" ||
          item.area === areaFilter) &&
        (statusFilter === "All statuses" ||
          item.status === statusFilter)
      );
    });
  }, [
    data,
    search,
    activeTab,
    sectorFilter,
    partnerFilter,
    areaFilter,
    statusFilter,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const displayedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CSV Export
  const exportCSV = () => {
    const headers = [
      "Request ID",
      "Collaboration",
      "Requesting Partner",
      "Sector",
      "Area",
      "Required Support",
      "Start Date",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.id,
      item.title,
      item.partner,
      item.sector,
      item.area,
      item.support,
      item.startDate,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "collaboration-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Create collaboration
  const handleCreate = (item: Collaboration) => {
    setData((prev) => [item, ...prev]);
    setActiveTab("All");
    setSearch("");
    setSectorFilter("All sectors");
    setPartnerFilter("All partners");
    setAreaFilter("All operational areas");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowCreate(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSectorFilter("All sectors");
    setPartnerFilter("All partners");
    setAreaFilter("All operational areas");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Collaboration Requests
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Collaboration Requests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Coordinate joint activities, required capacity, roles,
            deadlines, and partner responses.
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
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Create Collaboration
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Handshake size={20} />}
          title="Open collaborations"
          value="9"
          subtitle="Across 5 sectors"
          color="blue"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          title="Awaiting response"
          value="7"
          subtitle="3 due today"
          color="orange"
        />

        <StatCard
          icon={<BriefcaseBusiness size={20} />}
          title="Active partnerships"
          value="14"
          subtitle="With 9 organisations"
          color="green"
        />

        <StatCard
          icon={<Check size={20} />}
          title="Completed this month"
          value="28"
          subtitle="94% objectives met"
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
                48
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

      {/* Search and Filters */}
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
            placeholder="Search collaboration requests..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All sectors</option>
          <option>WASH</option>
          <option>Food Security</option>
          <option>Health</option>
          <option>Shelter</option>
        </select>

        <select
          value={partnerFilter}
          onChange={(e) => {
            setPartnerFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All partners</option>
          <option>National Disaster Authority</option>
          <option>CareLink Shelter Network</option>
          <option>Eastbank Health Authority</option>
          <option>Global Relief Network</option>
        </select>

        <select
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>North Ward</option>
          <option>Central Ward</option>
          <option>Eastbank</option>
          <option>South Ward</option>
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
          <option>Awaiting Response</option>
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

      {/* More Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#153e5b]">
              Additional filters
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine your collaboration requests using the filters above.
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

      {/* Collaboration Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">

            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Request",
                  "Collaboration",
                  "Requesting Partner",
                  "Sector",
                  "Area",
                  "Required Support",
                  "Start Date",
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
              {displayedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {item.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.title}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.partner}
                  </td>

                  <td className="px-3 py-4">
                    {item.sector}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.area}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.support}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.startDate}
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

              {displayedData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No collaboration requests found.
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
            {filteredData.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(
              currentPage * pageSize,
              filteredData.length
            )}{" "}
            of {filteredData.length} requests
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

      {/* Details Modal */}
      {selected && (
        <DetailsModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateCollaborationModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
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
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    orange: "bg-[#fff4df] text-[#d69b30]",
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
    "Awaiting Response": "bg-[#fff4df] text-[#bd8229]",
    Accepted: "bg-[#e5f6f0] text-[#299b7d]",
    "In Progress": "bg-[#e8f2f8] text-[#267ba4]",
    Completed: "bg-[#e5f6f0] text-[#299b7d]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// Details Item
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Details Modal
function DetailsModal({
  item,
  onClose,
}: {
  item: Collaboration;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {item.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Collaboration Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <h3 className="mb-5 text-sm font-semibold text-[#153e5b]">
          {item.title}
        </h3>

        <div className="grid grid-cols-2 gap-5">
          <Detail label="Requesting Partner" value={item.partner} />
          <Detail label="Sector" value={item.sector} />
          <Detail label="Operational Area" value={item.area} />
          <Detail label="Required Support" value={item.support} />
          <Detail label="Start Date" value={item.startDate} />
          <Detail label="Status" value={item.status} />
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

// Create Collaboration Modal
function CreateCollaborationModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (item: Collaboration) => void;
}) {
  const [title, setTitle] = useState("");
  const [partner, setPartner] = useState("");
  const [sector, setSector] = useState("WASH");
  const [area, setArea] = useState("North Ward");
  const [support, setSupport] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const item: Collaboration = {
      id: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      partner,
      sector,
      area,
      support,
      startDate: startDate
        ? new Date(`${startDate}T12:00:00`).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
        : "Not scheduled",
      status: "Awaiting Response",
    };

    onSubmit(item);
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
              Create Collaboration
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Create a new partner collaboration request.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Collaboration Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter collaboration title"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Requesting Partner
            </label>
            <input
              required
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="Enter partner organisation"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              >
                <option>WASH</option>
                <option>Food Security</option>
                <option>Health</option>
                <option>Shelter</option>
                <option>Protection</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Operational Area
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              >
                <option>North Ward</option>
                <option>Central Ward</option>
                <option>Eastbank</option>
                <option>South Ward</option>
                <option>West Coast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Required Support
            </label>
            <textarea
              required
              value={support}
              onChange={(e) => setSupport(e.target.value)}
              placeholder="Describe the required support..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Proposed Start Date
            </label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            />
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
            Create Collaboration
          </button>
        </div>

      </form>
    </div>
  );
}

export default CollaborationRequests;
