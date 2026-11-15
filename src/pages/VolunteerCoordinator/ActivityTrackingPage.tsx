import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  Search,
  HelpCircle,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Activity,
  Users,
  X,
  Filter,
  CheckCircle2,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

// TYPES

type ActivityType =
  | "Checked in"
  | "Progress update"
  | "Break started"
  | "Assignment accepted"
  | "Training completed"
  | "Checked out";

interface ActivityRecord {
  id: string;
  time: string;
  volunteer: string;
  activity: ActivityType;
  task: string;
  location: string;
  verification: string;
}

// DEMO ACTIVITY DATA

const initialActivities: ActivityRecord[] = [
  {
    id: "ACT-001",
    time: "13:42",
    volunteer: "Elena Rossi",
    activity: "Checked in",
    task: "TASK-782",
    location: "North Ward",
    verification: "GPS verified",
  },
  {
    id: "ACT-002",
    time: "13:28",
    volunteer: "Daniel Okafor",
    activity: "Progress update",
    task: "TASK-761",
    location: "West Warehouse",
    verification: "76% complete",
  },
  {
    id: "ACT-003",
    time: "13:10",
    volunteer: "Lin Wei",
    activity: "Break started",
    task: "TASK-779",
    location: "Central Clinic",
    verification: "Scheduled",
  },
  {
    id: "ACT-004",
    time: "12:55",
    volunteer: "Musa Bello",
    activity: "Assignment accepted",
    task: "TASK-782",
    location: "North Ward",
    verification: "On time",
  },
  {
    id: "ACT-005",
    time: "12:40",
    volunteer: "Sara Khan",
    activity: "Training completed",
    task: "TRN-104",
    location: "Remote",
    verification: "Passed",
  },
  {
    id: "ACT-006",
    time: "12:25",
    volunteer: "Theo Martin",
    activity: "Checked in",
    task: "TASK-774",
    location: "Eastbank Hub",
    verification: "GPS verified",
  },
  {
    id: "ACT-007",
    time: "12:10",
    volunteer: "Maya Fernando",
    activity: "Progress update",
    task: "TASK-768",
    location: "Riverton School",
    verification: "50% complete",
  },
  {
    id: "ACT-008",
    time: "11:55",
    volunteer: "Abdul Rahman",
    activity: "Checked out",
    task: "TASK-761",
    location: "West District",
    verification: "GPS verified",
  },
  {
    id: "ACT-009",
    time: "11:40",
    volunteer: "Elena Rossi",
    activity: "Progress update",
    task: "TASK-782",
    location: "North Ward",
    verification: "82% complete",
  },
  {
    id: "ACT-010",
    time: "11:20",
    volunteer: "Daniel Okafor",
    activity: "Assignment accepted",
    task: "TASK-774",
    location: "Eastbank Hub",
    verification: "On time",
  },
];

// MAP DATA

const presenceAreas = [
  {
    name: "North Ward",
    count: 42,
    position: "top-[26%] left-[30%]",
  },
  {
    name: "Eastbank",
    count: 64,
    position: "top-[26%] right-[22%]",
  },
  {
    name: "Central",
    count: 86,
    position: "top-[52%] left-[52%]",
  },
  {
    name: "West District",
    count: 31,
    position: "bottom-[16%] left-[19%]",
  },
];

// COMPONENT

