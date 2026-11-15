import { useState } from "react";
import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  X,
  Users,
  MapPin,
  CalendarDays,
  Settings2,
} from "lucide-react";

interface Skill {
  name: string;
  verified: number;
  available: number;
  percentage: number;
}

interface Forecast {
  day: string;
  volunteers: number;
}

const initialSkills: Skill[] = [
  {
    name: "Logistics & Distribution",
    verified: 486,
    available: 184,
    percentage: 74,
  },
  {
    name: "First Aid & Medical",
    verified: 294,
    available: 96,
    percentage: 68,
  },
  {
    name: "Driving & Transport",
    verified: 318,
    available: 128,
    percentage: 82,
  },
  {
    name: "Shelter Support",
    verified: 402,
    available: 142,
    percentage: 77,
  },
  {
    name: "Translation",
    verified: 128,
    available: 52,
    percentage: 63,
  },
  {
    name: "Search & Rescue",
    verified: 94,
    available: 40,
    percentage: 91,
  },
  {
    name: "Childcare",
    verified: 176,
    available: 64,
    percentage: 58,
  },
  {
    name: "Administration",
    verified: 332,
    available: 116,
    percentage: 70,
  },
];

const forecastData: Forecast[] = [
  { day: "Mon 23", volunteers: 520 },
  { day: "Tue 24", volunteers: 551 },
  { day: "Wed 25", volunteers: 582 },
  { day: "Thu 26", volunteers: 613 },
  { day: "Fri 27", volunteers: 644 },
  { day: "Sat 28", volunteers: 675 },
  { day: "Sun 29", volunteers: 706 },
];

