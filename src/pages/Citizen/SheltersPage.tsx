
import { useState } from "react";
import {
  Heart, Search, Globe, Accessibility, Bell, Home, Plus,
  ClipboardList, Map, House, TriangleAlert, Users, FileText,
  MessageSquare, Phone, ChevronRight, Menu, X, MapPin,
  Clock, Accessibility as AccessIcon, Utensils, Cross,
  CheckCircle, BedDouble, Navigation, Filter
} from "lucide-react";

interface Shelter {
  id: number;
  name: string;
  area: string;
  distance: number;
  availability: number;
  services: string[];
  status: "Space available" | "Full";
  accessible: boolean;
}

const initialShelters: Shelter[] = [
  {
    id: 1,
    name: "Riverton High School",
    area: "Central Ward",
    distance: 1.4,
    availability: 48,
    services: ["Accessible", "Medical", "Families"],
    status: "Space available",
    accessible: true,
  },
  {
    id: 2,
    name: "North Community Hall",
    area: "North Ward",
    distance: 2.2,
    availability: 216,
    services: ["Accessible", "Food", "Pets"],
    status: "Space available",
    accessible: true,
  },
  {
    id: 3,
    name: "Lakeside Sports Hall",
    area: "West District",
    distance: 3.8,
    availability: 204,
    services: ["Food", "Family rooms"],
    status: "Space available",
    accessible: false,
  },
  {
    id: 4,
    name: "St. Mary Civic Centre",
    area: "Eastbank",
    distance: 2.8,
    availability: 0,
    services: ["Medical", "Childcare"],
    status: "Full",
    accessible: false,
  },
];

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

