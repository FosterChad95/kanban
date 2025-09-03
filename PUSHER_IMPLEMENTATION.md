# Real-Time Implementation with Pusher

This document explains the comprehensive real-time implementation added to the Kanban Task Manager using Pusher WebSockets. This enables live collaboration where multiple users can see changes to boards, tasks, columns, and teams in real-time.

## Overview

The implementation consists of three main components:
1. **Server-side Event Triggers** - API routes trigger Pusher events when data changes
2. **Client-side Event Listeners** - React hooks that listen for real-time updates
3. **Authentication & Authorization** - Secure channel access based on user permissions

## Architecture

```
API Routes → Pusher Server → WebSocket → Client Listeners → UI Updates
     ↓              ↓            ↓             ↓              ↓
  Trigger        Send to      Browser     React Hooks    State Updates
  Events       Channels    Connections    Subscribe       Re-render
```

## Files Added/Modified

### New Files Created

1. **`src/lib/pusher-events.ts`** - Server-side event triggering utilities
2. **`src/hooks/usePusherListeners.ts`** - Client-side real-time hooks
3. **`src/app/api/pusher/auth/route.ts`** - Pusher authentication endpoint

### Modified Files

1. **API Routes** - Added real-time event triggers:
   - `src/app/api/boards/route.ts` - Board creation events
   - `src/app/api/boards/[id]/route.ts` - Board update/delete events
   - `src/app/api/tasks/route.ts` - Task creation events
   - `src/app/api/tasks/[id]/route.ts` - Task update/delete events
   - `src/app/api/teams/route.ts` - Team creation events
   - `src/app/api/teams/[id]/route.ts` - Team update/delete events
   - `src/app/api/teams/add-user/route.ts` - Team user management events

2. **React Components** - Integrated real-time listeners:
   - `src/components/content/Board/BoardWrapper.tsx` - Board real-time updates
   - `src/hooks/useTeams.ts` - Team management real-time updates

3. **Configuration**:
   - `.env.example` - Added client-side Pusher environment variables

## Event Types

### Board Events
- `board-created` - New board created
- `board-updated` - Board name/columns modified
- `board-deleted` - Board removed

### Task Events
- `task-created` - New task added
- `task-updated` - Task modified or moved between columns
- `task-deleted` - Task removed

### Column Events
- `column-created` - New column added (part of board updates)
- `column-updated` - Column name changed (part of board updates)
- `column-deleted` - Column removed (part of board updates)

### Team Events
- `team-created` - New team created (admin only)
- `team-updated` - Team name/members/boards changed (admin only)
- `team-deleted` - Team removed (admin only)
- `team-user-added` - User added to team
- `team-user-removed` - User removed from team

## Channel Strategy

### Channel Naming Convention
- `user-{userId}` - Personal channel for each user
- `board-{boardId}` - Board-specific channel
- `team-{teamId}` - Team-specific channel
- `global` - System-wide events (admin only)

### Multi-Channel Broadcasting
Events are sent to multiple channels to ensure all relevant users receive updates:

1. **User Channels** - Every user with access gets updates on their personal channel
2. **Resource Channels** - Board/team-specific channels for focused listening
3. **Permission-Based** - Only users with appropriate access receive events

## Authentication & Security

### Channel Authorization
The `/api/pusher/auth` endpoint validates user access to channels:

```typescript
// Examples of authorization logic
user-{userId}     → Only that specific user
board-{boardId}   → Users with board access (direct or via team)
team-{teamId}     → Team members only
global            → Admin users only
```

### Access Control Matrix
| Channel Type | User Role | Team Member | Board Access | Allowed |
|-------------|-----------|-------------|--------------|---------|
| user-{id}   | Any       | -           | -            | Own ID only |
| board-{id}  | Any       | Yes/No      | Yes          | ✓ |
| board-{id}  | Any       | Yes/No      | No           | ✗ |
| team-{id}   | Any       | Yes         | -            | ✓ |
| team-{id}   | Any       | No          | -            | ✗ |
| global      | Admin     | -           | -            | ✓ |
| global      | User      | -           | -            | ✗ |

## Server-Side Implementation

### Event Triggering Pattern

```typescript
// Example from board creation
const created = await createBoardForUser(boardData, user.id);

// Trigger real-time event
await triggerBoardCreated(created.id, created, user.id);

return createSuccessResponse(created, 201);
```

### User Access Resolution
For each event, the system:
1. Queries the database to find all users with access
2. Sends events to both individual user channels and resource channels
3. Includes metadata (timestamp, user who made change)

### Error Handling
- Failed Pusher events don't block API responses
- Errors are logged but don't affect core functionality
- Graceful degradation when Pusher is unavailable

## Client-Side Implementation

### Hook Usage Patterns

#### Board-Specific Listening
```typescript
// In BoardWrapper component
useBoardPusher(boardId, {
  onBoardUpdated: handleBoardUpdated,
  onBoardDeleted: handleBoardDeleted,
  onTaskCreated: handleTaskCreated,
  onTaskUpdated: handleTaskUpdated,
  onTaskDeleted: handleTaskDeleted,
});
```

#### Admin Team Management
```typescript
// In useTeams hook
useTeamPusher({
  onTeamCreated: handleTeamCreated,
  onTeamUpdated: handleTeamUpdated,
  onTeamDeleted: handleTeamDeleted,
  onTeamUserAdded: handleTeamUserAdded,
  onTeamUserRemoved: handleTeamUserRemoved,
});
```

#### Generic Multi-Channel Listening
```typescript
// Full control listening
usePusherListeners({
  boardIds: ['board1', 'board2'],
  teamIds: ['team1'],
  callbacks: {
    onBoardCreated: (event) => { /* handle */ },
    onTaskUpdated: (event) => { /* handle */ },
    // ... all event types
  },
  enabled: true,
});
```

