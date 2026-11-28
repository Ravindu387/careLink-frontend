import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardList,
  Handshake,
  MapPin,
  Package,
  Users,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  partnerDashboardService,
  type PartnerDashboardData,
  type CreatePartnerActivityPayload,
} from "../../services/partnerDashboardService";

const initialFallbackData: PartnerDashboardData = {
  activeCrisisName: "Monsoon Floods 2025",
  summaryCards: [
    {
      label: "Active Crisis Events",
      value: "08",
      detail: "3 require attention",
      icon: "AlertTriangle",
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "Assistance Referrals",
      value: "24",
      detail: "12 awaiting response",
      icon: "ClipboardList",
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Shared Resources",
      value: "16",
      detail: "Across 5 locations",
      icon: "Package",
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Team Members",
      value: "32",
      detail: "4 field teams deployed",
      icon: "Users",
      iconClass: "bg-violet-50 text-violet-600",
    },
  ],
  activities: [],
  organisation: {
    name: "Verified Partner",
    type: "Humanitarian Partner",
    code: "PARTNER-ORG",
    verificationStatus: "Verified",
    assignedRegion: "Western",
    fieldLocationsCount: 3,
    contactEmail: "",
    contactPhone: "",
  },
  lastUpdated: new Date().toISOString(),
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "AlertTriangle":
      return AlertTriangle;
    case "ClipboardList":
      return ClipboardList;
    case "Package":
      return Package;
    case "Users":
      return Users;
    case "Handshake":
      return Handshake;
    case "Activity":
      return Activity;
    default:
      return Activity;
  }
};

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<PartnerDashboardData>(() => ({
    ...initialFallbackData,
    organisation: {
      ...initialFallbackData.organisation,
      name: user?.organizationName || "Verified Partner",
      type: (user as any)?.organizationType || "Humanitarian Partner",
    },
  }));
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeOrgName =
    user?.organizationName ||
    (data.organisation.name !== "Global Relief Network"
      ? data.organisation.name
      : "Verified Partner");

  const activeOrgType =
    (user as any)?.organizationType ||
    (data.organisation.type !== "International NGO"
      ? data.organisation.type
      : "Humanitarian Partner");

  const activeOrgStatus =
    user?.organizationApprovalStatus ||
    data.organisation.verificationStatus ||
    "Verified";

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const partnerKey = user?.organizationName || user?.organizationId || undefined;
      const res = await partnerDashboardService.getDashboard(partnerKey);
      if (user?.organizationName && res.organisation) {
        res.organisation.name = user.organizationName;
      }
      setData(res);
      setIsLiveConnected(true);
    } catch (err) {
      console.warn("Using offline fallback dashboard data:", err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const partnerKey = user?.organizationName || user?.organizationId || undefined;
        const res = await partnerDashboardService.getDashboard(partnerKey);
        if (!active) return;
        if (user?.organizationName && res.organisation) {
          res.organisation.name = user.organizationName;
        }
        setData(res);
        setIsLiveConnected(true);
      } catch (err) {
        if (!active) return;
        console.warn("Using offline fallback dashboard data:", err);
        setIsLiveConnected(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [user]);

  const handleCardClick = (label: string) => {
    switch (label) {
      case "Active Crisis Events":
        navigate("/partner/shared-crisis-events");
        break;
      case "Assistance Referrals":
        navigate("/partner/assistance-referrals");
        break;
      case "Shared Resources":
        navigate("/partner/resource-sharing");
        break;
      case "Active Team Members":
        navigate("/partner/team-contacts");
        break;
      default:
        break;
    }
  };

  const handleLogActivity = async (payload: CreatePartnerActivityPayload) => {
    try {
      const created = await partnerDashboardService.logActivity(payload);
      setData((prev) => ({
        ...prev,
        activities: [created, ...prev.activities],
      }));
      setShowLogModal(false);
      setFeedback("Activity logged successfully to dashboard feed.");
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      const fallbackItem = {
        id: `ACT-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        time: "Just now",
        icon: payload.icon || "ClipboardList",
        color: payload.color || "text-blue-600 bg-blue-50",
        timestamp: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        activities: [fallbackItem, ...prev.activities],
      }));
      setShowLogModal(false);
      setFeedback("Activity logged to dashboard feed.");
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2785B2]">
            PARTNER WORKSPACE
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153e5b] tracking-tight">
              Partner Dashboard
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isLiveConnected
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveConnected
                    ? "animate-pulse bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />
              {isLiveConnected ? "Live Connected" : "Local Store"}
            </span>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Overview of your organisation&apos;s humanitarian response activities
            and coordination state.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={loadDashboard}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-[#2785B2]" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2785B2] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#1f6b8f] transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Log Activity</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 font-medium shadow-2xs">
            <CalendarDays size={15} className="text-[#2785B2] shrink-0" />
            <span className="truncate max-w-[180px]">{data.activeCrisisName}</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.summaryCards.map((card) => {
          const Icon = getIconComponent(card.icon);

          return (
            <article
              key={card.label}
              onClick={() => handleCardClick(card.label)}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2785B2] hover:shadow-md flex flex-col justify-between min-h-[135px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500 truncate" title={card.label}>
                    {card.label}
                  </p>
                  <p className="mt-2.5 text-3xl font-extrabold text-[#153e5b] group-hover:text-[#2785B2] transition">
                    {card.value}
                  </p>
                  <p className="mt-2 text-[13px] text-slate-500 truncate" title={card.detail}>
                    {card.detail}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 shrink-0 transition group-hover:scale-105 ${card.iconClass}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Main Grid: Recent Activity & Organisation Overview */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent Activity */}
        <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#153e5b]">
                Recent Activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest updates from your partner workspace
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate("/partner/field-activities")
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#2785B2] hover:text-[#153e5b] cursor-pointer"
            >
              <span>View all activities</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {data.activities.map((activity) => {
              const Icon = getIconComponent(activity.icon);

              return (
                <div
                  key={activity.id || activity.title}
                  className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className={`rounded-lg p-2.5 shrink-0 ${activity.color}`}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#153e5b] break-words">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 break-words">
                      {activity.description}
                    </p>
                    <p className="mt-2 text-[13px] text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="shrink-0 text-slate-400"
                  />
                </div>
              );
            })}

            {data.activities.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xs font-medium text-slate-500">
                  No recent activities recorded yet for this organization.
                </p>
                <p className="mt-1 text-[13px] text-slate-400">
                  Click &apos;+ Log Activity&apos; to record your team&apos;s first field action.
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Organisation Overview */}
        <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#153e5b]">
                Organisation Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your registered partner organisation profile
              </p>
            </div>

            <div className="mt-5 flex items-start gap-3">
              <div className="rounded-xl bg-[#eaf4f8] p-3 text-[#2785B2] shrink-0">
                <Building2 size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#153e5b] break-words">
                  {activeOrgName}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500 break-words">
                  {activeOrgType}
                  {data.organisation.code && data.organisation.code !== "ORG-027"
                    ? ` · ${data.organisation.code}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-500 shrink-0">Verification status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shrink-0">
                  <ShieldCheck size={12} />
                  {activeOrgStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-500 shrink-0">Assigned region</span>
                <span className="font-semibold text-[#153e5b] truncate">
                  {data.organisation.assignedRegion || "Western Province"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-500 shrink-0">Field locations</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#153e5b] shrink-0">
                  <MapPin size={12} /> {data.organisation.fieldLocationsCount || 1}{" "}
                  locations
                </span>
              </div>
              {(user?.phoneNumber || data.organisation.contactPhone) && (
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-500 shrink-0">Direct phone</span>
                  <span className="text-slate-700 font-mono text-sm truncate">
                    {user?.phoneNumber || data.organisation.contactPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/partner/organisation-profile")
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2785B2] px-3 py-2.5 text-sm font-semibold text-[#2785B2] transition hover:bg-[#f0f8fb] cursor-pointer"
          >
            <span>View organisation profile</span>
            <ArrowRight size={14} />
          </button>
        </article>
      </section>

      {/* Response Coordination Quick Navigation Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity size={17} className="text-[#2785B2]" />
          <h2 className="text-base sm:text-lg font-bold text-[#153e5b]">
            Response coordination workspace
          </h2>
        </div>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          Use the Partner Workspace shortcuts below to manage active crisis
          events, assistance referrals, shared resources, collaboration
          requests, and accountability audit logs.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <QuickLink
            title="Crisis Events"
            subtitle="Incident tracking"
            icon={<AlertTriangle size={15} />}
            onClick={() =>
              navigate("/partner/shared-crisis-events")
            }
          />
          <QuickLink
            title="Referrals"
            subtitle="Needs assessment"
            icon={<ClipboardList size={15} />}
            onClick={() =>
              navigate("/partner/assistance-referrals")
            }
          />
          <QuickLink
            title="Resources"
            subtitle="Shared inventory"
            icon={<Package size={15} />}
            onClick={() =>
              navigate("/partner/resource-sharing")
            }
          />
          <QuickLink
            title="Collaborations"
            subtitle="Joint response"
            icon={<Handshake size={15} />}
            onClick={() =>
              navigate("/partner/collaboration-requests")
            }
          />
          <QuickLink
            title="Field Teams"
            subtitle="Personnel rosters"
            icon={<Users size={15} />}
            onClick={() => navigate("/partner/team-contacts")}
          />
          <QuickLink
            title="Audit Ledger"
            subtitle="Verified actions"
            icon={<Share2 size={15} />}
            onClick={() => navigate("/partner/audit-log")}
          />
        </div>
      </section>

      {/* Quick Activity Logging Modal */}
      {showLogModal && (
        <LogActivityModal
          onClose={() => setShowLogModal(false)}
          onSubmit={handleLogActivity}
        />
      )}
    </div>
  );
}

function QuickLink({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-left transition hover:border-[#2785B2] hover:bg-white"
    >
      <div className="text-[#2785B2] mb-1.5">{icon}</div>
      <span className="text-xs font-semibold text-[#153e5b]">{title}</span>
      <span className="text-[13px] text-slate-400">{subtitle}</span>
    </button>
  );
}

function LogActivityModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: CreatePartnerActivityPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Referral");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let icon = "ClipboardList";
    let color = "text-blue-600 bg-blue-50";

    if (category === "Resource") {
      icon = "Package";
      color = "text-emerald-600 bg-emerald-50";
    } else if (category === "Collaboration") {
      icon = "Handshake";
      color = "text-violet-600 bg-violet-50";
    } else if (category === "Team") {
      icon = "Users";
      color = "text-amber-600 bg-amber-50";
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      icon,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#153e5b]">
            Log Partner Activity
          </h3>
          <button onClick={onClose}>
            <X size={18} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Activity Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
            >
              <option value="Referral">Assistance Referral</option>
              <option value="Resource">Resource Sharing</option>
              <option value="Collaboration">Collaboration Coordination</option>
              <option value="Team">Field Team Deployment</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Relief supplies dispatch initiated"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details regarding the progress or action taken..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#2785B2] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f6b8f]"
            >
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
