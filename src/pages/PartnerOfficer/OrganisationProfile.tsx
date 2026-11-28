import { useEffect, useState, type FormEvent } from "react";
import {
  Users,
  Truck,
  Package,
  Map,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  RefreshCw,
  Radio,
  X,
  Building2,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import {
  organisationProfileService,
  type OrganisationProfile as OrgProfileType,
  type UpdateProfilePayload,
  type UpdateCapabilitiesPayload,
} from "../../services/organisationProfileService";

const OrganisationProfile = () => {
  const [profile, setProfile] = useState<OrgProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCapabilityModal, setShowCapabilityModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfile = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }

    try {
      const data = await organisationProfileService.getProfile();
      setProfile(data);
      setIsConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.warn("Failed to load organisation profile from API:", err);
      setIsConnected(false);
      setError("Working with offline cached profile.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const data = await organisationProfileService.getProfile();
        if (isMounted) {
          setProfile(data);
          setIsConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Initial load from API failed:", err);
          setIsConnected(false);
          setError("Working with offline cached profile.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    setIsSubmitting(true);
    try {
      const updated = await organisationProfileService.updateProfile(payload);
      setProfile(updated);
      setShowEditModal(false);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      // Local optimistic update
      if (profile) {
        setProfile({
          ...profile,
          ...payload,
          sectors: payload.sectors || profile.sectors,
          updatedAt: new Date().toISOString(),
        });
      }
      setShowEditModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCapabilities = async (payload: UpdateCapabilitiesPayload) => {
    setIsSubmitting(true);
    try {
      const updated = await organisationProfileService.updateCapabilities(payload);
      setProfile(updated);
      setShowCapabilityModal(false);
    } catch (err: unknown) {
      console.error("Failed to update capabilities:", err);
      setShowCapabilityModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "GR";

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs text-slate-500">
              Partner Coordination <span className="mx-2">›</span>
              <span className="font-semibold text-slate-800">Organisation Profile</span>
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Radio size={10} className={isConnected ? "animate-pulse text-emerald-600" : "text-amber-600"} />
              {isConnected ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153e5b]">Organisation Profile</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage verified capability, operational coverage, contacts, and data-sharing status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadProfile(false)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2.5 text-sm font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
            title="Refresh profile data"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-[#267ba4]" : ""} />
            Sync
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Eye size={15} />
            Preview public profile
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c668a]"
          >
            <Edit size={15} />
            Edit profile
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <span>{error}</span>
          <button
            onClick={() => loadProfile(true)}
            className="font-semibold text-amber-900 underline hover:no-underline"
          >
            Retry Connection
          </button>
        </div>
      )}

      {isLoading && !profile ? (
        <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
          <RefreshCw size={20} className="animate-spin text-[#267ba4]" />
          <span className="text-sm">Loading organisation profile...</span>
        </div>
      ) : profile ? (
        <>
          {/* Organisation Summary */}
          <div className="mb-5 rounded-xl border border-[#d7e5eb] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#153e5b] text-xl font-bold text-white shadow-sm">
                  {initials}
                </div>

                <div>
                  <span className="inline-block rounded bg-[#e3f5f0] px-2 py-1 text-xs font-bold tracking-wide text-[#26977c]">
                    {profile.verification.toUpperCase()} PARTNER
                  </span>

                  <h2 className="mt-1.5 text-lg font-semibold text-[#153e5b]">
                    {profile.name}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {profile.type} · {profile.id} · Registered {profile.registeredDate}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {profile.sectors.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-[#edf4f7] px-2 py-1 text-xs font-medium text-[#42677e]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="w-full max-w-48 sm:text-right">
                <p className="text-xs font-medium text-slate-500">
                  PROFILE COMPLETENESS
                </p>

                <p className="mt-1 text-xl font-bold text-[#153e5b]">
                  {profile.profileCompleteness}%
                </p>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#60b89f] transition-all duration-500"
                    style={{ width: `${profile.profileCompleteness}%` }}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {profile.completenessReviewItems} items to review
                </p>
              </div>
            </div>
          </div>

          {/* Organisation Details + Verification */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Organisation Details */}
            <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#d7e5eb] px-4 py-3">
                <div>
                  <h3 className="text-base font-semibold text-[#153e5b]">
                    Organisation details
                  </h3>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    Verified legal and operational information
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-sm font-medium text-[#267ba4] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
                {[
                  ["Legal name", profile.legalName],
                  ["Registration number", profile.registrationNumber],
                  ["Organisation type", profile.type],
                  ["Head office", profile.headOffice],
                  ["Primary contact", profile.primaryContact],
                  ["Emergency line", profile.emergencyLine],
                  ["Contact email", profile.contactEmail],
                  ["Official website", profile.website],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[13px] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#183e58] break-words">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification & Agreements */}
            <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
              <div className="border-b border-[#d7e5eb] px-4 py-3">
                <h3 className="text-base font-semibold text-[#153e5b]">
                  Verification & Agreements
                </h3>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Partner assurance and sharing controls
                </p>
              </div>

              {profile.verifications.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 border-b border-[#d7e5eb] px-4 py-4 last:border-0"
                >
                  {item.done ? (
                    <CheckCircle2 className="shrink-0 text-[#55b99c]" size={17} />
                  ) : (
                    <Clock3 className="shrink-0 text-amber-500" size={17} />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#153e5b]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.subtitle}
                    </p>
                  </div>

                  <span
                    className={`min-w-24 rounded-md px-2 py-1 text-center text-xs font-medium ${
                      item.done
                        ? "bg-[#e3f5f0] text-[#26977c]"
                        : "bg-[#fff3dc] text-[#b7791f]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Capability */}
          <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7e5eb] px-4 py-3">
              <div>
                <h3 className="text-base font-semibold text-[#153e5b]">
                  Operational capability
                </h3>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Capacity visible to authorised coordination partners
                </p>
              </div>

              <button
                onClick={() => setShowCapabilityModal(true)}
                className="rounded-lg border border-[#b9d0dc] px-4 py-2 text-sm font-medium text-[#267ba4] hover:bg-[#f0f7fa] transition"
              >
                Update capability
              </button>
            </div>

            <div className="grid grid-cols-1 divide-y divide-[#d7e5eb] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
              {[
                {
                  title: profile.capabilities.personnel.title,
                  value: profile.capabilities.personnel.value,
                  sub: profile.capabilities.personnel.subtitle,
                  icon: Users,
                },
                {
                  title: profile.capabilities.fleet.title,
                  value: profile.capabilities.fleet.value,
                  sub: profile.capabilities.fleet.subtitle,
                  icon: Truck,
                },
                {
                  title: profile.capabilities.stock.title,
                  value: profile.capabilities.stock.value,
                  sub: profile.capabilities.stock.subtitle,
                  icon: Package,
                },
                {
                  title: profile.capabilities.coverage.title,
                  value: profile.capabilities.coverage.value,
                  sub: profile.capabilities.coverage.subtitle,
                  icon: Map,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 border-[#d7e5eb] p-4 lg:border-r last:border-r-0"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eaf3f8] text-[#2683b1]">
                      <Icon size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">{item.title}</p>
                      <p className="mt-1 text-sm font-bold text-[#153e5b]">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProfile}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Update Capability Modal */}
      {showCapabilityModal && profile && (
        <UpdateCapabilityModal
          profile={profile}
          onClose={() => setShowCapabilityModal(false)}
          onSubmit={handleUpdateCapabilities}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Preview Public Profile Modal */}
      {showPreviewModal && profile && (
        <PreviewProfileModal
          profile={profile}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

// Edit Profile Modal
function EditProfileModal({
  profile,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  profile: OrgProfileType;
  onClose: () => void;
  onSubmit: (payload: UpdateProfilePayload) => void;
  isSubmitting?: boolean;
}) {
  const [legalName, setLegalName] = useState(profile.legalName);
  const [headOffice, setHeadOffice] = useState(profile.headOffice);
  const [primaryContact, setPrimaryContact] = useState(profile.primaryContact);
  const [contactEmail, setContactEmail] = useState(profile.contactEmail);
  const [emergencyLine, setEmergencyLine] = useState(profile.emergencyLine);
  const [website, setWebsite] = useState(profile.website);
  const [sectorsStr, setSectorsStr] = useState(profile.sectors.join(", "));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sectors = sectorsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      legalName,
      headOffice,
      primaryContact,
      contactEmail,
      emergencyLine,
      website,
      sectors,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">Edit Organisation Profile</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Update legal information, primary contact, and operational sectors.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Legal Name</label>
            <input
              required
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Head Office</label>
              <input
                required
                value={headOffice}
                onChange={(e) => setHeadOffice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Primary Contact</label>
              <input
                required
                value={primaryContact}
                onChange={(e) => setPrimaryContact(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Contact Email</label>
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Emergency Line</label>
              <input
                required
                value={emergencyLine}
                onChange={(e) => setEmergencyLine(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Official Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Operational Sectors (comma-separated)
            </label>
            <input
              value={sectorsStr}
              onChange={(e) => setSectorsStr(e.target.value)}
              placeholder="e.g. Food Security, WASH, Community Health"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
          >
            {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

// Update Capability Modal
function UpdateCapabilityModal({
  profile,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  profile: OrgProfileType;
  onClose: () => void;
  onSubmit: (payload: UpdateCapabilitiesPayload) => void;
  isSubmitting?: boolean;
}) {
  const cap = profile.capabilities;
  const [personnelActive, setPersonnelActive] = useState(cap.personnel.totalCount);
  const [personnelDeployable, setPersonnelDeployable] = useState(cap.personnel.activeCount);
  const [fleetTotal, setFleetTotal] = useState(cap.fleet.totalCount);
  const [fleetAvailable, setFleetAvailable] = useState(cap.fleet.activeCount);
  const [stockCategories, setStockCategories] = useState(cap.stock.totalCount);
  const [stockAvailabilityPercent, setStockAvailabilityPercent] = useState(cap.stock.activeCount);
  const [coverageTotal, setCoverageTotal] = useState(cap.coverage.totalCount);
  const [coverageActive, setCoverageActive] = useState(cap.coverage.activeCount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      personnelActive: Number(personnelActive),
      personnelDeployable: Number(personnelDeployable),
      fleetTotal: Number(fleetTotal),
      fleetAvailable: Number(fleetAvailable),
      stockCategories: Number(stockCategories),
      stockAvailabilityPercent: Number(stockAvailabilityPercent),
      coverageTotalDistricts: Number(coverageTotal),
      coverageActiveDistricts: Number(coverageActive),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">Update Operational Capability</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Update staffing, fleet, supply stock, and coverage districts visible to coordination partners.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[#153e5b] mb-2 flex items-center gap-1.5">
              <Users size={15} /> Personnel Capacity
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-500">Total Active Staff</label>
                <input
                  type="number"
                  min="0"
                  value={personnelActive}
                  onChange={(e) => setPersonnelActive(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Deployable Today</label>
                <input
                  type="number"
                  min="0"
                  value={personnelDeployable}
                  onChange={(e) => setPersonnelDeployable(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[#153e5b] mb-2 flex items-center gap-1.5">
              <Truck size={15} /> Transport & Fleet
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-500">Total Fleet Vehicles</label>
                <input
                  type="number"
                  min="0"
                  value={fleetTotal}
                  onChange={(e) => setFleetTotal(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Available Vehicles</label>
                <input
                  type="number"
                  min="0"
                  value={fleetAvailable}
                  onChange={(e) => setFleetAvailable(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[#153e5b] mb-2 flex items-center gap-1.5">
              <Package size={15} /> Resource Stock
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-500">Resource Categories</label>
                <input
                  type="number"
                  min="0"
                  value={stockCategories}
                  onChange={(e) => setStockCategories(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Availability Percent (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stockAvailabilityPercent}
                  onChange={(e) => setStockAvailabilityPercent(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[#153e5b] mb-2 flex items-center gap-1.5">
              <Map size={15} /> Geographic Coverage
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-500">Total Districts</label>
                <input
                  type="number"
                  min="0"
                  value={coverageTotal}
                  onChange={(e) => setCoverageTotal(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Active Now</label>
                <input
                  type="number"
                  min="0"
                  value={coverageActive}
                  onChange={(e) => setCoverageActive(Number(e.target.value))}
                  className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm sm:text-[15px] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
          >
            {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
            Save Capabilities
          </button>
        </div>
      </form>
    </div>
  );
}

// Preview Public Profile Modal
function PreviewProfileModal({
  profile,
  onClose,
}: {
  profile: OrgProfileType;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-[#267ba4]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#153e5b]">Public Profile Preview</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 p-5 bg-[#fafcfd]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold border border-emerald-200">
                <ShieldCheck size={12} />
                VERIFIED PARTNER
              </span>
              <h3 className="text-lg font-bold text-[#153e5b] mt-1.5">{profile.name}</h3>
              <p className="text-xs text-slate-500">
                {profile.legalName} · {profile.registrationNumber}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#153e5b] flex items-center justify-center text-white font-bold text-base">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.sectors.map((s) => (
              <span
                key={s}
                className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={14} className="text-slate-400" />
              <span>{profile.headOffice}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail size={14} className="text-slate-400" />
              <span>{profile.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-slate-400" />
              <span>{profile.emergencyLine}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Globe size={14} className="text-slate-400" />
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#267ba4] underline flex items-center gap-1"
              >
                {profile.website}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-white border border-slate-200 p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Declared Operational Capacity
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-[#153e5b]">{profile.capabilities.personnel.totalCount}</p>
                <p className="text-xs text-slate-400">Staff</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#153e5b]">{profile.capabilities.fleet.totalCount}</p>
                <p className="text-xs text-slate-400">Fleet</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#153e5b]">{profile.capabilities.stock.activeCount}%</p>
                <p className="text-xs text-slate-400">Stock Avail</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#153e5b]">{profile.capabilities.coverage.activeCount}</p>
                <p className="text-xs text-slate-400">Districts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#267ba4] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c668a]"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganisationProfile;
