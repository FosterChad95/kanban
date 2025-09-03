import { pusher } from './pusher';
import prisma from './prisma';

// Event types for different operations
export const PUSHER_EVENTS = {
  // Board events
  BOARD_CREATED: 'board-created',
  BOARD_UPDATED: 'board-updated',
  BOARD_DELETED: 'board-deleted',
  
  // Task events  
  TASK_CREATED: 'task-created',
  TASK_UPDATED: 'task-updated',
  TASK_DELETED: 'task-deleted',
  
  // Column events
  COLUMN_CREATED: 'column-created',
  COLUMN_UPDATED: 'column-updated',
  COLUMN_DELETED: 'column-deleted',
  
  // Team events
  TEAM_CREATED: 'team-created',
  TEAM_UPDATED: 'team-updated',
  TEAM_DELETED: 'team-deleted',
  TEAM_USER_ADDED: 'team-user-added',
  TEAM_USER_REMOVED: 'team-user-removed',
} as const;

// Channel naming conventions
const getChannelNames = {
  board: (boardId: string) => `board-${boardId}`,
  team: (teamId: string) => `team-${teamId}`,
  user: (userId: string) => `user-${userId}`,
  global: () => 'global',
};

// Helper function to get all users who have access to a board
async function getUsersWithBoardAccess(boardId: string): Promise<string[]> {
  const boardAccess = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      users: { include: { user: true } },
      teams: { 
        include: { 
          team: { 
            include: { 
              users: { include: { user: true } } 
            } 
          } 
        } 
      },
    },
  });

  if (!boardAccess) return [];

  const userIds = new Set<string>();
  
  // Add direct board users
  boardAccess.users.forEach((ub: any) => userIds.add(ub.user.id));
  
  // Add team users
  boardAccess.teams.forEach((tb: any) => {
    tb.team.users.forEach((tu: any) => userIds.add(tu.user.id));
  });

  return Array.from(userIds);
}

// Helper function to get all users in a team
async function getUsersInTeam(teamId: string): Promise<string[]> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      users: { include: { user: true } },
    },
  });

  if (!team) return [];

  return team.users.map((ut: any) => ut.user.id);
}

