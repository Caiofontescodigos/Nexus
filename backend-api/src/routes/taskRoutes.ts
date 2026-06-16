import { Router } from "express";
import { taskController } from "../controllers/taskController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List all user tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", taskController.list);

/**
 * @openapi
 * /tasks/stats:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics
 */
router.get("/stats", taskController.stats);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task data
 *       403:
 *         description: Forbidden
 */
router.get("/:id", taskController.getById);

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Task created
 */
router.post("/", validate(createTaskSchema), taskController.create);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               completed: { type: boolean }
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden
 */
router.put("/:id", validate(updateTaskSchema), taskController.update);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", taskController.delete);

/**
 * @openapi
 * /tasks/{id}/complete:
 *   patch:
 *     tags: [Tasks]
 *     summary: Toggle task completion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task toggled
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/complete", taskController.toggleComplete);

export default router;
