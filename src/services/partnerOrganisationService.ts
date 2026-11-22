/**
 * Partner Organisations Service
 * Connects the Emergency Coordinator Partner Organisations view to the CareLink .NET backend.
 */

export interface PartnerOrganisation {
  id: string;
  name: string;
  type: string;
  region: string;
  role: string;
  verification: "Verified" | "Pending" | "Rejected" | string;
  status: "Active" | "Inactive" | string;
  email: string;
  phone: string;
  contactPerson?: string | null;
  sharedResourcesCount: number;
  collaborationRequestsCount: number;
  address?: string | null;
  website?: string | null;
  notes?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
}

export interface PartnerOrganisationsMetrics {
  activePartnersCount: number;
  totalPartnersCount: number;
  sharedResourcesCount: number;
  collaborationRequestsCount: number;
  pendingCollaborationRequestsCount: number;
  verificationCoveragePercent: number;
  pendingVerificationReviewsCount: number;
  sectorsCount: number;
  lastUpdated: string;
}

export interface CreatePartnerPayload {
  name: string;
  type: string;
  region: string;
  role: string;
  email: string;
  phone: string;
  contactPerson?: string;
  address?: string;
  website?: string;
  notes?: string;
}

export interface UpdatePartnerPayload {
  name?: string;
  type?: string;
  region?: string;
  role?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  status?: string;
  verification?: string;
  address?: string;
  website?: string;
  notes?: string;
}

export interface PartnerFilterParams {
  search?: string;
  region?: string;
  status?: string;
  verification?: string;
  type?: string;
  role?: string;
}

const FALLBACK_METRICS: PartnerOrganisationsMetrics = {
  activePartnersCount: 48,
  totalPartnersCount: 50,
  sharedResourcesCount: 218,
  collaborationRequestsCount: 14,
  pendingCollaborationRequestsCount: 5,
  verificationCoveragePercent: 96,
  pendingVerificationReviewsCount: 2,
  sectorsCount: 6,
  lastUpdated: new Date().toISOString(),
};

const FALLBACK_PARTNERS: PartnerOrganisation[] = [
  {
    id: "ORG-001",
    name: "National Disaster Authority",
    type: "Government",
    region: "Greater Riverton",
    role: "Lead Coordinator",
    verification: "Verified",
    status: "Active",
    email: "contact@nda.org",
    phone: "+94 11 234 5678",
    contactPerson: "Director General K. Wickremasinghe",
    sharedResourcesCount: 42,
    collaborationRequestsCount: 4,
    address: "Command Complex, Central Ward, Riverton",
    website: "https://nda.gov.lk",
    notes: "Primary government disaster management authority with highest escalation authority.",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 55 * 86400000).toISOString(),
  },
  {
    id: "ORG-014",
    name: "CareLink Shelter Network",
    type: "Local NGO",
    region: "Central - North",
    role: "Shelter Operations",
    verification: "Verified",
    status: "Active",
    email: "info@carelink.org",
    phone: "+94 11 234 5679",
    contactPerson: "Sarah Perera",
    sharedResourcesCount: 36,
    collaborationRequestsCount: 3,
    address: "45 Lakeview Crescent, Riverton",
    website: "https://shelternetwork.carelink.org",
    notes: "Coordinates temporary shelters, evacuation centres, and bedding distribution.",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "ORG-027",
    name: "Global Relief Network",
    type: "International NGO",
    region: "4 districts",
    role: "Food - Medical",
    verification: "Verified",
    status: "Active",
    email: "support@globalrelief.org",
    phone: "+94 11 234 5680",
    contactPerson: "Marcus Vance",
    sharedResourcesCount: 32,
    collaborationRequestsCount: 2,
    address: "UN Humanitarian Hub, Riverton Port",
    website: "https://globalrelief.org",
    notes: "International logistics, emergency medical response, and field hospital kits.",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: "ORG-042",
    name: "Emergency Logistics Unit",
    type: "Government",
    region: "Central Region",
    role: "Transport - Warehousing",
    verification: "Verified",
    status: "Active",
    email: "logistics@example.org",
    phone: "+94 11 234 5681",
    contactPerson: "Major T. Silva",
    sharedResourcesCount: 20,
    collaborationRequestsCount: 2,
    address: "Warehouse Yard 4, Eastbank Industrial Zone",
    website: "https://elu.gov.lk",
    notes: "High-clearance transport trucks, mobile water bowsers, and regional depots.",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: "ORG-005",
    name: "Red Crescent Society - Riverton Chapter",
    type: "International NGO",
    region: "Greater Riverton",
    role: "Food - Medical",
    verification: "Verified",
    status: "Active",
    email: "riverton@redcrescent.org",
    phone: "+94 11 234 5682",
    contactPerson: "Dr. Amina Farooq",
    sharedResourcesCount: 18,
    collaborationRequestsCount: 1,
    address: "12 Crescent Way, Riverton",
    website: "https://redcrescent.org",
    notes: "Ambulance units, first aid supply chain, and emergency medical technicians.",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "ORG-008",
    name: "Civic Rescue Foundation",
    type: "Local NGO",
    region: "Eastbank",
    role: "Emergency Assistance",
    verification: "Verified",
    status: "Active",
    email: "team@civicrescue.org",
    phone: "+94 11 234 5683",
    contactPerson: "Rohan Jayawardena",
    sharedResourcesCount: 14,
    collaborationRequestsCount: 1,
    address: "88 Riverside Avenue, Eastbank",
    website: "https://civicrescue.lk",
    notes: "Flood boat rescue operations, swiftwater extraction, and drone scouting.",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "ORG-012",
    name: "Metro Community Kitchens",
    type: "Community Organisation",
    region: "Central Ward",
    role: "Food - Medical",
    verification: "Pending",
    status: "Active",
    email: "kitchens@metrocare.org",
    phone: "+94 11 234 5684",
    contactPerson: "Priya Gunasekera",
    sharedResourcesCount: 8,
    collaborationRequestsCount: 1,
    address: "Old Town Community Center, Central Ward",
    notes: "Hot meal preparation up to 4,000 rations daily. Food safety audit pending.",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    verifiedAt: null,
  },
  {
    id: "ORG-018",
    name: "Apex Telecom Disaster Wing",
    type: "Private Organisation",
    region: "Greater Riverton",
    role: "Transport - Warehousing",
    verification: "Verified",
    status: "Active",
    email: "disaster-ops@apextelecom.org",
    phone: "+94 11 234 5685",
    contactPerson: "Dinesh Bandara",
    sharedResourcesCount: 12,
    collaborationRequestsCount: 0,
    address: "Apex Tech Tower, Level 8, Riverton",
    website: "https://apextelecom.lk/emergency",
    notes: "Mobile satellite uplink vans, emergency Wi-Fi hubs, generator trailers.",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "ORG-023",
    name: "North District Shelter Collective",
    type: "Local NGO",
    region: "North Ward",
    role: "Shelter Operations",
    verification: "Verified",
    status: "Active",
    email: "shelters@northcollective.org",
    phone: "+94 11 234 5686",
    contactPerson: "Kamala Weerasinghe",
    sharedResourcesCount: 11,
    collaborationRequestsCount: 1,
    address: "Community Hall Complex, North Ward",
    notes: "Coordinates 5 temporary camps in schools and temples across North Ward.",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: "ORG-031",
    name: "Harbor Health Volunteer Corps",
    type: "Community Organisation",
    region: "Eastbank",
    role: "Emergency Assistance",
    verification: "Pending",
    status: "Active",
    email: "volunteer@harborhealth.org",
    phone: "+94 11 234 5687",
    contactPerson: "Nalinda Fernando",
    sharedResourcesCount: 5,
    collaborationRequestsCount: 0,
    address: "Harbor Fishermen Welfare Center, Eastbank",
    notes: "Local paramedic volunteers and triage dispatchers. Credential verification under review.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    verifiedAt: null,
  },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";
