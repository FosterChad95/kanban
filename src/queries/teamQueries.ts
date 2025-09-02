// Removed unused Prisma import - using direct types from includes
import prisma from "../lib/prisma";
import { TEAM_WITH_RELATIONS_INCLUDES } from "../lib/prisma-includes";

/**
 * Get all teams.
 */
export async function getAllTeams() {
  return prisma.team.findMany({
    include: TEAM_WITH_RELATIONS_INCLUDES,
    orderBy: { name: 'asc' },
  });
}

/**
 * Get a single team by ID.
 * @param id Team ID
 */
export async function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: TEAM_WITH_RELATIONS_INCLUDES,
  });
}

/**
 * Create a new team.
 * @param data Team creation data
 */
export async function createTeam(data: {
  name: string;
  userIds?: string[];
  boardIds?: string[];
}) {
  return prisma.$transaction(async (tx) => {
    // Create the team
    const team = await tx.team.create({
      data: {
        name: data.name,
      },
    });

    // Add users to team if provided
    if (data.userIds && data.userIds.length > 0) {
      await tx.userTeam.createMany({
        data: data.userIds.map(userId => ({
          userId,
          teamId: team.id,
        })),
      });
    }

    // Add boards to team if provided
    if (data.boardIds && data.boardIds.length > 0) {
      await tx.teamBoard.createMany({
        data: data.boardIds.map(boardId => ({
          boardId,
          teamId: team.id,
        })),
      });
    }

    // Return the team with all relations
    return tx.team.findUnique({
      where: { id: team.id },
      include: TEAM_WITH_RELATIONS_INCLUDES,
    });
  });
}

/**
 * Update an existing team.
 * @param id Team ID
 * @param data Team update data
 */
export async function updateTeam(id: string, data: {
  name?: string;
  userIds?: string[];
  boardIds?: string[];
}) {
  return prisma.$transaction(async (tx) => {
    // Update team name if provided
    if (data.name) {
      await tx.team.update({
        where: { id },
        data: { name: data.name },
      });
    }

    // Update user associations if provided
    if (data.userIds !== undefined) {
      // Remove all existing user associations
      await tx.userTeam.deleteMany({
        where: { teamId: id },
      });

      // Add new user associations
      if (data.userIds.length > 0) {
        await tx.userTeam.createMany({
          data: data.userIds.map(userId => ({
            userId,
            teamId: id,
          })),
        });
      }
    }

    // Update board associations if provided
    if (data.boardIds !== undefined) {
      // Remove all existing board associations
      await tx.teamBoard.deleteMany({
        where: { teamId: id },
      });

      // Add new board associations
      if (data.boardIds.length > 0) {
        await tx.teamBoard.createMany({
          data: data.boardIds.map(boardId => ({
            boardId,
            teamId: id,
          })),
        });
      }
    }

    // Return the updated team with all relations
    return tx.team.findUnique({
      where: { id },
      include: TEAM_WITH_RELATIONS_INCLUDES,
    });
  });
}

/**
 * Delete a team by ID.
 * @param id Team ID
 */
export async function deleteTeam(id: string) {
  return prisma.team.delete({
    where: { id },
  });
}

/**
 * Get teams for a specific user.
 * @param userId User ID
 */
export async function getTeamsForUser(userId: string) {
  // Optimized: directly query teams with a user filter instead of querying join table first
  return prisma.team.findMany({
    where: {
      users: {
        some: {
          userId: userId,
        },
      },
    },
    include: TEAM_WITH_RELATIONS_INCLUDES,
    orderBy: { name: 'asc' },
  });
}

/**
 * Get teams for a specific user in simple format (id and name only).
 * @param userId User ID
 */
export async function getTeamsForUserSimple(userId: string) {
  const userTeams = await prisma.userTeam.findMany({
    where: { userId },
    include: {
      team: {
        select: { id: true, name: true },
      },
    },
  });

  return userTeams.map((ut) => ut.team);
}

/**
 * Add a user to a team.
 * @param userId User ID
 * @param teamId Team ID
 */
export async function addUserToTeam(userId: string, teamId: string) {
  // Check if the user is already in the team
  const existing = await prisma.userTeam.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (existing) {
    throw new Error("User already in team");
  }

  // Add user to team
  return prisma.userTeam.create({
    data: {
      userId,
      teamId,
    },
  });
}