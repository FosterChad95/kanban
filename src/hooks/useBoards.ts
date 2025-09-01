import { useEffect } from 'react';
import { useCrudOperations, createApiOperations } from './useCrudOperations';
import { AdminBoard, CreateBoardForm, EditBoardForm, TeamOption } from '@/types/admin';

const boardsApi = createApiOperations('/api/boards');

/**
 * Hook for managing boards in admin section
 */
export function useBoards() {
  const { state, actions } = useCrudOperations<AdminBoard>();

  // Fetch boards on mount
  useEffect(() => {
    fetchBoards();
  }, []);

  /**
   * Fetch all boards from API
   */
  const fetchBoards = async () => {
    actions.setLoading(true);
    actions.setError(null);
    
    try {
      const boards = await boardsApi.fetchAll<AdminBoard>();
      // Ensure columns array exists for each board
      const normalizedBoards = boards.map(board => ({
        ...board,
        columns: Array.isArray(board.columns) ? board.columns : [],
      }));
      actions.setItems(normalizedBoards);
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : 'Failed to fetch boards'
      );
    } finally {
      actions.setLoading(false);
    }
  };

  /**
   * Fetch board by ID for editing
   */
  const fetchBoardForEdit = async (boardId: string) => {
    try {
      const board = await boardsApi.fetchById<AdminBoard>(boardId);
      actions.showEdit(board);
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : 'Failed to fetch board for editing'
      );
    }
  };

  /**
   * Create a new board
   */
  const createBoard = async (formData: CreateBoardForm) => {
    actions.setAdding(true);
    actions.setAddError(null);

    try {
      const newBoard = await boardsApi.create<CreateBoardForm, AdminBoard>(formData);
      actions.addItem({
        ...newBoard,
        columns: Array.isArray(newBoard.columns) ? newBoard.columns : [],
      });
    } catch (error) {
      actions.setAddError(
        error instanceof Error ? error.message : 'Failed to create board'
      );
    } finally {
      actions.setAdding(false);
    }
  };

  /**
   * Update an existing board
   */
  const updateBoard = async (boardId: string, formData: EditBoardForm) => {
    actions.setEditing(true);
    actions.setEditError(null);

    try {
      const updatedBoard = await boardsApi.update<EditBoardForm, AdminBoard>(
        boardId, 
        formData
      );
      actions.updateItem(updatedBoard);
    } catch (error) {
      actions.setEditError(
        error instanceof Error ? error.message : 'Failed to update board'
      );
    } finally {
      actions.setEditing(false);
    }
  };

  /**
   * Delete a board
   */
  const deleteBoard = async (boardId: string) => {
    actions.setDeleting(true);
    actions.setDeleteError(null);

    try {
      await boardsApi.delete(boardId);
      actions.removeItem(boardId);
    } catch (error) {
      actions.setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete board'
      );
    } finally {
      actions.setDeleting(false);
    }
  };

  return {
    // State
    boards: state.items,
    loading: state.loading,
    error: state.error,
    
    // Add state
    showAdd: state.showAdd,
    adding: state.adding,
    addError: state.addError,
    
    // Edit state  
    showEdit: state.showEdit,
    editingBoard: state.editingItem,
    editing: state.editing,
    editError: state.editError,
    
    // Delete state
    showDelete: state.showDelete,
    deletingBoard: state.deletingItem,
    deleting: state.deleting,
    deleteError: state.deleteError,
    
    // Actions
    showAddModal: actions.showAdd,
    hideAddModal: actions.hideAdd,
    showEditModal: fetchBoardForEdit,
    hideEditModal: actions.hideEdit,
    showDeleteModal: actions.showDelete,
    hideDeleteModal: actions.hideDelete,
    
    // CRUD operations
    createBoard,
    updateBoard,
    deleteBoard,
    refreshBoards: fetchBoards,
  };
}