import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Brain,
  Truck,
  House,
  Users,
  Heart,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export interface ServiceItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionText: string;
  link: string;
  authLink?: string;
  category: string;
  iconBg: string;
  iconColor: string;
}

const SERVICES: ServiceItem[] = [
  {
    icon: ShieldAlert,
    title: "Emergency Incident Management",
    description:
      "Monitor active crises, verify citizen requests, coordinate triage, and maintain situation awareness across affected districts.",
    actionText: "Access Incident Operations",
    link: "/login",
    authLink: "/emergency-coordinator/crisis-events",
    category: "Operations",
    iconBg: "bg-rose-50 text-rose-600",
    iconColor: "text-rose-600",
  },
  {
    icon: Brain,
    title: "AI-Assisted Decision Support",
    description:
      "Surface structured priority recommendations, duplicate incident flags, and response insights while human officers retain full decision authority.",
    actionText: "Explore Decision Support",
    link: "/login",
    authLink: "/admin/ai-review",
    category: "Intelligence",
    iconBg: "bg-indigo-50 text-indigo-600",
    iconColor: "text-indigo-600",
  },
  {
    icon: Truck,
    title: "Resource & Logistics Coordination",
    description:
      "Track multi-warehouse inventory levels, critical relief supply requests, dispatch manifests, and safe delivery confirmations.",
    actionText: "View Resource Logistics",
    link: "/login",
    authLink: "/resource-manager/inventory",
    category: "Logistics",
    iconBg: "bg-sky-50 text-sky-600",
    iconColor: "text-sky-600",
  },
  {
    icon: House,
    title: "Shelter Management",
    description:
      "Oversee shelter capacity, current occupancy, room allocation, food resources, and special medical accommodation support.",
    actionText: "Review Shelter Operations",
    link: "/login",
    authLink: "/shelter-admin/dashboard",
    category: "Accommodation",
    iconBg: "bg-teal-50 text-teal-600",
    iconColor: "text-teal-600",
  },
  {
    icon: Users,
    title: "Volunteer Coordination",
    description:
      "Organise volunteer skills, verified credentials, shift availability, and task assignments with zero administrative delay.",
    actionText: "Join Volunteer Corps",
    link: "/register?role=volunteer",
    authLink: "/volunteer-coordinator/dashboard",
    category: "Community",
    iconBg: "bg-emerald-50 text-emerald-600",
    iconColor: "text-emerald-600",
  },
  {
    icon: Heart,
    title: "Donations & Aid Tracking",
    description:
      "Support transparent humanitarian campaigns, donor contribution records, aid expenditure audits, and public impact reporting.",
    actionText: "Explore Aid Tracking",
    link: "/login",
    authLink: "/funding-officer/campaigns",
    category: "Transparency",
    iconBg: "bg-amber-50 text-amber-600",
    iconColor: "text-amber-600",
  },
];

export const ServicesSection: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section id="services" className="py-20 lg:py-24 bg-slate-50/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6F7] text-[#1D5F8A] text-xs font-semibold uppercase tracking-wider mb-3">
            <span>MODULAR CRISIS CAPABILITIES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight">
            One Platform. Multiple Ways to Make a Difference.
          </h2>

          <p className="mt-3.5 text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
            CareLink connects essential humanitarian operations through a coordinated digital platform, enabling seamless collaboration between public responders, NGOs, and citizens.
          </p>
        </div>

        {/* 6 Responsive Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const targetLink =
              isAuthenticated && user && service.authLink
                ? service.authLink
                : service.link;

            return (
              <div
                key={service.title}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#42B99A]/60 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${service.iconBg} transition-transform group-hover:scale-105`}
                    >
                      <Icon size={24} className={service.iconColor} />
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#123B5C] group-hover:text-[#1D5F8A] transition-colors leading-snug">
                    {service.title}
                  </h3>

                  <p className="mt-2.5 text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={targetLink}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D5F8A] group-hover:text-[#123B5C] transition-colors"
                  >
                    <span>{service.actionText}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <span className="text-xs text-slate-400 group-hover:text-[#42B99A] transition-colors">
                    <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
