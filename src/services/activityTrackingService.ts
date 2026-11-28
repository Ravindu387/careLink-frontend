import { request, authFetch } from "./api";
import type {
  ActivityRecord,
  ActivityType,
  ActivityTrackingStatsDto,
  ActivityTrackingQueryDto,
  ManualCheckInRequest,
  RecordActivityRequest,
  UpdateActivityRequest,
  PaginatedResult,
} from "../types/activityTracking";

const initialActivities: ActivityRecord[] = [
  {
    id: "ACT-001",
    time: "13:42",
    volunteer: "Elena Rossi",
    activity: "Checked in",
    task: "TASK-782",
    location: "North Ward",
    verification: "GPS verified",
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "ACT-002",
    time: "13:28",
    volunteer: "Daniel Okafor",
    activity: "Progress update",
    task: "TASK-761",
    location: "West Warehouse",
    verification: "76% complete",
    createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
  },
  {
    id: "ACT-003",
    time: "13:10",
    volunteer: "Lin Wei",
    activity: "Break started",
    task: "TASK-779",
    location: "Central Clinic",
    verification: "Scheduled",
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
  },
  {
    id: "ACT-004",
    time: "12:55",
    volunteer: "Musa Bello",
    activity: "Assignment accepted",
    task: "TASK-782",
    location: "North Ward",
    verification: "On time",
    createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
  },
  {
    id: "ACT-005",
    time: "12:40",
    volunteer: "Sara Khan",
    activity: "Training completed",
    task: "TRN-104",
    location: "Remote",
    verification: "Passed",
    createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
  },
  {
    id: "ACT-006",
    time: "12:25",
    volunteer: "Theo Martin",
    activity: "Checked in",
    task: "TASK-774",
    location: "Eastbank Hub",
    verification: "GPS verified",
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(),
  },
  {
    id: "ACT-007",
    time: "12:10",
    volunteer: "Maya Fernando",
    activity: "Progress update",
    task: "TASK-768",
    location: "Riverton School",
    verification: "50% complete",
    createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
  },
  {
    id: "ACT-008",
    time: "11:55",
    volunteer: "Abdul Rahman",
    activity: "Checked out",
    task: "TASK-761",
    location: "West District",
    verification: "GPS verified",
    createdAt: new Date(Date.now() - 125 * 60000).toISOString(),
  },
  {
    id: "ACT-009",
    time: "11:40",
    volunteer: "Elena Rossi",
    activity: "Progress update",
    task: "TASK-782",
    location: "North Ward",
    verification: "82% complete",
    createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
  },
  {
    id: "ACT-010",
    time: "11:20",
    volunteer: "Daniel Okafor",
    activity: "Assignment accepted",
    task: "TASK-774",
    location: "Eastbank Hub",
    verification: "On time",
    createdAt: new Date(Date.now() - 160 * 60000).toISOString(),
  },
];

let fallbackActivities: ActivityRecord[] = [...initialActivities];

