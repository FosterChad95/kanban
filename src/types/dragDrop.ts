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