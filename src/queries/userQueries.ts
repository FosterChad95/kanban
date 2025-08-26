import { Prisma, Role } from "@prisma/client";
import prisma from "../lib/prisma";

/**
 * Get all users.
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    include: { accounts: true, sessions: true },
  });
}

/**
 * Get a single user by ID.
 * @param id User ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { accounts: true, sessions: true },
  });
}

/**
 * Create a new user.
 * @param data User creation data (Prisma.UserCreateInput)
 */
export async function createUser(data: Prisma.UserCreateInput) {
  const payload: Prisma.UserCreateInput = {
    ...data,
    role: data.role ?? Role.USER,
  };

  return prisma.user.create({
    data: payload,
    include: { accounts: true, sessions: true },
  });
}

/**
 * Update an existing user.
 * @param id User ID
 * @param data User update data (Prisma.UserUpdateInput)
 */
export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id },
    data,
    include: { accounts: true, sessions: true },
  });
}

/**
 * Delete a user by ID.
 * @param id User ID
 */
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
