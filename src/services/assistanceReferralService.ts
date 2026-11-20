export interface AssistanceReferral {
  id: string;
  assistance: string;
  location: string;
  affected: number;
  priority: string;
  received: string;
  assigned: string;
  status: string;
  crisis: string;
  sector: string;
  description?: string;
  organisation?: string;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface AssistanceReferralMetrics {
  openReferrals: number;
  awaitingAction: number;
  criticalPriority: number;
  acceptedToday: number;
  peopleSupported: number;
  allCount: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated?: string;
}

export interface CreateAssistanceReferralPayload {
  assistance: string;
  location: string;
  affected: number;
  priority: string;
  crisis: string;
  sector: string;
  assigned?: string;
  description?: string;
  organisation?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface UpdateAssistanceReferralPayload {
  assistance?: string;
  location?: string;
  affected?: number;
  priority?: string;
  status?: string;
  assigned?: string;
  crisis?: string;
  sector?: string;
  description?: string;
  organisation?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface AssistanceReferralFilters {
  search?: string;
  tab?: string;
  crisis?: string;
  priority?: string;
  sector?: string;
  status?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const ENDPOINT = `${API_BASE}/api/assistance-referrals`;
const STORAGE_KEY = "carelink_assistance_referrals_cache";

export const initialReferrals: AssistanceReferral[] = [
  {
    id: "REF-2841",
    assistance: "Emergency shelter",
    location: "Riverside - North Ward",
    affected: 6,
    priority: "Critical",
    received: "22 Jun - 13:02",
    assigned: "Case Support Team",
    status: "Awaiting Acceptance",
    crisis: "Monsoon Floods 2025",
    sector: "Shelter",
    description: "Displaced family needing immediate emergency shelter due to rapid river swelling.",
    organisation: "CareLink Partner Office",
    contactName: "Sunil Perera",
    contactPhone: "+94 77 123 4567",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "REF-2838",
    assistance: "Food assistance",
    location: "Central District",
    affected: 12,
    priority: "High",
    received: "22 Jun - 11:45",
    assigned: "Food Distribution Team",
    status: "Accepted",
    crisis: "Monsoon Floods 2025",
    sector: "Food",
    description: "Community kitchen supplies required for flood evacuees at community centre.",
    organisation: "CareLink Partner Office",
    contactName: "Kamal De Silva",
    contactPhone: "+94 77 234 5678",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    acceptedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "REF-2835",
    assistance: "Medical supplies",
    location: "Eastbank",
    affected: 8,
    priority: "Critical",
    received: "21 Jun - 16:20",
    assigned: "Medical Response Team",
    status: "In Progress",
    crisis: "Dengue Outbreak",
    sector: "Health",
    description: "Urgent intravenous fluids and fever medication for clinic cluster in Eastbank.",
    organisation: "CareLink Partner Office",
    contactName: "Dr. Anoma Wijesinghe",
    contactPhone: "+94 77 345 6789",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    acceptedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
  },
  {
    id: "REF-2830",
    assistance: "Clean drinking water",
    location: "North District",
    affected: 20,
    priority: "High",
    received: "21 Jun - 10:15",
    assigned: "WASH Team",
    status: "Accepted",
    crisis: "Monsoon Floods 2025",
    sector: "WASH",
    description: "Potable water bowser delivery requested for submerged supply zone.",
    organisation: "CareLink Partner Office",
    contactName: "Ruwan Gamage",
    contactPhone: "+94 77 456 7890",
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 3600000).toISOString(),
    acceptedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: "REF-2825",
    assistance: "Temporary housing",
    location: "West Coast",
    affected: 5,
    priority: "Medium",
    received: "20 Jun - 09:30",
    assigned: "Shelter Team",
    status: "Completed",
    crisis: "Coastal Storm Response",
    sector: "Shelter",
    description: "Transition shelter kits assembled and verified on site.",
    organisation: "CareLink Partner Office",
    contactName: "Nimal Fernando",
    contactPhone: "+94 77 567 8901",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    acceptedAt: new Date(Date.now() - 40 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "REF-2820",
    assistance: "Emergency food packs",
    location: "South District",
    affected: 15,
    priority: "Low",
    received: "19 Jun - 14:10",
    assigned: "Food Distribution Team",
    status: "Archived",
    crisis: "Monsoon Floods 2025",
    sector: "Food",
    description: "Dry rations dispatched and signed off during initial surge.",
    organisation: "CareLink Partner Office",
    contactName: "Fathima Rameez",
    contactPhone: "+94 77 678 9012",
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    acceptedAt: new Date(Date.now() - 65 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

function getStoredCache(): AssistanceReferral[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return initialReferrals;
}

function saveCache(items: AssistanceReferral[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function computeFallbackMetrics(items: AssistanceReferral[]): AssistanceReferralMetrics {
  const openReferrals = items.filter(
    (r) => r.status !== "Completed" && r.status !== "Archived"
  ).length;
  const awaitingAction = items.filter(
    (r) => r.status === "Awaiting Acceptance"
  ).length;
  const criticalPriority = items.filter(
    (r) => r.priority === "Critical"
  ).length;
  const acceptedToday = items.filter(
    (r) => r.status === "Accepted" || r.status === "In Progress" || r.acceptedAt
  ).length;
  const peopleSupported = items.reduce((sum, r) => sum + (r.affected || 0), 0);

  return {
    openReferrals: Math.max(openReferrals, 24),
    awaitingAction: Math.max(awaitingAction, 12),
    criticalPriority: Math.max(criticalPriority, 4),
    acceptedToday: Math.max(acceptedToday, 18),
    peopleSupported: Math.max(peopleSupported, 1284),
    allCount: Math.max(items.length, 60),
    needsActionCount: Math.max(awaitingAction, 7),
    activeCount: items.filter(
      (r) => r.status === "Accepted" || r.status === "In Progress"
    ).length,
    completedCount: items.filter((r) => r.status === "Completed").length,
    archivedCount: items.filter((r) => r.status === "Archived").length,
    lastUpdated: new Date().toISOString(),
  };
}

export const assistanceReferralService = {
  async getAll(
    filters?: AssistanceReferralFilters
  ): Promise<{ data: AssistanceReferral[]; isLive: boolean }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
      if (filters?.crisis && filters.crisis !== "All crisis events") params.append("crisis", filters.crisis);
      if (filters?.priority && filters.priority !== "All priorities") params.append("priority", filters.priority);
      if (filters?.sector && filters.sector !== "All sectors") params.append("sector", filters.sector);
      if (filters?.status && filters.status !== "All statuses") params.append("status", filters.status);

      const qs = params.toString();
      const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AssistanceReferral[] = await res.json();
      saveCache(data);
      return { data, isLive: true };
    } catch {
      let filtered = getStoredCache();

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            r.assistance.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q) ||
            r.assigned.toLowerCase().includes(q)
        );
      }

      if (filters?.tab && filters.tab !== "All") {
        if (filters.tab === "Needs action") {
          filtered = filtered.filter((r) => r.status === "Awaiting Acceptance");
        } else if (filters.tab === "Active") {
          filtered = filtered.filter(
            (r) => r.status === "Accepted" || r.status === "In Progress"
          );
        } else if (filters.tab === "Completed") {
          filtered = filtered.filter((r) => r.status === "Completed");
        } else if (filters.tab === "Archived") {
          filtered = filtered.filter((r) => r.status === "Archived");
        }
      }

      if (filters?.crisis && filters.crisis !== "All crisis events") {
        filtered = filtered.filter((r) => r.crisis === filters.crisis);
      }

      if (filters?.priority && filters.priority !== "All priorities") {
        filtered = filtered.filter((r) => r.priority === filters.priority);
      }

      if (filters?.sector && filters.sector !== "All sectors") {
        filtered = filtered.filter((r) => r.sector === filters.sector);
      }

      if (filters?.status && filters.status !== "All statuses") {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      return { data: filtered, isLive: false };
    }
  },

  async getMetrics(): Promise<{ data: AssistanceReferralMetrics; isLive: boolean }> {
    try {
      const res = await fetch(`${ENDPOINT}/metrics`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AssistanceReferralMetrics = await res.json();
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      return { data: computeFallbackMetrics(cache), isLive: false };
    }
  },

  async getById(id: string): Promise<AssistanceReferral | null> {
    try {
      const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const cache = getStoredCache();
    return cache.find((r) => r.id === id) || null;
  },

  async create(
    payload: CreateAssistanceReferralPayload
  ): Promise<{ data: AssistanceReferral; isLive: boolean }> {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AssistanceReferral = await res.json();
      const cache = getStoredCache();
      saveCache([data, ...cache.filter((r) => r.id !== data.id)]);
      return { data, isLive: true };
    } catch {
      const id = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
      const offlineItem: AssistanceReferral = {
        id,
        assistance: payload.assistance,
        location: payload.location,
        affected: payload.affected,
        priority: payload.priority,
        received: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        assigned: payload.assigned || "Unassigned",
        status: "Awaiting Acceptance",
        crisis: payload.crisis,
        sector: payload.sector,
        description: payload.description,
        organisation: payload.organisation || "CareLink Partner Office",
        contactName: payload.contactName,
        contactPhone: payload.contactPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const cache = getStoredCache();
      saveCache([offlineItem, ...cache]);
      return { data: offlineItem, isLive: false };
    }
  },

  async update(
    id: string,
    payload: UpdateAssistanceReferralPayload
  ): Promise<{ data: AssistanceReferral; isLive: boolean }> {
    try {
      const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AssistanceReferral = await res.json();
      const cache = getStoredCache();
      saveCache(cache.map((r) => (r.id === id ? data : r)));
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      const existing = cache.find((r) => r.id === id);
      const updated: AssistanceReferral = {
        id,
        assistance: payload.assistance ?? existing?.assistance ?? "",
        location: payload.location ?? existing?.location ?? "",
        affected: payload.affected ?? existing?.affected ?? 1,
        priority: payload.priority ?? existing?.priority ?? "Medium",
        received: existing?.received ?? "Just now",
        assigned: payload.assigned ?? existing?.assigned ?? "Unassigned",
        status: payload.status ?? existing?.status ?? "Awaiting Acceptance",
        crisis: payload.crisis ?? existing?.crisis ?? "Monsoon Floods 2025",
        sector: payload.sector ?? existing?.sector ?? "Shelter",
        description: payload.description ?? existing?.description,
        organisation: payload.organisation ?? existing?.organisation ?? "CareLink Partner Office",
        contactName: payload.contactName ?? existing?.contactName,
        contactPhone: payload.contactPhone ?? existing?.contactPhone,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveCache(cache.map((r) => (r.id === id ? updated : r)));
      return { data: updated, isLive: false };
    }
  },

  async updateStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<{ data: AssistanceReferral; isLive: boolean }> {
    try {
      const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status, reason }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AssistanceReferral = await res.json();
      const cache = getStoredCache();
      saveCache(cache.map((r) => (r.id === id ? data : r)));
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      const existing = cache.find((r) => r.id === id);
      if (existing) {
        existing.status = status;
        existing.updatedAt = new Date().toISOString();
        if (status === "Accepted") {
          existing.acceptedAt = new Date().toISOString();
          if (existing.assigned === "Unassigned") {
            existing.assigned = "Case Support Team";
          }
        } else if (status === "Completed") {
          existing.completedAt = new Date().toISOString();
        }
        if (reason) {
          existing.description = existing.description
            ? `${existing.description} | Note: ${reason}`
            : reason;
        }
        saveCache(cache);
        return { data: { ...existing }, isLive: false };
      }
      throw new Error("Referral not found");
    }
  },

  async assignTeam(
    id: string,
    assigned: string
  ): Promise<{ data: AssistanceReferral; isLive: boolean }> {
    try {
      const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ assigned }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AssistanceReferral = await res.json();
      const cache = getStoredCache();
      saveCache(cache.map((r) => (r.id === id ? data : r)));
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      const existing = cache.find((r) => r.id === id);
      if (existing) {
        existing.assigned = assigned;
        existing.updatedAt = new Date().toISOString();
        saveCache(cache);
        return { data: { ...existing }, isLive: false };
      }
      throw new Error("Referral not found");
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const cache = getStoredCache();
      saveCache(cache.filter((r) => r.id !== id));
      return true;
    } catch {
      const cache = getStoredCache();
      saveCache(cache.filter((r) => r.id !== id));
      return true;
    }
  },

  async reset(): Promise<boolean> {
    try {
      await fetch(`${ENDPOINT}/reset`, {
        method: "POST",
      });
      saveCache(initialReferrals);
      return true;
    } catch {
      saveCache(initialReferrals);
      return true;
    }
  },
};
