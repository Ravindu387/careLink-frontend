import { request } from "./api";
import type {
  Task,
  Candidate,
  DecisionRecord,
  RecordDecisionRequest,
  MatchingSummaryDto,
} from "../types/aiVolunteerMatching";

const initialTasks: Task[] = [
  {
    id: "TASK-782",
    title: "Evacuation transport support",
    location: "North Ward",
    skills: ["Driving", "Rescue"],
    priority: "Critical",
  },
  {
    id: "TASK-779",
    title: "Medical point registration",
    location: "Central Clinic",
    skills: ["First Aid", "Admin"],
    priority: "High",
  },
  {
    id: "TASK-774",
    title: "Food pack distribution",
    location: "Eastbank Hub",
    skills: ["Logistics"],
    priority: "High",
  },
  {
    id: "TASK-768",
    title: "Shelter childcare support",
    location: "Riverton School",
    skills: ["Childcare"],
    priority: "Medium",
  },
];

const fallbackCandidates: Candidate[] = [
  {
    id: "VOL-1048",
    name: "Elena Rossi",
    initials: "ER",
    skills: ["First Aid", "Logistics"],
    distance: "0.8 km",
    availability: "Available now",
    score: 96,
    verified: true,
    experience: "Experienced in evacuation support.",
    completedTasks: 8,
    checks: [
      "Required skills verified",
      "Available during full task window",
      "Within recommended travel range",
      "Completed 8 similar tasks",
      "No conflicting assignments",
    ],
  },
  {
    id: "VOL-1172",
    name: "Musa Bello",
    initials: "MB",
    skills: ["Driving", "Rescue"],
    distance: "1.4 km",
    availability: "Available 14:00",
    score: 93,
    verified: true,
    experience: "Experienced rescue and driving volunteer.",
    completedTasks: 12,
    checks: [
      "Driving and rescue skills verified",
      "Availability confirmed from 14:00",
      "Within recommended travel range",
      "Completed 12 similar tasks",
      "No conflicting assignments",
    ],
  },
  {
    id: "VOL-0934",
    name: "Lin Wei",
    initials: "LW",
    skills: ["Translation", "Medical"],
    distance: "2.1 km",
    availability: "Available now",
    score: 87,
    verified: true,
    experience: "Medical and multilingual support experience.",
    completedTasks: 6,
    checks: [
      "Medical skills verified",
      "Available during task window",
      "Within recommended travel range",
      "Completed 6 similar tasks",
      "No conflicting assignments",
    ],
  },
  {
    id: "VOL-1288",
    name: "Sara Khan",
    initials: "SK",
    skills: ["Shelter Support", "Childcare"],
    distance: "1.1 km",
    availability: "Pending verification",
    score: 72,
    verified: false,
    experience: "Shelter and childcare support experience.",
    completedTasks: 4,
    checks: [
      "Skills submitted for verification",
      "Availability requires confirmation",
      "Within recommended travel range",
      "Completed 4 similar tasks",
    ],
    warning:
      "Volunteer verification is pending. Approval is not recommended until verification is completed.",
  },
];

let localDecisions: DecisionRecord[] = [];

export const aiVolunteerMatchingService = {
  async getSummary(): Promise<{ data: MatchingSummaryDto; isLiveBackend: boolean }> {
    try {
      const response = await request<MatchingSummaryDto>("/ai-volunteer-matching/summary");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    return {
      data: {
        totalOpenTasks: initialTasks.length,
        totalVerifiedCandidates: fallbackCandidates.filter((c) => c.verified).length,
        modelVersion: "Model v2.4",
        decisionsCount: localDecisions.length,
      },
      isLiveBackend: false,
    };
  },

  async getTasks(): Promise<{ data: Task[]; isLiveBackend: boolean }> {
    try {
      const response = await request<Task[]>("/ai-volunteer-matching/tasks");
      if (response && response.success && response.data && response.data.length > 0) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    return { data: initialTasks, isLiveBackend: false };
  },

  async getCandidates(
    taskId: string,
    search?: string
  ): Promise<{ data: Candidate[]; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams({ taskId });
      if (search) params.append("search", search);

      const response = await request<Candidate[]>(`/ai-volunteer-matching/candidates?${params.toString()}`);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    let items = [...fallbackCandidates];
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((c) =>
        [c.name, c.id, c.skills.join(" ")].join(" ").toLowerCase().includes(s)
      );
    }
    return { data: items.sort((a, b) => b.score - a.score), isLiveBackend: false };
  },

  async recordDecision(req: RecordDecisionRequest): Promise<DecisionRecord> {
    try {
      const response = await request<DecisionRecord>("/ai-volunteer-matching/decisions", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        localDecisions = [response.data, ...localDecisions];
        return response.data;
      }
    } catch {
      // Backend offline; fallback
    }

    const record: DecisionRecord = {
      id: `DEC-${Date.now().toString(36).toUpperCase()}`,
      taskId: req.taskId,
      candidateId: req.candidateId,
      candidateName: req.candidateName,
      decision: req.decision,
      rationale: req.rationale,
      date: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
    };

    localDecisions = [record, ...localDecisions];
    return record;
  },

  async getDecisionHistory(): Promise<DecisionRecord[]> {
    try {
      const response = await request<DecisionRecord[]>("/ai-volunteer-matching/decisions");
      if (response && response.success && response.data) {
        localDecisions = response.data;
        return response.data;
      }
    } catch {
      // Backend offline; fallback
    }

    return localDecisions;
  },

  async deleteDecision(id: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/ai-volunteer-matching/decisions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        localDecisions = localDecisions.filter((d) => d.id !== id);
        return true;
      }
    } catch {
      // Fallback
    }

    localDecisions = localDecisions.filter((d) => d.id !== id);
    return true;
  },
};
