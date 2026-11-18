import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal,
  Building2,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { shelterService } from "../../services/shelterService";
import type {
  ShelterItem,
  ShelterStatus,
  ShelterSummary,
} from "../../types/shelter";

const initialShelters: ShelterItem[] = [
  {
    id: "SH-001",
    name: "Riverton Central School",
    district: "Central District",
    type: "Public School",
    capacity: 660,
    occupied: 612,
    manager: "A. Perera",
    status: "Near Capacity",
  },
  {
    id: "SH-002",
    name: "North Community Hall",
    district: "North District",
    type: "Community Centre",
    capacity: 500,
    occupied: 284,
    manager: "M. Silva",
    status: "Active",
  },
  {
    id: "SH-003",
    name: "St. Mary Civic Centre",
    district: "Eastbank",
    type: "Religious Centre",
    capacity: 450,
    occupied: 450,
    manager: "D. Fernando",
    status: "Full",
  },
  {
    id: "SH-004",
    name: "Lakeside Sports Hall",
    district: "West District",
    type: "Sports Facility",
    capacity: 400,
    occupied: 196,
    manager: "N. Wijesinghe",
    status: "Active",
  },
  {
    id: "SH-005",
    name: "Hillview College",
    district: "North District",
    type: "Public School",
    capacity: 320,
    occupied: 0,
    manager: "R. Jayasinghe",
    status: "Maintenance",
  },
];

const districts = [
  "All districts",
  "Central District",
  "North District",
  "Eastbank",
  "West District",
];

const shelterTypes = [
  "All shelter types",
  "Public School",
  "Community Centre",
  "Religious Centre",
  "Sports Facility",
];

const statuses = [
  "All statuses",
  "Active",
  "Near Capacity",
  "Full",
  "Maintenance",
];

const occupancyOptions = [
  "Any occupancy",
  "Available spaces",
  "Near capacity",
  "Fully occupied",
  "Empty",
];

