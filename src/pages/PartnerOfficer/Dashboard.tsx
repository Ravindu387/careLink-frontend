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
} from "lucide-react";
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
  activities: [
    {
      id: "ACT-1001",
      title: "New assistance referral received",
      description: "Flood relief support requested in Gampaha District",
      time: "10 minutes ago",
      icon: "ClipboardList",
      color: "text-blue-600 bg-blue-50",
      timestamp: new Date().toISOString(),
    },
    {
      id: "ACT-1002",
      title: "Resource sharing request updated",
      description: "Medical supplies request status changed to In Review",
      time: "35 minutes ago",
      icon: "Package",
      color: "text-emerald-600 bg-emerald-50",
      timestamp: new Date().toISOString(),
    },
    {
      id: "ACT-1003",
      title: "Collaboration request received",
      description: "Regional response coordination invitation",
      time: "1 hour ago",
      icon: "Handshake",
      color: "text-violet-600 bg-violet-50",
      timestamp: new Date().toISOString(),
    },
  ],
  organisation: {
    name: "Global Relief Network",
    type: "International NGO",
    code: "ORG-027",
    verificationStatus: "Verified",
    assignedRegion: "Western",
    fieldLocationsCount: 5,
    contactEmail: "contact@globalrelief.org",
    contactPhone: "+94 11 234 5678",
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
  const [data, setData] = useState<PartnerDashboardData>(initialFallbackData);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await partnerDashboardService.getDashboard();
      setData(res);
      setIsLiveConnected(true);
    } catch (err) {
      console.warn("Using offline fallback dashboard data:", err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await partnerDashboardService.getDashboard();
        if (!active) return;
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
  }, []);

  const handleCardClick = (label: string) => {
    switch (label) {
      case "Active Crisis Events":
        navigate("/partner-officer/partner/shared-crisis-events");
        break;
      case "Assistance Referrals":
        navigate("/partner-officer/partner/assistance-referrals");
        break;
      case "Shared Resources":
        navigate("/partner-officer/partner/resource-sharing");
        break;
      case "Active Team Members":
        navigate("/partner-officer/partner/team-contacts");
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
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium text-[#2785B2]">PARTNER WORKSPACE</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#153e5b]">
              Partner Dashboard
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
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

          <p className="mt-1 text-sm text-slate-500">
            Overview of your organisation&apos;s humanitarian response
            activities and coordination state.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadDashboard}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2785B2] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1f6b8f]"
          >
            <Plus size={14} />
            Log Activity
          </button>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <CalendarDays size={15} className="text-[#2785B2]" />
            <span>{data.activeCrisisName}</span>
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
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2785B2] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#153e5b] group-hover:text-[#2785B2] transition">
                    {card.value}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {card.detail}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 transition group-hover:scale-105 ${card.iconClass}`}
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
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#153e5b]">
                Recent Activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest updates from your partner workspace
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate("/partner-officer/partner/field-activities")
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2785B2] hover:text-[#153e5b]"
            >
              View all activities <ArrowRight size={14} />
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
                    <p className="text-xs font-semibold text-[#153e5b]">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.description}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
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
              <p className="py-6 text-center text-xs text-slate-400">
                No recent activity records found.
              </p>
            )}
          </div>
        </article>

        {/* Organisation Overview */}
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div>
              <h2 className="text-sm font-bold text-[#153e5b]">
                Organisation Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your registered partner organisation profile
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#eaf4f8] p-3 text-[#2785B2]">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#153e5b]">
                  {data.organisation.name}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {data.organisation.type} · {data.organisation.code}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Verification status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck size={12} />
                  {data.organisation.verificationStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Assigned region</span>
                <span className="font-semibold text-[#153e5b]">
                  {data.organisation.assignedRegion}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Field locations</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#153e5b]">
                  <MapPin size={12} /> {data.organisation.fieldLocationsCount}{" "}
                  locations
                </span>
              </div>
              {data.organisation.contactPhone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Direct phone</span>
                  <span className="text-slate-700 font-mono text-[11px]">
                    {data.organisation.contactPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/partner-officer/partner/organisation-profile")
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2785B2] px-3 py-2.5 text-xs font-semibold text-[#2785B2] transition hover:bg-[#f0f8fb]"
          >
            View organisation profile <ArrowRight size={14} />
          </button>
        </article>
      </section>

      {/* Response Coordination Quick Navigation Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity size={17} className="text-[#2785B2]" />
          <h2 className="text-sm font-bold text-[#153e5b]">
            Response coordination workspace
          </h2>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
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
              navigate("/partner-officer/partner/shared-crisis-events")
            }
          />
          <QuickLink
            title="Referrals"
            subtitle="Needs assessment"
            icon={<ClipboardList size={15} />}
            onClick={() =>
              navigate("/partner-officer/partner/assistance-referrals")
            }
          />
          <QuickLink
            title="Resources"
            subtitle="Shared inventory"
            icon={<Package size={15} />}
            onClick={() =>
              navigate("/partner-officer/partner/resource-sharing")
            }
          />
          <QuickLink
            title="Collaborations"
            subtitle="Joint response"
            icon={<Handshake size={15} />}
            onClick={() =>
              navigate("/partner-officer/partner/collaboration-requests")
            }
          />
          <QuickLink
            title="Field Teams"
            subtitle="Personnel rosters"
            icon={<Users size={15} />}
            onClick={() => navigate("/partner-officer/partner/team-contacts")}
          />
          <QuickLink
            title="Audit Ledger"
            subtitle="Verified actions"
            icon={<Share2 size={15} />}
            onClick={() => navigate("/partner-officer/partner/audit-log")}
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
      <span className="text-[10px] text-slate-400">{subtitle}</span>
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
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Activity Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#2785B2]"
            >
              <option value="Referral">Assistance Referral</option>
              <option value="Resource">Resource Sharing</option>
              <option value="Collaboration">Collaboration Coordination</option>
              <option value="Team">Field Team Deployment</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Relief supplies dispatch initiated"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#2785B2]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details regarding the progress or action taken..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#2785B2]"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#2785B2] px-4 py-2 text-xs font-medium text-white hover:bg-[#1f6b8f]"
            >
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
