import { useEffect, useCallback } from 'react';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';
import { PUSHER_EVENTS } from '../lib/pusher-events';

// Types for real-time events
interface BoardEvent {
  board: any;
  createdBy?: string;
  updatedBy?: string;
  timestamp: string;
}

interface BoardDeletedEvent {
  boardId: string;
  deletedBy: string;
  timestamp: string;
}

interface TaskEvent {
  task: any;
  createdBy?: string;
  updatedBy?: string;
  timestamp: string;
}

interface TaskDeletedEvent {
  taskId: string;
  boardId: string;
  deletedBy: string;
  timestamp: string;
}

interface ColumnEvent {
  column: any;
  createdBy?: string;
  updatedBy?: string;
  timestamp: string;
}

interface ColumnDeletedEvent {
  columnId: string;
  boardId: string;
  deletedBy: string;
  timestamp: string;
}

interface TeamEvent {
  team: any;
  createdBy?: string;
  updatedBy?: string;
  timestamp: string;
}

interface TeamDeletedEvent {
  teamId: string;
  deletedBy: string;
  timestamp: string;
}

interface TeamUserEvent {
  teamId: string;
  userId: string;
  addedBy?: string;
  removedBy?: string;
  timestamp: string;
}

// Callback types
interface PusherEventCallbacks {
  onBoardCreated?: (event: BoardEvent) => void;
  onBoardUpdated?: (event: BoardEvent) => void;
  onBoardDeleted?: (event: BoardDeletedEvent) => void;
  
  onTaskCreated?: (event: TaskEvent) => void;
  onTaskUpdated?: (event: TaskEvent) => void;
  onTaskDeleted?: (event: TaskDeletedEvent) => void;
  
  onColumnCreated?: (event: ColumnEvent) => void;
  onColumnUpdated?: (event: ColumnEvent) => void;
  onColumnDeleted?: (event: ColumnDeletedEvent) => void;
  
  onTeamCreated?: (event: TeamEvent) => void;
  onTeamUpdated?: (event: TeamEvent) => void;
  onTeamDeleted?: (event: TeamDeletedEvent) => void;
  onTeamUserAdded?: (event: TeamUserEvent) => void;
  onTeamUserRemoved?: (event: TeamUserEvent) => void;
}

interface UsePusherListenersProps {
  boardIds?: string[];
  teamIds?: string[];
  callbacks?: PusherEventCallbacks;
  enabled?: boolean;
}

// Initialize Pusher client (singleton)
let pusherClient: Pusher | null = null;

const initializePusher = () => {
  if (!pusherClient && typeof window !== 'undefined') {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.error('Missing Pusher environment variables');
      return null;
    }

    pusherClient = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    });

    pusherClient.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error);
    });

    pusherClient.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
    });

    pusherClient.connection.bind('state_change', (states: any) => {
      console.log('Pusher connection state changed from', states.previous, 'to', states.current);
    });
  }
  
  return pusherClient;
};

