import React, { useState, useEffect, useCallback } from "react";

import {
  ChevronRight,
  User,
  Filter,
  Settings as SettingsIcon,
  Bell,
  Upload,
  Check,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  X,
  RefreshCw,
  Server,
  RotateCcw,
} from "lucide-react";

import { caseManagerSettingsService } from "../../services/caseManagerSettingsService";
import type {
  CaseManagerSettingsDto,
  ActiveSession,
} from "../../types/caseManagerSettings";

type SettingsTab =
  | "Profile"
  | "Queue Preferences"
  | "Notification Preferences"
  | "Security & Sessions";

interface ToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({
  title,
  description,
  enabled,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e5edf2] py-4 last:border-0">
      <div>
        <h4 className="text-sm font-semibold text-[#173e5b]">{title}</h4>
        <p className="mt-0.5 text-[13px] text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-[#287da8]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

const Settings: React.FC = () => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("Profile");

  // Sync / Loading state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Profile States
  const [fullName, setFullName] = useState("Amina Mensah");
  const [email, setEmail] = useState("amina@response.org");
  const [phone, setPhone] = useState("+94 77 412 8041");
  const [area, setArea] = useState("Greater Riverton");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Queue Preferences
  const [defaultPriority, setDefaultPriority] = useState("All priorities");
  const [defaultCategory, setDefaultCategory] = useState("All categories");
  const [defaultStatus, setDefaultStatus] = useState("All statuses");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCriticalFirst, setShowCriticalFirst] = useState(true);
  const [showMyCasesOnly, setShowMyCasesOnly] = useState(false);

  // Notification Preferences
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [evidenceUpdates, setEvidenceUpdates] = useState(true);
  const [escalationAlerts, setEscalationAlerts] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(false);

  // Security Preferences
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Settings
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await caseManagerSettingsService.getSettings();
      const s = res.data;

      // Profile
      setFullName(s.profile.fullName);
      setEmail(s.profile.email);
      setPhone(s.profile.phone);
      setArea(s.profile.area);
      setProfileImage(s.profile.profileImage || null);

      // Queue
      setDefaultPriority(s.queue.defaultPriority);
      setDefaultCategory(s.queue.defaultCategory);
      setDefaultStatus(s.queue.defaultStatus);
      setAutoRefresh(s.queue.autoRefresh);
      setShowCriticalFirst(s.queue.showCriticalFirst);
      setShowMyCasesOnly(s.queue.showMyCasesOnly);

      // Notifications
      setInAppNotifications(s.notifications.inAppNotifications);
      setEmailNotifications(s.notifications.emailNotifications);
      setPushNotifications(s.notifications.pushNotifications);
      setCriticalAlerts(s.notifications.criticalAlerts);
      setAssignmentAlerts(s.notifications.assignmentAlerts);
      setEvidenceUpdates(s.notifications.evidenceUpdates);
      setEscalationAlerts(s.notifications.escalationAlerts);
      setAiRecommendations(s.notifications.aiRecommendations);

      // Security
      setTwoFactor(s.security.twoFactor);
      setLoginAlerts(s.security.loginAlerts);
      setActiveSessions(s.activeSessions || []);

      setIsLiveBackend(res.isLiveBackend);
    } catch (err) {
      console.error("Failed to load settings", err);
      showToast("Error connecting to settings service; running in demo mode.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save Settings
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload: CaseManagerSettingsDto = {
        profile: {
          fullName,
          email,
          phone,
          area,
          profileImage,
        },
        queue: {
          defaultPriority,
          defaultCategory,
          defaultStatus,
          autoRefresh,
          showCriticalFirst,
          showMyCasesOnly,
        },
        notifications: {
          inAppNotifications,
          emailNotifications,
          pushNotifications,
          criticalAlerts,
          assignmentAlerts,
          evidenceUpdates,
          escalationAlerts,
          aiRecommendations,
        },
        security: {
          twoFactor,
          loginAlerts,
        },
        activeSessions,
      };

      const res = await caseManagerSettingsService.updateSettings(payload);
      showToast(res.message);
      setIsLiveBackend(res.isLiveBackend);
    } catch (err) {
      console.error("Failed to save settings", err);
      showToast("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    const confirmReset = window.confirm("Reset all settings to default values?");
    if (!confirmReset) return;

    try {
      setIsSaving(true);
      const res = await caseManagerSettingsService.resetDefaults();
      showToast(res.message);
      loadData(true);
    } catch (err) {
      console.error("Reset failed", err);
      showToast("Failed to reset settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size must be below 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        showToast("Profile image loaded. Click 'Save changes' to persist.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Change Password
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      showToast("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      showToast("New password must contain at least 8 characters.");
      return;
    }

    try {
      const res = await caseManagerSettingsService.changePassword({
        currentPassword,
        newPassword,
      });
      showToast(res.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Password change failed", err);
      showToast("Error updating password.");
    }
  };

  // Revoke Session
  const handleLogoutSession = async (sessionId: string) => {
    try {
      const res = await caseManagerSettingsService.revokeSession(sessionId);
      showToast(res.message);
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId && s.device !== sessionId));
    } catch (err) {
      console.error("Revoke session failed", err);
      showToast("Failed to revoke session.");
    }
  };

  const tabs: {
    name: SettingsTab;
    icon: React.ReactNode;
  }[] = [
    { name: "Profile", icon: <User size={16} /> },
    { name: "Queue Preferences", icon: <Filter size={16} /> },
    { name: "Notification Preferences", icon: <Bell size={16} /> },
    { name: "Security & Sessions", icon: <SettingsIcon size={16} /> },
  ];

  const inputStyle =
    "w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-2.5 text-xs text-[#173e5b] outline-none transition focus:border-[#287da8] focus:ring-2 focus:ring-sky-100";

  const labelStyle = "mb-1.5 block text-xs font-medium text-[#173e5b]";

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-5 py-4 shadow-xl">
          <Check size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-7">
        {/* Breadcrumb & Live Sync Pill */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operations</span>
            <ChevronRight size={12} />
            <span>Case Management</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#173e5b]">Settings</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isLiveBackend
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Server size={12} className={isLiveBackend ? "text-emerald-600" : "text-amber-600"} />
              {isLiveBackend ? "Backend Live (Port 5277)" : "Demo Mode (Offline)"}
            </span>

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0df] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
              title="Refresh settings"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da8]" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">Settings</h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Manage your case workspace, queue preferences, notifications, and security protocols.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0df] bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Reset defaults
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17678f] disabled:opacity-50"
            >
              <Save size={15} />
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Left Sidebar */}
          <aside className="rounded-xl border border-[#d5e2eb] bg-white p-2.5 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            <div className="grid grid-cols-2 gap-1 lg:grid-cols-1">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center justify-between gap-2 rounded-lg px-3.5 py-3 text-left transition ${
                    activeTab === tab.name
                      ? "bg-[#e7f1f7] font-semibold text-[#287da8]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    <span className="text-xs">{tab.name}</span>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          </aside>

          {/* Right Content */}
          <section className="min-h-[350px] rounded-xl border border-[#d5e2eb] bg-white p-6 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
                <RefreshCw size={24} className="mb-2 animate-spin text-[#287da8]" />
                <span>Loading workspace settings...</span>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === "Profile" && (
                  <div>
                    <div className="mb-5 border-b border-[#d5e2eb] pb-3">
                      <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">Profile Details</h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Configure identity details for your Case Manager workspace.
                      </p>
                    </div>

                    {/* Profile Photo */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#123e61] text-sm font-bold text-white shadow-sm">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            "AM"
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#173e5b]">Profile photo</p>
                          <p className="mt-0.5 text-[13px] text-slate-400">JPG or PNG · maximum 2 MB</p>
                        </div>
                      </div>

                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-3.5 py-2 text-sm font-medium text-[#287da8] transition hover:bg-sky-50">
                        <Upload size={14} />
                        Upload photo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelStyle}>Full name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={inputStyle}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>Email address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputStyle}
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>Contact number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputStyle}
                          placeholder="Enter contact number"
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>Operational area</label>
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className={inputStyle}
                        >
                          <option>Greater Riverton</option>
                          <option>North Ward</option>
                          <option>South Ward</option>
                          <option>Eastbank</option>
                          <option>West District</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Queue Preferences Tab */}
                {activeTab === "Queue Preferences" && (
                  <div>
                    <div className="mb-5 border-b border-[#d5e2eb] pb-3">
                      <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">Queue Preferences</h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Configure default filters and ordering for your case queues.
                      </p>
                    </div>

                    <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-slate-500">
                      Default Queue Filters
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelStyle}>Default priority</label>
                        <select
                          value={defaultPriority}
                          onChange={(e) => setDefaultPriority(e.target.value)}
                          className={inputStyle}
                        >
                          <option>All priorities</option>
                          <option>Critical</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelStyle}>Default category</label>
                        <select
                          value={defaultCategory}
                          onChange={(e) => setDefaultCategory(e.target.value)}
                          className={inputStyle}
                        >
                          <option>All categories</option>
                          <option>Food & Water</option>
                          <option>Shelter</option>
                          <option>Medical</option>
                          <option>Transport</option>
                          <option>Accessibility</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelStyle}>Default case status</label>
                        <select
                          value={defaultStatus}
                          onChange={(e) => setDefaultStatus(e.target.value)}
                          className={inputStyle}
                        >
                          <option>All statuses</option>
                          <option>Submitted</option>
                          <option>Under Review</option>
                          <option>Verified</option>
                          <option>Assigned</option>
                          <option>In Progress</option>
                          <option>Escalated</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#d5e2eb] pt-4">
                      <h3 className="mb-2 text-base font-bold uppercase tracking-wider text-slate-500">
                        Queue Behaviour
                      </h3>

                      <Toggle
                        title="Automatic queue refresh"
                        description="Periodically check backend for new priority cases."
                        enabled={autoRefresh}
                        onChange={() => setAutoRefresh(!autoRefresh)}
                      />

                      <Toggle
                        title="Show critical cases first"
                        description="Automatically prioritize life-safety cases at the top of the queue."
                        enabled={showCriticalFirst}
                        onChange={() => setShowCriticalFirst(!showCriticalFirst)}
                      />

                      <Toggle
                        title="Show my assigned cases only"
                        description="Filter default views to display only cases assigned to you."
                        enabled={showMyCasesOnly}
                        onChange={() => setShowMyCasesOnly(!showMyCasesOnly)}
                      />
                    </div>
                  </div>
                )}

                {/* Notification Preferences Tab */}
                {activeTab === "Notification Preferences" && (
                  <div>
                    <div className="mb-5 border-b border-[#d5e2eb] pb-3">
                      <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">Notification Preferences</h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Choose how and when you receive case alerts across all communication channels.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h3 className="mb-2 text-base font-bold uppercase tracking-wider text-slate-500">
                        Delivery Channels
                      </h3>

                      <Toggle
                        title="In-app notifications"
                        description="Receive real-time alerts inside the platform banner."
                        enabled={inAppNotifications}
                        onChange={() => setInAppNotifications(!inAppNotifications)}
                      />

                      <Toggle
                        title="Email notifications"
                        description="Receive digest updates through your registered email."
                        enabled={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)}
                      />

                      <Toggle
                        title="Push notifications"
                        description="Receive device and browser push alerts."
                        enabled={pushNotifications}
                        onChange={() => setPushNotifications(!pushNotifications)}
                      />
                    </div>

                    <div className="border-t border-[#d5e2eb] pt-4">
                      <h3 className="mb-2 text-base font-bold uppercase tracking-wider text-slate-500">
                        Alert Categories
                      </h3>

                      <Toggle
                        title="Critical case alerts"
                        description="Receive immediate alerts for SLA-overdue critical cases."
                        enabled={criticalAlerts}
                        onChange={() => setCriticalAlerts(!criticalAlerts)}
                      />

                      <Toggle
                        title="Case assignments"
                        description="Get notified when a new humanitarian case is assigned to you."
                        enabled={assignmentAlerts}
                        onChange={() => setAssignmentAlerts(!assignmentAlerts)}
                      />

                      <Toggle
                        title="Evidence updates"
                        description="Receive updates when citizens upload new verification documents."
                        enabled={evidenceUpdates}
                        onChange={() => setEvidenceUpdates(!evidenceUpdates)}
                      />

                      <Toggle
                        title="Escalation alerts"
                        description="Get notified when cross-agency relief cases are escalated."
                        enabled={escalationAlerts}
                        onChange={() => setEscalationAlerts(!escalationAlerts)}
                      />

                      <Toggle
                        title="AI recommendations"
                        description="Receive suggestions when AI triage matching is ready."
                        enabled={aiRecommendations}
                        onChange={() => setAiRecommendations(!aiRecommendations)}
                      />
                    </div>
                  </div>
                )}

                {/* Security & Sessions Tab */}
                {activeTab === "Security & Sessions" && (
                  <div>
                    <div className="mb-5 border-b border-[#d5e2eb] pb-3">
                      <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">Security & Sessions</h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Manage multi-factor authentication, passwords, and active device sessions.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h3 className="mb-2 text-base font-bold uppercase tracking-wider text-slate-500">
                        Authentication Security
                      </h3>

                      <Toggle
                        title="Two-factor authentication (2FA)"
                        description="Require an authenticator app code during sign-in."
                        enabled={twoFactor}
                        onChange={() => setTwoFactor(!twoFactor)}
                      />

                      <Toggle
                        title="Login alerts"
                        description="Receive email alerts whenever a new device signs in."
                        enabled={loginAlerts}
                        onChange={() => setLoginAlerts(!loginAlerts)}
                      />
                    </div>

                    {/* Change Password */}
                    <div className="border-t border-[#d5e2eb] pt-5">
                      <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-slate-500">
                        Change Password
                      </h3>

                      <div className="max-w-md space-y-3">
                        <div>
                          <label className={labelStyle}>Current password</label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputStyle}
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <label className={labelStyle}>New password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className={`${inputStyle} pr-10`}
                              placeholder="Enter new password (min. 8 characters)"
                            />

                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          className="rounded-lg bg-[#287da8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17678f]"
                        >
                          Update password
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="mt-6 border-t border-[#d5e2eb] pt-5">
                      <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-slate-500">
                        Active Sessions
                      </h3>

                      <div className="space-y-3">
                        {activeSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[#d5e2eb] p-3.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                                {session.device.toLowerCase().includes("android") ||
                                session.device.toLowerCase().includes("phone") ? (
                                  <Smartphone size={18} />
                                ) : (
                                  <Monitor size={18} />
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-[#173e5b]">
                                  {session.device} · {session.browser}
                                </p>
                                <p className="text-[13px] text-slate-400">
                                  {session.location} · {session.lastActive}
                                </p>
                              </div>
                            </div>

                            {session.isCurrent ? (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Current
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleLogoutSession(session.id)}
                                className="text-sm font-semibold text-red-500 hover:text-red-700"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
