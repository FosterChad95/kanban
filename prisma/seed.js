import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const name = process.env.SEED_USER_NAME || "Admin User";
  const plainPassword = process.env.SEED_USER_PASSWORD;

  if (!email || !plainPassword) {
    throw new Error(
      "Missing required env vars: SEED_USER_EMAIL and SEED_USER_PASSWORD"
    );
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      hashedPassword,
      role: "ADMIN",
      name: name,
      emailVerified: new Date(),
    },
    create: {
      email,
      hashedPassword,
      role: "ADMIN",
      name: name,
      emailVerified: new Date(),
    },
  });

  console.log("Seeded user:", {
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Clear existing board data to make seeding idempotent
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();

  // Seed a demo board with columns, tasks, and subtasks
  const board = await prisma.board.create({
    data: {
      name: "Demo Board",
      columns: {
        create: [
          {
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "Build UI for onboarding flow",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Build UI for search",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Build settings UI",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "QA and test all major user journeys",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "DOING",
            tasks: {
              create: [
                {
                  title: "Design settings and search pages",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Add account management endpoints",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Design onboarding flow",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Add search endpoints",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "DONE",
            tasks: {
              create: [
                {
                  title: "Conduct 5 wireframe tests",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: true }],
                  },
                },
                {
                  title: "Create wireframe prototype",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: true }],
                  },
                },
                {
                  title: "Review results of usability tests and iterate",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: true }],
                  },
                },
                {
                  title:
                    "Create paper prototypes and conduct 10 usability tests with potential customers",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: true }],
                  },
                },
                {
                  title: "Market discovery",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: true }],
                  },
                },
                {
                  title: "Competitor analysis",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: true }],
                  },
                },
                {
                  title: "Research the market",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: true },
                      { title: "Subtask 2", isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      columns: { include: { tasks: { include: { subtasks: true } } } },
    },
  });

  console.log("Seeded board:", {
    id: board.id,
    name: board.name,
    columns: board.columns.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
