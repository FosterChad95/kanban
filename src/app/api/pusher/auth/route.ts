import { NextRequest, NextResponse } from 'next/server';
import { pusher } from '../../../../lib/pusher';
import { getCurrentUser } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body to get socket_id and channel_name
    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Check if user is authorized for the requested channel
    const isAuthorized = await isUserAuthorizedForChannel(user, channelName);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Authenticate the user for Pusher
    const authResponse = pusher.authorizeChannel(socketId, channelName, {
      user_id: user.id,
      user_info: {
        name: user.name || 'Unknown',
        email: user.email,
        role: user.role,
      },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Check if a user is authorized to access a specific channel
 */
async function isUserAuthorizedForChannel(
  user: { id: string; role: string }, 
  channelName: string
): Promise<boolean> {
  // Parse channel name to determine access rules
  
  // User's personal channel - only they can access
  if (channelName === `user-${user.id}`) {
    return true;
  }
  
  // Admin users can access any channel
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Board channels - check if user has access to the board
  if (channelName.startsWith('board-')) {
    const boardId = channelName.replace('board-', '');
    return await checkBoardAccess(user.id, boardId);
  }
  
  // Team channels - check if user is a member of the team
  if (channelName.startsWith('team-')) {
    const teamId = channelName.replace('team-', '');
    return await checkTeamAccess(user.id, teamId);
  }
  
  // Global channels - only admins for now
  if (channelName === 'global') {
    return user.role === 'ADMIN';
  }
  
  // Default deny
  return false;
}

/**
 * Check if user has access to a specific board
 */
async function checkBoardAccess(userId: string, boardId: string): Promise<boolean> {
  try {
    const { getBoardsForUser } = await import('../../../../queries/boardQueries');
    const userBoards = await getBoardsForUser({ id: userId, role: 'USER' });
    return userBoards.some(board => board.id === boardId);
  } catch (error) {
    console.error('Error checking board access:', error);
    return false;
  }
}

/**
 * Check if user is a member of a specific team
 */
async function checkTeamAccess(userId: string, teamId: string): Promise<boolean> {
  try {
    const prisma = (await import('../../../../lib/prisma')).default;
    const userTeam = await prisma.userTeam.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });
    return !!userTeam;
  } catch (error) {
    console.error('Error checking team access:', error);
    return false;
  }
}