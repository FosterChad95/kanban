import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

/**
 * Get all teams.
 */
export async function getAllTeams() {
  return prisma.team.findMany({
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      boards: {
        include: {
          board: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
  });
}

/**
 * Get a single team by ID.
 * @param id Team ID
 */
export async function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      boards: {
        include: {
          board: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
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
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        boards: {
          include: {
            board: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
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
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        boards: {
          include: {
            board: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
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
  const userTeams = await prisma.userTeam.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          boards: {
            include: {
              board: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    },
  });

  return userTeams.map(ut => ut.team);
}