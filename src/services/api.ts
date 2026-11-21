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

    const text = await response.text();
    let data: ApiResponse<T> | null = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON response payload
      }
    }

    if (!response.ok || !data?.success) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      if (response.status === 403) {
        throw new Error("Access denied. Your account does not have permission to perform this action.");
      }

      const detailedErrors =
        data?.errors && data.errors.length > 0 ? data.errors.join(". ") : "";
      let errorMsg =
        data?.message ||
        (response.statusText ? `Request failed: ${response.statusText}` : "An error occurred.");
      if (detailedErrors && !errorMsg.includes(detailedErrors)) {
        errorMsg = data?.message ? `${data.message}: ${detailedErrors}` : detailedErrors;
      }
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
