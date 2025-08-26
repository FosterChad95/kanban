import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const plainPassword = process.env.SEED_USER_PASSWORD;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      hashedPassword,
      role: "ADMIN",
      name: process.env.SEED_USER_NAME || "Admin User",
      emailVerified: new Date(),
    },
    create: {
      email,
      hashedPassword,
      role: "ADMIN",
      name: process.env.SEED_USER_NAME || "Admin User",
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
