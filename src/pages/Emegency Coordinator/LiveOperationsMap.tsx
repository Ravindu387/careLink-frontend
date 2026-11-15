
import { useMemo, useState } from "react";
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
} from "lucide-react";

interface OperationPoint {
  id: string;
  requestId: string;
  title: string;
  district: string;
  location: string;
  type: "Request" | "Shelter" | "Warehouse" | "Team";
  priority: "Critical" | "High" | "Medium";
  people: number;
  confidence: number;
  nearestShelter: string;
  assignedTeam: string;
  time: string;
  x: number;
  y: number;
}

const initialPoints: OperationPoint[] = [
  {
    id: "1",
    requestId: "REQ-2841",
    title: "Emergency shelter",
    district: "North Ward",
    location: "Riverside, North Ward",
    type: "Request",
    priority: "Critical",
    people: 6,
    confidence: 94,
    nearestShelter: "1.4 km",
    assignedTeam: "Unassigned",
    time: "18 minutes ago",
    x: 27,
    y: 58,
  },
  {
    id: "2",
    requestId: "REQ-2839",
    title: "Medical supplies",
    district: "Central Ward",
    location: "Old Town, Central Ward",
    type: "Request",
    priority: "High",
    people: 12,
    confidence: 91,
    nearestShelter: "2.1 km",
    assignedTeam: "Medical Team 3",
    time: "26 minutes ago",
    x: 48,
    y: 42,
  },
  {
    id: "3",
    requestId: "SHEL-038",
    title: "Riverton High School",
    district: "Central Ward",
    location: "Central Ward",
    type: "Shelter",
    priority: "Medium",
    people: 84,
    confidence: 96,
    nearestShelter: "Current location",
    assignedTeam: "Shelter Team 1",
    time: "Updated recently",
    x: 72,
    y: 34,
  },
  {
    id: "4",
    requestId: "WH-012",
    title: "Central Warehouse",
    district: "Eastbank",
    location: "Eastbank",
    type: "Warehouse",
    priority: "Medium",
    people: 0,
    confidence: 98,
    nearestShelter: "3.2 km",
    assignedTeam: "Logistics Team",
    time: "Updated recently",
    x: 82,
    y: 72,
  },
  {
    id: "5",
    requestId: "TEAM-024",
    title: "Response Team 24",
    district: "Central Ward",
    location: "Central Ward",
    type: "Team",
    priority: "High",
    people: 8,
    confidence: 90,
    nearestShelter: "2.0 km",
    assignedTeam: "Rescue Unit 24",
    time: "5 minutes ago",
    x: 53,
    y: 78,
  },
];

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

