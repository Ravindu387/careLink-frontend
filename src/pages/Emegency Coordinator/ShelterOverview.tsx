
import { useMemo, useState } from "react";
import {
  Search,
  House,
  Users,
  Check,
  AlertTriangle,
  Download,
  Plus,
  Filter,
  ChevronRight,
  X,
  MapPin,
} from "lucide-react";

interface Shelter {
  id: number;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  remaining: number;
  services: string[];
  status: "Operational" | "Near Capacity" | "Full";
}

const initialShelters: Shelter[] = [
  {
    id: 1,
    name: "Riverton High School",
    location: "Central Ward",
    capacity: 660,
    occupied: 612,
    remaining: 48,
    services: ["Accessible", "Medical"],
    status: "Near Capacity",
  },
  {
    id: 2,
    name: "North Community Hall",
    location: "North Ward",
    capacity: 500,
    occupied: 284,
    remaining: 216,
    services: ["Accessible", "Food"],
    status: "Operational",
  },
  {
    id: 3,
    name: "St. Mary's Civic Centre",
    location: "Eastbank",
    capacity: 450,
    occupied: 450,
    remaining: 0,
    services: ["Medical", "Childcare"],
    status: "Full",
  },
  {
    id: 4,
    name: "Lakeside Sports Hall",
    location: "West District",
    capacity: 400,
    occupied: 196,
    remaining: 204,
    services: ["Food", "Family rooms"],
    status: "Operational",
  },
];

const statusStyles: Record<string, string> = {
  Operational: "bg-emerald-100 text-emerald-700",
  "Near Capacity": "bg-amber-100 text-amber-700",
  Full: "bg-red-100 text-red-700",
};