export default function ActivityTrackingPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>(
    initialActivities
  );

  const [search, setSearch] = useState("");

  const [activityFilter, setActivityFilter] = useState("All activities");

  const [locationFilter, setLocationFilter] = useState("All locations");

  const [showFilters, setShowFilters] = useState(false);

  const [showCheckIn, setShowCheckIn] = useState(false);

  const [showRecordModal, setShowRecordModal] = useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState<ActivityRecord | null>(null);

  const [notification, setNotification] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const [checkInForm, setCheckInForm] = useState({
    volunteer: "",
    task: "",
    location: "",
    verification: "GPS verified",
  });

  const [recordForm, setRecordForm] = useState({
    volunteer: "",
    activity: "Progress update" as ActivityType,
    task: "",
    location: "",
    verification: "",
  });

  // NOTIFICATION

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // FILTER ACTIVITIES

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const searchMatch = [
        item.id,
        item.volunteer,
        item.activity,
        item.task,
        item.location,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const activityMatch =
        activityFilter === "All activities" ||
        item.activity === activityFilter;

      const locationMatch =
        locationFilter === "All locations" ||
        item.location === locationFilter;

      return searchMatch && activityMatch && locationMatch;
    });
  }, [activities, search, activityFilter, locationFilter]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(filteredActivities.length / pageSize)
  );

  const displayedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // FORMAT CURRENT TIME

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // MANUAL CHECK IN

  const handleManualCheckIn = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newActivity: ActivityRecord = {
      id: `ACT-${Date.now()}`,
      time: getCurrentTime(),
      volunteer: checkInForm.volunteer,
      activity: "Checked in",
      task: checkInForm.task,
      location: checkInForm.location,
      verification: checkInForm.verification,
    };

    setActivities((prev) => [newActivity, ...prev]);

    setSearch("");
    setActivityFilter("All activities");
    setLocationFilter("All locations");
    setCurrentPage(1);

    setCheckInForm({
      volunteer: "",
      task: "",
      location: "",
      verification: "GPS verified",
    });

    setShowCheckIn(false);

    notify("Volunteer checked in successfully!");
  };

  // RECORD ACTIVITY

  const handleRecordActivity = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newActivity: ActivityRecord = {
      id: `ACT-${Date.now()}`,
      time: getCurrentTime(),
      volunteer: recordForm.volunteer,
      activity: recordForm.activity,
      task: recordForm.task,
      location: recordForm.location,
      verification: recordForm.verification || "Manual entry",
    };

    setActivities((prev) => [newActivity, ...prev]);

    setSearch("");
    setActivityFilter("All activities");
    setLocationFilter("All locations");
    setCurrentPage(1);

    setRecordForm({
      volunteer: "",
      activity: "Progress update",
      task: "",
      location: "",
      verification: "",
    });

    setShowRecordModal(false);

    notify("Activity recorded successfully!");
  };

  // RESET FILTERS

  const resetFilters = () => {
    setSearch("");
    setActivityFilter("All activities");
    setLocationFilter("All locations");
    setCurrentPage(1);
  };

  // ACTIVITY STATUS STYLE

  const getActivityStyle = (activity: ActivityType) => {
    switch (activity) {
      case "Checked in":
        return "bg-[#e5f5ef] text-[#239879]";

      case "Progress update":
        return "bg-[#e8f1f6] text-[#287fa9]";

      case "Break started":
        return "bg-[#fff3df] text-[#b87813]";

      case "Assignment accepted":
        return "bg-[#e8f1f6] text-[#287fa9]";

      case "Training completed":
        return "bg-[#e5f5ef] text-[#239879]";

      default:
        return "bg-[#fdebec] text-[#d64550]";
    }
  };

  // EXPORT CSV

  const handleExport = () => {
    const headers = [
      "Activity ID",
      "Time",
      "Volunteer",
      "Activity",
      "Task",
      "Location",
      "Verification",
    ];

    const rows = filteredActivities.map((item) => [
      item.id,
      item.time,
      item.volunteer,
      item.activity,
      item.task,
      item.location,
      item.verification,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "activity-tracking.csv";
    link.click();

    URL.revokeObjectURL(url);

    notify("Activity report exported successfully!");
  };

  return (
    <div className="w-full min-h-full bg-[#eff6f8] text-[#123c5b]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            Activity Tracking
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-[27px] font-normal">
              Activity Tracking
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Monitor field check-ins, progress, safety, hours, and task completion.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setShowCheckIn(true)}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] hover:bg-[#f5fafc]"
            >
              Manual check-in
            </button>

            <button
              onClick={() => setShowRecordModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold"
            >
              <Plus size={15} />
              Record activity
            </button>

          </div>

        </div>

        {/* FIELD OPERATIONS LIVE BANNER */}

        <section className="bg-[#153e5e] rounded-xl px-5 py-5 mb-4 text-white">

          <div className="grid grid-cols-1 md:grid-cols-[2.2fr_0.8fr_0.8fr_0.8fr] items-center gap-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <span className="w-2 h-2 rounded-full bg-[#65c5a8]" />

                <span className="text-[8px] uppercase tracking-wide text-[#78d9bb]">
                  Field Operations Live
                </span>

              </div>

              <h2 className="text-[14px] font-semibold">
                294 volunteers currently checked in
              </h2>

              <p className="text-[8px] text-[#b8cbd9] mt-2">
                Last sync: just now · 12 operational areas
              </p>

            </div>

            <div className="md:border-l border-[#ffffff30] md:pl-5">

              <h2 className="text-[20px] font-bold">
                2,184h
              </h2>

              <p className="text-[9px] text-[#b8cbd9] mt-1">
                Hours today
              </p>

            </div>

            <div className="md:border-l border-[#ffffff30] md:pl-5">

              <h2 className="text-[20px] font-bold">
                89.4%
              </h2>

              <p className="text-[9px] text-[#b8cbd9] mt-1">
                Tasks on track
              </p>

            </div>

            <div className="md:border-l border-[#ffffff30] md:pl-5">

              <h2 className="text-[20px] font-bold">
                3
              </h2>

              <p className="text-[9px] text-[#b8cbd9] mt-1">
                Safety alerts
              </p>

            </div>

          </div>

        </section>

        {/* MAIN GRID */}

        <section className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-4">

          {/* LIVE ACTIVITY LOG */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            {/* TABLE HEADER */}

            <div className="px-4 py-4 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[13px] font-medium">
                  Live activity log
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  Today · all operational areas
                </p>

              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-[40px] px-4 border rounded-lg flex items-center gap-2 text-[10px] ${
                  showFilters
                    ? "bg-[#e8f1f6] border-[#287fa9] text-[#287fa9]"
                    : "border-[#b9d0dc] text-[#17648e] hover:bg-[#f5fafc]"
                }`}
              >

                <Filter size={13} />
                Filters

              </button>

            </div>

            {/* FILTER PANEL */}

            {showFilters && (

              <div className="p-4 bg-[#f8fbfc] border-b border-[#d5e3e9] grid grid-cols-1 sm:grid-cols-2 gap-3">

                <select
                  value={activityFilter}
                  onChange={(e) => {
                    setActivityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[38px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none"
                >

                  <option>All activities</option>
                  <option>Checked in</option>
                  <option>Progress update</option>
                  <option>Break started</option>
                  <option>Assignment accepted</option>
                  <option>Training completed</option>
                  <option>Checked out</option>

                </select>

                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[38px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none"
                >

                  <option>All locations</option>

                  {Array.from(
                    new Set(activities.map((a) => a.location))
                  ).map((location) => (

                    <option key={location}>
                      {location}
                    </option>

                  ))}

                </select>

                <button
                  onClick={resetFilters}
                  className="text-[10px] text-[#287fa9] font-semibold text-left"
                >
                  Clear all filters
                </button>

              </div>

            )}

            {/* SEARCH */}

            <div className="px-4 py-3 border-b border-[#e1eaf0]">

              <div className="flex items-center gap-2 bg-[#f7fafb] border border-[#d5e3e9] rounded-lg px-3 h-[35px]">

                <Search
                  size={14}
                  className="text-[#8296aa]"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search activity, volunteer, task..."
                  className="bg-transparent outline-none text-[10px] w-full"
                />

              </div>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[680px] text-left">

                <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">

                  <tr className="text-[9px] text-[#718ba0]">

                    <th className="px-3 py-3 font-medium">
                      Time
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Volunteer
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Activity
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Task
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Location
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Verification
                    </th>

                    <th className="px-3 py-3"></th>

                  </tr>

                </thead>

                <tbody>

                  {displayedActivities.map((item) => (

                    <tr
                      key={item.id}
                      onClick={() => setSelectedActivity(item)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                    >

                      <td className="px-3 py-4 text-[9px] font-semibold whitespace-nowrap">
                        {item.time}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {item.volunteer}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {item.activity}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {item.task}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {item.location}
                      </td>

                      <td className="px-3 py-4">

                        <span className={`inline-flex px-2 py-1.5 rounded-md text-[8px] font-semibold whitespace-nowrap ${getActivityStyle(item.activity)}`}>
                          {item.verification}
                        </span>

                      </td>

                      <td className="px-3 py-4">

                        <ChevronRight
                          size={15}
                          className="text-[#718ba0]"
                        />

                      </td>

                    </tr>

                  ))}

                  {displayedActivities.length === 0 && (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-12 text-xs text-gray-400"
                      >
                        No activities found.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

              <p className="text-[9px] text-[#8296aa]">

                Showing{" "}

                {filteredActivities.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}

                –

                {Math.min(
                  currentPage * pageSize,
                  filteredActivities.length
                )}

                {" "}of {filteredActivities.length}

              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => p - 1)
                  }
                  className="border border-[#d5e2e9] rounded-lg px-3.5 py-2 text-[9px] text-[#287fa9] disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(totalPages, 3) },
                  (_, i) => i + 1
                ).map((page) => (

                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-[33px] h-[33px] rounded-lg border text-[9px] ${
                      currentPage === page
                        ? "bg-[#287fa9] border-[#287fa9] text-white"
                        : "border-[#d5e2e9] hover:bg-[#f0f7fa]"
                    }`}
                  >
                    {page}
                  </button>

                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                  className="border border-[#b9d0dc] rounded-lg px-3.5 py-2 text-[9px] text-[#287fa9] disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          </div>

          {/* FIELD PRESENCE MAP */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            {/* MAP HEADER */}

            <div className="px-4 py-4 border-b border-[#d5e3e9]">

              <h2 className="text-[13px] font-medium">
                Field presence
              </h2>

              <p className="text-[9px] text-[#8296aa] mt-1">
                Checked-in volunteers
              </p>

            </div>

            {/* MAP VISUALIZATION */}

            <div className="relative h-[290px] overflow-hidden bg-[#e8f0ed]">

              {/* ROAD LINES */}

              <div className="absolute inset-0 opacity-80">

                {Array.from({ length: 8 }).map((_, index) => (

                  <div
                    key={index}
                    className="absolute w-[150%] h-[3px] bg-white/90"
                    style={{
                      top: `${index * 17 + 5}%`,
                      left: "-20%",
                      transform: "rotate(30deg)",
                    }}
                  />

                ))}

                {Array.from({ length: 5 }).map((_, index) => (

                  <div
                    key={`road-${index}`}
                    className="absolute w-[120%] h-[2px] bg-white/70"
                    style={{
                      top: `${index * 22 + 10}%`,
                      left: "10%",
                      transform: "rotate(-35deg)",
                    }}
                  />

                ))}

              </div>

              {/* AREA LABELS */}

              <span className="absolute top-[12%] left-[6%] text-[8px] text-[#728d87]">
                NORTH WARD
              </span>

              <span className="absolute top-[30%] right-[7%] text-[8px] text-[#728d87]">
                EASTBANK
              </span>

              <span className="absolute top-[52%] left-[45%] text-[8px] text-[#728d87]">
                CENTRAL
              </span>

              <span className="absolute bottom-[10%] left-[7%] text-[8px] text-[#728d87]">
                WEST DISTRICT
              </span>

              {/* MAP MARKERS */}

              {presenceAreas.map((area) => (

                <button
                  key={area.name}
                  onClick={() =>
                    notify(
                      `${area.name}: ${area.count} volunteers currently checked in.`
                    )
                  }
                  className={`absolute ${area.position} w-[34px] h-[34px] rounded-full bg-[#287fa9] border-[3px] border-white text-white text-[9px] font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform z-10`}
                  title={area.name}
                >

                  {area.count}

                </button>

              ))}

            </div>

            {/* MAP LEGEND */}

            <div className="p-4 space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-[#287fa9]" />

                  <span className="text-[9px]">
                    Medical teams
                  </span>

                </div>

                <span className="text-[9px] font-semibold">
                  58
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-[#65bda5]" />

                  <span className="text-[9px]">
                    Logistics
                  </span>

                </div>

                <span className="text-[9px] font-semibold">
                  96
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-[#efa53b]" />

                  <span className="text-[9px]">
                    Shelter support
                  </span>

                </div>

                <span className="text-[9px] font-semibold">
                  74
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* MANUAL CHECK-IN MODAL */}

      {showCheckIn && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-[17px] font-semibold">
                  Manual volunteer check-in
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Record a volunteer's field attendance.
                </p>

              </div>

              <button onClick={() => setShowCheckIn(false)}>
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleManualCheckIn}
              className="p-5 space-y-4"
            >

              <div>

                <label className="text-[11px] font-semibold">
                  Volunteer name
                </label>

                <input
                  required
                  value={checkInForm.volunteer}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      volunteer: e.target.value,
                    })
                  }
                  placeholder="Enter volunteer name"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Task ID
                </label>

                <input
                  required
                  value={checkInForm.task}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      task: e.target.value,
                    })
                  }
                  placeholder="e.g. TASK-782"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Location
                </label>

                <input
                  required
                  value={checkInForm.location}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter field location"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Verification method
                </label>

                <select
                  value={checkInForm.verification}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      verification: e.target.value,
                    })
                  }
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                >
                  <option>GPS verified</option>
                  <option>Coordinator verified</option>
                  <option>Manual verification</option>
                </select>

              </div>

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowCheckIn(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs hover:bg-[#17678e]"
                >
                  Confirm check-in
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* RECORD ACTIVITY MODAL */}

      {showRecordModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-[17px] font-semibold">
                  Record activity
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Add a new volunteer activity record.
                </p>

              </div>

              <button onClick={() => setShowRecordModal(false)}>
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleRecordActivity}
              className="p-5 space-y-4"
            >

              <div>

                <label className="text-[11px] font-semibold">
                  Volunteer name
                </label>

                <input
                  required
                  value={recordForm.volunteer}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      volunteer: e.target.value,
                    })
                  }
                  placeholder="Enter volunteer name"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Activity type
                </label>

                <select
                  value={recordForm.activity}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      activity: e.target.value as ActivityType,
                    })
                  }
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                >
                  <option>Checked in</option>
                  <option>Progress update</option>
                  <option>Break started</option>
                  <option>Assignment accepted</option>
                  <option>Training completed</option>
                  <option>Checked out</option>
                </select>

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Task ID
                </label>

                <input
                  required
                  value={recordForm.task}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      task: e.target.value,
                    })
                  }
                  placeholder="e.g. TASK-782"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Location
                </label>

                <input
                  required
                  value={recordForm.location}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter location"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div>

                <label className="text-[11px] font-semibold">
                  Verification details
                </label>

                <input
                  value={recordForm.verification}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      verification: e.target.value,
                    })
                  }
                  placeholder="e.g. GPS verified"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs hover:bg-[#17678e]"
                >
                  Save activity
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ACTIVITY DETAILS MODAL */}

      {selectedActivity && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[420px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-[16px] font-semibold">
                  Activity details
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedActivity.id}
                </p>

              </div>

              <button onClick={() => setSelectedActivity(null)}>
                <X size={19} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              <div className="flex items-center gap-2 text-xs">
                <Users size={15} className="text-[#287fa9]" />
                {selectedActivity.volunteer}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Activity size={15} className="text-[#287fa9]" />
                {selectedActivity.activity}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <ClipboardList size={15} className="text-[#287fa9]" />
                {selectedActivity.task}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <MapPin size={15} className="text-[#287fa9]" />
                {selectedActivity.location}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Clock size={15} className="text-[#287fa9]" />
                {selectedActivity.time}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck size={15} className="text-[#239879]" />
                {selectedActivity.verification}
              </div>

              <span className={`inline-flex px-3 py-1.5 rounded-md text-[9px] font-semibold ${getActivityStyle(selectedActivity.activity)}`}>
                {selectedActivity.activity}
              </span>

            </div>

            <div className="border-t p-4 flex justify-end">

              <button
                onClick={() => setSelectedActivity(null)}
                className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* TOAST */}

      {notification && (

        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2">

          <CheckCircle2 size={15} />

          {notification}

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg">

        <HelpCircle size={21} />

      </button>

    </div>
  );
}