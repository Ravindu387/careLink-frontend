import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, House, Users, Building2, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export interface EmergencyActionItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionText: string;
  link: string;
  authLink?: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
}

const HIGHLIGHT_ITEMS: EmergencyActionItem[] = [
  {
    icon: AlertCircle,
    title: "Request Assistance",
    description:
      "Submit verified emergency requests for immediate rescue, emergency food packs, clean drinking water, or medical support.",
    actionText: "Request Emergency Aid",
    link: "/register?role=citizen",
    authLink: "/citizen/request-help",
    badge: "Priority Action",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-500/10 text-rose-600",
    iconColor: "text-rose-600",
  },
  {
    icon: House,
    title: "Find Shelter Support",
    description:
      "Locate open, verified evacuation centers, temporary camps, live bed availability, and special accessibility facilities.",
    actionText: "Browse Open Shelters",
    link: "/login",
    authLink: "/citizen/shelters",
    badge: "Safe Locations",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    iconBg: "bg-sky-500/10 text-sky-600",
    iconColor: "text-sky-600",
  },
  {
    icon: Users,
    title: "Join as a Volunteer",
    description:
      "Register specialized medical, driving, translation, or relief distribution skills to support on-the-ground emergency teams.",
    actionText: "Register as Volunteer",
    link: "/register?role=volunteer",
    authLink: "/volunteer-coordinator/dashboard",
    badge: "Active Corps",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    iconColor: "text-emerald-600",
  },
  {
    icon: Building2,
    title: "Partner Organisation",
    description:
      "Coordinate as a registered NGO, UN agency, or disaster agency with administrative review and verified operational clearance.",
    actionText: "Apply as Partner NGO",
    link: "/register?role=organisation",
    authLink: "/partner/dashboard",
    badge: "Verified Access",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-500/10 text-amber-600",
    iconColor: "text-amber-600",
  },
];

export const EmergencyHighlights: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 md:-mt-14 lg:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Container Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8 lg:p-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#1D5F8A] bg-[#EFF6F7] px-3 py-1 rounded-full mb-2">
            RAPID RESPONSE ACTIONS
          </span>
          <h2 className="text-2xl sm:text-[26px] font-semibold text-[#123B5C] tracking-tight">
            Help Starts With a Connected Response
          </h2>
          <p className="mt-2.5 text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
            From identifying urgent needs to coordinating relief, CareLink helps bring the right people, resources, and shelters together.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HIGHLIGHT_ITEMS.map((item) => {
            const Icon = item.icon;
            const targetLink =
              isAuthenticated && user && item.authLink ? item.authLink : item.link;

            return (
              <div
                key={item.title}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#42B99A]/60 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`h-11 w-11 rounded-xl flex items-center justify-center ${item.iconBg} transition-transform group-hover:scale-105`}
                    >
                      <Icon size={22} className={item.iconColor} />
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-[17px] font-semibold text-[#123B5C] group-hover:text-[#1D5F8A] transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={targetLink}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D5F8A] group-hover:text-[#123B5C] transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
