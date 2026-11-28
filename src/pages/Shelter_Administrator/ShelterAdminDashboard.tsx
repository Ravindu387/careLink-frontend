
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { accommodationService } from "../../services/accommodationService";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  Plus,
  Download,
  Home,
  Users,
  BedDouble,
  ClipboardList,
  ChartNoAxesColumn,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle2,
  Activity,
  CalendarDays,
  ArrowDownToLine,
  UserPlus,
  Warehouse,
  FileText,
  ShieldAlert,
  X,
  Menu,
  Check,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* ---------------- TYPES ---------------- */

type RequestStatus = "Under Review" | "Pending" | "Approved";

type AccommodationRequest = {
  id: string;
  applicant: string;
  people: number;
  requestedAt: string;
  priority: string;
  status: RequestStatus;
};

/* ---------------- SAMPLE DATA ---------------- */

const initialRequests: AccommodationRequest[] = [
  {
    id: "AR-2841",
    applicant: "D. Jayawardena",
    people: 6,
    requestedAt: "Riverside, Ward 2",
    priority: "Riverton Central",
    status: "Under Review",
  },
  {
    id: "AR-2839",
    applicant: "M. Rasheed",
    people: 3,
    requestedAt: "Eastbank, Sector 4",
    priority: "North Community",
    status: "Pending",
  },
  {
    id: "AR-2832",
    applicant: "S. Fernando",
    people: 4,
    requestedAt: "Old Town",
    priority: "Lakeside Sports",
    status: "Approved",
  },
];

const shelterData = [
  {
    name: "Riverton Central School",
    occupied: 612,
    capacity: 660,
    color: "#f3b443",
  },
  {
    name: "North Community Hall",
    occupied: 284,
    capacity: 500,
    color: "#46b99b",
  },
  {
    name: "St. Mary Civic Centre",
    occupied: 450,
    capacity: 450,
    color: "#ef525b",
  },
  {
    name: "Lakeside Sports Hall",
    occupied: 196,
    capacity: 400,
    color: "#46b99b",
  },
];

const chartData = [
  { day: "Mon", admissions: 45, departures: 19 },
  { day: "Tue", admissions: 58, departures: 24 },
  { day: "Wed", admissions: 42, departures: 29 },
  { day: "Thu", admissions: 68, departures: 26 },
  { day: "Fri", admissions: 62, departures: 37 },
  { day: "Sat", admissions: 79, departures: 43 },
  { day: "Today", admissions: 53, departures: 33 },
];

const criticalAlerts = [
  {
    title: "Fire Risk Alert: Critical level",
    description: "Riverton Central · 12 remaining",
    type: "danger",
  },
  {
    title: "Shelter reached 92% capacity",
    description: "Riverton Central School",
    type: "warning",
  },
  {
    title: "Water pump failure reported",
    description: "St. Mary Civic Centre",
    type: "danger",
  },
  {
    title: "Food packs below minimum",
    description: "North Community Hall",
    type: "warning",
  },
];

/* ---------------- MAIN COMPONENT ---------------- */