export default function SheltersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [distance, setDistance] = useState("Any distance");
  const [availability, setAvailability] = useState("Space available");
  const [accessibility, setAccessibility] = useState("All");
  const [service, setService] = useState("All services");
  const [selectedShelter, setSelectedShelter] =
    useState<Shelter | null>(null);

  const [shelters] = useState<Shelter[]>(initialShelters);

  const filteredShelters = shelters.filter((shelter) => {
    const matchesSearch =
      shelter.name.toLowerCase().includes(search.toLowerCase()) ||
      shelter.area.toLowerCase().includes(search.toLowerCase());

    const matchesDistance =
      distance === "Any distance" ||
      (distance === "Within 2 km" && shelter.distance <= 2) ||
      (distance === "Within 5 km" && shelter.distance <= 5);

    const matchesAvailability =
      availability === "All statuses" ||
      shelter.status === availability;

    const matchesAccessibility =
      accessibility === "All" ||
      (accessibility === "Accessible only" && shelter.accessible);

    const matchesService =
      service === "All services" ||
      shelter.services.some((s) =>
        s.toLowerCase().includes(service.toLowerCase())
      );

    return (
      matchesSearch &&
      matchesDistance &&
      matchesAvailability &&
      matchesAccessibility &&
      matchesService
    );
  });

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">

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

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>
          <p className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </p>
          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Shelters";

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
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>
              <a
                href="tel:112"
                className="text-sm font-bold text-red-600"
              >
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
            <p className="text-[10px] text-sky-200">
              Citizen account
            </p>
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

      {/* MAIN */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="flex max-w-[520px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <Search size={17} className="text-slate-400" />
              <input
                placeholder="Search help, shelters, services..."
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
              <AccessIcon size={18} />
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
              <p className="text-[9px] text-slate-400">
                North Ward
              </p>
            </div>

            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">

          {/* TITLE */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Shelters</h2>
              <p className="mt-1 text-xs text-slate-500">
                Check live space, accessibility, services, and safe travel information.
              </p>
            </div>

            <button
              onClick={() => alert("Map view is available in Nearby Support.")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-[#287da6] hover:bg-sky-50"
            >
              <MapPin size={14} />
              View on map
            </button>
          </section>

          {/* NEAREST AVAILABLE SHELTER */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#153e5e] p-4 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                <House size={22} />
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase text-sky-200">
                  Nearest available shelter
                </p>
                <h3 className="mt-1 text-sm font-bold">
                  Riverton High School
                </h3>
                <p className="mt-1 text-[10px] text-sky-200">
                  1.4 km away · 48 spaces · Accessible facilities
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedShelter(initialShelters[0])
              }
              className="rounded-lg bg-[#287da6] px-4 py-2.5 text-[10px] font-bold text-white hover:bg-[#3692bb]"
            >
              Request a space
            </button>
          </section>

          {/* SEARCH AND FILTERS */}
          <section className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search
                size={15}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shelters or areas..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[10px] outline-none focus:border-[#287da6]"
              />
            </div>

            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>Any distance</option>
              <option>Within 2 km</option>
              <option>Within 5 km</option>
            </select>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>Space available</option>
              <option>All statuses</option>
              <option>Full</option>
            </select>

            <select
              value={accessibility}
              onChange={(e) => setAccessibility(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All</option>
              <option>Accessible only</option>
            </select>

            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] outline-none"
            >
              <option>All services</option>
              <option>Food</option>
              <option>Medical</option>
              <option>Families</option>
              <option>Pets</option>
              <option>Childcare</option>
            </select>
          </section>

          {/* SHELTER TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#f5f8fa]">
                  <tr className="border-b border-slate-200 text-[9px] font-semibold text-slate-500">
                    <th className="px-4 py-3">Shelter</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Distance</th>
                    <th className="px-4 py-3">Availability</th>
                    <th className="px-4 py-3">Services</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShelters.map((shelter) => (
                    <tr
                      key={shelter.id}
                      className="border-b border-slate-200 text-[10px] hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {shelter.name}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {shelter.area}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {shelter.distance} km
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {shelter.availability} spaces
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {shelter.services.join(" · ")}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold ${
                            shelter.status === "Space available"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {shelter.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedShelter(shelter)}
                          className="text-slate-400 hover:text-[#287da6]"
                          aria-label={`View ${shelter.name}`}
                        >
                          <ChevronRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredShelters.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-xs text-slate-400"
                      >
                        No shelters found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-[9px] text-slate-400">
                Showing {filteredShelters.length} of {shelters.length} shelters
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setDistance("Any distance");
                  setAvailability("All statuses");
                  setAccessibility("All");
                  setService("All services");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold text-[#287da6]"
              >
                Clear filters
              </button>
            </div>
          </section>

          {/* SHELTER DETAILS */}
          {selectedShelter && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  {selectedShelter.name}
                </h3>
                <button
                  onClick={() => setSelectedShelter(null)}
                  className="text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <MapPin size={17} className="text-[#287da6]" />
                  <p className="mt-2 text-[10px] text-slate-400">Location</p>
                  <p className="mt-1 text-xs font-semibold">
                    {selectedShelter.area}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <BedDouble size={17} className="text-[#287da6]" />
                  <p className="mt-2 text-[10px] text-slate-400">Available spaces</p>
                  <p className="mt-1 text-xs font-semibold">
                    {selectedShelter.availability}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <Clock size={17} className="text-[#287da6]" />
                  <p className="mt-2 text-[10px] text-slate-400">Distance</p>
                  <p className="mt-1 text-xs font-semibold">
                    {selectedShelter.distance} km
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-slate-500">
                Services: {selectedShelter.services.join(", ")}
              </p>

              <button
                disabled={selectedShelter.status === "Full"}
                onClick={() =>
                  alert("Space request submitted for demonstration.")
                }
                className="mt-4 rounded-lg bg-[#287da6] px-4 py-2.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Request a space
              </button>
            </section>
          )}

          {/* EMERGENCY HELP */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <Phone size={19} className="text-[#287da6]" />
              <div>
                <p className="text-[10px] font-bold">
                  Need help choosing a shelter?
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  Call the shelter support team. Travel and accessibility support are available.
                </p>
              </div>
            </div>

            <a
              href="tel:112"
              className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] font-semibold text-[#287da6] hover:bg-sky-50"
            >
              Call 112
            </a>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Supporting communities together</p>
          </footer>

        </div>
      </main>
    </div>
  );
}
