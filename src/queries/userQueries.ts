import { Prisma, Role } from "@prisma/client";
import prisma from "../lib/prisma";
import { USER_WITH_AUTH_INCLUDES } from "../lib/prisma-includes";

/**
 * Get all users.
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    include: USER_WITH_AUTH_INCLUDES,
  });
}

/**
 * Get a single user by ID.
 * @param id User ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: USER_WITH_AUTH_INCLUDES,
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
    include: USER_WITH_AUTH_INCLUDES,
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
    include: USER_WITH_AUTH_INCLUDES,
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

/**
 * Get all users in a format suitable for dropdowns/selection.
 * Returns users with consistent naming (avatar instead of image).
 */
export async function getUserOptions() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  // Transform to expected shape
  return users.map((user) => ({
    id: user.id,
    name: user.name || "Unnamed User",
    avatar: user.image || undefined,
    email: user.email || undefined,
  }));
}

/**
 * Check if an email is already taken by another user (excluding the given user ID).
 * @param email Email to check
 * @param excludeUserId User ID to exclude from the check
 */
export async function isEmailTaken(email: string, excludeUserId?: string) {
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      ...(excludeUserId && { NOT: { id: excludeUserId } }),
    },
  });
  
  return existingUser !== null;
}

/**
 * Update a user with the given data.
 * Transforms avatar field to image field for database consistency.
 * @param id User ID
 * @param data Update data
 */
export async function updateUserProfile(
  id: string,
  data: {
    name?: string;
    email?: string;
    avatar?: string;
  }
) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.avatar && { image: data.avatar }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get user by email for authentication.
 * @param email User email
 */
export async function getUserByEmailForAuth(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      hashedPassword: true,
      role: true,
    },
  });
}