export default function ShelterAdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState("");
  const [notifications, setNotifications] = useState(5);
  const [selectedRequest, setSelectedRequest] =
    useState<AccommodationRequest | null>(null);

  const [newShelter, setNewShelter] = useState({
    name: "",
    location: "",
    capacity: "",
  });

  useEffect(() => {
    accommodationService
      .getRequests({ pageSize: 5 })
      .then((res: any) => {
        if (res.items && res.items.length > 0) {
          setRequests(
            res.items.map((r: any) => ({
              id: r.id,
              applicant: r.applicant,
              people: r.familyMembers,
              requestedAt: r.currentLocation,
              priority: r.requestedShelter,
              status: (r.status === "Approved" || r.status === "Pending" ? r.status : "Under Review") as RequestStatus,
            }))
          );
        }
      })
      .catch((err: any) => console.error("Error loading dashboard requests:", err));
  }, []);

  const filteredRequests = requests.filter((request) =>
    `${request.id} ${request.applicant} ${request.requestedAt}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const approveRequest = async (id: string) => {
    try {
      await accommodationService.updateRequestStatus(id, "Approved");
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? { ...request, status: "Approved" }
            : request
        )
      );
    } catch (err) {
      console.error("Failed to approve request:", err);
    }

    setSelectedRequest(null);
  };

  const handleRegisterShelter = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newShelter.name || !newShelter.location || !newShelter.capacity) {
      return;
    }

    setNewShelter({
      name: "",
      location: "",
      capacity: "",
    });

    setModal("shelter-success");
  };

  const handleGenerateReport = () => {
    const rows = [
      ["Shelter", "Occupied", "Capacity"],
      ...shelterData.map((s) => [
        s.name,
        String(s.occupied),
        String(s.capacity),
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "shelter-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b p-4 flex flex-col gap-3 text-xs">
          <button
            onClick={() => {
              navigate("/shelter-admin/shelters");
              setMenuOpen(false);
            }}
          >
            Register Shelter
          </button>
          <button onClick={handleGenerateReport}>Generate Report</button>
          <button onClick={() => setMenuOpen(false)}>Close Menu</button>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}

      <main className="max-w-[1500px] mx-auto px-4 md:px-7 py-6">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">
            Shelter Admin Dashboard
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Shelter Admin Dashboard
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              Monitor shelter capacity, resident wellbeing, resources, and urgent operations.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={handleGenerateReport}
              className="h-9 px-3 bg-white border border-[#9ebdcd] rounded-md text-sm font-medium flex items-center gap-2 hover:bg-slate-50"
            >
              <Download size={13} />
              Generate report
            </button>

            <button
              onClick={() => navigate("/shelter-admin/shelters")}
              className="h-9 px-3 bg-[#1c5d83] text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-[#124768]"
            >
              <Plus size={13} />
              Register shelter
            </button>
          </div>
        </div>

        {/* DEMO ENVIRONMENT BANNER */}
        <div className="bg-[#f0fbf7] border border-[#b7e9d9] rounded-lg px-3 py-2.5 mb-4 flex items-center gap-3">

          <CheckCircle2 size={15} className="text-[#35a985] shrink-0" />

          <div>
            <p className="text-sm font-semibold text-[#23775e]">
              Demonstration environment
            </p>

            <p className="text-xs text-[#398b70]">
              Operational figures below are realistic sample data for CareLink coursework.
            </p>
          </div>

          <span className="ml-auto text-xs text-slate-400 hidden sm:block">
            Updated just now
          </span>
        </div>

        {/* ================= KPI CARDS ================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">

          <KpiCard
            icon={<Home size={17} />}
            color="blue"
            title="Registered shelters"
            value="5"
            description="5 currently operational"
          />

          <KpiCard
            icon={<Users size={17} />}
            color="green"
            title="Total capacity"
            value="2,330"
            description="1,542 occupied"
          />

          <KpiCard
            icon={<BedDouble size={17} />}
            color="green"
            title="Available beds"
            value="788"
            description="33.8% capacity available"
          />

          <KpiCard
            icon={<ClipboardList size={17} />}
            color="orange"
            title="Pending requests"
            value={String(requests.filter(r => r.status !== "Approved").length + 10)}
            description="12 require priority"
          />

          <KpiCard
            icon={<ChartNoAxesColumn size={17} />}
            color="blue"
            title="Capacity usage"
            value="66.2%"
            description="1,542 / 2,330 occupied"
          />

          <KpiCard
            icon={<Clock size={17} />}
            color="blue"
            title="Reserved beds"
            value="46"
            description="For approved arrivals"
          />

          <KpiCard
            icon={<Package size={17} />}
            color="red"
            title="Resource alerts"
            value="5"
            description="2 items out of stock"
          />

          <KpiCard
            icon={<AlertTriangle size={17} />}
            color="orange"
            title="Critical incidents"
            value="3"
            description="3 require attention"
          />
        </div>

        {/* ================= OCCUPANCY + CHART ================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-3 mb-3">

          {/* SHELTER OCCUPANCY */}
          <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">

            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Shelter occupancy overview
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Current occupancy across active shelters
                </p>
              </div>

              <button
                onClick={() => setModal("occupancy")}
                className="text-sm text-[#267ca7] flex items-center gap-1"
              >
                View occupancy
                <ChevronRight size={11} />
              </button>
            </div>

            <div className="px-4 py-4 space-y-4">

              {shelterData.map((shelter) => {
                const percentage = Math.round(
                  (shelter.occupied / shelter.capacity) * 100
                );

                return (
                  <div key={shelter.name}>

                    <div className="flex justify-between items-center mb-1.5">

                      <div>
                        <p className="text-xs font-semibold">
                          {shelter.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {shelter.occupied} of {shelter.capacity} occupied
                        </p>
                      </div>

                      <span
                        className="text-xs font-semibold"
                        style={{ color: shelter.color }}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full h-[6px] bg-[#eaf0f3] rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: shelter.color,
                        }}
                      />

                    </div>
                  </div>
                );
              })}
            </div>

            {/* OCCUPANCY SUMMARY */}
            <div className="border-t border-slate-200 px-4 py-3 grid grid-cols-3 gap-2">

              <MiniSummary
                label="Occupied"
                value="1,542"
                color="#267ca7"
              />

              <MiniSummary
                label="Available"
                value="788"
                color="#42b99b"
              />

              <MiniSummary
                label="Reserved"
                value="46"
                color="#f2a936"
              />
            </div>
          </section>

          {/* ADMISSIONS & DEPARTURES */}
          <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">

            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">

              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Admissions &amp; departures
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Last seven days
                </p>
              </div>

              <span className="bg-[#e6f8f1] text-[#219c78] rounded px-2 py-1 text-xs font-semibold">
                +100 residents
              </span>
            </div>

            <div className="px-3 pt-5 pb-3 h-[205px]">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  barGap={3}
                >

                  <CartesianGrid
                    vertical={false}
                    stroke="#e8eef1"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 8, fill: "#7890a0" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 8, fill: "#7890a0" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #d5e3e9",
                      fontSize: "11px",
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: "9px",
                      paddingTop: "10px",
                    }}
                  />

                  <Bar
                    dataKey="admissions"
                    name="Admissions"
                    fill="#22638e"
                    radius={[2, 2, 0, 0]}
                    barSize={7}
                  />

                  <Bar
                    dataKey="departures"
                    name="Departures"
                    fill="#45b99b"
                    radius={[2, 2, 0, 0]}
                    barSize={7}
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* ================= REQUESTS + ALERTS ================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.85fr] gap-3 mb-4">

          {/* PENDING REQUESTS */}
          <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">

            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">

              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Pending accommodation requests
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Highest-priority requests requiring review
                </p>
              </div>

              <button
                onClick={() => setModal("requests")}
                className="text-sm text-[#267ca7] flex items-center gap-1"
              >
                View all
                <ChevronRight size={11} />
              </button>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[640px] text-left">

                <thead className="bg-[#f5f8fa] border-b border-slate-200">

                  <tr className="text-sm text-slate-500">
                    <th className="px-3 py-3">Request</th>
                    <th className="px-3 py-3">Applicant</th>
                    <th className="px-3 py-3">People</th>
                    <th className="px-3 py-3">Requested at</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (

                    <tr
                      key={request.id}
                      className="border-b border-slate-100 hover:bg-slate-50 text-sm"
                    >

                      <td className="px-3 py-3 font-semibold text-[#267ca7]">
                        {request.id}
                      </td>

                      <td className="px-3 py-3">
                        {request.applicant}
                      </td>

                      <td className="px-3 py-3">
                        {request.people}
                      </td>

                      <td className="px-3 py-3">
                        {request.requestedAt}
                      </td>

                      <td className="px-3 py-3">
                        {request.priority}
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={request.status} />
                      </td>

                      <td className="px-3 py-3">

                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setModal("request-details");
                          }}
                          className="text-slate-400 hover:text-[#267ca7]"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-sm text-slate-400"
                      >
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </section>

          {/* CRITICAL ALERTS */}
          <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">

            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">

              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Critical alerts
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Immediate attention required
                </p>
              </div>

              <span className="bg-[#fff0f0] text-red-600 rounded px-2 py-1 text-xs font-semibold">
                5 open
              </span>
            </div>

            <div>
              {criticalAlerts.map((alert, index) => (

                <button
                  key={index}
                  onClick={() => setModal(`alert-${index}`)}
                  className="w-full px-3 py-3 border-b border-slate-100 flex items-center gap-2.5 text-left hover:bg-slate-50 transition"
                >

                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${alert.type === "danger"
                      ? "bg-[#fff0f0] text-[#ef525b]"
                      : "bg-[#fff6e5] text-[#e5a12d]"
                      }`}
                  >
                    <AlertTriangle size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">
                      {alert.title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {alert.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={13}
                    className="text-slate-400 shrink-0"
                  />

                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <section>

          <h2 className="text-base sm:text-lg font-semibold mb-3">
            Quick actions
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">

            <QuickAction
              icon={<Home size={16} />}
              label="Register New Shelter"
              onClick={() => navigate("/shelter-admin/shelters")}
            />

            <QuickAction
              icon={<UserPlus size={16} />}
              label="Add Resident"
              onClick={() => setModal("resident")}
            />

            <QuickAction
              icon={<BedDouble size={16} />}
              label="Manage Beds"
              onClick={() => setModal("beds")}
            />

            <QuickAction
              icon={<ClipboardList size={16} />}
              label="Review Requests"
              onClick={() => setModal("requests")}
            />

            <QuickAction
              icon={<Package size={16} />}
              label="Add Resources"
              onClick={() => setModal("resources")}
            />

            <QuickAction
              icon={<FileText size={16} />}
              label="Generate Report"
              onClick={handleGenerateReport}
            />

          </div>
        </section>
      </main>

      {/* ================= MODALS ================= */}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold">
                {modal === "register" && "Register New Shelter"}
                {modal === "resident" && "Add Resident"}
                {modal === "beds" && "Manage Beds"}
                {modal === "requests" && "Accommodation Requests"}
                {modal === "resources" && "Add Resources"}
                {modal === "occupancy" && "Shelter Occupancy"}
                {modal === "shelter-success" && "Shelter Registration"}
                {modal.startsWith("alert-") && "Critical Alert Details"}
                {modal === "request-details" && "Request Details"}
              </h2>

              <button
                onClick={() => setModal("")}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={19} />
              </button>
            </div>

            {modal === "register" ? (
              <form
                onSubmit={handleRegisterShelter}
                className="space-y-4"
              >
                <FormInput
                  label="Shelter name"
                  placeholder="Enter shelter name"
                  value={newShelter.name}
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, name: v })
                  }
                />

                <FormInput
                  label="Location"
                  placeholder="Enter shelter location"
                  value={newShelter.location}
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, location: v })
                  }
                />

                <FormInput
                  label="Total capacity"
                  placeholder="Enter number of beds"
                  type="number"
                  value={newShelter.capacity}
                  onChange={(v) =>
                    setNewShelter({ ...newShelter, capacity: v })
                  }
                />

                <button
                  type="submit"
                  className="w-full bg-[#1c5d83] text-white rounded-lg py-3 text-sm font-semibold"
                >
                  Register shelter
                </button>
              </form>
            ) : modal === "request-details" && selectedRequest ? (
              <div className="space-y-3 text-xs">
                <p>Request ID: <strong>{selectedRequest.id}</strong></p>
                <p>Applicant: <strong>{selectedRequest.applicant}</strong></p>
                <p>Household members: <strong>{selectedRequest.people}</strong></p>
                <p>Location: <strong>{selectedRequest.requestedAt}</strong></p>
                <p>Status: <strong>{selectedRequest.status}</strong></p>

                <button
                  onClick={() => approveRequest(selectedRequest.id)}
                  disabled={selectedRequest.status === "Approved"}
                  className="w-full bg-[#1c5d83] disabled:bg-emerald-600 text-white rounded-lg py-3 text-sm font-semibold"
                >
                  {selectedRequest.status === "Approved"
                    ? "Already approved"
                    : "Approve request"}
                </button>
              </div>
            ) : modal === "shelter-success" ? (
              <div className="text-center py-4">
                <CheckCircle2 size={35} className="mx-auto text-emerald-500" />
                <p className="text-sm mt-3">
                  Demo form submitted successfully.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Connect the registration API to save the shelter.
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Activity size={30} className="mx-auto text-[#2785b7]" />
                <p className="text-sm mt-3 font-medium">
                  {modal.startsWith("alert-")
                    ? criticalAlerts[Number(modal.split("-")[1])]?.title
                    : "Manage shelter operations"}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Connect the relevant module to enable this operation.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setModal("");
                setSelectedRequest(null);
              }}
              className="w-full mt-4 border border-slate-200 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function KpiCard({
  icon,
  color,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "red";
  title: string;
  value: string;
  description: string;
}) {
  const colors = {
    blue: "bg-[#eaf3fa] text-[#3985ae]",
    green: "bg-[#e7f8f1] text-[#43b99b]",
    orange: "bg-[#fff5e5] text-[#e8a333]",
    red: "bg-[#fff0f0] text-[#ed555b]",
  };

  return (
    <div className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm p-3 flex items-center gap-3 min-h-[75px]">

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">
          {title}
        </p>

        <h3 className="text-lg font-bold leading-tight mt-0.5">
          {value}
        </h3>

        <p className="text-xs text-slate-400 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function MiniSummary({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border-r last:border-r-0 border-slate-200 px-2">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="w-1.5 h-1.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold">
          {value}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles = {
    "Under Review": "bg-[#fff3df] text-[#bd821c]",
    Pending: "bg-[#edf2f6] text-[#52748c]",
    Approved: "bg-[#e6f8f1] text-[#279e78]",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#d5e3e9] rounded-lg min-h-[52px] px-2 flex items-center gap-2 hover:border-[#45b99b] hover:shadow-sm transition group"
    >
      <div className="w-7 h-7 rounded-md bg-[#e7f8f1] text-[#45b99b] flex items-center justify-center shrink-0">
        {icon}
      </div>

      <span className="text-xs font-semibold text-left flex-1">
        {label}
      </span>

      <ChevronRight
        size={12}
        className="text-slate-400 group-hover:text-[#2785b7]"
      />
    </button>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <input
        required
        type={type}
        min={type === "number" ? 1 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}
