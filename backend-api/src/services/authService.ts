import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import type { RegisterBody, LoginBody } from "../types/index.js";

const SALT_ROUNDS = 10;

export const authService = {
  async register(data: RegisterBody) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    };
  },

  async login(data: LoginBody) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  },
};
