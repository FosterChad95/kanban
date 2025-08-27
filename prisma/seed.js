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
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "Engineering Task 1",
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
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "Marketing Task 1",
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
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "Admin Private Task",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: false }],
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
      name: "User2 Private Board",
      columns: {
        create: [
          {
            name: "TODO",
            tasks: {
              create: [
                {
                  title: "User2 Private Task",
                  subtasks: {
                    create: [{ title: "Subtask 1", isCompleted: false }],
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
