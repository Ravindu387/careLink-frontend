import { request, authFetch } from "./api";
import type {
  SkillCoverageItem,
  AvailabilityForecast,
  SkillsAvailabilityStats,
  SkillsAvailabilityOverview,
  AvailabilityRequestPayload,
  CreateSkillPayload,
} from "../types/skillsAvailability";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialSkills: SkillCoverageItem[] = [
  {
    name: "Logistics & Distribution",
    verified: 486,
    available: 184,
    percentage: 74,
    category: "Operations",
  },
  {
    name: "First Aid & Medical",
    verified: 294,
    available: 96,
    percentage: 68,
    category: "Medical",
  },
  {
    name: "Driving & Transport",
    verified: 318,
    available: 128,
    percentage: 82,
    category: "Logistics",
  },
  {
    name: "Shelter Support",
    verified: 402,
    available: 142,
    percentage: 77,
    category: "Shelter",
  },
  {
    name: "Translation",
    verified: 128,
    available: 52,
    percentage: 63,
    category: "Communications",
  },
  {
    name: "Search & Rescue",
    verified: 94,
    available: 40,
    percentage: 91,
    category: "Emergency",
  },
  {
    name: "Childcare",
    verified: 176,
    available: 64,
    percentage: 58,
    category: "Support",
  },
  {
    name: "Administration",
    verified: 332,
    available: 116,
    percentage: 70,
    category: "Management",
  },
];

const initialForecast: AvailabilityForecast[] = [
  { day: "Mon 23", volunteers: 520 },
  { day: "Tue 24", volunteers: 551 },
  { day: "Wed 25", volunteers: 582 },
  { day: "Thu 26", volunteers: 613 },
  { day: "Fri 27", volunteers: 644 },
  { day: "Sat 28", volunteers: 675 },
  { day: "Sun 29", volunteers: 706 },
];

const initialStats: SkillsAvailabilityStats = {
  availableToday: 642,
  availableTodayPercentage: "26.8% of volunteers",
  availableThisWeek: 1184,
  availableThisWeekSub: "Across all areas",
  criticalSkillGaps: 3,
  criticalSkillGapsSummary: "Rescue, nursing, drivers",
  schedulesUpdatedRate: "89%",
  schedulesUpdatedSub: "Within last 7 days",
};

function getLocalSkills(): SkillCoverageItem[] {
  try {
    const raw = localStorage.getItem("carelink_volunteer_skills");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return initialSkills;
}

export const skillsAvailabilityService = {
  /**
   * Fetches the full overview (stats, skills, forecast, warnings)
   */
  async getOverview(
    area = "Greater Riverton"
  ): Promise<{ data: SkillsAvailabilityOverview; isLiveBackend: boolean }> {
    try {
      const response = await request<SkillsAvailabilityOverview>(
        `/volunteer/skills-availability/overview?area=${encodeURIComponent(area)}`
      );

      if (response && response.success && response.data) {
        localStorage.setItem("carelink_volunteer_skills", JSON.stringify(response.data.skills));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback to local data
    }

    const localSkills = getLocalSkills();
    const availableTotal = localSkills.reduce((acc, s) => acc + s.available, 0);

    return {
      data: {
        stats: {
          ...initialStats,
          availableToday: availableTotal > 0 ? availableTotal : 642,
        },
        skills: localSkills,
        forecast: initialForecast,
        warning: {
          title: "Thursday coverage gap",
          description: "Additional rescue drivers needed from 18:00–22:00.",
          severity: "Warning",
        },
        operationalArea: area,
        generatedAt: new Date().toISOString(),
      },
      isLiveBackend: false,
    };
  },

  /**
   * Adds a new skill group
   */
  async addSkill(
    payload: CreateSkillPayload
  ): Promise<{ data: SkillCoverageItem; isLiveBackend: boolean }> {
    try {
      const response = await request<SkillCoverageItem>("/volunteer/skills-availability/skills", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response && response.success && response.data) {
        const skills = getLocalSkills();
        if (!skills.some((s) => s.name.toLowerCase() === payload.name.trim().toLowerCase())) {
          skills.push(response.data);
          localStorage.setItem("carelink_volunteer_skills", JSON.stringify(skills));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const newSkill: SkillCoverageItem = {
      name: payload.name.trim(),
      verified: 0,
      available: 0,
      percentage: 0,
      category: payload.category || "Operations",
    };

    const skills = getLocalSkills();
    if (!skills.some((s) => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      skills.push(newSkill);
      localStorage.setItem("carelink_volunteer_skills", JSON.stringify(skills));
    }

    return { data: newSkill, isLiveBackend: false };
  },

  /**
   * Removes a skill group
   */
  async removeSkill(name: string): Promise<boolean> {
    try {
      const response = await request<boolean>(
        `/volunteer/skills-availability/skills/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );

      const skills = getLocalSkills().filter(
        (s) => s.name.toLowerCase() !== name.toLowerCase()
      );
      localStorage.setItem("carelink_volunteer_skills", JSON.stringify(skills));

      return !!(response && response.success);
    } catch {
      const skills = getLocalSkills().filter(
        (s) => s.name.toLowerCase() !== name.toLowerCase()
      );
      localStorage.setItem("carelink_volunteer_skills", JSON.stringify(skills));
      return true;
    }
  },

  /**
   * Submits an availability request
   */
  async submitAvailabilityRequest(
    payload: AvailabilityRequestPayload
  ): Promise<{ success: boolean; isLiveBackend: boolean }> {
    try {
      const response = await request<any>("/volunteer/skills-availability/requests", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          volunteers: Number(payload.volunteers) || 1,
        }),
      });

      if (response && response.success) {
        return { success: true, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    return { success: true, isLiveBackend: false };
  },

  /**
   * Exports skills coverage to CSV
   */
  async exportSkillsCsv(): Promise<Blob> {
    try {
      const res = await authFetch(`${API_BASE_URL}/volunteer/skills-availability/export`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const skills = getLocalSkills();
    const rows = [
      ["CareLink - Volunteer Skills & Availability"],
      ["Export Timestamp", new Date().toISOString()],
      [],
      ["Skill Name", "Category", "Verified Volunteers", "Available Now", "Coverage (%)"],
      ...skills.map((s) => [
        s.name,
        s.category || "Operations",
        String(s.verified),
        String(s.available),
        `${s.percentage}%`,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};
