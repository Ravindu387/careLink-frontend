
import { useState } from "react";
import {
  Heart, Search, Globe, Accessibility, Bell, Home, Plus,
  ClipboardList, Map, House, TriangleAlert, Users, FileText,
  MessageSquare, Phone, ChevronRight, Utensils, Cross,
  Truck, Package, Menu, X, MapPin, Navigation, Filter,
  List, MapPinned, Clock, CheckCircle2, LocateFixed
} from "lucide-react";

const navigation = [
  { name: "Home", icon: Home },
  { name: "Request Help", icon: Plus },
  { name: "My Requests", icon: ClipboardList, count: 2 },
  { name: "Nearby Support", icon: Map },
  { name: "Shelters", icon: House },
  { name: "Safety Updates", icon: TriangleAlert, count: 3 },
  { name: "My Household", icon: Users },
  { name: "My Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare, count: 2 },
  { name: "Notifications", icon: Bell, count: 4 },
  { name: "Feedback", icon: Heart },
  { name: "Profile & Settings", icon: Accessibility },
];

const supportLocations = [
  {
    id: 1,
    name: "North Community Support Centre",
    category: "Support centre",
    distance: "0.8 km",
    status: "Open",
    address: "North Ward",
    services: ["Food", "Water", "Charging"],
    hours: "Open until 20:00",
    icon: House,
    color: "green",
    x: 25,
    y: 23,
    description:
      "A local support centre providing essential supplies, food, water and charging facilities.",
    phone: "+94 21 222 1001",
  },
  {
    id: 2,
    name: "Riverton High School",
    category: "Emergency shelter",
    distance: "1.4 km",
    status: "Space available",
    address: "Riverton",
    services: ["Accessible", "Medical"],
    hours: "Open 24 hours",
    icon: House,
    color: "green",
    x: 66,
    y: 26,
    description:
      "Emergency accommodation for families and displaced residents.",
    phone: "+94 21 222 1002",
  },
  {
    id: 3,
    name: "Eastbank Mobile Clinic",
    category: "Medical support",
    distance: "2.1 km",
    status: "Open",
    address: "Eastbank",
    services: ["First aid", "Medicines"],
    hours: "Open until 18:00",
    icon: Cross,
    color: "green",
    x: 31,
    y: 72,
    description:
      "Mobile medical assistance, first aid and essential medicines.",
    phone: "+94 21 222 1003",
  },
  {
    id: 4,
    name: "St. Mary Civic Centre",
    category: "Emergency shelter",
    distance: "3.2 km",
    status: "Full",
    address: "Central Ward",
    services: ["Food", "Medical", "Childcare"],
    hours: "Currently full",
    icon: House,
    color: "red",
    x: 86,
    y: 64,
    description:
      "Community emergency shelter. Currently at full capacity.",
    phone: "+94 21 222 1004",
  },
];

export default function NearbySupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All support");
  const [availability, setAvailability] = useState("Open now");
  const [distance, setDistance] = useState("Within 5 km");
  const [selected, setSelected] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredLocations = supportLocations.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.address.toLowerCase().includes(search.toLowerCase()) ||
      place.services.join(" ").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All support" ||
      (category === "Shelters" && place.category === "Emergency shelter") ||
      (category === "Medical" && place.category === "Medical support") ||
      (category === "Support centres" && place.category === "Support centre");

    const matchesAvailability =
      availability === "All availability" ||
      (availability === "Open now" && place.status !== "Full") ||
      (availability === "Space available" &&
        place.status === "Space available");

    const matchesDistance =
      distance === "Any distance" ||
      (distance === "Within 2 km" && parseFloat(place.distance) <= 2) ||
      (distance === "Within 5 km" && parseFloat(place.distance) <= 5);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability &&
      matchesDistance
    );
  });

  const selectedPlace = supportLocations.find(
    (place) => place.id === selected
  );

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col bg-[#153e5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa] text-[#153e5e]">
              <Heart size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold">ReliefOS</h1>
              <p className="text-[10px] text-sky-200">Citizen Support</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>
          <p className="mt-2 text-xs font-bold">Greater Riverton Floods</p>
          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        <div className="mt-5 px-5">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Nearby Support";

            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs transition ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                <span className="flex-1">{item.name}</span>
                {item.count && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#173d5b]">
          <div className="flex items-center gap-3">
            <Phone size={20} />
            <div>
              <p className="text-[10px] font-semibold">Emergency help line</p>
              <a href="tel:112" className="text-sm font-bold text-red-600">
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* USER */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">Citizen account</p>
          </div>
          <ChevronRight size={17} />
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>

            <div className="flex max-w-[520px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <Search size={17} className="text-slate-400" />
              <input
                placeholder="Search help, shelters, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:flex">
              <Globe size={15} />
              English
            </button>

            <button className="hidden rounded-lg border border-slate-200 p-2 sm:block">
              <Accessibility size={18} />
            </button>

            <button className="relative rounded-lg border border-slate-200 p-2">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                4
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
              SK
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Samira</p>
              <p className="text-[9px] text-slate-400">North Ward</p>
            </div>
            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE */}
        <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">

          {/* TITLE */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Nearby support</h2>
              <p className="mt-2 text-xs text-slate-500">
                Find verified help, food, water, medical help, and charging points near you.
              </p>
            </div>

            {/* VIEW TOGGLE */}
            <div className="flex rounded-lg bg-slate-200 p-1">
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-semibold ${
                  view === "map"
                    ? "bg-white text-[#287da6] shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <MapPinned size={14} />
                Map
              </button>

              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-semibold ${
                  view === "list"
                    ? "bg-white text-[#287da6] shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <List size={14} />
                List
              </button>
            </div>
          </section>

          {/* FILTERS */}
          <section className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search
                size={15}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service or location..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[10px] outline-none focus:border-[#287da6]"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All support</option>
              <option>Shelters</option>
              <option>Medical</option>
              <option>Support centres</option>
            </select>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>Open now</option>
              <option>All availability</option>
              <option>Space available</option>
            </select>

            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>Within 5 km</option>
              <option>Within 2 km</option>
              <option>Any distance</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] ${
                showFilters
                  ? "border-[#287da6] bg-sky-50 text-[#287da6]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Filter size={14} />
              Filters
            </button>
          </section>

          {/* EXTRA FILTER */}
          {showFilters && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold">Support filters</p>
              <p className="mt-2 text-[10px] text-slate-500">
                Select the support category, availability and distance using the filters above.
              </p>
              <button
                onClick={() => {
                  setCategory("All support");
                  setAvailability("All availability");
                  setDistance("Any distance");
                  setSearch("");
                }}
                className="mt-3 text-[10px] font-semibold text-[#287da6]"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* MAP AND LIST */}
          {view === "map" ? (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">

              {/* MAP */}
              <div className="relative h-[450px] overflow-hidden rounded-xl border border-slate-200 bg-[#e8f0ed] shadow-sm sm:h-[560px]">

                {/* MAP GRID */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(30deg, transparent 46%, white 47%, white 49%, transparent 50%),
                      linear-gradient(150deg, transparent 46%, white 47%, white 49%, transparent 50%)
                    `,
                    backgroundSize: "75px 75px",
                  }}
                />

                {/* ROAD LINES */}
                <div className="absolute left-[-10%] top-[47%] h-7 w-[125%] -rotate-[19deg] bg-[#b9dce5]" />

                <div className="absolute left-[15%] top-0 h-[110%] w-3 -rotate-[45deg] bg-white/80" />
                <div className="absolute left-[47%] top-0 h-[110%] w-3 rotate-[45deg] bg-white/80" />
                <div className="absolute left-[75%] top-0 h-[110%] w-3 -rotate-[45deg] bg-white/80" />

                {/* AREA LABELS */}
                <span className="absolute left-[10%] top-[10%] text-[8px] font-semibold tracking-wider text-slate-400">
                  NORTH WARD
                </span>

                <span className="absolute bottom-[12%] right-[10%] text-[8px] font-semibold tracking-wider text-slate-400">
                  CENTRAL WARD
                </span>

                {/* LOCATION MARKERS */}
                {filteredLocations.map((place) => {
                  const Icon = place.icon;
                  const active = selected === place.id;

                  return (
                    <button
                      key={place.id}
                      onClick={() => setSelected(place.id)}
                      style={{
                        left: `${place.x}%`,
                        top: `${place.y}%`,
                      }}
                      className={`absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white shadow-lg transition hover:scale-110 ${
                        active
                          ? "scale-125 bg-[#153e5e] text-white"
                          : place.color === "red"
                          ? "bg-red-600 text-white"
                          : "bg-[#25866e] text-white"
                      }`}
                      title={place.name}
                    >
                      <Icon size={17} />
                    </button>
                  );
                })}

                {/* CURRENT LOCATION */}
                <div className="absolute left-[50%] top-[53%] z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#153e5e] text-white shadow-lg">
                    <Navigation size={14} />
                  </div>
                  <span className="mt-1 block whitespace-nowrap rounded bg-[#153e5e] px-2 py-1 text-[8px] text-white">
                    Your location
                  </span>
                </div>

                {/* MAP CONTROLS */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-[#287da6] shadow-sm"
                    title="Clear selected location"
                  >
                    <LocateFixed size={17} />
                  </button>
                </div>

                {/* LEGEND */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2">
                  <span className="flex items-center gap-1 text-[8px]">
                    <span className="h-2 w-2 rounded-full bg-[#25866e]" />
                    Open
                  </span>
                  <span className="flex items-center gap-1 text-[8px]">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    Full or unavailable
                  </span>
                </div>

                {/* SELECTED LOCATION POPUP */}
                {selectedPlace && (
                  <div className="absolute left-1/2 top-4 z-20 w-[85%] max-w-[270px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute right-2 top-2 text-slate-400"
                    >
                      <X size={15} />
                    </button>
                    <p className="pr-5 text-[10px] font-bold">
                      {selectedPlace.name}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      {selectedPlace.distance} · {selectedPlace.address}
                    </p>
                    <button
                      onClick={() => alert(selectedPlace.description)}
                      className="mt-2 text-[9px] font-semibold text-[#287da6]"
                    >
                      View information
                    </button>
                  </div>
                )}
              </div>

              {/* SUPPORT CENTRE LIST */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
                  <p className="text-xs font-semibold">
                    Nearby support
                  </p>
                  <span className="text-[9px] text-slate-400">
                    {filteredLocations.length} places
                  </span>
                </div>

                <div className="max-h-[515px] divide-y divide-slate-200 overflow-y-auto">
                  {filteredLocations.map((place) => {
                    const Icon = place.icon;

                    return (
                      <button
                        key={place.id}
                        onClick={() => setSelected(place.id)}
                        className={`w-full p-3 text-left transition hover:bg-slate-50 ${
                          selected === place.id ? "bg-sky-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded px-2 py-1 text-[8px] font-semibold ${
                              place.status === "Full"
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {place.status}
                          </span>
                          <ChevronRight size={15} className="text-slate-400" />
                        </div>

                        <p className="mt-2 text-[10px] font-bold">
                          {place.name}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-500">
                          {place.category} · {place.distance}
                        </p>

                        <p className="mt-2 text-[9px] text-slate-500">
                          {place.services.join(" · ")}
                        </p>
                      </button>
                    );
                  })}

                  {filteredLocations.length === 0 && (
                    <p className="p-6 text-center text-xs text-slate-400">
                      No support centres found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-3">
              {filteredLocations.map((place) => {
                const Icon = place.icon;

                return (
                  <div
                    key={place.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f4f1] text-[#25866e]">
                        <Icon size={21} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{place.name}</p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {place.category} · {place.distance}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {place.services.join(" · ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${
                        place.status === "Full"
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {place.status}
                      </span>

                      <button
                        onClick={() => setSelected(place.id)}
                        className="rounded-lg bg-[#287da6] px-3 py-2 text-[9px] font-semibold text-white"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DETAILS PANEL */}
          {selectedPlace && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#287da6]">
                    Selected support location
                  </p>
                  <h3 className="mt-2 text-base font-bold">
                    {selectedPlace.name}
                  </h3>
                </div>
                <button onClick={() => setSelected(null)}>
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-500">
                {selectedPlace.description}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <MapPin size={16} className="text-[#287da6]" />
                  <p className="mt-2 text-[9px] text-slate-400">Location</p>
                  <p className="mt-1 text-xs font-semibold">
                    {selectedPlace.address}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <Clock size={16} className="text-[#287da6]" />
                  <p className="mt-2 text-[9px] text-slate-400">Opening hours</p>
                  <p className="mt-1 text-xs font-semibold">
                    {selectedPlace.hours}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <Phone size={16} className="text-[#287da6]" />
                  <p className="mt-2 text-[9px] text-slate-400">Contact</p>
                  <p className="mt-1 text-xs font-semibold">
                    {selectedPlace.phone}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`tel:${selectedPlace.phone}`}
                  className="rounded-lg bg-[#287da6] px-4 py-2.5 text-[10px] font-semibold text-white"
                >
                  Call support centre
                </a>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold"
                >
                  Close details
                </button>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p className="flex items-center gap-2">
              <Heart size={13} />
              Supporting communities together
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
