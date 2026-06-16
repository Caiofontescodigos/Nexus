import { taskRepository } from "../repositories/taskRepository.js";
import { AppError } from "../utils/errors.js";
import type { CreateTaskBody, UpdateTaskBody } from "../types/index.js";

function statusFromCompleted(completed: boolean, status?: string): string {
  if (status && ["pending", "in_progress", "completed"].includes(status)) return status;
  return completed ? "completed" : "pending";
}

function mapTask(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: statusFromCompleted(task.completed, task.status),
    priority: task.priority || "medium",
    createdAt: task.createdAt?.toISOString?.() || task.createdAt,
    completed: task.completed,
  };
}

function prepareDbData(data: any) {
  const dbData: any = {};
  if (data.title !== undefined) dbData.title = data.title;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.priority !== undefined) dbData.priority = data.priority;
  if (data.status !== undefined) {
    dbData.completed = data.status === "completed";
    dbData.status = data.status;
  }
  if (data.completed !== undefined) dbData.completed = data.completed;
  return dbData;
}

export const taskService = {
  async list(userId: string) {
    const tasks = await taskRepository.findByUserId(userId);
    return tasks.map(mapTask);
  },

  async getById(id: string, userId: string) {
    const task = await taskRepository.findByIdAndUser(id, userId);
    if (!task) {
      throw new AppError(403, "Forbidden");
    }
    return mapTask(task);
  },

  async create(userId: string, data: any) {
    const dbData = prepareDbData(data);
    const created = await taskRepository.create(userId, dbData);
    return mapTask(created);
  },

  async update(id: string, userId: string, data: any) {
    const task = await taskRepository.findByIdAndUser(id, userId);
    if (!task) {
      throw new AppError(403, "Forbidden");
    }
    const dbData = prepareDbData(data);
    await taskRepository.update(id, userId, dbData);
    const updated = await taskRepository.findByIdAndUser(id, userId);
    return updated ? mapTask(updated) : null;
  },

  async delete(id: string, userId: string) {
    const task = await taskRepository.findByIdAndUser(id, userId);
    if (!task) {
      throw new AppError(403, "Forbidden");
    }
    await taskRepository.delete(id, userId);
  },

  async toggleComplete(id: string, userId: string) {
    const task = await taskRepository.findByIdAndUser(id, userId);
    if (!task) {
      throw new AppError(403, "Forbidden");
    }
    await taskRepository.update(id, userId, { completed: !task.completed });
    const updated = await taskRepository.findByIdAndUser(id, userId);
    return updated ? mapTask(updated) : null;
  },

  async getStats(userId: string) {
    return taskRepository.getStats(userId);
  },
};
