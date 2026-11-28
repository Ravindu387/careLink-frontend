import { authFetch } from "./api";
export interface SummaryCard {
  label: string;
  value: string;
  detail: string;
  icon: string;
  iconClass: string;
}

export interface PartnerActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  timestamp: string;
}

export interface PartnerOrganisationSummary {
  name: string;
  type: string;
  code: string;
  verificationStatus: string;
  assignedRegion: string;
  fieldLocationsCount: number;
  contactEmail: string;
  contactPhone: string;
}

export interface PartnerDashboardData {
  activeCrisisName: string;
  summaryCards: SummaryCard[];
  activities: PartnerActivity[];
  organisation: PartnerOrganisationSummary;
  lastUpdated: string;
}

export interface CreatePartnerActivityPayload {
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const partnerDashboardService = {
  async getDashboard(partnerId?: string): Promise<PartnerDashboardData> {
    const query = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : "";
    const token = localStorage.getItem("carelink_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await authFetch(`${API_BASE}/api/partner-dashboard${query}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to load partner dashboard: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async logActivity(payload: CreatePartnerActivityPayload): Promise<PartnerActivity> {
    const token = localStorage.getItem("carelink_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await authFetch(`${API_BASE}/api/partner-dashboard/activities`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to log activity: ${response.status}`);
    }
    return response.json();
  },

  async reset(): Promise<{ message: string; data: PartnerDashboardData }> {
    const token = localStorage.getItem("carelink_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await authFetch(`${API_BASE}/api/partner-dashboard/reset`, {
      method: "POST",
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to reset partner dashboard: ${response.status}`);
    }
    return response.json();
  },
};