export const usePusherListeners = ({
  boardIds = [],
  teamIds = [],
  callbacks = {},
  enabled = true,
}: UsePusherListenersProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Memoize event handlers to prevent unnecessary re-subscriptions
  const handleBoardCreated = useCallback((data: BoardEvent) => {
    console.log('Board created:', data);
    callbacks.onBoardCreated?.(data);
  }, [callbacks.onBoardCreated]);

  const handleBoardUpdated = useCallback((data: BoardEvent) => {
    console.log('Board updated:', data);
    callbacks.onBoardUpdated?.(data);
  }, [callbacks.onBoardUpdated]);

  const handleBoardDeleted = useCallback((data: BoardDeletedEvent) => {
    console.log('Board deleted:', data);
    callbacks.onBoardDeleted?.(data);
  }, [callbacks.onBoardDeleted]);

  const handleTaskCreated = useCallback((data: TaskEvent) => {
    console.log('Task created:', data);
    callbacks.onTaskCreated?.(data);
  }, [callbacks.onTaskCreated]);

  const handleTaskUpdated = useCallback((data: TaskEvent) => {
    console.log('Task updated:', data);
    callbacks.onTaskUpdated?.(data);
  }, [callbacks.onTaskUpdated]);

  const handleTaskDeleted = useCallback((data: TaskDeletedEvent) => {
    console.log('Task deleted:', data);
    callbacks.onTaskDeleted?.(data);
  }, [callbacks.onTaskDeleted]);

  const handleColumnCreated = useCallback((data: ColumnEvent) => {
    console.log('Column created:', data);
    callbacks.onColumnCreated?.(data);
  }, [callbacks.onColumnCreated]);

  const handleColumnUpdated = useCallback((data: ColumnEvent) => {
    console.log('Column updated:', data);
    callbacks.onColumnUpdated?.(data);
  }, [callbacks.onColumnUpdated]);

  const handleColumnDeleted = useCallback((data: ColumnDeletedEvent) => {
    console.log('Column deleted:', data);
    callbacks.onColumnDeleted?.(data);
  }, [callbacks.onColumnDeleted]);

  const handleTeamCreated = useCallback((data: TeamEvent) => {
    console.log('Team created:', data);
    callbacks.onTeamCreated?.(data);
  }, [callbacks.onTeamCreated]);

  const handleTeamUpdated = useCallback((data: TeamEvent) => {
    console.log('Team updated:', data);
    callbacks.onTeamUpdated?.(data);
  }, [callbacks.onTeamUpdated]);

  const handleTeamDeleted = useCallback((data: TeamDeletedEvent) => {
    console.log('Team deleted:', data);
    callbacks.onTeamDeleted?.(data);
  }, [callbacks.onTeamDeleted]);

  const handleTeamUserAdded = useCallback((data: TeamUserEvent) => {
    console.log('User added to team:', data);
    callbacks.onTeamUserAdded?.(data);
  }, [callbacks.onTeamUserAdded]);

  const handleTeamUserRemoved = useCallback((data: TeamUserEvent) => {
    console.log('User removed from team:', data);
    callbacks.onTeamUserRemoved?.(data);
  }, [callbacks.onTeamUserRemoved]);

  useEffect(() => {
    if (!enabled || !userId) {
      console.log('Pusher listeners disabled or no userId:', { enabled, userId });
      return;
    }

    const pusher = initializePusher();
    if (!pusher) {
      console.error('Failed to initialize Pusher client');
      return;
    }

    const subscribedChannels: string[] = [];

    try {
      // Subscribe to user's personal channel for all events
      const userChannelName = `user-${userId}`;
      console.log('Subscribing to user channel:', userChannelName);
      
      const userChannel = pusher.subscribe(userChannelName);
      subscribedChannels.push(userChannelName);

      // Handle subscription success and errors
      userChannel.bind('pusher:subscription_succeeded', () => {
        console.log('Successfully subscribed to user channel:', userChannelName);
      });

      userChannel.bind('pusher:subscription_error', (error: any) => {
        console.error('Failed to subscribe to user channel:', userChannelName, error);
      });

      // Bind all event types to the user channel
      userChannel.bind(PUSHER_EVENTS.BOARD_CREATED, handleBoardCreated);
      userChannel.bind(PUSHER_EVENTS.BOARD_UPDATED, handleBoardUpdated);
      userChannel.bind(PUSHER_EVENTS.BOARD_DELETED, handleBoardDeleted);
      
      userChannel.bind(PUSHER_EVENTS.TASK_CREATED, handleTaskCreated);
      userChannel.bind(PUSHER_EVENTS.TASK_UPDATED, handleTaskUpdated);
      userChannel.bind(PUSHER_EVENTS.TASK_DELETED, handleTaskDeleted);
      
      userChannel.bind(PUSHER_EVENTS.COLUMN_CREATED, handleColumnCreated);
      userChannel.bind(PUSHER_EVENTS.COLUMN_UPDATED, handleColumnUpdated);
      userChannel.bind(PUSHER_EVENTS.COLUMN_DELETED, handleColumnDeleted);
      
      userChannel.bind(PUSHER_EVENTS.TEAM_CREATED, handleTeamCreated);
      userChannel.bind(PUSHER_EVENTS.TEAM_UPDATED, handleTeamUpdated);
      userChannel.bind(PUSHER_EVENTS.TEAM_DELETED, handleTeamDeleted);
      userChannel.bind(PUSHER_EVENTS.TEAM_USER_ADDED, handleTeamUserAdded);
      userChannel.bind(PUSHER_EVENTS.TEAM_USER_REMOVED, handleTeamUserRemoved);

      // Subscribe to specific board channels if provided
      boardIds.forEach((boardId) => {
        if (boardId && !subscribedChannels.includes(`board-${boardId}`)) {
          const boardChannelName = `board-${boardId}`;
          console.log('Subscribing to board channel:', boardChannelName);
          
          const boardChannel = pusher.subscribe(boardChannelName);
          subscribedChannels.push(boardChannelName);

          // Handle subscription success and errors
          boardChannel.bind('pusher:subscription_succeeded', () => {
            console.log('Successfully subscribed to board channel:', boardChannelName);
          });

          boardChannel.bind('pusher:subscription_error', (error: any) => {
            console.error('Failed to subscribe to board channel:', boardChannelName, error);
          });

          // Bind all board-related events
          boardChannel.bind(PUSHER_EVENTS.BOARD_UPDATED, handleBoardUpdated);
          boardChannel.bind(PUSHER_EVENTS.BOARD_DELETED, handleBoardDeleted);
          boardChannel.bind(PUSHER_EVENTS.TASK_CREATED, handleTaskCreated);
          boardChannel.bind(PUSHER_EVENTS.TASK_UPDATED, handleTaskUpdated);
          boardChannel.bind(PUSHER_EVENTS.TASK_DELETED, handleTaskDeleted);
          boardChannel.bind(PUSHER_EVENTS.COLUMN_CREATED, handleColumnCreated);
          boardChannel.bind(PUSHER_EVENTS.COLUMN_UPDATED, handleColumnUpdated);
          boardChannel.bind(PUSHER_EVENTS.COLUMN_DELETED, handleColumnDeleted);
        }
      });

      // Subscribe to specific team channels if provided
      teamIds.forEach((teamId) => {
        if (teamId && !subscribedChannels.includes(`team-${teamId}`)) {
          const teamChannel = pusher.subscribe(`team-${teamId}`);
          subscribedChannels.push(`team-${teamId}`);

          // Bind all team-related events
          teamChannel.bind(PUSHER_EVENTS.TEAM_UPDATED, handleTeamUpdated);
          teamChannel.bind(PUSHER_EVENTS.TEAM_DELETED, handleTeamDeleted);
          teamChannel.bind(PUSHER_EVENTS.TEAM_USER_ADDED, handleTeamUserAdded);
          teamChannel.bind(PUSHER_EVENTS.TEAM_USER_REMOVED, handleTeamUserRemoved);
        }
      });

    } catch (error) {
      console.error('Error setting up Pusher subscriptions:', error);
    }

    // Cleanup function
    return () => {
      subscribedChannels.forEach((channelName) => {
        const channel = pusher.channel(channelName);
        if (channel) {
          // Unbind all events
          channel.unbind_all();
          pusher.unsubscribe(channelName);
        }
      });
    };
  }, [
    enabled,
    userId,
    boardIds,
    teamIds,
    handleBoardCreated,
    handleBoardUpdated,
    handleBoardDeleted,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleColumnCreated,
    handleColumnUpdated,
    handleColumnDeleted,
    handleTeamCreated,
    handleTeamUpdated,
    handleTeamDeleted,
    handleTeamUserAdded,
    handleTeamUserRemoved,
  ]);

  return {
    isConnected: pusherClient?.connection?.state === 'connected',
    connectionState: pusherClient?.connection?.state,
  };
};

// Utility hook for easier board-specific listening
export const useBoardPusher = (
  boardId: string | undefined,
  callbacks: Pick<
    PusherEventCallbacks,
    | 'onBoardUpdated'
    | 'onBoardDeleted'
    | 'onTaskCreated'
    | 'onTaskUpdated'
    | 'onTaskDeleted'
    | 'onColumnCreated'
    | 'onColumnUpdated'
    | 'onColumnDeleted'
  >
) => {
  return usePusherListeners({
    boardIds: boardId ? [boardId] : [],
    callbacks,
    enabled: !!boardId,
  });
};

// Utility hook for admin team management
export const useTeamPusher = (
  callbacks: Pick<
    PusherEventCallbacks,
    | 'onTeamCreated'
    | 'onTeamUpdated'
    | 'onTeamDeleted'
    | 'onTeamUserAdded'
    | 'onTeamUserRemoved'
  >
) => {
  return usePusherListeners({
    callbacks,
  });
};

// Cleanup function for when the app unmounts
export const cleanupPusher = () => {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
};