// Board event triggers
export async function triggerBoardCreated(boardId: string, boardData: any, creatorId: string, userIds?: string[]) {
  let affectedUserIds = userIds;
  
  // If userIds not provided, try to get them from the database
  if (!affectedUserIds) {
    console.log('No userIds provided for board creation, fetching from database:', boardId);
    const fetchedUserIds = await getUsersWithBoardAccess(boardId);
    
    // If database fetch fails, fall back to creator ID to ensure at least the creator gets the event
    affectedUserIds = fetchedUserIds.length > 0 ? fetchedUserIds : [creatorId];
    console.log('Board creation affected users:', affectedUserIds);
  }
  
  // Trigger on board channel
  await pusher.trigger(getChannelNames.board(boardId), PUSHER_EVENTS.BOARD_CREATED, {
    board: boardData,
    createdBy: creatorId,
    timestamp: new Date().toISOString(),
  });

  // Trigger on each user's personal channel
  console.log('Triggering board creation events for', affectedUserIds.length, 'users');
  for (const userId of affectedUserIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.BOARD_CREATED, {
      board: boardData,
      createdBy: creatorId,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerBoardUpdated(boardId: string, boardData: any, updatedBy: string) {
  const userIds = await getUsersWithBoardAccess(boardId);
  
  await pusher.trigger(getChannelNames.board(boardId), PUSHER_EVENTS.BOARD_UPDATED, {
    board: boardData,
    updatedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.BOARD_UPDATED, {
      board: boardData,
      updatedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerBoardDeleted(boardId: string, deletedBy: string, userIds?: string[]) {
  // If userIds not provided, try to get them (for backward compatibility)
  const affectedUserIds = userIds || await getUsersWithBoardAccess(boardId);
  
  await pusher.trigger(getChannelNames.board(boardId), PUSHER_EVENTS.BOARD_DELETED, {
    boardId,
    deletedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of affectedUserIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.BOARD_DELETED, {
      boardId,
      deletedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

// Task event triggers
export async function triggerTaskCreated(taskData: any, createdBy: string) {
  if (!taskData.boardId) return;
  
  const userIds = await getUsersWithBoardAccess(taskData.boardId);
  
  await pusher.trigger(getChannelNames.board(taskData.boardId), PUSHER_EVENTS.TASK_CREATED, {
    task: taskData,
    createdBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.TASK_CREATED, {
      task: taskData,
      createdBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerTaskUpdated(taskData: any, updatedBy: string) {
  if (!taskData.boardId) {
    console.warn('Task update trigger skipped - no boardId:', { taskId: taskData.id, taskData });
    return;
  }
  
  console.log('Triggering task update event:', { taskId: taskData.id, boardId: taskData.boardId, updatedBy });
  
  const userIds = await getUsersWithBoardAccess(taskData.boardId);
  
  const eventData = {
    task: taskData,
    updatedBy,
    timestamp: new Date().toISOString(),
  };
  
  await pusher.trigger(getChannelNames.board(taskData.boardId), PUSHER_EVENTS.TASK_UPDATED, eventData);

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.TASK_UPDATED, eventData);
  }
  
  console.log('Task update event triggered to', userIds.length, 'users');
}

export async function triggerTaskDeleted(taskId: string, boardId: string, deletedBy: string) {
  const userIds = await getUsersWithBoardAccess(boardId);
  
  await pusher.trigger(getChannelNames.board(boardId), PUSHER_EVENTS.TASK_DELETED, {
    taskId,
    boardId,
    deletedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.TASK_DELETED, {
      taskId,
      boardId,
      deletedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

// Column event triggers
export async function triggerColumnCreated(columnData: any, createdBy: string) {
  const userIds = await getUsersWithBoardAccess(columnData.boardId);
  
  await pusher.trigger(getChannelNames.board(columnData.boardId), PUSHER_EVENTS.COLUMN_CREATED, {
    column: columnData,
    createdBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.COLUMN_CREATED, {
      column: columnData,
      createdBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerColumnUpdated(columnData: any, updatedBy: string) {
  const userIds = await getUsersWithBoardAccess(columnData.boardId);
  
  await pusher.trigger(getChannelNames.board(columnData.boardId), PUSHER_EVENTS.COLUMN_UPDATED, {
    column: columnData,
    updatedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.COLUMN_UPDATED, {
      column: columnData,
      updatedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerColumnDeleted(columnId: string, boardId: string, deletedBy: string) {
  const userIds = await getUsersWithBoardAccess(boardId);
  
  await pusher.trigger(getChannelNames.board(boardId), PUSHER_EVENTS.COLUMN_DELETED, {
    columnId,
    boardId,
    deletedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.COLUMN_DELETED, {
      columnId,
      boardId,
      deletedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

// Team event triggers
export async function triggerTeamCreated(teamData: any, createdBy: string) {
  // const userIds = await getUsersInTeam(teamData.id);
  
  await pusher.trigger(getChannelNames.team(teamData.id), PUSHER_EVENTS.TEAM_CREATED, {
    team: teamData,
    createdBy,
    timestamp: new Date().toISOString(),
  });

  // Trigger on admin users' channels (all admins should see new teams)
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  for (const admin of adminUsers) {
    await pusher.trigger(getChannelNames.user(admin.id), PUSHER_EVENTS.TEAM_CREATED, {
      team: teamData,
      createdBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerTeamUpdated(teamData: any, updatedBy: string) {
  const userIds = await getUsersInTeam(teamData.id);
  
  await pusher.trigger(getChannelNames.team(teamData.id), PUSHER_EVENTS.TEAM_UPDATED, {
    team: teamData,
    updatedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.TEAM_UPDATED, {
      team: teamData,
      updatedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerTeamDeleted(teamId: string, deletedBy: string) {
  const userIds = await getUsersInTeam(teamId);
  
  await pusher.trigger(getChannelNames.team(teamId), PUSHER_EVENTS.TEAM_DELETED, {
    teamId,
    deletedBy,
    timestamp: new Date().toISOString(),
  });

  for (const userId of userIds) {
    await pusher.trigger(getChannelNames.user(userId), PUSHER_EVENTS.TEAM_DELETED, {
      teamId,
      deletedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerTeamUserAdded(teamId: string, userId: string, addedBy: string) {
  const teamUsers = await getUsersInTeam(teamId);
  
  await pusher.trigger(getChannelNames.team(teamId), PUSHER_EVENTS.TEAM_USER_ADDED, {
    teamId,
    userId,
    addedBy,
    timestamp: new Date().toISOString(),
  });

  // Notify all team members including the new user
  for (const teamUserId of [...teamUsers, userId]) {
    await pusher.trigger(getChannelNames.user(teamUserId), PUSHER_EVENTS.TEAM_USER_ADDED, {
      teamId,
      userId,
      addedBy,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function triggerTeamUserRemoved(teamId: string, userId: string, removedBy: string) {
  const teamUsers = await getUsersInTeam(teamId);
  
  await pusher.trigger(getChannelNames.team(teamId), PUSHER_EVENTS.TEAM_USER_REMOVED, {
    teamId,
    userId,
    removedBy,
    timestamp: new Date().toISOString(),
  });

  // Notify all team members including the removed user
  for (const teamUserId of [...teamUsers, userId]) {
    await pusher.trigger(getChannelNames.user(teamUserId), PUSHER_EVENTS.TEAM_USER_REMOVED, {
      teamId,
      userId,
      removedBy,
      timestamp: new Date().toISOString(),
    });
  }
}