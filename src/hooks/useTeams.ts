import { useEffect, useCallback } from "react";
import { useCrudOperations, createApiOperations } from "./useCrudOperations";
import { AdminTeam, CreateTeamForm, EditTeamForm } from "@/types/admin";
import { useTeamPusher } from "./usePusherListeners";

const teamsApi = createApiOperations("/api/teams");

/**
 * Hook for managing teams in admin section
 */
export function useTeams() {
  const { state, actions } = useCrudOperations<AdminTeam>();

  /**
   * Fetch all teams from API
   */
  const fetchTeams = useCallback(async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const teams = await teamsApi.fetchAll<AdminTeam>();

      actions.setItems(teams);
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : "Failed to fetch teams"
      );
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Real-time event handlers
  const handleTeamCreated = useCallback((event: any) => {
    actions.addItem(event.team);
  }, [actions]);

  const handleTeamUpdated = useCallback((event: any) => {
    actions.updateItem(event.team);
  }, [actions]);

  const handleTeamDeleted = useCallback((event: any) => {
    actions.removeItem(event.teamId);
  }, [actions]);

  const handleTeamUserAdded = useCallback(() => {
    // Refresh teams to get updated user lists
    fetchTeams();
  }, [fetchTeams]);

  const handleTeamUserRemoved = useCallback(() => {
    // Refresh teams to get updated user lists
    fetchTeams();
  }, [fetchTeams]);

  // Set up real-time listeners
  useTeamPusher({
    onTeamCreated: handleTeamCreated,
    onTeamUpdated: handleTeamUpdated,
    onTeamDeleted: handleTeamDeleted,
    onTeamUserAdded: handleTeamUserAdded,
    onTeamUserRemoved: handleTeamUserRemoved,
  });

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  /**
   * Create a new team
   */
  const createTeam = async (formData: CreateTeamForm) => {
    actions.setAdding(true);
    actions.setAddError(null);

    try {
      // Transform form data to API expected format
      const apiData = {
        name: formData.teamName,
        userIds: formData.users.map((u) => u.id),
      };

      const newTeam = await teamsApi.create<typeof apiData, AdminTeam>(apiData);
      actions.addItem(newTeam);
    } catch (error) {
      actions.setAddError(
        error instanceof Error ? error.message : "Failed to create team"
      );
    } finally {
      actions.setAdding(false);
    }
  };

  /**
   * Update an existing team
   */
  const updateTeam = async (teamId: string, formData: EditTeamForm) => {
    actions.setEditing(true);
    actions.setEditError(null);

    try {
      // Transform form data to API expected format
      const apiData = {
        teamName: formData.teamName,
        users: formData.users,
        boards: formData.boards,
      };

      const updatedTeam = await teamsApi.update<typeof apiData, AdminTeam>(
        teamId,
        apiData
      );
      actions.updateItem(updatedTeam);
    } catch (error) {
      actions.setEditError(
        error instanceof Error ? error.message : "Failed to update team"
      );
    } finally {
      actions.setEditing(false);
    }
  };

  /**
   * Delete a team
   */
  const deleteTeam = async (teamId: string) => {
    actions.setDeleting(true);
    actions.setDeleteError(null);

    try {
      await teamsApi.delete(teamId);
      actions.removeItem(teamId);
    } catch (error) {
      actions.setDeleteError(
        error instanceof Error ? error.message : "Failed to delete team"
      );
    } finally {
      actions.setDeleting(false);
    }
  };

  return {
    // State
    teams: state.items,
    loading: state.loading,
    error: state.error,

    // Add state
    showAdd: state.showAdd,
    adding: state.adding,
    addError: state.addError,

    // Edit state
    showEdit: state.showEdit,
    editingTeam: state.editingItem,
    editing: state.editing,
    editError: state.editError,

    // Delete state
    showDelete: state.showDelete,
    deletingTeam: state.deletingItem,
    deleting: state.deleting,
    deleteError: state.deleteError,

    // Actions
    showAddModal: actions.showAdd,
    hideAddModal: actions.hideAdd,
    showEditModal: actions.showEdit,
    hideEditModal: actions.hideEdit,
    showDeleteModal: actions.showDelete,
    hideDeleteModal: actions.hideDelete,

    // CRUD operations
    createTeam,
    updateTeam,
    deleteTeam,
    refreshTeams: fetchTeams,
  };
}
