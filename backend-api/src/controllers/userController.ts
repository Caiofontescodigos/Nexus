import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { userService } from "../services/userService.js";

export const userController = {
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
