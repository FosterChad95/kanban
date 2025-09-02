/**
 * Custom hook for managing task form logic
 * Extracts business logic from modal components for better separation of concerns
 */

import {
  useForm,
  useFieldArray,
  type FieldArrayWithId,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddTaskSchema, type AddTaskInput } from "../schemas/forms";

interface UseTaskFormProps {
  columns: Array<{ id: string; name: string }>;
  boardId: string;
  onSubmit: (taskData: TaskSubmissionData) => void;
  initialData?: Partial<AddTaskInput>;
}

export interface TaskSubmissionData {
  title: string;
  description: string;
  columnId: string;
  subtasks: Array<{
    title: string;
    isCompleted: boolean;
  }>;
  boardId: string;
}

export function useTaskForm({
  columns,
  boardId,
  onSubmit,
  initialData,
}: UseTaskFormProps) {
  const defaultColumnId = columns.length > 0 ? columns[0].id : "";

  const form = useForm<AddTaskInput>({
    resolver: zodResolver(AddTaskSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      columnId: initialData?.columnId ?? defaultColumnId,
      subtasks: initialData?.subtasks ?? [
        { id: crypto.randomUUID(), title: "" },
        { id: crypto.randomUUID(), title: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  const handleFormSubmit: SubmitHandler<AddTaskInput> = (data) => {
    // Transform form data to API format
    const subtasks = (data.subtasks ?? [])
      .filter((s) => s.title.trim() !== "")
      .map((s) => ({
        title: s.title.trim(),
        isCompleted: false,
      }));

    const taskData: TaskSubmissionData = {
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      columnId: data.columnId,
      subtasks,
      boardId,
    };

    onSubmit(taskData);
  };

  const addSubtask = () => {
    append({ id: crypto.randomUUID(), title: "" });
  };

  const removeSubtask = (index: number) => {
    remove(index);
  };

  return {
    // Form controls
    form,
    register: form.register,
    handleSubmit: form.handleSubmit(handleFormSubmit),
    control: form.control,
    errors: form.formState.errors,

    // Field array controls
    subtaskFields: fields as FieldArrayWithId<AddTaskInput, "subtasks">[],
    addSubtask,
    removeSubtask,

    // Utilities
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    reset: form.reset,
  };
}

// Additional hook for edit task scenarios
interface UseEditTaskFormProps extends Omit<UseTaskFormProps, "onSubmit"> {
  onUpdate: (taskData: TaskUpdateData) => void;
  taskId: string;
}

export interface TaskUpdateData extends TaskSubmissionData {
  taskId: string;
}

export function useEditTaskForm(props: UseEditTaskFormProps) {
  const taskForm = useTaskForm({
    ...props,
    onSubmit: (data) => props.onUpdate({ ...data, taskId: props.taskId }),
  });

  return taskForm;
}
