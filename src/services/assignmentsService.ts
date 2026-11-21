import { request } from "./api";
import type {
  Assignment,
  AssignmentsStatsDto,
  AssignmentsQueryDto,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentOptionsDto,
  PaginatedResult,
} from "../types/assignments";

const initialAssignments: Assignment[] = [
  {
    id: "ASN-4421",
    volunteer: "Elena Rossi",
    task: "Evacuation Support",
    location: "North Ward",
    schedule: "13:30–18:00",
    status: "Checked In",
    progress: 82,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "ASN-4418",
    volunteer: "Lin Wei",
    task: "Clinic Support",
    location: "Central Clinic",
    schedule: "12:00–20:00",
    status: "In Progress",
    progress: 65,
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
  },
  {
    id: "ASN-4412",
    volunteer: "Daniel Okafor",
    task: "Supply Dispatch",
    location: "West Warehouse",
    schedule: "10:00–17:00",
    status: "In Progress",
    progress: 76,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: "ASN-4407",
    volunteer: "Musa Bello",
    task: "Rescue Vehicle Standby",
    location: "North Ward",
    schedule: "14:00–22:00",
    status: "Awaiting Acceptance",
    progress: 0,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "ASN-4402",
    volunteer: "Sara Khan",
    task: "Shelter Support",
    location: "Central Ward",
    schedule: "09:00–16:00",
    status: "Checked In",
    progress: 55,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "ASN-4398",
    volunteer: "Maya Fernando",
    task: "Medical Assistance",
    location: "Central Clinic",
    schedule: "08:00–16:00",
    status: "Completed",
    progress: 100,
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: "ASN-4392",
    volunteer: "Theo Martin",
    task: "Rescue Operations",
    location: "West District",
    schedule: "11:00–19:00",
    status: "In Progress",
    progress: 45,
    createdAt: new Date(Date.now() - 210 * 60000).toISOString(),
  },
  {
    id: "ASN-4387",
    volunteer: "Abdul Rahman",
    task: "Transport Support",
    location: "North Ward",
    schedule: "14:00–22:00",
    status: "Awaiting Acceptance",
    progress: 0,
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
  },
];

let fallbackAssignments: Assignment[] = [...initialAssignments];

export const assignmentsService = {
  async getStats(): Promise<{ data: AssignmentsStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<AssignmentsStatsDto>("/assignments/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const localActive = fallbackAssignments.filter((a) => a.status !== "Completed").length;
    const localAwaiting = fallbackAssignments.filter((a) => a.status === "Awaiting Acceptance").length;
    const localCheckedIn = fallbackAssignments.filter((a) => a.status === "Checked In").length;

    const added = fallbackAssignments.length - 8;
    const active = 387 + Math.max(0, added);
    const awaiting = 28 + Math.max(0, localAwaiting - 2);
    const checkedIn = 294 + Math.max(0, localCheckedIn - 2);

    return {
      data: {
        activeAssignments: active,
        awaitingAcceptance: awaiting,
        checkedIn,
        replacementNeeded: 6,
        tasksCount: 64,
        expiringSoonAlert: "12 expire within 2 hours",
        checkedInRate: "76% of active",
      },
      isLiveBackend: false,
    };
  },

  async getAssignments(
    query: AssignmentsQueryDto
  ): Promise<{ data: PaginatedResult<Assignment>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.status) params.append("status", query.status);
      if (query.task) params.append("task", query.task);
      if (query.location) params.append("location", query.location);
      if (query.schedule) params.append("schedule", query.schedule);
      if (query.progress !== undefined) params.append("progress", String(query.progress));
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/assignments${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<Assignment>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    let items = [...fallbackAssignments];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter((item) =>
        [item.id, item.volunteer, item.task, item.location, item.schedule]
          .join(" ")
          .toLowerCase()
          .includes(s)
      );
    }

    if (query.status && query.status !== "All assignment states") {
      items = items.filter((item) => item.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.task && query.task !== "All tasks") {
      items = items.filter((item) => item.task.toLowerCase() === query.task?.toLowerCase());
    }

    if (query.location && query.location !== "All locations") {
      items = items.filter((item) => item.location.toLowerCase() === query.location?.toLowerCase());
    }

    if (query.schedule && query.schedule !== "Any schedule" && query.schedule !== "Today") {
      items = items.filter((item) => item.schedule.toLowerCase() === query.schedule?.toLowerCase());
    }

    if (query.progress !== undefined) {
      if (query.progress === 0) {
        items = items.filter((item) => item.progress === 0);
      } else if (query.progress === 100) {
        items = items.filter((item) => item.progress === 100);
      }
    }

    const page = query.pageNumber || 1;
    const size = query.pageSize || 4;
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const paged = items.slice((page - 1) * size, page * size);

    return {
      data: {
        items: paged,
        totalCount,
        pageNumber: page,
        pageSize: size,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  async getOptions(): Promise<AssignmentOptionsDto> {
    try {
      const response = await request<AssignmentOptionsDto>("/assignments/options");
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const tasks = Array.from(new Set(fallbackAssignments.map((a) => a.task))).sort();
    const locations = Array.from(new Set(fallbackAssignments.map((a) => a.location))).sort();
    const schedules = Array.from(new Set(fallbackAssignments.map((a) => a.schedule))).sort();

    return { tasks, locations, schedules };
  },

  async getById(id: string): Promise<Assignment | null> {
    try {
      const response = await request<Assignment>(`/assignments/${encodeURIComponent(id)}`);
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return fallbackAssignments.find((a) => a.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async createAssignment(requestData: CreateAssignmentRequest): Promise<Assignment> {
    try {
      const response = await request<Assignment>("/assignments", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        fallbackAssignments = [response.data, ...fallbackAssignments];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const randomSuffix = Math.floor(Math.random() * 500) + 4422;
    const newRecord: Assignment = {
      id: `ASN-${randomSuffix}`,
      volunteer: requestData.volunteer,
      task: requestData.task,
      location: requestData.location,
      schedule: requestData.schedule,
      status: "Awaiting Acceptance",
      progress: 0,
      notes: requestData.notes,
      createdAt: new Date().toISOString(),
    };

    fallbackAssignments = [newRecord, ...fallbackAssignments];
    return newRecord;
  },

  async updateAssignment(id: string, requestData: UpdateAssignmentRequest): Promise<Assignment | null> {
    try {
      const response = await request<Assignment>(`/assignments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        fallbackAssignments = fallbackAssignments.map((a) => (a.id === id ? response.data! : a));
        return response.data;
      }
    } catch {
      // Fallback
    }

    const index = fallbackAssignments.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
    if (index !== -1) {
      fallbackAssignments[index] = {
        ...fallbackAssignments[index],
        ...requestData,
      };
      return fallbackAssignments[index];
    }

    return null;
  },

  async exportCsv(query: AssignmentsQueryDto): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.status) params.append("status", query.status);
      if (query.task) params.append("task", query.task);
      if (query.location) params.append("location", query.location);
      if (query.schedule) params.append("schedule", query.schedule);
      if (query.progress !== undefined) params.append("progress", String(query.progress));

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await fetch(`${API_BASE_URL}/assignments/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const res = await this.getAssignments({ ...query, pageNumber: 1, pageSize: 1000 });
    const headers = ["Assignment ID", "Volunteer", "Task", "Location", "Schedule", "Status", "Progress"];
    const rows = res.data.items.map((item) => [
      item.id,
      item.volunteer,
      item.task,
      item.location,
      item.schedule,
      item.status,
      `${item.progress}%`,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
