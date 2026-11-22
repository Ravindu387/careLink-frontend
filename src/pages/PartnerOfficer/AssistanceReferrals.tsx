import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
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
  RefreshCw,
  CheckCircle2,
  Archive,
  RotateCcw,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  assistanceReferralService,
  initialReferrals,
  type AssistanceReferral,
  type AssistanceReferralMetrics,
  type CreateAssistanceReferralPayload,
} from "../../services/assistanceReferralService";

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const AssistanceReferrals = () => {
  const [referrals, setReferrals] = useState<AssistanceReferral[]>(initialReferrals);
  const [metrics, setMetrics] = useState<AssistanceReferralMetrics>({
    openReferrals: 24,
    awaitingAction: 12,
    criticalPriority: 4,
    acceptedToday: 18,
    peopleSupported: 1284,
    allCount: 60,
    needsActionCount: 7,
    activeCount: 15,
    completedCount: 22,
    archivedCount: 16,
  });

  const [isLive, setIsLive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [crisisFilter, setCrisisFilter] = useState("All crisis events");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [sectorFilter, setSectorFilter] = useState("All sectors");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<AssistanceReferral | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [referralsRes, metricsRes] = await Promise.all([
        assistanceReferralService.getAll(),
        assistanceReferralService.getMetrics(),
      ]);
      setReferrals(referralsRes.data);
      setMetrics(metricsRes.data);
      setIsLive(referralsRes.isLive && metricsRes.isLive);
    } catch {
      setIsLive(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [referralsRes, metricsRes] = await Promise.all([
          assistanceReferralService.getAll(),
          assistanceReferralService.getMetrics(),
        ]);
        if (isMounted) {
          setReferrals(referralsRes.data);
          setMetrics(metricsRes.data);
          setIsLive(referralsRes.isLive && metricsRes.isLive);
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSync = async () => {
    await loadData();
    showToast("Assistance referrals synced with backend");
  };

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage(null);
    }, 3500);
  };

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const matchesSearch = [
        item.id,
        item.assistance,
        item.location,
        item.assigned,
        item.crisis,
        item.sector,
        item.description || "",
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
      "Crisis Event",
      "Sector",
      "Description",
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
      item.crisis,
      item.sector,
      item.description || "",
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
    link.download = `carelink-assistance-referrals-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Create referral
  const handleCreateReferral = async (payload: CreateAssistanceReferralPayload) => {
    const result = await assistanceReferralService.create(payload);
    setReferrals((prev) => [result.data, ...prev.filter((r) => r.id !== result.data.id)]);
    setActiveTab("All");
    setSearch("");
    setCrisisFilter("All crisis events");
    setPriorityFilter("All priorities");
    setSectorFilter("All sectors");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowCreateModal(false);
    showToast(`Referral ${result.data.id} created successfully`);
    const metricsRes = await assistanceReferralService.getMetrics();
    setMetrics(metricsRes.data);
  };

  // Update status
  const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    const result = await assistanceReferralService.updateStatus(id, newStatus, reason);
    setReferrals((prev) => prev.map((r) => (r.id === id ? result.data : r)));
    if (selectedReferral?.id === id) {
      setSelectedReferral(result.data);
    }
    showToast(`Referral ${id} updated to ${newStatus}`);
    const metricsRes = await assistanceReferralService.getMetrics();
    setMetrics(metricsRes.data);
  };

  // Assign team
  const handleAssignTeam = async (id: string, team: string) => {
    const result = await assistanceReferralService.assignTeam(id, team);
    setReferrals((prev) => prev.map((r) => (r.id === id ? result.data : r)));
    if (selectedReferral?.id === id) {
      setSelectedReferral(result.data);
    }
    showToast(`Referral ${id} assigned to ${team}`);
  };

  // Delete referral
  const handleDeleteReferral = async (id: string) => {
    if (window.confirm(`Are you sure you want to remove referral ${id}?`)) {
      await assistanceReferralService.delete(id);
      setReferrals((prev) => prev.filter((r) => r.id !== id));
      setSelectedReferral(null);
      showToast(`Referral ${id} removed`);
      const metricsRes = await assistanceReferralService.getMetrics();
      setMetrics(metricsRes.data);
    }
  };

  // Reset defaults
  const handleResetDefaults = async () => {
    if (window.confirm("Reset all assistance referrals to seed defaults?")) {
      await assistanceReferralService.reset();
      await loadData();
      resetFilters();
      showToast("Assistance referrals reset to defaults");
    }
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

  const getTabCount = (tab: string): number => {
    switch (tab) {
      case "All":
        return metrics.allCount || referrals.length;
      case "Needs action":
        return (
          metrics.needsActionCount ||
          referrals.filter((r) => r.status === "Awaiting Acceptance").length
        );
      case "Active":
        return (
          metrics.activeCount ||
          referrals.filter((r) => r.status === "Accepted" || r.status === "In Progress").length
        );
      case "Completed":
        return (
          metrics.completedCount ||
          referrals.filter((r) => r.status === "Completed").length
        );
      case "Archived":
        return (
          metrics.archivedCount ||
          referrals.filter((r) => r.status === "Archived").length
        );
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Toast notification banner */}
      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#153e5b] px-4 py-3 text-xs text-white shadow-lg animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

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

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#153e5b]">
              Assistance Referrals
            </h1>

            {/* Live Backend Connection Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isLive
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isLive ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Accept, assign, update, and close referrals shared with your organisation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3.5 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
            title="Refresh referrals from server"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            Sync
          </button>

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
          value={String(metrics.openReferrals)}
          subtitle={`${metrics.awaitingAction} awaiting action`}
          color="orange"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Critical priority"
          value={String(metrics.criticalPriority)}
          subtitle="Human review required"
          color="red"
        />

        <StatCard
          icon={<Check size={20} />}
          title="Accepted today"
          value={String(metrics.acceptedToday)}
          subtitle="92% within target"
          color="green"
        />

        <StatCard
          icon={<Users size={20} />}
          title="People supported"
          value={metrics.peopleSupported ? metrics.peopleSupported.toLocaleString() : "1,284"}
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
            Accept only referrals your organisation can support. Personal details remain restricted to assigned personnel.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => {
          const count = getTabCount(tab);
          return (
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
              {count > 0 && (
                <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
                  {count}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
              )}
            </button>
          );
        })}
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
            placeholder="Search assistance referrals by ID, assistance, location, team..."
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
              Additional options
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine the referral list, clear active filters, or reset seed records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              <RotateCcw size={13} />
              Reset Defaults
            </button>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#267ba4] hover:underline"
            >
              Clear all filters
            </button>
          </div>
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

                  <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                    {item.assistance}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.location}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap">
                    {item.affected} people
                  </td>

                  <td className="px-3 py-4">
                    <PriorityBadge priority={item.priority} />
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-slate-500">
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
                    No assistance referrals found matching current filters.
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
          onStatusChange={handleStatusChange}
          onAssignTeam={handleAssignTeam}
          onDelete={handleDeleteReferral}
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
  icon: ReactNode;
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
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color] || colors.blue}`}
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
      className={`rounded-md px-2 py-1 text-[9px] font-semibold ${styles[priority] || "bg-slate-100 text-slate-500"}`}
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

// Detail Item
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b] break-words">{value || "—"}</p>
    </div>
  );
}

