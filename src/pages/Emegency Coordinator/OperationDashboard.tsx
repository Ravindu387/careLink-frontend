
import {
  AlertTriangle,
  Download,
  Plus,
  Activity,
  Inbox,
  TrendingUp,
  Package,
  Home,
  Users,
  Sparkles,
  Clock,
  ArrowUpRight,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    title: "Active crisis events",
    value: "3",
    detail: "1 severity level 4",
    icon: AlertTriangle,
    color: "red",
  },
  {
    title: "Open requests",
    value: "1,284",
    detail: "86 today",
    icon: Inbox,
    color: "blue",
  },
  {
    title: "Critical priority",
    value: "47",
    detail: "12 overdue",
    icon: TrendingUp,
    color: "red",
  },
  {
    title: "Available resources",
    value: "68%",
    detail: "3 critical shortages",
    icon: Package,
    color: "amber",
  },
  {
    title: "Active shelters",
    value: "38",
    detail: "8,642 people",
    icon: Home,
    color: "green",
  },
  {
    title: "Response teams",
    value: "126",
    detail: "84 currently deployed",
    icon: Users,
    color: "blue",
  },
  {
    title: "AI reviews pending",
    value: "8",
    detail: "3 critical cases",
    icon: Sparkles,
    color: "purple",
  },
  {
    title: "Avg response time",
    value: "2h 18m",
    detail: "-18 min this week",
    icon: Clock,
    color: "green",
  },
];

const weeklyData = [
  { day: "Mon", received: 45, fulfilled: 32 },
  { day: "Tue", received: 68, fulfilled: 48 },
  { day: "Wed", received: 52, fulfilled: 39 },
  { day: "Thu", received: 82, fulfilled: 61 },
  { day: "Fri", received: 65, fulfilled: 50 },
  { day: "Sat", received: 95, fulfilled: 73 },
  { day: "Sun", received: 72, fulfilled: 58 },
];

const activities = [
  {
    title: "Emergency shelter request received",
    location: "Greater Riverton",
    time: "5 minutes ago",
    status: "New",
  },
  {
    title: "Response team deployed",
    location: "North Ward",
    time: "18 minutes ago",
    status: "In Progress",
  },
  {
    title: "Resource allocation completed",
    location: "Central District",
    time: "32 minutes ago",
    status: "Completed",
  },
];

const colorStyles: Record<string, string> = {
  red: "bg-red-50 text-red-600",
  blue: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-purple-50 text-purple-600",
};

function StatCard({ item }: { item: (typeof stats)[number] }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{item.title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-800">
            {item.value}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">
            {item.detail}
          </p>
        </div>

        <div className={`rounded-lg p-3 ${colorStyles[item.color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function OperationDashboard() {
  return (
    <div className="min-h-screen bg-[#eff5f7] px-4 py-5 md:px-6 lg:px-7">

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <span>Emergency Operations</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-slate-800">
          Emergency Operations Dashboard
        </span>
      </div>

      {/* Page Heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#123b5a]">
            Emergency Operations Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Coordinate crisis response, critical cases, resources,
            shelters, and partner organisations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={16} />
            Situation report
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-[#247ba5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#17668c]">
            <Plus size={17} />
            Log incident
          </button>
        </div>
      </div>

      {/* Active Crisis Alert */}
      <div className="mb-5 flex flex-col justify-between gap-4 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-red-50 p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-red-100 p-3 text-red-600">
            <AlertTriangle size={23} />
          </div>

          <div>
            <span className="rounded bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
              SEVERITY 4 - MAJOR
            </span>
            <h3 className="mt-2 text-sm font-bold text-slate-800">
              Monsoon Floods 2025
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Active since 18 Jun · 4 districts affected
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-[10px] uppercase text-slate-400">
              Lead agency
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-800">
              National Disaster Authority
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-slate-400">
              Next briefing
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-800">
              14:30 · in 42 min
            </p>
          </div>

          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            View crisis
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </div>

      {/* Charts and Map */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Requests Chart */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Requests received and fulfilled
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Last seven days
              </p>
            </div>

            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-sky-600" />
                Received
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                Fulfilled
              </span>
            </div>
          </div>

          <div className="flex h-64 items-end justify-around gap-3 px-5 pb-5 pt-8">
            {weeklyData.map((data) => (
              <div
                key={data.day}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className="w-4 rounded-t bg-sky-600"
                    style={{ height: `${data.received}%` }}
                    title={`Received: ${data.received}`}
                  />
                  <div
                    className="w-4 rounded-t bg-emerald-500"
                    style={{ height: `${data.fulfilled}%` }}
                    title={`Fulfilled: ${data.fulfilled}`}
                  />
                </div>
                <span className="mt-3 text-[10px] text-slate-500">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Map */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Live operations map
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                342 active operational points
              </p>
            </div>

            <button className="flex items-center gap-1 text-xs font-medium text-sky-700">
              Open full map <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#e5edf0]">
            <div className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(32deg, transparent 47%, white 48%, white 50%, transparent 51%), linear-gradient(145deg, transparent 47%, white 48%, white 50%, transparent 51%)",
                backgroundSize: "120px 100px",
              }}
            />

            <div className="absolute left-[20%] top-[25%]">
              <MapPin size={30} className="text-red-600" />
            </div>
            <div className="absolute right-[25%] top-[35%]">
              <MapPin size={30} className="text-blue-600" />
            </div>
            <div className="absolute bottom-[25%] left-[48%]">
              <MapPin size={30} className="text-emerald-600" />
            </div>

            <div className="z-10 rounded-lg bg-white/90 px-4 py-3 text-center shadow">
              <Activity className="mx-auto mb-1 text-sky-700" size={23} />
              <p className="text-xs font-semibold text-slate-700">
                Operational map preview
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Connect your live map data here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Recent operations
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Latest emergency response activities
              </p>
            </div>
            <button className="text-xs font-medium text-sky-700">
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <div
                key={activity.title}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h4 className="text-sm font-medium text-slate-800">
                    {activity.title}
                  </h4>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />
                    {activity.location}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700">
                    {activity.status}
                  </span>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Briefing */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">
            Upcoming briefings
          </h3>

          <div className="mt-5 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <Calendar size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                Emergency coordination briefing
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Today · 14:30
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Lead organisation
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                National Disaster Authority
              </p>
            </div>
            <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] text-slate-400">
        ReliefOS Emergency Coordination · Dashboard
      </p>
    </div>
  );
}
