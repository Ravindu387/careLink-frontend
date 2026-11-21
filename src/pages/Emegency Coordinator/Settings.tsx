import { useState, useEffect } from "react";
import {
  UserRound,
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Monitor,
  Smartphone,
  RotateCcw,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  settingsService,
  type CoordinatorProfile,
  type CoordinatorOperational,
  type CoordinatorNotifications,
  type UserSession,
} from "../../services/settingsService";

type SettingsTab =
  | "profile"
  | "operational"
  | "notifications"
  | "security";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<CoordinatorProfile>({
    fullName: "Amina Mensah",
    email: "amina@response.org",
    phone: "+94 77 412 8041",
    area: "Greater Riverton",
    role: "Emergency Coordinator",
    initials: "AM",
    badgeNumber: "EC-8842",
  });

  const [operational, setOperational] = useState<CoordinatorOperational>({
    autoRefresh: true,
    aiRecommendations: true,
    criticalAlerts: true,
    liveMap: true,
    defaultPriority: "High",
    refreshInterval: "30 seconds",
  });

  const [notifications, setNotifications] = useState<CoordinatorNotifications>({
    critical: true,
    ai: true,
    resources: true,
    shelters: true,
    partners: true,
    reports: true,
    email: true,
    browser: true,
  });

  const [sessions, setSessions] = useState<UserSession[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

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

  // Load settings on initial mount
  useEffect(() => {
    let isMounted = true;

    settingsService
      .getCoordinatorSettings()
      .then((data) => {
        if (!isMounted) return;
        if (data.profile) setProfile(data.profile);
        if (data.operational) setOperational(data.operational);
        if (data.notifications) setNotifications(data.notifications);
        if (data.sessions) setSessions(data.sessions);
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Failed to load settings from server. Using local defaults.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showSuccessBanner = (msg: string) => {
    setSavedMessage(msg);
    setErrorMessage(null);
    setTimeout(() => {
      setSavedMessage(null);
    }, 4000);
  };

  const showErrorBanner = (msg: string) => {
    setErrorMessage(msg);
    setSavedMessage(null);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (activeTab === "profile") {
        if (!profile.fullName.trim()) {
          showErrorBanner("Full name is required.");
          setIsSaving(false);
          return;
        }
        if (!profile.email.trim() || !profile.email.includes("@")) {
          showErrorBanner("A valid email address is required.");
          setIsSaving(false);
          return;
        }

        const updated = await settingsService.updateCoordinatorProfile(profile);
        setProfile(updated);
        showSuccessBanner("Profile updated successfully.");
      } else if (activeTab === "operational") {
        const updated = await settingsService.updateCoordinatorOperational(operational);
        setOperational(updated);
        showSuccessBanner("Operational preferences saved successfully.");
      } else if (activeTab === "notifications") {
        const updated = await settingsService.updateCoordinatorNotifications(notifications);
        setNotifications(updated);
        showSuccessBanner("Notification preferences updated successfully.");
      } else if (activeTab === "security") {
        if (!password.current || !password.newPassword || !password.confirm) {
          setPasswordFeedback({
            type: "error",
            message: "Please fill in current, new, and confirm password fields.",
          });
          setIsSaving(false);
          return;
        }

        if (password.newPassword.length < 6) {
          setPasswordFeedback({
            type: "error",
            message: "New password must be at least 6 characters.",
          });
          setIsSaving(false);
          return;
        }

        if (password.newPassword !== password.confirm) {
          setPasswordFeedback({
            type: "error",
            message: "New password and confirmation do not match.",
          });
          setIsSaving(false);
          return;
        }

        const result = await settingsService.changeCoordinatorPassword({
          currentPassword: password.current,
          newPassword: password.newPassword,
          confirmPassword: password.confirm,
        });

        if (result.success) {
          setPassword({ current: "", newPassword: "", confirm: "" });
          setPasswordFeedback({
            type: "success",
            message: result.message,
          });
          showSuccessBanner("Password changed successfully.");
        } else {
          setPasswordFeedback({
            type: "error",
            message: result.message,
          });
          showErrorBanner(result.message);
        }
      }
    } catch (err: any) {
      showErrorBanner(err.message || "An error occurred while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to terminate this login session?")) {
      return;
    }

    const success = await settingsService.revokeCoordinatorSession(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showSuccessBanner("Session revoked successfully.");
    } else {
      showErrorBanner("Could not revoke the session.");
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all coordinator settings to factory defaults?")) {
      return;
    }

    try {
      setIsSaving(true);
      const defaults = await settingsService.resetCoordinatorSettings();
      setProfile(defaults.profile);
      setOperational(defaults.operational);
      setNotifications(defaults.notifications);
      setSessions(defaults.sessions);
      setPasswordFeedback({ type: null, message: "" });
      showSuccessBanner("Settings reset to defaults successfully.");
    } catch {
      showErrorBanner("Failed to reset settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof CoordinatorNotifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleOperational = (key: keyof CoordinatorOperational) => {
    setOperational((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper for initials
  const initials = profile.initials || (profile.fullName
    ? profile.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AM");

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Settings
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage coordinator profile, operational preferences, notifications, and security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-[#d4e2e9] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#153f5e] shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Reset to default settings"
          >
            <RotateCcw size={14} className={isSaving ? "animate-spin" : ""} />
            <span>Reset defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#216789] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </div>

      {/* Success Message Banner */}
      {savedMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 shadow-sm animate-fade-in">
          <CheckCircle2 size={17} className="shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 shadow-sm">
          <AlertCircle size={17} className="shrink-0" />
          <span>{errorMessage}</span>
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
                  setSavedMessage(null);
                  setErrorMessage(null);
                  setPasswordFeedback({ type: null, message: "" });
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left transition ${
                  active
                    ? "bg-[#e7f1f6] text-[#287da5] font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#287da5]"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-[11px] font-medium">
                  {tab.label}
                </span>
                <ChevronRight
                  size={16}
                  className={active ? "text-[#287da5]" : "text-slate-400"}
                />
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="min-w-0 rounded-xl border border-[#d4e2e9] bg-white p-5 shadow-sm sm:p-6">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin text-[#287da5]" />
              <p className="text-xs">Loading settings...</p>
            </div>
          ) : (
            <>
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
                        className="w-full rounded-lg border border-[#d4e2e9] bg-white px-3 py-3 text-xs text-[#153f5e] outline-none focus:border-[#287da5] focus:ring-2 focus:ring-[#287da5]/10"
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
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#287da5] text-sm font-bold text-white shadow-sm">
                        {initials}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#153f5e]">
                          {profile.fullName || "Amina Mensah"}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {profile.role || "Emergency Coordinator"} · {profile.badgeNumber || "EC-8842"}
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
                      description="Automatically refresh operational information and dashboard stats."
                      checked={operational.autoRefresh}
                      onChange={() => toggleOperational("autoRefresh")}
                    />

                    <ToggleSetting
                      title="AI recommendations"
                      description="Show AI-assisted resource dispatch and decision recommendations."
                      checked={operational.aiRecommendations}
                      onChange={() => toggleOperational("aiRecommendations")}
                    />

                    <ToggleSetting
                      title="Critical alert monitoring"
                      description="Monitor critical and overdue assistance requests in real time."
                      checked={operational.criticalAlerts}
                      onChange={() => toggleOperational("criticalAlerts")}
                    />

                    <ToggleSetting
                      title="Live operations map"
                      description="Enable live operational map tracking with interactive incident markers."
                      checked={operational.liveMap}
                      onChange={() => toggleOperational("liveMap")}
                    />
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-medium text-[#153f5e]">
                        Default priority filter
                      </label>

                      <select
                        value={operational.defaultPriority}
                        onChange={(e) =>
                          setOperational({
                            ...operational,
                            defaultPriority: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-[#d4e2e9] bg-white px-3 py-3 text-xs text-[#153f5e] outline-none focus:border-[#287da5] focus:ring-2 focus:ring-[#287da5]/10"
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
                        className="w-full rounded-lg border border-[#d4e2e9] bg-white px-3 py-3 text-xs text-[#153f5e] outline-none focus:border-[#287da5] focus:ring-2 focus:ring-[#287da5]/10"
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

                  <div className="space-y-1">
                    <ToggleSetting
                      title="Email notifications"
                      description="Receive operational updates through email."
                      checked={notifications.email}
                      onChange={() => toggleNotification("email")}
                    />

                    <ToggleSetting
                      title="Browser notifications"
                      description="Receive instant audio/visual notifications through your browser."
                      checked={notifications.browser}
                      onChange={() => toggleNotification("browser")}
                    />
                  </div>
                </div>
              )}

              {/* SECURITY & SESSIONS */}
              {activeTab === "security" && (
                <div>
                  <SectionHeading
                    title="Security & Sessions"
                    description="Manage your account password and active login sessions."
                  />

                  {passwordFeedback.message && (
                    <div
                      className={`mb-5 flex items-center gap-2 rounded-lg border p-3 text-xs ${
                        passwordFeedback.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {passwordFeedback.type === "success" ? (
                        <CheckCircle2 size={16} className="shrink-0" />
                      ) : (
                        <AlertCircle size={16} className="shrink-0" />
                      )}
                      <span>{passwordFeedback.message}</span>
                    </div>
                  )}

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
                        placeholder="Enter current password (default: Coordinator@123)"
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
                        placeholder="At least 6 characters"
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
                        placeholder="Re-enter new password"
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

                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor size={17} className="text-[#287da5]" />
                      <h3 className="text-xs font-semibold text-[#153f5e]">
                        Active sessions
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {sessions.length} active device{sessions.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onRevoke={() => handleRevokeSession(session.id)}
                      />
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg bg-[#f1f6f8] p-4">
                    <div className="flex items-center gap-2 text-[#287da5]">
                      <ShieldCheck size={18} />
                      <span className="text-xs font-semibold">
                        Account security
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-slate-500">
                      Two-factor authentication is active on this account. Always use a strong password and avoid sharing your account credentials with other users.
                    </p>
                  </div>
                </div>
              )}
            </>
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
  placeholder,
  onChange,
  visible,
  toggle,
}: {
  label: string;
  value: string;
  placeholder?: string;
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
          placeholder={placeholder || "Enter password"}
          className="w-full rounded-lg border border-[#d4e2e9] px-3 py-3 pr-11 text-xs outline-none focus:border-[#287da5] focus:ring-2 focus:ring-[#287da5]/10"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* Active Session Card */

function SessionCard({
  session,
  onRevoke,
}: {
  session: UserSession;
  onRevoke?: () => void;
}) {
  const isMobile =
    session.deviceType === "mobile" ||
    session.title.toLowerCase().includes("mobile") ||
    session.title.toLowerCase().includes("phone");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce7ec] p-4 transition hover:border-[#b8d6e3]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f2f7] text-[#287da5]">
          {isMobile ? <Smartphone size={19} /> : <Monitor size={19} />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-[#153f5e]">
              {session.title}
            </p>
            {session.current && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
                Current
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] text-slate-500">
            {session.description}
            {session.ipAddress && ` · IP: ${session.ipAddress}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-400">
          {session.time}
        </span>

        {!session.current && onRevoke && (
          <button
            type="button"
            onClick={onRevoke}
            className="flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[10px] font-medium text-rose-600 transition hover:bg-rose-50"
            title="Terminate session"
          >
            <Trash2 size={12} />
            <span>Revoke</span>
          </button>
        )}
      </div>
    </div>
  );
}
