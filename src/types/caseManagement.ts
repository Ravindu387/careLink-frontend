export interface CaseItem {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low" | string;
  aiPriority: "Critical" | "High" | "Medium" | "Low" | string;
  confidence: string;
  verification: string;
  assigned: string;
  age: string;
  status: "Submitted" | "Under Review" | "Verified" | "Assigned" | "In Progress" | "Pending Info" | "Escalated" | "Resolved" | string;
  description?: string;
  createdAt?: string;
}

export interface StatCardItem {
  title: string;
  value: string;
  description: string;
  iconKey: string;
  color: "blue" | "orange" | "red" | "purple" | "green" | string;
}

export interface StatusBreakdownItem {
  name: string;
  value: number;
}

export interface ChartDataPoint {
  day: string;
  received: number;
  resolved: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  iconKey: string;
  color: "blue" | "green" | "purple" | "orange" | "red" | string;
  timestamp?: string;
}

export interface CaseDashboardResponse {
  statistics: StatCardItem[];
  statusOverview: StatusBreakdownItem[];
  totalOpenCases: number;
  chartData: ChartDataPoint[];
  resolutionRate: string;
  priorityCases: CaseItem[];
  recentActivities: ActivityItem[];
  lastUpdated: string;
}

export interface CreateCaseRequest {
  category: string;
  applicantName: string;
  peopleCount: number;
  location: string;
  priority: string;
  description?: string;
}

export interface UpdateCaseStatusRequest {
  status: string;
  notes?: string;
}

export interface ClaimCaseRequest {
  assignedTo?: string;
}
