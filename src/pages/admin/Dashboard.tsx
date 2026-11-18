
import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Box,
  Home,
  ArrowRight,
  TrendingUp,
  Truck,
  Sparkles,
  Package,
} from "lucide-react";

const stats = [
  {
    label: "Open requests",
    value: "1,284",
    note: "+86 today",
    icon: ClipboardList,
    color: "blue",
  },
  {
    label: "Critical priority",
    value: "47",
    note: "12 overdue",
    icon: AlertTriangle,
    color: "red",
  },
  {
    label: "People in shelters",
    value: "8,642",
    note: "76% capacity",
    icon: Home,
    color: "orange",
  },
  {
    label: "Resources available",
    value: "68%",
    note: "3 shortages",
    icon: Box,
    color: "blue",
  },
];

const chartData = [
  { day: "Mon", received: 165, fulfilled: 112 },
  { day: "Tue", received: 205, fulfilled: 135 },
  { day: "Wed", received: 145, fulfilled: 155 },
  { day: "Thu", received: 260, fulfilled: 195 },
  { day: "Fri", received: 225, fulfilled: 210 },
  { day: "Sat", received: 290, fulfilled: 235 },
  { day: "Today", received: 195, fulfilled: 155 },
];

const requests = [
  {
    id: "REQ-2841",
    description: "Household of 6 · 12 min ago",
    category: "Emergency shelter",
    location: "Riverside, North Ward",
    priority: "Critical · 94%",
    status: "Awaiting review",
    critical: true,
  },
  {
    id: "REQ-2839",
    description: "Community clinic · 26 min ago",
    category: "Medical supplies",
    location: "Old Town, Sector 4",
    priority: "High · 91%",
    status: "Verified",
    critical: false,
  },
  {
    id: "REQ-2836",
    description: "Household of 3 · 41 min ago",
    category: "Food & water",
    location: "Eastbank, Sector 2",
    priority: "High · 87%",
    status: "Assigned",
    critical: false,
  },
];

const activities = [
  {
    title: "Dispatch DEP-104 departed",
    description: "2,400 L water · Eastbank",
    time: "4 min",
    icon: Truck,
    color: "blue",
  },
  {
    title: "Critical request escalated",
    description: "REQ-2841 · North Ward",
    time: "12 min",
    icon: AlertTriangle,
    color: "red",
  },
  {
    title: "AI review completed",
    description: "Priority modified by J. Okafor",
    time: "19 min",
    icon: Sparkles,
    color: "blue",
  },
  {
    title: "Shelter capacity warning",
    description: "Riverton High at 92%",
    time: "28 min",
    icon: Home,
    color: "orange",
  },
];

function StatCard({ item }: { item: (typeof stats)[number] }) {
  const Icon = item.icon;

  const iconColors: Record<string, string> = {
    blue: "bg-sky-50 text-sky-600",
    red: "bg-red-50 text-red-500",
    orange: "bg-orange-50 text-orange-500",
  };

  const noteColors: Record<string, string> = {
    blue: "text-sky-600",
    red: "text-red-500",
    orange: "text-orange-500",
  };

  return (
    <div className="rounded-lg border border-[#64C9AD] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColors[item.color]}`}>
          <Icon size={18} />
        </div>

        <div>
          <p className="text-xs text-slate-500">{item.label}</p>
          <h3 className="mt-1 text-2xl font-bold text-[#123B5C]">
            {item.value}
          </h3>
          <p className={`mt-2 text-[10px] ${noteColors[item.color]}`}>
            {item.note}
          </p>
        </div>
      </div>
    </div>
  );
}

