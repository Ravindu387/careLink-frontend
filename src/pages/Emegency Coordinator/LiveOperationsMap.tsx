import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  Layers,
  Share2,
  X,
  AlertTriangle,
  Package,
  House,
  Users,
  MapPin,
  ExternalLink,
  Check,
  Copy,
  Plus,
  RefreshCw,
  UserCheck,
  Activity,
  Compass,
 Crosshair,
  ShieldAlert,
} from "lucide-react";
import {
  liveOperationsMapService,
  type OperationPoint,
  type LiveOperationsMapMetrics,
  type CreateOperationPointPayload,
} from "../../services/liveOperationsMapService";

const markerColors: Record<string, string> = {
  Request: "bg-red-600",
  Shelter: "bg-emerald-600",
  Warehouse: "bg-amber-500",
  Team: "bg-sky-600",
};

const markerIcons = {
  Request: AlertTriangle,
  Shelter: House,
  Warehouse: Package,
  Team: Users,
};

const AVAILABLE_TEAMS = [
  "Rescue Unit 24",
  "Medical Team 3",
  "Swift Water Rescue Unit",
  "Shelter Team 1",
  "Shelter Support Unit 2",
  "Logistics Team",
  "North Logistics Unit",
  "West Civil Defense Team",
  "Rapid Evacuation Team",
];

