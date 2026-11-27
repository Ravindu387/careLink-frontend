import React from "react";
import {
  FileEdit,
  ShieldCheck,
  Truck,
  LineChart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  detail: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Identify the Need",
    description:
      "Citizens, community leaders, or field officers submit urgent emergency requests, rescue needs, and incident details.",
    icon: FileEdit,
    detail: "Mobile-friendly forms, geo-tagging, and priority classification",
  },
  {
    number: "02",
    title: "Verify & Assess",
    description:
      "Designated Case Managers review information, eliminate duplicate entries, and assess urgency with AI-assisted insights.",
    icon: ShieldCheck,
    detail: "Human-in-the-loop validation with zero automatic denials",
  },
  {
    number: "03",
    title: "Coordinate Support",
    description:
      "Emergency teams match verified requests to available relief stockpiles, registered volunteers, and nearby shelters.",
    icon: Truck,
    detail: "Multi-agency collaboration across provincial boundaries",
  },
  {
    number: "04",
    title: "Monitor the Response",
    description:
      "Every allocation, dispatch manifest, and delivery confirmation is logged into immutable audit timelines.",
    icon: LineChart,
    detail: "Complete transparency, feedback collection, and case closure",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#1D5F8A] bg-[#EFF6F7] px-3 py-1 rounded-full mb-3">
            ACCOUNTABLE WORKFLOW
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight">
            How CareLink Coordinates a Response
          </h2>

          <p className="mt-3.5 text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
            A structured, 4-step humanitarian process ensuring rapid aid delivery while preserving human oversight, data privacy, and end-to-end accountability.
          </p>
        </div>

        {/* Process Steps: Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-[#42B99A] hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Step Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-[#1D5F8A]/30">
                      {step.number}
                    </span>
                    <span className="h-11 w-11 rounded-xl bg-[#EFF6F7] text-[#123B5C] flex items-center justify-center font-bold">
                      <Icon size={20} className="text-[#1D5F8A]" />
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-[#123B5C] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[13px] font-medium text-slate-500">
                  <CheckCircle2 size={14} className="text-[#42B99A] shrink-0" />
                  <span>{step.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accountability & AI Ethics Note */}
        <div className="mt-12 p-4 sm:p-5 rounded-xl bg-[#EFF6F7] border border-slate-200 text-center max-w-3xl mx-auto">
          <p className="text-sm sm:text-[15px] text-[#173B56] font-medium leading-relaxed">
            <strong className="text-[#123B5C]">Responsible AI Principle:</strong> In CareLink, AI algorithms only assist with duplicate detection, triage suggestion, and resource estimation. Certified human officers retain 100% final operational and allocation authority.
          </p>
        </div>
      </div>
    </section>
  );
};
