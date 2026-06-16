import type { Response, NextFunction } from "express";
import { taskService } from "../services/taskService.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const taskController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.list(req.user!.userId);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getById(req.params.id as string, req.user!.userId);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(req.user!.userId, req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id as string, req.user!.userId, req.body);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id as string, req.user!.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async toggleComplete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.toggleComplete(req.params.id as string, req.user!.userId);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async stats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await taskService.getStats(req.user!.userId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};