// Details Modal
function ReferralDetailsModal({
  referral,
  onClose,
  onStatusChange,
  onAssignTeam,
  onDelete,
}: {
  referral: AssistanceReferral;
  onClose: () => void;
  onStatusChange: (id: string, status: string, reason?: string) => Promise<void>;
  onAssignTeam: (id: string, team: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const [teamSelection, setTeamSelection] = useState(referral.assigned);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await onStatusChange(referral.id, status);
    } finally {
      setUpdating(false);
    }
  };

  const handleTeamChange = async (newTeam: string) => {
    setTeamSelection(newTeam);
    setUpdating(true);
    try {
      await onAssignTeam(referral.id, newTeam);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setUpdating(true);
    try {
      await onDelete(referral.id);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#267ba4]">
                {referral.id}
              </p>
              <PriorityBadge priority={referral.priority} />
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Referral Details
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-[#f5f8fa] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#153e5b]">
                {referral.assistance}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {referral.location} · {referral.crisis}
              </p>
            </div>
            <StatusBadge status={referral.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Detail label="Assistance Type" value={referral.assistance} />
          <Detail label="Priority" value={referral.priority} />
          <Detail label="Location" value={referral.location} />
          <Detail label="Affected People" value={`${referral.affected} people`} />
          <Detail label="Received" value={referral.received} />
          <Detail label="Sector" value={referral.sector} />
          <Detail label="Crisis Event" value={referral.crisis} />
          <Detail label="Assigned Team" value={referral.assigned} />
        </div>

        {referral.description && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-medium text-slate-400">Description & Case Notes</p>
            <p className="mt-1 text-xs text-slate-600">{referral.description}</p>
          </div>
        )}

        {/* Team Assignment quick selector */}
        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-400">
            Assign Response Team
          </label>
          <div className="flex items-center gap-2">
            <select
              disabled={updating}
              value={teamSelection}
              onChange={(e) => handleTeamChange(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
            >
              <option value="Case Support Team">Case Support Team</option>
              <option value="Food Distribution Team">Food Distribution Team</option>
              <option value="Medical Response Team">Medical Response Team</option>
              <option value="WASH Team">WASH Team</option>
              <option value="Shelter Team">Shelter Team</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workflow Actions
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {referral.status === "Awaiting Acceptance" && (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("Accepted")}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                <Check size={13} />
                Accept Referral
              </button>
            )}

            {referral.status === "Accepted" && (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("In Progress")}
                className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <ArrowRight size={13} />
                Start / In Progress
              </button>
            )}

            {referral.status === "In Progress" && (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("Completed")}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                Mark Completed
              </button>
            )}

            {referral.status !== "Archived" ? (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("Archived")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <Archive size={13} />
                Archive
              </button>
            ) : (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("Awaiting Acceptance")}
                className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <RotateCcw size={13} />
                Reopen
              </button>
            )}

            <button
              disabled={updating}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 ml-auto"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#267ba4] py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Create Referral Modal
function CreateReferralModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: CreateAssistanceReferralPayload) => Promise<void>;
}) {
  const [assistance, setAssistance] = useState("");
  const [location, setLocation] = useState("");
  const [affected, setAffected] = useState("1");
  const [priority, setPriority] = useState("High");
  const [crisis, setCrisis] = useState("Monsoon Floods 2025");
  const [sector, setSector] = useState("Shelter");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        assistance,
        location,
        affected: Math.max(1, Number(affected) || 1),
        priority,
        crisis,
        sector,
        assigned: "Unassigned",
        description: description || undefined,
        organisation: "CareLink Partner Office",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              Create a new assistance referral and sync across coordinating agencies.
            </p>
          </div>

          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Assistance Required *
            </label>
            <input
              required
              value={assistance}
              onChange={(e) => setAssistance(e.target.value)}
              placeholder="e.g. Emergency shelter kits"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Location *
            </label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Riverside - North Ward"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Affected People *
              </label>
              <input
                required
                type="number"
                min="1"
                value={affected}
                onChange={(e) => setAffected(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Crisis Event
              </label>
              <select
                value={crisis}
                onChange={(e) => setCrisis(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>Shelter</option>
                <option>Food</option>
                <option>Health</option>
                <option>WASH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Description & Specific Needs
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide urgency context, family breakdown, access conditions..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
          >
            {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
            Create Referral
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssistanceReferrals;
