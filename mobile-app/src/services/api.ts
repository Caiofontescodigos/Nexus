import axios from "axios";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "nexus-token";
const API_URL = "https://w1xqigg0v8.execute-api.us-east-1.amazonaws.com";

const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },
  async register(name: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", { name, email, password });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data;
  },
  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
};

export const tasksApi = {
  async list() {
    const { data } = await api.get("/tasks");
    return data;
  },
  async create(task: { title: string; description?: string; priority?: string }) {
    const { data } = await api.post("/tasks", task);
    return data;
  },
  async update(id: string, task: any) {
    const { data } = await api.put(`/tasks/${id}`, task);
    return data;
  },
  async delete(id: string) {
    await api.delete(`/tasks/${id}`);
  },
  async toggleComplete(id: string) {
    const { data } = await api.patch(`/tasks/${id}/complete`);
    return data;
  },
  async stats() {
    const { data } = await api.get("/tasks/stats");
    return data;
  },
};
