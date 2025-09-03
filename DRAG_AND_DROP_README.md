# React DnD Implementation Guide

This document explains how drag and drop functionality is implemented in the Kanban Task Manager using React DnD.

## Overview

The drag and drop feature allows users to:
- Drag tasks from one column to another
- Visual feedback during dragging (opacity, rotation, column highlighting)
- Real-time updates across all connected clients via Pusher
- Persistent changes saved to the database

## Architecture

### 1. Core Dependencies

```json
{
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1"
}
```

### 2. Provider Setup

**File: `src/providers/DragDropProvider.tsx`**
```typescript
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};
```

The provider is wrapped around the entire application in `src/app/layout.tsx` to enable drag and drop functionality throughout the app.

### 3. Type Definitions

**File: `src/types/dragDrop.ts`**
```typescript
export const DND_ITEM_TYPES = {
  TASK: 'task',
} as const;

export type DragItem = {
  type: typeof DND_ITEM_TYPES.TASK;
  id: string;
  columnId: string;
  index: number;
};

export type DropResult = {
  targetColumnId: string;
  targetIndex?: number;
};
```

## Component Implementation

### 1. Draggable Tasks

**File: `src/components/content/Board/Task.tsx`**

Tasks are made draggable using the `useDrag` hook:

```typescript
const [{ isDragging }, drag] = useDrag(() => ({
  type: DND_ITEM_TYPES.TASK,
  item: (): DragItem => ({
    type: DND_ITEM_TYPES.TASK,
    id: task.id,
    columnId: task.columnId,
    index,
  }),
  collect: (monitor) => ({
    isDragging: monitor.isDragging(),
  }),
}), [task.id, task.columnId, index]);
```

**Visual Feedback:**
- Tasks become semi-transparent (`opacity: 50%`) when dragging
- Tasks rotate slightly (`transform: rotate(5deg)`) during drag
- The drag reference is attached to the task's root div

### 2. Droppable Columns

**File: `src/components/content/Board/Column.tsx`**

Columns accept dropped tasks using the `useDrop` hook:

```typescript
const [{ isOver }, drop] = useDrop(() => ({
  accept: DND_ITEM_TYPES.TASK,
  drop: (item: DragItem) => {
    if (item.columnId !== column.id) {
      onTaskMove(item.id, column.id);
    }
  },
  collect: (monitor) => ({
    isOver: monitor.isOver(),
  }),
}), [column.id, onTaskMove]);
```

**Visual Feedback:**
- Columns highlight with a blue background when a task is dragged over them
- Light mode: `bg-blue-50`
- Dark mode: `bg-blue-900/20`

### 3. State Management

**File: `src/components/content/Board/BoardWrapper.tsx`**

The board wrapper handles task movement:

```typescript
const onTaskMove = async (taskId: string, targetColumnId: string) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: targetColumnId }),
    });

    if (!response.ok) {
      console.error("Failed to move task");
      return;
    }

    // Local state update handled by real-time listener
  } catch (error) {
    console.error("Failed to move task:", error);
  }
};
```

## Data Flow

### 1. Drag Initiation
1. User starts dragging a task
2. `useDrag` creates a drag item with task information
3. Visual feedback is applied to the dragged task

### 2. Drop Target Interaction
1. Task is dragged over a column
2. `useDrop` detects the hover and applies visual feedback
3. Column background changes to indicate valid drop target

### 3. Drop Handling
1. Task is dropped on a column
2. `drop` function checks if the target column is different from source
3. If different, `onTaskMove` is called with task ID and target column ID

### 4. API Update
1. `onTaskMove` makes a PUT request to `/api/tasks/:id`
2. Server updates the task's `columnId` in the database
3. Server triggers a real-time event via Pusher

### 5. Real-time Synchronization
1. Pusher broadcasts the task update to all connected clients
2. `handleTaskUpdated` in BoardWrapper receives the event
3. Local state is updated to reflect the new task position
4. UI re-renders with the task in its new column

## API Integration

### Task Update Endpoint

**File: `src/app/api/tasks/[id]/route.ts`**

The PUT endpoint handles column changes:

```typescript
// Extract columnId from request body
const { columnId, ...rest } = body;

// If column is changing, get the new column's boardId
if (columnId) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true }
  });
  
  data.column = { connect: { id: columnId } };
  data.board = { connect: { id: column.boardId } };
}

const updated = await updateTask(taskId, data);
await triggerTaskUpdated(updated, user.id);
```

## Real-time Updates

### Pusher Integration

**File: `src/components/content/Board/BoardWrapper.tsx`**

The board listens for task updates:

```typescript
const handleTaskUpdated = useCallback((event: any) => {
  if (event.task.boardId === boardId) {
    setColumns(prevColumns => {
      // Find and update the task across all columns
      // If task moved to a different column, remove from current and add to new
      // Update local state to reflect changes
    });
  }
}, [boardId]);
```

## Key Features

### 1. Optimistic Updates
- Local state updates immediately on drop
- If API call fails, state can be reverted (error handling)

### 2. Real-time Collaboration
- Changes are broadcast to all connected users
- Prevents conflicts and keeps everyone synchronized

### 3. Visual Feedback
- Clear indication of draggable items
- Visual feedback during drag operations
- Drop zone highlighting

### 4. Error Handling
- API failures are logged to console
- Network errors don't break the UI
- Real-time events handle state recovery

## Learning Resources

### Key Concepts to Understand

1. **React DnD Hooks:**
   - `useDrag` - Makes components draggable
   - `useDrop` - Makes components accept drops
   - Monitor objects for tracking drag state

2. **HTML5 Backend:**
   - Native browser drag and drop support
   - Touch backend available for mobile devices

3. **Type Safety:**
   - Drag items are typed for safety
   - Monitor states are properly typed

4. **State Management:**
   - Local state vs. server state
   - Real-time synchronization patterns

### Best Practices Demonstrated

1. **Performance:**
   - Memoized callbacks with proper dependencies
   - Efficient state updates

2. **User Experience:**
   - Visual feedback during interactions
   - Smooth animations and transitions
   - Error handling that doesn't break the flow

3. **Code Organization:**
   - Separated concerns (drag logic, API calls, state management)
   - Reusable type definitions
   - Clear component hierarchy

### Extending the Implementation

To add more drag and drop features:

1. **Column Reordering:**
   - Make columns draggable
   - Add drop zones between columns

2. **Task Positioning:**
   - Track task position within columns
   - Allow dropping between specific tasks

3. **Multi-selection:**
   - Select multiple tasks
   - Drag multiple items at once

4. **Cross-board Movement:**
   - Allow tasks to move between different boards
   - Handle board permission checks

This implementation provides a solid foundation for understanding React DnD patterns and can be extended for more complex drag and drop requirements.