export default function LiveOperationsMap() {
  const [points, setPoints] = useState<OperationPoint[]>([]);
  const [metrics, setMetrics] = useState<LiveOperationsMapMetrics | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<OperationPoint | null>(null);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [layer, setLayer] = useState("All operational layers");
  const [priority, setPriority] = useState("Any priority");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLayers, setShowLayers] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTeamName, setAssignTeamName] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const [repositionMode, setRepositionMode] = useState(false);
  const [repositionLoading, setRepositionLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Point Form State
  const [newPoint, setNewPoint] = useState<CreateOperationPointPayload>({
    title: "",
    district: "North Ward",
    location: "",
    type: "Request",
    priority: "High",
    people: 4,
    confidence: 92,
    nearestShelter: "1.5 km",
    assignedTeam: "Unassigned",
    x: 50,
    y: 50,
    contactName: "",
    contactPhone: "",
    notes: "",
  });

  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    Request: true,
    Shelter: true,
    Warehouse: true,
    Team: true,
  });

  // Fetch points from backend
  const fetchMapData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [fetchedPoints, fetchedMetrics] = await Promise.all([
        liveOperationsMapService.getAll({
          search,
          district,
          layer,
          priority,
        }),
        liveOperationsMapService.getMetrics(),
      ]);

      setPoints(fetchedPoints);
      if (fetchedMetrics) {
        setMetrics(fetchedMetrics);
      }

      // Keep selection in sync or pick first item
      setSelectedPoint((prev) => {
        if (!prev) return fetchedPoints[0] || null;
        const matched = fetchedPoints.find((p) => p.id === prev.id || p.requestId === prev.requestId);
        return matched || fetchedPoints[0] || null;
      });
    } catch (err) {
      console.error("Live Operations Map fetch error:", err);
      setError("Unable to sync live operations map. Using cached offline data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, district, layer, priority]);

  // Initial load and filter change trigger
  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // Client-side layer visibility filter
  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      // visibleLayers controls layer toggle modal
      return visibleLayers[point.type] !== false;
    });
  }, [points, visibleLayers]);

  // Notification helper
  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Share handler
  const handleShare = async () => {
    const shareText = window.location.href;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // Assign Team handler
  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoint || !assignTeamName) return;

    setAssignLoading(true);
    try {
      const updated = await liveOperationsMapService.assignTeam(selectedPoint.id, {
        assignedTeam: assignTeamName,
        status: "Dispatched",
      });

      setPoints((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setSelectedPoint(updated);
      setShowAssignModal(false);
      notify(`Assigned ${updated.requestId} to ${assignTeamName}`);
    } catch (err) {
      console.error(err);
      notify("Failed to assign team. Please try again.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Map Canvas Click Handler (for repositioning or selecting)
  const handleMapCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!repositionMode || !selectedPoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.min(95, Math.max(5, clickX)));
    const clampedY = Math.round(Math.min(95, Math.max(5, clickY)));

    setRepositionLoading(true);
    try {
      const updated = await liveOperationsMapService.updateCoordinates(selectedPoint.id, {
        x: clampedX,
        y: clampedY,
      });

      setPoints((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setSelectedPoint(updated);
      setRepositionMode(false);
      notify(`Repositioned ${updated.requestId} to (${clampedX}%, ${clampedY}%)`);
    } catch (err) {
      console.error(err);
      notify("Failed to update coordinates.");
    } finally {
      setRepositionLoading(false);
    }
  };

  // Add New Operational Point
  const handleCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoint.title || !newPoint.location) {
      notify("Title and Location are required.");
      return;
    }

    try {
      const created = await liveOperationsMapService.create(newPoint);
      setPoints((prev) => [created, ...prev]);
      setSelectedPoint(created);
      setShowAddModal(false);
      notify(`Created ${created.requestId}: ${created.title}`);
      // Refresh metrics in background
      liveOperationsMapService.getMetrics().then((m) => m && setMetrics(m));
    } catch (err) {
      console.error(err);
      notify("Failed to register point on map.");
    }
  };

  // Reset to default seed scenario
  const handleResetData = async () => {
    if (!window.confirm("Reset Live Operations Map to initial scenario?")) return;
    try {
      await liveOperationsMapService.reset();
      fetchMapData(true);
      notify("Live Operations Map reset to baseline scenario.");
    } catch (err) {
      console.error(err);
      notify("Could not reset map data.");
    }
  };

  return (
    <div className="min-h-screen bg-[#edf4f2] px-4 py-6 sm:px-6 lg:px-7">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#153f5e] px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <Activity size={15} className="text-sky-300 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Page Heading & Actions */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-[#153f5e]">
              Live Operations Map
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Connected
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Real-time geospatial tracking of affected areas, emergency requests, shelters, logistics depots, and deployed field teams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => fetchMapData(true)}
            disabled={refreshing || loading}
            title="Refresh operations map data"
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2 text-xs font-medium text-[#175477] hover:bg-sky-50 disabled:opacity-60 transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Add Operation Point */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm transition"
          >
            <Plus size={15} />
            <span>Add Point</span>
          </button>

          {/* Map Layers Toggle */}
          <button
            onClick={() => setShowLayers(!showLayers)}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
              showLayers
                ? "border-[#153f5e] bg-[#153f5e] text-white"
                : "border-[#b9d0dc] bg-white text-[#175477] hover:bg-sky-50"
            }`}
          >
            <Layers size={15} />
            <span>Layers</span>
          </button>

          {/* Share View */}
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#216789] shadow-sm transition"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-[#d5e2e9] bg-white p-3 shadow-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total Points</span>
            <p className="mt-0.5 text-lg font-bold text-[#153f5e]">{metrics.totalPoints}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3 shadow-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-red-600">Critical Requests</span>
            <p className="mt-0.5 text-lg font-bold text-red-700">{metrics.criticalCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 shadow-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">Active Shelters</span>
            <p className="mt-0.5 text-lg font-bold text-emerald-800">{metrics.shelterCount}</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 shadow-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-sky-700">Deployed Teams</span>
            <p className="mt-0.5 text-lg font-bold text-[#153f5e]">{metrics.teamCount}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 shadow-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700">Depots & Warehouses</span>
            <p className="mt-0.5 text-lg font-bold text-amber-800">{metrics.warehouseCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">People Impacted</span>
            <p className="mt-0.5 text-lg font-bold text-[#153f5e]">{metrics.totalPeopleAffected.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Error alert with retry */}
      {error && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchMapData()}
            className="font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reposition Banner Notification */}
      {repositionMode && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-sky-300 bg-sky-100 px-4 py-2.5 text-xs text-sky-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <Crosshair size={16} className="text-sky-700 shrink-0" />
            <span>
              <strong>Reposition Mode Active:</strong> Click anywhere on the map grid below to place <strong>{selectedPoint?.requestId}</strong>.
            </span>
          </div>
          <button
            onClick={() => setRepositionMode(false)}
            className="rounded bg-sky-800 px-2 py-1 text-[11px] font-medium text-white hover:bg-sky-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_auto_auto_auto_auto]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 shadow-xs">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, request ID, facility, or team..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-700 font-medium outline-none shadow-xs"
        >
          <option>All districts</option>
          <option>North Ward</option>
          <option>Central Ward</option>
          <option>Eastbank</option>
          <option>West District</option>
        </select>

        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-700 font-medium outline-none shadow-xs"
        >
          <option>All operational layers</option>
          <option>Request</option>
          <option>Shelter</option>
          <option>Warehouse</option>
          <option>Team</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-700 font-medium outline-none shadow-xs"
        >
          <option>Any priority</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button
          onClick={handleResetData}
          title="Reset map points to default initial scenario"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-xs"
        >
          Reset Demo
        </button>
      </div>

      {/* Map Layers Popup */}
      {showLayers && (
        <div className="relative z-20 mb-3 rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-md transition-all">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#153f5e] flex items-center gap-1.5">
              <Layers size={16} />
              Operational map layers
            </h3>

            <button onClick={() => setShowLayers(false)} className="rounded p-1 hover:bg-slate-100">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(visibleLayers) as Array<keyof typeof visibleLayers>).map((key) => {
              const Icon = markerIcons[key as keyof typeof markerIcons] || MapPin;
              const count = points.filter((p) => p.type === key).length;

              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={visibleLayers[key]}
                      onChange={(e) =>
                        setVisibleLayers((previous) => ({
                          ...previous,
                          [key]: e.target.checked,
                        }))
                      }
                      className="accent-sky-600 h-4 w-4"
                    />
                    <Icon size={16} className={key === "Request" ? "text-red-600" : key === "Shelter" ? "text-emerald-600" : key === "Warehouse" ? "text-amber-500" : "text-sky-600"} />
                    <span className="font-medium">{key}s</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Map Section */}
      <section
        onClick={handleMapCanvasClick}
        className={`relative min-h-[540px] overflow-hidden rounded-2xl border border-[#b9d0dc] bg-[#e7f1ee] shadow-sm transition-all ${
          repositionMode ? "cursor-crosshair ring-2 ring-sky-400" : ""
        }`}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={28} className="animate-spin text-[#153f5e]" />
              <span className="text-xs font-semibold text-[#153f5e]">Loading operational map data...</span>
            </div>
          </div>
        )}

        {/* Decorative topographic / road grid background */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `
              linear-gradient(32deg, transparent 47%, white 48%, white 51%, transparent 52%),
              linear-gradient(148deg, transparent 47%, white 48%, white 51%, transparent 52%)
            `,
            backgroundSize: "85px 65px",
          }}
        />

        {/* River corridor simulation */}
        <div className="absolute left-0 top-[38%] h-8 w-full rotate-[-7deg] bg-sky-200/50 backdrop-blur-[1px] border-y border-sky-300/40" />

        {/* Main arterial highway */}
        <div className="absolute left-[8%] top-[42%] h-5 w-[65%] rotate-[-27deg] rounded-full border-y-2 border-white bg-[#c8dce0] shadow-xs" />

        {/* District geographical zones */}
        <div className="absolute left-[4%] top-[6%] rounded-md bg-white/80 px-2.5 py-1 backdrop-blur-xs shadow-2xs border border-white">
          <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
            NORTH WARD
          </span>
          <span className="block text-[8px] text-slate-400">Flooded Riverbank Sector</span>
        </div>

        <div className="absolute left-[15%] top-[45%] rounded-md bg-white/80 px-2.5 py-1 backdrop-blur-xs shadow-2xs border border-white">
          <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
            CENTRAL WARD
          </span>
          <span className="block text-[8px] text-slate-400">Commercial / Relief HQ</span>
        </div>

        <div className="absolute right-[8%] top-[24%] rounded-md bg-white/80 px-2.5 py-1 backdrop-blur-xs shadow-2xs border border-white">
          <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
            EASTBANK
          </span>
          <span className="block text-[8px] text-slate-400">Logistics Hub & Supply Depot</span>
        </div>

        <div className="absolute bottom-[10%] left-[38%] rounded-md bg-white/80 px-2.5 py-1 backdrop-blur-xs shadow-2xs border border-white">
          <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
            WEST DISTRICT
          </span>
          <span className="block text-[8px] text-slate-400">Low-lying Inundation Zone</span>
        </div>

        {/* Compass indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 shadow-2xs backdrop-blur-xs">
          <Compass size={14} className="text-[#153f5e]" />
          <span className="text-[10px] font-bold text-slate-700">N</span>
        </div>

        {/* Operational Markers on Map Canvas */}
        {filteredPoints.map((point) => {
          const Icon = markerIcons[point.type] || MapPin;
          const isSelected = selectedPoint?.id === point.id;

          return (
            <button
              key={point.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoint(point);
              }}
              title={`${point.requestId} - ${point.title} (${point.district})`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              className={`absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white text-white shadow-md transition hover:scale-125 focus:outline-hidden ${
                markerColors[point.type] || "bg-slate-700"
              } ${
                isSelected ? "ring-4 ring-sky-400 scale-120 z-20" : ""
              } ${
                point.priority === "Critical" ? "animate-bounce-subtle" : ""
              }`}
            >
              <Icon size={15} />
            </button>
          );
        })}

        {/* Empty state */}
        {!loading && filteredPoints.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-6 text-center shadow-lg border border-slate-100 max-w-xs">
            <MapPin className="mx-auto mb-2 text-slate-400" size={32} />
            <p className="text-sm font-semibold text-slate-700">
              No matching locations
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search query, selecting different districts, or enabling all layers.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setDistrict("All districts");
                setLayer("All operational layers");
                setPriority("Any priority");
              }}
              className="mt-3 inline-block rounded-lg bg-[#153f5e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f567e]"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Selected Point Information Card (Floating HUD) */}
        {selectedPoint && filteredPoints.some((p) => p.id === selectedPoint.id) && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-4 z-20 w-[min(320px,calc(100%-32px))] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-right-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                  selectedPoint.priority === "Critical"
                    ? "bg-red-100 text-red-700"
                    : selectedPoint.priority === "High"
                    ? "bg-amber-100 text-amber-700"
                    : selectedPoint.priority === "Medium"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {selectedPoint.priority.toUpperCase()} · {selectedPoint.type.toUpperCase()}
              </span>

              <div className="flex items-center gap-1">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                  {selectedPoint.status}
                </span>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#153f5e] leading-snug">
              {selectedPoint.requestId} · {selectedPoint.title}
            </h3>

            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span>{selectedPoint.location}</span>
            </p>

            <div className="my-3 grid grid-cols-2 gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px]">
              <div>
                <p className="text-[9px] font-medium uppercase text-slate-400">
                  {selectedPoint.type === "Shelter" ? "Occupancy" : selectedPoint.type === "Team" ? "Team Size" : "People Affected"}
                </p>
                <p className="mt-0.5 font-bold text-[#153f5e]">
                  {selectedPoint.people} {selectedPoint.capacity ? `/ ${selectedPoint.capacity}` : "people"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-medium uppercase text-slate-400">
                  AI Confidence
                </p>
                <p className="mt-0.5 font-bold text-[#153f5e]">
                  {selectedPoint.confidence}%
                </p>
              </div>

              <div>
                <p className="text-[9px] font-medium uppercase text-slate-400">
                  Nearest Shelter
                </p>
                <p className="mt-0.5 font-bold text-[#153f5e] truncate">
                  {selectedPoint.nearestShelter || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-medium uppercase text-slate-400">
                  Assigned Unit
                </p>
                <p className="mt-0.5 font-bold text-sky-800 truncate">
                  {selectedPoint.assignedTeam || "Unassigned"}
                </p>
              </div>

              {selectedPoint.contactPhone && (
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <p className="text-[9px] font-medium uppercase text-slate-400">
                    Contact: {selectedPoint.contactName || "On-site Rep"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-700">
                    {selectedPoint.contactPhone}
                  </p>
                </div>
              )}

              {selectedPoint.notes && (
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <p className="text-[9px] font-medium uppercase text-slate-400">Operational Notes</p>
                  <p className="text-[10px] text-slate-600 line-clamp-2">{selectedPoint.notes}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setAssignTeamName(selectedPoint.assignedTeam !== "Unassigned" ? selectedPoint.assignedTeam : AVAILABLE_TEAMS[0]);
                  setShowAssignModal(true);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#153f5e] py-2 text-xs font-semibold text-white hover:bg-[#1d4f73] transition"
              >
                <UserCheck size={14} />
                <span>Assign Field Team</span>
              </button>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setRepositionMode(true)}
                  disabled={repositionLoading}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <Crosshair size={13} className="text-sky-600" />
                  <span>Reposition</span>
                </button>

                <button
                  onClick={() => {
                    notify(`Opened details for ${selectedPoint.requestId}`);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <span>Open Dossier</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2 shadow-sm backdrop-blur-xs">
          {Object.entries(markerColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-[10px] font-medium text-slate-700">
                {name === "Request" ? "Requests" : name === "Team" ? "Teams" : `${name}s`}
              </span>
            </div>
          ))}
        </div>

        {/* Map Summary Badge */}
        <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur-xs">
          {filteredPoints.length} active operational points
        </div>
      </section>

      {/* Assign Team Modal */}
      {showAssignModal && selectedPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#153f5e] flex items-center gap-2">
                <UserCheck size={18} className="text-sky-600" />
                Assign Operational Team
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="rounded p-1 hover:bg-slate-100">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500">
              Dispatch an emergency response unit to handle <strong>{selectedPoint.requestId} ({selectedPoint.title})</strong> in {selectedPoint.district}.
            </p>

            <form onSubmit={handleAssignTeam} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Select Team / Unit
                </label>
                <select
                  value={assignTeamName}
                  onChange={(e) => setAssignTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-sky-500"
                >
                  {AVAILABLE_TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="rounded-lg bg-[#287da5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#216789] disabled:opacity-50"
                >
                  {assignLoading ? "Dispatching..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Operational Point Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#153f5e] flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                Add Operational Point
              </h2>
              <button onClick={() => setShowAddModal(false)} className="rounded p-1 hover:bg-slate-100">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePoint} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Title</label>
                <input
                  required
                  value={newPoint.title}
                  onChange={(e) => setNewPoint({ ...newPoint, title: e.target.value })}
                  placeholder="e.g. Flash flood rescue, Mobile Clinic"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Layer Type</label>
                  <select
                    value={newPoint.type}
                    onChange={(e) => setNewPoint({ ...newPoint, type: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Request">Request</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Team">Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPoint.priority}
                    onChange={(e) => setNewPoint({ ...newPoint, priority: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">District</label>
                  <select
                    value={newPoint.district}
                    onChange={(e) => setNewPoint({ ...newPoint, district: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  >
                    <option>North Ward</option>
                    <option>Central Ward</option>
                    <option>Eastbank</option>
                    <option>West District</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Location Details</label>
                  <input
                    required
                    value={newPoint.location}
                    onChange={(e) => setNewPoint({ ...newPoint, location: e.target.value })}
                    placeholder="e.g. Near Bridge 4, North Ward"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">People Count</label>
                  <input
                    type="number"
                    min="0"
                    value={newPoint.people}
                    onChange={(e) => setNewPoint({ ...newPoint, people: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">AI Confidence %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPoint.confidence}
                    onChange={(e) => setNewPoint({ ...newPoint, confidence: parseInt(e.target.value) || 90 })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Map X Position (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={newPoint.x}
                    onChange={(e) => setNewPoint({ ...newPoint, x: parseFloat(e.target.value) || 50 })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Map Y Position (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={newPoint.y}
                    onChange={(e) => setNewPoint({ ...newPoint, y: parseFloat(e.target.value) || 50 })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Create Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#153f5e] flex items-center gap-2">
                <Share2 size={16} />
                Share Operations Map
              </h2>
              <button onClick={() => setShowShare(false)} className="rounded p-1 hover:bg-slate-100">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-500">
              Share the current live operations map URL with authorized disaster response coordinators.
            </p>

            <div className="flex gap-2">
              <input
                readOnly
                value={window.location.href}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
              />

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-lg bg-[#153f5e] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1f567e] transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
