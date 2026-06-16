import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Task, TaskStatus } from "@/types";
import { tasksApi } from "@/services/api";

interface TasksCtx {
  tasks: Task[];
  loading: boolean;
  addTask: (data: Pick<Task, "title" | "description"> & { status?: TaskStatus; priority?: Task["priority"] }) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
}

const TasksContext = createContext<TasksCtx | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask: TasksCtx["addTask"] = async (data) => {
    try {
      const created = await tasksApi.create(data);
      setTasks((prev) => [created, ...prev]);
    } catch {
      const temp: Task = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || "",
        status: data.status || "pending",
        priority: data.priority || "medium",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [temp, ...prev]);
    }
  };

  const updateTask: TasksCtx["updateTask"] = async (id, data) => {
    try {
      const updated = await tasksApi.update(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await tasksApi.delete(id);
    } catch {
      setTasks(prev);
    }
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "completed" ? "pending" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
    try {
      await tasksApi.toggleComplete(id);
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: task.status } : t)),
      );
    }
  };

  const setStatus = async (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await tasksApi.update(id, { status });
    } catch {
      loadTasks();
    }
  };

  return (
    <TasksContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, toggleComplete, setStatus }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