export default function LiveOperationsMap() {
  const [points] = useState(initialPoints);
  const [selectedPoint, setSelectedPoint] =
  useState<OperationPoint | null>(initialPoints[0]);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [layer, setLayer] = useState("All operational layers");
  const [priority, setPriority] = useState("Any priority");

  const [showLayers, setShowLayers] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const [visibleLayers, setVisibleLayers] = useState({
    Request: true,
    Shelter: true,
    Warehouse: true,
    Team: true,
  });

  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      const matchesSearch = [
        point.requestId,
        point.title,
        point.location,
        point.district,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDistrict =
        district === "All districts" ||
        point.district === district;

      const matchesLayer =
        layer === "All operational layers" ||
        point.type === layer;

      const matchesPriority =
        priority === "Any priority" ||
        point.priority === priority;

      return (
        matchesSearch &&
        matchesDistrict &&
        matchesLayer &&
        matchesPriority &&
        visibleLayers[point.type]
      );
    });
  }, [points, search, district, layer, priority, visibleLayers]);

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

  return (
    <div className="min-h-screen bg-[#edf4f2] px-4 py-6 sm:px-6 lg:px-7">

      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Live Operations Map
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            View affected areas, requests, shelters, warehouses,
            service centres, and field teams.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => setShowLayers(!showLayers)}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#175477] hover:bg-sky-50"
          >
            <Layers size={15} />
            Map layers
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            <Share2 size={15} />
            Share view
          </button>

        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_auto_auto_auto]">

        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, request, or facility..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
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
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
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
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
        >
          <option>Any priority</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
        </select>
      </div>

      {/* Map layers popup */}
      {showLayers && (
        <div className="relative z-20 mb-3 rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#153f5e]">
              Operational map layers
            </h3>

            <button onClick={() => setShowLayers(false)}>
              <X size={17} className="text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(visibleLayers) as Array<keyof typeof visibleLayers>).map(
              (key) => {
                const Icon = markerIcons[key];

                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 p-3 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={visibleLayers[key]}
                      onChange={(e) =>
                        setVisibleLayers((previous) => ({
                          ...previous,
                          [key]: e.target.checked,
                        }))
                      }
                      className="accent-sky-600"
                    />

                    <Icon size={16} />
                    {key}
                  </label>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <section className="relative min-h-[520px] overflow-hidden rounded-xl border border-[#d5e2e9] bg-[#e8f0ed] shadow-sm">

        {/* Decorative map grid */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: `
              linear-gradient(32deg, transparent 47%, white 48%, white 51%, transparent 52%),
              linear-gradient(148deg, transparent 47%, white 48%, white 51%, transparent 52%)
            `,
            backgroundSize: "85px 65px",
          }}
        />

        {/* Map area labels */}
        <span className="absolute left-[3%] top-[8%] text-[9px] font-medium tracking-wide text-slate-500">
          NORTH WARD
        </span>

        <span className="absolute left-[15%] top-[43%] text-[9px] font-medium tracking-wide text-slate-500">
          CENTRAL
        </span>

        <span className="absolute right-[10%] top-[28%] text-[9px] font-medium tracking-wide text-slate-500">
          EASTBANK
        </span>

        <span className="absolute bottom-[12%] left-[42%] text-[9px] font-medium tracking-wide text-slate-500">
          WEST DISTRICT
        </span>

        {/* Main road */}
        <div className="absolute left-[8%] top-[42%] h-5 w-[55%] rotate-[-27deg] rounded-full border-y-2 border-white bg-[#c8dce0] shadow-sm" />

        {/* Operation markers */}
        {filteredPoints.map((point) => {
          const Icon = markerIcons[point.type];
          const isSelected = selectedPoint?.id === point.id;

          return (
            <button
              key={point.id}
              onClick={() => setSelectedPoint(point)}
              title={`${point.title} - ${point.location}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              className={`absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white text-white shadow-lg transition hover:scale-125 ${
                markerColors[point.type]
              } ${
                isSelected ? "ring-4 ring-sky-300/60 scale-110" : ""
              }`}
            >
              <Icon size={15} />
            </button>
          );
        })}

        {/* Empty state */}
        {filteredPoints.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 text-center shadow">
            <MapPin className="mx-auto mb-2 text-slate-400" size={25} />
            <p className="text-sm font-medium text-slate-600">
              No matching locations
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Selected request information */}
        {selectedPoint && filteredPoints.some(
          (point) => point.id === selectedPoint.id
        ) && (
          <div className="absolute right-4 top-4 z-20 w-[min(290px,calc(100%-32px))] rounded-xl border border-slate-100 bg-white p-4 shadow-xl">

            <div className="mb-2 flex items-center justify-between">

              <span className={`rounded px-2 py-1 text-[9px] font-bold ${
                selectedPoint.priority === "Critical"
                  ? "bg-red-100 text-red-700"
                  : selectedPoint.priority === "High"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-sky-700"
              }`}>
                {selectedPoint.priority.toUpperCase()} {selectedPoint.type === "Request" ? "REQUEST" : selectedPoint.type.toUpperCase()}
              </span>

              <button onClick={() => setSelectedPoint(null)}>
                <X size={15} className="text-slate-400" />
              </button>
            </div>

            <h3 className="text-sm font-semibold text-[#153f5e]">
              {selectedPoint.requestId} · {selectedPoint.title}
            </h3>

            <p className="mt-1 text-[10px] text-slate-500">
              {selectedPoint.location} · {selectedPoint.time}
            </p>

            <div className="my-3 grid grid-cols-2 gap-3">

              <div>
                <p className="text-[9px] text-slate-400">
                  People affected
                </p>
                <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                  {selectedPoint.people} people
                </p>
              </div>

              <div>
                <p className="text-[9px] text-slate-400">
                  AI priority
                </p>
                <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                  {selectedPoint.priority} · {selectedPoint.confidence}%
                </p>
              </div>

              <div>
                <p className="text-[9px] text-slate-400">
                  Nearest shelter
                </p>
                <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                  {selectedPoint.nearestShelter}
                </p>
              </div>

              <div>
                <p className="text-[9px] text-slate-400">
                  Assigned team
                </p>
                <p className="mt-1 text-xs font-semibold text-[#153f5e]">
                  {selectedPoint.assignedTeam}
                </p>
              </div>

            </div>

            <button
              onClick={() => {
                alert(`Opening ${selectedPoint.requestId}`);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#287da5] py-3 text-xs font-semibold text-white hover:bg-[#216789]"
            >
              Open request
              <ExternalLink size={13} />
            </button>
          </div>
        )}

        {/* Map legend */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">

          {Object.entries(markerColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-[9px] text-slate-600">
                {name === "Request" ? "Requests" : name === "Team" ? "Teams" : `${name}s`}
              </span>
            </div>
          ))}

        </div>

        {/* Map footer */}
        <div className="absolute bottom-4 right-4 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[9px] text-slate-500 shadow-sm">
          {filteredPoints.length} active operational points
        </div>

      </section>

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#153f5e]">
                Share map view
              </h2>

              <button onClick={() => setShowShare(false)}>
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-500">
              Share the current operations map URL with authorised team members.
            </p>

            <div className="flex gap-2">
              <input
                readOnly
                value={window.location.href}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
              />

              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg bg-[#153f5e] px-3 py-2 text-xs text-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