export const activityTrackingService = {
  async getStats(): Promise<{ data: ActivityTrackingStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<ActivityTrackingStatsDto>("/activity-tracking/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    return {
      data: {
        volunteersCheckedIn: 294,
        hoursToday: "2,184h",
        tasksOnTrack: "89.4%",
        safetyAlerts: 3,
        lastSync: "Just now",
        operationalAreasCount: 12,
        presenceSummary: {
          medicalTeams: 58,
          logistics: 96,
          shelterSupport: 74,
          areas: [
            { name: "North Ward", count: 42, position: "top-[26%] left-[30%]" },
            { name: "Eastbank", count: 64, position: "top-[26%] right-[22%]" },
            { name: "Central", count: 86, position: "top-[52%] left-[52%]" },
            { name: "West District", count: 31, position: "bottom-[16%] left-[19%]" },
          ],
        },
      },
      isLiveBackend: false,
    };
  },

  async getActivities(
    query: ActivityTrackingQueryDto
  ): Promise<{ data: PaginatedResult<ActivityRecord>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.activity) params.append("activity", query.activity);
      if (query.location) params.append("location", query.location);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/activity-tracking${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<ActivityRecord>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    let items = [...fallbackActivities];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter((item) =>
        [item.id, item.volunteer, item.activity, item.task, item.location]
          .join(" ")
          .toLowerCase()
          .includes(s)
      );
    }

    if (query.activity && query.activity !== "All activities") {
      items = items.filter((item) => item.activity.toLowerCase() === query.activity?.toLowerCase());
    }

    if (query.location && query.location !== "All locations") {
      items = items.filter((item) => item.location.toLowerCase() === query.location?.toLowerCase());
    }

    const page = query.pageNumber || 1;
    const size = query.pageSize || 10;
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

  async getLocations(): Promise<string[]> {
    try {
      const response = await request<string[]>("/activity-tracking/locations");
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return Array.from(new Set(fallbackActivities.map((a) => a.location))).sort();
  },

  async manualCheckIn(requestData: ManualCheckInRequest): Promise<ActivityRecord> {
    try {
      const response = await request<ActivityRecord>("/activity-tracking/check-in", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        fallbackActivities = [response.data, ...fallbackActivities];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const time = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newRecord: ActivityRecord = {
      id: `ACT-${fallbackActivities.length + 1}`,
      time,
      volunteer: requestData.volunteer,
      activity: "Checked in",
      task: requestData.task,
      location: requestData.location,
      verification: requestData.verification || "GPS verified",
      createdAt: new Date().toISOString(),
    };

    fallbackActivities = [newRecord, ...fallbackActivities];
    return newRecord;
  },

  async recordActivity(requestData: RecordActivityRequest): Promise<ActivityRecord> {
    try {
      const response = await request<ActivityRecord>("/activity-tracking", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        fallbackActivities = [response.data, ...fallbackActivities];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const time = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newRecord: ActivityRecord = {
      id: `ACT-${fallbackActivities.length + 1}`,
      time,
      volunteer: requestData.volunteer,
      activity: requestData.activity as ActivityType,
      task: requestData.task,
      location: requestData.location,
      verification: requestData.verification || "Manual entry",
      createdAt: new Date().toISOString(),
    };

    fallbackActivities = [newRecord, ...fallbackActivities];
    return newRecord;
  },

  async getActivityById(id: string): Promise<ActivityRecord | null> {
    try {
      const response = await request<ActivityRecord>(`/activity-tracking/${encodeURIComponent(id)}`);
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return fallbackActivities.find((a) => a.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async updateActivity(id: string, updates: UpdateActivityRequest): Promise<ActivityRecord | null> {
    try {
      const response = await request<ActivityRecord>(`/activity-tracking/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (response && response.success && response.data) {
        fallbackActivities = fallbackActivities.map((a) => (a.id === id ? response.data : a));
        return response.data;
      }
    } catch {
      // Fallback
    }

    const idx = fallbackActivities.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      fallbackActivities[idx] = {
        ...fallbackActivities[idx],
        ...updates,
      };
      return fallbackActivities[idx];
    }
    return null;
  },

  async deleteActivity(id: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/activity-tracking/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        fallbackActivities = fallbackActivities.filter((a) => a.id !== id);
        return true;
      }
    } catch {
      // Fallback
    }

    fallbackActivities = fallbackActivities.filter((a) => a.id !== id);
    return true;
  },

  async exportCsv(query: ActivityTrackingQueryDto): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.activity) params.append("activity", query.activity);
      if (query.location) params.append("location", query.location);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await authFetch(`${API_BASE_URL}/activity-tracking/export?${params.toString()}`, {
        headers,
      });
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const res = await this.getActivities({ ...query, pageNumber: 1, pageSize: 1000 });
    const headers = ["Activity ID", "Time", "Volunteer", "Activity", "Task", "Location", "Verification"];
    const rows = res.data.items.map((item) => [
      item.id,
      item.time,
      item.volunteer,
      item.activity,
      item.task,
      item.location,
      item.verification,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
