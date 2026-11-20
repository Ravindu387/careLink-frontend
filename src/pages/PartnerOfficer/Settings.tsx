import { useState, useEffect } from "react";
import {
  UserRound,
  Building2,
  Lock,
  Bell,
  ShieldCheck,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Share2,
  FileCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  settingsService,
  type PartnerProfile,
  type PartnerOrganisation,
  type PartnerSharing,
  type PartnerNotifications,
  type PartnerSecurity,
} from "../../services/settingsService";

type SettingsTab =
  | "Profile"
  | "Organisation Defaults"
  | "Data Sharing"
  | "Notifications"
  | "Security";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<PartnerProfile>({
    fullName: "Sara Khan",
    email: "sara@globalrelief.org",
    phone: "+94 77 412 8014",
    role: "Partner Officer",
  });

  const [organisation, setOrganisation] = useState<PartnerOrganisation>({
    name: "Global Relief Network",
    registration: "ORG-027",
    type: "International NGO",
    location: "Central Ward, Greater Riverton",
    timezone: "Asia/Colombo",
    language: "English",
    currency: "LKR",
  });

  const [sharing, setSharing] = useState<PartnerSharing>({
    referrals: true,
    resources: true,
    activities: true,
    reports: false,
    documents: true,
    publicProfile: true,
  });

  const [notifications, setNotifications] = useState<PartnerNotifications>({
    urgent: true,
    referrals: true,
    collaboration: true,
    resources: true,
    reports: true,
    team: false,
    email: true,
    push: true,
  });

  const [security, setSecurity] = useState<PartnerSecurity & {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: "30 minutes",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    text: string;
    isError?: boolean;
  }>({ text: "", isError: false });

  const tabs: {
    name: SettingsTab;
    icon: React.ReactNode;
  }[] = [
    { name: "Profile", icon: <UserRound size={17} /> },
    {
      name: "Organisation Defaults",
      icon: <Building2 size={17} />,
    },
    { name: "Data Sharing", icon: <Lock size={17} /> },
    { name: "Notifications", icon: <Bell size={17} /> },
    { name: "Security", icon: <ShieldCheck size={17} /> },
  ];

  useEffect(() => {
    let isMounted = true;

    settingsService
      .getPartnerSettings()
      .then((data) => {
        if (!isMounted) return;
        if (data.profile) setProfile(data.profile);
        if (data.organisation) setOrganisation(data.organisation);
        if (data.sharing) setSharing(data.sharing);
        if (data.notifications) setNotifications(data.notifications);
        if (data.security) {
          setSecurity((prev) => ({
            ...prev,
            twoFactor: data.security.twoFactor,
            loginAlerts: data.security.loginAlerts,
            sessionTimeout: data.security.sessionTimeout || "30 minutes",
          }));
        }
        setIsLiveBackend(true);
      })
      .catch(() => {
        if (isMounted) setIsLiveBackend(false);
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
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const showErrorBanner = (msg: string) => {
    setErrorMessage(msg);
    setSavedMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (activeTab === "Profile") {
        if (!profile.fullName.trim() || !profile.email.trim()) {
          showErrorBanner("Full name and email address are required.");
          setIsSaving(false);
          return;
        }
        const updated = await settingsService.updatePartnerProfile(profile);
        setProfile(updated);
        showSuccessBanner("Partner profile saved successfully.");
      } else if (activeTab === "Organisation Defaults") {
        if (!organisation.name.trim()) {
          showErrorBanner("Organisation name is required.");
          setIsSaving(false);
          return;
        }
        const updated = await settingsService.updatePartnerOrganisation(organisation);
        setOrganisation(updated);
        showSuccessBanner("Organisation defaults saved successfully.");
      } else if (activeTab === "Data Sharing") {
        const updated = await settingsService.updatePartnerSharing(sharing);
        setSharing(updated);
        showSuccessBanner("Data sharing preferences saved successfully.");
      } else if (activeTab === "Notifications") {
        const updated = await settingsService.updatePartnerNotifications(notifications);
        setNotifications(updated);
        showSuccessBanner("Notification preferences saved successfully.");
      } else if (activeTab === "Security") {
        const updated = await settingsService.updatePartnerSecurity({
          twoFactor: security.twoFactor,
          loginAlerts: security.loginAlerts,
          sessionTimeout: security.sessionTimeout,
        });
        setSecurity((prev) => ({
          ...prev,
          twoFactor: updated.twoFactor,
          loginAlerts: updated.loginAlerts,
          sessionTimeout: updated.sessionTimeout,
        }));
        showSuccessBanner("Security preferences saved successfully.");
      }
    } catch (err: any) {
      showErrorBanner(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMessage({ text: "", isError: false });

    if (
      !security.currentPassword ||
      !security.newPassword ||
      !security.confirmPassword
    ) {
      setPasswordMessage({
        text: "Please complete all password fields.",
        isError: true,
      });
      return;
    }

    if (security.newPassword.length < 6) {
      setPasswordMessage({
        text: "New password must contain at least 6 characters.",
        isError: true,
      });
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      setPasswordMessage({
        text: "New passwords do not match.",
        isError: true,
      });
      return;
    }

    try {
      const result = await settingsService.changePartnerPassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmPassword: security.confirmPassword,
      });

      if (result.success) {
        setPasswordMessage({
          text: result.message,
          isError: false,
        });
        setSecurity((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        showSuccessBanner("Password updated successfully.");
      } else {
        setPasswordMessage({
          text: result.message,
          isError: true,
        });
        showErrorBanner(result.message);
      }
    } catch (err: any) {
      setPasswordMessage({
        text: err.message || "Network error while changing password.",
        isError: true,
      });
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all Partner Officer settings to default values?")) {
      return;
    }

    try {
      setIsSaving(true);
      const defaults = await settingsService.resetPartnerSettings();
      setProfile(defaults.profile);
      setOrganisation(defaults.organisation);
      setSharing(defaults.sharing);
      setNotifications(defaults.notifications);
      setSecurity((prev) => ({
        ...prev,
        twoFactor: defaults.security.twoFactor,
        loginAlerts: defaults.security.loginAlerts,
        sessionTimeout: defaults.security.sessionTimeout,
      }));
      setPasswordMessage({ text: "", isError: false });
      showSuccessBanner("Partner settings reset to defaults successfully.");
    } catch {
      showErrorBanner("Failed to reset partner settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSharing = (key: keyof typeof sharing) => {
    setSharing((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateSecurity = (key: "twoFactor" | "loginAlerts") => {
    setSecurity((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Partner Coordination
              <span className="mx-2">›</span>
              <span className="font-semibold text-[#153e5b]">Settings</span>
            </p>

            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isLiveBackend
                  ? "bg-[#e5f6f0] text-[#299b7d]"
                  : "bg-[#fff4df] text-[#bd8229]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveBackend ? "bg-[#299b7d]" : "bg-[#bd8229]"
                }`}
              />
              {isLiveBackend ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#153e5b]">Settings</h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your profile, organisation defaults, sharing controls, notifications, and security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-[#d7e5eb] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#153e5b] shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Reset to defaults"
          >
            <RotateCcw size={14} className={isSaving ? "animate-spin" : ""} />
            <span>Reset defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1c668a] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 shadow-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[245px_minmax(0,1fr)]">
        {/* Settings Sidebar */}
        <div className="rounded-xl border border-[#d7e5eb] bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSavedMessage(null);
                setErrorMessage(null);
              }}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-xs transition ${
                activeTab === tab.name
                  ? "bg-[#e7f0f5] font-semibold text-[#267ba4]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#153e5b]"
              }`}
            >
              <span className="flex items-center gap-3">
                {tab.icon}
                {tab.name}
              </span>

              <ChevronRight size={16} />
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="min-w-0 rounded-xl border border-[#d7e5eb] bg-white p-5 shadow-sm md:p-6">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin text-[#267ba4]" />
              <p className="text-xs">Loading partner settings...</p>
            </div>
          ) : (
            <>
              {/* PROFILE */}
              {activeTab === "Profile" && (
                <div>
                  <SectionHeader
                    title="Profile"
                    description="Configure your profile for your Partner Officer workspace."
                  />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InputField
                      label="Full name"
                      value={profile.fullName}
                      onChange={(value) =>
                        setProfile({ ...profile, fullName: value })
                      }
                    />

                    <InputField
                      label="Email address"
                      value={profile.email}
                      type="email"
                      onChange={(value) =>
                        setProfile({ ...profile, email: value })
                      }
                    />

                    <InputField
                      label="Contact number"
                      value={profile.phone}
                      onChange={(value) =>
                        setProfile({ ...profile, phone: value })
                      }
                    />

                    <SelectField
                      label="Primary role"
                      value={profile.role}
                      options={[
                        "Partner Officer",
                        "Organisation Administrator",
                        "Programme Manager",
                        "Field Coordinator",
                      ]}
                      onChange={(value) =>
                        setProfile({ ...profile, role: value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* ORGANISATION DEFAULTS */}
              {activeTab === "Organisation Defaults" && (
                <div>
                  <SectionHeader
                    title="Organisation Defaults"
                    description="Manage your organisation's default information and regional preferences."
                  />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InputField
                      label="Organisation name"
                      value={organisation.name}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          name: value,
                        })
                      }
                    />

                    <InputField
                      label="Organisation ID"
                      value={organisation.registration}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          registration: value,
                        })
                      }
                    />

                    <SelectField
                      label="Organisation type"
                      value={organisation.type}
                      options={[
                        "International NGO",
                        "Local NGO",
                        "Government Agency",
                        "Private Organisation",
                        "Community Organisation",
                      ]}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          type: value,
                        })
                      }
                    />

                    <InputField
                      label="Head office location"
                      value={organisation.location}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          location: value,
                        })
                      }
                    />

                    <SelectField
                      label="Timezone"
                      value={organisation.timezone}
                      options={[
                        "Asia/Colombo",
                        "Asia/Dubai",
                        "Asia/Kolkata",
                        "UTC",
                      ]}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          timezone: value,
                        })
                      }
                    />

                    <SelectField
                      label="Default language"
                      value={organisation.language}
                      options={[
                        "English",
                        "Sinhala",
                        "Tamil",
                      ]}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          language: value,
                        })
                      }
                    />

                    <SelectField
                      label="Default currency"
                      value={organisation.currency}
                      options={["LKR", "USD", "EUR", "GBP"]}
                      onChange={(value) =>
                        setOrganisation({
                          ...organisation,
                          currency: value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* DATA SHARING */}
              {activeTab === "Data Sharing" && (
                <div>
                  <SectionHeader
                    title="Data Sharing"
                    description="Control what information your organisation shares with authorised coordination partners."
                  />

                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#d7e5eb] bg-[#f5f9fb] p-4">
                    <ShieldCheck
                      size={20}
                      className="shrink-0 text-[#267ba4]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#153e5b]">
                        Authorised data sharing
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Personal and sensitive information must only be shared with authorised users according to your organisation's data-sharing agreements.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <ToggleRow
                      icon={<FileCheck size={17} />}
                      title="Assistance referrals"
                      description="Share authorised assistance referral information."
                      checked={sharing.referrals}
                      onChange={() => updateSharing("referrals")}
                    />

                    <ToggleRow
                      icon={<Share2 size={17} />}
                      title="Resource commitments"
                      description="Share resource availability and delivery information."
                      checked={sharing.resources}
                      onChange={() => updateSharing("resources")}
                    />

                    <ToggleRow
                      icon={<Building2 size={17} />}
                      title="Field activities"
                      description="Share operational activity and field progress."
                      checked={sharing.activities}
                      onChange={() => updateSharing("activities")}
                    />

                    <ToggleRow
                      icon={<FileCheck size={17} />}
                      title="Reports and analytics"
                      description="Allow authorised partners to access shared reports."
                      checked={sharing.reports}
                      onChange={() => updateSharing("reports")}
                    />

                    <ToggleRow
                      icon={<FileCheck size={17} />}
                      title="Shared documents"
                      description="Allow access to approved organisational documents."
                      checked={sharing.documents}
                      onChange={() => updateSharing("documents")}
                    />

                    <ToggleRow
                      icon={<Globe size={17} />}
                      title="Public organisation profile"
                      description="Make approved organisation information visible publicly."
                      checked={sharing.publicProfile}
                      onChange={() => updateSharing("publicProfile")}
                    />
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === "Notifications" && (
                <div>
                  <SectionHeader
                    title="Notifications"
                    description="Choose which updates and alerts you want to receive."
                  />

                  <h3 className="mb-3 text-xs font-semibold text-[#153e5b]">
                    Notification categories
                  </h3>

                  <div className="space-y-1">
                    <ToggleRow
                      title="Urgent alerts"
                      description="Critical referrals and emergency alerts."
                      checked={notifications.urgent}
                      onChange={() => updateNotification("urgent")}
                    />

                    <ToggleRow
                      title="Assistance referrals"
                      description="New referrals and response updates."
                      checked={notifications.referrals}
                      onChange={() => updateNotification("referrals")}
                    />

                    <ToggleRow
                      title="Collaboration requests"
                      description="New partner collaboration requests."
                      checked={notifications.collaboration}
                      onChange={() => updateNotification("collaboration")}
                    />

                    <ToggleRow
                      title="Resource sharing"
                      description="Resource commitments and delivery updates."
                      checked={notifications.resources}
                      onChange={() => updateNotification("resources")}
                    />

                    <ToggleRow
                      title="Reporting deadlines"
                      description="Upcoming reporting deadlines and reminders."
                      checked={notifications.reports}
                      onChange={() => updateNotification("reports")}
                    />

                    <ToggleRow
                      title="Team activities"
                      description="Field team updates and check-ins."
                      checked={notifications.team}
                      onChange={() => updateNotification("team")}
                    />
                  </div>

                  <div className="my-5 border-t border-slate-100" />

                  <h3 className="mb-3 text-xs font-semibold text-[#153e5b]">
                    Delivery preferences
                  </h3>

                  <ToggleRow
                    icon={<Mail size={17} />}
                    title="Email notifications"
                    description="Receive notifications through your registered email."
                    checked={notifications.email}
                    onChange={() => updateNotification("email")}
                  />

                  <ToggleRow
                    icon={<Bell size={17} />}
                    title="Push notifications"
                    description="Receive browser push notifications."
                    checked={notifications.push}
                    onChange={() => updateNotification("push")}
                  />
                </div>
              )}

              {/* SECURITY */}
              {activeTab === "Security" && (
                <div>
                  <SectionHeader
                    title="Security"
                    description="Manage your account security, authentication, and password settings."
                  />

                  <div className="mb-5 space-y-1">
                    <ToggleRow
                      icon={<ShieldCheck size={17} />}
                      title="Two-factor authentication"
                      description="Require an additional verification step when signing in."
                      checked={security.twoFactor}
                      onChange={() => updateSecurity("twoFactor")}
                    />

                    <ToggleRow
                      icon={<Bell size={17} />}
                      title="Login alerts"
                      description="Receive alerts when a new login is detected."
                      checked={security.loginAlerts}
                      onChange={() => updateSecurity("loginAlerts")}
                    />
                  </div>

                  <div className="mb-6 border-t border-slate-100 pt-5">
                    <h3 className="mb-3 text-xs font-semibold text-[#153e5b]">
                      Session settings
                    </h3>

                    <SelectField
                      label="Automatic session timeout"
                      value={security.sessionTimeout}
                      options={[
                        "15 minutes",
                        "30 minutes",
                        "1 hour",
                        "2 hours",
                      ]}
                      onChange={(value) =>
                        setSecurity({
                          ...security,
                          sessionTimeout: value,
                        })
                      }
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="mb-1 text-xs font-semibold text-[#153e5b]">
                      Change password
                    </h3>

                    <p className="mb-4 text-[10px] text-slate-500">
                      Choose a strong password with at least 6 characters. Default is Partner@123.
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <PasswordField
                        label="Current password"
                        value={security.currentPassword}
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        onChange={(value) =>
                          setSecurity({
                            ...security,
                            currentPassword: value as any,
                          })
                        }
                      />

                      <PasswordField
                        label="New password"
                        value={security.newPassword}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        onChange={(value) =>
                          setSecurity({
                            ...security,
                            newPassword: value as any,
                          })
                        }
                      />

                      <PasswordField
                        label="Confirm new password"
                        value={security.confirmPassword}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        onChange={(value) =>
                          setSecurity({
                            ...security,
                            confirmPassword: value as any,
                          })
                        }
                      />
                    </div>

                    {passwordMessage.text && (
                      <p
                        className={`mt-3 rounded-lg p-3 text-xs ${
                          passwordMessage.isError
                            ? "border border-rose-200 bg-rose-50 text-rose-700"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {passwordMessage.text}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      className="mt-4 rounded-lg border border-[#267ba4] px-4 py-2.5 text-xs font-medium text-[#267ba4] transition hover:bg-[#eff7fa]"
                    >
                      Update password
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Section Header
function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 border-b border-[#d7e5eb] pb-4">
      <h2 className="text-sm font-semibold text-[#153e5b]">
        {title}
      </h2>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>
    </div>
  );
}

// Input Field
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
      <label className="mb-2 block text-[10px] font-medium text-[#153e5b]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs outline-none transition focus:border-[#267ba4] focus:ring-2 focus:ring-[#267ba4]/10"
      />
    </div>
  );
}

// Select Field
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium text-[#153e5b]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs outline-none transition focus:border-[#267ba4] focus:ring-2 focus:ring-[#267ba4]/10"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// Toggle Row
function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div className="hidden text-[#267ba4] sm:block">
            {icon}
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-[#153e5b]">
            {title}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-[#267ba4]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// Password Field
function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium text-[#153e5b]">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 pr-10 text-xs outline-none focus:border-[#267ba4] focus:ring-2 focus:ring-[#267ba4]/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default Settings;
