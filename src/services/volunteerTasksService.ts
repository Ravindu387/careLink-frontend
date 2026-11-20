import { request } from "./api";
import type {
  VolunteerTaskItem,
  VolunteerTaskQuery,
  VolunteerTaskTabsCount,
  CreateVolunteerTaskPayload,
  UpdateVolunteerTaskPayload,
  VolunteerTasksOverviewResponse,
  TaskStatus,
} from "../types/volunteerTasks";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialTasks: VolunteerTaskItem[] = [
  {
    id: "TASK-782",
    title: "Evacuation transport support",
    location: "North Ward",
    skills: ["Driving", "Rescue"],
    priority: "Critical",
    schedule: "Today · 14:00",
    volunteers: "2 / 3",
    status: "In Progress",
  },
  {
    id: "TASK-779",
    title: "Medical point registration",
    location: "Central Clinic",
    skills: ["First Aid", "Admin"],
    priority: "High",
    schedule: "Today · 15:30",
    volunteers: "1 / 2",
    status: "Assigned",
  },
  {
    id: "TASK-774",
    title: "Food pack distribution",
    location: "Eastbank Hub",
    skills: ["Logistics"],
    priority: "High",
    schedule: "Today · 16:00",
    volunteers: "4 / 6",
    status: "Open",
  },
  {
    id: "TASK-768",
    title: "Shelter childcare support",
    location: "Riverton School",
    skills: ["Childcare"],
    priority: "Medium",
    schedule: "Tomorrow · 08:00",
    volunteers: "0 / 3",
    status: "Open",
  },
  {
    id: "TASK-761",
    title: "Multilingual hotline",
    location: "Remote",
    skills: ["Translation"],
    priority: "Medium",
    schedule: "Tomorrow · 09:00",
    volunteers: "2 / 4",
    status: "Awaiting Acceptance",
  },
  {
    id: "TASK-682",
    title: "Emergency dispatch staging",
    location: "North Ward",
    skills: ["Driving", "Rescue"],
    priority: "Critical",
    schedule: "Today · 14:00",
    volunteers: "2 / 3",
    status: "In Progress",
  },
  {
    id: "TASK-679",
    title: "Clinic intake verification",
    location: "Central Clinic",
    skills: ["First Aid", "Admin"],
    priority: "High",
    schedule: "Today · 15:30",
    volunteers: "1 / 2",
    status: "Assigned",
  },
  {
    id: "TASK-674",
    title: "Dry ration bulk packaging",
    location: "Eastbank Hub",
    skills: ["Logistics"],
    priority: "High",
    schedule: "Today · 16:00",
    volunteers: "4 / 6",
    status: "Open",
  },
  {
    id: "TASK-668",
    title: "Community shelter assistance",
    location: "Riverton School",
    skills: ["Childcare"],
    priority: "Medium",
    schedule: "Tomorrow · 08:00",
    volunteers: "0 / 3",
    status: "Open",
  },
  {
    id: "TASK-661",
    title: "Disaster hotline operator",
    location: "Remote",
    skills: ["Translation"],
    priority: "Medium",
    schedule: "Tomorrow · 09:00",
    volunteers: "2 / 4",
    status: "Awaiting Acceptance",
  },
  {
    id: "TASK-655",
    title: "Emergency medical assistance",
    location: "Central Ward",
    skills: ["Medical", "First Aid"],
    priority: "Critical",
    schedule: "Today · 17:00",
    volunteers: "1 / 4",
    status: "Open",
  },
  {
    id: "TASK-648",
    title: "Warehouse supply management",
    location: "West District",
    skills: ["Logistics"],
    priority: "Low",
    schedule: "Tomorrow · 10:00",
    volunteers: "3 / 3",
    status: "Completed",
  },
];