export default function SkillsAvailability() {
  const [skills, setSkills] = useState(initialSkills);

  const [selectedSkill, setSelectedSkill] =
    useState<Skill | null>(null);

  const [showManageModal, setShowManageModal] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);

  const [newSkill, setNewSkill] = useState("");

  const [requestData, setRequestData] = useState({
    skill: "First Aid & Medical",
    date: "",
    startTime: "",
    endTime: "",
    volunteers: "5",
    location: "",
  });

  const [notification, setNotification] = useState("");

  const [search, setSearch] = useState("");

  // NOTIFICATION

  const notify = (message: string) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // ADD SKILL

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    const exists = skills.some(
      (skill) =>
        skill.name.toLowerCase() === newSkill.trim().toLowerCase()
    );

    if (exists) {
      notify("This skill already exists.");
      return;
    }

    setSkills((prev) => [
      ...prev,
      {
        name: newSkill.trim(),
        verified: 0,
        available: 0,
        percentage: 0,
      },
    ]);

    setNewSkill("");

    notify("New skill group added successfully.");
  };

  // REMOVE SKILL

  const handleRemoveSkill = (name: string) => {
    setSkills((prev) =>
      prev.filter((skill) => skill.name !== name)
    );

    if (selectedSkill?.name === name) {
      setSelectedSkill(null);
      setShowDetailModal(false);
    }

    notify("Skill group removed.");
  };

  // REQUEST AVAILABILITY

  const handleRequestAvailability = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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

    notify("Availability request submitted successfully.");

    setShowRequestModal(false);

    setRequestData({
      skill: "First Aid & Medical",
      date: "",
      startTime: "",
      endTime: "",
      volunteers: "5",
      location: "",
    });
  };

  // SEARCH

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAvailable = skills.reduce(
    (total, skill) => total + skill.available,
    0
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}

      

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 lg:px-7 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">

          <span className="text-[#8296aa]">Operations</span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold text-[#123c5b]">
            Skills & Availability
          </span>

        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-[25px] md:text-[27px] font-normal tracking-tight">
              Skills & Availability
            </h1>

            <p className="text-[11px] text-[#718ba0] mt-2">
              Understand response capability by skill, schedule,
              location, and readiness.
            </p>

          </div>

          {/* ACTION BUTTONS */}

          <div className="flex gap-2">

            <button
              onClick={() => setShowRequestModal(true)}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] rounded-lg text-[10px] text-[#17648e] font-medium"
            >
              Request availability
            </button>

            <button
              onClick={() => setShowManageModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg text-[10px] font-semibold"
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
              <p className="text-[8px] text-[#8296aa]">
                Available today
              </p>

              <h2 className="text-[23px] font-bold text-[#123c5b] leading-tight">
                642
              </h2>

              <p className="text-[8px] text-[#8296aa]">
                26.8% of volunteers
              </p>
            </div>

          </div>

          {/* AVAILABLE THIS WEEK */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">

            <div className="w-[41px] h-[41px] bg-[#e8f1f7] rounded-lg flex items-center justify-center shrink-0">
              <Clock size={19} className="text-[#287fa9]" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">
                Available this week
              </p>

              <h2 className="text-[23px] font-bold leading-tight">
                1,184
              </h2>

              <p className="text-[8px] text-[#8296aa]">
                Across all areas
              </p>
            </div>

          </div>

          {/* CRITICAL SKILL GAPS */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">

            <div className="w-[41px] h-[41px] bg-[#fdebed] rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={19} className="text-red-600" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">
                Critical skill gaps
              </p>

              <h2 className="text-[23px] font-bold leading-tight">
                3
              </h2>

              <p className="text-[8px] text-[#8296aa]">
                Rescue, nursing, drivers
              </p>
            </div>

          </div>

          {/* SCHEDULES UPDATED */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(30,70,90,0.04)]">

            <div className="w-[41px] h-[41px] bg-[#e8f1f7] rounded-lg flex items-center justify-center shrink-0">
              <Activity size={19} className="text-[#287fa9]" />
            </div>

            <div>
              <p className="text-[8px] text-[#8296aa]">
                Schedules updated
              </p>

              <h2 className="text-[23px] font-bold leading-tight">
                89%
              </h2>

              <p className="text-[8px] text-[#8296aa]">
                Within last 7 days
              </p>
            </div>

          </div>

        </section>

        {/* MAIN DASHBOARD GRID */}

        <section className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4">

          {/* SKILL COVERAGE */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-[0_5px_15px_rgba(30,70,90,0.04)]">

            {/* HEADER */}

            <div className="px-4 py-3.5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>
                <h2 className="text-[12px] font-medium">
                  Skill coverage
                </h2>

                <p className="text-[8px] text-[#8296aa] mt-1">
                  Verified volunteers and current availability
                </p>
              </div>

              <span className="bg-[#e8f1f7] text-[#287fa9] px-2 py-1.5 rounded-md text-[8px] font-medium">
                Live roster
              </span>

            </div>

            {/* SKILL ROWS */}

            <div className="px-4">

              {filteredSkills.map((skill) => (

                <div
                  key={skill.name}
                  onClick={() => {
                    setSelectedSkill(skill);
                    setShowDetailModal(true);
                  }}
                  className="min-h-[60px] border-b border-[#d5e3e9] flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-[#f8fbfc] transition-colors"
                >

                  {/* SKILL NAME */}

                  <div className="w-[43%] md:w-[42%] min-w-0">

                    <h3 className="text-[9px] font-semibold text-[#123c5b] truncate">
                      {skill.name}
                    </h3>

                    <p className="text-[8px] text-[#8296aa] mt-1">
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

                  <div className="w-[65px] shrink-0">

                    <h3 className="text-[12px] font-semibold">
                      {skill.available}
                    </h3>

                    <p className="text-[8px] text-[#8296aa]">
                      available
                    </p>

                  </div>

                  <ChevronRight
                    size={17}
                    className="text-[#123c5b] shrink-0"
                  />

                </div>

              ))}

              {filteredSkills.length === 0 && (
                <div className="py-10 text-center text-xs text-gray-400">
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
                <h2 className="text-[12px] font-medium">
                  Availability forecast
                </h2>

                <p className="text-[8px] text-[#8296aa] mt-1">
                  Next seven days
                </p>
              </div>

              <span className="text-[8px] text-[#287fa9]">
                Greater Riverton
              </span>

            </div>

            {/* FORECAST BARS */}

            <div className="p-4 space-y-[19px]">

              {forecastData.map((item) => (

                <div
                  key={item.day}
                  className="flex items-center gap-3"
                >

                  <span className="w-[53px] text-[8px] font-semibold shrink-0">
                    {item.day}
                  </span>

                  <div className="flex-1 h-[7px] bg-[#e7eef1] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#287fa9] rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.volunteers / 706) * 100}%`,
                      }}
                    />

                  </div>

                  <span className="w-[28px] text-[8px] font-semibold text-right">
                    {item.volunteers}
                  </span>

                </div>

              ))}

            </div>

            {/* COVERAGE WARNING */}

            <div className="mx-3.5 mt-1 mb-4 bg-[#fff6e5] rounded-lg px-3 py-3 flex items-start gap-2">

              <AlertTriangle
                size={17}
                className="text-[#946000] shrink-0"
              />

              <div>

                <h3 className="text-[9px] font-semibold text-[#946000]">
                  Thursday coverage gap
                </h3>

                <p className="text-[8px] text-[#946000] mt-1">
                  Additional rescue drivers needed from 18:00–22:00.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* NOTIFICATION */}

      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs">
          {notification}
        </div>
      )}

      {/* MANAGE SKILLS MODAL */}

      {showManageModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[470px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex items-center justify-between">

              <div>
                <h2 className="text-[16px] font-semibold">
                  Manage skills
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Add or remove volunteer skill groups.
                </p>
              </div>

              <button onClick={() => setShowManageModal(false)}>
                <X size={20} />
              </button>

            </div>

            <div className="p-5">

              <label className="text-[11px] font-semibold">
                Add new skill group
              </label>

              <div className="flex gap-2 mt-2">

                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name..."
                  className="flex-1 border border-[#d5e3e9] rounded-lg px-3 py-3 text-xs outline-none focus:border-[#287fa9]"
                />

                <button
                  onClick={handleAddSkill}
                  className="bg-[#287fa9] text-white rounded-lg px-3 flex items-center gap-1 text-xs"
                >
                  <Plus size={15} />
                  Add
                </button>

              </div>

              <h3 className="text-[11px] font-semibold mt-6 mb-3">
                Existing skill groups
              </h3>

              <div className="max-h-[250px] overflow-y-auto space-y-2">

                {skills.map((skill) => (

                  <div
                    key={skill.name}
                    className="flex items-center justify-between border border-[#e1eaf0] rounded-lg p-3"
                  >

                    <div>
                      <p className="text-[10px] font-medium">
                        {skill.name}
                      </p>

                      <p className="text-[9px] text-gray-400 mt-1">
                        {skill.verified} verified volunteers
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      title="Remove skill"
                    >
                      <X size={15} />
                    </button>

                  </div>

                ))}

              </div>

            </div>

            <div className="p-4 border-t flex justify-end">

              <button
                onClick={() => setShowManageModal(false)}
                className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs"
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

            <div className="p-5 border-b flex items-center justify-between">

              <div>
                <h2 className="text-[16px] font-semibold">
                  Request availability
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Request volunteers for a specific response period.
                </p>
              </div>

              <button onClick={() => setShowRequestModal(false)}>
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleRequestAvailability}
              className="p-5 space-y-4"
            >

              <div>
                <label className="text-[10px] font-semibold">
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
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                >
                  {skills.map((skill) => (
                    <option key={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold">
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
                  placeholder="Enter location"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold">
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
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="text-[10px] font-semibold">
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
                    className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold">
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
                    className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                  />
                </div>

              </div>

              <div>
                <label className="text-[10px] font-semibold">
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
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] text-white rounded-lg px-4 py-2.5 text-xs"
                >
                  Submit request
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

              <h2 className="text-[15px] font-semibold">
                Skill details
              </h2>

              <button onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>

            </div>

            <div className="mt-5">

              <div className="w-12 h-12 bg-[#e5f5ef] rounded-xl flex items-center justify-center">
                <Users size={23} className="text-[#36a78b]" />
              </div>

              <h3 className="text-sm font-semibold mt-4">
                {selectedSkill.name}
              </h3>

              <p className="text-[10px] text-gray-400 mt-1">
                Volunteer skill coverage overview
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="bg-[#f3f7f9] rounded-lg p-3">
                  <p className="text-[9px] text-gray-400">
                    Verified volunteers
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    {selectedSkill.verified}
                  </h3>
                </div>

                <div className="bg-[#f3f7f9] rounded-lg p-3">
                  <p className="text-[9px] text-gray-400">
                    Available now
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    {selectedSkill.available}
                  </h3>
                </div>

              </div>

              <div className="mt-5">

                <div className="flex justify-between text-[10px] mb-2">
                  <span>Coverage level</span>
                  <span className="font-semibold">
                    {selectedSkill.percentage}%
                  </span>
                </div>

                <div className="h-2 bg-[#e7eef1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#62b9a0] rounded-full"
                    style={{
                      width: `${selectedSkill.percentage}%`,
                    }}
                  />
                </div>

              </div>

            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 bg-[#287fa9] text-white rounded-lg py-3 text-xs"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-5 right-4 w-10 h-10 rounded-full bg-[#282828] hover:bg-black text-white flex items-center justify-center shadow-lg">
        <HelpCircle size={21} />
      </button>

    </div>
  );
}