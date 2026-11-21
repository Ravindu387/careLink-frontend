import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  Globe,
  Accessibility as AccessIcon,
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
  Menu,
  X,
  MapPin,
  Clock,
  Utensils,
  Cross,
  CheckCircle,
  BedDouble,
  Navigation,
  Filter,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  Sparkles,
  Copy,
  Building2,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  shelterService,
  MOCK_SHELTERS,
} from "../../services/shelterService";
import type {
  Shelter,
  ShelterSummary,
  RequestShelterSpacePayload,
  ShelterBooking,
} from "../../types/shelter";

const AREA_OPTIONS = [
  "All areas",
  "Central Ward",
  "North Ward",
  "West District",
  "Eastbank",
];

const SERVICE_OPTIONS = [
  "All services",
  "Food",
  "Medical",
  "Families",
  "Pets",
  "Childcare",
];

export default function SheltersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const citizenName = user?.fullName || "Samira Khan";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Filters State
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All areas");
  const [distance, setDistance] = useState("Any distance");
  const [availability, setAvailability] = useState("All statuses");
  const [accessibility, setAccessibility] = useState("All");
  const [service, setService] = useState("All services");

  // Data State
  const [shelters, setShelters] = useState<Shelter[]>(MOCK_SHELTERS);
  const [summary, setSummary] = useState<ShelterSummary>({
    totalShelters: MOCK_SHELTERS.length,
    availableSheltersCount: MOCK_SHELTERS.filter((s) => s.availability > 0).length,
    fullSheltersCount: MOCK_SHELTERS.filter((s) => s.availability <= 0).length,
    totalCapacity: MOCK_SHELTERS.reduce((acc, s) => acc + s.capacity, 0),
    totalAvailableSpaces: MOCK_SHELTERS.reduce((acc, s) => acc + s.availability, 0),
    totalOccupiedSpaces: MOCK_SHELTERS.reduce((acc, s) => acc + s.occupied, 0),
    accessibleCount: MOCK_SHELTERS.filter((s) => s.accessible).length,
    nearestAvailableShelter: MOCK_SHELTERS[0],
  });

  // Modals
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [reservingShelter, setReservingShelter] = useState<Shelter | null>(null);
  const [bookingResult, setBookingResult] = useState<ShelterBooking | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Reservation Form
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [contactPhone, setContactPhone] = useState("+94 77 123 4567");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  // Fetch Shelters from Backend API
  const loadShelters = useCallback(async () => {
    try {
      setLoading(true);
      let maxDist: number | undefined;
      if (distance === "Within 2 km") maxDist = 2;
      else if (distance === "Within 5 km") maxDist = 5;
      else if (distance === "Within 10 km") maxDist = 10;

      const [fetchedShelters, fetchedSummary] = await Promise.all([
        shelterService.getShelters({
          search: search.trim() || undefined,
          area: area !== "All areas" ? area : undefined,
          maxDistance: maxDist,
          availability: availability !== "All statuses" ? availability : undefined,
          accessibleOnly: accessibility === "Accessible only" ? true : undefined,
          service: service !== "All services" ? service : undefined,
        }),
        shelterService.getSummary(),
      ]);

      setShelters(fetchedShelters);
      setSummary(fetchedSummary);
      setIsOnline(true);
    } catch (err) {
      console.warn("Could not connect to backend, utilizing offline local fallback:", err);
      setIsOnline(false);

      // Fallback local filter
      let filtered = [...MOCK_SHELTERS];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.area.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        );
      }
      if (area !== "All areas") {
        filtered = filtered.filter((s) => s.area.toLowerCase() === area.toLowerCase());
      }
      if (distance === "Within 2 km") filtered = filtered.filter((s) => s.distance <= 2);
      if (distance === "Within 5 km") filtered = filtered.filter((s) => s.distance <= 5);
      if (availability !== "All statuses") {
        filtered = filtered.filter((s) => s.status === availability);
      }
      if (accessibility === "Accessible only") {
        filtered = filtered.filter((s) => s.accessible);
      }
      if (service !== "All services") {
        const sv = service.toLowerCase();
        filtered = filtered.filter((s) =>
          s.services.some((item) => item.toLowerCase().includes(sv))
        );
      }
      setShelters(filtered);
    } finally {
      setLoading(false);
    }
  }, [search, area, distance, availability, accessibility, service]);

  useEffect(() => {
    loadShelters();
  }, [loadShelters]);

  // Handle Space Booking Submission
  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservingShelter) return;

    try {
      setSubmittingBooking(true);
      setBookingError(null);

      const payload: RequestShelterSpacePayload = {
        shelterId: reservingShelter.id,
        citizenName,
        contactPhone,
        numberOfPeople,
        specialNeeds: specialNeeds.trim() || undefined,
      };

      const result = await shelterService.requestSpace(payload);
      setBookingResult(result);
      // Reload shelters to reflect updated availability
      loadShelters();
    } catch (err: any) {
      setBookingError(err.message || "Failed to reserve shelter space. Please try again.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleResetFilters = () => {
    setSearch("");
    setArea("All areas");
    setDistance("Any distance");
    setAvailability("All statuses");
    setAccessibility("All");
    setService("All services");
  };

  const nearest = summary.nearestAvailableShelter || shelters.find((s) => s.availability > 0) || shelters[0];

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Shelters"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen transition-all duration-300 lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
          {/* HEADER SECTION */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Emergency Shelters
                </h1>

                {/* API Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm ${
                    isOnline
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                  title={
                    isOnline
                      ? "Connected to CareLink Backend API"
                      : "Offline Fallback Mode (showing cached shelter data)"
                  }
                >
                  {isOnline ? (
                    <Wifi size={13} className="text-emerald-600 animate-pulse" />
                  ) : (
                    <WifiOff size={13} className="text-amber-600" />
                  )}
                  <span>{isOnline ? "Live Shelter Feed" : "Offline Fallback Mode"}</span>
                </div>

                <button
                  onClick={loadShelters}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#287da6] disabled:opacity-50"
                  title="Reload shelters data"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Live space capacity, accessibility accommodations, medical support, and space reservations.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/citizen/nearby-support")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#287da6] hover:bg-slate-50 shadow-sm"
              >
                <MapPin size={15} />
                View on Map
              </button>

              {/* View mode toggle */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "table"
                      ? "bg-[#287da6] text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="Table view"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "cards"
                      ? "bg-[#287da6] text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="Card grid view"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Available Spaces
                </span>
                <BedDouble size={16} className="text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-800">
                {summary.totalAvailableSpaces}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Ready for immediate intake
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#287da6]">
                  Open Facilities
                </span>
                <Building2 size={16} className="text-[#287da6]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#173d5b]">
                {summary.availableSheltersCount} of {summary.totalShelters}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Operating 24/7 relief centres
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/80 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Accessible Shelters
                </span>
                <AccessIcon size={16} className="text-purple-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-900">
                {summary.accessibleCount}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Wheelchair & elder equipped
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Shelter Capacity
                </span>
                <Users size={16} className="text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#173d5b]">
                {summary.totalOccupiedSpaces} / {summary.totalCapacity}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {summary.totalCapacity > 0
                  ? Math.round((summary.totalOccupiedSpaces / summary.totalCapacity) * 100)
                  : 0}
                % District Occupancy
              </p>
            </div>
          </div>

          {/* NEAREST AVAILABLE SHELTER SPOTLIGHT HERO */}
          {nearest && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#153e5e] p-5 text-white shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 shadow-inner">
                  <House size={28} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      ★ Recommended Nearest Shelter
                    </span>
                    {nearest.accessible && (
                      <span className="rounded-md bg-sky-400/20 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                        Accessible
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 text-lg font-bold">
                    {nearest.name}
                  </h3>

                  <p className="mt-1 text-xs text-sky-200">
                    {nearest.distance} km away · {nearest.area} ·{" "}
                    <span className="font-semibold text-emerald-300">
                      {nearest.availability} spaces remaining
                    </span>{" "}
                    (Capacity: {nearest.capacity})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedShelter(nearest)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setReservingShelter(nearest);
                    setBookingResult(null);
                  }}
                  className="rounded-xl bg-[#287da6] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#3692bb] transition"
                >
                  Reserve Space
                </button>
              </div>
            </div>
          )}

          {/* SEARCH AND ADVANCED FILTERS BAR */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shelters, areas, or addresses..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-8 text-xs text-[#173d5b] outline-none transition focus:border-[#287da6] focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Area Filter */}
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none cursor-pointer hover:border-slate-300"
            >
              {AREA_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {/* Distance Filter */}
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none cursor-pointer hover:border-slate-300"
            >
              <option>Any distance</option>
              <option>Within 2 km</option>
              <option>Within 5 km</option>
              <option>Within 10 km</option>
            </select>

            {/* Availability / Status Filter */}
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none cursor-pointer hover:border-slate-300"
            >
              <option>All statuses</option>
              <option>Space available</option>
              <option>Full</option>
            </select>

            {/* Accessibility Filter */}
            <select
              value={accessibility}
              onChange={(e) => setAccessibility(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none cursor-pointer hover:border-slate-300"
            >
              <option>All facilities</option>
              <option>Accessible only</option>
            </select>

            {/* Services Filter */}
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none cursor-pointer hover:border-slate-300"
            >
              {SERVICE_OPTIONS.map((sv) => (
                <option key={sv} value={sv}>
                  {sv}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(search ||
              area !== "All areas" ||
              distance !== "Any distance" ||
              availability !== "All statuses" ||
              accessibility !== "All" ||
              service !== "All services") && (
              <button
                onClick={handleResetFilters}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-[#287da6] hover:bg-slate-50 transition"
              >
                Reset
              </button>
            )}
          </div>

          {/* VIEW MODE: TABLE */}
          {viewMode === "table" ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-xs">
                  <thead className="border-b border-slate-100 bg-[#f7f9fa] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Shelter & Location</th>
                      <th className="px-4 py-3.5">Area</th>
                      <th className="px-4 py-3.5">Distance</th>
                      <th className="px-4 py-3.5">Live Occupancy</th>
                      <th className="px-4 py-3.5">Key Services</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {shelters.map((shelter) => {
                      const occupancyRate =
                        shelter.capacity > 0
                          ? Math.round(
                              ((shelter.capacity - shelter.availability) /
                                shelter.capacity) *
                                100
                            )
                          : 100;

                      return (
                        <tr
                          key={shelter.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#287da6] shrink-0">
                                <House size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-[#173d5b]">
                                  {shelter.name}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {shelter.address}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-slate-600 font-medium">
                            {shelter.area}
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {shelter.distance} km
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-bold text-[#173d5b]">
                                  {shelter.availability} spaces free
                                </span>
                                <span className="text-slate-400">
                                  {occupancyRate}%
                                </span>
                              </div>
                              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    occupancyRate >= 90
                                      ? "bg-red-500"
                                      : occupancyRate >= 60
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${occupancyRate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {shelter.services.map((sv, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                                >
                                  {sv}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                shelter.status === "Space available"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  shelter.status === "Space available"
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {shelter.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedShelter(shelter)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#287da6]"
                                title="View details"
                              >
                                <ChevronRight size={17} />
                              </button>
                              <button
                                disabled={shelter.status === "Full"}
                                onClick={() => {
                                  setReservingShelter(shelter);
                                  setBookingResult(null);
                                }}
                                className="rounded-lg bg-[#287da6] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1f6486] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 transition"
                              >
                                Reserve
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {shelters.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-12 text-center text-xs text-slate-400"
                        >
                          <House className="mx-auto text-slate-300 mb-2" size={32} />
                          <p className="font-bold text-[#173d5b]">No shelters match your criteria</p>
                          <p className="mt-1">Try adjusting the distance or clearing filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
                <p>Showing {shelters.length} emergency evacuation centres</p>
                <p>Live occupancy verified by Municipal Emergency Desk</p>
              </div>
            </div>
          ) : (
            /* VIEW MODE: CARDS */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shelters.map((shelter) => {
                const occupancyRate =
                  shelter.capacity > 0
                    ? Math.round(
                        ((shelter.capacity - shelter.availability) /
                          shelter.capacity) *
                          100
                      )
                    : 100;

                return (
                  <div
                    key={shelter.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#287da6]">
                          <House size={20} />
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            shelter.status === "Space available"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {shelter.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-[#173d5b]">
                        {shelter.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {shelter.area} · {shelter.distance} km away
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {shelter.address}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[#173d5b]">
                            {shelter.availability} spaces remaining
                          </span>
                          <span className="text-slate-400">
                            {shelter.occupied}/{shelter.capacity}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              occupancyRate >= 90
                                ? "bg-red-500"
                                : occupancyRate >= 60
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mt-4 flex flex-wrap gap-1">
                        {shelter.services.map((sv, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {sv}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setSelectedShelter(shelter)}
                        className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Details
                      </button>
                      <button
                        disabled={shelter.status === "Full"}
                        onClick={() => {
                          setReservingShelter(shelter);
                          setBookingResult(null);
                        }}
                        className="flex-1 rounded-xl bg-[#287da6] py-2 text-xs font-bold text-white hover:bg-[#1f6486] disabled:bg-slate-200 disabled:text-slate-400 transition"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SHELTER DETAIL MODAL */}
          {selectedShelter && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        selectedShelter.status === "Space available"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {selectedShelter.status}
                    </span>
                    <h2 className="mt-1 text-base font-bold text-[#173d5b]">
                      {selectedShelter.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedShelter(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Details Grid */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <MapPin size={16} className="mx-auto text-[#287da6]" />
                    <p className="mt-1 text-[10px] text-slate-400">Area</p>
                    <p className="text-xs font-bold text-[#173d5b]">
                      {selectedShelter.area}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <BedDouble size={16} className="mx-auto text-[#287da6]" />
                    <p className="mt-1 text-[10px] text-slate-400">Free Spaces</p>
                    <p className="text-xs font-bold text-emerald-700">
                      {selectedShelter.availability} beds
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <Clock size={16} className="mx-auto text-[#287da6]" />
                    <p className="mt-1 text-[10px] text-slate-400">Distance</p>
                    <p className="text-xs font-bold text-[#173d5b]">
                      {selectedShelter.distance} km
                    </p>
                  </div>
                </div>

                {/* Address & Hours */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <p>
                    <strong>Address:</strong> {selectedShelter.address}
                  </p>
                  <p>
                    <strong>Operating Schedule:</strong> {selectedShelter.operatingHours}
                  </p>
                  <p>
                    <strong>Shelter Manager:</strong> {selectedShelter.managerName}
                  </p>
                  <p>
                    <strong>Direct Intake Phone:</strong>{" "}
                    <a
                      href={`tel:${selectedShelter.contactPhone}`}
                      className="font-semibold text-[#287da6] underline"
                    >
                      {selectedShelter.contactPhone}
                    </a>
                  </p>
                </div>

                {/* Services list */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-[#173d5b] mb-1.5">
                    Available Relief Services & Facilities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedShelter.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-[#287da6]"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setSelectedShelter(null)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    Close
                  </button>

                  <button
                    disabled={selectedShelter.status === "Full"}
                    onClick={() => {
                      setReservingShelter(selectedShelter);
                      setSelectedShelter(null);
                      setBookingResult(null);
                    }}
                    className="rounded-xl bg-[#287da6] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1f6486] disabled:bg-slate-200 disabled:text-slate-400 transition"
                  >
                    Reserve Space
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SPACE RESERVATION MODAL */}
          {reservingShelter && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                {!bookingResult ? (
                  <form onSubmit={handleConfirmReservation} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#287da6]">
                          Reserve Shelter Space
                        </span>
                        <h3 className="text-base font-bold text-[#173d5b]">
                          {reservingShelter.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReservingShelter(null)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {bookingError && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-[#173d5b] mb-1">
                        Primary Household Contact
                      </label>
                      <input
                        type="text"
                        value={citizenName}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#173d5b] mb-1">
                        Contact Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none focus:border-[#287da6]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#173d5b] mb-1">
                        Number of Persons Requiring Beds *
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setNumberOfPeople((n) => Math.max(1, n - 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="w-16 text-center text-sm font-bold text-[#173d5b]">
                          {numberOfPeople} {numberOfPeople === 1 ? "person" : "people"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setNumberOfPeople((n) =>
                              Math.min(reservingShelter.availability, n + 1)
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Maximum {reservingShelter.availability} spaces currently available.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#173d5b] mb-1">
                        Special Accommodations (Optional)
                      </label>
                      <input
                        type="text"
                        value={specialNeeds}
                        onChange={(e) => setSpecialNeeds(e.target.value)}
                        placeholder="e.g. Wheelchair access, infant crib, pet dog"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none focus:border-[#287da6]"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-sky-50 p-3 text-[11px] text-sky-800">
                      Spaces are held for 3 hours from reservation time. Please present the booking reference code upon arrival at intake.
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setReservingShelter(null)}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingBooking}
                        className="rounded-xl bg-[#287da6] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1f6486] disabled:opacity-60 transition"
                      >
                        {submittingBooking ? "Confirming..." : "Confirm Reservation"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* SUCCESS CONFIRMATION VOUCHER */
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={32} />
                    </div>

                    <h3 className="text-base font-bold text-[#173d5b]">
                      Space Reservation Confirmed!
                    </h3>

                    <p className="text-xs text-slate-500">
                      {bookingResult.confirmationMessage}
                    </p>

                    {/* Reference Card */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Intake Reference Code
                      </p>
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <span className="font-mono text-lg font-bold text-[#287da6]">
                          {bookingResult.bookingReference}
                        </span>
                        <button
                          onClick={() => handleCopyRef(bookingResult.bookingReference)}
                          className="rounded p-1 text-slate-400 hover:text-slate-600"
                          title="Copy booking reference"
                        >
                          {copiedRef ? (
                            <Check size={16} className="text-emerald-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Assigned for {bookingResult.numberOfPeople} person(s) at {bookingResult.shelterName}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setReservingShelter(null);
                          setBookingResult(null);
                        }}
                        className="rounded-xl bg-[#287da6] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#1f6486]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMERGENCY ASSISTANCE STRIP */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#287da6]">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#173d5b]">
                  Need transport or emergency evacuation assistance?
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Call the municipal disaster coordination desk. High-water transport vehicles and ambulance escorts are on standby.
                </p>
              </div>
            </div>

            <a
              href="tel:112"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
            >
              <Phone size={14} />
              Call 112 Helpline
            </a>
          </section>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs text-slate-400">
            <p>© 2026 CareLink Disaster Management System</p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              Verified Shelter Registry • Municipal Coordination
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
