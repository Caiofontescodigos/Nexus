import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./utils/errors.js";

const app = express();

app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nexus API",
      version: "1.0.0",
      description: "Nexus Task Manager API - Sistemas Distribuídos",
    },
    servers: [{ url: `http://localhost:${env.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "nexus-api" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Nexus API running on http://localhost:${env.port}`);
  console.log(`Swagger docs: http://localhost:${env.port}/api-docs`);
});

export default app;
