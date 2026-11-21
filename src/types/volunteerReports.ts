export interface VolunteerAnalyticsData {
  tasksCompleted: number;
  volunteerHours: number;
  acceptanceRate: number;
  incidentFreeRate: number;
  activeVolunteers?: number;
  totalShifts?: number;
  completionRate?: string;
  hoursComparison?: string;
  invitationsCount?: string;
  incidentsSummary?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  created?: number;
  completed?: number;
}

export interface SkillHoursBreakdown {
  name: string;
  hours: number;
  percentage?: number;
}

export interface VolunteerReportItem {
  id: number;
  title: string;
  description: string;
  category: string;
  iconName: string;
  lastGenerated?: string;
  format?: string;
}

export interface VolunteerReportsOverviewDto {
  analytics: VolunteerAnalyticsData;
  trendData: TrendDataPoint[];
  skillData: SkillHoursBreakdown[];
  reports: VolunteerReportItem[];
  operationalAreas: string[];
  skillGroups: string[];
  dateRanges: string[];
}

export interface VolunteerReportsQueryDto {
  dateRange?: string;
  operationalArea?: string;
  skillGroup?: string;
}
