import { authFetch } from "./api";
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  sector: string;
  area: string;
  contact: string;
  email: string;
  lastActive: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamContactsMetrics {
  activeRecords: number;
  activeRecordsSubtitle: string;
  needsReview: number;
  needsReviewSubtitle: string;
  verified: string;
  verifiedSubtitle: string;
  dueSoon: number;
  dueSoonSubtitle: string;
  totalCount: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated?: string;
}

export interface CreateTeamMemberPayload {
  name: string;
  role: string;
  sector: string;
  area: string;
  contact: string;
  email: string;
  lastActive?: string;
  status?: string;
  description?: string;
}

export interface UpdateTeamMemberPayload {
  name?: string;
  role?: string;
  sector?: string;
  area?: string;
  contact?: string;
  email?: string;
  lastActive?: string;
  status?: string;
  description?: string;
}

export interface TeamMemberFilters {
  search?: string;
  tab?: string;
  role?: string;
  sector?: string;
  location?: string;
  status?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const ENDPOINT = `${API_BASE}/api/team-contacts`;
const STORAGE_KEY = "carelink_team_contacts_cache";

export const initialTeamMembers: TeamMember[] = [
  {
    id: "USR-0142",
    name: "Sara Khan",
    role: "Partner Officer",
    sector: "Coordination",
    area: "Greater Riverton",
    contact: "+94 77 412 8014",
    email: "sara.khan@example.org",
    lastActive: "Online",
    status: "Active",
    description: "Senior partner officer overseeing general coordination across Greater Riverton.",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "USR-0188",
    name: "Michael Torres",
    role: "Programme Manager",
    sector: "Food Security",
    area: "Central · North",
    contact: "+94 77 412 8042",
    email: "michael.torres@example.org",
    lastActive: "18 min ago",
    status: "Active",
    description: "Programme manager leading food security distribution and cluster coordination.",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "USR-0241",
    name: "Nafisa Silva",
    role: "Field Team Lead",
    sector: "WASH",
    area: "North Ward",
    contact: "+94 77 412 8098",
    email: "nafisa.silva@example.org",
    lastActive: "6 min ago",
    status: "Active",
    description: "Field response team lead supervising water sanitation projects in North Ward.",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: "USR-0284",
    name: "Ayo Mensah",
    role: "Protection Officer",
    sector: "Protection",
    area: "All districts",
    contact: "+94 77 412 8063",
    email: "ayo.mensah@example.org",
    lastActive: "42 min ago",
    status: "Active",
    description: "Protection officer coordinating vulnerable population safeguarding.",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 42 * 60000).toISOString(),
  },
  {
    id: "USR-0301",
    name: "Daniel Perera",
    role: "Logistics Officer",
    sector: "Logistics",
    area: "Eastbank",
    contact: "+94 77 412 8011",
    email: "daniel.perera@example.org",
    lastActive: "Yesterday",
    status: "Needs Review",
    description: "Logistics officer managing warehouse intake and dispatch along Eastbank corridor.",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "USR-0315",
    name: "Amara Fernando",
    role: "Health Coordinator",
    sector: "Health",
    area: "South Ward",
    contact: "+94 77 412 8055",
    email: "amara.fernando@example.org",
    lastActive: "2 hours ago",
    status: "Active",
    description: "Health coordinator liaising with primary clinics and mobile health vans.",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

function getStoredCache(): TeamMember[] {
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
  return initialTeamMembers;
}

function saveCache(members: TeamMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // ignore
  }
}

function computeFallbackMetrics(members: TeamMember[]): TeamContactsMetrics {
  const activeCount = members.filter((m) => m.status === "Active").length;
  const needsReviewCount = members.filter((m) => m.status === "Needs Review").length;
  const completedCount = members.filter((m) => m.status === "Completed").length;
  const archivedCount = members.filter((m) => m.status === "Archived").length;

  return {
    activeRecords: Math.max(activeCount, 48 + (activeCount - 5)),
    activeRecordsSubtitle: "Organisation-scoped",
    needsReview: Math.max(needsReviewCount, 3 + (needsReviewCount - 1)),
    needsReviewSubtitle: "Assigned to your team",
    verified: "96%",
    verifiedSubtitle: "Current assurance",
    dueSoon: 2,
    dueSoonSubtitle: "Within 30 days",
    totalCount: Math.max(members.length, 48 + (members.length - 6)),
    needsActionCount: Math.max(needsReviewCount, 7 + (needsReviewCount - 1)),
    activeCount: Math.max(activeCount, 48 + (activeCount - 5)),
    completedCount,
    archivedCount,
    lastUpdated: new Date().toISOString(),
  };
}

export const teamContactService = {
  async getAll(filters?: TeamMemberFilters): Promise<{ data: TeamMember[]; isLive: boolean }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
      if (filters?.role && filters.role !== "All roles") params.append("role", filters.role);
      if (filters?.sector && filters.sector !== "All sectors") params.append("sector", filters.sector);
      if (filters?.location && filters.location !== "All locations") params.append("location", filters.location);
      if (filters?.status && filters.status !== "All statuses") params.append("status", filters.status);

      const qs = params.toString();
      const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
      const res = await authFetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: TeamMember[] = await res.json();
      saveCache(data);
      return { data, isLive: true };
    } catch {
      let filtered = getStoredCache();

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.id.toLowerCase().includes(q) ||
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            m.sector.toLowerCase().includes(q) ||
            m.area.toLowerCase().includes(q) ||
            m.contact.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
        );
      }

      if (filters?.tab && filters.tab !== "All") {
        if (filters.tab === "Needs action") {
          filtered = filtered.filter((m) => m.status === "Needs Review");
        } else {
          filtered = filtered.filter((m) => m.status === filters.tab);
        }
      }

      if (filters?.role && filters.role !== "All roles") {
        filtered = filtered.filter((m) => m.role === filters.role);
      }

      if (filters?.sector && filters.sector !== "All sectors") {
        filtered = filtered.filter((m) => m.sector === filters.sector);
      }

      if (filters?.location && filters.location !== "All locations") {
        filtered = filtered.filter((m) => m.area.includes(filters.location!));
      }

      if (filters?.status && filters.status !== "All statuses") {
        filtered = filtered.filter((m) => m.status === filters.status);
      }

      return { data: filtered, isLive: false };
    }
  },

  async getMetrics(): Promise<{ data: TeamContactsMetrics; isLive: boolean }> {
    try {
      const res = await authFetch(`${ENDPOINT}/metrics`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: TeamContactsMetrics = await res.json();
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      return { data: computeFallbackMetrics(cache), isLive: false };
    }
  },

  async getById(id: string): Promise<TeamMember | null> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const cache = getStoredCache();
    return cache.find((m) => m.id === id) || null;
  },

  async create(payload: CreateTeamMemberPayload): Promise<{ data: TeamMember; isLive: boolean }> {
    try {
      const res = await authFetch(ENDPOINT, {
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

      const data: TeamMember = await res.json();
      const cache = getStoredCache();
      saveCache([data, ...cache.filter((m) => m.id !== data.id)]);
      return { data, isLive: true };
    } catch {
      const id = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
      const offlineMember: TeamMember = {
        id,
        name: payload.name,
        role: payload.role,
        sector: payload.sector,
        area: payload.area,
        contact: payload.contact,
        email: payload.email,
        lastActive: payload.lastActive || "Invited",
        status: payload.status || "Active",
        description: payload.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const cache = getStoredCache();
      saveCache([offlineMember, ...cache]);
      return { data: offlineMember, isLive: false };
    }
  },

  async update(id: string, payload: UpdateTeamMemberPayload): Promise<{ data: TeamMember; isLive: boolean }> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
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

      const data: TeamMember = await res.json();
      const cache = getStoredCache();
      saveCache(cache.map((m) => (m.id === id ? data : m)));
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      const existing = cache.find((m) => m.id === id);
      const updated: TeamMember = {
        id,
        name: payload.name ?? existing?.name ?? "",
        role: payload.role ?? existing?.role ?? "",
        sector: payload.sector ?? existing?.sector ?? "",
        area: payload.area ?? existing?.area ?? "",
        contact: payload.contact ?? existing?.contact ?? "",
        email: payload.email ?? existing?.email ?? "",
        lastActive: payload.lastActive ?? existing?.lastActive ?? "Just now",
        status: payload.status ?? existing?.status ?? "Active",
        description: payload.description ?? existing?.description,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveCache(cache.map((m) => (m.id === id ? updated : m)));
      return { data: updated, isLive: false };
    }
  },

  async updateStatus(id: string, status: string): Promise<{ data: TeamMember; isLive: boolean }> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: TeamMember = await res.json();
      const cache = getStoredCache();
      saveCache(cache.map((m) => (m.id === id ? data : m)));
      return { data, isLive: true };
    } catch {
      const cache = getStoredCache();
      const existing = cache.find((m) => m.id === id);
      if (existing) {
        existing.status = status;
        existing.updatedAt = new Date().toISOString();
        saveCache(cache);
        return { data: { ...existing }, isLive: false };
      }
      throw new Error("Item not found");
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const res = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const cache = getStoredCache();
      saveCache(cache.filter((m) => m.id !== id));
      return true;
    } catch {
      const cache = getStoredCache();
      saveCache(cache.filter((m) => m.id !== id));
      return true;
    }
  },

  async reset(): Promise<boolean> {
    try {
      await authFetch(`${ENDPOINT}/reset`, {
        method: "POST",
      });
      saveCache(initialTeamMembers);
      return true;
    } catch {
      saveCache(initialTeamMembers);
      return true;
    }
  },
};
