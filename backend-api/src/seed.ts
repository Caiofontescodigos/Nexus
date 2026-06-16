import prisma from "./config/database.js";
import bcrypt from "bcrypt";

async function seed() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@nexus.com",
      password: hashedPassword,
    },
  });

  const tasks = [
    { title: "Design landing page hero", description: "Create the new hero section with animated gradient background.", completed: true, priority: "high", userId: user.id },
    { title: "Review pull requests", description: "Review pending PRs from the team.", completed: false, priority: "medium", userId: user.id },
    { title: "Write API documentation", description: "Document the new REST endpoints.", completed: false, priority: "medium", userId: user.id },
    { title: "Fix authentication bug", description: "Users are being logged out unexpectedly.", completed: false, priority: "high", userId: user.id },
    { title: "Plan Q1 roadmap", description: "Sync with product team and define objectives.", completed: true, priority: "high", userId: user.id },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log("Seed completed successfully!");
  console.log(`User: demo@nexus.com / 123456`);
  console.log(`Tasks created: ${tasks.length}`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
