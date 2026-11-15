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
} from "lucide-react";

const summaryCards = [
  {
    label: "Active Crisis Events",
    value: "08",
    detail: "3 require attention",
    icon: AlertTriangle,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    label: "Assistance Referrals",
    value: "24",
    detail: "12 awaiting response",
    icon: ClipboardList,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    label: "Shared Resources",
    value: "16",
    detail: "Across 5 locations",
    icon: Package,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Active Team Members",
    value: "32",
    detail: "4 field teams deployed",
    icon: Users,
    iconClass: "bg-violet-50 text-violet-600",
  },
];

const activities = [
  {
    title: "New assistance referral received",
    description: "Flood relief support requested in Gampaha District",
    time: "10 minutes ago",
    icon: ClipboardList,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Resource sharing request updated",
    description: "Medical supplies request status changed to In Review",
    time: "35 minutes ago",
    icon: Package,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Collaboration request received",
    description: "Regional response coordination invitation",
    time: "1 hour ago",
    icon: Handshake,
    color: "text-violet-600 bg-violet-50",
  },
];

export default function PartnerDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium text-[#2785B2]">
            PARTNER WORKSPACE
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#153e5b]">
            Partner Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your organisation&apos;s humanitarian response activities.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <CalendarDays size={15} className="text-[#2785B2]" />
          <span>Monsoon Floods 2025</span>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#153e5b]">
                    {card.value}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {card.detail}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${card.iconClass}`}>
                  <Icon size={20} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2785B2] hover:text-[#153e5b]"
            >
              View activity <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.title}
                  className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className={`rounded-lg p-2.5 ${activity.color}`}>
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
                  <ArrowUpRight size={15} className="shrink-0 text-slate-400" />
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-[#153e5b]">
              Organisation Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your partner organisation
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="rounded-xl bg-[#eaf4f8] p-3 text-[#2785B2]">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#153e5b]">
                Global Relief Network
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                International NGO · ORG-027
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Verification status</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Assigned region</span>
              <span className="font-semibold text-[#153e5b]">Western</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Field locations</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#153e5b]">
                <MapPin size={12} /> 5 locations
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2785B2] px-3 py-2.5 text-xs font-semibold text-[#2785B2] transition hover:bg-[#f0f8fb]"
          >
            View organisation profile <ArrowRight size={14} />
          </button>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity size={17} className="text-[#2785B2]" />
          <h2 className="text-sm font-bold text-[#153e5b]">
            Response coordination
          </h2>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Use the Partner Workspace navigation to manage crisis events,
          assistance referrals, shared resources, collaboration requests,
          field activities, team contacts and operational documents.
        </p>
      </section>
    </div>
  );
}
