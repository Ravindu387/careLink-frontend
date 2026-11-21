import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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
  RefreshCw,
  Server,
  X,
  Check,
  Clock,
  UserCheck,
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

import { caseManagementService } from "../../services/caseManagementService";
import type {
  CaseDashboardResponse,
  CaseItem,
  CreateCaseRequest,
} from "../../types/caseManagement";

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ArrowUpToLine,
  CheckCircle2,
  TrendingUp,
  Activity,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
};

// =============================
// Reusable Stat Card Component
// =============================

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  iconKey?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  iconKey = "BriefcaseBusiness",
  color,
}) => {
  const Icon = ICON_MAP[iconKey] || BriefcaseBusiness;

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
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            colorStyles[color] || colorStyles.blue
          }`}
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500">{title}</p>
          <h2 className="mt-1 text-[26px] font-bold text-slate-800">{value}</h2>
          <p className="mt-1 text-[10px] text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

// =============================
// Main Dashboard Component
// =============================

const CaseManagementDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<CaseDashboardResponse | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Case Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmittingCase, setIsSubmittingCase] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateCaseRequest>({
    category: "Emergency shelter",
    applicantName: "",
    peopleCount: 1,
    location: "",
    priority: "High",
    description: "",
  });

  // Load dashboard data
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await caseManagementService.getDashboard();
      setDashboardData(result.data);
      setIsLiveBackend(result.isLiveBackend);
    } catch (err: unknown) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Flash toast message timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle Export summary
  const handleExport = async () => {
    if (!dashboardData) return;
    setIsExporting(true);
    try {
      await caseManagementService.downloadExportSummary(dashboardData.priorityCases);
      setToastMessage("Summary report downloaded successfully.");
    } catch {
      setToastMessage("Failed to download summary report.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Claim Case
  const handleClaimCase = async (caseId: string) => {
    try {
      await caseManagementService.claimCase(caseId, "You");
      setToastMessage(`Case ${caseId} assigned to you.`);
      // Refresh dashboard to show updated active cases & activity
      fetchDashboardData(true);
    } catch {
      setToastMessage(`Failed to claim case ${caseId}.`);
    }
  };

  // Handle Create Case Submit
  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName.trim() || !formData.location.trim()) {
      alert("Please fill in applicant name and location.");
      return;
    }

    setIsSubmittingCase(true);
    try {
      const created = await caseManagementService.createCase(formData);
      setIsModalOpen(false);
      setFormData({
        category: "Emergency shelter",
        applicantName: "",
        peopleCount: 1,
        location: "",
        priority: "High",
        description: "",
      });
      setToastMessage(`New case ${created.id} created successfully.`);
      fetchDashboardData(true);
    } catch {
      setToastMessage("Failed to create new case.");
    } finally {
      setIsSubmittingCase(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-[13px] font-medium text-white shadow-xl animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* CREATE CASE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-[550px] rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-slate-800">
                    Create New Assistance Case
                  </h3>
                  <p className="text-[12px] text-slate-400">
                    Log an emergency request into the case management pipeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Assistance Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Emergency shelter">Emergency shelter</option>
                    <option value="Medical supplies">Medical supplies</option>
                    <option value="Food & water">Food & water</option>
                    <option value="Rescue assistance">Rescue assistance</option>
                    <option value="Elderly care">Elderly care</option>
                    <option value="Sanitation kit">Sanitation kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Urgency Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Applicant / Head of Household *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamal Jayawardena"
                    value={formData.applicantName}
                    onChange={(e) =>
                      setFormData({ ...formData, applicantName: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">
                    People Count *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.peopleCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        peopleCount: parseInt(e.target.value) || 1,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Location / Sector *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riverview, North Ward (Sector 3)"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Incident Description & Immediate Needs
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe situational urgency, contact information, or access constraints..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCase}
                  className="flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-sky-800 disabled:opacity-60"
                >
                  {isSubmittingCase ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Save & Log Case
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Review incoming assistance cases, verify evidence, and coordinate
              authorised response decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              title="Refresh dashboard metrics"
              className="flex h-[45px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin text-sky-700" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex h-[45px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Download size={17} />
              {isExporting ? "Exporting..." : "Export summary"}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex h-[45px] items-center gap-2 rounded-lg bg-sky-700 px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              <Plus size={17} />
              Create case
            </button>
          </div>
        </div>

        {/* BACKEND STATUS / DEMONSTRATION ALERT */}
        <div
          className={`mb-5 flex items-center justify-between rounded-xl border px-5 py-4 ${
            isLiveBackend
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-sky-200 bg-sky-50 text-sky-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {isLiveBackend ? (
              <Server size={20} className="text-emerald-600" />
            ) : (
              <CheckCircle2 size={20} className="text-sky-700" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`text-[13px] font-semibold ${
                    isLiveBackend ? "text-emerald-800" : "text-sky-800"
                  }`}
                >
                  {isLiveBackend
                    ? "Connected to Live ASP.NET Core API (Port 5277)"
                    : "Demonstration operations data"}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isLiveBackend
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-sky-200 text-sky-800"
                  }`}
                >
                  {isLiveBackend ? "LIVE" : "DEMO"}
                </span>
              </div>

              <p
                className={`mt-1 text-[11px] ${
                  isLiveBackend ? "text-emerald-700" : "text-sky-700"
                }`}
              >
                {isLiveBackend
                  ? "Real-time synchronization active with CareLink Backend Service."
                  : "Realistic sample records for the Greater Riverton flood response. (Start CareLink.Backend to switch to live server)"}
              </p>
            </div>
          </div>

          <span
            className={`hidden text-[10px] sm:block ${
              isLiveBackend ? "text-emerald-600" : "text-sky-600"
            }`}
          >
            {dashboardData?.lastUpdated
              ? `Updated ${new Date(dashboardData.lastUpdated).toLocaleTimeString()}`
              : "Updated just now"}
          </span>
        </div>

        {/* STATISTICS CARDS */}
        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && !dashboardData
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[88px] animate-pulse rounded-xl border border-slate-200 bg-white/70 p-5 shadow-xs"
                />
              ))
            : dashboardData?.statistics.map((item, index) => (
                <StatCard key={index} {...item} />
              ))}
        </section>

        {/* CHARTS SECTION */}
        <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* CASE STATUS OVERVIEW */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div>
                <h2 className="text-[16px] font-semibold">Case status overview</h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Open cases by workflow stage
                </p>
              </div>

              <span className="rounded-lg bg-sky-50 px-3 py-2 text-[10px] font-semibold text-sky-700">
                {dashboardData?.totalOpenCases.toLocaleString() || "1,284"} open
              </span>
            </div>

            <div className="space-y-5 p-6">
              {dashboardData?.statusOverview.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-[90px] shrink-0 text-[11px] font-medium text-slate-600">
                    {item.name}
                  </span>

                  <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#65b9a1] transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (item.value / 350) * 100)}%`,
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
                <p className="mt-1 text-[11px] text-slate-400">Last seven days</p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700">
                Resolution {dashboardData?.resolutionRate || "+84.7%"}
              </span>
            </div>

            <div className="h-[280px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.chartData || []}
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

              <button
                onClick={() => navigate("/case-manager/priority-queue")}
                className="flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-900"
              >
                View priority queue
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[11px] font-semibold text-slate-500">
                    <th className="px-4 py-4">Case</th>
                    <th className="px-4 py-4">Category & Applicant</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Reported</th>
                    <th className="px-4 py-4">AI Priority</th>
                    <th className="px-4 py-4">Verification</th>
                    <th className="px-4 py-4">Assigned</th>
                    <th className="px-4 py-4">Age</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData?.priorityCases.map((item: CaseItem) => (
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

                      <td className="whitespace-nowrap px-4 py-5 text-[11px]">
                        {item.assigned === "You" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                            <UserCheck size={12} />
                            You
                          </span>
                        ) : (
                          <span className="text-slate-500">{item.assigned}</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {item.age}
                        </span>
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
                        {item.assigned === "Unassigned" ? (
                          <button
                            onClick={() => handleClaimCase(item.id)}
                            className="rounded-md bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700 hover:bg-sky-100"
                          >
                            Claim
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/case-manager/my-cases")}
                            title="View case details"
                            className="text-slate-400 hover:text-sky-700"
                          >
                            <ChevronRight size={17} />
                          </button>
                        )}
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
                <h2 className="text-[16px] font-semibold">Recent case activity</h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Across assigned operations
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700">
                Live
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {dashboardData?.recentActivities.map((activity, index) => {
                const Icon = ICON_MAP[activity.iconKey] || Activity;

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
                path: "/case-manager/my-cases",
              },
              {
                title: "Claim Unassigned",
                icon: ClipboardCheck,
                path: "/case-manager/unassigned-cases",
              },
              {
                title: "Verify Evidence",
                icon: ShieldCheck,
                path: "/case-manager/verification",
              },
              {
                title: "Review Priority",
                icon: AlertTriangle,
                path: "/case-manager/priority-queue",
              },
              {
                title: "Review Duplicates",
                icon: Copy,
                path: "/case-manager/potential-duplicates",
              },
              {
                title: "Case Report",
                icon: BarChart3,
                path: "/case-manager/reports",
              },
            ].map((action, index) => {
              const Icon = action.icon;

              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md cursor-pointer"
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
