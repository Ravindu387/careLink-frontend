import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  MapPin,
  FileText,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";
import {
  collaborationRequestService,
  type Collaboration,
  type CollaborationMetrics,
  type CreateCollaborationPayload,
} from "../../services/collaborationRequestService";

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
    description:
      "Coordination of mobile clean drinking water supply bowsers and distribution crews for high-ground refugee centers.",
    contactName: "Col. Ravi Jayawardena",
    contactPhone: "+94 11 234 5678",
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
    description:
      "Central kitchen supply chain delivery for three primary community centers hosting displaced residents.",
    contactName: "Sister Teresa",
    contactPhone: "+94 77 334 1122",
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
    description:
      "Door-to-door water-borne disease screenings and distribution of water purification tablets in low-lying settlements.",
    contactName: "Dr. Asela Gunaratne",
    contactPhone: "+94 71 889 4455",
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
    description:
      "Erection of 50 weather-resistant heavy duty tents and emergency camp sanitation facilities.",
    contactName: "Mark Henderson",
    contactPhone: "+94 76 112 9988",
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
    description:
      "Weekly dry ration boxes for families in isolated riverside settlements waiting for ferry transport access.",
    contactName: "Priyantha Senanayake",
    contactPhone: "+94 77 665 4321",
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
    description:
      "Mobile triage and maternal healthcare consultation unit for cutoff villages.",
    contactName: "Dr. Nilmini Alwis",
    contactPhone: "+94 70 223 8899",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"] as const;

