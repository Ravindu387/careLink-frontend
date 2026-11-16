
import { useState } from "react";
import {
  Heart,
  Search,
  Globe,
  Bell,
  Accessibility,
  Home,
  Plus,
  ClipboardList,
  Map,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  User,
  MapPin,
  Languages,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
} from "lucide-react";

const navigation = [
  { name: "Home", icon: Home },
  { name: "Request Help", icon: Plus },
  { name: "My Requests", icon: ClipboardList, count: 2 },
  { name: "Nearby Support", icon: Map },
  { name: "Shelters", icon: House },
  { name: "Safety Updates", icon: TriangleAlert, count: 3 },
  { name: "My Household", icon: Users },
  { name: "My Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare, count: 2 },
  { name: "Notifications", icon: Bell, count: 4 },
  { name: "Feedback", icon: Heart },
  { name: "Profile & Settings", icon: Accessibility },
];

const settingsTabs = [
  { name: "Personal details", icon: User },
  { name: "Contact & location", icon: MapPin },
  { name: "Language & accessibility", icon: Languages },
  { name: "Notifications", icon: Bell },
  { name: "Privacy & data", icon: Lock },
  { name: "Security", icon: Shield },
];

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("Personal details");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fullName: "Samira Khan",
    dateOfBirth: "1990-12-04",
    preferredName: "Samira",
    citizenReference: "CIT-10482",
    email: "samira.khan@email.com",
    phone: "+94 77 412 8088",
    address: "North Ward, Greater Riverton",
    district: "North Ward",
    language: "English",
    accessibility: "Standard",
    password: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs text-[#173d5b] outline-none focus:border-[#287da6] focus:ring-2 focus:ring-sky-100";

  const labelClass =
    "mb-2 block text-[10px] font-semibold text-[#173d5b]";

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col bg-[#153e5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* LOGO */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa] text-[#153e5e]">
              <Heart size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold">ReliefOS</h1>
              <p className="text-[10px] text-sky-200">
                Citizen Support
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>

          <p className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Profile & Settings";

            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs transition ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.name}</span>

                {item.count && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#173d5b]">
          <div className="flex items-center gap-3">
            <Phone size={20} />

            <div>
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>
              <a
                href="tel:112"
                className="text-sm font-bold text-red-600"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">
              Citizen account
            </p>
          </div>

          <ChevronRight size={17} />
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="flex max-w-[520px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <Search size={17} className="text-slate-400" />

              <input
                placeholder="Search help, shelters, services..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:flex">
              <Globe size={15} />
              English
            </button>

            <button className="hidden rounded-lg border border-slate-200 p-2 sm:block">
              <Accessibility size={18} />
            </button>

            <button className="relative rounded-lg border border-slate-200 p-2">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                4
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
              SK
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Samira</p>
              <p className="text-[9px] text-slate-400">
                North Ward
              </p>
            </div>

            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6">

          {/* TITLE */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Profile & Settings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage your contact details, privacy, language, accessibility, and account security.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c6388]"
            >
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? "Saved" : "Save changes"}
            </button>
          </div>

          {/* SETTINGS LAYOUT */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">

            {/* SETTINGS MENU */}
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.name;

                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      setSaved(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-4 text-left text-xs transition ${
                      active
                        ? "bg-[#e8f2f7] font-semibold text-[#287da6]"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={18} />

                    <span className="flex-1">{tab.name}</span>

                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>

            {/* SETTINGS CONTENT */}
            <section className="min-h-[300px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              {/* PERSONAL DETAILS */}
              {activeTab === "Personal details" && (
                <>
                  <h3 className="text-sm font-semibold">
                    Personal details
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Update your personal details.
                  </p>

                  <div className="my-5 border-t border-slate-200" />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>
                      <label className={labelClass}>
                        Full name
                      </label>

                      <input
                        className={inputClass}
                        value={form.fullName}
                        onChange={(e) =>
                          updateField("fullName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Date of birth
                      </label>

                      <div className="relative">
                        <input
                          type="date"
                          className={inputClass}
                          value={form.dateOfBirth}
                          onChange={(e) =>
                            updateField("dateOfBirth", e.target.value)
                          }
                        />
                        <Calendar
                          size={15}
                          className="pointer-events-none absolute right-3 top-3 text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Preferred name
                      </label>

                      <input
                        className={inputClass}
                        value={form.preferredName}
                        onChange={(e) =>
                          updateField("preferredName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Citizen reference
                      </label>

                      <input
                        className={`${inputClass} bg-slate-50`}
                        value={form.citizenReference}
                        readOnly
                      />
                    </div>

                  </div>
                </>
              )}

              {/* CONTACT & LOCATION */}
              {activeTab === "Contact & location" && (
                <>
                  <h3 className="text-sm font-semibold">
                    Contact & location
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Manage your contact information and saved address.
                  </p>

                  <div className="my-5 border-t border-slate-200" />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>
                      <label className={labelClass}>
                        Email address
                      </label>
                      <input
                        type="email"
                        className={inputClass}
                        value={form.email}
                        onChange={(e) =>
                          updateField("email", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Contact number
                      </label>
                      <input
                        className={inputClass}
                        value={form.phone}
                        onChange={(e) =>
                          updateField("phone", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Saved address
                      </label>
                      <input
                        className={inputClass}
                        value={form.address}
                        onChange={(e) =>
                          updateField("address", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        District
                      </label>
                      <input
                        className={inputClass}
                        value={form.district}
                        onChange={(e) =>
                          updateField("district", e.target.value)
                        }
                      />
                    </div>

                  </div>
                </>
              )}

              {/* LANGUAGE & ACCESSIBILITY */}
              {activeTab === "Language & accessibility" && (
                <>
                  <h3 className="text-sm font-semibold">
                    Language & accessibility
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Choose your preferred language and accessibility options.
                  </p>

                  <div className="my-5 border-t border-slate-200" />

                  <div className="space-y-5">

                    <div>
                      <label className={labelClass}>
                        Preferred language
                      </label>

                      <select
                        className={inputClass}
                        value={form.language}
                        onChange={(e) =>
                          updateField("language", e.target.value)
                        }
                      >
                        <option>English</option>
                        <option>Sinhala</option>
                        <option>Tamil</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Accessibility preference
                      </label>

                      <select
                        className={inputClass}
                        value={form.accessibility}
                        onChange={(e) =>
                          updateField("accessibility", e.target.value)
                        }
                      >
                        <option>Standard</option>
                        <option>Large text</option>
                        <option>High contrast</option>
                        <option>Screen reader support</option>
                      </select>
                    </div>

                  </div>
                </>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === "Notifications" && (
                <>
                  <h3 className="text-sm font-semibold">
                    Notifications
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Manage how you receive important updates.
                  </p>

                  <div className="my-5 border-t border-slate-200" />

                  {[
                    "Emergency alerts",
                    "Request status updates",
                    "Safety notifications",
                    "Messages from support teams",
                    "Shelter availability updates",
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center justify-between border-b border-slate-100 py-4"
                    >
                      <span className="text-xs">{item}</span>

                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 accent-[#287da6]"
                      />
                    </label>
                  ))}
                </>
              )}

              {/* PRIVACY */}
              {activeTab === "Privacy & data" && (
                <>
                  <h3 className="text-sm font-semibold">
                    Privacy & data
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Manage your personal information and data privacy.
                  </p>

                  <div className="my-5 border-t border-slate-200" />

                  <div className="space-y-4">

                    <div className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-xs font-semibold">
                        Personal information
                      </h4>
                      <p className="mt-2 text-[10px] text-slate-500">
                        Your personal information is protected and only shared with authorised support teams when necessary.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-xs font-semibold">
                        Data sharing preferences
                      </h4>
                      <p className="mt-2 text-[10px] text-slate-500">
                        Control how your information is used when requesting assistance.
                      </p>
                    </div>

                  </div>
                </>
              )}

              {/* SECURITY */}
              {activeTab === "Security" && (
                <>
                  <h3 className="text-sm font-semibold">
                    Security
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Manage your account security and password.
                  </p>

                  <div className="my-5 border-t border-slate-200" />

                  <div className="max-w-lg space-y-5">

                    <div>
                      <label className={labelClass}>
                        Current password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={inputClass}
                          placeholder="Enter current password"
                          value={form.password}
                          onChange={(e) =>
                            updateField("password", e.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-3 top-3 text-slate-400"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 px-4 py-3 text-xs font-semibold text-[#287da6] hover:bg-sky-50"
                    >
                      Change password
                    </button>

                  </div>
                </>
              )}

              {/* SAVE STATUS */}
              {saved && (
                <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                  <CheckCircle size={16} />
                  Changes saved successfully!
                </div>
              )}

            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