### State Updates
Real-time events trigger local state updates without API calls:

```typescript
const handleTaskCreated = useCallback((event) => {
  if (event.task.boardId === boardId) {
    setColumns(prevColumns => {
      // Add new task to appropriate column
      const updatedColumns = [...prevColumns];
      const columnIndex = updatedColumns.findIndex(
        col => col.id === event.task.columnId
      );
      if (columnIndex !== -1) {
        updatedColumns[columnIndex] = {
          ...updatedColumns[columnIndex],
          tasks: [...updatedColumns[columnIndex].tasks, newTask],
        };
      }
      return updatedColumns;
    });
  }
}, [boardId]);
```

## Environment Configuration

### Required Environment Variables

```bash
# Server-side Pusher configuration
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key  
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Client-side Pusher configuration (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
```

### Pusher Dashboard Setup
1. Create a new Pusher Channels app at https://pusher.com
2. Copy the App ID, Key, Secret, and Cluster from your app dashboard
3. Configure the environment variables in your deployment

## Real-Time Scenarios

### Scenario 1: Board Collaboration
1. **User A** creates a new task on Board 1
2. **Server** saves task to database
3. **Server** triggers `task-created` event to:
   - `user-{userB}` channel (if User B has board access)
   - `user-{userC}` channel (if User C has board access)
   - `board-{board1}` channel
4. **User B & C browsers** receive the event
5. **Client hooks** update local state
6. **UI re-renders** showing the new task immediately

### Scenario 2: Team Management
1. **Admin** adds User D to Team Alpha
2. **Server** updates database relationships
3. **Server** triggers `team-user-added` event to:
   - `user-{userD}` channel (notifying the added user)
   - `team-{teamAlpha}` channel (notifying existing team members)
   - All admin user channels
4. **All relevant users** see the team membership change immediately

### Scenario 3: Board Deletion
1. **Admin** deletes Board 1
2. **Server** removes board from database
3. **Server** triggers `board-deleted` event
4. **All users** viewing Board 1 are immediately redirected to dashboard
5. **Board lists** update to remove the deleted board

## Performance Considerations

### Connection Management
- Single Pusher connection per client (singleton pattern)
- Automatic reconnection on network issues
- Connection pooling handled by Pusher client library

### Channel Subscriptions
- Dynamic subscription based on current page/context
- Automatic unsubscription when components unmount
- Minimal channel subscriptions to reduce bandwidth

### Event Filtering
- Client-side filtering to prevent processing irrelevant events
- Server-side user resolution to minimize unnecessary broadcasts
- Timestamp-based deduplication

## Testing Real-Time Features

### Manual Testing Steps
1. **Setup**: Configure Pusher credentials in environment variables
2. **Multi-User Test**: Open app in two different browsers/incognito windows
3. **Login**: Sign in as different users with access to same board/team
4. **Test Operations**:
   - Create/update/delete boards
   - Add/move/delete tasks
   - Manage team memberships (as admin)
   - Edit board columns

### Expected Behaviors
- Changes made by User A appear immediately for User B (within ~100ms)
- No page refreshes needed
- Proper authorization (users only see changes to resources they have access to)
- Graceful handling when Pusher is unavailable

### Debug Tools
- Browser DevTools → Network tab → WebSocket connections
- Console logs show Pusher connection status and received events
- Pusher dashboard shows real-time connection and event metrics

## Error Handling & Fallbacks

### Server-Side Resilience
```typescript
// Pusher events don't block API responses
try {
  await triggerBoardCreated(created.id, created, user.id);
} catch (pusherError) {
  // Log error but don't fail the API call
  console.error('Pusher event failed:', pusherError);
}
```

### Client-Side Fallbacks
- Automatic reconnection attempts
- Graceful degradation when WebSocket connection fails
- Manual refresh as ultimate fallback

### Monitoring
- Connection state monitoring in React hooks
- Error logging for failed event triggers
- Metrics available in Pusher dashboard

## Future Enhancements

### Possible Improvements
1. **Optimistic Updates** - Update UI immediately, rollback on failure
2. **Conflict Resolution** - Handle simultaneous edits by multiple users
3. **Presence Channels** - Show who's currently viewing a board
4. **Typing Indicators** - Show when someone is editing a task
5. **Event History** - Store and replay missed events for offline users
6. **Rate Limiting** - Prevent spam from rapid changes
7. **Batch Operations** - Group multiple rapid changes into single events

### Scalability Considerations
- Channel sharding for high-traffic boards
- Event queuing for high-volume scenarios
- Caching user access patterns
- Database query optimization for user resolution

## Troubleshooting

### Common Issues

**Connection Problems**:
- Verify NEXT_PUBLIC_ environment variables are set
- Check Pusher dashboard for connection attempts
- Ensure WebSocket connections aren't blocked by firewall

**Authorization Failures**:
- Verify server-side Pusher credentials
- Check `/api/pusher/auth` endpoint logs
- Confirm user has proper board/team access

**Events Not Received**:
- Check browser console for error messages
- Verify component is using the hooks correctly
- Confirm event triggering on server-side

**Performance Issues**:
- Monitor number of active subscriptions
- Check for memory leaks in event handlers
- Review database query performance for user resolution

### Debug Logging
Enable verbose logging by adding to your local environment:
```bash
NEXT_PUBLIC_PUSHER_DEBUG=true
```

## Conclusion

This real-time implementation transforms the Kanban application from a traditional request-response model to a collaborative, live-updating experience. Users can work together seamlessly with immediate visual feedback for all changes, making it feel more like a native desktop application than a web app.

The implementation is secure, scalable, and follows React/Next.js best practices while providing a robust foundation for future enhancements.