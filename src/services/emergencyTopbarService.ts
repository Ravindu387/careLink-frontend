import { authFetch } from "./api";
/**
 * Emergency Topbar Service
 * Connects the emergency coordinator topbar with global search, notifications, helplines, and area status.
 */

export interface EmergencyNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  severity: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface EmergencyHelpline {
  name: string;
  number: string;
  description: string;
  department: string;
  is24x7: boolean;
}

export interface GlobalSearchResult {
  category: string;
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  url: string;
}

export interface EmergencyTopbarState {
  operationalArea: string;
  selectedLanguage: string;
  supportedLanguages: string[];
  unreadNotificationCount: number;
  notifications: EmergencyNotification[];
  helplines: EmergencyHelpline[];
  coordinatorName: string;
  coordinatorRole: string;
  coordinatorInitials: string;
  dutyStatus: string;
}

const DEFAULT_STATE: EmergencyTopbarState = {
  operationalArea: "Greater Riverton",
  selectedLanguage: "EN",
  supportedLanguages: ["EN", "SI", "TA"],
  unreadNotificationCount: 6,
  coordinatorName: "Amina Mensah",
  coordinatorRole: "Emergency Coordinator",
  coordinatorInitials: "AM",
  dutyStatus: "On Duty",
  helplines: [
    {
      name: "Disaster Management Centre",
      number: "117",
      department: "National Emergency Command",
      description: "24/7 central emergency operations hotline for search, rescue, and hazard alerts.",
      is24x7: true,
    },
    {
      name: "Suwa Seriya Ambulance",
      number: "1990",
      department: "Medical Emergency Services",
      description: "Toll-free nationwide rapid medical transport and field paramedic dispatch.",
      is24x7: true,
    },
    {
      name: "Police Emergency Service",
      number: "119",
      department: "Sri Lanka Police Operations",
      description: "Civil protection, urgent law enforcement, and emergency escort assistance.",
      is24x7: true,
    },
    {
      name: "Tri-Forces Search & Rescue",
      number: "118",
      department: "Ministry of Defence",
      description: "Air Force helicopter rescue and military heavy engineering evacuation unit.",
      is24x7: true,
    },
    {
      name: "Coast Guard Maritime SAR",
      number: "1989",
      department: "Maritime Safety Command",
      description: "Coastal flood surge and watercraft distress response unit.",
      is24x7: true,
    },
  ],
  notifications: [
    {
      id: "NOTIF-001",
      title: "Kelani River Crest Warning - Sector 4",
      message: "River gauge reached 8.65m (Critical Flood Alert). Immediate low-lying evacuation ordered.",
      category: "Incident",
      severity: "Critical",
      timestamp: new Date().toISOString(),
      timeAgo: "4m ago",
      isRead: false,
      actionUrl: "/emergency-coordinator/crisis-events",
      actionLabel: "View Incident",
    },
    {
      id: "NOTIF-002",
      title: "High-Priority Medical Air-Evacuation Request",
      message: "Urgent ventilator & oxygen assistance needed at Kolonnawa Field Clinic for 4 critical patients.",
      category: "Assistance",
      severity: "Critical",
      timestamp: new Date().toISOString(),
      timeAgo: "12m ago",
      isRead: false,
      actionUrl: "/emergency-coordinator/assistance-requests",
      actionLabel: "Review Request",
    },
    {
      id: "NOTIF-003",
      title: "AI Resource Rebalancing Recommendation Ready",
      message: "Recommendation #REC-8849 generated: Reposition 3 search boats from Colombo South to Wellampitiya.",
      category: "AI Alert",
      severity: "Warning",
      timestamp: new Date().toISOString(),
      timeAgo: "28m ago",
      isRead: false,
      actionUrl: "/emergency-coordinator/ai-recommendations",
      actionLabel: "Review AI Action",
    },
  ],
};

const BASE_URL = "/api/emergency-topbar";

export const emergencyTopbarService = {
  async getState(): Promise<EmergencyTopbarState> {
    try {
      const response = await authFetch(BASE_URL, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_STATE;
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const response = await authFetch(`${BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async markAllNotificationsRead(): Promise<number> {
    try {
      const response = await authFetch(`${BASE_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return data.remainingCount ?? 0;
    } catch {
      return 0;
    }
  },

  async searchGlobal(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await authFetch(`${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return [];
    }
  },

  async updateArea(area: string): Promise<string> {
    try {
      const response = await authFetch(`${BASE_URL}/area`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ operationalArea: area }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return data.operationalArea ?? area;
    } catch {
      return area;
    }
  },

  async updateLanguage(lang: string): Promise<string> {
    try {
      const response = await authFetch(`${BASE_URL}/language`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ language: lang }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return data.selectedLanguage ?? lang;
    } catch {
      return lang;
    }
  },

  async resetState(): Promise<EmergencyTopbarState> {
    try {
      const response = await authFetch(`${BASE_URL}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_STATE;
    }
  },
};
