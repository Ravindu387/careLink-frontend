
import { useState } from "react";
import {
  UserRound,
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Monitor,
  Smartphone,
} from "lucide-react";

type SettingsTab =
  | "profile"
  | "operational"
  | "notifications"
  | "security";

export default function Settings() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("profile");

  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "Amina Mensah",
    email: "amina@response.org",
    phone: "+94 77 412 8041",
    area: "Greater Riverton",
  });

  const [operational, setOperational] = useState({
    autoRefresh: true,
    aiRecommendations: true,
    criticalAlerts: true,
    liveMap: true,
    defaultPriority: "High",
    refreshInterval: "30 seconds",
  });

  const [notifications, setNotifications] = useState({
    critical: true,
    ai: true,
    resources: true,
    shelters: true,
    partners: true,
    reports: true,
    email: true,
    browser: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const tabs = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: UserRound,
    },
    {
      id: "operational" as const,
      label: "Operational Preferences",
      icon: SettingsIcon,
    },
    {
      id: "notifications" as const,
      label: "Notification Preferences",
      icon: Bell,
    },
    {
      id: "security" as const,
      label: "Security & Sessions",
      icon: ShieldCheck,
    },
  ];

  const handleSave = () => {
    if (
      activeTab === "security" &&
      password.newPassword !== password.confirm
    ) {
      alert("New password and confirmation do not match.");
      return;
    }

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const toggleNotification = (
    key: keyof typeof notifications
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleOperational = (
    key: keyof typeof operational
  ) => {
    setOperational((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Settings
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage coordinator profile, operational preferences,
            notifications, and security.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-lg bg-[#287da5] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#216789]"
        >
          Save changes
        </button>

      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <CheckCircle2 size={17} />
          Settings saved successfully.
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">

        {/* Settings Navigation */}
        <div className="rounded-xl border border-[#d4e2e9] bg-white p-2 shadow-sm">

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaved(false);
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-4 text-left transition ${
                  active
                    ? "bg-[#e7f1f6] text-[#287da5]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#287da5]"
                }`}
              >

                <Icon size={18} />

                <span className="flex-1 text-[11px] font-medium">
                  {tab.label}
                </span>

                <ChevronRight
                  size={17}
                  className={active ? "text-[#287da5]" : "text-slate-400"}
                />

              </button>
            );
          })}

        </div>

        {/* Settings Content */}
        <div className="min-w-0 rounded-xl border border-[#d4e2e9] bg-white p-5 shadow-sm sm:p-6">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div>

              <SectionHeading
                title="Profile"
                description="Configure profile for your Emergency Coordinator workspace."
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <InputField
                  label="Full name"
                  value={profile.fullName}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      fullName: value,
                    })
                  }
                />

                <InputField
                  label="Email address"
                  value={profile.email}
                  type="email"
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      email: value,
                    })
                  }
                />

                <InputField
                  label="Contact number"
                  value={profile.phone}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      phone: value,
                    })
                  }
                />

                <div>
                  <label className="mb-2 block text-[11px] font-medium text-[#153f5e]">
                    Primary operational area
                  </label>

                  <select
                    value={profile.area}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        area: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#d4e2e9] bg-white px-3 py-3 text-xs text-[#153f5e] outline-none focus:border-[#287da5]"
                  >
                    <option>Greater Riverton</option>
                    <option>Central Ward</option>
                    <option>North Ward</option>
                    <option>Eastbank</option>
                    <option>West District</option>
                  </select>
                </div>

              </div>

              <div className="mt-7 rounded-lg bg-[#f1f6f8] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#287da5] text-sm font-bold text-white">
                    AM
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#153f5e]">
                      {profile.fullName}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Emergency Coordinator
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* OPERATIONAL PREFERENCES */}
          {activeTab === "operational" && (
            <div>

              <SectionHeading
                title="Operational Preferences"
                description="Customize your emergency coordination workspace and operational settings."
              />

              <div className="space-y-1">

                <ToggleSetting
                  title="Automatic data refresh"
                  description="Automatically refresh operational information."
                  checked={operational.autoRefresh}
                  onChange={() => toggleOperational("autoRefresh")}
                />

                <ToggleSetting
                  title="AI recommendations"
                  description="Show AI-assisted recommendations in your workspace."
                  checked={operational.aiRecommendations}
                  onChange={() => toggleOperational("aiRecommendations")}
                />

                <ToggleSetting
                  title="Critical alert monitoring"
                  description="Monitor critical and overdue assistance requests."
                  checked={operational.criticalAlerts}
                  onChange={() => toggleOperational("criticalAlerts")}
                />

                <ToggleSetting
                  title="Live operations map"
                  description="Enable live operational map updates."
                  checked={operational.liveMap}
                  onChange={() => toggleOperational("liveMap")}
                />

              </div>

              <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-[11px] font-medium text-[#153f5e]">
                    Default priority
                  </label>

                  <select
                    value={operational.defaultPriority}
                    onChange={(e) =>
                      setOperational({
                        ...operational,
                        defaultPriority: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#d4e2e9] px-3 py-3 text-xs text-[#153f5e] outline-none focus:border-[#287da5]"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-medium text-[#153f5e]">
                    Data refresh interval
                  </label>

                  <select
                    value={operational.refreshInterval}
                    onChange={(e) =>
                      setOperational({
                        ...operational,
                        refreshInterval: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#d4e2e9] px-3 py-3 text-xs text-[#153f5e] outline-none focus:border-[#287da5]"
                  >
                    <option>10 seconds</option>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                  </select>
                </div>

              </div>

            </div>
          )}

          {/* NOTIFICATION PREFERENCES */}
          {activeTab === "notifications" && (
            <div>

              <SectionHeading
                title="Notification Preferences"
                description="Manage the alerts and updates you receive during emergency operations."
              />

              <h3 className="mb-3 text-xs font-semibold text-[#153f5e]">
                Notification categories
              </h3>

              <div className="space-y-1">

                <ToggleSetting
                  title="Critical alerts"
                  description="Critical requests, overdue cases and emergency escalations."
                  checked={notifications.critical}
                  onChange={() => toggleNotification("critical")}
                />

                <ToggleSetting
                  title="AI recommendations"
                  description="AI-generated priorities and decision support updates."
                  checked={notifications.ai}
                  onChange={() => toggleNotification("ai")}
                />

                <ToggleSetting
                  title="Resource notifications"
                  description="Stock shortages, resource allocations and dispatch updates."
                  checked={notifications.resources}
                  onChange={() => toggleNotification("resources")}
                />

                <ToggleSetting
                  title="Shelter notifications"
                  description="Shelter capacity and accommodation updates."
                  checked={notifications.shelters}
                  onChange={() => toggleNotification("shelters")}
                />

                <ToggleSetting
                  title="Partner updates"
                  description="Partner verification and collaboration updates."
                  checked={notifications.partners}
                  onChange={() => toggleNotification("partners")}
                />

                <ToggleSetting
                  title="Situation reports"
                  description="Report approval and publication notifications."
                  checked={notifications.reports}
                  onChange={() => toggleNotification("reports")}
                />

              </div>

              <div className="my-6 border-t border-[#dce7ec]" />

              <h3 className="mb-3 text-xs font-semibold text-[#153f5e]">
                Delivery channels
              </h3>

              <ToggleSetting
                title="Email notifications"
                description="Receive operational updates through email."
                checked={notifications.email}
                onChange={() => toggleNotification("email")}
              />

              <ToggleSetting
                title="Browser notifications"
                description="Receive notifications through your browser."
                checked={notifications.browser}
                onChange={() => toggleNotification("browser")}
              />

            </div>
          )}

          {/* SECURITY & SESSIONS */}
          {activeTab === "security" && (
            <div>

              <SectionHeading
                title="Security & Sessions"
                description="Manage your account password and active login sessions."
              />

              <div className="mb-6 rounded-lg border border-[#dce7ec] p-4">

                <div className="mb-4 flex items-center gap-2">
                  <Lock size={17} className="text-[#287da5]" />
                  <h3 className="text-xs font-semibold text-[#153f5e]">
                    Change password
                  </h3>
                </div>

                <div className="space-y-4">

                  <PasswordField
                    label="Current password"
                    value={password.current}
                    onChange={(value) =>
                      setPassword({
                        ...password,
                        current: value,
                      })
                    }
                    visible={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                  />

                  <PasswordField
                    label="New password"
                    value={password.newPassword}
                    onChange={(value) =>
                      setPassword({
                        ...password,
                        newPassword: value,
                      })
                    }
                    visible={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                  />

                  <PasswordField
                    label="Confirm new password"
                    value={password.confirm}
                    onChange={(value) =>
                      setPassword({
                        ...password,
                        confirm: value,
                      })
                    }
                    visible={showPassword}
                    toggle={() => setShowPassword(!showPassword)}
                  />

                </div>

              </div>

              <div className="mb-3 flex items-center gap-2">
                <Monitor size={17} className="text-[#287da5]" />
                <h3 className="text-xs font-semibold text-[#153f5e]">
                  Active sessions
                </h3>
              </div>

              <SessionCard
                icon={<Monitor size={19} />}
                title="Windows - Chrome"
                description="Current session · Windows desktop"
                time="Active now"
                current
              />

              <SessionCard
                icon={<Smartphone size={19} />}
                title="Mobile device"
                description="Previously logged-in device"
                time="Last active 2 hours ago"
              />

              <div className="mt-5 rounded-lg bg-[#f1f6f8] p-4">

                <div className="flex items-center gap-2 text-[#287da5]">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-semibold">
                    Account security
                  </span>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Always use a strong password and avoid sharing
                  your account credentials with other users.
                </p>

              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}

/* Reusable Section Heading */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 border-b border-[#dce7ec] pb-4">
      <h2 className="text-sm font-semibold text-[#153f5e]">
        {title}
      </h2>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* Reusable Input */

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium text-[#153f5e]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#d4e2e9] px-3 py-3 text-xs text-[#153f5e] outline-none transition focus:border-[#287da5] focus:ring-2 focus:ring-[#287da5]/10"
      />
    </div>
  );
}

/* Reusable Toggle */

function ToggleSetting({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#edf2f4] py-4">

      <div className="min-w-0">
        <p className="text-xs font-medium text-[#153f5e]">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-5 w-10 shrink-0 rounded-full transition ${
          checked ? "bg-[#287da5]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>

    </div>
  );
}

/* Password Input */

function PasswordField({
  label,
  value,
  onChange,
  visible,
  toggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  toggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium text-[#153f5e]">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter password"
          className="w-full rounded-lg border border-[#d4e2e9] px-3 py-3 pr-11 text-xs outline-none focus:border-[#287da5]"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* Active Session */

function SessionCard({
  icon,
  title,
  description,
  time,
  current = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  current?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce7ec] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f2f7] text-[#287da5]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold text-[#153f5e]">
            {title}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {description}
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2">

        <span className="text-[10px] text-slate-400">
          {time}
        </span>

        {current && (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">
            Current
          </span>
        )}

      </div>

    </div>
  );
}
