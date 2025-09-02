/**
 * Custom hook for managing board form logic
 * Handles both create and edit scenarios with team access management
 */

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BoardSchema, type BoardInput } from "../schemas/forms";
import { DEFAULT_BOARD_COLUMNS } from "../constants/board";

interface UseBoardFormProps {
  onSubmit: (boardData: BoardSubmissionData) => void;
  initialData?: Partial<BoardInput & { teamIds?: string[] }>;
  teams?: Array<{ id: string; name: string }>;
  showTeamAccess?: boolean;
}

export interface BoardSubmissionData {
  name: string;
  columns: Array<{
    id?: string;
    name: string;
  }>;
  teamIds?: string[];
}

export function useBoardForm({
  onSubmit,
  initialData,
  teams = [],
  showTeamAccess = false,
}: UseBoardFormProps) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
    initialData?.teamIds || []
  );
  const [mounted, setMounted] = useState(false);

  // Generate UUID safely on client side
  const generateId = useCallback(() => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback for older browsers or server-side
    return `temp-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<BoardInput>({
    resolver: zodResolver(BoardSchema),
    defaultValues: {
      name: initialData?.name || "",
      columns:
        initialData?.columns ||
        DEFAULT_BOARD_COLUMNS.map((col) => ({
          id: generateId(),
          name: col.name,
        })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "columns",
  });

  const handleFormSubmit: SubmitHandler<BoardInput> = (data) => {
    // Filter out empty columns
    const validColumns = (data.columns || [])
      .filter((col) => col.name.trim() !== "")
      .map((col) => ({
        id: col.id || generateId(),
        name: col.name.trim(),
      }));

    const boardData: BoardSubmissionData = {
      name: data.name.trim(),
      columns: validColumns,
      ...(showTeamAccess && { teamIds: selectedTeamIds }),
    };

    onSubmit(boardData);
  };

  const addColumn = () => {
    append({ id: generateId(), name: "" });
  };

  const removeColumn = (index: number) => {
    // Don't allow removing all columns
    if (fields.length > 1) {
      remove(index);
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const selectAllTeams = () => {
    setSelectedTeamIds(teams.map((team) => team.id));
  };

  const deselectAllTeams = () => {
    setSelectedTeamIds([]);
  };

  return {
    // Form controls
    form,
    register: form.register,
    handleSubmit: form.handleSubmit(handleFormSubmit),
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,

    // Column management
    columnFields: fields,
    addColumn,
    removeColumn,
    canRemoveColumn: fields.length > 1,

    // Team management
    selectedTeamIds,
    toggleTeamSelection,
    selectAllTeams,
    deselectAllTeams,
    isTeamSelected: (teamId: string) => selectedTeamIds.includes(teamId),

    // Utilities
    mounted,
    generateId,
    reset: form.reset,
  };
}

// Specialized hook for edit mode
interface UseEditBoardFormProps extends Omit<UseBoardFormProps, "onSubmit"> {
  onUpdate: (boardData: BoardUpdateData) => void;
  boardId: string;
}

export interface BoardUpdateData extends BoardSubmissionData {
  boardId: string;
}

export function useEditBoardForm(props: UseEditBoardFormProps) {
  const boardForm = useBoardForm({
    ...props,
    onSubmit: (data) => props.onUpdate({ ...data, boardId: props.boardId }),
  });

  return boardForm;
}
