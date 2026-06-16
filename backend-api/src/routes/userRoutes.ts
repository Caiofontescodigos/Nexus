import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { userController } from "../controllers/userController.js";

const router = Router();

router.put("/profile", authenticate, userController.updateProfile);

export default router;
