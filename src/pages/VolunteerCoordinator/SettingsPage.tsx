import { useState, useEffect, useCallback, type ElementType } from "react";

import {
  ChevronRight,
  UserRound,
  Sparkles,
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  Upload,
  Check,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  Smartphone,
  Save,
  AlertCircle,
  HelpCircle,
  Server,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { volunteerSettingsService } from "../../services/volunteerSettingsService";
import type {
  VolunteerProfile,
  AIMatchingRules,
  VolunteerNotificationPreferences,
  VolunteerActiveSession,
} from "../../types/volunteerSettings";

// TYPES

type SettingsTab =
  | "Profile"
  | "Matching Rules"
  | "Notification Preferences"
  | "Security & Sessions";

// SIDEBAR ITEMS

const sidebarItems: {
  name: SettingsTab;
  icon: ElementType;
}[] = [
  {
    name: "Profile",
    icon: UserRound,
  },
  {
    name: "Matching Rules",
    icon: Sparkles,
  },
  {
    name: "Notification Preferences",
    icon: Bell,
  },
  {
    name: "Security & Sessions",
    icon: SettingsIcon,
  },
];

// REUSABLE TOGGLE

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`w-10 h-5 rounded-full relative transition-colors shrink-0 cursor-pointer ${
        enabled ? "bg-[#287fa9]" : "bg-[#cbd5dc]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
          enabled ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

// INPUT COMPONENT

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#123c5b] mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[39px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] text-[#123c5b] outline-none focus:border-[#287fa9] focus:ring-2 focus:ring-[#287fa9]/10 transition-all bg-white"
      />
    </div>
  );
}

// SECTION HEADER

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#d5e3e9] pb-4 mb-4">
      <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">
        {title}
      </h2>

      <p className="text-xs text-[#8296aa] mt-1">
        {description}
      </p>
    </div>
  );
}

// MAIN COMPONENT

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Profile");
  const [notification, setNotification] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PROFILE STATE
  const [profile, setProfile] = useState<VolunteerProfile>({
    fullName: "Nadia Okafor",
    email: "nadia@reliefos.org",
    phone: "+94 77 412 8041",
    area: "Greater Riverton",
    photo: null,
  });

  // MATCHING RULES
  const [matchingRules, setMatchingRules] = useState<AIMatchingRules>({
    minimumScore: "70",
    travelDistance: "25",
    availability: true,
    verifiedSkills: true,
    experience: true,
    training: true,
    preventConflicts: true,
    humanApproval: true,
  });

  // NOTIFICATION SETTINGS
  const [notificationSettings, setNotificationSettings] =
    useState<VolunteerNotificationPreferences>({
      assignments: true,
      verification: true,
      safety: true,
      aiMatching: true,
      communications: true,
      inApp: true,
      email: true,
      sms: false,
      urgentOnly: false,
    });

  // SECURITY SETTINGS
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: true,
  });

  // ACTIVE SESSIONS
  const [activeSessions, setActiveSessions] = useState<VolunteerActiveSession[]>([
    {
      id: "sess-01",
      device: "Windows",
      browser: "Chrome",
      location: "Riverton Operations Center",
      lastActive: "Active now",
      isCurrent: true,
    },
  ]);

  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3200);
  };

  // LOAD SETTINGS FROM BACKEND
  const loadSettings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await volunteerSettingsService.getSettings();
      setIsLiveBackend(response.isLiveBackend);
      const data = response.data;

      if (data.profile) {
        setProfile(data.profile);
        if (data.profile.photo) setPhoto(data.profile.photo);
      }
      if (data.matchingRules) setMatchingRules(data.matchingRules);
      if (data.notificationSettings) setNotificationSettings(data.notificationSettings);
      if (data.security) {
        setSecurity((prev) => ({
          ...prev,
          twoFactor: data.security.twoFactor,
        }));
      }
      if (data.activeSessions && data.activeSessions.length > 0) {
        setActiveSessions(data.activeSessions);
      }
    } catch {
      notify("Failed to retrieve settings from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // UPDATE PROFILE FIELD
  const updateProfile = (key: keyof VolunteerProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // PHOTO UPLOAD
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      notify("Please upload a JPG or PNG image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notify("Image size must be less than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhoto(result);
      setProfile((prev) => ({ ...prev, photo: result }));
      notify("Profile photo uploaded.");
    };
    reader.readAsDataURL(file);
  };

  // REVOKE SESSION
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const success = await volunteerSettingsService.revokeSession(sessionId);
      if (success) {
        setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
        notify("Session revoked successfully.");
      } else {
        notify("Cannot revoke current active session.");
      }
    } catch {
      notify("Failed to revoke session.");
    }
  };

  // RESET DEFAULTS
  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all settings to default configuration?")) return;
    try {
      const res = await volunteerSettingsService.resetDefaults();
      setIsLiveBackend(res.isLiveBackend);
      setProfile(res.data.profile);
      setPhoto(res.data.profile.photo ?? null);
      setMatchingRules(res.data.matchingRules);
      setNotificationSettings(res.data.notificationSettings);
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactor: res.data.security.twoFactor,
      });
      if (res.data.activeSessions) setActiveSessions(res.data.activeSessions);
      notify("Settings restored to defaults.");
    } catch {
      notify("Failed to reset settings.");
    }
  };

  // SAVE SETTINGS
  const handleSave = async () => {
    if (!profile.fullName.trim() || !profile.email.trim()) {
      notify("Please complete all required profile fields.");
      return;
    }

    // Password validation if change password was attempted
    if (activeTab === "Security & Sessions" && security.newPassword) {
      if (security.newPassword !== security.confirmPassword) {
        notify("New passwords do not match.");
        return;
      }

      if (security.newPassword.length < 8) {
        notify("Password must contain at least 8 characters.");
        return;
      }
    }

    setIsSaving(true);
    try {
      // 1. Update general settings
      const payload = {
        profile: {
          ...profile,
          photo,
        },
        matchingRules,
        notificationSettings,
        security: {
          twoFactor: security.twoFactor,
        },
        activeSessions,
      };

      const result = await volunteerSettingsService.updateSettings(payload);
      setIsLiveBackend(result.isLiveBackend);

      // 2. If password provided, process change password
      if (security.newPassword) {
        const passwordSuccess = await volunteerSettingsService.changePassword({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
          confirmPassword: security.confirmPassword,
        });

        if (passwordSuccess) {
          setSecurity((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
          notify("Settings and password updated successfully!");
        } else {
          notify("Settings saved, but password update failed.");
        }
      } else {
        notify(result.message || "Settings saved successfully!");
      }
    } catch {
      notify("Failed to save settings to server.");
    } finally {
      setIsSaving(false);
    }
  };

  // REUSABLE SETTING ROW
  const SettingRow = ({
    title,
    description,
    enabled,
    onChange,
  }: {
    title: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[#edf2f5]">
      <div>
        <p className="text-sm font-medium text-[#123c5b]">{title}</p>
        <p className="text-xs text-[#8296aa] mt-1">{description}</p>
      </div>

      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
        {/* BREADCRUMB & API STATUS */}
        <div className="flex items-center justify-between gap-2 mb-7">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="font-semibold text-[#123c5b]">Settings</span>
          </div>

          {/* BACKEND API STATUS BADGE */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs ${
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
              onClick={() => loadSettings(true)}
              disabled={isRefreshing}
              title="Refresh Settings from API"
              className="p-1 text-[#8296aa] hover:text-[#123c5b] transition-colors rounded hover:bg-white cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287fa9]" : ""} />
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">Settings</h1>
            <p className="text-sm text-[#718ba0] mt-2">
              Manage your coordinator profile, matching rules, notifications, and security.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="h-[36px] px-3.5 bg-white border border-[#d5e3e9] text-[#718ba0] hover:text-[#123c5b] hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm font-semibold transition cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset defaults
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="h-[36px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Save size={13} />
              <span>{isSaving ? "Saving..." : "Save changes"}</span>
            </button>
          </div>
        </div>

        {/* SETTINGS LAYOUT */}
        <section className="grid grid-cols-1 md:grid-cols-[245px_1fr] gap-3 items-start">
          {/* SIDEBAR */}
          <aside className="bg-white border border-[#d5e3e9] rounded-xl p-2 shadow-[0_5px_15px_rgba(30,70,90,0.05)]">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full h-[43px] rounded-lg px-3 flex items-center justify-between mb-1 transition-colors cursor-pointer ${
                    active
                      ? "bg-[#e8f1f6] text-[#17648e]"
                      : "text-[#718ba0] hover:bg-[#f5f9fb]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} />
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>

                  <ChevronRight size={16} />
                </button>
              );
            })}
          </aside>

          {/* CONTENT PANEL */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl p-5 md:p-6 shadow-[0_5px_15px_rgba(30,70,90,0.05)] min-h-[285px]">
            {/* ================================= */}
            {/* PROFILE */}
            {/* ================================= */}
            {activeTab === "Profile" && (
              <div>
                <SectionHeader
                  title="Profile"
                  description="Configure profile for your Volunteer Coordinator workspace."
                />

                {/* PROFILE PHOTO */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-[48px] h-[48px] rounded-full bg-[#123c5b] text-white flex items-center justify-center font-semibold text-[12px] overflow-hidden">
                      {photo ? (
                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profile.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "NO"
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold">Profile photo</p>
                      <p className="text-xs text-[#8296aa] mt-1">
                        JPG or PNG · maximum 2 MB
                      </p>
                    </div>
                  </div>

                  <label className="h-[36px] px-3 border border-[#b9d0dc] rounded-lg text-sm text-[#17648e] flex items-center gap-2 cursor-pointer hover:bg-[#f5fafc] transition">
                    <Upload size={13} />
                    Upload photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                {/* PROFILE FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormInput
                    label="Full name"
                    value={profile.fullName}
                    onChange={(value) => updateProfile("fullName", value)}
                  />

                  <FormInput
                    label="Email address"
                    value={profile.email}
                    type="email"
                    onChange={(value) => updateProfile("email", value)}
                  />

                  <FormInput
                    label="Contact number"
                    value={profile.phone}
                    onChange={(value) => updateProfile("phone", value)}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Operational area
                    </label>

                    <select
                      value={profile.area}
                      onChange={(e) => updateProfile("area", e.target.value)}
                      className="w-full h-[39px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white cursor-pointer"
                    >
                      <option>Greater Riverton</option>
                      <option>North Ward</option>
                      <option>Central Ward</option>
                      <option>Eastbank</option>
                      <option>West District</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ================================= */}
            {/* MATCHING RULES */}
            {/* ================================= */}
            {activeTab === "Matching Rules" && (
              <div>
                <SectionHeader
                  title="AI Volunteer Matching Rules"
                  description="Configure how AI recommends volunteers for operational tasks."
                />

                {/* MATCH SCORE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum suitability score (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={matchingRules.minimumScore}
                      onChange={(e) =>
                        setMatchingRules((prev) => ({
                          ...prev,
                          minimumScore: e.target.value,
                        }))
                      }
                      className="w-full h-[39px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white"
                    />

                    <p className="text-xs text-[#8296aa] mt-1">
                      Candidates below this score will not be recommended.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Maximum travel distance (km)
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={matchingRules.travelDistance}
                      onChange={(e) =>
                        setMatchingRules((prev) => ({
                          ...prev,
                          travelDistance: e.target.value,
                        }))
                      }
                      className="w-full h-[39px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white"
                    />
                  </div>
                </div>

                <div className="bg-[#f5f9fb] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={17} className="text-[#7953c6]" />
                    <h3 className="text-base font-semibold">Matching criteria</h3>
                  </div>

                  <SettingRow
                    title="Verified skills"
                    description="Only recommend volunteers with verified required skills."
                    enabled={matchingRules.verifiedSkills}
                    onChange={() =>
                      setMatchingRules((prev) => ({
                        ...prev,
                        verifiedSkills: !prev.verifiedSkills,
                      }))
                    }
                  />

                  <SettingRow
                    title="Availability matching"
                    description="Check volunteer availability against task schedules."
                    enabled={matchingRules.availability}
                    onChange={() =>
                      setMatchingRules((prev) => ({
                        ...prev,
                        availability: !prev.availability,
                      }))
                    }
                  />

                  <SettingRow
                    title="Previous experience"
                    description="Consider previous relevant volunteer experience."
                    enabled={matchingRules.experience}
                    onChange={() =>
                      setMatchingRules((prev) => ({
                        ...prev,
                        experience: !prev.experience,
                      }))
                    }
                  />

                  <SettingRow
                    title="Training qualifications"
                    description="Prioritize volunteers with valid training certificates."
                    enabled={matchingRules.training}
                    onChange={() =>
                      setMatchingRules((prev) => ({
                        ...prev,
                        training: !prev.training,
                      }))
                    }
                  />

                  <SettingRow
                    title="Prevent assignment conflicts"
                    description="Avoid recommending volunteers with conflicting assignments."
                    enabled={matchingRules.preventConflicts}
                    onChange={() =>
                      setMatchingRules((prev) => ({
                        ...prev,
                        preventConflicts: !prev.preventConflicts,
                      }))
                    }
                  />
                </div>

                {/* HUMAN APPROVAL */}
                <div className="bg-[#f0eafb] border border-[#e0d4f5] rounded-lg p-4">
                  <SettingRow
                    title="Human approval required"
                    description="AI recommendations must be reviewed by a coordinator before assignment."
                    enabled={matchingRules.humanApproval}
                    onChange={() =>
                      setMatchingRules((prev) => ({
                        ...prev,
                        humanApproval: !prev.humanApproval,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* ================================= */}
            {/* NOTIFICATION PREFERENCES */}
            {/* ================================= */}
            {activeTab === "Notification Preferences" && (
              <div>
                <SectionHeader
                  title="Notification Preferences"
                  description="Manage the alerts and updates you receive from CareLink."
                />

                <h3 className="text-base font-semibold mb-2">Notification categories</h3>

                <SettingRow
                  title="Assignment updates"
                  description="New assignments, acceptance and completion updates."
                  enabled={notificationSettings.assignments}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      assignments: !prev.assignments,
                    }))
                  }
                />

                <SettingRow
                  title="Verification alerts"
                  description="New volunteer applications and qualification reviews."
                  enabled={notificationSettings.verification}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      verification: !prev.verification,
                    }))
                  }
                />

                <SettingRow
                  title="Safety alerts"
                  description="Urgent incidents and emergency field updates."
                  enabled={notificationSettings.safety}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      safety: !prev.safety,
                    }))
                  }
                />

                <SettingRow
                  title="AI matching updates"
                  description="Volunteer recommendations awaiting coordinator approval."
                  enabled={notificationSettings.aiMatching}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      aiMatching: !prev.aiMatching,
                    }))
                  }
                />

                <SettingRow
                  title="Communication updates"
                  description="Broadcast messages and delivery reports."
                  enabled={notificationSettings.communications}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      communications: !prev.communications,
                    }))
                  }
                />

                {/* DELIVERY CHANNELS */}
                <h3 className="text-base font-semibold mt-6 mb-2">Delivery channels</h3>

                <SettingRow
                  title="In-app notifications"
                  description="Receive notifications inside CareLink."
                  enabled={notificationSettings.inApp}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      inApp: !prev.inApp,
                    }))
                  }
                />

                <SettingRow
                  title="Email notifications"
                  description="Receive updates through your registered email."
                  enabled={notificationSettings.email}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      email: !prev.email,
                    }))
                  }
                />

                <SettingRow
                  title="SMS notifications"
                  description="Receive operational alerts through SMS."
                  enabled={notificationSettings.sms}
                  onChange={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      sms: !prev.sms,
                    }))
                  }
                />

                <div className="mt-4 bg-[#eaf5f9] rounded-lg p-3 flex gap-2 border border-[#d2e7f0]">
                  <AlertCircle size={15} className="text-[#287fa9] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#527d96] leading-4">
                    Critical safety alerts may still be delivered according to your
                    organization's emergency communication policy.
                  </p>
                </div>
              </div>
            )}

            {/* ================================= */}
            {/* SECURITY & SESSIONS */}
            {/* ================================= */}
            {activeTab === "Security & Sessions" && (
              <div>
                <SectionHeader
                  title="Security & Sessions"
                  description="Manage your password, authentication and active sessions."
                />

                {/* PASSWORD */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={17} className="text-[#287fa9]" />
                    <h3 className="text-base font-semibold">Change password</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Current password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={security.currentPassword}
                          onChange={(e) =>
                            setSecurity((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full h-[39px] border border-[#d5e3e9] rounded-lg px-3 pr-10 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white"
                          placeholder="Enter current password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-[#8296aa] hover:text-[#123c5b] cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <FormInput
                      label="New password"
                      type="password"
                      value={security.newPassword}
                      onChange={(value) =>
                        setSecurity((prev) => ({
                          ...prev,
                          newPassword: value,
                        }))
                      }
                      placeholder="Enter new password"
                    />

                    <FormInput
                      label="Confirm new password"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(value) =>
                        setSecurity((prev) => ({
                          ...prev,
                          confirmPassword: value,
                        }))
                      }
                      placeholder="Confirm new password"
                    />
                  </div>

                  <p className="text-xs text-[#8296aa] mt-2">
                    Password must contain at least 8 characters.
                  </p>
                </div>

                {/* TWO FACTOR */}
                <div className="border-t border-[#d5e3e9] pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={17} className="text-[#239879]" />
                    <h3 className="text-base font-semibold">Two-factor authentication</h3>
                  </div>

                  <SettingRow
                    title="Enable two-factor authentication"
                    description="Add an additional verification step when signing in."
                    enabled={security.twoFactor}
                    onChange={() =>
                      setSecurity((prev) => ({
                        ...prev,
                        twoFactor: !prev.twoFactor,
                      }))
                    }
                  />
                </div>

                {/* ACTIVE SESSIONS */}
                <div className="border-t border-[#d5e3e9] pt-5 mt-5">
                  <h3 className="text-base font-semibold mb-4">Active sessions</h3>

                  <div className="space-y-2.5">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between gap-3 bg-[#f5f9fb] border border-[#e4edf2] rounded-lg p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#e8f1f6] text-[#287fa9] rounded-lg flex items-center justify-center shrink-0">
                            {session.device.toLowerCase().includes("android") ||
                            session.device.toLowerCase().includes("ios") ? (
                              <Smartphone size={17} />
                            ) : (
                              <Monitor size={17} />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{session.device}</p>
                              {session.isCurrent && (
                                <span className="text-xs text-[#287fa9] font-medium">
                                  (Current session)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8296aa] mt-0.5">
                              {session.browser} · {session.location} · {session.lastActive}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {session.isCurrent ? (
                            <span className="bg-[#e5f5ef] text-[#239879] rounded-md px-2.5 py-1 text-xs font-semibold">
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Trash2 size={11} />
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* SUCCESS NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Check size={15} className="text-[#65bda5]" />
          <span>{notification}</span>
        </div>
      )}

      {/* HELP BUTTON */}
      <button
        type="button"
        onClick={() =>
          notify("Settings Help: Adjust matching weights and notification channels as required.")
        }
        aria-label="Help"
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#153f60] hover:bg-[#123c5b] text-white rounded-full flex items-center justify-center shadow-lg transition cursor-pointer"
      >
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
