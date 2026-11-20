export interface SkillCoverageItem {
  name: string;
  verified: number;
  available: number;
  percentage: number;
  category?: string;
}

export interface AvailabilityForecast {
  day: string;
  volunteers: number;
}

export interface SkillsAvailabilityStats {
  availableToday: number;
  availableTodayPercentage: string;
  availableThisWeek: number;
  availableThisWeekSub: string;
  criticalSkillGaps: number;
  criticalSkillGapsSummary: string;
  schedulesUpdatedRate: string;
  schedulesUpdatedSub: string;
}

export interface CoverageWarning {
  title: string;
  description: string;
  severity?: string;
}

export interface SkillsAvailabilityOverview {
  stats: SkillsAvailabilityStats;
  skills: SkillCoverageItem[];
  forecast: AvailabilityForecast[];
  warning: CoverageWarning;
  operationalArea: string;
  generatedAt: string;
}

export interface AvailabilityRequestPayload {
  skill: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  volunteers: number | string;
}

export interface CreateSkillPayload {
  name: string;
  category?: string;
}
