import type { ApiResponse } from "../types/auth";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5277/api";

const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function authFetch(
  input: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  let url = typeof input === "string" ? input : input.toString();
  if (url.startsWith("/api/") || url === "/api") {
    url = `${BACKEND_ORIGIN}${url}`;
  } else if (typeof window !== "undefined" && url.startsWith(window.location.origin + "/api")) {
    url = `${BACKEND_ORIGIN}${url.slice(window.location.origin.length)}`;
  }

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("carelink_token") : null;
  if (token && !headers["Authorization"] && !headers["authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

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
      if (response.status === 401 && !endpoint.includes("/auth/login")) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      if (response.status === 403 && !data?.message) {
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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = localStorage.getItem("carelink_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.title) {
            errorMessage = errorData.title;
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the CareLink backend API. Please make sure the backend is running."
        );
      }
      throw error;
    }
  }

  public get<T>(endpoint: string, queryParams?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  public post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  public patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
