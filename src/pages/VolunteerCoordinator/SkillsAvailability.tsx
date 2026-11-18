import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  X,
  Users,
  Server,
  RefreshCw,
  HelpCircle,
  Download,
} from "lucide-react";

import { skillsAvailabilityService } from "../../services/skillsAvailabilityService";
import type {
  SkillCoverageItem,
  AvailabilityForecast,
  SkillsAvailabilityStats,
  CoverageWarning,
} from "../../types/skillsAvailability";

export default function SkillsAvailability() {
  const [skills, setSkills] = useState<SkillCoverageItem[]>([]);
  const [forecastData, setForecastData] = useState<AvailabilityForecast[]>([]);
  const [stats, setStats] = useState<SkillsAvailabilityStats>({
    availableToday: 642,
    availableTodayPercentage: "26.8% of volunteers",
    availableThisWeek: 1184,
    availableThisWeekSub: "Across all areas",
    criticalSkillGaps: 3,
    criticalSkillGapsSummary: "Rescue, nursing, drivers",
    schedulesUpdatedRate: "89%",
    schedulesUpdatedSub: "Within last 7 days",
  });
  const [warning, setWarning] = useState<CoverageWarning>({
    title: "Thursday coverage gap",
    description: "Additional rescue drivers needed from 18:00–22:00.",
  });

  const [selectedSkill, setSelectedSkill] = useState<SkillCoverageItem | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [newSkill, setNewSkill] = useState("");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState("");

  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestData, setRequestData] = useState({
    skill: "First Aid & Medical",
    date: "",
    startTime: "",
    endTime: "",
    volunteers: "5",
    location: "",
  });

  // NOTIFICATION
  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3200);
  };

  // LOAD DATA FROM BACKEND
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const response = await skillsAvailabilityService.getOverview();
      setIsLiveBackend(response.isLiveBackend);
      setSkills(response.data.skills);
      setForecastData(response.data.forecast);
      setStats(response.data.stats);
      if (response.data.warning) setWarning(response.data.warning);
    } catch {
      notify("Failed to retrieve skills and availability data.");
    } finally {
      if (isRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ADD SKILL
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    const exists = skills.some(
      (skill) => skill.name.toLowerCase() === newSkill.trim().toLowerCase()
    );

    if (exists) {
      notify("This skill group already exists.");
      return;
    }

    try {
      const result = await skillsAvailabilityService.addSkill({ name: newSkill.trim() });
      setSkills((prev) => [...prev, result.data]);
      setIsLiveBackend(result.isLiveBackend);
      setNewSkill("");
      notify("New skill group added successfully.");
    } catch {
      notify("Failed to add skill group.");
    }
  };

  // REMOVE SKILL
  const handleRemoveSkill = async (name: string) => {
    try {
      await skillsAvailabilityService.removeSkill(name);
      setSkills((prev) => prev.filter((skill) => skill.name !== name));

      if (selectedSkill?.name === name) {
        setSelectedSkill(null);
        setShowDetailModal(false);
      }
      notify("Skill group removed.");
    } catch {
      notify("Failed to remove skill group.");
    }
  };

  // REQUEST AVAILABILITY
  const handleRequestAvailability = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !requestData.date ||
      !requestData.startTime ||
      !requestData.endTime ||
      !requestData.location
    ) {
      notify("Please complete all required fields.");
      return;
    }

    if (requestData.startTime >= requestData.endTime) {
      notify("End time must be later than start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await skillsAvailabilityService.submitAvailabilityRequest(requestData);
      setIsLiveBackend(result.isLiveBackend);
      notify("Availability request submitted successfully.");
      setShowRequestModal(false);

      setRequestData({
        skill: skills[0]?.name || "First Aid & Medical",
        date: "",
        startTime: "",
        endTime: "",
        volunteers: "5",
        location: "",
      });
    } catch {
      notify("Failed to submit availability request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // EXPORT CSV
  const handleExportCSV = async () => {
    try {
      notify("Exporting skills availability roster...");
      const blob = await skillsAvailabilityService.exportSkillsCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carelink-skills-availability-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify("Skills availability CSV exported successfully.");
    } catch {
      notify("Failed to export skills CSV.");
    }
  };

  // SEARCH FILTER
  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(search.toLowerCase())
  );

  const maxForecastVolunteers = Math.max(...forecastData.map((f) => f.volunteers), 706);

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 lg:px-7 pt-5 pb-10">
        {/* BREADCRUMB & API STATUS */}
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="font-semibold text-[#123c5b]">Skills & Availability</span>
          </div>

          {/* BACKEND API STATUS BADGE */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wide border shadow-xs ${
                isLiveBackend
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <Server size={11} />
              <span>{isLiveBackend ? "Backend API: Online" : "Local Fallback Mode"}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveBackend ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
            </span>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Refresh from API"
              className="p-1 text-[#8296aa] hover:text-[#123c5b] transition-colors rounded hover:bg-white cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287fa9]" : ""} />
            </button>
          </div>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[25px] md:text-[27px] font-normal tracking-tight">
              Skills & Availability
            </h1>
            <p className="text-[11px] text-[#718ba0] mt-2">
              Understand response capability by skill, schedule, location, and readiness.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-[40px] px-3.5 bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] text-[#17648e] rounded-lg text-[10px] font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download size={13} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] rounded-lg text-[10px] text-[#17648e] font-medium transition cursor-pointer shadow-xs"
            >
              Request availability
            </button>

            <button
              type="button"
              onClick={() => setShowManageModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg text-[10px] font-semibold transition cursor-pointer shadow-xs"
            >
              Manage skills
            </button>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {/* AVAILABLE TODAY */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">
            <div className="w-[41px] h-[41px] bg-[#e5f5ef] rounded-lg flex items-center justify-center shrink-0">
              <Check size={19} className="text-[#36a78b]" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">Available today</p>
              <h2 className="text-[23px] font-bold text-[#123c5b] leading-tight">
                {stats.availableToday.toLocaleString()}
              </h2>
              <p className="text-[8px] text-[#8296aa]">{stats.availableTodayPercentage}</p>
            </div>
          </div>

          {/* AVAILABLE THIS WEEK */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">
            <div className="w-[41px] h-[41px] bg-[#e8f1f7] rounded-lg flex items-center justify-center shrink-0">
              <Clock size={19} className="text-[#287fa9]" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">Available this week</p>
              <h2 className="text-[23px] font-bold leading-tight">
                {stats.availableThisWeek.toLocaleString()}
              </h2>
              <p className="text-[8px] text-[#8296aa]">{stats.availableThisWeekSub}</p>
            </div>
          </div>

          {/* CRITICAL SKILL GAPS */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">
            <div className="w-[41px] h-[41px] bg-[#fdebed] rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={19} className="text-red-600" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">Critical skill gaps</p>
              <h2 className="text-[23px] font-bold leading-tight">
                {stats.criticalSkillGaps}
              </h2>
              <p className="text-[8px] text-[#8296aa]">{stats.criticalSkillGapsSummary}</p>
            </div>
          </div>

          {/* SCHEDULES UPDATED */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">
            <div className="w-[41px] h-[41px] bg-[#e8f1f7] rounded-lg flex items-center justify-center shrink-0">
              <Activity size={19} className="text-[#287fa9]" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">Schedules updated</p>
              <h2 className="text-[23px] font-bold leading-tight">
                {stats.schedulesUpdatedRate}
              </h2>
              <p className="text-[8px] text-[#8296aa]">{stats.schedulesUpdatedSub}</p>
            </div>
          </div>
        </section>

        {/* MAIN DASHBOARD GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4">
          {/* SKILL COVERAGE */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-[0_5px_15px_rgba(30,70,90,0.04)]">
            {/* HEADER */}
            <div className="px-4 py-3.5 border-b border-[#d5e3e9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[12px] font-medium">Skill coverage</h2>
                <p className="text-[8px] text-[#8296aa] mt-0.5">
                  Verified volunteers and current availability
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter skills..."
                  className="h-[28px] w-36 px-2.5 text-[9px] border border-[#d5e3e9] rounded-md outline-none focus:border-[#287fa9] bg-[#fbfdfd]"
                />

                <span className="bg-[#e8f1f7] text-[#287fa9] px-2 py-1 rounded-md text-[8px] font-medium shrink-0">
                  Live roster
                </span>
              </div>
            </div>

            {/* SKILL ROWS */}
            <div className="px-4 divide-y divide-[#edf2f5]">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => {
                    setSelectedSkill(skill);
                    setShowDetailModal(true);
                  }}
                  className="min-h-[60px] py-2.5 flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-[#f8fbfc] transition-colors"
                >
                  {/* SKILL NAME */}
                  <div className="w-[43%] md:w-[42%] min-w-0">
                    <h3 className="text-[9px] font-semibold text-[#123c5b] truncate">
                      {skill.name}
                    </h3>
                    <p className="text-[8px] text-[#8296aa] mt-0.5">
                      {skill.verified} verified volunteers
                    </p>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="flex-1">
                    <div className="h-[7px] bg-[#e7eef1] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#62b9a0] rounded-full transition-all duration-500"
                        style={{
                          width: `${skill.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* AVAILABLE COUNT */}
                  <div className="w-[65px] shrink-0 text-right sm:text-left">
                    <h3 className="text-[12px] font-semibold text-[#123c5b]">
                      {skill.available}
                    </h3>
                    <p className="text-[8px] text-[#8296aa]">available</p>
                  </div>

                  <ChevronRight size={17} className="text-[#123c5b] shrink-0" />
                </div>
              ))}

              {filteredSkills.length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400">
                  No matching skill groups found.
                </div>
              )}
            </div>
          </div>

          {/* AVAILABILITY FORECAST */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-[0_5px_15px_rgba(30,70,90,0.04)] h-fit min-h-[480px]">
            {/* HEADER */}
            <div className="px-4 py-3.5 border-b border-[#d5e3e9] flex items-start justify-between">
              <div>
                <h2 className="text-[12px] font-medium">Availability forecast</h2>
                <p className="text-[8px] text-[#8296aa] mt-1">Next seven days</p>
              </div>

              <span className="text-[8px] text-[#287fa9] font-medium">Greater Riverton</span>
            </div>

            {/* FORECAST BARS */}
            <div className="p-4 space-y-[19px]">
              {forecastData.map((item) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="w-[53px] text-[8px] font-semibold shrink-0 text-[#123c5b]">
                    {item.day}
                  </span>

                  <div className="flex-1 h-[7px] bg-[#e7eef1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#287fa9] rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.volunteers / maxForecastVolunteers) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="w-[28px] text-[8px] font-semibold text-right text-[#123c5b]">
                    {item.volunteers}
                  </span>
                </div>
              ))}
            </div>

            {/* COVERAGE WARNING */}
            <div className="mx-3.5 mt-1 mb-4 bg-[#fff6e5] border border-[#fde8c0] rounded-lg px-3 py-3 flex items-start gap-2.5">
              <AlertTriangle size={17} className="text-[#946000] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[9px] font-semibold text-[#946000]">
                  {warning.title}
                </h3>
                <p className="text-[8px] text-[#946000] mt-0.5 leading-relaxed">
                  {warning.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Check size={15} className="text-[#65bda5]" />
          <span>{notification}</span>
        </div>
      )}

      {/* MANAGE SKILLS MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[470px] rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">Manage skills</h2>
                <p className="text-[10px] text-gray-400 mt-1">
                  Add or remove volunteer skill groups.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <label className="text-[11px] font-semibold text-[#123c5b]">
                Add new skill group
              </label>

              <div className="flex gap-2 mt-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name..."
                  className="flex-1 border border-[#d5e3e9] rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#287fa9] bg-white"
                />

                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-4 flex items-center gap-1 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>

              <h3 className="text-[11px] font-semibold mt-6 mb-3 text-[#123c5b]">
                Existing skill groups
              </h3>

              <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between border border-[#e1eaf0] rounded-lg p-3 hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="text-[10px] font-medium text-[#123c5b]">{skill.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {skill.verified} verified volunteers · {skill.available} available
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                      title="Remove skill"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#d5e3e9] bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-xs font-semibold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST AVAILABILITY MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">Request availability</h2>
                <p className="text-[10px] text-gray-400 mt-1">
                  Request volunteers for a specific response period.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestAvailability} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-[#123c5b]">
                  Required skill
                </label>

                <select
                  value={requestData.skill}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      skill: e.target.value,
                    })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white focus:border-[#287fa9] cursor-pointer"
                >
                  {skills.map((skill) => (
                    <option key={skill.name} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#123c5b]">
                  Required location
                </label>

                <input
                  required
                  value={requestData.location}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. Riverton High School Shelter"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#123c5b]">
                  Required date
                </label>

                <input
                  required
                  type="date"
                  value={requestData.date}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      date: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white focus:border-[#287fa9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#123c5b]">
                    Start time
                  </label>

                  <input
                    required
                    type="time"
                    value={requestData.startTime}
                    onChange={(e) =>
                      setRequestData({
                        ...requestData,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white focus:border-[#287fa9]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#123c5b]">
                    End time
                  </label>

                  <input
                    required
                    type="time"
                    value={requestData.endTime}
                    onChange={(e) =>
                      setRequestData({
                        ...requestData,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white focus:border-[#287fa9]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#123c5b]">
                  Number of volunteers
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  value={requestData.volunteers}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      volunteers: e.target.value,
                    })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white focus:border-[#287fa9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKILL DETAILS MODAL */}
      {showDetailModal && selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[400px] rounded-xl shadow-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Skill details</h2>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <div className="w-12 h-12 bg-[#e5f5ef] rounded-xl flex items-center justify-center">
                <Users size={23} className="text-[#36a78b]" />
              </div>

              <h3 className="text-sm font-semibold mt-4 text-[#123c5b]">
                {selectedSkill.name}
              </h3>

              <p className="text-[10px] text-gray-400 mt-1">
                Volunteer skill coverage overview
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-[#f3f7f9] rounded-lg p-3">
                  <p className="text-[9px] text-gray-400">Verified volunteers</p>
                  <h3 className="text-xl font-bold mt-1 text-[#123c5b]">
                    {selectedSkill.verified}
                  </h3>
                </div>

                <div className="bg-[#f3f7f9] rounded-lg p-3">
                  <p className="text-[9px] text-gray-400">Available now</p>
                  <h3 className="text-xl font-bold mt-1 text-[#287fa9]">
                    {selectedSkill.available}
                  </h3>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-[#8296aa]">Coverage level</span>
                  <span className="font-semibold text-[#123c5b]">
                    {selectedSkill.percentage}%
                  </span>
                </div>

                <div className="h-2 bg-[#e7eef1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#62b9a0] rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedSkill.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg py-2.5 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        type="button"
        onClick={() =>
          notify("Skills Help: Verified skill numbers update automatically upon coordinator document approval.")
        }
        aria-label="Help"
        className="fixed bottom-5 right-4 w-10 h-10 rounded-full bg-[#153f60] hover:bg-[#123c5b] text-white flex items-center justify-center shadow-lg transition cursor-pointer"
      >
        <HelpCircle size={21} />
      </button>
    </div>
  );
}
