import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "chadfosta@gmail.com";
  const plainPassword = "Name40021995!";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      hashedPassword,
      role: "ADMIN",
      name: "Chad Foster",
      emailVerified: new Date(),
    },
    create: {
      email,
      hashedPassword,
      role: "ADMIN",
      name: "Chad Foster",
      emailVerified: new Date(),
    },
  });

  console.log("Seeded user:", {
    id: user.id,
    email: user.email,
    role: user.role,
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
