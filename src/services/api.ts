import axios from "axios";
import type { Task, User } from "@/types";

const TOKEN_KEY = "nexus-token";
const USER_KEY = "nexus-user";

const API_BASE = "https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com/prod";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

function mapBackendTask(t: any): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    status: t.status || (t.completed ? "completed" : "pending"),
    priority: t.priority || "medium",
    createdAt: t.createdAt,
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get("/auth/me");
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put("/users/profile", data);
    const updated = res.data;
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.put("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (data.avatarUrl) {
      const stored = authApi.getStoredUser();
      if (stored) {
        const updated = { ...stored, avatarUrl: data.avatarUrl };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      }
    }
    return data.avatarUrl || "";
  },
};

export const tasksApi = {
  async list(): Promise<Task[]> {
    const { data } = await api.get("/tasks");
    return data.map(mapBackendTask);
  },

  async getById(id: string): Promise<Task> {
    const { data } = await api.get(`/tasks/${id}`);
    return mapBackendTask(data);
  },

  async create(task: { title: string; description?: string; status?: string; priority?: string }): Promise<Task> {
    const { data } = await api.post("/tasks", task);
    return mapBackendTask(data);
  },

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const { data } = await api.put(`/tasks/${id}`, task);
    return mapBackendTask(data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async toggleComplete(id: string): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}/complete`);
    return mapBackendTask(data);
  },

  async stats(): Promise<{ total: number; completed: number; pending: number; rate: number }> {
    const { data } = await api.get("/tasks/stats");
    return data;
  },

  async uploadAttachment(taskId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url || "";
  },
};

export { getErrorMessage };
