/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

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
  await prisma.userBoard.deleteMany();
  await prisma.teamBoard.deleteMany();
  await prisma.userTeam.deleteMany();
  await prisma.team.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();

  // Create more users
  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {
      hashedPassword: await bcrypt.hash("user2password", 10),
      role: "USER",
      name: "Regular User",
      emailVerified: new Date(),
    },
    create: {
      email: "user2@example.com",
      hashedPassword: await bcrypt.hash("user2password", 10),
      role: "USER",
      name: "Regular User",
      emailVerified: new Date(),
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "user3@example.com" },
    update: {
      hashedPassword: await bcrypt.hash("user3password", 10),
      role: "USER",
      name: "User Three",
      emailVerified: new Date(),
    },
    create: {
      email: "user3@example.com",
      hashedPassword: await bcrypt.hash("user3password", 10),
      role: "USER",
      name: "User Three",
      emailVerified: new Date(),
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: "user4@example.com" },
    update: {
      hashedPassword: await bcrypt.hash("user4password", 10),
      role: "USER",
      name: "User Four",
      emailVerified: new Date(),
    },
    create: {
      email: "user4@example.com",
      hashedPassword: await bcrypt.hash("user4password", 10),
      role: "USER",
      name: "User Four",
      emailVerified: new Date(),
    },
  });

  // Create more teams
  const team1 = await prisma.team.create({
    data: {
      name: "Demo Team",
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: "Engineering",
    },
  });

  const team3 = await prisma.team.create({
    data: {
      name: "Marketing",
    },
  });

  // Assign users to teams
  await prisma.userTeam.createMany({
    data: [
      { userId: user.id, teamId: team1.id },
      { userId: user2.id, teamId: team1.id },
      { userId: user3.id, teamId: team1.id },

      { userId: user2.id, teamId: team2.id },
      { userId: user3.id, teamId: team2.id },
      { userId: user4.id, teamId: team2.id },

      { userId: user.id, teamId: team3.id },
      { userId: user4.id, teamId: team3.id },
    ],
    skipDuplicates: true,
  });

  // Create a team board for each team
  const team1Board = await prisma.board.create({
    data: {
      name: "Demo Team Board",
      columns: {
        create: [
          {
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "Demo Team Task 1",
                  description: "This is a demo task for the team board",
                  subtasks: {
                    create: [
                      { title: "Subtask 1", isCompleted: false },
                      { title: "Subtask 2", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Demo Team Task 2", 
                  description: "Another demo task",
                  subtasks: {
                    create: [
                      { title: "Research requirements", isCompleted: true },
                      { title: "Create wireframes", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "IN PROGRESS",
            tasks: {
              create: [
                {
                  title: "Demo Team Task 3",
                  description: "Task currently being worked on",
                  subtasks: {
                    create: [
                      { title: "Setup environment", isCompleted: true },
                      { title: "Write code", isCompleted: false },
                      { title: "Write tests", isCompleted: false },
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
                  title: "Demo Team Task 4",
                  description: "Completed task",
                  subtasks: {
                    create: [
                      { title: "All subtasks", isCompleted: true },
                      { title: "Are completed", isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.teamBoard.create({
    data: {
      teamId: team1.id,
      boardId: team1Board.id,
    },
  });

  const team2Board = await prisma.board.create({
    data: {
      name: "Engineering Board",
      columns: {
        create: [
          {
            name: "BACKLOG",
            tasks: {
              create: [
                {
                  title: "Implement User Authentication",
                  description: "Add OAuth and JWT authentication system",
                  subtasks: {
                    create: [
                      { title: "Setup OAuth providers", isCompleted: false },
                      { title: "Configure JWT", isCompleted: false },
                      { title: "Add middleware", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "Database Optimization",
                  description: "Optimize database queries and add indexes",
                  subtasks: {
                    create: [
                      { title: "Analyze slow queries", isCompleted: true },
                      { title: "Add database indexes", isCompleted: false },
                      { title: "Test performance", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "IN PROGRESS",
            tasks: {
              create: [
                {
                  title: "API Documentation",
                  description: "Create comprehensive API documentation",
                  subtasks: {
                    create: [
                      { title: "Document endpoints", isCompleted: true },
                      { title: "Add examples", isCompleted: false },
                      { title: "Review with team", isCompleted: false },
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
                  title: "Setup CI/CD Pipeline",
                  description: "Automated testing and deployment pipeline",
                  subtasks: {
                    create: [
                      { title: "Configure GitHub Actions", isCompleted: true },
                      { title: "Add automated tests", isCompleted: true },
                      { title: "Deploy to staging", isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.teamBoard.create({
    data: {
      teamId: team2.id,
      boardId: team2Board.id,
    },
  });

  const team3Board = await prisma.board.create({
    data: {
      name: "Marketing Board",
      columns: {
        create: [
          {
            name: "IDEAS",
            tasks: {
              create: [
                {
                  title: "Q2 Campaign Strategy",
                  description: "Plan comprehensive marketing strategy for Q2",
                  subtasks: {
                    create: [
                      { title: "Market research", isCompleted: false },
                      { title: "Competitor analysis", isCompleted: false },
                      { title: "Budget allocation", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "PLANNING", 
            tasks: {
              create: [
                {
                  title: "Social Media Campaign",
                  description: "Create engaging social media content",
                  subtasks: {
                    create: [
                      { title: "Content calendar", isCompleted: true },
                      { title: "Design graphics", isCompleted: false },
                      { title: "Schedule posts", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "EXECUTING",
            tasks: {
              create: [
                {
                  title: "Website Redesign",
                  description: "Update company website with new branding",
                  subtasks: {
                    create: [
                      { title: "Wireframes complete", isCompleted: true },
                      { title: "Design mockups", isCompleted: true },
                      { title: "Development", isCompleted: false },
                      { title: "User testing", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "COMPLETED",
            tasks: {
              create: [
                {
                  title: "Brand Guidelines",
                  description: "Comprehensive brand identity guidelines",
                  subtasks: {
                    create: [
                      { title: "Logo variations", isCompleted: true },
                      { title: "Color palette", isCompleted: true },
                      { title: "Typography guide", isCompleted: true },
                      { title: "Usage examples", isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.teamBoard.create({
    data: {
      teamId: team3.id,
      boardId: team3Board.id,
    },
  });

  // Create a private board for admin user
  const adminPrivateBoard = await prisma.board.create({
    data: {
      name: "Admin Private Board",
      columns: {
        create: [
          {
            name: "ADMIN TASKS",
            tasks: {
              create: [
                {
                  title: "System Maintenance",
                  description: "Regular system maintenance and updates",
                  subtasks: {
                    create: [
                      { title: "Database backup", isCompleted: true },
                      { title: "Security updates", isCompleted: false },
                      { title: "Performance monitoring", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "User Management Review",
                  description: "Review user permissions and access levels",
                  subtasks: {
                    create: [
                      { title: "Audit user roles", isCompleted: false },
                      { title: "Update permissions", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "URGENT",
            tasks: {
              create: [
                {
                  title: "Security Patch Deployment",
                  description: "Critical security patches need immediate deployment",
                  subtasks: {
                    create: [
                      { title: "Test patches", isCompleted: true },
                      { title: "Deploy to production", isCompleted: false },
                      { title: "Verify deployment", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "COMPLETED",
            tasks: {
              create: [
                {
                  title: "Server Upgrade",
                  description: "Upgraded production servers to latest version",
                  subtasks: {
                    create: [
                      { title: "Plan upgrade", isCompleted: true },
                      { title: "Execute upgrade", isCompleted: true },
                      { title: "Verify functionality", isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.userBoard.create({
    data: {
      userId: user.id,
      boardId: adminPrivateBoard.id,
    },
  });

  // Create a private board for regular user
  const user2PrivateBoard = await prisma.board.create({
    data: {
      name: "User2 Personal Board",
      columns: {
        create: [
          {
            name: "PERSONAL TASKS",
            tasks: {
              create: [
                {
                  title: "Learn New Technology",
                  description: "Study React 19 new features and best practices",
                  subtasks: {
                    create: [
                      { title: "Read documentation", isCompleted: true },
                      { title: "Build sample project", isCompleted: false },
                      { title: "Share learnings with team", isCompleted: false },
                    ],
                  },
                },
                {
                  title: "Complete Code Review",
                  description: "Review pending pull requests",
                  subtasks: {
                    create: [
                      { title: "Review PR #123", isCompleted: false },
                      { title: "Review PR #124", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "IN PROGRESS",
            tasks: {
              create: [
                {
                  title: "Personal Project",
                  description: "Build portfolio website",
                  subtasks: {
                    create: [
                      { title: "Design wireframes", isCompleted: true },
                      { title: "Setup development environment", isCompleted: true },
                      { title: "Implement frontend", isCompleted: false },
                      { title: "Add responsive design", isCompleted: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "COMPLETED",
            tasks: {
              create: [
                {
                  title: "Team Presentation",
                  description: "Present project updates to the team",
                  subtasks: {
                    create: [
                      { title: "Prepare slides", isCompleted: true },
                      { title: "Practice presentation", isCompleted: true },
                      { title: "Deliver presentation", isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.userBoard.create({
    data: {
      userId: user2.id,
      boardId: user2PrivateBoard.id,
    },
  });

  // Seed Account, Session, VerificationToken for admin user (minimal example)
  await prisma.account.create({
    data: {
      userId: user.id,
      type: "oauth",
      provider: "github",
      providerAccountId: "admin_github_id",
      access_token: "dummy_access_token",
    },
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: "dummy_session_token",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: "dummy_verification_token",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  console.log(
    "Seeded users, team, team board, private boards, and auth tables."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
