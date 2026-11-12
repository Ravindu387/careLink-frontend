import React from "react";

import {
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ArrowUpToLine,
  CheckCircle2,
  TrendingUp,
  Download,
  Plus,
  ChevronRight,
  Activity,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// =============================
// Dashboard Statistics
// =============================

const statistics = [
  {
    title: "My active cases",
    value: "28",
    description: "4 new within 1 hour",
    icon: BriefcaseBusiness,
    color: "blue",
  },
  {
    title: "Unassigned cases",
    value: "63",
    description: "6 flagged overdue",
    icon: FileText,
    color: "orange",
  },
  {
    title: "Awaiting verification",
    value: "14",
    description: "Evidence to review",
    icon: ShieldCheck,
    color: "blue",
  },
  {
    title: "Critical queue",
    value: "12",
    description: "3 over 1 hour",
    icon: AlertTriangle,
    color: "red",
  },
  {
    title: "Potential duplicates",
    value: "9",
    description: "Human review required",
    icon: Copy,
    color: "purple",
  },
  {
    title: "Escalated cases",
    value: "7",
    description: "2 awaiting coordinator",
    icon: ArrowUpToLine,
    color: "red",
  },
  {
    title: "Resolved today",
    value: "84",
    description: "Median 2.1 hours",
    icon: CheckCircle2,
    color: "green",
  },
  {
    title: "SLA performance",
    value: "91.4%",
    description: "+2.7% this week",
    icon: TrendingUp,
    color: "green",
  },
];

// =============================
// Case Status Data
// =============================

const statusData = [
  { name: "Submitted", value: 284 },
  { name: "Under Review", value: 218 },
  { name: "Verified", value: 194 },
  { name: "Assigned", value: 246 },
  { name: "In Progress", value: 182 },
  { name: "Pending Info", value: 96 },
  { name: "Escalated", value: 64 },
];

// =============================
// Chart Data
// =============================

const chartData = [
  { day: "Mon", received: 85, resolved: 65 },
  { day: "Tue", received: 105, resolved: 80 },
  { day: "Wed", received: 95, resolved: 92 },
  { day: "Thu", received: 125, resolved: 100 },
  { day: "Fri", received: 115, resolved: 108 },
  { day: "Sat", received: 145, resolved: 130 },
  { day: "Today", received: 100, resolved: 85 },
];

// =============================
// Priority Cases
// =============================

const priorityCases = [
  {
    id: "ECO-2841",
    category: "Emergency shelter",
    applicant: "M. Fernando - 3 people",
    location: "Riverview, North Ward",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "94% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "18 min",
    status: "Under Review",
  },
  {
    id: "ECO-2829",
    category: "Medical supplies",
    applicant: "D. Silva - 2 people",
    location: "Old Town, Sector 4",
    priority: "High",
    aiPriority: "High",
    confidence: "87% confidence",
    verification: "Verified",
    assigned: "You",
    age: "34 min",
    status: "Assigned",
  },
  {
    id: "ECO-2836",
    category: "Food & water",
    applicant: "K. Mendis - 5 people",
    location: "Eastbank, Sector 2",
    priority: "High",
    aiPriority: "High",
    confidence: "82% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
  },
];

// =============================
// Recent Activity
// =============================

const activities = [
  {
    title: "Case escalated",
    description: "ECO-2841 - Needs urgent assistance",
    time: "4 min",
    icon: ArrowUpToLine,
    color: "blue",
  },
  {
    title: "AI review completed",
    description: "ECO-2836 - Critical approved",
    time: "12 min",
    icon: Activity,
    color: "green",
  },
  {
    title: "Citizen information received",
    description: "ECO-2829 - Additional details",
    time: "19 min",
    icon: MessageSquare,
    color: "blue",
  },
  {
    title: "Duplicate pair detected",
    description: "ECO-2818 - Similarity match",
    time: "28 min",
    icon: Copy,
    color: "purple",
  },
];

// =============================
// Reusable Stat Card
// =============================

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  color,
}) => {
  const colorStyles: Record<string, string> = {
    blue: "bg-sky-50 text-sky-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${colorStyles[color]}`}
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0">

          <p className="text-[12px] font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-1 text-[26px] font-bold text-slate-800">
            {value}
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
};

// =============================
// Main Dashboard Component
// =============================

const CaseManagementDashboard: React.FC = () => {

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">

      {/* ================= MAIN CONTENT ================= */}

      <main className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8">

        {/* BREADCRUMB */}

        <div className="mb-8 flex items-center gap-3 text-[12px] text-slate-400">

          <span>Operations</span>

          <ChevronRight size={15} />

          <span>Case Management</span>

          <ChevronRight size={15} />

          <span className="font-semibold text-slate-700">
            Case Management Dashboard
          </span>

        </div>

        {/* PAGE HEADING */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-5">

          <div>

            <h1 className="text-[34px] font-normal tracking-tight text-slate-800 md:text-[36px]">
              Case Management Dashboard
            </h1>

            <p className="mt-2 text-[14px] text-slate-500">
              Review incoming assistance cases, verify evidence,
              and coordinate authorised response decisions.
            </p>

          </div>

          <div className="flex gap-3">

            <button className="flex h-[45px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50">

              <Download size={17} />

              Export summary

            </button>

            <button className="flex h-[45px] items-center gap-2 rounded-lg bg-sky-700 px-5 text-[12px] font-semibold text-white transition hover:bg-sky-800">

              <Plus size={17} />

              Create case

            </button>

          </div>

        </div>

        {/* DEMONSTRATION ALERT */}

        <div className="mb-5 flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-5 py-4">

          <div className="flex items-center gap-3">

            <CheckCircle2 size={20} className="text-sky-700" />

            <div>

              <p className="text-[13px] font-semibold text-sky-800">
                Demonstration operations data
              </p>

              <p className="mt-1 text-[11px] text-sky-700">
                Realistic sample records for the Greater Riverton
                flood response.
              </p>

            </div>

          </div>

          <span className="hidden text-[10px] text-sky-600 sm:block">
            Updated just now
          </span>

        </div>

        {/* STATISTICS CARDS */}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {statistics.map((item, index) => (

            <StatCard
              key={index}
              {...item}
            />

          ))}

        </section>

        {/* CHARTS SECTION */}

        <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">

          {/* CASE STATUS OVERVIEW */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">

              <div>

                <h2 className="text-[16px] font-semibold">
                  Case status overview
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Open cases by workflow stage
                </p>

              </div>

              <span className="rounded-lg bg-sky-50 px-3 py-2 text-[10px] font-semibold text-sky-700">
                1,284 open
              </span>

            </div>

            <div className="space-y-5 p-6">

              {statusData.map((item) => (

                <div
                  key={item.name}
                  className="flex items-center gap-4"
                >

                  <span className="w-[90px] shrink-0 text-[11px] font-medium text-slate-600">
                    {item.name}
                  </span>

                  <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-[#65b9a1] transition-all"
                      style={{
                        width: `${(item.value / 350) * 100}%`,
                      }}
                    />

                  </div>

                  <span className="w-9 text-right text-[11px] font-semibold text-slate-700">
                    {item.value}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* CASES RECEIVED VS RESOLVED */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">

              <div>

                <h2 className="text-[16px] font-semibold">
                  Cases received vs resolved
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Last seven days
                </p>

              </div>

              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700">
                Resolution +84.7%
              </span>

            </div>

            <div className="h-[280px] w-full p-4">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 5,
                    left: -20,
                    bottom: 0,
                  }}
                  barGap={3}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8eef2"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                    }}
                  />

                  <Bar
                    dataKey="received"
                    name="Received"
                    fill="#287db2"
                    radius={[3, 3, 0, 0]}
                    barSize={10}
                  />

                  <Bar
                    dataKey="resolved"
                    name="Resolved"
                    fill="#65b9a1"
                    radius={[3, 3, 0, 0]}
                    barSize={10}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </section>

        {/* PRIORITY AND ACTIVITY */}

        <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">

          {/* PRIORITY CASES TABLE */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">

              <div>

                <h2 className="text-[16px] font-semibold">
                  Priority cases requiring action
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Sorted by urgency and SLA risk
                </p>

              </div>

              <button className="flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-900">

                View priority queue

                <ChevronRight size={15} />

              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50">

                  <tr className="text-[11px] font-semibold text-slate-500">

                    <th className="px-4 py-4">Case</th>

                    <th className="px-4 py-4">
                      Category & Applicant
                    </th>

                    <th className="px-4 py-4">Location</th>

                    <th className="px-4 py-4">Reported</th>

                    <th className="px-4 py-4">AI Priority</th>

                    <th className="px-4 py-4">Verification</th>

                    <th className="px-4 py-4">Assigned</th>

                    <th className="px-4 py-4">Age</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4"></th>

                  </tr>

                </thead>

                <tbody>

                  {priorityCases.map((item) => (

                    <tr
                      key={item.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >

                      <td className="whitespace-nowrap px-4 py-5 text-[11px] font-semibold text-sky-700">
                        {item.id}
                      </td>

                      <td className="px-4 py-5">

                        <p className="whitespace-nowrap text-[11px] font-semibold">
                          {item.category}
                        </p>

                        <p className="mt-1 whitespace-nowrap text-[10px] text-slate-400">
                          {item.applicant}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-[11px] text-slate-500">
                        {item.location}
                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-md px-2 py-1.5 text-[10px] font-semibold ${
                            item.priority === "Critical"
                              ? "bg-red-100 text-red-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {item.priority}
                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <p className="text-[11px] font-semibold">
                          {item.aiPriority}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.confidence}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-[11px] text-slate-500">
                        {item.verification}
                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-[11px] text-slate-500">
                        {item.assigned}
                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-[11px] text-slate-500">
                        {item.age}
                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-semibold ${
                            item.status === "Under Review"
                              ? "bg-orange-100 text-orange-700"
                              : item.status === "Assigned"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button
                          title="View case"
                          className="text-slate-400 hover:text-sky-700"
                        >
                          <ChevronRight size={17} />
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* RECENT ACTIVITY */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">

              <div>

                <h2 className="text-[16px] font-semibold">
                  Recent case activity
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  Across assigned operations
                </p>

              </div>

              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700">
                Live
              </span>

            </div>

            <div className="divide-y divide-slate-100">

              {activities.map((activity, index) => {

                const Icon = activity.icon;

                return (

                  <div
                    key={index}
                    className="flex items-center gap-3 px-5 py-5 transition hover:bg-slate-50"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">

                      <Icon size={19} />

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[12px] font-semibold text-slate-700">
                        {activity.title}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-slate-400">
                        {activity.description}
                      </p>

                    </div>

                    <span className="whitespace-nowrap text-[10px] text-slate-400">
                      {activity.time} ago
                    </span>

                  </div>

                );

              })}

            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section className="mb-8">

          <h2 className="mb-4 text-[16px] font-semibold text-slate-700">
            Quick actions
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            {[
              {
                title: "Open My Cases",
                icon: BriefcaseBusiness,
              },
              {
                title: "Claim Unassigned",
                icon: ClipboardCheck,
              },
              {
                title: "Verify Evidence",
                icon: ShieldCheck,
              },
              {
                title: "Review Priority",
                icon: AlertTriangle,
              },
              {
                title: "Review Duplicates",
                icon: Copy,
              },
              {
                title: "Case Report",
                icon: BarChart3,
              },
            ].map((action, index) => {

              const Icon = action.icon;

              return (

                <button
                  key={index}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">

                      <Icon size={19} />

                    </div>

                    <span className="text-[11px] font-semibold text-slate-600">
                      {action.title}
                    </span>

                  </div>

                  <ChevronRight
                    size={16}
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-700"
                  />

                </button>

              );

            })}

          </div>

        </section>

      </main>

    </div>

  );
};

export default CaseManagementDashboard;