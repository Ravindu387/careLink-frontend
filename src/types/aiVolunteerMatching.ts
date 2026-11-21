export type TaskPriority = "Critical" | "High" | "Medium";

export type CandidateStatus =
  | "Available now"
  | "Available 14:00"
  | "Pending verification";

export type Decision = "Approved" | "Rejected" | "Deferred";

export interface Task {
  id: string;
  title: string;
  location: string;
  skills: string[];
  priority: TaskPriority;
  status?: string;
  createdAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  skills: string[];
  distance: string;
  availability: CandidateStatus;
  score: number;
  verified: boolean;
  experience: string;
  completedTasks: number;
  checks: string[];
  warning?: string;
}

export interface DecisionRecord {
  id: string;
  taskId: string;
  taskTitle?: string;
  candidateId: string;
  candidateName?: string;
  decision: Decision;
  rationale: string;
  date: string;
  createdAt?: string;
}

export interface RecordDecisionRequest {
  taskId: string;
  candidateId: string;
  candidateName?: string;
  decision: Decision;
  rationale: string;
}

export interface MatchingSummaryDto {
  totalOpenTasks: number;
  totalVerifiedCandidates: number;
  modelVersion: string;
  decisionsCount: number;
}
