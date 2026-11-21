import { request } from "./api";
import type {
  SafetyUpdate,
  SafetyUpdateSummary,
  SafetyUpdateFilterParams,
  CreateSafetyUpdatePayload,
} from "../types/safetyUpdate";

export const MOCK_SAFETY_UPDATES: SafetyUpdate[] = [
  {
    id: "SAFE-101",
    type: "Emergency alert",
    level: "Emergency alert",
    severity: "Critical",
    title: "Evacuate Riverside blocks A–D",
    description:
      "Flood water is rising rapidly across the lower river basin. Move immediately to North Community Hall using Market Road. Do not use Riverside Bridge.",
    location: "Riverside · North Ward",
    area: "North Ward",
    time: "12 minutes ago",
    source: "Disaster Management Centre (DMC)",
    actionInstructions:
      "Immediately evacuate ground-floor homes. Assemble essential survival bags and move north along Market Road to the community refuge hall.",
    safeRoutes: [
      "Market Road towards North Hill bypass",
      "Highland Link pathway",
    ],
    hazardAreas: ["Riverside Bridge (submerged)", "Lower Block C Embankment"],
    helpline: "112",
  },
  {
    id: "SAFE-102",
    type: "Warning",
    level: "Warning",
    severity: "High",
    title: "Heavy rainfall expected until 18:00",
    description:
      "Intense monsoon downpours forecast across Greater Riverton. Low-lying roads at severe risk of flash floods. Keep essential medicines and documents ready.",
    location: "Greater Riverton",
    area: "Greater Riverton",
    time: "38 minutes ago",
    source: "Department of Meteorology",
    actionInstructions:
      "Stay indoors on elevated floors. Avoid unnecessary vehicular travel through underpasses and canal banks.",
    safeRoutes: ["Central Elevated Highway", "Airport Expressway"],
    hazardAreas: ["Railway underpass at South Crossing", "Old Mill Road culvert"],
    helpline: "112",
  },
  {
    id: "SAFE-103",
    type: "Service update",
    level: "Service update",
    severity: "Medium",
    title: "Drinking water distribution point opened",
    description:
      "Municipal water bowsers providing certified safe drinking water at North Community Support Centre. Clean containers provided on site if needed.",
    location: "North Ward",
    area: "North Ward",
    time: "1 hour ago",
    source: "Municipal Relief Division",
    actionInstructions:
      "Bring clean 5L to 10L containers if possible. Dedicated fast-track lines for elders and families with infants.",
    safeRoutes: ["School Avenue", "Community Centre Gate 2"],
    hazardAreas: [],
    helpline: "112",
  },
  {
    id: "SAFE-104",
    type: "Warning",
    level: "Warning",
    severity: "High",
    title: "East Ward reservoir sluice discharge",
    description:
      "Controlled excess water release from upstream reservoir underway. River embankment settlements in East Ward should remain vigilant.",
    location: "East Ward · River Basin",
    area: "East Ward",
    time: "2 hours ago",
    source: "Irrigation & Water Management Authority",
    actionInstructions:
      "Secure cattle, boats, and riverbank structures. Do not enter riverbanks for washing or fishing.",
    safeRoutes: ["East Ridge Road"],
    hazardAreas: ["Kelani River Bank Road", "Fishermen Pier 4"],
    helpline: "112",
  },
  {
    id: "SAFE-105",
    type: "Service update",
    level: "Service update",
    severity: "Low",
    title: "Mobile emergency clinic deployed",
    description:
      "Red Cross mobile medical clinic stationed at Riverton High School Shelter offering wound care, insulin refrigeration, and emergency triage.",
    location: "Riverton High School · Central Ward",
    area: "Greater Riverton",
    time: "3 hours ago",
    source: "Sri Lanka Red Cross Society",
    actionInstructions:
      "Free basic medicines, blood pressure monitoring, and tetanus shots available between 08:00 and 20:00.",
    safeRoutes: ["High School Lane", "Sports Complex Entrance"],
    hazardAreas: [],
    helpline: "112",
  },
];

let localUpdatesStore: SafetyUpdate[] = [...MOCK_SAFETY_UPDATES];

