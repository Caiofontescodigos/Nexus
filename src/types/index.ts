export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  priority?: "low" | "medium" | "high";
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
