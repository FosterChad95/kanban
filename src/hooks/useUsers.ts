import { useEffect } from 'react';
import { useCrudOperations, createApiOperations } from './useCrudOperations';
import { AdminUser, CreateUserForm, EditUserForm } from '@/types/admin';

const usersApi = createApiOperations('/api/users');

/**
 * Hook for managing users in admin section
 */
export function useUsers() {
  const { state, actions } = useCrudOperations<AdminUser>();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Fetch all users from API (excluding admin users)
   */
  const fetchUsers = async () => {
    actions.setLoading(true);
    actions.setError(null);
    
    try {
      const allUsers = await usersApi.fetchAll<AdminUser>();
      // Filter out admin users for display
      const nonAdminUsers = allUsers.filter(user => user.role !== 'ADMIN');
      actions.setItems(nonAdminUsers);
    } catch (error) {
      actions.setError(
        error instanceof Error ? error.message : 'Failed to fetch users'
      );
    } finally {
      actions.setLoading(false);
    }
  };

  /**
   * Create a new user
   */
  const createUser = async (formData: CreateUserForm) => {
    actions.setAdding(true);
    actions.setAddError(null);

    try {
      const newUser = await usersApi.create<CreateUserForm, AdminUser>(formData);
      actions.addItem(newUser);
    } catch (error) {
      actions.setAddError(
        error instanceof Error ? error.message : 'Failed to create user'
      );
    } finally {
      actions.setAdding(false);
    }
  };

  /**
   * Update an existing user
   */
  const updateUser = async (userId: string, formData: EditUserForm) => {
    actions.setEditing(true);
    actions.setEditError(null);

    try {
      const updatedUser = await usersApi.update<EditUserForm, AdminUser>(
        userId, 
        formData
      );
      actions.updateItem(updatedUser);
    } catch (error) {
      actions.setEditError(
        error instanceof Error ? error.message : 'Failed to update user'
      );
    } finally {
      actions.setEditing(false);
    }
  };

  /**
   * Delete a user
   */
  const deleteUser = async (userId: string) => {
    actions.setDeleting(true);
    actions.setDeleteError(null);

    try {
      await usersApi.delete(userId);
      actions.removeItem(userId);
    } catch (error) {
      actions.setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    } finally {
      actions.setDeleting(false);
    }
  };

  return {
    // State
    users: state.items,
    loading: state.loading,
    error: state.error,
    
    // Add state
    showAdd: state.showAdd,
    adding: state.adding,
    addError: state.addError,
    
    // Edit state  
    showEdit: state.showEdit,
    editingUser: state.editingItem,
    editing: state.editing,
    editError: state.editError,
    
    // Delete state
    showDelete: state.showDelete,
    deletingUser: state.deletingItem,
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
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers,
  };
}