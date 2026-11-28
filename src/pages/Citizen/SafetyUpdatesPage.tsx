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
  Menu,
  X,
  MapPin,
  Share2,
  Clock,
  Droplet,
  CloudRain,
  ShieldAlert,
  Info,
  CheckCircle,
  Navigation,
  ShieldCheck,
  Megaphone,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Check,
  Compass,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  safetyUpdateService,
  MOCK_SAFETY_UPDATES,
} from "../../services/safetyUpdateService";
import type {
  SafetyUpdate,
  SafetyUpdateSummary,
  SafetyUpdateLevel,
} from "../../types/safetyUpdate";

const LEVEL_TABS = [
  { name: "All Updates", value: "All" },
  { name: "Emergency Alerts", value: "Emergency alert" },
  { name: "Warnings", value: "Warning" },
  { name: "Service Updates", value: "Service update" },
];

export default function SafetyUpdatesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [activeArea, setActiveArea] = useState("North Ward");
  const [savedAreas, setSavedAreas] = useState<string[]>([
    "All Areas",
    "North Ward",
    "Greater Riverton",
    "Riverside",
    "East Ward",
  ]);

  // Data States
  const [updates, setUpdates] = useState<SafetyUpdate[]>(MOCK_SAFETY_UPDATES);
  const [selectedUpdate, setSelectedUpdate] = useState<SafetyUpdate | null>(null);
  const [summary, setSummary] = useState<SafetyUpdateSummary>({
    totalUpdates: MOCK_SAFETY_UPDATES.length,
    emergencyCount: MOCK_SAFETY_UPDATES.filter((u) => u.level === "Emergency alert").length,
    warningsCount: MOCK_SAFETY_UPDATES.filter((u) => u.level === "Warning").length,
    serviceUpdatesCount: MOCK_SAFETY_UPDATES.filter((u) => u.level === "Service update").length,
    monitoredAreas: ["North Ward", "Greater Riverton", "Riverside", "East Ward"],
    lastUpdatedAt: new Date().toISOString(),
  });
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Load Saved Areas from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("carelink_monitored_areas");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAreas(["All Areas", ...parsed.filter((a) => a !== "All Areas")]);
        }
      }
    } catch (e) {
      console.warn("Failed to load saved areas:", e);
    }
  }, []);

  // Fetch Updates from Backend API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedUpdates, fetchedSummary] = await Promise.all([
        safetyUpdateService.getUpdates({
          area: activeArea,
          level: selectedLevel,
          search: search.trim() || undefined,
        }),
        safetyUpdateService.getSummary(activeArea),
      ]);

      setUpdates(fetchedUpdates);
      setSummary(fetchedSummary);
      setIsOnline(true);
    } catch (err) {
      console.warn("Could not fetch safety updates, utilizing fallback data:", err);
      setIsOnline(false);

      // Fallback local filter
      let filtered = [...MOCK_SAFETY_UPDATES];
      if (activeArea !== "All Areas") {
        const a = activeArea.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.area.toLowerCase().includes(a) ||
            u.location.toLowerCase().includes(a) ||
            (a === "greater riverton" && u.area.toLowerCase().includes("ward"))
        );
      }
      if (selectedLevel !== "All") {
        filtered = filtered.filter(
          (u) => u.level.toLowerCase() === selectedLevel.toLowerCase()
        );
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.title.toLowerCase().includes(q) ||
            u.description.toLowerCase().includes(q) ||
            u.location.toLowerCase().includes(q)
        );
      }
      setUpdates(filtered);
    } finally {
      setLoading(false);
    }
  }, [activeArea, selectedLevel, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Share functionality
  const shareUpdate = async (update: SafetyUpdate) => {
    const text = `⚠️ [${update.level.toUpperCase()}] ${update.title}\n📍 ${update.location}\n\n${update.description}\n\nEmergency Helpline: 112\nCareLink Disaster Response`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: update.title,
          text,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setShareToast(`Copied "${update.title}" to clipboard!`);
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  // Add Monitored Area
  const handleAddArea = () => {
    const area = prompt("Enter a ward, district or area to monitor (e.g. South Ward, Fort):");
    if (area?.trim()) {
      const cleanArea = area.trim();
      const updated = Array.from(new Set([...savedAreas, cleanArea]));
      setSavedAreas(updated);
      setActiveArea(cleanArea);
      localStorage.setItem(
        "carelink_monitored_areas",
        JSON.stringify(updated.filter((a) => a !== "All Areas"))
      );
    }
  };

  const getUpdateStyle = (level: string) => {
    switch (level) {
      case "Emergency alert":
        return {
          icon: TriangleAlert,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-l-red-500",
          badge: "bg-red-50 text-red-600 border border-red-200",
          pill: "bg-red-600",
        };

      case "Warning":
        return {
          icon: CloudRain,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-l-amber-500",
          badge: "bg-amber-50 text-amber-700 border border-amber-200",
          pill: "bg-amber-500",
        };

      default:
        return {
          icon: Droplet,
          color: "text-sky-600",
          bg: "bg-sky-50",
          border: "border-l-sky-600",
          badge: "bg-sky-50 text-sky-700 border border-sky-200",
          pill: "bg-[#287da6]",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Safety Updates"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN LAYOUT */}
      <main className="min-h-screen transition-all duration-300 lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* TOAST NOTIFICATION */}
        {shareToast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-2xl animate-fade-in">
            <Check size={16} className="text-emerald-400" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1450px] space-y-6 p-4 sm:p-6 lg:p-8">
          {/* HEADER SECTION */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight">
                  Safety Updates & Advisories
                </h1>

                {/* API Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
                    isOnline
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                  title={
                    isOnline
                      ? "Connected to CareLink Backend API"
                      : "Offline Fallback Mode (showing cached safety updates)"
                  }
                >
                  {isOnline ? (
                    <Wifi size={13} className="text-emerald-600 animate-pulse" />
                  ) : (
                    <WifiOff size={13} className="text-amber-600" />
                  )}
                  <span>{isOnline ? "Live Backend Feed" : "Offline Fallback Mode"}</span>
                </div>

                <button
                  onClick={loadData}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#287da6] disabled:opacity-50"
                  title="Reload safety feed"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Official disaster management bulletins, live river level warnings, and relief service points.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-sm"
              >
                <Phone size={14} className="text-red-600" />
                Emergency Hotline: 112
              </a>
              <button
                onClick={handleAddArea}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#287da6] hover:bg-slate-50 transition shadow-sm"
              >
                <Plus size={14} />
                Add Location
              </button>
            </div>
          </div>

          {/* KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/80 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Emergency Alerts
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {summary.emergencyCount}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Immediate life-safety notices
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Weather Warnings
                </span>
                <CloudRain size={16} className="text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-800">
                {summary.warningsCount}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Rainfall & sluice gate alerts
              </p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#287da6]">
                  Relief Services
                </span>
                <Droplet size={16} className="text-[#287da6]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#173d5b]">
                {summary.serviceUpdatesCount}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Water & medical clinic points
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Active Bulletins
                </span>
                <Megaphone size={16} className="text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#173d5b]">
                {summary.totalUpdates}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Across monitored locations
              </p>
            </div>
          </div>

          {/* MONITORED LOCATION BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#173d5b] mr-2">
                <MapPin size={16} className="text-[#287da6]" />
                <span>Monitored Areas:</span>
              </div>

              {savedAreas.map((area) => {
                const active = activeArea === area;
                return (
                  <button
                    key={area}
                    onClick={() => setActiveArea(area)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                      active
                        ? "bg-[#287da6] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Broadcasting live verified updates</span>
            </div>
          </div>

          {/* SEARCH & LEVEL FILTER TABS */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Level Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {LEVEL_TABS.map((tab) => {
                const active = selectedLevel === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedLevel(tab.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[#e8f2f7] text-[#287da6] shadow-xs"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keywords, areas, sources..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm sm:text-[15px] text-[#173d5b] outline-none transition focus:border-[#287da6] focus:ring-2 focus:ring-sky-100 shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* UPDATE CARDS LIST */}
          <section className="space-y-4">
            {updates.map((update) => {
              const style = getUpdateStyle(update.level);
              const Icon = style.icon;

              return (
                <article
                  key={update.id}
                  className={`relative rounded-2xl border border-slate-200 border-l-4 ${style.border} bg-white p-5 shadow-sm transition hover:shadow-md`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Icon & Details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} shadow-inner`}
                      >
                        <Icon size={22} className={style.color} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${style.badge}`}>
                            {update.level}
                          </span>

                          <span className="flex items-center gap-1 text-[13px] font-medium text-slate-500">
                            <ShieldCheck size={13} className="text-[#287da6]" />
                            {update.source}
                          </span>

                          <span className="text-sm text-slate-300">•</span>

                          <span className="flex items-center gap-1 text-[13px] text-slate-400">
                            <Clock size={12} />
                            {update.time}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#173d5b]">
                          {update.title}
                        </h3>

                        <p className="max-w-3xl text-sm text-slate-600 leading-relaxed pt-1">
                          {update.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium text-[#173d5b]">
                            <MapPin size={13} className="text-[#287da6]" />
                            {update.location}
                          </span>

                          {update.safeRoutes && update.safeRoutes.length > 0 && (
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Navigation size={12} />
                              {update.safeRoutes.length} Verified safe route{update.safeRoutes.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0 shrink-0">
                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className="rounded-xl bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f6486] transition shadow-sm"
                      >
                        Full Details
                      </button>

                      <button
                        onClick={() => shareUpdate(update)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                        title="Share bulletin"
                      >
                        <Share2 size={13} className="text-[#287da6]" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* EMPTY STATE */}
            {updates.length === 0 && !loading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Search className="mx-auto text-slate-300" size={36} />
                <h3 className="mt-3 text-base font-bold text-[#173d5b]">
                  No safety bulletins match your criteria
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Try selecting "All Areas", clearing the search query, or checking back shortly.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedLevel("All");
                    setActiveArea("All Areas");
                  }}
                  className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-[#173d5b] hover:bg-slate-200"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </section>

          {/* FULL UPDATE MODAL / DIALOG */}
          {selectedUpdate && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
              <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                        getUpdateStyle(selectedUpdate.level).badge
                      }`}
                    >
                      {selectedUpdate.level}
                    </span>
                    <span className="text-xs text-slate-400">
                      Published {selectedUpdate.time}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedUpdate(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Title & Issuer */}
                <div className="mt-4">
                  <h2 className="text-lg font-bold text-[#173d5b]">
                    {selectedUpdate.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#287da6] font-medium">
                    <ShieldCheck size={14} />
                    <span>Issued by {selectedUpdate.source}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-700 leading-relaxed">
                  {selectedUpdate.description}
                </div>

                {/* Action Instructions */}
                {selectedUpdate.actionInstructions && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
                    <h4 className="font-bold mb-1 flex items-center gap-1.5 text-amber-800">
                      <TriangleAlert size={15} />
                      Recommended Citizen Action:
                    </h4>
                    <p>{selectedUpdate.actionInstructions}</p>
                  </div>
                )}

                {/* Safe Routes & Hazard Areas */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedUpdate.safeRoutes && selectedUpdate.safeRoutes.length > 0 && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                      <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                        <Navigation size={13} />
                        Verified Safe Routes:
                      </h4>
                      <ul className="space-y-1 text-sm text-emerald-900 list-disc list-inside">
                        {selectedUpdate.safeRoutes.map((route, i) => (
                          <li key={i}>{route}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedUpdate.hazardAreas && selectedUpdate.hazardAreas.length > 0 && (
                    <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                      <h4 className="text-sm font-bold text-red-800 flex items-center gap-1.5 mb-2">
                        <ShieldAlert size={13} />
                        Hazardous / Closed Areas:
                      </h4>
                      <ul className="space-y-1 text-sm text-red-900 list-disc list-inside">
                        {selectedUpdate.hazardAreas.map((hazard, i) => (
                          <li key={i}>{hazard}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Meta details */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {selectedUpdate.location}
                  </span>

                  <span className="font-mono text-[13px] text-slate-400">
                    ID: {selectedUpdate.id}
                  </span>
                </div>

                {/* Modal Footer Controls */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href="tel:112"
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                  >
                    <Phone size={14} />
                    Call Emergency 112
                  </a>

                  <button
                    onClick={() => shareUpdate(selectedUpdate)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#287da6] hover:bg-sky-50 transition"
                  >
                    <Share2 size={14} />
                    Share Bulletin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SAFETY PREPAREDNESS TIPS */}
          <section className="mt-8 space-y-3">
            <h3 className="text-base font-bold text-[#173d5b] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#287da6]" />
              Flood Emergency Preparedness Protocols
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle size={20} />
                </div>
                <h4 className="mt-3 text-sm font-bold text-[#173d5b]">
                  Keep a Water-Sealed Go-Bag
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Pack official NIC cards, property deeds, 72-hour essential medication, bottled water, flashlight, and power banks.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Navigation size={20} />
                </div>
                <h4 className="mt-3 text-sm font-bold text-[#173d5b]">
                  Never Drive Through Flowing Water
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Just 6 inches of moving water can knock down an adult; 12 inches can float a vehicle. Turn around and use verified higher bypass roads.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Users size={20} />
                </div>
                <h4 className="mt-3 text-sm font-bold text-[#173d5b]">
                  Assist Vulnerable Neighbors
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Check on elderly residents, pregnant women, and persons with disabilities nearby. Report stranded citizens via the Request Help page.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs text-slate-400">
            <p>© 2026 CareLink Disaster Management System</p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              Verified bulletins published by Municipal Emergency Coordination Desk
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