const CollaborationRequests = () => {
  const [data, setData] = useState<Collaboration[]>(initialData);
  const [metrics, setMetrics] = useState<CollaborationMetrics | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>("All");

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

  const showBanner = (text: string, type: "success" | "error" = "success") => {
    setBannerMessage({ type, text });
    setTimeout(() => {
      setBannerMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedItems, fetchedMetrics] = await Promise.all([
        collaborationRequestService.getAll(),
        collaborationRequestService.getMetrics().catch(() => null),
      ]);

      if (fetchedItems && fetchedItems.length > 0) {
        setData(fetchedItems);
        setIsLiveConnected(true);
      }
      if (fetchedMetrics) {
        setMetrics(fetchedMetrics);
      }
    } catch (err) {
      console.warn("Using offline fallback data:", err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [fetchedItems, fetchedMetrics] = await Promise.all([
          collaborationRequestService.getAll(),
          collaborationRequestService.getMetrics().catch(() => null),
        ]);
        if (!active) return;
        if (fetchedItems && fetchedItems.length > 0) {
          setData(fetchedItems);
          setIsLiveConnected(true);
        }
        if (fetchedMetrics) {
          setMetrics(fetchedMetrics);
        }
      } catch (err) {
        if (!active) return;
        console.warn("Using offline fallback data:", err);
        setIsLiveConnected(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Dynamic filter dropdown options
  const sectorOptions = useMemo(() => {
    const defaultSectors = ["WASH", "Food Security", "Health", "Shelter", "Protection"];
    const dynamicSectors = data.map((d) => d.sector).filter(Boolean);
    return ["All sectors", ...Array.from(new Set([...defaultSectors, ...dynamicSectors]))];
  }, [data]);

  const partnerOptions = useMemo(() => {
    const defaultPartners = [
      "National Disaster Authority",
      "CareLink Shelter Network",
      "Eastbank Health Authority",
      "Global Relief Network",
    ];
    const dynamicPartners = data.map((d) => d.partner).filter(Boolean);
    return ["All partners", ...Array.from(new Set([...defaultPartners, ...dynamicPartners]))];
  }, [data]);

  const areaOptions = useMemo(() => {
    const defaultAreas = [
      "North Ward",
      "Central Ward",
      "Eastbank",
      "South Ward",
      "West Coast",
    ];
    const dynamicAreas = data.map((d) => d.area).filter(Boolean);
    return ["All operational areas", ...Array.from(new Set([...defaultAreas, ...dynamicAreas]))];
  }, [data]);

  // Tab count badges
  const tabCounts = useMemo(() => {
    return {
      All: data.length,
      "Needs action": data.filter((d) => d.status === "Awaiting Response").length,
      Active: data.filter((d) => ["Accepted", "In Progress"].includes(d.status)).length,
      Completed: data.filter((d) => d.status === "Completed").length,
      Archived: data.filter((d) => d.status === "Archived").length,
    };
  }, [data]);

  // Search and filtering
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const text = [
        item.id,
        item.title,
        item.partner,
        item.area,
        item.support,
        item.sector,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" && item.status === "Awaiting Response") ||
        (activeTab === "Active" && ["Accepted", "In Progress"].includes(item.status)) ||
        (activeTab === "Completed" && item.status === "Completed") ||
        (activeTab === "Archived" && item.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (sectorFilter === "All sectors" || item.sector === sectorFilter) &&
        (partnerFilter === "All partners" || item.partner === partnerFilter) &&
        (areaFilter === "All operational areas" || item.area === areaFilter) &&
        (statusFilter === "All statuses" || item.status === statusFilter)
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
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

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
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
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
  const handleCreate = async (payload: CreateCollaborationPayload) => {
    try {
      const created = await collaborationRequestService.create(payload);
      setData((prev) => [created, ...prev]);
      setActiveTab("All");
      setSearch("");
      setSectorFilter("All sectors");
      setPartnerFilter("All partners");
      setAreaFilter("All operational areas");
      setStatusFilter("All statuses");
      setCurrentPage(1);
      setShowCreate(false);
      showBanner(`Collaboration request ${created.id} created successfully.`);
      collaborationRequestService.getMetrics().then(setMetrics).catch(() => null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create collaboration request";
      showBanner(message, "error");
    }
  };

  // Update status (e.g. Accept, Start Progress, Complete, Archive)
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await collaborationRequestService.updateStatus(id, newStatus);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selected && selected.id === id) {
        setSelected(updated);
      }
      showBanner(`Collaboration ${id} updated to "${newStatus}".`);
      collaborationRequestService.getMetrics().then(setMetrics).catch(() => null);
    } catch {
      // Local optimistic fallback
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selected && selected.id === id) {
        setSelected({ ...selected, status: newStatus });
      }
      showBanner(`Collaboration ${id} updated to "${newStatus}".`);
    }
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

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153e5b]">
              Collaboration Requests
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isLiveConnected
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveConnected
                    ? "animate-pulse bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />
              {isLiveConnected ? "Live Connected" : "Local Store"}
            </span>

            {metrics && (
              <span className="rounded-full bg-[#e8f2f8] px-2.5 py-0.5 text-xs font-medium text-[#267ba4]">
                {metrics.totalCollaborations} Total Requests
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Coordinate joint activities, required capacity, roles, deadlines, and
            partner responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            title="Refresh collaboration requests"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-sm font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Create Collaboration
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {bannerMessage && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg border p-3.5 text-xs font-medium transition ${
            bannerMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {bannerMessage.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Handshake size={20} />}
          title="Open collaborations"
          value={String(
            metrics?.openCollaborations ??
              data.filter((d) => !["Completed", "Archived"].includes(d.status))
                .length
          )}
          subtitle={`Across ${metrics?.sectorsCount ?? 5} sectors`}
          color="blue"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          title="Awaiting response"
          value={String(
            metrics?.awaitingResponse ??
              data.filter((d) => d.status === "Awaiting Response").length
          )}
          subtitle="Priority response needed"
          color="orange"
        />

        <StatCard
          icon={<BriefcaseBusiness size={20} />}
          title="Active partnerships"
          value={String(
            metrics?.activePartnerships ??
              data.filter((d) => ["Accepted", "In Progress"].includes(d.status))
                .length
          )}
          subtitle={`With ${metrics?.partnersCount ?? 9} organisations`}
          color="green"
        />

        <StatCard
          icon={<Check size={20} />}
          title="Completed this month"
          value={String(metrics?.completedThisMonth ?? 28)}
          subtitle="94% objectives met"
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => {
          const count = tabCounts[tab];
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`relative whitespace-nowrap pb-4 text-sm transition ${
                activeTab === tab
                  ? "font-semibold text-[#267ba4]"
                  : "text-slate-500 hover:text-[#267ba4]"
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  activeTab === tab
                    ? "bg-[#267ba4] text-white"
                    : "bg-[#e5eff4] text-[#153e5b]"
                }`}
              >
                {count}
              </span>
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
              )}
            </button>
          );
        })}
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
            placeholder="Search collaboration requests, partners, areas, or support..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          {sectorOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <select
          value={partnerFilter}
          onChange={(e) => {
            setPartnerFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          {partnerOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <select
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-sm sm:text-[15px] text-slate-600 outline-none"
        >
          {areaOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-sm sm:text-[15px] text-slate-600 outline-none"
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
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-sm font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Filter size={15} />
          More filters
        </button>
      </div>

      {/* More Filters Banner */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-[#153e5b]">
              Refine collaboration requests
            </p>
            <p className="mt-1 text-[13px] text-slate-500">
              Filtered results: {filteredData.length} records matching current
              criteria.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-sm font-medium text-[#267ba4] hover:underline"
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
              <tr className="border-b border-[#d7e5eb] text-sm text-slate-500">
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
                  className="cursor-pointer border-b border-[#e2ebef] text-sm text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {item.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 font-medium text-[#153e5b]">
                    {item.title}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">{item.partner}</td>

                  <td className="px-3 py-4">{item.sector}</td>

                  <td className="whitespace-nowrap px-3 py-4">{item.area}</td>

                  <td className="whitespace-nowrap px-3 py-4">{item.support}</td>

                  <td className="whitespace-nowrap px-3 py-4">{item.startDate}</td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight size={17} className="text-[#64849a]" />
                  </td>
                </tr>
              ))}

              {displayedData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    No collaboration requests found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-[13px] text-slate-400">
            Showing{" "}
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} requests
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-sm text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-8 w-8 rounded-lg border text-sm ${
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-sm text-slate-500 disabled:opacity-40"
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
          onStatusChange={handleStatusChange}
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
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
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
    <span
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

// Details Item
function Detail({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[13px] text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Details Modal
function DetailsModal({
  item,
  onClose,
  onStatusChange,
}: {
  item: Collaboration;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#267ba4]">{item.id}</p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Collaboration Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-[#f5f8fa] p-3.5">
          <p className="text-[13px] text-slate-400">Title</p>
          <h3 className="mt-0.5 text-base font-semibold text-[#153e5b]">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Detail
            icon={<Building2 size={13} />}
            label="Requesting Partner"
            value={item.partner}
          />
          <Detail icon={<Layers size={13} />} label="Sector" value={item.sector} />
          <Detail
            icon={<MapPin size={13} />}
            label="Operational Area"
            value={item.area}
          />
          <Detail
            icon={<FileText size={13} />}
            label="Required Support"
            value={item.support}
          />
          <Detail
            icon={<Calendar size={13} />}
            label="Proposed Start Date"
            value={item.startDate}
          />
          <div>
            <p className="text-[13px] text-slate-400">Current Status</p>
            <div className="mt-1">
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>

        {(item.contactName || item.contactPhone) && (
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            {item.contactName && (
              <Detail
                icon={<User size={13} />}
                label="Partner Contact"
                value={item.contactName}
              />
            )}
            {item.contactPhone && (
              <Detail
                icon={<Phone size={13} />}
                label="Phone"
                value={item.contactPhone}
              />
            )}
          </div>
        )}

        {/* Status transition action controls */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-[13px] font-semibold text-slate-500">
            Workflow Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {item.status === "Awaiting Response" && (
              <button
                onClick={() => onStatusChange(item.id, "Accepted")}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Check size={13} />
                Accept Request
              </button>
            )}

            {(item.status === "Awaiting Response" || item.status === "Accepted") && (
              <button
                onClick={() => onStatusChange(item.id, "In Progress")}
                className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1c668a]"
              >
                <ArrowRight size={13} />
                Mark In Progress
              </button>
            )}

            {item.status === "In Progress" && (
              <button
                onClick={() => onStatusChange(item.id, "Completed")}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Check size={13} />
                Mark Completed
              </button>
            )}

            {item.status !== "Archived" && (
              <button
                onClick={() => onStatusChange(item.id, "Archived")}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                Archive
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
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
  onSubmit: (payload: CreateCollaborationPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [partner, setPartner] = useState("");
  const [sector, setSector] = useState("WASH");
  const [area, setArea] = useState("North Ward");
  const [support, setSupport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: CreateCollaborationPayload = {
      title,
      partner,
      sector,
      area,
      support,
      startDate: startDate || new Date().toISOString().split("T")[0],
      description: description.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    };

    onSubmit(payload);
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
            <p className="mt-1 text-[13px] text-slate-500">
              Create a new partner collaboration request.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Collaboration Title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mobile emergency water bowser service"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Requesting Partner *
            </label>
            <input
              required
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="e.g. National Disaster Authority"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Sector *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
              >
                <option>WASH</option>
                <option>Food Security</option>
                <option>Health</option>
                <option>Shelter</option>
                <option>Protection</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Operational Area *
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
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
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Required Support *
            </label>
            <textarea
              required
              value={support}
              onChange={(e) => setSupport(e.target.value)}
              placeholder="Describe required capacity, resources, or staffing..."
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Operational Details / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional background, requirements, or logistics notes..."
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Proposed Start Date *
              </label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Contact Name
              </label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Focal person"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Contact Phone
              </label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+94 77 ..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:text-[15px] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#267ba4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1c668a]"
          >
            Create Collaboration
          </button>
        </div>
      </form>
    </div>
  );
}

export default CollaborationRequests;