export default function ShelterManagementPage() {
  const [shelters, setShelters] = useState<ShelterItem[]>(initialShelters);
  const [summary, setSummary] = useState<ShelterSummary | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [type, setType] = useState("All shelter types");
  const [status, setStatus] = useState("All statuses");
  const [occupancy, setOccupancy] = useState("Any occupancy");

  const [moreFilters, setMoreFilters] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialShelters.length);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const [selectedShelter, setSelectedShelter] = useState<ShelterItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newShelter, setNewShelter] = useState({
    name: "",
    district: "Central District",
    type: "Public School",
    capacity: "",
    manager: "",
  });

  const [extraFilters, setExtraFilters] = useState({
    minCapacity: "",
    maxCapacity: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const data = await shelterService.getShelterSummary();
      setSummary(data);
    } catch {
      // Calculate from local list if backend fails
      const registered = shelters.length;
      const operational = shelters.filter(
        (s) => s.status === "Active" || s.status === "Near Capacity"
      ).length;
      const nearCap = shelters.filter((s) => s.status === "Near Capacity").length;
      const maint = shelters.filter((s) => s.status === "Maintenance").length;
      setSummary({ registered, operational, nearCapacity: nearCap, maintenance: maint });
    }
  }, [shelters]);

  // Fetch shelters
  const fetchShelters = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = {
        search: debouncedSearch.trim() || undefined,
        district: district !== "All districts" ? district : undefined,
        type: type !== "All shelter types" ? type : undefined,
        status: status !== "All statuses" ? status : undefined,
        occupancy: occupancy !== "Any occupancy" ? occupancy : undefined,
        minCapacity: extraFilters.minCapacity ? Number(extraFilters.minCapacity) : undefined,
        maxCapacity: extraFilters.maxCapacity ? Number(extraFilters.maxCapacity) : undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      };

      const result = await shelterService.getShelters(params);
      setShelters(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages || 1);
    } catch {
      setErrorMessage("Could not load shelter records. Showing cached data.");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    district,
    type,
    status,
    occupancy,
    extraFilters,
    currentPage,
  ]);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // REGISTER NEW SHELTER
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const capacity = Number(newShelter.capacity);
    if (!newShelter.name.trim() || capacity <= 0) {
      setErrorMessage("Please enter a valid shelter name and positive capacity.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await shelterService.createShelter({
        name: newShelter.name.trim(),
        district: newShelter.district,
        type: newShelter.type,
        capacity,
        manager: newShelter.manager.trim() || "Not assigned",
      });

      setSuccessMessage(`Shelter "${newShelter.name}" registered successfully.`);
      setNewShelter({
        name: "",
        district: "Central District",
        type: "Public School",
        capacity: "",
        manager: "",
      });
      setModalOpen(false);
      setCurrentPage(1);
      fetchShelters();
      fetchSummary();
    } catch {
      setErrorMessage("Failed to register the shelter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // EXPORT CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allShelters = await shelterService.getAllShelters();
      const exportList = allShelters.length > 0 ? allShelters : shelters;

      const headers = [
        "Shelter ID",
        "Shelter Name",
        "District",
        "Type",
        "Capacity",
        "Occupied",
        "Available",
        "Rate",
        "Manager",
        "Status",
      ];

      const rows = exportList.map((s) => [
        s.id,
        s.name,
        s.district,
        s.type,
        s.capacity,
        s.occupied,
        s.capacity - s.occupied,
        `${Math.round((s.occupied / (s.capacity || 1)) * 100)}%`,
        s.manager,
        s.status,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `shelter-management-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage("Shelter data exported successfully.");
    } catch {
      setErrorMessage("Failed to export shelters.");
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setDistrict("All districts");
    setType("All shelter types");
    setStatus("All statuses");
    setOccupancy("Any occupancy");
    setExtraFilters({ minCapacity: "", maxCapacity: "" });
    setCurrentPage(1);
  };

  const registeredVal = summary ? summary.registered : shelters.length;
  const operationalVal = summary
    ? summary.operational
    : shelters.filter((s) => s.status === "Active" || s.status === "Near Capacity").length;
  const nearCapVal = summary
    ? summary.nearCapacity
    : shelters.filter((s) => s.status === "Near Capacity").length;
  const maintVal = summary
    ? summary.maintenance
    : shelters.filter((s) => s.status === "Maintenance").length;

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Shelter Management</span>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-500 hover:text-emerald-700 font-semibold"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Shelter Management
            </h1>
            <p className="text-[11px] text-slate-500 mt-2">
              Register, monitor, and manage emergency shelter facilities.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchShelters();
                fetchSummary();
              }}
              disabled={loading}
              title="Refresh data"
              className="h-9 px-3 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="h-9 px-4 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={14} />
              {isExporting ? "Exporting..." : "Export"}
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="h-9 px-4 bg-[#1c5d83] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              Register shelter
            </button>
          </div>
        </div>

        {/* ================= SUMMARY BAR ================= */}
        <section className="bg-white border border-[#d5e3e9] rounded-lg grid grid-cols-2 md:grid-cols-4 mb-3 py-3 shadow-sm">
          <SummaryItem value={registeredVal} label="Registered" />
          <SummaryItem value={operationalVal} label="Operational" />
          <SummaryItem value={nearCapVal} label="Near capacity" />
          <SummaryItem value={maintVal} label="Under maintenance" />
        </section>

        {/* ================= SEARCH + FILTERS ================= */}
        <section className="flex flex-col xl:flex-row gap-2 mb-3">
          {/* SEARCH */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shelter name or ID..."
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-[10px] outline-none focus:border-[#45b99b]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2">
            <FilterSelect
              value={district}
              options={districts}
              onChange={(v) => {
                setDistrict(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={type}
              options={shelterTypes}
              onChange={(v) => {
                setType(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={status}
              options={statuses}
              onChange={(v) => {
                setStatus(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={occupancy}
              options={occupancyOptions}
              onChange={(v) => {
                setOccupancy(v);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={() => setMoreFilters(!moreFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center justify-center gap-2 ${
                moreFilters
                  ? "border-[#2785b7] text-[#2785b7]"
                  : "border-[#aac4d2]"
              }`}
            >
              <SlidersHorizontal size={13} />
              More filters
            </button>
          </div>
        </section>

        {/* MORE FILTERS */}
        {moreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm animate-in fade-in">
            <div>
              <label className="text-[10px] font-semibold block mb-1.5">
                Minimum capacity
              </label>
              <input
                type="number"
                min="0"
                value={extraFilters.minCapacity}
                onChange={(e) => {
                  setExtraFilters({
                    ...extraFilters,
                    minCapacity: e.target.value,
                  });
                  setCurrentPage(1);
                }}
                placeholder="Minimum capacity"
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-[#45b99b]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold block mb-1.5">
                Maximum capacity
              </label>
              <input
                type="number"
                min="0"
                value={extraFilters.maxCapacity}
                onChange={(e) => {
                  setExtraFilters({
                    ...extraFilters,
                    maxCapacity: e.target.value,
                  });
                  setCurrentPage(1);
                }}
                placeholder="Maximum capacity"
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-[#45b99b]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="h-9 px-4 bg-[#eff5f7] rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* ================= REGISTERED SHELTERS ================= */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200">
            <div>
              <h2 className="text-xs font-semibold">Registered shelters</h2>
              <p className="text-[9px] text-slate-400 mt-1">
                {totalCount} shelters · live administrative records
              </p>
            </div>

            {/* VIEW TOGGLE */}
            <div className="flex border border-slate-200 rounded-md p-0.5">
              <button
                onClick={() => setView("list")}
                className={`w-7 h-7 flex items-center justify-center rounded ${
                  view === "list"
                    ? "bg-[#e9f3f8] text-[#267ba6]"
                    : "text-slate-400"
                }`}
                title="List view"
              >
                <List size={16} />
              </button>

              <button
                onClick={() => setView("grid")}
                className={`w-7 h-7 flex items-center justify-center rounded ${
                  view === "grid"
                    ? "bg-[#e9f3f8] text-[#267ba6]"
                    : "text-slate-400"
                }`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin text-[#1c5d83]" />
              <span className="text-xs">Loading shelter data...</span>
            </div>
          )}

          {/* LIST VIEW */}
          {!loading && view === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[#f5f9fa] border-b border-slate-200">
                  <tr className="text-[8px] text-slate-500">
                    <th className="px-3 py-3 font-medium">Shelter ID</th>
                    <th className="px-3 py-3 font-medium">Shelter Name</th>
                    <th className="px-3 py-3 font-medium">District</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Capacity</th>
                    <th className="px-3 py-3 font-medium">Occupied</th>
                    <th className="px-3 py-3 font-medium">Available</th>
                    <th className="px-3 py-3 font-medium">Rate</th>
                    <th className="px-3 py-3 font-medium">Manager</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {shelters.map((shelter) => {
                    const available = shelter.capacity - shelter.occupied;
                    const rate = Math.round(
                      (shelter.occupied / (shelter.capacity || 1)) * 100
                    );

                    return (
                      <tr
                        key={shelter.id}
                        onClick={() => setSelectedShelter(shelter)}
                        className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-[8px] transition"
                      >
                        <td className="px-3 py-3.5 font-semibold text-[#174f75]">
                          {shelter.id}
                        </td>
                        <td className="px-3 py-3.5">{shelter.name}</td>
                        <td className="px-3 py-3.5">{shelter.district}</td>
                        <td className="px-3 py-3.5">{shelter.type}</td>
                        <td className="px-3 py-3.5">{shelter.capacity}</td>
                        <td className="px-3 py-3.5">{shelter.occupied}</td>
                        <td className="px-3 py-3.5">{available}</td>
                        <td className="px-3 py-3.5">{rate}%</td>
                        <td className="px-3 py-3.5">{shelter.manager}</td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={shelter.status} />
                        </td>
                        <td className="px-3 py-3.5">
                          <ChevronRight size={13} className="text-slate-400" />
                        </td>
                      </tr>
                    );
                  })}

                  {shelters.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-12 text-xs text-slate-400"
                      >
                        No shelters found. Try changing your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* GRID VIEW */}
          {!loading && view === "grid" && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shelters.map((shelter) => {
                const rate = Math.round(
                  (shelter.occupied / (shelter.capacity || 1)) * 100
                );

                return (
                  <button
                    key={shelter.id}
                    onClick={() => setSelectedShelter(shelter)}
                    className="border border-slate-200 rounded-lg p-4 text-left hover:border-[#45b99b] transition"
                  >
                    <div className="flex justify-between items-center">
                      <Building2 size={19} className="text-[#2785b7]" />
                      <StatusBadge status={shelter.status} />
                    </div>

                    <h3 className="text-xs font-semibold mt-4">
                      {shelter.name}
                    </h3>
                    <p className="text-[9px] text-slate-400 mt-1">
                      {shelter.id} · {shelter.district}
                    </p>

                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] mb-2">
                        <span>Occupancy</span>
                        <span className="font-semibold">{rate}%</span>
                      </div>

                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#45b99b] rounded-full"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4 text-[9px]">
                      <span className="text-slate-400">Capacity</span>
                      <span className="font-semibold">{shelter.capacity}</span>
                    </div>
                  </button>
                );
              })}

              {shelters.length === 0 && (
                <div className="col-span-full text-center py-12 text-xs text-slate-400">
                  No shelters found. Try changing your filters.
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}
          <div className="px-3.5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              Showing{" "}
              {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              {"–"}
              {Math.min(currentPage * itemsPerPage, totalCount)}
              {" of "}
              {totalCount}
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-8 rounded-lg border text-[9px] ${
                      currentPage === page
                        ? "bg-[#1c638a] text-white border-[#1c638a]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* SHELTER DETAIL PANEL */}
        {selectedShelter && (
          <div className="fixed inset-0 z-40 bg-black/30 flex justify-end animate-in fade-in">
            <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Shelter details</h2>
                <button
                  onClick={() => setSelectedShelter(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6">
                <div className="w-12 h-12 rounded-lg bg-[#eaf3f8] text-[#267ba6] flex items-center justify-center">
                  <Building2 size={23} />
                </div>

                <h3 className="text-lg font-semibold mt-4">
                  {selectedShelter.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedShelter.id}
                </p>

                <div className="mt-4">
                  <StatusBadge status={selectedShelter.status} />
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs">
                <DetailRow label="District" value={selectedShelter.district} />
                <DetailRow label="Shelter type" value={selectedShelter.type} />
                <DetailRow label="Manager" value={selectedShelter.manager} />
                <DetailRow
                  label="Total capacity"
                  value={String(selectedShelter.capacity)}
                />
                <DetailRow
                  label="Occupied"
                  value={String(selectedShelter.occupied)}
                />
                <DetailRow
                  label="Available spaces"
                  value={String(
                    selectedShelter.capacity - selectedShelter.occupied
                  )}
                />
                <DetailRow
                  label="Occupancy rate"
                  value={`${Math.round(
                    (selectedShelter.occupied /
                      (selectedShelter.capacity || 1)) *
                      100
                  )}%`}
                />
              </div>

              <button
                onClick={() => setSelectedShelter(null)}
                className="w-full mt-8 bg-[#1c5d83] hover:bg-[#144665] text-white py-3 rounded-lg text-xs font-semibold transition"
              >
                Close details
              </button>
            </div>
          </div>
        )}

        {/* REGISTER SHELTER MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Register shelter</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Add a new emergency shelter facility.
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <FormInput
                  label="Shelter name"
                  value={newShelter.name}
                  placeholder="Enter shelter name"
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, name: v })
                  }
                />

                <FormSelect
                  label="District"
                  value={newShelter.district}
                  options={districts.slice(1)}
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, district: v })
                  }
                />

                <FormSelect
                  label="Shelter type"
                  value={newShelter.type}
                  options={shelterTypes.slice(1)}
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, type: v })
                  }
                />

                <FormInput
                  label="Total capacity"
                  type="number"
                  value={newShelter.capacity}
                  placeholder="Enter total beds"
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, capacity: v })
                  }
                />

                <FormInput
                  label="Shelter manager"
                  value={newShelter.manager}
                  placeholder="Enter manager name"
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, manager: v })
                  }
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setModalOpen(false)}
                    className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1c5d83] hover:bg-[#144665] text-white rounded-lg py-3 text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Register shelter</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function SummaryItem({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-1 border-r last:border-r-0 border-slate-200">
      <span className="text-sm font-bold">{value}</span>
      <span className="text-[9px] text-slate-400">{label}</span>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full xl:w-[125px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-7 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ShelterStatus }) {
  const styles: Record<ShelterStatus, string> = {
    "Near Capacity": "bg-[#fff4df] text-[#bd821b]",
    Active: "bg-[#e4f7f0] text-[#259c79]",
    Full: "bg-[#fff0f1] text-[#d94d59]",
    Maintenance: "bg-[#edf1f4] text-[#62798a]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${
        styles[status] || styles.Active
      }`}
    >
      {status}
    </span>
  );
}

function FormInput({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input
        required
        type={type}
        min={type === "number" ? 1 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}
