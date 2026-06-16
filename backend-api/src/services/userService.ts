import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/errors.js";

export const userService = {
  async updateProfile(userId: string, data: { name?: string }) {
    const name = data.name?.trim();
    if (!name || name.length < 2) throw new AppError(400, "Name must be at least 2 characters");
    if (name.length > 50) throw new AppError(400, "Name must be at most 50 characters");

    const user = await userRepository.update(userId, { name });
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  },
};
