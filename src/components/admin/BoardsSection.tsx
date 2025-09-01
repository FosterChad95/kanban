"use client";
import React from "react";
import AddBoardModal from "@/components/ui/Modal/AddBoardModal";
import EditBoardModal from "@/components/ui/Modal/EditBoardModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";
import { AdminSection, ItemList } from "./shared/AdminSection";
import { ModalOverlay } from "./shared/ModalOverlay";
import { useBoards } from "@/hooks/useBoards";
import { useTeamsData } from "@/hooks/useAdminData";
import { CreateBoardForm, EditBoardForm } from "@/types/admin";

/**
 * Admin section for managing boards with CRUD operations
 */
export default function BoardsSection() {
  const {
    // State
    boards,
    loading,
    error,
    // Add state
    showAdd,
    adding,
    addError,
    // Edit state
    showEdit,
    editingBoard,
    editing,
    editError,
    // Delete state
    showDelete,
    deletingBoard,
    deleting,
    deleteError,
    // Actions
    showAddModal,
    hideAddModal,
    showEditModal,
    hideEditModal,
    showDeleteModal,
    hideDeleteModal,
    // CRUD operations
    createBoard,
    updateBoard,
    deleteBoard,
  } = useBoards();

  // Fetch teams for board assignment
  const { teams } = useTeamsData();

  /**
   * Handle board creation
   */
  const handleCreateBoard = async (formData: CreateBoardForm) => {
    await createBoard(formData);
  };

  /**
   * Handle board update
   */
  const handleUpdateBoard = async (formData: EditBoardForm) => {
    if (!editingBoard) return;
    await updateBoard(editingBoard.id, formData);
  };

  /**
   * Handle board deletion
   */
  const handleDeleteBoard = async () => {
    if (!deletingBoard) return;
    await deleteBoard(deletingBoard.id);
  };

  return (
    <>
      <AdminSection
        title="Boards"
        addButtonText="+ Add Board"
        onAdd={showAddModal}
        loading={loading}
        error={error}
      >
        <ItemList
          items={boards}
          onEdit={(board) => showEditModal(board.id)}
          onDelete={showDeleteModal}
          emptyMessage="No boards found."
        />
      </AdminSection>

      {/* Add Board Modal */}
      <ModalOverlay
        isOpen={showAdd}
        onClose={hideAddModal}
        loading={adding}
        error={addError}
        loadingText="Creating..."
      >
        <AddBoardModal
          teams={teams}
          onCreate={handleCreateBoard}
          showTeamAccess={true} // Show team access in admin context
        />
      </ModalOverlay>

      {/* Edit Board Modal */}
      <ModalOverlay
        isOpen={showEdit}
        onClose={hideEditModal}
        loading={editing}
        error={editError}
        loadingText="Updating..."
      >
        {editingBoard && (
          <EditBoardModal
            board={{
              id: editingBoard.id,
              name: editingBoard.name,
              columns: editingBoard.columns || [],
              teamIds: editingBoard.teams?.map((t) => t.id) || [],
            }}
            teams={teams}
            onEdit={handleUpdateBoard}
            loading={editing}
            error={editError}
            showTeamAccess={true} // Show team access in admin context
          />
        )}
      </ModalOverlay>

      {/* Delete Board Modal */}
      <ModalOverlay
        isOpen={showDelete}
        onClose={hideDeleteModal}
        loading={deleting}
        error={deleteError}
        loadingText="Deleting..."
      >
        {deletingBoard && (
          <DeleteModal
            type="board"
            name={deletingBoard.name}
            open={showDelete}
            onDelete={handleDeleteBoard}
            onCancel={hideDeleteModal}
          />
        )}
      </ModalOverlay>
    </>
  );
}
