import type { ApiResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = localStorage.getItem("carelink_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg =
        data.message ||
        (data.errors && data.errors.length > 0 ? data.errors.join(", ") : "An error occurred.");
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error("Unable to reach the CareLink server. Please ensure the backend API is running.");
    }
    throw error;
  }
}