function OperationsChart() {
  return (
    <div className="flex h-[185px] flex-col">
      <div className="relative flex flex-1">
        <div className="flex flex-col justify-between pb-5 pr-3 text-[9px] text-slate-400">
          {[300, 200, 100, 0].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>

        <div className="relative flex flex-1 items-end justify-around border-b border-slate-200">
          {[0, 100, 200, 300].map((value) => (
            <div
              key={value}
              className="pointer-events-none absolute left-0 right-0 border-t border-slate-100"
              style={{ bottom: `${(value / 320) * 100}%` }}
            />
          ))}

          {chartData.map((data) => (
            <div
              key={data.day}
              className="relative z-10 flex h-full w-full items-end justify-center gap-1"
            >
              <div
                className="w-[7px] rounded-t-sm bg-[#2684B8]"
                style={{ height: `${(data.received / 320) * 100}%` }}
                title={`Received: ${data.received}`}
              />
              <div
                className="w-[7px] rounded-t-sm bg-[#62BDA5]"
                style={{ height: `${(data.fulfilled / 320) * 100}%` }}
                title={`Fulfilled: ${data.fulfilled}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ml-8 flex justify-around pt-2 text-[9px] text-slate-500">
        {chartData.map((data) => (
          <span key={data.day}>{data.day}</span>
        ))}
      </div>
    </div>
  );
}

function MapPanel() {
  return (
    <div className="relative h-[190px] overflow-hidden rounded-b-lg bg-[#F0F6F7]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 500 220"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="500" height="220" fill="#F0F6F7" />

        <g stroke="white" strokeWidth="3" fill="none">
          <path d="M-20 20 L160 130 L300 15 L520 160" />
          <path d="M-20 100 L120 0 L300 180 L500 35" />
          <path d="M60 240 L200 110 L370 240" />
          <path d="M180 -20 L300 90 L430 -10" />
          <path d="M0 175 L140 65 L280 220" />
          <path d="M350 0 L480 100 L400 230" />
        </g>

        <path
          d="M-30 180 L120 110 L300 25 L320 65 L140 150 L-10 220"
          fill="#BEDCE5"
          stroke="#D7E8EC"
          strokeWidth="5"
        />

        <g fill="#829AA5" fontSize="7" fontWeight="bold">
          <text x="30" y="45">NORTH WARD</text>
          <text x="155" y="155">CENTRAL</text>
          <text x="420" y="65">EASTBANK</text>
        </g>
      </svg>

      <div className="absolute left-[30%] top-[20%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow">
        <AlertTriangle size={12} />
      </div>

      <div className="absolute left-[72%] top-[22%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-white shadow">
        <Home size={12} />
      </div>

      <div className="absolute left-[42%] top-[55%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-white shadow">
        <span className="text-[9px] font-bold">24</span>
      </div>

      <div className="absolute left-[22%] top-[76%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow">
        <span className="text-[9px] font-bold">9</span>
      </div>

      <div className="absolute left-[78%] top-[72%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-teal-500 text-white shadow">
        <Package size={12} />
      </div>

      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[8px]">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Requests
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
          Shelters
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Warehouses
        </span>
      </div>
    </div>
  );
}

export default function SystemDashboard() {
  const [activePage] = useState("System Overview");

  return (
    <div className="font-sans text-[#123B5C]">
      {/* BREADCRUMB */}
      <div className="flex h-8 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[10px] text-slate-500">
        <span>Operations</span>
        <ChevronRight size={11} />
        <span className="font-semibold text-[#123B5C]">
          {activePage}
        </span>

        <span className="ml-auto hidden items-center gap-1 text-[9px] text-emerald-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live data · Updated just now
        </span>
      </div>

      {/* DASHBOARD BODY */}
      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-6 md:px-6 lg:px-7">

          {/* PAGE HEADING */}
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <span className="inline-block rounded bg-red-50 px-2 py-1 text-[8px] font-bold tracking-wide text-red-500">
                SEVERITY 4 · MAJOR
              </span>

              <h1 className="mt-2 text-xl font-medium tracking-tight text-[#123B5C] md:text-2xl">
                Emergency Operations Centre
              </h1>

              <p className="mt-1 text-[10px] text-slate-500">
                Monsoon Floods 2025 · Greater Riverton response overview
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-md border border-[#2785B2] bg-white px-3 py-2 text-[9px] font-semibold text-[#2785B2]">
                <TrendingUp size={12} />
                Situation report
              </button>

              <button className="rounded-md bg-[#123B5C] px-3 py-2 text-[9px] font-semibold text-white">
                + Log incident
              </button>
            </div>
          </div>

          {/* CRISIS BANNER */}
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-[#FFF9FA] p-3 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AlertTriangle size={16} className="shrink-0 text-red-500" />

              <div>
                <p className="text-[9px] font-bold">Monsoon Floods 2025</p>
                <p className="mt-1 text-[8px] text-slate-500">
                  Active since 18 Jun · 4 districts affected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-red-100 pt-3 md:flex md:flex-1 md:justify-around md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <div>
                <p className="text-[7px] text-slate-400">LEAD AGENCY</p>
                <p className="mt-1 text-[9px] font-semibold">
                  National Disaster Authority
                </p>
              </div>

              <div>
                <p className="text-[7px] text-slate-400">RESPONSE LEVEL</p>
                <span className="mt-1 inline-block rounded bg-red-100 px-2 py-1 text-[8px] font-bold text-red-600">
                  Level 4
                </span>
              </div>

              <div>
                <p className="text-[7px] text-slate-400">NEXT BRIEFING</p>
                <p className="mt-1 text-[9px] font-semibold">
                  14:30 · in 42 min
                </p>
              </div>
            </div>

            <button className="flex items-center gap-1 text-[8px] text-slate-500">
              View crisis <ArrowRight size={10} />
            </button>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </div>

          {/* CHART AND MAP */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">

            <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
              <div className="flex items-start justify-between border-b border-slate-100 px-3 py-3">
                <div>
                  <h2 className="text-xs font-medium">
                    Request operations
                  </h2>
                  <p className="mt-1 text-[8px] text-slate-500">
                    Received and fulfilled over the last 7 days
                  </p>
                </div>

                <div className="flex gap-3 text-[8px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-sm bg-[#2684B8]" />
                    Received
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-sm bg-[#62BDA5]" />
                    Fulfilled
                  </span>
                </div>
              </div>

              <div className="px-3 pt-3">
                <OperationsChart />
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-[#64C9AD] border-t border-[#64C9AD] sm:grid-cols-4 sm:divide-y-0">
                {[
                  ["1,947", "Total received"],
                  ["1,502", "Fulfilled"],
                  ["77.1%", "Resolution rate"],
                  ["2h 18m", "Avg. response"],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 py-3">
                    <p className="text-sm font-bold">{value}</p>
                    <p className="mt-1 text-[8px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <h2 className="text-xs font-medium">Live operations map</h2>
                  <p className="mt-1 text-[8px] text-slate-500">
                    Greater Riverton · 342 active points
                  </p>
                </div>

                <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#64C9AD]">
                  <ArrowRight size={13} />
                </button>
              </div>

              <MapPanel />
            </section>
          </div>

          {/* TABLE AND ACTIVITY */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_0.65fr]">

            <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <h2 className="text-xs font-medium">Priority requests</h2>
                  <p className="mt-1 text-[8px] text-slate-500">
                    Requiring review or action
                  </p>
                </div>

                <button className="flex items-center gap-1 text-[8px] font-semibold text-sky-700">
                  View all <ArrowRight size={10} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="bg-[#EFF6F7] text-[8px] font-semibold">
                      <th className="px-3 py-2">Request</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2">AI priority</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-t border-slate-100 text-[8px] hover:bg-slate-50"
                      >
                        <td className="px-3 py-3">
                          <p className="font-bold">{request.id}</p>
                          <p className="mt-1 text-[8px] text-slate-400">
                            {request.description}
                          </p>
                        </td>

                        <td className="px-3 py-3">{request.category}</td>
                        <td className="px-3 py-3">{request.location}</td>

                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded px-2 py-1 font-bold ${
                              request.critical
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {request.priority}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span className="whitespace-nowrap rounded bg-[#EFF6F7] px-2 py-1 font-semibold text-slate-600">
                            {request.status}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <ChevronRight size={13} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
                <div>
                  <h2 className="text-xs font-medium">Live activity</h2>
                  <p className="mt-1 text-[8px] text-slate-500">
                    Across all response teams
                  </p>
                </div>

                <span className="flex items-center gap-1 text-[8px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  LIVE
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activities.map((activity) => {
                  const Icon = activity.icon;

                  const colors: Record<string, string> = {
                    blue: "bg-sky-50 text-sky-600",
                    red: "bg-red-50 text-red-500",
                    orange: "bg-orange-50 text-orange-500",
                  };

                  return (
                    <div
                      key={activity.title}
                      className="flex items-center gap-2.5 px-3 py-3"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[activity.color]}`}>
                        <Icon size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8px] font-semibold">
                          {activity.title}
                        </p>
                        <p className="mt-1 truncate text-[8px] text-slate-500">
                          {activity.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-[8px] text-slate-400">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <footer className="flex flex-col justify-between gap-2 pb-3 pt-2 text-[8px] text-slate-400 sm:flex-row">
            <p>© 2026 Humanitarian Aid Platform · CareLink</p>
            <p className="flex items-center gap-1">
              <ShieldCheck size={11} />
              Secure operations environment
            </p>
          </footer>
        </main>
    </div>
  );
}