export const safetyUpdateService = {
  async getUpdates(
    params?: SafetyUpdateFilterParams
  ): Promise<SafetyUpdate[]> {
    try {
      const query = new URLSearchParams();
      if (params?.area && params.area !== "All" && params.area !== "All Areas") {
        query.append("area", params.area);
      }
      if (params?.level && params.level !== "All" && params.level !== "All Updates") {
        query.append("level", params.level);
      }
      if (params?.search) {
        query.append("search", params.search);
      }

      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await request<SafetyUpdate[]>(
        `/citizen/safety-updates${queryString}`,
        { method: "GET" }
      );
      if (response.data) {
        localUpdatesStore = response.data;
        return response.data;
      }
      return localUpdatesStore;
    } catch (err) {
      console.warn("Could not fetch safety updates from backend, using local store:", err);
      let filtered = [...localUpdatesStore];

      if (params?.area && params.area !== "All" && params.area !== "All Areas") {
        const a = params.area.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.area.toLowerCase().includes(a) ||
            u.location.toLowerCase().includes(a) ||
            (a === "greater riverton" && u.area.toLowerCase().includes("ward"))
        );
      }

      if (params?.level && params.level !== "All" && params.level !== "All Updates") {
        filtered = filtered.filter(
          (u) => u.level.toLowerCase() === params.level?.toLowerCase()
        );
      }

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.title.toLowerCase().includes(q) ||
            u.description.toLowerCase().includes(q) ||
            u.location.toLowerCase().includes(q) ||
            u.source.toLowerCase().includes(q)
        );
      }

      return filtered;
    }
  },

  async getById(id: string | number): Promise<SafetyUpdate> {
    try {
      const response = await request<SafetyUpdate>(
        `/citizen/safety-updates/${id}`,
        { method: "GET" }
      );
      return response.data;
    } catch {
      const found = localUpdatesStore.find(
        (u) => String(u.id) === String(id)
      );
      if (found) return found;
      throw new Error(`Safety update '${id}' not found.`);
    }
  },

  async getSummary(area?: string): Promise<SafetyUpdateSummary> {
    try {
      const query = area ? `?area=${encodeURIComponent(area)}` : "";
      const response = await request<SafetyUpdateSummary>(
        `/citizen/safety-updates/summary${query}`,
        { method: "GET" }
      );
      return response.data;
    } catch {
      const relevant = area && area !== "All" && area !== "All Areas"
        ? localUpdatesStore.filter((u) => u.area.toLowerCase() === area.toLowerCase())
        : localUpdatesStore;

      return {
        totalUpdates: relevant.length,
        emergencyCount: relevant.filter(
          (u) => u.level === "Emergency alert"
        ).length,
        warningsCount: relevant.filter((u) => u.level === "Warning").length,
        serviceUpdatesCount: relevant.filter(
          (u) => u.level === "Service update"
        ).length,
        monitoredAreas: ["North Ward", "Greater Riverton", "Riverside", "East Ward"],
        lastUpdatedAt: new Date().toISOString(),
      };
    }
  },

  async getMonitoredAreas(): Promise<string[]> {
    try {
      const response = await request<string[]>(
        "/citizen/safety-updates/areas",
        { method: "GET" }
      );
      return response.data;
    } catch {
      return ["North Ward", "Greater Riverton", "Riverside", "East Ward"];
    }
  },

  async createUpdate(
    payload: CreateSafetyUpdatePayload
  ): Promise<SafetyUpdate> {
    try {
      const response = await request<SafetyUpdate>(
        "/citizen/safety-updates",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (response.data) {
        localUpdatesStore.unshift(response.data);
        return response.data;
      }
    } catch (err) {
      console.warn("API error creating safety update, creating locally:", err);
    }

    const newUpdate: SafetyUpdate = {
      id: `SAFE-${Math.floor(106 + Math.random() * 500)}`,
      type: payload.type || payload.level,
      level: payload.level,
      severity: payload.severity || "High",
      title: payload.title,
      description: payload.description,
      location: payload.location,
      area: payload.area,
      time: "Just now",
      source: payload.source || "Disaster Response Center",
      actionInstructions: payload.actionInstructions,
      safeRoutes: payload.safeRoutes || [],
      hazardAreas: payload.hazardAreas || [],
      helpline: payload.helpline || "112",
      createdAt: new Date().toISOString(),
    };
    localUpdatesStore.unshift(newUpdate);
    return newUpdate;
  },
};
