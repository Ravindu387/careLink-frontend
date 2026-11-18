
import { useState, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  ChevronRight,
  Users,
  House,
  Settings,
  Bell,
  Upload,
  Eye,
  EyeOff,
  Check,
  Save,
  X,
  Mail,
  Smartphone,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getProfile,
  updateProfile,
  getShelterSettings,
  updateShelterSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getNotificationSettings,
  updateNotificationSettings,
} from "../../services/settingsService";

import type {
  ProfileData,
  ShelterSettingsData,
  SecuritySettingsData,
  NotificationSettingsData,
} from "../../types/settings";

// ============================================
// TYPES
// ============================================

type SettingsTab = "profile" | "shelter" | "security" | "notifications";

type SecurityFormData = SecuritySettingsData & {
  confirmPassword: string;
};

// ============================================
// MAIN SETTINGS PAGE
// ============================================

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    role: "Shelter Administrator",
  });

  const [shelter, setShelter] = useState<ShelterSettingsData>({
    name: "",
    location: "",
    capacity: "",
    manager: "",
    address: "",
  });

  const [security, setSecurity] = useState<SecurityFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: true,
    loginAlerts: true,
  });

  const [notifications, setNotifications] = useState<NotificationSettingsData>(
    {
      inApp: true,
      email: true,
      sms: false,
      critical: true,
      requests: true,
      inventory: true,
      system: false,
    }
  );

  // ============================================
  // LOAD DATA
  // ============================================

  const loadTabData = useCallback(async (tab: SettingsTab) => {
    setLoading(true);
    setError("");
    try {
      if (tab === "profile") {
        const data = await getProfile();
        setProfile(data);
      } else if (tab === "shelter") {
        const data = await getShelterSettings();
        setShelter(data);
      } else if (tab === "security") {
        const data = await getSecuritySettings();
        setSecurity((prev) => ({
          ...prev,
          twoFactor: data.twoFactor,
          loginAlerts: data.loginAlerts,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else if (tab === "notifications") {
        const data = await getNotificationSettings();
        setNotifications(data);
      }
    } catch {
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  // ============================================
  // SAVE SETTINGS
  // ============================================

  const handleSave = async () => {
    setError("");

    if (
      activeTab === "security" &&
      security.newPassword &&
      security.newPassword !== security.confirmPassword
    ) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      if (activeTab === "profile") {
        const updated = await updateProfile(profile);
        setProfile(updated);
      } else if (activeTab === "shelter") {
        const updated = await updateShelterSettings(shelter);
        setShelter(updated);
      } else if (activeTab === "security") {
        await updateSecuritySettings({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
          twoFactor: security.twoFactor,
          loginAlerts: security.loginAlerts,
        });
        setSecurity((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else if (activeTab === "notifications") {
        const updated = await updateNotificationSettings(notifications);
        setNotifications(updated);
      }
      setSaved(true);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // SIDEBAR MENU
  // ============================================

  const menuItems: {
    id: SettingsTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "profile", label: "Profile Settings", icon: Users },
    { id: "shelter", label: "Shelter Settings", icon: House },
    { id: "security", label: "Security Settings", icon: Settings },
    { id: "notifications", label: "Notification Settings", icon: Bell },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-8 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[10px] mb-9">
          <span className="text-slate-500">CareLink</span>

          <ChevronRight size={12} className="text-slate-400" />

          <span className="text-slate-500">Shelter Administration</span>

          <ChevronRight size={12} className="text-slate-400" />

          <span className="font-semibold">Settings</span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">

          <div>
            <h1 className="text-[25px] font-normal">Settings</h1>

            <p className="text-xs text-slate-500 mt-1.5">
              Manage your profile, shelter configuration, security, and
              notifications.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="h-10 px-5 bg-[#1c638a] hover:bg-[#164d6d] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Saving…" : saved ? "Saved successfully" : "Save changes"}
          </button>
        </div>

        {/* ERROR BANNER */}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center gap-2 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => {
                setError("");
                loadTabData(activeTab);
              }}
              className="ml-auto text-red-500 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* SETTINGS LAYOUT */}

        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">

          {/* LEFT SIDEBAR */}

          <aside className="bg-white rounded-xl border border-[#d7e4e9] p-2 shadow-sm">

            <div className="flex md:flex-col gap-1 overflow-x-auto">

              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSaved(false);
                      setError("");
                    }}
                    className={`min-w-fit w-full h-[50px] px-3.5 flex items-center justify-between rounded-lg transition ${
                      active
                        ? "bg-[#e6f1f5] text-[#1c638a] font-semibold"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={19} />
                      <span className="text-[11px]">{item.label}</span>
                    </span>

                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT CONTENT */}

          <section className="bg-white rounded-xl border border-[#d7e4e9] shadow-sm p-5 md:p-6 min-h-[345px]">

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2
                  size={28}
                  className="animate-spin text-[#1c638a] opacity-60"
                />
              </div>
            ) : (
              <>
                {activeTab === "profile" && (
                  <ProfileSettings
                    profile={profile}
                    updateProfile={(key, value) =>
                      setProfile((prev) => ({ ...prev, [key]: value }))
                    }
                  />
                )}

                {activeTab === "shelter" && (
                  <ShelterSettings
                    shelter={shelter}
                    updateShelter={(key, value) =>
                      setShelter((prev) => ({ ...prev, [key]: value }))
                    }
                  />
                )}

                {activeTab === "security" && (
                  <SecuritySettings
                    security={security}
                    setSecurity={setSecurity}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                )}

                {activeTab === "notifications" && (
                  <NotificationSettings
                    notifications={notifications}
                    setNotifications={setNotifications}
                  />
                )}
              </>
            )}
          </section>
        </div>

        {/* SUCCESS TOAST */}

        {saved && (
          <div className="fixed bottom-5 right-5 bg-[#123e60] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs z-50">
            <Check size={16} className="text-[#35d3a5]" />
            Settings saved successfully.
            <button onClick={() => setSaved(false)} className="ml-2">
              <X size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================
// PROFILE SETTINGS
// ============================================

function ProfileSettings({
  profile,
  updateProfile,
}: {
  profile: ProfileData;
  updateProfile: (key: keyof ProfileData, value: string) => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Profile Settings"
        description="Update your profile settings for CareLink shelter operations."
      />

      <div className="border-t border-[#d7e4e9] pt-4 mt-5">

        {/* PROFILE PHOTO */}

        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1c638a] text-white flex items-center justify-center font-bold text-sm">
              SA
            </div>

            <div>
              <p className="text-xs font-semibold">Profile photo</p>

              <p className="text-[9px] text-slate-400 mt-1">
                JPG or PNG · maximum 2 MB
              </p>
            </div>
          </div>

          <label className="h-10 px-4 border border-[#aac4d2] rounded-lg flex items-center gap-2 text-xs font-semibold text-[#1c638a] hover:bg-slate-50 cursor-pointer">
            <Upload size={15} />
            Upload photo
            <input type="file" accept="image/png,image/jpeg" className="hidden" />
          </label>
        </div>

        {/* PROFILE FORM */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">

          <FormField
            label="Full name"
            value={profile.fullName}
            onChange={(v) => updateProfile("fullName", v)}
          />

          <FormField
            label="Email address"
            value={profile.email}
            onChange={(v) => updateProfile("email", v)}
            type="email"
          />

          <FormField
            label="Contact number"
            value={profile.phone}
            onChange={(v) => updateProfile("phone", v)}
          />

          <FormField
            label="Role"
            value={profile.role}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHELTER SETTINGS
// ============================================

function ShelterSettings({
  shelter,
  updateShelter,
}: {
  shelter: ShelterSettingsData;
  updateShelter: (key: keyof ShelterSettingsData, value: string) => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Shelter Settings"
        description="Manage your registered shelter information and operational configuration."
      />

      <div className="border-t border-slate-200 mt-5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

        <FormField
          label="Shelter name"
          value={shelter.name}
          onChange={(v) => updateShelter("name", v)}
        />

        <FormField
          label="District"
          value={shelter.location}
          onChange={(v) => updateShelter("location", v)}
        />

        <FormField
          label="Total capacity"
          value={shelter.capacity}
          onChange={(v) => updateShelter("capacity", v)}
          type="number"
        />

        <FormField
          label="Shelter manager"
          value={shelter.manager}
          onChange={(v) => updateShelter("manager", v)}
        />

        <div className="sm:col-span-2">
          <FormField
            label="Shelter address"
            value={shelter.address}
            onChange={(v) => updateShelter("address", v)}
          />
        </div>
      </div>

      <div className="mt-6 bg-[#eef8f5] rounded-lg p-4 flex items-start gap-3">
        <House size={18} className="text-[#35b48e]" />

        <div>
          <p className="text-xs font-semibold">Shelter configuration</p>

          <p className="text-[10px] text-slate-500 mt-1">
            Changes to shelter capacity should be verified by an authorised
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECURITY SETTINGS
// ============================================

function SecuritySettings({
  security,
  setSecurity,
  showPassword,
  setShowPassword,
}: {
  security: SecurityFormData;
  setSecurity: Dispatch<SetStateAction<SecurityFormData>>;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
  const passwordFields: {
    label: string;
    key: "currentPassword" | "newPassword" | "confirmPassword";
  }[] = [
    { label: "Current password", key: "currentPassword" },
    { label: "New password", key: "newPassword" },
    { label: "Confirm new password", key: "confirmPassword" },
  ];

  return (
    <div>
      <SectionHeading
        title="Security Settings"
        description="Manage your password, authentication, and account security."
      />

      <div className="border-t border-slate-200 mt-5 pt-5">

        <h3 className="text-xs font-semibold mb-4">Change password</h3>

        {passwordFields.map((field) => (
          <div key={field.key} className="mb-4">

            <label className="block text-[10px] font-semibold mb-2">
              {field.label}
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={security[field.key] ?? ""}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full h-10 border border-[#d7e4e9] rounded-lg px-3 pr-10 text-xs outline-none focus:border-[#35b48e]"
                placeholder={field.label}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}

        <div className="border-t border-slate-200 mt-6 pt-5">

          <h3 className="text-xs font-semibold mb-3">Account protection</h3>

          <ToggleRow
            label="Two-factor authentication"
            description="Require additional verification when signing in."
            checked={security.twoFactor}
            onChange={(v) =>
              setSecurity((prev) => ({ ...prev, twoFactor: v }))
            }
          />

          <ToggleRow
            label="Login alerts"
            description="Receive alerts when a new device accesses your account."
            checked={security.loginAlerts}
            onChange={(v) =>
              setSecurity((prev) => ({ ...prev, loginAlerts: v }))
            }
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================

function NotificationSettings({
  notifications,
  setNotifications,
}: {
  notifications: NotificationSettingsData;
  setNotifications: Dispatch<SetStateAction<NotificationSettingsData>>;
}) {
  const update = (key: keyof NotificationSettingsData, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const notificationOptions: {
    label: string;
    key: keyof NotificationSettingsData;
  }[] = [
    { label: "Critical alerts", key: "critical" },
    { label: "Accommodation requests", key: "requests" },
    { label: "Inventory updates", key: "inventory" },
    { label: "System updates", key: "system" },
  ];

  return (
    <div>
      <SectionHeading
        title="Notification Settings"
        description="Choose how you receive operational notifications and alerts."
      />

      <div className="border-t border-slate-200 mt-5 pt-5">

        {/* DELIVERY CHANNELS */}

        <h3 className="text-xs font-semibold mb-3">Delivery channels</h3>

        <ToggleRow
          icon={<Bell size={15} />}
          label="In-app notifications"
          description="Receive alerts inside your CareLink dashboard."
          checked={notifications.inApp}
          onChange={(v) => update("inApp", v)}
        />

        <ToggleRow
          icon={<Mail size={15} />}
          label="Email notifications"
          description="Receive operational updates by email."
          checked={notifications.email}
          onChange={(v) => update("email", v)}
        />

        <ToggleRow
          icon={<Smartphone size={15} />}
          label="SMS notifications"
          description="Receive important alerts through SMS."
          checked={notifications.sms}
          onChange={(v) => update("sms", v)}
        />

        {/* NOTIFICATION CATEGORIES */}

        <div className="border-t border-slate-200 mt-5 pt-5">

          <h3 className="text-xs font-semibold mb-3">
            Notification categories
          </h3>

          {notificationOptions.map((option) => (
            <ToggleRow
              key={option.key}
              label={option.label}
              checked={notifications[option.key]}
              onChange={(v) => update(option.key, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHARED SECTION HEADING
// ============================================

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-[15px] font-medium">{title}</h2>

      <p className="text-[10px] text-slate-500 mt-4">{description}</p>
    </div>
  );
}

// ============================================
// SHARED FORM FIELD
// ============================================

function FormField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold mb-2">{label}</label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[43px] border border-[#d7e4e9] rounded-lg px-3 text-[10px] outline-none focus:border-[#35b48e] disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}

// ============================================
// SHARED TOGGLE ROW
// ============================================

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-slate-100">

      <div className="flex items-center gap-2">

        {icon && <span className="text-[#287da7]">{icon}</span>}

        <div>
          <p className="text-[11px] font-medium">{label}</p>

          {description && (
            <p className="text-[9px] text-slate-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-[22px] rounded-full relative shrink-0 transition ${
          checked ? "bg-[#35b48e]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition ${
            checked ? "left-[21px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
