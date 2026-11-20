import React, { useState } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  User,
  Filter,
  Settings as SettingsIcon,
  Shield,
  Camera,
  Upload,
  Check,
  Clock,
  Monitor,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Save,
  X,
  Mail,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

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

// ==========================================
// TOGGLE COMPONENT
// ==========================================

const Toggle: React.FC<ToggleProps> = ({
  title,
  description,
  enabled,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e5edf2] py-5 last:border-0">

      <div>
        <h4 className="text-xs font-semibold text-[#173e5b]">
          {title}
        </h4>

        <p className="mt-1 text-[10px] text-slate-400">
          {description}
        </p>
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

// ==========================================
// MAIN COMPONENT
// ==========================================

const Settings: React.FC = () => {

  // Active Tab
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("Profile");

  // Profile States
  const [fullName, setFullName] =
    useState("Amina Mensah");

  const [email, setEmail] =
    useState("amina@response.org");

  const [phone, setPhone] =
    useState("+94 77 412 8041");

  const [area, setArea] =
    useState("Greater Riverton");

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  // Queue Preferences
  const [defaultPriority, setDefaultPriority] =
    useState("All priorities");

  const [defaultCategory, setDefaultCategory] =
    useState("All categories");

  const [defaultStatus, setDefaultStatus] =
    useState("All statuses");

  const [autoRefresh, setAutoRefresh] =
    useState(true);

  const [showCriticalFirst, setShowCriticalFirst] =
    useState(true);

  const [showMyCasesOnly, setShowMyCasesOnly] =
    useState(false);

  // Notification Preferences
  const [inAppNotifications, setInAppNotifications] =
    useState(true);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [criticalAlerts, setCriticalAlerts] =
    useState(true);

  const [assignmentAlerts, setAssignmentAlerts] =
    useState(true);

  const [evidenceUpdates, setEvidenceUpdates] =
    useState(true);

  const [escalationAlerts, setEscalationAlerts] =
    useState(true);

  const [aiRecommendations, setAiRecommendations] =
    useState(false);

  // Security Preferences
  const [twoFactor, setTwoFactor] =
    useState(true);

  const [loginAlerts, setLoginAlerts] =
    useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  // Save Message
  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================
  // NAVIGATION TABS
  // ==========================================

  const tabs: {
    name: SettingsTab;
    icon: React.ReactNode;
  }[] = [
    {
      name: "Profile",
      icon: <User size={17} />,
    },
    {
      name: "Queue Preferences",
      icon: <Filter size={17} />,
    },
    {
      name: "Notification Preferences",
      icon: <Bell size={17} />,
    },
    {
      name: "Security & Sessions",
      icon: <SettingsIcon size={17} />,
    },
  ];

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  const handleSave = () => {

    const settingsData = {
      profile: {
        fullName,
        email,
        phone,
        area,
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
    };

    localStorage.setItem(
      "caseManagerSettings",
      JSON.stringify(settingsData)
    );

    setSuccessMessage("Settings saved successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ==========================================
  // PROFILE IMAGE UPLOAD
  // ==========================================

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSuccessMessage("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSuccessMessage("Image size must be below 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordChange = () => {

    if (!currentPassword || !newPassword) {
      setSuccessMessage("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setSuccessMessage("New password must contain at least 8 characters.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");

    setSuccessMessage("Password change request submitted.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ==========================================
  // LOGOUT SESSION
  // ==========================================

  const handleLogoutSession = (device: string) => {

    setSuccessMessage(`${device} session logout requested.`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ==========================================
  // INPUT STYLE
  // ==========================================

  const inputStyle =
    "w-full rounded-lg border border-[#d5e2eb] bg-white px-3 py-3 text-[11px] text-[#173e5b] outline-none transition focus:border-[#287da8] focus:ring-2 focus:ring-sky-100";

  const labelStyle =
    "mb-2 block text-[10px] font-medium text-[#173e5b]";

  // ==========================================
  // JSX
  // ==========================================

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-7">

        {/* BREADCRUMB */}

        <div className="mb-7 flex items-center gap-2 text-[10px] text-slate-400">

          <span>Operations</span>

          <ChevronRight size={12} />

          <span>Case Management</span>

          <ChevronRight size={12} />

          <span className="font-semibold text-[#173e5b]">
            Settings
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-2xl font-medium tracking-tight text-[#173e5b]">
              Settings
            </h1>

            <p className="mt-2 text-[11px] text-slate-500">
              Manage your case workspace, queue preferences, notifications, and security.
            </p>

          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#287da8] px-4 py-3 text-[11px] font-semibold text-white transition hover:bg-[#17678f]"
          >

            <Save size={14} />

            Save changes

          </button>

        </div>

        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {successMessage && (

          <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">

            <div className="flex items-center gap-2">

              <Check size={16} />

              {successMessage}

            </div>

            <button onClick={() => setSuccessMessage("")}>
              <X size={15} />
            </button>

          </div>

        )}

        {/* =====================================
            SETTINGS LAYOUT
        ===================================== */}

        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[245px_minmax(0,1fr)]">

          {/* =====================================
              LEFT SIDEBAR
          ===================================== */}

          <aside className="rounded-xl border border-[#d5e2eb] bg-white p-2 shadow-[0_5px_15px_rgba(30,64,90,0.04)]">

            <div className="grid grid-cols-2 gap-1 lg:grid-cols-1">

              {tabs.map((tab) => (

                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center justify-between gap-2 rounded-lg px-3 py-3.5 text-left transition ${
                    activeTab === tab.name
                      ? "bg-[#e7f1f7] font-semibold text-[#287da8]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {tab.icon}

                    <span className="text-[10px]">
                      {tab.name}
                    </span>

                  </div>

                  <ChevronRight
                    size={16}
                    className="shrink-0"
                  />

                </button>

              ))}

            </div>

          </aside>

          {/* =====================================
              RIGHT CONTENT
          ===================================== */}

          <section className="min-h-[285px] rounded-xl border border-[#d5e2eb] bg-white p-5 shadow-[0_5px_15px_rgba(30,64,90,0.04)] sm:p-6">

            {/* =================================
                PROFILE TAB
            ================================= */}

            {activeTab === "Profile" && (

              <div>

                <div className="mb-4 border-b border-[#d5e2eb] pb-4">

                  <h2 className="text-sm font-medium text-[#173e5b]">
                    Profile
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Configure profile for your Case Manager workspace.
                  </p>

                </div>

                {/* PROFILE PHOTO */}

                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#123e61] text-xs font-bold text-white">

                      {profileImage ? (

                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        "AM"

                      )}

                    </div>

                    <div>

                      <p className="text-[10px] font-semibold text-[#173e5b]">
                        Profile photo
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        JPG or PNG · maximum 2 MB
                      </p>

                    </div>

                  </div>

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-[10px] font-medium text-[#287da8] transition hover:bg-sky-50">

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

                {/* PROFILE FORM */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* FULL NAME */}

                  <div>

                    <label className={labelStyle}>
                      Full name
                    </label>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputStyle}
                      placeholder="Enter your full name"
                    />

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className={labelStyle}>
                      Email address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputStyle}
                      placeholder="Enter your email"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label className={labelStyle}>
                      Contact number
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputStyle}
                      placeholder="Enter contact number"
                    />

                  </div>

                  {/* OPERATIONAL AREA */}

                  <div>

                    <label className={labelStyle}>
                      Operational area
                    </label>

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

            {/* =================================
                QUEUE PREFERENCES TAB
            ================================= */}

            {activeTab === "Queue Preferences" && (

              <div>

                <div className="mb-5 border-b border-[#d5e2eb] pb-4">

                  <h2 className="text-sm font-medium text-[#173e5b]">
                    Queue Preferences
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Configure how cases are displayed and organised in your workspace.
                  </p>

                </div>

                <h3 className="mb-4 text-xs font-semibold text-[#173e5b]">
                  Default queue filters
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className={labelStyle}>
                      Default priority
                    </label>

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

                    <label className={labelStyle}>
                      Default category
                    </label>

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

                    <label className={labelStyle}>
                      Default case status
                    </label>

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

                  <h3 className="mb-2 text-xs font-semibold text-[#173e5b]">
                    Queue behaviour
                  </h3>

                  <Toggle
                    title="Automatic queue refresh"
                    description="Automatically refresh the case queue."
                    enabled={autoRefresh}
                    onChange={() => setAutoRefresh(!autoRefresh)}
                  />

                  <Toggle
                    title="Show critical cases first"
                    description="Display critical and urgent cases at the top."
                    enabled={showCriticalFirst}
                    onChange={() => setShowCriticalFirst(!showCriticalFirst)}
                  />

                  <Toggle
                    title="Show my assigned cases only"
                    description="Display only cases assigned to your account."
                    enabled={showMyCasesOnly}
                    onChange={() => setShowMyCasesOnly(!showMyCasesOnly)}
                  />

                </div>

              </div>

            )}

            {/* =================================
                NOTIFICATION PREFERENCES TAB
            ================================= */}

            {activeTab === "Notification Preferences" && (

              <div>

                <div className="mb-5 border-b border-[#d5e2eb] pb-4">

                  <h2 className="text-sm font-medium text-[#173e5b]">
                    Notification Preferences
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Choose how and when you receive case management notifications.
                  </p>

                </div>

                {/* DELIVERY CHANNELS */}

                <div className="mb-5">

                  <h3 className="mb-2 text-xs font-semibold text-[#173e5b]">
                    Delivery channels
                  </h3>

                  <Toggle
                    title="In-app notifications"
                    description="Receive alerts inside the platform."
                    enabled={inAppNotifications}
                    onChange={() => setInAppNotifications(!inAppNotifications)}
                  />

                  <Toggle
                    title="Email notifications"
                    description="Receive notifications through your registered email."
                    enabled={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />

                  <Toggle
                    title="Push notifications"
                    description="Receive browser and device notifications."
                    enabled={pushNotifications}
                    onChange={() => setPushNotifications(!pushNotifications)}
                  />

                </div>

                {/* NOTIFICATION TYPES */}

                <div className="border-t border-[#d5e2eb] pt-4">

                  <h3 className="mb-2 text-xs font-semibold text-[#173e5b]">
                    Notification types
                  </h3>

                  <Toggle
                    title="Critical case alerts"
                    description="Receive alerts about critical and overdue cases."
                    enabled={criticalAlerts}
                    onChange={() => setCriticalAlerts(!criticalAlerts)}
                  />

                  <Toggle
                    title="Case assignments"
                    description="Get notified when a new case is assigned to you."
                    enabled={assignmentAlerts}
                    onChange={() => setAssignmentAlerts(!assignmentAlerts)}
                  />

                  <Toggle
                    title="Evidence updates"
                    description="Receive updates when citizens submit new evidence."
                    enabled={evidenceUpdates}
                    onChange={() => setEvidenceUpdates(!evidenceUpdates)}
                  />

                  <Toggle
                    title="Escalation alerts"
                    description="Get notified when cases are escalated."
                    enabled={escalationAlerts}
                    onChange={() => setEscalationAlerts(!escalationAlerts)}
                  />

                  <Toggle
                    title="AI recommendations"
                    description="Receive updates when AI recommendations are ready."
                    enabled={aiRecommendations}
                    onChange={() => setAiRecommendations(!aiRecommendations)}
                  />

                </div>

              </div>

            )}

            {/* =================================
                SECURITY & SESSIONS TAB
            ================================= */}

            {activeTab === "Security & Sessions" && (

              <div>

                <div className="mb-5 border-b border-[#d5e2eb] pb-4">

                  <h2 className="text-sm font-medium text-[#173e5b]">
                    Security & Sessions
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Manage your account security and active sessions.
                  </p>

                </div>

                {/* SECURITY OPTIONS */}

                <div className="mb-5">

                  <h3 className="mb-2 text-xs font-semibold text-[#173e5b]">
                    Security settings
                  </h3>

                  <Toggle
                    title="Two-factor authentication"
                    description="Add an extra layer of security to your account."
                    enabled={twoFactor}
                    onChange={() => setTwoFactor(!twoFactor)}
                  />

                  <Toggle
                    title="Login alerts"
                    description="Receive alerts when a new device signs into your account."
                    enabled={loginAlerts}
                    onChange={() => setLoginAlerts(!loginAlerts)}
                  />

                </div>

                {/* CHANGE PASSWORD */}

                <div className="border-t border-[#d5e2eb] pt-5">

                  <h3 className="mb-4 text-xs font-semibold text-[#173e5b]">
                    Change password
                  </h3>

                  <div className="space-y-3">

                    <div>

                      <label className={labelStyle}>
                        Current password
                      </label>

                      <input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputStyle}
                        placeholder="Enter current password"
                      />

                    </div>

                    <div>

                      <label className={labelStyle}>
                        New password
                      </label>

                      <div className="relative">

                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`${inputStyle} pr-12`}
                          placeholder="Enter new password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >

                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}

                        </button>

                      </div>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Minimum 8 characters.
                      </p>

                    </div>

                    <button
                      onClick={handlePasswordChange}
                      className="rounded-lg bg-[#287da8] px-4 py-3 text-[10px] font-semibold text-white hover:bg-[#17678f]"
                    >
                      Update password
                    </button>

                  </div>

                </div>

                {/* ACTIVE SESSIONS */}

                <div className="mt-6 border-t border-[#d5e2eb] pt-5">

                  <h3 className="mb-4 text-xs font-semibold text-[#173e5b]">
                    Active sessions
                  </h3>

                  {/* CURRENT DEVICE */}

                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-[#d5e2eb] p-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-sky-50 p-2.5 text-sky-700">
                        <Monitor size={20} />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-[#173e5b]">
                          Windows · Chrome
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          Current device · Active now
                        </p>

                      </div>

                    </div>

                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                      Current
                    </span>

                  </div>

                  {/* OTHER DEVICE */}

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#d5e2eb] p-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                        <Smartphone size={20} />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-[#173e5b]">
                          Android · Chrome
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          Last active · 2 hours ago
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() => handleLogoutSession("Android")}
                      className="text-[10px] font-semibold text-red-500 hover:text-red-700"
                    >
                      Revoke
                    </button>

                  </div>

                </div>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>

  );
};

export default Settings;