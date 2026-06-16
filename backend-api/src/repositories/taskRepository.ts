import prisma from "../config/database.js";
import type { CreateTaskBody, UpdateTaskBody } from "../types/index.js";

export const taskRepository = {
  findByUserId(userId: string) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdAndUser(id: string, userId: string) {
    return prisma.task.findFirst({ where: { id, userId } });
  },

  create(userId: string, data: CreateTaskBody) {
    return prisma.task.create({
      data: { ...data, userId },
    });
  },

  update(id: string, userId: string, data: UpdateTaskBody) {
    return prisma.task.updateMany({
      where: { id, userId },
      data,
    });
  },

  delete(id: string, userId: string) {
    return prisma.task.deleteMany({ where: { id, userId } });
  },

  async getStats(userId: string) {
    const tasks = await prisma.task.findMany({ where: { userId } });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, rate };
  },
};
