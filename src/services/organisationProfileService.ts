/**
 * Organisation Profile Service
 * Connects the Partner Officer Organisation Profile page to the CareLink .NET backend.
 */

export interface OrganisationVerificationItem {
  title: string;
  subtitle: string;
  status: string;
  done: boolean;
  dueDate?: string | null;
}

export interface CapabilityMetric {
  title: string;
  value: string;
  subtitle: string;
  totalCount: number;
  activeCount: number;
}

export interface OrganisationCapabilities {
  personnel: CapabilityMetric;
  fleet: CapabilityMetric;
  stock: CapabilityMetric;
  coverage: CapabilityMetric;
}

export interface OrganisationProfile {
  id: string;
  name: string;
  legalName: string;
  registrationNumber: string;
  type: string;
  registeredDate: string;
  status: string;
  verification: string;
  headOffice: string;
  primaryContact: string;
  contactEmail: string;
  emergencyLine: string;
  website: string;
  profileCompleteness: number;
  completenessReviewItems: number;
  sectors: string[];
  verifications: OrganisationVerificationItem[];
  capabilities: OrganisationCapabilities;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  legalName?: string;
  registrationNumber?: string;
  type?: string;
  headOffice?: string;
  primaryContact?: string;
  contactEmail?: string;
  emergencyLine?: string;
  website?: string;
  sectors?: string[];
}

export interface UpdateCapabilitiesPayload {
  personnelActive?: number;
  personnelDeployable?: number;
  fleetTotal?: number;
  fleetAvailable?: number;
  stockCategories?: number;
  stockAvailabilityPercent?: number;
  coverageTotalDistricts?: number;
  coverageActiveDistricts?: number;
}

const API_BASE_URL = "/api/organisation-profile";

const FALLBACK_PROFILE: OrganisationProfile = {
  id: "ORG-027",
  name: "Global Relief Network",
  legalName: "Global Relief Network International",
  registrationNumber: "NGO-2011-0482",
  type: "International NGO",
  registeredDate: "18 March 2011",
  status: "Active",
  verification: "Verified",
  headOffice: "Central Ward, Greater Riverton",
  primaryContact: "Sara Khan - Partner Officer",
  contactEmail: "sara@globalrelief.org",
  emergencyLine: "+94 11 555 0142",
  website: "https://globalrelief.org",
  profileCompleteness: 94,
  completenessReviewItems: 2,
  sectors: ["Food Security", "WASH", "Community Health", "Emergency Logistics"],
  verifications: [
    {
      title: "Organisation verification",
      subtitle: "Verified",
      status: "Current",
      done: true,
    },
    {
      title: "Data sharing agreement",
      subtitle: "Active · expires 18 Mar 2026",
      status: "Current",
      done: true,
    },
    {
      title: "Safeguarding attestation",
      subtitle: "Review due in 18 days",
      status: "Due Soon",
      done: false,
    },
    {
      title: "Banking verification",
      subtitle: "Verified",
      status: "Current",
      done: true,
    },
  ],
  capabilities: {
    personnel: {
      title: "Personnel",
      value: "84 active staff",
      subtitle: "62 deployable today",
      totalCount: 84,
      activeCount: 62,
    },
    fleet: {
      title: "Fleet",
      value: "18 vehicles",
      subtitle: "14 available",
      totalCount: 18,
      activeCount: 14,
    },
    stock: {
      title: "Stock",
      value: "8 resource categories",
      subtitle: "68% available",
      totalCount: 8,
      activeCount: 68,
    },
    coverage: {
      title: "Coverage",
      value: "6 districts",
      subtitle: "4 active now",
      totalCount: 6,
      activeCount: 4,
    },
  },
  updatedAt: new Date().toISOString(),
};

class OrganisationProfileService {
  async getProfile(): Promise<OrganisationProfile> {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Using fallback organisation profile:", err);
      return FALLBACK_PROFILE;
    }
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<OrganisationProfile> {
    const response = await fetch(API_BASE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateCapabilities(payload: UpdateCapabilitiesPayload): Promise<OrganisationProfile> {
    const response = await fetch(`${API_BASE_URL}/capabilities`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update capabilities: ${response.statusText}`);
    }

    return await response.json();
  }

  async resetProfile(): Promise<OrganisationProfile> {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to reset profile: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const organisationProfileService = new OrganisationProfileService();
