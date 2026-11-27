import React from "react";
import { ShieldAlert, Heart, Package, Users, Info } from "lucide-react";

export interface MetricItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  label: string;
  sublabel: string;
}

const METRICS: MetricItem[] = [
  {
    icon: ShieldAlert,
    value: "3 Active Responses",
    label: "Active Emergencies",
    sublabel: "District-level flood & landslide zones",
  },
  {
    icon: Heart,
    value: "5,979+ Citizens",
    label: "People Assisted",
    sublabel: "Emergency food, clean water & rescue",
  },
  {
    icon: Package,
    value: "40% Stockpiles",
    label: "Available Relief Resources",
    sublabel: "Medical kits, rations & blankets",
  },
  {
    icon: Users,
    value: "1,126 Volunteers",
    label: "Active Volunteers",
    sublabel: "Specialized logistics & field responders",
  },
];

export const ImpactStatistics: React.FC = () => {
  return (
    <section className="bg-[#EFF6F7] pt-20 pb-16 px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#42B99A]/40 text-[#123B5C] text-xs font-semibold tracking-wide uppercase shadow-2xs mb-3">
            <Info size={13} className="text-[#42B99A]" />
            <span>Demonstration Benchmark Overview · Sri Lanka Crisis Response</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight">
            Coordinating Help Where It Matters Most
          </h2>

          <p className="mt-2.5 text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
            Operational metrics shown below reflect simulated coursework benchmark data to protect private citizen records while demonstrating platform capabilities.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="h-10 w-10 rounded-xl bg-[#EFF6F7] text-[#1D5F8A] flex items-center justify-center">
                    <Icon size={20} />
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#42B99A]" />
                </div>

                <div className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight">
                  {metric.value}
                </div>

                <div className="mt-1.5 text-base font-semibold text-slate-800">
                  {metric.label}
                </div>

                <p className="mt-1 text-[13px] text-slate-500 font-normal">
                  {metric.sublabel}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#123B5C] to-[#42B99A]" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