export default function ShelterOverview() {
  const [shelters, setShelters] = useState(initialShelters);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All operational areas");
  const [status, setStatus] = useState("All statuses");
  const [availability, setAvailability] = useState("Any availability");

  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Shelter | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("Central Ward");
  const [newCapacity, setNewCapacity] = useState("");
  const [newServices, setNewServices] = useState("Food, Medical");
  const [message, setMessage] = useState("");

  const totalCapacity = shelters.reduce(
    (sum, s) => sum + s.capacity,
    0
  );

  const totalOccupied = shelters.reduce(
    (sum, s) => sum + s.occupied,
    0
  );

  const availableSpaces = totalCapacity - totalOccupied;

  const nearCapacity = shelters.filter(
    (s) => s.status === "Near Capacity"
  ).length;

  const accepting = shelters.filter(
    (s) => s.remaining > 0
  ).length;

  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => {
      const searchMatch =
        `${shelter.name} ${shelter.location} ${shelter.services.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const areaMatch =
        area === "All operational areas" ||
        shelter.location === area;

      const statusMatch =
        status === "All statuses" ||
        shelter.status === status;

      const availabilityMatch =
        availability === "Any availability" ||
        (availability === "Available" && shelter.remaining > 0) ||
        (availability === "Full" && shelter.remaining === 0);

      return (
        searchMatch &&
        areaMatch &&
        statusMatch &&
        availabilityMatch
      );
    });
  }, [shelters, search, area, status, availability]);

  const exportCSV = () => {
    const headers = [
      "Shelter",
      "Location",
      "Capacity",
      "Occupied",
      "Remaining",
      "Services",
      "Status",
    ];

    const rows = filteredShelters.map((s) => [
      s.name,
      s.location,
      s.capacity,
      s.occupied,
      s.remaining,
      s.services.join(" / "),
      s.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shelter-overview.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const addShelter = () => {
    if (!newName.trim() || !newCapacity || Number(newCapacity) <= 0) {
      setMessage("Please enter a shelter name and valid capacity.");
      return;
    }

    const capacity = Number(newCapacity);

    const newShelter: Shelter = {
      id: Date.now(),
      name: newName.trim(),
      location: newLocation,
      capacity,
      occupied: 0,
      remaining: capacity,
      services: newServices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: "Operational",
    };

    setShelters((prev) => [...prev, newShelter]);

    setMessage("Shelter added successfully!");

    setNewName("");
    setNewCapacity("");
    setNewServices("Food, Medical");

    setTimeout(() => {
      setShowModal(false);
      setMessage("");
    }, 1200);
  };

  const clearFilters = () => {
    setSearch("");
    setArea("All operational areas");
    setStatus("All statuses");
    setAvailability("Any availability");
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">

      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Shelter Overview
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Monitor shelter capacity, accessibility, services, and allocation risk.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-xs text-[#175477] hover:bg-sky-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            <Plus size={15} />
            Coordinate shelter
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
              <House size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Operational shelters
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {shelters.length + 34}
              </h2>
              <p className="text-[9px] text-slate-400">
                {accepting} accepting arrivals
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Users size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Total capacity
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                11,420
              </h2>
              <p className="text-[9px] text-slate-400">
                8,642 occupied
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Check size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Available spaces
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {availableSpaces.toLocaleString()}
              </h2>
              <p className="text-[9px] text-slate-400">
                Across 24 shelters
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <AlertTriangle size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Near capacity
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {6 + nearCapacity - 1}
              </h2>
              <p className="text-[9px] text-slate-400">
                Requires attention
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(130px,auto))_auto]">

        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shelters..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>Central Ward</option>
          <option>North Ward</option>
          <option>Eastbank</option>
          <option>West District</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Operational</option>
          <option>Near Capacity</option>
          <option>Full</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>Any availability</option>
          <option>Available</option>
          <option>Full</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-700 hover:bg-sky-50"
        >
          <Filter size={13} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-[#d5e2e9] bg-white p-3">
          <span className="text-[10px] text-slate-500">
            Filter shelters by location, capacity and status.
          </span>

          <button
            onClick={clearFilters}
            className="text-[10px] font-semibold text-sky-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Shelter table */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead className="border-b border-[#d5e2e9] bg-[#f7fafb]">
              <tr>
                {[
                  "Shelter",
                  "Location",
                  "Capacity",
                  "Occupied",
                  "Remaining",
                  "Services",
                  "Status",
                  "",
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredShelters.map((shelter) => (
                <tr
                  key={shelter.id}
                  onClick={() => setSelected(shelter)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                >
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] font-semibold text-[#153f5e]">
                    {shelter.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {shelter.location}
                  </td>

                  <td className="px-3 py-4 text-[9px] text-slate-700">
                    {shelter.capacity.toLocaleString()}
                  </td>

                  <td className="px-3 py-4 text-[9px] text-slate-700">
                    {shelter.occupied.toLocaleString()}
                  </td>

                  <td className="px-3 py-4 text-[9px] text-slate-700">
                    {shelter.remaining.toLocaleString()}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {shelter.services.map((service) => (
                        <span
                          key={service}
                          className="whitespace-nowrap rounded-md bg-sky-100 px-2 py-1 text-[8px] font-medium text-sky-700"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[8px] font-semibold ${statusStyles[shelter.status]}`}
                    >
                      {shelter.status}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight
                      size={16}
                      className="text-slate-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShelters.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No shelters found.
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filteredShelters.length} shelters
          </p>
        </div>
      </section>

      {/* Shelter details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#153f5e]">
                Shelter details
              </h2>

              <button onClick={() => setSelected(null)}>
                <X size={19} className="text-slate-500" />
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <House size={25} className="mb-3 text-sky-600" />

              <h3 className="font-semibold text-[#153f5e]">
                {selected.name}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={13} />
                {selected.location}
              </p>

              <div className="mt-5 space-y-3 text-xs">
                <p className="flex justify-between">
                  Total capacity
                  <span>{selected.capacity}</span>
                </p>

                <p className="flex justify-between">
                  Occupied
                  <span>{selected.occupied}</span>
                </p>

                <p className="flex justify-between">
                  Remaining spaces
                  <span className="font-semibold text-emerald-600">
                    {selected.remaining}
                  </span>
                </p>

                <p className="flex justify-between">
                  Status
                  <span className="font-semibold">
                    {selected.status}
                  </span>
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-2 text-xs font-medium text-slate-600">
                  Available services
                </p>

                <div className="flex flex-wrap gap-2">
                  {selected.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-md bg-sky-100 px-2 py-1 text-[10px] text-sky-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-lg bg-[#153f5e] py-3 text-xs font-semibold text-white hover:bg-[#205879]"
            >
              Close details
            </button>
          </div>
        </div>
      )}

      {/* Coordinate shelter modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#153f5e]">
                  Coordinate shelter
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Register a new emergency shelter.
                </p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={19} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Shelter name
                </label>

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter shelter name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Operational area
                </label>

                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
                >
                  <option>Central Ward</option>
                  <option>North Ward</option>
                  <option>Eastbank</option>
                  <option>West District</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Total capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="Enter maximum capacity"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Services (comma separated)
                </label>

                <input
                  value={newServices}
                  onChange={(e) => setNewServices(e.target.value)}
                  placeholder="Food, Medical, Childcare"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-sky-500"
                />
              </div>

              {message && (
                <p className="text-xs text-emerald-600">
                  {message}
                </p>
              )}

              <button
                onClick={addShelter}
                className="w-full rounded-lg bg-[#153f5e] py-3 text-xs font-semibold text-white hover:bg-[#205879]"
              >
                Add shelter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
