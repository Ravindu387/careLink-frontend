import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Globe,
  Accessibility,
  Bell,
  Home,
  Plus,
  ClipboardList,
  Map,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  Phone,
  ChevronRight,
  Utensils,
  Cross,
  Truck,
  Package,
  Menu,
  X,
  MapPin,
  Navigation,
  Filter,
  List,
  MapPinned,
  Clock,
  CheckCircle2,
  LocateFixed,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Info,
  Building2,
  Activity,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import {
  nearbySupportService,
  MOCK_SUPPORT_LOCATIONS,
} from "../../services/nearbySupportService";
import type {
  SupportLocation,
  NearbySupportSummary,
} from "../../types/nearbySupport";

export default function NearbySupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All support");
  const [availability, setAvailability] = useState("Open now");
  const [distance, setDistance] = useState("Within 5 km");
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [locations, setLocations] = useState<SupportLocation[]>(MOCK_SUPPORT_LOCATIONS);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [summary, setSummary] = useState<NearbySupportSummary>({
    totalLocations: MOCK_SUPPORT_LOCATIONS.length,
    openCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.status !== "Full").length,
    sheltersCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.category.includes("shelter")).length,
    medicalCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.category.includes("Medical")).length,
    supportCentresCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.category.includes("Support centre")).length,
  });

  // UI & Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Fetch Locations
  const fetchLocations = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await nearbySupportService.getLocations({
        search: search.trim() || undefined,
        category: category !== "All support" ? category : undefined,
        availability: availability !== "All availability" ? availability : undefined,
        distance: distance !== "Any distance" ? distance : undefined,
      });

      setLocations(data);
      setIsBackendConnected(true);

      // Fetch summary
      try {
        const sum = await nearbySupportService.getSummary();
        setSummary(sum);
      } catch {
        setSummary({
          totalLocations: data.length,
          openCount: data.filter((l) => l.status !== "Full").length,
          sheltersCount: data.filter((l) => l.category.toLowerCase().includes("shelter")).length,
          medicalCount: data.filter((l) => l.category.toLowerCase().includes("medical")).length,
          supportCentresCount: data.filter((l) => l.category.toLowerCase().includes("support")).length,
        });
      }
    } catch (err) {
      console.warn("Backend API offline, using local mock support locations:", err);
      setIsBackendConnected(false);

      // Client-side fallback filter
      let fallbackList = [...MOCK_SUPPORT_LOCATIONS];

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        fallbackList = fallbackList.filter(
          (place) =>
            place.name.toLowerCase().includes(q) ||
            place.address.toLowerCase().includes(q) ||
            place.services.some((s) => s.toLowerCase().includes(q))
        );
      }

      if (category !== "All support") {
        fallbackList = fallbackList.filter((place) => {
          if (category === "Shelters") return place.category === "Emergency shelter";
          if (category === "Medical") return place.category === "Medical support";
          if (category === "Support centres") return place.category === "Support centre";
          return place.category.toLowerCase() === category.toLowerCase();
        });
      }

      if (availability !== "All availability") {
        fallbackList = fallbackList.filter((place) => {
          if (availability === "Open now") return place.status !== "Full";
          if (availability === "Space available") return place.status === "Space available";
          return true;
        });
      }

      if (distance !== "Any distance") {
        fallbackList = fallbackList.filter((place) => {
          const distNum = parseFloat(place.distance);
          if (distance === "Within 2 km") return distNum <= 2;
          if (distance === "Within 5 km") return distNum <= 5;
          return true;
        });
      }

      setLocations(fallbackList);
      setSummary({
        totalLocations: MOCK_SUPPORT_LOCATIONS.length,
        openCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.status !== "Full").length,
        sheltersCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.category.includes("shelter")).length,
        medicalCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.category.includes("Medical")).length,
        supportCentresCount: MOCK_SUPPORT_LOCATIONS.filter((l) => l.category.includes("Support centre")).length,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, category, availability, distance]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Selected Place Object
  const selectedPlace = locations.find((place) => place.id === selected) || null;

  // Icon Helper
  const getLocationIcon = (place: SupportLocation) => {
    const cat = place.category.toLowerCase();
    if (cat.includes("medical")) return <Cross size={18} />;
    if (cat.includes("shelter")) return <House size={18} />;
    return <Building2 size={18} />;
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Nearby Support"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT CONTAINER */}
        <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
          {/* TOAST FEEDBACK NOTIFICATION */}
          {feedbackToast && (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-md transition-all ${
                feedbackToast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedbackToast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : feedbackToast.type === "error" ? (
                  <AlertCircle size={16} className="text-red-600" />
                ) : (
                  <Info size={16} className="text-sky-600" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PAGE HEADER & CONTROLS */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  Nearby Support
                </h2>

                {/* BACKEND STATUS BADGE */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs">
                  {isBackendConnected === true ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Wifi size={11} /> Backend API Online
                      </span>
                    </>
                  ) : isBackendConnected === false ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-700 flex items-center gap-1">
                        <WifiOff size={11} /> Local Fallback Mode
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Connecting...</span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Find verified emergency shelters, supply hubs, medical clinics, and relief centres in your vicinity.
              </p>
            </div>

            {/* ACTION CONTROLS & VIEW TOGGLE */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchLocations()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition"
                title="Refresh facility list"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-[#287da6]" : "text-slate-500"}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div className="flex rounded-lg bg-slate-200 p-1 shadow-xs">
                <button
                  onClick={() => setView("map")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    view === "map"
                      ? "bg-white text-[#287da6] shadow-xs"
                      : "text-slate-600 hover:text-[#287da6]"
                  }`}
                >
                  <MapPinned size={14} />
                  Map
                </button>

                <button
                  onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    view === "list"
                      ? "bg-white text-[#287da6] shadow-xs"
                      : "text-slate-600 hover:text-[#287da6]"
                  }`}
                >
                  <List size={14} />
                  List
                </button>
              </div>
            </div>
          </section>

          {/* KPI COUNTERS */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Facilities
              </span>
              <p className="mt-1.5 text-xl font-bold text-[#173d5b]">
                {summary.totalLocations}
              </p>
              <p className="text-xs text-slate-400">Active regional points</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Open Now
              </span>
              <p className="mt-1.5 text-xl font-bold text-emerald-600">
                {summary.openCount}
              </p>
              <p className="text-xs text-slate-400">Immediate access</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#287da6]">
                Shelters
              </span>
              <p className="mt-1.5 text-xl font-bold text-[#287da6]">
                {summary.sheltersCount}
              </p>
              <p className="text-xs text-slate-400">Displacement centers</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Medical Clinics
              </span>
              <p className="mt-1.5 text-xl font-bold text-rose-600">
                {summary.medicalCount}
              </p>
              <p className="text-xs text-slate-400">First aid & prescriptions</p>
            </div>
          </section>

          {/* SEARCH & FILTERS BAR */}
          <section className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative min-w-[200px] flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search facility name, address, or service (e.g. Food, Medical)..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm sm:text-[15px] outline-none focus:border-[#287da6] focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:text-[15px] text-slate-700 outline-none focus:border-[#287da6]"
            >
              <option>All support</option>
              <option>Shelters</option>
              <option>Medical</option>
              <option>Support centres</option>
            </select>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:text-[15px] text-slate-700 outline-none focus:border-[#287da6]"
            >
              <option>Open now</option>
              <option>All availability</option>
              <option>Space available</option>
            </select>

            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:text-[15px] text-slate-700 outline-none focus:border-[#287da6]"
            >
              <option>Within 5 km</option>
              <option>Within 2 km</option>
              <option>Any distance</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                showFilters
                  ? "border-[#287da6] bg-sky-50 text-[#287da6]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Filter size={13} />
              Filter Info
            </button>
          </section>

          {/* EXPANDABLE FILTER INFO BANNER */}
          {showFilters && (
            <div className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50/70 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div>
                <p className="text-sm font-bold text-[#173d5b]">Active Filter Criteria</p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Showing <strong>{category}</strong> • Availability: <strong>{availability}</strong> • Radius: <strong>{distance}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setCategory("All support");
                  setAvailability("Open now");
                  setDistance("Within 5 km");
                  setSearch("");
                }}
                className="rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#287da6] hover:bg-sky-50 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* VIEW: MAP VS LIST */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <RefreshCw size={28} className="animate-spin text-[#287da6]" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Finding nearby support facilities...
              </p>
            </div>
          ) : view === "map" ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              {/* INTERACTIVE VECTOR MAP */}
              <div className="relative h-[480px] sm:h-[580px] overflow-hidden rounded-xl border border-slate-200 bg-[#e8f0ed] shadow-xs">
                {/* MAP GRID TEXTURE */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: `
                      linear-gradient(30deg, transparent 46%, white 47%, white 49%, transparent 50%),
                      linear-gradient(150deg, transparent 46%, white 47%, white 49%, transparent 50%)
                    `,
                    backgroundSize: "75px 75px",
                  }}
                />

                {/* RIVER CORRIDOR */}
                <div className="absolute left-[-10%] top-[47%] h-8 w-[125%] -rotate-[19deg] bg-[#b9dce5] shadow-xs flex items-center justify-center">
                  <span className="text-xs font-bold tracking-widest text-sky-800/60 uppercase">
                    Riverton Waterway
                  </span>
                </div>

                {/* ROAD VECTORS */}
                <div className="absolute left-[15%] top-0 h-[110%] w-3.5 -rotate-[45deg] bg-white/90 shadow-xs" />
                <div className="absolute left-[47%] top-0 h-[110%] w-3.5 rotate-[45deg] bg-white/90 shadow-xs" />
                <div className="absolute left-[75%] top-0 h-[110%] w-3.5 -rotate-[45deg] bg-white/90 shadow-xs" />

                {/* AREA LABELS */}
                <div className="absolute left-[8%] top-[8%] rounded bg-white/80 px-2 py-0.5 text-xs font-bold tracking-wider text-slate-500 shadow-xs">
                  NORTH WARD SECTOR
                </div>

                <div className="absolute bottom-[10%] right-[8%] rounded bg-white/80 px-2 py-0.5 text-xs font-bold tracking-wider text-slate-500 shadow-xs">
                  CENTRAL WARD RELIEF ZONE
                </div>

                {/* LOCATION MARKERS */}
                {locations.map((place) => {
                  const active = selected === place.id;
                  const isFull = place.status.toLowerCase() === "full";

                  return (
                    <button
                      key={place.id}
                      onClick={() => setSelected(place.id)}
                      style={{
                        left: `${place.x}%`,
                        top: `${place.y}%`,
                      }}
                      className={`absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white shadow-lg transition-transform hover:scale-110 ${
                        active
                          ? "scale-125 bg-[#153e5e] text-white ring-4 ring-sky-300"
                          : isFull
                          ? "bg-red-600 text-white"
                          : "bg-[#25866e] text-white"
                      }`}
                      title={`${place.name} (${place.status})`}
                    >
                      {getLocationIcon(place)}
                    </button>
                  );
                })}

                {/* CITIZEN LOCATION MARKER */}
                <div className="absolute left-[50%] top-[53%] z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#153e5e] text-white shadow-lg animate-bounce">
                    <Navigation size={15} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                  </div>
                  <span className="mt-1 whitespace-nowrap rounded-md bg-[#153e5e] px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                    Your Location (Riverside Lane)
                  </span>
                </div>

                {/* MAP CONTROLS */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-[#287da6] shadow-md hover:bg-slate-50 transition"
                    title="Center on my location"
                  >
                    <LocateFixed size={18} />
                  </button>
                </div>

                {/* MAP LEGEND */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-xs">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#25866e]" />
                    Open / Space Available
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    Full / Closed
                  </span>
                </div>

                {/* SELECTED LOCATION POPUP ON MAP */}
                {selectedPlace && (
                  <div className="absolute left-1/2 top-4 z-20 w-[90%] max-w-[320px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          {selectedPlace.status}
                        </span>
                        <h4 className="mt-1.5 text-sm font-bold text-[#173d5b] truncate">
                          {selectedPlace.name}
                        </h4>
                        <p className="mt-0.5 text-[13px] text-slate-500">
                          {selectedPlace.distance} • {selectedPlace.address}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelected(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {selectedPlace.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5">
                      <a
                        href={`tel:${selectedPlace.phone}`}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#287da6] py-1.5 text-xs font-semibold text-white hover:bg-[#1e668e]"
                      >
                        <Phone size={11} /> Call
                      </a>
                      <button
                        onClick={() => {
                          const element = document.getElementById("selected-facility-details");
                          element?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SIDEBAR LIST IN MAP VIEW */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
                  <h3 className="text-base font-bold text-[#173d5b]">
                    Facilities in Range
                  </h3>
                  <span className="text-sm font-semibold text-[#287da6]">
                    {locations.length} found
                  </span>
                </div>

                <div className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto">
                  {locations.map((place) => {
                    const active = selected === place.id;
                    const isFull = place.status.toLowerCase() === "full";

                    return (
                      <button
                        key={place.id}
                        onClick={() => setSelected(place.id)}
                        className={`w-full p-3.5 text-left transition hover:bg-slate-50/80 ${
                          active ? "bg-sky-50/80 border-l-4 border-l-[#287da6]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                              isFull
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {place.status}
                          </span>
                          <span className="text-[13px] font-semibold text-slate-400">
                            {place.distance}
                          </span>
                        </div>

                        <p className="mt-1.5 text-sm font-bold text-[#173d5b]">
                          {place.name}
                        </p>

                        <p className="mt-0.5 text-[13px] text-slate-500">
                          {place.category} · {place.address}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {place.services.map((svc) => (
                            <span
                              key={svc}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}

                  {locations.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No matching support locations found in this search radius.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-3.5">
              {locations.map((place) => {
                const isFull = place.status.toLowerCase() === "full";
                const isSelected = selected === place.id;

                return (
                  <div
                    key={place.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border bg-white p-4.5 shadow-xs transition hover:border-[#287da6]/40 hover:shadow-md ${
                      isSelected ? "border-[#287da6] ring-2 ring-sky-100" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f4f1] text-[#25866e] shadow-xs">
                        {getLocationIcon(place)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#173d5b]">
                            {place.name}
                          </h3>
                          <span className="text-[13px] text-slate-400 font-semibold">
                            • {place.distance}
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {place.category} · {place.address} · {place.hours}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {place.services.map((svc) => (
                            <span
                              key={svc}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:self-center">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                          isFull
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {place.status}
                      </span>

                      <button
                        onClick={() => setSelected(place.id)}
                        className="rounded-lg bg-[#287da6] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1e668e] transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}

              {locations.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                  <MapPin size={32} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-bold">No support centers matched your filters</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try loosening distance or availability filters to locate further facilities.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SELECTED LOCATION EXPANDED DETAILS PANEL */}
          {selectedPlace && (
            <div
              id="selected-facility-details"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f4f1] text-[#25866e] shadow-xs">
                    {getLocationIcon(selectedPlace)}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#287da6]">
                      {selectedPlace.category}
                    </span>
                    <h3 className="text-base font-bold text-[#173d5b]">
                      {selectedPlace.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {selectedPlace.description}
              </p>

              {/* DETAILS STATS */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[#287da6]">
                    <MapPin size={15} />
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Address & Sector
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#173d5b]">
                    {selectedPlace.address}
                  </p>
                  <p className="text-[13px] text-slate-400">{selectedPlace.distance} from you</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[#287da6]">
                    <Clock size={15} />
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Operating Hours
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#173d5b]">
                    {selectedPlace.hours}
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">{selectedPlace.status}</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[#287da6]">
                    <Phone size={15} />
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Direct Helpline
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#173d5b]">
                    {selectedPlace.phone}
                  </p>
                  <p className="text-[13px] text-slate-400">Staffed hotline</p>
                </div>
              </div>

              {/* SERVICES LIST */}
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Available Services & Facilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPlace.services.map((svc) => (
                    <span
                      key={svc}
                      className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-[#287da6] border border-sky-100"
                    >
                      ✓ {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap gap-2.5 border-t border-slate-100 pt-4">
                <a
                  href={`tel:${selectedPlace.phone}`}
                  className="flex items-center gap-1.5 rounded-lg bg-[#287da6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e668e] transition"
                >
                  <Phone size={13} />
                  Call Support Center
                </a>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[13px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Nearby Support Network</p>
            <p className="flex items-center gap-1.5">
              <Heart size={12} className="text-rose-500 fill-rose-500" />
              Verified humanitarian crisis facilities
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
