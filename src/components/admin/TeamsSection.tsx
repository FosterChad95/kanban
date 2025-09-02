"use client";
import React from "react";
import AddTeamModal from "@/components/ui/Modal/AddTeamModal";
import EditTeamModal from "@/components/ui/Modal/EditTeamModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";
import { AdminSection, ItemList } from "./shared/AdminSection";
import { ModalOverlay } from "./shared/ModalOverlay";
import { useTeams } from "@/hooks/useTeams";
import { useUsersData, useBoardsData } from "@/hooks/useAdminData";
import { CreateTeamForm, EditTeamForm, UserOption } from "@/types/admin";
import type { TeamFormData, BoardOption } from "../ui/Modal/types";

/**
 * Admin section for managing teams with CRUD operations
 */
export default function TeamsSection() {
  const {
    // State
    teams,
    loading,
    error,
    // Add state
    showAdd,
    adding,
    addError,
    // Edit state
    showEdit,
    editingTeam,
    editing,
    editError,
    // Delete state
    showDelete,
    deletingTeam,
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
    createTeam,
    updateTeam,
    deleteTeam,
  } = useTeams();

  // Fetch related data for dropdowns
  const { users } = useUsersData();
  const { boards } = useBoardsData();

  /**
   * Handle team creation
   */
  const handleCreateTeam = async (formData: CreateTeamForm) => {
    await createTeam(formData);
  };

  /**
   * Handle team update
   */
  const handleUpdateTeam = async (formData: EditTeamForm) => {
    if (!editingTeam) return;
    await updateTeam(editingTeam.id, formData);
  };

  /**
   * Handle team deletion
   */
  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    await deleteTeam(deletingTeam.id);
  };

  /**
   * Transform team users to UserOption format for the edit modal
   */
  const getEditingTeamUsers = (): UserOption[] => {
    if (!editingTeam?.users) return [];

    return editingTeam.users
      .map((u) => users.find((user) => user.id === u.id))
      .filter((u): u is UserOption => u !== undefined);
  };

  /**
   * Get team boards in the format expected by the edit modal
   */
  const getEditingTeamBoards = () => {
    return editingTeam?.boards || [];
  };

  return (
    <>
      <AdminSection
        title="Teams"
        addButtonText="+ Add Team"
        onAdd={showAddModal}
        loading={loading}
        error={error}
      >
        <ItemList
          items={teams}
          onEdit={showEditModal}
          onDelete={showDeleteModal}
          emptyMessage="No teams found."
        />
      </AdminSection>

      {/* Add Team Modal */}
      <ModalOverlay
        isOpen={showAdd}
        onClose={hideAddModal}
        loading={adding}
        error={addError}
        loadingText="Creating..."
      >
        <AddTeamModal
          users={users}
          onCreate={(formData: TeamFormData) => handleCreateTeam({
            teamName: formData.name,
            users: formData.users
          })}
          multiUser={true}
        />
      </ModalOverlay>

      {/* Edit Team Modal */}
      {editingTeam && (
        <EditTeamModal
          initialTeamName={editingTeam.name}
          initialUsers={getEditingTeamUsers()}
          users={users}
          boards={boards}
          initialBoards={getEditingTeamBoards()}
          onEdit={(formData: TeamFormData & { boards: BoardOption[] }) => handleUpdateTeam({
            teamName: formData.name,
            users: formData.users,
            boards: formData.boards
          })}
          multiUser={true}
          isOpen={showEdit}
          onClose={hideEditModal}
          loading={editing}
          error={editError}
        />
      )}

      {/* Delete Team Modal */}
      <ModalOverlay
        isOpen={showDelete}
        onClose={hideDeleteModal}
        loading={deleting}
        error={deleteError}
        loadingText="Deleting..."
      >
        {deletingTeam && (
          <DeleteModal
            type="team"
            name={deletingTeam.name}
            isOpen={showDelete}
            onClose={hideDeleteModal}
            open={showDelete}
            onDelete={handleDeleteTeam}
            onCancel={hideDeleteModal}
          />
        )}
      </ModalOverlay>
    </>
  );
}