const ENDPOINT = `${API_BASE}/api/partner-organisations`;

export const partnerOrganisationService = {
  async getAll(params?: PartnerFilterParams): Promise<PartnerOrganisation[]> {
    try {
      const url = new URL(ENDPOINT);
      if (params) {
        if (params.search) url.searchParams.set("search", params.search);
        if (params.region && params.region !== "All operational areas") {
          url.searchParams.set("region", params.region);
        }
        if (params.status && params.status !== "All statuses") {
          url.searchParams.set("status", params.status);
        }
        if (params.verification && params.verification !== "Any availability") {
          url.searchParams.set("verification", params.verification);
        }
        if (params.type && params.type !== "All types") {
          url.searchParams.set("type", params.type);
        }
        if (params.role && params.role !== "All roles") {
          url.searchParams.set("role", params.role);
        }
      }

      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch partners: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Using fallback partner organisations data:", err);
      // Filter locally for fallback
      let filtered = [...FALLBACK_PARTNERS];
      if (params) {
        if (params.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter((p) =>
            [p.id, p.name, p.type, p.region, p.role, p.email, p.phone]
              .join(" ")
              .toLowerCase()
              .includes(s)
          );
        }
        if (params.region && params.region !== "All operational areas") {
          filtered = filtered.filter((p) => p.region.includes(params.region!));
        }
        if (params.status && params.status !== "All statuses") {
          filtered = filtered.filter((p) => p.status === params.status);
        }
        if (params.verification && params.verification !== "Any availability") {
          filtered = filtered.filter((p) => p.verification === params.verification);
        }
      }
      return filtered;
    }
  },

  async getMetrics(): Promise<PartnerOrganisationsMetrics> {
    try {
      const response = await fetch(`${ENDPOINT}/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Using fallback partner metrics:", err);
      return FALLBACK_METRICS;
    }
  },

  async getById(id: string): Promise<PartnerOrganisation> {
    try {
      const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch partner organisation ${id}: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      const found = FALLBACK_PARTNERS.find((p) => p.id === id);
      if (found) return found;
      throw err;
    }
  },

  async invitePartner(payload: CreatePartnerPayload): Promise<PartnerOrganisation> {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.title ||
        errorData.error ||
        `Failed to invite partner: ${response.status}`
      );
    }

    return await response.json();
  },

  async update(id: string, payload: UpdatePartnerPayload): Promise<PartnerOrganisation> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update partner: ${response.status}`
      );
    }

    return await response.json();
  },

  async updateStatus(
    id: string,
    status: "Active" | "Inactive"
  ): Promise<PartnerOrganisation> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update status: ${response.status}`
      );
    }

    return await response.json();
  },

  async updateVerification(
    id: string,
    verification: "Verified" | "Pending" | "Rejected"
  ): Promise<PartnerOrganisation> {
    const response = await fetch(
      `${ENDPOINT}/${encodeURIComponent(id)}/verification`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ verification }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update verification: ${response.status}`
      );
    }

    return await response.json();
  },

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete partner: ${response.status}`);
    }

    return response.ok;
  },

  async reset(): Promise<void> {
    const response = await fetch(`${ENDPOINT}/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to reset partners: ${response.status}`);
    }
  },
};