function getLocalTasks(): VolunteerTaskItem[] {
  try {
    const raw = localStorage.getItem("carelink_volunteer_tasks");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return initialTasks;
}

export const volunteerTasksService = {
  /**
   * Retrieves volunteer tasks according to query filters and pagination
   */
  async getTasks(
    query: VolunteerTaskQuery = {}
  ): Promise<{ data: VolunteerTasksOverviewResponse; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.priority) params.append("priority", query.priority);
      if (query.location) params.append("location", query.location);
      if (query.skill) params.append("skill", query.skill);
      if (query.schedule) params.append("schedule", query.schedule);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/volunteer/tasks${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<VolunteerTasksOverviewResponse>(url);

      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const tasks = getLocalTasks();
    const search = (query.search || "").toLowerCase().trim();
    const priority = query.priority || "All priorities";
    const location = query.location || "All locations";
    const skill = query.skill || "All skill groups";
    const schedule = query.schedule || "Any schedule";
    const tab = query.tab || "All tasks";

    const filtered = tasks.filter((task) => {
      const searchMatch =
        !search ||
        task.id.toLowerCase().includes(search) ||
        task.title.toLowerCase().includes(search) ||
        task.location.toLowerCase().includes(search) ||
        task.skills.join(" ").toLowerCase().includes(search);

      const priorityMatch = priority === "All priorities" || task.priority === priority;
      const locationMatch = location === "All locations" || task.location === location;
      const skillMatch =
        skill === "All skill groups" ||
        task.skills.some((s) => s.toLowerCase() === skill.toLowerCase());

      const scheduleMatch =
        schedule === "Any schedule" ||
        (schedule === "Today" && task.schedule.startsWith("Today")) ||
        (schedule === "Tomorrow" && task.schedule.startsWith("Tomorrow"));

      let tabMatch = true;
      if (tab === "Open") tabMatch = task.status === "Open";
      else if (tab === "Assigned")
        tabMatch = task.status === "Assigned" || task.status === "Awaiting Acceptance";
      else if (tab === "In progress") tabMatch = task.status === "In Progress";
      else if (tab === "Completed") tabMatch = task.status === "Completed";

      return searchMatch && priorityMatch && locationMatch && skillMatch && scheduleMatch && tabMatch;
    });

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 10;
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paged = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    const tabCounts: VolunteerTaskTabsCount = {
      allTasks: tasks.length,
      open: tasks.filter((t) => t.status === "Open").length,
      assigned: tasks.filter(
        (t) => t.status === "Assigned" || t.status === "Awaiting Acceptance"
      ).length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    };

    return {
      data: {
        tasks: paged,
        tabCounts,
        locations: [
          "North Ward",
          "Central Clinic",
          "Eastbank Hub",
          "Riverton School",
          "Remote",
          "Central Ward",
          "West District",
        ],
        skillGroups: [
          "Driving",
          "Rescue",
          "First Aid",
          "Admin",
          "Logistics",
          "Childcare",
          "Translation",
          "Medical",
        ],
        priorities: ["Critical", "High", "Medium", "Low"],
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  /**
   * Retrieves tab counts
   */
  async getCounts(): Promise<VolunteerTaskTabsCount> {
    try {
      const response = await request<VolunteerTaskTabsCount>("/volunteer/tasks/counts");
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    return {
      allTasks: tasks.length,
      open: tasks.filter((t) => t.status === "Open").length,
      assigned: tasks.filter((t) => t.status === "Assigned" || t.status === "Awaiting Acceptance").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    };
  },

  /**
   * Creates a new volunteer task
   */
  async createTask(
    payload: CreateVolunteerTaskPayload
  ): Promise<{ data: VolunteerTaskItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerTaskItem>("/volunteer/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          volunteers: Number(payload.volunteers) || 1,
        }),
      });

      if (response && response.success && response.data) {
        const tasks = getLocalTasks();
        tasks.unshift(response.data);
        localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const newTask: VolunteerTaskItem = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: payload.title.trim(),
      location: payload.location.trim(),
      skills: payload.skills,
      priority: payload.priority,
      schedule: `${payload.date || "Today"} · ${payload.time || "12:00"}`,
      volunteers: `0 / ${payload.volunteers}`,
      status: "Open",
    };

    const tasks = getLocalTasks();
    tasks.unshift(newTask);
    localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));

    return { data: newTask, isLiveBackend: false };
  },

  /**
   * Retrieves a task by id
   */
  async getTaskById(
    id: string
  ): Promise<{ data: VolunteerTaskItem | null; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerTaskItem>(`/volunteer/tasks/${id}`);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    const task = tasks.find((t) => t.id.toLowerCase() === id.toLowerCase()) || null;
    return { data: task, isLiveBackend: false };
  },

  /**
   * Updates task details
   */
  async updateTask(
    id: string,
    payload: UpdateVolunteerTaskPayload
  ): Promise<{ data: VolunteerTaskItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerTaskItem>(`/volunteer/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response && response.success && response.data) {
        const tasks = getLocalTasks();
        const index = tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
        if (index !== -1) {
          tasks[index] = response.data;
          localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    const index = tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Task ${id} not found.`);
    }

    const existing = tasks[index];
    const updated: VolunteerTaskItem = {
      ...existing,
      ...(payload.title && { title: payload.title }),
      ...(payload.location && { location: payload.location }),
      ...(payload.skills && { skills: payload.skills }),
      ...(payload.priority && { priority: payload.priority }),
      ...(payload.schedule && { schedule: payload.schedule }),
      ...(payload.status && { status: payload.status }),
      ...(payload.requiredVolunteers !== undefined && {
        requiredVolunteers: payload.requiredVolunteers,
        volunteers: `${existing.assignedVolunteers ?? 0} / ${payload.requiredVolunteers}`,
      }),
    };

    tasks[index] = updated;
    localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
    return { data: updated, isLiveBackend: false };
  },

  /**
   * Updates task status
   */
  async updateTaskStatus(
    id: string,
    status: TaskStatus
  ): Promise<{ data: VolunteerTaskItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerTaskItem>(`/volunteer/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (response && response.success && response.data) {
        const tasks = getLocalTasks();
        const index = tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
        if (index !== -1) {
          tasks[index] = response.data;
          localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    const index = tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Task ${id} not found.`);
    }

    const updated = { ...tasks[index], status };
    tasks[index] = updated;
    localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
    return { data: updated, isLiveBackend: false };
  },

  /**
   * Adjusts volunteer count
   */
  async adjustVolunteers(
    id: string,
    delta: number
  ): Promise<{ data: VolunteerTaskItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerTaskItem>(`/volunteer/tasks/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ delta }),
      });

      if (response && response.success && response.data) {
        const tasks = getLocalTasks();
        const index = tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
        if (index !== -1) {
          tasks[index] = response.data;
          localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    const index = tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Task ${id} not found.`);
    }

    const item = tasks[index];
    const parts = (item.volunteers || "0 / 1").split("/").map((s) => parseInt(s.trim(), 10) || 0);
    const assigned = parts[0] || item.assignedVolunteers || 0;
    const required = parts[1] || item.requiredVolunteers || 1;
    const nextAssigned = Math.max(0, Math.min(required, assigned + delta));
    const nextVolunteers = `${nextAssigned} / ${required}`;
    let nextStatus = item.status;
    if (nextAssigned === 0 && item.status !== "Completed") {
      nextStatus = "Open";
    } else if (nextAssigned > 0 && item.status === "Open") {
      nextStatus = "Assigned";
    }

    const updated = {
      ...item,
      assignedVolunteers: nextAssigned,
      requiredVolunteers: required,
      volunteers: nextVolunteers,
      status: nextStatus,
    };
    tasks[index] = updated;
    localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
    return { data: updated, isLiveBackend: false };
  },

  /**
   * Deletes a task
   */
  async deleteTask(id: string): Promise<{ success: boolean; isLiveBackend: boolean }> {
    try {
      const response = await request<boolean>(`/volunteer/tasks/${id}`, {
        method: "DELETE",
      });

      if (response && response.success) {
        const tasks = getLocalTasks().filter((t) => t.id.toLowerCase() !== id.toLowerCase());
        localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
        return { success: true, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks().filter((t) => t.id.toLowerCase() !== id.toLowerCase());
    localStorage.setItem("carelink_volunteer_tasks", JSON.stringify(tasks));
    return { success: true, isLiveBackend: false };
  },

  /**
   * Exports filtered tasks as CSV
   */
  async exportTasksCsv(query: VolunteerTaskQuery = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.priority) params.append("priority", query.priority);
      if (query.location) params.append("location", query.location);
      if (query.skill) params.append("skill", query.skill);
      if (query.schedule) params.append("schedule", query.schedule);

      const res = await fetch(`${API_BASE_URL}/volunteer/tasks/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const { data } = await this.getTasks({ ...query, pageSize: 1000 });
    const headers = [
      "Task ID",
      "Task Title",
      "Location",
      "Required Skills",
      "Priority",
      "Schedule",
      "Volunteers",
      "Status",
    ];

    const rows = data.tasks.map((task) => [
      task.id,
      task.title,
      task.location,
      task.skills.join(" / "),
      task.priority,
      task.schedule,
      task.volunteers,
      task.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};
