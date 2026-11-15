
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Map,
  Users,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  X,
} from "lucide-react";

type Activity = {
  id: string;
  name: string;
  location: string;
  scheduled: string;
  team: string;
  target: string;
  sector: string;
  status: string;
};

const initialActivities: Activity[] = [
  {
    id: "ACT-1042",
    name: "Household food distribution",
    location: "North Ward - Zone 3",
    scheduled: "22 Jun - 14:00",
    team: "Field Team North",
    target: "420 households",
    sector: "Food Security",
    status: "In Progress",
  },
  {
    id: "ACT-1038",
    name: "Water quality monitoring",
    location: "Eastbank - Sites 2–6",
    scheduled: "22 Jun - 12:30",
    team: "WASH Team 2",
    target: "5 water points",
    sector: "WASH",
    status: "Completed",
  },
  {
    id: "ACT-1034",
    name: "Protection desk",
    location: "Riverton High Shelter",
    scheduled: "22 Jun - 09:00",
    team: "Protection Team",
    target: "86 consultations",
    sector: "Protection",
    status: "Active",
  },
  {
    id: "ACT-1029",
    name: "Health awareness session",
    location: "Eastbank Community Centre",
    scheduled: "21 Jun - 16:00",
    team: "Health Outreach",
    target: "124 participants",
    sector: "Health",
    status: "Completed",
  },
  {
    id: "ACT-1025",
    name: "Emergency shelter assessment",
    location: "North Ward - Zone 2",
    scheduled: "23 Jun - 10:00",
    team: "Field Team North",
    target: "60 households",
    sector: "Shelter",
    status: "Scheduled",
  },
  {
    id: "ACT-1020",
    name: "Community food outreach",
    location: "South Ward",
    scheduled: "23 Jun - 13:00",
    team: "Food Support Team",
    target: "200 families",
    sector: "Food Security",
    status: "Active",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const FieldActivities = () => {
  const [activities, setActivities] = useState(initialActivities);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [teamFilter, setTeamFilter] = useState("All teams");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Search and filter
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const searchableText = [
        item.id,
        item.name,
        item.location,
        item.team,
        item.target,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Scheduled", "Overdue"].includes(item.status)) ||
        (activeTab === "Active" &&
          ["Active", "In Progress"].includes(item.status)) ||
        (activeTab === "Completed" && item.status === "Completed") ||
        (activeTab === "Archived" && item.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (sectorFilter === "All sectors" ||
          item.sector === sectorFilter) &&
        (locationFilter === "All locations" ||
          item.location.includes(locationFilter)) &&
        (teamFilter === "All teams" || item.team === teamFilter) &&
        (statusFilter === "All statuses" ||
          item.status === statusFilter)
      );
    });
  }, [
    activities,
    activeTab,
    search,
    sectorFilter,
    locationFilter,
    teamFilter,
    statusFilter,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredActivities.length / pageSize)
  );

  const displayedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Activity ID",
      "Activity Name",
      "Location",
      "Scheduled",
      "Team",
      "Target/Result",
      "Sector",
      "Status",
    ];

    const rows = filteredActivities.map((item) => [
      item.id,
      item.name,
      item.location,
      item.scheduled,
      item.team,
      item.target,
      item.sector,
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
    link.download = "field-activities.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Create activity
  const handleCreateActivity = (activity: Activity) => {
    setActivities((prev) => [activity, ...prev]);
    setActiveTab("All");
    setSearch("");
    setSectorFilter("All sectors");
    setLocationFilter("All locations");
    setTeamFilter("All teams");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowCreateModal(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSectorFilter("All sectors");
    setLocationFilter("All locations");
    setTeamFilter("All teams");
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
              Field Activities
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Field Activities
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Plan and monitor distributions, assessments, outreach,
            and service delivery in the field.
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
            Create Field Activity
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Map size={20} />}
          title="Active today"
          value="12"
          subtitle="Across 4 districts"
          color="blue"
        />

        <StatCard
          icon={<Users size={20} />}
          title="People targeted"
          value="4,840"
          subtitle="1,864 reached today"
          color="blue"
        />

        <StatCard
          icon={<Users size={20} />}
          title="Teams deployed"
          value="18"
          subtitle="62 staff in field"
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Updates overdue"
          value="2"
          subtitle="Require field check-in"
          color="red"
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
            placeholder="Search field activities..."
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
          <option>Food Security</option>
          <option>WASH</option>
          <option>Protection</option>
          <option>Health</option>
          <option>Shelter</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All locations</option>
          <option>North Ward</option>
          <option>Eastbank</option>
          <option>Riverton</option>
          <option>South Ward</option>
        </select>

        <select
          value={teamFilter}
          onChange={(e) => {
            setTeamFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All teams</option>
          <option>Field Team North</option>
          <option>WASH Team 2</option>
          <option>Protection Team</option>
          <option>Health Outreach</option>
          <option>Food Support Team</option>
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
          <option>In Progress</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Scheduled</option>
          <option>Overdue</option>
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
              Refine field activities using the filters above.
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

      {/* Activities Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">

            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Activity",
                  "Activity Name",
                  "Location",
                  "Scheduled",
                  "Team",
                  "Target / Result",
                  "Sector",
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
              {displayedActivities.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedActivity(item)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {item.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.location}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.scheduled}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.team}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.target}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.sector}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight size={17} className="text-[#64849a]" />
                  </td>
                </tr>
              ))}

              {displayedActivities.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No field activities found.
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
            {filteredActivities.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(
              currentPage * pageSize,
              filteredActivities.length
            )}{" "}
            of {filteredActivities.length} activities
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

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}

      {/* Create Activity Modal */}
      {showCreateModal && (
        <CreateActivityModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateActivity}
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
    green: "bg-[#e5f6f0] text-[#299b7d]",
    red: "bg-[#fdebed] text-red-500",
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
    "In Progress": "bg-[#e8f2f8] text-[#267ba4]",
    Active: "bg-[#e5f6f0] text-[#299b7d]",
    Completed: "bg-[#e5f6f0] text-[#299b7d]",
    Scheduled: "bg-[#fff4df] text-[#bd8229]",
    Overdue: "bg-[#fdebed] text-red-500",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// Detail Item
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

// Activity Details Modal
function ActivityDetailsModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {activity.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Activity Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <h3 className="mb-5 text-sm font-semibold text-[#153e5b]">
          {activity.name}
        </h3>

        <div className="grid grid-cols-2 gap-5">
          <Detail label="Location" value={activity.location} />
          <Detail label="Scheduled" value={activity.scheduled} />
          <Detail label="Assigned Team" value={activity.team} />
          <Detail label="Target / Result" value={activity.target} />
          <Detail label="Sector" value={activity.sector} />
          <Detail label="Status" value={activity.status} />
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

// Create Activity Modal
function CreateActivityModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [scheduled, setScheduled] = useState("");
  const [team, setTeam] = useState("Field Team North");
  const [target, setTarget] = useState("");
  const [sector, setSector] = useState("Food Security");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const activity: Activity = {
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      location,
      scheduled: new Date(`${scheduled}T12:00:00`).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
        }
      ),
      team,
      target,
      sector,
      status: "Scheduled",
    };

    onSubmit(activity);
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
              Create Field Activity
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Add a new field operation.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Activity Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter activity name"
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
              placeholder="Enter activity location"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Scheduled Date
              </label>
              <input
                required
                type="date"
                value={scheduled}
                onChange={(e) => setScheduled(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Target / Result
              </label>
              <input
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 200 families"
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Assigned Team
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Field Team North</option>
              <option>WASH Team 2</option>
              <option>Protection Team</option>
              <option>Health Outreach</option>
              <option>Food Support Team</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Food Security</option>
              <option>WASH</option>
              <option>Protection</option>
              <option>Health</option>
              <option>Shelter</option>
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
            Create Activity
          </button>
        </div>

      </form>
    </div>
  );
}

export default FieldActivities;
